/**
 * Validation utilities for input sanitization and validation
 */

export function validateEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

export function validatePhone(phone) {
  if (!phone || typeof phone !== 'string') return false;
  const digits = phone.replace(/\D/g, '');
  return digits.length === 10 || digits.length === 11;
}

export function validateAddress(address) {
  if (!address || typeof address !== 'string') return false;
  const trimmed = address.trim();
  return trimmed.length >= 5 && /[a-zA-Z]/.test(trimmed) && /\d/.test(trimmed);
}

export function validatePrice(price) {
  if (typeof price !== 'number') return false;
  return price >= 0 && price <= 10000 && !isNaN(price);
}

export function validateDate(date) {
  if (!date) return false;
  const dateObj = new Date(date);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return dateObj instanceof Date && !isNaN(dateObj) && dateObj >= now;
}

export function sanitizeString(str) {
  if (!str || typeof str !== 'string') return '';
  return str
    .trim()
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .slice(0, 1000);
}

export function sanitizeHTML(html) {
  if (!html || typeof html !== 'string') return '';
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '');
}

export function validateHourlyRate(rate) {
  if (typeof rate !== 'number') return false;
  return rate >= 15 && rate <= 200;
}

export function validateBookingHours(hours) {
  if (typeof hours !== 'number') return false;
  return hours >= 2 && hours <= 12;
}

export function maskPhone(phone) {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-xxx-xx${digits.slice(-2)}`;
  }
  return 'xxx-xxx-xxxx';
}

export function maskEmail(email) {
  if (!email || !email.includes('@')) return 'xxx@xxx.com';
  const [name, domain] = email.split('@');
  if (name.length <= 2) return `${name}@${domain}`;
  return `${name.slice(0, 2)}${'*'.repeat(name.length - 2)}@${domain}`;
}

export function sanitizeFileName(filename) {
  if (!filename || typeof filename !== 'string') return 'file';
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .slice(0, 100);
}

export function validateCoordinates(lat, lng) {
  if (typeof lat !== 'number' || typeof lng !== 'number') return false;
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}