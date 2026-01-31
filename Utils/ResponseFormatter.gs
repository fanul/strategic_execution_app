/**
 * Utils/ResponseFormatter.js
 * Standardized response formatting for all API endpoints.
 */

/**
 * Format a successful response
 * @param {Object} data - Response data
 * @param {string} message - Success message
 * @returns {Object} Formatted response object
 */
function formatSuccess(data, message) {
  const response = {
    success: true,
    message: message || 'Success'
  };

  if (data !== null && data !== undefined) {
    response.data = data;
  }

  return response;
}

/**
 * Format an error response
 * @param {string} message - Error message
 * @param {Error|Object|string} error - Optional error details
 * @returns {Object} Formatted error response object
 */
function formatError(message, error) {
  const response = {
    success: false,
    message: message || 'An error occurred'
  };

  if (error) {
    if (error instanceof Error) {
      response.error = {
        name: error.name,
        message: error.message,
        stack: error.stack
      };
    } else if (typeof error === 'string') {
      response.error = { message: error };
    } else if (typeof error === 'object') {
      response.error = error;
    } else {
      response.error = String(error);
    }
  }

  return response;
}

/**
 * Format a validation error response
 * @param {Object} errors - Object containing field errors {fieldName: errorMessage}
 * @returns {Object} Formatted validation error response
 */
function formatValidationError(errors) {
  return {
    success: false,
    message: 'Validation failed',
    errors: errors || {}
  };
}

/**
 * Format a paginated response
 * @param {Array} data - Array of data items
 * @param {number} total - Total count of items
 * @param {number} page - Current page number
 * @param {number} pageSize - Number of items per page
 * @returns {Object} Formatted paginated response
 */
function formatPaginatedResponse(data, total, page, pageSize) {
  return {
    success: true,
    data: data,
    pagination: {
      total: total,
      page: page,
      pageSize: pageSize,
      totalPages: Math.ceil(total / pageSize),
      hasMore: (page * pageSize) < total
    }
  };
}

/**
 * Format a not found response
 * @param {string} resource - Resource type that was not found
 * @param {string} id - ID that was not found
 * @returns {Object} Formatted not found response
 */
function formatNotFound(resource, id) {
  return {
    success: false,
    message: `${resource} with ID '${id}' not found`,
    error: {
      type: 'NOT_FOUND',
      resource: resource,
      id: id
    }
  };
}

/**
 * Format an unauthorized response
 * @param {string} message - Optional custom message
 * @returns {Object} Formatted unauthorized response
 */
function formatUnauthorized(message) {
  return {
    success: false,
    message: message || 'Unauthorized access',
    error: {
      type: 'UNAUTHORIZED',
      code: 401
    }
  };
}

/**
 * Format a forbidden response
 * @param {string} message - Optional custom message
 * @returns {Object} Formatted forbidden response
 */
function formatForbidden(message) {
  return {
    success: false,
    message: message || 'Access forbidden',
    error: {
      type: 'FORBIDDEN',
      code: 403
    }
  };
}

/**
 * Format a conflict response (e.g., duplicate entry)
 * @param {string} message - Conflict message
 * @param {string} field - Field that caused the conflict
 * @returns {Object} Formatted conflict response
 */
function formatConflict(message, field) {
  return {
    success: false,
    message: message || 'Resource conflict',
    error: {
      type: 'CONFLICT',
      code: 409,
      field: field
    }
  };
}

/**
 * Format a bulk operation response
 * @param {number} successCount - Number of successful operations
 * @param {number} failureCount - Number of failed operations
 * @param {Array} errors - Array of error messages
 * @returns {Object} Formatted bulk operation response
 */
function formatBulkResponse(successCount, failureCount, errors) {
  return {
    success: true,
    data: {
      successCount: successCount,
      failureCount: failureCount,
      totalCount: successCount + failureCount,
      errors: errors || []
    },
    message: `Bulk operation completed: ${successCount} succeeded, ${failureCount} failed`
  };
}
