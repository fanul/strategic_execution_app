# Organization Module - Complete Guide

## Overview

The Organization Module is a fully functional hierarchical organization management system with:
- **Two View Modes**: Table View (DataTables) and Diagram View (D3.js)
- **Complete CRUD Operations**: Create, Read, Update, Delete for all entities
- **Advanced Delete Handling**: Cascade delete and reassign options
- **Lazy Loading**: Data loads only when needed
- **Caching**: Prevents redundant API calls

## Hierarchy Structure

```
Organization
│
├── Directorate (e.g., "DIR-001 - Directorate of Finance")
│   │
│   ├── Work Unit (e.g., "WU-001 - Accounting Department")
│   │   │
│   │   ├── Affair (e.g., "AFF-001 - Budget Planning")
│   │   │   │
│   │   │   └── Position (e.g., "POS-001 - Budget Analyst")
│   │   │
│   │   └── Position (can be directly under Work Unit)
│   │
│   └── Work Unit (e.g., "WU-002 - Treasury Department")
│       │
│       └── Affair → Position
│
├── Directorate (e.g., "DIR-002 - Directorate of HR")
│   └── Work Unit → Affair → Position
│
└── ...
```

## Module Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         ORGANIZATION MODULE ARCHITECTURE                     │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND LAYER                                  │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                        pages/organization.html                         │  │
│  │  - Navigation Tabs (Directorates, Work Units, Affairs, Positions)    │  │
│  │  - Table View Container                                               │  │
│  │  - Diagram View Container                                             │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                      │                                       │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                          VIEW TOGGLE SYSTEM                            │  │
│  │  assets/js/view-toggle.html                                          │  │
│  │  - switchView('table' | 'diagram')                                    │  │
│  │  - View state persistence (localStorage)                              │  │
│  │  - Auto-initialize on saved preference                                │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                      │                                       │
│  ┌──────────────────┬───────────────────────────────────────────────────┐  │
│  │   TABLE VIEW     │                  DIAGRAM VIEW                      │  │
│  │  (DataTable +    │                  (D3.js Tree)                       │  │
│  │   CRUD)          │                                                       │  │
│  │                  │                                                       │  │
│  │  ┌──────────────┐ │  ┌─────────────────────────────────────────────┐ │  │
│  │  │ Organization │ │  │ OrgDiagram Module                           │ │  │
│  │  │    Manager   │ │  │ assets/js/org-diagram.html                 │ │  │
│  │  │              │ │  │ - D3.js hierarchical tree visualization     │ │  │
│  │  │ DataTables   │ │  │ - Zoom, pan, collapse/expand                │ │  │
│  │  │    (lazy)    │ │  │ - Drag & drop node repositioning            │ │  │
│  │  │              │ │  │ - Right-click context menu                  │ │  │
│  │  └──────────────┘ │  │ - Export to PNG                            │ │  │
│  │                  │  └─────────────────────────────────────────────┘ │  │
│  └──────────────────┴───────────────────────────────────────────────────┘  │
│                                      │                                       │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                       CRUD OPERATIONS LAYER                            │  │
│  │  assets/js/organization_crud.html                                     │  │
│  │  - saveDirectorate(), saveWorkUnit(), saveAffair(), savePosition()   │  │
│  │  - deleteItem(type, id) - Enhanced delete with cascade/reassign      │  │
│  │  - editItem(type, id) - Populate modal for editing                   │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                      │                                       │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                      MODALS (layout/modals/)                           │  │
│  │  organization_modals.html                                             │  │
│  │  - directorateModal, work-unitModal, affairModal, positionModal      │  │
│  │  - deleteConfirmModal (with cascade/reassign options)                │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           API COMMUNICATION LAYER                            │
│  assets/js/api_helper.html                                                  │
│  - apiCall(endpoint, data) → Promise<{success, data, message}>              │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            BACKEND ROUTING                                  │
│  Code.gs → callAPI(endpoint, data)                                         │
│  Routes to: OrganizationController.Directorate|WorkUnit|Affair|Position     │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          CONTROLLER LAYER                                    │
│  Controllers/OrganizationController.gs                                      │
│  - Validation, business logic, audit logging                               │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           MODEL LAYER                                        │
│  Models/Organization.gs                                                     │
│  - Database operations, hierarchical operations                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        DATABASE LAYER (Google Sheets)                        │
│  Directorates → WorkUnits → Affairs → Positions                            │
└─────────────────────────────────────────────────────────────────────────────┘
```

## File Components

### Backend Files

| File | Description |
|------|-------------|
| [Controllers/OrganizationController.gs](../Controllers/OrganizationController.gs) | Business logic for all org entities |
| [Models/Organization.gs](../Models/Organization.gs) | Data access and hierarchical operations |

### Frontend Files

| File | Description |
|------|-------------|
| [pages/organization.html](../pages/organization.html) | Main page with tabs and view containers |
| [layout/modals/organization_modals.html](../layout/modals/organization_modals.html) | Modal forms for CRUD operations |
| [assets/js/organization_datatables.html](../assets/js/organization_datatables.html) | DataTable manager with lazy loading |
| [assets/js/organization_crud.html](../assets/js/organization_crud.html) | CRUD operations and enhanced delete |
| [assets/js/view-toggle.html](../assets/js/view-toggle.html) | Table/diagram view switcher |
| [assets/js/org-diagram.html](../assets/js/org-diagram.html) | D3.js tree visualization |
| [assets/js/org-diagram-controls.html](../assets/js/org-diagram-controls.html) | Diagram toolbar controls |
| [assets/js/org-diagram-tooltip.html](../assets/js/org-diagram-tooltip.html) | Node tooltips |
| [assets/js/org-diagram-context-menu.html](../assets/js/org-diagram-context-menu.html) | Right-click context menu |
| [assets/js/organization-view-functions.html](../assets/js/organization-view-functions.html) | View helper functions |

## API Endpoints

### Directorates

| Endpoint | Description |
|----------|-------------|
| `directorates/list` | Get all directorates |
| `directorates/get` | Get directorate by ID |
| `directorates/create` | Create new directorate |
| `directorates/update` | Update directorate |
| `directorates/delete` | Delete directorate (direct) |
| `directorates/check-children` | Check for child entities |
| `directorates/get-alternatives` | Get reassignment options |
| `directorates/delete-cascade` | Delete with all children |
| `directorates/delete-reassign` | Reassign children then delete |

### Work Units

Same pattern with `work-units` prefix.

### Affairs

Same pattern with `affairs` prefix.

### Positions

| Endpoint | Description |
|----------|-------------|
| `positions/list` | Get all positions |
| `positions/get` | Get position by ID |
| `positions/create` | Create new position |
| `positions/update` | Update position |
| `positions/delete` | Delete position |

## Complete Data Flow: Creating a Work Unit

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     CREATE WORK UNIT - COMPLETE FLOW                    │
└─────────────────────────────────────────────────────────────────────────┘

1. USER ACTION
   User clicks "Add Work Unit" button
   onclick="showModal('work-unit')"

2. MODAL DISPLAY
   showModal('work-unit') → Opens work-unitModal
   - Empty form fields
   - Populates directorate dropdown via apiCall('directorates/list')

3. USER FILLS FORM
   - Code: "WU-003"
   - Name: "IT Department"
   - Directorate: Selects from dropdown

4. USER CLICKS "SAVE"
   onclick="saveWorkUnit()"

5. CRUD OPERATION (assets/js/organization_crud.html)
   saveWorkUnit():
   │
   ├─► Extract form values
   │   data = {
   │     work_unit_code: "WU-003",
   │     work_unit_name: "IT Department",
   │     directorate_id: "...selected id..."
   │   }
   │
   ├─► Validate required fields
   │
   ├─► Determine endpoint: 'work-units/create' (no id = create)
   │
   └─► apiCall('work-units/create', data)

6. API CALL (assets/js/api_helper.html)
   apiCall(endpoint, data):
   │
   └─► google.script.run
         .withSuccessHandler(result)
         .withFailureHandler(error)
         .callAPI(endpoint, data)

7. BACKEND ROUTING (Code.gs)
   callAPI('work-units/create', data):
   │
   ├─► Parse: resource='work-units', action='create'
   ├─► Get userId from session
   │
   └─► Route to: OrganizationController.WorkUnit.create(data, userId)

8. CONTROLLER (Controllers/OrganizationController.gs)
   OrganizationController.WorkUnit.create(data, userId):
   │
   ├─► Create new object with UUID, timestamps
   │
   └─► OrganizationModel.WorkUnit.create(data)

9. MODEL (Models/Organization.gs)
   OrganizationModel.WorkUnit.create(data):
   │
   ├─► newWorkUnit = {
   │     work_unit_id: generateUUID(),
   │     work_unit_code: data.work_unit_code || generateCode(),
   │     work_unit_name: data.work_unit_name,
   │     directorate_id: data.directorate_id,
   │     created_at: formatDateTime(new Date()),
   │     created_by: data.created_by,
   │     ...
   │   }
   │
   └─► insertRecord(DB_CONFIG.SHEET_NAMES.WORK_UNITS, newWorkUnit)

10. DATABASE SERVICE (DatabaseService.gs)
    insertRecord(sheetName, data):
    │
    ├─► Get sheet by name
    ├─► Append row with data values
    │
    └─► Return { success: true, data: newWorkUnit }

11. RESPONSE FLOW (back to frontend)
    result = { success: true, data: newWorkUnit }
    │
    ├─► Controller adds audit log
    ├─► Response returned to frontend
    │
    └─► saveWorkUnit() receives result

12. FRONTEND COMPLETION
    if (result.success):
    │
    ├─► Close modal (bootstrap.Modal.getInstance().hide())
    ├─► Show toast: "Work Unit saved successfully"
    ├─► Refresh table: OrganizationManager.refreshEntityTable('work-unit')
    │   └─► apiCall('work-units/list') → Re-render DataTable
    │
    └─► Reload diagram if active: OrgDiagram.reload()

┌─────────────────────────────────────────────────────────────────────────┐
│                         OPERATION COMPLETE                               │
└─────────────────────────────────────────────────────────────────────────┘
```

