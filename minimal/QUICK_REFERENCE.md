# Quick Reference - Minimal Folder

## ⚡ GAS (Google Apps Script) Critical Rules

### ✅ DO
```javascript
// Direct execution (synchronous)
if (typeof OrgDiagram !== 'undefined') {
    OrgDiagram.init();
}

// Use try-catch for error handling
try {
    const result = await apiCall('endpoint', data);
} catch (error) {
    debugLog('MODULE', 'FAIL:', error);
}
```

### ❌ DON'T
```javascript
// NO async/await with script.onload
script.onload = async () => {  // ❌ WRONG
    await OrgDiagram.init();
};

// NO setTimeout for dependencies
setTimeout(() => {  // ❌ WRONG
    if (typeof OrgDiagram !== 'undefined') {
        OrgDiagram.init();
    }
}, 100);
```

---

## 📁 File Naming

```
JavaScript:  snake_case.html (e.g., org_diagram.html)
HTML:        snake_case.html (e.g., sidebar.html)
Modules:     <page>_<feature>.html (e.g., organization_crud.html)
```

---

## 🔧 Common Patterns

### API Call Pattern
```javascript
async function loadData() {
    debugLog('MODULE', 'Loading data...');

    try {
        const result = await apiCall('endpoint');

        if (!result || !result.success) {
            showToast('Failed to load', 'error');
            return [];
        }

        debugLog('MODULE', 'OK Loaded', result.data.length, 'items');
        return result.data;

    } catch (error) {
        debugLog('MODULE', 'EXCEPTION:', error);
        showToast('Error: ' + error.message, 'error');
        return [];
    }
}
```

### Modal Pattern
```javascript
function showModal(type, id = null, parentId = null) {
    const modalBody = document.getElementById('modal-body');

    showModalLoading(modalBody);

    buildForm(type, modalBody, id)
        .then(() => {
            if (parentId) {
                preselectParentDropdown(type, parentId);
            }
            hideModalLoading(modalBody);
            new bootstrap.Modal(document.getElementById('crud-modal')).show();
        })
        .catch(error => {
            hideModalLoading(modalBody);
            showToast('Failed: ' + error.message, 'error');
        });
}
```

### Delete Pattern
```javascript
function deleteItem(type, id) {
    const childrenCount = getChildrenCount(type, id);

    window.deleteContext = {
        mode: childrenCount > 0 ? 'cascade' : 'single',
        type: type,
        id: id,
        name: getEntityName(type, id),
        childrenCount: childrenCount
    };

    if (childrenCount > 0) {
        showCascadeDeleteConfirmation();
    } else {
        showDeleteConfirmation();
    }
}
```

### DataTable Pattern
```javascript
const table = $('#table-id').DataTable({
    data: [],
    columns: [
        { data: 'field1' },
        { data: 'field2' },
        {
            data: null,
            render: (data, type, row) => `
                <button onclick="showModal('type', '${row.id}')">Edit</button>
                <button onclick="deleteItem('type', '${row.id}')">Delete</button>
            `
        }
    ],
    order: [[0, 'asc']],
    pageLength: 25
});
```

---

## 🎨 Variable Naming

```javascript
// camelCase for variables/functions
let draggedNode = null;
let currentFilterType = '';

// PascalCase for namespaces
const OrgDiagram = { ... };
const ViewState = { ... };

// UPPER_SNAKE_CASE for constants
const STORAGE_KEY = 'org-view-preference';

// Descriptive names
let directorateId = 'abc123';   // ✅ GOOD
let dirId = 'abc123';            // ❌ BAD
```

---

## 🐛 Debug Logging

```javascript
debugLog('MODULE', 'Message');                           // Simple
debugLog('MODULE', 'Variable:', variable);               // With var
debugLog('MODULE', '=== START ===');                     // Section
debugLog('MODULE', 'OK Success');                        // Success
debugLog('MODULE', 'FAIL Error:', error);                // Error
debugLog('MODULE', 'WARN Warning');                      // Warning

// Module codes (uppercase)
DIAGRAM, VIEW, CONTEXT_MENU, CRUD, API, DATATABLES
```

---

