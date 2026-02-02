# Patterns & Conventions

## Overview

This guide covers the coding patterns and conventions used in the SEM application.

## Naming Conventions

### Files

| Type | Convention | Example |
|------|------------|---------|
| Backend Controller | PascalCase + `.gs` | `UserController.gs` |
| Backend Model | PascalCase + `.gs` | `UserModel.gs` |
| Backend Service | PascalCase + `.gs` | `AuditService.gs` |
| Frontend Page | kebab-case + `.html` | `my-page.html` |
| Frontend Script | snake_case + `.html` | `my_script.html` |
| Module Script | {module}_{type}.html | `users_crud.html` |

### Variables

| Type | Convention | Example |
|------|------------|---------|
| Constants | UPPER_SNAKE_CASE | `MAX_LOGIN_ATTEMPTS` |
| Variables | camelCase | `userName`, `userId` |
| Functions | camelCase | `getUserById()` |
| Classes | PascalCase | `UserManager` |
| Database columns | snake_case | `user_id`, `created_at` |

### API Endpoints

```
{resource}.{action}

Examples:
users.list
users.create
work-units.update
kpis.progress.record
```

## Response Format

All API responses follow this format:

### Success Response

```javascript
{
    success: true,
    data: {
        // Response data
    },
    message: "Optional success message"
}
```

### Error Response

```javascript
{
    success: false,
    message: "Error description",
    error: "Detailed error information"
}
```

### Validation Error

```javascript
{
    success: false,
    message: "Validation failed",
    errors: [
        { field: "email", message: "Invalid email format" },
        { field: "password", message: "Password too short" }
    ]
}
```

### Not Found

```javascript
{
    success: false,
    message: "User not found"
}
```

## Controller Pattern

```javascript
const MyController = {
    /**
     * Create new entity
     * @param {Object} data - Entity data
     * @param {string} creatorId - User ID creating the entity
     * @returns {Object} Result object
     */
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

    /**
     * Update entity
     */
    update: function(id, data, updaterId) {
        try {
            // 1. Validate
            const validation = ValidationService.validateMyEntity(data, true);
            if (!validation.isValid) {
                return ResponseFormatter.formatValidationError(validation.errors);
            }

            // 2. Get old data for revision logging
            const oldData = MyModel.findById(id);
            if (!oldData) {
                return ResponseFormatter.formatNotFound('MyEntity');
            }

            // 3. Call model
            data.updated_by = updaterId;
            const result = MyModel.update(id, data);

            // 4. Log revisions
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
            return ResponseFormatter.formatError('Failed to update', error.toString());
        }
    },

    /**
     * Delete entity
     */
    delete: function(id, deleterId) {
        try {
            // 1. Check constraints
            const hasDependencies = MyModel.hasDependencies(id);
            if (hasDependencies) {
                return ResponseFormatter.formatError(
                    'Cannot delete: entity has dependencies'
                );
            }

            // 2. Call model
            const result = MyModel.delete(id);

            // 3. Log audit
            if (result.success) {
                AuditService.logAudit('DELETE', 'MyEntity', id, deleterId);
            }

            return result;
        } catch (error) {
            Logger.log('MyController.delete error: ' + error);
            return ResponseFormatter.formatError('Failed to delete', error.toString());
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
            return ResponseFormatter.formatError('Failed to fetch', error.toString());
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
            return ResponseFormatter.formatError('Failed to fetch', error.toString());
        }
    }
};
```

## Model Pattern

```javascript
const MyModel = (function() {

    /**
     * Get table data
     */
    function getData() {
        return DatabaseService.getTableData(DB_CONFIG.SHEET_NAMES.MY_ENTITY);
    }

    /**
     * Public API
     */
    return {
        findById: function(id) {
            const items = getData();
            return items.find(item => item.id === id) || null;
        },

        getAll: function(filters = {}) {
            let items = getData();

            // Apply filters
            if (filters.status) {
                items = items.filter(item => item.status === filters.status);
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
        },

        isUnique: function(field, value, excludeId) {
            const items = getData();
            return !items.some(item =>
                item[field] === value && item.id !== excludeId
            );
        },

        hasDependencies: function(id) {
            // Implement dependency check
            return false;
        }
    };
})();
```

## Frontend Module Pattern (IIFE)

