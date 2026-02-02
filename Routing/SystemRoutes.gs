/**
 * SystemRoutes.gs
 * System-level API routes (Database, Notifications, Audit/Revisions, Settings, Pages)
 */

var SystemRoutes = {
  /**
   * Route database operations
   * @param {string} action - Action to perform
   * @param {Object} data - Request data
   * @param {string} userId - Current user ID
   * @returns {Object} Response object
   */
  routeDatabase: function(action, data, userId) {
    switch (action) {
      case 'initialize':
        return initializeDatabase();

      case 'getStats':
      case 'get-stats':
        return getDatabaseStats();

      case 'generateSheets':
      case 'generate-sheets':
        requirePermission(data._sessionToken, 'settings', 'update');
        return generateGoogleSheets(data.sheetName, data.data);

      case 'moveToFolder':
      case 'move-to-folder':
        requirePermission(data._sessionToken, 'settings', 'update');
        return moveSheetToFolder(data.spreadsheetId, data.folderId);

      default:
        return { success: false, message: 'Unknown database action: ' + action };
    }
  },
  /**
   * Route notification requests
   * @param {string} action - Action to perform
   * @param {Object} data - Request data
   * @param {string} userId - Current user ID
   * @returns {Object} Response object
   */
  routeNotifications: function(action, data, userId) {
    const id = data.notificationId || data.notification_id || data.id;

    switch (action) {
      case 'get':
      case 'list':
        return NotificationService.getUserNotifications(userId, data.unreadOnly || data.unread_only || false);

      case 'markAsRead':
      case 'mark-as-read':
        return NotificationService.markAsRead(id);

      case 'markAllAsRead':
      case 'mark-all-read':
        return NotificationService.markAllAsRead(userId);

      default:
        return { success: false, message: 'Unknown notifications action: ' + action };
    }
  },

  /**
   * Route revision/audit requests
   * @param {string} action - Action to perform
   * @param {Object} data - Request data
   * @param {string} userId - Current user ID
   * @returns {Object} Response object
   */
  routeRevisions: function(action, data, userId) {
    const id = data.revisionId || data.revision_id || data.id;
    const entityType = data.entityType || data.entity_type;
    const entityId = data.entityId || data.entity_id;

    switch (action) {
      case 'getHistory':
      case 'get-history':
        return getRevisionHistory(entityType, entityId, data.limit || 50);

      case 'restore':
        return restoreRevision(id, userId, data.reason || '');

      case 'statistics':
      case 'get-statistics':
        return getRevisionStatistics(data.filters || {});

      default:
        return { success: false, message: 'Unknown revisions action: ' + action };
    }
  },

  /**
   * Route settings requests
   * @param {string} action - Action to perform
   * @param {Object} data - Request data
   * @param {string} userId - Current user ID
   * @returns {Object} Response object
   */
  routeSettings: function(action, data, userId) {
    switch (action) {
      case 'get':
        return { success: true, data: {} }; // Placeholder

      case 'save':
        return { success: true, message: 'Settings saved successfully' }; // Placeholder

      default:
        return { success: false, message: 'Unknown settings action: ' + action };
    }
  },

  /**
   * Route page requests (for AJAX navigation)
   * @param {string} action - Action to perform
   * @param {Object} data - Request data
   * @param {string} userId - Current user ID
   * @returns {Object} Response object
   */
  routePage: function(action, data, userId) {
    if (action === 'get') {
      const pageName = data.page || 'dashboard';

      if (!PagesConfig.isValidPage(pageName)) {
        return { success: false, message: 'Invalid page: ' + pageName };
      }

      const dataTemplate = {
        WEB_APP_URL: ScriptApp.getService().getUrl(),
        PAGE_NAME: pageName
      };

      const content = renderTemplate('pages/' + pageName + '.html', dataTemplate);
      const modals = PagesConfig.getPageModals(pageName, dataTemplate);
      const scripts = PagesConfig.getPageScripts(pageName, dataTemplate);

      return {
        success: true,
        data: {
          content: content,
          modals: modals,
          scripts: scripts,
          page: pageName
        }
      };
    }

    return { success: false, message: 'Unknown page action: ' + action };
  }
};