## 🔒 Defensive Programming

```javascript
// ✅ CORRECT - Always check
const element = document.getElementById('element-id');
if (!element) {
    debugLog('MODULE', 'FAIL Element not found');
    return;
}
element.classList.add('active');

// ❌ WRONG - No null check
document.getElementById('element-id').classList.add('active');
```

---

## 🎯 Event Handling

```javascript
// Stop propagation for nested elements
nodes
    .on('click', (event, d) => {
        event.stopPropagation();  // ✅ Prevent parent click
        handleClick(event, d);
    })

// One-time listeners
window.addEventListener('mouseup', handler, { once: true });

// Prevent duplicates
let handlersSetup = false;
function setupHandlers() {
    if (handlersSetup) return;
    // ... setup ...
    handlersSetup = true;
}
```

---

## 💾 State Management

```javascript
// Module state
let currentView = 'table';

// localStorage
const ViewState = {
    STORAGE_KEY: 'org-view-preference',

    save(view) {
        localStorage.setItem(this.STORAGE_KEY, view);
    },

    load() {
        return localStorage.getItem(this.STORAGE_KEY) || 'table';
    }
};

// Cache
const cache = {
    directorate: null,
    'work-unit': null
};
```

---

## 🎭 Namespace Pattern

```javascript
const ModuleName = (function() {
    'use strict';

    // Private
    let privateVar = null;

    return {
        // Public
        init() {
            // Can access privateVar
        },

        // By convention: private method
        _privateHelper() {
            // Still public, but signals internal use
        }
    };
})();

// Usage
ModuleName.init();           // ✅ Works
console.log(ModuleName.privateVar); // ❌ undefined
```

---

## 🖥️ DOM Positioning

```javascript
// Transform-based (D3.js)
nodeElement.attr('transform', `translate(${x},${y})`);

// Parse transform
const transform = d3.select(element).attr('transform') || '';
const match = transform.match(/translate\(([^,]+),\s*([^)]+)\)/);
const x = match ? parseFloat(match[1]) : 0;
const y = match ? parseFloat(match[2]) : 0;

// Absolute positioning
.style('position', 'absolute')
.style('top', '10px')
.style('right', '10px')
.style('z-index', '1000')
```

---

## 📊 Z-Index Hierarchy

```
0-999     Normal content
1000      Floating controls
1055      Bootstrap modal backdrop
1060      Modal loading overlay
2000      Tooltips
3000      Context menus
5000      Toast notifications
10000     Canvas menus
```

---

## 🔄 Drag and Drop (D3.js)

```javascript
// 1. Store element references during render
let nodeElementsMap = new Map();
let linkElementsMap = new Map();

nodes.each(function(d) {
    nodeElementsMap.set(d.data.id, this);
    this._baseX = d.y;
    this._baseY = d.x;
});

links.each(function(d) {
    const key = `${d.source.data.id}-${d.target.data.id}`;
    linkElementsMap.set(key, this);
    this._linkSource = d.source.data.id;
    this._linkTarget = d.target.data.id;
});

// 2. Drag with requestAnimationFrame
let dragAnimationId = null;

function dragged(event, d) {
    if (dragAnimationId) {
        cancelAnimationFrame(dragAnimationId);
    }
    dragAnimationId = requestAnimationFrame(() => {
        updateDragPosition();
    });
}

// 3. Update links during drag
function updateConnectedLinks(nodeId, nodeX, nodeY) {
    linkElementsMap.forEach((linkElement, key) => {
        if (linkElement._linkSource === nodeId || linkElement._linkTarget === nodeId) {
            // Recalculate path and update
            d3.select(linkElement).attr('d', newPath);
        }
    });
}
```

---

## ⏳ Loading States

```javascript
// Page-level
showLoading();
// ... do work ...
hideLoading();

// Modal
showModalLoading(modalBody);
// ... load form ...
hideModalLoading(modalBody);

// Button
setButtonLoading(btn, 'Save');
// ... save ...
restoreButton(btn);

// Component
showLoadingIndicator(container);
// ... load data ...
hideLoadingIndicator();
```

---

## 🚀 Performance

