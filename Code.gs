/**
 * Code.gs - Refactored & Modularized
 * Main entry point for the Web App and API routing.
 *
 * Version: 2.0.0
 * Changes:
 * - Extracted API routing to modular Routing/ folder
 * - Created separate route files for each domain
 * - Simplified callAPI to use Router
 * - Improved maintainability and debugging
 */

// ============================================================================
// HTML TEMPLATE RENDERING
// ============================================================================

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
 * Helper function to include partial HTML files (CSS/JS)
 * @param {string} filename - The name of the file to include
 * @returns {string} The content of the file
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// ============================================================================
// WEB APP SERVING
// ============================================================================

/**
 * Serves the HTML file for the web app
 * @param {Object} e - Event parameter
 * @returns {GoogleAppsScript.HTML.HtmlOutput} The rendered HTML
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
      WEB_APP_URL: ScriptApp.getService().getUrl(),
      URL_PARAMETERS: e && e.parameter ? e.parameter : {},
      PAGE_NAME: pageName
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

// ============================================================================
// API ROUTING
// ============================================================================

/**
 * Unified API routing function
 * Uses modular Router to dispatch requests to appropriate route handlers
 *
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
    // Validate endpoint
    if (!Router.isValidEndpoint(endpoint)) {
      Logger.log('Invalid endpoint format: ' + endpoint);
      return {
        success: false,
        message: 'Invalid endpoint format: ' + endpoint
      };
    }

    // Get current user ID from data or session
    const userId = data.userId || data.user_id || Session.getActiveUser().getEmail();

    // Route the request using Router
    const response = Router.route(endpoint, data, userId);

    const endTime = Date.now();
    const duration = endTime - startTime;
    Logger.log('API CALL END: ' + endpoint + ' | Time: ' + duration + 'ms');
    Logger.log('Response: ' + JSON.stringify(response));
    Logger.log('='.repeat(60));

    // CRITICAL FIX: Clean the response to ensure it's serializable by google.script.run
    // This prevents serialization issues that cause null to be returned
    try {
      const jsonString = JSON.stringify(response);
      const cleanResponse = JSON.parse(jsonString);
      Logger.log('Response cleaned for serialization: ' + jsonString.length + ' chars');
      return cleanResponse;
    } catch (stringifyError) {
      Logger.log('ERROR: Could not stringify response: ' + stringifyError);
      // If we can't stringify it, try a minimal response
      if (response.success && response.data) {
        return { success: true, data: response.data };
      }
      return { success: false, message: response.message || 'Unknown error' };
    }

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

// ============================================================================
// API HANDLERS FOR GOOGLE.SCRIPT.RUN
// ============================================================================

/**
 * API Handler for google.script.run
 * Wrapper that ensures proper serialization
 *
 * @param {string} endpoint - API endpoint (e.g., 'directorates/list')
 * @param {Object} data - Request data
 * @returns {Object} API response
 */
function apiCallHandler(endpoint, data) {
  Logger.log('=== apiCallHandler START: ' + endpoint + ' ===');

  try {
    const apiResult = callAPI(endpoint, data);

    // Check if result is null/undefined
    if (apiResult === null || apiResult === undefined) {
      Logger.log('apiCallHandler ERROR: callAPI returned null/undefined');
      return { success: false, message: 'API returned null' };
    }

    Logger.log('apiCallHandler: callAPI returned success=' + apiResult.success);

    // Create a clean, simple response object for serialization
    const response = {
      success: true === apiResult.success,
      data: apiResult.data || null
    };

    const jsonStr = JSON.stringify(response);
    Logger.log('apiCallHandler returning: ' + jsonStr.length + ' chars, success=' + response.success);

    // Final verification before return
    if (response.data && Array.isArray(response.data)) {
      Logger.log('apiCallHandler: returning array with ' + response.data.length + ' items');
    }

    return response;

  } catch (error) {
    Logger.log('apiCallHandler EXCEPTION: ' + error.toString());
    Logger.log('apiCallHandler STACK: ' + error.stack);
    return {
      success: false,
      message: error.toString()
    };
  }
}

/**
 * Legacy wrapper for backward compatibility
 * @param {string} endpoint - API endpoint
 * @param {Object} data - Request data
 * @returns {Object} API response
 */
function callAPIWrapper(endpoint, data) {
  return apiCallHandler(endpoint, data);
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * API function to get initial dashboard data
 * @deprecated Use callAPI('dashboard/quick-stats') instead
 */
function getDashboardData() {
  try {
    return DashboardController.getData();
  } catch (error) {
    Logger.log('Error getting dashboard data: ' + error.message);
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
 * TEST FUNCTION - Verify google.script.run works
 */
function testSerialization() {
  Logger.log('=== testSerialization called ===');
  const testObj = {
    success: true,
    data: [
      { id: 1, name: 'Test 1' },
      { id: 2, name: 'Test 2' },
      { id: 3, name: 'Test 3' }
    ]
  };
  Logger.log('Returning test object');
  return testObj;
}
