/**
 * Strategic Execution Monitoring Application - ES6 Inline Script
 * All JavaScript files combined for Google Apps Script HTML Service
 */

// ============================================================================
// LOAD ORDER: utils -> api -> auth -> components -> charts -> org-diagram
//              -> search -> notifications -> export -> enhanced-features
//              -> security -> pwa-install -> app
// ============================================================================


// ============================================================================// FROM: utils.js
// ============================================================================

/**
 * Utility Functions for Strategic Execution Monitoring Application
 * Provides helper functions for date, string formatting, validation, etc.
 */

// ============================================================================
// DATE UTILITIES
// ============================================================================

const DateUtils = {
    /**
     * Format date to display string
     * @param {Date|string} date - Date to format
     * @param {string} format - Format type: 'short', 'long', 'time', 'full'
     * @param {string} locale - Locale code (default: 'id-ID')
     * @returns {string} Formatted date string
     */
    formatDate(date, format = 'short', locale = 'id-ID') {
        if (!date) return '-';
        const d = new Date(date);
        if (isNaN(d.getTime())) return '-';

        const options = {
            'short': { year: 'numeric', month: 'short', day: 'numeric' },
            'long': { year: 'numeric', month: 'long', day: 'numeric' },
            'time': { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' },
            'full': { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' },
            'monthYear': { year: 'numeric', month: 'long' },
            'yearMonth': { year: 'numeric', month: '2-digit' }
        };

        return d.toLocaleDateString(locale, options[format] || options['short']);
    },

    /**
     * Get date range string
     * @param {Date|string} startDate - Start date
     * @param {Date|string} endDate - End date
     * @returns {string} Formatted date range
     */
    getDateRange(startDate, endDate) {
        const start = this.formatDate(startDate, 'short');
        const end = this.formatDate(endDate, 'short');
        return `${start} - ${end}`;
    },

    /**
     * Get week number from date
     * @param {Date} date - Date to get week number for
     * @returns {number} Week number (1-53)
     */
    getWeekNumber(date) {
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    },

    /**
     * Get start and end date of week
     * @param {number} year - Year
     * @param {number} week - Week number
     * @returns {object} { startDate: Date, endDate: Date }
     */
    getWeekDates(year, week) {
        const firstDayOfYear = new Date(year, 0, 1);
        const daysToAdd = (week - 1) * 7;
        const startDate = new Date(firstDayOfYear);
        startDate.setDate(firstDayOfYear.getDate() + daysToAdd);

        // Adjust to Monday
        const dayOfWeek = startDate.getDay();
        const diff = startDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        startDate.setDate(diff);

        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);

        return { startDate, endDate };
    },

    /**
     * Get month name
     * @param {number} month - Month number (0-11)
     * @param {string} locale - Locale code
     * @returns {string} Month name
     */
    getMonthName(month, locale = 'id-ID') {
        const date = new Date();
        date.setMonth(month);
        return date.toLocaleDateString(locale, { month: 'long' });
    },

    /**
     * Get quarter from date
     * @param {Date} date - Date to get quarter for
     * @returns {number} Quarter (1-4)
     */
    getQuarter(date) {
        return Math.floor(date.getMonth() / 3) + 1;
    },

    /**
     * Add days to date
     * @param {Date} date - Original date
     * @param {number} days - Days to add
     * @returns {Date} New date
     */
    addDays(date, days) {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    },

    /**
     * Add months to date
     * @param {Date} date - Original date
     * @param {number} months - Months to add
     * @returns {Date} New date
     */
    addMonths(date, months) {
        const result = new Date(date);
        result.setMonth(result.getMonth() + months);
        return result;
    },

    /**
     * Calculate days between two dates
     * @param {Date} startDate - Start date
     * @param {Date} endDate - End date
     * @returns {number} Days between
     */
    daysBetween(startDate, endDate) {
        const oneDay = 24 * 60 * 60 * 1000;
        return Math.round((endDate - startDate) / oneDay);
    },

    /**
     * Check if date is today
     * @param {Date} date - Date to check
     * @returns {boolean}
     */
    isToday(date) {
        const today = new Date();
        return date.getDate() === today.getDate() &&
               date.getMonth() === today.getMonth() &&
               date.getFullYear() === today.getFullYear();
    },

    /**
     * Check if date is in current week
     * @param {Date} date - Date to check
     * @returns {boolean}
     */
    isThisWeek(date) {
        const today = new Date();
        const weekNum = this.getWeekNumber(today);
        return this.getWeekNumber(date) === weekNum && date.getFullYear() === today.getFullYear();
    },

    /**
     * Get relative time string (e.g., "2 days ago")
     * @param {Date} date - Date to compare
     * @returns {string}
     */
    getRelativeTime(date) {
        const now = new Date();
        const diffMs = now - new Date(date);
        const diffSec = Math.floor(diffMs / 1000);
        const diffMin = Math.floor(diffSec / 60);
        const diffHour = Math.floor(diffMin / 60);
        const diffDay = Math.floor(diffHour / 24);

        if (diffSec < 60) return 'just now';
        if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
        if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
        if (diffDay < 7) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
        return this.formatDate(date, 'short');
    }
};

// ============================================================================
// STRING UTILITIES
// ============================================================================

const StringUtils = {
    /**
     * Convert string to title case
     * @param {string} str - String to convert
     * @returns {string} Title case string
     */
    toTitleCase(str) {
        if (!str) return '';
        return str.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
    },

    /**
     * Convert string to sentence case
     * @param {string} str - String to convert
     * @returns {string} Sentence case string
     */
    toSentenceCase(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    },

    /**
     * Convert string to slug
     * @param {string} str - String to convert
     * @returns {string} Slug string
     */
    toSlug(str) {
        if (!str) return '';
        return str
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    },

    /**
     * Truncate string with ellipsis
     * @param {string} str - String to truncate
     * @param {number} length - Max length
     * @param {string} suffix - Suffix to add (default: '...')
     * @returns {string} Truncated string
     */
    truncate(str, length, suffix = '...') {
        if (!str) return '';
        if (str.length <= length) return str;
        return str.substring(0, length - suffix.length) + suffix;
    },

    /**
     * Generate random string
     * @param {number} length - Length of string
     * @param {string} charset - Characters to use
     * @returns {string} Random string
     */
    random(length = 8, charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') {
        let result = '';
        for (let i = 0; i < length; i++) {
            result += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        return result;
    },

    /**
     * Generate UUID v4
     * @returns {string} UUID
     */
    uuid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    },

    /**
     * Escape HTML special characters
     * @param {string} str - String to escape
     * @returns {string} Escaped string
     */
    escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    /**
     * Unescape HTML special characters
     * @param {string} str - String to unescape
     * @returns {string} Unescaped string
     */
    unescapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.innerHTML = str;
        return div.textContent;
    },

    /**
     * Format number with thousands separator
     * @param {number} num - Number to format
     * @param {string} locale - Locale code
     * @returns {string} Formatted number
     */
    formatNumber(num, locale = 'id-ID') {
        if (num === null || num === undefined) return '-';
        return num.toLocaleString(locale);
    },

    /**
     * Format currency
     * @param {number} amount - Amount to format
     * @param {string} currency - Currency code (default: 'IDR')
     * @param {string} locale - Locale code
     * @returns {string} Formatted currency
     */
    formatCurrency(amount, currency = 'IDR', locale = 'id-ID') {
        if (amount === null || amount === undefined) return '-';
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    },

    /**
     * Format percentage
     * @param {number} value - Value to format
     * @param {number} decimals - Decimal places
     * @returns {string} Formatted percentage
     */
    formatPercentage(value, decimals = 1) {
        if (value === null || value === undefined) return '-';
        return `${value.toFixed(decimals)}%`;
    },

    /**
     * Capitalize first letter
     * @param {string} str - String to capitalize
     * @returns {string} Capitalized string
     */
    capitalize(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    },

    /**
     * Check if string is empty or only whitespace
     * @param {string} str - String to check
     * @returns {boolean}
     */
    isEmpty(str) {
        return !str || str.trim().length === 0;
    },

    /**
     * Pad string with zeros
     * @param {string|number} num - Number to pad
     * @param {number} size - Total size
     * @returns {string} Padded string
     */
    padZero(num, size = 2) {
        let s = num.toString();
        while (s.length < size) s = '0' + s;
        return s;
    },

    /**
     * Split string into array of chunks
     * @param {string} str - String to split
     * @param {number} chunkSize - Size of each chunk
     * @returns {array} Array of chunks
     */
    chunk(str, chunkSize) {
        const chunks = [];
        for (let i = 0; i < str.length; i += chunkSize) {
            chunks.push(str.substring(i, i + chunkSize));
        }
        return chunks;
    },

    /**
     * Highlight search terms in text
     * @param {string} text - Text to highlight
     * @param {string} searchTerm - Term to highlight
     * @returns {string} Text with highlighted terms
     */
    highlight(text, searchTerm) {
        if (!text || !searchTerm) return text;
        const regex = new RegExp(`(${searchTerm})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    },

    /**
     * Convert camelCase to snake_case
     * @param {string} str - String to convert
     * @returns {string} snake_case string
     */
    camelToSnake(str) {
        return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    },

    /**
     * Convert snake_case to camelCase
     * @param {string} str - String to convert
     * @returns {string} camelCase string
     */
    snakeToCamel(str) {
        return str.replace(/([-_][a-z])/g, group =>
            group.toUpperCase().replace('-', '').replace('_', '')
        );
    },

    /**
     * Parse query string to object
     * @param {string} queryString - Query string
     * @returns {object} Parsed object
     */
    parseQueryString(queryString) {
        const params = {};
        const pairs = queryString.substring(1).split('&');
        pairs.forEach(pair => {
            const [key, value] = pair.split('=');
            params[decodeURIComponent(key)] = decodeURIComponent(value);
        });
        return params;
    },

    /**
     * Build query string from object
     * @param {object} params - Parameters object
     * @returns {string} Query string
     */
    buildQueryString(params) {
        return Object.keys(params)
            .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
            .join('&');
    }
};

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

const ValidationUtils = {
    /**
     * Validate email format
     * @param {string} email - Email to validate
     * @returns {boolean}
     */
    isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    /**
     * Validate URL format
     * @param {string} url - URL to validate
     * @returns {boolean}
     */
    isValidUrl(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    },

    /**
     * Validate phone number (basic)
     * @param {string} phone - Phone number to validate
     * @returns {boolean}
     */
    isValidPhone(phone) {
        const re = /^[\d\s\-+()]+$/;
        return re.test(phone) && phone.replace(/\D/g, '').length >= 10;
    },

    /**
     * Validate password strength
     * @param {string} password - Password to validate
     * @returns {object} { isValid: boolean, strength: string, issues: array }
     */
    validatePassword(password) {
        const issues = [];
        let strength = 'weak';

        if (password.length < 8) issues.push('At least 8 characters');
        if (!/[a-z]/.test(password)) issues.push('Lowercase letter');
        if (!/[A-Z]/.test(password)) issues.push('Uppercase letter');
        if (!/\d/.test(password)) issues.push('Number');
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) issues.push('Special character');

        const score = 5 - issues.length;
        if (score >= 4) strength = 'strong';
        else if (score >= 3) strength = 'medium';

        return {
            isValid: issues.length === 0,
            strength,
            issues
        };
    },

    /**
     * Check if value is between min and max
     * @param {number} value - Value to check
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @returns {boolean}
     */
    isBetween(value, min, max) {
        return value >= min && value <= max;
    },

    /**
     * Check if date range is valid
     * @param {Date} startDate - Start date
     * @param {Date} endDate - End date
     * @returns {boolean}
     */
    isValidDateRange(startDate, endDate) {
        return new Date(startDate) <= new Date(endDate);
    },

    /**
     * Check if percentage is valid (0-100)
     * @param {number} value - Value to check
     * @returns {boolean}
     */
    isValidPercentage(value) {
        return value >= 0 && value <= 100;
    }
};

// ============================================================================
// ARRAY UTILITIES
// ============================================================================

const ArrayUtils = {
    /**
     * Remove duplicates from array
     * @param {array} arr - Array to deduplicate
     * @returns {array} Deduplicated array
     */
    unique(arr) {
        return [...new Set(arr)];
    },

    /**
     * Group array by key
     * @param {array} arr - Array to group
     * @param {string} key - Key to group by
     * @returns {object} Grouped object
     */
    groupBy(arr, key) {
        return arr.reduce((result, item) => {
            const group = item[key];
            result[group] = result[group] || [];
            result[group].push(item);
            return result;
        }, {});
    },

    /**
     * Sort array by key
     * @param {array} arr - Array to sort
     * @param {string} key - Key to sort by
     * @param {string} order - 'asc' or 'desc'
     * @returns {array} Sorted array
     */
    sortBy(arr, key, order = 'asc') {
        return arr.sort((a, b) => {
            if (order === 'asc') return a[key] > b[key] ? 1 : -1;
            return a[key] < b[key] ? 1 : -1;
        });
    },

    /**
     * Chunk array into smaller arrays
     * @param {array} arr - Array to chunk
     * @param {number} size - Chunk size
     * @returns {array} Array of chunks
     */
    chunk(arr, size) {
        const chunks = [];
        for (let i = 0; i < arr.length; i += size) {
            chunks.push(arr.slice(i, i + size));
        }
        return chunks;
    },

    /**
     * Flatten nested array
     * @param {array} arr - Array to flatten
     * @returns {array} Flattened array
     */
    flatten(arr) {
        return arr.flat(Infinity);
    },

    /**
     * Shuffle array
     * @param {array} arr - Array to shuffle
     * @returns {array} Shuffled array
     */
    shuffle(arr) {
        const shuffled = [...arr];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    },

    /**
     * Get random item from array
     * @param {array} arr - Array
     * @returns {*} Random item
     */
    random(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    },

    /**
     * Sum array of numbers
     * @param {array} arr - Array of numbers
     * @returns {number} Sum
     */
    sum(arr) {
        return arr.reduce((sum, val) => sum + val, 0);
    },

    /**
     * Get average of array of numbers
     * @param {array} arr - Array of numbers
     * @returns {number} Average
     */
    average(arr) {
        return arr.length > 0 ? this.sum(arr) / arr.length : 0;
    },

    /**
     * Find item in array by property value
     * @param {array} arr - Array to search
     * @param {string} prop - Property name
     * @param {*} value - Value to match
     * @returns {*} Found item or undefined
     */
    findBy(arr, prop, value) {
        return arr.find(item => item[prop] === value);
    }
};

// ============================================================================
// OBJECT UTILITIES
// ============================================================================

const ObjectUtils = {
    /**
     * Deep clone object
     * @param {object} obj - Object to clone
     * @returns {object} Cloned object
     */
    clone(obj) {
        return JSON.parse(JSON.stringify(obj));
    },

    /**
     * Merge objects
     * @param {object} target - Target object
     * @param {...object} sources - Source objects
     * @returns {object} Merged object
     */
    merge(target, ...sources) {
        return Object.assign({}, target, ...sources);
    },

    /**
     * Get nested property value
     * @param {object} obj - Object
     * @param {string} path - Dot notation path
     * @param {*} defaultValue - Default value if not found
     * @returns {*} Property value or default
     */
    get(obj, path, defaultValue = undefined) {
        const keys = path.split('.');
        let result = obj;
        for (const key of keys) {
            if (result == null) return defaultValue;
            result = result[key];
        }
        return result !== undefined ? result : defaultValue;
    },

    /**
     * Set nested property value
     * @param {object} obj - Object
     * @param {string} path - Dot notation path
     * @param {*} value - Value to set
     * @returns {object} Modified object
     */
    set(obj, path, value) {
        const keys = path.split('.');
        const result = { ...obj };
        let current = result;
        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            if (!(key in current)) {
                current[key] = {};
            }
            current = current[key];
        }
        current[keys[keys.length - 1]] = value;
        return result;
    },

    /**
     * Check if object is empty
     * @param {object} obj - Object to check
     * @returns {boolean}
     */
    isEmpty(obj) {
        return Object.keys(obj).length === 0;
    },

    /**
     * Pick specific keys from object
     * @param {object} obj - Source object
     * @param {array} keys - Keys to pick
     * @returns {object} Object with picked keys
     */
    pick(obj, keys) {
        return keys.reduce((result, key) => {
            if (key in obj) result[key] = obj[key];
            return result;
        }, {});
    },

    /**
     * Omit specific keys from object
     * @param {object} obj - Source object
     * @param {array} keys - Keys to omit
     * @returns {object} Object without omitted keys
     */
    omit(obj, keys) {
        const result = { ...obj };
        keys.forEach(key => delete result[key]);
        return result;
    },

    /**
     * Convert object to query string
     * @param {object} obj - Object to convert
     * @returns {string} Query string
     */
    toQueryString(obj) {
        return Object.keys(obj)
            .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`)
            .join('&');
    }
};

// ============================================================================
// STORAGE UTILITIES
// ============================================================================

const StorageUtils = {
    /**
     * Save to localStorage
     * @param {string} key - Storage key
     * @param {*} value - Value to store
     */
    save(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.error('Error saving to localStorage:', e);
        }
    },

    /**
     * Get from localStorage
     * @param {string} key - Storage key
     * @param {*} defaultValue - Default value if not found
     * @returns {*} Stored value or default
     */
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.error('Error reading from localStorage:', e);
            return defaultValue;
        }
    },

    /**
     * Remove from localStorage
     * @param {string} key - Storage key
     */
    remove(key) {
        try {
            localStorage.removeItem(key);
        } catch (e) {
            console.error('Error removing from localStorage:', e);
        }
    },

    /**
     * Clear all localStorage
     */
    clear() {
        try {
            localStorage.clear();
        } catch (e) {
            console.error('Error clearing localStorage:', e);
        }
    },

    /**
     * Save to sessionStorage
     * @param {string} key - Storage key
     * @param {*} value - Value to store
     */
    saveSession(key, value) {
        try {
            sessionStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.error('Error saving to sessionStorage:', e);
        }
    },

    /**
     * Get from sessionStorage
     * @param {string} key - Storage key
     * @param {*} defaultValue - Default value if not found
     * @returns {*} Stored value or default
     */
    getSession(key, defaultValue = null) {
        try {
            const item = sessionStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.error('Error reading from sessionStorage:', e);
            return defaultValue;
        }
    }
};

// ============================================================================
// MATH UTILITIES
// ============================================================================

const MathUtils = {
    /**
     * Clamp number between min and max
     * @param {number} num - Number to clamp
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @returns {number} Clamped value
     */
    clamp(num, min, max) {
        return Math.min(Math.max(num, min), max);
    },

    /**
     * Map number from one range to another
     * @param {number} value - Value to map
     * @param {number} inMin - Input range minimum
     * @param {number} inMax - Input range maximum
     * @param {number} outMin - Output range minimum
     * @param {number} outMax - Output range maximum
     * @returns {number} Mapped value
     */
    map(value, inMin, inMax, outMin, outMax) {
        return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
    },

    /**
     * Linear interpolation
     * @param {number} start - Start value
     * @param {number} end - End value
     * @param {number} t - Interpolation factor (0-1)
     * @returns {number} Interpolated value
     */
    lerp(start, end, t) {
        return start + (end - start) * t;
    },

    /**
     * Round to decimal places
     * @param {number} num - Number to round
     * @param {number} decimals - Decimal places
     * @returns {number} Rounded number
     */
    roundTo(num, decimals) {
        const factor = Math.pow(10, decimals);
        return Math.round(num * factor) / factor;
    },

    /**
     * Get percentage of value
     * @param {number} value - Current value
     * @param {number} total - Total value
     * @returns {number} Percentage (0-100)
     */
    percentage(value, total) {
        if (total === 0) return 0;
        return (value / total) * 100;
    },

    /**
     * Convert degrees to radians
     * @param {number} degrees - Degrees
     * @returns {number} Radians
     */
    degToRad(degrees) {
        return degrees * (Math.PI / 180);
    },

    /**
     * Convert radians to degrees
     * @param {number} radians - Radians
     * @returns {number} Degrees
     */
    radToDeg(radians) {
        return radians * (180 / Math.PI);
    }
};

// ============================================================================
// EXPORT ALL UTILITIES
// ============================================================================

// Make all utilities available globally
if (typeof window !== 'undefined') {
    window.DateUtils = DateUtils;
    window.StringUtils = StringUtils;
    window.ValidationUtils = ValidationUtils;
    window.ArrayUtils = ArrayUtils;
    window.ObjectUtils = ObjectUtils;
    window.StorageUtils = StorageUtils;
    window.MathUtils = MathUtils;
}


// ============================================================================// FROM: api.js
// ============================================================================

/**
 * API Client for Strategic Execution Monitoring Application
 * Centralized API communication layer with error handling, caching, and retry logic
 */

// ============================================================================
// API CLIENT CLASS
// ============================================================================

class APIClient {
    constructor() {
        this.baseURL = window.location.href; // Google Apps Script URL
        this.timeout = 30000; // 30 seconds
        this.retryAttempts = 3;
        this.retryDelay = 1000; // 1 second
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
        this.requestQueue = [];
        this.isProcessingQueue = false;
    }

    // ========================================================================
    // CORE API METHODS
    // ========================================================================

    /**
     * Make API call to backend
     * @param {string} endpoint - API endpoint (e.g., 'users/list')
     * @param {object} data - Request data
     * @param {object} options - Additional options
     * @returns {Promise} API response
     */
    async call(endpoint, data = {}, options = {}) {
        const {
            method = 'POST',
            timeout = this.timeout,
            useCache = false,
            showLoading = true,
            retryCount = 0
        } = options;

        // Check cache
        if (useCache && this.cache.has(endpoint)) {
            const cached = this.cache.get(endpoint);
            if (Date.now() - cached.timestamp < this.cacheTimeout) {
                console.log(`[API Cache] Using cached response for ${endpoint}`);
                return cached.data;
            }
        }

        // Show loading indicator
        if (showLoading) {
            this.showLoading();
        }

        try {
            const response = await this._makeCall(endpoint, data, timeout);

            // Cache successful responses
            if (useCache && response.success) {
                this.cache.set(endpoint, {
                    data: response,
                    timestamp: Date.now()
                });
            }

            return response;

        } catch (error) {
            console.error(`[API Error] ${endpoint}:`, error);

            // Retry on failure
            if (retryCount < this.retryAttempts) {
                console.log(`[API Retry] Attempt ${retryCount + 1}/${this.retryAttempts}`);
                await this._delay(this.retryDelay * (retryCount + 1));
                return this.call(endpoint, data, { ...options, retryCount: retryCount + 1 });
            }

            // Return error response
            return {
                success: false,
                message: error.message || 'An error occurred',
                error: error,
                data: null
            };

        } finally {
            if (showLoading) {
                this.hideLoading();
            }
        }
    }

    /**
     * Internal method to make Google Apps Script call
     * @private
     */
    _makeCall(endpoint, data, timeout) {
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                reject(new Error('Request timeout'));
            }, timeout);

            google.script.run
                .withSuccessHandler(response => {
                    clearTimeout(timer);
                    resolve(response);
                })
                .withFailureHandler(error => {
                    clearTimeout(timer);
                    reject(error);
                })
                .callAPI(endpoint, data);
        });
    }

    /**
     * Delay helper
     * @private
     */
    _delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // ========================================================================
    // HTTP METHOD HELPERS
    // ========================================================================

    /**
     * GET request
     */
    async get(endpoint, params = {}, options = {}) {
        return this.call(endpoint, params, { ...options, method: 'GET' });
    }

    /**
     * POST request
     */
    async post(endpoint, data = {}, options = {}) {
        return this.call(endpoint, data, { ...options, method: 'POST' });
    }

    /**
     * PUT request
     */
    async put(endpoint, data = {}, options = {}) {
        return this.call(endpoint, data, { ...options, method: 'PUT' });
    }

    /**
     * DELETE request
     */
    async delete(endpoint, data = {}, options = {}) {
        return this.call(endpoint, data, { ...options, method: 'DELETE' });
    }

    // ========================================================================
    // LOADING INDICATORS
    // ========================================================================

    showLoading(message = 'Loading...') {
        // Show global loading spinner
        let loader = document.getElementById('global-loader');
        if (!loader) {
            loader = document.createElement('div');
            loader.id = 'global-loader';
            loader.className = 'global-loading-overlay';
            loader.innerHTML = `
                <div class="global-loading-spinner">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <div class="loading-message">${message}</div>
                </div>
            `;
            document.body.appendChild(loader);
        } else {
            loader.querySelector('.loading-message').textContent = message;
        }
        loader.style.display = 'flex';
    }

    hideLoading() {
        const loader = document.getElementById('global-loader');
        if (loader) {
            loader.style.display = 'none';
        }
    }

    // ========================================================================
    // CACHE MANAGEMENT
    // ========================================================================

    clearCache(endpoint = null) {
        if (endpoint) {
            this.cache.delete(endpoint);
        } else {
            this.cache.clear();
        }
    }

    // ========================================================================
    // REQUEST QUEUE
    // ========================================================================

    queueRequest(endpoint, data, options) {
        return new Promise((resolve, reject) => {
            this.requestQueue.push({ endpoint, data, options, resolve, reject });
            this._processQueue();
        });
    }

    async _processQueue() {
        if (this.isProcessingQueue || this.requestQueue.length === 0) {
            return;
        }

        this.isProcessingQueue = true;

        while (this.requestQueue.length > 0) {
            const request = this.requestQueue.shift();
            try {
                const response = await this.call(request.endpoint, request.data, request.options);
                request.resolve(response);
            } catch (error) {
                request.reject(error);
            }
        }

        this.isProcessingQueue = false;
    }
}

// ============================================================================
// API ENDPOINTS - ORGANIZED BY MODULE
// ============================================================================

class API {
    constructor() {
        this.client = new APIClient();
    }

    // ========================================================================
    // AUTHENTICATION
    // ========================================================================

    auth = {
        // Login
        login: (username, password) => {
            return this.client.post('auth/login', { username, password });
        },

        // Logout
        logout: () => {
            return this.client.post('auth/logout', {});
        },

        // Get current user
        me: () => {
            return this.client.get('auth/me', {});
        },

        // Change password
        changePassword: (oldPassword, newPassword) => {
            return this.client.post('auth/change-password', {
                old_password: oldPassword,
                new_password: newPassword
            });
        },

        // Reset password
        resetPassword: (email) => {
            return this.client.post('auth/reset-password', { email });
        },

        // Verify token
        verifyToken: (token) => {
            return this.client.post('auth/verify', { token });
        }
    };

    // ========================================================================
    // USERS
    // ========================================================================

    users = {
        // List all users
        list: (filters = {}) => {
            return this.client.get('users/list', filters, { useCache: true });
        },

        // Get user by ID
        get: (userId) => {
            return this.client.get('users/get', { user_id: userId });
        },

        // Create user
        create: (userData) => {
            return this.client.post('users/create', userData);
        },

        // Update user
        update: (userId, userData) => {
            return this.client.put('users/update', { user_id: userId, ...userData });
        },

        // Delete user
        delete: (userId) => {
            return this.client.delete('users/delete', { user_id: userId });
        },

        // Activate/deactivate user
        toggleStatus: (userId, isActive) => {
            return this.client.put('users/toggle-status', { user_id: userId, is_active: isActive });
        },

        // Bulk import users
        bulkImport: (users) => {
            return this.client.post('users/bulk-import', { users });
        }
    };

    // ========================================================================
    // ROLES
    // ========================================================================

    roles = {
        // List all roles
        list: () => {
            return this.client.get('roles/list', {}, { useCache: true });
        },

        // Get role by ID
        get: (roleId) => {
            return this.client.get('roles/get', { role_id: roleId });
        },

        // Create role
        create: (roleData) => {
            return this.client.post('roles/create', roleData);
        },

        // Update role
        update: (roleId, roleData) => {
            return this.client.put('roles/update', { role_id: roleId, ...roleData });
        },

        // Delete role
        delete: (roleId) => {
            return this.client.delete('roles/delete', { role_id: roleId });
        },

        // Clone role
        clone: (roleId, newName) => {
            return this.client.post('roles/clone', { role_id: roleId, new_name: newName });
        }
    };

