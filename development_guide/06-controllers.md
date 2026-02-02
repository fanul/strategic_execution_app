# Controllers Documentation

## Overview

Controllers handle business logic, validation, and coordinate between models and services. They receive requests from the API layer and return formatted responses.

## Controller Directory

```
Controllers/
├── DashboardController.gs         # Dashboard data aggregation
├── ImpactCenterController.gs      # Impact center management
├── ImportController.gs            # Data import
├── KPIController.gs               # KPI CRUD and progress
├── OKRController.gs               # OKR management
├── OrganizationController.gs      # Organization hierarchy
├── ProgramController.gs           # Program and activity
├── ReportController.gs            # Report generation
├── RoleController.gs              # Role and permission
├── StrategicController.gs         # Strategic planning
└── UserController.gs              # User management
```

## Controller Pattern

All controllers follow this pattern:

```javascript
const MyController = {
    create: function(data, creatorId) {
        try {
            // 1. Validate input
            const validation = ValidationService.validateMyEntity(data);
            if (!validation.isValid) {
                return ResponseFormatter.formatValidationError(validation.errors);
            }

            // 2. Check constraints
            if (!MyModel.isUnique(data.field)) {
                return ResponseFormatter.formatError('Field already exists');
            }

            // 3. Call model
            data.created_by = creatorId;
            const result = MyModel.create(data);

            // 4. Log audit
            if (result.success) {
                AuditService.logAudit('CREATE', 'MyEntity', result.data.id, creatorId);
            }

            return result;
        } catch (error) {
            Logger.log('MyController.create error: ' + error);
            return ResponseFormatter.formatError('Failed to create', error.toString());
        }
    },

    update: function(id, data, updaterId) {
        // Similar pattern with field-level revision logging
    },

    delete: function(id, deleterId) {
        // Check constraints before deletion
    },

    getAll: function(filters) {
        try {
            const data = MyModel.getAll(filters);
            return ResponseFormatter.formatSuccess(data);
        } catch (error) {
            return ResponseFormatter.formatError('Failed to fetch', error.toString());
        }
    },

    getById: function(id) {
        try {
            const data = MyModel.findById(id);
            if (!data) {
                return ResponseFormatter.formatNotFound('MyEntity');
            }
            return ResponseFormatter.formatSuccess(data);
        } catch (error) {
            return ResponseFormatter.formatError('Failed to fetch', error.toString());
        }
    }
};
```

## DashboardController.gs

**Purpose**: Dashboard data aggregation and statistics.

**Methods**

| Method | Description |
|--------|-------------|
| `getData(userId)` | Get personalized dashboard data |
| `getExecutiveData()` | Get executive-level dashboard |
| `getRecentActivities(limit)` | Get recent audit activities |
| `getKPIData(filters)` | Get KPI data with progress |
| `getImpactCenterData(filters)` | Get impact center metrics |
| `getGoalsProgress(filters)` | Get goals progress for charts |
| `calculatePerformanceScore(kpis, okrs)` | Calculate overall performance |

**Usage Example**

```javascript
// API.gs
case 'dashboard.getData':
    const user = Auth.getCurrentUser(sessionToken);
    response = DashboardController.getData(user.user_id);
    break;
```

## UserController.gs

**Purpose**: User management operations.

**Methods**

| Method | Description |
|--------|-------------|
| `create(userData, creatorId)` | Create new user |
| `update(userId, userData, updaterId)` | Update user |
| `delete(userId, deleterId)` | Soft delete user (set is_active=false) |
| `getById(userId)` | Get user by ID |
| `getAll(filters)` | Get all users with filters |
| `changePassword(userId, oldPassword, newPassword, updaterId)` | Change password |

**User Data Structure**

```javascript
{
    user_id: 'uuid',
    username: 'jdoe',
    email: 'jdoe@example.com',
    password_hash: 'hashed',
    full_name: 'John Doe',
    role_id: 'role-uuid',
    is_active: true,
    created_at: '2026-02-02 10:00:00',
    created_by: 'creator-uuid'
}
```

## RoleController.gs

**Purpose**: Role and permission management.

**Methods**

| Method | Description |
|--------|-------------|
| `create(roleData, creatorId)` | Create new role |
| `update(roleId, roleData, updaterId)` | Update role |
| `delete(roleId, deleterId)` | Delete role |
| `getAll()` | Get all roles |
| `getById(roleId)` | Get role by ID |
| `clone(roleId, newRoleName, creatorId)` | Clone existing role |

