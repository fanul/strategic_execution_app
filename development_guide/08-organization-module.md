# Organization Module - Complete Guide (BPJS Ketenagakerjaan Structure)

## Overview

The Organization Module is a comprehensive hierarchical organization management system for BPJS Ketenagakerjaan with:
- **NEW: BPJS Structure Support** - OrganizationalUnits with proper hierarchy for HQ, Regional Offices, Branch Offices, and Subsidiaries
- **Dual Architecture**: Legacy structure (Directorates/WorkUnits/Affairs) + New unified structure (OrganizationalUnits)
- **Three View Modes**: Tree View (HTML), Flat View (Table), and Diagram View (D3.js)
- **Complete CRUD Operations**: Create, Read, Update, Delete for all entity types
- **Office Lifecycle Management**: Track closures, mergers, splits, and reclassifications
- **Advanced Filtering**: By unit type, classification, province, city, and status
- **Lazy Loading**: Data loads only when needed
- **Caching**: Prevents redundant API calls

## BPJS Ketenagakerjaan Hierarchy Structure

```
BPJS KETENAGAKERJAAN (ROOT)
│
├── KANTOR PUSAT (Headquarters)
│   ├── 7 Directorates
│   │   └── 27 Work Units (Deputi)
│   │       └── Affairs (Urusan)
│   │           └── Positions (Job Desc) → Persons
│   └── HQ-level Positions
│
├── KANTOR DAERAH (Regional Division)
│   ├── REGIONAL_OFFICE (Parent units)
│   │   ├── Regional Head
│   │   ├── Bidang (Departments)
│   │   │   └── Positions (with Persons)
│   │   └── Positions
│   │
│   └── BRANCH_OFFICE (Children - 317 total)
│       ├── KELAS_1 (Class 1 branches)
│       ├── KELAS_2 (Class 2 branches)
│       ├── KELAS_3 (Class 3 branches)
│       └── KELAS_3A (Class 3A branches)
│           ├── Branch Head
│           ├── Bidang (Departments)
│           │   └── Positions (with Persons)
│           └── Positions
│
└── ANAK PERUSAHAAN (Subsidiaries)
    └── SUBSIDIARY (Each with own depth)
        └── SUBSIDIARY_UNIT
            └── Positions (with Persons)
```

### Unit Types

| Unit Type | Code | Description | Classification Options |
|-----------|------|-------------|-------------------------|
| ROOT | ROOT | BPJS Ketenagakerjaan (Organization) | HQ |
| DIRECTORATE | DIR | HQ Directorates (7) | HQ |
| WORK_UNIT | WU | HQ Work Units/Deputi (27) | HQ |
| AFFAIR | AFF | HQ Affairs (Urusan) | HQ |
| REGIONAL_OFFICE | RO | Regional Offices (parents) | HQ |
| BRANCH_OFFICE | BO | Branch Offices (317) | KELAS_1, KELAS_2, KELAS_3, KELAS_3A |
| SUBSIDIARY | SUB | Subsidiaries | SUBSIDIARY |
| SUBSIDIARY_UNIT | SU | Subsidiary internal units | SUBSIDIARY |

### Classifications

