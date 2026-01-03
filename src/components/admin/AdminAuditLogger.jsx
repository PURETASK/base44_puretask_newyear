import { base44 } from '@/api/base44Client';

/**
 * Admin Audit Logger Service
 * Logs all admin actions for compliance and security
 */

export const AdminAuditLogger = {
  /**
   * Log an admin action
   */
  async log({
    adminEmail,
    actionType,
    targetType,
    targetId,
    beforeState = null,
    afterState = null,
    metadata = {}
  }) {
    try {
      await base44.entities.AdminAuditLog.create({
        admin_email: adminEmail,
        action_type: actionType,
        target_type: targetType,
        target_id: targetId,
        before_state: beforeState,
        after_state: afterState,
        metadata
      });
      
      console.log(`📝 Audit log created: ${actionType} on ${targetType}:${targetId}`);
    } catch (error) {
      console.error('Error creating audit log:', error);
      // Don't fail the operation if audit logging fails
    }
  },

  /**
   * Get recent audit logs
   */
  async getRecentLogs(limit = 50) {
    try {
      return await base44.entities.AdminAuditLog.list('-created_date', limit);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      return [];
    }
  },

  /**
   * Get audit logs for specific target
   */
  async getLogsForTarget(targetType, targetId) {
    try {
      return await base44.entities.AdminAuditLog.filter({
        target_type: targetType,
        target_id: targetId
      });
    } catch (error) {
      console.error('Error fetching target logs:', error);
      return [];
    }
  },

  /**
   * Get audit logs by admin
   */
  async getLogsByAdmin(adminEmail, limit = 50) {
    try {
      return await base44.entities.AdminAuditLog.filter(
        { admin_email: adminEmail },
        '-created_date',
        limit
      );
    } catch (error) {
      console.error('Error fetching admin logs:', error);
      return [];
    }
  }
};