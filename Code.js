/**
 * Code.gs - Refactored
 * Main entry point for the Web App and API routing.
 * Now uses PagesConfig service for clean, maintainable page management.
 */

/**
 * Helper function to render HTML templates with data
 * @param {string} filename - HTML file name
 * @param {Object} data - Data to pass to template
 * @returns {string} Rendered HTML
 */
function renderTemplate(filename, data) {
  try {
    const template = HtmlService.createTemplateFromFile(filename);
    // Copy all data properties to template
    if (data) {
      Object.keys(data).forEach(function(key) {
        template[key] = data[key];
      });
    }
    return template.evaluate().getContent();
  } catch (error) {
    Logger.log('Error rendering template ' + filename + ': ' + error.toString());
    return '<div class="alert alert-danger">Error loading: ' + filename + '</div>';
  }
}

/**
 * Serves the HTML file for the web app.
 * @param {Object} e - Event parameter.
 * @returns {GoogleAppsScript.HTML.HtmlOutput} The rendered HTML.
 */
function doGet(e) {
  try {
    // Check if requesting a static file
    const path = e && e.parameter && e.parameter.path;
    if (path) {
      return serveStaticFile(path);
    }

    // Get page name from URL parameter, default to 'dashboard'
    const pageName = e && e.parameter && e.parameter.page ? e.parameter.page : 'dashboard';

    // Validate page name (security) - using PagesConfig
    if (!PagesConfig.isValidPage(pageName)) {
      return HtmlService.createHtmlOutput('Invalid page: ' + pageName)
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    }

    const dataTemplate = {
      WEB_APP_URL : ScriptApp.getService().getUrl(),
      URL_PARAMETERS : e && e.parameter ? e.parameter : {},
      PAGE_NAME : pageName
    };

    // Create main template and pass data
    const template = HtmlService.createTemplateFromFile('Index');

    // Common templates (loaded for all pages)
    template.headerTitle = renderTemplate('headerTitle.html', dataTemplate);
    template.linkReel = renderTemplate('linkReel.html', dataTemplate);
    template.minimalStyle = renderTemplate('minimalStyle.html', dataTemplate);
    template.loading_overlay = renderTemplate('layout/loading_overlay.html', dataTemplate);
    template.sidebar = renderTemplate('layout/sidebar.html', dataTemplate);
    template.debug_panel_script = renderTemplate('assets/js/debug_panel_script.html', dataTemplate);
    template.toasts = renderTemplate('layout/toasts.html', dataTemplate);

    // Page-specific content
    template.pageContent = renderTemplate('pages/' + pageName + '.html', dataTemplate);

    // Page-specific modals (using PagesConfig)
    template.pageModals = PagesConfig.getPageModals(pageName, dataTemplate);
    template.modals = ''; // No global modals

    // Page-specific scripts (using PagesConfig)
    template.pageScripts = PagesConfig.getPageScripts(pageName, dataTemplate);

    // Common scripts (loaded for AJAX navigation)
    template.api_helper = renderTemplate('assets/js/api_helper.html', dataTemplate);
    template.ui_helpers = renderTemplate('assets/js/ui_helpers.html', dataTemplate);
    template.modal_scripts = renderTemplate('assets/js/modals.html', dataTemplate);
    template.settings_manager = renderTemplate('assets/js/settings_manager.html', dataTemplate);
    template.ajax_loader = renderTemplate('assets/js/ajax_loader.html', dataTemplate);
    template.router = renderTemplate('assets/js/router.html', dataTemplate);

    // Render and return
    const output = template.evaluate();
    output.setTitle('Strategic Execution Monitoring - ' + pageName);
    output.addMetaTag('viewport', 'width=device-width, initial-scale=1');
    output.setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);

    return output;

  } catch (error) {
    Logger.log('Error in doGet: ' + error.message);
    Logger.log('Stack: ' + error.stack);

    // Return error page
    return HtmlService.createHtmlOutput(
      '<div class="container mt-5">' +
      '<h1 class="text-danger">Error Loading Application</h1>' +
      '<p>' + error.message + '</p>' +
      '<pre>' + error.stack + '</pre>' +
      '</div>'
    ).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }
}

