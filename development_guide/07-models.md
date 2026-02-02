# Models Documentation

## Overview

Models handle data access and business rules for database operations. They interact with Google Sheets through DatabaseService and provide CRUD operations for each entity type.

## Models Directory

```
Models/
├── ImpactCenter.gs           # Impact center data model
├── KPI.gs                    # KPI and progress models
├── OKR.gs                    # OKR data model
├── Organization.gs           # Organization hierarchy models
├── Program.gs                # Program and activity models
├── Role.gs                   # Role data model
├── Strategic.gs              # Strategic planning models
└── User.gs                   # User data model
```

## Model Pattern

All models follow this pattern:

```javascript
const MyModel = {
    findById: function(id) {
        const items = DatabaseService.getTableData(DB_CONFIG.SHEET_NAMES.MY_ENTITY);
        return items.find(item => item.id === id) || null;
    },

    getAll: function(filters = {}) {
        let items = DatabaseService.getTableData(DB_CONFIG.SHEET_NAMES.MY_ENTITY);

        // Apply filters
        if (filters.status) {
            items = items.filter(item => item.status === filters.status);
        }
        if (filters.sortField) {
            items.sort((a, b) => a[filters.sortField].localeCompare(b[filters.sortField]));
        }

        return items;
    },

    create: function(data) {
        const newItem = {
            id: StringUtils.generateUUID(),
            ...data,
            created_at: DateUtils.formatDateTime(new Date()),
            updated_at: DateUtils.formatDateTime(new Date())
        };

        const result = DatabaseService.insertRecord(
            DB_CONFIG.SHEET_NAMES.MY_ENTITY,
            newItem
        );

        return result.success
            ? { success: true, data: newItem, message: 'Created successfully' }
            : { success: false, error: result.error };
    },

    update: function(id, data) {
        const updateData = {
            ...data,
            updated_at: DateUtils.formatDateTime(new Date())
        };
        delete updateData.id;
        delete updateData.created_at;

        const result = DatabaseService.updateRecord(
            DB_CONFIG.SHEET_NAMES.MY_ENTITY,
            'id',
            id,
            updateData
        );

        return result.success
            ? { success: true, data: { id, ...updateData }, message: 'Updated successfully' }
            : { success: false, error: result.error };
    },

    delete: function(id) {
        const result = DatabaseService.deleteRecord(
            DB_CONFIG.SHEET_NAMES.MY_ENTITY,
            'id',
            id
        );

        return result.success
            ? { success: true, message: 'Deleted successfully' }
            : { success: false, error: result.error };
    }
};
```

## Models/User.gs

**Purpose**: User data model and business logic.

**Methods**

| Method | Description |
|--------|-------------|
| `findById(userId)` | Find user by ID |
| `findByEmail(email)` | Find user by email |
| `findByUsername(username)` | Find user by username |
| `getAll(filters)` | Get all users with filters |
| `getActiveUsers()` | Get active users |
| `create(userData)` | Create new user |
| `update(userId, userData)` | Update user |
| `delete(userId)` | Soft delete user |
| `isEmailUnique(email, excludeId)` | Check email uniqueness |
| `isUsernameUnique(username, excludeId)` | Check username uniqueness |
| `getByRole(roleId)` | Get users by role |
| `updateLastLogin(userId)` | Update last login timestamp |

**User Data Structure**

```javascript
{
    user_id: 'uuid',
    username: 'jdoe',
    email: 'jdoe@example.com',
    password_hash: 'SHA-256 hash',
    full_name: 'John Doe',
    role_id: 'role-uuid',
    is_active: true,
    active_from: '2026-01-01',
    active_until: '2026-12-31',
    last_login: '2026-02-02 10:30:00',
    created_at: '2026-01-01 09:00:00',
    created_by: 'admin-uuid',
    updated_at: '2026-02-01 14:20:00',
    updated_by: 'admin-uuid',
    notes: ''
}
```

## Models/Organization.gs

**Purpose**: Organization structure model with hierarchical operations.

This model has nested models for each entity type in the organization hierarchy.

### OrganizationModel.Directorate

