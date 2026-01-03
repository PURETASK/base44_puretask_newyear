# Database Migration - Cleaner AI Assistant

## Overview
This document outlines the database schema changes needed to support the Cleaner AI Assistant functionality.

## Entity: Job (Booking)

### New Fields to Add

```javascript
// State management
state: 'REQUESTED' | 'OFFERED' | 'ASSIGNED' | 'EN_ROUTE' | 'ARRIVED' | 'IN_PROGRESS' | 'AWAITING_CLIENT_REVIEW' | 'COMPLETED_APPROVED' | 'UNDER_REVIEW' | 'CANCELLED' | 'RESCHEDULED'
sub_state: 'NONE' | 'PHOTOS_PENDING' | 'EXTRA_TIME_REQUESTED' | 'EXTRA_TIME_APPROVED' | 'GPS_ISSUE' | 'DISPUTE_CLIENT' | 'DISPUTE_CLEANER'

// Timestamps
assigned_at: DateTime (ISO 8601 string)
en_route_at: DateTime
check_in_at: DateTime
start_at: DateTime
end_at: DateTime
approved_at: DateTime
disputed_at: DateTime
dispute_resolved_at: DateTime
cancelled_at: DateTime

// GPS locations
en_route_location_lat: Number
en_route_location_lng: Number
check_in_location_lat: Number
check_in_location_lng: Number
start_location_lat: Number
start_location_lng: Number
end_location_lat: Number
end_location_lng: Number

// Billing & escrow
max_billable_minutes: Number
max_billable_credits: Number
actual_minutes_worked: Number
final_credits_charged: Number
escrow_ledger_entry_id: String (reference to EscrowLedger entity)

// Flags
has_pending_extra_time_request: Boolean (default: false)
has_pending_reschedule_request: Boolean (default: false)
requires_before_photos: Boolean (default: true)
requires_after_photos: Boolean (default: true)
before_photos_count: Number (default: 0)
after_photos_count: Number (default: 0)

// Notes
cleaner_notes: Text
admin_notes: Text
```

### Existing Fields to Modify

```javascript
// Map existing 'status' field to new 'state' field
// Mapping:
// 'created' -> 'REQUESTED'
// 'awaiting_cleaner_response' -> 'OFFERED'
// 'accepted' -> 'ASSIGNED'
// 'scheduled' -> 'ASSIGNED'
// 'on_the_way' -> 'EN_ROUTE'
// 'in_progress' -> 'IN_PROGRESS'
// 'completed' -> 'AWAITING_CLIENT_REVIEW'
// 'awaiting_client' -> 'AWAITING_CLIENT_REVIEW'
// 'approved' -> 'COMPLETED_APPROVED'
// 'cancelled' -> 'CANCELLED'
// 'disputed' -> 'UNDER_REVIEW'

// Keep 'status' for backward compatibility, but use 'state' for new logic
```

## Entity: JobPhoto (NEW)

```javascript
{
  id: String (auto-generated)
  job_id: String (foreign key to Job)
  cleaner_id: String (foreign key to User)
  file_id: String (reference to Base44 file storage)
  file_url: String (URL to uploaded photo)
  photo_type: 'before' | 'after' | 'issue' | 'extra'
  uploaded_at: DateTime
  gps_lat: Number (optional)
  gps_lng: Number (optional)
  caption: String (optional)
  flagged_for_review: Boolean (default: false)
  ai_quality_score: Number (0-100, optional)
}
```

## Entity: ExtraTimeRequest (NEW)

```javascript
{
  id: String (auto-generated)
  job_id: String (foreign key to Job)
  cleaner_id: String (foreign key to User)
  client_id: String (foreign key to User)
  minutes_requested: Number
  reason: Text
  requested_at: DateTime
  status: 'pending' | 'approved' | 'denied'
  approved_minutes: Number (nullable)
  response_at: DateTime (nullable)
  response_by: String (nullable, foreign key to User)
  response_notes: Text (nullable)
}
```

## Entity: GPSCheckpoint (NEW)

```javascript
{
  id: String (auto-generated)
  job_id: String (foreign key to Job)
  cleaner_id: String (foreign key to User)
  checkpoint_type: 'en_route' | 'check_in' | 'start' | 'end' | 'manual'
  timestamp: DateTime
  gps_lat: Number
  gps_lng: Number
  gps_accuracy: Number (meters)
  distance_from_job: Number (meters, calculated)
  within_radius: Boolean (true if within 250m)
  notes: String (optional)
}
```

## Entity: JobAuditLog (NEW)

