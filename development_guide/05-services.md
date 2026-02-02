# Services Documentation

## Overview

Services are reusable components that provide cross-cutting concerns and utility functions to the application. They handle tasks like database operations, audit logging, notifications, and configuration.

## Services Directory

```
Services/
├── AuditService.gs              # Audit trail and field-level revisions
├── PagesConfig.gs               # Page configuration and routing
├── ReportService.gs             # Report generation
├── SettingsService.gs           # Application settings
└── ValidationService.gs         # Input validation
```

## DatabaseService.gs (Root Level)

**Purpose**: Core database operations with Google Sheets.

**Location**: Root level (not in Services/)

**Key Functions**

| Function | Description | Returns |
|----------|-------------|---------|
| `getSpreadsheet()` | Get or create database spreadsheet | SpreadsheetApp |
| `initializeDatabase()` | Create all 28 sheets with headers | object |
| `getTableData(sheetName)` | Get all data from sheet as objects | array |
| `getSheetByName(sheetName)` | Get sheet by name | Sheet |
| `insertRecord(sheetName, data)` | Insert new record | object |
| `updateRecord(sheetName, idField, idValue, data)` | Update record | object |
| `deleteRecord(sheetName, idField, idValue)` | Delete record | object |
| `findRecord(sheetName, idField, idValue)` | Find record by ID | object or null |
| `getDatabaseStats()` | Get database statistics | object |
| `generateGoogleSheets(sheetName, data)` | Create export spreadsheet | string (sheet ID) |
| `moveSheetToFolder(spreadsheetId, folderId)` | Move sheet to Drive folder | boolean |

### Usage Pattern

```javascript
// Get all records
const users = DatabaseService.getTableData(DB_CONFIG.SHEET_NAMES.USERS);

// Insert new record
const result = DatabaseService.insertRecord(
    DB_CONFIG.SHEET_NAMES.USERS,
    {
        user_id: StringUtils.generateUUID(),
        username: 'jdoe',
        email: 'jdoe@example.com',
        ...
    }
);

// Update record
const updateResult = DatabaseService.updateRecord(
    DB_CONFIG.SHEET_NAMES.USERS,
    'user_id',
    'user-123',
    { email: 'newemail@example.com' }
);

// Delete record
const deleteResult = DatabaseService.deleteRecord(
    DB_CONFIG.SHEET_NAMES.USERS,
    'user_id',
    'user-123'
);
```

### Database Sheets (28 total)

| Category | Sheets |
|----------|--------|
| User Management | Users, Roles |
| Organization | Directorates, WorkUnits, Affairs, Positions, PositionAssignments |
| Strategic Planning | Periods, Visions, Missions, StrategicInitiatives, MissionInitiativeMapping |
| Goals | OrganizationalGoals, ImpactCenters, ICMonthlyProgress, ICWorkUnitMapping, AnalysisItems |
| KPIs | WorkUnitGoals, KPIs, KPIMonthlyProgress |
| Programs | Programs, KPIProgramMapping, Activities |
| Individual | IndividualKPIs, IndividualKPIMonthlyProgress, OKRs |
| System | Revisions, AppSettings, Notifications |

## AuditService.gs

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
| `getRevisionStatistics(filters)` | Get revision statistics |
| `logAudit(action, entityType, entityId, userId, details)` | Simple audit log |

### Revision Data Structure

```javascript
// Revisions table columns
{
    revision_id: 'uuid',
    entity_type: 'User',
    entity_id: 'user-123',
    field_name: 'email',
    old_value: 'old@email.com',
    new_value: 'new@email.com',
    change_type: 'UPDATE',  // CREATE, UPDATE, DELETE, RESTORE
    changed_by: 'user-456',
    changed_at: '2026-02-02 10:30:00',
    reason: 'User requested email change',
    ip_address: '192.168.1.1',
    user_agent: 'Mozilla/5.0 ...'
}
```

### Usage Examples

