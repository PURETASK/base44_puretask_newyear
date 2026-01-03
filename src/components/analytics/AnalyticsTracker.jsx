import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';

// Generate or retrieve session ID
const getSessionId = () => {
  let sessionId = sessionStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId;
};

export function useAnalytics() {
  const location = useLocation();
  const lastPathRef = useRef('');

  const trackEvent = async (eventType, metadata = {}) => {
    try {
      const user = await base44.auth.me().catch(() => null);
      const sessionId = getSessionId();

      await base44.entities.AnalyticsEvent.create({
        event_type: eventType,
        user_email: user?.email || 'guest',
        user_type: user?.user_type || 'guest',
        metadata: {
          ...metadata,
          referrer: document.referrer,
          user_agent: navigator.userAgent,
          screen_width: window.innerWidth,
          screen_height: window.innerHeight
        },
        page_url: window.location.href,
        session_id: sessionId,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  };

  // Track page views (only when path actually changes)
  useEffect(() => {
    const currentPath = location.pathname;
    if (currentPath !== lastPathRef.current) {
      lastPathRef.current = currentPath;
      trackEvent('page_view', { 
        path: currentPath,
        search: location.search 
      });
    }
  }, [location]);

  return { trackEvent };
}

// Helper hook for tracking form abandonment
export function useFormAbandonment(formName, hasUnsavedChanges) {
  const { trackEvent } = useAnalytics();

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        trackEvent('form_abandoned', { 
          form_name: formName,
          had_changes: true 
        });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges, formName]);
}