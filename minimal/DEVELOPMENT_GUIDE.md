# Minimal Folder Development Guide

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Google Apps Script Specific Behaviors](#google-apps-script-specific-behaviors)
3. [Folder Structure](#folder-structure)
4. [Coding Conventions](#coding-conventions)
5. [Modularization Technique](#modularization-technique)
6. [Backend Communication Patterns](#backend-communication-patterns)
7. [DOM Element Positioning](#dom-element-positioning)
8. [State Management](#state-management)
9. [Event Handling Patterns](#event-handling-patterns)
10. [Loading States](#loading-states)
11. [Error Handling](#error-handling)
12. [Common Patterns](#common-patterns)
13. [Debugging Techniques](#debugging-techniques)
14. [Performance Considerations](#performance-considerations)

---

## Architecture Overview

### Single Page Application (SPA) Pattern
This is a client-side SPA running on Google Apps Script. The page never fully reloads - all navigation happens via AJAX.

```
User clicks nav link
    ↓
Router intercepts click
    ↓
Show loading overlay
    ↓
AJAX request to backend for new page HTML
    ↓
Replace main-content div
    ↓
Load page-specific JavaScript
    ↓
Hide loading overlay
```

### Template System
Google Apps Script uses HTML template evaluation with `<?!= ?>` syntax:

```html
<!-- Backend (Code.gs) -->
let template = {
  pageContent: HtmlService.createHtmlOutputFromFile('minimal/pages/dashboard')
    .getContent()
};

<!-- Frontend (Index.html) -->
<div id="main-content">
  <?!= pageContent ?>
</div>
```

**Key Rule**: All HTML fragments are injected via includes on the server side BEFORE the page loads.

---

## Google Apps Script Specific Behaviors

### 1. **No async/await with Script Loading**
**DO NOT USE:**
```javascript
// ❌ WRONG - Unreliable in GAS
script.onload = async () => {
  await SomeFunction();
};
```

**USE INSTEAD:**
```javascript
// ✅ RIGHT - Synchronous execution
SomeFunction();
```

**Reason**: GAS doesn't reliably wait for async/await in script.onload. Use synchronous execution.

### 2. **HTML Template Includes**
Server-side includes happen at page load time:

```javascript
// In Code.gs or Controller
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}
```

```html
<!-- In Index.html -->
<?!= sidebar ?>
<?!= toasts ?>
<?!= pageScripts ?>
```

### 3. **Script Loading Order**
Scripts load synchronously via `<?!= ?>` includes. Dependencies must be loaded BEFORE dependents:

```html
<!-- Load order matters! -->
<?!= debug_panel_script ?>   <!-- 1. Utilities first -->
<?!= api_helper ?>            <!-- 2. API helpers -->
<??= ui_helpers ?>            <!-- 3. UI utilities -->
<??= modals ?>                <!-- 4. Modal system -->
<??= router ?>                <!-- 5. Navigation -->
<??= pageScripts ?>           <!-- 6. Page-specific scripts -->
```

### 4. **Global Namespace Pollution**
All inline scripts share the same global scope. Use namespacing:

```javascript
// ❌ BAD - Global variables
let draggedNode = null;
let currentData = null;

// ✅ GOOD - Encapsulated
const OrgDiagram = (function() {
  'use strict';

  let draggedNode = null;
  let currentData = null;

  return {
    init() { ... },
    render() { ... }
  };
})();
```

### 5. **No setTimeout for Script Loading Dependencies**
**DO NOT USE:**
```javascript
// ❌ WRONG - Race conditions
setTimeout(() => {
  if (typeof OrgDiagram !== 'undefined') {
    OrgDiagram.init();
  }
}, 100);
```

**USE INSTEAD:**
```javascript
// ✅ RIGHT - Direct execution (scripts load synchronously)
if (typeof OrgDiagram !== 'undefined') {
  OrgDiagram.init();
}
```

---

## Folder Structure

```
minimal/
├── pages/                      # Page HTML fragments
│   ├── dashboard.html         # Dashboard page content
│   ├── organization.html      # Organization page (table + diagram views)
│   ├── kpi.html              # KPI page
│   └── settings.html         # Settings page
│
├── assets/js/                  # All JavaScript modules
│   ├── app_init.html         # App initialization (runs first)
│   ├── router.html           # AJAX navigation system
│   ├── ajax_loader.html      # Loading overlay management
│   ├── api_helper.html       # Backend API calls
│   ├── ui_helpers.html       # UI utilities (toasts, modals)
│   ├── debug_panel_script.html # Debug logging
│   ├── settings_manager.html # User preferences (localStorage)
│   ├── modals.html           # Modal management
│   ├── delete_confirm.html   # Delete confirmation system
│   ├── datatables_manager.html # DataTables initialization
│   ├── crud_operations.html  # Generic CRUD helpers
│   │
│   ├── view-toggle.html      # View switcher (table/diagram)
│   ├── org-diagram.html      # D3.js diagram component
│   ├── org-diagram-context-menu.html # Node context menu
│   ├── org-diagram-tooltip.html  # Hover tooltips
│   ├── org-diagram-controls.html  # Zoom controls
│   │
│   ├── organization_crud.html # Organization-specific CRUD
│   └── organization_datatables.html # Organization table views
│
├── layout/
│   ├── sidebar.html          # Navigation sidebar
│   ├── loading_overlay.html  # Full-page loading spinner
│   ├── toasts.html           # Toast notification container
│   └── modals/
│       └── organization_modals.html # CRUD modals
│
├── headerTitle.html           # Page title
├── linkReel.html             # CSS links
└── minimalStyle.html         # Custom CSS styles
```

---

## Coding Conventions

### 1. File Naming

**JavaScript Files:**
- Use `snake_case.html` for all JS files (GAS requirement)
- Name describes functionality: `org_diagram.html`, `view_toggle.html`
- Page-specific: `<page>_<feature>.html` (e.g., `organization_crud.html`)

**HTML Files:**
- Use `snake_case.html` for HTML fragments
- Descriptive names: `sidebar.html`, `loading_overlay.html`

### 2. Variable Naming

```javascript
// camelCase for variables and functions
let draggedNode = null;
let currentFilterType = '';

// PascalCase for namespaces/objects
const OrgDiagram = { ... };
const ViewState = { ... };

// UPPER_SNAKE_CASE for constants
const STORAGE_KEY = 'org-view-preference';

// Descriptive names - avoid abbreviations
let directorateId = 'abc123';  // ✅ GOOD
let dirId = 'abc123';          // ❌ BAD
```

### 3. Function Organization

Each module should follow this structure:

```javascript
<script>
// ============================================================================
// MODULE NAME - Brief description
// ============================================================================

// 1. Global/state variables
let currentState = null;
let isInitialized = false;

// 2. Configuration/constants
const CONFIG = {
    option1: 'value',
    option2: 42
};

// 3. Namespace/Module pattern
const ModuleName = (function() {
    'use strict';

    // 4. Private variables
    let privateVar = null;

    // 5. Public API
    return {
        // Initialization
        init() {
            debugLog('MODULE', '=== init START ===');
            // ... code ...
            debugLog('MODULE', '=== init COMPLETE ===');
        },

        // Public methods
        publicMethod() {
            // ... code ...
        },

        // Private methods (use underscore prefix)
        _privateMethod() {
            // ... code ...
        }
    };
})();

// 6. Global functions (if needed)
function globalHelper() {
    // ... code ...
}

// 7. Event handlers (if attached globally)
document.addEventListener('DOMContentLoaded', () => {
    ModuleName.init();
});

// 8. Script load tracking
if (window.scriptLoadTracker) {
    window.scriptLoadTracker.loaded('module-name.html');
}

// 9. Logging
debugLog('MODULE', 'Module loaded successfully');
</script>
```

### 4. Comments

```javascript
// ============================================================================
// SECTION HEADER - Major sections get this
// ============================================================================

// Single-line comments for quick explanations

/**
 * Multi-line comment for functions
 * @param {string} param1 - Description of param1
 * @param {number} param2 - Description of param2
 * @returns {boolean} Description of return value
 */
function exampleFunction(param1, param2) {
    // Implementation
}

// IMPORTANT: Critical notes get this prefix
// TODO: Future work gets this prefix
// FIXME: Known issues get this prefix
```

### 5. Debug Logging

Use `debugLog()` for all debug output (controlled by settings):

```javascript
debugLog('MODULE', 'Message');                    // Simple message
debugLog('MODULE', 'Variable:', variable);        // With variable
debugLog('MODULE', '=== SECTION START ===');      // Section marker
debugLog('MODULE', 'FAIL Error message:', error); // Errors
debugLog('MODULE', 'OK Success message');         // Success
```

**Module Code:** Use uppercase shorthand for module identification:
- `DIAGRAM` for org-diagram
- `VIEW` for view-toggle
- `CONTEXT_MENU` for context-menu
- `CRUD` for CRUD operations

---

## Modularization Technique

### 1. Component Separation

Each UI feature is split into logical components:

```
Organization Diagram Feature:
├── org-diagram.html              # Core D3.js rendering
├── org-diagram-context-menu.html # Right-click menu
├── org-diagram-tooltip.html      # Hover tooltips
├── org-diagram-controls.html     # Zoom buttons
└── view-toggle.html              # Table/Diagram switcher
```

### 2. Module Communication

**Direct Function Calls:**
```javascript
// In org-diagram.html
const OrgDiagram = {
    init() { ... },
    reload() { ... }
};

// In view-toggle.html - direct call
function switchView(view) {
    if (view === 'diagram' && typeof OrgDiagram !== 'undefined') {
        OrgDiagram.init();
    }
}
```

**Global Functions:**
```javascript
// In org-diagram-context-menu.html - global function
function showContextMenu(event, node) {
    // ... show menu ...
}

// In org-diagram.html - call global function
handleNodeRightClick(event, d) {
    if (typeof showContextMenu === 'function') {
        showContextMenu(event, {
            id: d.data.id,
            type: d.data.type
        });
    }
}
```

**Data Sharing:**
```javascript
// Shared state in minimal scope
let currentView = 'table';  // In view-toggle.html

// Accessed from other modules
function refreshCurrentView() {
    if (currentView === 'diagram') {
        OrgDiagram.reload();
    }
}
```

### 3. Namespace Pattern

Use IIFE (Immediately Invoked Function Expression) to avoid pollution:

```javascript
const OrgDiagram = (function() {
    'use strict';

    // Private variables (not accessible outside)
    let svg = null;
    let g = null;
    let currentData = null;

    // Public API (returned object)
    return {
        init() {
            // Can access private variables
            svg = d3.select('#container');
        },

        getData() {
            return currentData;  // Read-only access
        },

        // underscore prefix = "private" (by convention)
        _internalHelper() {
            // Still public, but signals "internal use"
        }
    };
})();

// Usage
OrgDiagram.init();           // ✅ Works
OrgDiagram._internalHelper(); // ⚠️ Technically works, but discouraged
console.log(OrgDiagram.svg); // ❌ undefined - private
```

### 4. Script Load Tracking

Track which scripts have loaded to prevent race conditions:

```javascript
// In Index.html (loaded first)
window.scriptLoadTracker = window.scriptLoadTracker || {
    scripts: [],
    log: function(scriptName, status) {
        const timestamp = new Date().toISOString();
        const entry = `[${timestamp}] ${status}: ${scriptName}`;
        this.scripts.push(entry);
        console.log(entry);
    },
    loaded: function(scriptName) {
        this.log(scriptName, 'LOADED');
    },
    error: function(scriptName, error) {
        this.log(scriptName, 'ERROR - ' + error);
    }
};

// In each module script
if (window.scriptLoadTracker) {
    window.scriptLoadTracker.loaded('module-name.html');
}
```

---

## Backend Communication Patterns

### 1. API Helper Pattern

All backend calls go through `apiCall()`:

```javascript
// In api_helper.html
async function apiCall(endpoint, data = {}) {
    debugLog('API', 'Calling endpoint:', endpoint);

    try {
        const response = await google.script.run
            .withSuccessHandler(function(result) {
                if (result.success) {
                    debugLog('API', 'OK Endpoint:', endpoint, 'returned data');
                    return result.data;
                } else {
                    debugLog('API', 'FAIL Endpoint:', endpoint, 'error:', result.message);
                    showToast(result.message, 'error');
                    return null;
                }
            })
            .withFailureHandler(function(error) {
                debugLog('API', 'FAIL Endpoint:', endpoint, 'error:', error);
                showToast('Server error: ' + error, 'error');
                return null;
            })
            .API_Handler(endpoint, data);

    } catch (error) {
        debugLog('API', 'Exception calling endpoint:', endpoint, error);
        return null;
    }
}
```

### 2. Endpoint Naming Convention

```
<entity>/<action>

Examples:
- directorates/list      # Get all directorates
- directorates/get       # Get single directorate
- directorates/create    # Create new directorate
- directorates/update    # Update directorate
- directorates/delete    # Delete directorate
```

### 3. Response Format

**Success Response:**
```javascript
{
    success: true,
    data: {
        // Actual data
    },
    message: 'Operation successful'
}
```

**Error Response:**
```javascript
{
    success: false,
    message: 'Error description',
    errors: {
        field1: 'Error message for field1',
        field2: 'Error message for field2'
    }
}
```

### 4. Call Pattern with Error Handling

```javascript
// ✅ CORRECT Pattern
async function loadDirectorates() {
    debugLog('CRUD', 'Loading directorates...');

    try {
        const result = await apiCall('directorates/list');

        if (!result) {
            debugLog('CRUD', 'FAIL No result from API');
            return [];
        }

        if (result.success) {
            debugLog('CRUD', 'OK Loaded', result.data.length, 'directorates');
            return result.data;
        } else {
            debugLog('CRUD', 'FAIL API returned error:', result.message);
            showToast(result.message, 'error');
            return [];
        }
    } catch (error) {
        debugLog('CRUD', 'EXCEPTION Error loading directorates:', error.message);
        showToast('Failed to load directorates: ' + error.message, 'error');
        return [];
    }
}
```

### 5. Multiple Parallel Calls

Use `Promise.all()` for independent calls:

```javascript
// ✅ GOOD - Parallel loading
async function loadAllData() {
    const [directorates, workUnits, affairs, positions] = await Promise.all([
        apiCall('directorates/list'),
        apiCall('work-units/list'),
        apiCall('affairs/list'),
        apiCall('positions/list')
    ]);

    // Process results
}

// ❌ BAD - Sequential (slow)
async function loadAllDataSlow() {
    const directorates = await apiCall('directorates/list');
    const workUnits = await apiCall('work-units/list');
    const affairs = await apiCall('affairs/list');
    const positions = await apiCall('positions/list');
}
```

### 6. Backend Rush Avoidance

**Problem**: If user clicks multiple times quickly, multiple requests fire.

**Solution**: Loading state + disable buttons:

```javascript
// In CRUD operations
async function saveDirectorate() {
    // Check if already saving
    if (isSaving) {
        debugLog('CRUD', 'Save already in progress, ignoring click');
        return;
    }

    isSaving = true;
    const saveBtn = document.getElementById('save-directorate-btn');
    if (saveBtn) saveBtn.disabled = true;

    try {
        // ... save logic ...
    } finally {
        isSaving = false;
        if (saveBtn) saveBtn.disabled = false;
    }
}
```

---

## DOM Element Positioning

### 1. Element Access Patterns

```javascript
// ✅ GOOD - Cache selectors when used multiple times
const container = document.getElementById('org-diagram-container');
if (container) {
    container.innerHTML = '';
}

// ❌ BAD - Repeated selector lookups
document.getElementById('org-diagram-container').innerHTML = '';
document.getElementById('org-diagram-container').style.width = '100%';
```

### 2. Defensive Programming

Always check for element existence:

```javascript
// ✅ CORRECT
const tableView = document.getElementById('table-view');
const diagramView = document.getElementById('diagram-view');

if (!tableView || !diagramView) {
    debugLog('VIEW', 'FAIL Required elements not found - not on organization page');
    return;
}

// ❌ WRONG - No null check
document.getElementById('table-view').classList.add('active');
```

### 3. Transform-Based Positioning (D3.js)

For drag-and-drop with D3.js, use `transform` attribute:

```javascript
// Initial position
nodeElement
    .attr('transform', d => `translate(${d.y},${d.x})`);

// Update during drag
nodeElement
    .attr('transform', `translate(${newX},${newY})`);

// Parse current position
const transform = d3.select(nodeElement).attr('transform') || '';
const match = transform.match(/translate\(([^,]+),\s*([^)]+)\)/);
if (match) {
    const currentX = parseFloat(match[1]);
    const currentY = parseFloat(match[2]);
}
```

### 4. Absolute Positioning for Floating Elements

```css
/* Floating controls */
.org-diagram-controls {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 1000;
}

/* Context menu */
.org-context-menu {
    position: absolute;
    z-index: 3000;
}

/* Loading overlay */
.modal-loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1060; /* Above Bootstrap modal backdrop (1055) */
}
```

### 5. Z-Index Hierarchy

```
Level     Usage
-----     -----
0-999     Normal content
1000      Diagram controls, floating buttons
1055      Bootstrap modal backdrop
1060      Modal loading overlay
2000      Tooltips
3000      Context menus
5000      Toast notifications
10000     Canvas context menus
```

---

## State Management

### 1. Local State Pattern

```javascript
// Module-level state
let currentFilterType = '';
let currentFilterStatus = '';
let collapsedIds = new Set();

// Update function
function filterByType(type) {
    currentFilterType = type;
    render();
}
```

### 2. localStorage for Persistence

```javascript
const ViewState = {
    STORAGE_KEY: 'org-view-preference',

    save(view) {
        try {
            localStorage.setItem(this.STORAGE_KEY, view);
            debugLog('VIEW', 'Saved view preference: ' + view);
        } catch (e) {
            debugLog('VIEW', 'Could not save view preference:', e);
        }
    },

    load() {
        try {
            const saved = localStorage.getItem(this.STORAGE_KEY);
            if (saved === 'table' || saved === 'diagram') {
                return saved;
            }
        } catch (e) {
            debugLog('VIEW', 'Could not load view preference:', e);
        }
        return 'table'; // Default
    }
};
```

### 3. Cache Strategy

```javascript
// In organization_datatables.html
const OrganizationManager = {
    cache: {
        directorate: null,
        'work-unit': null,
        affair: null,
        position: null
    },

    getCache(type) {
        return this.cache[type];
    },

    setCache(type, data) {
        this.cache[type] = data;
    },

    invalidate(type) {
        this.cache[type] = null;
    },

    invalidateAll() {
        Object.keys(this.cache).forEach(key => {
            this.cache[key] = null;
        });
    }
};
```

---

## Event Handling Patterns

### 1. Event Delegation vs Direct Binding

```javascript
// ✅ GOOD - Event delegation for dynamic elements
document.addEventListener('click', function(e) {
    if (e.target.closest('.org-context-menu-item')) {
        // Handle menu item click
    }
});

// ✅ GOOD - Direct binding for static elements
const saveBtn = document.getElementById('save-btn');
if (saveBtn) {
    saveBtn.addEventListener('click', handleSave);
}

// ❌ BAD - Direct binding for dynamic elements (won't work)
document.querySelectorAll('.dynamic-item').forEach(item => {
    item.addEventListener('click', handleClick);
});
```

### 2. Event Propagation Control

Always use `stopPropagation()` for nested clickable elements:

```javascript
nodes
    .on('click', (event, d) => {
        event.stopPropagation(); // Prevent zoom from firing
        this.handleNodeClick(event, d);
    })
    .on('contextmenu', (event, d) => {
        event.stopPropagation();
        event.preventDefault();
        this.handleNodeRightClick(event, d);
    });
```

### 3. One-Time Event Listeners

```javascript
// Use { once: true } for auto-cleanup
window.addEventListener('mouseup', dragEndHandler, { once: true });

// Manual cleanup
const dragHandler = (e) => this.dragged(e, d);
const dragEndHandler = (e) => {
    this.dragEnded(e, d);
    window.removeEventListener('mousemove', dragHandler);
    window.removeEventListener('mouseup', dragEndHandler);
};
window.addEventListener('mousemove', dragHandler);
window.addEventListener('mouseup', dragEndHandler);
```

### 4. Prevent Duplicate Handlers

```javascript
let handlersSetup = false;

function setupHandlers() {
    if (handlersSetup) {
        debugLog('MODULE', 'Handlers already setup, skipping');
        return;
    }

    // ... setup handlers ...

    handlersSetup = true;
    debugLog('MODULE', 'Handlers setup complete');
}
```

---

## Loading States

### 1. Page-Level Loading

```javascript
// In router.html
function navigateTo(page) {
    // Show loading overlay
    showLoading();

    // AJAX call for page content
    google.script.run
        .withSuccessHandler(function(content) {
            // Replace content
            document.getElementById('main-content').innerHTML = content;

            // Load page scripts
            loadPageScripts(page);

            // Hide loading after scripts load
            setTimeout(hideLoading, 500);
        })
        .getPageContent(page);
}
```

### 2. Component-Level Loading

```javascript
// In org-diagram.html
showLoadingIndicator(container) {
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'diagram-loading';
    loadingDiv.style.position = 'absolute';
    loadingDiv.style.top = '50%';
    loadingDiv.style.left = '50%';
    loadingDiv.style.transform = 'translate(-50%, -50%)';
    loadingDiv.style.zIndex = '1000';
    loadingDiv.innerHTML = `
        <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>
        <div class="mt-3 text-muted">Loading organization data...</div>
    `;
    container.appendChild(loadingDiv);
}

hideLoadingIndicator() {
    const loadingDiv = document.getElementById('diagram-loading');
    if (loadingDiv) {
        loadingDiv.remove();
    }
}
```

### 3. Modal Loading

```css
.modal-loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(255, 255, 255, 0.85);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1060; /* Above Bootstrap modal backdrop */
    border-radius: 8px;
}
```

```javascript
function showModalLoading(modalBody) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-loading-overlay';
    overlay.innerHTML = `
        <div class="text-center">
            <div class="spinner-border text-primary" role="status"></div>
            <div class="mt-2 text-muted">Loading...</div>
        </div>
    `;
    modalBody.appendChild(overlay);
}

function hideModalLoading(modalBody) {
    const overlay = modalBody.querySelector('.modal-loading-overlay');
    if (overlay) {
        overlay.remove();
    }
}
```

### 4. Button Loading States

```javascript
// Disable and show loading text
function setButtonLoading(btn, originalText) {
    btn.disabled = true;
    btn.dataset.originalText = originalText;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Loading...';
}

// Restore button
function restoreButton(btn) {
    btn.disabled = false;
    const originalText = btn.dataset.originalText || 'Save';
    btn.textContent = originalText;
}
```

---

## Error Handling

### 1. Try-Catch-Finally Pattern

```javascript
async function saveData() {
    debugLog('CRUD', '=== save START ===');

    try {
        // 1. Validate
        const validationError = validateForm();
        if (validationError) {
            showToast(validationError, 'error');
            return;
        }

        // 2. Collect data
        const data = collectFormData();
        debugLog('CRUD', 'Data to save:', data);

        // 3. API call
        const result = await apiCall('entity/create', data);

        if (!result || !result.success) {
            debugLog('CRUD', 'FAIL Save failed');
            showToast('Failed to save: ' + (result?.message || 'Unknown error'), 'error');
            return;
        }

        // 4. Success
        debugLog('CRUD', 'OK Save successful');
        showToast('Saved successfully', 'success');

        // 5. Refresh
        await refreshTable();
        closeModal();

    } catch (error) {
        debugLog('CRUD', 'EXCEPTION Save error:', error.message);
        showToast('Error: ' + error.message, 'error');
    } finally {
        // Always cleanup
        hideLoading();
        enableSaveButton();
        debugLog('CRUD', '=== save COMPLETE ===');
    }
}
```

### 2. Promise Error Handling

```javascript
// ✅ CORRECT - Always handle errors
loadDirectorates()
    .then(data => {
        processData(data);
    })
    .catch(error => {
        debugLog('MODULE', 'FAIL Load error:', error);
        showToast('Failed to load data', 'error');
    });

// ✅ CORRECT - With async/await
try {
    const data = await loadDirectorates();
    processData(data);
} catch (error) {
    debugLog('MODULE', 'FAIL Load error:', error);
    showToast('Failed to load data', 'error');
}

// ❌ WRONG - No error handling
loadDirectorates().then(data => processData(data));
```

### 3. Defensive Null Checks

```javascript
// ✅ CORRECT - Chain of defensive checks
function processData(data) {
    if (!data) {
        debugLog('MODULE', 'FAIL No data provided');
        return;
    }

    if (!Array.isArray(data.items)) {
        debugLog('MODULE', 'FAIL items is not an array');
        return;
    }

    if (data.items.length === 0) {
        debugLog('MODULE', 'WARN No items to process');
        return;
    }

    // Safe to process
    data.items.forEach(item => {
        // ... process item ...
    });
}
```

---

## Common Patterns

### 1. View Toggle Pattern

```javascript
// View state
let currentView = 'table'; // 'table' or 'diagram'

function switchView(view) {
    const tableView = document.getElementById('table-view');
    const diagramView = document.getElementById('diagram-view');

    if (!tableView || !diagramView) {
        debugLog('VIEW', 'FAIL Required elements not found');
        return;
    }

    if (view === 'table') {
        // Show table, hide diagram
        tableView.classList.add('active');
        diagramView.style.display = 'none';

        // Update buttons
        document.getElementById('table-view-btn').classList.add('active');
        document.getElementById('diagram-view-btn').classList.remove('active');

        // Destroy diagram to free resources
        if (typeof OrgDiagram !== 'undefined' && OrgDiagram.svg) {
            OrgDiagram.destroy();
        }

        currentView = 'table';
    } else {
        // Show diagram, hide table
        diagramView.style.display = 'block';
        tableView.classList.remove('active');

        // Update buttons
        document.getElementById('diagram-view-btn').classList.add('active');
        document.getElementById('table-view-btn').classList.remove('active');

        // Initialize diagram
        if (typeof OrgDiagram !== 'undefined') {
            OrgDiagram.init();
        }

        currentView = 'diagram';
    }

    // Save preference
    ViewState.save(view);
}

// Refresh current view after CRUD
function refreshCurrentView() {
    if (currentView === 'diagram' && typeof OrgDiagram !== 'undefined') {
        OrgDiagram.reload();
    } else {
        // Table view auto-refreshes via DataTables
    }
}
```

### 2. CRUD Modal Pattern

```javascript
function showModal(type, id = null, parentId = null) {
    debugLog('MODAL', '=== showModal START === type=' + type + ', id=' + (id || 'new'));

    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');

    if (!modalTitle || !modalBody) {
        debugLog('MODAL', 'FAIL Modal elements not found');
        return;
    }

    // Set title
    modalTitle.textContent = id ? 'Edit ' + type : 'Add ' + type;

    // Show loading
    showModalLoading(modalBody);

    // Build form (sync or async)
    buildForm(type, modalBody, id)
        .then(() => {
            // Pre-select parent if provided
            if (parentId) {
                preselectParentDropdown(type, parentId);
            }

            // Hide loading
            hideModalLoading(modalBody);

            // Show modal
            const modal = new bootstrap.Modal(document.getElementById('crud-modal'));
            modal.show();
        })
        .catch(error => {
            hideModalLoading(modalBody);
            showToast('Failed to load form: ' + error.message, 'error');
        });
}
```

### 3. DataTable Initialization Pattern

```javascript
function initializeDirectoratesTable() {
    debugLog('DATATABLES', 'Initializing directorates table');

    const table = $('#directorates-table').DataTable({
        data: [],
        columns: [
            { data: 'directorate_code' },
            { data: 'directorate_name' },
            { data: 'description' },
            {
                data: null,
                render: function(data, type, row) {
                    return `
                        <button class="btn btn-sm btn-outline-primary" onclick="showModal('directorate', '${row.directorate_id}')">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteItem('directorate', '${row.directorate_id}')">
                            <i class="bi bi-trash"></i>
                        </button>
                    `;
                }
            }
        ],
        order: [[0, 'asc']],
        pageLength: 25,
        language: {
            emptyTable: 'No directorates found'
        }
    });

    return table;
}
```

### 4. Delete Confirmation Pattern

```javascript
// Global delete context
window.deleteContext = {
    mode: null,        // 'single' or 'cascade'
    type: null,        // Entity type
    id: null,          // Entity ID
    name: null,        // Entity name (for display)
    childrenCount: 0   // Number of children (for cascade warning)
};

// Trigger delete
function deleteItem(type, id) {
    debugLog('DELETE', 'Delete requested for:', type, id);

    // Check for children
    const childrenCount = getChildrenCount(type, id);

    if (childrenCount > 0) {
        // Cascade delete
        window.deleteContext = {
            mode: 'cascade',
            type: type,
            id: id,
            name: getEntityName(type, id),
            childrenCount: childrenCount
        };

        showCascadeDeleteConfirmation();
    } else {
        // Single delete
        window.deleteContext = {
            mode: 'single',
            type: type,
            id: id,
            name: getEntityName(type, id),
            childrenCount: 0
        };

        showDeleteConfirmation();
    }
}

// Execute delete (in delete_confirm.html)
async function executeDelete() {
    const ctx = window.deleteContext;

    showDeleteLoading('executeDelete');

    try {
        const result = await apiCall(`${ctx.type}s/delete`, {
            [`${ctx.type}_id`]: ctx.id,
            cascade: ctx.mode === 'cascade'
        });

        if (result && result.success) {
            showToast(`${ctx.type} deleted successfully`, 'success');
        } else {
            showToast('Failed to delete: ' + (result?.message || 'Unknown error'), 'error');
        }
    } catch (error) {
        showToast('Error: ' + error.message, 'error');
    } finally {
        hideDeleteLoading('executeDelete');
        await refreshCurrentView();
    }
}
```

### 5. Drag and Drop Pattern (D3.js)

```javascript
// State tracking
let draggedNode = null;
let isDragging = false;
let dragAnimationId = null;

// Element maps for link updates
let nodeElementsMap = new Map();    // nodeId -> element
let linkElementsMap = new Map();    // sourceId-targetId -> element

// 1. Store element references during render
function render() {
    // Clear maps
    nodeElementsMap.clear();
    linkElementsMap.clear();

    // Store link references
    g.selectAll('.org-link')
        .data(links)
        .join('path')
        .attr('id', d => `link-${d.source.data.id}-${d.target.data.id}`)
        .each(function(d) {
            const linkKey = `${d.source.data.id}-${d.target.data.id}`;
            linkElementsMap.set(linkKey, this);
            this._linkSource = d.source.data.id;
            this._linkTarget = d.target.data.id;
        });

    // Store node references
    nodes.each(function(d) {
        nodeElementsMap.set(d.data.id, this);
        this._baseX = d.y;
        this._baseY = d.x;
    });
}

// 2. Drag start
function dragStarted(event, d) {
    event.stopPropagation();

    const nodeElement = event.currentTarget;

    // Cancel any existing animation
    if (dragAnimationId) {
        cancelAnimationFrame(dragAnimationId);
    }

    draggedNode = {
        element: nodeElement,
        data: d,
        nodeId: d.data.id,
        startX: event.clientX,
        startY: event.clientY,
        currentX: 0,
        currentY: 0
    };

    // Get current position
    const transform = d3.select(nodeElement).attr('transform') || '';
    const match = transform.match(/translate\(([^,]+),\s*([^)]+)\)/);
    if (match) {
        draggedNode.currentX = parseFloat(match[1]);
        draggedNode.currentY = parseFloat(match[2]);
    }

    // Visual feedback
    d3.select(nodeElement).style('opacity', '0.8');
    isDragging = true;
}

// 3. Drag move (with requestAnimationFrame)
function dragged(event, d) {
    if (!draggedNode || !isDragging) return;

    const dx = event.clientX - draggedNode.startX;
    const dy = event.clientY - draggedNode.startY;

    draggedNode.startX = event.clientX;
    draggedNode.startY = event.clientY;
    draggedNode.currentX += dx;
    draggedNode.currentY += dy;

    // Schedule animation frame
    if (dragAnimationId) {
        cancelAnimationFrame(dragAnimationId);
    }

    dragAnimationId = requestAnimationFrame(() => {
        updateDragPosition();
    });
}

// 4. Update position (called by animation frame)
function updateDragPosition() {
    if (!draggedNode) return;

    const newX = draggedNode.currentX;
    const newY = draggedNode.currentY;

    // Update node
    d3.select(draggedNode.element)
        .attr('transform', `translate(${newX},${newY})`);

    // Update connected links
    updateConnectedLinks(draggedNode.nodeId, newX, newY);

    dragAnimationId = null;
}

// 5. Update links
function updateConnectedLinks(nodeId, nodeX, nodeY) {
    linkElementsMap.forEach((linkElement, linkKey) => {
        const sourceId = linkElement._linkSource;
        const targetId = linkElement._linkTarget;

        if (sourceId === nodeId || targetId === nodeId) {
            const otherNodeId = sourceId === nodeId ? targetId : sourceId;
            const otherNode = nodeElementsMap.get(otherNodeId);

            if (otherNode) {
                // Get other node position
                const otherTransform = d3.select(otherNode).attr('transform') || '';
                const match = otherTransform.match(/translate\(([^,]+),\s*([^)]+)\)/);
                const otherX = match ? parseFloat(match[1]) : otherNode._baseX;
                const otherY = match ? parseFloat(match[2]) : otherNode._baseY;

                // Calculate path
                const startX = sourceId === nodeId ? nodeX : otherX;
                const startY = sourceId === nodeId ? nodeY : otherY;
                const endX = targetId === nodeId ? nodeX : otherX;
                const endY = targetId === nodeId ? nodeY : otherY;

                // Update link
                const path = d3.linkHorizontal()
                    .x(d => d.x)
                    .y(d => d.y)({
                        source: { x: startX, y: startY },
                        target: { x: endX, y: endY }
                    });

                d3.select(linkElement).attr('d', path);
            }
        }
    });
}

// 6. Drag end
function dragEnded(event, d) {
    if (!draggedNode) return;

    if (dragAnimationId) {
        cancelAnimationFrame(dragAnimationId);
    }

    // Restore visual feedback
    d3.select(draggedNode.element)
        .style('opacity', '1')
        .style('cursor', 'pointer');

    showToast('Node position updated (visual preview)', 'info');

    draggedNode = null;
    isDragging = false;
}
```

---

## Debugging Techniques

### 1. Debug Logging

```javascript
// Use debugLog() instead of console.log()
debugLog('MODULE', 'Message');
debugLog('MODULE', 'Variable:', variable);
debugLog('MODULE', '=== SECTION START ===');

// Log levels
debugLog('MODULE', 'OK Success message');
debugLog('MODULE', 'FAIL Error:', error);
debugLog('MODULE', 'WARN Warning message');
```

### 2. Debug Panel

Toggle debug panel with Ctrl+Shift+D:

```javascript
// In settings_manager.html
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        debugPanel.toggle();
    }
});
```

### 3. Script Load Tracking

```javascript
// Check which scripts loaded
console.log('Scripts loaded:', window.scriptLoadTracker.scripts);

// Check specific function availability
console.log('typeof OrgDiagram.init:', typeof OrgDiagram.init);
```

### 4. Network Debugging

```javascript
// Log all API calls
debugLog('API', 'Calling endpoint:', endpoint);
debugLog('API', 'Request data:', data);
debugLog('API', 'Response:', result);
```

---

## Performance Considerations

### 1. Minimize DOM Manipulation

```javascript
// ✅ GOOD - Batch updates
const fragment = document.createDocumentFragment();
items.forEach(item => {
    const div = document.createElement('div');
    div.textContent = item.name;
    fragment.appendChild(div);
});
container.appendChild(fragment);

// ❌ BAD - Multiple reflows
items.forEach(item => {
    const div = document.createElement('div');
    div.textContent = item.name;
    container.appendChild(div);  // Triggers reflow each time
});
```

### 2. Use requestAnimationFrame for Animations

```javascript
// ✅ GOOD - Smooth 60fps animation
function animate() {
    if (dragAnimationId) {
        cancelAnimationFrame(dragAnimationId);
    }
    dragAnimationId = requestAnimationFrame(() => {
        updatePosition();
    });
}

// ❌ BAD - Janky animation
function animate() {
    updatePosition();  // Runs on every mousemove
}
```

### 3. Debounce Search Input

```javascript
let searchTimeout;
function search(query) {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        performSearch(query);
    }, 300);
}
```

### 4. Lazy Load Components

```javascript
// Only initialize diagram when switching to diagram view
function switchView(view) {
    if (view === 'diagram') {
        diagramView.style.display = 'block';
        if (typeof OrgDiagram !== 'undefined') {
            OrgDiagram.init();  // Initialize on first use
        }
    }
}
```

### 5. Destroy When Not Needed

```javascript
// Clean up diagram when switching to table view
function switchView(view) {
    if (view === 'table') {
        if (typeof OrgDiagram !== 'undefined' && OrgDiagram.svg) {
            OrgDiagram.destroy();  // Free memory
        }
    }
}
```

---

## Summary: Quick Reference

### DO's ✅

- Use namespacing/IIFE to avoid global pollution
- Use `debugLog()` for all debug output
- Always check for null/undefined before using elements
- Use `event.stopPropagation()` for nested clickable elements
- Use `requestAnimationFrame` for smooth animations
- Use `Promise.all()` for parallel API calls
- Cache selector results when used multiple times
- Handle errors with try-catch-finally
- Use defensive programming (check everything)
- Store element references during render for later updates

### DON'Ts ❌

- Don't use async/await with script.onload in GAS
- Don't use setTimeout for script loading dependencies
- Don't pollute global namespace unnecessarily
- Don't forget to cleanup event listeners
- Don't use direct binding for dynamic elements
- Don't make sequential API calls when parallel is possible
- Don't forget to disable buttons during operations
- Don't use abbreviations in variable names
- Don't skip error handling
- Don't forget to null-check before element access

### File Templates

**JavaScript Module Template:**
```javascript
<script>
// ============================================================================
// MODULE_NAME - Brief description
// ============================================================================

// State variables
let currentState = null;

// Configuration
const CONFIG = {
    option1: 'value'
};

// Module
const ModuleName = (function() {
    'use strict';

    return {
        init() {
            debugLog('MODULE', '=== init START ===');
            // ... code ...
            debugLog('MODULE', '=== init COMPLETE ===');
        }
    };
})();

// Script tracking
if (window.scriptLoadTracker) {
    window.scriptLoadTracker.loaded('module-name.html');
}
</script>
```

---

## Conclusion

This guide documents the coding patterns, conventions, and Google Apps Script specific behaviors used in the minimal folder. Follow these patterns when:

1. Creating new pages/features
2. Refactoring existing code
3. Debugging issues
4. Onboarding new developers

**Key Takeaways:**

- Google Apps Script has specific limitations (no async/await for script loading)
- Modularization is achieved through file separation and namespacing
- All state is module-level or localStorage
- Component communication via direct function calls or global functions
- Always use defensive programming
- Debug with `debugLog()` and the debug panel
- Performance matters - use requestAnimationFrame, batch DOM updates, lazy loading

For questions or clarifications, refer to the existing code in `minimal/assets/js/` as examples of these patterns in action.
