// Job State Machine - Extended for Cleaner AI Assistant
// Defines all possible job states and transitions

export type JobState =
  | 'REQUESTED'           // Client booked, escrow reserved, not yet offered
  | 'OFFERED'             // Offers sent to matched cleaners
  | 'ASSIGNED'            // Cleaner accepted
  | 'EN_ROUTE'            // Cleaner on the way
  | 'ARRIVED'             // At property (optional state)
  | 'IN_PROGRESS'         // Job started, timer running
  | 'AWAITING_CLIENT_REVIEW' // Finished, waiting for client approval
  | 'COMPLETED_APPROVED'  // Client approved, billing done
  | 'UNDER_REVIEW'        // Disputed, under investigation
  | 'CANCELLED'           // Job cancelled
  | 'RESCHEDULED';        // Moved to new time/date

export type JobSubState =
  | 'NONE'
  | 'PHOTOS_PENDING'      // Waiting for before/after photos
  | 'EXTRA_TIME_REQUESTED' // Cleaner asked for more time
  | 'EXTRA_TIME_APPROVED' // Client approved extra time
  | 'GPS_ISSUE'           // GPS validation problem
  | 'DISPUTE_CLIENT'      // Client opened dispute
  | 'DISPUTE_CLEANER';    // Cleaner opened dispute

// Job record type matching database schema
export interface JobRecord {
  id: string;
  
  // Participants
  client_id: string;
  client_email: string;
  assigned_cleaner_id: string | null;
  assigned_cleaner_email: string | null;
  
  // State
  state: JobState;
  sub_state: JobSubState;
  
  // Core timestamps
  created_at: string;
  assigned_at: string | null;
  en_route_at: string | null;
  check_in_at: string | null;
  start_at: string | null;
  end_at: string | null;
  approved_at: string | null;
  disputed_at: string | null;
  dispute_resolved_at: string | null;
  cancelled_at: string | null;
  
  // GPS locations
  en_route_location_lat: number | null;
  en_route_location_lng: number | null;
  check_in_location_lat: number | null;
  check_in_location_lng: number | null;
  start_location_lat: number | null;
  start_location_lng: number | null;
  end_location_lat: number | null;
  end_location_lng: number | null;
  
  // Billing & escrow
  max_billable_minutes: number | null;
  max_billable_credits: number | null;
  actual_minutes_worked: number | null;
  final_credits_charged: number | null;
  escrow_ledger_entry_id: string | null;
  
  // Flags
  has_pending_extra_time_request: boolean;
  has_pending_reschedule_request: boolean;
  requires_before_photos: boolean;
  requires_after_photos: boolean;
  before_photos_count: number;
  after_photos_count: number;
  
  // Job details (existing fields)
  date: string;
  time: string;
  duration_hours: number;
  address: string;
  latitude: number;
  longitude: number;
  cleaning_type: 'basic' | 'deep' | 'moveout';
  bedrooms: number;
  bathrooms: number;
  square_feet: number | null;
  
  // Pricing (snapshot at booking time)
  pricing_snapshot: any; // JSON
  
  // Notes
  client_notes: string | null;
  cleaner_notes: string | null;
  admin_notes: string | null;
}

// State transition result
export interface StateTransitionResult {
  nextState: JobState;
  nextSubState: JobSubState;
  patch: Partial<JobRecord>; // Fields to update in DB
  sideEffects: Array<() => Promise<void>>; // Actions to perform after commit
}

// Transition guards (checks before allowing transition)
export interface TransitionGuard {
  check: (job: JobRecord) => boolean | Promise<boolean>;
  errorMessage: string;
}

// State machine configuration
export const STATE_TRANSITIONS: Record<JobState, Partial<Record<JobState, TransitionGuard[]>>> = {
  REQUESTED: {
    OFFERED: [],
    CANCELLED: []
  },
  OFFERED: {
    ASSIGNED: [
      {
        check: (job) => !!job.assigned_cleaner_id,
        errorMessage: 'Must have assigned cleaner'
      }
    ],
    CANCELLED: []
  },
  ASSIGNED: {
    EN_ROUTE: [],
    CANCELLED: []
  },
  EN_ROUTE: {
    ARRIVED: [],
    IN_PROGRESS: [], // Can go directly to in_progress
    CANCELLED: []
  },
  ARRIVED: {
    IN_PROGRESS: [],
    CANCELLED: []
  },
  IN_PROGRESS: {
    AWAITING_CLIENT_REVIEW: [
      {
        check: (job) => (job.before_photos_count || 0) >= 3,
        errorMessage: 'Must have at least 3 before photos'
      },
      {
        check: (job) => (job.after_photos_count || 0) >= 3,
        errorMessage: 'Must have at least 3 after photos'
      },
      {
        check: (job) => !!job.end_at && !!job.start_at,
        errorMessage: 'Must have valid start and end times'
      }
    ],
    CANCELLED: []
  },
  AWAITING_CLIENT_REVIEW: {
    COMPLETED_APPROVED: [],
    UNDER_REVIEW: []
  },
  COMPLETED_APPROVED: {},
  UNDER_REVIEW: {
    COMPLETED_APPROVED: [], // Dispute resolved in cleaner's favor
    CANCELLED: [] // Dispute resolved in client's favor
  },
  CANCELLED: {},
  RESCHEDULED: {}
};

// Helper to check if transition is allowed
export function canTransition(
  fromState: JobState,
  toState: JobState,
  job: JobRecord
): { allowed: boolean; reasons: string[] } {
  const transitions = STATE_TRANSITIONS[fromState];
  
  if (!transitions || !(toState in transitions)) {
    return {
      allowed: false,
      reasons: [`Cannot transition from ${fromState} to ${toState}`]
    };
  }
  
  const guards = transitions[toState] || [];
  const failedGuards: string[] = [];
  
  for (const guard of guards) {
    if (!guard.check(job)) {
      failedGuards.push(guard.errorMessage);
    }
  }
  
  return {
    allowed: failedGuards.length === 0,
    reasons: failedGuards
  };
}

// Calculate worked minutes
export function calculateWorkedMinutes(job: JobRecord): number | null {
  if (!job.start_at || !job.end_at) return null;
  
  const start = new Date(job.start_at);
  const end = new Date(job.end_at);
  const diffMs = end.getTime() - start.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  
  return diffMinutes > 0 ? diffMinutes : null;
}

// Calculate billable minutes (capped at max)
export function calculateBillableMinutes(job: JobRecord): number | null {
  const worked = calculateWorkedMinutes(job);
  if (worked === null) return null;
  
  const max = job.max_billable_minutes || worked;
  return Math.min(worked, max);
}

// Check if GPS location is near job address
export function isLocationNearJob(
  locationLat: number,
  locationLng: number,
  job: JobRecord,
  radiusMeters: number = 250
): boolean {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (locationLat * Math.PI) / 180;
  const φ2 = (job.latitude * Math.PI) / 180;
  const Δφ = ((job.latitude - locationLat) * Math.PI) / 180;
  const Δλ = ((job.longitude - locationLng) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c; // Distance in meters
  return distance <= radiusMeters;
}

