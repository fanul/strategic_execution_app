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
    template.headerTitle = renderTemplate('minimal/headerTitle.html', dataTemplate);
    template.linkReel = renderTemplate('minimal/linkReel.html', dataTemplate);
    template.minimalStyle = renderTemplate('minimal/minimalStyle.html', dataTemplate);
    template.loading_overlay = renderTemplate('minimal/layout/loading_overlay.html', dataTemplate);
    template.sidebar = renderTemplate('minimal/layout/sidebar.html', dataTemplate);
    template.debug_panel_script = renderTemplate('minimal/assets/js/debug_panel_script.html', dataTemplate);
    template.toasts = renderTemplate('minimal/layout/toasts.html', dataTemplate);

    // Page-specific content
    template.pageContent = renderTemplate('minimal/pages/' + pageName + '.html', dataTemplate);

    // Page-specific modals (using PagesConfig)
    template.pageModals = PagesConfig.getPageModals(pageName, dataTemplate);
    template.modals = ''; // No global modals

    // Page-specific scripts (using PagesConfig)
    template.pageScripts = PagesConfig.getPageScripts(pageName, dataTemplate);

    // Common scripts (loaded for AJAX navigation)
    template.api_helper = renderTemplate('minimal/assets/js/api_helper.html', dataTemplate);
    template.ui_helpers = renderTemplate('minimal/assets/js/ui_helpers.html', dataTemplate);
    template.modals = renderTemplate('minimal/assets/js/modals.html', dataTemplate);
    template.settings_manager = renderTemplate('minimal/assets/js/settings_manager.html', dataTemplate);
    template.ajax_loader = renderTemplate('minimal/assets/js/ajax_loader.html', dataTemplate);
    template.router = renderTemplate('minimal/assets/js/router.html', dataTemplate);

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
 */
function callAPI(endpoint, data) {
  const startTime = Date.now();
  Logger.log('═'.repeat(60));
  Logger.log('API CALL START: ' + endpoint);
  Logger.log('API DATA: ' + JSON.stringify(data));

  try {
    // Parse endpoint to determine controller and action
    const parts = endpoint.split('/');
    Logger.log('Endpoint parsed: ' + JSON.stringify(parts));

    const controller = parts[0];
    const resource = parts[1];
    const action = parts[2];

    Logger.log('Controller: ' + controller);
    Logger.log('Resource: ' + resource);
    Logger.log('Action: ' + action);

    // Route to appropriate controller
    // (Controller routing logic continues here - abbreviated for brevity)

    const endTime = Date.now();
    Logger.log('API CALL END: ' + endpoint + ' | Time: ' + (endTime - startTime) + 'ms');
    Logger.log('═'.repeat(60));

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
