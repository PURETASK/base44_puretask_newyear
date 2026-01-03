/**
 * TypeScript type definitions for PureTask
 * Use with JSDoc for type checking in JavaScript files
 */

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} email
 * @property {string} [name]
 * @property {('client'|'cleaner'|'admin'|'agent')} [user_type]
 * @property {('admin'|'user')} [role]
 * @property {string} [phone]
 * @property {Date} created_at
 * @property {Date} updated_at
 */

/**
 * @typedef {Object} CleanerProfile
 * @property {string} id
 * @property {string} user_email
 * @property {string} full_name
 * @property {string} [phone]
 * @property {string} [bio]
 * @property {number} hourly_rate
 * @property {('bronze'|'silver'|'gold'|'platinum')} tier
 * @property {number} reliability_score
 * @property {number} total_jobs
 * @property {number} [rating]
 * @property {boolean} is_verified
 * @property {boolean} is_active
 * @property {string[]} [service_areas]
 * @property {string[]} [skills]
 * @property {number} payout_percentage
 * @property {Object} [communication_settings]
 * @property {Date} created_at
 * @property {Date} updated_at
 */

/**
 * @typedef {Object} ClientProfile
 * @property {string} id
 * @property {string} user_email
 * @property {string} full_name
 * @property {string} [phone]
 * @property {string} [address]
 * @property {number} [latitude]
 * @property {number} [longitude]
 * @property {number} credit_balance
 * @property {number} total_bookings
 * @property {string[]} [favorite_cleaners]
 * @property {Date} created_at
 * @property {Date} updated_at
 */

/**
 * @typedef {Object} Booking
 * @property {string} id
 * @property {string} client_email
 * @property {string} [cleaner_email]
 * @property {('pending'|'awaiting_cleaner_response'|'accepted'|'scheduled'|'in_progress'|'completed'|'approved'|'cancelled'|'disputed')} status
 * @property {string} address
 * @property {number} latitude
 * @property {number} longitude
 * @property {string} date
 * @property {string} time
 * @property {number} hours
 * @property {('basic'|'deep'|'move')} service_type
 * @property {number} bedrooms
 * @property {number} bathrooms
 * @property {number} [square_feet]
 * @property {number} base_price
 * @property {number} total_price
 * @property {string} [special_instructions]
 * @property {string[]} [add_ons]
 * @property {boolean} [recurring]
 * @property {string} [recurring_schedule]
 * @property {Object} [before_photos]
 * @property {Object} [after_photos]
 * @property {Date} [check_in_time]
 * @property {Date} [check_out_time]
 * @property {Date} created_at
 * @property {Date} updated_at
 */

/**
 * @typedef {Object} Message
 * @property {string} id
 * @property {string} sender_email
 * @property {string} receiver_email
 * @property {string} [thread_id]
 * @property {string} content
 * @property {('sent'|'delivered'|'read')} status
 * @property {boolean} is_automated
 * @property {Date} created_at
 */

/**
 * @typedef {Object} Notification
 * @property {string} id
 * @property {string} user_email
 * @property {('info'|'success'|'warning'|'error')} type
 * @property {string} title
 * @property {string} message
 * @property {boolean} is_read
 * @property {string} [action_url]
 * @property {Date} created_at
 */

/**
 * @typedef {Object} Payment
 * @property {string} id
 * @property {string} booking_id
 * @property {string} client_email
 * @property {number} amount
 * @property {('pending'|'processing'|'succeeded'|'failed'|'refunded')} status
 * @property {string} stripe_payment_intent_id
 * @property {Date} created_at
 */

/**
 * @typedef {Object} Payout
 * @property {string} id
 * @property {string} cleaner_email
 * @property {number} amount
 * @property {('pending'|'processing'|'completed'|'failed')} status
 * @property {string} [booking_id]
 * @property {Date} payout_date
 * @property {Date} created_at
 */

/**
 * @typedef {Object} Review
 * @property {string} id
 * @property {string} booking_id
 * @property {string} reviewer_email
 * @property {string} reviewed_email
 * @property {number} rating
 * @property {string} [comment]
 * @property {('client'|'cleaner')} reviewer_type
 * @property {Date} created_at
 */