    // ========================================================================
    // ORGANIZATION - DIRECTORATES
    // ========================================================================

    directorates = {
        list: () => this.client.get('directorates/list', {}, { useCache: true }),
        get: (id) => this.client.get('directorates/get', { directorate_id: id }),
        create: (data) => this.client.post('directorates/create', data),
        update: (id, data) => this.client.put('directorates/update', { directorate_id: id, ...data }),
        delete: (id) => this.client.delete('directorates/delete', { directorate_id: id })
    };

    // ========================================================================
    // ORGANIZATION - WORK UNITS
    // ========================================================================

    workUnits = {
        list: (filters = {}) => this.client.get('work-units/list', filters, { useCache: true }),
        get: (id) => this.client.get('work-units/get', { work_unit_id: id }),
        create: (data) => this.client.post('work-units/create', data),
        update: (id, data) => this.client.put('work-units/update', { work_unit_id: id, ...data }),
        delete: (id) => this.client.delete('work-units/delete', { work_unit_id: id })
    };

    // ========================================================================
    // ORGANIZATION - AFFAIRS
    // ========================================================================

    affairs = {
        list: (filters = {}) => this.client.get('affairs/list', filters, { useCache: true }),
        get: (id) => this.client.get('affairs/get', { affair_id: id }),
        create: (data) => this.client.post('affairs/create', data),
        update: (id, data) => this.client.put('affairs/update', { affair_id: id, ...data }),
        delete: (id) => this.client.delete('affairs/delete', { affair_id: id })
    };

    // ========================================================================
    // ORGANIZATION - POSITIONS
    // ========================================================================

    positions = {
        list: (filters = {}) => this.client.get('positions/list', filters, { useCache: true }),
        get: (id) => this.client.get('positions/get', { position_id: id }),
        create: (data) => this.client.post('positions/create', data),
        update: (id, data) => this.client.put('positions/update', { position_id: id, ...data }),
        delete: (id) => this.client.delete('positions/delete', { position_id: id })
    };

    // ========================================================================
    // ORGANIZATION - POSITION ASSIGNMENTS
    // ========================================================================

    positionAssignments = {
        list: (filters = {}) => this.client.get('position-assignments/list', filters),
        get: (id) => this.client.get('position-assignments/get', { assignment_id: id }),
        create: (data) => this.client.post('position-assignments/create', data),
        update: (id, data) => this.client.put('position-assignments/update', { assignment_id: id, ...data }),
        delete: (id) => this.client.delete('position-assignments/delete', { assignment_id: id })
    };

    // ========================================================================
    // STRATEGIC PLANNING - PERIODS
    // ========================================================================

    periods = {
        list: () => this.client.get('periods/list', {}, { useCache: true }),
        get: (id) => this.client.get('periods/get', { period_id: id }),
        getActive: () => this.client.get('periods/active', {}),
        create: (data) => this.client.post('periods/create', data),
        update: (id, data) => this.client.put('periods/update', { period_id: id, ...data }),
        delete: (id) => this.client.delete('periods/delete', { period_id: id }),
        activate: (id) => this.client.put('periods/activate', { period_id: id }),
        rollover: (id, options = {}) => this.client.post('periods/rollover', { period_id: id, ...options })
    };

    // ========================================================================
    // STRATEGIC PLANNING - VISIONS
    // ========================================================================

    visions = {
        list: (filters = {}) => this.client.get('visions/list', filters, { useCache: true }),
        get: (id) => this.client.get('visions/get', { vision_id: id }),
        create: (data) => this.client.post('visions/create', data),
        update: (id, data) => this.client.put('visions/update', { vision_id: id, ...data }),
        delete: (id) => this.client.delete('visions/delete', { vision_id: id }),
        approve: (id) => this.client.put('visions/approve', { vision_id: id })
    };

    // ========================================================================
    // STRATEGIC PLANNING - MISSIONS
    // ========================================================================

    missions = {
        list: (filters = {}) => this.client.get('missions/list', filters, { useCache: true }),
        get: (id) => this.client.get('missions/get', { mission_id: id }),
        create: (data) => this.client.post('missions/create', data),
        update: (id, data) => this.client.put('missions/update', { mission_id: id, ...data }),
        delete: (id) => this.client.delete('missions/delete', { mission_id: id }),
        reorder: (id, newOrder) => this.client.put('missions/reorder', { mission_id: id, mission_order: newOrder })
    };

    // ========================================================================
    // STRATEGIC PLANNING - STRATEGIC INITIATIVES
    // ========================================================================

    initiatives = {
        list: (filters = {}) => this.client.get('initiatives/list', filters, { useCache: true }),
        get: (id) => this.client.get('initiatives/get', { initiative_id: id }),
        create: (data) => this.client.post('initiatives/create', data),
        update: (id, data) => this.client.put('initiatives/update', { initiative_id: id, ...data }),
        delete: (id) => this.client.delete('initiatives/delete', { initiative_id: id })
    };

    // ========================================================================
    // STRATEGIC PLANNING - ORGANIZATIONAL GOALS
    // ========================================================================

    goals = {
        list: (filters = {}) => this.client.get('goals/list', filters, { useCache: true }),
        get: (id) => this.client.get('goals/get', { goal_id: id }),
        create: (data) => this.client.post('goals/create', data),
        update: (id, data) => this.client.put('goals/update', { goal_id: id, ...data }),
        delete: (id) => this.client.delete('goals/delete', { goal_id: id })
    };

    // ========================================================================
    // STRATEGIC PLANNING - WORK UNIT GOALS
    // ========================================================================

    workUnitGoals = {
        list: (filters = {}) => this.client.get('work-unit-goals/list', filters, { useCache: true }),
        get: (id) => this.client.get('work-unit-goals/get', { work_unit_goal_id: id }),
        create: (data) => this.client.post('work-unit-goals/create', data),
        update: (id, data) => this.client.put('work-unit-goals/update', { work_unit_goal_id: id, ...data }),
        delete: (id) => this.client.delete('work-unit-goals/delete', { work_unit_goal_id: id })
    };

    // ========================================================================
    // IMPACT CENTERS
    // ========================================================================

    impactCenters = {
        list: (filters = {}) => this.client.get('impact-centers/list', filters, { useCache: true }),
        get: (id) => this.client.get('impact-centers/get', { ic_id: id }),
        create: (data) => this.client.post('impact-centers/create', data),
        update: (id, data) => this.client.put('impact-centers/update', { ic_id: id, ...data }),
        delete: (id) => this.client.delete('impact-centers/delete', { ic_id: id }),
        updateProgress: (id, progressData) => this.client.post('impact-centers/progress', { ic_id: id, ...progressData }),
        getProgress: (id, year) => this.client.get('impact-centers/progress', { ic_id: id, year }),
        assignWorkUnit: (id, workUnitId, data) => this.client.post('impact-centers/assign-work-unit', { ic_id: id, work_unit_id: workUnitId, ...data }),
        unassignWorkUnit: (id, workUnitId) => this.client.delete('impact-centers/unassign-work-unit', { ic_id: id, work_unit_id: workUnitId })
    };

    // ========================================================================
    // KPIS
    // ========================================================================

    kpis = {
        // Organizational KPIs
        list: (filters = {}) => this.client.get('kpis/list', filters, { useCache: true }),
        get: (id) => this.client.get('kpis/get', { kpi_id: id }),
        create: (data) => this.client.post('kpis/create', data),
        update: (id, data) => this.client.put('kpis/update', { kpi_id: id, ...data }),
        delete: (id) => this.client.delete('kpis/delete', { kpi_id: id }),
        updateProgress: (id, progressData) => this.client.post('kpis/progress', { kpi_id: id, ...progressData }),
        getProgress: (id, year) => this.client.get('kpis/progress', { kpi_id: id, year }),

        // Individual KPIs
        individual: {
            list: (filters = {}) => this.client.get('individual-kpis/list', filters, { useCache: true }),
            get: (id) => this.client.get('individual-kpis/get', { individual_kpi_id: id }),
            create: (data) => this.client.post('individual-kpis/create', data),
            update: (id, data) => this.client.put('individual-kpis/update', { individual_kpi_id: id, ...data }),
            delete: (id) => this.client.delete('individual-kpis/delete', { individual_kpi_id: id }),
            updateProgress: (id, progressData) => this.client.post('individual-kpis/progress', { individual_kpi_id: id, ...progressData }),
            getProgress: (id, year) => this.client.get('individual-kpis/progress', { individual_kpi_id: id, year })
        }
    };

    // ========================================================================
    // PROGRAMS
    // ========================================================================

    programs = {
        list: (filters = {}) => this.client.get('programs/list', filters, { useCache: true }),
        get: (id) => this.client.get('programs/get', { program_id: id }),
        create: (data) => this.client.post('programs/create', data),
        update: (id, data) => this.client.put('programs/update', { program_id: id, ...data }),
        delete: (id) => this.client.delete('programs/delete', { program_id: id }),

        // Activities
        activities: {
            list: (filters = {}) => this.client.get('activities/list', filters, { useCache: true }),
            get: (id) => this.client.get('activities/get', { activity_id: id }),
            create: (data) => this.client.post('activities/create', data),
            update: (id, data) => this.client.put('activities/update', { activity_id: id, ...data }),
            delete: (id) => this.client.delete('activities/delete', { activity_id: id })
        }
    };

    // ========================================================================
    // OKRS
    // ========================================================================

    okrs = {
        list: (filters = {}) => this.client.get('okrs/list', filters, { useCache: true }),
        get: (id) => this.client.get('okrs/get', { okr_id: id }),
        create: (data) => this.client.post('okrs/create', data),
        update: (id, data) => this.client.put('okrs/update', { okr_id: id, ...data }),
        delete: (id) => this.client.delete('okrs/delete', { okr_id: id }),
        submit: (id) => this.client.put('okrs/submit', { okr_id: id }),
        review: (id, reviewData) => this.client.put('okrs/review', { okr_id: id, ...reviewData }),
        getMyOKRs: () => this.client.get('okrs/my', {}),
        getTeamOKRs: () => this.client.get('okrs/team', {})
    };

    // ========================================================================
    // DASHBOARD
    // ========================================================================

    dashboard = {
        getExecutiveData: () => this.client.get('dashboard/executive', {}, { useCache: true, cacheTimeout: 300000 }),
        getKPIData: (filters = {}) => this.client.get('dashboard/kpi', filters, { useCache: true, cacheTimeout: 300000 }),
        getImpactCenterData: (filters = {}) => this.client.get('dashboard/impact-center', filters, { useCache: true, cacheTimeout: 300000 }),
        getBudgetData: (filters = {}) => this.client.get('dashboard/budget', filters, { useCache: true, cacheTimeout: 300000 }),
        getRecentActivities: (limit = 10) => this.client.get('dashboard/activities', { limit }, { useCache: true, cacheTimeout: 60000 })
    };

    // ========================================================================
    // REPORTS
    // ========================================================================

    reports = {
        generate: (reportConfig) => this.client.post('reports/generate', reportConfig),
        exportToCSV: (reportType, filters = {}) => this.client.post('reports/export/csv', { report_type: reportType, filters }),
        exportToExcel: (reportType, filters = {}) => this.client.post('reports/export/excel', { report_type: reportType, filters }),
        exportToPDF: (reportType, filters = {}) => this.client.post('reports/export/pdf', { report_type: reportType, filters }),
        exportToPowerPoint: (reportType, filters = {}) => this.client.post('reports/export/ppt', { report_type: reportType, filters })
    };

    // ========================================================================
    // NOTIFICATIONS
    // ========================================================================

    notifications = {
        list: (filters = {}) => this.client.get('notifications/list', filters),
        get: (id) => this.client.get('notifications/get', { notification_id: id }),
        markAsRead: (id) => this.client.put('notifications/read', { notification_id: id }),
        markAllAsRead: () => this.client.put('notifications/read-all', {}),
        delete: (id) => this.client.delete('notifications/delete', { notification_id: id }),
        getUnreadCount: () => this.client.get('notifications/unread-count', {})
    };

    // ========================================================================
    // SETTINGS
    // ========================================================================

    settings = {
        get: (key) => this.client.get('settings/get', { setting_key: key }),
        set: (key, value) => this.client.post('settings/set', { setting_key: key, setting_value: value }),
        getAll: () => this.client.get('settings/all', {}, { useCache: true })
    };

    // ========================================================================
    // IMPORT/EXPORT
    // ========================================================================

    import = {
        validate: (fileType, data) => this.client.post('import/validate', { file_type: fileType, data }),
        process: (fileType, data, options = {}) => this.client.post('import/process', { file_type: fileType, data, ...options })
    };

    // ========================================================================
    // SEARCH
    // ========================================================================

    search = {
        global: (query, filters = {}) => this.client.get('search/global', { query, ...filters }),
        inModule: (module, query, filters = {}) => this.client.get('search/module', { module, query, ...filters })
    };

    // ========================================================================
    // SYSTEM
    // ========================================================================

    system = {
        initialize: () => this.client.post('system/initialize', {}),
        getHealthCheck: () => this.client.get('system/health', {}),
        getLogs: (filters = {}) => this.client.get('system/logs', filters),
        clearCache: () => this.client.post('system/clear-cache', {})
    };
}

// ============================================================================
// CREATE GLOBAL API INSTANCE
// ============================================================================

const api = new API();

// Make available globally
if (typeof window !== 'undefined') {
    window.API = API;
    window.api = api;
}


// ============================================================================
// FROM: auth.js
// ============================================================================

/**
 * Authentication Module for Strategic Execution Monitoring Application
 * Handles user authentication, session management, and authorization
 */

// ============================================================================
// AUTHENTICATION MANAGER CLASS
// ============================================================================

class AuthManager {
    constructor() {
        this.user = null;
        this.isAuthenticated = false;
        this.sessionTimeout = 30 * 60 * 1000; // 30 minutes
        this.sessionTimer = null;
        this.refreshTokenTimer = null;
        this.STORAGE_KEY_USER = 'sem_user';
        this.STORAGE_KEY_SESSION = 'sem_session';
    }

    // ========================================================================
    // INITIALIZATION
    // ========================================================================

    /**
     * Initialize authentication
     */
    async init() {
        // Check for existing session
        const savedSession = this._getStoredSession();
        if (savedSession) {
            this.user = savedSession.user;
            this.isAuthenticated = true;
            this._startSessionTimer();
            return this.user;
        }

        // Try to get current user from backend
        try {
            const response = await api.auth.me();
            if (response.success && response.data) {
                this.user = response.data;
                this.isAuthenticated = true;
                this._saveSession(this.user);
                this._startSessionTimer();
                return this.user;
            }
        } catch (error) {
            console.error('Auth init error:', error);
        }

        return null;
    }

    // ========================================================================
    // LOGIN
    // ========================================================================

    /**
     * Login with username/email and password
     * @param {string} username - Username or email
     * @param {string} password - Password
     * @returns {Promise} Login response
     */
    async login(username, password) {
        try {
            const response = await api.auth.login(username, password);

            if (response.success) {
                this.user = response.data;
                this.isAuthenticated = true;
                this._saveSession(this.user);
                this._startSessionTimer();
                this._triggerEvent('login', this.user);
            }

            return response;

        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                message: 'Login failed. Please try again.',
                error: error
            };
        }
    }

    // ========================================================================
    // LOGOUT
    // ========================================================================

    /**
     * Logout current user
     */
    async logout() {
        try {
            await api.auth.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            this._clearSession();
            this._stopSessionTimer();
            this._triggerEvent('logout');
            // Redirect to login page
            window.location.reload();
        }
    }

    // ========================================================================
    // SESSION MANAGEMENT
    // ========================================================================

    /**
     * Start session timeout timer
     * @private
     */
    _startSessionTimer() {
        this._stopSessionTimer();

        // Reset session timer on user activity
        this._resetSessionTimer();

        // Listen for user activity
        const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
        events.forEach(event => {
            document.addEventListener(event, this._resetSessionTimer.bind(this));
        });
    }

    /**
     * Stop session timeout timer
     * @private
     */
    _stopSessionTimer() {
        if (this.sessionTimer) {
            clearTimeout(this.sessionTimer);
            this.sessionTimer = null;
        }
        if (this.refreshTokenTimer) {
            clearInterval(this.refreshTokenTimer);
            this.refreshTokenTimer = null;
        }
    }

    /**
     * Reset session timer
     * @private
     */
    _resetSessionTimer() {
        clearTimeout(this.sessionTimer);

        this.sessionTimer = setTimeout(() => {
            this._handleSessionTimeout();
        }, this.sessionTimeout);
    }

    /**
     * Handle session timeout
     * @private
     */
    _handleSessionTimeout() {
        console.warn('Session timed out');
        this.logout();
    }

    // ========================================================================
    // STORAGE
    // ========================================================================

    /**
     * Save session to storage
     * @private
     */
    _saveSession(user) {
        const session = {
            user,
            timestamp: Date.now()
        };
        sessionStorage.setItem(this.STORAGE_KEY_SESSION, JSON.stringify(session));
    }

    /**
     * Get stored session
     * @private
     */
    _getStoredSession() {
        try {
            const sessionStr = sessionStorage.getItem(this.STORAGE_KEY_SESSION);
            if (sessionStr) {
                const session = JSON.parse(sessionStr);
                // Check if session is still valid
                if (Date.now() - session.timestamp < this.sessionTimeout) {
                    return session;
                }
            }
        } catch (error) {
            console.error('Error getting stored session:', error);
        }
        return null;
    }

    /**
     * Clear session from storage
     * @private
     */
    _clearSession() {
        sessionStorage.removeItem(this.STORAGE_KEY_SESSION);
        sessionStorage.removeItem(this.STORAGE_KEY_USER);
        this.user = null;
        this.isAuthenticated = false;
    }

    // ========================================================================
    // PERMISSION CHECKING
    // ========================================================================

    /**
     * Check if user has permission
     * @param {string} module - Module name
     * @param {string} action - Action (create, read, update, delete)
     * @returns {boolean}
     */
    hasPermission(module, action) {
        if (!this.user || !this.user.permissions) {
            return false;
        }

        const permissions = this.user.permissions;
        return permissions[module] && permissions[module][action];
    }

    /**
     * Check if user has any of the specified permissions
     * @param {array} permissionList - List of {module, action} objects
     * @returns {boolean}
     */
    hasAnyPermission(permissionList) {
        return permissionList.some(p => this.hasPermission(p.module, p.action));
    }

    /**
     * Check if user has all of the specified permissions
     * @param {array} permissionList - List of {module, action} objects
     * @returns {boolean}
     */
    hasAllPermissions(permissionList) {
        return permissionList.every(p => this.hasPermission(p.module, p.action));
    }

    /**
     * Check if user is admin
     * @returns {boolean}
     */
    isAdmin() {
        if (!this.user) return false;
        return this.user.is_admin ||
               this.user.role_code === 'SUPER_ADMIN' ||
               this.user.role_code === 'ADMIN';
    }

    /**
     * Check if user can access resource
     * @param {string} resourceType - Type of resource
     * @param {string} resourceId - Resource ID
     * @returns {boolean}
     */
    canAccess(resourceType, resourceId) {
        // Admin can access everything
        if (this.isAdmin()) return true;

        // Check permissions based on resource type
        switch (resourceType) {
            case 'user':
                // Users can access their own data
                return this.user.user_id === resourceId;

            case 'position':
                // Check if user is assigned to position
                // This would need additional logic
                return true;

            default:
                return this.hasPermission(resourceType, 'read');
        }
    }

    // ========================================================================
    // PASSWORD MANAGEMENT
    // ========================================================================

    /**
     * Change password
     * @param {string} oldPassword - Current password
     * @param {string} newPassword - New password
     * @returns {Promise}
     */
    async changePassword(oldPassword, newPassword) {
        try {
            const response = await api.auth.changePassword(oldPassword, newPassword);

            if (response.success) {
                this._triggerEvent('passwordChanged');
            }

            return response;

        } catch (error) {
            return {
                success: false,
                message: 'Failed to change password',
                error: error
            };
        }
    }

    /**
     * Request password reset
     * @param {string} email - Email address
     * @returns {Promise}
     */
    async resetPassword(email) {
        try {
            return await api.auth.resetPassword(email);
        } catch (error) {
            return {
                success: false,
                message: 'Failed to request password reset',
                error: error
            };
        }
    }

    // ========================================================================
    // USER PROFILE
    // ========================================================================

    /**
     * Update user profile
     * @param {object} profileData - Profile data to update
     * @returns {Promise}
     */
    async updateProfile(profileData) {
        try {
            const response = await api.users.update(this.user.user_id, profileData);

            if (response.success && response.data) {
                this.user = { ...this.user, ...response.data };
                this._saveSession(this.user);
                this._triggerEvent('profileUpdated', this.user);
            }

            return response;

        } catch (error) {
            return {
                success: false,
                message: 'Failed to update profile',
                error: error
            };
        }
    }

    // ========================================================================
    // EVENT HANDLING
    // ========================================================================

    /**
     * Trigger authentication event
     * @private
     */
    _triggerEvent(eventName, data = null) {
        const event = new CustomEvent(`auth:${eventName}`, {
            detail: data
        });
        window.dispatchEvent(event);
    }

    /**
     * Add event listener
     * @param {string} eventName - Event name (login, logout, etc.)
     * @param {function} callback - Event callback
     */
    on(eventName, callback) {
        window.addEventListener(`auth:${eventName}`, callback);
    }

    /**
     * Remove event listener
     * @param {string} eventName - Event name
     * @param {function} callback - Event callback
     */
    off(eventName, callback) {
        window.removeEventListener(`auth:${eventName}`, callback);
    }
}

// ============================================================================
// CREATE GLOBAL AUTH INSTANCE
// ============================================================================

const auth = new AuthManager();

// Make available globally
if (typeof window !== 'undefined') {
    window.AuthManager = AuthManager;
    window.auth = auth;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Require authentication - redirects to login if not authenticated
 * @returns {object|null} User object if authenticated
 */
function requireAuth() {
    if (!auth.isAuthenticated || !auth.user) {
        // Show login modal or redirect
        showLoginModal();
        return null;
    }
    return auth.user;
}

/**
 * Require permission - shows error if user doesn't have permission
 * @param {string} module - Module name
 * @param {string} action - Action name
 * @returns {boolean} True if has permission
 */
function requirePermission(module, action) {
    if (!auth.hasPermission(module, action)) {
        showToast('You do not have permission to perform this action', 'Access Denied');
        return false;
    }
    return true;
}

/**
 * Require admin - shows error if user is not admin
 * @returns {boolean} True if is admin
 */
function requireAdmin() {
    if (!auth.isAdmin()) {
        showToast('This action requires administrator privileges', 'Access Denied');
        return false;
    }
    return true;
}

/**
 * Show login modal
 */
function showLoginModal() {
    // Create and show login modal
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'loginModal';
    modal.setAttribute('tabindex', '-1');
    modal.innerHTML = `
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Login Required</h5>
                </div>
                <div class="modal-body">
                    <form id="loginForm">
                        <div class="mb-3">
                            <label class="form-label">Username or Email</label>
                            <input type="text" class="form-control" name="username" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Password</label>
                            <input type="password" class="form-control" name="password" required>
                        </div>
                        <button type="submit" class="btn btn-primary w-100">Login</button>
                    </form>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    const modalInstance = new bootstrap.Modal(modal);
    modalInstance.show();

    // Handle form submission
    modal.querySelector('#loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const username = formData.get('username');
        const password = formData.get('password');

        const response = await auth.login(username, password);
        if (response.success) {
            modalInstance.hide();
            modal.remove();
            window.location.reload();
        } else {
            showToast(response.message || 'Login failed', 'Error');
        }
    });
}

/**
 * Update auth UI elements based on current user
 */
function updateAuthUI() {
    if (!auth.user) return;

    // Update user name
    const userNameEl = document.getElementById('userName');
    if (userNameEl) {
        userNameEl.textContent = auth.user.full_name || auth.user.username;
    }

    // Update user role
    const userRoleEl = document.getElementById('userRole');
    if (userRoleEl) {
        userRoleEl.textContent = auth.user.role_name || 'User';
    }

    // Show/hide admin-only elements
    if (auth.isAdmin()) {
        document.body.classList.add('is-admin');
    } else {
        document.body.classList.remove('is-admin');
    }

    // Update permission-based visibility
    document.querySelectorAll('[data-permission]').forEach(el => {
        const permission = el.dataset.permission;
        const [module, action] = permission.split(':');
        if (!auth.hasPermission(module, action)) {
            el.style.display = 'none';
        }
    });
}


// ============================================================================// FROM: components.js
// ============================================================================

/**
 * Reusable UI Components for Strategic Execution Monitoring Application
 * Provides modals, tables, forms, cards, charts, and other UI components
 */

// ============================================================================
// MODAL COMPONENT
// ============================================================================

class Modal {
    constructor(options = {}) {
        this.id = options.id || `modal-${Date.now()}`;
        this.title = options.title || 'Modal';
        this.size = options.size || 'medium'; // small, medium, large, extra-large
        this.centered = options.centered !== false;
        this.backdrop = options.backdrop !== false;
        this.keyboard = options.keyboard !== false;
        this.content = options.content || '';
        this.footer = options.footer || '';
        this.onShow = options.onShow || null;
        this.onHide = options.onHide || null;
        this.element = null;
        this.bsInstance = null;
    }

    /**
     * Create modal element
     */
    create() {
        const sizeClasses = {
            'small': 'modal-sm',
            'medium': '',
            'large': 'modal-lg',
            'extra-large': 'modal-xl'
        };

        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.id = this.id;
        modal.setAttribute('tabindex', '-1');
        modal.setAttribute('aria-labelledby', `${this.id}-label`);
        modal.setAttribute('aria-hidden', 'true');

        modal.innerHTML = `
            <div class="modal-dialog ${sizeClasses[this.size]} ${this.centered ? 'modal-dialog-centered' : ''}">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="${this.id}-label">${this.title}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        ${this.content}
                    </div>
                    ${this.footer ? `<div class="modal-footer">${this.footer}</div>` : ''}
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.element = modal;
        this.bsInstance = new bootstrap.Modal(modal, {
            backdrop: this.backdrop,
            keyboard: this.keyboard
        });

        // Event listeners
        modal.addEventListener('shown.bs.modal', () => {
            if (this.onShow) this.onShow();
        });

        modal.addEventListener('hidden.bs.modal', () => {
            if (this.onHide) this.onHide();
        });

        return this;
    }

    /**
     * Show modal
     */
    show() {
        if (!this.element) this.create();
        this.bsInstance.show();
        return this;
    }

    /**
     * Hide modal
     */
    hide() {
        if (this.bsInstance) {
            this.bsInstance.hide();
        }
        return this;
    }

    /**
     * Update modal content
     */
    setContent(content) {
        this.content = content;
        if (this.element) {
            this.element.querySelector('.modal-body').innerHTML = content;
        }
        return this;
    }

    /**
     * Update modal title
     */
    setTitle(title) {
        this.title = title;
        if (this.element) {
            this.element.querySelector('.modal-title').textContent = title;
        }
        return this;
    }

    /**
     * Destroy modal
     */
    destroy() {
        if (this.bsInstance) {
            this.bsInstance.dispose();
        }
        if (this.element) {
            this.element.remove();
        }
        this.element = null;
        this.bsInstance = null;
        return this;
    }
}

// ============================================================================
// CONFIRMATION DIALOG
// ============================================================================

function confirmDialog(options = {}) {
    return new Promise((resolve) => {
        const modal = new Modal({
            title: options.title || 'Confirm',
            size: 'small',
            content: options.message || 'Are you sure?',
            footer: `
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${options.cancelText || 'Cancel'}</button>
                <button type="button" class="btn btn-${options.type || 'danger'}" id="confirm-btn">${options.confirmText || 'Confirm'}</button>
            `,
            onShow: () => {
                const confirmBtn = document.getElementById('confirm-btn');
                confirmBtn.focus();

                confirmBtn.addEventListener('click', () => {
                    modal.hide();
                    resolve(true);
                });
            },
            onHide: () => {
                resolve(false);
            }
        });

        modal.show();
    });
}

