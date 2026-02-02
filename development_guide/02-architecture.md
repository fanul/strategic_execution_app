# System Architecture

## Overview

The SEM system follows a layered architecture with clear separation of concerns. Each layer has specific responsibilities and communicates with adjacent layers through well-defined interfaces.

## Layered Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            PRESENTATION LAYER                               │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                        HTML Templates                                  │  │
│  │  - pages/ (page content)                                              │  │
│  │  - layout/ (shared UI components)                                     │  │
│  │  - Index.html (main template)                                         │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                     JavaScript Modules                                │  │
│  │  - assets/js/ (IIFE modules)                                          │  │
│  │  - api_helper.html (API communication)                                │  │
│  │  - ui_helpers.html (UI utilities)                                     │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              ROUTING LAYER                                  │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                          Code.gs                                      │  │
│  │  - doGet() (serve pages)                                              │  │
│  │  - callAPI() (legacy routing)                                         │  │
│  │  - renderTemplate() (template evaluation)                             │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                          API.gs                                       │  │
│  │  - doPost() (API endpoint)                                            │  │
│  │  - Rate limiting                                                      │  │
│  │  - Response caching                                                   │  │
│  │  - Session authentication                                             │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CONTROLLER LAYER                                  │
│  ┌──────────────────┬──────────────────┬──────────────────┬──────────────┐  │
│  │  Dashboard       │  Organization    │  Strategic       │  KPI         │  │
│  │  Controller      │  Controller      │  Controller      │  Controller  │  │
│  └──────────────────┴──────────────────┴──────────────────┴──────────────┘  │
│  ┌──────────────────┬──────────────────┬──────────────────┬──────────────┐  │
│  │  OKR             │  Program         │  User            │  Report      │  │
│  │  Controller      │  Controller      │  Controller      │  Controller  │  │
│  └──────────────────┴──────────────────┴──────────────────┴──────────────┘  │
│                                                                           │
│  Responsibilities:                                                        │
│  - Input validation                                                       │
│  - Business logic                                                         │
│  - Permission checking                                                    │
│  - Audit logging                                                          │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                             MODEL LAYER                                    │
│  ┌──────────────────┬──────────────────┬──────────────────┬──────────────┐  │
│  │  User            │  Organization    │  Strategic       │  KPI         │  │
│  │  Model           │  Model           │  Model           │  Model       │  │
│  └──────────────────┴──────────────────┴──────────────────┴──────────────┘  │
│  ┌──────────────────┬──────────────────┬──────────────────┬──────────────┐  │
│  │  OKR             │  Program         │  Role            │  Impact      │  │
│  │  Model           │  Model           │  Model           │  Center      │  │
│  └──────────────────┴──────────────────┴──────────────────┴──────────────┘  │
│                                                                           │
│  Responsibilities:                                                        │
│  - Data access (Google Sheets)                                           │
│  - Data transformation                                                    │
│  - Business rules for data integrity                                      │
│  - Hierarchical operations                                                │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            SERVICE LAYER                                   │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                       DatabaseService                                  │  │
│  │  - getSpreadsheet(), getTableData()                                   │  │
│  │  - insertRecord(), updateRecord(), deleteRecord()                     │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                        AuditService                                   │  │
│  │  - logRevision(), logMultipleRevisions()                              │  │
│  │  - getRevisionHistory(), restoreRevision()                            │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                     NotificationService                               │  │
│  │  - sendNotification(), broadcastNotification()                        │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                       PagesConfig                                     │  │
│  │  - Page configuration and script mapping                              │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          DATA LAYER                                        │
│                    Google Sheets (28 Tables)                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Request Flow

### Page Request Flow (GET)

```
1. User navigates to URL
   ↓
2. Browser sends GET request to Web App URL
   ↓
3. Code.gs doGet(e) receives request
   ↓
4. Extract page parameter: ?page=dashboard
   ↓
5. PagesConfig.isValidPage() validates page
   ↓
6. Build dataTemplate with user data
   ↓
7. renderTemplate('Index.html', dataTemplate)
   ├─→ Include: layout/sidebar.html
   ├─→ Include: layout/toasts.html
   ├─→ Include: pages/{pageName}.html
   ├─→ Include: assets/js/* (from PagesConfig)
   └─→ Return evaluated HTML
   ↓
8. Browser receives and renders page
```