/**
 * Serves static files (CSS, JS, JSON, etc.)
 * @param {string} path - File path relative to project root
 * @returns {GoogleAppsScript.HTML.HtmlOutput} The file content with proper content type
 */
function serveStaticFile(path) {
  try {
    // Map URL paths to file names
    const fileMap = {
      '/assets/css/custom.css': 'assets/css/custom.css',
      '/manifest.json': 'manifest.json',
      '/service-worker.js': 'service-worker.js'
    };

    let fileName = fileMap[path];

    // If not in fileMap, check if it's an assets/js or assets file
    if (!fileName && path.indexOf('/assets/') === 0) {
      fileName = path.substring(1);
    }

    if (!fileName) {
      return HtmlService.createHtmlOutput('File not found: ' + path)
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    }

    // For CSS, JS, JSON - serve as raw content with proper MIME type
    const extension = path.split('.').pop();
    if (extension === 'css') {
      const blob = HtmlService.createBlobOutput().setFileName(fileName).setContentType(ContentType.CSS);
      return HtmlService.createHtmlOutput(blob.getContent())
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    } else if (extension === 'js') {
      const blob = HtmlService.createBlobOutput().setFileName(fileName).setContentType(ContentType.JS);
      return HtmlService.createHtmlOutput(blob.getContent())
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    } else if (extension === 'json') {
      const blob = HtmlService.createBlobOutput().setFileName(fileName).setContentType(ContentType.JSON);
      return HtmlService.createHtmlOutput(blob.getContent())
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    } else {
      // For HTML files (including assets/js/*.html files), use template
      return HtmlService.createTemplateFromFile(fileName)
        .evaluate()
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    }
  } catch (error) {
    Logger.log('Error serving static file ' + path + ': ' + error.toString());
    return HtmlService.createHtmlOutput('Error loading file: ' + error.toString())
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }
}

/**
 * Helper function to include partial HTML files (CSS/JS).
 * @param {string} filename - The name of the file to include.
 * @returns {string} The content of the file.
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * API function to get initial dashboard data.
 */
function getDashboardData() {
  try {
    // Call DashboardController to get actual data
    return DashboardController.getData();
  } catch (error) {
    Logger.log('Error getting dashboard data: ' + error.message);
    // Return default structure if error occurs
    return {
      success: true,
      stats: {
        totalGoals: 0,
        activeKPIs: 0,
        pendingReviews: 0,
        performanceScore: 0
      },
      recentActivity: []
    };
  }
}

/**
 * Debug log function for frontend debugging
 * @param {string} message - Debug message
 * @param {Object} data - Optional data to log
 */
function debugLog(message, data) {
  Logger.log('[DEBUG] ' + message + (data ? ' | Data: ' + JSON.stringify(data) : ''));
}

/**
 * Unified API routing function
 * Allows frontend to call backend controllers via a single entry point
 * @param {string} endpoint - API endpoint in format "resource/action"
 * @param {Object} data - Request data
 * @returns {Object} Response object with success, data, message properties
 */
