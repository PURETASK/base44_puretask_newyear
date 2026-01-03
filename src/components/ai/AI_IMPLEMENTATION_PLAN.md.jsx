# PureTask AI Communication & Scheduling System - Implementation Plan

## Executive Summary
This document outlines the complete design, build, and implementation process for PureTask's AI-driven communication and scheduling system. The system enables automated client communication, intelligent booking slot suggestions, and gives cleaners granular control over all automated interactions.

---

## Phase 1: Foundation ✅ COMPLETED
**Status:** Done
- ✅ SMS Integration (`functions/sendSMS.js`)
- ✅ Extended `CleanerProfile` entity with `communication_settings`
- ✅ Secrets configured (Twilio credentials)

---

## Phase 2: AI-Driven Scheduling Core Logic

### 2.1 AI Booking Slot Suggestion Function
**File:** `functions/suggestBookingSlots.js`

**Input Parameters:**
- `client_email` - To retrieve client preferences
- `cleaner_email` - Target cleaner
- `cleaning_type` - basic/deep/moveout
- `estimated_hours` - Duration estimate
- `preferred_dates` - Array of client's preferred dates
- `address` - Cleaning location
- `entry_instructions` - Access details
- `client_preferences` - Any special requirements

**Processing Logic:**
1. Fetch `CleanerProfile` for availability data:
   - `custom_availability_slots`
   - `communication_settings.ai_scheduling_enabled`
   - `communication_settings.suggest_days_in_advance`
   - `communication_settings.prioritize_gap_filling`
2. Fetch cleaner's existing `Booking` entities to identify occupied slots
3. Calculate available time slots within the next X days (per cleaner settings)
4. Construct AI prompt with:
   - Client needs (type, hours, dates, location)
   - Cleaner availability (all open slots)
   - Current bookings context
   - Gap-filling priority flag
5. Call `base44.integrations.Core.InvokeLLM` with structured JSON response schema
6. Return array of suggested slots with reasoning

**Output JSON Schema:**
```json
{
  "type": "object",
  "properties": {
    "suggested_slots": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "date": { "type": "string", "format": "date" },
          "start_time": { "type": "string" },
          "end_time": { "type": "string" },
          "reasoning": { "type": "string" },
          "fills_gap": { "type": "boolean" }
        }
      }
    },
    "alternative_message": { "type": "string" }
  }
}
```

### 2.2 Process Client Booking Response Function
**File:** `functions/processClientBookingResponse.js`

**Input Parameters:**
- `booking_request_id` - Reference to initial request
- `client_response` - "selected_slot" | "suggest_other" | "not_interested"
- `selected_slot` - Object with date/time if client selected
- `client_email`
- `cleaner_email`

**Processing Logic:**

**If `client_response === "selected_slot"`:**
1. Create provisional `Booking` entity:
   - Status: `"awaiting_cleaner_approval"`
   - All booking details from request
   - `provisional_slot_expires_at` (48 hours from now)
2. Create `Notification` for cleaner:
   - Type: `"booking_requires_approval"`
   - Link to approval interface
3. Create in-app `Message` in `ConversationThread`:
   - Subject: "New Booking Request Awaiting Your Approval"
   - Include all details: client name, address, entry instructions, date/time, duration
4. If cleaner has SMS enabled for booking notifications, call `sendSMS` function
5. Return success with booking ID

**If `client_response === "not_interested"`:**
1. Update booking request status to "client_declined"
2. If cleaner's `communication_settings.notify_client_not_interested` is true:
   - Create `Notification` for cleaner
   - Send via configured channels
3. Log the interaction for analytics
4. Return acknowledgment

**If `client_response === "suggest_other"`:**
1. Re-trigger `suggestBookingSlots` with note to exclude previously suggested times
2. Return new suggestions

### 2.3 Cleaner Booking Approval/Decline Function
**File:** `functions/cleanerBookingApproval.js`

**Input Parameters:**
- `booking_id`
- `cleaner_email`
- `decision` - "approve" | "decline" | "not_interested"
- `decline_reason` - Optional text if declined

**Processing Logic:**

**If `decision === "approve"`:**
1. Update `Booking` entity:
   - Status: `"scheduled"`
   - Clear `provisional_slot_expires_at`
2. Update cleaner's `custom_availability_slots`:
   - Mark the approved time slot as unavailable
3. Create `Notification` for client:
   - Type: `"booking_confirmed"`
   - Include confirmation details
