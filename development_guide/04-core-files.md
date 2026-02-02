# Core Files Documentation

## Code.gs

**Purpose**: Main entry point for the web application and template rendering engine.

**Location**: Root level

**Key Functions**

| Function | Description | Returns |
|----------|-------------|---------|
| `renderTemplate(filename, data)` | Evaluates HTML template with data context | string (HTML) |
| `doGet(e)` | HTTP GET handler - serves pages based on URL parameters | HtmlOutput |
| `serveStaticFile(path)` | Serves CSS, JS, JSON files | HtmlOutput |
| `include(filename)` | Includes partial HTML files in template | string |
| `getDashboardData()` | Returns dashboard widget data | object |
| `debugLog(message, data)` | Logs debug messages | void |
| `callAPI(endpoint, data)` | Unified API routing (legacy, use API.gs) | object |

### Page Rendering Flow

```
1. Browser requests: ?page=dashboard
   ↓
2. doGet(e) receives request
   ↓
3. Extract page parameter: e.parameter.page
   ↓
4. Validate page: PagesConfig.isValidPage(pageName)
   ↓
5. Get user data from session (if authenticated)
   ↓
6. Build dataTemplate object
   ↓
7. Load common templates:
   - renderTemplate('layout/sidebar.html', dataTemplate)
   - renderTemplate('layout/toasts.html', dataTemplate)
   ↓
8. Load page-specific content:
   - renderTemplate('pages/{pageName}.html', dataTemplate)
   ↓
9. Load page-specific scripts:
   - PagesConfig.getPageScripts(pageName, dataTemplate)
   ↓
10. Load page-specific modals:
    - PagesConfig.getPageModals(pageName, dataTemplate)
    ↓
11. Evaluate main template: renderTemplate('Index.html', dataTemplate)
    ↓
12. Return HtmlOutput to browser
```

### Template Variables Available in Pages

```javascript
dataTemplate = {
    pageTitle: 'Page Title',
    currentUser: {
        user_id: '...',
        username: '...',
        full_name: '...',
        email: '...',
        role_id: '...'
    },
    isAuthenticated: true,
    activePage: 'pageName',
    sidebar: '<nav>...</nav>',
    toasts: '<div>...</div>',
    content: '<main>...</main>',
    scripts: '<script>...</script>',
    modal_scripts: '<script>...</script>',
    debugPanel: '<div>...</div>'
}
```

## API.gs

**Purpose**: Main API endpoint handling POST requests with controller delegation.

**Location**: Root level

**Key Features**
- Rate limiting (100 requests per 60 seconds)
- Response caching (5-minute cache for dashboard)
- Centralized error handling
- Session-based authentication

**Key Functions**

| Function | Description |
|----------|-------------|
| `doPost(e)` | HTTP POST handler - main API endpoint |
| `checkRateLimit(sessionToken)` | Enforces rate limits |
| `getCachedData(key)` | Retrieves cached response |
| `cacheData(key, data, expiration)` | Stores response in cache |
| `clearCache(key)` | Clears specific cache |
| `clearAllCache()` | Clears all cached data |

### API Request/Response Format

**Request:**
```javascript
{
  "action": "users.list",        // resource.action format
  "data": {                      // Optional payload
    "status": "active"
  },
  "sessionToken": "user-session-token"
}
```

**Success Response:**
```javascript
{
  "success": true,
  "data": [...],
  "message": "Optional success message"
}
```

**Error Response:**
```javascript
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information"
}
```

### API Endpoint Routing

```
Request action: "users.list"
    ↓
Parse: resource = "users", action = "list"
    ↓
Switch on action:
    case 'list':
        response = UsersController.getAll(data)
        break
    ↓
Return response as JSON
```

## Config.gs

**Purpose**: Central configuration and constants for the application.

**Location**: Root level

**Configuration Sections**

