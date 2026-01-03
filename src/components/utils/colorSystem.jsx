/**
 * Get color classes and configuration for reliability tiers
 * Tiers: Elite (90-100), Pro (78-89), Semi Pro (67-77), Developing (0-66)
 */
export function getTierColorClasses(tier) {
  const configs = {
    'Elite': {
      gradient: 'from-amber-500 to-orange-500',
      bg: 'bg-amber-100',
      text: 'text-amber-600',
      border: 'border-amber-300',
      ring: 'ring-amber-100',
      icon: '👑',
      description: 'Top 10% of cleaners',
      scoreRange: '90-100'
    },
    'Pro': {
      gradient: 'from-blue-500 to-indigo-500',
      bg: 'bg-blue-100',
      text: 'text-blue-600',
      border: 'border-blue-300',
      ring: 'ring-blue-100',
      icon: '⭐',
      description: 'Experienced professional',
      scoreRange: '78-89'
    },
    'Semi Pro': {
      gradient: 'from-emerald-500 to-green-500',
      bg: 'bg-emerald-100',
      text: 'text-emerald-600',
      border: 'border-emerald-300',
      ring: 'ring-emerald-100',
      icon: '✓',
      description: 'Consistent performer',
      scoreRange: '67-77'
    },
    'Developing': {
      gradient: 'from-slate-400 to-gray-500',
      bg: 'bg-slate-100',
      text: 'text-slate-600',
      border: 'border-slate-300',
      ring: 'ring-slate-100',
      icon: '○',
      description: 'Building reliability',
      scoreRange: '0-66'
    }
  };

  return configs[tier] || configs['Developing'];
}

/**
 * Get tier from reliability score
 */
export function getTierFromScore(score) {
  if (score >= 90) return 'Elite';
  if (score >= 78) return 'Pro';
  if (score >= 67) return 'Semi Pro';
  return 'Developing';
}

/**
 * Get color classes for product preferences
 */
export function getProductColors(productPreference) {
  const configs = {
    'standard': {
      gradient: 'from-blue-50 to-cyan-50',
      bg: 'bg-blue-100',
      text: 'text-blue-700',
      border: 'border-blue-200',
      description: 'Standard Cleaning Products'
    },
    'eco-friendly': {
      gradient: 'from-green-50 to-emerald-50',
      bg: 'bg-green-100',
      text: 'text-green-700',
      border: 'border-green-200',
      description: 'Eco-Friendly Products'
    },
    'professional-grade': {
      gradient: 'from-purple-50 to-indigo-50',
      bg: 'bg-purple-100',
      text: 'text-purple-700',
      border: 'border-purple-200',
      description: 'Professional-Grade Products'
    },
    'premium-eco': {
      gradient: 'from-amber-50 to-yellow-50',
      bg: 'bg-amber-100',
      text: 'text-amber-700',
      border: 'border-amber-200',
      description: 'Premium Eco-Luxury Products'
    }
  };

  return configs[productPreference] || configs['standard'];
}

/**
 * Get color classes for ratings
 */
export function getRatingColor(rating) {
  if (rating >= 4.8) {
    return {
      bg: 'bg-amber-50',
      text: 'text-amber-600',
      star: 'fill-amber-400 text-amber-400'
    };
  }
  if (rating >= 4.5) {
    return {
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
      star: 'fill-emerald-400 text-emerald-400'
    };
  }
  if (rating >= 4.0) {
    return {
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      star: 'fill-blue-400 text-blue-400'
    };
  }
  return {
    bg: 'bg-slate-50',
    text: 'text-slate-600',
    star: 'fill-slate-400 text-slate-400'
  };
}