### API Request Flow (POST)

```
1. Frontend: apiCall('users/list', filters)
   ↓
2. google.script.run.callAPI(endpoint, data)
   ↓
3. API.gs doPost(e) receives request
   ↓
4. Parse request:
   {
     "action": "users.list",
     "data": {...},
     "sessionToken": "..."
   }
   ↓
5. Extract: resource='users', action='list'
   ↓
6. Check rate limit
   ↓
7. Validate session token
   ↓
8. Route to controller:
   UsersController.getAll(data)
   ↓
9. Controller processes request
   ├─→ Validate input
   ├─→ Call model
   ├─→ Log audit
   └─→ Format response
   ↓
10. Return response:
    {
      "success": true,
      "data": [...],
      "message": "..."
    }
   ↓
11. Frontend receives response
```

## Module Communication

### Frontend Module Pattern (IIFE)

```javascript
// assets/js/my_module.html
<script>
const MyModule = (function() {
    'use strict';

    // Private state
    let privateState = {};

    // Private functions
    function privateFunction() {
        // ...
    }

    // Public API
    return {
        init: function() {
            // Initialize module
        },
        publicMethod: function() {
            // Public method
        }
    };
})();

// Make available globally for onclick handlers
window.myPublicFunction = MyModule.publicMethod;

// Auto-initialize
window.addEventListener('DOMContentLoaded', function() {
    MyModule.init();
});
</script>
```

### Backend Controller Pattern

```javascript
// Controllers/MyController.gs
const MyController = {
    create: function(data, creatorId) {
        try {
            // 1. Validate input
            const validation = validateMyEntity(data);
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
        // Similar pattern for update
    },

    delete: function(id, deleterId) {
        // Similar pattern for delete
    },

    getAll: function(filters) {
        try {
            const data = MyModel.getAll(filters);
            return ResponseFormatter.formatSuccess(data);
        } catch (error) {
            return ResponseFormatter.formatError('Failed to fetch', error.toString());
        }
    }
};
```

### Backend Model Pattern

```javascript
// Models/MyModel.gs
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

## State Management

### Frontend State

1. **View State**: localStorage for user preferences (e.g., view toggle)
2. **Session State**: google.script.run for server session
3. **Component State**: IIFE private variables for module state

### Backend State

1. **Database State**: Google Sheets as persistent storage
2. **Cache State**: CacheService for temporary data
3. **Session State**: UserCacheService for session management

## Security Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Security Layers                           │
├─────────────────────────────────────────────────────────────┤
│  1. Authentication                                          │
│     - Password hashing (SHA-256)                            │
│     - Session tokens (CacheService)                         │
│     - Session timeout (30 minutes)                          │
├─────────────────────────────────────────────────────────────┤
│  2. Authorization                                           │
│     - Role-based access control                             │
│     - Permission checking per action                        │
│     - requirePermission() in API endpoints                  │
├─────────────────────────────────────────────────────────────┤
│  3. Input Validation                                        │
│     - Client-side validation                                │
│     - Server-side validation                                │
│     - SQL injection prevention (no SQL, but data sanitizing) │
├─────────────────────────────────────────────────────────────┤
│  4. Rate Limiting                                           │
│     - 100 requests per 60 seconds                           │
│     - Per-session token tracking                            │
├─────────────────────────────────────────────────────────────┤
│  5. Audit Trail                                             │
│     - All actions logged                                    │
│     - Field-level revision history                          │
│     - User attribution                                      │
└─────────────────────────────────────────────────────────────┘
```

## Performance Considerations

1. **Lazy Loading**: Tables load data only when tab is active
2. **Data Caching**: Client-side caching reduces API calls
3. **Response Caching**: Server-side cache for expensive operations
4. **DataTable Pagination**: Large datasets paginated on client
5. **Minimal DOM Manipulation**: jQuery for efficient updates

## Next Steps

- Continue to [File Structure](./03-file-structure.md) for project organization
- See [Core Files](./04-core-files.md) for details on key files
