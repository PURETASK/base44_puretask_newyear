// Cleaner Jobs Service - Orchestration Layer
// Handles job state transitions, validation, and side effects

import { base44 } from '@/api/base44Client';
import type { JobRecord, JobState, JobSubState } from '@/types/cleanerJobTypes';
import {
  canTransition,
  calculateWorkedMinutes,
  calculateBillableMinutes,
  isLocationNearJob
} from '@/types/cleanerJobTypes';
import { jobEventBus } from './jobEvents';

export class CleanerJobsService {
  
  // Get all jobs for a specific cleaner
  async getCleanerJobs(cleanerEmail: string): Promise<JobRecord[]> {
    try {
      const jobs = await base44.entities.Job.filter({
        assigned_cleaner_email: cleanerEmail
      });
      
      return jobs as unknown as JobRecord[];
    } catch (error) {
      console.error('Error fetching cleaner jobs:', error);
      return [];
    }
  }
  
  // Get single job with validation
  async getJob(jobId: string, cleanerEmail: string): Promise<JobRecord | null> {
    try {
      const job = await base44.entities.Job.getOne(jobId);
      
      if (!job) return null;
      
      // Ensure this cleaner is assigned to this job
      if (job.assigned_cleaner_email !== cleanerEmail) {
        throw new Error('Unauthorized: You are not assigned to this job');
      }
      
      return job as unknown as JobRecord;
    } catch (error) {
      console.error('Error fetching job:', error);
      return null;
    }
  }
  
  // Transition: Cleaner accepts job
  async acceptJob(jobId: string, cleanerEmail: string, cleanerId: string): Promise<JobRecord> {
    const job = await base44.entities.Job.getOne(jobId);
    
    if (!job) throw new Error('Job not found');
    if (job.state !== 'OFFERED') throw new Error('Job is not in OFFERED state');
    
    const updatedJob = await base44.entities.Job.update(jobId, {
      state: 'ASSIGNED',
      assigned_cleaner_id: cleanerId,
      assigned_cleaner_email: cleanerEmail,
      assigned_at: new Date().toISOString()
    });
    
    await jobEventBus.emit({
      type: 'JOB_ASSIGNED',
      jobId,
      cleanerId
    });
    
    return updatedJob as unknown as JobRecord;
  }
  
  // Transition: Cleaner is en route
  async markEnRoute(
    jobId: string,
    cleanerEmail: string,
    cleanerId: string,
    location: { lat: number; lng: number }
  ): Promise<JobRecord> {
    const job = await this.getJob(jobId, cleanerEmail);
    if (!job) throw new Error('Job not found or unauthorized');
    
    const transition = canTransition(job.state as JobState, 'EN_ROUTE', job);
    if (!transition.allowed) {
      throw new Error(`Cannot mark en route: ${transition.reasons.join(', ')}`);
    }
    
    const updatedJob = await base44.entities.Job.update(jobId, {
      state: 'EN_ROUTE',
      en_route_at: new Date().toISOString(),
      en_route_location_lat: location.lat,
      en_route_location_lng: location.lng
    });
    
    await jobEventBus.emit({
      type: 'CLEANER_EN_ROUTE',
      jobId,
      cleanerId,
      location
    });
    
    return updatedJob as unknown as JobRecord;
  }
  
  // Transition: Cleaner arrived at location
  async markArrived(
    jobId: string,
    cleanerEmail: string,
    cleanerId: string,
    location: { lat: number; lng: number }
  ): Promise<JobRecord> {
    const job = await this.getJob(jobId, cleanerEmail);
    if (!job) throw new Error('Job not found or unauthorized');
    
    // Validate GPS location
    if (!isLocationNearJob(location.lat, location.lng, job, 250)) {
      throw new Error('GPS location is too far from job address (must be within 250 meters)');
    }
    
    const updatedJob = await base44.entities.Job.update(jobId, {
      state: 'ARRIVED',
      check_in_at: new Date().toISOString(),
      check_in_location_lat: location.lat,
      check_in_location_lng: location.lng
    });
    
    await jobEventBus.emit({
      type: 'CLEANER_ARRIVED',
      jobId,
      cleanerId,
      location
    });
    
    return updatedJob as unknown as JobRecord;
  }
  
  // Transition: Start job (timer starts)
  async startJob(
    jobId: string,
    cleanerEmail: string,
    cleanerId: string,
    location: { lat: number; lng: number }
  ): Promise<JobRecord> {
    const job = await this.getJob(jobId, cleanerEmail);
    if (!job) throw new Error('Job not found or unauthorized');
    
    // Validate GPS location
    if (!isLocationNearJob(location.lat, location.lng, job, 250)) {
      throw new Error('GPS location is too far from job address (must be within 250 meters)');
    }
    
    const transition = canTransition(job.state as JobState, 'IN_PROGRESS', job);
    if (!transition.allowed) {
      throw new Error(`Cannot start job: ${transition.reasons.join(', ')}`);
    }
    
    // Calculate max billable based on original booking
    const maxMinutes = job.duration_hours * 60;
    const creditsPerHour = 50; // TODO: Get from pricing snapshot
    const maxCredits = (maxMinutes / 60) * creditsPerHour;
    
    const updatedJob = await base44.entities.Job.update(jobId, {
      state: 'IN_PROGRESS',
      start_at: new Date().toISOString(),
      start_location_lat: location.lat,
      start_location_lng: location.lng,
      max_billable_minutes: maxMinutes,
      max_billable_credits: maxCredits
    });
    
    await jobEventBus.emit({
      type: 'JOB_STARTED',
      jobId,
      cleanerId,
      location
    });
    
    return updatedJob as unknown as JobRecord;
  }
  
