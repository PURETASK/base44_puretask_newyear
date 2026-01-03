/**
 * Centralized tier color system for PureTask
 * Use these utilities anywhere tiers are displayed for consistent styling
 */

export const TIER_COLORS = {
  'Elite': {
    bg: 'bg-purple-50',
    border: 'border-purple-500',
    text: 'text-purple-800',
    badge: 'bg-purple-100 text-purple-800 border-purple-300',
    chart: '#9333ea',
    solid: '#9333ea',
    light: '#f3e8ff'
  },
  'Pro': {
    bg: 'bg-blue-50',
    border: 'border-blue-500',
    text: 'text-blue-800',
    badge: 'bg-blue-100 text-blue-800 border-blue-300',
    chart: '#3b82f6',
    solid: '#3b82f6',
    light: '#eff6ff'
  },
  'Semi Pro': {
    bg: 'bg-green-50',
    border: 'border-green-500',
    text: 'text-green-800',
    badge: 'bg-green-100 text-green-800 border-green-300',
    chart: '#10b981',
    solid: '#10b981',
    light: '#f0fdf4'
  },
  'Developing': {
    bg: 'bg-gray-50',
    border: 'border-gray-500',
    text: 'text-gray-800',
    badge: 'bg-gray-100 text-gray-800 border-gray-300',
    chart: '#6b7280',
    solid: '#6b7280',
    light: '#f9fafb'
  }
};

/**
 * Get tier badge classes (for Badge component)
 */
export const getTierBadgeColor = (tier) => {
  return TIER_COLORS[tier]?.badge || TIER_COLORS['Developing'].badge;
};

/**
 * Get tier card classes (for Card component with tier styling)
 */
export const getTierCardClasses = (tier) => {
  const colors = TIER_COLORS[tier] || TIER_COLORS['Developing'];
  return `${colors.bg} ${colors.border} border-2`;
};

/**
 * Get tier text color class
 */
export const getTierTextColor = (tier) => {
  return TIER_COLORS[tier]?.text || TIER_COLORS['Developing'].text;
};

/**
 * Get tier chart color (for recharts)
 */
export const getTierChartColor = (tier) => {
  return TIER_COLORS[tier]?.chart || TIER_COLORS['Developing'].chart;
};

/**
 * Get tier solid color (hex)
 */
export const getTierSolidColor = (tier) => {
  return TIER_COLORS[tier]?.solid || TIER_COLORS['Developing'].solid;
};

/**
 * Get tier light background color (hex)
 */
export const getTierLightColor = (tier) => {
  return TIER_COLORS[tier]?.light || TIER_COLORS['Developing'].light;
};

/**
 * Get complete tier style object (for inline styles)
 */
export const getTierStyle = (tier) => {
  const colors = TIER_COLORS[tier] || TIER_COLORS['Developing'];
  return {
    backgroundColor: colors.light,
    borderColor: colors.solid,
    color: colors.solid
  };
};