**Purpose**: Top-level organization unit (e.g., "Directorate of Finance")

| Method | Description |
|--------|-------------|
| `findById(directorateId)` | Find directorate by ID |
| `getAll(filters)` | Get all directorates, sorted by sort_order |
| `create(data)` | Create directorate with auto-generated code |
| `update(directorateId, data)` | Update directorate fields |
| `delete(directorateId)` | Delete only if no active work units |
| `checkChildren(directorateId)` | Count descendant work units, affairs, positions |
| `getAlternatives(directorateId)` | Get other directorates for reassignment |
| `cascadeDelete(directorateId, deleterId)` | Delete directorate and all descendants |
| `reassignAndDelete(directorateId, newDirectorateId, deleterId)` | Move children to new parent, then delete |

**Key Fields**

```javascript
{
    directorate_id: 'uuid',
    directorate_code: 'DIR-001',  // Auto-generated if not provided
    directorate_name: 'Directorate of Finance',
    description: '...',
    director_position_id: 'position-uuid',  // Head of directorate
    is_active: true,
    active_from: '2026-01-01',
    active_until: '2026-12-31',
    sort_order: 1,
    created_at: '2026-01-01 09:00:00',
    created_by: 'user-uuid',
    updated_at: '2026-02-01 14:20:00',
    updated_by: 'user-uuid',
    notes: ''
}
```

### OrganizationModel.WorkUnit

**Purpose**: Second-level unit under directorates (e.g., "Accounting Department")

| Method | Description |
|--------|-------------|
| `findById(workUnitId)` | Find work unit by ID |
| `getAll(filters)` | Get all work units with JOINed directorate names |
| `getByDirectorate(directorateId)` | Get work units for specific directorate |
| `create(data)` | Create work unit with auto-generated code |
| `update(workUnitId, data)` | Update work unit fields |
| `delete(workUnitId)` | Delete only if no active affairs |
| `checkChildren(workUnitId)` | Count descendant affairs and positions |
| `getAlternatives(workUnitId)` | Get other work units for reassignment |
| `cascadeDelete(workUnitId, deleterId)` | Delete work unit and all descendants |
| `reassignAndDelete(workUnitId, newWorkUnitId, deleterId)` | Move children to new parent, then delete |

**Key Fields**

```javascript
{
    work_unit_id: 'uuid',
    directorate_id: 'directorate-uuid',
    work_unit_code: 'WU-001',  // Auto-generated
    work_unit_name: 'Accounting Department',
    description: '...',
    deputy_position_id: 'position-uuid',  // Head of work unit
    is_active: true,
    active_from: '2026-01-01',
    active_until: '2026-12-31',
    sort_order: 1,
    created_at: '2026-01-01 09:00:00',
    created_by: 'user-uuid',
    updated_at: '2026-02-01 14:20:00',
    updated_by: 'user-uuid',
    notes: ''
}
```

**Data Enhancement**: Results include `directorate_name` (e.g., "DIR-001 - Finance")

### OrganizationModel.Affair

**Purpose**: Third-level unit under work units (e.g., "Budget Planning")

| Method | Description |
|--------|-------------|
| `findById(affairId)` | Find affair by ID |
| `getAll(filters)` | Get all affairs with JOINed work unit and directorate names |
| `getByWorkUnit(workUnitId)` | Get affairs for specific work unit |
| `create(data)` | Create affair with auto-generated code |
| `update(affairId, data)` | Update affair fields |
| `delete(affairId)` | Delete only if no active positions |
| `checkChildren(affairId)` | Count descendant positions |
| `getAlternatives(affairId)` | Get other affairs for reassignment |
| `cascadeDelete(affairId, deleterId)` | Delete affair and all positions |
| `reassignAndDelete(affairId, newAffairId, deleterId)` | Move positions to new parent, then delete |

**Key Fields**

```javascript
{
    affair_id: 'uuid',
    work_unit_id: 'work-unit-uuid',
    affair_code: 'AFF-001',  // Auto-generated
    affair_name: 'Budget Planning',
    description: '...',
    assistant_deputy_position_id: 'position-uuid',
    is_active: true,
    active_from: '2026-01-01',
    active_until: '2026-12-31',
    sort_order: 1,
    created_at: '2026-01-01 09:00:00',
    created_by: 'user-uuid',
    updated_at: '2026-02-01 14:20:00',
    updated_by: 'user-uuid',
    notes: ''
}
```