4. Send confirmation via cleaner's configured channels:
   - Check `communication_settings.booking_confirmation.enabled`
   - Get channels from `communication_settings.booking_confirmation.channels`
   - Use `custom_template` with variable replacements
5. Call notification automation functions as configured
6. Return success

**If `decision === "decline"`:**
1. Update `Booking` entity:
   - Status: `"cleaner_declined"`
   - Add `decline_reason`
2. Create `Notification` for client:
   - Type: `"booking_declined"`
   - Suggest browsing other cleaners or selecting different time
3. Optionally trigger fallback cleaner search (if client had this preference)
4. Return acknowledgment

**If `decision === "not_interested"`:**
1. Same as decline but with additional analytics logging
2. Can inform AI for future matching improvements

---

## Phase 3: Cleaner Configuration UI

### 3.1 AI Communication Settings Component
**File:** `components/cleaner/AICommunicationSettings.jsx`

**Component Structure:**

```
AICommunicationSettings
├── Header Section
│   ├── Title: "AI Communication Automation"
│   ├── Description: "Configure how and when AI communicates with your clients"
│   └── Status Indicator: "X automations active"
│
├── AI Scheduling Settings Card
│   ├── Toggle: "Enable AI-driven scheduling suggestions"
│   ├── Input: "Suggest bookings up to [X] days in advance"
│   ├── Toggle: "Prioritize gap-filling in my schedule"
│   └── Toggle: "Notify me when clients decline suggestions"
│
├── Booking Confirmation Card
│   ├── Toggle: "Enable booking confirmation messages"
│   ├── Multi-select: Channels (SMS, Email, In-App)
│   ├── Textarea: Custom message template
│   └── Preview: Live preview with sample data
│
├── Pre-Cleaning Reminder Card
│   ├── Toggle: "Enable pre-cleaning reminders"
│   ├── Input: "Send [X] days before booking"
│   ├── Multi-select: Channels
│   ├── Textarea: Custom template
│   └── Preview
│
├── "On My Way" Notification Card
│   ├── Toggle: "Enable 'On My Way' automation"
│   ├── Multi-select: Channels (SMS, In-App only)
│   ├── Toggle: "Include GPS-based ETA"
│   ├── Textarea: Custom template
│   └── Preview
│
├── Post-Cleaning Summary Card
│   ├── Toggle: "Enable post-cleaning messages"
│   ├── Multi-select: Channels
│   ├── Textarea: Custom template
│   └── Preview
│
├── Review Request Card
│   ├── Toggle: "Enable review requests"
│   ├── Input: "Send [X] hours after completion"
│   ├── Multi-select: Channels
│   ├── Textarea: Custom template
│   └── Preview
│
├── Re-engagement Campaign Card
│   ├── Toggle: "Enable re-engagement for inactive clients"
│   ├── Input: "Consider inactive after [X] weeks"
│   ├── Input: "Target clients with ≤ [X] bookings"
│   ├── Multi-select: Channels
│   ├── Input: "Offer [X]% discount"
│   ├── Textarea: Custom template
│   └── Preview
│
└── Footer Actions
    ├── Button: "Save All Settings"
    ├── Button: "Reset to Defaults"
    └── Status: "Last saved: [timestamp]"
```

**Template Variables Available:**
- `{client_name}` - Client's full name
- `{cleaner_name}` - Cleaner's full name
- `{date}` - Booking date (formatted)
- `{time}` - Booking time
- `{address}` - Cleaning location
- `{eta}` - Estimated arrival time (for "On My Way")
- `{hours}` - Cleaning duration
- `{discount_text}` - Auto-generated discount message
- `{review_link}` - Direct link to review page

**State Management:**
- Local state for form inputs
- Debounced auto-save (save drafts every 5 seconds)
- Validation for required fields
- Real-time character count for SMS (160 char limit warning)

**API Integration:**
- Load: `base44.entities.CleanerProfile.filter({ user_email })`
- Save: `base44.entities.CleanerProfile.update(profileId, { communication_settings })`

### 3.2 Integration into CleanerDashboard
**File:** `pages/CleanerDashboard.jsx`

**Changes Required:**
1. Add new navigation link: "AI Communication Settings"
2. Add quick stats card showing:
   - Number of active automations
   - Messages sent this week
   - Automation effectiveness (open rates, response rates)
3. Add "Quick Setup" prompt for cleaners who haven't configured settings

---

## Phase 4: Automated Client Communication Implementation

### 4.1 Booking Confirmation Automation
**File:** `functions/automations/sendBookingConfirmation.js`

