/**
 * RouteRegistry.gs
 * Central registry mapping API resources to their route handlers
 */

var RouteRegistry = {
  /**
   * Map of resource names to their routing functions
   * Each routing function should accept: action, data, userId
   * and return a response object
   */
  routes: {
    // Dashboard
    'dashboard': DashboardRoutes.routeDashboard,

    // Authentication
    'auth': AuthRoutes.route,

    // Users and Roles
    'users': UserRoutes.routeUsers,
    'roles': UserRoutes.routeRoles,

    // Organization
    'directorates': OrganizationRoutes.routeDirectorates,
    'work-units': OrganizationRoutes.routeWorkUnits,
    'workUnits': OrganizationRoutes.routeWorkUnits,
    'affairs': OrganizationRoutes.routeAffairs,
    'positions': OrganizationRoutes.routePositions,

    // Strategic
    'okrs': StrategicRoutes.routeOKRs,
    'okr': StrategicRoutes.routeOKRs,
    'kpis': StrategicRoutes.routeKPIs,
    'kpi': StrategicRoutes.routeKPIs,
    'strategic': StrategicRoutes.routeStrategic,
    'swot': StrategicRoutes.routeSWOT,

    // Programs
    'programs': StrategicRoutes.routePrograms,
    'activities': StrategicRoutes.routeActivities,

    // System
    'notifications': SystemRoutes.routeNotifications,
    'revisions': SystemRoutes.routeRevisions,
    'audit': SystemRoutes.routeRevisions,
    'settings': SystemRoutes.routeSettings,
    'page': SystemRoutes.routePage
  },

  /**
   * Get the routing function for a resource
   * @param {string} resource - Resource name
   * @returns {Function|null} Routing function or null if not found
   */
  getRoute: function(resource) {
    return this.routes[resource] || null;
  },

  /**
   * Check if a resource has a registered route
   * @param {string} resource - Resource name
   * @returns {boolean} True if route exists
   */
  hasRoute: function(resource) {
    return resource in this.routes;
  },

  /**
   * Get all registered resources
   * @returns {Array} Array of resource names
   */
  getAllResources: function() {
    return Object.keys(this.routes);
  }
};
