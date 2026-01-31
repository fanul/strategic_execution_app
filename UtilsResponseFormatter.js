/**
 * UtilsResponseFormatter.js
 * Standardizes API responses across the application.
 */

/**
 * Format a successful response
 * @param {any} data - The data to return
 * @param {string} message - Success message
 * @returns {Object} Standardized response object
 */
function formatSuccess(data, message = 'Operation completed successfully') {
  return {
    success: true,
    data: data,
    message: message,
    error: null,
    timestamp: new Date().toISOString()
  };
}

/**
 * Format an error response
 * @param {string} message - Error message
 * @param {Error|string} error - Error object or string
 * @param {any} data - Optional partial data
 * @returns {Object} Standardized error response
 */
function formatError(message, error = null, data = null) {
  return {
    success: false,
    data: data,
    message: message,
    error: error ? (error.toString ? error.toString() : error) : null,
    timestamp: new Date().toISOString()
  };
}

/**
 * Format a validation error response
 * @param {Object} validationErrors - Object with field: error message pairs
 * @returns {Object} Standardized validation error response
 */
function formatValidationError(validationErrors) {
  return {
    success: false,
    data: null,
    message: 'Validation failed',
    error: {
      type: 'VALIDATION_ERROR',
      fields: validationErrors
    },
    timestamp: new Date().toISOString()
  };
}

/**
 * Format a paginated response
 * @param {Array} items - Array of items for current page
 * @param {number} page - Current page number (1-indexed)
 * @param {number} pageSize - Items per page
 * @param {number} totalItems - Total number of items
 * @param {string} message - Optional message
 * @returns {Object} Standardized paginated response
 */
function formatPaginatedResponse(items, page, pageSize, totalItems, message = 'Data retrieved successfully') {
  return {
    success: true,
    data: {
      items: items,
      pagination: {
        page: page,
        pageSize: pageSize,
        totalItems: totalItems,
        totalPages: Math.ceil(totalItems / pageSize),
        hasNext: page < Math.ceil(totalItems / pageSize),
        hasPrevious: page > 1
      }
    },
    message: message,
    error: null,
    timestamp: new Date().toISOString()
  };
}

/**
 * Wrap a function with standardized error handling
 * @param {Function} fn - Function to wrap
 * @param {string} errorMessage - Error message prefix
 * @returns {Function} Wrapped function
 */
function withErrorHandling(fn, errorMessage = 'An error occurred') {
  return function(...args) {
    try {
      const result = fn.apply(this, args);
      return result;
    } catch (error) {
      console.error(`${errorMessage}:`, error);
      return formatError(errorMessage, error);
    }
  };
}