## Enhanced Delete Flow (Cascade/Reassign)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    ENHANCED DELETE OPERATION FLOW                       │
└─────────────────────────────────────────────────────────────────────────┘

User clicks "Delete" button
    │
    ▼
deleteItem(type, id) called
    │
    ├─► For 'position' (no children):
    │   └─► Simple confirm dialog → direct delete
    │
    └─► For 'directorate', 'work-unit', 'affair' (with potential children):
        │
        ▼
    1. apiCall(type/check-children, {id})
        │
        ├─► No children (hasChildren = false):
        │   └─► showSimpleDeleteConfirm() → Direct delete option only
        │
        └─► Has children (hasChildren = true):
            │
            ▼
    2. apiCall(type/get-alternatives, {id})
        │
        ▼
    3. Show deleteConfirmModal with:
        - Children count breakdown
        - Cascade delete option (default)
        - Reassign children option (if alternatives exist)
        │
        ▼
    4. User selects option and clicks "Delete"
        │
        ├─► Cascade selected:
        │   └─► apiCall(type/delete-cascade, {id})
        │       → Deletes entity and ALL descendants
        │
        └─► Reassign selected:
            └─► apiCall(type/delete-reassign, {id, new_parent_id})
                → Moves children to new parent, then deletes entity
        │
        ▼
    5. Refresh all affected tables
    6. Reload diagram if active