// ============================================================================
// ALERT DIALOG
// ============================================================================

function alertDialog(options = {}) {
    return new Promise((resolve) => {
        const type = options.type || 'info';
        const icons = {
            'success': 'check-circle-fill text-success',
            'error': 'x-circle-fill text-danger',
            'warning': 'exclamation-triangle-fill text-warning',
            'info': 'info-circle-fill text-info'
        };

        const modal = new Modal({
            title: options.title || 'Notice',
            size: 'small',
            content: `
                <div class="text-center">
                    <i class="bi bi-${icons[type]} fs-1 mb-3"></i>
                    <p class="mb-0">${options.message || ''}</p>
                </div>
            `,
            footer: `
                <button type="button" class="btn btn-primary" data-bs-dismiss="modal">OK</button>
            `,
            onHide: () => resolve()
        });

        modal.show();
    });
}

// ============================================================================
// LOADING OVERLAY
// ============================================================================

class LoadingOverlay {
    constructor(message = 'Loading...') {
        this.id = 'loading-overlay';
        this.message = message;
        this.element = null;
    }

    show(message = null) {
        if (message) this.message = message;

        let overlay = document.getElementById(this.id);
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = this.id;
            overlay.className = 'loading-overlay';
            overlay.innerHTML = `
                <div class="loading-overlay-content">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <div class="loading-overlay-message">${this.message}</div>
                </div>
            `;
            document.body.appendChild(overlay);
        } else {
            overlay.querySelector('.loading-overlay-message').textContent = this.message;
        }

        overlay.style.display = 'flex';
        setTimeout(() => overlay.classList.add('show'), 10);
    }

    hide() {
        const overlay = document.getElementById(this.id);
        if (overlay) {
            overlay.classList.remove('show');
            setTimeout(() => {
                overlay.style.display = 'none';
            }, 300);
        }
    }
}

// ============================================================================
// DATA TABLE COMPONENT
// ============================================================================

class DataTable {
    constructor(options = {}) {
        this.container = options.container;
        this.columns = options.columns || [];
        this.data = options.data || [];
        this.rowId = options.rowId || 'id';
        this.selectable = options.selectable || false;
        this.onRowClick = options.onRowClick || null;
        this.onRowDoubleClick = options.onRowDoubleClick || null;
        this.paginator = options.paginator !== false;
        this.pageSize = options.pageSize || 25;
        this.currentPage = 1;
        this.searchable = options.searchable !== false;
        this.sortable = options.sortable !== false;
        this.element = null;
        this.selectedRows = new Set();
    }

    /**
     * Render table
     */
    render() {
        const container = document.querySelector(this.container);
        if (!container) return;

        container.innerHTML = `
            <div class="data-table-wrapper">
                ${this.searchable ? this._renderSearch() : ''}
                <div class="table-responsive">
                    <table class="table table-hover table-striped">
                        <thead>${this._renderHeader()}</thead>
                        <tbody>${this._renderBody()}</tbody>
                    </table>
                </div>
                ${this.paginator ? this._renderPaginator() : ''}
            </div>
        `;

        this.element = container.querySelector('.data-table-wrapper');
        this._attachEventListeners();
    }

    _renderSearch() {
        return `
            <div class="data-table-search mb-3">
                <div class="input-group">
                    <span class="input-group-text"><i class="bi bi-search"></i></span>
                    <input type="text" class="form-control" placeholder="Search..." id="table-search">
                    ${this.selectedRows.size > 0 ? `
                        <button class="btn btn-outline-danger" id="clear-selection">
                            Clear Selection (${this.selectedRows.size})
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }

    _renderHeader() {
        return `
            <tr>
                ${this.selectable ? '<th><input type="checkbox" id="select-all"></th>' : ''}
                ${this.columns.map(col => `
                    <th ${this.sortable ? `class="sortable" data-column="${col.key}"` : ''}>
                        ${col.label}
                        ${this.sortable ? '<i class="bi bi-arrow-down-up sort-icon"></i>' : ''}
                    </th>
                `).join('')}
            </tr>
        `;
    }

    _renderBody() {
        if (this.data.length === 0) {
            const colspan = this.columns.length + (this.selectable ? 1 : 0);
            return `<tr><td colspan="${colspan}" class="text-center text-muted py-5">No data available</td></tr>`;
        }

        return this._getPaginatedData().map(row => `
            <tr data-row-id="${row[this.rowId]}" ${this.onRowClick ? 'class="clickable"' : ''}>
                ${this.selectable ? `<td><input type="checkbox" class="row-select" value="${row[this.rowId]}"></td>` : ''}
                ${this.columns.map(col => `
                    <td>${this._formatCellValue(row[col.key], col)}</td>
                `).join('')}
            </tr>
        `).join('');
    }

    _formatCellValue(value, column) {
        if (column.render) {
            return column.render(value);
        }

        if (column.type === 'date') {
            return DateUtils.formatDate(value, column.format || 'short');
        }

        if (column.type === 'currency') {
            return StringUtils.formatCurrency(value);
        }

        if (column.type === 'percentage') {
            return StringUtils.formatPercentage(value);
        }

        if (column.type === 'boolean') {
            return value ? '<i class="bi bi-check-circle-fill text-success"></i>' : '<i class="bi bi-x-circle-fill text-danger"></i>';
        }

        if (column.type === 'badge') {
            const badgeClass = column.badgeClass || 'secondary';
            return `<span class="badge bg-${badgeClass}">${value}</span>`;
        }

        return value !== null && value !== undefined ? value : '-';
    }

    _renderPaginator() {
        const totalPages = Math.ceil(this.data.length / this.pageSize);
        const start = (this.currentPage - 1) * this.pageSize + 1;
        const end = Math.min(this.currentPage * this.pageSize, this.data.length);

        return `
            <nav aria-label="Table pagination" class="mt-3">
                <div class="d-flex justify-content-between align-items-center">
                    <div class="text-muted small">
                        Showing ${start} to ${end} of ${this.data.length} entries
                    </div>
                    <ul class="pagination pagination-sm mb-0">
                        <li class="page-item ${this.currentPage === 1 ? 'disabled' : ''}">
                            <a class="page-link" href="#" data-page="${this.currentPage - 1}">Previous</a>
                        </li>
                        ${this._renderPageNumbers(totalPages)}
                        <li class="page-item ${this.currentPage === totalPages ? 'disabled' : ''}">
                            <a class="page-link" href="#" data-page="${this.currentPage + 1}">Next</a>
                        </li>
                    </ul>
                </div>
            </nav>
        `;
    }

    _renderPageNumbers(totalPages) {
        const pages = [];
        const maxPages = 5;
        let start = Math.max(1, this.currentPage - Math.floor(maxPages / 2));
        let end = Math.min(totalPages, start + maxPages - 1);

        if (end - start < maxPages - 1) {
            start = Math.max(1, end - maxPages + 1);
        }

        for (let i = start; i <= end; i++) {
            pages.push(`
                <li class="page-item ${i === this.currentPage ? 'active' : ''}">
                    <a class="page-link" href="#" data-page="${i}">${i}</a>
                </li>
            `);
        }

        return pages.join('');
    }

    _getPaginatedData() {
        if (!this.paginator) return this.data;

        const start = (this.currentPage - 1) * this.pageSize;
        const end = start + this.pageSize;
        return this.data.slice(start, end);
    }

    _attachEventListeners() {
        // Row selection
        if (this.selectable) {
            const selectAll = this.element.querySelector('#select-all');
            const rowCheckboxes = this.element.querySelectorAll('.row-select');

            selectAll?.addEventListener('change', (e) => {
                const checked = e.target.checked;
                rowCheckboxes.forEach(cb => {
                    cb.checked = checked;
                    if (checked) {
                        this.selectedRows.add(cb.value);
                    } else {
                        this.selectedRows.delete(cb.value);
                    }
                });
                this.render();
            });

            rowCheckboxes.forEach(cb => {
                cb.addEventListener('change', (e) => {
                    if (e.target.checked) {
                        this.selectedRows.add(e.target.value);
                    } else {
                        this.selectedRows.delete(e.target.value);
                    }
                    this.render();
                });
            });
        }

        // Row click
        if (this.onRowClick) {
            this.element.querySelectorAll('tbody tr').forEach(row => {
                row.addEventListener('click', (e) => {
                    if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'A') {
                        const rowId = row.dataset.rowId;
                        const rowData = this.data.find(d => d[this.rowId] === rowId);
                        this.onRowClick(rowData, rowId);
                    }
                });
            });
        }

        // Search
        if (this.searchable) {
            const searchInput = this.element.querySelector('#table-search');
            searchInput?.addEventListener('input', (e) => {
                const query = e.target.value.toLowerCase();
                this.filter(query);
            });
        }

        // Sort
        if (this.sortable) {
            this.element.querySelectorAll('th.sortable').forEach(th => {
                th.addEventListener('click', () => {
                    const column = th.dataset.column;
                    this.sort(column);
                });
            });
        }

        // Pagination
        if (this.paginator) {
            this.element.querySelectorAll('.page-link').forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const page = parseInt(e.target.dataset.page);
                    if (page > 0 && page <= Math.ceil(this.data.length / this.pageSize)) {
                        this.goToPage(page);
                    }
                });
            });
        }
    }

    /**
     * Set data
     */
    setData(data) {
        this.data = data;
        this.currentPage = 1;
        this.render();
    }

    /**
     * Filter data
     */
    filter(query) {
        if (!query) {
            this.render();
            return;
        }

        const filtered = this.data.filter(row => {
            return this.columns.some(col => {
                const value = row[col.key];
                return value && value.toString().toLowerCase().includes(query);
            });
        });

        const container = document.querySelector(this.container);
        container.innerHTML = '';
        const originalData = this.data;
        this.data = filtered;
        this.render();
        this.data = originalData;
    }

    /**
     * Sort data
     */
    sort(column) {
        this.data.sort((a, b) => {
            const aVal = a[column];
            const bVal = b[column];

            if (aVal < bVal) return -1;
            if (aVal > bVal) return 1;
            return 0;
        });

        this.render();
    }

    /**
     * Go to page
     */
    goToPage(page) {
        this.currentPage = page;
        this.render();
    }

    /**
     * Get selected rows
     */
    getSelectedRows() {
        return Array.from(this.selectedRows).map(id => {
            return this.data.find(d => d[this.rowId] === id);
        });
    }
}

// ============================================================================
// CARD COMPONENT
// ============================================================================

class Card {
    constructor(options = {}) {
        this.title = options.title || '';
        this.subtitle = options.subtitle || '';
        this.content = options.content || '';
        this.footer = options.footer || '';
        this.color = options.color || 'primary';
        this.icon = options.icon || null;
        this.value = options.value || null;
        this.trend = options.trend || null;
        this.element = null;
    }

    render() {
        return `
            <div class="card shadow-sm">
                ${this.title || this.icon ? `
                    <div class="card-header">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                ${this.title ? `<h6 class="mb-0">${this.title}</h6>` : ''}
                                ${this.subtitle ? `<small class="text-muted">${this.subtitle}</small>` : ''}
                            </div>
                            ${this.icon ? `<i class="bi bi-${this.icon} text-${this.color} fs-4"></i>` : ''}
                        </div>
                    </div>
                ` : ''}
                ${this.content ? `
                    <div class="card-body">
                        ${this.value ? `<h3 class="card-title">${this.value}</h3>` : ''}
                        ${this.trend ? `
                            <small class="${this.trend > 0 ? 'text-success' : 'text-danger'}">
                                <i class="bi bi-arrow-${this.trend > 0 ? 'up' : 'down'}"></i>
                                ${Math.abs(this.trend)}%
                            </small>
                        ` : ''}
                        ${this.content}
                    </div>
                ` : ''}
                ${this.footer ? `<div class="card-footer">${this.footer}</div>` : ''}
            </div>
        `;
    }
}

// ============================================================================
// STAT CARD COMPONENT
// ============================================================================

class StatCard extends Card {
    constructor(options = {}) {
        super(options);
        this.label = options.label || '';
        this.prefix = options.prefix || '';
        this.suffix = options.suffix || '';
    }

    render() {
        const valueStr = `${this.prefix}${this.value !== null ? this.value : '-'}${this.suffix}`;

        return `
            <div class="card stat-card stat-card-${this.color}">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <p class="stat-label mb-1">${this.label}</p>
                            <h3 class="stat-value mb-0">${valueStr}</h3>
                            ${this.trend !== null ? `
                                <small class="${this.trend > 0 ? 'text-success' : 'text-danger'}">
                                    <i class="bi bi-arrow-${this.trend > 0 ? 'up' : 'down'}"></i>
                                    ${Math.abs(this.trend)}% from last period
                                </small>
                            ` : ''}
                        </div>
                        ${this.icon ? `
                            <div class="stat-icon bg-${this.color} bg-opacity-10">
                                <i class="bi bi-${this.icon} text-${this.color} fs-2"></i>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }
}

// ============================================================================
// FORM COMPONENT
// ============================================================================

class Form {
    constructor(options = {}) {
        this.id = options.id || `form-${Date.now()}`;
        this.fields = options.fields || [];
        this.onSubmit = options.onSubmit || null;
        this.action = options.action || '#';
        this.method = options.method || 'POST';
        this.element = null;
    }

    render() {
        const form = document.createElement('form');
        form.id = this.id;
        form.action = this.action;
        form.method = this.method;
        form.noValidate = true;

        this.fields.forEach(field => {
            form.appendChild(this._renderField(field));
        });

        this.element = form;
        this._attachEventListeners();
        return form;
    }

    _renderField(field) {
        const wrapper = document.createElement('div');
        wrapper.className = `mb-3 ${field.class || ''}`;

        const label = document.createElement('label');
        label.className = 'form-label';
        label.textContent = field.label;
        if (field.required) label.innerHTML += ' <span class="text-danger">*</span>';
        wrapper.appendChild(label);

        let input;

        switch (field.type) {
            case 'select':
                input = this._renderSelect(field);
                break;
            case 'textarea':
                input = this._renderTextarea(field);
                break;
            case 'checkbox':
                input = this._renderCheckbox(field);
                break;
            case 'radio':
                input = this._renderRadio(field);
                break;
            case 'date':
                input = this._renderDate(field);
                break;
            case 'file':
                input = this._renderFile(field);
                break;
            default:
                input = this._renderInput(field);
        }

        if (field.hint) {
            const hint = document.createElement('small');
            hint.className = 'form-text text-muted';
            hint.textContent = field.hint;
            wrapper.appendChild(hint);
        }

        wrapper.appendChild(input);

        if (field.feedback) {
            const feedback = document.createElement('div');
            feedback.className = 'invalid-feedback';
            feedback.textContent = field.feedback;
            wrapper.appendChild(feedback);
        }

        return wrapper;
    }

    _renderInput(field) {
        const input = document.createElement('input');
        input.type = field.type || 'text';
        input.className = 'form-control';
        input.name = field.name;
        input.id = field.id || field.name;
        if (field.placeholder) input.placeholder = field.placeholder;
        if (field.required) input.required = true;
        if (field.value) input.value = field.value;
        if (field.min !== undefined) input.min = field.min;
        if (field.max !== undefined) input.max = field.max;
        if (field.step !== undefined) input.step = field.step;
        return input;
    }

    _renderSelect(field) {
        const select = document.createElement('select');
        select.className = 'form-control';
        select.name = field.name;
        select.id = field.id || field.name;
        if (field.required) select.required = true;

        if (field.placeholder) {
            const option = document.createElement('option');
            option.value = '';
            option.textContent = field.placeholder;
            option.selected = true;
            option.disabled = true;
            select.appendChild(option);
        }

        (field.options || []).forEach(opt => {
            const option = document.createElement('option');
            option.value = opt.value;
            option.textContent = opt.label;
            if (opt.selected) option.selected = true;
            select.appendChild(option);
        });

        return select;
    }

    _renderTextarea(field) {
        const textarea = document.createElement('textarea');
        textarea.className = 'form-control';
        textarea.name = field.name;
        textarea.id = field.id || field.name;
        if (field.placeholder) textarea.placeholder = field.placeholder;
        if (field.required) textarea.required = true;
        if (field.rows) textarea.rows = field.rows;
        if (field.value) textarea.value = field.value;
        return textarea;
    }

    _renderCheckbox(field) {
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.className = 'form-check-input';
        input.name = field.name;
        input.id = field.id || field.name;
        if (field.checked) input.checked = true;

        const wrapper = document.createElement('div');
        wrapper.className = 'form-check';
        wrapper.appendChild(input);

        if (field.label) {
            const label = document.createElement('label');
            label.className = 'form-check-label';
            label.htmlFor = input.id;
            label.textContent = field.label;
            wrapper.appendChild(label);
        }

        return wrapper;
    }

    _renderRadio(field) {
        const wrapper = document.createElement('div');
        wrapper.className = 'form-check';

        (field.options || []).forEach((opt, index) => {
            const input = document.createElement('input');
            input.type = 'radio';
            input.className = 'form-check-input';
            input.name = field.name;
            input.id = `${field.name}-${index}`;
            input.value = opt.value;
            if (opt.checked) input.checked = true;

            const label = document.createElement('label');
            label.className = 'form-check-label';
            label.htmlFor = input.id;
            label.textContent = opt.label;

            const itemWrapper = document.createElement('div');
            itemWrapper.className = 'form-check';
            itemWrapper.appendChild(input);
            itemWrapper.appendChild(label);

            wrapper.appendChild(itemWrapper);
        });

        return wrapper;
    }

    _renderDate(field) {
        const input = document.createElement('input');
        input.type = 'date';
        input.className = 'form-control';
        input.name = field.name;
        input.id = field.id || field.name;
        if (field.required) input.required = true;
        if (field.value) input.value = field.value;
        return input;
    }

    _renderFile(field) {
        const input = document.createElement('input');
        input.type = 'file';
        input.className = 'form-control';
        input.name = field.name;
        input.id = field.id || field.name;
        if (field.required) input.required = true;
        if (field.accept) input.accept = field.accept;
        if (field.multiple) input.multiple = true;
        return input;
    }

    _attachEventListeners() {
        if (this.onSubmit) {
            this.element.addEventListener('submit', (e) => {
                e.preventDefault();
                const formData = new FormData(this.element);
                const data = Object.fromEntries(formData.entries());
                this.onSubmit(data, this.element);
            });
        }
    }

    getValues() {
        const formData = new FormData(this.element);
        return Object.fromEntries(formData.entries());
    }

    setValues(values) {
        Object.keys(values).forEach(key => {
            const input = this.element.querySelector(`[name="${key}"]`);
            if (input) {
                if (input.type === 'checkbox') {
                    input.checked = values[key];
                } else {
                    input.value = values[key];
                }
            }
        });
    }

    reset() {
        this.element.reset();
    }

    validate() {
        return this.element.checkValidity();
    }
}

// ============================================================================
// PROGRESS BAR COMPONENT
// ============================================================================

class ProgressBar {
    constructor(options = {}) {
        this.value = options.value || 0;
        this.max = options.max || 100;
        this.label = options.label || '';
        this.showPercentage = options.showPercentage !== false;
        this.color = options.color || 'primary'; // primary, success, warning, danger, info
        this.striped = options.striped || false;
        this.animated = options.animated || false;
        this.height = options.height || null;
    }

    setValue(value) {
        this.value = Math.max(0, Math.min(this.max, value));
        if (this.element) {
            const bar = this.element.querySelector('.progress-bar');
            const percentage = (this.value / this.max) * 100;
            bar.style.width = `${percentage}%`;
            bar.setAttribute('aria-valuenow', this.value);

            if (this.showPercentage) {
                const label = this.element.querySelector('.progress-label');
                if (label) {
                    label.textContent = `${Math.round(percentage)}%`;
                }
            }
        }
    }

    render() {
        const percentage = Math.round((this.value / this.max) * 100);
        const heightStyle = this.height ? `height: ${this.height}px;` : '';

        return `
            <div class="progress-wrapper">
                ${this.label ? `<div class="d-flex justify-content-between mb-1"><span>${this.label}</span>${this.showPercentage ? `<span class="progress-label">${percentage}%</span>` : ''}</div>` : ''}
                <div class="progress" style="${heightStyle}">
                    <div class="progress-bar bg-${this.color} ${this.striped ? 'progress-bar-striped' : ''} ${this.animated ? 'progress-bar-animated' : ''}"
                         role="progressbar"
                         style="width: ${percentage}%"
                         aria-valuenow="${this.value}"
                         aria-valuemin="0"
                         aria-valuemax="${this.max}">
                    </div>
                </div>
            </div>
        `;
    }
}

// ============================================================================
// TOAST NOTIFICATION COMPONENT
// ============================================================================

class Toast {
    constructor(options = {}) {
        this.message = options.message || '';
        this.title = options.title || '';
        this.type = options.type || 'info'; // success, error, warning, info
        this.duration = options.duration || 5000;
        this.position = options.position || 'top-right'; // top-right, top-left, bottom-right, bottom-left, top-center
        this.closeButton = options.closeButton !== false;
    }

    show() {
        const container = this._getContainer();

        const toast = document.createElement('div');
        toast.className = `toast toast-${this.type} show`;
        toast.innerHTML = `
            <div class="toast-header">
                <i class="bi bi-${this._getIcon()} me-2"></i>
                <strong class="me-auto">${this.title}</strong>
                ${this.closeButton ? '<button type="button" class="btn-close" data-bs-dismiss="toast"></button>' : ''}
            </div>
            ${this.message ? `<div class="toast-body">${this.message}</div>` : ''}
        `;

        container.appendChild(toast);

        // Auto dismiss
        if (this.duration > 0) {
            setTimeout(() => {
                this.hide(toast);
            }, this.duration);
        }

        // Close button handler
        if (this.closeButton) {
            const closeBtn = toast.querySelector('.btn-close');
            closeBtn?.addEventListener('click', () => {
                this.hide(toast);
            });
        }

        return toast;
    }

    hide(toast) {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }

    _getContainer() {
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = `toast-container position-fixed ${this._getPositionClass()}`;
            document.body.appendChild(container);
        }
        return container;
    }

    _getPositionClass() {
        const positions = {
            'top-right': 'top-0 end-0',
            'top-left': 'top-0 start-0',
            'bottom-right': 'bottom-0 end-0',
            'bottom-left': 'bottom-0 start-0',
            'top-center': 'top-0 start-50 translate-middle-x'
        };
        return positions[this.position] || positions['top-right'];
    }

    _getIcon() {
        const icons = {
            'success': 'check-circle-fill text-success',
            'error': 'x-circle-fill text-danger',
            'warning': 'exclamation-triangle-fill text-warning',
            'info': 'info-circle-fill text-info'
        };
        return icons[this.type] || icons['info'];
    }
}

// ============================================================================
// QUICK TOAST HELPERS
// ============================================================================

function showToast(message, title = 'Notification', type = 'info') {
    const toast = new Toast({ message, title, type });
    return toast.show();
}

function showSuccessToast(message) {
    return showToast(message, 'Success', 'success');
}

function showErrorToast(message) {
    return showToast(message, 'Error', 'error');
}

function showWarningToast(message) {
    return showToast(message, 'Warning', 'warning');
}

// ============================================================================
// GLOBAL WRAPPER FUNCTIONS (for backward compatibility)
// ============================================================================

/**
 * Show loading overlay - wrapper for LoadingOverlay class
 */
function showLoadingOverlay() {
    const existing = document.getElementById('loading-overlay');
    if (existing) {
        existing.classList.add('show');
        existing.style.display = 'flex';
        return;
    }

    const overlay = new LoadingOverlay('Loading...');
    overlay.show();
}

/**
 * Hide loading overlay
 */
function hideLoadingOverlay() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.classList.remove('show');
        setTimeout(() => {
            if (!overlay.classList.contains('show')) {
                overlay.style.display = 'none';
            }
        }, 300);
    }
}

/**
 * Show success message - wrapper for showSuccessToast
 */
function showSuccessMessage(message) {
    showSuccessToast(message);
}

/**
 * Show error message - wrapper for showErrorToast
 */
function showErrorMessage(message) {
    showErrorToast(message);
}

/**
 * Show info message - wrapper for showInfoToast
 */
function showInfoMessage(message) {
    if (typeof showInfoToast === 'function') {
        showInfoToast(message);
    } else {
        console.info(message);
    }
}

// ============================================================================
// EXPORT ALL COMPONENTS
// ============================================================================

if (typeof window !== 'undefined') {
    window.Modal = Modal;
    window.confirmDialog = confirmDialog;
    window.alertDialog = alertDialog;
    window.LoadingOverlay = LoadingOverlay;
    window.DataTable = DataTable;
    window.Card = Card;
    window.StatCard = StatCard;
    window.Form = Form;
    window.ProgressBar = ProgressBar;
    window.Toast = Toast;
    window.showToast = showToast;
    window.showSuccessToast = showSuccessToast;
    window.showErrorToast = showErrorToast;
    window.showWarningToast = showWarningToast;
    // Global wrapper functions
    window.showLoadingOverlay = showLoadingOverlay;
    window.hideLoadingOverlay = hideLoadingOverlay;
    window.showSuccessMessage = showSuccessMessage;
    window.showErrorMessage = showErrorMessage;
    window.showInfoMessage = showInfoMessage;
}


// ============================================================================// FROM: charts.js
// ============================================================================

/**
 * Chart Components for Strategic Execution Monitoring Application
 * Provides reusable Chart.js components for data visualization
 */

// ============================================================================
// CHART BASE CLASS
// ============================================================================

class ChartComponent {
    constructor(options = {}) {
        this.canvasId = options.canvasId || `chart-${Date.now()}`;
        this.type = options.type || 'bar';
        this.data = options.data || {};
        this.options = options.options || {};
        this.plugins = options.plugins || [];
        this.chart = null;
        this.responsive = options.responsive !== false;
        this.maintainAspectRatio = options.maintainAspectRatio !== false;
        this.aspectRatio = options.aspectRatio || 2;
    }

    /**
     * Get default chart options
     */
    getDefaultOptions() {
        return {
            responsive: this.responsive,
            maintainAspectRatio: this.maintainAspectRatio,
            aspectRatio: this.aspectRatio,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        usePointStyle: true
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: { size: 14 },
                    bodyFont: { size: 13 },
                    cornerRadius: 4,
                    displayColors: true
                }
            },
            animation: {
                duration: 750,
                easing: 'easeInOutQuart'
            }
        };
    }

    /**
     * Create chart
     */
    create() {
        const canvas = document.getElementById(this.canvasId);
        if (!canvas) {
            console.error(`Canvas element not found: ${this.canvasId}`);
            return null;
        }

        const ctx = canvas.getContext('2d');
        const mergedOptions = this._mergeOptions();

        this.chart = new Chart(ctx, {
            type: this.type,
            data: this.data,
            options: mergedOptions
        });

        return this.chart;
    }

    /**
     * Merge options
     * @private
     */
    _mergeOptions() {
        const defaults = this.getDefaultOptions();
        return this._deepMerge(defaults, this.options);
    }

    /**
     * Deep merge objects
     * @private
     */
    _deepMerge(target, source) {
        const result = { ...target };

        for (const key in source) {
            if (source.hasOwnProperty(key)) {
                if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
                    result[key] = this._deepMerge(target[key] || {}, source[key]);
                } else {
                    result[key] = source[key];
                }
            }
        }

        return result;
    }

    /**
     * Update chart data
     */
    update(data) {
        if (!this.chart) return;

        this.chart.data = data;
        this.chart.update();
    }

    /**
     * Destroy chart
     */
    destroy() {
        if (this.chart) {
            this.chart.destroy();
            this.chart = null;
        }
    }
}

// ============================================================================
// TRAFFIC LIGHT CHART (KPI Status)
// ============================================================================

class TrafficLightChart extends ChartComponent {
    constructor(options = {}) {
        super({
            ...options,
            type: 'doughnut'
        });
    }

