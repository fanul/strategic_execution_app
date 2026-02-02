/**
 * DashboardRoutes.gs
 * Dashboard and reports API routes
 */

var DashboardRoutes = {
  /**
   * Route dashboard requests
   * @param {string} action - Action to perform
   * @param {Object} data - Request data
   * @param {string} userId - Current user ID
   * @returns {Object} Response object
   */
  routeDashboard: function(action, data, userId) {
    switch (action) {
      case 'quick-stats':
        return DashboardController.getData(Session.getActiveUser().getEmail());

      case 'kpi-by-perspective':
        return DashboardController.getKPIData(data);

      case 'goal-chart':
      case 'goals-progress':
        return DashboardController.getGoalsProgress(data);

      case 'top-work-units':
        return { success: true, data: { workUnits: [] } }; // Placeholder

      case 'impact-centers-status':
        return DashboardController.getImpactCenterData(data);

      case 'recent-activities':
        return DashboardController.getRecentActivities(10);

      case 'upcoming-deadlines':
        return { success: true, data: { deadlines: [] } }; // Placeholder

      default:
        return { success: false, message: 'Unknown dashboard action: ' + action };
    }
  }
};
