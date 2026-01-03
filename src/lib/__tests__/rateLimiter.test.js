import { describe, it, expect, beforeEach, vi } from 'vitest';
import { rateLimiter, RateLimitPresets } from '@/lib/rateLimiter';

describe('RateLimiter', () => {
  beforeEach(() => {
    rateLimiter.resetAll();
    vi.clearAllMocks();
  });

  describe('check', () => {
    it('should allow requests within limit', () => {
      const result1 = rateLimiter.check('test', 5, 60000);
      expect(result1.allowed).toBe(true);
      expect(result1.remaining).toBe(4);
      
      rateLimiter.record('test');
      
      const result2 = rateLimiter.check('test', 5, 60000);
      expect(result2.allowed).toBe(true);
      expect(result2.remaining).toBe(3);
    });

    it('should block requests after limit exceeded', () => {
      // Record 5 attempts
      for (let i = 0; i < 5; i++) {
        rateLimiter.record('test');
      }
      
      const result = rateLimiter.check('test', 5, 60000);
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
      expect(result.retryAfter).toBeGreaterThan(0);
    });

    it('should allow requests after time window expires', async () => {
      const windowMs = 100; // 100ms window
      
      // Record max attempts
      for (let i = 0; i < 5; i++) {
        rateLimiter.record('test');
      }
      
      // Should be blocked
      expect(rateLimiter.check('test', 5, windowMs).allowed).toBe(false);
      
      // Wait for window to expire
      await new Promise(resolve => setTimeout(resolve, 150));
      
      // Should be allowed again
      expect(rateLimiter.check('test', 5, windowMs).allowed).toBe(true);
    });

    it('should handle different keys independently', () => {
      rateLimiter.record('key1');
      rateLimiter.record('key1');
      rateLimiter.record('key2');
      
      const result1 = rateLimiter.check('key1', 3, 60000);
      const result2 = rateLimiter.check('key2', 3, 60000);
      
      expect(result1.remaining).toBe(0); // 2 recorded, 1 checking
      expect(result2.remaining).toBe(1); // 1 recorded, 1 checking
    });
  });

  describe('record', () => {
    it('should record attempts', () => {
      rateLimiter.record('test');
      rateLimiter.record('test');
      
      const stats = rateLimiter.getStats('test');
      expect(stats.totalAttempts).toBe(2);
    });
  });

  describe('attempt', () => {
    it('should execute action if allowed', async () => {
      const action = vi.fn().mockResolvedValue('success');
      
      const result = await rateLimiter.attempt('test', action, {
        maxAttempts: 5,
        windowMs: 60000
      });
      
      expect(result).toBe('success');
      expect(action).toHaveBeenCalledOnce();
    });

    it('should throw error if rate limited', async () => {
      const action = vi.fn().mockResolvedValue('success');
      
      // Exhaust rate limit
      for (let i = 0; i < 5; i++) {
        rateLimiter.record('test');
      }
      
      await expect(
        rateLimiter.attempt('test', action, {
          maxAttempts: 5,
          windowMs: 60000
        })
      ).rejects.toThrow(/Rate limit exceeded/);
      
      expect(action).not.toHaveBeenCalled();
    });

    it('should call onRateLimited callback', async () => {
      const action = vi.fn().mockResolvedValue('success');
      const onRateLimited = vi.fn();
      
      // Exhaust rate limit
      for (let i = 0; i < 5; i++) {
        rateLimiter.record('test');
      }
      
      await expect(
        rateLimiter.attempt('test', action, {
          maxAttempts: 5,
          windowMs: 60000,
          onRateLimited
        })
      ).rejects.toThrow();
      
      expect(onRateLimited).toHaveBeenCalledOnce();
      expect(onRateLimited).toHaveBeenCalledWith(
        expect.objectContaining({
          allowed: false,
          remaining: 0
        })
      );
    });

    it('should remove attempt if action fails', async () => {
      const error = new Error('Action failed');
      const action = vi.fn().mockRejectedValue(error);
      
      await expect(
        rateLimiter.attempt('test', action, {
          maxAttempts: 5,
          windowMs: 60000
        })
      ).rejects.toThrow('Action failed');
      
      // Should have no recorded attempts (removed after failure)
      const stats = rateLimiter.getStats('test');
      expect(stats.totalAttempts).toBe(0);
    });
  });

  describe('reset', () => {
    it('should reset attempts for specific key', () => {
      rateLimiter.record('test1');
      rateLimiter.record('test2');
      
      rateLimiter.reset('test1');
      
      expect(rateLimiter.getStats('test1').totalAttempts).toBe(0);
      expect(rateLimiter.getStats('test2').totalAttempts).toBe(1);
    });
  });

  describe('resetAll', () => {
    it('should reset all attempts', () => {
      rateLimiter.record('test1');
      rateLimiter.record('test2');
      rateLimiter.record('test3');
      
      rateLimiter.resetAll();
      
      expect(rateLimiter.getStats('test1').totalAttempts).toBe(0);
      expect(rateLimiter.getStats('test2').totalAttempts).toBe(0);
      expect(rateLimiter.getStats('test3').totalAttempts).toBe(0);
    });
  });

  describe('cleanup', () => {
    it('should remove old attempts', async () => {
      rateLimiter.record('test');
      
      // Wait for attempts to age
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Manually trigger cleanup (normally runs periodically)
      rateLimiter.cleanup();
      
      // Should still exist (within 1 hour)
      expect(rateLimiter.getStats('test').totalAttempts).toBe(1);
    });

    it('should remove very old entries', () => {
      // Manually add old attempt
      const oldTimestamp = Date.now() - (2 * 60 * 60 * 1000); // 2 hours ago
      rateLimiter.attempts.set('old', [oldTimestamp]);
      
      rateLimiter.cleanup();
      
      // Should be removed
      expect(rateLimiter.getStats('old').totalAttempts).toBe(0);
    });
  });

  describe('getStats', () => {
    it('should return attempt statistics', () => {
      rateLimiter.record('test');
      rateLimiter.record('test');
      
      const stats = rateLimiter.getStats('test');
      
      expect(stats.totalAttempts).toBe(2);
      expect(stats.recentAttempts).toBe(2);
      expect(stats.oldestAttempt).toBeLessThanOrEqual(Date.now());
      expect(stats.newestAttempt).toBeLessThanOrEqual(Date.now());
    });

    it('should handle nonexistent keys', () => {
      const stats = rateLimiter.getStats('nonexistent');
      
      expect(stats.totalAttempts).toBe(0);
      expect(stats.recentAttempts).toBe(0);
      expect(stats.oldestAttempt).toBeNull();
      expect(stats.newestAttempt).toBeNull();
    });
  });

  describe('RateLimitPresets', () => {
    it('should have predefined presets', () => {
      expect(RateLimitPresets.BOOKING).toBeDefined();
      expect(RateLimitPresets.MESSAGE).toBeDefined();
      expect(RateLimitPresets.SEARCH).toBeDefined();
      expect(RateLimitPresets.PROFILE_UPDATE).toBeDefined();
      expect(RateLimitPresets.SENSITIVE).toBeDefined();
      expect(RateLimitPresets.API_CALL).toBeDefined();
    });

    it('should enforce booking rate limit', async () => {
      const action = vi.fn().mockResolvedValue('success');
      const preset = RateLimitPresets.BOOKING;
      
      // Should allow 3 attempts
      await rateLimiter.attempt('booking:user1', action, preset);
      await rateLimiter.attempt('booking:user1', action, preset);
      await rateLimiter.attempt('booking:user1', action, preset);
      
      // 4th attempt should fail
      await expect(
        rateLimiter.attempt('booking:user1', action, preset)
      ).rejects.toThrow();
      
      expect(action).toHaveBeenCalledTimes(3);
    });
  });
});