    getDefaultOptions() {
        return {
            ...super.getDefaultOptions(),
            cutout: '70%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        font: { size: 14 }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: (context) => {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        };
    }

    /**
     * Create traffic light chart data
     */
    static createData(red, yellow, green) {
        return {
            labels: ['Red (<70%)', 'Yellow (70-90%)', 'Green (>90%)'],
            datasets: [{
                data: [red, yellow, green],
                backgroundColor: [
                    'rgba(220, 53, 69, 0.8)',
                    'rgba(255, 193, 7, 0.8)',
                    'rgba(25, 135, 84, 0.8)'
                ],
                borderColor: [
                    'rgba(220, 53, 69, 1)',
                    'rgba(255, 193, 7, 1)',
                    'rgba(25, 135, 84, 1)'
                ],
                borderWidth: 2
            }]
        };
    }
}

// ============================================================================
// PROGRESS CHART (Goal Completion)
// ============================================================================

class ProgressChart extends ChartComponent {
    constructor(options = {}) {
        super({
            ...options,
            type: 'bar'
        });
    }

    getDefaultOptions() {
        return {
            ...super.getDefaultOptions(),
            indexAxis: 'y',
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: (value) => value + '%'
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                y: {
                    grid: {
                        display: false
                    }
                }
            }
        };
    }

    /**
     * Create progress chart data
     */
    static createData(labels, values, targetValue = 100) {
        return {
            labels: labels,
            datasets: [{
                label: 'Completion %',
                data: values,
                backgroundColor: values.map(v => {
                    if (v >= 90) return 'rgba(25, 135, 84, 0.8)';
                    if (v >= 70) return 'rgba(255, 193, 7, 0.8)';
                    return 'rgba(220, 53, 69, 0.8)';
                }),
                borderColor: values.map(v => {
                    if (v >= 90) return 'rgba(25, 135, 84, 1)';
                    if (v >= 70) return 'rgba(255, 193, 7, 1)';
                    return 'rgba(220, 53, 69, 1)';
                }),
                borderWidth: 2,
                borderRadius: 4
            }]
        };
    }
}

// ============================================================================
// TREND CHART (Line chart for trends over time)
// ============================================================================

class TrendChart extends ChartComponent {
    constructor(options = {}) {
        super({
            ...options,
            type: 'line'
        });
    }

    getDefaultOptions() {
        return {
            ...super.getDefaultOptions(),
            interaction: {
                mode: 'index',
                intersect: false
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            },
            elements: {
                line: {
                    tension: 0.4
                },
                point: {
                    radius: 4,
                    hoverRadius: 6
                }
            }
        };
    }

    /**
     * Create trend chart data
     */
    static createData(labels, datasets) {
        const colors = [
            'rgba(13, 110, 253, 1)',
            'rgba(25, 135, 84, 1)',
            'rgba(255, 193, 7, 1)',
            'rgba(220, 53, 69, 1)',
            'rgba(13, 202, 240, 1)'
        ];

        return {
            labels: labels,
            datasets: datasets.map((ds, index) => ({
                ...ds,
                borderColor: colors[index % colors.length],
                backgroundColor: colors[index % colors.length].replace('1)', '0.1)'),
                borderWidth: 2,
                fill: true
            }))
        };
    }
}

// ============================================================================
// GROUPED BAR CHART (for comparison)
// ============================================================================

class GroupedBarChart extends ChartComponent {
    constructor(options = {}) {
        super({
            ...options,
            type: 'bar'
        });
    }

    getDefaultOptions() {
        return {
            ...super.getDefaultOptions(),
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        };
    }

    /**
     * Create grouped bar chart data
     */
    static createData(labels, datasets) {
        const colors = [
            'rgba(13, 110, 253, 0.8)',
            'rgba(25, 135, 84, 0.8)',
            'rgba(255, 193, 7, 0.8)',
            'rgba(220, 53, 69, 0.8)',
            'rgba(13, 202, 240, 0.8)'
        ];

        return {
            labels: labels,
            datasets: datasets.map((ds, index) => ({
                ...ds,
                backgroundColor: colors[index % colors.length],
                borderColor: colors[index % colors.length].replace('0.8', '1'),
                borderWidth: 2,
                borderRadius: 4
            }))
        };
    }
}

// ============================================================================
// STACKED BAR CHART
// ============================================================================

class StackedBarChart extends GroupedBarChart {
    getDefaultOptions() {
        const options = super.getDefaultOptions();
        options.scales.x.stacked = true;
        options.scales.y.stacked = true;
        return options;
    }
}

// ============================================================================
// PIE CHART
// ============================================================================

class PieChart extends ChartComponent {
    constructor(options = {}) {
        super({
            ...options,
            type: 'pie'
        });
    }

    getDefaultOptions() {
        return {
            ...super.getDefaultOptions(),
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        padding: 15,
                        usePointStyle: true
                    }
                }
            }
        };
    }

    /**
     * Create pie chart data
     */
    static createData(labels, values, colors = null) {
        const defaultColors = [
            'rgba(13, 110, 253, 0.8)',
            'rgba(25, 135, 84, 0.8)',
            'rgba(255, 193, 7, 0.8)',
            'rgba(220, 53, 69, 0.8)',
            'rgba(13, 202, 240, 0.8)',
            'rgba(111, 66, 193, 0.8)'
        ];

        return {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: colors || defaultColors.slice(0, labels.length),
                borderColor: (colors || defaultColors).map(c => c.replace('0.8', '1')).slice(0, labels.length),
                borderWidth: 2
            }]
        };
    }
}

// ============================================================================
// DONUT CHART
// ============================================================================

class DonutChart extends PieChart {
    constructor(options = {}) {
        super({
            ...options,
            type: 'doughnut'
        });
    }

    getDefaultOptions() {
        const options = super.getDefaultOptions();
        options.cutout = '60%';
        return options;
    }
}

// ============================================================================
// RADAR CHART (for multi-dimensional comparison)
// ============================================================================

class RadarChart extends ChartComponent {
    constructor(options = {}) {
        super({
            ...options,
            type: 'radar'
        });
    }

    getDefaultOptions() {
        return {
            ...super.getDefaultOptions(),
            scales: {
                r: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    angleLines: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    pointLabels: {
                        font: {
                            size: 12
                        }
                    }
                }
            }
        };
    }

    /**
     * Create radar chart data
     */
    static createData(labels, datasets) {
        const colors = [
            'rgba(13, 110, 253, 0.5)',
            'rgba(25, 135, 84, 0.5)',
            'rgba(255, 193, 7, 0.5)'
        ];

        return {
            labels: labels,
            datasets: datasets.map((ds, index) => ({
                ...ds,
                backgroundColor: colors[index % colors.length],
                borderColor: colors[index % colors.length].replace('0.5', '1'),
                borderWidth: 2,
                pointBackgroundColor: colors[index % colors.length].replace('0.5', '1')
            }))
        };
    }
}

// ============================================================================
// GAUGE CHART (for single metric visualization)
// ============================================================================

class GaugeChart extends ChartComponent {
    constructor(options = {}) {
        super({
            ...options,
            type: 'doughnut'
        });
    }

    getDefaultOptions() {
        return {
            ...super.getDefaultOptions(),
            rotation: -90,
            circumference: 180,
            cutout: '75%',
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    enabled: false
                }
            }
        };
    }

    /**
     * Create gauge chart data
     */
    static createData(value, maxValue = 100) {
        const remaining = maxValue - value;

        // Determine color based on value
        let color = 'rgba(220, 53, 69, 0.8)'; // Red
        if (value >= 70) color = 'rgba(255, 193, 7, 0.8)'; // Yellow
        if (value >= 90) color = 'rgba(25, 135, 84, 0.8)'; // Green

        return {
            labels: ['Value', 'Remaining'],
            datasets: [{
                data: [value, remaining],
                backgroundColor: [color, 'rgba(0, 0, 0, 0.1)'],
                borderColor: [color.replace('0.8', '1'), 'rgba(0, 0, 0, 0.2)'],
                borderWidth: 2,
                circumference: 180,
                rotation: -90
            }]
        };
    }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Create chart container HTML
 */
function createChartContainer(id, title, size = 'normal') {
    const heights = {
        'small': '200px',
        'normal': '300px',
        'large': '400px'
    };

    return `
        <div class="chart-container mb-4">
            <h6 class="chart-title">${title}</h6>
            <div class="chart-wrapper" style="height: ${heights[size] || heights.normal}">
                <canvas id="${id}"></canvas>
            </div>
        </div>
    `;
}

/**
 * Initialize chart from data
 */
function initChart(type, canvasId, data, options = {}) {
    const chartClasses = {
        'bar': GroupedBarChart,
        'line': TrendChart,
        'pie': PieChart,
        'doughnut': DonutChart,
        'radar': RadarChart,
        'trafficLight': TrafficLightChart,
        'progress': ProgressChart,
        'gauge': GaugeChart
    };

    const ChartClass = chartClasses[type] || ChartComponent;
    const chart = new ChartClass({
        canvasId,
        data,
        options
    });

    return chart.create();
}

/**
 * Destroy chart by canvas ID
 */
function destroyChart(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (canvas) {
        const chart = Chart.getChart(canvasId);
        if (chart) {
            chart.destroy();
        }
    }
}

/**
 * Destroy all charts
 */
function destroyAllCharts() {
    Chart.helpers.each(Chart.instances, (chart) => {
        chart.destroy();
    });
}

/**
 * Export chart as image
 */
function exportChartAsImage(canvasId, filename = 'chart.png') {
    const canvas = document.getElementById(canvasId);
    if (canvas) {
        const link = document.createElement('a');
        link.download = filename;
        link.href = canvas.toDataURL('image/png');
        link.click();
    }
}

// ============================================================================
// EXPORT ALL CHART CLASSES
// ============================================================================

if (typeof window !== 'undefined') {
    window.ChartComponent = ChartComponent;
    window.TrafficLightChart = TrafficLightChart;
    window.ProgressChart = ProgressChart;
    window.TrendChart = TrendChart;
    window.GroupedBarChart = GroupedBarChart;
    window.StackedBarChart = StackedBarChart;
    window.PieChart = PieChart;
    window.DonutChart = DonutChart;
    window.RadarChart = RadarChart;
    window.GaugeChart = GaugeChart;
    window.createChartContainer = createChartContainer;
    window.initChart = initChart;
    window.destroyChart = destroyChart;
    window.destroyAllCharts = destroyAllCharts;
    window.exportChartAsImage = exportChartAsImage;
}


// ============================================================================// FROM: org-diagram.js
// ============================================================================

/**
 * Organization Diagram Component
 * Interactive hierarchical visualization using D3.js
 */

// ============================================================================
// ORGANIZATION DIAGRAM CLASS
// ============================================================================

class OrganizationDiagram {
    constructor(options = {}) {
        this.containerId = options.containerId || 'org-diagram';
        this.data = options.data || null;
        this.width = options.width || 1200;
        this.height = options.height || 800;
        this.nodeWidth = options.nodeWidth || 180;
        this.nodeHeight = options.nodeHeight || 80;
        this.duration = options.duration || 500;
        this.zoomEnabled = options.zoomEnabled !== false;
        this.panEnabled = options.panEnabled !== false;
        this.collapsible = options.collapsible !== false;
        this.onNodeClick = options.onNodeClick || null;
        this.onNodeDoubleClick = options.onNodeDoubleClick || null;
        this.onNodeRightClick = options.onNodeRightClick || null;

        this.svg = null;
        this.g = null;
        this.zoom = null;
        this.root = null;
        this.nodes = [];
        this.links = [];
    }

    /**
     * Initialize diagram
     */
    async init() {
        const container = document.getElementById(this.containerId);
        if (!container) {
            console.error(`Container not found: ${this.containerId}`);
            return;
        }

        // Clear container
        container.innerHTML = '';

        // Create controls
        this._createControls(container);

        // Create SVG element
        const svg = d3.select(`#${this.containerId}`)
            .append('svg')
            .attr('width', '100%')
            .attr('height', '100%')
            .attr('viewBox', `0 0 ${this.width} ${this.height}`)
            .attr('preserveAspectRatio', 'xMidYMid meet');

        this.svg = svg;

        // Create main group for zoom/pan
        this.g = svg.append('g')
            .attr('class', 'org-diagram-content');

        // Setup zoom behavior
        if (this.zoomEnabled || this.panEnabled) {
            this.zoom = d3.zoom()
                .scaleExtent([0.1, 4])
                .on('zoom', (event) => {
                    this.g.attr('transform', event.transform);
                });

            svg.call(this.zoom);
        }

        // Load and render data
        if (!this.data) {
            this.data = await this._loadOrganizationData();
        }

        this._render();
    }

    /**
     * Create control buttons
     * @private
     */
    _createControls(container) {
        const controls = document.createElement('div');
        controls.className = 'org-diagram-controls';
        controls.innerHTML = `
            <button class="org-diagram-btn" id="zoom-in" title="Zoom In">
                <i class="bi bi-zoom-in"></i>
            </button>
            <button class="org-diagram-btn" id="zoom-out" title="Zoom Out">
                <i class="bi bi-zoom-out"></i>
            </button>
            <button class="org-diagram-btn" id="zoom-reset" title="Reset Zoom">
                <i class="bi bi-arrows-fullscreen"></i>
            </button>
            <button class="org-diagram-btn" id="expand-all" title="Expand All">
                <i class="bi bi-chevron-down"></i>
            </button>
            <button class="org-diagram-btn" id="collapse-all" title="Collapse All">
                <i class="bi bi-chevron-up"></i>
            </button>
            <button class="org-diagram-btn" id="export-org" title="Export as PNG">
                <i class="bi bi-download"></i>
            </button>
        `;

        container.appendChild(controls);

        // Add event listeners
        if (this.svg) {
            document.getElementById('zoom-in').addEventListener('click', () => this._zoomIn());
            document.getElementById('zoom-out').addEventListener('click', () => this._zoomOut());
            document.getElementById('zoom-reset').addEventListener('click', () => this._resetZoom());
            document.getElementById('expand-all').addEventListener('click', () => this._expandAll());
            document.getElementById('collapse-all').addEventListener('click', () => this._collapseAll());
            document.getElementById('export-org').addEventListener('click', () => this._exportAsPNG());
        }
    }

    /**
     * Load organization data from API
     * @private
     */
    async _loadOrganizationData() {
        try {
            // Fetch directorates, work units, affairs, positions
            const [directorates, workUnits, affairs, positions] = await Promise.all([
                api.directorates.list(),
                api.workUnits.list(),
                api.affairs.list(),
                api.positions.list()
            ]);

            // Build hierarchical tree
            return this._buildTree(directorates, workUnits, affairs, positions);
        } catch (error) {
            console.error('Error loading organization data:', error);
            return { name: 'Organization', children: [] };
        }
    }

    /**
     * Build hierarchical tree structure
     * @private
     */
    _buildTree(directorates, workUnits, affairs, positions) {
        // Create a map for quick lookup
        const directorateMap = {};
        const workUnitMap = {};
        const affairMap = {};

        // Initialize directorates
        directorates.data.forEach(d => {
            directorateMap[d.directorate_id] = {
                id: d.directorate_id,
                name: d.directorate_name,
                type: 'directorate',
                code: d.directorate_code,
                children: [],
                data: d
            };
        });

        // Add work units to directorates
        workUnits.data.forEach(w => {
            const workUnit = {
                id: w.work_unit_id,
                name: w.work_unit_name,
                type: 'workunit',
                code: w.work_unit_code,
                children: [],
                data: w
            };
            workUnitMap[w.work_unit_id] = workUnit;

            if (directorateMap[w.directorate_id]) {
                directorateMap[w.directorate_id].children.push(workUnit);
            }
        });

        // Add affairs to work units
        affairs.data.forEach(a => {
            const affair = {
                id: a.affair_id,
                name: a.affair_name,
                type: 'affair',
                code: a.affair_code,
                children: [],
                data: a
            };
            affairMap[a.affair_id] = affair;

            if (workUnitMap[a.work_unit_id]) {
                workUnitMap[a.work_unit_id].children.push(affair);
            }
        });

        // Add positions to affairs
        positions.data.forEach(p => {
            const position = {
                id: p.position_id,
                name: p.position_name,
                type: 'position',
                code: p.position_code,
                level: p.position_level,
                children: [],
                data: p
            };

            // Add to appropriate parent
            if (p.affair_id && affairMap[p.affair_id]) {
                affairMap[p.affair_id].children.push(position);
            } else if (p.work_unit_id && workUnitMap[p.work_unit_id]) {
                workUnitMap[p.work_unit_id].children.push(position);
            } else if (p.directorate_id && directorateMap[p.directorate_id]) {
                directorateMap[p.directorate_id].children.push(position);
            }
        });

        // Return root node with directorates as children
        return {
            id: 'root',
            name: 'Organization',
            type: 'root',
            children: Object.values(directorateMap)
        };
    }

    /**
     * Render diagram
     * @private
     */
    _render() {
        if (!this.data) return;

        // Create tree layout
        const treeLayout = d3.tree()
            .size([this.height - 100, this.width - 200]);

        // Generate hierarchy
        const root = d3.hierarchy(this.data);
        treeLayout(root);

        this.root = root;

        // Create links
        this._renderLinks(root.links());

        // Create nodes
        this._renderNodes(root.descendants());
    }

    /**
     * Render links between nodes
     * @private
     */
    _renderLinks(links) {
        const link = d3.linkHorizontal()
            .x(d => d.y)
            .y(d => d.x);

        this.g.selectAll('.org-link')
            .data(links)
            .join('path')
            .attr('class', 'org-link')
            .attr('d', link)
            .style('fill', 'none')
            .style('stroke', '#cbd5e0')
            .style('stroke-width', '2px');
    }

    /**
     * Render nodes
     * @private
     */
    _renderNodes(nodes) {
        const nodeGroups = this.g.selectAll('.org-node')
            .data(nodes)
            .join('g')
            .attr('class', 'org-node')
            .attr('transform', d => `translate(${d.y},${d.x})`);

        // Node rectangles
        nodeGroups.append('rect')
            .attr('width', this.nodeWidth)
            .attr('height', this.nodeHeight)
            .attr('x', -this.nodeWidth / 2)
            .attr('y', -this.nodeHeight / 2)
            .attr('rx', 8)
            .attr('ry', 8)
            .style('fill', d => this._getNodeColor(d))
            .style('stroke', d => this._getNodeStroke(d))
            .style('stroke-width', '2px')
            .style('cursor', 'pointer')
            .on('click', (event, d) => this._handleNodeClick(event, d))
            .on('dblclick', (event, d) => this._handleNodeDoubleClick(event, d))
            .on('contextmenu', (event, d) => this._handleNodeRightClick(event, d));

        // Node labels
        nodeGroups.append('text')
            .attr('dy', '-5')
            .style('text-anchor', 'middle')
            .style('font-size', '12px')
            .style('font-weight', 'bold')
            .style('fill', '#333')
            .text(d => this._truncateText(d.data.name, 20));

        // Node sub-labels (type/code)
        nodeGroups.append('text')
            .attr('dy', '15')
            .style('text-anchor', 'middle')
            .style('font-size', '10px')
            .style('fill', '#666')
            .text(d => d.data.code || d.data.type);

        // Collapse/expand button for nodes with children
        nodeGroups.each((d, i, nodes) => {
            if (d.children && d.children.length > 0) {
                d3.select(nodes[i])
                    .append('circle')
                    .attr('cy', this.nodeHeight / 2)
                    .attr('r', 8)
                    .style('fill', '#fff')
                    .style('stroke', '#999')
                    .style('stroke-width', '1px')
                    .style('cursor', 'pointer')
                    .on('click', (event) => {
                        event.stopPropagation();
                        this._toggleNode(d);
                    });
            }
        });

        this.nodes = nodes;
    }

    /**
     * Get node color based on type
     * @private
     */
    _getNodeColor(d) {
        const colors = {
            'root': '#0d6efd',
            'directorate': '#e7f1ff',
            'workunit': '#fff3cd',
            'affair': '#d1e7dd',
            'position': '#f8d7da'
        };
        return colors[d.data.type] || '#f8f9fa';
    }

    /**
     * Get node stroke color
     * @private
     */
    _getNodeStroke(d) {
        const colors = {
            'root': '#0a58ca',
            'directorate': '#0d6efd',
            'workunit': '#ffc107',
            'affair': '#198754',
            'position': '#dc3545'
        };
        return colors[d.data.type] || '#dee2e6';
    }

    /**
     * Truncate text to fit node
     * @private
     */
    _truncateText(text, maxLength) {
        return text.length > maxLength ? text.substring(0, maxLength - 3) + '...' : text;
    }

    /**
     * Handle node click
     * @private
     */
    _handleNodeClick(event, d) {
        if (this.onNodeClick) {
            this.onNodeClick(d.data, d);
        }

        // Highlight selected node
        this.g.selectAll('.org-node rect')
            .style('stroke-width', '2px');

        d3.select(event.currentTarget)
            .style('stroke-width', '4px');
    }

    /**
     * Handle node double-click
     * @private
     */
    _handleNodeDoubleClick(event, d) {
        if (this.onNodeDoubleClick) {
            this.onNodeDoubleClick(d.data, d);
        }
    }

    /**
     * Handle node right-click
     * @private
     */
    _handleNodeRightClick(event, d) {
        event.preventDefault();

        if (this.onNodeRightClick) {
            this.onNodeRightClick(d.data, d);
        } else {
            this._showContextMenu(event, d);
        }
    }

    /**
     * Show context menu
     * @private
     */
    _showContextMenu(event, d) {
        const menu = document.createElement('div');
        menu.className = 'org-context-menu';
        menu.style.position = 'absolute';
        menu.style.left = event.pageX + 'px';
        menu.style.top = event.pageY + 'px';
        menu.style.zIndex = '9999';
        menu.innerHTML = `
            <div class="context-menu-item" data-action="view">
                <i class="bi bi-eye"></i> View Details
            </div>
            <div class="context-menu-item" data-action="edit">
                <i class="bi bi-pencil"></i> Edit
            </div>
            <div class="context-menu-item" data-action="add">
                <i class="bi bi-plus"></i> Add Child
            </div>
            ${d.data.type !== 'root' ? `
                <div class="context-menu-divider"></div>
                <div class="context-menu-item text-danger" data-action="delete">
                    <i class="bi bi-trash"></i> Delete
                </div>
            ` : ''}
        `;

        document.body.appendChild(menu);

        // Handle menu item clicks
        menu.querySelectorAll('.context-menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const action = item.dataset.action;
                this._handleContextMenuAction(action, d);
                menu.remove();
            });
        });

        // Close menu on click outside
        setTimeout(() => {
            document.addEventListener('click', function closeMenu() {
                menu.remove();
                document.removeEventListener('click', closeMenu);
            });
        }, 100);
    }

    /**
     * Handle context menu action
     * @private
     */
    _handleContextMenuAction(action, d) {
        switch (action) {
            case 'view':
                showToast(`Viewing: ${d.data.name}`, 'Info');
                break;
            case 'edit':
                showToast(`Editing: ${d.data.name}`, 'Info');
                break;
            case 'add':
                showToast(`Adding child to: ${d.data.name}`, 'Info');
                break;
            case 'delete':
                confirmDialog({
                    title: 'Confirm Delete',
                    message: `Are you sure you want to delete "${d.data.name}"?`,
                    type: 'danger'
                }).then(confirmed => {
                    if (confirmed) {
                        showToast(`Deleted: ${d.data.name}`, 'Success');
                    }
                });
                break;
        }
    }

    /**
     * Toggle node collapse/expand
     * @private
     */
    _toggleNode(d) {
        if (d.children) {
            d._children = d.children;
            d.children = null;
        } else {
            d.children = d._children;
            d._children = null;
        }
        this._render();
    }

    /**
     * Zoom in
     */
    _zoomIn() {
        if (this.zoom) {
            this.svg.transition().duration(300).call(
                this.zoom.scaleBy, 1.3
            );
        }
    }

    /**
     * Zoom out
     */
    _zoomOut() {
        if (this.zoom) {
            this.svg.transition().duration(300).call(
                this.zoom.scaleBy, 0.7
            );
        }
    }

    /**
     * Reset zoom
     */
    _resetZoom() {
        if (this.zoom && this.svg) {
            this.svg.transition().duration(500).call(
                this.zoom.transform,
                d3.zoomIdentity
            );
        }
    }

    /**
     * Expand all nodes
     */
    _expandAll() {
        this.root.descendants().forEach(d => {
            if (d._children) {
                d.children = d._children;
                d._children = null;
            }
        });
        this._render();
    }

    /**
     * Collapse all nodes
     */
    _collapseAll() {
        this.root.descendants().forEach(d => {
            if (d.children && d.depth > 0) {
                d._children = d.children;
                d.children = null;
            }
        });
        this._render();
    }

    /**
     * Export diagram as PNG
     */
    _exportAsPNG() {
        const svgElement = document.querySelector(`#${this.containerId} svg`);
        if (!svgElement) return;

        // Serialize SVG
        const serializer = new XMLSerializer();
        const svgString = serializer.serializeToString(svgElement);

        // Create canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        // Set canvas size
        canvas.width = this.width;
        canvas.height = this.height;

        img.onload = () => {
            ctx.drawImage(img, 0, 0);

            // Download as PNG
            const link = document.createElement('a');
            link.download = 'organization-diagram.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        };

        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)));
    }

    /**
     * Update diagram data
     */
    updateData(data) {
        this.data = data;
        this._render();
    }

    /**
     * Destroy diagram
     */
    destroy() {
        if (this.svg) {
            this.svg.remove();
            this.svg = null;
        }
    }
}

// ============================================================================
// HELPER FUNCTION TO CREATE ORGANIZATION DIAGRAM
// ============================================================================

function createOrganizationDiagram(containerId, options = {}) {
    const diagram = new OrganizationDiagram({
        containerId,
        ...options
    });

    diagram.init();

    return diagram;
}

// ============================================================================
// ADD STYLES FOR ORGANIZATION DIAGRAM
// ============================================================================

const orgDiagramStyles = `
    <style>
        .org-diagram-container {
            position: relative;
            width: 100%;
            height: 600px;
            border: 1px solid #dee2e6;
            border-radius: 8px;
            overflow: hidden;
            background-color: #f8f9fa;
        }

        .org-diagram-content {
            cursor: grab;
        }

        .org-diagram-content:active {
            cursor: grabbing;
        }

        .org-diagram-controls {
            position: absolute;
            top: 10px;
            right: 10px;
            z-index: 10;
        }

        .org-context-menu {
            background: white;
            border: 1px solid #dee2e6;
            border-radius: 4px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            min-width: 150px;
        }

        .context-menu-item {
            padding: 8px 12px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .context-menu-item:hover {
            background-color: #f8f9fa;
        }

        .context-menu-item.text-danger {
            color: #dc3545;
        }

        .context-menu-divider {
            height: 1px;
            background-color: #dee2e6;
            margin: 4px 0;
        }
    </style>
`;

// Inject styles
document.head.insertAdjacentHTML('beforeend', orgDiagramStyles);

// ============================================================================
// EXPORT
// ============================================================================

if (typeof window !== 'undefined') {
    window.OrganizationDiagram = OrganizationDiagram;
    window.createOrganizationDiagram = createOrganizationDiagram;
}


// ============================================================================// FROM: search.js
// ============================================================================

/**
 * Global Search Component for Strategic Execution Monitoring Application
 * Provides global search across all modules with keyboard shortcut support
 */

// ============================================================================
// GLOBAL SEARCH CLASS
// ============================================================================

class GlobalSearch {
    constructor(options = {}) {
        this.modules = options.modules || [];
        this.onResultClick = options.onResultClick || null;
        this.recentSearches = StorageUtils.get('global-search-recent', []);
        this.maxRecentSearches = 5;
        this.isOpen = false;
        this.currentQuery = '';
        this.isSearching = false;
    }

    /**
     * Initialize global search
     */
    init() {
        this._createSearchUI();
        this._setupKeyboardShortcuts();
        this._setupEventListeners();
    }

