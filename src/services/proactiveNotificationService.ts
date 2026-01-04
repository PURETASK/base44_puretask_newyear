// Proactive Notification Service
// Smart notifications based on job state, time, and context

import type { JobRecord } from '@/types/cleanerJobTypes';
import { jobEventBus } from './jobEvents';

export interface Notification {
  id: string;
  type: 'reminder' | 'alert' | 'tip' | 'achievement' | 'warning';
  priority: 'high' | 'medium' | 'low';
  title: string;
  message: string;
  actionLabel?: string;
  actionUrl?: string;
  timestamp: Date;
  read: boolean;
  jobId?: string;
}

export class ProactiveNotificationService {
  private notifications: Notification[] = [];
  private listeners: Array<(notification: Notification) => void> = [];
  
  constructor() {
    this.setupEventListeners();
    this.startScheduledChecks();
  }
  
  // Subscribe to new notifications
  subscribe(callback: (notification: Notification) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }
  
  // Emit notification to all listeners
  private emit(notification: Notification) {
    this.notifications.push(notification);
    this.listeners.forEach(callback => callback(notification));
  }
  
  // Setup job event listeners
  private setupEventListeners() {
    // Job assigned - remind to prepare
    jobEventBus.on('JOB_ASSIGNED', async (event) => {
      this.emit({
        id: Date.now().toString(),
        type: 'reminder',
        priority: 'medium',
        title: '🎯 New Job Assigned!',
        message: 'You have a new job! Review the details and mark when you\'re en route.',
        actionLabel: 'View Job',
        actionUrl: `/CleanerJobDetail/${event.jobId}`,
        timestamp: new Date(),
        read: false,
        jobId: event.jobId
      });
    });
    
    // Extra time approved
    jobEventBus.on('EXTRA_TIME_APPROVED', async (event) => {
      this.emit({
        id: Date.now().toString(),
        type: 'alert',
        priority: 'high',
        title: '✅ Extra Time Approved!',
        message: `Client approved ${event.minutesApproved} extra minutes. Continue working!`,
        timestamp: new Date(),
        read: false,
        jobId: event.jobId
      });
    });
    
    // Job completed - celebrate
    jobEventBus.on('CLIENT_APPROVED', async (event) => {
      this.emit({
        id: Date.now().toString(),
        type: 'achievement',
        priority: 'medium',
        title: '🎉 Job Approved!',
        message: `Great work! Your payment is being processed. Rating: ${event.rating}/5.0`,
        timestamp: new Date(),
        read: false,
        jobId: event.jobId
      });
    });
  }
  
  // Start scheduled checks for time-based notifications
  private startScheduledChecks() {
    // Check every minute for upcoming jobs
    setInterval(() => {
      this.checkUpcomingJobs();
      this.checkLateJobs();
      this.checkPhotoReminders();
    }, 60000); // Every 1 minute
  }
  
  // Check for jobs starting soon
  async checkUpcomingJobs() {
    // This would fetch from backend
    // For now, placeholder
  }
  
  // Generate notification for job starting soon
  createJobStartingSoonNotification(job: JobRecord, minutesUntil: number): Notification {
    let priority: 'high' | 'medium' | 'low' = 'medium';
    let title = '';
    let message = '';
    
    if (minutesUntil <= 15) {
      priority = 'high';
      title = '🚨 Job Starting Soon!';
      message = `Your job at ${job.address} starts in ${minutesUntil} minutes! Time to head out.`;
    } else if (minutesUntil <= 30) {
      priority = 'medium';
      title = '⏰ Job in 30 Minutes';
      message = `Don't forget: Job at ${job.address} starts soon. Prepare your supplies!`;
    } else if (minutesUntil <= 60) {
      priority = 'low';
      title = '📅 Job in 1 Hour';
      message = `Heads up: You have a job at ${job.address} in about an hour.`;
    }
    
    return {
      id: `job-reminder-${job.id}-${Date.now()}`,
      type: 'reminder',
      priority,
      title,
      message,
      actionLabel: 'View Job',
      actionUrl: `/CleanerJobDetail/${job.id}`,
      timestamp: new Date(),
      read: false,
      jobId: job.id
    };
  }
  
  // Check for jobs that are late
  checkLateJobs() {
    // Placeholder - would check jobs marked EN_ROUTE but not ARRIVED after expected time
  }
  