```javascript
{
  id: String (auto-generated)
  job_id: String (foreign key to Job)
  actor_id: String (foreign key to User)
  actor_type: 'client' | 'cleaner' | 'admin' | 'system'
  event_type: String (e.g., 'STATE_TRANSITION', 'PHOTO_UPLOAD', 'GPS_CHECK', 'EXTRA_TIME_REQUEST')
  old_value: JSON (nullable)
  new_value: JSON (nullable)
  metadata: JSON (nullable)
  timestamp: DateTime
  ip_address: String (optional)
}
```

## Migration Steps

### Step 1: Add Fields to Job Entity (Base44 Console)

1. Go to Base44 Console -> Entities -> Job
2. Add new fields as specified above
3. Set default values where applicable
4. Make all new fields optional initially to avoid breaking existing records

### Step 2: Create New Entities (Base44 Console)

1. Create `JobPhoto` entity with fields above
2. Create `ExtraTimeRequest` entity with fields above
3. Create `GPSCheckpoint` entity with fields above
4. Create `JobAuditLog` entity with fields above
5. Set up relationships/foreign keys

### Step 3: Data Backfill Script

```javascript
// Run this script to migrate existing jobs to new state system
const migrateExistingJobs = async () => {
  const allJobs = await base44.entities.Job.filter({});
  
  for (const job of allJobs) {
    const newState = mapStatusToState(job.status);
    await base44.entities.Job.update(job.id, {
      state: newState,
      sub_state: 'NONE',
      before_photos_count: 0,
      after_photos_count: 0,
      has_pending_extra_time_request: false,
      has_pending_reschedule_request: false,
      requires_before_photos: true,
      requires_after_photos: true
    });
  }
  
  console.log(`Migrated ${allJobs.length} jobs`);
};

function mapStatusToState(status) {
  const mapping = {
    'created': 'REQUESTED',
    'payment_hold': 'REQUESTED',
    'awaiting_cleaner_response': 'OFFERED',
    'accepted': 'ASSIGNED',
    'scheduled': 'ASSIGNED',
    'on_the_way': 'EN_ROUTE',
    'in_progress': 'IN_PROGRESS',
    'completed': 'AWAITING_CLIENT_REVIEW',
    'awaiting_client': 'AWAITING_CLIENT_REVIEW',
    'approved': 'COMPLETED_APPROVED',
    'cancelled': 'CANCELLED',
    'disputed': 'UNDER_REVIEW'
  };
  return mapping[status] || 'REQUESTED';
}
```

### Step 4: Update Indexes

```javascript
// Recommended indexes for performance
Job:
  - Index on `assigned_cleaner_email` + `state`
  - Index on `client_email` + `state`
  - Index on `date` + `state`
  
JobPhoto:
  - Index on `job_id`
  - Index on `cleaner_id`
  - Index on `photo_type`
  
ExtraTimeRequest:
  - Index on `job_id`
  - Index on `cleaner_id`
  - Index on `status`
  
GPSCheckpoint:
  - Index on `job_id`
  - Index on `cleaner_id`
  - Index on `timestamp`
  
JobAuditLog:
  - Index on `job_id`
  - Index on `actor_id`
  - Index on `timestamp`
```

## Rollback Plan

If migration fails or issues arise:

1. Keep `status` field unchanged
2. New fields are optional, so old code will continue to work
3. Can remove new entities if not used
4. Use feature flags to gradually enable new state machine

## Testing Checklist

- [ ] All existing jobs migrated successfully
- [ ] New jobs created with proper defaults
- [ ] State transitions work correctly
- [ ] GPS checkpoints recorded properly
- [ ] Photo uploads work
- [ ] Extra time requests work
- [ ] Audit log captures all events
- [ ] Performance acceptable with new indexes

## Notes

- **Backward Compatibility**: The existing `status` field will be kept and synced with `state` for backward compatibility during transition period.
- **Gradual Rollout**: Use feature flags to enable new system for specific cleaners first.
- **Data Integrity**: All state transitions will be logged in `JobAuditLog` for traceability.
- **GPS Accuracy**: Store GPS accuracy to validate quality of location data.
- **Photo Storage**: Photos stored in Base44 file storage, metadata in `JobPhoto` entity.

## Future Enhancements

1. Add AI quality scoring for photos
2. Implement automatic dispute detection
3. Add predictive analytics for job duration
4. Create cleaner performance heatmaps based on GPS data
5. Implement automatic extra time approval based on cleaner reliability

---

**Status:** Ready for Implementation  
**Risk Level:** Medium (requires careful testing)  
**Estimated Time:** 2-3 hours for migration, 1 week for full testing

