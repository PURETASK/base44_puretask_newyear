import { toast } from '@/components/ui/use-toast';

/**
 * Centralized error handler for the application
 * Provides consistent error handling, logging, and user feedback
 */
class ErrorHandler {
  constructor() {
    this.isDevelopment = import.meta.env.DEV;
    this.errorLog = [];
  }

  /**
   * Handle and display errors consistently across the app
   * @param {Error} error - The error object
   * @param {Object} options - Configuration options
   * @param {string} options.userMessage - User-friendly message to display
   * @param {boolean} options.showToast - Whether to show toast notification (default: true)
   * @param {boolean} options.logToConsole - Whether to log to console (default: true in dev)
   * @param {Object} options.context - Additional context for debugging
   * @param {string} options.severity - Error severity: 'error', 'warning', 'info'
   */
  handle(error, options = {}) {
    const {
      userMessage = 'Something went wrong. Please try again.',
      showToast = true,
      logToConsole = this.isDevelopment,
      context = {},
      severity = 'error'
    } = options;

    // Log to console in development
    if (logToConsole) {
      console.error('❌ Error:', {
        message: error?.message || error,
        stack: error?.stack,
        context,
        timestamp: new Date().toISOString()
      });
    }

    // Store in memory log (last 50 errors)
    this.errorLog.push({
      error: error?.message || error,
      userMessage,
      context,
      timestamp: Date.now(),
      severity
    });
    if (this.errorLog.length > 50) {
      this.errorLog.shift();
    }

    // Show user-friendly toast
    if (showToast) {
      const variant = severity === 'warning' ? 'default' : 'destructive';
      toast({
        variant,
        title: severity === 'error' ? 'Error' : severity === 'warning' ? 'Warning' : 'Info',
        description: userMessage,
        duration: severity === 'error' ? 5000 : 3000
      });
    }

    // TODO: Send to error tracking service (Sentry, LogRocket, etc.)
    // if (import.meta.env.PROD) {
    //   this.sendToErrorTracking(error, context);
    // }

    return { error, handled: true };
  }

  /**
   * Handle authentication errors specifically
   */
  handleAuthError(error, navigate) {
    const isUnauthorized = error?.status === 401 || error?.status === 403;
    
    if (isUnauthorized) {
      this.handle(error, {
        userMessage: 'Your session has expired. Please log in again.',
        context: { type: 'authentication' }
      });
      
      // Clear cached user data
      localStorage.removeItem('currentUser');
      localStorage.removeItem('currentUserTime');
      
      // Redirect to home (which will show login)
      if (navigate) {
        setTimeout(() => navigate('/'), 1000);
      }
    } else {
      this.handle(error, {
        userMessage: 'Authentication failed. Please try again.',
        context: { type: 'authentication' }
      });
    }
  }

  /**
   * Handle network errors
   */
  handleNetworkError(error, options = {}) {
    const isOffline = !navigator.onLine;
    
    this.handle(error, {
      userMessage: isOffline 
        ? 'No internet connection. Please check your network.'
        : 'Network error. Please check your connection and try again.',
      severity: 'warning',
      context: { type: 'network', isOffline },
      ...options
    });
  }

  /**
   * Handle validation errors
   */
  handleValidationError(errors, options = {}) {
    const errorMessages = Array.isArray(errors) 
      ? errors.join(', ')
      : errors;

    this.handle(new Error('Validation failed'), {
      userMessage: errorMessages,
      severity: 'warning',
      context: { type: 'validation' },
      ...options
    });
  }

  /**
   * Get recent error log
   */
  getErrorLog() {
    return this.errorLog;
  }

  /**
   * Clear error log
   */
  clearErrorLog() {
    this.errorLog = [];
  }

  /**
   * Wrap async function with error handling
   */
  wrapAsync(fn, errorOptions = {}) {
    return async (...args) => {
      try {
        return await fn(...args);
      } catch (error) {
        this.handle(error, errorOptions);
        throw error; // Re-throw for caller to handle if needed
      }
    };
  }

  /**
   * Send error to tracking service (placeholder)
   */
  sendToErrorTracking(error, context) {
    // TODO: Implement Sentry or other error tracking
    // Example:
    // Sentry.captureException(error, {
    //   extra: context
    // });
  }
}

// Export singleton instance
export const errorHandler = new ErrorHandler();

// Export convenience methods
export const handleError = errorHandler.handle.bind(errorHandler);
export const handleAuthError = errorHandler.handleAuthError.bind(errorHandler);
export const handleNetworkError = errorHandler.handleNetworkError.bind(errorHandler);
export const handleValidationError = errorHandler.handleValidationError.bind(errorHandler);
export const wrapAsync = errorHandler.wrapAsync.bind(errorHandler);

