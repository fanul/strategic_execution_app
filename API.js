/**
 * API.js
 * API routing with Controller delegation, caching, and rate limiting
 * REFACTORED: All business logic moved to Controllers
 */

// Rate limiting cache (stores request counts per user)
const RATE_LIMIT = {
  MAX_REQUESTS: 100, // Max requests per window
  WINDOW_SECONDS: 60 // Time window in seconds
};

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
    
    Logger.log(`API Call: ${action}`);
    
    // Check rate limit
    if (sessionToken) {
      const rateLimitResult = checkRateLimit(sessionToken);
      if (!rateLimitResult.allowed) {
        return ContentService
          .createTextOutput(JSON.stringify(formatError('Rate limit exceeded. Please try again later.')))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }
    
    // Route to appropriate controller
    let response;
    
    switch (action) {
      // ===== AUTHENTICATION =====
      case 'auth.login':
        response = login(data.usernameOrEmail, data.password);
        break;
      
      case 'auth.logout':
        response = logout(sessionToken);
        break;
      
      case 'auth.getCurrentUser':
        response = formatSuccess(getCurrentUser(sessionToken));
        break;
      
      case 'auth.changePassword':
        const user = getCurrentUser(sessionToken);
        response = UserController.changePassword(user.user_id, data.oldPassword, data.newPassword, user.user_id);
        break;
      
      // ===== DATABASE =====
      case 'database.initialize':
        response = initializeDatabase();
        break;
      
      case 'database.getStats':
        response = getDatabaseStats();
        break;
      
      case 'database.generateSheets':
        requirePermission(sessionToken, 'settings', 'update');
        response = generateGoogleSheets(data.sheetName, data.data);
        break;
      
      case 'database.moveToFolder':
        requirePermission(sessionToken, 'settings', 'update');
        response = moveSheetToFolder(data.spreadsheetId, data.folderId);
        break;
      
      // ===== USERS =====
      case 'users.list':
        requirePermission(sessionToken, 'users', 'read');
        response = UserController.getAll(data.filters);
        break;
      
      case 'users.getById':
        requireAuth(sessionToken);
        response = UserController.getById(data.userId);
        break;
      
      case 'users.create':
        requirePermission(sessionToken, 'users', 'create');
        response = UserController.create(data, getCurrentUser(sessionToken).user_id);
        break;
      
      case 'users.update':
        requirePermission(sessionToken, 'users', 'update');
        response = UserController.update(data.userId, data.updates, getCurrentUser(sessionToken).user_id);
        break;
      
      case 'users.delete':
        requirePermission(sessionToken, 'users', 'delete');
        response = UserController.delete(data.userId, getCurrentUser(sessionToken).user_id);
        break;
      
      // ===== ROLES =====
      case 'roles.list':
        requireAuth(sessionToken);
        response = RoleController.getAll();
        break;

      case 'roles.create':
        requirePermission(sessionToken, 'roles', 'create');
        response = RoleController.create(data, getCurrentUser(sessionToken).user_id);
        break;

      case 'roles.clone':
        requirePermission(sessionToken, 'roles', 'create');
        response = RoleController.clone(data.roleId, data.newRoleName, getCurrentUser(sessionToken).user_id);
        break;

      // ===== PAGE (AJAX Navigation) =====
      case 'page.get':
        requireAuth(sessionToken);
        const pageName = data.page || 'dashboard';

        // Validate page using PagesConfig
        if (!PagesConfig.isValidPage(pageName)) {
          response = { success: false, message: 'Invalid page: ' + pageName };
        } else {
          const dataTemplate = {
            WEB_APP_URL: ScriptApp.getService().getUrl(),
            PAGE_NAME: pageName
          };

          const content = renderTemplate(`pages/${pageName}.html`, dataTemplate);
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
        break;

      // ===== ORGANIZATION =====
      case 'directorates.list':
        requireAuth(sessionToken);
        response = OrganizationController.Directorate.getAll(data.filters);
        break;

      case 'directorates.get':
        requireAuth(sessionToken);
        const directorateId = data.directorate_id || data.id;
        response = OrganizationController.Directorate.getById(directorateId);
        break;

      case 'directorates.create':
        requirePermission(sessionToken, 'organization', 'create');
        response = OrganizationController.Directorate.create(data, getCurrentUser(sessionToken).user_id);
        break;

      case 'directorates.update':
        requirePermission(sessionToken, 'organization', 'update');
        const directorateUpdateId = data.directorate_id || data.id;
        response = OrganizationController.Directorate.update(directorateUpdateId, data, getCurrentUser(sessionToken).user_id);
        break;

      case 'directorates.delete':
        requirePermission(sessionToken, 'organization', 'delete');
        const directorateDeleteId = data.directorate_id || data.id;
        response = OrganizationController.Directorate.delete(directorateDeleteId, getCurrentUser(sessionToken).user_id);
        break;

      case 'directorates.check-children':
        requireAuth(sessionToken);
        const directorateCheckId = data.directorate_id || data.id;
        response = OrganizationController.Directorate.checkChildren(directorateCheckId);
        break;

      case 'directorates.get-alternatives':
        requireAuth(sessionToken);
        const directorateAlternativesId = data.directorate_id || data.id;
        response = OrganizationController.Directorate.getAlternatives(directorateAlternativesId);
        break;

      case 'directorates.delete-cascade':
        requirePermission(sessionToken, 'organization', 'delete');
        const directorateCascadeId = data.directorate_id || data.id;
        response = OrganizationController.Directorate.cascadeDelete(directorateCascadeId, getCurrentUser(sessionToken).user_id);
        break;

      case 'directorates.delete-reassign':
        requirePermission(sessionToken, 'organization', 'delete');
        const directorateReassignId = data.directorate_id || data.id;
        const newDirectorateId = data.new_directorate_id;
        response = OrganizationController.Directorate.reassignAndDelete(directorateReassignId, newDirectorateId, getCurrentUser(sessionToken).user_id);
        break;

      case 'workUnits.list':
        requireAuth(sessionToken);
        response = OrganizationController.WorkUnit.getAll(data.filters);
        break;

      case 'work-units.list':
        requireAuth(sessionToken);
        response = OrganizationController.WorkUnit.getAll(data.filters);
        break;

      case 'workUnits.get':
        requireAuth(sessionToken);
        const workUnitId = data.work_unit_id || data.id;
        response = OrganizationController.WorkUnit.getById(workUnitId);
        break;

      case 'work-units.get':
        requireAuth(sessionToken);
        const workUnitId2 = data.work_unit_id || data.id;
        response = OrganizationController.WorkUnit.getById(workUnitId2);
        break;

      case 'workUnits.create':
        requirePermission(sessionToken, 'organization', 'create');
        response = OrganizationController.WorkUnit.create(data, getCurrentUser(sessionToken).user_id);
        break;

      case 'work-units.create':
        requirePermission(sessionToken, 'organization', 'create');
        response = OrganizationController.WorkUnit.create(data, getCurrentUser(sessionToken).user_id);
        break;

      case 'workUnits.update':
        requirePermission(sessionToken, 'organization', 'update');
        const workUnitUpdateId = data.work_unit_id || data.id;
        response = OrganizationController.WorkUnit.update(workUnitUpdateId, data, getCurrentUser(sessionToken).user_id);
        break;

      case 'work-units.update':
        requirePermission(sessionToken, 'organization', 'update');
        const workUnitUpdateId2 = data.work_unit_id || data.id;
        response = OrganizationController.WorkUnit.update(workUnitUpdateId2, data, getCurrentUser(sessionToken).user_id);
        break;

      case 'workUnits.delete':
        requirePermission(sessionToken, 'organization', 'delete');
        const workUnitDeleteId = data.work_unit_id || data.id;
        response = OrganizationController.WorkUnit.delete(workUnitDeleteId, getCurrentUser(sessionToken).user_id);
        break;

      case 'work-units.delete':
        requirePermission(sessionToken, 'organization', 'delete');
        const workUnitDeleteId2 = data.work_unit_id || data.id;
        response = OrganizationController.WorkUnit.delete(workUnitDeleteId2, getCurrentUser(sessionToken).user_id);
        break;

      case 'work-units.check-children':
        requireAuth(sessionToken);
        const workUnitCheckId = data.work_unit_id || data.id;
        response = OrganizationController.WorkUnit.checkChildren(workUnitCheckId);
        break;

      case 'work-units.get-alternatives':
        requireAuth(sessionToken);
        const workUnitAlternativesId = data.work_unit_id || data.id;
        response = OrganizationController.WorkUnit.getAlternatives(workUnitAlternativesId);
        break;

      case 'work-units.delete-cascade':
        requirePermission(sessionToken, 'organization', 'delete');
        const workUnitCascadeId = data.work_unit_id || data.id;
        response = OrganizationController.WorkUnit.cascadeDelete(workUnitCascadeId, getCurrentUser(sessionToken).user_id);
        break;

      case 'work-units.delete-reassign':
        requirePermission(sessionToken, 'organization', 'delete');
        const workUnitReassignId = data.work_unit_id || data.id;
        const newWorkUnitId = data.new_work_unit_id;
        response = OrganizationController.WorkUnit.reassignAndDelete(workUnitReassignId, newWorkUnitId, getCurrentUser(sessionToken).user_id);
        break;

      case 'affairs.list':
        requireAuth(sessionToken);
        response = OrganizationController.Affair.getAll(data.filters);
        break;

      case 'affairs.get':
        requireAuth(sessionToken);
        const affairId = data.affair_id || data.id;
        response = OrganizationController.Affair.getById(affairId);
        break;

      case 'affairs.create':
        requirePermission(sessionToken, 'organization', 'create');
        response = OrganizationController.Affair.create(data, getCurrentUser(sessionToken).user_id);
        break;

      case 'affairs.update':
        requirePermission(sessionToken, 'organization', 'update');
        const affairUpdateId = data.affair_id || data.id;
        response = OrganizationController.Affair.update(affairUpdateId, data, getCurrentUser(sessionToken).user_id);
        break;

      case 'affairs.delete':
        requirePermission(sessionToken, 'organization', 'delete');
        const affairDeleteId = data.affair_id || data.id;
        response = OrganizationController.Affair.delete(affairDeleteId, getCurrentUser(sessionToken).user_id);
        break;

      case 'affairs.check-children':
        requireAuth(sessionToken);
        const affairCheckId = data.affair_id || data.id;
        response = OrganizationController.Affair.checkChildren(affairCheckId);
        break;

      case 'affairs.get-alternatives':
        requireAuth(sessionToken);
        const affairAlternativesId = data.affair_id || data.id;
        response = OrganizationController.Affair.getAlternatives(affairAlternativesId);
        break;

      case 'affairs.delete-cascade':
        requirePermission(sessionToken, 'organization', 'delete');
        const affairCascadeId = data.affair_id || data.id;
        response = OrganizationController.Affair.cascadeDelete(affairCascadeId, getCurrentUser(sessionToken).user_id);
        break;

      case 'affairs.delete-reassign':
        requirePermission(sessionToken, 'organization', 'delete');
        const affairReassignId = data.affair_id || data.id;
        const newAffairId = data.new_affair_id;
        response = OrganizationController.Affair.reassignAndDelete(affairReassignId, newAffairId, getCurrentUser(sessionToken).user_id);
        break;

      case 'positions.list':
        requireAuth(sessionToken);
        response = OrganizationController.Position.getAll(data.filters);
        break;

      case 'positions.get':
        requireAuth(sessionToken);
        const positionId = data.position_id || data.id;
        response = OrganizationController.Position.getById(positionId);
        break;

      case 'positions.create':
        requirePermission(sessionToken, 'organization', 'create');
        response = OrganizationController.Position.create(data, getCurrentUser(sessionToken).user_id);
        break;

      case 'positions.update':
        requirePermission(sessionToken, 'organization', 'update');
        const positionUpdateId = data.position_id || data.id;
        response = OrganizationController.Position.update(positionUpdateId, data, getCurrentUser(sessionToken).user_id);
        break;

      case 'positions.delete':
        requirePermission(sessionToken, 'organization', 'delete');
        const positionDeleteId = data.position_id || data.id;
        response = OrganizationController.Position.delete(positionDeleteId, getCurrentUser(sessionToken).user_id);
        break;

      case 'positionAssignments.create':
        requirePermission(sessionToken, 'organization', 'update');
        response = OrganizationController.PositionAssignment.create(data, getCurrentUser(sessionToken).user_id);
        break;
      
      // ===== STRATEGIC PLANNING =====
      case 'periods.list':
        requireAuth(sessionToken);
        response = StrategicController.Period.getAll();
        break;
      
      case 'periods.getActive':
        requireAuth(sessionToken);
        response = StrategicController.Period.getActive();
        break;
      
      case 'periods.setActive':
        requirePermission(sessionToken, 'strategic_plan', 'update');
        response = StrategicController.Period.setActive(data.periodId, getCurrentUser(sessionToken).user_id);
        break;
      
      case 'visions.create':
        requirePermission(sessionToken, 'strategic_plan', 'create');
        response = StrategicController.Vision.create(data, getCurrentUser(sessionToken).user_id);
        break;
      
      case 'visions.approve':
        requirePermission(sessionToken, 'strategic_plan', 'approve');
        response = StrategicController.Vision.approve(data.visionId, getCurrentUser(sessionToken).user_id);
        break;
      
      case 'missions.create':
        requirePermission(sessionToken, 'strategic_plan', 'create');
        response = StrategicController.Mission.create(data, getCurrentUser(sessionToken).user_id);
        break;
      
      case 'goals.create':
        requirePermission(sessionToken, 'strategic_plan', 'create');
        response = StrategicController.Goal.create(data, getCurrentUser(sessionToken).user_id);
        break;
      
      // ===== KPIs =====
      case 'kpis.list':
        requireAuth(sessionToken);
        response = KPIController.getByWorkUnit(data.workUnitId, data.year);
        break;
      
      case 'kpis.create':
        requirePermission(sessionToken, 'kpi', 'create');
        response = KPIController.create(data, getCurrentUser(sessionToken).user_id);
        break;
      
      case 'kpis.update':
        requirePermission(sessionToken, 'kpi', 'update');
        response = KPIController.update(data.kpiId, data.updates, getCurrentUser(sessionToken).user_id);
        break;
      
      case 'kpis.progress.record':
        requirePermission(sessionToken, 'kpi', 'update');
        response = KPIController.Progress.record(data, getCurrentUser(sessionToken).user_id);
        break;
      
      case 'kpis.progress.verify':
        requirePermission(sessionToken, 'kpi', 'approve');
        response = KPIController.Progress.verify(data.progressId, getCurrentUser(sessionToken).user_id);
        break;
      
      case 'kpis.individual.create':
        requirePermission(sessionToken, 'kpi', 'create');
        response = KPIController.Individual.create(data, getCurrentUser(sessionToken).user_id);
        break;
      
      // ===== PROGRAMS & ACTIVITIES====
      case 'programs.create':
        requirePermission(sessionToken, 'programs', 'create');
        response = ProgramController.create(data, getCurrentUser(sessionToken).user_id);
        break;
      
      case 'programs.update':
        requirePermission(sessionToken, 'programs', 'update');
        response = ProgramController.update(data.programId, data.updates, getCurrentUser(sessionToken).user_id);
        break;
      
      case 'activities.create':
        requirePermission(sessionToken, 'programs', 'create');
        response = ProgramController.Activity.create(data, getCurrentUser(sessionToken).user_id);
        break;
      
      // ===== OKRs =====
      case 'okrs.get':
        requireAuth(sessionToken);
        response = OKRController.getByUser(getCurrentUser(sessionToken).user_id, data.year, data.quarter);
        break;
      
      case 'okrs.getCurrentWeek':
        requireAuth(sessionToken);
        response = OKRController.getCurrentWeek(getCurrentUser(sessionToken).user_id);
        break;
      
      case 'okrs.create':
        requireAuth(sessionToken);
        data.user_id = getCurrentUser(sessionToken).user_id;
        response = OKRController.create(data, getCurrentUser(sessionToken).user_id);
        break;
      
      case 'okrs.update':
        requireAuth(sessionToken);
        response = OKRController.update(data.okrId, data.updates, getCurrentUser(sessionToken).user_id);
        break;
      
      case 'okrs.submit':
        requireAuth(sessionToken);
        response = OKRController.submit(data.okrId, getCurrentUser(sessionToken).user_id);
        break;
      
      case 'okrs.review':
        requirePermission(sessionToken, 'okr', 'approve');
        response = OKRController.review(data.okrId, getCurrentUser(sessionToken).user_id, data.reviewNotes, data.approved);
        break;
      
      // ===== DASHBOARD =====
      case 'dashboard.getData':
        requireAuth(sessionToken);
        // Check cache first
        const cacheKey = `dashboard_${getCurrentUser(sessionToken).user_id}`;
        const cached = getCachedData(cacheKey);
        if (cached) {
          response = cached;
        } else {
          response = DashboardController.getData(getCurrentUser(sessionToken).user_id);
          if (response.success) {
            cacheData(cacheKey, response, 300); // Cache for 5 minutes
          }
        }
        break;
      
      // ===== REPORTS =====
      case 'reports.kpi':
        requireAuth(sessionToken);
        response = ReportController.generateKPIReport(data.filters);
        break;
      
      case 'reports.okr':
        requireAuth(sessionToken);
        response = ReportController.generateOKRReport(data.filters);
        break;
      
      case 'reports.performance':
        requireAuth(sessionToken);
        response = ReportController.generatePerformanceDashboard(data.year);
        break;
      
      case 'reports.export.csv':
        requireAuth(sessionToken);
        response = ReportService.exportToCSV(data.data, data.filename);
        break;
      
      case 'reports.export.sheets':
        requireAuth(sessionToken);
        response = ReportService.exportToGoogleSheets(data.data, data.sheetName);
        break;
      
      case 'reports.email':
        requirePermission(sessionToken, 'reports', 'send');
        response = ReportService.sendEmailReport(data.recipient, data.subject, data.reportData);
        break;
      
      // ===== NOTIFICATIONS =====
      case 'notifications.get':
      case 'notifications.my-notifications':
        requireAuth(sessionToken);
        response = NotificationService.getUserNotifications(getCurrentUser(sessionToken).user_id, data.unreadOnly);
        break;

      case 'notifications.markAsRead':
      case 'notifications.mark-read':
        requireAuth(sessionToken);
        response = NotificationService.markAsRead(data.notification_id);
        break;

      case 'notifications.markAllAsRead':
      case 'notifications.mark-all-read':
        requireAuth(sessionToken);
        response = NotificationService.markAllAsRead(getCurrentUser(sessionToken).user_id);
        break;

      // ===== SWOT ANALYSIS =====
      case 'swot.matrix':
        requireAuth(sessionToken);
        response = SWOTController.getMatrix(data.goal_id);
        break;

      case 'swot.create':
        requirePermission(sessionToken, 'strategic_plan', 'create');
        response = SWOTController.create(data, getCurrentUser(sessionToken).user_id);
        break;

      case 'swot.update':
        requirePermission(sessionToken, 'strategic_plan', 'update');
        response = SWOTController.update(data.analysis_id, data, getCurrentUser(sessionToken).user_id);
        break;

      case 'swot.delete':
        requirePermission(sessionToken, 'strategic_plan', 'delete');
        response = SWOTController.delete(data.analysis_id, getCurrentUser(sessionToken).user_id);
        break;

      case 'swot.impact':
        requireAuth(sessionToken);
        response = SWOTController.getImpactAnalysis(data.goal_id);
        break;
      
      // ===== AUDIT/REVISIONS =====
      case 'revisions.getHistory':
        requireAuth(sessionToken);
        response = getRevisionHistory(data.entityType, data.entityId, data.limit);
        break;
      
      case 'revisions.restore':
        requirePermission(sessionToken, 'settings', 'update');
        response = restoreRevision(data.revisionId, getCurrentUser(sessionToken).user_id, data.reason);
        break;
      
      default:
        response = formatError(`Unknown action: ${action}`);
    }
    
    return ContentService
      .createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);
    
  } catch (e) {
    Logger.log(`API Error: ${e}`);
    
    // Handle authorization errors
    if (e.message && e.message.startsWith('UNAUTHORIZED')) {
      return ContentService
        .createTextOutput(JSON.stringify(formatError('Unauthorized', e.message)))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    if (e.message && e.message.startsWith('FORBIDDEN')) {
      return ContentService
        .createTextOutput(JSON.stringify(formatError('Forbidden', e.message)))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService
      .createTextOutput(JSON.stringify(formatError('Internal server error', e.message)))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Test endpoint to check API status
 */
function testAPI() {
  return formatSuccess({
    status: 'online',
    version: getConfig('APP.VERSION'),
    timestamp: new Date().toISOString()
  }, 'API is running');
}

/**
 * Check rate limit for a session token
 * @param {string} sessionToken - Session token
 * @returns {Object} { allowed: boolean, remaining: number }
 */
function checkRateLimit(sessionToken) {
  try {
    const cache = CacheService.getScriptCache();
    const key = `ratelimit_${sessionToken}`;
    const cached = cache.get(key);
    
    if (!cached) {
      // First request in this window
      cache.put(key, '1', RATE_LIMIT.WINDOW_SECONDS);
      return { allowed: true, remaining: RATE_LIMIT.MAX_REQUESTS - 1 };
    }
    
    const count = parseInt(cached);
    
    if (count >= RATE_LIMIT.MAX_REQUESTS) {
      return { allowed: false, remaining: 0 };
    }
    
    // Increment counter
    cache.put(key, String(count + 1), RATE_LIMIT.WINDOW_SECONDS);
    return { allowed: true, remaining: RATE_LIMIT.MAX_REQUESTS - count - 1 };
  } catch (error) {
    Logger.log('Rate limit check error: ' + error);
    // On error, allow the request
    return { allowed: true, remaining: RATE_LIMIT.MAX_REQUESTS };
  }
}

/**
 * Get cached data
 * @param {string} key - Cache key
 * @returns {Object|null} Cached data or null
 */
function getCachedData(key) {
  try {
    const cache = CacheService.getScriptCache();
    const cached = cache.get(key);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    Logger.log('Cache get error: ' + error);
    return null;
  }
}

/**
 * Cache data
 * @param {string} key - Cache key
 * @param {Object} data - Data to cache
 * @param {number} expirationInSeconds - Expiration time in seconds (max 21600 = 6 hours)
 */
function cacheData(key, data, expirationInSeconds) {
  try {
    const cache = CacheService.getScriptCache();
    const expiration = Math.min(expirationInSeconds, 21600); // Max 6 hours
    cache.put(key, JSON.stringify(data), expiration);
  } catch (error) {
    Logger.log('Cache put error: ' + error);
  }
}

/**
 * Clear cache for a specific key
 * @param {string} key - Cache key
 */
function clearCache(key) {
  try {
    const cache = CacheService.getScriptCache();
    cache.remove(key);
  } catch (error) {
    Logger.log('Cache clear error: ' + error);
  }
}

/**
 * Clear all cache
 */
function clearAllCache() {
  try {
    const cache = CacheService.getScriptCache();
    cache.removeAll(cache.getKeys());
    return formatSuccess({}, 'All cache cleared');
  } catch (error) {
    Logger.log('Cache clear all error: ' + error);
    return formatError('Failed to clear cache', error);
  }
}

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

// NOTE: getPageScripts() and getPageModals() functions removed
// These are now handled by PagesConfig service for consistency
// Use: PagesConfig.getPageScripts(pageName, dataTemplate)
//      PagesConfig.getPageModals(pageName, dataTemplate)
