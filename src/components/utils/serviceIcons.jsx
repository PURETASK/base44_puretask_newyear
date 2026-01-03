import React from 'react';
import {
  Home, Sparkles, Wind, Utensils, Bath, Shirt,
  Grid, Package, Refrigerator, Sofa, ArrowRight, Droplets,
  Waves, Sprout, Flower2, Warehouse, Building2, Trash2, Fan
} from 'lucide-react';

// Task name mapping - handles database names (snake_case) and display names
const TASK_NAME_MAPPING = {
  'general_clean': 'Standard Clean',
  'standard_clean': 'Standard Clean',
  'deep_clean': 'Deep Clean',
  'kitchen': 'Kitchen',
  'bathroom': 'Bathroom',
  'bathrooms': 'Bathroom',
  'laundry': 'Laundry',
  'windows': 'Windows',
  'organizing': 'Organizing',
  'oven': 'Oven',
  'refrigerator': 'Fridge',
  'fridge': 'Fridge',
  'carpets': 'Carpets',
  'carpet_cleaning': 'Carpets',
  'move_in_out': 'Move In/Out',
  'eco_supplies': 'Eco Supplies',
  'floor_cleaning': 'Floor Cleaning',
  'dusting': 'Dusting',
  'vacuuming': 'Vacuuming',
  'mopping': 'Mopping',
  'trash_removal': 'Trash Removal',
  'green_cleaning': 'Green Cleaning',
  'commercial': 'Commercial',
  'shower_tub': 'Shower/Tub',
  'appliances': 'Appliances',
  'baseboards': 'Baseboards',
  'ceiling_fans': 'Ceiling Fans',
  'blinds': 'Blinds'
};

// Comprehensive service icon mapping
export const SERVICE_ICONS = {
  'Standard Clean': Home,
  'Deep Clean': Sparkles,
  'Eco Supplies': Wind,
  'Kitchen': Utensils,
  'Bathroom': Bath,
  'Laundry': Shirt,
  'Windows': Grid,
  'Organizing': Package,
  'Fridge': Refrigerator,
  'Oven': Utensils,
  'Carpets': Sofa,
  'Move In/Out': ArrowRight,
  'Floor Cleaning': Droplets,
  'Dusting': Flower2,
  'Vacuuming': Warehouse,
  'Mopping': Waves,
  'Trash Removal': Trash2,
  'Green Cleaning': Sprout,
  'Commercial': Building2,
  'Shower/Tub': Bath,
  'Appliances': Package,
  'Baseboards': Home,
  'Ceiling Fans': Fan,
  'Blinds': Grid,
};

// Service colors for consistent theming
export const SERVICE_COLORS = {
  'Standard Clean': 'bg-blue-100 text-blue-700 border-blue-200',
  'Deep Clean': 'bg-purple-100 text-purple-700 border-purple-200',
  'Eco Supplies': 'bg-green-100 text-green-700 border-green-200',
  'Kitchen': 'bg-orange-100 text-orange-700 border-orange-200',
  'Bathroom': 'bg-cyan-100 text-cyan-700 border-cyan-200',
  'Laundry': 'bg-pink-100 text-pink-700 border-pink-200',
  'Windows': 'bg-sky-100 text-sky-700 border-sky-200',
  'Organizing': 'bg-amber-100 text-amber-700 border-amber-200',
  'Fridge': 'bg-indigo-100 text-indigo-700 border-indigo-200',
  'Oven': 'bg-red-100 text-red-700 border-red-200',
  'Carpets': 'bg-teal-100 text-teal-700 border-teal-200',
  'Move In/Out': 'bg-violet-100 text-violet-700 border-violet-200',
  'Floor Cleaning': 'bg-blue-100 text-blue-700 border-blue-200',
  'Dusting': 'bg-slate-100 text-slate-700 border-slate-200',
  'Vacuuming': 'bg-gray-100 text-gray-700 border-gray-200',
  'Mopping': 'bg-cyan-100 text-cyan-700 border-cyan-200',
  'Trash Removal': 'bg-slate-100 text-slate-700 border-slate-200',
  'Green Cleaning': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  'Commercial': 'bg-indigo-100 text-indigo-700 border-indigo-200',
  'Shower/Tub': 'bg-blue-100 text-blue-700 border-blue-200',
  'Appliances': 'bg-purple-100 text-purple-700 border-purple-200',
  'Baseboards': 'bg-slate-100 text-slate-700 border-slate-200',
  'Ceiling Fans': 'bg-sky-100 text-sky-700 border-sky-200',
  'Blinds': 'bg-gray-100 text-gray-700 border-gray-200',
};

// Normalize service name - converts database format to display format
export const normalizeServiceName = (serviceName) => {
  if (!serviceName) return 'Standard Clean';
  
  // If it's already in the correct format, return it
  if (SERVICE_ICONS[serviceName]) {
    return serviceName;
  }
  
  // Convert to lowercase and check mapping
  const normalized = serviceName.toLowerCase().replace(/\s+/g, '_');
  return TASK_NAME_MAPPING[normalized] || serviceName;
};

// Get icon for a service, with fallback
export const getServiceIcon = (serviceName) => {
  const normalized = normalizeServiceName(serviceName);
  return SERVICE_ICONS[normalized] || Home;
};

// Get color class for a service
export const getServiceColor = (serviceName) => {
  const normalized = normalizeServiceName(serviceName);
  return SERVICE_COLORS[normalized] || 'bg-slate-100 text-slate-700 border-slate-200';
};

// Render a service badge with icon
export const ServiceBadge = ({ serviceName, size = 'default', className = '' }) => {
  const normalized = normalizeServiceName(serviceName);
  const Icon = getServiceIcon(serviceName);
  const colorClass = getServiceColor(serviceName);
  const sizeClasses = size === 'small' ? 'text-xs px-2 py-1' : 'text-sm px-3 py-1.5';
  
  return (
    <div className={`inline-flex items-center gap-1.5 rounded-full border ${colorClass} ${sizeClasses} font-medium ${className}`}>
      <Icon className={size === 'small' ? 'w-3 h-3' : 'w-4 h-4'} />
      <span>{normalized}</span>
    </div>
  );
};