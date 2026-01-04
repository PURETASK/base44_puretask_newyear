# 🧪 NOTIFICATION SYSTEM - TESTING GUIDE

**Interactive Test Page:** `http://localhost:5173/NotificationTestPage`  
**Status:** ✅ Ready to test all notification channels  

---

## 🎯 WHAT THIS TESTS

The Notification Test Page allows you to trigger and verify:

✅ **Client Real-Time Job Updates** (all 8 events)  
✅ **SMS Sending** (if Twilio configured)  
✅ **Push Notifications** (if enabled)  
✅ **Real-Time Delivery** (WebSocket/SSE/Polling)  
✅ **In-App Notifications** (bell icon)  
✅ **Email Notifications** (Base44)  

---

## 🚀 HOW TO TEST

### Step 1: Start the Dev Server
```bash
cd C:\Users\onlyw\Documents\GitHub\base44_puretask_newyear
npm run dev
```

### Step 2: Navigate to Test Page
Open your browser and go to:
```
http://localhost:5173/NotificationTestPage
```

### Step 3: Check System Status
Look at the **System Status** card (top left):
- ✅ **In-App Notifications:** Should be "Active"
- ✅ **Email Service:** Should be "Active"  
- ⚠️ **SMS Service:** Will show "Dev Mode" (logs only, unless Twilio configured)
- ❌ **Push Notifications:** Click "Enable" to request permission
- 🔄 **Real-Time Mode:** Will show "Polling" (30s) by default

### Step 4: Run Tests

#### Option A: Full Lifecycle Test (Recommended)
1. Click the **"🎬 Run Full Test"** button
2. This simulates a complete job from start to finish:
   - Job Accepted
   - Cleaner En Route (15 min delay)
   - Cleaner Arrived
   - Job Started
   - Photos Uploaded
   - **Extra Time Requested (URGENT)**
   - Job Completed
3. Watch the **Notification Log** (right side) for events
4. Check your in-app notifications (bell icon, top right)
5. Check your email inbox

#### Option B: Individual Event Tests
Click any button in the **Client Notifications** section:
- **Job Accepted:** Cleaner accepted the job
- **Cleaner En Route:** GPS check-in, heading to location
- **Cleaner Arrived:** GPS check-in at location
- **Job Started:** Cleaning began
- **Photos Uploaded:** Before/after photos added
- **Extra Time (URGENT):** Cleaner requests more time (requires approval)
- **Job Completed:** Job finished

#### Option C: Direct Channel Tests
- **Send Test SMS:** Test SMS delivery directly (requires Twilio)
- **Send Test Push:** Test push notification directly (requires permission)

---

## 📊 WHAT TO LOOK FOR

### 1. Notification Log (Right Column)
**Expected Output:**
```json
{
  "source": "TEST",
  "action": "Triggering CLEANER_EN_ROUTE event...",
  "timestamp": "2026-01-03T..."
}

{
  "source": "CLIENT_SERVICE",
  "type": "cleaner_en_route",
  "jobId": "test_job_1234567890",
  "message": "Jane Smith is on the way!",
  "timestamp": "2026-01-03T..."
}

{
  "source": "REAL_TIME",
  "type": "notification",
  "payload": { ... },
  "timestamp": "2026-01-03T..."
}
```

**What Each Source Means:**
- **TEST:** Your button click triggered an event
- **CLIENT_SERVICE:** Client notification service processed the event
- **REAL_TIME:** Real-time service delivered the notification
- **SMS_SERVICE:** SMS was sent (or logged in dev mode)
- **PUSH_SERVICE:** Push notification was sent

### 2. In-App Notifications (Bell Icon)
1. Click the **bell icon** in the top right corner
2. You should see new notifications appear
3. Each notification should have:
   - Title (e.g., "🚗 Your cleaner is on the way!")
   - Message with details
   - Timestamp
   - Link to relevant page

### 3. Email Notifications
Check your email inbox for:
- **From:** PureTask (via Base44)
- **Subject:** Various (e.g., "Your cleaner is on the way!")
- **Content:** Professional HTML email with job details

### 4. SMS Notifications (If Twilio Configured)
Check your phone for text messages:
- **From:** Your Twilio phone number
- **Content:** Short, urgent message (e.g., "🚗 Jane Smith is on the way! ETA: 15 minutes. -PureTask")

### 5. Push Notifications (If Enabled)
Check your browser/desktop for native notifications:
- **Icon:** PureTask logo
- **Title:** Event title
- **Body:** Event details
- **Click:** Opens relevant page

---

## ⚙️ CONFIGURATION STATUS

### Phase 1: Works Immediately ✅
**No configuration needed!**
- In-app notifications: ✅ Active
- Email notifications: ✅ Active (Base44)
- Real-time polling: ✅ Active (30s)
- SMS: ⚠️ Dev mode (logs only)
- Push: ❌ Needs user permission

**Action:** Test now! Everything except SMS/Push works.

---