```

## DataTable Manager (Lazy Loading)

**File**: [assets/js/organization_datatables.html](../assets/js/organization_datatables.html)

**Purpose**: Manages lazy loading, caching, and rendering of organization tables.

**Key Features**:
- **Lazy Loading**: Only loads data for the active tab
- **Data Caching**: Prevents redundant API calls
- **DataTable Integration**: jQuery DataTables with pagination, search, sorting
- **Filter System**: Column-based filtering

**API**:

```javascript
window.OrganizationManager = {
    // Initialize tables and setup tab listeners
    initialize(): async void

    // Load entity data if not cached
    loadEntityDataIfNotCached(entityType): async void

    // Refresh specific table after CRUD
    refreshEntityTable(crudType): async void

    // Clear filters for entity type
    clearFilters(entityType): void

    // Data cache
    cache: {
        directorates: { loaded: bool, data: [], tableInstance: DataTable },
        'work-units': { ... },
        affairs: { ... },
        positions: { ... }
    }
}
```

**Flow**:
```
1. Page Load → OrganizationManager.initialize()
2. Setup Bootstrap tab event listeners
3. Load active tab's data (lazy load)
4. User switches tab → loadEntityDataIfNotCached(entityType)
5. If cached → skip, if not → apiCall(entityType/list)
6. Render table with DataTable
```

## View Toggle System

**File**: [assets/js/view-toggle.html](../assets/js/view-toggle.html)

**Purpose**: Switch between Table View and Diagram View.

**Features**:
- State persistence with localStorage
- Auto-initialize on saved preference
- Resource cleanup when switching views

**API**:

```javascript
const ViewToggle = {
    init(): void,                    // Auto-load saved view
    switchView('table' | 'diagram'): void,
    refresh(): void,                  // Refresh current view after CRUD
    toggleLegend(): void,             // Minimize/maximize diagram legend
    getCurrentView(): string          // Returns 'table' or 'diagram'
}
```

## Organization Diagram (D3.js)

**File**: [assets/js/org-diagram.html](../assets/js/org-diagram.html)

**Purpose**: D3.js hierarchical tree visualization of organization structure.

**Key Features**:
- **Interactive Tree**: Collapsible/expandable nodes
- **Zoom & Pan**: D3 zoom behavior
- **Drag & Drop**: Reposition nodes
- **Context Menu**: Right-click for View/Edit/Add Child/Delete
- **Export**: Download diagram as PNG

**Entity Configuration**:

```javascript
const entityConfig = {
    directorate: { color: '#667eea', label: 'Directorate' },
    'work-unit':  { color: '#764ba2', label: 'Work Unit' },
    affair:       { color: '#f093fb', label: 'Affair' },
    position:     { color: '#4facfe', label: 'Position' }
};
```

**Diagram API**:

```javascript
const OrgDiagram = {
    init(): void,                    // Initialize and render diagram
    reload(): async void,            // Reload data and re-render
    zoomIn(), zoomOut(), resetZoom(),
    expandAll(), collapseAll(),
    exportPNG(),
    destroy(): void                  // Clean up SVG and event listeners
};
```

## Error Handling

### Frontend Validation
- Required field checks before API call
- Client-side format validation
- User-friendly error messages via toast notifications

### Backend Validation
- Data type validation in controller
- Referential integrity checks (parent must exist)
- Business rule validation (cannot delete entity with active children)

### API Response Format

```javascript
// Success
{ success: true, data: {...}, message: "..." }

