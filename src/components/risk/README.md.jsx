# Module 11 - Fraud, Trust & Safety Engine

## Overview
A comprehensive fraud prevention and safety monitoring system built entirely on Base44 to protect the PureTask marketplace from abuse, fraud, and safety issues.

## Architecture

### New Entities

1. **RiskFlag**: Individual risk markers for clients, cleaners, bookings, or payments
2. **RiskProfile**: Evolving risk score for every client and cleaner
3. **SafetyIncident**: Safety reports including harassment, theft, and dangerous situations
4. **RiskActionLog**: Audit trail of all enforcement actions

### Risk Categories

- **Payment Risk**: Failed payments, chargebacks, payment velocity anomalies
- **Refund Abuse**: High dispute rates, pattern of complaints, refund-heavy clients
- **Safety Issues**: Harassment, theft, unsafe conditions, injuries
- **Reliability Risk**: No-shows, cancellation patterns, low reliability scores
- **Identity Risk**: Incomplete profiles, suspicious account changes
- **Multi-Account Abuse**: Same payment method across accounts, address sharing
- **Subscription Abuse**: Short-term subscription gaming, promo code abuse
- **Behavior Risk**: Suspicious activity patterns

## Risk Scoring

### Formula
```
risk_score = payment_risk 
           + dispute_risk 
           + safety_risk 
           + reliability_risk 
           + identity_risk 
           + multi_account_risk 
           + behavior_risk
```

### Risk Tiers
- **0-19**: Normal (full access)
- **20-39**: Watch (monitored)
- **40-69**: Restricted (limited access, requires verification)
- **70-100**: Blocked (account suspended)

### Risk Decay
Every 30 days without incidents:
- Risk score reduced by 10-20%
- Minor flags automatically expire
- Severity of tags reduced

## Detection Rules

### Financial Rules
- `CLIENT_PAYMENT_FAIL_SPIKE`: 3+ failed payments in 7 days
- `CLIENT_CHARGEBACK`: Chargeback filed → +40 risk score, restricted tier
- `CLEANER_PAYOUT_ANOMALY`: Payouts >3× typical average → manual review

### Refund Abuse Rules
- `CLIENT_DISPUTE_RATE_HIGH`: Dispute rate >30% over 90 days
- `CLIENT_REFUND_VOLUME_HIGH`: Refunds >$500 in 60 days → manual review required

### Cleaner Risk Rules
- `CLEANER_NO_SHOW_PATTERN`: ≥2 no-shows in last 10 jobs OR >5% no-show rate
- `CLEANER_DISPUTE_PATTERN`: 3+ client-favor disputes in 60 days
- `CLEANER_OVERLOAD_RISK`: 3+ jobs/day or <90 min gap between jobs

### Safety Rules
- `SAFETY_CRITICAL`: Auto-block on critical safety incidents
- `SAFETY_REPEAT_OFFENDER`: >1 serious safety dispute → blocked

### Subscription Rules
- `SUBSCRIPTION_GAMING`: 2+ short-term subs (<30 days) in 6 months
- `PROMO_ABUSE`: Excessive promo code usage

## Automations

### Real-time (Event-Driven)
`riskAutomations.js` - Triggers on:
- Dispute created
- Payment failed/chargeback
- Booking cancelled/no-show
- Subscription cancelled early
- SafetyIncident created
- CleanerProfile reliability drops

### Nightly Batch
`cronRisk.js` - Runs at 3:00 AM:
1. Apply risk decay (reduce scores for good behavior)
2. Recalculate risk scores for all flagged users
3. Expire aged risk flags
4. Escalate unresolved safety incidents
5. Generate risk spike alerts
6. Update risk dashboard cache

## Enforcement Actions

### Soft Locks
- Require identity verification
- Require payment update
- Require profile completion
- Request address verification

### Hard Restrictions
- Limit booking frequency
- Prepay-only requirement
- Disable dispute filing
- Block subscription enrollment
- Remove promo eligibility

### Account Blocking
- Full account suspension
- Cancel all upcoming bookings
- Pause disputed payouts
- Auto-escalate to safety team

## Admin Pages

1. **Trust & Safety Dashboard**: Overview and quick stats
2. **Risk Management**: User risk profiles and scores
3. **Risk Flags**: Automated fraud detection alerts
4. **Safety Incidents**: Critical safety reports and escalations

## Integration with Other Modules

- **Module 1**: Blocks high-risk users from booking
- **Module 2**: Enforces prepay for risky clients, limits refunds
- **Module 3**: Flags payout anomalies
- **Module 5**: Lowers SmartMatch priority for risky cleaners
- **Module 6**: Uses reliability scores in risk calculations
- **Module 7**: Dispute outcomes update risk profiles
- **Module 9**: Detects subscription abuse patterns
- **Module 10**: Uses analytics for baseline comparisons

## Usage Examples

### Check if client can book
```javascript
import { RiskCheckService } from '@/components/risk/RiskCheckService';

const check = await RiskCheckService.canClientBook(clientEmail);
if (!check.allowed) {
  alert(check.reason);
  return;
}
```

### Display risk badge
```jsx
import RiskBadge from '@/components/risk/RiskBadge';

<RiskBadge userEmail={cleaner.user_email} userType="cleaner" />
```

### Report safety incident
```jsx
import SafetyIncidentReporter from '@/components/safety/SafetyIncidentReporter';

<SafetyIncidentReporter
  bookingId={booking.id}
  clientEmail={booking.client_email}
  cleanerEmail={booking.cleaner_email}
  reportedBy="client"
  onSuccess={() => navigate('/dashboard')}
/>
```

## Future Enhancements (v2)

- ML-based anomaly detection
- Behavioral biometrics
- Network analysis for multi-account detection
- AI-powered evidence analysis
- Risk-based dynamic pricing
- Automated identity verification (KYC)
- Geographic risk scoring
- Payment fingerprinting