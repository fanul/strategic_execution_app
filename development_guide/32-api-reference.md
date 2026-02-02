# API Reference

## Overview

All API calls use the `apiCall(endpoint, data)` function from the frontend, which routes through `Code.gs` → `API.gs` → Controllers.

## Request Format

```javascript
{
  "action": "resource.action",  // e.g., "users.list"
  "data": { /* payload */ },
  "sessionToken": "user-session-token"
}
```

## Response Format

### Success

```javascript
{
  "success": true,
  "data": { /* response data */ },
  "message": "Optional message"
}
```

### Error

```javascript
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error"
}
```

## API Endpoints

### Authentication

| Endpoint | Description |
|----------|-------------|
| `auth.login` | User login |
| `auth.logout` | User logout |
| `auth.getCurrentUser` | Get current user |
| `auth.changePassword` | Change password |

### Users

| Endpoint | Description |
|----------|-------------|
| `users.list` | Get all users |
| `users.getById` | Get user by ID |
| `users.create` | Create user |
| `users.update` | Update user |
| `users.delete` | Delete user |
| `users.changePassword` | Change user password |

### Roles

| Endpoint | Description |
|----------|-------------|
| `roles.list` | Get all roles |
| `roles.getById` | Get role by ID |
| `roles.create` | Create role |
| `roles.update` | Update role |
| `roles.delete` | Delete role |
| `roles.clone` | Clone role |
| `roles.getPermissions` | Get role permissions |

### Organization

#### Directorates

| Endpoint | Description |
|----------|-------------|
| `directorates.list` | List directorates |
| `directorates.get` | Get directorate |
| `directorates.create` | Create directorate |
| `directorates.update` | Update directorate |
| `directorates.delete` | Delete directorate |
| `directorates.check-children` | Check child entities |
| `directorates.get-alternatives` | Get reassignment options |
| `directorates.delete-cascade` | Cascade delete |
| `directorates.delete-reassign` | Reassign and delete |

#### Work Units

| Endpoint | Description |
|----------|-------------|
| `work-units.list` | List work units |
| `work-units.get` | Get work unit |
| `work-units.create` | Create work unit |
| `work-units.update` | Update work unit |
| `work-units.delete` | Delete work unit |
| `work-units.check-children` | Check child entities |
| `work-units.get-alternatives` | Get reassignment options |
| `work-units.delete-cascade` | Cascade delete |
| `work-units.delete-reassign` | Reassign and delete |

#### Affairs

| Endpoint | Description |
|----------|-------------|
| `affairs.list` | List affairs |
| `affairs.get` | Get affair |
| `affairs.create` | Create affair |
| `affairs.update` | Update affair |
| `affairs.delete` | Delete affair |
| `affairs.check-children` | Check child positions |
| `affairs.get-alternatives` | Get reassignment options |
| `affairs.delete-cascade` | Cascade delete |
| `affairs.delete-reassign` | Reassign and delete |

#### Positions

| Endpoint | Description |
|----------|-------------|
| `positions.list` | List positions |
| `positions.get` | Get position |
| `positions.create` | Create position |
| `positions.update` | Update position |
| `positions.delete` | Delete position |

### Strategic Planning

| Endpoint | Description |
|----------|-------------|
| `periods.list` | List periods |
| `periods.getActive` | Get active period |
| `periods.setActive` | Set active period |
| `periods.create` | Create period |
| `periods.update` | Update period |
| `periods.getDeletionImpact` | Check deletion impact |
| `periods.deleteCascade` | Delete period with cascade |
| `visions.create` | Create vision |
| `visions.update` | Update vision |
| `visions.delete` | Delete vision |
| `visions.approve` | Approve vision |
| `visions.getByPeriod` | Get visions by period |
| `missions.create` | Create mission |
| `missions.update` | Update mission |
| `missions.delete` | Delete mission |
| `missions.approve` | Approve mission |
| `missions.getByVision` | Get missions by vision |
| `goals.create` | Create goal |
| `goals.update` | Update goal |
| `goals.delete` | Delete goal |
| `goals.getByYear` | Get goals by year |
| `workUnitGoals.create` | Create work unit goal |
| `goals.getByWorkUnit` | Get goals by work unit |