```javascript
CONFIG = {
    // Application metadata
    APP: {
        NAME: 'Strategic Execution Monitoring',
        VERSION: '1.0.0',
        ENVIRONMENT: 'production'  // or 'development'
    },

    // Drive folder IDs
    DRIVE: {
        FOLDER_ID: 'your-folder-id',
        BACKUP_FOLDER_ID: 'backup-folder-id'
    },

    // Session settings
    SESSION: {
        TIMEOUT_MINUTES: 30,
        TOKEN_EXPIRY_HOURS: 24,
        MAX_LOGIN_ATTEMPTS: 5,
        LOCKOUT_DURATION_MINUTES: 15
    },

    // API settings
    API: {
        RATE_LIMIT_PER_MINUTE: 100,
        CACHE_DURATION_SECONDS: 300,
        MAX_RECORDS_PER_PAGE: 100
    },

    // Email settings
    EMAIL: {
        FROM_NAME: 'SEM System',
        ADMIN_EMAIL: 'admin@example.com',
        ENABLE_NOTIFICATIONS: true
    },

    // KPI settings
    KPI: {
        THRESHOLDS: {
            ON_TRACK: 90,      // >= 90%
            AT_RISK: 75,       // 75-89%
            OFF_TRACK: 0       // < 75%
        },
        CALCULATION_TYPES: ['ACTUAL_MINUS_TARGET', 'PERCENTAGE', 'CUSTOM'],
        MEASUREMENT_PERIODS: ['MONTHLY', 'QUARTERLY', 'ANNUALLY']
    },

    // Validation rules
    VALIDATION: {
        PASSWORD: {
            MIN_LENGTH: 8,
            REQUIRE_UPPERCASE: true,
            REQUIRE_LOWERCASE: true,
            REQUIRE_NUMBER: true,
            REQUIRE_SPECIAL: true
        },
        USERNAME: {
            MIN_LENGTH: 3,
            MAX_LENGTH: 50,
            PATTERN: '^[a-zA-Z0-9_]+$'
        },
        TEXT_FIELD_MAX_LENGTH: 5000
    },

    // Status values
    STATUS: {
        GENERAL: ['ACTIVE', 'INACTIVE', 'DRAFT', 'PUBLISHED'],
        KPI: ['ON_TRACK', 'AT_RISK', 'OFF_TRACK', 'NOT_STARTED'],
        ASSIGNMENT: ['ACTIVE', 'ENDED', 'SUSPENDED', 'ON_LEAVE'],
        APPROVAL: ['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED']
    },

    // Enumerations
    ENUMS: {
        POSITION_TYPE: ['EXECUTIVE', 'MANAGER', 'STAFF', 'CONTRACTOR', 'INTERN'],
        POSITION_LEVEL: ['C_LEVEL', 'DIRECTOR', 'MANAGER', 'SUPERVISOR', 'STAFF', 'TRAINEE'],
        KPI_TYPE: ['ORGANIZATIONAL', 'INDIVIDUAL'],
        PERSPECTIVE: ['FINANCIAL', 'CUSTOMER', 'INTERNAL_PROCESS', 'LEARNING_GROWTH']
    },

    // Default roles
    DEFAULT_ROLES: [
        {
            role_code: 'SUPER_ADMIN',
            role_name: 'Super Administrator',
            permissions: ['*']  // All permissions
        },
        {
            role_code: 'ADMIN',
            role_name: 'Administrator',
            permissions: ['users.*', 'roles.*', 'organization.*', ...]
        }
        // ... more roles
    ],

    // Feature flags
    FEATURES: {
        ENABLE_OKR: true,
        ENABLE_TWO_FACTOR_AUTH: false,
        ENABLE_EMAIL_VERIFICATION: false,
        ENABLE_DASHBOARD: true
    }
}

DB_CONFIG = {
    // Sheet name mappings
    SHEET_NAMES: {
        USERS: 'Users',
        ROLES: 'Roles',
        DIRECTORATES: 'Directorates',
        WORK_UNITS: 'WorkUnits',
        AFFAIRS: 'Affairs',
        POSITIONS: 'Positions',
        POSITION_ASSIGNMENTS: 'PositionAssignments',
        // ... all 28 sheets
    },

    // Table headers
    HEADERS: {
        USERS: [
            'user_id', 'username', 'email', 'password_hash', 'full_name',
            'role_id', 'active_from', 'active_until', 'is_active',
            'last_login', 'created_at', 'created_by', 'updated_at',
            'updated_by', 'notes'
        ],
        // ... other tables
    }
}
```

**Key Methods**
```javascript
getConfig(path)  // Get config value by dot notation
// Example: getConfig('SESSION.TIMEOUT_MINUTES') → 30

setConfig(path, value)  // Set config value (runtime only, not persisted)
```

## Auth.gs

**Purpose**: Authentication and authorization system.

**Location**: Root level

**Key Functions**

| Function | Description | Returns |
|----------|-------------|---------|
| `hashPassword(password)` | SHA-256 password hashing | string |
| `verifyPassword(password, hash)` | Verify password against hash | boolean |
| `login(usernameOrEmail, password)` | Authenticate user | object (user data) |
| `logout(sessionToken)` | End user session | boolean |
| `getCurrentUser(sessionToken)` | Get user from session token | object (user data) |
| `hasPermission(sessionToken, module, action)` | Check user permissions | boolean |
| `requireAuth(sessionToken)` | Throw error if not authenticated | void |
| `requirePermission(sessionToken, module, action)` | Throw error if not authorized | void |
| `changePassword(sessionToken, oldPassword, newPassword)` | Change user password | object |