**Trigger:** After booking status changes to "scheduled"

**Logic:**
1. Fetch cleaner's `communication_settings.booking_confirmation`
2. If enabled, prepare message using template
3. Replace template variables with booking data
4. Send via configured channels:
   - SMS: Call `sendSMS` function
   - Email: Call `base44.integrations.Core.SendEmail`
   - In-App: Create `Message` entity in booking's `ConversationThread`
5. Log delivery status in `MessageDeliveryLog` entity

### 4.2 Pre-Cleaning Reminder Automation
**File:** `functions/cronAutomations.js` (extend existing)

**Cron Schedule:** Run daily at 8 AM

**Logic:**
1. Query all bookings with status "scheduled" and date within cleaner's configured reminder window
2. For each booking:
   - Fetch cleaner's `communication_settings.pre_cleaning_reminder`
   - If enabled and not already sent:
     - Prepare message using template
     - Send via configured channels
     - Mark reminder as sent in booking metadata

### 4.3 "On My Way" Trigger
**File:** `components/jobs/OnMyWayButton.jsx` (new component)

**Placement:** In cleaner's job detail view / daily schedule

**UI:**
- Prominent button: "I'm On My Way"
- Shows if enabled in settings
- Displays ETA if GPS tracking enabled

**Logic:**
1. When clicked, call `functions/sendOnMyWay.js`
2. Function fetches cleaner location (if permission granted)
3. Calculate ETA using Google Maps API or simple distance calculation
4. Fetch `communication_settings.on_my_way`
5. Send message via configured channels
6. Update booking status to "on_the_way"

### 4.4 Post-Cleaning Summary Automation
**File:** `functions/automations/sendPostCleaningSummary.js`

**Trigger:** After booking status changes to "completed" (cleaner checks out)

**Logic:**
1. Fetch cleaner's `communication_settings.post_cleaning_summary`
2. If enabled, prepare message
3. Optionally include:
   - Photos uploaded
   - Time spent
   - Areas cleaned
4. Send via configured channels

### 4.5 Review Request Automation
**File:** `functions/cronAutomations.js` (extend)

**Cron Schedule:** Run every hour

