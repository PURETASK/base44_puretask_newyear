import { describe, it, expect, vi, beforeEach } from 'vitest';
import { errorHandler, handleError, handleAuthError, handleNetworkError, handleValidationError } from '@/lib/errorHandler';

describe('ErrorHandler', () => {
  beforeEach(() => {
    errorHandler.clearErrorLog();
    vi.clearAllMocks();
  });

  describe('handle', () => {
    it('should handle basic errors', () => {
      const error = new Error('Test error');
      const result = errorHandler.handle(error);
      
      expect(result).toEqual({
        error,
        handled: true
      });
    });

    it('should store errors in log', () => {
      const error1 = new Error('Error 1');
      const error2 = new Error('Error 2');
      
      errorHandler.handle(error1);
      errorHandler.handle(error2);
      
      const log = errorHandler.getErrorLog();
      expect(log).toHaveLength(2);
      expect(log[0].error).toBe('Error 1');
      expect(log[1].error).toBe('Error 2');
    });

    it('should limit error log to 50 entries', () => {
      // Add 60 errors
      for (let i = 0; i < 60; i++) {
        errorHandler.handle(new Error(`Error ${i}`));
      }
      
      const log = errorHandler.getErrorLog();
      expect(log).toHaveLength(50);
      // Should have the most recent 50
      expect(log[0].error).toBe('Error 10');
      expect(log[49].error).toBe('Error 59');
    });

    it('should use custom user message', () => {
      const error = new Error('Technical error');
      errorHandler.handle(error, {
        userMessage: 'Custom user message',
        showToast: false
      });
      
      const log = errorHandler.getErrorLog();
      expect(log[0].userMessage).toBe('Custom user message');
    });

    it('should include context in error log', () => {
      const error = new Error('Test error');
      const context = { page: 'Dashboard', action: 'Load data' };
      
      errorHandler.handle(error, { context, showToast: false });
      
      const log = errorHandler.getErrorLog();
      expect(log[0].context).toEqual(context);
    });

    it('should handle different severity levels', () => {
      errorHandler.handle(new Error('Error'), { severity: 'error', showToast: false });
      errorHandler.handle(new Error('Warning'), { severity: 'warning', showToast: false });
      errorHandler.handle(new Error('Info'), { severity: 'info', showToast: false });
      
      const log = errorHandler.getErrorLog();
      expect(log[0].severity).toBe('error');
      expect(log[1].severity).toBe('warning');
      expect(log[2].severity).toBe('info');
    });
  });

  describe('handleAuthError', () => {
    it('should handle 401 unauthorized errors', () => {
      const error = { status: 401, message: 'Unauthorized' };
      const mockNavigate = vi.fn();
      
      errorHandler.handleAuthError(error, mockNavigate);
      
      // Should clear cached user
      expect(localStorage.getItem('currentUser')).toBeNull();
      
      // Should redirect after delay
      setTimeout(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/');
      }, 1100);
    });

    it('should handle 403 forbidden errors', () => {
      const error = { status: 403, message: 'Forbidden' };
      const mockNavigate = vi.fn();
      
      errorHandler.handleAuthError(error, mockNavigate);
      
      expect(localStorage.getItem('currentUser')).toBeNull();
    });

    it('should handle other auth errors', () => {
      const error = { status: 500, message: 'Server error' };
      const mockNavigate = vi.fn();
      
      errorHandler.handleAuthError(error, mockNavigate);
      
      const log = errorHandler.getErrorLog();
      expect(log[0].userMessage).toBe('Authentication failed. Please try again.');
    });
  });

  describe('handleNetworkError', () => {
    it('should detect offline status', () => {
      // Mock offline
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false
      });
      
      const error = new Error('Network error');
      errorHandler.handleNetworkError(error, { showToast: false });
      
      const log = errorHandler.getErrorLog();
      expect(log[0].userMessage).toContain('No internet connection');
      expect(log[0].context.isOffline).toBe(true);
      
      // Restore online
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true
      });
    });

    it('should handle online network errors', () => {
      const error = new Error('Network error');
      errorHandler.handleNetworkError(error, { showToast: false });
      
      const log = errorHandler.getErrorLog();
      expect(log[0].userMessage).toContain('Network error');
      expect(log[0].context.isOffline).toBe(false);
    });
  });

  describe('handleValidationError', () => {
    it('should handle array of errors', () => {
      const errors = ['Field 1 is required', 'Field 2 is invalid'];
      errorHandler.handleValidationError(errors, { showToast: false });
      
      const log = errorHandler.getErrorLog();
      expect(log[0].userMessage).toBe('Field 1 is required, Field 2 is invalid');
      expect(log[0].severity).toBe('warning');
    });

    it('should handle string error', () => {
      const error = 'Validation failed';
      errorHandler.handleValidationError(error, { showToast: false });
      
      const log = errorHandler.getErrorLog();
      expect(log[0].userMessage).toBe('Validation failed');
    });
  });

  describe('wrapAsync', () => {
    it('should execute function successfully', async () => {
      const fn = vi.fn().mockResolvedValue('success');
      const wrapped = errorHandler.wrapAsync(fn);
      
      const result = await wrapped('arg1', 'arg2');
      
      expect(fn).toHaveBeenCalledWith('arg1', 'arg2');
      expect(result).toBe('success');
    });

    it('should handle errors in wrapped function', async () => {
      const error = new Error('Function error');
      const fn = vi.fn().mockRejectedValue(error);
      const wrapped = errorHandler.wrapAsync(fn, { showToast: false });
      
      await expect(wrapped()).rejects.toThrow('Function error');
      
      const log = errorHandler.getErrorLog();
      expect(log).toHaveLength(1);
    });
  });

  describe('clearErrorLog', () => {
    it('should clear all errors', () => {
      errorHandler.handle(new Error('Error 1'), { showToast: false });
      errorHandler.handle(new Error('Error 2'), { showToast: false });
      
      expect(errorHandler.getErrorLog()).toHaveLength(2);
      
      errorHandler.clearErrorLog();
      
      expect(errorHandler.getErrorLog()).toHaveLength(0);
    });
  });
});

