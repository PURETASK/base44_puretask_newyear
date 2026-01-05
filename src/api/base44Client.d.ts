/**
 * Type Definitions for Base44 SDK
 * 
 * Provides TypeScript definitions for the Base44 client to enable
 * type checking and autocomplete when using the SDK.
 */

import { AxiosInstance } from 'axios';

// ============================================================================
// BASE ENTITY TYPES
// ============================================================================

export interface Base44Entity {
  id: string;
  created_at: string;
  updated_at: string;
  [key: string]: any;
}

export interface Base44QueryParams {
  filter?: Record<string, any>;
  sort?: string;
  limit?: number;
  offset?: number;
  expand?: string[];
}

export interface Base44ListResponse<T = Base44Entity> {
  results: T[];
  count: number;
  next?: string;
  previous?: string;
}

// ============================================================================
// AUTH METHODS
// ============================================================================

export interface Base44AuthMethods {
  /**
   * Get the currently authenticated user
   */
  me(): Promise<Base44Entity>;
  
  /**
   * Login with email and password
   */
  login(email: string, password: string): Promise<{
    token: string;
    user: Base44Entity;
  }>;
  
  /**
   * Logout the current user
   */
  logout(): Promise<void>;
  
  /**
   * Register a new user
   */
  register(data: {
    email: string;
    password: string;
    [key: string]: any;
  }): Promise<Base44Entity>;
  
  /**
   * Request password reset
   */
  resetPassword(email: string): Promise<void>;
  
  /**
   * Confirm password reset with token
   */
  confirmPasswordReset(token: string, newPassword: string): Promise<void>;
}

// ============================================================================
// ENTITY METHODS
// ============================================================================

export interface Base44EntityMethods {
  /**
   * List entities with optional filtering and pagination
   */
  list<T = Base44Entity>(
    entityName: string,
    params?: Base44QueryParams
  ): Promise<Base44ListResponse<T>>;
  
  /**
   * Get a single entity by ID
   */
  get<T = Base44Entity>(
    entityName: string,
    id: string
  ): Promise<T>;
  
  /**
   * Create a new entity
   */
  create<T = Base44Entity>(
    entityName: string,
    data: Partial<T>
  ): Promise<T>;
  
  /**
   * Update an existing entity
   */
  update<T = Base44Entity>(
    entityName: string,
    id: string,
    data: Partial<T>
  ): Promise<T>;
  
  /**
   * Delete an entity
   */
  delete(entityName: string, id: string): Promise<void>;
  
  /**
   * Batch operations
   */
  batchCreate<T = Base44Entity>(
    entityName: string,
    data: Partial<T>[]
  ): Promise<T[]>;
  
  batchUpdate<T = Base44Entity>(
    entityName: string,
    updates: Array<{ id: string; data: Partial<T> }>
  ): Promise<T[]>;
  
  batchDelete(
    entityName: string,
    ids: string[]
  ): Promise<void>;
  
  // Common entity types for autocomplete
  PushSubscription: Base44EntityMethods;
  Notification: Base44EntityMethods;
  User: Base44EntityMethods;
  Booking: Base44EntityMethods;
  [entityName: string]: any; // Allow any entity name
}

// ============================================================================
// INTEGRATION TYPES
// ============================================================================

export interface Base44EmailParams {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: Array<{
    filename: string;
    content: string | Buffer;
    contentType?: string;
  }>;
}

export interface Base44Integration {
  Core: {
    SendEmail: {
      /**
       * Send an email via the integration
       */
      send(params: Base44EmailParams): Promise<{
        success: boolean;
        messageId?: string;
      }>;
    };
    InvokeServerlessFunction: {
      /**
       * Invoke a serverless function
       */
      invoke(functionName: string, params: any): Promise<any>;
    };
  };
}

// ============================================================================
// FILE UPLOAD TYPES
// ============================================================================

export interface Base44UploadMethods {
  /**
   * Upload a file
   */
  upload(file: File, options?: {
    folder?: string;
    public?: boolean;
    metadata?: Record<string, any>;
  }): Promise<{
    id: string;
    url: string;
    filename: string;
    size: number;
    contentType: string;
  }>;
  
  /**
   * Delete a file
   */
  delete(fileId: string): Promise<void>;
}

// ============================================================================
// REALTIME TYPES
// ============================================================================

export interface Base44RealtimeMethods {
  /**
   * Subscribe to entity changes
   */
  subscribe(
    entityName: string,
    callback: (event: {
      type: 'create' | 'update' | 'delete';
      data: Base44Entity;
    }) => void
  ): () => void;
  
  /**
   * Unsubscribe from entity changes
   */
  unsubscribe(entityName: string): void;
}

// ============================================================================
// MAIN CLIENT INTERFACE
// ============================================================================

export interface Base44Client {
  /**
   * Authentication methods
   */
  auth: Base44AuthMethods;
  
  /**
   * Entity CRUD operations
   */
  entities: Base44EntityMethods;
  
  /**
   * Third-party integrations
   */
  integrations: Base44Integration;
  
  /**
   * File upload methods
   */
  files: Base44UploadMethods;
  
  /**
   * Realtime subscriptions
   */
  realtime: Base44RealtimeMethods;
  
  /**
   * Raw Axios instance for custom requests
   */
  axios: AxiosInstance;
  
  /**
   * Get the current API base URL
   */
  getBaseURL(): string;
  
  /**
   * Set the authentication token
   */
  setToken(token: string): void;
  
  /**
   * Clear the authentication token
   */
  clearToken(): void;
  
  /**
   * Create a client instance with service role (admin) privileges
   */
  asServiceRole(): Base44Client;
}

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

declare const base44: Base44Client;
export default base44;
