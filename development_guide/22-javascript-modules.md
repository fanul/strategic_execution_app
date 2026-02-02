# JavaScript Modules Reference

## Overview

All frontend JavaScript is organized into modular IIFE files in `assets/js/`. Each file encapsulates its functionality and exposes a public API.

## Module Pattern

```javascript
<script>
const MyModule = (function() {
    'use strict';

    // Private state
    let privateState = {};
    let privateVariable = 'value';

    // Private functions
    function privateFunction(arg) {
        // Implementation
        return result;
    }

    // Public API
    return {
        // Initialize module
        init: function() {
            console.log('MyModule initialized');
        },

        // Public method
        publicMethod: function(arg) {
            return privateFunction(arg);
        },

        // Getter for private state
        getState: function() {
            return privateState;
        }
    };
})();

// Make specific functions global for onclick handlers
window.myPublicFunction = MyModule.publicMethod;

// Auto-initialize on DOM ready
window.addEventListener('DOMContentLoaded', function() {
    MyModule.init();
});

// Track script loading
if (window.scriptLoadTracker) {
    window.scriptLoadTracker.loaded('my_module.html');
}
</script>
```

## Core Modules

### api_helper.html

**Purpose**: API communication wrapper

**Functions**:
```javascript
async function apiCall(endpoint, data)
// Returns: Promise<{success, data, message}>
```

**Usage**:
```javascript
const result = await apiCall('users/list', { status: 'active' });
if (result.success) {
    console.log(result.data);
} else {
    showToast(result.message, 'error');
}
```

### ui_helpers.html

**Purpose**: Common UI utility functions

**Functions**:
```javascript
showToast(message, type)           // type: success, error, warning, info
showModal(modalType, entityId)     // Open modal for create/edit
closeModal(modalId)                // Close specific modal
showLoading() / hideLoading()      // Loading overlay
showConfirm(message, onConfirm)    // Confirmation dialog
```

### router.html

**Purpose**: SPA router for navigation

**Functions**:
```javascript
navigateTo(page, params)           // Navigate to page
getCurrentPage()                   // Get current page name
updatePageTitle(title)             // Update browser title
```

### modals.html

**Purpose**: Common modal functions

**Functions**:
```javascript
showModal(modalType, entityId)     // Show modal (create or edit mode)
populateModal(modalType, data)     // Populate modal with data
clearModal(modalId)                // Clear modal form
```

### ajax_loader.html

**Purpose**: AJAX loading indicator

**Functions**:
```javascript
showAjaxLoader()                   // Show loading spinner
hideAjaxLoader()                   // Hide loading spinner
```

### debug_panel_script.html

**Purpose**: Debug panel for development

**Functions**:
```javascript
debugLog(category, message, data)  // Log debug message
clearDebugLog()                    // Clear debug panel
toggleDebugPanel()                 // Show/hide panel
```

## CRUD Modules

### users_crud.html

**Purpose**: User CRUD operations

**Functions**:
```javascript
saveUser()                         // Create/update user
editUser(userId)                   // Edit user
deleteUser(userId)                 // Delete user
populateRolesDropdown()            // Populate roles in modal
```

### organization_crud.html

**Purpose**: Organization CRUD with cascade delete

**Functions**:
```javascript
saveDirectorate()                  // Save directorate
saveWorkUnit()                     // Save work unit
saveAffair()                       // Save affair
savePosition()                     // Save position
editItem(type, id)                 // Edit any org entity
deleteItem(type, id)               // Delete with cascade/reassign options
executeDelete()                    // Execute confirmed delete
```

### kpi_crud.html

**Purpose**: KPI CRUD operations

**Functions**:
```javascript
saveKPI()                          // Save KPI
editKPI(kpiId)                     // Edit KPI
deleteKPI(kpiId)                   // Delete KPI
recordProgress(kpiId)              // Record monthly progress
```

### okr_crud.html

**Purpose**: OKR CRUD operations

**Functions**:
```javascript
saveOKR()                          // Create/update OKR
submitOKR()                        // Submit for review
reviewOKR()                        // Review (approve/reject)
editOKR(okrId)                     // Edit OKR
deleteOKR(okrId)                   // Delete OKR
```

### strategic_crud.html

**Purpose**: Strategic planning CRUD

**Functions**:
```javascript
saveVision()                       // Save vision
saveMission()                      // Save mission
saveGoal()                         // Save goal
saveWorkUnitGoal()                 // Save work unit goal
approveItem(type, id)              // Approve vision/mission
```

### programs_crud.html

**Purpose**: Program CRUD operations

**Functions**:
```javascript
saveProgram()                      // Save program
saveActivity()                     // Save activity
deleteProgram(programId)           // Delete program
deleteActivity(activityId)         // Delete activity
```

