# PureTask Loyalty Program Guide

## 🎁 Rewards Catalog

### 1. **10% Off Next Booking** (100 points)
- Immediate 10% discount on next cleaning service
- Valid for 30 days after redemption
- Stackable with tier benefits

### 2. **15% Off Next Booking** (200 points)
- Immediate 15% discount on next cleaning service
- Valid for 30 days after redemption
- Great value for regular customers

### 3. **20% Off Next Booking** (350 points)
- Maximum discount reward - 20% off
- Valid for 30 days after redemption
- Best value for high-point earners

### 4. **Free Add-On Service** (150 points)
- One free add-on service (windows, oven, refrigerator, etc.)
- Valid for 60 days
- Choose any add-on worth up to $30

### 5. **Priority Booking Pass** (250 points)
- Jump to the front of the booking queue
- Active for 7 days
- Get access to premium time slots

### 6. **Early Access to New Cleaners** (300 points)
- Book with new Elite cleaners before public release
- Valid for 14 days
- Be the first to experience top talent

---

## 📱 Automated Notifications Schedule

### 1. **Points Earned Notification**
**When:** Immediately after booking completion or qualifying action
**Content:** 
- Points earned amount
- Reason for earning
- New total balance
**Example:** "+100 Loyalty Points! You earned 100 points for completing your booking. Total: 450 points"

### 2. **Tier Upgrade Notification**
**When:** Immediately when crossing tier threshold
**Content:**
- New tier name
- Congratulations message
- List of new benefits unlocked
**Priority:** High
**Example:** "🎉 Upgraded to Silver Tier! Congratulations! You've reached Silver tier. Enjoy 10% off every 5th booking, free add-ons, and priority support!"

### 3. **Reward Redeemed Notification**
**When:** Immediately after redeeming a reward
**Content:**
- Reward name
- Usage instructions
- Expiration reminder
**Example:** "🎁 Reward Redeemed! 15% Off Next Booking - Use within 30 days"

### 4. **Birthday Bonus Notification**
**When:** Automatically on client's birthday (checked daily via cron)
**Content:**
- Birthday greeting
- Bonus points awarded (100 points)
- Personal touch
**Priority:** High
**Example:** "🎂 Happy Birthday! We added 100 bonus loyalty points to your account. Enjoy your special day!"

### 5. **Monthly Loyalty Summary**
**When:** First day of each month (via scheduled function)
**Content:**
- Current tier status
- Current point balance
- Points needed for next tier
- Available rewards reminder
**Example:** "📊 Your Monthly Loyalty Update: Gold Tier • 1,850 points • 150 points to Platinum tier"

### 6. **Reward Expiration Warning**
**When:** 7 days before reward expires
**Content:**
- Reward name
- Days remaining
- Call to action to use it
**Example:** "⏰ Reward Expiring Soon! Your '20% Off Next Booking' expires in 7 days. Book now to use it!"

---

## 🎯 Tier Benefits Summary

### Bronze (0-499 points)
- 5% discount on 5th booking
- Birthday bonus points

### Silver (500-1,499 points)
- 10% discount on every 5th booking
- Free add-on service
- Priority customer support

### Gold (1,500-2,999 points)
- 15% discount on every 5th booking
- 2 free add-ons per month
- Priority booking access
- Early access to new cleaners

### Platinum (3,000+ points)
- 20% off ALL bookings
- Free add-on with every booking
- VIP priority support
- Dedicated account manager
- Exclusive perks and experiences

---

## 💰 Points Earning Rules

- **Complete a Booking:** 100 points
- **First Booking Bonus:** 50 points (one-time)
- **Submit a Review:** 25 points
- **Refer a Friend:** 200 points (when they complete first booking)
- **Birthday Bonus:** 100 points (automatic, once per year)
- **Active Subscription:** 50 points per month

---

## 🔄 Integration Points

### Booking System Integration
- Points automatically awarded when booking status changes to "approved"
- Rewards can be applied at checkout
- Active rewards shown in booking flow

### Profile Integration
- Loyalty tier badge displayed on profile
- Points balance visible in header/wallet
- Tier progress bar in dashboard

### Notification System
- All loyalty events trigger notifications
- In-app + email notifications
- Push notifications for tier upgrades

### Analytics Integration
- Track redemption rates
- Monitor tier distribution
- Measure engagement with loyalty program