# 🧪 PURETASK COMPREHENSIVE TEST CAMPAIGN

**Version:** 1.0  
**Date:** January 2, 2026  
**Status:** Ready for Implementation  
**Coverage Target:** 90%+ across all systems  
**Test Types:** Unit, Integration, E2E, Performance, Security, UAT

---

## 📋 Table of Contents

1. [Test Strategy Overview](#test-strategy-overview)
2. [Test Types & Pyramid](#test-types--pyramid)
3. [Booking System Tests](#booking-system-tests)
4. [Payment & Credit System Tests](#payment--credit-system-tests)
5. [Payout System Tests (10% Instant Cash-Out)](#payout-system-tests)
6. [Auto-Approval System Tests (18hr Window)](#auto-approval-system-tests)
7. [Smart Matching Algorithm Tests (20% Reliability)](#smart-matching-algorithm-tests)
8. [Pet Fee System Tests ($30)](#pet-fee-system-tests)
9. [Reliability Scoring Tests](#reliability-scoring-tests)
10. [Tier System Tests](#tier-system-tests)
11. [GPS Verification Tests](#gps-verification-tests)
12. [Photo Verification Tests](#photo-verification-tests)
13. [Dispute Resolution Tests](#dispute-resolution-tests)
14. [Membership Tier Tests](#membership-tier-tests)
15. [Loyalty & Referral Program Tests](#loyalty--referral-program-tests)
16. [Background Check Tests](#background-check-tests)
17. [Messaging System Tests](#messaging-system-tests)
18. [Notification System Tests](#notification-system-tests)
19. [Recurring Booking Tests](#recurring-booking-tests)
20. [Admin Dashboard Tests](#admin-dashboard-tests)
21. [Security & Penetration Tests](#security--penetration-tests)
22. [Performance & Load Tests](#performance--load-tests)
23. [Mobile App Tests](#mobile-app-tests)
24. [Edge Cases & Failure Scenarios](#edge-cases--failure-scenarios)
25. [User Acceptance Testing (UAT)](#user-acceptance-testing)
26. [Regression Testing Strategy](#regression-testing-strategy)
27. [Test Automation Framework](#test-automation-framework)
28. [Test Metrics & Reporting](#test-metrics--reporting)

---

## 🎯 TEST STRATEGY OVERVIEW

### **Testing Philosophy**

```
┌─────────────────────────────────────────────────────────────────┐
│  🎯 PURETASK TESTING PRINCIPLES                                 │
├─────────────────────────────────────────────────────────────────┤
│  1. QUALITY FIRST                                               │
│     • No feature ships without 80%+ test coverage               │
│     • Critical paths require 95%+ coverage                      │
│     • Financial systems require 100% coverage                   │
│                                                                 │
│  2. TEST EARLY, TEST OFTEN                                      │
│     • Unit tests written alongside code (TDD)                   │
│     • Integration tests run on every commit                     │
│     • E2E tests run on every PR                                 │
│                                                                 │
│  3. REAL-WORLD SCENARIOS                                        │
│     • Test data mirrors production patterns                     │
│     • Edge cases from actual user behavior                      │
│     • Failure scenarios from incident reports                   │
│                                                                 │
│  4. AUTOMATION OVER MANUAL                                      │
│     • 90% of tests automated                                    │
│     • Manual testing for UX/visual only                         │
│     • CI/CD pipeline runs all tests automatically               │
│                                                                 │
│  5. PERFORMANCE AS FEATURE                                      │
│     • Every test measures response time                         │
│     • Load tests simulate peak traffic (10x expected)           │
│     • Performance regressions block deployment                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### **Test Coverage Goals**

```
┌─────────────────────────────────────────────────────────────────┐
│  📊 COVERAGE TARGETS BY SYSTEM                                  │
├─────────────────────────────────────────────────────────────────┤
│  SYSTEM                          │ UNIT │ INTEGRATION │ E2E     │
├──────────────────────────────────┼──────┼─────────────┼─────────┤
│  Booking System                  │ 95%  │    90%      │  85%    │
│  Payment & Credits               │ 100% │    95%      │  90%    │
│  Payout System (10% instant)⭐   │ 100% │    95%      │  90%    │
│  Auto-Approval (18hr)⭐          │ 100% │    95%      │  85%    │
│  Smart Matching (20% reliability)⭐│ 95% │    90%      │  80%    │
│  Pet Fee System ($30)⭐          │ 100% │    95%      │  85%    │
│  Reliability Scoring             │ 100% │    90%      │  75%    │
│  Tier System                     │ 95%  │    90%      │  80%    │
│  GPS Verification                │ 95%  │    85%      │  80%    │
│  Photo Verification              │ 90%  │    85%      │  80%    │
│  Dispute Resolution              │ 100% │    95%      │  85%    │
│  Membership Tiers                │ 95%  │    90%      │  85%    │
│  Loyalty/Referral Programs       │ 90%  │    85%      │  75%    │
│  Background Checks               │ 95%  │    90%      │  70%    │
│  Messaging System                │ 85%  │    80%      │  75%    │
│  Notifications                   │ 90%  │    85%      │  70%    │
│  Recurring Bookings              │ 95%  │    90%      │  85%    │
│  Admin Dashboard                 │ 85%  │    80%      │  75%    │
├──────────────────────────────────┼──────┼─────────────┼─────────┤
│  OVERALL TARGET                  │ 95%  │    90%      │  80%    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🏗️ TEST TYPES & PYRAMID

### **Testing Pyramid**

```
                    ▲
                   ╱ ╲
                  ╱   ╲
                 ╱ E2E ╲          10% - Manual exploratory
                ╱───────╲         (User journeys, visual QA)
               ╱         ╲
              ╱           ╲       20% - End-to-End
             ╱ Integration╲       (Full workflows, API chains)
            ╱─────────────╲
           ╱               ╲
          ╱                 ╲     30% - Integration
         ╱    Unit Tests     ╲    (Component interactions, API contracts)
        ╱─────────────────────╲
       ╱                       ╲
      ╱                         ╲ 40% - Unit Tests
     ╱___________________________╲ (Pure functions, isolated components)
```

---

### **Test Environment Strategy**

```
┌─────────────────────────────────────────────────────────────────┐
│  🌍 TEST ENVIRONMENTS                                           │
├─────────────────────────────────────────────────────────────────┤
│  1. LOCAL (Developer Machine)                                   │
│     ├─ Purpose: Development, unit tests, debugging              │
│     ├─ Data: Mock data, test fixtures                           │
│     ├─ Tests Run: Unit tests (instant feedback)                 │
│     └─ Tools: Vitest, React Testing Library                     │
│                                                                 │
│  2. CI/CD (GitHub Actions)                                      │
│     ├─ Purpose: Automated testing on every commit/PR            │
│     ├─ Data: Seeded test database (reset per run)               │
│     ├─ Tests Run: Unit + Integration (< 5 min)                  │
│     └─ Tools: Vitest, Playwright, Docker                        │
│                                                                 │
│  3. STAGING (Pre-Production)                                    │
│     ├─ Purpose: Final validation before production              │
│     ├─ Data: Production-like dataset (anonymized)               │
│     ├─ Tests Run: E2E, Performance, Security                    │
│     ├─ Access: Internal team only                               │
│     └─ Tools: Playwright, k6, OWASP ZAP                         │
│                                                                 │
│  4. PRODUCTION (Live)                                           │
│     ├─ Purpose: Real users, monitoring, smoke tests             │
│     ├─ Data: Real data (PII protected)                          │
│     ├─ Tests Run: Smoke tests, synthetic monitoring             │
│     └─ Tools: Datadog, Sentry, Custom health checks             │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📘 BOOKING SYSTEM TESTS

### **Test Suite 1: Booking Creation**

#### **Unit Tests (40 tests)**

```javascript
describe('Booking Creation - Unit Tests', () => {
  
  test('1.1: Calculate booking price - Basic cleaning', () => {
    const booking = {
      cleaning_type: 'basic',
      hours: 3,
      base_rate: 400, // credits/hr
      addon_rate: 0,
      has_pets: false
    };
    
    const result = calculateBookingPrice(booking);
    
    expect(result.hourly_credits).toBe(1200); // 400 × 3
    expect(result.pet_fee_credits).toBe(0);
    expect(result.final_price).toBe(1200);
  });
  
  test('1.2: Calculate booking price - Deep cleaning', () => {
    const booking = {
      cleaning_type: 'deep',
      hours: 4,
      base_rate: 450,
      addon_rate: 40, // deep addon
      has_pets: false
    };
    
    const result = calculateBookingPrice(booking);
    
    expect(result.hourly_credits).toBe(1960); // (450+40) × 4
    expect(result.addon_rate).toBe(40);
    expect(result.final_price).toBe(1960);
  });
  
  test('1.3: Calculate booking price - With pet fee ⭐', () => {
    const booking = {
      cleaning_type: 'basic',
      hours: 3,
      base_rate: 400,
      addon_rate: 0,
      has_pets: true // PET FEE TRIGGER
    };
    
    const result = calculateBookingPrice(booking);
    
    expect(result.hourly_credits).toBe(1200);
    expect(result.pet_fee_credits).toBe(300); // $30 = 300 credits ⭐
    expect(result.final_price).toBe(1500); // 1200 + 300
  });
  
  test('1.4: Calculate booking price - Move-out with pets', () => {
    const booking = {
      cleaning_type: 'moveout',
      hours: 5,
      base_rate: 500,
      addon_rate: 60, // move-out addon
      has_pets: true
    };
    
    const result = calculateBookingPrice(booking);
    
    expect(result.hourly_credits).toBe(2800); // (500+60) × 5
    expect(result.pet_fee_credits).toBe(300);
    expect(result.final_price).toBe(3100);
  });
  
  test('1.5: Apply membership discount - Premium member', () => {
    const booking = {
      final_price: 1500
    };
    const clientProfile = {
      membership_tier: 'premium',
      membership_status: 'active'
    };
    
    const result = applyMembershipDiscount(booking, clientProfile);
    
    expect(result.discount_percent).toBe(5);
    expect(result.discount_credits).toBe(75); // 5% of 1500
    expect(result.final_price_after_discount).toBe(1425);
  });
  
  test('1.6: Apply membership discount - VIP member', () => {
    const booking = {
      final_price: 2000
    };
    const clientProfile = {
      membership_tier: 'vip',
      membership_status: 'active'
    };
    
    const result = applyMembershipDiscount(booking, clientProfile);
    
    expect(result.discount_percent).toBe(10);
    expect(result.discount_credits).toBe(200); // 10% of 2000
    expect(result.final_price_after_discount).toBe(1800);
  });
  
  test('1.7: Recurring booking discount', () => {
    const booking = {
      final_price: 1500,
      is_recurring: true
    };
    
    const result = applyRecurringDiscount(booking);
    
    expect(result.discount_percent).toBe(10);
    expect(result.discount_credits).toBe(150);
    expect(result.final_price_after_discount).toBe(1350);
  });
  
  test('1.8: Multi-booking discount (5+ bookings)', () => {
    const bookings = [
      { final_price: 1200 },
      { final_price: 1200 },
      { final_price: 1200 },
      { final_price: 1200 },
      { final_price: 1200 }
    ];
    
    const result = applyMultiBookingDiscount(bookings);
    
    expect(result.total_before_discount).toBe(6000);
    expect(result.discount_percent).toBe(5); // 5% for 5-9 bookings
    expect(result.discount_credits).toBe(300);
    expect(result.total_after_discount).toBe(5700);
  });
  
  test('1.9: Stack multiple discounts correctly', () => {
    const booking = {
      cleaning_type: 'basic',
      hours: 3,
      base_rate: 400,
      has_pets: true,
      is_recurring: true
    };
    const clientProfile = {
      membership_tier: 'vip',
      membership_status: 'active'
    };
    
    const result = calculateFinalPrice(booking, clientProfile);
    
    // Base: 1200, Pet: +300 = 1500
    // Recurring: -150 (10%) = 1350
    // VIP: -135 (10%) = 1215
    expect(result.final_price).toBe(1215);
    expect(result.discounts_applied).toContain('recurring');
    expect(result.discounts_applied).toContain('vip_member');
  });
  
  test('1.10: Validate booking date - Not in past', () => {
    const booking = {
      date: '2023-01-01', // Past date
      start_time: '10:00'
    };
    
    const result = validateBookingDate(booking);
    
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Booking date cannot be in the past');
  });
  
  test('1.11: Validate booking date - Not too far future', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 100); // 100 days ahead
    
    const booking = {
      date: futureDate.toISOString().split('T')[0],
      start_time: '10:00'
    };
    
    const result = validateBookingDate(booking);
    
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Bookings can only be made up to 90 days in advance');
  });
  
  test('1.12: Validate booking hours - Minimum 2 hours', () => {
    const booking = {
      hours: 1.5 // Too short
    };
    
    const result = validateBookingHours(booking);
    
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Minimum booking duration is 2 hours');
  });
  
  test('1.13: Validate booking hours - Maximum 8 hours', () => {
    const booking = {
      hours: 10 // Too long
    };
    
    const result = validateBookingHours(booking);
    
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Maximum booking duration is 8 hours per day');
  });
  
  test('1.14: Check client credit balance - Sufficient', () => {
    const clientProfile = {
      credit_balance: 2000
    };
    const booking = {
      final_price: 1500
    };
    
    const result = checkCreditBalance(clientProfile, booking);
    
    expect(result.hasSufficientBalance).toBe(true);
    expect(result.balance_after).toBe(500);
  });
  
  test('1.15: Check client credit balance - Insufficient', () => {
    const clientProfile = {
      credit_balance: 1000
    };
    const booking = {
      final_price: 1500
    };
    
    const result = checkCreditBalance(clientProfile, booking);
    
    expect(result.hasSufficientBalance).toBe(false);
    expect(result.shortfall).toBe(500);
    expect(result.error).toBe('Insufficient credits. Need 500 more credits.');
  });
  
  // ... 25 more unit tests covering:
  // - Address validation (geocoding)
  // - Cleaner availability checking
  // - Time slot conflicts
  // - Additional services pricing
  // - Bundle offer application
  // - First booking bonus
  // - Client profile completeness
  // - Special instructions validation
  // - Parking instructions
  // - Entry method validation
  // - Home details validation
  // - Square footage validation
  // - Bedroom/bathroom validation
  // - Service type validation
  // - Cleaner rate validation (within tier range)
  // - etc.
});
```

---

#### **Integration Tests (30 tests)**

```javascript
describe('Booking Creation - Integration Tests', () => {
  
  test('2.1: Full booking flow - Client creates booking', async () => {
    // Setup
    const client = await createTestClient({
      credit_balance: 2000,
      membership_tier: 'basic'
    });
    const cleaner = await createTestCleaner({
      tier: 'Pro',
      base_rate: 450,
      is_accepting_jobs: true
    });
    
    // Act
    const bookingData = {
      client_email: client.email,
      cleaner_email: cleaner.email,
      cleaning_type: 'deep',
      date: '2026-01-15',
      start_time: '10:00',
      hours: 4,
      address: '123 Main St, Los Angeles, CA 90210',
      has_pets: true
    };
    
    const booking = await createBooking(bookingData);
    
    // Assert
    expect(booking.status).toBe('awaiting_cleaner');
    expect(booking.final_price).toBe(1960 + 300); // deep + pet fee
    expect(booking.payment_status).toBe('hold');
    
    // Check client credits were held
    const updatedClient = await getClientProfile(client.email);
    expect(updatedClient.credit_balance).toBe(2000); // Not charged yet, just held
    
    // Check notification sent to cleaner
    const notifications = await getNotifications(cleaner.email);
    expect(notifications).toContainEqual(
      expect.objectContaining({
        type: 'booking_request',
        booking_id: booking.id
      })
    );
  });
  
  test('2.2: Cleaner accepts booking', async () => {
    // Setup
    const booking = await createTestBooking({
      status: 'awaiting_cleaner'
    });
    
    // Act
    const result = await cleanerAcceptsBooking(booking.id, booking.cleaner_email);
    
    // Assert
    expect(result.status).toBe('accepted');
    expect(result.accepted_at).toBeDefined();
    expect(result.payment_status).toBe('authorized');
    
    // Check client notification
    const clientNotifications = await getNotifications(booking.client_email);
    expect(clientNotifications).toContainEqual(
      expect.objectContaining({
        type: 'booking_accepted',
        booking_id: booking.id
      })
    );
  });
  
  test('2.3: Cleaner declines booking', async () => {
    // Setup
    const booking = await createTestBooking({
      status: 'awaiting_cleaner'
    });
    const client = await getClientProfile(booking.client_email);
    const initialBalance = client.credit_balance;
    
    // Act
    const result = await cleanerDeclinesBooking(
      booking.id, 
      booking.cleaner_email,
      'Schedule conflict'
    );
    
    // Assert
    expect(result.status).toBe('declined');
    expect(result.payment_status).toBe('refunded');
    
    // Check credits refunded to client
    const updatedClient = await getClientProfile(booking.client_email);
    expect(updatedClient.credit_balance).toBe(initialBalance + booking.final_price);
    
    // Check client notification
    const notifications = await getNotifications(booking.client_email);
    expect(notifications).toContainEqual(
      expect.objectContaining({
        type: 'booking_declined',
        booking_id: booking.id
      })
    );
  });
  
  test('2.4: Booking expires after 24 hours (no cleaner response)', async () => {
    // Setup
    const booking = await createTestBooking({
      status: 'awaiting_cleaner',
      created_at: new Date(Date.now() - 25 * 60 * 60 * 1000) // 25 hours ago
    });
    
    // Act (cron job runs)
    await runBookingExpiryCheck();
    
    // Assert
    const updatedBooking = await getBooking(booking.id);
    expect(updatedBooking.status).toBe('expired');
    expect(updatedBooking.payment_status).toBe('refunded');
    
    // Check client credits refunded
    const client = await getClientProfile(booking.client_email);
    expect(client.credit_balance).toBeGreaterThanOrEqual(booking.final_price);
    
    // Check notifications sent
    const notifications = await getNotifications(booking.client_email);
    expect(notifications).toContainEqual(
      expect.objectContaining({
        type: 'booking_expired',
        booking_id: booking.id
      })
    );
  });
  
  test('2.5: Pet fee applied correctly when has_pets = true', async () => {
    // Setup
    const client = await createTestClient({
      credit_balance: 3000
    });
    const cleaner = await createTestCleaner({
      tier: 'Pro',
      base_rate: 400
    });
    
    // Act
    const booking = await createBooking({
      client_email: client.email,
      cleaner_email: cleaner.email,
      cleaning_type: 'basic',
      hours: 3,
      has_pets: true, // ⭐ PET FEE SHOULD BE ADDED
      address: '123 Main St, Los Angeles, CA 90210',
      date: '2026-01-20',
      start_time: '14:00'
    });
    
    // Assert
    expect(booking.pet_fee_credits).toBe(300); // $30 = 300 credits ⭐
    expect(booking.hourly_credits).toBe(1200); // 400 × 3
    expect(booking.final_price).toBe(1500); // 1200 + 300
    
    // Check credit transaction recorded
    const transaction = await getCreditTransaction(booking.id);
    expect(transaction.amount).toBe(-1500);
    expect(transaction.type).toBe('booking_charge');
    expect(transaction.description).toContain('pet fee');
  });
  
  test('2.6: No pet fee when has_pets = false', async () => {
    // Setup
    const client = await createTestClient({
      credit_balance: 2000
    });
    const cleaner = await createTestCleaner({
      tier: 'Pro',
      base_rate: 400
    });
    
    // Act
    const booking = await createBooking({
      client_email: client.email,
      cleaner_email: cleaner.email,
      cleaning_type: 'basic',
      hours: 3,
      has_pets: false, // No pet fee
      address: '123 Main St, Los Angeles, CA 90210',
      date: '2026-01-20',
      start_time: '14:00'
    });
    
    // Assert
    expect(booking.pet_fee_credits).toBe(0);
    expect(booking.final_price).toBe(1200); // No pet fee added
  });
  
  test('2.7: Smart matching suggests best cleaners', async () => {
    // Setup
    const client = await createTestClient({
      latitude: 34.0522,
      longitude: -118.2437 // Downtown LA
    });
    
    // Create 5 cleaners with different attributes
    const cleaners = await Promise.all([
      createTestCleaner({
        name: 'Elite Cleaner',
        tier: 'Elite',
        reliability_score: 95,
        average_rating: 4.9,
        latitude: 34.0522, // Same location
        longitude: -118.2437,
        base_rate: 650
      }),
      createTestCleaner({
        name: 'Pro Cleaner',
        tier: 'Pro',
        reliability_score: 82,
        average_rating: 4.7,
        latitude: 34.0600, // Nearby
        longitude: -118.2500,
        base_rate: 500
      }),
      createTestCleaner({
        name: 'Semi Pro',
        tier: 'Semi Pro',
        reliability_score: 68,
        average_rating: 4.5,
        latitude: 34.0700, // Further
        longitude: -118.2700,
        base_rate: 380
      }),
      createTestCleaner({
        name: 'Developing',
        tier: 'Developing',
        reliability_score: 52,
        average_rating: 4.2,
        latitude: 34.0522, // Same location
        longitude: -118.2437,
        base_rate: 250
      }),
      createTestCleaner({
        name: 'Far Elite',
        tier: 'Elite',
        reliability_score: 93,
        average_rating: 4.9,
        latitude: 34.1522, // 10 miles away
        longitude: -118.3437,
        base_rate: 680
      })
    ]);
    
    // Act
    const booking = {
      client_email: client.email,
      latitude: 34.0522,
      longitude: -118.2437,
      cleaning_type: 'deep',
      date: '2026-01-25',
      start_time: '10:00'
    };
    
    const suggestedCleaners = await getSmartMatchSuggestions(booking);
    
    // Assert - Reliability weight is now 20% ⭐
    expect(suggestedCleaners[0].name).toBe('Elite Cleaner'); 
    // Distance 0mi + Elite tier + 95 score + same location = TOP MATCH
    
    expect(suggestedCleaners[1].name).toBe('Pro Cleaner');
    // Close distance + Pro tier + 82 score = SECOND
    
    expect(suggestedCleaners).toHaveLength(5);
    
    // Verify match scores
    expect(suggestedCleaners[0].match_score).toBeGreaterThan(90);
    expect(suggestedCleaners[0].match_score).toBeGreaterThan(
      suggestedCleaners[1].match_score
    );
    
    // Verify reliability weight is 20%
    const scoreBreakdown = suggestedCleaners[0].score_breakdown;
    expect(scoreBreakdown.reliability_weight).toBe(0.20); // ⭐ 20%
    expect(scoreBreakdown.reliability_contribution).toBeGreaterThan(18); // 95 * 0.20 = 19
  });
  
  // ... 23 more integration tests covering:
  // - Booking with additional services
  // - Booking with special instructions
  // - Booking with parking/entry info
  // - Booking time slot conflicts
  // - Booking with unavailable cleaner
  // - Booking outside service area
  // - Booking with insufficient credits (error handling)
  // - Booking with invalid address
  // - Booking with invalid date/time
  // - Booking cancellation by client
  // - Booking cancellation by cleaner
  // - Booking modification requests
  // - Recurring booking setup
  // - Multi-booking creation
  // - First-time booking flow
  // - Favorite cleaner booking
  // - Same-day booking (surge pricing)
  // - Weekend booking (dynamic pricing)
  // - Holiday booking (dynamic pricing)
  // - Commercial booking flow
  // - VIP client priority booking
  // - Booking notifications (all parties)
  // - Booking analytics tracking
});
```

---

### **Test Suite 2: Booking Completion Workflow**

#### **E2E Tests (20 tests)**

```javascript
describe('Booking Completion - E2E Tests', () => {
  
  test('3.1: Complete booking lifecycle - Happy path', async () => {
    // Setup: Create client, cleaner, and booking
    const { client, cleaner, booking } = await setupCompleteScenario();
    
    // Step 1: Client creates booking
    await page.goto('/booking/new');
    await page.fill('[name="address"]', '123 Main St, Los Angeles, CA');
    await page.selectOption('[name="cleaning_type"]', 'basic');
    await page.fill('[name="hours"]', '3');
    await page.fill('[name="date"]', '2026-01-20');
    await page.fill('[name="start_time"]', '10:00');
    await page.check('[name="has_pets"]'); // ⭐ Check pet checkbox
    await page.click('button:text("Continue to Cleaner Selection")');
    
    // Verify pet fee shown
    await expect(page.locator('.pet-fee-notice')).toContainText('$30');
    
    // Step 2: Select cleaner
    await page.click(`.cleaner-card[data-email="${cleaner.email}"]`);
    await page.click('button:text("Continue to Review")');
    
    // Step 3: Review & Submit
    await expect(page.locator('.total-price')).toContainText('$150'); // $120 + $30 pet
    await page.click('button:text("Confirm Booking")');
    
    // Verify success
    await expect(page.locator('.success-message')).toBeVisible();
    
    // Step 4: Cleaner accepts (simulate)
    await page.goto(`/cleaner/bookings/${booking.id}`);
    await page.click('button:text("Accept Booking")');
    
    // Step 5: Cleaner checks in on job day
    await simulateJobDay(booking);
    await page.goto(`/cleaner/bookings/${booking.id}`);
    await page.click('button:text("Check In")');
    await expect(page.locator('.status')).toContainText('In Progress');
    
    // Step 6: Cleaner uploads photos & checks out
    await uploadPhoto(page, 'before', 'before-photo.jpg');
    await uploadPhoto(page, 'after', 'after-photo.jpg');
    await page.click('button:text("Check Out")');
    await expect(page.locator('.status')).toContainText('Completed');
    
    // Step 7: Client reviews & approves
    await page.goto(`/client/bookings/${booking.id}`);
    await expect(page.locator('.before-after-photos')).toBeVisible();
    await page.click('button:text("Approve Work")');
    
    // Step 8: Payment processed
    await expect(page.locator('.payment-status')).toContainText('Paid');
    
    // Step 9: Client leaves review
    await page.click('button:text("Leave Review")');
    await page.click('[data-rating="5"]');
    await page.fill('[name="comment"]', 'Excellent work!');
    await page.click('button:text("Submit Review")');
    
    // Verify final state
    const finalBooking = await getBooking(booking.id);
    expect(finalBooking.status).toBe('approved');
    expect(finalBooking.payment_status).toBe('paid');
    
    // Verify cleaner payout created
    const payout = await getCleanerPayout(cleaner.email, booking.id);
    expect(payout.status).toBe('pending');
    expect(payout.amount_usd).toBe(127.50); // (1500 credits * 0.85) / 10
  });
  
  test('3.2: GPS check-in validation - Cleaner at location', async () => {
    // Setup
    const { cleaner, booking } = await setupActiveBooking();
    
    // Mock GPS coordinates (within 100m of booking address)
    const gpsData = {
      latitude: 34.0522,
      longitude: -118.2437,
      accuracy: 10 // meters
    };
    
    // Act
    await page.goto(`/cleaner/bookings/${booking.id}`);
    await mockGPS(gpsData);
    await page.click('button:text("Check In")');
    
    // Assert
    await expect(page.locator('.check-in-success')).toContainText('Checked in successfully');
    
    const updatedBooking = await getBooking(booking.id);
    expect(updatedBooking.status).toBe('in_progress');
    expect(updatedBooking.check_in_latitude).toBeCloseTo(gpsData.latitude, 4);
    expect(updatedBooking.check_in_distance_from_address).toBeLessThan(100);
  });
  
  test('3.3: GPS check-in validation - Cleaner NOT at location', async () => {
    // Setup
    const { cleaner, booking } = await setupActiveBooking();
    
    // Mock GPS coordinates (5 miles away from booking address)
    const gpsData = {
      latitude: 34.1522, // Different location
      longitude: -118.3437,
      accuracy: 10
    };
    
    // Act
    await page.goto(`/cleaner/bookings/${booking.id}`);
    await mockGPS(gpsData);
    await page.click('button:text("Check In")');
    
    // Assert
    await expect(page.locator('.error-message')).toContainText(
      'You must be within 100 meters of the booking location to check in'
    );
    
    const booking = await getBooking(booking.id);
    expect(booking.status).not.toBe('in_progress'); // Still scheduled
    expect(booking.check_in_time).toBeNull();
  });
  
  test('3.4: Photo verification - Before/after required', async () => {
    // Setup
    const { cleaner, booking } = await setupInProgressBooking();
    
    // Act - Try to check out without photos
    await page.goto(`/cleaner/bookings/${booking.id}`);
    await page.click('button:text("Check Out")');
    
    // Assert - Should show error
    await expect(page.locator('.error-message')).toContainText(
      'Please upload before and after photos before checking out'
    );
    
    // Now upload photos
    await uploadPhoto(page, 'before', 'before.jpg');
    await uploadPhoto(page, 'after', 'after.jpg');
    
    // Try again
    await page.click('button:text("Check Out")');
    
    // Should succeed
    await expect(page.locator('.check-out-success')).toBeVisible();
  });
  
  // ... 16 more E2E tests covering:
  // - Auto-approval after 18 hours (⭐ NEW PARAMETER)
  // - Auto-approval reminders (3hrs before deadline)
  // - Client manual approval
  // - Client dispute after check-out
  // - Late check-in (>15min penalty)
  // - No-show scenario
  // - Incomplete work scenario
  // - Additional services added mid-job
  // - Emergency cancellation
  // - Weather cancellation
  // - Client not home (entry issue)
  // - Cleaner runs out of time
  // - Product allergies scenario
  // - Pet handling scenario
  // - Multiple bookings same day
  // - Recurring booking first instance
});
```

---

## 💳 PAYMENT & CREDIT SYSTEM TESTS

### **Test Suite 4: Credit Purchases**

#### **Unit Tests (25 tests)**

```javascript
describe('Credit Purchases - Unit Tests', () => {
  
  test('4.1: Calculate credit package - 500 credits (no bonus)', () => {
    const package = getCreditPackage(500);
    
    expect(package.credits).toBe(500);
    expect(package.price_usd).toBe(50);
    expect(package.bonus_credits).toBe(0);
    expect(package.total_credits).toBe(500);
  });
  
  test('4.2: Calculate credit package - 1000 credits (5% bonus)', () => {
    const package = getCreditPackage(1000);
    
    expect(package.credits).toBe(1000);
    expect(package.price_usd).toBe(95);
    expect(package.bonus_credits).toBe(50); // 5% bonus
    expect(package.total_credits).toBe(1050);
  });
  
  test('4.3: Calculate credit package - 2500 credits (10% bonus)', () => {
    const package = getCreditPackage(2500);
    
    expect(package.credits).toBe(2500);
    expect(package.price_usd).toBe(225);
    expect(package.bonus_credits).toBe(250); // 10% bonus
    expect(package.total_credits).toBe(2750);
  });
  
  test('4.4: Calculate credit package - 5000 credits (15% bonus)', () => {
    const package = getCreditPackage(5000);
    
    expect(package.credits).toBe(5000);
    expect(package.price_usd).toBe(425);
    expect(package.bonus_credits).toBe(750); // 15% bonus
    expect(package.total_credits).toBe(5750);
  });
  
  test('4.5: Apply first-time purchase bonus (100 free credits)', () => {
    const client = {
      total_credits_purchased: 0 // First purchase
    };
    const package = {
      total_credits: 1050 // 1000 + 50 bonus
    };
    
    const result = applyFirstTimePurchaseBonus(client, package);
    
    expect(result.first_time_bonus).toBe(100);
    expect(result.final_credits).toBe(1150); // 1050 + 100
  });
  
  test('4.6: No first-time bonus for repeat purchases', () => {
    const client = {
      total_credits_purchased: 1000 // Not first purchase
    };
    const package = {
      total_credits: 1050
    };
    
    const result = applyFirstTimePurchaseBonus(client, package);
    
    expect(result.first_time_bonus).toBe(0);
    expect(result.final_credits).toBe(1050); // No bonus
  });
  
  test('4.7: Process Stripe payment - Success', async () => {
    const paymentIntent = {
      id: 'pi_test_123',
      amount: 9500, // $95.00 in cents
      currency: 'usd',
      status: 'succeeded'
    };
    
    const result = await processStripePayment(paymentIntent);
    
    expect(result.success).toBe(true);
    expect(result.stripe_charge_id).toBe('pi_test_123');
    expect(result.amount_usd).toBe(95);
  });
  
  test('4.8: Process Stripe payment - Card declined', async () => {
    const paymentIntent = {
      id: 'pi_test_456',
      status: 'requires_payment_method',
      last_payment_error: {
        code: 'card_declined'
      }
    };
    
    const result = await processStripePayment(paymentIntent);
    
    expect(result.success).toBe(false);
    expect(result.error_code).toBe('card_declined');
    expect(result.user_message).toBe('Your card was declined. Please try another payment method.');
  });
  
  test('4.9: Process Stripe payment - Insufficient funds', async () => {
    const paymentIntent = {
      id: 'pi_test_789',
      status: 'requires_payment_method',
      last_payment_error: {
        code: 'insufficient_funds'
      }
    };
    
    const result = await processStripePayment(paymentIntent);
    
    expect(result.success).toBe(false);
    expect(result.error_code).toBe('insufficient_funds');
  });
  
  test('4.10: Credit transaction record creation', () => {
    const transaction = {
      user_email: 'client@test.com',
      amount: 1050,
      type: 'purchase',
      stripe_charge_id: 'ch_123',
      balance_before: 500,
      balance_after: 1550
    };
    
    const record = createCreditTransaction(transaction);
    
    expect(record.transaction_id).toMatch(/^TXN-/);
    expect(record.description).toContain('Credit purchase');
    expect(record.created_at).toBeDefined();
  });
  
  // ... 15 more unit tests covering:
  // - Credit hold for bookings
  // - Credit charge after approval
  // - Credit refund for cancellations
  // - Promotional credit application
  // - Referral credit distribution
  // - Loyalty points redemption to credits
  // - Credit expiration (promotional credits only)
  // - Credit balance validation
  // - Auto-refill trigger
  // - Auto-refill processing
  // - Credit package validation
  // - Minimum purchase amount
  // - Maximum purchase amount
  // - Transaction history
  // - Balance reconciliation
});
```

---

### **Test Suite 5: Credit Usage & Lifecycle**

#### **Integration Tests (30 tests)**

```javascript
describe('Credit Usage - Integration Tests', () => {
  
  test('5.1: Full credit lifecycle - Purchase → Hold → Charge', async () => {
    // Setup
    const client = await createTestClient({
      credit_balance: 0
    });
    
    // Step 1: Purchase credits
    const purchase = await purchaseCredits(client.email, {
      package_size: 1000,
      payment_method: 'pm_card_visa'
    });
    
    expect(purchase.success).toBe(true);
    expect(purchase.credits_added).toBe(1050); // 1000 + 5% bonus
    
    // Verify balance updated
    let updatedClient = await getClientProfile(client.email);
    expect(updatedClient.credit_balance).toBe(1050);
    
    // Step 2: Create booking (credits held)
    const booking = await createBooking({
      client_email: client.email,
      cleaner_email: 'cleaner@test.com',
      final_price: 500
    });
    
    expect(booking.payment_status).toBe('hold');
    
    // Balance should still be 1050 (not charged yet)
    updatedClient = await getClientProfile(client.email);
    expect(updatedClient.credit_balance).toBe(1050);
    
    // Step 3: Booking completed and approved (credits charged)
    await completeBooking(booking.id);
    await approveBooking(booking.id, client.email);
    
    // Balance should now be 550 (1050 - 500)
    updatedClient = await getClientProfile(client.email);
    expect(updatedClient.credit_balance).toBe(550);
    
    // Verify transaction history
    const transactions = await getCreditTransactions(client.email);
    expect(transactions).toHaveLength(2);
    expect(transactions[0].type).toBe('purchase');
    expect(transactions[0].amount).toBe(1050);
    expect(transactions[1].type).toBe('booking_charge');
    expect(transactions[1].amount).toBe(-500);
  });
  
  test('5.2: Credit refund after cancellation', async () => {
    // Setup
    const client = await createTestClient({
      credit_balance: 2000
    });
    const booking = await createTestBooking({
      client_email: client.email,
      final_price: 800,
      status: 'accepted',
      payment_status: 'authorized'
    });
    
    // Act - Client cancels booking
    await cancelBooking(booking.id, client.email, 'Change of plans');
    
    // Assert - Credits refunded
    const updatedClient = await getClientProfile(client.email);
    expect(updatedClient.credit_balance).toBe(2000); // Back to original
    
    // Verify refund transaction
    const transactions = await getCreditTransactions(client.email);
    const refund = transactions.find(t => t.type === 'booking_refund');
    expect(refund).toBeDefined();
    expect(refund.amount).toBe(800);
    expect(refund.booking_id).toBe(booking.id);
  });
  
  test('5.3: Promotional credits - Welcome bonus', async () => {
    // Setup
    const client = await createTestClient({
      credit_balance: 0,
      welcome_credit_granted: false
    });
    
    // Act - Trigger welcome bonus
    await grantWelcomeBonus(client.email);
    
    // Assert
    const updatedClient = await getClientProfile(client.email);
    expect(updatedClient.credit_balance).toBe(100); // 100 free credits
    expect(updatedClient.welcome_credit_granted).toBe(true);
    
    // Verify transaction
    const transactions = await getCreditTransactions(client.email);
    const bonus = transactions.find(t => t.type === 'promotional');
    expect(bonus.amount).toBe(100);
    expect(bonus.description).toContain('Welcome bonus');
  });
  
  test('5.4: Referral credits - Both parties receive', async () => {
    // Setup
    const referrer = await createTestClient({
      email: 'referrer@test.com',
      referral_code: 'REFER2026'
    });
    const referee = await createTestClient({
      email: 'referee@test.com',
      referred_by: 'referrer@test.com'
    });
    
    // Act - Referee completes first booking
    const booking = await createAndCompleteBooking(referee.email);
    await approveBooking(booking.id, referee.email);
    
    // Assert - Both get 250 credits
    const updatedReferrer = await getClientProfile(referrer.email);
    const updatedReferee = await getClientProfile(referee.email);
    
    expect(updatedReferrer.credit_balance).toBeGreaterThanOrEqual(250);
    expect(updatedReferee.credit_balance).toBeGreaterThanOrEqual(250);
    
    // Verify transactions
    const referrerTxns = await getCreditTransactions(referrer.email);
    const refereeTxns = await getCreditTransactions(referee.email);
    
    expect(referrerTxns).toContainEqual(
      expect.objectContaining({
        type: 'referral_reward',
        amount: 250
      })
    );
    expect(refereeTxns).toContainEqual(
      expect.objectContaining({
        type: 'referral_reward',
        amount: 250
      })
    );
  });
  
  test('5.5: Loyalty points redemption to credits', async () => {
    // Setup
    const client = await createTestClient({
      credit_balance: 500,
      loyalty_points: 5000 // Enough for 500 credits
    });
    
    // Act - Redeem 5000 points
    const result = await redeemLoyaltyPoints(client.email, 5000);
    
    // Assert
    expect(result.success).toBe(true);
    expect(result.credits_received).toBe(500); // 5000 pts = 500 credits
    
    const updatedClient = await getClientProfile(client.email);
    expect(updatedClient.credit_balance).toBe(1000); // 500 + 500
    expect(updatedClient.loyalty_points).toBe(0); // Points deducted
    
    // Verify transaction
    const transactions = await getCreditTransactions(client.email);
    expect(transactions).toContainEqual(
      expect.objectContaining({
        type: 'loyalty_redemption',
        amount: 500,
        description: expect.stringContaining('5000 points')
      })
    );
  });
  
  test('5.6: Auto-refill triggers when balance < threshold', async () => {
    // Setup
    const client = await createTestClient({
      credit_balance: 150,
      auto_refill_enabled: true,
      auto_refill_threshold: 100,
      auto_refill_amount: 500,
      stripe_payment_method_id: 'pm_card_visa'
    });
    
    // Act - Create booking that brings balance below threshold
    const booking = await createBooking({
      client_email: client.email,
      final_price: 100 // Balance will be 50 after hold
    });
    
    // Wait for auto-refill to process
    await waitFor(() => 
      getClientProfile(client.email).then(c => c.credit_balance > 500)
    );
    
    // Assert
    const updatedClient = await getClientProfile(client.email);
    expect(updatedClient.credit_balance).toBeGreaterThanOrEqual(550); // 50 + 500
    
    // Verify auto-refill transaction
    const transactions = await getCreditTransactions(client.email);
    expect(transactions).toContainEqual(
      expect.objectContaining({
        type: 'purchase',
        amount: 500,
        description: expect.stringContaining('Auto-refill')
      })
    );
  });
  
  test('5.7: Credit expiration - Promotional credits', async () => {
    // Setup
    const client = await createTestClient({
      credit_balance: 1000
    });
    
    // Grant promotional credits with 30-day expiration
    await grantPromotionalCredits(client.email, {
      amount: 200,
      expires_in_days: 30,
      reason: 'Holiday promotion'
    });
    
    // Fast-forward 31 days
    await advanceTime(31 * 24 * 60 * 60 * 1000);
    
    // Run expiration check (cron job)
    await runCreditExpirationCheck();
    
    // Assert - Promotional credits expired
    const updatedClient = await getClientProfile(client.email);
    expect(updatedClient.credit_balance).toBe(1000); // Back to original (200 expired)
    
    // Verify expiration notification sent
    const notifications = await getNotifications(client.email);
    expect(notifications).toContainEqual(
      expect.objectContaining({
        type: 'credits_expired',
        message: expect.stringContaining('200 promotional credits')
      })
    );
  });
  
  // ... 23 more integration tests covering:
  // - Insufficient credits error handling
  // - Credit hold release on booking expiry
  // - Partial refunds (disputes)
  // - Membership bonus credits
  // - Bundle offer credit grants
  // - Compensation credits (service recovery)
  // - Admin manual adjustments
  // - Credit fraud detection
  // - Duplicate purchase prevention
  // - Payment retry logic
  // - Failed payment handling
  // - Stripe webhook processing
  // - Credit balance reconciliation
  // - Transaction history pagination
  // - Credit usage analytics
  // - Chargeback handling
  // - Credit freeze/unfreeze
  // - Negative balance prevention
  // - Maximum balance limits
  // - Credit transfer (admin only)
  // - Bulk credit operations
  // - Credit audit trail
  // - Tax calculation (if applicable)
});
```

---

## 💸 PAYOUT SYSTEM TESTS (10% Instant Cash-Out ⭐)

### **Test Suite 6: Payout Processing**

#### **Unit Tests (30 tests)**

```javascript
describe('Payout Processing - Unit Tests', () => {
  
  test('6.1: Calculate cleaner earnings - 85% payout', () => {
    const booking = {
      final_price: 1500, // credits
      payout_percentage: 0.85
    };
    
    const result = calculateCleanerEarnings(booking);
    
    expect(result.earnings_credits).toBe(1275); // 1500 × 0.85
    expect(result.earnings_usd).toBe(127.50); // 1275 / 10
    expect(result.platform_fee_credits).toBe(225); // 1500 × 0.15
    expect(result.platform_fee_usd).toBe(22.50);
  });
  
  test('6.2: Calculate instant cash-out fee - 10% ⭐', () => {
    const earnings = {
      amount_usd: 200.00
    };
    
    const result = calculateInstantCashoutFee(earnings);
    
    expect(result.fee_percent).toBe(10); // ⭐ 10% fee
    expect(result.fee_amount).toBe(20.00); // $200 × 10%
    expect(result.net_amount).toBe(180.00); // $200 - $20
  });
  
  test('6.3: Calculate instant cash-out fee - Edge case $1', () => {
    const earnings = {
      amount_usd: 1.00
    };
    
    const result = calculateInstantCashoutFee(earnings);
    
    expect(result.fee_amount).toBe(0.10); // $1 × 10%
    expect(result.net_amount).toBe(0.90);
  });
  
  test('6.4: Calculate instant cash-out fee - Large amount', () => {
    const earnings = {
      amount_usd: 5000.00 // Large payout
    };
    
    const result = calculateInstantCashoutFee(earnings);
    
    expect(result.fee_amount).toBe(500.00); // $5000 × 10%
    expect(result.net_amount).toBe(4500.00);
  });
  
  test('6.5: Weekly payout batch - No fees', () => {
    const bookings = [
      { final_price: 1500, payout_percentage: 0.85 },
      { final_price: 1200, payout_percentage: 0.85 },
      { final_price: 1800, payout_percentage: 0.85 }
    ];
    
    const result = calculateWeeklyPayout(bookings);
    
    expect(result.total_earnings_usd).toBe(382.50); // Sum of all
    expect(result.fee_amount).toBe(0); // No fee for weekly
    expect(result.net_amount).toBe(382.50);
    expect(result.booking_count).toBe(3);
  });
  
  test('6.6: Daily payout (Elite only) - No fees', () => {
    const cleaner = {
      tier: 'Elite',
      payout_schedule: 'daily'
    };
    const bookings = [
      { final_price: 2000, payout_percentage: 0.85 }
    ];
    
    const result = calculateDailyPayout(cleaner, bookings);
    
    expect(result.total_earnings_usd).toBe(170.00);
    expect(result.fee_amount).toBe(0); // Elite gets free daily payouts
    expect(result.net_amount).toBe(170.00);
    expect(result.is_elite_perk).toBe(true);
  });
  
  test('6.7: Validate payout eligibility - Pending bookings', () => {
    const cleaner = {
      email: 'cleaner@test.com'
    };
    const bookings = [
      { status: 'awaiting_approval', earnings: 150 }, // Still pending
      { status: 'approved', earnings: 200 } // Ready
    ];
    
    const result = validatePayoutEligibility(cleaner, bookings);
    
    expect(result.eligible_bookings).toHaveLength(1); // Only approved
    expect(result.eligible_amount).toBe(200);
    expect(result.pending_amount).toBe(150);
  });
  
  test('6.8: Payout minimum threshold - $25', () => {
    const earnings = {
      amount_usd: 20.00 // Below $25 minimum
    };
    
    const result = validatePayoutMinimum(earnings);
    
    expect(result.meets_minimum).toBe(false);
    expect(result.minimum_required).toBe(25);
    expect(result.shortfall).toBe(5);
  });
  
  test('6.9: Elite tier - No minimum for daily payouts', () => {
    const cleaner = {
      tier: 'Elite',
      payout_schedule: 'daily'
    };
    const earnings = {
      amount_usd: 5.00 // Below $25, but Elite has no minimum
    };
    
    const result = validatePayoutMinimum(earnings, cleaner);
    
    expect(result.meets_minimum).toBe(true);
    expect(result.elite_exception).toBe(true);
  });
  
  test('6.10: Payout status transitions', () => {
    const payout = {
      status: 'pending'
    };
    
    // Transition: pending → approved
    let result = transitionPayoutStatus(payout, 'approved');
    expect(result.status).toBe('approved');
    expect(result.approved_at).toBeDefined();
    
    // Transition: approved → batched
    result = transitionPayoutStatus(result, 'batched');
    expect(result.status).toBe('batched');
    expect(result.batch_id).toBeDefined();
    
    // Transition: batched → processing
    result = transitionPayoutStatus(result, 'processing');
    expect(result.status).toBe('processing');
    expect(result.processed_at).toBeDefined();
    
    // Transition: processing → paid
    result = transitionPayoutStatus(result, 'paid');
    expect(result.status).toBe('paid');
    expect(result.paid_at).toBeDefined();
  });
  
  // ... 20 more unit tests covering:
  // - Payout retry logic
  // - Failed payout handling
  // - Payout reversals
  // - Split payouts (multiple cleaners)
  // - Payout cancellation
  // - Payout history
  // - Payout fee breakdown
  // - Tax withholding (if applicable)
  // - Currency conversion (international)
  // - Bank account validation
  // - Payout scheduling
  // - Holiday delay handling
  // - Weekend payout processing
  // - Payout notification triggers
  // - Payout receipt generation
  // - Payout analytics
  // - Tier-based payout percentages
  // - Bonus payout processing
  // - Adjustment calculations
  // - Payout reconciliation
});
```

---

#### **Integration Tests (25 tests)**

```javascript
describe('Payout System - Integration Tests', () => {
  
  test('7.1: Full weekly payout cycle', async () => {
    // Setup - Cleaner completes 5 bookings in a week
    const cleaner = await createTestCleaner({
      payout_schedule: 'weekly',
      bank_account_verified: true
    });
    
    const bookings = await Promise.all([
      createAndCompleteBooking(cleaner, { final_price: 1500 }),
      createAndCompleteBooking(cleaner, { final_price: 1200 }),
      createAndCompleteBooking(cleaner, { final_price: 1800 }),
      createAndCompleteBooking(cleaner, { final_price: 1400 }),
      createAndCompleteBooking(cleaner, { final_price: 1600 })
    ]);
    
    // All bookings approved by clients
    for (const booking of bookings) {
      await approveBooking(booking.id, booking.client_email);
    }
    
    // Run weekly payout cron (Friday)
    await runWeeklyPayoutBatch();
    
    // Assert - Payout created and batched
    const payout = await getCleanerPayout(cleaner.email, 'this_week');
    
    expect(payout.status).toBe('batched');
    expect(payout.booking_count).toBe(5);
    expect(payout.amount_usd).toBe(637.50); // (7500 × 0.85) / 10
    expect(payout.is_instant_cashout).toBe(false);
    expect(payout.instant_cashout_fee_amount).toBe(0);
    
    // Simulate Stripe transfer
    await processStripePayout(payout.id);
    
    // Assert - Payout marked as paid
    const updatedPayout = await getPayout(payout.id);
    expect(updatedPayout.status).toBe('paid');
    expect(updatedPayout.stripe_transfer_id).toBeDefined();
    expect(updatedPayout.paid_at).toBeDefined();
    
    // Verify notification sent
    const notifications = await getNotifications(cleaner.email);
    expect(notifications).toContainEqual(
      expect.objectContaining({
        type: 'payout_processed',
        amount: 637.50
      })
    );
  });
  
  test('7.2: Instant cash-out with 10% fee ⭐', async () => {
    // Setup
    const cleaner = await createTestCleaner({
      payout_schedule: 'weekly',
      tier: 'Pro', // Not Elite (Elite gets daily for free)
      bank_account_verified: true
    });
    
    // Complete bookings worth $250
    await createAndCompleteBookings(cleaner, [
      { final_price: 1500 },
      { final_price: 1442 } // Total: 2942 credits = $294.20 gross
    ]);
    
    // Cleaner requests instant cash-out
    const result = await requestInstantCashout(cleaner.email);
    
    // Assert
    expect(result.success).toBe(true);
    expect(result.gross_amount).toBe(250.07); // 2942 × 0.85 / 10
    expect(result.fee_percent).toBe(10); // ⭐ 10% fee
    expect(result.fee_amount).toBe(25.01); // $250.07 × 10%
    expect(result.net_amount).toBe(225.06); // $250.07 - $25.01
    
    // Verify payout record
    const payout = await getLatestPayout(cleaner.email);
    expect(payout.is_instant_cashout).toBe(true);
    expect(payout.instant_cashout_fee_percent).toBe(10);
    expect(payout.instant_cashout_fee_amount).toBe(25.01);
    expect(payout.net_amount_after_fee).toBe(225.06);
    expect(payout.status).toBe('processing');
    
    // Simulate Stripe instant transfer
    await processInstantStripePayout(payout.id);
    
    // Should complete within 24 hours
    const completedPayout = await getPayout(payout.id);
    expect(completedPayout.status).toBe('paid');
    expect(completedPayout.paid_at).toBeDefined();
  });
  
  test('7.3: Elite daily payout - Free (no fees)', async () => {
    // Setup
    const cleaner = await createTestCleaner({
      tier: 'Elite',
      payout_schedule: 'daily',
      bank_account_verified: true
    });
    
    // Complete 2 bookings today
    await createAndCompleteBookings(cleaner, [
      { final_price: 2000 },
      { final_price: 1500 }
    ]);
    
    // Run daily payout cron (Elite only)
    await runDailyPayoutBatch();
    
    // Assert
    const payout = await getCleanerPayout(cleaner.email, 'today');
    
    expect(payout.status).toBe('batched');
    expect(payout.amount_usd).toBe(297.50); // 3500 × 0.85 / 10
    expect(payout.is_instant_cashout).toBe(false);
    expect(payout.instant_cashout_fee_amount).toBe(0); // FREE for Elite
    expect(payout.payout_schedule).toBe('daily');
    expect(payout.elite_perk).toBe(true);
    
    // Process Stripe transfer
    await processStripePayout(payout.id);
    
    // Should be paid next business day
    const completedPayout = await getPayout(payout.id);
    expect(completedPayout.status).toBe('paid');
  });
  
  test('7.4: Payout blocked - Unverified bank account', async () => {
    // Setup
    const cleaner = await createTestCleaner({
      bank_account_verified: false // ⚠️ Not verified
    });
    
    // Complete bookings
    await createAndCompleteBookings(cleaner, [
      { final_price: 2000 }
    ]);
    
    // Run payout cron
    await runWeeklyPayoutBatch();
    
    // Assert - No payout created
    const payout = await getCleanerPayout(cleaner.email, 'this_week');
    expect(payout).toBeNull();
    
    // Verify notification sent
    const notifications = await getNotifications(cleaner.email);
    expect(notifications).toContainEqual(
      expect.objectContaining({
        type: 'payout_blocked',
        reason: 'bank_account_not_verified',
        action_required: 'Please verify your bank account to receive payouts'
      })
    );
  });
  
  test('7.5: Payout failed - Stripe error (retry logic)', async () => {
    // Setup
    const cleaner = await createTestCleaner({
      bank_account_verified: true,
      stripe_account_id: 'acct_invalid' // Will fail
    });
    
    const payout = await createTestPayout({
      cleaner_email: cleaner.email,
      amount_usd: 500,
      status: 'batched'
    });
    
    // Attempt Stripe transfer (will fail)
    const result = await processStripePayout(payout.id);
    
    // Assert - Marked as failed with retry
    expect(result.success).toBe(false);
    
    const updatedPayout = await getPayout(payout.id);
    expect(updatedPayout.status).toBe('failed');
    expect(updatedPayout.failure_reason).toBeDefined();
    expect(updatedPayout.retry_count).toBe(1);
    expect(updatedPayout.next_retry_at).toBeDefined();
    
    // Verify notification sent to cleaner
    const notifications = await getNotifications(cleaner.email);
    expect(notifications).toContainEqual(
      expect.objectContaining({
        type: 'payout_failed',
        retry: true
      })
    );
    
    // Retry logic should attempt again in 24 hours
    await advanceTime(24 * 60 * 60 * 1000);
    await runPayoutRetries();
    
    const retriedPayout = await getPayout(payout.id);
    expect(retriedPayout.retry_count).toBe(2);
  });
  
  test('7.6: Multiple bookings payout calculation', async () => {
    // Setup
    const cleaner = await createTestCleaner({
      payout_percentage: 0.85
    });
    
    // Create bookings with different prices
    const bookings = [
      { final_price: 1000, has_pets: false },
      { final_price: 1500, has_pets: true }, // Includes pet fee
      { final_price: 2000, has_pets: false },
      { final_price: 1200, has_pets: true }
    ];
    
    const completedBookings = await Promise.all(
      bookings.map(b => createAndCompleteBooking(cleaner, b))
    );
    
    // Approve all
    for (const booking of completedBookings) {
      await approveBooking(booking.id, booking.client_email);
    }
    
    // Calculate expected payout
    const total = 1000 + 1500 + 2000 + 1200; // 5700 credits
    const expectedEarnings = (total * 0.85) / 10; // $484.50
    
    // Run payout
    await runWeeklyPayoutBatch();
    
    const payout = await getCleanerPayout(cleaner.email, 'this_week');
    
    expect(payout.booking_ids).toHaveLength(4);
    expect(payout.amount_usd).toBeCloseTo(484.50, 2);
  });
  
  // ... 18 more integration tests covering:
  // - Payout with tips included
  // - Payout with bonuses
  // - Payout adjustments (admin)
  // - Payout cancellation before processing
  // - Payout reversal (dispute resolved)
  // - Multiple payouts same week (instant + weekly)
  // - Payout history pagination
  // - Payout receipt generation
  // - Payout tax documentation
  // - Payout to multiple bank accounts
  // - Payout currency conversion
  // - Payout batch processing limits
  // - Payout timing (Friday exact time)
  // - Payout holiday delays
  // - Payout notifications (email, SMS, push)
  // - Payout analytics tracking
  // - Instant cash-out abuse prevention
  // - Payout fraud detection
});
```

---

## ⏰ AUTO-APPROVAL SYSTEM TESTS (18hr Window ⭐)

### **Test Suite 8: Auto-Approval Timing**

#### **Unit Tests (20 tests)**

```javascript
describe('Auto-Approval 18hr - Unit Tests', () => {
  
  test('8.1: Calculate auto-approval deadline - 18 hours ⭐', () => {
    const booking = {
      completed_at: new Date('2026-01-20T14:00:00Z') // 2pm
    };
    
    const deadline = calculateAutoApprovalDeadline(booking);
    
    // Should be 18 hours after completion
    const expected = new Date('2026-01-21T08:00:00Z'); // Next day 8am
    expect(deadline).toEqual(expected);
  });
  
  test('8.2: Check if within auto-approval window', () => {
    const booking = {
      awaiting_approval_since: new Date(Date.now() - 10 * 60 * 60 * 1000), // 10 hours ago
      auto_approval_deadline: new Date(Date.now() + 8 * 60 * 60 * 1000) // 8 hours from now
    };
    
    const result = isWithinAutoApprovalWindow(booking);
    
    expect(result.is_within_window).toBe(true);
    expect(result.hours_remaining).toBeCloseTo(8, 0);
    expect(result.hours_elapsed).toBeCloseTo(10, 0);
  });
  
  test('8.3: Auto-approval deadline passed', () => {
    const booking = {
      awaiting_approval_since: new Date(Date.now() - 19 * 60 * 60 * 1000), // 19 hours ago
      auto_approval_deadline: new Date(Date.now() - 1 * 60 * 60 * 1000) // 1 hour ago
    };
    
    const result = isWithinAutoApprovalWindow(booking);
    
    expect(result.is_within_window).toBe(false);
    expect(result.should_auto_approve).toBe(true);
    expect(result.hours_overdue).toBeCloseTo(1, 0);
  });
  
  test('8.4: Calculate reminder times - 3 reminders', () => {
    const booking = {
      awaiting_approval_since: new Date('2026-01-20T10:00:00Z'),
      auto_approval_deadline: new Date('2026-01-21T04:00:00Z') // 18hrs later
    };
    
    const reminders = calculateReminderTimes(booking);
    
    // First reminder: 6 hours after completion
    expect(reminders[0]).toEqual(new Date('2026-01-20T16:00:00Z'));
    
    // Second reminder: 12 hours after completion
    expect(reminders[1]).toEqual(new Date('2026-01-20T22:00:00Z'));
    
    // Final reminder: 3 hours before deadline (15hrs after completion)
    expect(reminders[2]).toEqual(new Date('2026-01-21T01:00:00Z'));
    
    expect(reminders).toHaveLength(3);
  });
  
  test('8.5: Auto-approval notification content', () => {
    const booking = {
      id: 'BK-2026-00123',
      cleaner_name: 'Sarah Martinez',
      service_date: '2026-01-20',
      final_price: 1500
    };
    
    const notification = generateAutoApprovalNotification(booking, 'reminder', 3);
    
    expect(notification.title).toContain('Review Your Cleaning');
    expect(notification.message).toContain('Sarah Martinez');
    expect(notification.message).toContain('3 hours');
    expect(notification.message).toContain('auto-approved');
    expect(notification.action_url).toContain(booking.id);
  });
  
  // ... 15 more unit tests covering:
  // - Auto-approval edge cases (midnight, timezone)
  // - Reminder suppression (already reviewed)
  // - Notification channel selection
  // - Auto-approval eligibility checks
  // - Pause auto-approval (disputes)
  // - Resume auto-approval
  // - Auto-approval analytics
  // - Reminder preference handling
  // - Quiet hours respect (no 2am reminders)
  // - Bulk auto-approval processing
  // - Auto-approval audit logging
  // - Manual approval before deadline
  // - Dispute prevents auto-approval
  // - Client response time tracking
  // - Auto-approval rate calculation
});
```

---

#### **Integration Tests (20 tests)**

```javascript
describe('Auto-Approval 18hr - Integration Tests', () => {
  
  test('9.1: Full auto-approval cycle with reminders', async () => {
    // Setup
    const { client, cleaner, booking } = await setupCompletedBooking({
      completed_at: new Date(Date.now() - 1000) // Just completed
    });
    
    // Verify initial state
    expect(booking.status).toBe('awaiting_approval');
    expect(booking.awaiting_approval_since).toBeDefined();
    expect(booking.auto_approval_deadline).toBeDefined();
    
    // Calculate expected deadline (18 hours)
    const expectedDeadline = new Date(
      booking.awaiting_approval_since.getTime() + 18 * 60 * 60 * 1000
    );
    expect(booking.auto_approval_deadline).toEqual(expectedDeadline);
    
    // Simulate time passage - 6 hours (first reminder)
    await advanceTime(6 * 60 * 60 * 1000);
    await runReminderCron();
    
    // Check first reminder sent
    let notifications = await getNotifications(client.email);
    expect(notifications).toContainEqual(
      expect.objectContaining({
        type: 'approval_reminder',
        booking_id: booking.id,
        hours_remaining: 12
      })
    );
    
    // Simulate time passage - 6 more hours (second reminder at 12hrs)
    await advanceTime(6 * 60 * 60 * 1000);
    await runReminderCron();
    
    // Check second reminder sent
    notifications = await getNotifications(client.email);
    const reminders = notifications.filter(n => 
      n.type === 'approval_reminder' && n.booking_id === booking.id
    );
    expect(reminders).toHaveLength(2);
    
    // Simulate time passage - 3 more hours (final reminder at 15hrs)
    await advanceTime(3 * 60 * 60 * 1000);
    await runReminderCron();
    
    // Check final reminder sent (3 hours before deadline)
    notifications = await getNotifications(client.email);
    const finalReminder = notifications.find(n => 
      n.type === 'approval_reminder_final'
    );
    expect(finalReminder).toBeDefined();
    expect(finalReminder.message).toContain('3 hours');
    expect(finalReminder.priority).toBe('high');
    
    // Simulate time passage - 3 more hours (18hrs total, deadline reached)
    await advanceTime(3 * 60 * 60 * 1000);
    await runAutoApprovalCron();
    
    // Check booking auto-approved
    const updatedBooking = await getBooking(booking.id);
    expect(updatedBooking.status).toBe('approved');
    expect(updatedBooking.approved_by).toBe('auto'); // ⭐ Auto-approved
    expect(updatedBooking.approved_at).toBeDefined();
    expect(updatedBooking.payment_status).toBe('charged');
    
    // Verify auto-approval notification sent
    notifications = await getNotifications(client.email);
    expect(notifications).toContainEqual(
      expect.objectContaining({
        type: 'auto_approved',
        booking_id: booking.id,
        message: expect.stringContaining('automatically approved')
      })
    );
    
    // Verify cleaner payout created
    const payout = await getCleanerPayout(cleaner.email, booking.id);
    expect(payout).toBeDefined();
    expect(payout.status).toBe('pending');
  });
  
  test('9.2: Client approves before deadline - No auto-approval', async () => {
    // Setup
    const { client, booking } = await setupCompletedBooking();
    
    // Simulate 10 hours passing
    await advanceTime(10 * 60 * 60 * 1000);
    
    // Client manually approves
    await approveBooking(booking.id, client.email);
    
    // Verify manual approval
    const updatedBooking = await getBooking(booking.id);
    expect(updatedBooking.status).toBe('approved');
    expect(updatedBooking.approved_by).toBe('client'); // Manual
    
    // Simulate reaching 18-hour deadline
    await advanceTime(8 * 60 * 60 * 1000);
    await runAutoApprovalCron();
    
    // Should NOT be auto-approved (already manually approved)
    const finalBooking = await getBooking(booking.id);
    expect(finalBooking.approved_by).toBe('client'); // Still manual
    expect(finalBooking.approved_at).not.toEqual(expect.any(Date)); // No second approval
  });
  
  test('9.3: Dispute opened - Auto-approval paused', async () => {
    // Setup
    const { client, booking } = await setupCompletedBooking();
    
    // Simulate 8 hours passing
    await advanceTime(8 * 60 * 60 * 1000);
    
    // Client opens dispute
    await openDispute(booking.id, client.email, {
      reason: 'quality_issue',
      description: 'Kitchen not cleaned properly'
    });
    
    // Verify auto-approval timer paused
    const updatedBooking = await getBooking(booking.id);
    expect(updatedBooking.status).toBe('disputed');
    expect(updatedBooking.auto_approval_paused).toBe(true);
    
    // Simulate reaching 18-hour deadline
    await advanceTime(10 * 60 * 60 * 1000);
    await runAutoApprovalCron();
    
    // Should NOT be auto-approved (dispute pending)
    const finalBooking = await getBooking(booking.id);
    expect(finalBooking.status).toBe('disputed'); // Still disputed
    expect(finalBooking.approved_by).toBeNull(); // Not approved
  });
  
  test('9.4: Reminder suppression after manual approval', async () => {
    // Setup
    const { client, booking } = await setupCompletedBooking();
    
    // Simulate 7 hours passing (before first reminder at 6hrs)
    await advanceTime(7 * 60 * 60 * 1000);
    
    // Client approves
    await approveBooking(booking.id, client.email);
    
    // Simulate more time passing (would trigger reminders)
    await advanceTime(11 * 60 * 60 * 1000); // Total 18 hours
    await runReminderCron();
    
    // Check no reminders sent after approval
    const notifications = await getNotifications(client.email);
    const reminders = notifications.filter(n => 
      n.type.includes('reminder') && 
      n.booking_id === booking.id &&
      n.created_at > booking.approved_at
    );
    expect(reminders).toHaveLength(0);
  });
  
  test('9.5: Auto-approval across timezone - Midnight edge case', async () => {
    // Setup - Booking completed at 11:30 PM
    const booking = await setupCompletedBooking({
      completed_at: new Date('2026-01-20T23:30:00-08:00'), // 11:30 PM PST
      client_timezone: 'America/Los_Angeles'
    });
    
    // Deadline should be 18 hours later (5:30 PM next day)
    const expectedDeadline = new Date('2026-01-21T17:30:00-08:00');
    expect(booking.auto_approval_deadline).toEqual(expectedDeadline);
    
    // Simulate time to deadline
    await advanceTime(18 * 60 * 60 * 1000);
    await runAutoApprovalCron();
    
    // Should auto-approve correctly
    const updatedBooking = await getBooking(booking.id);
    expect(updatedBooking.approved_by).toBe('auto');
  });
  
  test('9.6: Quiet hours - No reminders 10 PM - 8 AM', async () => {
    // Setup - Booking completed at 2 PM
    const { client, booking } = await setupCompletedBooking({
      completed_at: new Date('2026-01-20T14:00:00-08:00'),
      client_timezone: 'America/Los_Angeles',
      quiet_hours_enabled: true,
      quiet_hours_start: '22:00', // 10 PM
      quiet_hours_end: '08:00' // 8 AM
    });
    
    // First reminder would be at 8 PM (6hrs after 2pm) - ALLOWED
    await advanceTime(6 * 60 * 60 * 1000);
    await runReminderCron();
    
    let notifications = await getNotifications(client.email);
    expect(notifications).toContainEqual(
      expect.objectContaining({
        type: 'approval_reminder',
        sent_at: expect.any(Date)
      })
    );
    
    // Second reminder would be at 2 AM (12hrs after 2pm) - QUIET HOURS
    await advanceTime(6 * 60 * 60 * 1000);
    await runReminderCron();
    
    // Should be suppressed, will send at 8 AM instead
    notifications = await getNotifications(client.email);
    const nightReminder = notifications.find(n => 
      n.type === 'approval_reminder' &&
      new Date(n.created_at).getHours() >= 22 || 
      new Date(n.created_at).getHours() < 8
    );
    expect(nightReminder).toBeUndefined();
    
    // At 8 AM, delayed reminder should send
    await advanceTime(6 * 60 * 60 * 1000); // Now 8 AM
    await runReminderCron();
    
    notifications = await getNotifications(client.email);
    const morningReminder = notifications.find(n => 
      n.type === 'approval_reminder_delayed'
    );
    expect(morningReminder).toBeDefined();
  });
  
  // ... 14 more integration tests covering:
  // - Multiple bookings same client (separate timers)
  // - Auto-approval rate analytics
  // - Reminder A/B testing
  // - Email vs SMS vs Push effectiveness
  // - Auto-approval recovery (cron missed run)
  // - Leap second handling
  // - DST transition handling
  // - Client vacation mode (pause all reminders)
  // - VIP client special handling
  // - Commercial booking auto-approval (different rules?)
  // - Recurring booking auto-approval patterns
  // - First-time client education (more reminders)
  // - Auto-approval opt-out handling
  // - Manual review flag (admin intervention)
});
```

---

[CONTINUING WITH REMAINING TEST SUITES...]

I'll continue building this comprehensive test campaign. Would you like me to keep adding all the remaining test suites (Smart Matching, Pet Fee, Reliability Scoring, GPS, Photo, Disputes, Security, Performance, Edge Cases, etc.) to create the complete 5,000+ line test document?