### Phase 2: Enable SMS (+1 day) ⚡
**Current Status:** Dev mode (logs SMS to console instead of sending)

**To Enable Real SMS:**
1. Sign up at https://www.twilio.com
2. Get your credentials:
   - Account SID (starts with `AC...`)
   - Auth Token
   - Phone Number (purchase one, ~$1/month)
3. Add to `.env.local`:
```env
VITE_TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_TWILIO_AUTH_TOKEN=your_auth_token_here
VITE_TWILIO_PHONE_NUMBER=+12345678901
```
4. Restart dev server: `npm run dev`
5. Refresh test page and click "Send Test SMS"

**Expected Result:** SMS delivered to phone!

---

### Phase 3: Enable Push (+1 day) ⚡
**Current Status:** Supported but needs user permission

**To Enable Push:**
1. Generate VAPID keys: https://web-push-codelab.glitch.me/
2. Copy the Public Key
3. Add to `.env.local`:
```env
VITE_VAPID_PUBLIC_KEY=BMxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```
4. Restart dev server: `npm run dev`
5. Refresh test page
6. Click **"Enable"** button next to "Push Notifications"
7. Grant permission in browser popup
8. Click "Send Test Push"

**Expected Result:** Native browser notification appears!

---

### Phase 4: Enable Real-Time WebSocket (+1-2 days) ⚡
**Current Status:** Polling mode (30s delay)

**To Enable Instant Delivery:**
1. Set up WebSocket server (or use Base44 real-time if available)
2. Add to `.env.local`:
```env
VITE_WEBSOCKET_URL=wss://your-backend.com/ws
```
3. Restart dev server: `npm run dev`
4. System will automatically connect via WebSocket
5. Real-Time Mode will change from "🔄 Polling" to "⚡ WebSocket"

**Expected Result:** Notifications appear in <1 second!

---

## 🧪 DETAILED TEST SCENARIOS

### Test 1: Client Anxiety Reduction (Cleaner En Route)
**Objective:** Verify client gets instant notification when cleaner is coming

**Steps:**
1. Click **"Cleaner En Route"** button
2. Watch for notification log entry
3. Check bell icon (should show new notification)
4. Check email inbox (should receive email)
5. If SMS enabled: Check phone (should receive text)
6. If Push enabled: Check desktop (should see notification)

**Expected Result:** Client immediately knows cleaner is on the way

---

### Test 2: Extra Time Request (CRITICAL)
**Objective:** Verify URGENT notification for extra time approval

**Steps:**
1. Click **"Extra Time (URGENT)"** button
2. Watch for notification log entry
3. Check bell icon (should be marked URGENT)
4. Check email inbox (should receive urgent email)
5. **IMPORTANT:** This notification should be sent EVEN IF user disabled notifications in preferences

**Expected Result:**
- In-app notification marked as URGENT
- Email sent immediately
- SMS sent immediately (if enabled)
- Push notification with "Approve" and "Deny" buttons (if enabled)

**Why Critical:** Cleaner is waiting for approval, client needs to respond fast

---

### Test 3: Full Job Lifecycle
**Objective:** Verify all notifications work end-to-end

**Steps:**
1. Click **"🎬 Run Full Test"** button
2. Watch as events are triggered every second:
   - Job Accepted
   - Cleaner En Route
   - Cleaner Arrived
   - Job Started
   - Photos Uploaded
   - Extra Time Requested
   - Job Completed
3. Check notification log for all 7 events
4. Check bell icon for 7 notifications
5. Check email inbox for 7 emails

**Expected Result:** 7 notifications received across all enabled channels

**Duration:** ~7 seconds

---

### Test 4: Real-Time Delivery Speed
**Objective:** Measure notification latency

**Steps:**
1. Note the current time
2. Click any notification button
3. Note when notification appears in log
4. Calculate delay

**Expected Results:**
- **Polling mode:** 0-30 seconds (depends on poll cycle)
- **SSE mode:** <1 second
- **WebSocket mode:** <1 second

---

### Test 5: SMS Delivery (If Twilio Configured)
**Objective:** Verify SMS actually delivers to phone

**Steps:**
1. Update Test Data phone number to your real number
2. Click **"Send Test SMS"** button
3. Check notification log for SMS_SERVICE entry
4. Check phone for text message within 5 seconds

**Expected Result:**
```
🚗 Jane Smith is on the way! ETA: 15 minutes. -PureTask
```

**Troubleshooting:**
- If "Dev Mode": SMS logged to console instead of sent
- If "Failed": Check Twilio credentials
- If "Sent" but no SMS: Check Twilio dashboard for delivery status

---

### Test 6: Push Notification with Actions
**Objective:** Test interactive push notifications

**Steps:**
1. Click **"Extra Time (URGENT)"** button
2. Wait for push notification to appear
3. You should see two buttons: "Approve" and "Deny"
4. Click one of them
5. Browser should open relevant page

**Expected Result:** Interactive notification with working action buttons

---

