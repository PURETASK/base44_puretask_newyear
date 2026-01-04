// Unit Tests for Job State Machine
// Tests state transitions, validation, and business logic

import {
  canTransition,
  calculateWorkedMinutes,
  calculateBillableMinutes,
  isLocationNearJob,
  JobRecord,
  JobState
} from '../types/cleanerJobTypes';

// Mock job data for testing
const mockJob: JobRecord = {
  id: 'test-job-123',
  client_id: 'client-456',
  client_email: 'client@test.com',
  assigned_cleaner_id: 'cleaner-789',
  assigned_cleaner_email: 'cleaner@test.com',
  state: 'ASSIGNED' as JobState,
  sub_state: 'NONE',
  created_at: '2026-01-03T10:00:00Z',
  assigned_at: '2026-01-03T10:05:00Z',
  en_route_at: null,
  check_in_at: null,
  start_at: null,
  end_at: null,
  approved_at: null,
  disputed_at: null,
  dispute_resolved_at: null,
  cancelled_at: null,
  en_route_location_lat: null,
  en_route_location_lng: null,
  check_in_location_lat: null,
  check_in_location_lng: null,
  start_location_lat: null,
  start_location_lng: null,
  end_location_lat: null,
  end_location_lng: null,
  max_billable_minutes: null,
  max_billable_credits: null,
  actual_minutes_worked: null,
  final_credits_charged: null,
  escrow_ledger_entry_id: null,
  has_pending_extra_time_request: false,
  has_pending_reschedule_request: false,
  requires_before_photos: true,
  requires_after_photos: true,
  before_photos_count: 0,
  after_photos_count: 0,
  date: '2026-01-04',
  time: '14:00',
  duration_hours: 3,
  address: '123 Test St, Test City, TC 12345',
  latitude: 34.0522,
  longitude: -118.2437,
  cleaning_type: 'basic',
  bedrooms: 2,
  bathrooms: 2,
  square_feet: 1000,
  pricing_snapshot: {},
  client_notes: null,
  cleaner_notes: null,
  admin_notes: null
};

// TEST SUITE 1: State Transitions
console.log('🧪 TEST SUITE 1: State Transitions\n');

// Test 1.1: Valid transitions
console.log('Test 1.1: Valid ASSIGNED → EN_ROUTE transition');
const test1_1 = canTransition('ASSIGNED', 'EN_ROUTE', mockJob);
console.log(`Result: ${test1_1.allowed ? '✅ PASS' : '❌ FAIL'}`);
console.log(`Reasons: ${test1_1.reasons.join(', ') || 'None'}\n`);

// Test 1.2: Invalid direct jump
console.log('Test 1.2: Invalid ASSIGNED → COMPLETED_APPROVED transition');
const test1_2 = canTransition('ASSIGNED', 'COMPLETED_APPROVED', mockJob);
console.log(`Result: ${!test1_2.allowed ? '✅ PASS' : '❌ FAIL'}`);
console.log(`Reasons: ${test1_2.reasons.join(', ')}\n`);

// Test 1.3: Complete without photos
console.log('Test 1.3: Cannot complete IN_PROGRESS → AWAITING_CLIENT_REVIEW without photos');
const jobInProgress = { ...mockJob, state: 'IN_PROGRESS' as JobState, start_at: '2026-01-04T14:00:00Z', end_at: '2026-01-04T17:00:00Z' };
const test1_3 = canTransition('IN_PROGRESS', 'AWAITING_CLIENT_REVIEW', jobInProgress);
console.log(`Result: ${!test1_3.allowed ? '✅ PASS' : '❌ FAIL'}`);
console.log(`Reasons: ${test1_3.reasons.join(', ')}\n`);

// Test 1.4: Complete with photos
console.log('Test 1.4: Can complete IN_PROGRESS → AWAITING_CLIENT_REVIEW with photos');
const jobWithPhotos = { 
  ...jobInProgress, 
  before_photos_count: 3, 
  after_photos_count: 3 
};
const test1_4 = canTransition('IN_PROGRESS', 'AWAITING_CLIENT_REVIEW', jobWithPhotos);
console.log(`Result: ${test1_4.allowed ? '✅ PASS' : '❌ FAIL'}`);
console.log(`Reasons: ${test1_4.reasons.join(', ') || 'None'}\n`);

// TEST SUITE 2: Time Calculations
console.log('🧪 TEST SUITE 2: Time Calculations\n');

// Test 2.1: Calculate worked minutes
console.log('Test 2.1: Calculate worked minutes (3 hours)');
const jobWithTime = {
  ...mockJob,
  start_at: '2026-01-04T14:00:00Z',
  end_at: '2026-01-04T17:00:00Z'
};
const workedMinutes = calculateWorkedMinutes(jobWithTime);
console.log(`Result: ${workedMinutes === 180 ? '✅ PASS' : '❌ FAIL'}`);
console.log(`Expected: 180 minutes, Got: ${workedMinutes} minutes\n`);