  // Upload before photos
  async uploadBeforePhoto(
    jobId: string,
    cleanerEmail: string,
    cleanerId: string,
    photoFile: File
  ): Promise<{ photoId: string; count: number }> {
    const job = await this.getJob(jobId, cleanerEmail);
    if (!job) throw new Error('Job not found or unauthorized');
    
    if (job.state !== 'IN_PROGRESS') {
      throw new Error('Can only upload before photos during IN_PROGRESS state');
    }
    
    // Upload to Base44 file storage
    const uploadResult = await base44.files.uploadFile(photoFile);
    
    // Increment count
    const newCount = (job.before_photos_count || 0) + 1;
    await base44.entities.Job.update(jobId, {
      before_photos_count: newCount
    });
    
    await jobEventBus.emit({
      type: 'BEFORE_PHOTO_UPLOADED',
      jobId,
      cleanerId,
      photoId: uploadResult.id
    });
    
    return { photoId: uploadResult.id, count: newCount };
  }
  
  // Upload after photos
  async uploadAfterPhoto(
    jobId: string,
    cleanerEmail: string,
    cleanerId: string,
    photoFile: File
  ): Promise<{ photoId: string; count: number }> {
    const job = await this.getJob(jobId, cleanerEmail);
    if (!job) throw new Error('Job not found or unauthorized');
    
    if (job.state !== 'IN_PROGRESS') {
      throw new Error('Can only upload after photos during IN_PROGRESS state');
    }
    
    // Upload to Base44 file storage
    const uploadResult = await base44.files.uploadFile(photoFile);
    
    // Increment count
    const newCount = (job.after_photos_count || 0) + 1;
    await base44.entities.Job.update(jobId, {
      after_photos_count: newCount
    });
    
    await jobEventBus.emit({
      type: 'AFTER_PHOTO_UPLOADED',
      jobId,
      cleanerId,
      photoId: uploadResult.id
    });
    
    return { photoId: uploadResult.id, count: newCount };
  }
  
  // Request extra time
  async requestExtraTime(
    jobId: string,
    cleanerEmail: string,
    cleanerId: string,
    minutesRequested: number,
    reason: string
  ): Promise<JobRecord> {
    const job = await this.getJob(jobId, cleanerEmail);
    if (!job) throw new Error('Job not found or unauthorized');
    
    if (job.state !== 'IN_PROGRESS') {
      throw new Error('Can only request extra time during IN_PROGRESS state');
    }
    
    const updatedJob = await base44.entities.Job.update(jobId, {
      sub_state: 'EXTRA_TIME_REQUESTED',
      has_pending_extra_time_request: true
    });
    
    await jobEventBus.emit({
      type: 'EXTRA_TIME_REQUESTED',
      jobId,
      cleanerId,
      minutesRequested,
      reason
    });
    
    return updatedJob as unknown as JobRecord;
  }
  
  // Complete job (submit for review)
  async completeJob(
    jobId: string,
    cleanerEmail: string,
    cleanerId: string,
    location: { lat: number; lng: number },
    notes?: string
  ): Promise<JobRecord> {
    const job = await this.getJob(jobId, cleanerEmail);
    if (!job) throw new Error('Job not found or unauthorized');
    
    // Validate GPS location
    if (!isLocationNearJob(location.lat, location.lng, job, 250)) {
      throw new Error('GPS location is too far from job address (must be within 250 meters)');
    }
    
    const endTime = new Date().toISOString();
    const minutesWorked = calculateWorkedMinutes({
      ...job,
      end_at: endTime
    });
    
    const transition = canTransition(job.state as JobState, 'AWAITING_CLIENT_REVIEW', job);
    if (!transition.allowed) {
      throw new Error(`Cannot complete job: ${transition.reasons.join(', ')}`);
    }
    
    const billableMinutes = calculateBillableMinutes({
      ...job,
      end_at: endTime,
      actual_minutes_worked: minutesWorked
    });
    
    const updatedJob = await base44.entities.Job.update(jobId, {
      state: 'AWAITING_CLIENT_REVIEW',
      end_at: endTime,
      end_location_lat: location.lat,
      end_location_lng: location.lng,
      actual_minutes_worked: minutesWorked,
      cleaner_notes: notes
    });
    
    await jobEventBus.emit({
      type: 'JOB_COMPLETED',
      jobId,
      cleanerId,
      location,
      minutesWorked: minutesWorked || 0
    });
    
    return updatedJob as unknown as JobRecord;
  }
  
  // Cancel job (cleaner-side)
  async cancelJob(
    jobId: string,
    cleanerEmail: string,
    cleanerId: string,
    reason: string
  ): Promise<JobRecord> {
    const job = await this.getJob(jobId, cleanerEmail);
    if (!job) throw new Error('Job not found or unauthorized');
    
    // Cannot cancel if already completed or under review
    if (['COMPLETED_APPROVED', 'UNDER_REVIEW'].includes(job.state as string)) {
      throw new Error('Cannot cancel job in this state');
    }
    
    const updatedJob = await base44.entities.Job.update(jobId, {
      state: 'CANCELLED',
      cancelled_at: new Date().toISOString(),
      cleaner_notes: reason
    });
    
    await jobEventBus.emit({
      type: 'JOB_CANCELLED',
      jobId,
      cancelledBy: cleanerId,
      reason
    });
    
    return updatedJob as unknown as JobRecord;
  }
}

// Singleton instance
export const cleanerJobsService = new CleanerJobsService();