function callAPI(endpoint, data) {
  const startTime = Date.now();
  Logger.log('='.repeat(60));
  Logger.log('API CALL START: ' + endpoint);
  Logger.log('API DATA: ' + JSON.stringify(data));

  try {
    let response = { success: false, message: 'Unknown endpoint: ' + endpoint };

    // Parse endpoint (format: "resource/action" or just "resource")
    const parts = endpoint.split('/');
    const resource = parts[0];  // e.g., 'dashboard', 'users', 'settings'
    const action = parts[1] || 'list';  // e.g., 'quick-stats', 'list', 'get'

    // Get current user ID from data or session
    const userId = data.userId || data.user_id || Session.getActiveUser().getEmail();

    Logger.log('Resource: ' + resource + ', Action: ' + action + ', User: ' + userId);

    // Route to appropriate controller based on resource
    switch (resource) {

      // ========================================================================
      // DASHBOARD
      // ========================================================================
      case 'dashboard':
        switch (action) {
          case 'quick-stats':
            response = DashboardController.getData(Session.getActiveUser().getEmail());
            break;
          case 'kpi-by-perspective':
            response = DashboardController.getKPIData(data);
            break;
          case 'goal-chart':
          case 'goals-progress':
            response = DashboardController.getGoalsProgress(data);
            break;
          case 'top-work-units':
            response = { success: true, data: { workUnits: [] } }; // Placeholder
            break;
          case 'impact-centers-status':
            response = DashboardController.getImpactCenterData(data);
            break;
          case 'recent-activities':
            response = DashboardController.getRecentActivities(10);
            break;
          case 'upcoming-deadlines':
            response = { success: true, data: { deadlines: [] } }; // Placeholder
            break;
          default:
            response = { success: false, message: 'Unknown dashboard action: ' + action };
        }
        break;

      // ========================================================================
      // AUTHENTICATION
      // ========================================================================
      case 'auth':
        switch (action) {
          case 'login':
            response = login(data.username || data.usernameOrEmail, data.password);
            break;
          case 'logout':
            response = logout(data.sessionToken);
            break;
          case 'getCurrentUser':
          case 'get-current-user':
            response = { success: true, data: getCurrentUser(data.sessionToken) };
            break;
          case 'changePassword':
          case 'change-password':
            response = changePassword(data.sessionToken, data.oldPassword, data.newPassword);
            break;
          default:
            response = { success: false, message: 'Unknown auth action: ' + action };
        }
        break;

      // ========================================================================
      // USERS
      // ========================================================================
      case 'users':
        switch (action) {
          case 'list':
            response = UserController.getAll(data);
            break;
          case 'get':
            response = UserController.getById(data.userId || data.user_id);
            break;
          case 'create':
            response = UserController.create(data, userId);
            break;
          case 'update':
            response = UserController.update(data.userId || data.user_id, data, userId);
            break;
          case 'delete':
            response = UserController.delete(data.userId || data.user_id, userId);
            break;
          case 'changePassword':
          case 'change-password':
            response = UserController.changePassword(data.userId || data.user_id, data.oldPassword, data.newPassword, userId);
            break;
          default:
            response = { success: false, message: 'Unknown users action: ' + action };
        }
        break;

      // ========================================================================
      // ROLES
      // ========================================================================
      case 'roles':
        switch (action) {
          case 'list':
            response = RoleController.getAll();
            break;
          case 'get':
            response = RoleController.getById(data.roleId || data.role_id);
            break;
          case 'create':
            response = RoleController.create(data, userId);
            break;
          case 'update':
            response = RoleController.update(data.roleId || data.role_id, data, userId);
            break;
          case 'delete':
            response = RoleController.delete(data.roleId || data.role_id, userId);
            break;
          default:
            response = { success: false, message: 'Unknown roles action: ' + action };
        }
        break;

      // ========================================================================
      // ORGANIZATION - DIRECTORATES
      // ========================================================================
      case 'directorates':
        switch (action) {
          case 'list':
            response = OrganizationController.Directorate.getAll(data);
            break;
          case 'get':
            response = OrganizationController.Directorate.getById(data.directorateId || data.directorate_id || data.id);
            break;
          case 'create':
            response = OrganizationController.Directorate.create(data, userId);
            break;
          case 'update':
            response = OrganizationController.Directorate.update(data.directorateId || data.directorate_id || data.id, data, userId);
            break;
          case 'delete':
            response = OrganizationController.Directorate.delete(data.directorateId || data.directorate_id || data.id, userId);
            break;
          case 'check-children':
          case 'checkChildren':
            response = OrganizationController.Directorate.checkChildren(data.directorateId || data.directorate_id || data.id);
            break;
          case 'get-alternatives':
          case 'getAlternatives':
            response = OrganizationController.Directorate.getAlternatives(data.directorateId || data.directorate_id || data.id);
            break;
          case 'delete-cascade':
          case 'cascadeDelete':
            response = OrganizationController.Directorate.cascadeDelete(data.directorateId || data.directorate_id || data.id, userId);
            break;
          case 'delete-reassign':
          case 'reassignAndDelete':
            response = OrganizationController.Directorate.reassignAndDelete(
              data.directorateId || data.directorate_id || data.id,
              data.newDirectorateId || data.new_directorate_id,
              userId
            );
            break;
          default:
            response = { success: false, message: 'Unknown directorates action: ' + action };
        }
        break;

      // ========================================================================
      // ORGANIZATION - WORK UNITS
      // ========================================================================
      case 'work-units':
      case 'workUnits':
        switch (action) {
          case 'list':
            response = OrganizationController.WorkUnit.getAll(data);
            break;
          case 'get':
            response = OrganizationController.WorkUnit.getById(data.workUnitId || data.work_unit_id || data.id);
            break;
          case 'create':
            response = OrganizationController.WorkUnit.create(data, userId);
            break;
          case 'update':
            response = OrganizationController.WorkUnit.update(data.workUnitId || data.work_unit_id || data.id, data, userId);
            break;
          case 'delete':
            response = OrganizationController.WorkUnit.delete(data.workUnitId || data.work_unit_id || data.id, userId);
            break;
          case 'check-children':
          case 'checkChildren':
            response = OrganizationController.WorkUnit.checkChildren(data.workUnitId || data.work_unit_id || data.id);
            break;
          case 'get-alternatives':
          case 'getAlternatives':
            response = OrganizationController.WorkUnit.getAlternatives(data.workUnitId || data.work_unit_id || data.id);
            break;
          case 'delete-cascade':
          case 'cascadeDelete':
            response = OrganizationController.WorkUnit.cascadeDelete(data.workUnitId || data.work_unit_id || data.id, userId);
            break;
          case 'delete-reassign':
          case 'reassignAndDelete':
            response = OrganizationController.WorkUnit.reassignAndDelete(
              data.workUnitId || data.work_unit_id || data.id,
              data.newWorkUnitId || data.new_work_unit_id,
              userId
            );
            break;
          default:
            response = { success: false, message: 'Unknown work-units action: ' + action };
        }
        break;

      // ========================================================================
      // ORGANIZATION - AFFAIRS
      // ========================================================================
      case 'affairs':
        switch (action) {
          case 'list':
            response = OrganizationController.Affair.getAll(data);
            break;
          case 'get':
            response = OrganizationController.Affair.getById(data.affairId || data.affair_id || data.id);
            break;
          case 'create':
            response = OrganizationController.Affair.create(data, userId);
            break;
          case 'update':
            response = OrganizationController.Affair.update(data.affairId || data.affair_id || data.id, data, userId);
            break;
          case 'delete':
            response = OrganizationController.Affair.delete(data.affairId || data.affair_id || data.id, userId);
            break;
          default:
            response = { success: false, message: 'Unknown affairs action: ' + action };
        }
        break;

      // ========================================================================
      // ORGANIZATION - POSITIONS
      // ========================================================================
      case 'positions':
        switch (action) {
          case 'list':
            response = OrganizationController.Position.getAll(data);
            break;
          case 'get':
            response = OrganizationController.Position.getById(data.positionId || data.position_id || data.id);
            break;
          case 'create':
            response = OrganizationController.Position.create(data, userId);
            break;
          case 'update':
            response = OrganizationController.Position.update(data.positionId || data.position_id || data.id, data, userId);
            break;
          case 'delete':
            response = OrganizationController.Position.delete(data.positionId || data.position_id || data.id, userId);
            break;
          default:
            response = { success: false, message: 'Unknown positions action: ' + action };
        }
        break;

      // ========================================================================
      // OKR (Objectives and Key Results)
      // ========================================================================
      case 'okrs':
      case 'okr':
        switch (action) {
          case 'list':
            response = OKRController.getByUser(userId, data.year, data.quarter);
            break;
          case 'get':
            response = OKRController.getById(data.okrId || data.okr_id || data.id);
            break;
          case 'create':
            response = OKRController.create(data, userId);
            break;
          case 'update':
            response = OKRController.update(data.okrId || data.okr_id || data.id, data, userId);
            break;
          case 'delete':
            response = OKRController.delete(data.okrId || data.okr_id || data.id, userId);
            break;
          case 'getCurrentWeek':
          case 'get-current-week':
            response = OKRController.getCurrentWeek(userId);
            break;
          case 'submit':
            response = OKRController.submit(data.okrId || data.okr_id || data.id, userId);
            break;
          case 'review':
            response = OKRController.review(
              data.okrId || data.okr_id || data.id,
              userId,
              data.reviewNotes || data.review_notes || '',
              data.approved !== false
            );
            break;
          default:
            response = { success: false, message: 'Unknown okrs action: ' + action };
        }
        break;

      // ========================================================================
      // KPI (Key Performance Indicators)
      // ========================================================================
      case 'kpis':
      case 'kpi':
        switch (action) {
          case 'list':
            response = KPIController.getByWorkUnit(data.workUnitId || data.work_unit_id, data.year);
            break;
          case 'get':
            response = KPIController.getById(data.kpiId || data.kpi_id || data.id);
            break;
          case 'create':
            response = KPIController.create(data, userId);
            break;
          case 'update':
            response = KPIController.update(data.kpiId || data.kpi_id || data.id, data, userId);
            break;
          case 'delete':
            response = KPIController.delete(data.kpiId || data.kpi_id || data.id, userId);
            break;
          case 'progress':
          case 'record':
          case 'progress/record':
            response = KPIController.Progress.record(data, userId);
            break;
          case 'verify':
          case 'progress/verify':
            response = KPIController.Progress.verify(data.progressId || data.progress_id || data.id, userId);
            break;
          default:
            response = { success: false, message: 'Unknown kpis action: ' + action };
        }
        break;

      // ========================================================================
      // STRATEGIC PLANNING
      // ========================================================================
      case 'strategic':
        switch (action) {
          case 'list':
            response = StrategicController.Period.getAll();
            break;
          case 'goals':
          case 'get-goals':
            response = StrategicController.Goal.getByYear(data.year || new Date().getFullYear());
            break;
          case 'periods':
          case 'get-periods':
            response = StrategicController.Period.getAll();
            break;
          default:
            response = { success: false, message: 'Unknown strategic action: ' + action };
        }
        break;

      // ========================================================================
      // SWOT ANALYSIS
      // ========================================================================
      case 'swot':
        switch (action) {
          case 'matrix':
          case 'get-matrix':
            response = SWOTController.getMatrix(data.goalId || data.goal_id);
            break;
          case 'create':
            response = SWOTController.create(data, userId);
            break;
          case 'update':
            response = SWOTController.update(data.itemId || data.item_id || data.analysis_id || data.id, data, userId);
            break;
          case 'delete':
            response = SWOTController.delete(data.itemId || data.item_id || data.analysis_id || data.id, userId);
            break;
          case 'impact':
          case 'get-impact':
            response = SWOTController.getImpactAnalysis(data.goalId || data.goal_id);
            break;
          default:
            response = { success: false, message: 'Unknown swot action: ' + action };
        }
        break;

      // ========================================================================
      // PROGRAMS AND ACTIVITIES
      // ========================================================================
      case 'programs':
        switch (action) {
          case 'list':
            response = ProgramController.getAllPrograms(data);
            break;
          case 'get':
            response = ProgramController.getById(data.programId || data.program_id || data.id);
            break;
          case 'create':
            response = ProgramController.create(data, userId);
            break;
          case 'update':
            response = ProgramController.update(data.programId || data.program_id || data.id, data, userId);
            break;
          case 'delete':
            response = ProgramController.delete(data.programId || data.program_id || data.id, userId);
            break;
          default:
            response = { success: false, message: 'Unknown programs action: ' + action };
        }
        break;

      case 'activities':
        switch (action) {
          case 'list':
          case 'byProgram':
          case 'by-program':
            response = ProgramController.Activity.getByProgram(data.programId || data.program_id);
            break;
          case 'get':
            // Activities are typically fetched by program, but individual get could be added
            response = { success: false, message: 'Use activities/byProgram with programId' };
            break;
          case 'create':
            response = ProgramController.Activity.create(data, userId);
            break;
          case 'update':
            response = ProgramController.Activity.update(data.activityId || data.activity_id || data.id, data, userId);
            break;
          case 'delete':
            response = ProgramController.Activity.delete(data.activityId || data.activity_id || data.id, userId);
            break;
          default:
            response = { success: false, message: 'Unknown activities action: ' + action };
        }
        break;

      // ========================================================================
      // NOTIFICATIONS
      // ========================================================================
      case 'notifications':
        switch (action) {
          case 'get':
          case 'list':
            response = NotificationService.getUserNotifications(userId, data.unreadOnly || data.unread_only || false);
            break;
          case 'markAsRead':
          case 'mark-as-read':
            response = NotificationService.markAsRead(data.notificationId || data.notification_id || data.id);
            break;
          case 'markAllAsRead':
          case 'mark-all-read':
            response = NotificationService.markAllAsRead(userId);
            break;
          default:
            response = { success: false, message: 'Unknown notifications action: ' + action };
        }
        break;

      // ========================================================================
      // REVISIONS / AUDIT
      // ========================================================================
      case 'revisions':
      case 'audit':
        switch (action) {
          case 'getHistory':
          case 'get-history':
            response = getRevisionHistory(data.entityType || data.entity_type, data.entityId || data.entity_id, data.limit || 50);
            break;
          case 'restore':
            response = restoreRevision(data.revisionId || data.revision_id, userId, data.reason || '');
            break;
          case 'statistics':
          case 'get-statistics':
            response = getRevisionStatistics(data.filters || {});
            break;
          default:
            response = { success: false, message: 'Unknown revisions action: ' + action };
        }
        break;

      // ========================================================================
      // SETTINGS
      // ========================================================================
      case 'settings':
        if (action === 'get') {
          response = { success: true, data: {} }; // Return empty settings for now
        } else if (action === 'save') {
          // Save settings (placeholder for now)
          response = { success: true, message: 'Settings saved successfully' };
        }
        break;

      // ========================================================================
      // PAGE (AJAX Navigation)
      // ========================================================================
      case 'page':
        if (action === 'get') {
          const pageName = data.page || 'dashboard';
          if (!PagesConfig.isValidPage(pageName)) {
            response = { success: false, message: 'Invalid page: ' + pageName };
          } else {
            const dataTemplate = {
              WEB_APP_URL: ScriptApp.getService().getUrl(),
              PAGE_NAME: pageName
            };
            const content = renderTemplate('pages/' + pageName + '.html', dataTemplate);
            const modals = PagesConfig.getPageModals(pageName, dataTemplate);
            const scripts = PagesConfig.getPageScripts(pageName, dataTemplate);
            response = {
              success: true,
              data: {
                content: content,
                modals: modals,
                scripts: scripts,
                page: pageName
              }
            };
          }
        }
        break;

      default:
        response = { success: false, message: 'Unknown resource: ' + resource };
    }

    const endTime = Date.now();
    Logger.log('API CALL END: ' + endpoint + ' | Time: ' + (endTime - startTime) + 'ms');
    Logger.log('Response: ' + JSON.stringify(response));
    Logger.log('='.repeat(60));

    return response;

  } catch (error) {
    Logger.log('API CALL ERROR: ' + error.message);
    Logger.log('Stack: ' + error.stack);
    return {
      success: false,
      message: error.message,
      error: error.toString()
    };
  }
}