### swot_crud.html

**Purpose**: SWOT CRUD operations

**Functions**:
```javascript
saveSWOTItem()                     // Save SWOT item
deleteSWOTItem(itemId)             // Delete SWOT item
getSWOTMatrix(goalId)              // Get SWOT matrix
```

### reports_crud.html

**Purpose**: Report generation

**Functions**:
```javascript
generateKPIReport(filters)         // Generate KPI report
generateOKRReport(filters)         // Generate OKR report
exportToCSV(data, filename)        // Export to CSV
exportToSheets(data)               // Export to Google Sheets
```

### notifications_crud.html

**Purpose**: Notification management

**Functions**:
```javascript
loadNotifications()                // Load user notifications
markAsRead(notificationId)         // Mark as read
markAllAsRead()                    // Mark all as read
deleteNotification(notificationId)  // Delete notification
```

## DataTable Modules

### datatables_manager.html

**Purpose**: Generic DataTable initialization

**Functions**:
```javascript
initializeDataTable(tableId, options)  // Initialize DataTable
destroyDataTable(tableId)              // Destroy DataTable instance
```

### organization_datatables.html

**Purpose**: Organization-specific DataTable manager with lazy loading

**API**:
```javascript
window.OrganizationManager = {
    initialize(): async void
    loadEntityDataIfNotCached(entityType): async void
    refreshEntityTable(crudType): async void
    clearFilters(entityType): void
    cache: { /* data cache */ }
}
```

## Organization Diagram Modules

### org-diagram.html

**Purpose**: D3.js hierarchical tree visualization

**API**:
```javascript
window.OrgDiagram = {
    init(): void                  // Initialize diagram
    reload(): async void          // Reload and re-render
    zoomIn(), zoomOut(), resetZoom()
    expandAll(), collapseAll()
    exportPNG()
    destroy(): void               // Clean up
}
```

### org-diagram-controls.html

**Purpose**: Diagram toolbar controls

**Functions**:
```javascript
initDiagramControls()             // Setup toolbar buttons
handleZoomIn(), handleZoomOut()
handleExpandAll(), handleCollapseAll()
handleExportPNG()
```

### org-diagram-tooltip.html

**Purpose**: Node tooltip on hover

**Functions**:
```javascript
showTooltip(d, node)              // Show tooltip for node
hideTooltip()                     // Hide tooltip
updateTooltipContent(d)           // Update tooltip content
```

### org-diagram-context-menu.html

**Purpose**: Right-click context menu

**Functions**:
```javascript
showContextMenu(d, node)          // Show context menu
hideContextMenu()                 // Hide context menu
handleView()                      // View node details
handleEdit()                      // Edit node
handleAddChild()                  // Add child node
handleDelete()                    // Delete node
```

## View Toggle

### view-toggle.html

**Purpose**: Switch between table and diagram views

**API**:
```javascript
window.ViewToggle = {
    init(): void                  // Auto-load saved view
    switchView('table' | 'diagram'): void
    refresh(): void               // Refresh current view
    toggleLegend(): void          // Minimize/maximize legend
    getCurrentView(): string      // Get current view
}
```

## Dashboard

### dashboard_widgets.html

**Purpose**: Dashboard widget initialization

**Functions**:
```javascript
loadDashboardWidgets()            // Load all widgets
loadKPISummary()                  // KPI summary widget
loadOKRSummary()                  // OKR summary widget
loadRecentActivities()            // Recent activities widget
loadPerformanceChart()            // Performance chart
```

## Authentication

### auth.html

**Purpose**: Authentication functions

**Functions**:
```javascript
login(username, password)         // User login
logout()                          // User logout
checkSession()                    // Check session validity
updateLastLogin()                 // Update last login time
```

## Settings

### settings_manager.html

**Purpose**: Application settings management

**Functions**:
```javascript
loadSettings()                    // Load settings
saveSettings()                    // Save settings
resetToDefaults()                 // Reset to defaults
```

## Delete Confirmation

### delete_confirm.html

**Purpose**: Enhanced delete confirmation dialogs

**Functions**:
```javascript
confirmDelete(type, id, name)     // Show delete confirmation
confirmCascadeDelete(type, id, childrenCount)  // Cascade delete confirmation
confirmReassign(type, id, alternatives)        // Reassign option
```

## Creating a New Module

See [Creating a New Module](./50-creating-new-module.md) for step-by-step guide.

## Next Steps

- See [Frontend Structure](./20-frontend-structure.md) for architecture
- See [Creating a CRUD Module](./51-creating-crud-module.md) for CRUD-specific guide