**Data Enhancement**: Results include `work_unit_name` and `directorate_name`

### OrganizationModel.Position

**Purpose**: Fourth-level - job positions that can be assigned to users

| Method | Description |
|--------|-------------|
| `findById(positionId)` | Find position by ID |
| `getAll(filters)` | Get all positions with JOINed hierarchy names |
| `create(data)` | Create position with auto-generated code |
| `update(positionId, data)` | Update position fields |
| `delete(positionId)` | Delete only if no active assignments |
| `generateCode()` | Generate next position code (POS-XXX) |

**Key Fields**

```javascript
{
    position_id: 'uuid',
    position_code: 'POS-001',  // Auto-generated
    position_name: 'Budget Analyst',
    position_type: 'STAFF',  // EXECUTIVE, MANAGER, STAFF, CONTRACTOR, INTERN
    position_level: 'STAFF',  // C_LEVEL, DIRECTOR, MANAGER, SUPERVISOR, STAFF, TRAINEE
    parent_position_id: 'position-uuid',  // Optional supervisor
    directorate_id: 'directorate-uuid',
    work_unit_id: 'work-unit-uuid',
    affair_id: 'affair-uuid',  // Optional
    description: '...',
    responsibilities: '...',
    is_active: true,
    active_from: '2026-01-01',
    active_until: '2026-12-31',
    sort_order: 1,
    created_at: '2026-01-01 09:00:00',
    created_by: 'user-uuid',
    updated_at: '2026-02-01 14:20:00',
    updated_by: 'user-uuid',
    notes: ''
}
```

**Data Enhancement**: Results include `affair_name`, `work_unit_name`, `directorate_name`

### OrganizationModel.PositionAssignment

**Purpose**: Links users to positions with assignment tracking

| Method | Description |
|--------|-------------|
| `findById(assignmentId)` | Find assignment by ID |
| `getAll(filters)` | Get all assignments with optional filters |
| `getByUser(userId)` | Get active assignments for user |
| `getPrimaryPosition(userId)` | Get user's primary position |
| `create(data)` | Create new position assignment |
| `update(assignmentId, data)` | Update assignment details |
| `endAssignment(assignmentId, endDate, updaterId)` | Mark assignment as ended |

**Key Fields**

```javascript
{
    assignment_id: 'uuid',
    user_id: 'user-uuid',
    position_id: 'position-uuid',
    assignment_date: '2026-01-01',
    start_date: '2026-01-01',
    end_date: null,  // Set when assignment ends
    is_primary: true,
    assignment_status: 'ACTIVE',  // ACTIVE, ENDED, SUSPENDED, ON_LEAVE
    assignment_letter_number: 'SK-001/2026',
    created_at: '2026-01-01 09:00:00',
    created_by: 'user-uuid',
    updated_at: '2026-02-01 14:20:00',
    updated_by: 'user-uuid',
    notes: ''
}
```

## Models/Strategic.gs

**Purpose**: Strategic planning model.

**Nested Models**

- `StrategicModel.Period` - Strategic periods (e.g., "2026-2030")
- `StrategicModel.Vision` - Vision statements
- `StrategicModel.Mission` - Mission statements
- `StrategicModel.Initiative` - Strategic initiatives
- `StrategicModel.Goal` - Organizational goals
- `StrategicModel.WorkUnitGoal` - Work unit goals

### StrategicModel.Period

| Method | Description |
|--------|-------------|
| `findById(periodId)` | Find period by ID |
| `getAll()` | Get all strategic periods |
| `getActive()` | Get currently active period |
| `create(data)` | Create new strategic period |
| `update(periodId, data)` | Update period |
| `delete(periodId)` | Delete period (with cascade check) |

### StrategicModel.Vision

