/**
 * Router.gs
 * Main router that dispatches API requests to appropriate route handlers
 */

var Router = {
  /**
   * Parse endpoint into resource and action
   * @param {string} endpoint - API endpoint (format: "resource/action" or "resource")
   * @returns {Object} Parsed resource and action
   */
  parseEndpoint: function(endpoint) {
    const parts = endpoint.split('/');
    return {
      resource: parts[0],      // e.g., 'dashboard', 'users'
      action: parts[1] || 'list'  // e.g., 'quick-stats', 'list'
    };
  },

  /**
   * Route an API request to the appropriate handler
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request data
   * @param {string} userId - Current user ID
   * @returns {Object} Response object
   */
  route: function(endpoint, data, userId) {
    // Parse endpoint
    const parsed = this.parseEndpoint(endpoint);
    const resource = parsed.resource;
    const action = parsed.action;

    // Log the routing
    Logger.log('Router: resource=' + resource + ', action=' + action + ', user=' + userId);

    // Get route handler from registry
    const routeHandler = RouteRegistry.getRoute(resource);

    if (!routeHandler) {
      Logger.log('Router: Unknown resource - ' + resource);
      return {
        success: false,
        message: 'Unknown resource: ' + resource
      };
    }

    // Call route handler
    try {
      return routeHandler(action, data, userId);
    } catch (error) {
      Logger.log('Router: Error in route handler - ' + error.message);
      Logger.log('Stack: ' + error.stack);
      return {
        success: false,
        message: 'Error processing request: ' + error.message,
        error: error.toString()
      };
    }
  },

  /**
   * Validate endpoint format
   * @param {string} endpoint - API endpoint
   * @returns {boolean} True if valid
   */
  isValidEndpoint: function(endpoint) {
    if (!endpoint || typeof endpoint !== 'string') {
      return false;
    }

    const parts = endpoint.split('/');
    return parts.length > 0 && parts.length <= 2;
  },

  /**
   * Get all available endpoints
   * @returns {Array} Array of available resources
   */
  getAvailableEndpoints: function() {
    return RouteRegistry.getAllResources();
  }
};