**Role Data Structure**

```javascript
{
    role_id: 'uuid',
    role_name: 'Administrator',
    role_code: 'ADMIN',
    description: 'Full system access',
    permissions: JSON.stringify([
        'users.*', 'roles.*', 'organization.*', ...
    ]),
    is_system_role: false
}
```

## OrganizationController.gs

**Purpose**: Organization structure management with hierarchical operations.

This controller has nested controllers for each entity type:

### OrganizationController.Directorate

| Method | Description |
|--------|-------------|
| `create(data, creatorId)` | Create directorate |
| `update(directorateId, data, updaterId)` | Update directorate |
| `delete(directorateId, deleterId)` | Delete directorate (direct) |
| `getAll(filters)` | Get all directorates |
| `getById(directorateId)` | Get directorate by ID |
| `checkChildren(directorateId)` | Check for child entities |
| `getAlternatives(directorateId)` | Get reassignment alternatives |
| `cascadeDelete(directorateId, deleterId)` | Delete with all children |
| `reassignAndDelete(directorateId, newDirectorateId, deleterId)` | Reassign children and delete |

### OrganizationController.WorkUnit

| Method | Description |
|--------|-------------|
| `create(data, creatorId)` | Create work unit |
| `update(workUnitId, data, updaterId)` | Update work unit |
| `delete(workUnitId, deleterId)` | Delete work unit |
| `getAll(filters)` | Get all work units |
| `getById(workUnitId)` | Get work unit by ID |
| `getByDirectorate(directorateId)` | Get work units by directorate |
| `checkChildren(workUnitId)` | Check for child entities |
| `getAlternatives(workUnitId)` | Get reassignment alternatives |
| `cascadeDelete(workUnitId, deleterId)` | Delete with all children |
| `reassignAndDelete(workUnitId, newWorkUnitId, deleterId)` | Reassign children and delete |

### OrganizationController.Affair

| Method | Description |
|--------|-------------|
| `create(data, creatorId)` | Create affair |
| `update(affairId, data, updaterId)` | Update affair |
| `delete(affairId, deleterId)` | Delete affair |
| `getAll(filters)` | Get all affairs |
| `getById(affairId)` | Get affair by ID |
| `getByWorkUnit(workUnitId)` | Get affairs by work unit |
| `checkChildren(affairId)` | Check for child positions |
| `getAlternatives(affairId)` | Get reassignment alternatives |
| `cascadeDelete(affairId, deleterId)` | Delete with all children |
| `reassignAndDelete(affairId, newAffairId, deleterId)` | Reassign children and delete |

### OrganizationController.Position

| Method | Description |
|--------|-------------|
| `create(data, creatorId)` | Create position |
| `update(positionId, data, updaterId)` | Update position |
| `delete(positionId, deleterId)` | Delete position |
| `getAll(filters)` | Get all positions |
| `getById(positionId)` | Get position by ID |

### OrganizationController.PositionAssignment

| Method | Description |
|--------|-------------|
| `create(data, creatorId)` | Create position assignment |
| `update(assignmentId, data, updaterId)` | Update assignment |
| `endAssignment(assignmentId, endDate, updaterId)` | End assignment |
| `getAll(filters)` | Get all assignments |
| `getByUser(userId)` | Get assignments by user |

**API Endpoints**

```
directorates/list
directorates/create
directorates/update
directorates/delete
directorates/check-children
directorates/get-alternatives
directorates/delete-cascade
directorates/delete-reassign

work-units/list
work-units/create
work-units/update
work-units/delete
work-units/check-children
work-units/get-alternatives
work-units/delete-cascade
work-units/delete-reassign

affairs/list
affairs/create
affairs/update
affairs/delete
affairs/check-children
affairs/get-alternatives
affairs/delete-cascade
affairs/delete-reassign

positions/list
positions/create
positions/update
positions/delete
```

## StrategicController.gs

**Purpose**: Strategic planning management.

### StrategicController.Period

| Method | Description |
|--------|-------------|
| `create(data, creatorId)` | Create strategic period |
| `setActive(periodId, userId)` | Set period as active |
| `update(periodId, updates, userId)` | Update period |
| `getDeletionImpact(periodId)` | Check what will be deleted |
| `deleteCascade(periodId, userId)` | Delete period with cascade |
| `getAll()` | Get all periods |
| `getActive()` | Get active period |

### StrategicController.Vision