    /**
     * Create search UI
     * @private
     */
    _createSearchUI() {
        // Check if search bar already exists in navbar
        let searchBar = document.getElementById('global-search-bar');

        if (!searchBar) {
            // Create search bar
            searchBar = document.createElement('div');
            searchBar.className = 'global-search-bar';
            searchBar.id = 'global-search-bar';
            searchBar.innerHTML = `
                <div class="input-group">
                    <span class="input-group-text">
                        <i class="bi bi-search"></i>
                    </span>
                    <input type="text" class="form-control" id="global-search-input"
                           placeholder="Search... (Ctrl+K)" autocomplete="off">
                    <button class="btn btn-outline-secondary" type="button" id="clear-search" style="display: none;">
                        <i class="bi bi-x"></i>
                    </button>
                </div>
                <div id="global-search-results" class="global-search-results" style="display: none;"></div>
            `;
        }

        return searchBar;
    }

    /**
     * Setup keyboard shortcuts
     * @private
     */
    _setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+K / Cmd+K to open search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.open();
            }

            // Escape to close search
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
    }

    /**
     * Setup event listeners
     * @private
     */
    _setupEventListeners() {
        const input = document.getElementById('global-search-input');
        const clearBtn = document.getElementById('clear-search');

        if (input) {
            // Search on input
            input.addEventListener('input', (e) => {
                this.currentQuery = e.target.value;
                if (this.currentQuery.trim()) {
                    clearBtn.style.display = 'block';
                    this._performSearch(this.currentQuery);
                } else {
                    clearBtn.style.display = 'none';
                    this._showRecentSearches();
                }
            });

            // Handle navigation keys
            input.addEventListener('keydown', (e) => {
                this._handleKeyNavigation(e);
            });
        }

        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                input.value = '';
                this.currentQuery = '';
                clearBtn.style.display = 'none';
                this._showRecentSearches();
                input.focus();
            });
        }

        // Close when clicking outside
        document.addEventListener('click', (e) => {
            const searchBar = document.getElementById('global-search-bar');
            if (searchBar && !searchBar.contains(e.target)) {
                this.close();
            }
        });
    }

    /**
     * Open search modal/bar
     */
    open() {
        const searchBar = document.getElementById('global-search-bar');
        if (!searchBar) {
            this._createSearchUI();
        }

        const results = document.getElementById('global-search-results');
        const input = document.getElementById('global-search-input');

        if (results) results.style.display = 'block';
        if (input) input.focus();

        this.isOpen = true;
        this._showRecentSearches();
    }

    /**
     * Close search modal/bar
     */
    close() {
        const results = document.getElementById('global-search-results');
        if (results) {
            results.style.display = 'none';
        }
        this.isOpen = false;
    }

    /**
     * Show recent searches
     * @private
     */
    _showRecentSearches() {
        const resultsContainer = document.getElementById('global-search-results');

        if (this.recentSearches.length === 0) {
            resultsContainer.innerHTML = `
                <div class="p-3 text-muted text-center">
                    <small>No recent searches</small>
                </div>
            `;
            return;
        }

        resultsContainer.innerHTML = `
            <div class="search-recent-header p-2 border-bottom">
                <small class="text-muted">Recent Searches</small>
            </div>
            <div class="search-recent-list">
                ${this.recentSearches.map(search => `
                    <div class="search-recent-item p-2" data-search="${search}">
                        <i class="bi bi-clock-history me-2"></i>${search}
                    </div>
                `).join('')}
            </div>
            <div class="search-recent-footer p-2 border-top">
                <a href="#" class="clear-recent-link small text-muted">
                    <i class="bi bi-trash me-1"></i>Clear history
                </a>
            </div>
        `;

        // Add click handlers
        resultsContainer.querySelectorAll('.search-recent-item').forEach(item => {
            item.addEventListener('click', () => {
                const search = item.dataset.search;
                document.getElementById('global-search-input').value = search;
                this._performSearch(search);
            });
        });

        resultsContainer.querySelector('.clear-recent-link')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.recentSearches = [];
            StorageUtils.remove('global-search-recent');
            this._showRecentSearches();
        });
    }

    /**
     * Perform search
     * @private
     */
    async _performSearch(query) {
        if (!query || query.trim().length < 2) return;

        this.isSearching = true;
        const resultsContainer = document.getElementById('global-search-results');

        // Show loading
        resultsContainer.innerHTML = `
            <div class="p-4 text-center">
                <div class="spinner-border spinner-border-sm text-primary" role="status">
                    <span class="visually-hidden">Searching...</span>
                </div>
                <div class="mt-2 text-muted"><small>Searching...</small></div>
            </div>
        `;

        try {
            // Call API search endpoint
            const response = await api.search.global(query);

            if (response.success && response.data) {
                this._displayResults(query, response.data);

                // Add to recent searches
                this._addToRecentSearches(query);
            } else {
                resultsContainer.innerHTML = `
                    <div class="p-4 text-center text-muted">
                        <small>No results found for "${query}"</small>
                    </div>
                `;
            }

        } catch (error) {
            console.error('Search error:', error);
            resultsContainer.innerHTML = `
                <div class="p-4 text-center text-danger">
                    <small>Search failed. Please try again.</small>
                </div>
            `;
        }

        this.isSearching = false;
    }

    /**
     * Display search results
     * @private
     */
    _displayResults(query, data) {
        const resultsContainer = document.getElementById('global-search-results');

        if (!data || Object.keys(data).length === 0) {
            resultsContainer.innerHTML = `
                <div class="p-4 text-center text-muted">
                    <small>No results found for "${query}"</small>
                </div>
            `;
            return;
        }

        let html = '<div class="search-results-list">';

        for (const [module, results] of Object.entries(data)) {
            if (results && results.length > 0) {
                const moduleNames = {
                    'users': 'Users',
                    'roles': 'Roles',
                    'directorates': 'Directorates',
                    'workunits': 'Work Units',
                    'affairs': 'Affairs',
                    'positions': 'Positions',
                    'goals': 'Goals',
                    'kpis': 'KPIs',
                    'programs': 'Programs',
                    'activities': 'Activities'
                };

                html += `
                    <div class="search-result-category p-2 border-bottom">
                        <small class="text-muted fw-bold">${moduleNames[module] || module}</small>
                    </div>
                `;

                results.forEach(result => {
                    html += `
                        <div class="search-result-item p-2" data-module="${module}" data-id="${result.id}">
                            <div class="d-flex align-items-center">
                                <div class="search-result-icon me-2">
                                    <i class="bi bi-${this._getModuleIcon(module)}"></i>
                                </div>
                                <div class="flex-grow-1">
                                    <div class="search-result-title">${result.name || result.title || result.username}</div>
                                    <div class="search-result-subtitle text-muted small">${result.code || result.email || result.description || ''}</div>
                                </div>
                                <div class="search-result-action">
                                    <i class="bi bi-arrow-right-short"></i>
                                </div>
                            </div>
                        </div>
                    `;
                });
            }
        }

        html += '</div>';

        resultsContainer.innerHTML = html;

        // Add click handlers
        resultsContainer.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('click', () => {
                const module = item.dataset.module;
                const id = item.dataset.id;
                this._handleResultClick(module, id);
            });
        });
    }

    /**
     * Get icon for module
     * @private
     */
    _getModuleIcon(module) {
        const icons = {
            'users': 'person',
            'roles': 'shield-check',
            'directorates': 'building',
            'workunits': 'diagram-3',
            'affairs': 'folder',
            'positions': 'person-badge',
            'goals': 'flag',
            'kpis': 'graph-up',
            'programs': 'list-task',
            'activities': 'check2-square'
        };
        return icons[module] || 'file-earmark';
    }

    /**
     * Handle result click
     * @private
     */
    _handleResultClick(module, id) {
        this.close();

        // Navigate to the relevant page
        const viewMap = {
            'users': 'users',
            'roles': 'users',
            'directorates': 'organization',
            'workunits': 'organization',
            'affairs': 'organization',
            'positions': 'organization',
            'goals': 'strategic-plan',
            'kpis': 'kpi',
            'programs': 'programs'
        };

        const viewName = viewMap[module];
        if (viewName) {
            app.switchView(viewName);
        }

        // Notify to highlight/show the specific item
        if (this.onResultClick) {
            this.onResultClick(module, id);
        }
    }

    /**
     * Add to recent searches
     * @private
     */
    _addToRecentSearches(query) {
        // Remove if already exists
        this.recentSearches = this.recentSearches.filter(s => s !== query);

        // Add to beginning
        this.recentSearches.unshift(query);

        // Keep only maxRecentSearches
        this.recentSearches = this.recentSearches.slice(0, this.maxRecentSearches);

        // Save to storage
        StorageUtils.save('global-search-recent', this.recentSearches);
    }

    /**
     * Handle keyboard navigation
     * @private
     */
    _handleKeyNavigation(e) {
        const items = document.querySelectorAll('.search-result-item, .search-recent-item');
        const currentIndex = Array.from(items).findIndex(item => item.classList.contains('selected'));

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            const nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
            this._selectItem(items, nextIndex);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            const prevIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
            this._selectItem(items, prevIndex);
        } else if (e.key === 'Enter' && currentIndex >= 0) {
            e.preventDefault();
            items[currentIndex].click();
        }
    }

    /**
     * Select item in results list
     * @private
     */
    _selectItem(items, index) {
        items.forEach(item => item.classList.remove('selected'));
        items[index].classList.add('selected');
        items[index].scrollIntoView({ block: 'nearest' });
    }
}

// ============================================================================
// FILTER PANEL COMPONENT
// ============================================================================

class FilterPanel {
    constructor(options = {}) {
        this.containerId = options.containerId;
        this.filters = options.filters || [];
        this.onFilterChange = options.onFilterChange || null;
        this.collapsed = false;
    }

    /**
     * Create filter panel
     */
    create() {
        const container = document.getElementById(this.containerId);
        if (!container) return;

        container.innerHTML = `
            <div class="filter-panel">
                <div class="filter-header d-flex justify-content-between align-items-center p-3">
                    <h6 class="m-0"><i class="bi bi-funnel me-2"></i>Filters</h6>
                    <div class="filter-actions">
                        <button class="btn btn-sm btn-link p-0" id="toggle-filter-panel" title="Toggle">
                            <i class="bi bi-chevron-up"></i>
                        </button>
                        <button class="btn btn-sm btn-link p-0" id="clear-all-filters" title="Clear all">
                            <i class="bi bi-x-circle"></i>
                        </button>
                    </div>
                </div>
                <div class="filter-body p-3">
                    ${this._renderFilters()}
                </div>
                <div class="filter-footer p-3 border-top">
                    <button class="btn btn-primary btn-sm w-100" id="apply-filters">
                        <i class="bi bi-check-lg me-1"></i>Apply Filters
                    </button>
                </div>
            </div>
        `;

        this._setupEventListeners();
    }

    /**
     * Render filters
     * @private
     */
    _renderFilters() {
        return this.filters.map(filter => {
            switch (filter.type) {
                case 'text':
                    return this._renderTextFilter(filter);
                case 'select':
                    return this._renderSelectFilter(filter);
                case 'multiselect':
                    return this._renderMultiSelectFilter(filter);
                case 'date':
                    return this._renderDateFilter(filter);
                case 'daterange':
                    return this._renderDateRangeFilter(filter);
                case 'checkbox':
                    return this._renderCheckboxFilter(filter);
                default:
                    return '';
            }
        }).join('');
    }

    /**
     * Render text filter
     * @private
     */
    _renderTextFilter(filter) {
        return `
            <div class="filter-item mb-3">
                <label class="form-label">${filter.label}</label>
                <input type="text" class="form-control filter-input"
                       name="${filter.name}" placeholder="${filter.placeholder || ''}"
                       value="${filter.value || ''}">
            </div>
        `;
    }

    /**
     * Render select filter
     * @private
     */
    _renderSelectFilter(filter) {
        return `
            <div class="filter-item mb-3">
                <label class="form-label">${filter.label}</label>
                <select class="form-select filter-select" name="${filter.name}">
                    <option value="">${filter.placeholder || 'Select...'}</option>
                    ${(filter.options || []).map(opt => `
                        <option value="${opt.value}" ${filter.value === opt.value ? 'selected' : ''}>
                            ${opt.label}
                        </option>
                    `).join('')}
                </select>
            </div>
        `;
    }

    /**
     * Render multi-select filter
     * @private
     */
    _renderMultiSelectFilter(filter) {
        return `
            <div class="filter-item mb-3">
                <label class="form-label">${filter.label}</label>
                <select multiple class="form-select filter-multiselect" name="${filter.name}" size="3">
                    ${(filter.options || []).map(opt => `
                        <option value="${opt.value}" ${(filter.value || []).includes(opt.value) ? 'selected' : ''}>
                            ${opt.label}
                        </option>
                    `).join('')}
                </select>
                <small class="text-muted">Hold Ctrl/Cmd to select multiple</small>
            </div>
        `;
    }

    /**
     * Render date filter
     * @private
     */
    _renderDateFilter(filter) {
        return `
            <div class="filter-item mb-3">
                <label class="form-label">${filter.label}</label>
                <input type="date" class="form-control filter-date"
                       name="${filter.name}" value="${filter.value || ''}">
            </div>
        `;
    }

    /**
     * Render date range filter
     * @private
     */
    _renderDateRangeFilter(filter) {
        return `
            <div class="filter-item mb-3">
                <label class="form-label">${filter.label}</label>
                <div class="row g-2">
                    <div class="col">
                        <input type="date" class="form-control filter-date-start"
                               name="${filter.name}_start" placeholder="From"
                               value="${filter.start || ''}">
                    </div>
                    <div class="col">
                        <input type="date" class="form-control filter-date-end"
                               name="${filter.name}_end" placeholder="To"
                               value="${filter.end || ''}">
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render checkbox filter
     * @private
     */
    _renderCheckboxFilter(filter) {
        return `
            <div class="filter-item mb-3">
                <div class="form-check">
                    <input class="form-check-input filter-checkbox" type="checkbox"
                           name="${filter.name}" id="filter-${filter.name}"
                           ${(filter.checked !== undefined) ? (filter.checked ? 'checked' : '') : ''}>
                    <label class="form-check-label" for="filter-${filter.name}">
                        ${filter.label}
                    </label>
                </div>
            </div>
        `;
    }

    /**
     * Setup event listeners
     * @private
     */
    _setupEventListeners() {
        const container = document.getElementById(this.containerId);
        if (!container) return;

        // Toggle panel
        container.querySelector('#toggle-filter-panel')?.addEventListener('click', () => {
            this.toggle();
        });

        // Clear all filters
        container.querySelector('#clear-all-filters')?.addEventListener('click', () => {
            this.clearAll();
        });

        // Apply filters
        container.querySelector('#apply-filters')?.addEventListener('click', () => {
            this.apply();
        });
    }

    /**
     * Toggle panel collapse/expand
     */
    toggle() {
        const body = document.querySelector(`#${this.containerId} .filter-body`);
        const icon = document.querySelector(`#${this.containerId} #toggle-filter-panel i`);

        if (body && icon) {
            this.collapsed = !this.collapsed;
            body.style.display = this.collapsed ? 'none' : 'block';
            icon.className = this.collapsed ? 'bi bi-chevron-down' : 'bi bi-chevron-up';
        }
    }

    /**
     * Clear all filters
     */
    clearAll() {
        const container = document.getElementById(this.containerId);
        if (!container) return;

        // Clear all inputs
        container.querySelectorAll('.filter-input, .filter-select').forEach(input => {
            input.value = '';
        });

        // Clear all checkboxes
        container.querySelectorAll('.filter-checkbox').forEach(checkbox => {
            checkbox.checked = false;
        });

        // Clear all multi-selects
        container.querySelectorAll('.filter-multiselect').forEach(select => {
            Array.from(select.options).forEach(opt => opt.selected = false);
        });

        if (this.onFilterChange) {
            this.onFilterChange({});
        }
    }

    /**
     * Get filter values
     */
    getValues() {
        const container = document.getElementById(this.containerId);
        if (!container) return {};

        const values = {};

        // Text inputs
        container.querySelectorAll('.filter-input').forEach(input => {
            values[input.name] = input.value;
        });

        // Select inputs
        container.querySelectorAll('.filter-select').forEach(select => {
            values[select.name] = select.value;
        });

        // Multi-selects
        container.querySelectorAll('.filter-multiselect').forEach(select => {
            values[select.name] = Array.from(select.selectedOptions).map(opt => opt.value);
        });

        // Dates
        container.querySelectorAll('.filter-date').forEach(input => {
            values[input.name] = input.value;
        });

        // Checkboxes
        container.querySelectorAll('.filter-checkbox').forEach(checkbox => {
            values[checkbox.name] = checkbox.checked;
        });

        return values;
    }

    /**
     * Apply filters
     */
    apply() {
        const values = this.getValues();

        if (this.onFilterChange) {
            this.onFilterChange(values);
        }
    }
}

// ============================================================================
// SAVED FILTER PRESETS
// ============================================================================

class SavedFilters {
    constructor() {
        this.storageKey = 'saved-filters';
    }

    /**
     * Save current filter preset
     */
    save(name, filters) {
        const saved = StorageUtils.get(this.storageKey, {});
        saved[name] = {
            name,
            filters,
            createdAt: new Date().toISOString()
        };
        StorageUtils.save(this.storageKey, saved);
        showSuccessToast(`Filter preset "${name}" saved`);
    }

    /**
     * Load filter preset
     */
    load(name) {
        const saved = StorageUtils.get(this.storageKey, {});
        return saved[name] || null;
    }

    /**
     * Delete filter preset
     */
    delete(name) {
        const saved = StorageUtils.get(this.storageKey, {});
        delete saved[name];
        StorageUtils.save(this.storageKey, saved);
        showSuccessToast(`Filter preset "${name}" deleted`);
    }

    /**
     * List all presets
     */
    list() {
        return StorageUtils.get(this.storageKey, {});
    }
}

// ============================================================================
// EXPORT
// ============================================================================

if (typeof window !== 'undefined') {
    window.GlobalSearch = GlobalSearch;
    window.FilterPanel = FilterPanel;
    window.SavedFilters = SavedFilters;
}


// ============================================================================// FROM: notifications.js
// ============================================================================

/**
 * Notification Center Component
 * Provides in-app notification UI with bell icon, dropdown, and notification center page
 */

// ============================================================================
// NOTIFICATION CENTER CLASS
// ============================================================================

class NotificationCenter {
    constructor(options = {}) {
        this.position = options.position || 'top-right'; // top-right, top-left, bottom-right, bottom-left
        this.autoRefresh = options.autoRefresh !== false;
        this.refreshInterval = options.refreshInterval || 60000; // 1 minute
        this.refreshTimer = null;
        this.unreadCount = 0;
        this.notifications = [];
        this.onNotificationClick = options.onNotificationClick || null;
        this.onMarkAsRead = options.onMarkAsRead || null;
    }

    /**
     * Initialize notification center
     */
    async init() {
        // Create bell icon in navbar
        this._createBellIcon();

        // Load initial notifications
        await this._loadNotifications();

        // Setup auto-refresh
        if (this.autoRefresh) {
            this._startAutoRefresh();
        }
    }

    /**
     * Create bell icon in navbar
     * @private
     */
    _createBellIcon() {
        // Find the navbar or create one
        const navbar = document.querySelector('.navbar') || document.querySelector('nav');
        if (!navbar) return;

        const bellContainer = document.createElement('div');
        bellContainer.className = 'notification-center';
        bellContainer.innerHTML = `
            <button class="btn btn-link position-relative" id="notification-bell" type="button">
                <i class="bi bi-bell fs-5"></i>
                <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger notification-badge" style="display: none;">
                    0
                </span>
            </button>
            <div class="notification-dropdown" id="notification-dropdown" style="display: none;">
                <div class="notification-dropdown-header p-2 border-bottom d-flex justify-content-between align-items-center">
                    <strong>Notifications</strong>
                    <div>
                        <a href="#" class="mark-all-read-link small me-2">Mark all read</a>
                        <a href="#" class="view-all-link small">View all</a>
                    </div>
                </div>
                <div class="notification-dropdown-list" id="notification-list">
                    <div class="text-center p-3 text-muted">
                        <div class="spinner-border spinner-border-sm" role="status">
                            <span class="visually-hidden">Loading...</span>
                        </div>
                    </div>
                </div>
                <div class="notification-dropdown-footer p-2 border-top">
                    <a href="#" class="notification-settings-link small">
                        <i class="bi bi-gear me-1"></i>Notification settings
                    </a>
                </div>
            </div>
        `;

        // Insert into navbar
        const navbarNav = navbar.querySelector('.navbar-nav') || navbar;
        navbarNav.appendChild(bellContainer);

        // Setup event listeners
        this._setupBellEventListeners();
    }

    /**
     * Setup bell icon event listeners
     * @private
     */
    _setupBellEventListeners() {
        const bell = document.getElementById('notification-bell');
        const dropdown = document.getElementById('notification-dropdown');

        if (bell) {
            bell.addEventListener('click', (e) => {
                e.stopPropagation();
                this._toggleDropdown();
            });
        }

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.notification-center')) {
                this._closeDropdown();
            }
        });

        // Mark all as read
        document.querySelector('.mark-all-read-link')?.addEventListener('click', (e) => {
            e.preventDefault();
            this._markAllAsRead();
        });

        // View all notifications
        document.querySelector('.view-all-link')?.addEventListener('click', (e) => {
            e.preventDefault();
            this._closeDropdown();
            app.switchView('notifications');
        });

        // Settings link
        document.querySelector('.notification-settings-link')?.addEventListener('click', (e) => {
            e.preventDefault();
            this._closeDropdown();
            app.switchView('settings');
        });
    }

    /**
     * Toggle dropdown visibility
     * @private
     */
    _toggleDropdown() {
        const dropdown = document.getElementById('notification-dropdown');
        if (!dropdown) return;

        if (dropdown.style.display === 'none') {
            dropdown.style.display = 'block';
            this._renderNotificationList();
        } else {
            this._closeDropdown();
        }
    }

    /**
     * Close dropdown
     * @private
     */
    _closeDropdown() {
        const dropdown = document.getElementById('notification-dropdown');
        if (dropdown) {
            dropdown.style.display = 'none';
        }
    }

    /**
     * Load notifications from API
     * @private
     */
    async _loadNotifications() {
        try {
            const response = await api.notifications.list({ limit: 10, unread_only: false });

            if (response.success && response.data) {
                this.notifications = response.data;
                this.unreadCount = response.data.filter(n => !n.is_read).length;
                this._updateBadge();
            }
        } catch (error) {
            console.error('Error loading notifications:', error);
        }
    }

    /**
     * Render notification list in dropdown
     * @private
     */
    _renderNotificationList() {
        const listContainer = document.getElementById('notification-list');
        if (!listContainer) return;

        if (this.notifications.length === 0) {
            listContainer.innerHTML = `
                <div class="text-center p-3 text-muted">
                    <i class="bi bi-bell-slash fs-1 d-block mb-2"></i>
                    <p class="mb-0">No notifications</p>
                </div>
            `;
            return;
        }

        listContainer.innerHTML = this.notifications.map(notification => `
            <div class="notification-item ${notification.is_read ? '' : 'unread'} p-2 border-bottom"
                 data-notification-id="${notification.notification_id}">
                <div class="d-flex">
                    <div class="notification-icon me-2">
                        <i class="bi bi-${this._getNotificationIcon(notification.notification_type)}"></i>
                    </div>
                    <div class="flex-grow-1" style="cursor: pointer;" onclick="NotificationCenter.handleNotificationClick('${notification.notification_id}')">
                        <div class="notification-title">${notification.title}</div>
                        <div class="notification-content small">${notification.message}</div>
                        <div class="notification-time small text-muted">${DateUtils.getRelativeTime(notification.created_at)}</div>
                    </div>
                    ${!notification.is_read ? `
                        <div class="notification-actions ms-2">
                            <button class="btn btn-sm btn-link p-0 mark-read-btn" data-id="${notification.notification_id}" title="Mark as read">
                                <i class="bi bi-check2"></i>
                            </button>
                        </div>
                    ` : ''}
                </div>
            </div>
        `).join('');

        // Add click handlers for mark as read buttons
        listContainer.querySelectorAll('.mark-read-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this._markAsRead(btn.dataset.id);
            });
        });
    }

    /**
     * Get icon for notification type
     * @private
     */
    _getNotificationIcon(type) {
        const icons = {
            'info': 'info-circle-fill text-info',
            'warning': 'exclamation-triangle-fill text-warning',
            'success': 'check-circle-fill text-success',
            'error': 'x-circle-fill text-danger',
            'default': 'bell-fill text-secondary'
        };
        return icons[type] || icons['default'];
    }

    /**
     * Update unread count badge
     * @private
     */
    _updateBadge() {
        const badge = document.querySelector('.notification-badge');

        if (badge) {
            if (this.unreadCount > 0) {
                badge.textContent = this.unreadCount > 99 ? '99+' : this.unreadCount;
                badge.style.display = 'block';
            } else {
                badge.style.display = 'none';
            }
        }
    }

    /**
     * Mark notification as read
     * @private
     */
    async _markAsRead(notificationId) {
        try {
            const response = await api.notifications.markAsRead(notificationId);

            if (response.success) {
                // Update local state
                const notification = this.notifications.find(n => n.notification_id === notificationId);
                if (notification) {
                    notification.is_read = true;
                    this.unreadCount--;
                }

                this._updateBadge();
                this._renderNotificationList();

                if (this.onMarkAsRead) {
                    this.onMarkAsRead(notificationId);
                }
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    }

    /**
     * Mark all notifications as read
     * @private
     */
    async _markAllAsRead() {
        try {
            const response = await api.notifications.markAllAsRead();

            if (response.success) {
                // Update local state
                this.notifications.forEach(n => n.is_read = true);
                this.unreadCount = 0;

                this._updateBadge();
                this._renderNotificationList();

                showSuccessToast('All notifications marked as read');
            }
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    }

    /**
     * Start auto-refresh
     * @private
     */
    _startAutoRefresh() {
        this.refreshTimer = setInterval(() => {
            this._loadNotifications();
        }, this.refreshInterval);
    }

    /**
     * Stop auto-refresh
     * @private
     */
    _stopAutoRefresh() {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
            this.refreshTimer = null;
        }
    }

    /**
     * Handle notification click
     * @static
     */
    static async handleNotificationClick(notificationId) {
        const notification = notificationCenter.notifications.find(n => n.notification_id === notificationId);

        if (notification) {
            // Mark as read
            await notificationCenter._markAsRead(notificationId);

            // Navigate if link provided
            if (notification.link_url) {
                window.location.href = notification.link_url;
            }

            // Call custom handler
            if (notificationCenter.onNotificationClick) {
                notificationCenter.onNotificationClick(notification);
            }
        }
    }

    /**
     * Create new notification
     */
    static create(title, message, type = 'info', options = {}) {
        // This would call the backend to create a notification
        const notification = {
            notification_type: type,
            title,
            message,
            priority: options.priority || 'medium',
            link_url: options.link || null
        };

        return notification;
    }

    /**
     * Show toast notification
     */
    static showToast(message, type = 'info') {
        showToast(message, 'Notification', type);
    }

    /**
     * Show success toast
     */
    static showSuccess(message) {
        this.showToast(message, 'success');
    }

    /**
     * Show warning toast
     */
    static showWarning(message) {
        this.showToast(message, 'warning');
    }

    /**
     * Show error toast
     */
    static showError(message) {
        this.showToast(message, 'error');
    }
}

// ============================================================================
// CREATE GLOBAL INSTANCE
// ============================================================================

const notificationCenter = new NotificationCenter();

// Make available globally
if (typeof window !== 'undefined') {
    window.NotificationCenter = NotificationCenter;
    window.notificationCenter = notificationCenter;
}

// ============================================================================
// AUTO-INITIALIZE WHEN DOM IS READY
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    notificationCenter.init();
});


// ============================================================================// FROM: export.js
// ============================================================================

/**
 * Export Utilities for Strategic Execution Monitoring Application
 * Provides enhanced export options: PDF, PowerPoint, Enhanced Excel
 */

// ============================================================================
// PDF EXPORT
// ============================================================================

