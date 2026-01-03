import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

/**
 * Custom render function that includes all providers
 */
export function renderWithProviders(ui, options = {}) {
  const { queryClient, ...renderOptions } = options;

  const testQueryClient = queryClient || new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0
      }
    }
  });

  function Wrapper({ children }) {
    return (
      <QueryClientProvider client={testQueryClient}>
        <BrowserRouter>
          {children}
        </BrowserRouter>
      </QueryClientProvider>
    );
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    queryClient: testQueryClient
  };
}

/**
 * Create a mock user object
 */
export function createMockUser(overrides = {}) {
  return {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    user_type: 'client',
    role: 'user',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides
  };
}

/**
 * Create a mock booking object
 */
export function createMockBooking(overrides = {}) {
  return {
    id: 'test-booking-id',
    client_email: 'client@example.com',
    cleaner_email: 'cleaner@example.com',
    status: 'scheduled',
    address: '123 Test St',
    latitude: 40.7128,
    longitude: -74.0060,
    date: '2026-02-01',
    time: '10:00',
    hours: 3,
    service_type: 'basic',
    bedrooms: 2,
    bathrooms: 2,
    base_price: 90,
    total_price: 105,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides
  };
}

/**
 * Create a mock cleaner profile
 */
export function createMockCleanerProfile(overrides = {}) {
  return {
    id: 'test-cleaner-profile-id',
    user_email: 'cleaner@example.com',
    full_name: 'Test Cleaner',
    phone: '555-0123',
    hourly_rate: 30,
    tier: 'silver',
    reliability_score: 85,
    total_jobs: 50,
    rating: 4.5,
    is_verified: true,
    is_active: true,
    payout_percentage: 0.8,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides
  };
}

/**
 * Create a mock client profile
 */
export function createMockClientProfile(overrides = {}) {
  return {
    id: 'test-client-profile-id',
    user_email: 'client@example.com',
    full_name: 'Test Client',
    phone: '555-0124',
    address: '123 Test St',
    latitude: 40.7128,
    longitude: -74.0060,
    credit_balance: 50,
    total_bookings: 10,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides
  };
}

/**
 * Wait for a specific condition
 */
export function waitFor(condition, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const checkCondition = () => {
      if (condition()) {
        resolve();
      } else if (Date.now() - startTime > timeout) {
        reject(new Error('Timeout waiting for condition'));
      } else {
        setTimeout(checkCondition, 100);
      }
    };
    
    checkCondition();
  });
}

// Re-export everything from @testing-library/react
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';