| Method | Description |
|--------|-------------|
| `create(data, creatorId)` | Create vision (max 1000 chars) |
| `approve(visionId, approverId)` | Approve vision |
| `getByPeriod(periodId)` | Get visions by period |
| `update(visionId, updates, userId)` | Update vision |
| `delete(visionId, userId)` | Delete vision |

### StrategicController.Mission

| Method | Description |
|--------|-------------|
| `create(data, creatorId)` | Create mission (max 1500 chars) |
| `approve(missionId, approverId)` | Approve mission |
| `getByVision(visionId)` | Get missions by vision |
| `update(missionId, updates, userId)` | Update mission |
| `delete(missionId, userId)` | Delete mission |

### StrategicController.Initiative

| Method | Description |
|--------|-------------|
| `create(data, creatorId)` | Create strategic initiative |
| `getByYear(year)` | Get initiatives by year |
| `update(initiativeId, updates, userId)` | Update initiative |
| `delete(initiativeId, userId)` | Delete initiative |

### StrategicController.Goal

| Method | Description |
|--------|-------------|
| `create(data, creatorId)` | Create organizational goal |
| `getByYear(year)` | Get goals by year |
| `update(goalId, updates, userId)` | Update goal |
| `delete(goalId, userId)` | Delete goal |

### StrategicController.WorkUnitGoal

| Method | Description |
|--------|-------------|
| `create(data, creatorId)` | Create work unit goal |
| `getByOrgGoal(orgGoalId)` | Get work unit goals by org goal |
| `getByWorkUnit(workUnitId)` | Get work unit goals by work unit |

## KPIController.gs

**Purpose**: KPI management (organizational and individual).

### Main Methods

| Method | Description |
|--------|-------------|
| `create(data, creatorId)` | Create KPI |
| `update(kpiId, data, updaterId)` | Update KPI |
| `getByWorkUnit(workUnitId, year)` | Get KPIs by work unit |
| `getById(kpiId)` | Get KPI by ID |
| `delete(kpiId, deleterId)` | Delete KPI |

### KPIController.Progress

| Method | Description |
|--------|-------------|
| `record(data, reporterId)` | Record monthly KPI progress |
| `verify(progressId, verifierId)` | Verify KPI progress |
| `getByKPI(kpiId, year, month)` | Get progress entries |

### KPIController.Individual

| Method | Description |
|--------|-------------|
| `create(data, creatorId)` | Create individual KPI |
| `update(individualKpiId, data, updaterId)` | Update individual KPI |
| `delete(individualKpiId, deleterId)` | Delete individual KPI |
| `getByPosition(positionId, year)` | Get individual KPIs by position |

**KPI Status Thresholds**

| Status | Achievement % |
|--------|---------------|
| ON_TRACK | >= 90% |
| AT_RISK | 75-89% |
| OFF_TRACK | < 75% |

## OKRController.gs

**Purpose**: OKR (Objectives and Key Results) management.

| Method | Description |
|--------|-------------|
| `create(data, creatorId)` | Create OKR |
| `update(okrId, data, updaterId)` | Update OKR |
| `submit(okrId, userId)` | Submit OKR for review |
| `review(okrId, reviewerId, reviewNotes, approved)` | Review OKR |
| `getByUser(userId, year, quarter)` | Get OKRs by user |
| `getCurrentWeek(userId)` | Get current week OKR |
| `getMyOKRs(data)` | Get my OKRs (helper) |
| `getOKRsToReview(data)` | Get pending reviews |
| `save(data, userId)` | Create or update OKR |
| `getById(okrId)` | Get OKR by ID |

**OKR Workflow**

```
Draft → Submitted → Reviewed → Approved/Rejected
```

## ProgramController.gs

**Purpose**: Program and Activity management.

### Main Methods

| Method | Description |
|--------|-------------|
| `create(data, creatorId)` | Create program |
| `update(programId, data, updaterId)` | Update program |
| `delete(programId, deleterId)` | Delete program |
| `getByWorkUnitGoal(workUnitGoalId)` | Get programs by work unit goal |
| `getAllPrograms(filters)` | Get all programs |
| `getById(programId)` | Get program by ID |

### ProgramController.Activity

| Method | Description |
|--------|-------------|
| `create(data, creatorId)` | Create activity |
| `update(activityId, data, updaterId)` | Update activity |
| `delete(activityId, deleterId)` | Delete activity |
| `getByProgram(programId)` | Get activities by program |

## ReportController.gs

