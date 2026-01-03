import { base44 } from '@/api/base44Client';

/**
 * Analytics Service - Central hub for tracking user events
 * Automatically captures user context and session info
 */

let sessionId = null;
let currentUser = null;

// Generate or retrieve session ID
const getSessionId = () => {
  if (sessionId) return sessionId;
  
  // Check localStorage
  let storedSessionId = localStorage.getItem('analytics_session_id');
  const sessionStart = localStorage.getItem('analytics_session_start');
  
  // Create new session if none exists or if session is older than 30 minutes
  const now = Date.now();
  if (!storedSessionId || !sessionStart || (now - parseInt(sessionStart)) > 1800000) {
    storedSessionId = `session_${now}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('analytics_session_id', storedSessionId);
    localStorage.setItem('analytics_session_start', now.toString());
  }
  
  sessionId = storedSessionId;
  return sessionId;
};

// Set current user (call this on login/page load)
export const setAnalyticsUser = (user) => {
  currentUser = user;
};

// Get user type
const getUserType = () => {
  if (!currentUser) return 'guest';
  if (currentUser.role === 'admin') return 'admin';
  return currentUser.user_type || 'guest';
};

/**
 * Track an analytics event
 * @param {string} eventType - Event identifier (e.g., 'booking_started')
 * @param {object} metadata - Additional event data
 */
export const trackEvent = async (eventType, metadata = {}) => {
  try {
    const eventData = {
      event_type: eventType,
      user_email: currentUser?.email || null,
      user_type: getUserType(),
      metadata: metadata,
      page_url: window.location.href,
      session_id: getSessionId(),
      timestamp: new Date().toISOString()
    };

    await base44.entities.AnalyticsEvent.create(eventData);
    
    // Also log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Analytics:', eventType, metadata);
    }
  } catch (error) {
    console.error('Analytics tracking error:', error);
    // Don't throw - analytics failures shouldn't break the app
  }
};

/**
 * Track page view
 */
export const trackPageView = async (pageName) => {
  await trackEvent('page_view', { page_name: pageName });
};

/**
 * Track booking funnel steps
 */
export const trackBookingStep = async (step, data = {}) => {
  const stepEvents = {
    started: 'booking_started',
    cleaner_selected: 'cleaner_selected',
    date_selected: 'booking_step_completed',
    tasks_selected: 'booking_step_completed',
    address_entered: 'booking_step_completed',
    payment_initiated: 'booking_step_completed',
    submitted: 'booking_submitted',
    abandoned: 'booking_abandoned'
  };
  
  await trackEvent(stepEvents[step] || 'booking_step_completed', {
    step,
    ...data
  });
};

/**
 * Track cleaner actions
 */
export const trackCleanerAction = async (action, data = {}) => {
  const actionMap = {
    job_viewed: 'job_viewed_by_cleaner',
    job_accepted: 'job_accepted_by_cleaner',
    job_declined: 'job_declined_by_cleaner',
    check_in: 'cleaner_checked_in',
    check_out: 'cleaner_checked_out',
    photos_uploaded: 'cleaner_photos_uploaded'
  };
  
  await trackEvent(actionMap[action] || action, data);
};

/**
 * Track authentication events
 */
export const trackAuth = async (action, data = {}) => {
  const authEvents = {
    signup_start: 'client_signup_start',
    signup_success: 'client_signup_success',
    cleaner_signup_start: 'cleaner_signup_start',
    cleaner_signup_success: 'cleaner_signup_success',
    login: 'user_login',
    logout: 'user_logout'
  };
  
  await trackEvent(authEvents[action] || action, data);
};

/**
 * Track messaging events
 */
export const trackMessage = async (action, data = {}) => {
  await trackEvent('message_sent', {
    action,
    ...data
  });
};

/**
 * Track payment events
 */
export const trackPayment = async (action, data = {}) => {
  const paymentEvents = {
    initiated: 'payment_initiated',
    success: 'payment_success',
    failed: 'payment_failed',
    credit_purchase: 'credit_purchase'
  };
  
  await trackEvent(paymentEvents[action] || action, data);
};

/**
 * Track review submission
 */
export const trackReview = async (data = {}) => {
  await trackEvent('review_submitted', data);
};

/**
 * Track search/filter actions
 */
export const trackSearch = async (searchType, query, filters = {}) => {
  await trackEvent('search_performed', {
    search_type: searchType,
    query,
    filters
  });
};

/**
 * Track errors
 */
export const trackError = async (errorType, errorMessage, context = {}) => {
  await trackEvent('error_occurred', {
    error_type: errorType,
    error_message: errorMessage,
    ...context
  });
};

/**
 * Track feature usage
 */
export const trackFeatureUsage = async (featureName, action, data = {}) => {
  await trackEvent('feature_used', {
    feature_name: featureName,
    action,
    ...data
  });
};

// Export everything as a single analytics object too
export const analytics = {
  setUser: setAnalyticsUser,
  track: trackEvent,
  pageView: trackPageView,
  booking: trackBookingStep,
  cleaner: trackCleanerAction,
  auth: trackAuth,
  message: trackMessage,
  payment: trackPayment,
  review: trackReview,
  search: trackSearch,
  error: trackError,
  feature: trackFeatureUsage
};

export default analytics;