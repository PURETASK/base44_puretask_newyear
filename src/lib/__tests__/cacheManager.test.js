import { describe, it, expect, beforeEach, vi } from 'vitest';
import { cacheManager, setCache, getCache, removeCache, clearCache } from '@/lib/cacheManager';

describe('CacheManager', () => {
  beforeEach(() => {
    localStorage.clear();
    cacheManager.clear();
  });

  describe('set and get', () => {
    it('should set and get values', () => {
      cacheManager.set('testKey', 'testValue');
      const value = cacheManager.get('testKey');
      expect(value).toBe('testValue');
    });

    it('should handle complex objects', () => {
      const complexObject = {
        name: 'Test',
        nested: { value: 123 },
        array: [1, 2, 3]
      };
      
      cacheManager.set('complexKey', complexObject);
      const retrieved = cacheManager.get('complexKey');
      
      expect(retrieved).toEqual(complexObject);
    });

    it('should return default value if key not found', () => {
      const value = cacheManager.get('nonexistent', 'default');
      expect(value).toBe('default');
    });

    it('should return null if key not found and no default', () => {
      const value = cacheManager.get('nonexistent');
      expect(value).toBeNull();
    });
  });

  describe('expiration', () => {
    it('should expire after TTL', async () => {
      const ttl = 100; // 100ms
      cacheManager.set('expiring', 'value', ttl);
      
      // Should exist immediately
      expect(cacheManager.get('expiring')).toBe('value');
      
      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 150));
      
      // Should be expired
      expect(cacheManager.get('expiring')).toBeNull();
    });

    it('should use default TTL of 30 minutes', () => {
      cacheManager.set('defaultTTL', 'value');
      
      const key = 'puretask_defaultTTL';
      const item = JSON.parse(localStorage.getItem(key));
      
      const expectedExpiry = Date.now() + (30 * 60 * 1000);
      // Allow 1 second difference
      expect(item.expiry).toBeGreaterThan(expectedExpiry - 1000);
      expect(item.expiry).toBeLessThan(expectedExpiry + 1000);
    });
  });

  describe('remove', () => {
    it('should remove cache entry', () => {
      cacheManager.set('toRemove', 'value');
      expect(cacheManager.get('toRemove')).toBe('value');
      
      cacheManager.remove('toRemove');
      expect(cacheManager.get('toRemove')).toBeNull();
    });
  });

  describe('has', () => {
    it('should check if key exists and is valid', () => {
      cacheManager.set('existing', 'value');
      expect(cacheManager.has('existing')).toBe(true);
      expect(cacheManager.has('nonexistent')).toBe(false);
    });

    it('should return false for expired keys', async () => {
      cacheManager.set('expiring', 'value', 100);
      expect(cacheManager.has('expiring')).toBe(true);
      
      await new Promise(resolve => setTimeout(resolve, 150));
      expect(cacheManager.has('expiring')).toBe(false);
    });
  });

  describe('getAge', () => {
    it('should return age of cache entry', async () => {
      cacheManager.set('aged', 'value');
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const age = cacheManager.getAge('aged');
      expect(age).toBeGreaterThanOrEqual(100);
      expect(age).toBeLessThan(200);
    });

    it('should return null for nonexistent keys', () => {
      const age = cacheManager.getAge('nonexistent');
      expect(age).toBeNull();
    });
  });

  describe('touch', () => {
    it('should refresh expiry time', async () => {
      cacheManager.set('toTouch', 'value', 100);
      
      await new Promise(resolve => setTimeout(resolve, 50));
      
      cacheManager.touch('toTouch', 200);
      
      // Should still exist after original TTL
      await new Promise(resolve => setTimeout(resolve, 60));
      expect(cacheManager.get('toTouch')).toBe('value');
    });

    it('should return false for nonexistent keys', () => {
      const result = cacheManager.touch('nonexistent');
      expect(result).toBe(false);
    });
  });

  describe('clear', () => {
    it('should clear all cache entries', () => {
      cacheManager.set('key1', 'value1');
      cacheManager.set('key2', 'value2');
      cacheManager.set('key3', 'value3');
      
      cacheManager.clear();
      
      expect(cacheManager.get('key1')).toBeNull();
      expect(cacheManager.get('key2')).toBeNull();
      expect(cacheManager.get('key3')).toBeNull();
    });

    it('should not clear non-prefixed entries', () => {
      // Add a non-prefixed entry directly
      localStorage.setItem('other_key', 'other_value');
      cacheManager.set('cached_key', 'cached_value');
      
      cacheManager.clear();
      
      expect(localStorage.getItem('other_key')).toBe('other_value');
      expect(cacheManager.get('cached_key')).toBeNull();
    });
  });

  describe('cleanup', () => {
    it('should remove expired entries', async () => {
      cacheManager.set('expiring1', 'value1', 100);
      cacheManager.set('expiring2', 'value2', 100);
      cacheManager.set('persisting', 'value3', 10000);
      
      await new Promise(resolve => setTimeout(resolve, 150));
      
      cacheManager.cleanup();
      
      expect(cacheManager.get('expiring1')).toBeNull();
      expect(cacheManager.get('expiring2')).toBeNull();
      expect(cacheManager.get('persisting')).toBe('value3');
    });

    it('should remove old entries in aggressive mode', async () => {
      cacheManager.set('old', 'value', 10000);
      
      // Manually set timestamp to be old
      const key = 'puretask_old';
      const item = JSON.parse(localStorage.getItem(key));
      item.timestamp = Date.now() - (2 * 60 * 60 * 1000); // 2 hours old
      localStorage.setItem(key, JSON.stringify(item));
      
      cacheManager.cleanup(true);
      
      expect(cacheManager.get('old')).toBeNull();
    });
  });

  describe('getStats', () => {
    it('should return cache statistics', () => {
      cacheManager.set('key1', 'value1');
      cacheManager.set('key2', { complex: 'object' });
      cacheManager.set('key3', 'value3');
      
      const stats = cacheManager.getStats();
      
      expect(stats.totalEntries).toBe(3);
      expect(stats.totalSize).toBeGreaterThan(0);
      expect(parseFloat(stats.percentUsed)).toBeGreaterThan(0);
    });
  });

  describe('getOrLoad', () => {
    it('should return cached value if exists', async () => {
      cacheManager.set('existing', 'cached_value');
      const loader = vi.fn().mockResolvedValue('loaded_value');
      
      const result = await cacheManager.getOrLoad('existing', loader);
      
      expect(result).toBe('cached_value');
      expect(loader).not.toHaveBeenCalled();
    });

    it('should load and cache if not exists', async () => {
      const loader = vi.fn().mockResolvedValue('loaded_value');
      
      const result = await cacheManager.getOrLoad('new', loader);
      
      expect(result).toBe('loaded_value');
      expect(loader).toHaveBeenCalledOnce();
      expect(cacheManager.get('new')).toBe('loaded_value');
    });

    it('should throw error if loader fails', async () => {
      const error = new Error('Load failed');
      const loader = vi.fn().mockRejectedValue(error);
      
      await expect(cacheManager.getOrLoad('failing', loader)).rejects.toThrow('Load failed');
    });
  });

  describe('convenience functions', () => {
    it('setCache should work', () => {
      setCache('test', 'value');
      expect(getCache('test')).toBe('value');
    });

    it('removeCache should work', () => {
      setCache('test', 'value');
      removeCache('test');
      expect(getCache('test')).toBeNull();
    });

    it('clearCache should work', () => {
      setCache('test1', 'value1');
      setCache('test2', 'value2');
      clearCache();
      expect(getCache('test1')).toBeNull();
      expect(getCache('test2')).toBeNull();
    });
  });
});

