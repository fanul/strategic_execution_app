/**
 * AuthRoutes.gs
 * Authentication and authorization API routes
 */

var AuthRoutes = {
  /**
   * Route authentication requests
   * @param {string} action - Action to perform (login, logout, getCurrentUser, changePassword)
   * @param {Object} data - Request data
   * @param {string} userId - Current user ID
   * @returns {Object} Response object
   */
  route: function(action, data, userId) {
    switch (action) {
      case 'login':
        return login(data.username || data.usernameOrEmail, data.password);

      case 'logout':
        return logout(data.sessionToken);

      case 'getCurrentUser':
      case 'get-current-user':
        return { success: true, data: getCurrentUser(data.sessionToken) };

      case 'changePassword':
      case 'change-password':
        return changePassword(data.sessionToken, data.oldPassword, data.newPassword);

      default:
        return { success: false, message: 'Unknown auth action: ' + action };
    }
  }
};
