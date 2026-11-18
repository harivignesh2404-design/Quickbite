export class ApiError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

export function isUuid(value) {
  return (
    typeof value === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value.trim())
  );
}

export function requireNonEmptyString(value, fieldName, minLen = 1, maxLen = 500) {
  if (typeof value !== 'string') {
    throw new ApiError(400, `${fieldName} is required.`);
  }
  const trimmed = value.trim();
  if (trimmed.length < minLen) {
    throw new ApiError(400, `${fieldName} must be at least ${minLen} character(s).`);
  }
  if (trimmed.length > maxLen) {
    throw new ApiError(400, `${fieldName} must be under ${maxLen} characters.`);
  }
  return trimmed;
}

export function validatePhone(phone) {
  const cleaned = String(phone || '').replace(/[\s\-()]/g, '');
  if (!/^\+?[0-9]{10,15}$/.test(cleaned)) {
    throw new ApiError(400, 'Please enter a valid 10 to 15 digit phone number.');
  }
  return cleaned;
}

export function validatePrice(value, fieldName = 'Price') {
  const num = Number(value);
  if (!Number.isFinite(num) || num <= 0) {
    throw new ApiError(400, `${fieldName} must be a positive number.`);
  }
  return Math.round(num * 100) / 100;
}

export function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}