```javascript
// Log a single field change
AuditService.logRevision(
    'Directorate',
    directorateId,
    'directorate_name',
    'Old Name',
    'New Name',
    'UPDATE',
    userId,
    'Name correction'
);

// Log multiple field changes
AuditService.logMultipleRevisions(
    'WorkUnit',
    workUnitId,
    [
        { field: 'work_unit_name', old: 'Old Name', new: 'New Name' },
        { field: 'description', old: 'Old desc', new: 'New desc' }
    ],
    'UPDATE',
    userId,
    'Work unit updated'
);

// Get revision history
const history = AuditService.getRevisionHistory('User', userId, 50);
// Returns: [{ revision_id, field_name, old_value, new_value, ... }, ...]

// Restore a revision
AuditService.restoreRevision(revisionId, userId, 'Rolling back to previous version');
```

## PagesConfig.gs

**Purpose**: Centralized page configuration and routing.

**Location**: Services/

**Key Functions**

| Function | Description |
|----------|-------------|
| `getPageConfig(pageName)` | Get configuration for a page |
| `isValidPage(pageName)` | Security validation - check if page exists |
| `getPageScripts(pageName, dataTemplate)` | Get all scripts for a page |
| `getPageModals(pageName, dataTemplate)` | Get all modals for a page |
| `getAllPages()` | Get all page configurations |

### Page Configuration

```javascript
const PAGE_CONFIG = {
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
            'assets/js/view-toggle.html'
        ],
        modals: 'layout/modals/organization_modals.html'
    },
    // ... more pages
};
```

### Adding a New Page

```javascript
// 1. Add page configuration
const PAGE_CONFIG = {
    // ... existing pages
    myNewPage: {
        title: 'My New Page',
        template: 'pages/my-new-page.html',
        scripts: ['assets/js/my_new_page_crud.html'],
        modals: 'layout/modals/my_new_page_modals.html'
    }
};

// 2. Add to valid pages array
const validPages = [
    'dashboard', 'organization', 'myNewPage', ...
];
```

## ReportService.gs

**Purpose**: Report generation and export functionality.

**Location**: Services/

**Key Functions**

| Function | Description |
|----------|-------------|
| `generateKPISummary(filters)` | Generate KPI summary report |
| `generateOKRSummary(filters)` | Generate OKR summary report |
| `generatePerformanceDashboard(year)` | Generate performance dashboard |
| `exportToCSV(data, filename)` | Export data to CSV |
| `exportToGoogleSheets(data, sheetName)` | Export to Google Sheets |
| `sendEmailReport(recipientEmail, subject, reportData)` | Send email report |

### Report Types

```javascript
// KPI Summary Report
{
    title: 'KPI Summary Report',
    period: 'January 2026',
    summary: {
        totalKPIs: 45,
        onTrack: 30,
        atRisk: 10,
        offTrack: 5
    },
    byDirectorate: [
        { directorate: 'Finance', onTrack: 8, atRisk: 2, ... },
        { directorate: 'HR', onTrack: 5, atRisk: 1, ... }
    ]
}

// OKR Summary Report
{
    title: 'OKR Summary Report',
    period: 'Q1 2026',
    summary: {
        totalOKRs: 120,
        averageProgress: 72
    },
    byWorkUnit: [...]
}
```

## SettingsService.gs

**Purpose**: Application settings management.

**Location**: Services/

**Key Functions**

| Function | Description |
|----------|-------------|
| `getSetting(key)` | Get setting value |
| `setSetting(key, value, userId)` | Set setting value |
| `getAllSettings()` | Get all settings |
| `resetToDefaults()` | Reset settings to defaults |

### Setting Categories

```javascript
{
    // Application settings
    app_name: 'Strategic Execution Monitoring',
    app_version: '1.0.0',

    // Email settings
    email_notifications_enabled: true,
    email_from_address: 'noreply@example.com',

    // KPI settings
    kpi_on_track_threshold: 90,
    kpi_at_risk_threshold: 75,

    // OKR settings
    okr_weekly_start_day: 'Monday',
    okr_auto_submit_enabled: false,

    // Display settings
    items_per_page: 25,
    default_date_format: 'YYYY-MM-DD'
}
```