  // Create late arrival notification
  createLateArrivalNotification(job: JobRecord, minutesLate: number): Notification {
    return {
      id: `late-${job.id}-${Date.now()}`,
      type: 'warning',
      priority: 'high',
      title: '⚠️ Running Late',
      message: `You're ${minutesLate} minutes late for your job. Contact the client if needed.`,
      actionLabel: 'Contact Support',
      actionUrl: '/Support',
      timestamp: new Date(),
      read: false,
      jobId: job.id
    };
  }
  
  // Check for photo reminders
  checkPhotoReminders() {
    // Placeholder - would check jobs IN_PROGRESS for > 30 min without photos
  }
  
  // Create photo reminder
  createPhotoReminderNotification(job: JobRecord, photoType: 'before' | 'after'): Notification {
    return {
      id: `photo-${job.id}-${photoType}-${Date.now()}`,
      type: 'reminder',
      priority: 'medium',
      title: '📸 Photo Reminder',
      message: photoType === 'before' 
        ? 'Don\'t forget to take before photos before you start cleaning!'
        : 'Remember to take after photos to complete the job.',
      actionLabel: 'Upload Photos',
      actionUrl: `/CleanerJobDetail/${job.id}`,
      timestamp: new Date(),
      read: false,
      jobId: job.id
    };
  }
  
  // Create achievement notifications
  createAchievementNotification(
    title: string,
    message: string,
    milestone: string
  ): Notification {
    return {
      id: `achievement-${Date.now()}`,
      type: 'achievement',
      priority: 'low',
      title: `🏆 ${title}`,
      message,
      timestamp: new Date(),
      read: false
    };
  }
  
  // Smart tips based on context
  createContextualTip(job: JobRecord): Notification {
    const tips = [
      {
        condition: (j: JobRecord) => j.cleaning_type === 'deep',
        title: '💡 Deep Cleaning Tip',
        message: 'For deep cleans, focus on baseboards, light fixtures, and inside appliances for 5-star reviews!'
      },
      {
        condition: (j: JobRecord) => j.bedrooms >= 3,
        title: '💡 Large Home Tip',
        message: 'Start with the farthest room and work your way back to save time and energy.'
      },
      {
        condition: (j: JobRecord) => j.cleaning_type === 'moveout',
        title: '💡 Move-Out Tip',
        message: 'Check inside cabinets, closets, and drawers - these are often missed!'
      }
    ];
    
    const matchingTip = tips.find(tip => tip.condition(job));
    
    if (matchingTip) {
      return {
        id: `tip-${job.id}-${Date.now()}`,
        type: 'tip',
        priority: 'low',
        title: matchingTip.title,
        message: matchingTip.message,
        timestamp: new Date(),
        read: false,
        jobId: job.id
      };
    }
    
    return null as any;
  }
  
  // Weekly summary notification
  createWeeklySummaryNotification(stats: {
    jobsCompleted: number;
    earnings: number;
    avgRating: number;
  }): Notification {
    return {
      id: `weekly-${Date.now()}`,
      type: 'achievement',
      priority: 'low',
      title: '📊 Weekly Summary',
      message: `Great week! ${stats.jobsCompleted} jobs completed, $${stats.earnings.toFixed(2)} earned, ${stats.avgRating.toFixed(1)}⭐ avg rating.`,
      actionLabel: 'View Analytics',
      actionUrl: '/CleanerDashboard',
      timestamp: new Date(),
      read: false
    };
  }
  
  // Mark notification as read
  markAsRead(notificationId: string) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
    }
  }
  
  // Get all notifications
  getAll(): Notification[] {
    return this.notifications.sort((a, b) => 
      b.timestamp.getTime() - a.timestamp.getTime()
    );
  }
  
  // Get unread count
  getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }
  
  // Clear old notifications
  clearOld(daysOld: number = 7) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - daysOld);
    
    this.notifications = this.notifications.filter(
      n => n.timestamp >= cutoff || !n.read
    );
  }
}

// Singleton instance
export const notificationService = new ProactiveNotificationService();

// React Hook for notifications
export function useNotifications() {
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = React.useState(0);
  
  React.useEffect(() => {
    // Load initial notifications
    setNotifications(notificationService.getAll());
    setUnreadCount(notificationService.getUnreadCount());
    
    // Subscribe to new notifications
    const unsubscribe = notificationService.subscribe((notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    });
    
    return unsubscribe;
  }, []);
  
  const markAsRead = (notificationId: string) => {
    notificationService.markAsRead(notificationId);
    setNotifications(notificationService.getAll());
    setUnreadCount(notificationService.getUnreadCount());
  };
  
  const clearOld = () => {
    notificationService.clearOld();
    setNotifications(notificationService.getAll());
  };
  
  return {
    notifications,
    unreadCount,
    markAsRead,
    clearOld
  };
}