| Method | Description |
|--------|-------------|
| `findById(visionId)` | Find vision by ID |
| `getByPeriod(periodId)` | Get visions by period |
| `create(data)` | Create vision (max 1000 chars) |
| `update(visionId, data)` | Update vision |
| `delete(visionId)` | Delete vision |

### StrategicModel.Mission

| Method | Description |
|--------|-------------|
| `findById(missionId)` | Find mission by ID |
| `getByVision(visionId)` | Get missions by vision |
| `create(data)` | Create mission (max 1500 chars) |
| `update(missionId, data)` | Update mission |
| `delete(missionId)` | Delete mission |

## Models/KPI.gs

**Purpose**: KPI data model.

**Nested Models**

- `KPIModel` - Organizational KPIs
- `KPIModel.Progress` - Monthly progress tracking
- `KPIModel.Individual` - Individual KPIs

### KPIModel (Organizational)

| Method | Description |
|--------|-------------|
| `findById(kpiId)` | Find KPI by ID |
| `getAll(filters)` | Get all KPIs with filters |
| `getByWorkUnit(workUnitId, year)` | Get KPIs by work unit and year |
| `create(data)` | Create KPI |
| `update(kpiId, data)` | Update KPI |
| `delete(kpiId)` | Delete KPI |

### KPIModel.Progress

| Method | Description |
|--------|-------------|
| `findById(progressId)` | Find progress entry by ID |
| `getByKPI(kpiId, year, month)` | Get progress for specific KPI and month |
| `getByWorkUnit(workUnitId, year, month)` | Get all progress for work unit |
| `create(data)` | Record progress |
| `update(progressId, data)` | Update progress |
| `calculateAchievement(actual, target)` | Calculate achievement percentage |

### KPIModel.Individual

| Method | Description |
|--------|-------------|
| `findById(individualKpiId)` | Find individual KPI by ID |
| `getByPosition(positionId, year)` | Get individual KPIs by position and year |
| `create(data)` | Create individual KPI |
| `update(individualKpiId, data)` | Update individual KPI |
| `delete(individualKpiId)` | Delete individual KPI |

## Models/OKR.gs

**Purpose**: OKR data model.

| Method | Description |
|--------|-------------|
| `findById(okrId)` | Find OKR by ID |
| `getByUser(userId, year, quarter)` | Get OKRs by user, year, quarter |
| `getCurrentWeekOKR(userId)` | Get current week OKR for user |
| `getAll(filters)` | Get all OKRs with filters |
| `create(data)` | Create new OKR |
| `update(okrId, data)` | Update OKR |
| `submit(okrId)` | Submit OKR for review |
| `review(okrId, reviewerId, notes, approved)` | Review OKR |
| `delete(okrId)` | Delete OKR |

**OKR Data Structure**

```javascript
{
    okr_id: 'uuid',
    user_id: 'user-uuid',
    position_id: 'position-uuid',
    year: 2026,
    quarter: 1,
    week_number: 5,
    week_start_date: '2026-02-02',
    week_end_date: '2026-02-08',
    objective_text: 'Complete quarterly reporting',
    key_result_1: 'Submit draft report',
    key_result_1_progress: 50,
    key_result_2: 'Get manager approval',
    key_result_2_progress: 0,
    key_result_3: '',
    key_result_3_progress: 0,
    overall_progress: 25,
    challenges: '',
    support_needed: '',
    status: 'DRAFT',  // DRAFT, SUBMITTED, APPROVED, REJECTED
    submitted_at: null,
    reviewed_by: null,
    reviewed_at: null,
    review_notes: '',
    created_at: '2026-02-01 09:00:00',
    updated_at: '2026-02-02 14:20:00',
    notes: ''
}
```

## Models/Program.gs

**Purpose**: Program and Activity models.

### ProgramModel

| Method | Description |
|--------|-------------|
| `findById(programId)` | Find program by ID |
| `getAll(filters)` | Get all programs |
| `getByWorkUnitGoal(workUnitGoalId)` | Get programs by work unit goal |
| `create(data)` | Create program |
| `update(programId, data)` | Update program |
| `delete(programId)` | Delete program |

### ActivityModel

