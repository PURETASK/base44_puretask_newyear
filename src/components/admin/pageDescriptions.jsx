/**
 * Page Descriptions for Admin Info Panel
 * Maps page names to their descriptions and key features
 */

export const pageDescriptions = {
  'Home': {
    title: 'Landing Page',
    description: 'Main entry point for new visitors and returning users.',
    features: [
      'Hero section with value proposition',
      'Trust badges and social proof',
      'Call-to-action buttons for sign up',
      'Navigation to browse cleaners or get started'
    ]
  },
  
  'RoleSelection': {
    title: 'Role Selection Page',
    description: 'Users choose between becoming a client or cleaner.',
    features: [
      'Client sign-up path with pricing information',
      'Cleaner sign-up path with earning potential',
      'Feature lists for both roles',
      'Sign-in link for existing users'
    ]
  },

  'BrowseCleaners': {
    title: 'Cleaner Directory',
    description: 'Main marketplace where clients discover and filter available cleaners.',
    features: [
      'Search and filter by price, rating, tier, services',
      'Advanced filters panel',
      'Quick comparison drawer for pinned cleaners',
      'Cleaner cards with key stats and ratings',
      'Pagination for large cleaner lists'
    ]
  },

  'CleanerProfile': {
    title: 'Individual Cleaner Profile',
    description: 'Detailed view of a single cleaner with booking capability.',
    features: [
      'Profile photo and bio',
      'Reliability score breakdown',
      'Calendar showing availability and existing bookings',
      'Inline booking form with address autocomplete',
      'Reviews and ratings from past clients',
      'Before/after photo gallery',
      'Service specialties and areas covered',
      'Video introduction (if available)'
    ]
  },

  'ClientDashboard': {
    title: 'Client Dashboard',
    description: 'Main hub for clients to manage bookings and view activity.',
    features: [
      'Upcoming bookings overview',
      'Quick actions (new booking, browse cleaners)',
      'Credit balance display',
      'Recent activity feed',
      'Favorite cleaners quick access'
    ]
  },

  'ClientBookings': {
    title: 'Client Bookings Management',
    description: 'View and manage all client bookings across all statuses.',
    features: [
      'Filterable booking list by status',
      'Booking cards with key details',
      'Actions: reschedule, cancel, view details',
      'Status tracking (pending, scheduled, completed)',
      'Review submission for completed bookings'
    ]
  },

  'CleanerDashboard': {
    title: 'Cleaner Dashboard',
    description: 'Command center for cleaners to manage jobs and track performance.',
    features: [
      'Today\'s jobs and upcoming schedule',
      'Pending booking requests',
      'Earnings overview',
      'Reliability score display',
      'Quick actions (view schedule, manage availability)',
      'Recent notifications'
    ]
  },

  'CleanerSchedule': {
    title: 'Cleaner Schedule View',
    description: 'Calendar view of all cleaner jobs and availability.',
    features: [
      'Monthly calendar view',
      'Job cards with client info',
      'Status indicators',
      'GPS check-in/check-out tracking',
      'Photo upload for job completion'
    ]
  },

  'CleanerPayouts': {
    title: 'Cleaner Earnings & Payouts',
    description: 'Financial dashboard for cleaners to track earnings and request payouts.',
    features: [
      'Total earnings breakdown',
      'Pending vs available balance',
      'Payout history',
      'Instant payout option (5% fee)',
      'Weekly automatic payout info',
      'Per-job earnings details'
    ]
  },

  'BookingFlow': {
    title: 'Multi-Step Booking Flow',
    description: 'Guided booking creation process for clients.',
    features: [
      'Step-by-step wizard (Service → Date/Time → Details → Review)',
      'Service type selection with pricing',
      'Calendar date picker',
      'Address autocomplete with map verification',
      'Home details form',
      'Price calculation with credits',
      'Insufficient credits dialog',
      'Auto-save draft functionality'
    ]
  },

  'BookingAddOns': {
    title: 'Additional Services Selection',
    description: 'Optional add-on services for bookings.',
    features: [
      'Service grid with icons and descriptions',
      'Quantity selectors',
      'Real-time price calculation',
      'Cleaner-specific pricing display',
      'Summary card for selected services',
      'Skip option to proceed without add-ons'
    ]
  },

  'AdminDashboard': {
    title: 'Admin Control Panel',
    description: 'Central hub for platform administration and monitoring.',
    features: [
      'Platform metrics overview',
      'Quick stats (users, bookings, revenue)',
      'Recent activity feed',
      'Navigation to all admin tools',
      'System health indicators',
      'Key performance indicators'
    ]
  },

  'AdminBookingsConsoleV2': {
    title: 'Admin Bookings Console',
    description: 'Comprehensive booking management tool for admins.',
    features: [
      'Advanced filters and search',
      'Booking status management',
      'Bulk actions',
      'Detailed booking modal',
      'Status change workflows',
      'Cleaner/client quick view',
      'Export functionality'
    ]
  },

  'AdminRiskManagement': {
    title: 'Risk Management Center',
    description: 'Monitor and manage platform risk flags and safety issues.',
    features: [
      'Risk flag dashboard',
      'User risk scores',
      'Automated flag triggers',
      'Manual flag creation',
      'Flag resolution workflow',
      'Risk trend analysis'
    ]
  },

  'BuyCredits': {
    title: 'Credit Purchase Page',
    description: 'Client credit purchase interface.',
    features: [
      'Credit package options',
      'Bonus credit promotions',
      'Current balance display',
      'Payment integration',
      'Purchase history'
    ]
  },

  'Inbox': {
    title: 'Messaging Center',
    description: 'Internal messaging system for client-cleaner communication.',
    features: [
      'Conversation thread list',
      'Unread message indicators',
      'Real-time message updates',
      'Message composition',
      'File attachments',
      'Typing indicators',
      'Archive and search'
    ]
  },

  'Profile': {
    title: 'User Profile Management',
    description: 'User account settings and profile editing.',
    features: [
      'Profile photo upload',
      'Personal information editing',
      'Role-specific profile fields',
      'Account settings',
      'Password change (if applicable)',
      'Notification preferences'
    ]
  },

  'FavoriteCleaners': {
    title: 'Favorite Cleaners',
    description: 'Client\'s saved/favorited cleaners for quick booking.',
    features: [
      'Grid of favorited cleaners',
      'Quick book buttons',
      'Remove from favorites',
      'Notes/tags per cleaner',
      'Last booking date display'
    ]
  },

  'MultiBooking': {
    title: 'Multi-Booking Interface',
    description: 'Book multiple cleaning sessions at once (recurring or batch).',
    features: [
      'Multiple date selection',
      'Recurring schedule setup',
      'Batch booking options',
      'Service consistency across bookings',
      'Bulk pricing display',
      'Calendar view for selected dates'
    ]
  },

  'Pricing': {
    title: 'Pricing Information Page',
    description: 'Public-facing pricing structure and packages.',
    features: [
      'Credit system explanation',
      'Tier-based pricing display',
      'Service type pricing',
      'Membership tiers',
      'Comparison tables',
      'FAQ section'
    ]
  },

  'Support': {
    title: 'Support Center',
    description: 'Help resources and ticket submission.',
    features: [
      'FAQ accordion',
      'Support ticket form',
      'Category selection',
      'File upload for evidence',
      'Ticket history (if logged in)',
      'Contact information'
    ]
  }
};

export default pageDescriptions;