```javascript
<script>
const MyModule = (function() {
    'use strict';

    // Private state
    let currentState = 'initial';
    let cache = {};

    // Private functions
    function privateHelper(data) {
        // Process data
        return processed;
    }

    function validateInput(input) {
        return input && input.length > 0;
    }

    /**
     * Public API
     */
    return {
        /**
         * Initialize module
         */
        init: function() {
            debugLog('MY_MODULE', 'Module initialized');
            this.loadData();
        },

        /**
         * Load data
         */
        loadData: async function() {
            try {
                showLoading();
                const result = await apiCall('myentities/list');
                if (result.success) {
                    cache.data = result.data;
                    this.render();
                }
            } catch (error) {
                showToast('Failed to load data', 'error');
                debugLog('MY_MODULE', 'Load error', error);
            } finally {
                hideLoading();
            }
        },

        /**
         * Render data
         */
        render: function() {
            // Render logic
        },

        /**
         * Save entity
         */
        save: async function() {
            // Validate
            if (!validateInput(getInputValue())) {
                showToast('Invalid input', 'error');
                return;
            }

            try {
                showLoading();
                const data = getFormData();
                const result = await apiCall('myentities/create', data);

                if (result.success) {
                    showToast('Saved successfully', 'success');
                    closeModal('myEntityModal');
                    this.loadData();
                } else {
                    showToast(result.message, 'error');
                }
            } catch (error) {
                showToast('Failed to save', 'error');
            } finally {
                hideLoading();
            }
        },

        /**
         * Get state
         */
        getState: function() {
            return currentState;
        }
    };
})();

// Make available globally
window.myPublicFunction = MyModule.save;

// Auto-initialize
window.addEventListener('DOMContentLoaded', function() {
    MyModule.init();
});

// Track script loading
if (window.scriptLoadTracker) {
    window.scriptLoadTracker.loaded('my_module.html');
}
</script>
```

## Validation Pattern

```javascript
/**
 * Validate entity
 * @param {Object} data - Data to validate
 * @param {boolean} isUpdate - Whether this is an update
 * @returns {Object} Validation result
 */
function validateMyEntity(data, isUpdate = false) {
    const errors = [];

    // Required fields
    if (!isUpdate && !data.name) {
        errors.push({ field: 'name', message: 'Name is required' });
    }

    // Length validation
    if (data.description && data.description.length > 5000) {
        errors.push({ field: 'description', message: 'Description too long (max 5000)' });
    }

    // Format validation
    if (data.email && !ValidationService.validateEmail(data.email)) {
        errors.push({ field: 'email', message: 'Invalid email format' });
    }

    // Numeric validation
    if (data.amount && isNaN(data.amount)) {
        errors.push({ field: 'amount', message: 'Amount must be numeric' });
    }

    return {
        isValid: errors.length === 0,
        errors: errors
    };
}
```

## Audit Logging Pattern

```javascript
// Simple audit
AuditService.logAudit('CREATE', 'MyEntity', entityId, userId, 'Entity created');

// Field-level revisions
AuditService.logMultipleRevisions(
    'MyEntity',
    entityId,
    [
        { field: 'name', old: 'Old Name', new: 'New Name' },
        { field: 'status', old: 'ACTIVE', new: 'INACTIVE' }
    ],
    'UPDATE',
    userId,
    'Updated entity'
);

// Single revision
AuditService.logRevision(
    'MyEntity',
    entityId,
    'status',
    'ACTIVE',
    'INACTIVE',
    'UPDATE',
    userId,
    'Status changed'
);
```

## Error Handling Pattern

```javascript
try {
    // Operation
    const result = doSomething();
    if (!result.success) {
        return ResponseFormatter.formatError(result.message);
    }
    return result;
} catch (error) {
    Logger.log('Operation error: ' + error);
    return ResponseFormatter.formatError('Operation failed', error.toString());
}
```

## UUID Generation

```javascript
// Generate unique ID
const id = StringUtils.generateUUID();
// Returns: '123e4567-e89b-12d3-a456-426614174000'
```

## Date Formatting

```javascript
// ISO format (YYYY-MM-DD)
const date = DateUtils.formatDateISO(new Date());
// Returns: '2026-02-02'

// DateTime format (YYYY-MM-DD HH:mm:ss)
const datetime = DateUtils.formatDateTime(new Date());
// Returns: '2026-02-02 14:30:45'
```

## Comment Style

### JSDoc for Functions

```javascript
/**
 * Get user by ID
 * @param {string} userId - The user ID
 * @returns {Object|null} The user object or null if not found
 */
function getUserById(userId) {
    // Implementation
}
```

### Inline Comments

```javascript
// Check if user has permission
if (hasPermission) {
    // Allow access
    return true;
}

// TODO: Implement caching
// FIXME: This is a workaround for...
```

## Next Steps

- See [Development Workflow](./30-development-workflow.md) for development process
- See [Creating a New Module](./50-creating-new-module.md) for module development