**Purpose**: Report generation.

| Method | Description |
|--------|-------------|
| `generateKPIReport(filters)` | Generate KPI summary report |
| `generateOKRReport(filters)` | Generate OKR summary report |
| `generatePerformanceDashboard(year)` | Generate performance dashboard |
| `calculateKPIStatus(achievementPercentage)` | Calculate KPI status |
| `calculateSummary(reportData)` | Calculate report summary |

## Creating a New Controller

### Controller Template

```javascript
/**
 * MyController - My Entity business logic
 */
const MyController = (function() {

    /**
     * Validation helper
     */
    function validateMyEntity(data, isUpdate) {
        const errors = [];

        if (!isUpdate && !data.name) {
            errors.push({ field: 'name', message: 'Name is required' });
        }

        if (data.description && data.description.length > 5000) {
            errors.push({ field: 'description', message: 'Description too long' });
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * Public API
     */
    return {
        /**
         * Create new entity
         */
        create: function(data, creatorId) {
            try {
                // Validate
                const validation = validateMyEntity(data, false);
                if (!validation.isValid) {
                    return ResponseFormatter.formatValidationError(validation.errors);
                }

                // Add audit fields
                data.created_by = creatorId;

                // Call model
                const result = MyModel.create(data);

                // Log audit
                if (result.success) {
                    AuditService.logAudit('CREATE', 'MyEntity',
                        result.data.id, creatorId);
                }

                return result;
            } catch (error) {
                Logger.log('MyController.create error: ' + error);
                return ResponseFormatter.formatError(
                    'Failed to create', error.toString()
                );
            }
        },

        /**
         * Update entity
         */
        update: function(id, data, updaterId) {
            try {
                // Validate
                const validation = validateMyEntity(data, true);
                if (!validation.isValid) {
                    return ResponseFormatter.formatValidationError(validation.errors);
                }

                // Get old data for revision logging
                const oldData = MyModel.findById(id);
                if (!oldData) {
                    return ResponseFormatter.formatNotFound('MyEntity');
                }

                // Call model
                data.updated_by = updaterId;
                const result = MyModel.update(id, data);

                // Log revisions
                if (result.success) {
                    const changes = [];
                    for (const field in data) {
                        if (oldData[field] !== data[field]) {
                            changes.push({
                                field: field,
                                old: oldData[field],
                                new: data[field]
                            });
                        }
                    }
                    if (changes.length > 0) {
                        AuditService.logMultipleRevisions(
                            'MyEntity', id, changes, 'UPDATE', updaterId
                        );
                    }
                }

                return result;
            } catch (error) {
                Logger.log('MyController.update error: ' + error);
                return ResponseFormatter.formatError(
                    'Failed to update', error.toString()
                );
            }
        },

        /**
         * Delete entity
         */
        delete: function(id, deleterId) {
            try {
                // Check constraints
                const hasDependencies = MyModel.hasDependencies(id);
                if (hasDependencies) {
                    return ResponseFormatter.formatError(
                        'Cannot delete: entity has dependencies'
                    );
                }

                // Call model
                const result = MyModel.delete(id);

                // Log audit
                if (result.success) {
                    AuditService.logAudit('DELETE', 'MyEntity', id, deleterId);
                }

                return result;
            } catch (error) {
                Logger.log('MyController.delete error: ' + error);
                return ResponseFormatter.formatError(
                    'Failed to delete', error.toString()
                );
            }
        },

        /**
         * Get all entities
         */
        getAll: function(filters) {
            try {
                const data = MyModel.getAll(filters);
                return ResponseFormatter.formatSuccess(data);
            } catch (error) {
                Logger.log('MyController.getAll error: ' + error);
                return ResponseFormatter.formatError(
                    'Failed to fetch', error.toString()
                );
            }
        },

        /**
         * Get entity by ID
         */
        getById: function(id) {
            try {
                const data = MyModel.findById(id);
                if (!data) {
                    return ResponseFormatter.formatNotFound('MyEntity');
                }
                return ResponseFormatter.formatSuccess(data);
            } catch (error) {
                Logger.log('MyController.getById error: ' + error);
                return ResponseFormatter.formatError(
                    'Failed to fetch', error.toString()
                );
            }
        }
    };
})();
```

## Next Steps

- See [Models](./07-models.md) for model documentation
- See [Organization Module](./08-organization-module.md) for detailed organization module documentation
- See [Creating a New Module](./50-creating-new-module.md) for step-by-step module creation
