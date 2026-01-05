// Real-Time Notification Service
// Instant notification delivery via WebSocket or Server-Sent Events (SSE)

import { base44 } from '@/api/base44Client';

/**
 * Real-Time Notification Service
 * Replaces 30-second polling with instant WebSocket delivery
 * 
 * Features:
 * - <1 second latency
 * - Automatic reconnection
 * - Heartbeat monitoring
 * - Fallback to polling if WebSocket unavailable
 * 
 * Architecture Options:
 * 1. Base44 Real-time (if available)
 * 2. WebSocket (custom)
 * 3. Server-Sent Events (SSE)
 * 4. Fallback to polling (current)
 */

export type NotificationCallback = (notification: any) => void;
export type ConnectionStatusCallback = (status: 'connected' | 'disconnected' | 'connecting' | 'error') => void;

interface RealTimeConfig {
  autoReconnect?: boolean;
  reconnectInterval?: number;
  heartbeatInterval?: number;
  maxReconnectAttempts?: number;
}

export class RealTimeNotificationService {
  private ws: WebSocket | null = null;
  private eventSource: EventSource | null = null;
  private pollingInterval: NodeJS.Timeout | null = null;
  
  private mode: 'websocket' | 'sse' | 'polling' = 'polling';
  private connected: boolean = false;
  private reconnectAttempts: number = 0;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private heartbeatTimeout: NodeJS.Timeout | null = null;
  
  private notificationCallbacks: NotificationCallback[] = [];
  private statusCallbacks: ConnectionStatusCallback[] = [];
  
  private config: Required<RealTimeConfig> = {
    autoReconnect: true,
    reconnectInterval: 3000,
    heartbeatInterval: 30000,
    maxReconnectAttempts: 10
  };

  private userEmail: string | null = null;

  constructor(config?: RealTimeConfig) {
    if (config) {
      this.config = { ...this.config, ...config };
    }
  }

  /**
   * Connect to real-time notification service
   */
  async connect(userEmail: string): Promise<boolean> {
    this.userEmail = userEmail;
    this.updateStatus('connecting');

    console.log('[RealTimeNotificationService] Connecting for user:', userEmail);

    // Try WebSocket first
    if (await this.tryWebSocket()) {
      return true;
    }

    // Fall back to Server-Sent Events
    if (await this.trySSE()) {
      return true;
    }

    // Fall back to polling
    console.log('[RealTimeNotificationService] Falling back to polling mode');
    this.startPolling();
    return true;
  }

  /**
   * Disconnect from real-time service
   */
  disconnect() {
    console.log('[RealTimeNotificationService] Disconnecting...');

    this.connected = false;
    this.updateStatus('disconnected');

    // Clear reconnect timeout
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    // Clear heartbeat
    if (this.heartbeatTimeout) {
      clearTimeout(this.heartbeatTimeout);
      this.heartbeatTimeout = null;
    }

    // Close WebSocket
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    // Close SSE
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }

    // Stop polling
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  /**
   * Subscribe to notifications
   */
  subscribe(callback: NotificationCallback): () => void {
    this.notificationCallbacks.push(callback);
    
    return () => {
      this.notificationCallbacks = this.notificationCallbacks.filter(cb => cb !== callback);
    };
  }

  /**
   * Subscribe to connection status changes
   */
  onStatusChange(callback: ConnectionStatusCallback): () => void {
    this.statusCallbacks.push(callback);
    
    return () => {
      this.statusCallbacks = this.statusCallbacks.filter(cb => cb !== callback);
    };
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.connected;
  }

  /**
   * Get current connection mode
   */
  getMode(): 'websocket' | 'sse' | 'polling' {
    return this.mode;
  }

  // ============================================================================
  // WEBSOCKET IMPLEMENTATION
  // ============================================================================