// Test 2.2: Calculate billable minutes (capped)
console.log('Test 2.2: Calculate billable minutes (4 hrs worked, 3 hrs max)');
const jobWithCap = {
  ...jobWithTime,
  end_at: '2026-01-04T18:00:00Z', // 4 hours worked
  max_billable_minutes: 180 // 3 hours max
};
const billableMinutes = calculateBillableMinutes(jobWithCap);
console.log(`Result: ${billableMinutes === 180 ? '✅ PASS' : '❌ FAIL'}`);
console.log(`Expected: 180 minutes (capped), Got: ${billableMinutes} minutes\n`);

// Test 2.3: Billable minutes without cap
console.log('Test 2.3: Calculate billable minutes (no cap)');
const jobNoCap = {
  ...jobWithTime,
  max_billable_minutes: 240 // 4 hours max, but only worked 3
};
const billableNoCap = calculateBillableMinutes(jobNoCap);
console.log(`Result: ${billableNoCap === 180 ? '✅ PASS' : '❌ FAIL'}`);
console.log(`Expected: 180 minutes, Got: ${billableNoCap} minutes\n`);

// TEST SUITE 3: GPS Validation
console.log('🧪 TEST SUITE 3: GPS Validation\n');

// Test 3.1: Within 250m
console.log('Test 3.1: Location within 250m (should pass)');
const nearLocation = { lat: 34.0542, lng: -118.2437 }; // ~2.2km ≈ 220m
const test3_1 = isLocationNearJob(nearLocation.lat, nearLocation.lng, mockJob, 250);
console.log(`Result: ${test3_1 ? '✅ PASS' : '❌ FAIL'}`);
console.log(`Location is ${test3_1 ? 'within' : 'outside'} 250m radius\n`);

// Test 3.2: Outside 250m
console.log('Test 3.2: Location outside 250m (should fail)');
const farLocation = { lat: 34.1522, lng: -118.2437 }; // ~11km away
const test3_2 = isLocationNearJob(farLocation.lat, farLocation.lng, mockJob, 250);
console.log(`Result: ${!test3_2 ? '✅ PASS' : '❌ FAIL'}`);
console.log(`Location is ${test3_2 ? 'within' : 'outside'} 250m radius\n`);

// Test 3.3: Exactly at location
console.log('Test 3.3: Exact location (should pass)');
const exactLocation = { lat: mockJob.latitude, lng: mockJob.longitude };
const test3_3 = isLocationNearJob(exactLocation.lat, exactLocation.lng, mockJob, 250);
console.log(`Result: ${test3_3 ? '✅ PASS' : '❌ FAIL'}`);
console.log(`Location is ${test3_3 ? 'within' : 'outside'} 250m radius\n`);

// TEST SUITE 4: Edge Cases
console.log('🧪 TEST SUITE 4: Edge Cases\n');

// Test 4.1: Null timestamps
console.log('Test 4.1: Handle null timestamps gracefully');
const jobNoTimes = { ...mockJob, start_at: null, end_at: null };
const test4_1 = calculateWorkedMinutes(jobNoTimes);
console.log(`Result: ${test4_1 === null ? '✅ PASS' : '❌ FAIL'}`);
console.log(`Expected: null, Got: ${test4_1}\n`);

// Test 4.2: End time before start time
console.log('Test 4.2: Handle invalid time range');
const jobInvalidTime = {
  ...mockJob,
  start_at: '2026-01-04T17:00:00Z',
  end_at: '2026-01-04T14:00:00Z' // Earlier than start
};
const test4_2 = calculateWorkedMinutes(jobInvalidTime);
console.log(`Result: ${test4_2 === null || test4_2 <= 0 ? '✅ PASS' : '❌ FAIL'}`);
console.log(`Expected: null or <=0, Got: ${test4_2}\n`);

// SUMMARY
console.log('=' .repeat(50));
console.log('📊 TEST SUMMARY\n');

const tests = [
  { name: 'Valid state transitions', passed: test1_1.allowed },
  { name: 'Block invalid transitions', passed: !test1_2.allowed },
  { name: 'Photo requirement validation', passed: !test1_3.allowed },
  { name: 'Allow completion with photos', passed: test1_4.allowed },
  { name: 'Time calculation', passed: workedMinutes === 180 },
  { name: 'Billable cap enforcement', passed: billableMinutes === 180 },
  { name: 'Billable without cap', passed: billableNoCap === 180 },
  { name: 'GPS within radius', passed: test3_1 },
  { name: 'GPS outside radius', passed: !test3_2 },
  { name: 'GPS exact location', passed: test3_3 },
  { name: 'Null timestamp handling', passed: test4_1 === null },
  { name: 'Invalid time range', passed: test4_2 === null || test4_2 <= 0 }
];

const passedTests = tests.filter(t => t.passed).length;
const totalTests = tests.length;
const passRate = ((passedTests / totalTests) * 100).toFixed(1);

console.log(`Total Tests: ${totalTests}`);
console.log(`Passed: ${passedTests} ✅`);
console.log(`Failed: ${totalTests - passedTests} ❌`);
console.log(`Pass Rate: ${passRate}%\n`);

if (passRate === '100.0') {
  console.log('🎉 ALL TESTS PASSED! State machine is working correctly.');
} else {
  console.log('⚠️ Some tests failed. Review failed tests above.');
}

// Export test results
export const stateM achineTestResults = {
  tests,
  passedTests,
  totalTests,
  passRate: parseFloat(passRate)
};

