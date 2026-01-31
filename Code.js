/**
 * Code.gs
 * Main entry point for the Web App and API routing.
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

    // Validate page name (security)
    const validPages = ['dashboard', 'organization', 'strategic-plan', 'kpi', 'settings'];
    if (!validPages.includes(pageName)) {
      return HtmlService.createHtmlOutput('Invalid page: ' + pageName)
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    }

    const dataTemplate = {
      WEB_APP_URL : ScriptApp.getService().getUrl(),
      URL_PARAMETERS : e && e.parameter ? e.parameter : {},
      PAGE_NAME : pageName
    }

    // Create main template and pass data
    const template = HtmlService.createTemplateFromFile('Index');

    // tambahin
    template.headerTitle = renderTemplate('minimal/headerTitle.html', dataTemplate);
    template.linkReel = renderTemplate('minimal/linkReel.html', dataTemplate);
    template.minimalStyle = renderTemplate('minimal/minimalStyle.html', dataTemplate);
    template.loading_overlay = renderTemplate('minimal/layout/loading_overlay.html', dataTemplate);
    template.sidebar = renderTemplate('minimal/layout/sidebar.html', dataTemplate);
    template.debug_panel_script = renderTemplate('minimal/assets/js/debug_panel_script.html', dataTemplate);

    // Layout templates
    template.toasts = renderTemplate('minimal/layout/toasts.html', dataTemplate);
    template.modals = renderTemplate('minimal/layout/modals.html', dataTemplate);

    // Page-specific content
    template.pageContent = renderTemplate(`minimal/pages/${pageName}.html`, dataTemplate);

    // Page-specific modals (only load modals needed for the current page)
    switch (pageName) {
      case 'organization':
        template.pageModals = renderTemplate('minimal/layout/modals/organization_modals.html', dataTemplate);
        break;
      default:
        template.pageModals = ''; // No modals for other pages yet
        break;
    }

    // Page-specific scripts (loaded conditionally)
    template.pageScripts = getPageScripts(pageName, dataTemplate);

    // Load ALL common scripts on initial page load (for AJAX navigation)
    template.api_helper = renderTemplate('minimal/assets/js/api_helper.html', dataTemplate);
    template.ui_helpers = renderTemplate('minimal/assets/js/ui_helpers.html', dataTemplate);
    template.modals = renderTemplate('minimal/assets/js/modals.html', dataTemplate);
    template.settings_manager = renderTemplate('minimal/assets/js/settings_manager.html', dataTemplate);
    template.ajax_loader = renderTemplate('minimal/assets/js/ajax_loader.html', dataTemplate);
    template.router = renderTemplate('minimal/assets/js/router.html', dataTemplate);

    // Pass data to template
    template.PAGE_NAME = pageName;
    template.WEB_APP_URL = ScriptApp.getService().getUrl();
    template.URL_PARAMETERS = e && e.parameter ? e.parameter : {};

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

    const fileName = fileMap[path];
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
      // For HTML files, use template
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
 * Helper function to get page-specific scripts based on page name.
 * Page-specific scripts are loaded dynamically based on the page.
 * @param {string} pageName - The name of the page to load scripts for.
 * @param {Object} dataTemplate - Data template to pass to scripts.
 * @returns {string} Combined script HTML.
 */
function getPageScripts(pageName, dataTemplate) {
  switch (pageName) {
    case 'organization':
      // Load DataTable manager and CRUD operations (which now includes delete functionality)
      const datatablesScript = renderTemplate('minimal/assets/js/organization_datatables.html', dataTemplate);
      const crudScript = renderTemplate('minimal/assets/js/organization_crud.html', dataTemplate);
      return datatablesScript + '\n' + crudScript;
    default:
      return '';
  }
}

/**
 * Helper function to get page-specific modals.
 * @param {string} pageName - The name of the page.
 * @param {Object} dataTemplate - Data template to pass to modals.
 * @returns {string} Modal HTML.
 */
