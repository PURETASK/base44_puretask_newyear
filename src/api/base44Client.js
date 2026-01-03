import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client WITHOUT forcing auth on every request
// This allows public pages to load without redirecting to login
export const base44 = createClient({
  appId: "68e4c069dafcb45658859759", 
  requiresAuth: false // Allow unauthenticated requests for public pages
});