### Session Management

```javascript
// Session storage
CacheService.getUserCache()  // User-specific cache

// Session object
{
    sessionToken: 'generated-token',
    userId: 'user-id',
    username: 'username',
    roleId: 'role-id',
    createdAt: timestamp,
    expiresAt: timestamp
}

// Session timeout: 30 minutes of inactivity
// Max login attempts: 5 (then 15-minute lockout)
```

### Permission Checking

```javascript
// In API.gs doPost()
case 'users.create':
    Auth.requirePermission(sessionToken, 'users', 'create');
    response = UsersController.create(data, userId);
    break;
```

## Services/PagesConfig.gs

**Purpose**: Centralized page configuration - eliminates need for large switch statements.

**Location**: Services/

**Page Configuration Structure**

```javascript
const PAGE_CONFIG = {
    login: {
        title: 'Sign In',
        template: 'pages/login.html',
        scripts: ['assets/js/auth.html'],
        modals: ''
    },
    dashboard: {
        title: 'Dashboard',
        template: 'pages/dashboard.html',
        scripts: ['assets/js/dashboard_widgets.html'],
        modals: ''
    },
    organization: {
        title: 'Organization',
        template: 'pages/organization.html',
        scripts: [
            'assets/js/organization_datatables.html',
            'assets/js/organization_crud.html',
            'assets/js/org-diagram.html',
            'assets/js/org-diagram-controls.html',
            'assets/js/org-diagram-tooltip.html',
            'assets/js/org-diagram-context-menu.html',
            'assets/js/organization-view-functions.html',
            'assets/js/view-toggle.html'
        ],
        modals: 'layout/modals/organization_modals.html'
    },
    // ... more pages
};
```

**Key Methods**

| Method | Description |
|--------|-------------|
| `getPageConfig(pageName)` | Get configuration for a page |
| `isValidPage(pageName)` | Security validation - check if page exists |
| `getPageScripts(pageName, dataTemplate)` | Get all scripts for a page |
| `getPageModals(pageName, dataTemplate)` | Get all modals for a page |

### Adding a New Page

```javascript
// 1. Add to PAGE_CONFIG
myNewPage: {
    title: 'My New Page',
    template: 'pages/my-new-page.html',
    scripts: ['assets/js/my_new_page_crud.html'],
    modals: 'layout/modals/my_new_page_modals.html'
},

// 2. Add to validPages array
const validPages = [
    'login', 'dashboard', 'organization', 'myNewPage', ...
];
```

## Services/AuditService.gs

**Purpose**: Comprehensive audit trail and field-level revision tracking.

**Location**: Services/

**Key Functions**

| Function | Description |
|----------|-------------|
| `logRevision(entityType, entityId, fieldName, oldValue, newValue, changeType, userId, reason)` | Log single field change |
| `logMultipleRevisions(entityType, entityId, changes, changeType, userId, reason)` | Log multiple field changes |
| `getRevisionHistory(entityType, entityId, limit)` | Get revision history for an entity |
| `getRecentRevisions(limit, userId)` | Get recent revisions across all entities |
| `compareRevisions(revisionId1, revisionId2)` | Compare two revisions |
| `restoreRevision(revisionId, userId, reason)` | Rollback to previous version |
| `getRevisionStatistics(filters)` | Get revision statistics by type/user/entity |
| `logAudit(action, entityType, entityId, userId, details)` | Simple audit log |

### Revision Table Columns

```
revision_id | entity_type | entity_id | field_name | old_value | new_value |
change_type | changed_by | changed_at | reason | ip_address | user_agent
```

### Change Types

- `CREATE` - Entity created
- `UPDATE` - Entity updated
- `DELETE` - Entity deleted
- `RESTORE` - Entity restored from revision

### Usage Examples

```javascript
// Simple audit log
AuditService.logAudit('CREATE', 'User', userId, creatorId, 'User created');

// Field-level revision
AuditService.logRevision(
    'User', userId, 'email',
    'old@email.com', 'new@email.com',
    'UPDATE', updaterId, 'Email updated'
);

// Multiple revisions at once
AuditService.logMultipleRevisions(
    'User', userId,
    [
        { field: 'full_name', old: 'Old Name', new: 'New Name' },
        { field: 'email', old: 'old@email.com', new: 'new@email.com' }
    ],
    'UPDATE', updaterId, 'Profile updated'
);
```

## Next Steps

- See [Controllers](./06-controllers.md) for controller documentation
- See [Models](./07-models.md) for model documentation
- See [Services](./05-services.md) for all services