/**
 * @typedef {Object} Dispute
 * @property {string} id
 * @property {string} booking_id
 * @property {string} initiator_email
 * @property {('open'|'investigating'|'resolved'|'closed')} status
 * @property {string} reason
 * @property {string} description
 * @property {string} [resolution]
 * @property {Date} created_at
 * @property {Date} [resolved_at]
 */

/**
 * @typedef {Object} CreditTransaction
 * @property {string} id
 * @property {string} user_email
 * @property {('credit'|'debit')} type
 * @property {number} amount
 * @property {string} reason
 * @property {string} [booking_id]
 * @property {Date} created_at
 */

/**
 * @typedef {Object} RiskFlag
 * @property {string} id
 * @property {string} user_email
 * @property {('low'|'medium'|'high'|'critical')} severity
 * @property {string} reason
 * @property {('active'|'resolved'|'dismissed')} status
 * @property {Date} created_at
 */

/**
 * @typedef {Object} AnalyticsEvent
 * @property {string} id
 * @property {string} event_name
 * @property {string} [user_email]
 * @property {Object} properties
 * @property {Date} created_at
 */

/**
 * @typedef {Object} FeatureFlag
 * @property {string} id
 * @property {string} name
 * @property {boolean} enabled
 * @property {string} [description]
 * @property {Object} [config]
 * @property {Date} updated_at
 */

/**
 * Component Props Types
 */

/**
 * @typedef {Object} ButtonProps
 * @property {('default'|'destructive'|'outline'|'secondary'|'ghost'|'link')} [variant]
 * @property {('default'|'sm'|'lg'|'icon')} [size]
 * @property {React.ReactNode} children
 * @property {Function} [onClick]
 * @property {boolean} [disabled]
 * @property {string} [className]
 */

/**
 * @typedef {Object} CardProps
 * @property {React.ReactNode} children
 * @property {string} [className]
 */

/**
 * Hook Return Types
 */

/**
 * @typedef {Object} UseAuthReturn
 * @property {User|null} user
 * @property {Object|null} profile
 * @property {boolean} loading
 * @property {Function} refetch
 */

/**
 * @typedef {Object} UseDataReturn
 * @property {*} data
 * @property {boolean} loading
 * @property {Error|null} error
 * @property {Function} refetch
 */

/**
 * @typedef {Object} RateLimitResult
 * @property {boolean} allowed
 * @property {number} remaining
 * @property {number} resetAt
 * @property {number} [retryAfter]
 */

/**
 * Utility Types
 */

/**
 * @typedef {Object} CacheOptions
 * @property {number} [ttl] - Time to live in milliseconds
 */

/**
 * @typedef {Object} ErrorHandlerOptions
 * @property {string} [userMessage]
 * @property {boolean} [showToast]
 * @property {boolean} [logToConsole]
 * @property {Object} [context]
 * @property {('error'|'warning'|'info')} [severity]
 */

/**
 * @typedef {Object} QueryOptions
 * @property {boolean} [enabled]
 * @property {number|false} [refetchInterval]
 * @property {number} [cacheTime]
 * @property {Function} [onError]
 * @property {Function} [onSuccess]
 */

/**
 * API Response Types
 */

/**
 * @typedef {Object} ApiResponse<T>
 * @template T
 * @property {T} data
 * @property {boolean} success
 * @property {string} [message]
 */

/**
 * @typedef {Object} ApiError
 * @property {number} status
 * @property {string} message
 * @property {Object} [data]
 */

/**
 * Form Types
 */

/**
 * @typedef {Object} BookingFormData
 * @property {string} address
 * @property {number} latitude
 * @property {number} longitude
 * @property {string} serviceType
 * @property {string} bedrooms
 * @property {string} bathrooms
 * @property {number} squareFeet
 * @property {number} recommendedHours
 * @property {string} date
 * @property {string} time
 * @property {string} [specialInstructions]
 * @property {string[]} [addOns]
 */

/**
 * @typedef {Object} ProfileFormData
 * @property {string} full_name
 * @property {string} [phone]
 * @property {string} [bio]
 * @property {number} [hourly_rate]
 * @property {string[]} [service_areas]
 * @property {string[]} [skills]
 */

// Export empty object for module
export {};