class PDFExporter {
    constructor() {
        this.jsPDF = window.jspdf;
    }

    /**
     * Export data as PDF
     * @param {Object} options - Export options
     * @param {string} options.title - Document title
     * @param {Array} options.headers - Table headers
     * @param {Array} options.data - Table data (array of arrays or objects)
     * @param {string} options.filename - Output filename (without extension)
     * @param {Object} options.options - Additional jsPDF options
     */
    async exportTableToPDF(options = {}) {
        const {
            title = 'Report',
            headers = [],
            data = [],
            filename = 'export',
            options: jsPdfOptions = {}
        } = options;

        if (!this.jsPDF) {
            console.warn('jsPDF library not loaded');
            showErrorMessage('PDF export library not available');
            return;
        }

        showLoadingOverlay();

        try {
            const { jsPDF } = this.jsPDF;
            const doc = new jsPDF(jsPdfOptions.orientation || 'portrait', jsPdfOptions.unit || 'pt', jsPdfOptions.format || 'a4');

            // Document settings
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const margin = 40;
            const usableWidth = pageWidth - (margin * 2);
            const lineHeight = 20;

            let yPosition = margin;

            // Add title
            doc.setFontSize(24);
            doc.setFont('helvetica', 'bold');
            doc.text(title, margin, yPosition);
            yPosition += lineHeight * 2;

            // Add timestamp
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(`Generated: ${DateUtils.formatDateTime(new Date())}`, margin, yPosition);
            yPosition += lineHeight * 2;

            // Process data
            const tableData = this._prepareTableData(headers, data);
            const columnWidths = this._calculateColumnWidths(tableData, usableWidth);

            // Add table
            yPosition = this._addTableToPDF(doc, tableData, columnWidths, margin, yPosition, pageHeight, margin);

            // Save PDF
            doc.save(`${filename}.pdf`);
            showSuccessMessage(`PDF exported: ${filename}.pdf`);

        } catch (error) {
            console.error('PDF export error:', error);
            showErrorMessage('Failed to export PDF: ' + error.message);
        } finally {
            hideLoadingOverlay();
        }
    }

    /**
     * Export dashboard as PDF (including charts)
     */
    async exportDashboardToPDF(options = {}) {
        const {
            title = 'Dashboard Report',
            elementId = 'main-content',
            filename = 'dashboard'
        } = options;

        if (!this.jsPDF) {
            showErrorMessage('PDF export library not available');
            return;
        }

        showLoadingOverlay();

        try {
            const { jsPDF } = this.jsPDF;
            const doc = new jsPDF('p', 'pt', 'a4');
            const element = document.getElementById(elementId);

            if (!element) {
                throw new Error('Element not found');
            }

            // Use html2canvas if available
            if (window.html2canvas) {
                const canvas = await html2canvas(element, {
                    scale: 2,
                    useCORS: true,
                    logging: false
                });

                const imgData = canvas.toDataURL('image/png');
                const imgWidth = doc.internal.pageSize.getWidth() - 80;
                const imgHeight = (canvas.height * imgWidth) / canvas.width;

                doc.setFontSize(20);
                doc.text(title, 40, 40);
                doc.addImage(imgData, 'PNG', 40, 70, imgWidth, imgHeight);
            }

            doc.save(`${filename}.pdf`);
            showSuccessMessage(`Dashboard exported: ${filename}.pdf`);

        } catch (error) {
            console.error('Dashboard PDF export error:', error);
            showErrorMessage('Failed to export dashboard: ' + error.message);
        } finally {
            hideLoadingOverlay();
        }
    }

    /**
     * Prepare table data for PDF
     * @private
     */
    _prepareTableData(headers, data) {
        const tableData = [headers];

        if (Array.isArray(data)) {
            data.forEach(row => {
                if (Array.isArray(row)) {
                    tableData.push(row);
                } else if (typeof row === 'object') {
                    const values = headers.map(header =>
                        row[header] !== undefined ? row[header] : ''
                    );
                    tableData.push(values);
                }
            });
        }

        return tableData;
    }

    /**
     * Calculate column widths
     * @private
     */
    _calculateColumnWidths(tableData, usableWidth) {
        const numColumns = tableData[0].length;
        const columnWidths = [];

        for (let i = 0; i < numColumns; i++) {
            columnWidths.push(usableWidth / numColumns);
        }

        return columnWidths;
    }

    /**
     * Add table to PDF with pagination
     * @private
     */
    _addTableToPDF(doc, tableData, columnWidths, x, y, pageHeight, margin) {
        const rowHeight = 25;
        let currentY = y;

        tableData.forEach((row, rowIndex) => {
            // Check for page break
            if (currentY + rowHeight > pageHeight - margin) {
                doc.addPage();
                currentY = margin;
            }

            // Draw row background
            if (rowIndex === 0) {
                doc.setFillColor(13, 110, 253);
                doc.rect(x, currentY, columnWidths.reduce((a, b) => a + b, 0), rowHeight, 'F');
                doc.setTextColor(255, 255, 255);
            } else {
                doc.setFillColor(rowIndex % 2 === 0 ? 255 : 248, rowIndex % 2 === 0 ? 255 : 249, rowIndex % 2 === 0 ? 255 : 250);
                doc.rect(x, currentY, columnWidths.reduce((a, b) => a + b, 0), rowHeight, 'F');
                doc.setTextColor(0, 0, 0);
            }

            // Draw cells
            let currentX = x;
            row.forEach((cell, cellIndex) => {
                // Cell border
                doc.setDrawColor(200, 200, 200);
                doc.rect(currentX, currentY, columnWidths[cellIndex], rowHeight);

                // Cell text (truncate if too long)
                doc.setFontSize(rowIndex === 0 ? 12 : 10);
                doc.setFont('helvetica', rowIndex === 0 ? 'bold' : 'normal');
                const maxLength = Math.floor(columnWidths[cellIndex] / 6);
                const text = String(cell || '').substring(0, maxLength);
                doc.text(text, currentX + 5, currentY + rowHeight / 2 + 4);

                currentX += columnWidths[cellIndex];
            });

            currentY += rowHeight;
        });

        return currentY;
    }
}

// ============================================================================
// POWERPOINT EXPORT
// ============================================================================

class PowerPointExporter {
    constructor() {
        this.PptxGenJS = window.PptxGenJS;
    }

    /**
     * Export data as PowerPoint presentation
     * @param {Object} options - Export options
     * @param {string} options.title - Presentation title
     * @param {Array} options.slides - Array of slide objects
     * @param {string} options.filename - Output filename
     */
    async exportToPowerPoint(options = {}) {
        const {
            title = 'Report',
            slides = [],
            filename = 'export'
        } = options;

        if (!this.PptxGenJS) {
            console.warn('PptxGenJS library not loaded');
            showErrorMessage('PowerPoint export library not available');
            return;
        }

        showLoadingOverlay();

        try {
            const pptx = new this.PptxGenJS();

            // Presentation metadata
            pptx.title = title;
            pptx.author = 'Strategic Execution Monitoring';
            pptx.subject = title;
            pptx.company = 'Strategic Execution Monitoring';

            // Title slide
            this._addTitleSlide(pptx, title);

            // Content slides
            slides.forEach(slide => {
                this._addContentSlide(pptx, slide);
            });

            // Save presentation
            await pptx.writeFile({ fileName: `${filename}.pptx` });
            showSuccessMessage(`PowerPoint exported: ${filename}.pptx`);

        } catch (error) {
            console.error('PowerPoint export error:', error);
            showErrorMessage('Failed to export PowerPoint: ' + error.message);
        } finally {
            hideLoadingOverlay();
        }
    }

    /**
     * Export dashboard summary as PowerPoint
     */
    async exportDashboardToPowerPoint(options = {}) {
        const {
            title = 'Executive Dashboard',
            stats = [],
            charts = [],
            filename = 'dashboard-summary'
        } = options;

        if (!this.PptxGenJS) {
            showErrorMessage('PowerPoint export library not available');
            return;
        }

        showLoadingOverlay();

        try {
            const pptx = new this.PptxGenJS();
            pptx.title = title;
            pptx.author = 'Strategic Execution Monitoring';

            // Title slide
            this._addTitleSlide(pptx, title);

            // Statistics slide
            if (stats.length > 0) {
                this._addStatsSlide(pptx, stats);
            }

            // Chart slides
            for (const chart of charts) {
                await this._addChartSlide(pptx, chart);
            }

            await pptx.writeFile({ fileName: `${filename}.pptx` });
            showSuccessMessage(`Dashboard exported to PowerPoint: ${filename}.pptx`);

        } catch (error) {
            console.error('Dashboard PowerPoint export error:', error);
            showErrorMessage('Failed to export: ' + error.message);
        } finally {
            hideLoadingOverlay();
        }
    }

    /**
     * Add title slide
     * @private
     */
    _addTitleSlide(pptx, title) {
        const slide = pptx.addSlide();

        // Background
        slide.background = { color: '0D6efd' };

        // Title
        slide.addText(title, {
            x: 0.5,
            y: 2.5,
            w: 9,
            h: 1.5,
            fontSize: 44,
            bold: true,
            color: 'FFFFFF',
            align: 'center',
            valign: 'middle'
        });

        // Subtitle
        slide.addText('Strategic Execution Monitoring', {
            x: 0.5,
            y: 4,
            w: 9,
            h: 0.75,
            fontSize: 24,
            color: 'FFFFFF',
            align: 'center',
            valign: 'middle'
        });

        // Date
        slide.addText(DateUtils.formatDate(new Date()), {
            x: 0.5,
            y: 5,
            w: 9,
            h: 0.5,
            fontSize: 14,
            color: 'FFFFFF',
            align: 'center'
        });
    }

    /**
     * Add content slide with table
     * @private
     */
    _addContentSlide(pptx, slideConfig) {
        const slide = pptx.addSlide();

        // Slide title
        if (slideConfig.title) {
            slide.addText(slideConfig.title, {
                x: 0.5,
                y: 0.5,
                w: 9,
                fontSize: 32,
                bold: true,
                color: '000000'
            });
        }

        // Table
        if (slideConfig.table) {
            const { headers, data } = slideConfig.table;
            const tableData = [headers, ...data];

            slide.addTable(tableData, {
                x: 0.5,
                y: 1.5,
                w: 9,
                border: { pt: 1, color: 'CCCCCC' },
                fill: { color: 'F8F9FA' },
                fontSize: 14,
                align: 'left',
                valign: 'middle',
                colW: headers.map(() => 9 / headers.length)
            });
        }

        // Bullet points
        if (slideConfig.bullets) {
            let yPosition = 1.5;
            slideConfig.bullets.forEach(bullet => {
                slide.addText(bullet, {
                    x: 0.75,
                    y: yPosition,
                    w: 8.5,
                    h: 0.5,
                    fontSize: 18,
                    bullet: true
                });
                yPosition += 0.6;
            });
        }
    }

    /**
     * Add statistics slide
     * @private
     */
    _addStatsSlide(pptx, stats) {
        const slide = pptx.addSlide();

        slide.addText('Key Statistics', {
            x: 0.5,
            y: 0.5,
            w: 9,
            fontSize: 32,
            bold: true
        });

        const cols = Math.min(stats.length, 3);
        const colWidth = 9 / cols;
        const statWidth = colWidth - 0.5;

        stats.forEach((stat, index) => {
            const row = Math.floor(index / cols);
            const col = index % cols;

            slide.addText([
                { text: String(stat.value), options: { fontSize: 48, bold: true, color: '0D6efd' } },
                { text: `\n${stat.label}`, options: { fontSize: 18, color: '666666' } }
            ], {
                x: 0.5 + (col * colWidth),
                y: 1.5 + (row * 2),
                w: statWidth,
                h: 1.5,
                align: 'center',
                valign: 'middle'
            });
        });
    }

    /**
     * Add chart slide
     * @private
     */
    async _addChartSlide(pptx, chartConfig) {
        const slide = pptx.addSlide();

        // Slide title
        slide.addText(chartConfig.title || 'Chart', {
            x: 0.5,
            y: 0.5,
            w: 9,
            fontSize: 28,
            bold: true
        });

        // Add chart from canvas if available
        if (chartConfig.canvasId) {
            const canvas = document.getElementById(chartConfig.canvasId);
            if (canvas) {
                const imgData = canvas.toDataURL('image/png');
                slide.addImage({ data: imgData, x: 1, y: 1.25, w: 8, h: 4.5 });
            }
        }
    }
}

// ============================================================================
// ENHANCED EXCEL EXPORT
// ============================================================================

class ExcelExporter {
    constructor() {
        this.XLSX = window.XLSX;
    }

    /**
     * Export data to Excel with multiple sheets and formatting
     * @param {Object} options - Export options
     * @param {Array} options.sheets - Array of sheet objects { name, headers, data }
     * @param {string} options.filename - Output filename
     */
    async exportToExcel(options = {}) {
        const {
            sheets = [],
            filename = 'export'
        } = options;

        if (!this.XLSX) {
            showErrorMessage('Excel export library not available');
            return;
        }

        showLoadingOverlay();

        try {
            const workbook = this.XLSX.utils.book_new();

            sheets.forEach(sheet => {
                const worksheetData = this._prepareWorksheetData(sheet.headers, sheet.data);
                const worksheet = this.XLSX.utils.aoa_to_array(worksheetData);

                // Set column widths
                const colWidths = sheet.headers.map(h => ({ wch: Math.max(h.length, 15) }));
                worksheet['!cols'] = colWidths;

                // Freeze header row
                worksheet['!freeze'] = { xSplit: 0, ySplit: 1 };

                this.XLSX.utils.book_append_sheet(workbook, worksheet, sheet.name.substring(0, 31));
            });

            // Save workbook
            this.XLSX.writeFile(workbook, `${filename}.xlsx`);
            showSuccessMessage(`Excel exported: ${filename}.xlsx`);

        } catch (error) {
            console.error('Excel export error:', error);
            showErrorMessage('Failed to export Excel: ' + error.message);
        } finally {
            hideLoadingOverlay();
        }
    }

    /**
     * Export with conditional formatting
     */
    async exportWithFormatting(options = {}) {
        const {
            headers = [],
            data = [],
            formatting = {},
            filename = 'formatted-export'
        } = options;

        if (!this.XLSX) {
            showErrorMessage('Excel export library not available');
            return;
        }

        showLoadingOverlay();

        try {
            const worksheetData = this._prepareWorksheetData(headers, data);
            const worksheet = this.XLSX.utils.aoa_to_array(worksheetData);

            // Apply conditional formatting (mock - real implementation requires exceljs)
            const ranges = formatting.ranges || [];

            this.XLSX.utils.book_append_sheet(
                this.XLSX.utils.book_new(),
                worksheet,
                'Data'
            );

            this.XLSX.writeFile(this.XLSX.utils.book_new(), `${filename}.xlsx`);
            showSuccessMessage(`Formatted Excel exported: ${filename}.xlsx`);

        } catch (error) {
            console.error('Excel export error:', error);
            showErrorMessage('Failed to export Excel: ' + error.message);
        } finally {
            hideLoadingOverlay();
        }
    }

    /**
     * Prepare worksheet data
     * @private
     */
    _prepareWorksheetData(headers, data) {
        const worksheetData = [headers];

        if (Array.isArray(data)) {
            data.forEach(row => {
                if (Array.isArray(row)) {
                    worksheetData.push(row);
                } else if (typeof row === 'object') {
                    const values = headers.map(header =>
                        row[header] !== undefined ? row[header] : ''
                    );
                    worksheetData.push(values);
                }
            });
        }

        return worksheetData;
    }
}

// ============================================================================
// EXPORT MANAGER (Unified Interface)
// ============================================================================

class ExportManager {
    constructor() {
        this.pdfExporter = new PDFExporter();
        this.pptxExporter = new PowerPointExporter();
        this.excelExporter = new ExcelExporter();
    }

    /**
     * Export based on format
     */
    async export(format, options = {}) {
        switch (format.toLowerCase()) {
            case 'pdf':
                await this.pdfExporter.exportTableToPDF(options);
                break;
            case 'dashboard-pdf':
                await this.pdfExporter.exportDashboardToPDF(options);
                break;
            case 'pptx':
            case 'powerpoint':
            case 'ppt':
                await this.pptxExporter.exportToPowerPoint(options);
                break;
            case 'dashboard-pptx':
                await this.pptxExporter.exportDashboardToPowerPoint(options);
                break;
            case 'excel':
            case 'xlsx':
                await this.excelExporter.exportToExcel(options);
                break;
            case 'csv':
                this.exportToCSV(options);
                break;
            default:
                showErrorMessage(`Unsupported export format: ${format}`);
        }
    }

    /**
     * Quick export to CSV
     */
    exportToCSV(options = {}) {
        const {
            headers = [],
            data = [],
            filename = 'export'
        } = options;

        let csv = headers.join(',') + '\n';

        data.forEach(row => {
            if (Array.isArray(row)) {
                csv += row.map(cell => `"${String(cell || '').replace(/"/g, '""')}"`).join(',') + '\n';
            } else if (typeof row === 'object') {
                const values = headers.map(header =>
                    `"${String(row[header] || '').replace(/"/g, '""')}"`
                );
                csv += values.join(',') + '\n';
            }
        });

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }

    /**
     * Show export modal
     */
    showExportModal(data, headers, title) {
        const modalHtml = `
            <div class="modal fade" id="exportModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Export Data</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="mb-3">
                                <label class="form-label">Select Format:</label>
                                <select class="form-select" id="export-format">
                                    <option value="excel">Excel (.xlsx)</option>
                                    <option value="csv">CSV (.csv)</option>
                                    <option value="pdf">PDF (.pdf)</option>
                                    <option value="powerpoint">PowerPoint (.pptx)</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Filename:</label>
                                <input type="text" class="form-control" id="export-filename" value="${title || 'export'}">
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-primary" onclick="exportManager._doExport('${encodeURIComponent(JSON.stringify({data, headers, title}))}')">
                                <i class="bi bi-download me-1"></i>Export
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Remove existing modal
        const existingModal = document.getElementById('exportModal');
        if (existingModal) existingModal.remove();

        // Add and show modal
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        new bootstrap.Modal(document.getElementById('exportModal')).show();
    }

    async _doExport(encodedData) {
        const options = JSON.parse(decodeURIComponent(encodedData));
        const format = document.getElementById('export-format').value;
        const filename = document.getElementById('export-filename').value;

        await this.export(format, {
            ...options,
            filename: filename || 'export'
        });

        bootstrap.Modal.getInstance(document.getElementById('exportModal')).hide();
    }
}

// ============================================================================
// EXPORT
// ============================================================================

if (typeof window !== 'undefined') {
    window.PDFExporter = PDFExporter;
    window.PowerPointExporter = PowerPointExporter;
    window.ExcelExporter = ExcelExporter;
    window.ExportManager = ExportManager;
    window.exportManager = new ExportManager();
}


// ============================================================================// FROM: enhanced-features.js
// ============================================================================

/**
 * Enhanced Features for Strategic Execution Monitoring Application
 * Provides advanced functionality: bulk actions, validation tools, rollover utilities
 *
 * STATUS: PLANNED FEATURES - Not yet integrated into UI
 *
 * This module contains advanced features that are developed but not yet integrated
 * into the application interface. These classes should be integrated as follows:
 *
 * TO INTEGRATE:
 * 1. BulkActionsManager - Add to pages with tables (users, kpi, etc.)
 * 2. SMARTValidator - Add to goal/vision/mission creation forms
 * 3. PeriodRollover - Add to Strategic Plan > Periods page
 * 4. AssignmentOverlapDetector - Add to organization assignment forms
 * 5. GoalKPIAlignmentChecker - Add to goal detail view
 *
 * Classes are exported to window object and ready to use when needed.
 */

// ============================================================================
// BULK ACTIONS MANAGER
// ============================================================================

class BulkActionsManager {
    constructor() {
        this.selectedItems = new Set();
    }

    /**
     * Toggle item selection
     */
    toggleSelection(itemId) {
        if (this.selectedItems.has(itemId)) {
            this.selectedItems.delete(itemId);
        } else {
            this.selectedItems.add(itemId);
        }
        this._updateSelectionUI();
    }

    /**
     * Select all items
     */
    selectAll(items) {
        items.forEach(item => this.selectedItems.add(item));
        this._updateSelectionUI();
    }

    /**
     * Clear selection
     */
    clearSelection() {
        this.selectedItems.clear();
        this._updateSelectionUI();
    }

    /**
     * Get selected items
     */
    getSelected() {
        return Array.from(this.selectedItems);
    }

    /**
     * Bulk delete items
     */
    async bulkDelete(endpoint, itemType) {
        const selected = this.getSelected();
        if (selected.length === 0) {
            showErrorMessage('No items selected');
            return;
        }

        const confirmed = confirm(`Are you sure you want to delete ${selected.length} ${itemType}(s)?`);
        if (!confirmed) return;

        showLoadingOverlay();
        const results = { success: 0, failed: 0 };

        for (const id of selected) {
            try {
                const response = await api.call(endpoint, { id });
                if (response.success) results.success++;
                else results.failed++;
            } catch (error) {
                results.failed++;
            }
        }

        hideLoadingOverlay();
        showSuccessMessage(`Deleted: ${results.success}, Failed: ${results.failed}`);
        this.clearSelection();

        // Trigger page reload
        if (typeof window.refreshTable === 'function') {
            window.refreshTable();
        }
    }

    /**
     * Bulk activate/deactivate users
     */
    async bulkToggleUserStatus(active) {
        const selected = this.getSelected();
        if (selected.length === 0) return;

        showLoadingOverlay();
        const results = { success: 0, failed: 0 };

        for (const userId of selected) {
            try {
                const response = await api.call('users/update', {
                    user_id: userId,
                    is_active: active
                });
                if (response.success) results.success++;
                else results.failed++;
            } catch (error) {
                results.failed++;
            }
        }

        hideLoadingOverlay();
        showSuccessMessage(`${active ? 'Activated' : 'Deactivated'}: ${results.success}, Failed: ${results.failed}`);
        this.clearSelection();

        if (typeof window.refreshTable === 'function') {
            window.refreshTable();
        }
    }

    /**
     * Bulk assign role
     */
    async bulkAssignRole(roleId) {
        const selected = this.getSelected();
        if (selected.length === 0) return;

        showLoadingOverlay();
        const results = { success: 0, failed: 0 };

        for (const userId of selected) {
            try {
                const response = await api.call('users/update', {
                    user_id: userId,
                    role_id: roleId
                });
                if (response.success) results.success++;
                else results.failed++;
            } catch (error) {
                results.failed++;
            }
        }

        hideLoadingOverlay();
        showSuccessMessage(`Role assigned: ${results.success}, Failed: ${results.failed}`);
        this.clearSelection();

        if (typeof window.refreshTable === 'function') {
            window.refreshTable();
        }
    }

    _updateSelectionUI() {
        const count = this.selectedItems.size;
        const countBadges = document.querySelectorAll('.bulk-selection-count');
        countBadges.forEach(badge => badge.textContent = count);

        const buttons = document.querySelectorAll('.bulk-action-btn');
        buttons.forEach(btn => {
            btn.disabled = count === 0;
        });
    }
}

// ============================================================================
// SMART VALIDATOR
// ============================================================================

class SMARTValidator {
    /**
     * Validate if a statement meets SMART criteria
     * @param {string} statement - The statement to validate
     * @param {string} type - Type of statement (vision, mission, goal, objective)
     * @returns {Object} Validation result with score and suggestions
     */
    static validate(statement, type = 'goal') {
        const result = {
            isValid: false,
            score: 0,
            criteria: {
                specific: { pass: false, message: '', weight: 20 },
                measurable: { pass: false, message: '', weight: 25 },
                achievable: { pass: false, message: '', weight: 20 },
                relevant: { pass: false, message: '', weight: 20 },
                timeBound: { pass: false, message: '', weight: 15 }
            },
            suggestions: [],
            overallFeedback: ''
        };

        const text = statement.toLowerCase().trim();

        // Check Specific
        if (text.length >= 20 && /\b(what|which|who|how|specific|particular|certain)\b/i.test(statement)) {
            result.criteria.specific.pass = true;
            result.criteria.specific.message = 'Good: Statement is specific and clear';
        } else {
            result.criteria.specific.message = 'Improve: Add more specificity. What exactly are you trying to achieve?';
            result.suggestions.push('Define exactly what you want to accomplish');
        }

        // Check Measurable
        const measurableIndicators = /\b(percent|%|number|count|rate|ratio|score|index|amount|value|increase|decrease|reduce|grow)\b/i;
        if (measurableIndicators.test(statement) || /\d+[%$]?\b/.test(statement)) {
            result.criteria.measurable.pass = true;
            result.criteria.measurable.message = 'Good: Statement includes measurable elements';
        } else {
            result.criteria.measurable.message = 'Improve: Add quantifiable metrics or targets';
            result.suggestions.push('Include specific numbers, percentages, or measurable outcomes');
        }

        // Check Achievable
        const achievableIndicators = /\b(can|able|feasible|realistic|possible|within|capacity|resource|available)\b/i;
        if (achievableIndicators.test(statement) || statement.length >= 50) {
            result.criteria.achievable.pass = true;
            result.criteria.achievable.message = 'Good: Statement appears achievable';
        } else {
            result.criteria.achievable.message = 'Consider: Is this realistic given available resources?';
            result.suggestions.push('Ensure you have or can obtain the necessary resources');
        }

        // Check Relevant
        const relevantIndicators = /\b(alignment|align|strategic|priority|important|business|organization|objective|support|contribute)\b/i;
        if (relevantIndicators.test(statement)) {
            result.criteria.relevant.pass = true;
            result.criteria.relevant.message = 'Good: Statement shows relevance to strategic objectives';
        } else {
            result.criteria.relevant.message = 'Consider: How does this align with broader objectives?';
            result.suggestions.push('Connect this goal to strategic priorities or organizational objectives');
        }

        // Check Time-Bound
        const timeIndicators = /\b(by|before|until|within|during|year|quarter|month|week|deadline|target|fiscal|q[1-4]|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\b/i;
        const datePattern = /\b\d{4}\b|\d{1,2}\/\d{1,2}|\d{1,2}-\d{1,2}/;
        if (timeIndicators.test(statement) || datePattern.test(statement)) {
            result.criteria.timeBound.pass = true;
            result.criteria.timeBound.message = 'Good: Statement includes time constraints';
        } else {
            result.criteria.timeBound.message = 'Critical: Add specific deadline or timeframe';
            result.suggestions.push('Set a clear target date or timeframe for completion');
        }

        // Calculate score
        let totalScore = 0;
        let totalWeight = 0;

        for (const criterion of Object.values(result.criteria)) {
            totalWeight += criterion.weight;
            if (criterion.pass) {
                totalScore += criterion.weight;
            }
        }

        result.score = Math.round((totalScore / totalWeight) * 100);
        result.isValid = result.score >= 70;

        // Overall feedback
        if (result.score >= 90) {
            result.overallFeedback = 'Excellent! This statement is very well-defined and meets SMART criteria.';
        } else if (result.score >= 70) {
            result.overallFeedback = 'Good statement with room for improvement. Consider the suggestions above.';
        } else if (result.score >= 50) {
            result.overallFeedback = 'Fair statement. Several criteria need attention to make it SMART-compliant.';
        } else {
            result.overallFeedback = 'Poor statement. Major revision needed to meet SMART criteria.';
        }

        return result;
    }

    /**
     * Display SMART validation result
     */
    static displayResult(result, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const scoreClass = result.score >= 70 ? 'success' : result.score >= 50 ? 'warning' : 'danger';
        const scoreColor = result.score >= 70 ? '#198754' : result.score >= 50 ? '#ffc107' : '#dc3545';

        let html = `
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">SMART Analysis</h5>
                    <div class="mb-3">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <span class="fw-bold">Overall Score</span>
                            <span class="badge bg-${scoreClass}" style="font-size: 1.2rem;">${result.score}%</span>
                        </div>
                        <div class="progress" style="height: 25px;">
                            <div class="progress-bar bg-${scoreClass}" role="progressbar"
                                 style="width: ${result.score}%; background-color: ${scoreColor} !important;">
                                ${result.score >= 70 ? 'SMART Compliant' : 'Needs Improvement'}
                            </div>
                        </div>
                        <p class="mt-2 mb-0 ${result.score >= 70 ? 'text-success' : 'text-danger'}">
                            ${result.overallFeedback}
                        </p>
                    </div>

                    <h6 class="mt-4">Criteria Breakdown</h6>
                    <div class="list-group">
        `;

        const criteriaLabels = {
            specific: { label: 'Specific', icon: 'bi-crosshair' },
            measurable: { label: 'Measurable', icon: 'bi-rulers' },
            achievable: { label: 'Achievable', icon: 'bi-check-circle' },
            relevant: { label: 'Relevant', icon: 'bi-link-45deg' },
            timeBound: { label: 'Time-Bound', icon: 'bi-calendar-check' }
        };

        for (const [key, criterion] of Object.entries(result.criteria)) {
            const iconClass = criterion.pass ? 'text-success' : 'text-danger';
            const label = criteriaLabels[key];
            html += `
                <div class="list-group-item">
                    <div class="d-flex align-items-start">
                        <i class="bi ${label.icon} ${iconClass} me-2 mt-1"></i>
                        <div class="flex-grow-1">
                            <div class="d-flex justify-content-between">
                                <strong>${label.label}</strong>
                                <small>${criterion.weight}%</small>
                            </div>
                            <p class="mb-0 small ${criterion.pass ? 'text-success' : 'text-muted'}">
                                ${criterion.message}
                            </p>
                        </div>
                        <i class="bi ${criterion.pass ? 'bi-check-circle-fill text-success' : 'bi-x-circle-fill text-danger'} ms-2"></i>
                    </div>
                </div>
            `;
        }

        html += `
                    </div>

                    ${result.suggestions.length > 0 ? `
                        <h6 class="mt-4">Suggestions for Improvement</h6>
                        <ul class="list-group list-group-flush">
                            ${result.suggestions.map(s => `
                                <li class="list-group-item">
                                    <i class="bi bi-lightbulb text-warning me-2"></i>${s}
                                </li>
                            `).join('')}
                        </ul>
                    ` : ''}
                </div>
            </div>
        `;

        container.innerHTML = html;
    }
}

// ============================================================================
// PERIOD ROLLOVER UTILITIES
// ============================================================================

class PeriodRollover {
    /**
     * Roll over period to new year
     */
    static async rolloverPeriod(fromPeriodId, toYear, options = {}) {
        const {
            includeVisions = true,
            includeMissions = true,
            includeGoals = true,
            includeKPIs = false,
            updateYearReferences = true
        } = options;

        showLoadingOverlay();

        try {
            // Create new period
            const newPeriodResponse = await api.call('strategic/periods/create', {
                period_name: `Period ${toYear}`,
                start_date: `${toYear}-01-01`,
                end_date: `${toYear}-12-31`,
                is_active: false
            });

            if (!newPeriodResponse.success) {
                throw new Error('Failed to create new period');
            }

            const newPeriodId = newPeriodResponse.data?.period_id;
            const rolloverLog = {
                period: { from: fromPeriodId, to: newPeriodId },
                items: { visions: 0, missions: 0, goals: 0, kpis: 0 }
            };

            // Roll over visions
            if (includeVisions) {
                const visions = await api.call('strategic/visions/by-period', { period_id: fromPeriodId });
                if (visions.success && visions.data) {
                    for (const vision of visions.data) {
                        await api.call('strategic/visions/create', {
                            period_id: newPeriodId,
                            vision_name: updateYearReferences
                                ? vision.vision_name.replace(/\b\d{4}\b/g, toYear)
                                : vision.vision_name,
                            vision_description: vision.vision_description
                        });
                        rolloverLog.items.visions++;
                    }
                }
            }

            // Roll over missions
            if (includeMissions) {
                const missions = await api.call('strategic/missions/by-vision', { vision_id: 'all' });
                if (missions.success && missions.data) {
                    for (const mission of missions.data) {
                        await api.call('strategic/missions/create', {
                            vision_id: newPeriodId,
                            mission_name: updateYearReferences
                                ? mission.mission_name.replace(/\b\d{4}\b/g, toYear)
                                : mission.mission_name,
                            mission_description: mission.mission_description
                        });
                        rolloverLog.items.missions++;
                    }
                }
            }

            // Roll over goals
            if (includeGoals) {
                const goals = await api.call('strategic/goals/list', { year: newYear(toYear) - 1 });
                if (goals.success && goals.data) {
                    for (const goal of goals.data) {
                        await api.call('strategic/goals/create', {
                            goal_name: updateYearReferences
                                ? goal.goal_name.replace(/\b\d{4}\b/g, toYear)
                                : goal.goal_name,
                            goal_description: goal.goal_description,
                            year: toYear,
                            target_value: goal.target_value
                        });
                        rolloverLog.items.goals++;
                    }
                }
            }

            hideLoadingOverlay();
            showSuccessMessage(`Period rollover complete:\nVisions: ${rolloverLog.items.visions}\nMissions: ${rolloverLog.items.missions}\nGoals: ${rolloverLog.items.goals}`);

            return rolloverLog;

        } catch (error) {
            hideLoadingOverlay();
            showErrorMessage('Period rollover failed: ' + error.message);
            throw error;
        }
    }

    /**
     * Show rollover dialog
     */
    static showRolloverDialog(currentPeriodId, currentYear) {
        const modalHtml = `
            <div class="modal fade" id="rolloverModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Period Rollover</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="rollover-form">
                                <div class="mb-3">
                                    <label class="form-label">Target Year *</label>
                                    <input type="number" class="form-control" id="rollover-year"
                                           value="${parseInt(currentYear) + 1}" min="${parseInt(currentYear) + 1}">
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Include in Rollover:</label>
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" id="include-visions" checked>
                                        <label class="form-check-label" for="include-visions">Visions</label>
                                    </div>
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" id="include-missions" checked>
                                        <label class="form-check-label" for="include-missions">Missions</label>
                                    </div>
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" id="include-goals" checked>
                                        <label class="form-check-label" for="include-goals">Goals</label>
                                    </div>
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" id="include-kpis">
                                        <label class="form-check-label" for="include-kpis">KPIs (caution)</label>
                                    </div>
                                </div>
                                <div class="form-check mb-3">
                                    <input class="form-check-input" type="checkbox" id="update-year-refs" checked>
                                    <label class="form-check-label" for="update-year-refs">
                                        Update year references in text (e.g., "2024" → "2025")
                                    </label>
                                </div>
                                <div class="alert alert-warning">
                                    <i class="bi bi-exclamation-triangle me-2"></i>
                                    <strong>Warning:</strong> This will create copies of selected items.
                                    Please review carefully before proceeding.
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-primary" onclick="PeriodRollover._executeRollover('${currentPeriodId}', '${currentYear}')">
                                <i class="bi bi-arrow-repeat me-1"></i>Execute Rollover
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const existingModal = document.getElementById('rolloverModal');
        if (existingModal) existingModal.remove();

        document.body.insertAdjacentHTML('beforeend', modalHtml);
        new bootstrap.Modal(document.getElementById('rolloverModal')).show();
    }

