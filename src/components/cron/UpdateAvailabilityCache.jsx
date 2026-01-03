import { base44 } from '@/api/base44Client';
import { calculateTypicalAvailability } from '../matching/AvailabilityAnalyzer';

/**
 * Update availability cache for all active cleaners
 * Should be run daily via cron job
 */
export async function updateAllCleanerAvailabilityCache() {
  console.log('🔄 Starting availability cache update for all cleaners...');
  
  try {
    const cleaners = await base44.entities.CleanerProfile.filter({ 
      is_active: true 
    });
    
    console.log(`📊 Found ${cleaners.length} active cleaners to update`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const cleaner of cleaners) {
      try {
        const availability = await calculateTypicalAvailability(cleaner.user_email);
        
        await base44.entities.CleanerProfile.update(cleaner.id, {
          typical_acceptance_rate_by_time: availability
        });
        
        successCount++;
        console.log(`✅ Updated availability cache for ${cleaner.user_email}`);
      } catch (error) {
        errorCount++;
        console.error(`❌ Failed to update ${cleaner.user_email}:`, error);
      }
    }
    
    console.log(`✨ Availability cache update complete: ${successCount} success, ${errorCount} errors`);
    
    return {
      success: true,
      total: cleaners.length,
      successCount,
      errorCount
    };
  } catch (error) {
    console.error('❌ Critical error in availability cache update:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Update availability cache for a single cleaner
 * Can be called after each booking to keep cache fresh
 */
export async function updateCleanerAvailabilityCache(cleanerEmail) {
  try {
    const cleanerProfiles = await base44.entities.CleanerProfile.filter({ 
      user_email: cleanerEmail,
      is_active: true
    });
    
    if (cleanerProfiles.length === 0) {
      console.warn(`No active cleaner profile found for ${cleanerEmail}`);
      return false;
    }
    
    const cleaner = cleanerProfiles[0];
    const availability = await calculateTypicalAvailability(cleanerEmail);
    
    await base44.entities.CleanerProfile.update(cleaner.id, {
      typical_acceptance_rate_by_time: availability
    });
    
    console.log(`✅ Updated availability cache for ${cleanerEmail}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to update availability cache for ${cleanerEmail}:`, error);
    return false;
  }
}