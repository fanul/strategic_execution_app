/**
 * API.gs
 * Refactored API routing using the Router system
 * Version: 3.0.0 - Fully modularized
 */

// ============================================================================
// RATE LIMITING
// ============================================================================

const RATE_LIMIT = {
  MAX_REQUESTS: 100, // Max requests per window
  WINDOW_SECONDS: 60 // Time window in seconds
};

/**
 * Check rate limit for a session
 * @param {string} sessionToken - Session token
 * @returns {Object} Rate limit check result
 */
function checkRateLimit(sessionToken) {
  const cache = CacheService.getScriptCache();
  const key = 'rate_limit_' + sessionToken;
  const current = cache.get(key);

  if (!current) {
    cache.put(key, '1', RATE_LIMIT.WINDOW_SECONDS);
    return { allowed: true };
  }

  const count = parseInt(current);
  if (count >= RATE_LIMIT.MAX_REQUESTS) {
    return { allowed: false, count: count };
  }

  cache.put(key, String(count + 1), RATE_LIMIT.WINDOW_SECONDS);
  return { allowed: true, count: count + 1 };
}

/**
 * HTTP POST handler - Main API endpoint
 * @param {Object} e - Event parameter with postData
 * @returns {GoogleAppsScript.Content.TextOutput} JSON response
 */
function doPost(e) {
  try {
    // Parse request
    const requestBody = JSON.parse(e.postData.contents);
    const action = requestBody.action;
    const data = requestBody.data || {};
    const sessionToken = requestBody.sessionToken || null;

    Logger.log('API Call: ' + action);

    // Check rate limit
    if (sessionToken) {
      const rateLimitResult = checkRateLimit(sessionToken);
      if (!rateLimitResult.allowed) {
        return jsonResponse({
          success: false,
          message: 'Rate limit exceeded. Please try again later.'
        });
      }
    }

    // Convert action to endpoint format
    // Actions can be: "resource.action" or "resource-sub-resource.action"
    // We need to normalize them to "resource/action"
    const endpoint = normalizeActionToEndpoint(action);

    // Get current user ID for routing
    let userId;
    try {
      const user = getCurrentUser(sessionToken);
      userId = user ? user.user_id : Session.getActiveUser().getEmail();
    } catch (e) {
      userId = Session.getActiveUser().getEmail();
    }

    // Add userId to data for controllers that need it
    data._userId = userId;
    data._sessionToken = sessionToken;

    // Route using the Router system
    const response = Router.route(endpoint, data, userId);

    // Return response
    return jsonResponse(response);

  } catch (error) {
    Logger.log('API Error: ' + error.toString());
    Logger.log('Stack: ' + error.stack);
    return jsonResponse({
      success: false,
      message: 'API Error: ' + error.message,
      error: error.toString()
    });
  }
}

/**
 * Normalize action string to endpoint format
 * Handles various action formats:
 * - "auth.login" → "auth/login"
 * - "users.list" → "users/list"
 * - "page.get" → "page/get"
 * - "workUnits.list" → "work-units/list" (normalize dashes)
 *
 * @param {string} action - Action string
 * @returns {string} Normalized endpoint
 */
function normalizeActionToEndpoint(action) {
  if (!action) return '';

  // Replace dots with slashes
  let endpoint = action.replace(/\./g, '/');

  // Normalize camelCase to kebab-case for resource names
  // workUnits → work-units
  endpoint = endpoint.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();

  return endpoint;
}

/**
 * Format response as JSON
 * @param {Object} data - Response data
 * @returns {GoogleAppsScript.Content.TextOutput} JSON output
 */
function jsonResponse(data) {
  try {
    // Clean response for serialization
    const jsonString = JSON.stringify(data);
    const cleanData = JSON.parse(jsonString);
    return ContentService
      .createTextOutput(JSON.stringify(cleanData))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    Logger.log('JSON serialization error: ' + error.toString());
    // Return minimal error response
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        message: 'Response serialization error'
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ============================================================================
// LEGACY SUPPORT - Deprecated functions
// These are kept for backward compatibility but should not be used
// ============================================================================

/**
 * @deprecated Use Router.route() instead
 * This function is kept for backward compatibility only
 */
function legacyRoute(action, data, sessionToken) {
  Logger.log('WARNING: Using legacy routing for: ' + action);
  const endpoint = normalizeActionToEndpoint(action);
  let userId = Session.getActiveUser().getEmail();
  try {
    const user = getCurrentUser(sessionToken);
    if (user) userId = user.user_id;
  } catch (e) {}
  return Router.route(endpoint, data, userId);
}
