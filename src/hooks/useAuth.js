import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { handleAuthError } from '@/lib/errorHandler';
import { cacheManager } from '@/lib/cacheManager';

/**
 * Hook for requiring authentication with optional role check
 * Automatically redirects to home if user is not authenticated or doesn't have required role
 * 
 * @param {Object} options - Configuration options
 * @param {string} options.requiredRole - Required user role ('client', 'cleaner', 'admin', 'agent')
 * @param {string} options.redirectTo - Custom redirect path (default: 'Home')
 * @param {boolean} options.checkProfile - Whether to check for user profile (default: false)
 * @param {string} options.profileEntity - Profile entity name (e.g., 'CleanerProfile', 'ClientProfile')
 * @param {string} options.onboardingPath - Path to redirect if profile doesn't exist
 * 
 * @returns {Object} { user, loading, profile, refetch }
 */
export function useRequireAuth(options = {}) {
  const {
    requiredRole = null,
    redirectTo = 'Home',
    checkProfile = false,
    profileEntity = null,
    onboardingPath = null
  } = options;

  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUserAndProfile = async () => {
    try {
      setLoading(true);

      // Try to get user from cache first (with 30 min TTL)
      const cachedUser = cacheManager.get('currentUser');
      const cacheAge = cacheManager.getAge('currentUser');
      
      let currentUser;
      
      // If cache is less than 5 minutes old, use it
      if (cachedUser && cacheAge < 5 * 60 * 1000) {
        currentUser = cachedUser;
      } else {
        // Otherwise, fetch fresh data
        currentUser = await base44.auth.me();
        cacheManager.set('currentUser', currentUser, 30 * 60 * 1000); // 30 min TTL
      }

      // Check if user exists
      if (!currentUser) {
        navigate(createPageUrl(redirectTo));
        return;
      }

      // Check role if required
      if (requiredRole) {
        const userRole = currentUser.user_type || currentUser.role;
        
        if (userRole !== requiredRole && currentUser.role !== 'admin') {
          // Admin can access everything
          console.warn(`Access denied: required role ${requiredRole}, user has ${userRole}`);
          navigate(createPageUrl(redirectTo));
          return;
        }
      }

      setUser(currentUser);

      // Load profile if requested
      if (checkProfile && profileEntity) {
        const cacheKey = `profile_${profileEntity}_${currentUser.email}`;
        
        const loadedProfile = await cacheManager.getOrLoad(
          cacheKey,
          async () => {
            const profiles = await base44.entities[profileEntity].filter({
              user_email: currentUser.email
            });
            return profiles[0] || null;
          },
          10 * 60 * 1000 // 10 min TTL for profiles
        );

        if (!loadedProfile && onboardingPath) {
          // Profile doesn't exist, redirect to onboarding
          navigate(createPageUrl(onboardingPath));
          return;
        }

        setProfile(loadedProfile);
      }

      setLoading(false);
    } catch (error) {
      handleAuthError(error, navigate);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserAndProfile();
  }, []);

  const refetch = () => {
    // Clear cache and reload
    cacheManager.remove('currentUser');
    if (profileEntity && user) {
      cacheManager.remove(`profile_${profileEntity}_${user.email}`);
    }
    loadUserAndProfile();
  };

  return {
    user,
    profile,
    loading,
    refetch
  };
}

/**
 * Hook for optional authentication
 * Similar to useRequireAuth but doesn't redirect if not authenticated
 * 
 * @returns {Object} { user, isAuthenticated, loading, refetch }
 */
export function useOptionalAuth() {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadUser = async () => {
    try {
      setLoading(true);

      // Try cache first
      const cachedUser = cacheManager.get('currentUser');
      const cacheAge = cacheManager.getAge('currentUser');

      let currentUser;

      if (cachedUser && cacheAge < 5 * 60 * 1000) {
        currentUser = cachedUser;
      } else {
        try {
          currentUser = await base44.auth.me();
          if (currentUser) {
            cacheManager.set('currentUser', currentUser, 30 * 60 * 1000);
          }
        } catch (error) {
          // User not authenticated, that's okay
          currentUser = null;
        }
      }

      setUser(currentUser);
      setIsAuthenticated(!!currentUser);
      setLoading(false);
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const refetch = () => {
    cacheManager.remove('currentUser');
    loadUser();
  };

  return {
    user,
    isAuthenticated,
    loading,
    refetch
  };
}

/**
 * Hook to check if user has specific permission
 * 
 * @param {string} permission - Permission to check
 * @returns {boolean} Whether user has permission
 */
export function usePermission(permission) {
  const { user } = useOptionalAuth();

  if (!user) return false;

  // Admins have all permissions
  if (user.role === 'admin') return true;

  // TODO: Implement actual permission system
  // For now, basic role checks
  if (permission === 'admin') {
    return user.role === 'admin';
  }

  if (permission === 'manage_bookings') {
    return ['admin', 'agent'].includes(user.role || user.user_type);
  }

  return false;
}

