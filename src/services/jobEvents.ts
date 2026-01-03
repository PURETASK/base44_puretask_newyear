// Domain Events for Job Lifecycle
// Events that represent important things happening in the job workflow

export type JobEvent =
  | { type: 'JOB_CREATED'; jobId: string; clientId: string }
  | { type: 'JOB_OFFERED'; jobId: string; cleanerIds: string[] }
  | { type: 'JOB_ASSIGNED'; jobId: string; cleanerId: string }
  | { type: 'CLEANER_EN_ROUTE'; jobId: string; cleanerId: string; location: { lat: number; lng: number } }
  | { type: 'CLEANER_ARRIVED'; jobId: string; cleanerId: string; location: { lat: number; lng: number } }
  | { type: 'JOB_STARTED'; jobId: string; cleanerId: string; location: { lat: number; lng: number } }
  | { type: 'BEFORE_PHOTO_UPLOADED'; jobId: string; cleanerId: string; photoId: string }
  | { type: 'AFTER_PHOTO_UPLOADED'; jobId: string; cleanerId: string; photoId: string }
  | { type: 'EXTRA_TIME_REQUESTED'; jobId: string; cleanerId: string; minutesRequested: number; reason: string }
  | { type: 'EXTRA_TIME_APPROVED'; jobId: string; clientId: string; minutesApproved: number }
  | { type: 'EXTRA_TIME_DENIED'; jobId: string; clientId: string; reason: string }
  | { type: 'JOB_COMPLETED'; jobId: string; cleanerId: string; location: { lat: number; lng: number }; minutesWorked: number }
  | { type: 'CLIENT_APPROVED'; jobId: string; clientId: string; rating: number; tip?: number }
  | { type: 'DISPUTE_OPENED'; jobId: string; openedBy: 'client' | 'cleaner'; reason: string }
  | { type: 'DISPUTE_RESOLVED'; jobId: string; resolution: 'approve' | 'refund'; notes: string }
  | { type: 'JOB_CANCELLED'; jobId: string; cancelledBy: string; reason: string }
  | { type: 'RESCHEDULE_REQUESTED'; jobId: string; requestedBy: string; newDate: string; newTime: string };

// Event handler type
export type EventHandler<T extends JobEvent = JobEvent> = (event: T) => Promise<void>;

// Event bus (simple in-memory for now, can be upgraded to queue later)
class EventBus {
  private handlers: Map<JobEvent['type'], EventHandler[]> = new Map();

  on<T extends JobEvent['type']>(
    eventType: T,
    handler: EventHandler<Extract<JobEvent, { type: T }>>
  ): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler as EventHandler);
  }

  async emit(event: JobEvent): Promise<void> {
    const handlers = this.handlers.get(event.type) || [];
    console.log(`[EventBus] Emitting ${event.type}`, event);
    
    // Run all handlers in parallel
    await Promise.all(handlers.map(handler => handler(event)));
  }
}

// Singleton instance
export const jobEventBus = new EventBus();

// Standard side effects (notifications, logging, etc.)

// Send notification to cleaner
jobEventBus.on('JOB_OFFERED', async (event) => {
  console.log(`[Side Effect] Send job offer notifications to ${event.cleanerIds.length} cleaners`);
  // TODO: Send SMS/push notifications via Twilio
});

// Send notification to client
jobEventBus.on('CLEANER_EN_ROUTE', async (event) => {
  console.log(`[Side Effect] Notify client that cleaner is on the way`);
  // TODO: Send SMS to client
});

// Log important events
jobEventBus.on('JOB_STARTED', async (event) => {
  console.log(`[Side Effect] Job ${event.jobId} started by cleaner ${event.cleanerId}`);
  // TODO: Log to audit trail
});

jobEventBus.on('JOB_COMPLETED', async (event) => {
  console.log(`[Side Effect] Job ${event.jobId} completed - ${event.minutesWorked} minutes`);
  // TODO: Calculate payout, update cleaner earnings
});

jobEventBus.on('CLIENT_APPROVED', async (event) => {
  console.log(`[Side Effect] Job ${event.jobId} approved with rating ${event.rating}`);
  // TODO: Release escrow, pay cleaner, update reliability score
});

jobEventBus.on('DISPUTE_OPENED', async (event) => {
  console.log(`[Side Effect] Dispute opened on job ${event.jobId} by ${event.openedBy}`);
  // TODO: Alert admin team, freeze payments
});

// Helper to emit multiple events
export async function emitEvents(events: JobEvent[]): Promise<void> {
  for (const event of events) {
    await jobEventBus.emit(event);
  }
}