    static async _executeRollover(fromPeriodId, currentYear) {
        const toYear = document.getElementById('rollover-year').value;
        const options = {
            includeVisions: document.getElementById('include-visions').checked,
            includeMissions: document.getElementById('include-missions').checked,
            includeGoals: document.getElementById('include-goals').checked,
            includeKPIs: document.getElementById('include-kpis').checked,
            updateYearReferences: document.getElementById('update-year-refs').checked
        };

        await PeriodRollover.rolloverPeriod(fromPeriodId, toYear, options);
        bootstrap.Modal.getInstance(document.getElementById('rolloverModal')).hide();
    }
}

// ============================================================================
// ASSIGNMENT OVERLAP DETECTOR
// ============================================================================>

class AssignmentOverlapDetector {
    /**
     * Check for overlapping assignments
     */
    static async checkOverlap(positionId, startDate, endDate, excludeAssignmentId = null) {
        try {
            const assignments = await api.call('organization/assignments/list', {
                position_id: positionId
            });

            if (!assignments.success || !assignments.data) {
                return { hasOverlap: false, conflicts: [] };
            }

            const start = new Date(startDate);
            const end = new Date(endDate);
            const conflicts = [];

            for (const assignment of assignments.data) {
                if (excludeAssignmentId && assignment.assignment_id === excludeAssignmentId) {
                    continue;
                }

                const assignmentStart = new Date(assignment.start_date);
                const assignmentEnd = new Date(assignment.end_date);

                // Check for overlap
                if (start <= assignmentEnd && end >= assignmentStart) {
                    conflicts.push({
                        assignment_id: assignment.assignment_id,
                        user: assignment.user_name,
                        position: assignment.position_name,
                        period: `${assignmentStart.toLocaleDateString()} - ${assignmentEnd.toLocaleDateString()}`
                    });
                }
            }

            return {
                hasOverlap: conflicts.length > 0,
                conflicts: conflicts
            };

        } catch (error) {
            console.error('Overlap check error:', error);
            return { hasOverlap: false, conflicts: [], error: error.message };
        }
    }

    /**
     * Display overlap warning
     */
    static displayOverlapWarning(conflicts, containerId) {
        const container = document.getElementById(containerId);
        if (!container || conflicts.length === 0) return;

        const html = `
            <div class="alert alert-danger alert-dismissible fade show" role="alert">
                <h6 class="alert-heading"><i class="bi bi-exclamation-triangle-fill me-2"></i>Assignment Conflict Detected</h6>
                <p>The following assignments overlap with the selected period:</p>
                <ul class="mb-0">
                    ${conflicts.map(c => `
                        <li><strong>${c.user}</strong> - ${c.position} (${c.period})</li>
                    `).join('')}
                </ul>
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;

        container.innerHTML = html + container.innerHTML;
    }
}

// ============================================================================
// GOAL-KPI ALIGNMENT CHECKER
// ============================================================================

class GoalKPIAlignmentChecker {
    /**
     * Check alignment between goals and KPIs
     */
    static async checkAlignment(goalId) {
        try {
            const [goalResponse, kpiResponse] = await Promise.all([
                api.call('strategic/goals/get', { goal_id: goalId }),
                api.call('kpi/organizational/list', { year: new Date().getFullYear() })
            ]);

            if (!goalResponse.success || !kpiResponse.success) {
                return { aligned: [], unaligned: [], score: 0 };
            }

            const goal = goalResponse.data;
            const kpis = kpiResponse.data || [];
            const goalKeywords = this._extractKeywords(goal.goal_name + ' ' + (goal.goal_description || ''));

            const aligned = [];
            const unaligned = [];

            kpis.forEach(kpi => {
                const kpiKeywords = this._extractKeywords(kpi.kpi_name + ' ' + (kpi.description || ''));
                const matchCount = this._countKeywordMatches(goalKeywords, kpiKeywords);
                const alignmentScore = (matchCount / Math.max(goalKeywords.length, kpiKeywords.length)) * 100;

                if (alignmentScore >= 30) {
                    aligned.push({ kpi, score: Math.round(alignmentScore) });
                } else {
                    unaligned.push({ kpi, score: Math.round(alignmentScore) });
                }
            });

            aligned.sort((a, b) => b.score - a.score);

            const totalScore = kpis.length > 0
                ? Math.round((aligned.reduce((sum, a) => sum + a.score, 0)) / kpis.length)
                : 0;

            return { aligned, unaligned, score: totalScore };

        } catch (error) {
            console.error('Alignment check error:', error);
            return { aligned: [], unaligned: [], score: 0, error: error.message };
        }
    }

    /**
     * Extract keywords from text
     * @private
     */
    static _extractKeywords(text) {
        const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been', 'be']);
        const words = text.toLowerCase().match(/\b\w+\b/g) || [];
        return [...new Set(words.filter(w => w.length > 3 && !stopWords.has(w)))];
    }

    /**
     * Count keyword matches
     * @private
     */
    static _countKeywordMatches(keywords1, keywords2) {
        const set2 = new Set(keywords2);
        return keywords1.filter(k => set2.has(k)).length;
    }
}

// ============================================================================
// EXPORT
// ============================================================================

if (typeof window !== 'undefined') {
    window.BulkActionsManager = BulkActionsManager;
    window.SMARTValidator = SMARTValidator;
    window.PeriodRollover = PeriodRollover;
    window.AssignmentOverlapDetector = AssignmentOverlapDetector;
    window.GoalKPIAlignmentChecker = GoalKPIAlignmentChecker;
    window.bulkActions = new BulkActionsManager();
}


// ============================================================================// FROM: security.js
// ============================================================================

/**
 * Security Enhancements for Strategic Execution Monitoring Application
 * Provides CSRF protection, row-level security, GDPR compliance
 *
 * STATUS: PLANNED FEATURES - Not yet integrated into UI
 *
 * This module contains security enhancements that should be integrated for production use:
 *
 * TO INTEGRATE:
 * 1. CSRFManager - Call csrfManager.init() in app.js init()
 * 2. RowLevelSecurityManager - Call rlsManager.init() after authentication
 * 3. GDPRManager - Add consent dialog and privacy policy link
 * 4. SecurityAuditLogger - Log security events throughout the app
 *
 * Classes are exported to window object and ready to use when needed.
 *
 * CRITICAL: Review and test all security features before enabling in production.
 */

// ============================================================================
// CSRF PROTECTION MANAGER
// ============================================================================

class CSRFManager {
    constructor() {
        this.tokenName = 'X-CSRF-Token';
        this.token = null;
        this.tokenExpiry = null;
    }

    /**
     * Initialize CSRF protection
     */
    async init() {
        // Try to get token from storage
        const stored = StorageUtils.get('csrf-token', null);
        if (stored && stored.expiry > Date.now()) {
            this.token = stored.token;
            this.tokenExpiry = stored.expiry;
        } else {
            await this.refreshToken();
        }

        // Add token to all forms
        this._protectForms();
    }

    /**
     * Refresh CSRF token
     */
    async refreshToken() {
        try {
            const response = await api.call('auth/csrf-token');
            if (response.success && response.data && response.data.token) {
                this.token = response.data.token;
                this.tokenExpiry = Date.now() + (response.data.expiresIn || 3600000); // 1 hour default

                StorageUtils.save('csrf-token', {
                    token: this.token,
                    expiry: this.tokenExpiry
                });

                return this.token;
            }
        } catch (error) {
            console.warn('Failed to refresh CSRF token:', error);
        }
        return null;
    }

    /**
     * Get current CSRF token
     */
    getToken() {
        if (!this.token || (this.tokenExpiry && this.tokenExpiry < Date.now())) {
            this.refreshToken();
        }
        return this.token;
    }

    /**
     * Add CSRF token to request headers
     */
    addTokenToHeaders(headers = {}) {
        const token = this.getToken();
        if (token) {
            headers[this.tokenName] = token;
        }
        return headers;
    }

    /**
     * Protect all forms with CSRF tokens
     * @private
     */
    _protectForms() {
        const forms = document.querySelectorAll('form[data-csrf="true"]');
        forms.forEach(form => {
            // Add hidden input with CSRF token
            let tokenInput = form.querySelector(`input[name="${this.tokenName}"]`);
            if (!tokenInput) {
                tokenInput = document.createElement('input');
                tokenInput.type = 'hidden';
                tokenInput.name = this.tokenName;
                form.appendChild(tokenInput);
            }
            tokenInput.value = this.getToken() || '';

            // Refresh token before submit
            form.addEventListener('submit', async () => {
                tokenInput.value = this.getToken() || await this.refreshToken();
            });
        });
    }

    /**
     * Validate CSRF token on form submission
     */
    static validateToken(token) {
        // This would make an API call to validate the token
        // For now, just check if token exists and is not empty
        return token && token.length > 0;
    }
}

// ============================================================================
// ROW-LEVEL SECURITY MANAGER
// ============================================================================

class RowLevelSecurityManager {
    constructor() {
        this.userAccessScope = null;
        this.currentUser = null;
    }

    /**
     * Initialize RLS with current user context
     */
    async init() {
        try {
            const response = await api.call('auth/me');
            if (response.success && response.data) {
                this.currentUser = response.data;
                this.userAccessScope = this._calculateAccessScope(response.data);
            }
        } catch (error) {
            console.error('Failed to initialize RLS:', error);
        }
    }

    /**
     * Calculate user's access scope based on role and assignments
     * @private
     */
    _calculateAccessScope(user) {
        const scope = {
            canViewAll: false,
            canEditAll: false,
            canDeleteAll: false,
            allowedDirectorates: [],
            allowedWorkUnits: [],
            allowedPositions: [],
            allowedUsers: []
        };

        // Super Admin / System Admin
        if (user.role_code === 'SUPER_ADMIN' || user.role_code === 'SYSTEM_ADMIN') {
            scope.canViewAll = true;
            scope.canEditAll = true;
            scope.canDeleteAll = true;
            return scope;
        }

        // Directorate Head
        if (user.role_code === 'DIRECTORATE_HEAD' && user.directorate_id) {
            scope.allowedDirectorates.push(user.directorate_id);
            scope.canViewAll = false;
            scope.canEditAll = false;
        }

        // Work Unit Head
        if (user.role_code === 'WORK_UNIT_HEAD' && user.work_unit_id) {
            scope.allowedWorkUnits.push(user.work_unit_id);
            scope.canViewAll = false;
            scope.canEditAll = false;
        }

        // Regular User
        if (user.role_code === 'USER') {
            scope.allowedUsers.push(user.user_id);
            scope.canViewAll = false;
            scope.canEditAll = false;
        }

        return scope;
    }

    /**
     * Filter data based on user's access scope
     */
    filterData(data, entityType) {
        if (!this.userAccessScope || this.userAccessScope.canViewAll) {
            return data;
        }

        return data.filter(item => this._hasAccess(item, entityType));
    }

    /**
     * Check if user has access to a specific item
     * @private
     */
    _hasAccess(item, entityType) {
        const scope = this.userAccessScope;

        // Check directorate access
        if (scope.allowedDirectorates.length > 0) {
            const directorateField = item.directorate_id || item.directorateId || item.directorate;
            if (directorateField && scope.allowedDirectorates.includes(directorateField)) {
                return true;
            }
        }

        // Check work unit access
        if (scope.allowedWorkUnits.length > 0) {
            const workUnitField = item.work_unit_id || item.workUnitId || item.work_unit;
            if (workUnitField && scope.allowedWorkUnits.includes(workUnitField)) {
                return true;
            }
        }

        // Check ownership
        if (scope.allowedUsers.length > 0) {
            const ownerField = item.created_by || item.createdBy || item.owner_id || item.userId;
            if (ownerField && scope.allowedUsers.includes(ownerField)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Check if user can perform an action on an entity
     */
    canPerform(action, entityType, item) {
        if (!this.userAccessScope) return false;

        // Super admins can do everything
        if (this.userAccessScope.canViewAll && this.userAccessScope.canEditAll) return true;

        // Check access based on action
        switch (action) {
            case 'view':
                return this._hasAccess(item, entityType);
            case 'edit':
            case 'update':
                return this._hasAccess(item, entityType) && !this.userAccessScope.readOnly;
            case 'delete':
                return this.userAccessScope.canDeleteAll || this._isOwner(item);
            default:
                return false;
        }
    }

    /**
     * Check if user is the owner of an item
     * @private
     */
    _isOwner(item) {
        if (!this.currentUser) return false;
        const ownerField = item.created_by || item.createdBy || item.user_id;
        return ownerField === this.currentUser.user_id;
    }

    /**
     * Add RLS filters to API request
     */
    addRLSFilters(requestData) {
        if (!this.userAccessScope || this.userAccessScope.canViewAll) {
            return requestData;
        }

        const filters = { ...requestData };

        if (this.userAccessScope.allowedDirectorates.length > 0) {
            filters.directorate_ids = this.userAccessScope.allowedDirectorates;
        }

        if (this.userAccessScope.allowedWorkUnits.length > 0) {
            filters.work_unit_ids = this.userAccessScope.allowedWorkUnits;
        }

        if (this.userAccessScope.allowedUsers.length > 0) {
            filters.user_ids = this.userAccessScope.allowedUsers;
        }

        return filters;
    }
}

// ============================================================================
// GDPR COMPLIANCE MANAGER
// ============================================================================

class GDPRManager {
    /**
     * Export all user data (Right to Data Portability)
     */
    static async exportUserData(userId) {
        showLoadingOverlay();

        try {
            // Collect all user-related data from various endpoints
            const endpoints = [
                { name: 'User Profile', endpoint: 'users/get', data: { user_id: userId } },
                { name: 'Assignments', endpoint: 'organization/assignments/list', data: { user_id: userId } },
                { name: 'KPIs', endpoint: 'kpi/individual/list', data: { user_id: userId } },
                { name: 'OKRs', endpoint: 'okr/my-okrs', data: { user_id: userId } },
                { name: 'Program Activities', endpoint: 'programs/activities', data: { assigned_to: userId } }
            ];

            const userData = {
                exportDate: new Date().toISOString(),
                userId: userId,
                data: {}
            };

            for (const endpoint of endpoints) {
                try {
                    const response = await api.call(endpoint.endpoint, endpoint.data);
                    if (response.success) {
                        userData.data[endpoint.name] = response.data;
                    }
                } catch (error) {
                    userData.data[endpoint.name] = { error: error.message };
                }
            }

            // Download as JSON
            const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `user-data-${userId}-${Date.now()}.json`;
            a.click();
            URL.revokeObjectURL(url);

            showSuccessMessage('User data exported successfully');

        } catch (error) {
            console.error('Data export error:', error);
            showErrorMessage('Failed to export user data: ' + error.message);
        } finally {
            hideLoadingOverlay();
        }
    }

    /**
     * Request user data deletion (Right to be Forgotten)
     */
    static async requestUserDataDeletion(userId) {
        const confirmed = confirm(
            'This will request permanent deletion of all personal data.\n\n' +
            'This action cannot be undone. The data will be anonymized or deleted ' +
            'in accordance with retention policies.\n\n' +
            'Do you want to proceed?'
        );

        if (!confirmed) return;

        showLoadingOverlay();

        try {
            // This would typically create a deletion request that needs admin approval
            const response = await api.call('users/request-deletion', {
                user_id: userId,
                requested_at: new Date().toISOString(),
                reason: 'User exercised right to be forgotten (GDPR Article 17)'
            });

            if (response.success) {
                showSuccessMessage('Deletion request submitted. An administrator will review this request.');
            } else {
                showErrorMessage(response.message || 'Failed to submit deletion request');
            }
        } catch (error) {
            console.error('Deletion request error:', error);
            showErrorMessage('Failed to submit deletion request: ' + error.message);
        } finally {
            hideLoadingOverlay();
        }
    }

    /**
     * Show consent management dialog
     */
    static showConsentManager() {
        const consentData = StorageUtils.get('gdpr-consent', {
            essential: true,
            analytics: false,
            marketing: false,
            date: null
        });

        const modalHtml = `
            <div class="modal fade" id="consentModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Privacy Consent Management</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <p>Manage your privacy preferences and data processing consent.</p>

                            <div class="form-check mb-3">
                                <input class="form-check-input" type="checkbox" id="consent-essential"
                                       disabled ${consentData.essential ? 'checked' : ''}>
                                <label class="form-check-label" for="consent-essential">
                                    <strong>Essential Cookies</strong>
                                    <small class="d-block text-muted">Required for the application to function</small>
                                </label>
                            </div>

                            <div class="form-check mb-3">
                                <input class="form-check-input" type="checkbox" id="consent-analytics"
                                       ${consentData.analytics ? 'checked' : ''}>
                                <label class="form-check-label" for="consent-analytics">
                                    <strong>Analytics & Performance</strong>
                                    <small class="d-block text-muted">Help us improve the application</small>
                                </label>
                            </div>

                            <div class="form-check mb-3">
                                <input class="form-check-input" type="checkbox" id="consent-marketing"
                                       ${consentData.marketing ? 'checked' : ''}>
                                <label class="form-check-label" for="consent-marketing">
                                    <strong>Marketing Communications</strong>
                                    <small class="d-block text-muted">Receive updates and promotional content</small>
                                </label>
                            </div>

                            <hr>

                            <div class="d-grid gap-2">
                                <button class="btn btn-primary" onclick="GDPRManager.saveConsent()">
                                    Save Preferences
                                </button>
                                <button class="btn btn-outline-secondary" onclick="GDPRManager.exportUserData('${auth.currentUser?.user_id || ''}')">
                                    <i class="bi bi-download me-1"></i>Export My Data
                                </button>
                                <button class="btn btn-outline-danger" onclick="GDPRManager.requestUserDataDeletion('${auth.currentUser?.user_id || ''}')">
                                    <i class="bi bi-trash me-1"></i>Request Data Deletion
                                </button>
                            </div>

                            ${consentData.date ? `<p class="text-muted small mt-3">Last updated: ${new Date(consentData.date).toLocaleString()}</p>` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;

        const existingModal = document.getElementById('consentModal');
        if (existingModal) existingModal.remove();

        document.body.insertAdjacentHTML('beforeend', modalHtml);
        new bootstrap.Modal(document.getElementById('consentModal')).show();
    }

    /**
     * Save user consent preferences
     */
    static saveConsent() {
        const consent = {
            essential: true,
            analytics: document.getElementById('consent-analytics').checked,
            marketing: document.getElementById('consent-marketing').checked,
            date: new Date().toISOString()
        };

        StorageUtils.save('gdpr-consent', consent);

        showSuccessMessage('Consent preferences saved');
        bootstrap.Modal.getInstance(document.getElementById('consentModal')).hide();
    }

    /**
     * Check if user has given consent for a specific purpose
     */
    static hasConsent(purpose) {
        const consent = StorageUtils.get('gdpr-consent', {});
        return consent[purpose] === true || purpose === 'essential';
    }

    /**
     * Show initial consent dialog (for first-time users)
     */
    static showInitialConsent() {
        const consent = StorageUtils.get('gdpr-consent', null);
        if (consent) return; // Already shown

        this.showConsentManager();
    }

    /**
     * Get privacy policy content
     */
    static getPrivacyPolicy() {
        return `
            <h4>Privacy Policy</h4>
            <p>Last updated: January 2025</p>

            <h5>Data Collection</h5>
            <p>We collect the following types of personal data:</p>
            <ul>
                <li>Account information (name, email, role)</li>
                <li>Organizational assignments</li>
                <li>Performance metrics and KPIs</li>
                <li>Activity logs and audit trails</li>
            </ul>

            <h5>Data Usage</h5>
            <p>Your data is used for:</p>
            <ul>
                <li>Managing strategic planning and execution</li>
                <li>Tracking performance and KPIs</li>
                <li>Generating reports and analytics</li>
                <li>Improving application functionality</li>
            </ul>

            <h5>Data Rights</h5>
            <p>Under GDPR, you have the right to:</p>
            <ul>
                <li><strong>Access</strong> - Request a copy of your personal data</li>
                <li><strong>Rectification</strong> - Correct inaccurate data</li>
                <li><strong>Erasure</strong> - Request deletion of your data</li>
                <li><strong>Portability</strong> - Receive your data in a structured format</li>
                <li><strong>Object</strong> - Object to processing of your data</li>
            </ul>

            <h5>Data Retention</h5>
            <p>Personal data is retained for the duration of your employment plus 7 years, in accordance with legal requirements.</p>

            <h5>Contact</h5>
            <p>For privacy inquiries, contact: privacy@example.com</p>
        `;
    }
}

// ============================================================================
// SECURITY AUDIT LOGGER
// ============================================================================

class SecurityAuditLogger {
    /**
     * Log security event
     */
    static async log(eventType, details) {
        const logEntry = {
            event_type: eventType,
            timestamp: new Date().toISOString(),
            user_id: auth.currentUser?.user_id || 'anonymous',
            user_agent: navigator.userAgent,
            ip_address: await this._getClientIP(),
            details: details
        };

        try {
            // Send to backend for permanent logging
            await api.call('audit/log-security', logEntry);
        } catch (error) {
            // Log to console as fallback
            console.warn('Security event:', logEntry);
        }

        // Store locally for immediate analysis
        const localLogs = StorageUtils.get('security-audit-logs', []);
        localLogs.push(logEntry);

        // Keep only last 1000 logs locally
        if (localLogs.length > 1000) {
            localLogs.splice(0, localLogs.length - 1000);
        }

        StorageUtils.save('security-audit-logs', localLogs);
    }

