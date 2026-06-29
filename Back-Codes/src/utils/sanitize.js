const xss = require('xss');

function sanitizeString(value) {
  if (typeof value !== 'string') return value;
  return xss(value.trim());
}

function sanitizeObject(obj) {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(sanitizeObject);
  if (typeof obj !== 'object') {
    return typeof obj === 'string' ? sanitizeString(obj) : obj;
  }
  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    sanitized[key] = sanitizeObject(value);
  }
  return sanitized;
}

module.exports = { sanitizeString, sanitizeObject };
