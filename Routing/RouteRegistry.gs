/**
 * RouteRegistry.gs
 * Central registry mapping API resources to their route handlers
 *
 * Uses lazy loading to ensure route modules are loaded when needed
 */

var RouteRegistry = {
  /**
   * Map of resource names to their route definitions
   * Stored as objects to allow lazy loading
   */
  routeDefinitions: {
    // Dashboard
    'dashboard': { module: 'DashboardRoutes', handler: 'routeDashboard' },

    // Authentication
    'auth': { module: 'AuthRoutes', handler: 'route' },

    // Users and Roles
    'users': { module: 'UserRoutes', handler: 'routeUsers' },
    'roles': { module: 'UserRoutes', handler: 'routeRoles' },

    // Organization
    'directorates': { module: 'OrganizationRoutes', handler: 'routeDirectorates' },
    'work-units': { module: 'OrganizationRoutes', handler: 'routeWorkUnits' },
    'workUnits': { module: 'OrganizationRoutes', handler: 'routeWorkUnits' },
    'affairs': { module: 'OrganizationRoutes', handler: 'routeAffairs' },
    'positions': { module: 'OrganizationRoutes', handler: 'routePositions' },

    // Strategic
    'okrs': { module: 'StrategicRoutes', handler: 'routeOKRs' },
    'okr': { module: 'StrategicRoutes', handler: 'routeOKRs' },
    'kpis': { module: 'StrategicRoutes', handler: 'routeKPIs' },
    'kpi': { module: 'StrategicRoutes', handler: 'routeKPIs' },
    'strategic': { module: 'StrategicRoutes', handler: 'routeStrategic' },
    'swot': { module: 'StrategicRoutes', handler: 'routeSWOT' },

    // Programs
    'programs': { module: 'StrategicRoutes', handler: 'routePrograms' },
    'activities': { module: 'StrategicRoutes', handler: 'routeActivities' },

    // System
    'notifications': { module: 'SystemRoutes', handler: 'routeNotifications' },
    'revisions': { module: 'SystemRoutes', handler: 'routeRevisions' },
    'audit': { module: 'SystemRoutes', handler: 'routeRevisions' },
    'settings': { module: 'SystemRoutes', handler: 'routeSettings' },
    'page': { module: 'SystemRoutes', handler: 'routePage' }
  },

  /**
   * Cache for loaded route handlers
   */
  routeCache: {},

  /**
   * Get the routing function for a resource (with lazy loading)
   * @param {string} resource - Resource name
   * @returns {Function|null} Routing function or null if not found
   */
  getRoute: function(resource) {
    // Check cache first
    if (this.routeCache[resource]) {
      return this.routeCache[resource];
    }

    // Get route definition
    const definition = this.routeDefinitions[resource];
    if (!definition) {
      Logger.log('RouteRegistry: Unknown resource - ' + resource);
      return null;
    }

    // Lazy load the route handler
    try {
      // Access the module to trigger loading
      const routeModule = eval(definition.module);

      if (!routeModule) {
        Logger.log('RouteRegistry: Module not found - ' + definition.module);
        return null;
      }

      // Get the handler function
      const handler = routeModule[definition.handler];

      if (!handler) {
        Logger.log('RouteRegistry: Handler not found - ' + definition.module + '.' + definition.handler);
        return null;
      }

      // Cache it
      this.routeCache[resource] = handler;

      Logger.log('RouteRegistry: Loaded route - ' + resource + ' -> ' + definition.module + '.' + definition.handler);
      return handler;

    } catch (error) {
      Logger.log('RouteRegistry: Error loading route - ' + resource);
      Logger.log('Error: ' + error.toString());
      return null;
    }
  },

  /**
   * Check if a resource has a registered route
   * @param {string} resource - Resource name
   * @returns {boolean} True if route exists
   */
  hasRoute: function(resource) {
    return resource in this.routeDefinitions;
  },

  /**
   * Get all registered resources
   * @returns {Array} Array of resource names
   */
  getAllResources: function() {
    return Object.keys(this.routeDefinitions);
  }
};