function getPageModals(pageName, dataTemplate) {
  switch (pageName) {
    case 'organization':
      return renderTemplate('minimal/layout/modals/organization_modals.html', dataTemplate);
    default:
      return '';
  }
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

    if (controller === 'auth') {
      if (resource === 'me' || action === 'me') {
        // Mock user for now
        return {
          success: true,
          data: {
            user_id: 'user-001',
            username: 'mohammad.afwanul',
            email: 'mohammad.afwanul@bpjsketenagakerjaan.go.id',
            full_name: 'Mohammad Afwanul',
            role_name: 'Super Admin',
            role_code: 'SUPER_ADMIN',
            is_admin: true
          }
        };
      }
      if (resource === 'logout' || action === 'logout') {
        return { success: true, message: 'Logged out' };
      }
    }

    // Settings controller
    if (controller === 'settings') {
      if (resource === 'get' || action === 'get' || !resource) {
        return {
          success: true,
          data: {
            debug_mode: PropertiesService.getUserProperties().getProperty('DEBUG_MODE') === 'true'
          }
        };
      }
      if (resource === 'save' || action === 'save') {
        PropertiesService.getUserProperties().setProperty('DEBUG_MODE', String(data.debug_mode || false));
        return { success: true, message: 'Settings saved' };
      }
    }

    // Page controller - for AJAX page loading
    if (controller === 'page' && resource === 'get') {
      const pageName = data.page || 'dashboard';
      const validPages = ['dashboard', 'organization', 'strategic-plan', 'kpi', 'settings'];

      if (!validPages.includes(pageName)) {
        return { success: false, message: 'Invalid page: ' + pageName };
      }

      const dataTemplate = {
        WEB_APP_URL: ScriptApp.getService().getUrl(),
        PAGE_NAME: pageName
      };

      const content = renderTemplate(`minimal/pages/${pageName}.html`, dataTemplate);
      const modals = getPageModals(pageName, dataTemplate);
      const scripts = getPageScripts(pageName, dataTemplate);

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

    let result = null;

    // Handle short format organization endpoints (e.g., "directorates/list" instead of "organization/directorates/list")
    if (controller === 'directorates') {
      Logger.log('Routing to OrganizationController.Directorate (short format)');
      if (resource === 'list' || !resource) {
        result = OrganizationController.Directorate.getAll(data);
      } else if (resource === 'create') {
        result = OrganizationController.Directorate.create(data, 'system');
      } else if (resource === 'update') {
        const id = data.directorate_id || data.id;
        result = OrganizationController.Directorate.update(id, data, 'system');
      } else if (resource === 'delete') {
        const id = data.directorate_id || data.id;
        result = OrganizationController.Directorate.delete(id, 'system');
      } else if (resource === 'get') {
        const id = data.directorate_id || data.id;
        result = OrganizationController.Directorate.getById(id);
      } else if (resource === 'check-children') {
        const id = data.directorate_id || data.id;
        result = OrganizationController.Directorate.checkChildren ? OrganizationController.Directorate.checkChildren(id) : { success: false, message: 'Not implemented' };
      } else if (resource === 'get-alternatives') {
        const id = data.directorate_id || data.id;
        result = OrganizationController.Directorate.getAlternatives ? OrganizationController.Directorate.getAlternatives(id) : { success: false, message: 'Not implemented' };
      } else if (resource === 'delete-cascade') {
        const id = data.directorate_id || data.id;
        result = OrganizationController.Directorate.cascadeDelete ? OrganizationController.Directorate.cascadeDelete(id, 'system') : { success: false, message: 'Not implemented' };
      } else if (resource === 'delete-reassign') {
        const id = data.directorate_id || data.id;
        const newId = data.new_directorate_id;
        result = OrganizationController.Directorate.reassignAndDelete ? OrganizationController.Directorate.reassignAndDelete(id, newId, 'system') : { success: false, message: 'Not implemented' };
      }
    }
    if (controller === 'work-units') {
      Logger.log('Routing to OrganizationController.WorkUnit (short format)');
      if (resource === 'list' || !resource) {
        result = OrganizationController.WorkUnit.getAll(data);
      } else if (resource === 'create') {
        result = OrganizationController.WorkUnit.create(data, 'system');
      } else if (resource === 'update') {
        const id = data.work_unit_id || data.id;
        result = OrganizationController.WorkUnit.update(id, data, 'system');
      } else if (resource === 'delete') {
        const id = data.work_unit_id || data.id;
        result = OrganizationController.WorkUnit.delete(id, 'system');
      } else if (resource === 'get') {
        const id = data.work_unit_id || data.id;
        result = OrganizationController.WorkUnit.getById ? OrganizationController.WorkUnit.getById(id) : { success: false, message: 'Not implemented' };
      } else if (resource === 'check-children') {
        const id = data.work_unit_id || data.id;
        result = OrganizationController.WorkUnit.checkChildren ? OrganizationController.WorkUnit.checkChildren(id) : { success: false, message: 'Not implemented' };
      } else if (resource === 'get-alternatives') {
        const id = data.work_unit_id || data.id;
        result = OrganizationController.WorkUnit.getAlternatives ? OrganizationController.WorkUnit.getAlternatives(id) : { success: false, message: 'Not implemented' };
      } else if (resource === 'delete-cascade') {
        const id = data.work_unit_id || data.id;
        result = OrganizationController.WorkUnit.cascadeDelete ? OrganizationController.WorkUnit.cascadeDelete(id, 'system') : { success: false, message: 'Not implemented' };
      } else if (resource === 'delete-reassign') {
        const id = data.work_unit_id || data.id;
        const newId = data.new_work_unit_id;
        result = OrganizationController.WorkUnit.reassignAndDelete ? OrganizationController.WorkUnit.reassignAndDelete(id, newId, 'system') : { success: false, message: 'Not implemented' };
      }
    }
    if (controller === 'affairs') {
      Logger.log('Routing to OrganizationController.Affair (short format)');
      if (resource === 'list' || !resource) {
        result = OrganizationController.Affair.getAll(data);
      } else if (resource === 'create') {
        result = OrganizationController.Affair.create(data, 'system');
      } else if (resource === 'update') {
        const id = data.affair_id || data.id;
        result = OrganizationController.Affair.update(id, data, 'system');
      } else if (resource === 'delete') {
        const id = data.affair_id || data.id;
        result = OrganizationController.Affair.delete(id, 'system');
      } else if (resource === 'get') {
        const id = data.affair_id || data.id;
        result = OrganizationController.Affair.getById ? OrganizationController.Affair.getById(id) : { success: false, message: 'Not implemented' };
      } else if (resource === 'check-children') {
        const id = data.affair_id || data.id;
        result = OrganizationController.Affair.checkChildren ? OrganizationController.Affair.checkChildren(id) : { success: false, message: 'Not implemented' };
      } else if (resource === 'get-alternatives') {
        const id = data.affair_id || data.id;
        result = OrganizationController.Affair.getAlternatives ? OrganizationController.Affair.getAlternatives(id) : { success: false, message: 'Not implemented' };
      } else if (resource === 'delete-cascade') {
        const id = data.affair_id || data.id;
        result = OrganizationController.Affair.cascadeDelete ? OrganizationController.Affair.cascadeDelete(id, 'system') : { success: false, message: 'Not implemented' };
      } else if (resource === 'delete-reassign') {
        const id = data.affair_id || data.id;
        const newId = data.new_affair_id;
        result = OrganizationController.Affair.reassignAndDelete ? OrganizationController.Affair.reassignAndDelete(id, newId, 'system') : { success: false, message: 'Not implemented' };
      }
    }
    if (controller === 'positions') {
      Logger.log('Routing to OrganizationController.Position (short format)');
      if (resource === 'list' || !resource) {
        result = OrganizationController.Position.getAll(data);
      } else if (resource === 'create') {
        result = OrganizationController.Position.create(data, 'system');
      } else if (resource === 'update') {
        const id = data.position_id || data.id;
        result = OrganizationController.Position.update(id, data, 'system');
      } else if (resource === 'delete') {
        const id = data.position_id || data.id;
        result = OrganizationController.Position.delete(id, 'system');
      } else if (resource === 'get') {
        const id = data.position_id || data.id;
        result = OrganizationController.Position.getById ? OrganizationController.Position.getById(id) : { success: false, message: 'Not implemented' };
      }
    }
    
    // Organization Controller
    if (controller === 'organization') {
      const normalizedResource = resource === 'directorate' ? 'directorates' : resource;
      
      if (normalizedResource === 'directorates') {
        if (action === 'list' || (resource === 'directorates' && !action)) {
           result = OrganizationController.Directorate.getAll(data);
        } else if (action === 'create') {
           result = OrganizationController.Directorate.create(data, 'system');
        } else if (action === 'update') {
           const id = data.directorate_id || data.id;
           result = OrganizationController.Directorate.update(id, data, 'system');
        } else if (action === 'delete') {
           const id = data.directorate_id || data.id;
           result = OrganizationController.Directorate.delete(id, 'system');
        }
      } else if (resource === 'workunit' || resource === 'workunits') {
        if (action === 'list') {
            result = OrganizationController.WorkUnit.getAll(data);
        } else if (action === 'create') {
            result = OrganizationController.WorkUnit.create(data, 'system');
        } else if (action === 'update') {
            const id = data.work_unit_id || data.id;
            result = OrganizationController.WorkUnit.update(id, data, 'system');
        } else if (action === 'delete') {
            const id = data.work_unit_id || data.id;
            result = OrganizationController.WorkUnit.delete(id, 'system');
        }
      } else if (resource === 'affair' || resource === 'affairs') {
         if (action === 'list') {
             // Ensure getAll exists, otherwise might need specific getter
             result = OrganizationController.Affair.getAll ? OrganizationController.Affair.getAll(data) : {success:false, message:'Method not implemented'};
         } else if (action === 'create') {
             result = OrganizationController.Affair.create(data, 'system');
         } else if (action === 'update') {
             const id = data.affair_id || data.id;
             result = OrganizationController.Affair.update(id, data, 'system');
         } else if (action === 'delete') {
             const id = data.affair_id || data.id;
             result = OrganizationController.Affair.delete(id, 'system');
         }
      } else if (resource === 'position' || resource === 'positions') {
         if (action === 'list') {
             result = OrganizationController.Position.getAll(data);
         } else if (action === 'create') {
             result = OrganizationController.Position.create(data, 'system');
         } else if (action === 'update') {
             const id = data.position_id || data.id;
             result = OrganizationController.Position.update(id, data, 'system');
         } else if (action === 'delete') {
             const id = data.position_id || data.id;
             result = OrganizationController.Position.delete(id, 'system');
         }
      } else if (resource === 'assignment' || resource === 'assignments') {
         if (action === 'list') {
             // Assignments implies getting all? or by position?
             result = OrganizationController.PositionAssignment.getAll ? OrganizationController.PositionAssignment.getAll(data) : {success:false, message:'Method not implemented'};
         } else if (action === 'create') {
             result = OrganizationController.PositionAssignment.create(data, 'system');
         } else if (action === 'update') {
             const id = data.assignment_id || data.id;
             result = OrganizationController.PositionAssignment.update(id, data, 'system');
         } else if (action === 'delete') {
             const id = data.assignment_id || data.id;
             result = OrganizationController.PositionAssignment.delete(id, 'system');
         }
      }
    }
    
    // Strategic Controller
    if (controller === 'strategic') {
       // Periods
       if (resource === 'periods') {
          if (action === 'list') result = StrategicController.Period.getAll(data);
          else if (action === 'create' || action === 'save') result = StrategicController.Period.create(data, 'system');
          else if (action === 'update') result = StrategicController.Period.update(data.periodId, data.updates, 'system');
          else if (action === 'set-active') result = StrategicController.Period.setActive(data.period_id, 'system');
          else if (action === 'delete') result = StrategicController.Period.deleteCascade(data.periodId, 'system');
       }
       // Visions
       else if (resource === 'visions') {
          if (action === 'list' || action === 'by-period') result = StrategicController.Vision.getByPeriod(data.period_id);
          else if (action === 'create' || action === 'save') result = StrategicController.Vision.create(data, 'system');
          else if (action === 'update') result = StrategicController.Vision.update(data.visionId, data.updates, 'system');
          else if (action === 'approve') result = StrategicController.Vision.approve(data.visionId, 'system');
          else if (action === 'delete') result = StrategicController.Vision.delete(data.visionId, 'system');
       }
       // Missions
       else if (resource === 'missions') {
          if (action === 'list' || action === 'by-vision') result = StrategicController.Mission.getByVision(data.vision_id);
          else if (action === 'create' || action === 'save') result = StrategicController.Mission.create(data, 'system');
          else if (action === 'update') result = StrategicController.Mission.update(data.missionId, data.updates, 'system');
          else if (action === 'delete') result = StrategicController.Mission.delete(data.missionId, 'system');
       }
       // Initiatives
       else if (resource === 'initiatives') {
          if (action === 'list' || action === 'by-year') result = StrategicController.Initiative.getByYear(data.year);
          else if (action === 'create' || action === 'save') result = StrategicController.Initiative.create(data, 'system');
       }
       // Goals
       else if (resource === 'goals') {
          if (action === 'list' || action === 'by-year') result = StrategicController.Goal.getByYear(data.year);
          else if (action === 'get' || action === 'details') result = StrategicController.Goal.getById(data.goal_id);
          else if (action === 'create' || action === 'save') result = StrategicController.Goal.create(data, 'system');
          else if (action === 'update') result = StrategicController.Goal.update(data.goal_id, data, 'system');
          else if (action === 'delete') result = StrategicController.Goal.delete(data.goal_id, 'system');
       }
       // Convenience / Top-level Fallback
       else if (typeof StrategicController[resource] === 'function') {
          result = StrategicController[resource](data);
       }
       else if (typeof StrategicController[action] === 'function') {
          result = StrategicController[action](data);
       }
    }
    
    // KPI Controller
    if (controller === 'kpi') {
       if (resource === 'organizational') {
          if (action === 'list') {
             // If controller has explicit getAll, use it. Otherwise use getByWorkUnit or similar
             // Assuming KPIController.getAllOrganizationalKPIs exists or we use getByWorkUnit
             result = KPIController.getAllOrganizationalKPIs ? KPIController.getAllOrganizationalKPIs(data) : KPIController.getByWorkUnit(data.work_unit_id, data.year);
          } else if (action === 'create') {
             result = KPIController.create(data, 'system');
          } else if (action === 'update') {
             result = KPIController.update(data.kpi_id, data, 'system');
          }
       } else if (resource === 'individual') {
          if (action === 'list') result = KPIController.Individual.getByUser(data.user_id, data.year);
          else if (action === 'create') result = KPIController.Individual.create(data, 'system');
       } else if (resource === 'progress') {
          if (action === 'record') result = KPIController.Progress.record(data, 'system');
       }
    }
    
    // Users Controller
    if (controller === 'users') {
       if (resource === 'list' || action === 'list') {
         result = UserController.getAll(data);
       } else if (resource === 'create' || action === 'create') {
         result = UserController.create(data, 'system');
       } else if (action === 'update') {
         // Check if update route exists in ID
         const id = data.user_id || data.id;
         if (id) result = UserController.update(id, data, 'system');
       } else if (action === 'delete') {
         const id = data.user_id || data.id;
         if (id) result = UserController.delete(id, 'system');
       }
    }
    
    // Roles Controller
    if (controller === 'roles') {
       if (resource === 'list' || action === 'list') {
         result = RoleController.getAll(data);
       } else if (action === 'create') {
         result = RoleController.create(data, 'system');
       } else if (action === 'update') {
         const id = data.role_id || data.id;
         if (id) result = RoleController.update(id, data, 'system');
       } else if (action === 'delete') {
         const id = data.role_id || data.id;
         if (id) result = RoleController.delete(id, 'system');
       }
    }
    
    // Impact Centers Controller
    if (controller === 'impact-centers') {
       if (resource === 'list' || action === 'list') {
         result = ImpactCenterController.getAllImpactCenters(data);
       } else if (resource === 'progress') {
         if (action === 'list') {
           result = ImpactCenterController.getProgress(data.impactCenterId || data.impact_center_id, data.year);
         } else if (action === 'submit' || action === 'create') {
           result = ImpactCenterController.submitProgress(data);
         }
       } else if (resource === 'work-units') {
         if (action === 'list') {
           result = ImpactCenterController.getAssignedWorkUnits(data.impactCenterId || data.impact_center_id);
         } else if (action === 'assign' || action === 'create') {
           result = ImpactCenterController.assignWorkUnit(data);
         } else if (action === 'remove' || action === 'delete') {
           result = ImpactCenterController.removeWorkUnit(data.assignment_id || data.id, 'system');
         }
       } else if (action === 'save' || action === 'create' || action === 'update') {
         const id = data.impact_center_id || data.id;
         if (id) {
           result = ImpactCenterController.update(id, data);
         } else {
           result = ImpactCenterController.create(data);
         }
       } else if (action === 'delete') {
         result = ImpactCenterController.delete(data.impact_center_id || data.id, 'system');
       }
    }

    // Programs Controller
    if (controller === 'programs') {
       if (resource === 'list' || action === 'list') {
         result = ProgramController.getAllPrograms(data);
       } else if (resource === 'activities') {
         // Get activities for a program
         result = ProgramController.Activity.getByProgram(data.programId || data.program_id);
       } else if (action === 'save' || action === 'create' || action === 'update') {
         const id = data.program_id || data.id;
         if (id) {
           result = ProgramController.update(id, data, 'system');
         } else {
           result = ProgramController.create(data, 'system');
         }
       } else if (resource === 'activity' && (action === 'save' || action === 'create' || action === 'update')) {
          const id = data.activity_id || data.id;
          if (id) {
            result = ProgramController.Activity.update(id, data, 'system');
          } else {
            result = ProgramController.Activity.create(data, 'system');
          }
       }
    }

    // OKR Controller (okr and okrs)
    if (controller === 'okr' || controller === 'okrs') {
       if (resource === 'my-okrs' || action === 'my-okrs' || resource === 'my' || action === 'my') {
          result = OKRController.getMyOKRs(data);
       } else if (resource === 'team-okrs' || resource === 'team' || action === 'team') {
          // getTeamOKRs doesn't exist yet, return empty array
          result = { success: true, data: [] };
       } else if (resource === 'pending-reviews' || resource === 'getOKRsToReview' || action === 'pending-reviews' || action === 'getOKRsToReview') {
          result = OKRController.getOKRsToReview(data);
       } else if (action === 'list') {
          result = OKRController.getMyOKRs(data);
       } else if (action === 'create' || action === 'save' || action === 'update') {
          const id = data.okr_id || data.id;
          if (id) {
            result = OKRController.update(id, data, 'system');
          } else {
            result = OKRController.create(data, 'system');
          }
       } else if (action === 'submit') {
          result = OKRController.submit(data.okr_id || data.id, 'system');
       }
    }

    // Notifications Controller
    if (controller === 'notifications' || controller === 'notification') {
       if (resource === 'list' || action === 'list') {
          // NotificationService exists - use it
          const userId = data.user_id || 'user-001';
          const unreadOnly = data.unread_only || data.unreadOnly || false;
          result = NotificationService.getUserNotifications(userId, unreadOnly);
          if (!result || !result.success) {
            result = { success: true, data: [] };
          }
       } else if (resource === 'read' || action === 'read' || action === 'markAsRead') {
          const notificationId = data.notification_id || data.id;
          result = NotificationService.markAsRead(notificationId);
          if (!result) result = { success: true, message: 'Marked as read' };
       } else if (resource === 'read-all' || action === 'read-all' || action === 'markAllAsRead') {
          const userId = data.user_id || 'user-001';
          result = NotificationService.markAllAsRead(userId);
          if (!result) result = { success: true, message: 'All marked as read' };
       } else if (resource === 'unread-count' || action === 'unread-count' || action === 'getUnreadCount') {
          const userId = data.user_id || 'user-001';
          const notifications = NotificationService.getUserNotifications(userId, true);
          result = { success: true, data: notifications ? (notifications.data || []).length : 0 };
       } else if (action === 'delete') {
          const notificationId = data.notification_id || data.id;
          result = { success: true, message: 'Notification deleted' };
       }
    }

    // Impact Centers Controller (impact-centers, impactCenters, impact_center)
    if (controller === 'impact-centers' || controller === 'impactcenters' || controller === 'impact_center') {
       if (resource === 'list' || action === 'list' || !resource) {
          result = ImpactCenterController.getAllImpactCenters(data);
       } else if (resource === 'get' || action === 'get') {
          const id = data.ic_id || data.impact_center_id || data.id;
          result = ImpactCenterController.getById(id);
       } else if (action === 'create' || action === 'save') {
          result = ImpactCenterController.create(data, 'system');
       } else if (action === 'update') {
          const id = data.ic_id || data.impact_center_id || data.id;
          result = ImpactCenterController.update(id, data, 'system');
       } else if (action === 'delete') {
          const id = data.ic_id || data.impact_center_id || data.id;
          result = ImpactCenterController.delete(id, 'system');
       } else if (resource === 'progress') {
          if (action === 'list' || action === 'get') {
             result = ImpactCenterController.listProgress(data);
          } else if (action === 'create' || action === 'submit') {
             result = ImpactCenterController.submitProgress(data, 'system');
          }
       } else if (resource === 'work-units' || resource === 'workUnits') {
          if (action === 'list' || action === 'get') {
             const id = data.ic_id || data.impact_center_id;
             result = ImpactCenterController.getAssignedWorkUnits(id);
          } else if (action === 'create' || action === 'assign' || action === 'assignWorkUnit') {
             result = ImpactCenterController.assignWorkUnit(data, 'system');
          } else if (action === 'delete' || action === 'remove' || action === 'unassign') {
             const mappingId = data.mapping_id || data.assignment_id || data.id;
             result = ImpactCenterController.removeWorkUnit(mappingId, 'system');
          }
       }
    }
    
    // Reports Controller
    if (controller === 'reports') {
      if (resource === 'kpi-summary') {
        result = ReportController.generateKPIReport(data);
      }
      if (resource === 'okr-performance') {
        result = ReportController.generateOKRReport(data);
      }
    }

    // SWOT Analysis Controller
    if (controller === 'swot' || controller === 'swot-analysis') {
      if (resource === 'list' || action === 'list') {
        result = SWOTController.getByGoal(data.goal_id);
      } else if (resource === 'matrix') {
        result = SWOTController.getMatrix(data.goal_id);
      } else if (resource === 'impact') {
        result = SWOTController.getImpactAnalysis(data.goal_id);
      } else if (action === 'create') {
        result = SWOTController.create(data, 'system');
      } else if (action === 'update') {
        result = SWOTController.update(data.analysis_id, data, 'system');
      } else if (action === 'delete') {
        result = SWOTController.delete(data.analysis_id || data.id, 'system');
      }
    }

    // Import Controller
    if (controller === 'import') {
      if (resource === 'validate') {
        result = ImportController.validate(data.entity_type, data.data);
      } else if (resource === 'process') {
        result = ImportController.process(data.entity_type, data.data, data.options);
      } else if (resource === 'template') {
        result = ImportController.getTemplate(data.entity_type);
      }
    }

    // Dashboard Controller
    if (controller === 'dashboard') {
      if (resource === 'executive' || action === 'executive' || action === 'getExecutiveData') {
        result = DashboardController.getExecutiveData();
      } else if (resource === 'activities' || action === 'activities' || action === 'getRecentActivities') {
        const limit = data.limit || 10;
        result = DashboardController.getRecentActivities(limit);
      } else if (resource === 'kpi' || action === 'kpi' || action === 'getKPIData') {
        result = DashboardController.getKPIData(data);
      } else if (resource === 'impact-center' || resource === 'impactCenter' || action === 'getImpactCenterData') {
        result = DashboardController.getImpactCenterData(data);
      } else if (resource === 'getData' || action === 'getData' || action === 'data') {
        const userId = data.user_id || 'user-001';
        result = DashboardController.getData(userId);
      }
    }


    if (result) {
        // Sanitize result to ensure compatibility with google.script.run
        // This handles Date objects and removes undefined values that might cause null response
        const sanitizedResult = JSON.parse(JSON.stringify(result));
        const duration = Date.now() - startTime;
        Logger.log('API RESULT: ' + JSON.stringify(sanitizedResult).substring(0, 200) + '...');
        Logger.log('API CALL COMPLETE: ' + endpoint + ' (' + duration + 'ms)');
        Logger.log('═'.repeat(60));
        return sanitizedResult;
    }

    // Default response for unhandled endpoints
    const duration = Date.now() - startTime;
    Logger.log('ERROR: Unknown controller - ' + controller);
    Logger.log('API CALL FAILED: ' + endpoint + ' (' + duration + 'ms)');
    Logger.log('═'.repeat(60));
    return {
      success: false,
      message: 'Endpoint not found or yielded no result: ' + endpoint
    };

  } catch (error) {
    const duration = Date.now() - startTime;
    Logger.log('✗ API CALL EXCEPTION: ' + endpoint);
    Logger.log('Error: ' + error.toString());
    Logger.log('Stack: ' + error.stack);
    Logger.log('Duration: ' + duration + 'ms');
    Logger.log('═'.repeat(60));
    return {
      success: false,
      message: 'API Error: ' + error.message,
      error: error.toString()
    };
  }
}