| Classification | Description | Color Code |
|---------------|-------------|------------|
| HQ | Headquarters units | Blue (#1E88E5) |
| KELAS_1 | Class 1 branches | Dark Green (#2E7D32) |
| KELAS_2 | Class 2 branches | Medium Green (#43A047) |
| KELAS_3 | Class 3 branches | Light Green (#8BC34A) |
| KELAS_3A | Class 3A branches | Pale Green (#AED581) |
| SUBSIDIARY | Subsidiary units | Purple (#8E24AA) |

### Lifecycle Statuses

| Status | Description | Use Case |
|--------|-------------|----------|
| ACTIVE | Currently active | Default for all new units |
| CLOSED | Permanently closed | Office shutdown |
| MERGED | Merged into another unit | Administrative merger |
| SPLIT | Split into multiple units | Reorganization |
| RECLASSIFIED | Classification changed | Kelas upgrade/downgrade |

## Module Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    BPJS ORGANIZATION MODULE ARCHITECTURE (v3.0)               │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND LAYER                                  │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                   pages/organization.html (UPDATED)                    │  │
│  │  - NEW: Organizational Units tab (default active)                     │  │
│  │  - Stats Cards: Total, Regional, Branch, Subsidiary counts           │  │
│  │  - Advanced Filters: Type, Classification, Province, City            │  │
│  │  - View Toggle: Tree View ↔ Flat View                               │  │
│  │  - LEGACY: Directorates, Work Units, Affairs tabs (marked Legacy)    │  │
│  │  - Positions tab                                                      │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                      │                                       │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                     ORGANIZATIONAL UNITS MANAGER                       │  │
│  │  assets/js/organization_crud.html (UPDATED with OrgUnitManager)     │  │
│  │  - OrgUnitManager.init() - Initialize and load data                 │  │
│  │  - OrgUnitManager.loadStats() - Update statistics cards             │  │
│  │  - OrgUnitManager.loadTreeView() - HTML tree view                    │  │
│  │  - OrgUnitManager.loadFlatView() - DataTable view                    │  │
│  │  - OrgUnitManager.applyFilters() - Filter management                 │  │
│  │  - OrgUnitManager.deleteUnit() - Delete with validation              │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                      │                                       │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                    LEGACY ORGANIZATION MANAGER                         │  │
│  │  assets/js/organization_datatables.html                              │  │
│  │  - OrganizationManager.initialize() - Legacy tabs                    │  │
│  │  - DataTable manager with lazy loading and caching                   │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                      │                                       │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                       CRUD OPERATIONS LAYER                            │  │
│  │  assets/js/organization_crud.html                                     │  │
│  │  - saveDirectorate(), saveWorkUnit(), saveAffair(), savePosition()   │  │
│  │  - OrgUnitManager CRUD (NEW)                                        │  │
│  │  - deleteItem(type, id) - Enhanced delete with cascade/reassign      │  │
│  │  - editItem(type, id) - Populate modal for editing                   │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                      │                                       │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                      MODALS (layout/modals/)                           │  │
│  │  organization_modals.html                                             │  │
│  │  - directorateModal, work-unitModal, affairModal, positionModal      │  │
│  │  - TODO: org-unitModal (for creating/editing organizational units)     │  │
│  │  - deleteConfirmModal (with cascade/reassign options)                │  │
│  │  - TODO: Lifecycle modals (close, merge, reclassify)               │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                      │                                       │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                       DIAGRAM VISUALIZATION                           │  │
│  │  assets/js/org-diagram.html                                         │  │
│  │  - D3.js hierarchical tree visualization                            │  │
│  │  - TODO: Update for BPJS structure with proper colors              │  │
│  │  - Zoom, pan, collapse/expand                                        │  │
│  │  - Export to PNG                                                     │  │
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
│  Routing/RouteRegistry.gs → Lazy-loaded route handlers                     │
│  Routes to: OrganizationController.Directorate|WorkUnit|Affair|Position    │
│              + OrganizationalUnit|Lifecycle (NEW)                         │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          CONTROLLER LAYER                                    │
│  Controllers/OrganizationController.gs (UPDATED)                          │
│  - Legacy: Directorate, WorkUnit, Affair, Position controllers           │
│  - NEW: OrganizationalUnit controller (20+ methods)                     │
│  - NEW: Lifecycle controller (8 methods)                                │
│  - Validation, business logic, audit logging                               │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           MODEL LAYER                                        │
│  Models/Organization.gs (ENHANCED)                                       │
│  - Legacy: Directorate, WorkUnit, Affair, Position, PositionAssignment  │
│  - NEW: OrganizationalUnit model (600+ lines)                           │
│  - Database operations, hierarchical operations, lifecycle management    │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        DATABASE LAYER (Google Sheets)                        │
│  ORGANIZATIONAL_UNITS (NEW) - Unified structure table                    │
│  OFFICE_LIFECYCLE_HISTORY (NEW) - Audit trail table                      │
│  Directorates (DEPRECATED) → Migrated to OrganizationalUnits             │
│  WorkUnits (DEPRECATED) → Migrated to OrganizationalUnits                │
│  Affairs (DEPRECATED) → Migrated to OrganizationalUnits                  │
│  Positions (ENHANCED) - Added organizational_context, branch_classification │
└─────────────────────────────────────────────────────────────────────────────┘
```

## File Components

### Backend Files

| File | Description | Status |
|------|-------------|--------|
| [Controllers/OrganizationController.gs](../Controllers/OrganizationController.gs) | Business logic for all org entities + NEW OrgUnit & Lifecycle controllers | ✅ Updated |
| [Models/Organization.gs](../Models/Organization.gs) | Data access, hierarchical operations + NEW OrganizationalUnit model (600+ lines) | ✅ Updated |
| [Models/OfficeLifecycle.gs](../Models/OfficeLifecycle.gs) | NEW: Lifecycle tracking model | ✅ New |
| [Routing/OrganizationRoutes.gs](../Routing/OrganizationRoutes.gs) | NEW: Route handlers for organizational units, regional/branch offices, lifecycle | ✅ Updated |
| [Routing/RouteRegistry.gs](../Routing/RouteRegistry.gs) | NEW: Route mappings for 9 new endpoints | ✅ Updated |
| [InitializeApp.gs](../InitializeApp.gs) | NEW: Easy migration system with version tracking | ✅ Updated |
| [Config.gs](../Config.gs) | NEW: Database schema for OrganizationalUnits and OfficeLifecycleHistory | ✅ Updated |

### Frontend Files

| File | Description | Status |
|------|-------------|--------|
| [pages/organization.html](../pages/organization.html) | NEW: Organizational Units tab + Stats cards + Filters + View toggle | ✅ Updated |
| [layout/modals/organization_modals.html](../layout/modals/organization_modals.html) | Modal forms for legacy CRUD operations | ⏳ TODO: Add org-unitModal |
| [assets/js/organization_datatables.html](../assets/js/organization_datatables.html) | DataTable manager for legacy tabs | ✅ Working |
| [assets/js/organization_crud.html](../assets/js/organization_crud.html) | NEW: OrgUnitManager (400+ lines) + Legacy CRUD functions | ✅ Updated |
| [assets/js/view-toggle.html](../assets/js/view-toggle.html) | Table/diagram view switcher | ✅ Working |
| [assets/js/org-diagram.html](../assets/js/org-diagram.html) | D3.js tree visualization | ⏳ TODO: Update for BPJS |
| [assets/js/org-diagram-controls.html](../assets/js/org-diagram-controls.html) | Diagram toolbar controls | ✅ Working |
| [assets/js/org-diagram-tooltip.html](../assets/js/org-diagram-tooltip.html) | Node tooltips | ✅ Working |
| [assets/js/org-diagram-context-menu.html](../assets/js/org-diagram-context-menu.html) | Right-click context menu | ✅ Working |
| [assets/js/organization-view-functions.html](../assets/js/organization-view-functions.html) | View helper functions | ✅ Working |

## API Endpoints

### Legacy Endpoints (Deprecated but functional)

| Endpoint | Description |
|----------|-------------|
| `directorates/list` | Get all directorates |
| `directorates/create` | Create new directorate |
| `directorates/update` | Update directorate |
| `directorates/delete` | Delete directorate |
| `work-units/*` | Same pattern for work units |
| `affairs/*` | Same pattern for affairs |
| `positions/*` | Same pattern for positions |

### NEW: Organizational Units Endpoints

| Endpoint | Description | Parameters |
|----------|-------------|------------|
| `organizational-units/list` | Get all units with filters | `{ is_active, unit_type, classification, parent_unit_id, province, city }` |
| `organizational-units/get` | Get unit by ID | `{ unitId }` |
| `organizational-units/create` | Create new unit | `{ unit_type, unit_name, parent_unit_id, classification, ... }` |
| `organizational-units/update` | Update unit | `{ unitId, ...data }` |
| `organizational-units/delete` | Delete unit | `{ unitId }` |
| `organizational-units/hierarchy` | Get tree structure | `{ include_inactive }` |
| `organizational-units/children` | Get children of unit | `{ unitId }` |
| `organizational-units/parent` | Get parent of unit | `{ unitId }` |
| `organizational-units/byType` | Get by type | `{ unit_type }` |
| `organizational-units/byClassification` | Get by classification | `{ classification }` |
| `organizational-units/history` | Get lifecycle history | `{ unitId }` |
| `organizational-units/timeline` | Get enriched timeline | `{ unitId }` |

### NEW: Regional Offices Endpoints

| Endpoint | Description |
|----------|-------------|
| `regional-offices/list` | Get all regional offices |
| `regional-offices/create` | Create regional office |
| `regional-offices/update` | Update regional office |
| `regional-offices/delete` | Delete regional office |

### NEW: Branch Offices Endpoints

| Endpoint | Description |
|----------|-------------|
| `branch-offices/list` | Get all branch offices |
| `branch-offices/create` | Create branch office |
| `branch-offices/update` | Update branch office |
| `branch-offices/delete` | Delete branch office |
| `branch-offices/reclassify` | Change branch classification | `{ unitId, new_classification, reason }` |

### NEW: Subsidiaries Endpoints

| Endpoint | Description |
|----------|-------------|
| `subsidiaries/list` | Get all subsidiaries |
| `subsidiaries/create` | Create subsidiary |
| `subsidiaries/update` | Update subsidiary |
| `subsidiaries/delete` | Delete subsidiary |

### NEW: Office Lifecycle Endpoints

| Endpoint | Description |
|----------|-------------|
| `office-lifecycle/list` | Get all lifecycle events |
| `office-lifecycle/history` | Get history for unit | `{ unitId }` |
| `office-lifecycle/timeline` | Get timeline for unit | `{ unitId }` |
| `office-lifecycle/byType` | Get by event type | `{ event_type }` |
| `office-lifecycle/statistics` | Get summary statistics | `{ filters }` |
| `office-lifecycle/recent` | Get recent changes | `{ limit }` |

## OrgUnitManager API

**File**: [assets/js/organization_crud.html](../assets/js/organization_crud.html#L763-L1169)

```javascript
const OrgUnitManager = {
    // Initialize the manager and load data
    init(): async void

    // Statistics
    loadStats(): async void
    └─► Updates 4 dashboard cards with live counts

    // View Management
    loadTreeView(): async void
    └─► Fetches hierarchy and builds HTML tree

    loadFlatView(): async void
    └─► Fetches all units and renders DataTable

    showTreeView(): async void
    └─► Switches to tree view

    showFlatView(): async void
    └─► Switches to flat table view

    // Filtering
    applyFilters(): async void
    └─► Applies type, classification, province, city filters

    clearFilters(): async void
    └─► Resets all filters and reloads

    // CRUD Operations
    viewUnit(unitId): void
    └─► Shows unit details (TODO)

    editUnit(unitId): void
    └─► Opens edit modal (TODO)

    deleteUnit(unitId): async void
    └─► Deletes unit with validation

    // Helpers
    buildTreeHtml(nodes, level): string
    └─► Builds HTML tree from API data

    getNodeIcon(unitType): string
    └─► Returns Bootstrap icon HTML

    getTypeBadge(unitType): string
    └─► Returns color-coded badge

    getClassificationBadge(classification): string
    └─► Returns classification badge (Kelas 1-3A)

    getTypeLabel(unitType): string
    └─► Returns human-readable label

    setupEventListeners(): void
    └─► Initializes filter change listeners
}
```

## Database Migration

**File**: [InitializeApp.gs](../InitializeApp.gs)

### Migration System Features:
- **Version Tracking**: `APP_VERSION = '3.0.0'`, `DB_VERSION = '3.0.0'`
- **Automatic Detection**: Checks DB version on `setupCompleteDatabase()`
- **Easy Updates**: Add new migrations in `runDatabaseMigrations()`

### Running the Migration:
```javascript
// In Apps Script Editor
setupCompleteDatabase()
```

### What Migration Does:
1. Creates `OrganizationalUnits` table (25 columns)
2. Creates `OfficeLifecycleHistory` table (14 columns)
3. Enhances `Positions` table (3 new columns)
4. Migrates Directorates → OrganizationalUnits
5. Migrates WorkUnits → OrganizationalUnits
6. Migrates Affairs → OrganizationalUnits
7. Creates ROOT unit (BPJS Ketenagakerjaan)
8. Updates parent references
9. Marks old tables as deprecated

## Complete Data Flow: Loading Organizational Units

```
┌─────────────────────────────────────────────────────────────────────────┐
│                 LOAD ORGANIZATIONAL UNITS - COMPLETE FLOW              │
└─────────────────────────────────────────────────────────────────────────┘

1. PAGE LOAD
   User navigates to Organization page
   └─► DOMContentLoaded event fires

2. INITIALIZATION (pages/organization.html)
   document.addEventListener('DOMContentLoaded', function() {
       OrgUnitManager.init();
   });

3. OrgUnitManager.init()
   ├─► debugLog('ORG_UNIT', '=== OrgUnitManager init START ===')
   │
   ├─► OrgUnitManager.loadStats()
   │   └─► apiCall('organizational-units/list', { is_active: true })
   │       ├─► Backend: OrganizationController.OrganizationalUnit.getAll()
   │       ├─► Model: OrganizationModel.OrganizationalUnit.getAll()
   │       ├─► Database: Get OrganizationalUnits sheet
   │       └─► Return: Array of all active units
   │
   ├─► Count by type (Regional, Branch, Subsidiary)
   │
   └─► Update UI elements:
       ├─► document.getElementById('stat-total-units').textContent = total
       ├─► document.getElementById('stat-regional-offices').textContent = regional
       ├─► document.getElementById('stat-branch-offices').textContent = branch
       └─► document.getElementById('stat-subsidiaries').textContent = subsidiary

4. OrgUnitManager.loadTreeView()
   └─► apiCall('organizational-units/hierarchy', { include_inactive: false })
       ├─► Backend: OrganizationController.OrganizationalUnit.getHierarchy()
       ├─► Model: OrganizationModel.OrganizationalUnit.getHierarchyTree()
       ├─► Build tree structure:
       │   {
       │     unit_id: 'root-uuid',
       │     unit_name: 'BPJS Ketenagakerjaan',
       │     unit_type: 'ROOT',
       │     children: [
       │       {
       │         unit_id: 'dir-1',
       │         unit_name: 'Directorate of Finance',
       │         unit_type: 'DIRECTORATE',
       │         children: [...]
       │       },
       │       ...
       │     ]
       │   }
       └─► Return: Tree structure

5. Build HTML Tree (buildTreeHtml)
   ├─► Iterate through tree nodes
   ├─► For each node:
   │   ├─► Get icon: getNodeIcon(unit_type)
   │   ├─► Get badges: getTypeBadge(), getClassificationBadge()
   │   ├─► Build HTML with expand/collapse caret
   │   └─► Recursively process children
   └─► Return: Complete HTML tree

6. Render Tree
   container.innerHTML = treeHtml
   ├─► Spinner disappears
   ├─► Tree is displayed
   └─► Carets are clickable to expand/collapse

7. Setup Event Listeners
   ├─► Filter changes → applyFilters()
   ├─► View toggle buttons → showTreeView()/showFlatView()
   └─► Tree carets → Expand/collapse children

┌─────────────────────────────────────────────────────────────────────────┐
│                         LOADING COMPLETE                               │
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

## Office Lifecycle Management

### Supported Operations

| Operation | Description | API Endpoint | Status |
|-----------|-------------|--------------|--------|
| **Close** | Permanently close an office | `organizational-units/close` | ✅ Backend |
| **Merge** | Merge one office into another | `organizational-units/merge` | ✅ Backend |
| **Reclassify** | Change branch classification | `branch-offices/reclassify` | ✅ Backend |
| **View History** | View office change timeline | `organizational-units/timeline` | ✅ Backend |
| **Get Statistics** | Summary of all changes | `office-lifecycle/statistics` | ✅ Backend |

### Lifecycle Event Flow

```
1. User action (e.g., "Reclassify Branch")
    │
    ▼
2. Frontend: OrgUnitManager.reclassifyBranch(unitId, newClass, reason)
    │
    ▼
3. API Call: branch-offices/reclassify
    │
    ▼
4. Backend: OrganizationController.OrganizationalUnit.reclassify()
    │
    ├─► Validation: Unit exists, has classification, new class is different
    │
    ├─► Update OrganizationalUnits table:
    │   - previous_classification = oldClass
    │   - classification = newClass
    │   - lifecycle_status = 'RECLASSIFIED'
    │
    ├─► Create OfficeLifecycleHistory entry:
    │   - event_type = 'RECLASSIFIED'
    │   - previous_classification = oldClass
    │   - new_classification = newClass
    │   - event_reason = reason
    │   - performed_by = userId
    │
    ├─► Update Positions under this unit:
    │   - branch_classification = newClass
    │
    └─► Return: { success: true, message: "Reclassified from Kelas 2 to Kelas 1" }
        │
        ▼
5. Frontend: Show success toast, refresh tree
```

## Error Handling

### Frontend Validation
- Required field checks before API call
- Client-side format validation
- User-friendly error messages via toast notifications
- **NEW**: OrgUnitManager validation for unit types and classifications

### Backend Validation
- Data type validation in controller
- Referential integrity checks (parent must exist)
- **NEW**: Parent-child relationship validation
- **NEW**: Lifecycle status validation (e.g., cannot close unit with active children)

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
| `'ORG_UNIT'` | **NEW**: Organizational unit operations |

## Color Scheme (BPJS Branded)

### Unit Type Colors
```
ROOT/HQ Units:     Blue theme
├─ ROOT:           #1E88E5 (Primary Blue)
├─ Directorate:    #42A5F5 (Light Blue)
├─ Work Unit:      #90CAF9 (Sky Blue)
└─ Affairs:        #BBDEFB (Pale Blue)

Regional/Branch:   Green theme
├─ Regional:       #43A047 (Green)
└─ Branch:         #8BC34A (Lime Green)
   ├─ Kelas 1:     #2E7D32 (Dark Green)
   ├─ Kelas 2:     #43A047 (Medium Green)
   ├─ Kelas 3:     #8BC34A (Light Green)
   └─ Kelas 3A:    #AED581 (Pale Green)

Subsidiaries:      Purple theme
└─ Subsidiary:     #8E24AA (Purple)

Positions:         Orange/Gray theme
```

## Extending the Organization Module

### Adding a New Unit Type

To add a new unit type (e.g., "DIVISION" under Directorate):

1. **Database Schema**: Update `ORGANIZATIONAL_UNITS` headers in Config.gs
2. **Model**: Add validation in `OrganizationModel.OrganizationalUnit.validateParentChild()`
3. **Controller**: Add to `OrganizationController.OrganizationalUnit` if needed
4. **Frontend**: Update `OrgUnitManager.getNodeIcon()`, `getTypeBadge()`, `getTypeLabel()`
5. **Routes**: Already handled by generic `routeOrganizationalUnits()`

### Adding Lifecycle Operations

To add a new lifecycle operation (e.g., "Split"):

1. **Model**: Add `OrganizationModel.OrganizationalUnit.splitUnit()`
2. **Controller**: Add to `OrganizationController.OrganizationalUnit`
3. **Route**: Add to `routeOrganizationalUnits` or create new `routeOfficeLifecycle` action
4. **Frontend**: Add to OrgUnitManager with confirmation dialog
5. **Modal**: Create lifecycle modal in organization_modals.html

## Next Steps

- **Run Migration**: Execute `setupCompleteDatabase()` in Apps Script Editor
- **Test API**: Use browser console to test endpoints
- **Create Units**: (TODO) After modals are implemented
- **View Diagram**: (TODO) After D3.js update
- **Manage Lifecycle**: (TODO) After lifecycle modals are implemented

## Related Documentation

- [IMPLEMENTATION_COMPLETE_FINAL.md](../IMPLEMENTATION_COMPLETE_FINAL.md) - Complete implementation status
- [SPINNER_ERROR_FIXED.md](../SPINNER_ERROR_FIXED.md) - Frontend implementation details
- [ORGANIZATION_RESTRUCTURE_COMPLETE.md](../ORGANIZATION_RESTRUCTURE_COMPLETE.md) - Technical reference
- [InitializeApp.gs](../InitializeApp.gs) - Migration system documentation
- [Creating a CRUD Module](./51-creating-crud-module.md) - Guide for building CRUD modules
- [Database Schema](./40-database-schema.md) - Organization table schemas
- [Frontend Components](./21-frontend-components.md) - UI component patterns

## Quick Reference

### Run Migration
```javascript
// In Apps Script Editor
setupCompleteDatabase()
```

### Test Organizational Units API
```javascript
// Browser Console
apiCall('organizational-units/hierarchy', {}).then(console.log);
apiCall('organizational-units/list', {}).then(console.log);
apiCall('branch-offices/list', {}).then(console.log);
```

### View Organizational Structure
1. Open web app
2. Navigate to **Organization** page
3. See **Organizational Units** tab (default)
4. View stats cards, tree structure, and filters
5. Toggle between Tree View and Flat View

---

**Last Updated**: 2026-02-03
**Version**: 3.0.0 (BPJS Structure)
**Status**: Backend 100% Complete, Frontend 80% Complete