  private async tryWebSocket(): Promise<boolean> {
    // Check if WebSocket is supported
    if (typeof WebSocket === 'undefined') {
      console.log('[RealTimeNotificationService] WebSocket not supported');
      return false;
    }

    try {
      // Determine WebSocket URL
      const wsUrl = this.getWebSocketURL();
      
      if (!wsUrl) {
        console.log('[RealTimeNotificationService] WebSocket URL not configured');
        return false;
      }

      console.log('[RealTimeNotificationService] Connecting to WebSocket:', wsUrl);

      this.ws = new WebSocket(wsUrl);

      // Set up event handlers
      return new Promise((resolve) => {
        if (!this.ws) {
          resolve(false);
          return;
        }

        // Connection opened
        this.ws.onopen = () => {
          console.log('[RealTimeNotificationService] WebSocket connected');
          this.mode = 'websocket';
          this.connected = true;
          this.reconnectAttempts = 0;
          this.updateStatus('connected');
          this.startHeartbeat();
          
          // Send authentication
          this.ws?.send(JSON.stringify({
            type: 'auth',
            userEmail: this.userEmail
          }));
          
          resolve(true);
        };

        // Message received
        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            if (data.type === 'notification') {
              this.handleNotification(data.payload);
            } else if (data.type === 'pong') {
              // Heartbeat response
              console.log('[RealTimeNotificationService] Heartbeat OK');
            }
          } catch (error) {
            console.error('[RealTimeNotificationService] Message parse error:', error);
          }
        };

        // Connection closed
        this.ws.onclose = () => {
          console.log('[RealTimeNotificationService] WebSocket disconnected');
          this.connected = false;
          this.updateStatus('disconnected');
          
          if (this.config.autoReconnect && this.reconnectAttempts < this.config.maxReconnectAttempts) {
            this.scheduleReconnect();
          }
        };

        // Connection error
        this.ws.onerror = (error) => {
          console.error('[RealTimeNotificationService] WebSocket error:', error);
          this.updateStatus('error');
          resolve(false);
        };

        // Timeout if connection doesn't open in 5 seconds
        setTimeout(() => {
          if (!this.connected) {
            console.log('[RealTimeNotificationService] WebSocket connection timeout');
            this.ws?.close();
            resolve(false);
          }
        }, 5000);
      });
    } catch (error) {
      console.error('[RealTimeNotificationService] WebSocket connection error:', error);
      return false;
    }
  }

  /**
   * Get WebSocket URL
   * This would typically come from environment variables or Base44 config
   */
  private getWebSocketURL(): string | null {
    // Check if Base44 provides WebSocket URL
    const base44WsUrl = (base44 as any).realtime?.websocketUrl;
    if (base44WsUrl) {
      return base44WsUrl;
    }

    // Check environment variable
    const envWsUrl = import.meta.env.VITE_WEBSOCKET_URL;
    if (envWsUrl) {
      return envWsUrl;
    }

    // Default: construct from current URL
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    
    // This assumes you have a WebSocket server at /ws
    // You may need to adjust this based on your backend setup
    return `${protocol}//${host}/ws`;
  }

  /**
   * Start heartbeat to keep connection alive
   */
  private startHeartbeat() {
    if (this.heartbeatTimeout) {
      clearTimeout(this.heartbeatTimeout);
    }

    this.heartbeatTimeout = setTimeout(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
        this.startHeartbeat(); // Schedule next heartbeat
      }
    }, this.config.heartbeatInterval);
  }

  // ============================================================================
  // SERVER-SENT EVENTS (SSE) IMPLEMENTATION
  // ============================================================================

  private async trySSE(): Promise<boolean> {
    // Check if EventSource is supported
    if (typeof EventSource === 'undefined') {
      console.log('[RealTimeNotificationService] SSE not supported');
      return false;
    }

    try {
      // Determine SSE URL
      const sseUrl = this.getSSEURL();
      
      if (!sseUrl) {
        console.log('[RealTimeNotificationService] SSE URL not configured');
        return false;
      }

      console.log('[RealTimeNotificationService] Connecting to SSE:', sseUrl);

      this.eventSource = new EventSource(sseUrl);

      // Set up event handlers
      return new Promise((resolve) => {
        if (!this.eventSource) {
          resolve(false);
          return;
        }

        // Connection opened
        this.eventSource.onopen = () => {
          console.log('[RealTimeNotificationService] SSE connected');
          this.mode = 'sse';
          this.connected = true;
          this.reconnectAttempts = 0;
          this.updateStatus('connected');
          resolve(true);
        };

        // Message received
        this.eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.handleNotification(data);
          } catch (error) {
            console.error('[RealTimeNotificationService] SSE message parse error:', error);
          }
        };

        // Connection error
        this.eventSource.onerror = (error) => {
          console.error('[RealTimeNotificationService] SSE error:', error);
          this.connected = false;
          this.updateStatus('error');
          
          if (this.config.autoReconnect && this.reconnectAttempts < this.config.maxReconnectAttempts) {
            this.scheduleReconnect();
          }
          
          resolve(false);
        };

        // Timeout if connection doesn't open in 5 seconds
        setTimeout(() => {
          if (!this.connected) {
            console.log('[RealTimeNotificationService] SSE connection timeout');
            this.eventSource?.close();
            resolve(false);
          }
        }, 5000);
      });
    } catch (error) {
      console.error('[RealTimeNotificationService] SSE connection error:', error);
      return false;
    }
  }

  /**
   * Get SSE URL
   */
  private getSSEURL(): string | null {
    // Check if Base44 provides SSE URL
    const base44SseUrl = (base44 as any).realtime?.sseUrl;
    if (base44SseUrl) {
      return `${base44SseUrl}?user=${encodeURIComponent(this.userEmail || '')}`;
    }

    // Check environment variable
    const envSseUrl = import.meta.env.VITE_SSE_URL;
    if (envSseUrl) {
      return `${envSseUrl}?user=${encodeURIComponent(this.userEmail || '')}`;
    }

    // Default: construct from current URL
    return `/api/notifications/stream?user=${encodeURIComponent(this.userEmail || '')}`;
  }

  // ============================================================================
  // POLLING FALLBACK
  // ============================================================================

  private startPolling() {
    console.log('[RealTimeNotificationService] Starting polling mode (30s interval)');
    
    this.mode = 'polling';
    this.connected = true;
    this.updateStatus('connected');

    // Initial fetch
    this.pollNotifications();

    // Set up polling interval (30 seconds)
    this.pollingInterval = setInterval(() => {
      this.pollNotifications();
    }, 30000);
  }

  private async pollNotifications() {
    if (!this.userEmail) return;

    try {
      // Fetch latest notifications
      const notifications = await base44.entities.Notification?.filter(
        { recipient_email: this.userEmail, is_read: false },
        '-created_date',
        10
      ).catch(() => []);

      if (notifications && notifications.length > 0) {
        console.log(`[RealTimeNotificationService] Polled ${notifications.length} new notifications`);
        
        notifications.forEach((notification: any) => {  // TODO: Add proper notification type
          this.handleNotification(notification);
        });
      }
    } catch (error) {
      console.error('[RealTimeNotificationService] Polling error:', error);
    }
  }

  // ============================================================================
  // RECONNECTION LOGIC
  // ============================================================================

  private scheduleReconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    this.reconnectAttempts++;
    const delay = Math.min(this.config.reconnectInterval * this.reconnectAttempts, 30000);

    console.log(`[RealTimeNotificationService] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.config.maxReconnectAttempts})`);

    this.reconnectTimeout = setTimeout(() => {
      if (this.userEmail) {
        this.connect(this.userEmail);
      }
    }, delay);
  }

  // ============================================================================
  // NOTIFICATION HANDLING
  // ============================================================================

  private handleNotification(notification: any) {
    console.log('[RealTimeNotificationService] Notification received:', notification);
    
    // Call all subscribed callbacks
    this.notificationCallbacks.forEach(callback => {
      try {
        callback(notification);
      } catch (error) {
        console.error('[RealTimeNotificationService] Callback error:', error);
      }
    });
  }

  private updateStatus(status: 'connected' | 'disconnected' | 'connecting' | 'error') {
    console.log(`[RealTimeNotificationService] Status: ${status}`);
    
    // Call all status callbacks
    this.statusCallbacks.forEach(callback => {
      try {
        callback(status);
      } catch (error) {
        console.error('[RealTimeNotificationService] Status callback error:', error);
      }
    });
  }
}

// Singleton instance
export const realTimeNotificationService = new RealTimeNotificationService();

// Export default
export default realTimeNotificationService;