```javascript
// Batch DOM updates
const fragment = document.createDocumentFragment();
items.forEach(item => {
    const div = document.createElement('div');
    div.textContent = item.name;
    fragment.appendChild(div);
});
container.appendChild(fragment);

// Use requestAnimationFrame for animations
requestAnimationFrame(() => {
    updatePosition();
});

// Debounce input
let timeout;
function search(query) {
    clearTimeout(timeout);
    timeout = setTimeout(() => performSearch(query), 300);
}

// Parallel API calls
const [data1, data2, data3] = await Promise.all([
    apiCall('endpoint1'),
    apiCall('endpoint2'),
    apiCall('endpoint3')
]);
```

---

## 🎯 Checklist

### When Creating New Feature
- [ ] Create file with `snake_case.html` naming
- [ ] Use namespace/IIFE pattern
- [ ] Add `debugLog()` for key operations
- [ ] Use `try-catch-finally` for async operations
- [ ] Check for null/undefined before DOM access
- [ ] Use `event.stopPropagation()` for nested clicks
- [ ] Add loading indicators for async operations
- [ ] Handle errors and show user feedback
- [ ] Track script loading with `scriptLoadTracker`
- [ ] Clean up event listeners in destroy functions

### When Making AJAX Calls
- [ ] Use `apiCall()` helper
- [ ] Handle both success and error cases
- [ ] Show loading before call
- [ ] Hide loading in finally block
- [ ] Validate response before using
- [ ] Show user feedback (success/error)

### When Working with DOM
- [ ] Cache selectors if used multiple times
- [ ] Check element exists before access
- [ ] Use batch updates for multiple changes
- [ ] Clean up event listeners when done
- [ ] Use correct z-index for positioning

---

## 📞 Module Communication

```javascript
// Direct function call
OrgDiagram.init();

// Global function (defined in other module)
if (typeof showContextMenu === 'function') {
    showContextMenu(event, nodeData);
}

// Shared state (minimal scope)
let currentView = 'table';  // In view-toggle.html

// Access from other module
if (currentView === 'diagram') {
    OrgDiagram.reload();
}
```

---

## 🛠️ Common Commands

```bash
# Push to GAS
clasp push

# Open web app
clasp open

# View logs
clasp logs

# Deploy
clasp deploy
```

---

## 📋 File Structure Template

```html
<script>
// ============================================================================
// MODULE_NAME - Description
// ============================================================================

// State
let state = null;

// Config
const CONFIG = { option: 'value' };

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

// Events
document.addEventListener('DOMContentLoaded', () => {
    ModuleName.init();
});

// Script tracking
if (window.scriptLoadTracker) {
    window.scriptLoadTracker.loaded('module-name.html');
}
</script>
```

---

## 🔍 Debug Panel

- **Toggle**: Ctrl+Shift+D
- **Clear**: Clear button in panel
- **Download**: Download button saves logs to file
- **Settings**: Enable/disable in Settings page

---

## ⚠️ Common Pitfalls

1. **Forgetting to null-check** → Always check element existence
2. **Not stopping propagation** → Use `event.stopPropagation()` for nested clicks
3. **Async/await in GAS** → Don't use with script.onload
4. **Global namespace pollution** → Use IIFE/namespace pattern
5. **Forgetting cleanup** → Remove event listeners, clear timeouts
6. **Not showing loading** → Users think app is broken
7. **Silent failures** → Always log errors with `debugLog()`
8. **Race conditions** → Use handlersSetup flag, cleanup listeners
9. **Memory leaks** → Destroy components when not needed
10. **Poor error messages** → Show specific error messages to users

---

## 🎓 Learning Path

1. Read `DEVELOPMENT_GUIDE.md` for detailed patterns
2. Study existing files in `minimal/assets/js/`
3. Copy patterns from similar features
4. Use `debugLog()` extensively when developing
5. Test in GAS environment (not just local)
6. Get familiar with D3.js if doing diagrams
7. Learn Bootstrap 5 for modals/components
8. Understand DataTables for tables

---

**Remember**: This is a Google Apps Script environment with specific limitations. Always test in the actual GAS environment, not just locally.