// Error
{ success: false, message: "Error description", error: "Detailed error" }
```

## Debug Logging

All operations use `debugLog(category, message, data)`:

| Category | Usage |
|----------|-------|
| `'CRUD'` | CRUD operations |
| `'ORG_DT'` | DataTable operations |
| `'DELETE'` | Delete operations |
| `'VIEW'` | View toggle operations |
| `'DIAGRAM'` | Diagram operations |

## Extending the Organization Module

### Adding a New Level to Hierarchy

To add a new level (e.g., "Sub-Affair" under Affair):

1. **Database**: Add new sheet in DatabaseService
2. **Model**: Add `OrganizationModel.SubAffair` in Models/Organization.gs
3. **Controller**: Add `OrganizationController.SubAffair` in Controllers/OrganizationController.gs
4. **Frontend Page**: Add new tab in pages/organization.html
5. **DataTable**: Add render function in organization_datatables.html
6. **CRUD**: Add save functions in organization_crud.html
7. **Modal**: Add modal form in organization_modals.html
8. **Diagram**: Update entityConfig and tree structure in org-diagram.html

## Next Steps

- See [Creating a CRUD Module](./51-creating-crud-module.md) for detailed guide on building CRUD modules
- See [Database Schema](./40-database-schema.md) for organization tables
- See [Frontend Components](./21-frontend-components.md) for UI component patterns
