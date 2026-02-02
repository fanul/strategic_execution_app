# Frontend Structure

## Overview

The frontend uses a Single Page Application (SPA) pattern with Bootstrap 5, jQuery, and DataTables. Pages are rendered server-side by Google Apps Script and enhanced with client-side JavaScript modules.

## Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Bootstrap | 5.3 | UI framework |
| jQuery | 3.6 | DOM manipulation and AJAX |
| DataTables | 1.13 | Advanced table features |
| D3.js | 7.8 | Data visualization |
| Bootstrap Icons | 1.11 | Icon set |

## Frontend Directory Structure

```
┌── assets/
│   ├── css/                    # Custom styles (minimal, uses Bootstrap CDN)
│   └── js/
│       ├── ajax_loader.html              # AJAX loading indicator
│       ├── api_helper.html               # API communication wrapper
│       ├── app_init.html                 # Application initialization
│       ├── auth.html                     # Authentication functions
│       ├── crud_operations.html          # Generic CRUD operations
│       ├── dashboard_widgets.html        # Dashboard widgets
│       ├── datatables_manager.html       # DataTables initialization
│       ├── debug_panel_script.html       # Debug panel functionality
│       ├── delete_confirm.html           # Delete confirmation dialogs
│       ├── kpi_crud.html                 # KPI CRUD operations
│       ├── modals.html                   # Common modal functions
│       ├── notifications_crud.html       # Notification CRUD
│       ├── okr_crud.html                 # OKR CRUD operations
│       ├── org-diagram.html              # D3.js org diagram
│       ├── org-diagram-context-menu.html # Diagram context menu
│       ├── org-diagram-controls.html     # Diagram toolbar
│       ├── org-diagram-tooltip.html      # Diagram node tooltips
│       ├── organization_crud.html        # Organization CRUD operations
│       ├── organization_datatables.html  # Organization DataTable manager
│       ├── organization-view-functions.html # Organization view helpers
│       ├── programs_crud.html            # Program CRUD operations
│       ├── reports_crud.html             # Report generation
│       ├── roles_crud.html               # Role CRUD operations
│       ├── router.html                   # SPA router
│       ├── settings_manager.html         # Settings management
│       ├── strategic_crud.html           # Strategic planning CRUD
│       ├── swot_crud.html                # SWOT CRUD operations
│       ├── ui_helpers.html               # UI utility functions
│       ├── users_crud.html               # User CRUD operations
│       └── view-toggle.html              # Table/diagram view toggle
│
├── layout/
│   ├── loading_overlay.html              # Loading overlay component
│   ├── modals/                           # Page-specific modals
│   │   ├── okr_modals.html               # OKR form modals
│   │   ├── organization_modals.html      # Organization entity modals
│   │   ├── program_modals.html           # Program form modals
│   │   └── swot_modals.html              # SWOT form modals
│   ├── sidebar.html                      # Navigation sidebar
│   └── toasts.html                       # Toast notifications
│
└── pages/
    ├── audit-trail.html                  # Audit trail viewer
    ├── dashboard.html                    # Main dashboard
    ├── kpi.html                          # KPI management page
    ├── login.html                        # Login page
    ├── notifications.html                # Notifications panel
    ├── okrs.html                         # OKR management page
    ├── organization.html                 # Organization management
    ├── programs.html                     # Program management page
    ├── reports.html                      # Reports and analytics
    ├── roles.html                        # Role management page
    ├── settings.html                     # Application settings
    ├── strategic-plan.html               # Strategic planning page
    └── swot.html                         # SWOT analysis page
```

## Page Template Structure

Every page follows this structure:

```html
<!-- pages/my-page.html -->
<div class="page-header">
    <h1>My Page</h1>
    <button class="btn btn-primary" onclick="showModal('myEntity')">
        <i class="bi bi-plus-lg"></i> Add New
    </button>
</div>

<!-- Filters -->
<div class="filters mb-3">
    <!-- Filter inputs -->
</div>

<!-- Data Display -->
<div class="data-display">
    <!-- Table, cards, or other visualizations -->
</div>
```

## JavaScript Module Pattern (IIFE)

All JavaScript modules use the IIFE pattern for encapsulation:

```javascript
<script>
const MyModule = (function() {
    'use strict';

    // Private state
    let privateState = {};

    // Private functions
    function privateFunction() {
        // ...
    }

    // Public API
    return {
        init: function() {
            // Initialize module
        },
        publicMethod: function() {
            // Public method
        }
    };
})();

// Make available globally for onclick handlers
window.myPublicFunction = MyModule.publicMethod;

// Auto-initialize
window.addEventListener('DOMContentLoaded', function() {
    MyModule.init();
});
</script>
```

## API Communication

**File**: [assets/js/api_helper.html](../assets/js/api_helper.html)

All API calls go through the `apiCall()` function:

```javascript
async function apiCall(endpoint, data) {
    return new Promise((resolve, reject) => {
        google.script.run
            .withSuccessHandler(resolve)
            .withFailureHandler(reject)
            .callAPI(endpoint, data);
    });
}

// Usage
const result = await apiCall('users/list', { status: 'active' });
if (result.success) {
    console.log(result.data);
} else {
    console.error(result.message);
}
```

## UI Helpers

**File**: [assets/js/ui_helpers.html](../assets/js/ui_helpers.html)

Common UI functions:

```javascript
// Toast notifications
showToast(message, type)  // type: 'success', 'error', 'warning', 'info'

// Modal management
showModal(modalType, entityId)  // Open modal for create or edit
closeModal(modalId)            // Close modal

// Loading indicators
showLoading() / hideLoading()

// Confirmation dialogs
showConfirm(message, onConfirm)
```

## Debug Panel

**File**: [assets/js/debug_panel_script.html](../assets/js/debug_panel_script.html)

The debug panel shows:
- API calls and responses
- JavaScript errors
- Debug logs by category
- Session information

Enable in Index.html:
```javascript
const ENABLE_DEBUG_PANEL = true;
```

## Debug Logging

Use `debugLog()` for debug output:

```javascript
debugLog('CATEGORY', 'Message', data);
debugLog('CRUD', 'User created', userData);
debugLog('API', 'Response received', response);
```

Categories:
- `CRUD` - CRUD operations
- `API` - API calls
- `VIEW` - View operations
- `DT` - DataTable operations
- `DELETE` - Delete operations

## Next Steps

- See [Frontend Components](./21-frontend-components.md) for component patterns
- See [JavaScript Modules](./22-javascript-modules.md) for module documentation
- See [Creating a New Module](./50-creating-new-module.md) for development guide
