import { base44 } from '@/api/base44Client';

/**
 * Lean Admin Permissions Service (v1)
 * Just two roles: admin (full access) and support (limited)
 */
export const AdminPermissions = {
  /**
   * Check if current user is admin or support
   */
  async isAdmin(user) {
    if (!user) return false;
    
    // Check if user.role is 'admin' (built-in Base44 admin)
    if (user.role === 'admin') return true;
    
    // Check AdminUser table
    try {
      const adminUsers = await base44.entities.AdminUser.filter({ 
        email: user.email,
        is_active: true
      });
      return adminUsers.length > 0;
    } catch (error) {
      return user.role === 'admin'; // Fallback to built-in role
    }
  },

  /**
   * Get admin user with role
   */
  async getAdminUser(email) {
    try {
      const adminUsers = await base44.entities.AdminUser.filter({ email });
      if (adminUsers.length > 0) {
        return adminUsers[0];
      }
    } catch (error) {
      console.error('Error getting admin user:', error);
    }
    
    // Fallback: if they're built-in admin, treat as admin role
    try {
      const currentUser = await base44.auth.me();
      if (currentUser && currentUser.role === 'admin') {
        return {
          email: currentUser.email,
          full_name: currentUser.full_name,
          role: 'admin',
          is_active: true
        };
      }
    } catch (error) {
      console.error('Error getting current user:', error);
    }
    
    return null;
  },

  /**
   * Check if admin has full access (not just support)
   */
  async isFullAdmin(email) {
    const adminUser = await this.getAdminUser(email);
    if (!adminUser) return false;
    return adminUser.role === 'admin';
  },

  /**
   * Check if admin is support role
   */
  async isSupport(email) {
    const adminUser = await this.getAdminUser(email);
    if (!adminUser) return false;
    return adminUser.role === 'support';
  },

  /**
   * Log admin action to audit trail
   */
  async logAction(admin_email, action_type, target_type, target_id, metadata = {}) {
    try {
      await base44.entities.AdminAuditLog.create({
        admin_email,
        action_type,
        target_type,
        target_id,
        metadata
      });
    } catch (error) {
      console.error('Failed to log admin action:', error);
    }
  }
};

export default AdminPermissions;