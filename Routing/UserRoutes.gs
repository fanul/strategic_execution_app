/**
 * UserRoutes.gs
 * User and role management API routes
 */

var UserRoutes = {
  /**
   * Route user requests
   * @param {string} action - Action to perform
   * @param {Object} data - Request data
   * @param {string} userId - Current user ID
   * @returns {Object} Response object
   */
  routeUsers: function(action, data, userId) {
    const id = data.userId || data.user_id || data.id;

    switch (action) {
      case 'list':
        return UserController.getAll(data);

      case 'get':
        return UserController.getById(id);

      case 'create':
        return UserController.create(data, userId);

      case 'update':
        return UserController.update(id, data, userId);

      case 'delete':
        return UserController.delete(id, userId);

      case 'changePassword':
      case 'change-password':
        return UserController.changePassword(id, data.oldPassword, data.newPassword, userId);

      default:
        return { success: false, message: 'Unknown users action: ' + action };
    }
  },

  /**
   * Route role requests
   * @param {string} action - Action to perform
   * @param {Object} data - Request data
   * @param {string} userId - Current user ID
   * @returns {Object} Response object
   */
  routeRoles: function(action, data, userId) {
    const id = data.roleId || data.role_id || data.id;

    switch (action) {
      case 'list':
        return RoleController.getAll();

      case 'get':
        return RoleController.getById(id);

      case 'create':
        return RoleController.create(data, userId);

      case 'update':
        return RoleController.update(id, data, userId);

      case 'delete':
        return RoleController.delete(id, userId);

      default:
        return { success: false, message: 'Unknown roles action: ' + action };
    }
  }
};
