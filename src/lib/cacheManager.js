/**
 * Cache Manager with expiration and size management
 * Provides a wrapper around localStorage with TTL (Time To Live)
 */
class CacheManager {
  constructor() {
    this.prefix = 'puretask_';
    this.maxSize = 5 * 1024 * 1024; // 5MB limit
  }

  /**
   * Set a value in cache with optional expiration
   * @param {string} key - Cache key
   * @param {*} value - Value to cache (will be JSON stringified)
   * @param {number} ttl - Time to live in milliseconds (default: 30 minutes)
   */
  set(key, value, ttl = 30 * 60 * 1000) {
    try {
      const item = {
        value,
        expiry: Date.now() + ttl,
        timestamp: Date.now()
      };
      
      const serialized = JSON.stringify(item);
      
      // Check if we're approaching storage limits
      if (this.getStorageSize() + serialized.length > this.maxSize) {
        this.cleanup();
      }
      
      localStorage.setItem(this.prefix + key, serialized);
      return true;
    } catch (error) {
      console.warn('Cache set failed:', error);
      // If quota exceeded, try to cleanup and retry
      if (error.name === 'QuotaExceededError') {
        this.cleanup(true); // Aggressive cleanup
        try {
          localStorage.setItem(this.prefix + key, JSON.stringify({
            value,
            expiry: Date.now() + ttl,
            timestamp: Date.now()
          }));
          return true;
        } catch (retryError) {
          console.error('Cache set failed after cleanup:', retryError);
          return false;
        }
      }
      return false;
    }
  }

  /**
   * Get a value from cache
   * @param {string} key - Cache key
   * @param {*} defaultValue - Default value if not found or expired
   * @returns {*} Cached value or default
   */
  get(key, defaultValue = null) {
    try {
      const itemStr = localStorage.getItem(this.prefix + key);
      
      if (!itemStr) {
        return defaultValue;
      }
      
      const item = JSON.parse(itemStr);
      
      // Check if expired
      if (Date.now() > item.expiry) {
        this.remove(key);
        return defaultValue;
      }
      
      return item.value;
    } catch (error) {
      console.warn('Cache get failed:', error);
      return defaultValue;
    }
  }

  /**
   * Remove a specific cache entry
   */
  remove(key) {
    try {
      localStorage.removeItem(this.prefix + key);
      return true;
    } catch (error) {
      console.warn('Cache remove failed:', error);
      return false;
    }
  }

  /**
   * Check if a cache entry exists and is valid
   */
  has(key) {
    const value = this.get(key);
    return value !== null;
  }

  /**
   * Get cache entry age in milliseconds
   */
  getAge(key) {
    try {
      const itemStr = localStorage.getItem(this.prefix + key);
      if (!itemStr) return null;
      
      const item = JSON.parse(itemStr);
      return Date.now() - item.timestamp;
    } catch (error) {
      return null;
    }
  }

  /**
   * Refresh/update expiry time of existing cache entry
   */
  touch(key, ttl = 30 * 60 * 1000) {
    const value = this.get(key);
    if (value !== null) {
      this.set(key, value, ttl);
      return true;
    }
    return false;
  }

  /**
   * Clear all cache entries for this app
   */
  clear() {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      });
      return true;
    } catch (error) {
      console.error('Cache clear failed:', error);
      return false;
    }
  }

  /**
   * Clean up expired entries and optionally old entries
   */
  cleanup(aggressive = false) {
    try {
      const keys = Object.keys(localStorage);
      const now = Date.now();
      
      keys.forEach(key => {
        if (!key.startsWith(this.prefix)) return;
        
        try {
          const itemStr = localStorage.getItem(key);
          const item = JSON.parse(itemStr);
          
          // Remove if expired
          if (now > item.expiry) {
            localStorage.removeItem(key);
          }
          // If aggressive cleanup, remove entries older than 1 hour
          else if (aggressive && (now - item.timestamp) > 60 * 60 * 1000) {
            localStorage.removeItem(key);
          }
        } catch (e) {
          // Invalid entry, remove it
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Cache cleanup failed:', error);
    }
  }

  /**
   * Get current storage size used by cache
   */
  getStorageSize() {
    let size = 0;
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(this.prefix)) {
        size += (localStorage.getItem(key)?.length || 0) * 2; // *2 for UTF-16
      }
    });
    return size;
  }

  /**
   * Get storage statistics
   */
  getStats() {
    const keys = Object.keys(localStorage).filter(k => k.startsWith(this.prefix));
    const size = this.getStorageSize();
    
    return {
      totalEntries: keys.length,
      totalSize: size,
      totalSizeMB: (size / (1024 * 1024)).toFixed(2),
      percentUsed: ((size / this.maxSize) * 100).toFixed(2)
    };
  }

  /**
   * Async wrapper for getting data with loader function
   * Gets from cache or loads and caches if not found
   */
  async getOrLoad(key, loaderFn, ttl = 30 * 60 * 1000) {
    const cached = this.get(key);
    
    if (cached !== null) {
      return cached;
    }
    
    try {
      const value = await loaderFn();
      this.set(key, value, ttl);
      return value;
    } catch (error) {
      throw error;
    }
  }
}

// Export singleton instance
export const cacheManager = new CacheManager();

// Export convenience methods
export const setCache = cacheManager.set.bind(cacheManager);
export const getCache = cacheManager.get.bind(cacheManager);
export const removeCache = cacheManager.remove.bind(cacheManager);
export const clearCache = cacheManager.clear.bind(cacheManager);
export const getCacheStats = cacheManager.getStats.bind(cacheManager);

// Auto cleanup on page load
if (typeof window !== 'undefined') {
  cacheManager.cleanup();
}

