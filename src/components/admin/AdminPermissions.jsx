import { base44 } from '@/api/base44Client';

/**
 * Admin Permissions Service
 * Role-based access control for admin portal
 */

const ROLE_CAPABILITIES = {
  super_admin: [
    'can_view_bookings', 'can_edit_bookings', 'can_issue_refunds',
    'can_modify_pricing', 'can_block_users', 'can_view_financials',
    'can_view_risk_center', 'can_modify_risk_tier', 'can_modify_config',
    'can_approve_onboarding', 'can_manage_payouts', 'can_view_analytics'
  ],
  ops: [
    'can_view_bookings', 'can_edit_bookings', 'can_issue_refunds',
    'can_block_users', 'can_approve_onboarding', 'can_view_analytics'
  ],
  support: [
    'can_view_bookings', 'can_issue_refunds', 'can_view_analytics'
  ],
  finance: [
    'can_view_bookings', 'can_view_financials', 'can_manage_payouts',
    'can_issue_refunds', 'can_view_analytics'
  ],
  trust_safety: [
    'can_view_bookings', 'can_view_risk_center', 'can_modify_risk_tier',
    'can_block_users', 'can_view_analytics'
  ],
  growth: [
    'can_view_analytics', 'can_modify_config'
  ]
};

export const AdminPermissions = {
  /**
   * Check if current user is admin
   */
  async isAdmin(user) {
    if (!user) return false;
    
    // Check if user.role is 'admin' (built-in Base44 admin)
    if (user.role === 'admin') return true;
    
    // Check AdminUser table (may not exist yet)
    try {
      const adminUsers = await base44.entities.AdminUser.filter({ 
        email: user.email,
        is_active: true
      });
      return adminUsers.length > 0;
    } catch (error) {
      // If AdminUser entity doesn't exist yet or query fails, fallback to role check
      return user.role === 'admin';
    }
  },

  /**
   * Get admin user profile with roles
   */
  async getAdminUser(email) {
    try {
      const adminUsers = await base44.entities.AdminUser.filter({ email });
      if (adminUsers.length > 0) {
        return adminUsers[0];
      }
    } catch (error) {
      console.error('Error getting admin user from table:', error);
    }
    
    // Fallback: if they're built-in admin, treat as super_admin
    try {
      const currentUser = await base44.auth.me();
      if (currentUser && currentUser.role === 'admin') {
        return {
          email: currentUser.email,
          full_name: currentUser.full_name,
          roles: ['super_admin'],
          is_active: true
        };
      }
    } catch (error) {
      console.error('Error getting current user:', error);
    }
    
    return null;
  },

  /**
   * Check if admin has specific capability
   */
  async hasCapability(email, capability) {
    const adminUser = await this.getAdminUser(email);
    if (!adminUser) {
      // Fallback: check if they're built-in admin
      try {
        const currentUser = await base44.auth.me();
        if (currentUser && currentUser.role === 'admin') {
          return true; // Super admins have all capabilities
        }
      } catch (error) {
        return false;
      }
      return false;
    }
    
    // Check all roles for this capability
    for (const role of adminUser.roles) {
      const capabilities = ROLE_CAPABILITIES[role] || [];
      if (capabilities.includes(capability)) {
        return true;
      }
    }
    
    return false;
  },

  /**
   * Get all capabilities for an admin
   */
  async getCapabilities(email) {
    const adminUser = await this.getAdminUser(email);
    if (!adminUser) return [];
    
    const allCapabilities = new Set();
    for (const role of adminUser.roles) {
      const capabilities = ROLE_CAPABILITIES[role] || [];
      capabilities.forEach(cap => allCapabilities.add(cap));
    }
    
    return Array.from(allCapabilities);
  }
};