    /**
     * Get client IP address
     * @private
     */
    static async _getClientIP() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch {
            return 'unknown';
        }
    }

    /**
     * Log authentication attempt
     */
    static logAuthAttempt(success, username, failureReason = null) {
        this.log('AUTH_ATTEMPT', {
            success,
            username,
            failure_reason: failureReason,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Log permission denied event
     */
    static logPermissionDenied(resource, action, reason) {
        this.log('PERMISSION_DENIED', {
            resource,
            action,
            reason,
            user_role: auth.currentUser?.role_code
        });
    }

    /**
     * Log data access
     */
    static logDataAccess(resourceType, resourceId, accessType) {
        this.log('DATA_ACCESS', {
            resource_type: resourceType,
            resource_id: resourceId,
            access_type: accessType // 'view', 'edit', 'delete'
        });
    }

    /**
     * Get recent security events
     */
    static getRecentEvents(limit = 50) {
        const logs = StorageUtils.get('security-audit-logs', []);
        return logs.slice(-limit);
    }

    /**
     * Detect suspicious activity
     */
    static detectSuspiciousActivity() {
        const logs = this.getRecentEvents(100);
        const suspicious = [];

        // Multiple failed login attempts
        const failedLogins = logs.filter(l =>
            l.event_type === 'AUTH_ATTEMPT' && !l.details.success
        );

        const failedByUser = {};
        failedLogins.forEach(log => {
            const user = log.details.username;
            failedByUser[user] = (failedByUser[user] || 0) + 1;
        });

        for (const [user, count] of Object.entries(failedByUser)) {
            if (count >= 5) {
                suspicious.push({
                    type: 'MULTIPLE_FAILED_LOGINS',
                    user,
                    count,
                    severity: count >= 10 ? 'HIGH' : 'MEDIUM'
                });
            }
        }

        // Permission denials
        const permissionDenials = logs.filter(l => l.event_type === 'PERMISSION_DENIED');
        if (permissionDenials.length >= 10) {
            suspicious.push({
                type: 'EXCESSIVE_PERMISSION_DENIALS',
                count: permissionDenials.length,
                severity: 'MEDIUM'
            });
        }

        return suspicious;
    }
}

// ============================================================================
// EXPORT
// ============================================================================

if (typeof window !== 'undefined') {
    window.CSRFManager = CSRFManager;
    window.RowLevelSecurityManager = RowLevelSecurityManager;
    window.GDPRManager = GDPRManager;
    window.SecurityAuditLogger = SecurityAuditLogger;

    // Initialize global instances
    window.csrfManager = new CSRFManager();
    window.rlsManager = new RowLevelSecurityManager();
}


// ============================================================================// FROM: pwa-install.js
// ============================================================================

/**
 * PWA Installation Manager
 * Handles service worker registration, install prompts, and offline capabilities
 */

class PWAInstallManager {
    constructor() {
        this.deferredPrompt = null;
        this.isInstallable = false;
        this.isInstalled = false;
    }

    /**
     * Initialize PWA
     */
    async init() {
        // Check if running as standalone PWA
        this.isInstalled = window.matchMedia('(display-mode: standalone)').matches;

        // Register service worker
        await this._registerServiceWorker();

        // Setup install prompt listeners
        this._setupInstallPrompt();

        // Setup app update listener
        this._setupUpdateListener();

        // Log PWA status
        console.log('PWA Status:', {
            isInstalled: this.isInstalled,
            isSecure: window.isSecureContext,
            serviceWorker: 'serviceWorker' in navigator
        });
    }

    /**
     * Register service worker
     * @private
     */
    async _registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register(
                    '?path=/service-worker.js',
                    { scope: '/' }
                );

                console.log('Service Worker registered:', registration);

                // Listen for updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            this._showUpdateAvailable();
                        }
                    });
                });

                return registration;
            } catch (error) {
                console.error('Service Worker registration failed:', error);
            }
        }
        return null;
    }

    /**
     * Setup install prompt listener
     * @private
     */
    _setupInstallPrompt() {
        window.addEventListener('beforeinstallprompt', (e) => {
            // Prevent Chrome 67 and earlier from automatically showing the prompt
            e.preventDefault();
            // Stash the event so it can be triggered later
            this.deferredPrompt = e;
            this.isInstallable = true;

            // Show install button in UI
            this._showInstallButton();
        });

        window.addEventListener('appinstalled', () => {
            // App was installed
            this.isInstalled = true;
            this.isInstallable = false;
            this.deferredPrompt = null;

            this._hideInstallButton();
            showSuccessMessage('App installed successfully!');
        });
    }

    /**
     * Setup update listener
     * @private
     */
    _setupUpdateListener() {
        // Check for updates periodically
        setInterval(async () => {
            if ('serviceWorker' in navigator) {
                const registration = await navigator.serviceWorker.getRegistration();
                if (registration) {
                    await registration.update();
                }
            }
        }, 60 * 60 * 1000); // Every hour
    }

    /**
     * Show install button in UI
     * @private
     */
    _showInstallButton() {
        // Remove existing button
        const existingBtn = document.getElementById('pwa-install-btn');
        if (existingBtn) existingBtn.remove();

        // Create install button
        const installBtn = document.createElement('button');
        installBtn.id = 'pwa-install-btn';
        installBtn.className = 'btn btn-primary btn-sm';
        installBtn.innerHTML = '<i class="bi bi-download me-1"></i>Install App';
        installBtn.style.position = 'fixed';
        installBtn.style.bottom = '20px';
        installBtn.style.right = '20px';
        installBtn.style.zIndex = '9999';
        installBtn.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        installBtn.onclick = () => this.promptInstall();

        document.body.appendChild(installBtn);

        // Animate in
        setTimeout(() => {
            installBtn.style.transition = 'all 0.3s';
            installBtn.style.transform = 'translateY(0)';
        }, 100);
    }

    /**
     * Hide install button
     * @private
     */
    _hideInstallButton() {
        const btn = document.getElementById('pwa-install-btn');
        if (btn) {
            btn.style.transform = 'translateY(100px)';
            setTimeout(() => btn.remove(), 300);
        }
    }

    /**
     * Prompt user to install app
     */
    async promptInstall() {
        if (!this.deferredPrompt) {
            showErrorMessage('App is not installable on this device');
            return;
        }

        // Show the install prompt
        this.deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await this.deferredPrompt.userChoice;

        console.log(`User response to install prompt: ${outcome}`);

        // We've used the prompt, and can't use it again
        this.deferredPrompt = null;
        this.isInstallable = false;

        // Hide the install button
        if (outcome === 'accepted') {
            this._hideInstallButton();
        }
    }

    /**
     * Show update available notification
     * @private
     */
    _showUpdateAvailable() {
        const updateDiv = document.createElement('div');
        updateDiv.id = 'pwa-update-notification';
        updateDiv.className = 'alert alert-info alert-dismissible fade show';
        updateDiv.style.position = 'fixed';
        updateDiv.style.top = '20px';
        updateDiv.style.right = '20px';
        updateDiv.style.zIndex = '10000';
        updateDiv.style.maxWidth = '400px';
        updateDiv.innerHTML = `
            <i class="bi bi-info-circle me-2"></i>
            <strong>New version available!</strong>
            <p class="mb-2 small">A new version of the app is ready to install.</p>
            <button class="btn btn-sm btn-primary me-2" onclick="pwaInstall.updateApp()">
                Update Now
            </button>
            <button class="btn btn-sm btn-outline-secondary" data-bs-dismiss="alert">
                Later
            </button>
        `;

        document.body.appendChild(updateDiv);

        // Auto-hide after 30 seconds
        setTimeout(() => {
            const btn = updateDiv.querySelector('[data-bs-dismiss="alert"]');
            if (btn) btn.click();
        }, 30000);
    }

    /**
     * Update the app
     */
    async updateApp() {
        const notification = document.getElementById('pwa-update-notification');
        if (notification) notification.remove();

        // Tell the new service worker to skip waiting
        if ('serviceWorker' in navigator) {
            const registration = await navigator.serviceWorker.getRegistration();
            if (registration && registration.waiting) {
                registration.waiting.postMessage({ type: 'SKIP_WAITING' });
            }
        }

        // Reload the page
        window.location.reload();
    }

    /**
     * Check if app is installed
     */
    checkIsInstalled() {
        return this.isInstalled || window.matchMedia('(display-mode: standalone)').matches;
    }

    /**
     * Get install instructions for different browsers
     */
    getInstallInstructions() {
        const userAgent = navigator.userAgent;

        if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
            return {
                browser: 'Safari (iOS)',
                instructions: [
                    'Tap the Share button',
                    'Scroll down and tap "Add to Home Screen"',
                    'Tap "Add" to install the app'
                ],
                icon: 'bi-apple'
            };
        } else if (/Android/.test(userAgent)) {
            return {
                browser: 'Chrome (Android)',
                instructions: [
                    'Tap the menu button (three dots)',
                    'Tap "Add to Home Screen" or "Install App"',
                    'Confirm installation'
                ],
                icon: 'bi-google-play'
            };
        } else if (/Chrome/.test(userAgent)) {
            return {
                browser: 'Chrome (Desktop)',
                instructions: [
                    'Click the install icon in the address bar',
                    'Click "Install"',
                    'App will be available from your applications'
                ],
                icon: 'bi-chrome'
            };
        } else if (/Edge/.test(userAgent)) {
            return {
                browser: 'Edge',
                instructions: [
                    'Click the install icon in the address bar',
                    'Click "Install"',
                    'App will be available from your applications'
                ],
                icon: 'bi-microsoft-edge'
            };
        } else {
            return {
                browser: 'Unknown Browser',
                instructions: [
                    'Look for an install icon in the address bar',
                    'Or check your browser settings for "Add to Home Screen" or "Install App"'
                ],
                icon: 'bi-question-circle'
            };
        }
    }

    /**
     * Show install instructions modal
     */
    showInstallInstructions() {
        const info = this.getInstallInstructions();

        const modalHtml = `
            <div class="modal fade" id="installInstructionsModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">
                                <i class="bi ${info.icon} me-2"></i>Install App
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <p><strong>${info.browser}</strong></p>
                            <ol>
                                ${info.instructions.map(i => `<li class="mb-2">${i}</li>`).join('')}
                            </ol>
                            <div class="alert alert-info">
                                <i class="bi bi-lightbulb me-2"></i>
                                <strong>Tip:</strong> Installing the app allows offline access
                                and a faster, app-like experience.
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-primary" data-bs-dismiss="modal">
                                Got it!
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const existingModal = document.getElementById('installInstructionsModal');
        if (existingModal) existingModal.remove();

        document.body.insertAdjacentHTML('beforeend', modalHtml);
        new bootstrap.Modal(document.getElementById('installInstructionsModal')).show();
    }

    /**
     * Show splash screen
     */
    showSplashScreen() {
        const splash = document.createElement('div');
        splash.id = 'pwa-splash';
        splash.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #0d6efd 0%, #0dcaf0 100%);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 99999;
            transition: opacity 0.5s;
        `;
        splash.innerHTML = `
            <div style="text-align: center; color: white;">
                <div style="font-size: 64px; margin-bottom: 20px;">
                    <i class="bi bi-bullseye"></i>
                </div>
                <h1 style="font-size: 32px; margin-bottom: 10px;">Strategic Execution</h1>
                <p style="font-size: 18px; opacity: 0.9;">Monitoring Application</p>
                <div class="spinner-border text-light mt-4" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </div>
        `;

        document.body.appendChild(splash);

        // Fade out after 2 seconds
        setTimeout(() => {
            splash.style.opacity = '0';
            setTimeout(() => splash.remove(), 500);
        }, 2000);
    }
}

// ============================================================================
// OFFLINE MANAGER
// ============================================================================

class OfflineManager {
    constructor() {
        this.isOnline = navigator.onLine;
        this.pendingRequests = [];
    }

    /**
     * Initialize offline manager
     */
    init() {
        window.addEventListener('online', () => this._handleOnline());
        window.addEventListener('offline', () => this._handleOffline());

        this._showOnlineStatus();
    }

    /**
     * Handle online event
     * @private
     */
    _handleOnline() {
        this.isOnline = true;
        this._showOnlineStatus();

        // Sync pending requests
        this._syncPendingRequests();

        showSuccessToast('You are back online');
    }

    /**
     * Handle offline event
     * @private
     */
    _handleOffline() {
        this.isOnline = false;
        this._showOnlineStatus();

        showWarningToast('You are offline. Some features may be unavailable.');
    }

    /**
     * Show online status indicator
     * @private
     */
    _showOnlineStatus() {
        let indicator = document.getElementById('online-status-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'online-status-indicator';
            indicator.style.cssText = `
                position: fixed;
                bottom: 20px;
                left: 20px;
                padding: 8px 16px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 600;
                z-index: 9998;
                transition: all 0.3s;
            `;
            document.body.appendChild(indicator);
        }

        if (this.isOnline) {
            indicator.style.background = '#198754';
            indicator.style.color = 'white';
            indicator.innerHTML = '<i class="bi bi-wifi me-1"></i>Online';
        } else {
            indicator.style.background = '#dc3545';
            indicator.style.color = 'white';
            indicator.innerHTML = '<i class="bi bi-wifi-off me-1"></i>Offline';
        }
    }

    /**
     * Queue request for when back online
     */
    queueRequest(endpoint, data) {
        this.pendingRequests.push({ endpoint, data, timestamp: Date.now() });
        StorageUtils.save('offline-pending-requests', this.pendingRequests);
    }

    /**
     * Sync pending requests
     * @private
     */
    async _syncPendingRequests() {
        const stored = StorageUtils.get('offline-pending-requests', []);
        this.pendingRequests = [...this.pendingRequests, ...stored];

        if (this.pendingRequests.length === 0) return;

        showLoadingOverlay();
        const results = { success: 0, failed: 0 };

        for (const request of this.pendingRequests) {
            try {
                const response = await api.call(request.endpoint, request.data);
                if (response.success) results.success++;
                else results.failed++;
            } catch (error) {
                results.failed++;
            }
        }

        this.pendingRequests = [];
        StorageUtils.remove('offline-pending-requests');

        hideLoadingOverlay();

        if (results.success > 0 || results.failed > 0) {
            showInfoToast(`Synced: ${results.success}, Failed: ${results.failed}`);
        }
    }
}

// ============================================================================
// EXPORT
// ============================================================================

if (typeof window !== 'undefined') {
    window.PWAInstallManager = PWAInstallManager;
    window.OfflineManager = OfflineManager;
    window.pwaInstall = new PWAInstallManager();
    window.offlineManager = new OfflineManager();
}


// ============================================================================// FROM: app.js
// ============================================================================

/**
 * Main Application Logic for Strategic Execution Monitoring Application
 * Handles application initialization, view management, routing, and global events
 */

// ============================================================================
// APPLICATION CLASS
// ============================================================================

class Application {
    constructor() {
        this.name = 'Strategic Execution Monitoring';
        this.version = '1.0.0';
        this.currentUser = null;
        this.currentView = 'dashboard';
        this.views = {};
        this.plugins = [];
        this.isInitialized = false;
        this.developmentMode = false;
    }

    // ========================================================================
    // INITIALIZATION
    // ========================================================================

    /**
     * Initialize application
     */
    async init() {
        if (this.isInitialized) return;

        console.log(`[${this.name}] Initializing...`);

        try {
            // Show loading
            const loading = new LoadingOverlay('Initializing application...');
            loading.show();

            // Initialize authentication
            await auth.init();
            this.currentUser = auth.user;

            if (!this.currentUser) {
                console.warn('No user session found');
                loading.hide();
                return;
            }

            // Initialize views
            this._initializeViews();

            // Initialize plugins
            await this._initializePlugins();

            // Setup event listeners
            this._setupEventListeners();

            // Setup global error handler
            this._setupErrorHandler();

            // Register service worker
            await this._registerServiceWorker();

            // Update UI
            updateAuthUI();

            // Load initial view
            const defaultView = StorageUtils.getSession('lastView', 'dashboard');
            this.switchView(defaultView);

            // Mark as initialized
            this.isInitialized = true;

            loading.hide();

            console.log(`[${this.name}] Initialized successfully`);

            // Trigger app ready event
            this._triggerEvent('ready');

        } catch (error) {
            console.error('Application initialization error:', error);
            showErrorToast('Failed to initialize application. Please refresh the page.');
        }
    }

    // ========================================================================
    // VIEW MANAGEMENT
    // ========================================================================

    /**
     * Initialize views
     * @private
     */
    _initializeViews() {
        // Define available views
        this.views = {
            'dashboard': {
                title: 'Dashboard',
                icon: 'speedometer2',
                element: document.getElementById('dashboard-view'),
                onLoad: this._loadDashboard.bind(this)
            },
            'organization': {
                title: 'Organization',
                icon: 'building',
                element: document.getElementById('organization-view'),
                onLoad: this._loadOrganization.bind(this)
            },
            'strategic-plan': {
                title: 'Strategic Planning',
                icon: 'compass',
                element: document.getElementById('strategic-plan-view'),
                onLoad: this._loadStrategicPlan.bind(this)
            },
            'kpi': {
                title: 'KPI Management',
                icon: 'graph-up',
                element: document.getElementById('kpi-view'),
                onLoad: this._loadKPI.bind(this)
            },
            'okr': {
                title: 'Weekly OKRs',
                icon: 'trophy',
                element: document.getElementById('okr-view'),
                onLoad: this._loadOKR.bind(this)
            },
            'programs': {
                title: 'Programs',
                icon: 'diagram-3-fill',
                element: document.getElementById('programs-view'),
                onLoad: this._loadPrograms.bind(this)
            },
            'impact-centers': {
                title: 'Impact Centers',
                icon: 'radar',
                element: document.getElementById('impact-centers-view'),
                onLoad: this._loadImpactCenters.bind(this)
            },
            'reports': {
                title: 'Reports',
                icon: 'file-earmark-bar-graph',
                element: document.getElementById('reports-view'),
                onLoad: this._loadReports.bind(this)
            },
            'users': {
                title: 'User Management',
                icon: 'people',
                element: document.getElementById('users-view'),
                adminOnly: true,
                onLoad: this._loadUsers.bind(this)
            },
            'settings': {
                title: 'Settings',
                icon: 'gear',
                element: document.getElementById('settings-view'),
                onLoad: this._loadSettings.bind(this)
            },
            'ui-test': {
                title: 'UI Tests',
                icon: 'clipboard-check',
                element: document.getElementById('ui-test-view'),
                adminOnly: true,
                onLoad: this._loadUITest.bind(this)
            }
        };
    }

    /**
     * Switch to a view
     * @param {string} viewName - View name
     * @param {HTMLElement} navElement - Navigation element that triggered the switch
     */
    async switchView(viewName, navElement = null) {
        const view = this.views[viewName];
        if (!view) {
            console.error(`View not found: ${viewName}`);
            return;
        }

        // Check admin access
        if (view.adminOnly && !auth.isAdmin()) {
            showToast('You do not have permission to access this page', 'Access Denied');
            return;
        }

        // Hide all views
        document.querySelectorAll('.view-section').forEach(el => {
            el.classList.remove('active');
        });

        // Update navigation active state
        if (navElement) {
            document.querySelectorAll('.nav-link').forEach(el => {
                el.classList.remove('active');
            });
            navElement.classList.add('active');
        } else {
            // Find nav element by view name
            const navLink = document.querySelector(`[onclick*="switchView('${viewName}'"]`);
            if (navLink) {
                document.querySelectorAll('.nav-link').forEach(el => {
                    el.classList.remove('active');
                });
                navLink.classList.add('active');
            }
        }

        // Show selected view
        if (view.element) {
            view.element.classList.add('active');

            // Load view data
            if (view.onLoad) {
                try {
                    await view.onLoad();
                } catch (error) {
                    console.error(`Error loading view ${viewName}:`, error);
                }
            }
        }

        // Update current view
        this.currentView = viewName;

        // Save to session storage
        StorageUtils.saveSession('lastView', viewName);

        // Update page title
        document.title = `${view.title} - ${this.name}`;

        // Trigger view change event
        this._triggerEvent('viewChange', { viewName, view });
    }

    // ========================================================================
    // VIEW LOADERS
    // ========================================================================

    async _loadDashboard() {
        console.log('Loading dashboard...');

        try {
            const response = await api.dashboard.getExecutiveData();
            if (response.success && response.data) {
                this._updateDashboardStats(response.data);
            }
        } catch (error) {
            console.error('Error loading dashboard:', error);
        }
    }

    _updateDashboardStats(data) {
        // Update stat cards
        if (data.stats) {
            this._updateStatCard('stat-total-goals', data.stats.totalGoals);
            this._updateStatCard('stat-active-kpis', data.stats.activeKPIs);
            this._updateStatCard('stat-pending-reviews', data.stats.pendingReviews);
        }
    }

    _updateStatCard(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = value || 0;
        }
    }

    async _loadOrganization() {
        console.log('Loading organization...');
        // Organization view will be loaded by its own script
    }

    async _loadStrategicPlan() {
        console.log('Loading strategic plan...');
        // Strategic plan view will be loaded by its own script
    }

    async _loadKPI() {
        console.log('Loading KPI management...');
        // KPI view will be loaded by its own script
    }

    async _loadOKR() {
        console.log('Loading OKRs...');
        // OKR view will be loaded by its own script
    }

    async _loadPrograms() {
        console.log('Loading programs...');
        // Programs view will be loaded by its own script
    }

    async _loadImpactCenters() {
        console.log('Loading impact centers...');
        // Impact centers view will be loaded by its own script
    }

    async _loadReports() {
        console.log('Loading reports...');
        // Reports view will be loaded by its own script
    }

    async _loadUsers() {
        console.log('Loading user management...');
        // Users view will be loaded by its own script
    }

    async _loadSettings() {
        console.log('Loading settings...');
        // Settings view will be loaded by its own script
    }

    async _loadUITest() {
        console.log('Loading UI tests...');
        // UI test view will be loaded by its own script
    }

    // ========================================================================
    // PLUGIN SYSTEM
    // ========================================================================

    /**
     * Register a plugin
     * @param {object} plugin - Plugin object with init() method
     */
    registerPlugin(plugin) {
        if (typeof plugin.init !== 'function') {
            console.error('Plugin must have an init() method');
            return;
        }

        this.plugins.push(plugin);
        console.log(`Plugin registered: ${plugin.name || 'Unnamed'}`);
    }

    /**
     * Initialize all plugins
     * @private
     */
    async _initializePlugins() {
        for (const plugin of this.plugins) {
            try {
                await plugin.init(this);
                console.log(`Plugin initialized: ${plugin.name || 'Unnamed'}`);
            } catch (error) {
                console.error(`Plugin initialization error (${plugin.name || 'Unnamed'}):`, error);
            }
        }
    }

    // ========================================================================
    // EVENT HANDLERS
    // ========================================================================

    /**
     * Setup global event listeners
     * @private
     */
    _setupEventListeners() {
        // Authentication events
        auth.on('login', (user) => {
            console.log('User logged in:', user);
            this.currentUser = user;
            updateAuthUI();
        });

        auth.on('logout', () => {
            console.log('User logged out');
            this.currentUser = null;
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl+K / Cmd+K for global search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this._showGlobalSearch();
            }

            // Escape to close modals
            if (e.key === 'Escape') {
                const openModal = document.querySelector('.modal.show');
                if (openModal) {
                    bootstrap.Modal.getInstance(openModal)?.hide();
                }
            }
        });

        // Handle online/offline status
        window.addEventListener('online', () => {
            showToast('You are back online', 'Connection Restored');
            this._triggerEvent('online');
        });

        window.addEventListener('offline', () => {
            showWarningToast('You are offline. Some features may be unavailable.');
            this._triggerEvent('offline');
        });

        // Handle visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this._triggerEvent('blur');
            } else {
                this._triggerEvent('focus');
                // Refresh data when tab becomes active again
                this._refreshCurrentView();
            }
        });
    }

    /**
     * Setup global error handler
     * @private
     */
    _setupErrorHandler() {
        window.addEventListener('error', (event) => {
            console.error('Global error:', event.error);
            // Log error to server
            this._logError(event.error);
        });

        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            // Log error to server
            this._logError(event.reason);
        });
    }

    /**
     * Log error to server
     * @private
     */
    async _logError(error) {
        try {
            // Send error details to server for logging
            const errorData = {
                message: error.message || error.toString(),
                stack: error.stack,
                url: window.location.href,
                userAgent: navigator.userAgent,
                timestamp: new Date().toISOString()
            };

            await api.system.getLogs({ error: errorData });
        } catch (e) {
            console.error('Failed to log error:', e);
        }
    }

    // ========================================================================
    // SERVICE WORKER
    // ========================================================================

    /**
     * Register service worker for PWA functionality
     * @private
     */
    async _registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/service-worker.js');
                console.log('Service worker registered:', registration);

                // Listen for updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // New version available
                            this._showUpdateNotification();
                        }
                    });
                });

            } catch (error) {
                console.error('Service worker registration failed:', error);
            }
        }
    }

    /**
     * Show update notification
     * @private
     */
    _showUpdateNotification() {
        const toast = new Toast({
            title: 'Update Available',
            message: 'A new version of the application is available. Click to update.',
            type: 'info',
            duration: 0, // Don't auto dismiss
            closeButton: true
        });

        const toastEl = toast.show();
        toastEl.addEventListener('click', () => {
            window.location.reload();
        });
    }

    // ========================================================================
    // UTILITY METHODS
    // ========================================================================

    /**
     * Show global search
     * @private
     */
    _showGlobalSearch() {
        // TODO: Implement global search modal
        showToast('Global search - Coming soon', 'Info');
    }

    /**
     * Refresh current view data
     * @private
     */
    async _refreshCurrentView() {
        const view = this.views[this.currentView];
        if (view && view.onLoad) {
            try {
                await view.onLoad();
            } catch (error) {
                console.error('Error refreshing view:', error);
            }
        }
    }

    /**
     * Trigger application event
     * @private
     */
    _triggerEvent(eventName, data = null) {
        const event = new CustomEvent(`app:${eventName}`, {
            detail: data
        });
        window.dispatchEvent(event);
    }

    /**
     * Add event listener
     * @param {string} eventName - Event name
     * @param {function} callback - Event callback
     */
    on(eventName, callback) {
        window.addEventListener(`app:${eventName}`, callback);
    }

    /**
     * Remove event listener
     * @param {string} eventName - Event name
     * @param {function} callback - Event callback
     */
    off(eventName, callback) {
        window.removeEventListener(`app:${eventName}`, callback);
    }
}

// ============================================================================
// CREATE GLOBAL APPLICATION INSTANCE
// ============================================================================

const app = new Application();

// Make available globally
if (typeof window !== 'undefined') {
    window.Application = Application;
    window.app = app;
}

// ============================================================================
// VIEW SWITCHING HELPER (for backward compatibility)
// ============================================================================

/**
 * Switch view helper function
 * Used by onclick attributes in navigation
 * @param {string} viewName - View name
 * @param {HTMLElement} navElement - Navigation element
 */
function switchView(viewName, navElement) {
    app.switchView(viewName, navElement);
}

// ============================================================================
// APPLICATION INITIALIZATION
// ============================================================================

/**
 * Initialize application when DOM is ready
 */
document.addEventListener('DOMContentLoaded', async () => {
    // Check if we should use development mode
    const devMode = StorageUtils.getSession('developmentMode', false);
    app.developmentMode = devMode;

    // Initialize application
    await app.init();
});

/**
 * Initialize application on window load (fallback)
 */
window.onload = async function() {
    if (!app.isInitialized) {
        await app.init();
    }
};