| Method | Description |
|--------|-------------|
| `findById(activityId)` | Find activity by ID |
| `getByProgram(programId)` | Get activities by program |
| `create(data)` | Create activity |
| `update(activityId, data)` | Update activity |
| `delete(activityId)` | Delete activity |

## Models/Role.gs

**Purpose**: Role and permissions model.

| Method | Description |
|--------|-------------|
| `findById(roleId)` | Find role by ID |
| `findByCode(roleCode)` | Find role by code |
| `getAll()` | Get all roles |
| `create(data)` | Create role |
| `update(roleId, data)` | Update role |
| `delete(roleId)` | Delete role |
| `clone(roleId, newRoleName, creatorId)` | Clone existing role |

**Role Data Structure**

```javascript
{
    role_id: 'uuid',
    role_name: 'Administrator',
    role_code: 'ADMIN',
    description: 'Full system access',
    permissions: JSON.stringify([
        'users.*',
        'roles.*',
        'organization.*',
        'strategic.*',
        'kpi.*',
        'okr.*',
        'programs.*',
        'reports.*'
    ]),
    is_system_role: false,
    created_at: '2026-01-01 09:00:00',
    created_by: 'user-uuid',
    updated_at: '2026-02-01 14:20:00',
    updated_by: 'user-uuid'
}
```

## Creating a New Model

### Model Template

```javascript
/**
 * MyModel - My Entity data model
 */
const MyModel = (function() {

    /**
     * Private helper - get table data
     */
    function getData() {
        return DatabaseService.getTableData(DB_CONFIG.SHEET_NAMES.MY_ENTITY);
    }

    /**
     * Public API
     */
    return {
        /**
         * Find entity by ID
         */
        findById: function(id) {
            const items = getData();
            return items.find(item => item.id === id) || null;
        },

        /**
         * Get all entities with optional filters
         */
        getAll: function(filters = {}) {
            let items = getData();

            // Apply filters
            if (filters.status) {
                items = items.filter(item => item.status === filters.status);
            }

            // Apply sorting
            if (filters.sortField) {
                items.sort((a, b) => {
                    const aVal = a[filters.sortField] || '';
                    const bVal = b[filters.sortField] || '';
                    return aVal.localeCompare(bVal);
                });
            }

            return items;
        },

        /**
         * Create new entity
         */
        create: function(data) {
            const newItem = {
                id: StringUtils.generateUUID(),
                ...data,
                created_at: DateUtils.formatDateTime(new Date()),
                updated_at: DateUtils.formatDateTime(new Date())
            };

            const result = DatabaseService.insertRecord(
                DB_CONFIG.SHEET_NAMES.MY_ENTITY,
                newItem
            );

            return result.success
                ? { success: true, data: newItem, message: 'Created successfully' }
                : { success: false, error: result.error };
        },

        /**
         * Update entity
         */
        update: function(id, data) {
            // Remove fields that shouldn't be updated
            const updateData = { ...data };
            delete updateData.id;
            delete updateData.created_at;
            updateData.updated_at = DateUtils.formatDateTime(new Date());

            const result = DatabaseService.updateRecord(
                DB_CONFIG.SHEET_NAMES.MY_ENTITY,
                'id',
                id,
                updateData
            );

            return result.success
                ? { success: true, data: { id, ...updateData }, message: 'Updated successfully' }
                : { success: false, error: result.error };
        },

        /**
         * Delete entity
         */
        delete: function(id) {
            const result = DatabaseService.deleteRecord(
                DB_CONFIG.SHEET_NAMES.MY_ENTITY,
                'id',
                id
            );

            return result.success
                ? { success: true, message: 'Deleted successfully' }
                : { success: false, error: result.error };
        },

        /**
         * Check if entity has dependencies
         */
        hasDependencies: function(id) {
            // Implement dependency check
            return false;
        },

        /**
         * Get field value safely
         */
        getFieldValue: function(item, field) {
            return item[field] || '-';
        }
    };
})();
```

## Next Steps

- See [Organization Module](./08-organization-module.md) for complete organization module documentation
- See [Creating a New Module](./50-creating-new-module.md) for step-by-step module creation
- See [Database Schema](./40-database-schema.md) for complete schema reference