### KPIs

| Endpoint | Description |
|----------|-------------|
| `kpis.list` | List KPIs |
| `kpis.get` | Get KPI |
| `kpis.create` | Create KPI |
| `kpis.update` | Update KPI |
| `kpis.delete` | Delete KPI |
| `kpis.getByWorkUnit` | Get KPIs by work unit |
| `kpis.progress.record` | Record progress |
| `kpis.progress.verify` | Verify progress |
| `kpis.progress.getByKPI` | Get progress for KPI |
| `kpis.individual.create` | Create individual KPI |
| `kpis.individual.update` | Update individual KPI |
| `kpis.individual.delete` | Delete individual KPI |
| `kpis.individual.getByPosition` | Get KPIs by position |

### Programs

| Endpoint | Description |
|----------|-------------|
| `programs.list` | List programs |
| `programs.get` | Get program |
| `programs.create` | Create program |
| `programs.update` | Update program |
| `programs.delete` | Delete program |
| `programs.getByWorkUnitGoal` | Get programs by goal |
| `activities.create` | Create activity |
| `activities.update` | Update activity |
| `activities.delete` | Delete activity |
| `activities.getByProgram` | Get activities by program |

### OKRs

| Endpoint | Description |
|----------|-------------|
| `okrs.get` | Get OKRs |
| `okrs.getCurrentWeek` | Get current week OKR |
| `okrs.create` | Create OKR |
| `okrs.update` | Update OKR |
| `okrs.delete` | Delete OKR |
| `okrs.submit` | Submit OKR |
| `okrs.review` | Review OKR |
| `okrs.getMyOKRs` | Get my OKRs |
| `okrs.getToReview` | Get pending reviews |

### Reports

| Endpoint | Description |
|----------|-------------|
| `reports.kpi` | Generate KPI report |
| `reports.okr` | Generate OKR report |
| `reports.performance` | Generate performance dashboard |
| `reports.export.csv` | Export to CSV |
| `reports.export.sheets` | Export to Sheets |

### SWOT

| Endpoint | Description |
|----------|-------------|
| `swot.matrix` | Get SWOT matrix |
| `swot.create` | Create SWOT item |
| `swot.update` | Update SWOT item |
| `swot.delete` | Delete SWOT item |
| `swot.impact` | Get impact analysis |
| `swot.getByGoal` | Get SWOT by goal |

### Audit/Revisions

| Endpoint | Description |
|----------|-------------|
| `revisions.getHistory` | Get revision history |
| `revisions.restore` | Restore revision |
| `revisions.compare` | Compare revisions |

### Notifications

| Endpoint | Description |
|----------|-------------|
| `notifications.get` | Get notifications |
| `notifications.markAsRead` | Mark as read |
| `notifications.markAllAsRead` | Mark all as read |
| `notifications.delete` | Delete notification |

## Usage Example

```javascript
// Get all users
const result = await apiCall('users/list', { status: 'active' });
if (result.success) {
    console.log(result.data); // Array of users
} else {
    showToast(result.message, 'error');
}

// Create new user
const createResult = await apiCall('users/create', {
    username: 'jdoe',
    email: 'jdoe@example.com',
    full_name: 'John Doe',
    role_id: 'role-uuid'
});

// Check children before delete
const checkResult = await apiCall('directorates/check-children', {
    id: 'directorate-uuid'
});
// Returns: { success: true, data: { hasChildren: true, workUnits: 5, ... } }
```

## Next Steps

- See [Creating a New Module](./50-creating-new-module.md) for adding new endpoints
- See [Patterns & Conventions](./31-patterns-conventions.md) for coding standards