## 🐛 TROUBLESHOOTING

### Issue: No notifications appearing
**Check:**
1. Is user logged in? (Check top right corner)
2. Is notification service initialized? (Check browser console)
3. Are there errors in the log? (Look for red entries)

**Fix:**
- Refresh the page
- Check browser console (F12) for errors
- Ensure Base44 entities exist (Notification, NotificationPreferences)

---

### Issue: SMS shows "Dev Mode"
**Reason:** Twilio credentials not configured

**Fix:**
1. Add `VITE_TWILIO_*` variables to `.env.local`
2. Restart dev server: `npm run dev`
3. Refresh test page

---

### Issue: Push button says "Enable" but won't work
**Possible Reasons:**
1. VAPID key not configured
2. Service worker not registered
3. Browser doesn't support push (Safari < 16)

**Fix:**
1. Add `VITE_VAPID_PUBLIC_KEY` to `.env.local`
2. Restart dev server
3. Check `public/sw.js` exists
4. Try Chrome/Firefox (best support)

---

### Issue: Real-time stuck on "Polling"
**Reason:** WebSocket/SSE not configured

**Expected Behavior:** This is NORMAL. Polling mode works fine (30s delay).

**To Upgrade:**
1. Set up WebSocket server
2. Add `VITE_WEBSOCKET_URL` to `.env.local`
3. Restart dev server

---

### Issue: Notifications not showing in bell icon
**Check:**
1. Are you creating notifications in Base44?
2. Does the `Notification` entity exist?
3. Is the `recipient_email` correct?

**Fix:**
- Check `Layout.jsx` for notification loading logic
- Ensure `NotificationDisplay.jsx` is rendering
- Check browser console for API errors

---

## 📋 TEST CHECKLIST

### Before Testing:
- [ ] Dev server running (`npm run dev`)
- [ ] Navigated to `/NotificationTestPage`
- [ ] User logged in
- [ ] System status checked

### Phase 1 Tests (No Configuration):
- [ ] Job Accepted notification works
- [ ] Cleaner En Route notification works
- [ ] Cleaner Arrived notification works
- [ ] Job Started notification works
- [ ] Photos Uploaded notification works
- [ ] Extra Time (URGENT) notification works
- [ ] Job Completed notification works
- [ ] Full lifecycle test completes successfully
- [ ] Notifications appear in bell icon
- [ ] Email notifications sent (check inbox)
- [ ] Real-time polling works (check every 30s)

### Phase 2 Tests (SMS Enabled):
- [ ] Twilio credentials configured
- [ ] SMS service shows "Active" not "Dev Mode"
- [ ] Test SMS delivers to phone
- [ ] SMS messages are properly formatted
- [ ] SMS delivery logs in database (if SMSLog entity exists)

### Phase 3 Tests (Push Enabled):
- [ ] VAPID key configured
- [ ] Push permission granted
- [ ] Push service shows "Enabled"
- [ ] Test push appears as native notification
- [ ] Push notification has correct icon
- [ ] Click on push opens correct page
- [ ] Action buttons work (Approve/Deny)

### Phase 4 Tests (WebSocket Enabled):
- [ ] WebSocket URL configured
- [ ] Real-Time Mode shows "WebSocket" not "Polling"
- [ ] Notifications appear in <1 second
- [ ] WebSocket stays connected
- [ ] Auto-reconnects if disconnected
- [ ] Heartbeat keeps connection alive

---

## 🎯 SUCCESS CRITERIA

**Phase 1 (Immediate):**
- ✅ All 7 client notification events trigger successfully
- ✅ Notifications appear in bell icon
- ✅ Emails sent to inbox
- ✅ Notification log shows all events

**Phase 2 (+SMS):**
- ✅ SMS delivers to phone within 5 seconds
- ✅ SMS content is clear and actionable
- ✅ Urgent notifications always sent via SMS

**Phase 3 (+Push):**
- ✅ Push notifications appear as native alerts
- ✅ Push works even when browser tab is closed
- ✅ Action buttons work correctly

**Phase 4 (+WebSocket):**
- ✅ Notifications appear in <1 second
- ✅ No 30-second polling delay
- ✅ Connection remains stable

---

## 🚀 READY TO TEST!

**Current Setup:** Phase 1 (works immediately)

**What Works Now:**
- ✅ All client notifications
- ✅ In-app notifications
- ✅ Email notifications
- ✅ Real-time polling (30s)

**Next Steps:**
1. **Navigate to:** `http://localhost:5173/NotificationTestPage`
2. **Click:** "🎬 Run Full Test"
3. **Watch:** Notification log fill up with events
4. **Check:** Bell icon for notifications
5. **Verify:** Emails in your inbox

**Optional (Later):**
- Set up Twilio for SMS (Phase 2)
- Enable Push notifications (Phase 3)
- Configure WebSocket (Phase 4)

---

**🎊 HAPPY TESTING! 🎊**

**The notification system is ready to demonstrate!**

