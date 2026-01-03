# 🚀 PURETASK IMPLEMENTATION GUIDE & BLUEPRINT

**Version:** 1.0  
**Date:** January 2, 2026  
**Purpose:** Complete step-by-step guide to building and deploying PureTask  
**Audience:** Development team, technical leads, DevOps engineers

---

## 📋 Table of Contents

1. [Executive Overview](#executive-overview)
2. [System Architecture](#system-architecture)
3. [Technology Stack](#technology-stack)
4. [Development Environment Setup](#development-environment-setup)
5. [Database Schema Implementation](#database-schema-implementation)
6. [Backend API Implementation](#backend-api-implementation)
7. [Frontend Implementation](#frontend-implementation)
8. [Third-Party Integrations](#third-party-integrations)
9. [Authentication & Authorization](#authentication--authorization)
10. [Core Feature Implementation](#core-feature-implementation)
11. [Testing Implementation](#testing-implementation)
12. [Deployment Strategy](#deployment-strategy)
13. [Monitoring & Maintenance](#monitoring--maintenance)
14. [Performance Optimization](#performance-optimization)
15. [Security Implementation](#security-implementation)
16. [18-Month Roadmap](#18-month-roadmap)

---

## 🎯 EXECUTIVE OVERVIEW

### **What We're Building**

PureTask is a two-sided marketplace connecting clients with professional cleaners through a sophisticated trust-based platform featuring:

- **Smart Matching Algorithm** (20% reliability weight)
- **Auto-Approval System** (18-hour window)
- **Flexible Payout Options** (10% instant cash-out fee)
- **Pet Fee System** ($30 flat fee)
- **Tier-Based Reliability Scoring**
- **GPS & Photo Verification**
- **Credit-Based Payment System**

### **Key Metrics**

```
Platform Scale:
├─ Launch Target: 1,000 cleaners, 5,000 clients
├─ Year 1 Goal: 5,000 cleaners, 25,000 clients
├─ Transaction Volume: $5M+ GMV in Year 1
└─ Performance: < 2s page load, 99.9% uptime

Development Timeline:
├─ MVP: 12 weeks
├─ Beta Launch: 16 weeks
├─ Public Launch: 20 weeks
└─ Full Feature Set: 24 weeks (6 months)
```

---

## 🏗️ SYSTEM ARCHITECTURE

### **High-Level Architecture**

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│  Web App (React)  │  Mobile App (React Native)  │  Admin Panel  │
└─────────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       API GATEWAY LAYER                          │
├─────────────────────────────────────────────────────────────────┤
│  Load Balancer (Nginx)  │  Rate Limiting  │  API Versioning     │
└─────────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER (Base44)                    │
├─────────────────────────────────────────────────────────────────┤
│  Authentication  │  Authorization  │  Business Logic             │
│  Serverless Functions  │  Webhooks  │  Cron Jobs                │
└─────────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATA LAYER (Base44)                         │
├─────────────────────────────────────────────────────────────────┤
│  MongoDB (Primary)  │  Redis (Cache)  │  S3 (File Storage)      │
└─────────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  EXTERNAL SERVICES LAYER                         │
├─────────────────────────────────────────────────────────────────┤
│  Stripe (Payments)  │  Twilio (SMS)  │  SendGrid (Email)        │
│  Google Maps (Geo)  │  Checkr (Background)  │  Sentry (Errors)  │
└─────────────────────────────────────────────────────────────────┘
```

---

### **Microservices Architecture**

```
PureTask Platform
│
├─── 🌐 WEB CLIENT (React + Vite)
│    ├─ Pages: Home, Browse, Dashboard, Profile, etc.
│    ├─ Components: Reusable UI components
│    ├─ State: React Query + Context API
│    └─ Routing: React Router
│
├─── 📱 MOBILE CLIENT (React Native) [Future]
│    ├─ iOS App
│    ├─ Android App
│    └─ Shared Components
│
├─── 🔧 BACKEND (Base44 BaaS)
│    │
│    ├─── 📊 ENTITIES (Data Models)
│    │    ├─ User, ClientProfile, CleanerProfile
│    │    ├─ Booking, Review, Credit, Payout
│    │    ├─ Dispute, Message, Notification
│    │    └─ 50+ other entities
│    │
│    ├─── ⚡ FUNCTIONS (Serverless)
│    │    ├─ Booking Automations
│    │    ├─ Payment Processing
│    │    ├─ Payout Management (10% instant fee)
│    │    ├─ Auto-Approval (18hr window)
│    │    ├─ Smart Matching (20% reliability)
│    │    ├─ Notification System
│    │    └─ Analytics & Reporting
│    │
│    ├─── 🔐 AUTHENTICATION
│    │    ├─ Email/Password
│    │    ├─ Social Login (Google, Apple)
│    │    ├─ JWT Tokens
│    │    └─ Role-Based Access Control
│    │
│    └─── ⏰ CRON JOBS
│         ├─ Auto-Approval Check (every 5 min)
│         ├─ Payout Batching (Fridays)
│         ├─ Reliability Score Updates (daily)
│         ├─ Reminder Notifications
│         └─ Analytics Aggregation
│
├─── 💾 DATABASE (MongoDB via Base44)
│    ├─ Collections (50+ entities)
│    ├─ Indexes for performance
│    └─ Backups (automated)
│
├─── 🗄️ CACHE (Redis via Base44)
│    ├─ User sessions
│    ├─ Smart matching results
│    ├─ Dashboard data
│    └─ API response cache
│
├─── 📦 FILE STORAGE (S3-compatible)
│    ├─ Profile photos
│    ├─ Before/after cleaning photos
│    ├─ ID verification documents
│    └─ Receipts & invoices
│
└─── 🔌 EXTERNAL INTEGRATIONS
     ├─ Stripe (Payments & Payouts)
     ├─ Twilio (SMS notifications)
     ├─ SendGrid (Email)
     ├─ Google Maps (Geocoding, distance)
     ├─ Checkr (Background checks)
     └─ Sentry (Error tracking)
```

---

## 🛠️ TECHNOLOGY STACK

### **Frontend Stack**

```javascript
{
  "framework": "React 18",
  "build": "Vite 5",
  "routing": "React Router 6",
  "state": "React Query + Context API",
  "ui": {
    "components": "shadcn/ui + Radix UI",
    "styling": "Tailwind CSS 3",
    "icons": "Lucide React",
    "animations": "Framer Motion"
  },
  "forms": "React Hook Form + Zod validation",
  "maps": "Google Maps JavaScript API",
  "payments": "Stripe Elements",
  "analytics": "Custom analytics service",
  "testing": {
    "unit": "Vitest",
    "component": "@testing-library/react",
    "e2e": "Playwright"
  }
}
```

### **Backend Stack (Base44)**

```javascript
{
  "platform": "Base44 BaaS",
  "database": "MongoDB (managed by Base44)",
  "cache": "Redis (managed by Base44)",
  "functions": "Serverless (Node.js runtime)",
  "auth": "Base44 Auth (JWT-based)",
  "storage": "S3-compatible (managed by Base44)",
  "cron": "Base44 Scheduled Functions"
}
```

### **Third-Party Services**

```javascript
{
  "payments": "Stripe Connect",
  "sms": "Twilio",
  "email": "SendGrid",
  "maps": "Google Maps Platform",
  "geocoding": "Google Geocoding API",
  "distance": "Google Distance Matrix API",
  "backgroundChecks": "Checkr API",
  "errorTracking": "Sentry",
  "cdn": "Cloudflare",
  "monitoring": "Datadog"
}
```

---

## 💻 DEVELOPMENT ENVIRONMENT SETUP

### **Prerequisites**

```bash
# Required Software
Node.js >= 18.x
npm >= 9.x
Git >= 2.x
VS Code (recommended)

# Optional but Recommended
Docker Desktop (for local services)
Postman (for API testing)
MongoDB Compass (for database browsing)
```

### **Step 1: Clone Repository**

```bash
# Clone the repo
git clone https://github.com/PURETASK/base44_puretask_newyear.git
cd base44_puretask_newyear

# Install dependencies
npm install
```

### **Step 2: Environment Configuration**

Create `.env.local` file:

```env
# Base44 Configuration
VITE_BASE44_APP_ID=58859759
VITE_BASE44_APP_BASE_URL=https://pure-task-58859759.base44.app

# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Google Maps Configuration
VITE_GOOGLE_MAPS_API_KEY=AIzaSyXXXXX

# Twilio Configuration (Backend)
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=xxxxx
TWILIO_PHONE_NUMBER=+1234567890

# SendGrid Configuration (Backend)
SENDGRID_API_KEY=SG.xxxxx
SENDGRID_FROM_EMAIL=noreply@puretask.com

# Checkr Configuration (Backend)
CHECKR_API_KEY=xxxxx
CHECKR_WEBHOOK_SECRET=xxxxx

# Sentry Configuration
VITE_SENTRY_DSN=https://xxxxx@sentry.io/xxxxx

# Environment
NODE_ENV=development
VITE_APP_URL=http://localhost:5173
```

### **Step 3: Run Development Server**

```bash
# Start dev server
npm run dev

# Access application
# Frontend: http://localhost:5173
# Base44 Backend: https://pure-task-58859759.base44.app
```

### **Step 4: Base44 Dashboard Access**

```
1. Go to https://base44.app
2. Log in with your account
3. Navigate to your app (ID: 58859759)
4. Access:
   - Entities (Database tables)
   - Functions (Serverless code)
   - Cron Jobs (Scheduled tasks)
   - Settings (Configuration)
```

---

## 🗄️ DATABASE SCHEMA IMPLEMENTATION

### **Phase 1: Core Entities**

#### **1. User Authentication (Base44 Built-in)**

```javascript
// Base44 handles this automatically
// Fields: email, password_hash, user_type, role, created_at
```

#### **2. ClientProfile Entity**

```javascript
// In Base44 Dashboard → Entities → Create New

{
  "name": "ClientProfile",
  "fields": [
    { "name": "user_email", "type": "string", "required": true, "unique": true },
    { "name": "full_name", "type": "string", "required": true },
    { "name": "phone", "type": "string", "required": true },
    { "name": "profile_photo_url", "type": "string" },
    
    // Address
    { "name": "default_address", "type": "string" },
    { "name": "latitude", "type": "number" },
    { "name": "longitude", "type": "number" },
    
    // Preferences
    { "name": "preferred_specialty_tags", "type": "array" },
    { "name": "preferred_product_type", "type": "string" },
    { "name": "has_pets", "type": "boolean", "default": false },
    { "name": "pet_types", "type": "array" }, // ["dog", "cat"]
    { "name": "parking_instructions", "type": "string" },
    { "name": "entry_instructions", "type": "string" },
    { "name": "product_allergies", "type": "string" },
    
    // Credits
    { "name": "credit_balance", "type": "number", "default": 0 },
    { "name": "total_credits_purchased", "type": "number", "default": 0 },
    { "name": "total_credits_spent", "type": "number", "default": 0 },
    
    // History
    { "name": "total_bookings", "type": "number", "default": 0 },
    { "name": "last_booked_cleaner", "type": "string" },
    
    // Membership
    { "name": "membership_tier", "type": "string", "default": "basic" },
    { "name": "membership_status", "type": "string", "default": "inactive" },
    { "name": "membership_expiry", "type": "date" },
    
    // Loyalty
    { "name": "loyalty_points", "type": "number", "default": 0 },
    
    // Onboarding
    { "name": "onboarding_completed", "type": "boolean", "default": false },
    
    // Auto-refill
    { "name": "auto_refill_enabled", "type": "boolean", "default": false },
    { "name": "auto_refill_threshold", "type": "number", "default": 100 },
    { "name": "auto_refill_amount", "type": "number", "default": 500 },
    { "name": "stripe_payment_method_id", "type": "string" },
    
    // Timestamps
    { "name": "created_at", "type": "date", "default": "now" },
    { "name": "updated_at", "type": "date", "default": "now" }
  ],
  "indexes": [
    { "fields": ["user_email"], "unique": true },
    { "fields": ["phone"], "unique": true },
    { "fields": ["latitude", "longitude"] },
    { "fields": ["membership_tier"] }
  ]
}
```

#### **3. CleanerProfile Entity**

```javascript
{
  "name": "CleanerProfile",
  "fields": [
    { "name": "user_email", "type": "string", "required": true, "unique": true },
    { "name": "full_name", "type": "string", "required": true },
    { "name": "phone", "type": "string", "required": true },
    { "name": "bio", "type": "text" },
    { "name": "profile_photo_url", "type": "string" },
    
    // Location
    { "name": "service_zip_codes", "type": "array" }, // ["90210", "90211"]
    { "name": "latitude", "type": "number" },
    { "name": "longitude", "type": "number" },
    
    // Pricing (in credits)
    { "name": "base_rate_credits_per_hour", "type": "number", "required": true },
    { "name": "deep_addon_credits_per_hour", "type": "number" },
    { "name": "moveout_addon_credits_per_hour", "type": "number" },
    { "name": "additional_service_pricing", "type": "object" }, // { oven: 50, fridge: 50 }
    
    // Tier & Performance
    { "name": "tier", "type": "string", "default": "Developing" }, // Developing | Semi Pro | Pro | Elite
    { "name": "reliability_score", "type": "number", "default": 50 },
    { "name": "total_jobs", "type": "number", "default": 0 },
    { "name": "average_rating", "type": "number", "default": 0 },
    { "name": "total_reviews", "type": "number", "default": 0 },
    
    // Reliability Components
    { "name": "attendance_rate", "type": "number", "default": 100 },
    { "name": "on_time_rate", "type": "number", "default": 100 },
    { "name": "photo_compliance_rate", "type": "number", "default": 100 },
    { "name": "communication_rate", "type": "number", "default": 100 },
    { "name": "completion_confirmation_rate", "type": "number", "default": 100 },
    { "name": "cancellation_rate", "type": "number", "default": 0 },
    { "name": "no_show_rate", "type": "number", "default": 0 },
    { "name": "dispute_rate", "type": "number", "default": 0 },
    
    // Preferences
    { "name": "specialty_tags", "type": "array" }, // ["pets", "eco_friendly", "deep_clean"]
    { "name": "product_preference", "type": "string" }, // "bring_own" | "use_clients" | "either"
    { "name": "brings_own_supplies", "type": "boolean", "default": false },
    { "name": "pet_friendly", "type": "boolean", "default": false },
    
    // Availability
    { "name": "is_active", "type": "boolean", "default": true },
    { "name": "is_accepting_jobs", "type": "boolean", "default": true },
    { "name": "max_jobs_per_week", "type": "number", "default": 20 },
    { "name": "max_jobs_per_day", "type": "number", "default": 3 },
    
    // Payouts
    { "name": "payout_percentage", "type": "number", "default": 0.85 }, // 85%
    { "name": "payout_schedule", "type": "string", "default": "weekly" }, // weekly | daily (Elite only)
    { "name": "bank_account_verified", "type": "boolean", "default": false },
    { "name": "stripe_account_id", "type": "string" },
    
    // Verification
    { "name": "background_check_status", "type": "string", "default": "pending" },
    { "name": "background_check_completed_at", "type": "date" },
    { "name": "identity_verified", "type": "boolean", "default": false },
    { "name": "verified_badge", "type": "boolean", "default": false },
    
    // Timestamps
    { "name": "created_at", "type": "date", "default": "now" },
    { "name": "updated_at", "type": "date", "default": "now" }
  ],
  "indexes": [
    { "fields": ["user_email"], "unique": true },
    { "fields": ["phone"], "unique": true },
    { "fields": ["tier"] },
    { "fields": ["reliability_score"] },
    { "fields": ["latitude", "longitude"] },
    { "fields": ["is_accepting_jobs", "is_active"] }
  ]
}
```

#### **4. Booking Entity**

```javascript
{
  "name": "Booking",
  "fields": [
    // Parties
    { "name": "client_email", "type": "string", "required": true },
    { "name": "cleaner_email", "type": "string", "required": true },
    
    // Booking Details
    { "name": "cleaning_type", "type": "string", "required": true }, // basic | deep | moveout
    { "name": "date", "type": "date", "required": true },
    { "name": "start_time", "type": "string", "required": true },
    { "name": "end_time", "type": "string" },
    { "name": "hours", "type": "number", "required": true },
    
    // Location
    { "name": "address", "type": "string", "required": true },
    { "name": "latitude", "type": "number", "required": true },
    { "name": "longitude", "type": "number", "required": true },
    
    // Home Details
    { "name": "bedrooms", "type": "number" },
    { "name": "bathrooms", "type": "number" },
    { "name": "square_feet", "type": "number" },
    { "name": "home_type", "type": "string" }, // house | apartment | condo | office
    { "name": "has_pets", "type": "boolean", "default": false },
    { "name": "pet_types", "type": "array" },
    
    // Instructions
    { "name": "parking_instructions", "type": "string" },
    { "name": "entry_instructions", "type": "string" },
    { "name": "special_requests", "type": "text" },
    { "name": "product_preferences", "type": "string" },
    { "name": "product_allergies", "type": "string" },
    
    // Additional Services
    { "name": "additional_services", "type": "object" }, // { oven: 1, windows: 2 }
    
    // Pricing
    { "name": "base_rate", "type": "number" },
    { "name": "addon_rate", "type": "number" },
    { "name": "hourly_credits", "type": "number" },
    { "name": "additional_services_credits", "type": "number", "default": 0 },
    { "name": "pet_fee_credits", "type": "number", "default": 0 }, // ⭐ $30 = 300 credits
    { "name": "total_price", "type": "number" },
    { "name": "bundle_discount", "type": "number", "default": 0 },
    { "name": "membership_discount", "type": "number", "default": 0 },
    { "name": "recurring_discount", "type": "number", "default": 0 },
    { "name": "final_price", "type": "number" },
    
    // Status Tracking
    { "name": "status", "type": "string", "default": "created" },
    // Status flow: created → awaiting_cleaner → accepted → scheduled → 
    //              on_the_way → in_progress → completed → awaiting_approval → approved
    { "name": "created_at", "type": "date", "default": "now" },
    { "name": "accepted_at", "type": "date" },
    { "name": "check_in_time", "type": "date" },
    { "name": "check_out_time", "type": "date" },
    { "name": "completed_at", "type": "date" },
    { "name": "approved_at", "type": "date" },
    { "name": "approved_by", "type": "string" }, // "client" | "auto"
    
    // Auto-Approval (18hr window) ⭐
    { "name": "awaiting_approval_since", "type": "date" },
    { "name": "auto_approval_deadline", "type": "date" }, // 18 hours after completion ⭐
    { "name": "auto_approval_paused", "type": "boolean", "default": false },
    { "name": "approval_reminders_sent", "type": "number", "default": 0 },
    
    // GPS Verification
    { "name": "check_in_latitude", "type": "number" },
    { "name": "check_in_longitude", "type": "number" },
    { "name": "check_in_distance_from_address", "type": "number" }, // meters
    { "name": "check_out_latitude", "type": "number" },
    { "name": "check_out_longitude", "type": "number" },
    
    // Photos
    { "name": "before_photo_urls", "type": "array" },
    { "name": "after_photo_urls", "type": "array" },
    
    // Payment
    { "name": "payment_status", "type": "string", "default": "pending" },
    // Status: pending | hold | authorized | charged | refunded
    { "name": "payment_hold_id", "type": "string" },
    { "name": "stripe_charge_id", "type": "string" },
    { "name": "refund_amount", "type": "number", "default": 0 },
    
    // Flags
    { "name": "is_recurring", "type": "boolean", "default": false },
    { "name": "recurring_booking_id", "type": "string" },
    { "name": "is_first_booking", "type": "boolean", "default": false },
    { "name": "is_disputed", "type": "boolean", "default": false },
    
    // Smart Matching (20% reliability) ⭐
    { "name": "match_score", "type": "number" },
    { "name": "match_score_breakdown", "type": "object" },
    
    { "name": "updated_at", "type": "date", "default": "now" }
  ],
  "indexes": [
    { "fields": ["client_email", "status"] },
    { "fields": ["cleaner_email", "status"] },
    { "fields": ["status"] },
    { "fields": ["date", "start_time"] },
    { "fields": ["auto_approval_deadline"] },
    { "fields": ["payment_status"] }
  ]
}
```

#### **5. Credit Entity (Transactions)**

```javascript
{
  "name": "Credit",
  "fields": [
    { "name": "user_email", "type": "string", "required": true },
    { "name": "amount", "type": "number", "required": true }, // + credit, - debit
    { "name": "type", "type": "string", "required": true },
    // Types: purchase | booking_charge | refund | promotional | referral | 
    //        loyalty_redemption | compensation | adjustment
    { "name": "description", "type": "string", "required": true },
    { "name": "booking_id", "type": "string" },
    { "name": "stripe_charge_id", "type": "string" },
    { "name": "balance_before", "type": "number" },
    { "name": "balance_after", "type": "number", "required": true },
    { "name": "created_at", "type": "date", "default": "now" }
  ],
  "indexes": [
    { "fields": ["user_email", "created_at"] },
    { "fields": ["type"] },
    { "fields": ["booking_id"] }
  ]
}
```

#### **6. Payout Entity**

```javascript
{
  "name": "Payout",
  "fields": [
    { "name": "cleaner_email", "type": "string", "required": true },
    { "name": "amount_usd", "type": "number", "required": true },
    { "name": "booking_ids", "type": "array" },
    { "name": "status", "type": "string", "default": "pending" },
    // Status: pending | batched | processing | paid | failed
    
    // Instant Cash-Out (10% fee) ⭐
    { "name": "is_instant_cashout", "type": "boolean", "default": false },
    { "name": "instant_cashout_fee_percent", "type": "number" }, // 10 ⭐
    { "name": "instant_cashout_fee_amount", "type": "number" }, // 10% of amount_usd
    { "name": "net_amount_after_fee", "type": "number" }, // amount_usd - fee
    
    { "name": "payout_schedule", "type": "string" }, // weekly | daily | instant
    { "name": "stripe_transfer_id", "type": "string" },
    { "name": "batch_id", "type": "string" },
    { "name": "failure_reason", "type": "string" },
    { "name": "retry_count", "type": "number", "default": 0 },
    { "name": "next_retry_at", "type": "date" },
    { "name": "created_at", "type": "date", "default": "now" },
    { "name": "paid_at", "type": "date" }
  ],
  "indexes": [
    { "fields": ["cleaner_email", "status"] },
    { "fields": ["status"] },
    { "fields": ["batch_id"] },
    { "fields": ["created_at"] }
  ]
}
```

#### **7. Review Entity**

```javascript
{
  "name": "Review",
  "fields": [
    { "name": "booking_id", "type": "string", "required": true },
    { "name": "cleaner_email", "type": "string", "required": true },
    { "name": "client_email", "type": "string", "required": true },
    { "name": "rating", "type": "number", "required": true }, // 1-5
    { "name": "comment", "type": "text" },
    { "name": "tags", "type": "array" }, // ["punctual", "thorough", "friendly"]
    { "name": "would_rebook", "type": "boolean" },
    { "name": "private_feedback", "type": "text" }, // Admin only
    { "name": "created_at", "type": "date", "default": "now" }
  ],
  "indexes": [
    { "fields": ["booking_id"], "unique": true },
    { "fields": ["cleaner_email", "created_at"] },
    { "fields": ["rating"] }
  ]
}
```

#### **8. Dispute Entity**

```javascript
{
  "name": "Dispute",
  "fields": [
    { "name": "booking_id", "type": "string", "required": true },
    { "name": "client_email", "type": "string", "required": true },
    { "name": "cleaner_email", "type": "string", "required": true },
    { "name": "reason", "type": "string", "required": true },
    // quality_issue | no_show | late_start | incomplete | damage | other
    { "name": "description", "type": "text", "required": true },
    { "name": "evidence_photo_urls", "type": "array" },
    { "name": "requested_resolution", "type": "string" },
    // full_refund | partial_refund | rebook | other
    { "name": "requested_amount", "type": "number" },
    
    // Cleaner Response
    { "name": "cleaner_response", "type": "text" },
    { "name": "cleaner_evidence_urls", "type": "array" },
    
    // Admin Resolution
    { "name": "status", "type": "string", "default": "open" },
    // open | investigating | resolved | closed
    { "name": "resolution", "type": "string" },
    // full_refund | partial_refund | deny | rebook
    { "name": "refund_amount", "type": "number", "default": 0 },
    { "name": "admin_notes", "type": "text" },
    { "name": "resolved_at", "type": "date" },
    { "name": "created_at", "type": "date", "default": "now" }
  ],
  "indexes": [
    { "fields": ["booking_id"] },
    { "fields": ["status"] },
    { "fields": ["client_email"] },
    { "fields": ["cleaner_email"] }
  ]
}
```

---

### **Phase 2: Supporting Entities**

Create these additional entities following the same pattern:

- **Message** - In-app messaging
- **Notification** - Push/email/SMS notifications
- **RecurringBooking** - Subscription bookings
- **FavoriteCleaner** - Client favorites
- **BlockedCleaner** - Client blocked list
- **Referral** - Referral program tracking
- **LoyaltyReward** - Loyalty points & rewards
- **AdminUser** - Admin panel access
- **AdminAuditLog** - Admin action tracking
- **SystemAlert** - Platform-wide alerts
- **FeatureFlag** - A/B testing & rollouts

**Full schema available in PURETASK_COMPLETE_DOCUMENTATION_V3.md**

---

## ⚡ BACKEND API IMPLEMENTATION

### **Base44 Functions Setup**

#### **1. Booking Automations Function**

```javascript
// In Base44 Dashboard → Functions → Create New
// Name: bookingAutomations

export default async function bookingAutomations(event) {
  const { type, data } = event;
  
  switch (type) {
    case 'booking.created':
      return await handleBookingCreated(data);
    
    case 'booking.accepted':
      return await handleBookingAccepted(data);
    
    case 'booking.completed':
      return await handleBookingCompleted(data);
    
    case 'booking.approved':
      return await handleBookingApproved(data);
    
    default:
      return { success: false, error: 'Unknown event type' };
  }
}

async function handleBookingCreated(booking) {
  // 1. Apply pet fee if has_pets = true
  if (booking.has_pets) {
    booking.pet_fee_credits = 300; // $30 = 300 credits ⭐
    booking.final_price += booking.pet_fee_credits;
  }
  
  // 2. Hold client credits
  await holdClientCredits(booking.client_email, booking.final_price);
  
  // 3. Notify cleaner
  await sendNotification(booking.cleaner_email, {
    type: 'booking_request',
    booking_id: booking.id,
    title: 'New Booking Request',
    message: `${booking.client_name} wants to book you for ${booking.date}`
  });
  
  // 4. Set expiry (24 hours)
  await setBookingExpiry(booking.id, 24 * 60 * 60 * 1000);
  
  return { success: true, booking };
}

async function handleBookingCompleted(booking) {
  // 1. Set awaiting approval status
  booking.status = 'awaiting_approval';
  booking.awaiting_approval_since = new Date();
  
  // 2. Calculate auto-approval deadline (18 hours) ⭐
  const deadline = new Date();
  deadline.setHours(deadline.getHours() + 18); // ⭐ 18 hour window
  booking.auto_approval_deadline = deadline;
  
  // 3. Schedule reminder notifications
  await scheduleApprovalReminders(booking);
  
  // 4. Notify client
  await sendNotification(booking.client_email, {
    type: 'booking_completed',
    booking_id: booking.id,
    title: 'Cleaning Complete!',
    message: 'Please review the work and approve payment'
  });
  
  return { success: true, booking };
}

async function handleBookingApproved(booking) {
  // 1. Charge client credits
  await chargeClientCredits(booking.client_email, booking.final_price);
  
  // 2. Calculate cleaner earnings
  const earnings = calculateCleanerEarnings(booking);
  
  // 3. Create payout record
  await createPayoutRecord(booking.cleaner_email, earnings);
  
  // 4. Update reliability scores
  await updateReliabilityScores(booking);
  
  // 5. Prompt for review
  await sendReviewRequest(booking);
  
  return { success: true, booking };
}

function calculateCleanerEarnings(booking) {
  const basePrice = booking.final_price - booking.pet_fee_credits;
  const baseEarnings = basePrice * booking.payout_percentage; // 85%
  
  // Pet fee: 50/50 split between platform and cleaner
  const petFeeShare = booking.pet_fee_credits * 0.5;
  
  const totalEarnings = baseEarnings + petFeeShare;
  
  return {
    base_earnings: baseEarnings,
    pet_fee_share: petFeeShare,
    total_earnings: totalEarnings,
    total_usd: totalEarnings / 10
  };
}
```

#### **2. Auto-Approval Function (18hr Window) ⭐**

```javascript
// Name: cronAutoApproval
// Schedule: Every 5 minutes

export default async function cronAutoApproval() {
  const now = new Date();
  
  // Find bookings past auto-approval deadline
  const bookings = await base44.entities.Booking.filter({
    status: 'awaiting_approval',
    auto_approval_paused: false,
    auto_approval_deadline: { $lte: now }
  });
  
  console.log(`Found ${bookings.length} bookings to auto-approve`);
  
  for (const booking of bookings) {
    try {
      // Auto-approve
      booking.status = 'approved';
      booking.approved_by = 'auto';
      booking.approved_at = now;
      await booking.save();
      
      // Trigger approval workflow
      await triggerEvent('booking.approved', booking);
      
      // Notify client
      await sendNotification(booking.client_email, {
        type: 'auto_approved',
        booking_id: booking.id,
        title: 'Booking Auto-Approved',
        message: 'Your booking was automatically approved. Payment has been released to the cleaner.'
      });
      
      console.log(`Auto-approved booking ${booking.id}`);
    } catch (error) {
      console.error(`Error auto-approving booking ${booking.id}:`, error);
    }
  }
  
  return { success: true, count: bookings.length };
}
```

#### **3. Approval Reminder Function**

```javascript
// Name: cronApprovalReminders
// Schedule: Every 30 minutes

export default async function cronApprovalReminders() {
  const now = new Date();
  
  // Find bookings awaiting approval
  const bookings = await base44.entities.Booking.filter({
    status: 'awaiting_approval',
    auto_approval_paused: false
  });
  
  for (const booking of bookings) {
    const hoursElapsed = (now - booking.awaiting_approval_since) / (1000 * 60 * 60);
    const hoursRemaining = 18 - hoursElapsed; // ⭐ 18 hour window
    
    // First reminder: 6 hours after completion
    if (hoursElapsed >= 6 && booking.approval_reminders_sent === 0) {
      await sendApprovalReminder(booking, {
        reminder_number: 1,
        hours_remaining: Math.round(hoursRemaining)
      });
      booking.approval_reminders_sent = 1;
      await booking.save();
    }
    
    // Second reminder: 12 hours after completion
    else if (hoursElapsed >= 12 && booking.approval_reminders_sent === 1) {
      await sendApprovalReminder(booking, {
        reminder_number: 2,
        hours_remaining: Math.round(hoursRemaining)
      });
      booking.approval_reminders_sent = 2;
      await booking.save();
    }
    
    // Final reminder: 15 hours after completion (3hrs before deadline)
    else if (hoursElapsed >= 15 && booking.approval_reminders_sent === 2) {
      await sendApprovalReminder(booking, {
        reminder_number: 3,
        hours_remaining: Math.round(hoursRemaining),
        is_final: true
      });
      booking.approval_reminders_sent = 3;
      await booking.save();
    }
  }
  
  return { success: true };
}

async function sendApprovalReminder(booking, opts) {
  const { reminder_number, hours_remaining, is_final } = opts;
  
  const message = is_final
    ? `⚠️ Final reminder: Your booking will be auto-approved in ${hours_remaining} hours. Please review the work now!`
    : `Your booking is awaiting approval. You have ${hours_remaining} hours remaining to review before auto-approval.`;
  
  await sendNotification(booking.client_email, {
    type: is_final ? 'approval_reminder_final' : 'approval_reminder',
    booking_id: booking.id,
    title: is_final ? '⚠️ Final Approval Reminder' : 'Approval Reminder',
    message,
    priority: is_final ? 'high' : 'normal'
  });
}
```

#### **4. Smart Matching Function (20% Reliability) ⭐**

```javascript
// Name: smartMatchAutomations

export default async function getSmartMatchSuggestions(booking) {
  // 1. Find available cleaners in service area
  const cleaners = await findAvailableCleaners(booking);
  
  // 2. Calculate match scores for each cleaner
  const scoredCleaners = cleaners.map(cleaner => {
    const score = calculateMatchScore(cleaner, booking);
    return { ...cleaner, ...score };
  });
  
  // 3. Sort by total match score (descending)
  scoredCleaners.sort((a, b) => b.total_score - a.total_score);
  
  // 4. Return top 25
  return scoredCleaners.slice(0, 25);
}

function calculateMatchScore(cleaner, booking) {
  // WEIGHTS (must sum to 1.0)
  const weights = {
    distance: 0.25,
    availability: 0.20,
    reliability: 0.20, // ⭐ 20% weight for reliability
    pricing: 0.10,
    rating: 0.10,
    tier: 0.05,
    specialty: 0.05,
    product: 0.03,
    loyalty: 0.05,
    acceptance: 0.02
  };
  
  // CALCULATE INDIVIDUAL SCORES (0-1 scale)
  const distanceScore = calculateDistanceScore(cleaner, booking);
  const availabilityScore = calculateAvailabilityScore(cleaner, booking);
  const reliabilityScore = cleaner.reliability_score / 100; // 0-100 → 0-1
  const pricingScore = calculatePricingScore(cleaner, booking);
  const ratingScore = cleaner.average_rating / 5; // 0-5 → 0-1
  const tierScore = getTierScore(cleaner.tier);
  const specialtyScore = calculateSpecialtyScore(cleaner, booking);
  const productScore = calculateProductScore(cleaner, booking);
  const loyaltyScore = calculateLoyaltyScore(cleaner, booking);
  const acceptanceScore = calculateAcceptanceScore(cleaner);
  
  // WEIGHTED TOTAL SCORE
  const total_score = (
    (distanceScore * weights.distance) +
    (availabilityScore * weights.availability) +
    (reliabilityScore * weights.reliability) + // ⭐ 20% impact
    (pricingScore * weights.pricing) +
    (ratingScore * weights.rating) +
    (tierScore * weights.tier) +
    (specialtyScore * weights.specialty) +
    (productScore * weights.product) +
    (loyaltyScore * weights.loyalty) +
    (acceptanceScore * weights.acceptance)
  ) * 100; // Convert to 0-100 scale
  
  return {
    match_score: Math.round(total_score),
    score_breakdown: {
      distance_score: distanceScore,
      availability_score: availabilityScore,
      reliability_score: reliabilityScore,
      reliability_weight: weights.reliability, // ⭐ Show 20% weight
      reliability_contribution: reliabilityScore * weights.reliability * 100,
      pricing_score: pricingScore,
      rating_score: ratingScore,
      tier_score: tierScore,
      specialty_score: specialtyScore,
      product_score: productScore,
      loyalty_score: loyaltyScore,
      acceptance_score: acceptanceScore
    },
    total_score
  };
}

function calculateDistanceScore(cleaner, booking) {
  const distance = calculateDistance(
    cleaner.latitude, cleaner.longitude,
    booking.latitude, booking.longitude
  );
  
  // Scoring curve: 0-5mi = 1.0, 5-10mi = 0.7, 10-15mi = 0.4, 15+mi = 0.1
  if (distance <= 5) return 1.0;
  if (distance <= 10) return 0.7;
  if (distance <= 15) return 0.4;
  return 0.1;
}

function getTierScore(tier) {
  const scores = {
    'Elite': 1.0,
    'Pro': 0.8,
    'Semi Pro': 0.6,
    'Developing': 0.4
  };
  return scores[tier] || 0.4;
}
```

#### **5. Payout Function (10% Instant Cash-Out) ⭐**

```javascript
// Name: payoutAutomations

export default async function requestInstantCashout(cleanerEmail) {
  // 1. Get pending earnings
  const earnings = await getPendingEarnings(cleanerEmail);
  
  if (earnings.total_usd < 25) {
    return {
      success: false,
      error: 'Minimum $25 required for instant cash-out'
    };
  }
  
  // 2. Calculate 10% instant cash-out fee ⭐
  const fee_percent = 10;
  const fee_amount = earnings.total_usd * 0.10; // 10% fee ⭐
  const net_amount = earnings.total_usd - fee_amount;
  
  // 3. Create payout record
  const payout = await base44.entities.Payout.create({
    cleaner_email: cleanerEmail,
    amount_usd: earnings.total_usd,
    is_instant_cashout: true,
    instant_cashout_fee_percent: fee_percent, // ⭐ 10
    instant_cashout_fee_amount: fee_amount,
    net_amount_after_fee: net_amount,
    payout_schedule: 'instant',
    booking_ids: earnings.booking_ids,
    status: 'processing'
  });
  
  // 4. Process Stripe transfer
  try {
    const transfer = await stripe.transfers.create({
      amount: Math.round(net_amount * 100), // Convert to cents
      currency: 'usd',
      destination: cleaner.stripe_account_id,
      description: `Instant cash-out (10% fee applied)`
    });
    
    payout.stripe_transfer_id = transfer.id;
    payout.status = 'paid';
    payout.paid_at = new Date();
    await payout.save();
    
    // 5. Notify cleaner
    await sendNotification(cleanerEmail, {
      type: 'payout_processed',
      title: 'Instant Cash-Out Processed',
      message: `$${net_amount.toFixed(2)} is on the way! (10% fee: $${fee_amount.toFixed(2)})`
    });
    
    return {
      success: true,
      gross_amount: earnings.total_usd,
      fee_percent: 10, // ⭐
      fee_amount,
      net_amount,
      payout_id: payout.id
    };
  } catch (error) {
    payout.status = 'failed';
    payout.failure_reason = error.message;
    await payout.save();
    
    return {
      success: false,
      error: 'Payout failed. Please try again or contact support.'
    };
  }
}

// Weekly payout (free, no fees)
// Name: cronWeeklyPayouts
// Schedule: Every Friday at 12:00 PM UTC

export default async function cronWeeklyPayouts() {
  const cleaners = await getAllActiveCleaners();
  
  for (const cleaner of cleaners) {
    if (cleaner.payout_schedule !== 'weekly') continue;
    
    const earnings = await getPendingEarnings(cleaner.email);
    
    if (earnings.total_usd < 25) continue; // Minimum $25
    
    // Create payout (no fees for weekly)
    const payout = await base44.entities.Payout.create({
      cleaner_email: cleaner.email,
      amount_usd: earnings.total_usd,
      is_instant_cashout: false,
      instant_cashout_fee_amount: 0, // No fee for weekly ⭐
      net_amount_after_fee: earnings.total_usd,
      payout_schedule: 'weekly',
      booking_ids: earnings.booking_ids,
      status: 'batched',
      batch_id: `weekly_${new Date().toISOString().split('T')[0]}`
    });
    
    // Process Stripe transfer
    // ... (similar to instant cash-out but no fee)
  }
  
  return { success: true };
}
```

---

## 🎨 FRONTEND IMPLEMENTATION

### **Project Structure**

```
src/
├── api/
│   ├── base44Client.js         # Base44 SDK initialization
│   ├── entities.js             # Entity exports
│   └── functions.js            # Serverless function calls
│
├── components/
│   ├── ui/                     # shadcn/ui components
│   ├── booking/
│   │   ├── BookingCard.jsx
│   │   ├── BookingForm.jsx
│   │   └── PriceBreakdown.jsx
│   ├── cleaner/
│   │   ├── CleanerCard.jsx
│   │   ├── ReliabilityBadge.jsx
│   │   └── TierBadge.jsx
│   ├── credits/
│   │   ├── CreditWallet.jsx
│   │   └── PurchaseCredits.jsx
│   ├── reliability/
│   │   ├── ReliabilityScoreDisplay.jsx
│   │   └── TierProgressBar.jsx
│   └── shared/
│       ├── Layout.jsx
│       ├── Navigation.jsx
│       └── Footer.jsx
│
├── pages/
│   ├── Home.jsx
│   ├── BrowseCleaners.jsx
│   ├── BookingFlow.jsx
│   ├── ClientDashboard.jsx
│   ├── CleanerDashboard.jsx
│   ├── BookingDetails.jsx
│   ├── AdminDashboard.jsx
│   └── [50+ other pages]
│
├── hooks/
│   ├── useAuth.js              # Authentication hook
│   ├── useData.js              # Data fetching with React Query
│   ├── useBooking.js           # Booking operations
│   └── useCredits.js           # Credit operations
│
├── lib/
│   ├── errorHandler.js         # Centralized error handling
│   ├── cacheManager.js         # Client-side caching
│   ├── rateLimiter.js          # Rate limiting
│   └── utils.js                # Utility functions
│
├── utils/
│   ├── calculations.js         # Pricing, scoring calculations
│   ├── validation.js           # Input validation
│   └── formatting.js           # Data formatting
│
├── App.jsx                     # Main app component
├── main.jsx                    # Entry point
└── index.css                   # Global styles
```

---

### **Key Component Examples**

#### **1. Smart Cleaner Browsing with Match Scores**

```jsx
// src/pages/BrowseCleaners.jsx

import { useState, useEffect } from 'react';
import { smartMatchAutomations } from '@/api/functions';
import CleanerCard from '@/components/cleaner/CleanerCard';
import { Loader2 } from 'lucide-react';

export default function BrowseCleaners() {
  const [cleaners, setCleaners] = useState([]);
  const [loading, setLoading] = useState(true);
  const bookingData = JSON.parse(localStorage.getItem('bookingDraft'));
  
  useEffect(() => {
    loadMatchedCleaners();
  }, []);
  
  async function loadMatchedCleaners() {
    try {
      setLoading(true);
      
      // Call smart matching function (20% reliability weight) ⭐
      const suggestions = await smartMatchAutomations.getSmartMatchSuggestions({
        latitude: bookingData.latitude,
        longitude: bookingData.longitude,
        cleaning_type: bookingData.serviceType,
        date: bookingData.date,
        start_time: bookingData.time,
        hours: bookingData.recommendedHours,
        has_pets: bookingData.has_pets || false
      });
      
      setCleaners(suggestions);
    } catch (error) {
      console.error('Error loading cleaners:', error);
      toast.error('Failed to load cleaners');
    } finally {
      setLoading(false);
    }
  }
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-puretask-blue" />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Available Cleaners</h1>
      <p className="text-gray-600 mb-8">
        Showing {cleaners.length} cleaners ranked by smart matching
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cleaners.map((cleaner, index) => (
          <CleanerCard 
            key={cleaner.email}
            cleaner={cleaner}
            rank={index + 1}
            bookingData={bookingData}
          />
        ))}
      </div>
    </div>
  );
}
```

#### **2. Cleaner Card with Match Score Display**

```jsx
// src/components/cleaner/CleanerCard.jsx

import { Star, MapPin, Award } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import TierBadge from './TierBadge';
import ReliabilityBadge from './ReliabilityBadge';

export default function CleanerCard({ cleaner, rank, bookingData }) {
  const calculateTotalPrice = () => {
    const hours = bookingData.recommendedHours;
    const baseRate = cleaner.base_rate_credits_per_hour;
    const addonRate = bookingData.serviceType === 'deep' 
      ? cleaner.deep_addon_credits_per_hour 
      : 0;
    
    const hourlyTotal = (baseRate + addonRate) * hours;
    const petFee = bookingData.has_pets ? 300 : 0; // ⭐ $30 pet fee
    
    return (hourlyTotal + petFee) / 10; // Convert credits to USD
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      {/* Rank Badge */}
      {rank <= 3 && (
        <div className="absolute top-2 left-2">
          <Badge variant="secondary">
            #{rank} Match
          </Badge>
        </div>
      )}
      
      {/* Profile Photo */}
      <img 
        src={cleaner.profile_photo_url} 
        alt={cleaner.full_name}
        className="w-24 h-24 rounded-full mx-auto mb-4"
      />
      
      {/* Name & Tier */}
      <div className="text-center mb-4">
        <h3 className="text-xl font-bold">{cleaner.full_name}</h3>
        <TierBadge tier={cleaner.tier} />
      </div>
      
      {/* Match Score (20% reliability) ⭐ */}
      <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-green-800">
            Match Score
          </span>
          <span className="text-2xl font-bold text-green-600">
            {cleaner.match_score}%
          </span>
        </div>
        {cleaner.score_breakdown && (
          <div className="mt-2 text-xs text-green-700">
            <div>Reliability: {cleaner.score_breakdown.reliability_contribution.toFixed(1)} pts (20% weight)</div>
            <div>Distance: {(cleaner.score_breakdown.distance_score * 25).toFixed(1)} pts</div>
            <div>Rating: {(cleaner.score_breakdown.rating_score * 10).toFixed(1)} pts</div>
          </div>
        )}
      </div>
      
      {/* Reliability Score */}
      <ReliabilityBadge score={cleaner.reliability_score} />
      
      {/* Rating */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
        <span className="font-semibold">{cleaner.average_rating.toFixed(1)}</span>
        <span className="text-gray-500">({cleaner.total_reviews} reviews)</span>
      </div>
      
      {/* Distance */}
      <div className="flex items-center justify-center gap-2 mb-4 text-gray-600">
        <MapPin className="w-4 h-4" />
        <span>{cleaner.distance_miles.toFixed(1)} miles away</span>
      </div>
      
      {/* Specialty Tags */}
      {cleaner.specialty_tags && cleaner.specialty_tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {cleaner.specialty_tags.map(tag => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      )}
      
      {/* Pricing */}
      <div className="border-t pt-4 mt-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600">Base Rate:</span>
          <span className="font-semibold">
            ${(cleaner.base_rate_credits_per_hour / 10).toFixed(0)}/hr
          </span>
        </div>
        
        {bookingData.has_pets && (
          <div className="flex justify-between items-center mb-2 text-sm">
            <span className="text-gray-600">Pet Fee:</span>
            <span className="text-orange-600 font-medium">+$30</span>
          </div>
        )}
        
        <div className="flex justify-between items-center mb-4">
          <span className="font-semibold">Total for {bookingData.recommendedHours}hrs:</span>
          <span className="text-2xl font-bold text-puretask-blue">
            ${calculateTotalPrice().toFixed(2)}
          </span>
        </div>
        
        <button 
          className="w-full bg-puretask-blue text-white py-3 rounded-lg hover:bg-blue-600 transition-colors"
          onClick={() => selectCleaner(cleaner)}
        >
          Select Cleaner
        </button>
      </div>
    </div>
  );
}
```

#### **3. Auto-Approval Countdown Timer**

```jsx
// src/components/booking/AutoApprovalTimer.jsx

import { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

export default function AutoApprovalTimer({ booking }) {
  const [timeRemaining, setTimeRemaining] = useState(null);
  
  useEffect(() => {
    if (!booking.auto_approval_deadline) return;
    
    const interval = setInterval(() => {
      const now = new Date();
      const deadline = new Date(booking.auto_approval_deadline);
      const remaining = deadline - now;
      
      if (remaining <= 0) {
        setTimeRemaining(0);
        clearInterval(interval);
      } else {
        setTimeRemaining(remaining);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [booking.auto_approval_deadline]);
  
  if (timeRemaining === null) return null;
  
  const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
  const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);
  
  const isUrgent = hours < 3; // Less than 3 hours remaining
  
  return (
    <div className={`p-4 rounded-lg border-2 ${
      isUrgent 
        ? 'bg-red-50 border-red-300' 
        : 'bg-blue-50 border-blue-300'
    }`}>
      <div className="flex items-center gap-3">
        {isUrgent ? (
          <AlertTriangle className="w-6 h-6 text-red-600" />
        ) : (
          <Clock className="w-6 h-6 text-blue-600" />
        )}
        
        <div className="flex-1">
          <p className={`font-semibold ${
            isUrgent ? 'text-red-800' : 'text-blue-800'
          }`}>
            {isUrgent ? '⚠️ Auto-Approval Soon!' : 'Auto-Approval in:'}
          </p>
          <p className="text-sm text-gray-600">
            Review the work before payment is automatically released
          </p>
        </div>
        
        <div className="text-right">
          <p className={`text-3xl font-bold ${
            isUrgent ? 'text-red-600' : 'text-blue-600'
          }`}>
            {hours}:{minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
          </p>
          <p className="text-xs text-gray-500">
            18 hour window ⭐
          </p>
        </div>
      </div>
    </div>
  );
}
```

---

**[CONTINUING IN NEXT SECTION...]**

This implementation guide is comprehensive and will continue with:
- Third-party integrations (Stripe, Twilio, Google Maps, Checkr)
- Deployment strategies (staging, production)
- Monitoring & maintenance
- Performance optimization
- Security best practices
- Complete 18-month roadmap

Would you like me to continue building out the complete implementation guide?