## ValidationService.gs

**Purpose**: Input validation utilities.

**Location**: Services/

**Key Functions**

| Function | Description |
|----------|-------------|
| `validateEmail(email)` | Validate email format |
| `validateUsername(username)` | Validate username |
| `validatePassword(password)` | Validate password strength |
| `validateRequired(fields, data)` | Check required fields |
| `validateLength(value, min, max)` | Validate string length |
| `validateNumeric(value, min, max)` | Validate numeric range |
| `validateDate(date)` | Validate date format |
| `validateEnum(value, allowedValues)` | Validate enum value |

### Validation Result Format

```javascript
{
    isValid: true/false,
    errors: [
        { field: 'email', message: 'Invalid email format' },
        { field: 'password', message: 'Password too short' }
    ]
}
```

### Usage Examples

```javascript
// Validate email
const emailResult = ValidationService.validateEmail('user@example.com');
// Returns: { isValid: true, errors: [] }

// Validate user data
const userValidation = ValidationService.validateRequired(
    ['username', 'email', 'full_name'],
    userData
);

if (!userValidation.isValid) {
    return ResponseFormatter.formatValidationError(userValidation.errors);
}

// Validate password
const passwordValidation = ValidationService.validatePassword('MyPass@123');
// Checks: length, uppercase, lowercase, number, special character
```

## NotificationService.gs (Root Level)

**Purpose**: Notifications and email alerts.

**Location**: Root level

**Key Functions**

| Function | Description |
|----------|-------------|
| `sendNotification(userId, type, title, message, linkUrl)` | Send notification |
| `sendEmailNotification(userId, subject, message)` | Send email |
| `getUserNotifications(userId, unreadOnly)` | Get user notifications |
| `markAsRead(notificationId)` | Mark notification as read |
| `markAllAsRead(userId)` | Mark all as read |
| `deleteNotification(notificationId)` | Delete notification |
| `broadcastNotification(userIds, type, title, message)` | Broadcast to multiple users |
| `checkAndNotifyCriticalKPIs()` | Check and alert on critical KPIs |

### Notification Types

- `INFO` - Informational messages
- `WARNING` - Warning messages
- `SUCCESS` - Success messages
- `ERROR` - Error messages

### Usage Examples

```javascript
// Send notification
NotificationService.sendNotification(
    userId,
    'INFO',
    'KPI Updated',
    'Your KPI "Sales Target" has been updated',
    '/kpi'
);

// Send email notification
NotificationService.sendEmailNotification(
    userId,
    'KPI Approval Required',
    'Please review and approve the pending KPI...'
);

// Broadcast to multiple users
NotificationService.broadcastNotification(
    [user1, user2, user3],
    'WARNING',
    'KPI Deadline Approaching',
    'Your weekly OKR submission is due tomorrow'
);
```

## Creating a New Service

### Service Template

```javascript
/**
 * MyService - Custom service description
 *
 * Provides functionality for...
 */
const MyService = (function() {

    /**
     * Private helper function
     */
    function privateHelper(data) {
        // ...
    }

    /**
     * Public API
     */
    return {
        /**
         * Do something useful
         * @param {Object} data - Input data
         * @returns {Object} Result object
         */
        doSomething: function(data) {
            try {
                // Implementation
                return { success: true, data: result };
            } catch (error) {
                Logger.log('MyService.doSomething error: ' + error);
                return { success: false, error: error.toString() };
            }
        },

        /**
         * Get something by ID
         * @param {string} id - The ID to lookup
         * @returns {Object|null} The found object or null
         */
        getById: function(id) {
            const items = DatabaseService.getTableData(
                DB_CONFIG.SHEET_NAMES.MY_TABLE
            );
            return items.find(item => item.id === id) || null;
        }
    };
})();
```

## Next Steps

- See [Controllers](./06-controllers.md) for controller documentation
- See [Models](./07-models.md) for model documentation
- See [Creating a New Module](./50-creating-new-module.md) for step-by-step module creation
