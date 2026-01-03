# Module 10 - Analytics & KPI Engine

## Overview
A comprehensive analytics system built entirely on Base44, providing real-time insights and historical trends for the PureTask marketplace.

## Architecture

### Entities
- **PlatformAnalyticsDaily**: Daily platform-wide metrics (365-day retention)
- **CleanerDailySnapshot**: Per-cleaner daily performance (90-day retention)
- **SubscriptionAnalytics**: Subscription KPIs (singleton)
- **MembershipAnalytics**: Membership KPIs (singleton)
- **DashboardCache**: Pre-computed dashboard payloads
- **SystemAlert**: Anomaly detection alerts

### Automations

#### Real-time (Event-driven)
- `analyticsAutomations.js`: Listens to booking, dispute, subscription events
- Updates CleanerAnalytics immediately
- Logs events to Event/AnalyticsEvent

#### Batch (Nightly Cron)
- `cronAnalytics.js`: Runs at 3:00 AM daily
- Computes daily metrics for yesterday
- Updates all analytics entities
- Runs anomaly detection
- Cleans up old records

### Dashboards

1. **CEO Dashboard**: High-level GMV, revenue, MRR trends
2. **Ops Dashboard**: Bookings, cancellations, disputes, cleaner performance
3. **Finance Dashboard**: Revenue breakdown, margins, payouts, refunds
4. **Growth Dashboard**: User acquisition, funnels, subscriptions, retention
5. **System Alerts**: Real-time anomaly alerts

## Key Features

- ✅ Event-driven real-time updates
- ✅ Nightly batch aggregation
- ✅ Rolling 30/90-day windows
- ✅ Anomaly detection & alerting
- ✅ Pre-computed dashboard caches
- ✅ CSV export functionality
- ✅ No external dependencies (100% Base44)

## Usage

### Accessing Dashboards
Navigate to Admin Dashboard → Analytics Hub to access all dashboards.

### Triggering Manual Analytics Update
The cron job runs automatically at 3:00 AM. To trigger manually, call the cronAnalytics function endpoint.

### Creating Custom Alerts
Alerts are automatically created when metrics exceed 2x baseline. To add custom alert types, update the `runAlertDetection` function in `cronAnalytics.js`.

## Data Retention

- PlatformAnalyticsDaily: 365 days
- CleanerDailySnapshot: 90 days
- Event/AnalyticsEvent: No automatic cleanup (consider manual cleanup for very high volumes)
- DashboardCache: Overwritten nightly
- SystemAlert: Manual resolution required

## Constants

```javascript
CREDITS_PER_USD = 10
```

## KPI Formulas

- **GMV**: Sum of final_charge_credits for completed bookings
- **Platform Revenue**: GMV × 0.15
- **Cancel Rate**: cancelled_bookings / total_bookings × 100
- **Dispute Rate**: disputed_bookings / completed_bookings × 100
- **MRR**: Sum of monthly_price for all active subscriptions/memberships

## Future Enhancements (v2)

- Cohort analysis
- Geographic segmentation
- Customer lifetime value (LTV)
- More sophisticated churn prediction
- ML-based demand forecasting