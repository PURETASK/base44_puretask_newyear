import { base44 } from '@/api/base44Client';

/**
 * Risk Check Service
 * Utility functions to check if a user can perform certain actions
 */

export const RiskCheckService = {
  /**
   * Check if a client can create a booking
   */
  async canClientBook(clientEmail) {
    try {
      const profiles = await base44.entities.RiskProfile.filter({ 
        user_email: clientEmail,
        user_type: 'client'
      });
      
      if (profiles.length === 0) return { allowed: true };
      
      const profile = profiles[0];
      
      if (profile.risk_tier === 'blocked') {
        return {
          allowed: false,
          reason: 'Your account has been blocked due to safety or fraud concerns. Please contact support.',
          requiresVerification: false
        };
      }
      
      if (profile.risk_tier === 'restricted') {
        return {
          allowed: true,
          requiresVerification: true,
          reason: 'Your account requires verification before booking.'
        };
      }
      
      return { allowed: true };
    } catch (error) {
      console.error('Error checking booking permission:', error);
      return { allowed: true }; // Fail open
    }
  },

  /**
   * Check if a client can file a dispute
   */
  async canClientDispute(clientEmail) {
    try {
      const profiles = await base44.entities.RiskProfile.filter({ 
        user_email: clientEmail 
      });
      
      if (profiles.length === 0) return { allowed: true };
      
      const profile = profiles[0];
      
      // Check for refund_abuse tag
      if (profile.tags && profile.tags.includes('refund_abuse')) {
        return {
          allowed: false,
          reason: 'Your dispute privileges have been restricted. Please contact support for assistance.'
        };
      }
      
      return { allowed: true };
    } catch (error) {
      console.error('Error checking dispute permission:', error);
      return { allowed: true };
    }
  },

  /**
   * Check if a cleaner can accept bookings
   */
  async canCleanerAccept(cleanerEmail) {
    try {
      const profiles = await base44.entities.RiskProfile.filter({ 
        user_email: cleanerEmail,
        user_type: 'cleaner'
      });
      
      if (profiles.length === 0) return { allowed: true };
      
      const profile = profiles[0];
      
      if (profile.risk_tier === 'blocked') {
        return {
          allowed: false,
          reason: 'Your account has been temporarily blocked. Please contact support.'
        };
      }
      
      return { allowed: true };
    } catch (error) {
      console.error('Error checking cleaner permission:', error);
      return { allowed: true };
    }
  },

  /**
   * Get risk profile for a user
   */
  async getRiskProfile(userEmail) {
    try {
      const profiles = await base44.entities.RiskProfile.filter({ user_email: userEmail });
      return profiles.length > 0 ? profiles[0] : null;
    } catch (error) {
      console.error('Error getting risk profile:', error);
      return null;
    }
  },

  /**
   * Check if user has specific risk flags
   */
  async hasActiveFlags(userEmail, category = null) {
    try {
      const query = {
        subject_id: userEmail,
        status: 'open'
      };
      
      if (category) {
        query.category = category;
      }
      
      const flags = await base44.entities.RiskFlag.filter(query);
      return flags.length > 0;
    } catch (error) {
      console.error('Error checking flags:', error);
      return false;
    }
  }
};