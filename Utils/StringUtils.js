/**
 * Utils/StringUtils.js
 * String manipulation and formatting utilities.
 */

/**
 * Generate a UUID (v4)
 * @returns {string} UUID string
 */
function generateUUID() {
  return Utilities.getUuid();
}

/**
 * Slugify a string (convert to URL-friendly format)
 * @param {string} str - Input string
 * @returns {string} Slugified string
 */
function slugify(str) {
  return str
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

/**
 * Capitalize first letter of string
 * @param {string} str - Input string
 * @returns {string} Capitalized string
 */
function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Capitalize first letter of each word
 * @param {string} str - Input string
 * @returns {string} Title case string
 */
function toTitleCase(str) {
  if (!str) return '';
  return str.replace(/\w\S*/g, txt => capitalize(txt));
}

/**
 * Truncate string to specified length
 * @param {string} str - Input string
 * @param {number} maxLength - Maximum length
 * @param {string} suffix - Suffix to add if truncated (default: '...')
 * @returns {string} Truncated string
 */
function truncate(str, maxLength, suffix = '...') {
  if (!str || str.length <= maxLength) return str;
  return str.substring(0, maxLength - suffix.length) + suffix;
}

/**
 * Remove HTML tags from string
 * @param {string} html - HTML string
 * @returns {string} Plain text
 */
function stripHtml(html) {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '');
}

/**
 * Escape HTML special characters
 * @param {string} str - Input string
 * @returns {string} Escaped string
 */
function escapeHtml(str) {
  if (!str) return '';
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return str.replace(/[&<>"']/g, m => map[m]);
}

/**
 * Generate random string
 * @param {number} length - Length of string
 * @param {string} charset - Character set (default: alphanumeric)
 * @returns {string} Random string
 */
function generateRandomString(length, charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return result;
}

/**
 * Validate email format
 * @param {string} email - Email address
 * @returns {boolean} True if valid
 */
function isValidEmail(email) {
  if (!email) return false;
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Validate username format (alphanumeric + underscore)
 * @param {string} username - Username
 * @returns {boolean} True if valid
 */
function isValidUsername(username) {
  if (!username) return false;
  const config = getConfig('VALIDATION.USERNAME');
  if (username.length < config.MIN_LENGTH) return false;
  return config.PATTERN.test(username);
}

/**
 * Generate auto-incremented code
 * @param {string} prefix - Code prefix (e.g., 'DIR')
 * @param {number} number - Current number
 * @param {number} padding - Number of digits (default: 3)
 * @returns {string} Generated code (e.g., 'DIR-001')
 */
function generateCode(prefix, number, padding = 3) {
  const paddedNumber = String(number).padStart(padding, '0');
  return `${prefix}-${paddedNumber}`;
}

/**
 * Parse code to extract number
 * @param {string} code - Code string (e.g., 'DIR-001')
 * @returns {number} Extracted number
 */
function parseCodeNumber(code) {
  if (!code) return 0;
  const parts = code.split('-');
  return parseInt(parts[parts.length - 1]) || 0;
}

/**
 * Generate KPI code
 * @param {number} year - Year
 * @param {string} unitCode - Work unit code
 * @param {string} perspective - KPI perspective
 * @param {number} autoNumber - Sequential number
 * @returns {string} KPI code (e.g., '2024.KPI.WU001.FINANCIAL.001')
 */
function generateKPICode(year, unitCode, perspective, autoNumber) {
  return `${year}.KPI.${unitCode}.${perspective}.${String(autoNumber).padStart(3, '0')}`;
}

/**
 * Generate Individual KPI code
 * @param {number} year - Year
 * @param {string} unitCode - Work unit code
 * @param {string} positionCode - Position code
 * @param {number} autoNumber - Sequential number
 * @returns {string} Individual KPI code
 */
function generateIndividualKPICode(year, unitCode, positionCode, autoNumber) {
  return `${year}.KPIINDIVIDU.${unitCode}.${positionCode}.${String(autoNumber).padStart(3, '0')}`;
}

/**
 * Generate Impact Center code
 * @param {number} year - Year
 * @param {number} autoNumber - Sequential number
 * @returns {string} IC code (e.g., '2024.IC.001')
 */
function generateICCode(year, autoNumber) {
  return `${year}.IC.${String(autoNumber).padStart(3, '0')}`;
}

/**
 * Sanitize input for database (prevent injection)
 * @param {string} input - User input
 * @returns {string} Sanitized input
 */
function sanitizeInput(input) {
  if (!input) return '';
  // Remove potential script tags and dangerous characters
  return String(input)
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/[<>]/g, '')
    .trim();
}

/**
 * Convert object to query string
 * @param {Object} params - Object with key-value pairs
 * @returns {string} Query string
 */
function objectToQueryString(params) {
  return Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');
}

/**
 * Extract initials from full name
 * @param {string} fullName - Full name
 * @returns {string} Initials (e.g., 'John Doe' -> 'JD')
 */
function getInitials(fullName) {
  if (!fullName) return '';
  return fullName
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .substring(0, 3);
}
