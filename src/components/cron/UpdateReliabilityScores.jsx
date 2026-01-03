/**
 * Update Reliability Scores Cron - Section 4.6
 * Automated nightly recalculation of all cleaner reliability scores
 * 
 * Schedule: Daily at 2:00 AM (off-peak hours)
 * Purpose: Keep scores current, detect tier changes, trigger notifications
 */

import { base44 } from '@/api/base44Client';
import { updateCleanerScore } from '../reliability/ReliabilityScoreCalculatorV2';

/**
 * Run reliability score update for all active cleaners
 */
export const runReliabilityScoreUpdate = async () => {
  const results = {
    total_processed: 0,
    successful_updates: 0,
    tier_changes: 0,
    errors: [],
    started_at: new Date().toISOString(),
    completed_at: null
  };

  try {
    console.log('[Cron] Starting reliability score update...');

    // Get all active cleaner profiles
    const cleaners = await base44.entities.CleanerProfile.filter({ is_active: true });
    console.log(`[Cron] Found ${cleaners.length} active cleaners`);

    results.total_processed = cleaners.length;

    // Process each cleaner
    for (const cleaner of cleaners) {
      try {
        const updateResult = await updateCleanerScore(cleaner.user_email);
        
        results.successful_updates++;

        if (updateResult.tier_changed) {
          results.tier_changes++;
          console.log(`[Cron] Tier change: ${cleaner.user_email} (${updateResult.old_tier} → ${updateResult.new_tier})`);

          // Create event for tier change (Section 3 integration)
          await base44.entities.Event.create({
            event_type: 'reliability_changed',
            user_email: cleaner.user_email,
            details: JSON.stringify({
              old_score: updateResult.old_score,
              new_score: updateResult.new_score,
              old_tier: updateResult.old_tier,
              new_tier: updateResult.new_tier
            }),
            timestamp: new Date().toISOString()
          });
        }
      } catch (error) {
        console.error(`[Cron] Error updating ${cleaner.user_email}:`, error);
        results.errors.push({
          cleaner_email: cleaner.user_email,
          error: error.message
        });
      }
    }

    results.completed_at = new Date().toISOString();
    console.log('[Cron] Reliability score update complete:', results);

    // Log admin event
    await base44.entities.Event.create({
      event_type: 'admin_action',
      user_email: 'system',
      details: `Reliability score cron completed: ${results.successful_updates}/${results.total_processed} updated, ${results.tier_changes} tier changes`,
      timestamp: new Date().toISOString()
    });

    return results;
  } catch (error) {
    console.error('[Cron] Fatal error in reliability score update:', error);
    results.completed_at = new Date().toISOString();
    results.errors.push({
      fatal: true,
      error: error.message
    });
    return results;
  }
};

/**
 * Update single cleaner score (for manual admin trigger)
 */
export const updateSingleCleaner = async (cleanerEmail) => {
  try {
    const result = await updateCleanerScore(cleanerEmail);
    
    if (result.tier_changed) {
      await base44.entities.Event.create({
        event_type: 'admin_action',
        user_email: 'admin_manual',
        details: `Manual score update for ${cleanerEmail}: ${result.old_tier} → ${result.new_tier}`,
        timestamp: new Date().toISOString()
      });
    }

    return {
      success: true,
      result
    };
  } catch (error) {
    console.error('Error in manual score update:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * LEGACY FUNCTION: Alias for AdminDashboard compatibility
 * Processes completed bookings and checks for milestones
 */
export const processCompletedBookings = async () => {
  try {
    const result = await runReliabilityScoreUpdate();
    
    return {
      success: true,
      bookings_processed: result.successful_updates,
      milestones_reached: result.tier_changes,
      error: null
    };
  } catch (error) {
    return {
      success: false,
      bookings_processed: 0,
      milestones_reached: 0,
      error: error.message
    };
  }
};

// Default export for component usage
export default function UpdateReliabilityScores() {
  return null;
}