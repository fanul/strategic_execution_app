# User Management Module

## Overview

The User Management module handles user accounts, roles, and permissions. It includes:
- User CRUD operations
- Role management
- Permission-based access control
- Password management

## Backend Files

| File | Description |
|------|-------------|
| Controllers/UserController.gs | User business logic |
| Controllers/RoleController.gs | Role business logic |
| Models/User.gs | User data model |
| Models/Role.gs | Role data model |
| Auth.gs | Authentication & authorization |

## Frontend Files

| File | Description |
|------|-------------|
| pages/users.html | User management page |
| pages/roles.html | Role management page |
| assets/js/users_crud.html | User CRUD operations |
| assets/js/roles_crud.html | Role CRUD operations |

## User Data Structure

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

## Role Data Structure

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

## API Endpoints

### Users

| Endpoint | Description |
|----------|-------------|
| `users/list` | Get all users |
| `users/get` | Get user by ID |
| `users/create` | Create new user |
| `users/update` | Update user |
| `users/delete` | Delete user (soft delete) |
| `users/changePassword` | Change user password |

### Roles

| Endpoint | Description |
|----------|-------------|
| `roles/list` | Get all roles |
| `roles/get` | Get role by ID |
| `roles/create` | Create new role |
| `roles/update` | Update role |
| `roles/delete` | Delete role |
| `roles/clone` | Clone existing role |
| `roles/getPermissions` | Get role permissions |

## Permission System

Permissions follow the pattern: `{resource}.{action}`

**Examples**:
- `users.view` - View users
- `users.create` - Create user
- `organization.edit` - Edit organization
- `kpi.delete` - Delete KPI
- `*` - All permissions (super admin)

## Default Roles

| Role Code | Role Name | Permissions |
|-----------|-----------|-------------|
| SUPER_ADMIN | Super Administrator | All permissions (*) |
| ADMIN | Administrator | users.*, roles.*, organization.*, etc. |
| MANAGER | Manager | organization.view, kpi.*, reports.view |
| USER | User | Basic read permissions |
| VIEWER | Viewer | Read-only permissions |

## Next Steps

- See [Controllers](./06-controllers.md) for controller details
- See [Models](./07-models.md) for model details
- See [Auth](./04-core-files.md#authgs) for authentication
