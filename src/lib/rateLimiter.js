/**
 * Rate Limiter for client-side request throttling
 * Prevents abuse and excessive API calls
 */
class RateLimiter {
  constructor() {
    this.limits = new Map();
    this.attempts = new Map();
  }

  /**
   * Check if action can be performed
   * @param {string} key - Unique identifier for the action (e.g., 'booking:user@email.com')
   * @param {number} maxAttempts - Maximum attempts allowed
   * @param {number} windowMs - Time window in milliseconds
   * @returns {Object} { allowed: boolean, remaining: number, resetAt: number }
   */
  check(key, maxAttempts = 5, windowMs = 60000) {
    const now = Date.now();
    
    // Clean up old entries first
    this.cleanup();

    // Get or create attempt history for this key
    if (!this.attempts.has(key)) {
      this.attempts.set(key, []);
    }

    const attempts = this.attempts.get(key);
    
    // Filter out attempts outside the window
    const recentAttempts = attempts.filter(timestamp => now - timestamp < windowMs);
    this.attempts.set(key, recentAttempts);

    // Check if limit exceeded
    if (recentAttempts.length >= maxAttempts) {
      const oldestAttempt = Math.min(...recentAttempts);
      const resetAt = oldestAttempt + windowMs;
      
      return {
        allowed: false,
        remaining: 0,
        resetAt,
        retryAfter: Math.ceil((resetAt - now) / 1000) // seconds
      };
    }

    return {
      allowed: true,
      remaining: maxAttempts - recentAttempts.length - 1,
      resetAt: now + windowMs
    };
  }

  /**
   * Record an attempt
   * @param {string} key - Unique identifier for the action
   */
  record(key) {
    const now = Date.now();
    
    if (!this.attempts.has(key)) {
      this.attempts.set(key, []);
    }

    const attempts = this.attempts.get(key);
    attempts.push(now);
    this.attempts.set(key, attempts);
  }

  /**
   * Attempt an action with rate limiting
   * @param {string} key - Unique identifier for the action
   * @param {Function} action - Function to execute
   * @param {Object} options - Rate limit options
   * @returns {Promise<*>} Result of the action
   */
  async attempt(key, action, options = {}) {
    const {
      maxAttempts = 5,
      windowMs = 60000,
      onRateLimited = null
    } = options;

    const result = this.check(key, maxAttempts, windowMs);

    if (!result.allowed) {
      const error = new Error(`Rate limit exceeded. Please try again in ${result.retryAfter} seconds.`);
      error.rateLimitInfo = result;
      
      if (onRateLimited) {
        onRateLimited(result);
      }
      
      throw error;
    }

    // Record the attempt
    this.record(key);

    // Execute the action
    try {
      return await action();
    } catch (error) {
      // If action fails, we don't penalize (remove last attempt)
      // You might want to keep it depending on your use case
      const attempts = this.attempts.get(key);
      if (attempts && attempts.length > 0) {
        attempts.pop();
        this.attempts.set(key, attempts);
      }
      throw error;
    }
  }

  /**
   * Reset attempts for a specific key
   */
  reset(key) {
    this.attempts.delete(key);
  }

  /**
   * Reset all attempts
   */
  resetAll() {
    this.attempts.clear();
  }

  /**
   * Clean up old entries
   */
  cleanup() {
    const now = Date.now();
    const maxAge = 60 * 60 * 1000; // 1 hour

    for (const [key, attempts] of this.attempts.entries()) {
      const recentAttempts = attempts.filter(timestamp => now - timestamp < maxAge);
      
      if (recentAttempts.length === 0) {
        this.attempts.delete(key);
      } else {
        this.attempts.set(key, recentAttempts);
      }
    }
  }

  /**
   * Get current stats for a key
   */
  getStats(key) {
    const attempts = this.attempts.get(key) || [];
    const now = Date.now();
    
    return {
      totalAttempts: attempts.length,
      recentAttempts: attempts.filter(t => now - t < 60000).length,
      oldestAttempt: attempts.length > 0 ? Math.min(...attempts) : null,
      newestAttempt: attempts.length > 0 ? Math.max(...attempts) : null
    };
  }
}

// Export singleton instance
export const rateLimiter = new RateLimiter();

/**
 * Common rate limit presets
 */
export const RateLimitPresets = {
  // Booking submissions
  BOOKING: {
    maxAttempts: 3,
    windowMs: 60000 // 3 attempts per minute
  },
  
  // Message sending
  MESSAGE: {
    maxAttempts: 10,
    windowMs: 60000 // 10 messages per minute
  },
  
  // Search queries
  SEARCH: {
    maxAttempts: 30,
    windowMs: 60000 // 30 searches per minute
  },
  
  // Profile updates
  PROFILE_UPDATE: {
    maxAttempts: 5,
    windowMs: 300000 // 5 updates per 5 minutes
  },
  
  // Password/sensitive operations
  SENSITIVE: {
    maxAttempts: 3,
    windowMs: 300000 // 3 attempts per 5 minutes
  },
  
  // API calls
  API_CALL: {
    maxAttempts: 60,
    windowMs: 60000 // 60 calls per minute
  }
};

/**
 * React hook for rate limiting
 */
export function useRateLimit(key, preset = RateLimitPresets.API_CALL) {
  const checkLimit = () => {
    return rateLimiter.check(key, preset.maxAttempts, preset.windowMs);
  };

  const attemptAction = async (action) => {
    return rateLimiter.attempt(key, action, preset);
  };

  const reset = () => {
    rateLimiter.reset(key);
  };

  return {
    checkLimit,
    attemptAction,
    reset,
    getStats: () => rateLimiter.getStats(key)
  };
}

// Auto cleanup every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    rateLimiter.cleanup();
  }, 5 * 60 * 1000);
}