**Logic:**
1. Query completed bookings within review request window
2. Filter where review not yet submitted
3. Check if enough time has passed (per cleaner's hours_after_completion setting)
4. Send review request via configured channels
5. Include direct link to review form
6. Mark as sent to avoid duplicates

### 4.6 Re-engagement Campaign Automation
**File:** `functions/cronReengagement.js` (new cron)

**Cron Schedule:** Run weekly (e.g., Monday 9 AM)

**Logic:**
1. For each cleaner with `communication_settings.reengagement.enabled`:
   - Query their past clients
   - Identify inactive clients (no booking in X weeks)
   - Filter clients with ≤ X total bookings
2. For each identified client:
   - Check if already sent re-engagement in last 30 days (avoid spam)
   - Generate personalized message using AI if desired:
     - Use `base44.integrations.Core.InvokeLLM`
     - Prompt: "Write a friendly re-engagement message for {client_name} who last booked {weeks_ago} weeks ago. Cleaner's specialty is {specialty}. {discount_text}"
   - Or use cleaner's custom template
   - Send via configured channels
3. Log campaign in `EmailCampaign` entity for tracking

### 4.7 Communication Service Layer
**File:** `components/ai/CommunicationService.js` (helper)

**Purpose:** Centralized service for all automated messaging

**Functions:**
```javascript
class CommunicationService {
  static async sendMessage({
    cleaner_email,
    client_email,
    message_type, // "booking_confirmation", "reminder", etc.
    booking_id,
    custom_data // Variables for template replacement
  }) {
    // 1. Fetch cleaner's communication settings
    // 2. Check if message type is enabled
    // 3. Get channels and template
    // 4. Replace template variables
    // 5. Send via all enabled channels
    // 6. Log delivery
    // 7. Return delivery status
  }

  static replaceVariables(template, data) {
    // Replace all {variable} placeholders
  }

  static async sendViaSMS(to, message) {
    // Call sendSMS function
  }

  static async sendViaEmail(to, subject, body) {
    // Call Core.SendEmail
  }

  static async sendViaInApp(thread_id, message) {
    // Create Message entity
  }

  static async logDelivery(message_type, channels, status) {
    // Create MessageDeliveryLog
  }
}
```

---

## Phase 5: Client-Facing UI

### 5.1 Booking Flow with AI Suggestions
**File:** `pages/SmartBooking.jsx` (new page)

**Flow:**
1. Client enters booking preferences:
   - Address (with autocomplete)
   - Entry instructions
   - Cleaning type (basic/deep/moveout)
   - Preferred dates (select 3-5 dates)
   - Estimated home size
2. Client selects a cleaner or uses smart matching
3. System calls `suggestBookingSlots` function
4. Display AI-suggested slots:
   - Show 3-5 optimal time slots
   - Each with reasoning ("Fills gap in schedule", "Matches your preferred time", etc.)
   - Visual calendar preview
5. Client interaction buttons:
   - "Select This Time" for each slot
   - "Show More Times" (triggers new AI suggestion)
   - "I'm Not Interested Right Now" (exits flow gracefully)
6. Upon selection:
   - Confirm booking details
   - Show "Waiting for cleaner approval" message
   - Estimated response time: 24 hours

### 5.2 Interactive Message Responses in ChatThread
**File:** `pages/ChatThread.jsx` (enhance existing)

**Enhancement:**
- Detect AI-generated messages with action buttons
- Render interactive elements:
  - "Select Slot A" button
  - "Select Slot B" button
  - "Suggest Other Times" button
  - "Not Interested" button
- When clicked, call `processClientBookingResponse` with appropriate parameters
- Show loading state while processing
- Update UI with confirmation or next steps

### 5.3 Cleaner Approval Interface
**File:** `pages/BookingApprovalPage.jsx` (new page)

**UI Components:**
1. Booking Details Card:
   - Client name and photo
   - Address with map preview
   - Entry instructions (prominently displayed)
   - Date and time
   - Estimated duration
   - Cleaning type and special requests
2. Cleaner's Schedule Context:
   - Show bookings before and after
   - Highlight if this fills a gap
   - Calculate travel time from previous booking
3. Decision Buttons:
   - "Approve Booking" (green, primary)
   - "Decline" (with reason dropdown)
   - "Not Interested in This Type" (with feedback form)
4. Quick Actions:
   - "View Client Profile"
   - "Message Client"
   - "Suggest Different Time" (opens counter-proposal)

---

## Phase 6: Testing & Quality Assurance

### 6.1 Unit Testing
**Test Cases:**
1. SMS sending function with various inputs
2. Template variable replacement accuracy
3. AI slot suggestion logic (mock LLM responses)
4. Booking approval/decline workflows
5. Cron job logic (date/time calculations)

### 6.2 Integration Testing
**Test Scenarios:**
1. End-to-end booking flow:
   - Client requests → AI suggests → Client selects → Cleaner approves → Confirmations sent
2. Communication automation triggers:
   - Booking confirmed → Confirmation sent via all channels
   - 24 hours before → Reminder sent
   - Cleaner clicks "On My Way" → Client receives notification
   - Job completed → Thank you + Review request sent
3. Re-engagement campaign:
   - Mark test client as inactive → Run cron → Verify message sent

### 6.3 User Acceptance Testing
**Cleaner Testing:**
1. Configure communication settings
2. Receive and approve/decline booking requests
3. Trigger "On My Way" notification
4. Review message delivery logs

**Client Testing:**
1. Initiate smart booking
2. Interact with AI suggestions
3. Receive automated messages via SMS, email, in-app
4. Respond to review requests

### 6.4 Load Testing
- Test SMS sending rate limits
- Test AI LLM response times under load
- Test cron jobs with large booking volumes

---

## Phase 7: Deployment & Monitoring

### 7.1 Deployment Checklist
- [ ] All backend functions deployed
- [ ] Twilio credentials verified in production
- [ ] Cron jobs scheduled and active
- [ ] Entity schema updates applied
- [ ] UI components deployed
- [ ] Analytics tracking implemented

### 7.2 Monitoring
**Metrics to Track:**
1. **Communication Delivery Rates:**
   - SMS delivery success rate
   - Email open rates
   - In-app message read rates
2. **AI Performance:**
   - Slot suggestion acceptance rate
   - Cleaner approval rate for AI-suggested bookings
   - Time to booking confirmation
3. **Automation Effectiveness:**
   - Re-engagement campaign conversion rate
   - Review request response rate
   - "On My Way" notification usage
4. **System Health:**
   - Function execution times
   - Error rates per function
   - Cron job success rates

### 7.3 Alerts & Notifications
**Set Up Alerts For:**
- SMS sending failures (Twilio errors)
- AI LLM response errors or timeouts
- Cron job failures
- Unusual spike in "not interested" responses
- Low cleaner approval rates (may indicate AI suggesting poor times)

---

## Phase 8: Iteration & Optimization

### 8.1 Data Collection
- Track which message templates get best responses
- Analyze optimal timing for reminders and re-engagement
- Measure AI suggestion accuracy over time

### 8.2 AI Prompt Refinement
- Improve slot suggestion prompts based on feedback
- Add learning from cleaner approval patterns
- Incorporate seasonal and regional booking trends

### 8.3 Feature Enhancements
**Future Additions:**
- Multi-language support for templates
- A/B testing for message templates
- Predictive analytics for best booking times
- Voice message option (via Twilio)
- WhatsApp integration
- Client preference learning (AI remembers what times clients prefer)

---

## Implementation Timeline

**Week 1-2: Phase 2 (AI Core Logic)**
- Build 3 backend functions
- Test with mock data
- Integrate with existing booking system

**Week 3: Phase 3 (Cleaner UI)**
- Build AICommunicationSettings component
- Integrate into CleanerDashboard
- Internal testing with cleaner accounts

**Week 4-5: Phase 4 (Automation Implementation)**
- Build all automation functions
- Set up cron jobs
- Implement CommunicationService helper
- End-to-end testing

**Week 6: Phase 5 (Client UI)**
- Build SmartBooking page
- Enhance ChatThread with interactive buttons
- Build BookingApprovalPage
- Client-side testing

**Week 7: Phase 6 (QA)**
- Comprehensive testing
- Bug fixes
- Performance optimization

**Week 8: Phase 7-8 (Deploy & Monitor)**
- Production deployment
- Monitoring setup
- Initial feedback collection
- Quick iterations

---

## Success Criteria

**For Cleaners:**
- ✅ 80%+ of cleaners configure at least 3 automations
- ✅ 50% reduction in manual client communication time
- ✅ Approval rate for AI-suggested bookings > 70%

**For Clients:**
- ✅ 90%+ satisfaction with communication timeliness
- ✅ 60%+ response rate to review requests
- ✅ 40%+ booking rate for AI-suggested slots

**For Platform:**
- ✅ 99.5%+ message delivery success rate
- ✅ < 2 second response time for AI slot suggestions
- ✅ Zero critical bugs in production after week 2

---

## Risk Mitigation

**Risk 1: SMS Costs Spiral**
- **Mitigation:** Set per-cleaner monthly SMS limits
- **Mitigation:** Provide SMS cost estimates in settings
- **Mitigation:** Encourage email/in-app as primary channels

**Risk 2: AI Suggests Poor Time Slots**
- **Mitigation:** Allow cleaners to provide feedback on suggestions
- **Mitigation:** Implement approval rate monitoring per cleaner
- **Mitigation:** Fallback to manual slot selection if AI performs poorly

**Risk 3: Client Spam Complaints**
- **Mitigation:** Respect quiet hours (no messages 9 PM - 8 AM)
- **Mitigation:** Include "opt-out" link in all automated messages
- **Mitigation:** Limit re-engagement frequency (max once per month)

**Risk 4: Template Customization Leads to Unprofessional Messages**
- **Mitigation:** Provide "professional tone" checker using AI
- **Mitigation:** Show examples and best practices
- **Mitigation:** Admin review of extreme outliers

---

## Appendix: Technical Dependencies

**External Services:**
- Twilio (SMS)
- Base44 Core.SendEmail (Email)
- Base44 Core.InvokeLLM (AI suggestions and personalization)

**Entities Required:**
- CleanerProfile (with communication_settings)
- ClientProfile
- Booking
- Message
- ConversationThread
- Notification
- MessageDeliveryLog (new - for tracking)
- EmailCampaign (existing, for re-engagement tracking)

**Backend Functions:**
- sendSMS.js ✅
- suggestBookingSlots.js
- processClientBookingResponse.js
- cleanerBookingApproval.js
- sendBookingConfirmation.js
- sendOnMyWay.js
- sendPostCleaningSummary.js
- cronReengagement.js
- + Updates to existing cronAutomations.js

**Frontend Components:**
- AICommunicationSettings.jsx
- OnMyWayButton.jsx
- SmartBooking.jsx (new page)
- BookingApprovalPage.jsx (new page)
- + Updates to CleanerDashboard.jsx, ChatThread.jsx

---

**Document Version:** 1.0  
**Last Updated:** 2025-12-30  
**Next Review:** After Phase 2 completion