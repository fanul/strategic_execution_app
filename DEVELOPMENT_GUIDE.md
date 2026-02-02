# Strategic Execution Monitoring - Development Guide

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [File Structure](#file-structure)
4. [Core Files Documentation](#core-files-documentation)
5. [Controllers Documentation](#controllers-documentation)
6. [Models Documentation](#models-documentation)
7. [Services Documentation](#services-documentation)
8. [Frontend Structure](#frontend-structure)
9. [Development Workflow](#development-workflow)
10. [Common Patterns and Conventions](#common-patterns-and-conventions)

---

## Project Overview

The Strategic Execution Monitoring (SEM) system is a comprehensive web application built on Google Apps Script. It provides organizations with tools for:

- **Strategic Planning**: Vision, Mission, Goals, and Strategic Initiatives management
- **Organization Management**: Directorates, Work Units, Affairs, and Positions hierarchy
- **KPI Tracking**: Organizational and Individual KPIs with progress monitoring
- **OKR Management**: Weekly Objectives and Key Results for individuals
- **Program Management**: Programs and Activities with budget tracking
- **SWOT Analysis**: Strengths, Weaknesses, Opportunities, and Threats analysis
- **Reporting**: Performance dashboards and exportable reports
- **Audit Trail**: Complete revision history for all entities

### Technology Stack

- **Backend**: Google Apps Script (JavaScript)
- **Database**: Google Sheets (28 sheets)
- **Frontend**: HTML5, Bootstrap 5, jQuery, DataTables
- **Authentication**: Session-based with password hashing

---

## Architecture

### Layered Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend Layer                        │
│  (HTML Templates, Bootstrap UI, jQuery, DataTables)         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                         API Routing                          │
│                    (Code.gs, API.gs)                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       Controllers Layer                       │
│  (UserController, OrganizationController, KPIController...)  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                         Models Layer                         │
│    (UserModel, OrganizationModel, KPIModel, OKRModel...)    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       Services Layer                         │
│  (DatabaseService, AuditService, NotificationService...)     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Google Sheets Database                  │
│                    (28 Data Sheets)                         │
└─────────────────────────────────────────────────────────────┘
```

---

## File Structure

### Root Level Files

```
strategic-execution-app/
├── Code.gs                          # Main entry point, doGet, renderTemplate
├── API.gs                           # API routing with doPost
├── Config.gs                        # Application configuration
├── Auth.gs                          # Authentication & authorization
├── InitializeApp.gs                 # Database initialization
├── DatabaseService.gs               # Database operations
├── DebugDatabase.gs                 # Database debugging tools
├── ExportService.gs                 # Export functionality
├── NotificationService.gs           # Notifications & emails
│
├── Controllers/                     # Business logic controllers
│   ├── DashboardController.gs
│   ├── ImpactCenterController.gs
│   ├── ImportController.gs
│   ├── KPIController.gs
│   ├── OKRController.gs
│   ├── OrganizationController.gs
│   ├── ProgramController.gs
│   ├── ReportController.gs
│   ├── RoleController.gs
│   ├── StrategicController.gs
│   └── UserController.gs
│
├── Models/                          # Data models
│   ├── ImpactCenter.gs
│   ├── KPI.gs
│   ├── OKR.gs
│   ├── Organization.gs
│   ├── Program.gs
│   ├── Role.gs
│   ├── Strategic.gs
│   └── User.gs
│
├── Services/                        # Supporting services
│   ├── AuditService.gs
│   ├── PagesConfig.gs              # Page configuration
│   ├── ReportService.gs
│   └── ValidationService.gs
│
├── Utils/                           # Utility functions
│   ├── DateUtils.gs
│   ├── ResponseFormatter.gs
│   └── StringUtils.gs
│
├── assets/                          # Frontend assets
│   ├── css/
│   ├── js/
│   │   ├── ajax_loader.html
│   │   ├── api_helper.html
│   │   ├── app_init.html
│   │   ├── auth.html
│   │   ├── crud_operations.html
│   │   ├── datatables_manager.html
│   │   ├── debug_panel_script.html
│   │   ├── delete_confirm.html
│   │   ├── kpi_crud.html
│   │   ├── modals.html
│   │   ├── notifications_crud.html
│   │   ├── okr_crud.html
│   │   ├── org-diagram.html
│   │   ├── org-diagram-context-menu.html
│   │   ├── org-diagram-controls.html
│   │   ├── org-diagram-tooltip.html
│   │   ├── organization_crud.html
│   │   ├── organization_datatables.html
│   │   ├── programs_crud.html
│   │   ├── reports_crud.html
│   │   ├── router.html
│   │   ├── roles_crud.html
│   │   ├── settings_manager.html
│   │   ├── strategic_crud.html
│   │   ├── swot_crud.html
│   │   ├── ui_helpers.html
│   │   ├── users_crud.html
│   │   └── view-toggle.html
│   └── ...
│
├── layout/                          # Layout components
│   ├── loading_overlay.html
│   ├── modals/
│   │   ├── okr_modals.html
│   │   ├── organization_modals.html
│   │   ├── program_modals.html
│   │   └── swot_modals.html
│   ├── sidebar.html
│   └── toasts.html
│
├── pages/                           # Page templates
│   ├── audit-trail.html
│   ├── dashboard.html
│   ├── kpi.html
│   ├── login.html
│   ├── notifications.html
│   ├── okrs.html
│   ├── organization.html
│   ├── programs.html
│   ├── reports.html
│   ├── roles.html
│   ├── settings.html
│   ├── strategic-plan.html
│   └── swot.html
│
└── *.html                           # Layout templates (Index.html, etc.)
```

---

## Core Files Documentation

### Code.gs

**Purpose**: Main entry point for the web application and template rendering.

**Key Functions**:

| Function | Description |
|----------|-------------|
| `renderTemplate(filename, data)` | Renders HTML template with data context |
| `doGet(e)` | HTTP GET handler - serves pages based on URL parameters |
| `serveStaticFile(path)` | Serves CSS, JS, JSON files |
| `include(filename)` | Includes partial HTML files |
| `getDashboardData()` | Returns dashboard widget data |
| `debugLog(message, data)` | Logs debug messages |
| `callAPI(endpoint, data)` | Unified API routing (legacy, use API.gs) |

**Page Rendering Flow**:
1. `doGet(e)` receives request with `?page=dashboard`
2. Validates page using `PagesConfig.isValidPage()`
3. Loads common templates (header, sidebar, modals)
4. Loads page-specific content from `pages/{pageName}.html`
5. Loads page-specific scripts from `PagesConfig.getPageScripts()`
6. Returns evaluated HTML output

---

### API.gs

**Purpose**: Main API endpoint handling POST requests with controller delegation.

**Key Features**:
- Rate limiting (100 requests per 60 seconds)
- Response caching (5-minute cache for dashboard)
- Centralized error handling
- Session-based authentication

**Key Functions**:

| Function | Description |
|----------|-------------|
| `doPost(e)` | HTTP POST handler - main API endpoint |
| `checkRateLimit(sessionToken)` | Enforces rate limits |
| `getCachedData(key)` | Retrieves cached response |
| `cacheData(key, data, expiration)` | Stores response in cache |
| `clearCache(key)` | Clears specific cache |
| `clearAllCache()` | Clears all cached data |

**API Actions Format**:
```javascript
// Request
{
  "action": "users.list",
  "data": { filters },
  "sessionToken": "user-session-token"
}

// Response
{
  "success": true,
  "data": [...],
  "message": "Optional message"
}
```

---

### Services/PagesConfig.gs

**Purpose**: Centralized page configuration - eliminates need for large switch statements.

**Page Configuration Structure**:
```javascript
{
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
  // ... more pages
}
```

**Key Methods**:

| Method | Description |
|--------|-------------|
| `getPageConfig(pageName)` | Get configuration for a page |
| `isValidPage(pageName)` | Security validation - check if page exists |
| `getPageScripts(pageName, dataTemplate)` | Get all scripts for a page |
| `getPageModals(pageName, dataTemplate)` | Get all modals for a page |

---

### Services/AuditService.gs

**Purpose**: Comprehensive audit trail and field-level revision tracking.

**Key Functions**:

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

**Revision Table Columns**:
- `revision_id`, `entity_type`, `entity_id`, `field_name`
- `old_value`, `new_value`, `change_type` (CREATE/UPDATE/DELETE/RESTORE)
- `changed_by`, `changed_at`, `reason`
- `ip_address`, `user_agent`

---

### Config.gs

**Purpose**: Central configuration and constants for the application.

**Configuration Sections**:

```javascript
CONFIG = {
  APP: { NAME, VERSION, ENVIRONMENT },
  DRIVE: { FOLDER_ID, BACKUP_FOLDER_ID },
  SESSION: { TIMEOUT_MINUTES, TOKEN_EXPIRY_HOURS, MAX_LOGIN_ATTEMPTS, LOCKOUT_DURATION_MINUTES },
  API: { RATE_LIMIT_PER_MINUTE, CACHE_DURATION_SECONDS, MAX_RECORDS_PER_PAGE },
  EMAIL: { FROM_NAME, ADMIN_EMAIL, ENABLE_NOTIFICATIONS },
  KPI: { THRESHOLDS, CALCULATION_TYPES, MEASUREMENT_PERIODS },
  VALIDATION: { PASSWORD, USERNAME, TEXT_FIELD_MAX_LENGTH },
  STATUS: { GENERAL, KPI, ASSIGNMENT, APPROVAL },
  ENUMS: { POSITION_TYPE, POSITION_LEVEL, KPI_TYPE, PERSPECTIVE, ... },
  DEFAULT_ROLES: [...],
  FEATURES: { ENABLE_OKR, ENABLE_TWO_FACTOR_AUTH, ENABLE_EMAIL_VERIFICATION, ... }
}

DB_CONFIG = {
  SHEET_NAMES: { USERS, ROLES, DIRECTORATES, WORK_UNITS, ... },
  HEADERS: { USERS: [...], ROLES: [...], ... }
}
```

**Key Methods**:
- `getConfig(path)` - Get config value by dot notation
- `setConfig(path, value)` - Set config value (runtime only)

---

### Auth.gs

**Purpose**: Authentication and authorization system.

**Key Functions**:

| Function | Description |
|----------|-------------|
| `hashPassword(password)` | SHA-256 password hashing |
| `verifyPassword(password, hash)` | Verify password against hash |
| `login(usernameOrEmail, password)` | Authenticate user |
| `logout(sessionToken)` | End user session |
| `getCurrentUser(sessionToken)` | Get user from session token |
| `hasPermission(sessionToken, module, action)` | Check user permissions |
| `requireAuth(sessionToken)` | Throw error if not authenticated |
| `requirePermission(sessionToken, module, action)` | Throw error if not authorized |
| `changePassword(sessionToken, oldPassword, newPassword)` | Change user password |

**Session Management**:
- Session tokens stored in `CacheService.getUserCache()`
- Default session timeout: 30 minutes
- Max login attempts: 5 (15-minute lockout)

---

## Controllers Documentation

### Controllers/DashboardController.gs

**Purpose**: Dashboard data aggregation and statistics.

**Methods**:

| Method | Description |
|--------|-------------|
| `getData(userId)` | Get personalized dashboard data |
| `getExecutiveData()` | Get executive-level dashboard |
| `getRecentActivities(limit)` | Get recent audit activities |
| `getKPIData(filters)` | Get KPI data with progress |
| `getImpactCenterData(filters)` | Get impact center metrics |
| `getGoalsProgress(filters)` | Get goals progress for charts |
| `calculatePerformanceScore(kpis, okrs)` | Calculate overall performance |

---

### Controllers/UserController.gs

**Purpose**: User management operations.

**Methods**:

| Method | Description |
|--------|-------------|
| `create(userData, creatorId)` | Create new user |
| `update(userId, userData, updaterId)` | Update user |
| `delete(userId, deleterId)` | Soft delete user (set is_active=false) |
| `getById(userId)` | Get user by ID |
| `getAll(filters)` | Get all users with filters |
| `changePassword(userId, oldPassword, newPassword, updaterId)` | Change password |

---

### Controllers/RoleController.gs

**Purpose**: Role and permission management.

**Methods**:

| Method | Description |
|--------|-------------|
| `create(roleData, creatorId)` | Create new role |
| `update(roleId, roleData, updaterId)` | Update role |
| `delete(roleId, deleterId)` | Delete role |
| `getAll()` | Get all roles |
| `getById(roleId)` | Get role by ID |
| `clone(roleId, newRoleName, creatorId)` | Clone existing role |

---

### Controllers/OrganizationController.gs

**Purpose**: Organization structure management.

**Nested Controllers**:

#### OrganizationController.Directorate
| Method | Description |
|--------|-------------|
| `create(data, creatorId)` | Create directorate |
| `update(directorateId, data, updaterId)` | Update directorate |
| `delete(directorateId, deleterId)` | Delete directorate |
| `getAll(filters)` | Get all directorates |
| `getById(directorateId)` | Get directorate by ID |
| `checkChildren(directorateId)` | Check for child entities |
| `getAlternatives(directorateId)` | Get reassignment alternatives |
| `cascadeDelete(directorateId, deleterId)` | Delete with all children |
| `reassignAndDelete(directorateId, newDirectorateId, deleterId)` | Reassign children and delete |

#### OrganizationController.WorkUnit
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

#### OrganizationController.Affair
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

#### OrganizationController.Position
| Method | Description |
|--------|-------------|
| `create(data, creatorId)` | Create position |
| `update(positionId, data, updaterId)` | Update position |
| `delete(positionId, deleterId)` | Delete position |
| `getAll(filters)` | Get all positions |
| `getById(positionId)` | Get position by ID |

#### OrganizationController.PositionAssignment
| Method | Description |
|--------|-------------|
| `create(data, creatorId)` | Create position assignment |
| `update(assignmentId, data, updaterId)` | Update assignment |
| `endAssignment(assignmentId, endDate, updaterId)` | End assignment |
| `getAll(filters)` | Get all assignments |
| `getByUser(userId)` | Get assignments by user |

---

### Controllers/StrategicController.gs

**Purpose**: Strategic planning management.

**Nested Controllers**:

#### StrategicController.Period
| Method | Description |
|--------|-------------|
| `create(data, creatorId)` | Create strategic period |
| `setActive(periodId, userId)` | Set period as active |
| `update(periodId, updates, userId)` | Update period |
| `getDeletionImpact(periodId)` | Check what will be deleted |
| `deleteCascade(periodId, userId)` | Delete period with cascade |
| `getAll()` | Get all periods |
| `getActive()` | Get active period |

#### StrategicController.Vision
| Method | Description |
|--------|-------------|
| `create(data, creatorId)` | Create vision (max 1000 chars) |
| `approve(visionId, approverId)` | Approve vision |
| `getByPeriod(periodId)` | Get visions by period |
| `update(visionId, updates, userId)` | Update vision |
| `delete(visionId, userId)` | Delete vision |

#### StrategicController.Mission
| Method | Description |
|--------|-------------|
| `create(data, creatorId)` | Create mission (max 1500 chars) |
| `approve(missionId, approverId)` | Approve mission |
| `getByVision(visionId)` | Get missions by vision |
| `update(missionId, updates, userId)` | Update mission |
| `delete(missionId, userId)` | Delete mission |

#### StrategicController.Initiative
| Method | Description |
|--------|-------------|
| `create(data, creatorId)` | Create strategic initiative |
| `getByYear(year)` | Get initiatives by year |
| `update(initiativeId, updates, userId)` | Update initiative |
| `delete(initiativeId, userId)` | Delete initiative |

#### StrategicController.Goal
| Method | Description |
|--------|-------------|
| `create(data, creatorId)` | Create organizational goal |
| `getByYear(year)` | Get goals by year |
| `update(goalId, updates, userId)` | Update goal |
| `delete(goalId, userId)` | Delete goal |

#### StrategicController.WorkUnitGoal
| Method | Description |
|--------|-------------|
| `create(data, creatorId)` | Create work unit goal |
| `getByOrgGoal(orgGoalId)` | Get work unit goals by org goal |
| `getByWorkUnit(workUnitId)` | Get work unit goals by work unit |

---

### Controllers/KPIController.gs

**Purpose**: KPI management (organizational and individual).

**Methods**:

| Method | Description |
|--------|-------------|
| `create(data, creatorId)` | Create KPI |
| `update(kpiId, data, updaterId)` | Update KPI |
| `getByWorkUnit(workUnitId, year)` | Get KPIs by work unit |
| `getById(kpiId)` | Get KPI by ID |
| `delete(kpiId, deleterId)` | Delete KPI |

#### KPIController.Progress
| Method | Description |
|--------|-------------|
| `record(data, reporterId)` | Record monthly KPI progress |
| `verify(progressId, verifierId)` | Verify KPI progress |
| `getByKPI(kpiId, year, month)` | Get progress entries |

#### KPIController.Individual
| Method | Description |
|--------|-------------|
| `create(data, creatorId)` | Create individual KPI |
| `update(individualKpiId, data, updaterId)` | Update individual KPI |
| `delete(individualKpiId, deleterId)` | Delete individual KPI |
| `getByPosition(positionId, year)` | Get individual KPIs by position |

---

### Controllers/OKRController.gs

**Purpose**: OKR (Objectives and Key Results) management.

**Methods**:

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

---

### Controllers/ProgramController.gs

**Purpose**: Program and Activity management.

**Methods**:

| Method | Description |
|--------|-------------|
| `create(data, creatorId)` | Create program |
| `update(programId, data, updaterId)` | Update program |
| `delete(programId, deleterId)` | Delete program |
| `getByWorkUnitGoal(workUnitGoalId)` | Get programs by work unit goal |
| `getAllPrograms(filters)` | Get all programs |
| `getById(programId)` | Get program by ID |

#### ProgramController.Activity
| Method | Description |
|--------|-------------|
| `create(data, creatorId)` | Create activity |
| `update(activityId, data, updaterId)` | Update activity |
| `delete(activityId, deleterId)` | Delete activity |
| `getByProgram(programId)` | Get activities by program |

---

### Controllers/SWOTController.gs

**Purpose**: SWOT Analysis management.

**Methods**:

| Method | Description |
|--------|-------------|
| `getByGoal(goalId)` | Get SWOT items for a goal |
| `create(data, userId)` | Create SWOT analysis item |
| `update(analysisId, updates, userId)` | Update SWOT item |
| `delete(analysisId, userId)` | Delete SWOT item |
| `getMatrix(goalId)` | Get SWOT matrix (S/W/O/T grouped) |
| `getImpactAnalysis(goalId)` | Get impact analysis with recommendations |

---

### Controllers/ReportController.gs

**Purpose**: Report generation.

**Methods**:

| Method | Description |
|--------|-------------|
| `generateKPIReport(filters)` | Generate KPI summary report |
| `generateOKRReport(filters)` | Generate OKR summary report |
| `generatePerformanceDashboard(year)` | Generate performance dashboard |
| `calculateKPIStatus(achievementPercentage)` | Calculate KPI status |
| `calculateSummary(reportData)` | Calculate report summary |

**KPI Status Thresholds**:
- ON_TRACK: >= 90%
- AT_RISK: 75-89%
- OFF_TRACK: < 75%

---

## Organization Module - Complete Architecture & Flow

The Organization Module is a fully functional hierarchical organization management system with two visualization modes (Table View and Diagram View), complete CRUD operations, and advanced delete handling with cascade/reassign options.

### Module Architecture Overview

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

### Organization Hierarchy

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

### Frontend Components

#### 1. Page Template: `pages/organization.html`

**Key Elements:**
- **Navigation Tabs**: Bootstrap tabs for Directorates, Work Units, Affairs, Positions
- **Table View Container**: Contains DataTables for each entity type
- **Diagram View Container**: Contains D3.js hierarchical tree visualization
- **Filter Panels**: Collapsible filter sections for each entity

**HTML Structure:**
```html
<div id="organization-view">
  <!-- Navigation Tabs -->
  <ul class="nav nav-tabs">
    <li><button data-bs-target="#directorates">Directorates</button></li>
    <li><button data-bs-target="#work-units">Work Units</button></li>
    <li><button data-bs-target="#affairs">Affairs</button></li>
    <li><button data-bs-target="#positions">Positions</button></li>
  </ul>

  <!-- Tab Content with Tables -->
  <div class="tab-content">
    <div id="directorates">...</div>
    <div id="work-units">...</div>
    <div id="affairs">...</div>
    <div id="positions">...</div>
  </div>
</div>

<div id="diagram-view">
  <!-- D3.js Diagram Container -->
  <div id="org-diagram-container"></div>
  <!-- Diagram Controls (Zoom, Export, etc.) -->
</div>
```

#### 2. DataTable Manager: `assets/js/organization_datatables.html`

**Purpose**: Manages lazy loading, caching, and rendering of organization tables.

**Key Features:**
- **Lazy Loading**: Only loads data for the active tab
- **Data Caching**: Prevents redundant API calls
- **DataTable Integration**: jQuery DataTables with pagination, search, sorting
- **Filter System**: Column-based filtering

**API:**
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

**Flow:**
```
1. Page Load → OrganizationManager.initialize()
2. Setup Bootstrap tab event listeners
3. Load active tab's data (lazy load)
4. User switches tab → loadEntityDataIfNotCached(entityType)
5. If cached → skip, if not → apiCall(entityType/list)
6. Render table with DataTable
```

#### 3. CRUD Operations: `assets/js/organization_crud.html`

**Purpose**: Handles Create, Update, Delete operations for all entity types.

**Save Functions:**
```javascript
async function saveDirectorate() { ... }
async function saveWorkUnit() { ... }
async function saveAffair() { ... }
async function savePosition() { ... }
```

**Save Flow:**
```
1. User fills modal form → clicks "Save"
2. Extract form data (ID determines create vs update)
3. Client-side validation
4. apiCall(endpoint, data) → backend
5. If success:
   - Close modal
   - Show toast notification
   - Refresh table
   - Reload diagram if active
```

**Delete Flow (Enhanced with Cascade/Reassign):**

```
┌─────────────────────────────────────────────────────────────────────┐
│                         DELETE OPERATION FLOW                        │
└─────────────────────────────────────────────────────────────────────┘

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

**Delete State Management:**
```javascript
let deleteContext = {
    type: 'directorate' | 'work-unit' | 'affair' | 'position',
    id: string,
    name: string,
    children: { hasChildren, workUnits, affairs, positions, total },
    alternatives: array,
    mode: 'direct' | 'cascade' | 'reassign',
    newParentId: string
};
```

#### 4. View Toggle: `assets/js/view-toggle.html`

**Purpose**: Switch between Table View and Diagram View.

**Features:**
- State persistence with localStorage
- Auto-initialize on saved preference
- Resource cleanup when switching views

**API:**
```javascript
const ViewToggle = {
    init(): void,                    // Auto-load saved view
    switchView('table' | 'diagram'): void,
    refresh(): void,                  // Refresh current view after CRUD
    toggleLegend(): void,             // Minimize/maximize diagram legend
    getCurrentView(): string          // Returns 'table' or 'diagram'
}
```

#### 5. Organization Diagram: `assets/js/org-diagram.html`

**Purpose**: D3.js hierarchical tree visualization of organization structure.

**Key Features:**
- **Interactive Tree**: Collapsible/expandable nodes
- **Zoom & Pan**: D3 zoom behavior
- **Drag & Drop**: Reposition nodes
- **Context Menu**: Right-click for View/Edit/Add Child/Delete
- **Export**: Download diagram as PNG

**Entity Configuration:**
```javascript
const entityConfig = {
    directorate: { color: '#667eea', label: 'Directorate' },
    'work-unit':  { color: '#764ba2', label: 'Work Unit' },
    affair:       { color: '#f093fb', label: 'Affair' },
    position:     { color: '#4facfe', label: 'Position' }
};
```

**Diagram API:**
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

### Backend Components

#### API Endpoints (Code.gs → callAPI)

**Directorates:**
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

**Work Units:** Same pattern with `work-units` prefix
**Affairs:** Same pattern with `affairs` prefix
**Positions:** Same pattern with `positions` prefix (no cascade/reassign)

#### Controller Methods (OrganizationController.gs)

**Common Pattern for All Entities:**
```javascript
const OrganizationController = {
  Directorate: {
    create(data, creatorId) {
      // 1. Validate input
      // 2. Call model.create()
      // 3. Log audit if success
      // 4. Return result
    },
    update(id, data, updaterId) {
      // 1. Validate input
      // 2. Call model.update()
      // 3. Log field-level revisions
      // 4. Return result
    },
    delete(id, deleterId) {
      // 1. Check for active children
      // 2. Block delete if children exist
      // 3. Call model.delete()
      // 4. Log audit
      // 5. Return result
    },
    getAll(filters) {
      // Return { success: true, data: [...] }
    },
    getById(id) {
      // Return { success: true, data: {...} }
    },
    checkChildren(id) {
      // Return { success: true, data: { hasChildren, workUnits, affairs, positions, total } }
    },
    getAlternatives(id) {
      // Return { success: true, data: [{ id, code, name, display }, ...] }
    },
    cascadeDelete(id, deleterId) {
      // 1. Get all descendants
      // 2. Delete positions
      // 3. Delete affairs
      // 4. Delete work units
      // 5. Delete entity
      // 6. Log audit for each deletion
    },
    reassignAndDelete(id, newId, deleterId) {
      // 1. Update all children to new parent
      // 2. Delete entity
      // 3. Log audit
    }
  }
}
```

#### Model Layer (Models/Organization.gs)

**Data Enhancement (JOIN behavior):**
```javascript
// Work Units automatically include directorate name
getAll(filters) {
  let workUnits = getTableData(DB_CONFIG.SHEET_NAMES.WORK_UNITS);

  // JOIN with Directorates for display
  const directorates = getTableData(DB_CONFIG.SHEET_NAMES.DIRECTORATES);
  workUnits = workUnits.map(wu => {
    const directorate = directorates.find(d => d.directorate_id === wu.directorate_id);
    return {
      ...wu,
      directorate_name: directorate
        ? `${directorate.directorate_code} - ${directorate.directorate_name}`
        : '-'
    };
  });

  return workUnits.sort(...);
}
```

### Database Schema

**Directorates Table:**
```
directorate_id, directorate_code, directorate_name, description,
director_position_id, active_from, active_until, is_active, sort_order,
created_at, created_by, updated_at, updated_by, notes
```

**WorkUnits Table:**
```
work_unit_id, directorate_id, work_unit_code, work_unit_name, description,
deputy_position_id, active_from, active_until, is_active, sort_order,
created_at, created_by, updated_at, updated_by, notes
```

**Affairs Table:**
```
affair_id, work_unit_id, affair_code, affair_name, description,
assistant_deputy_position_id, active_from, active_until, is_active, sort_order,
created_at, created_by, updated_at, updated_by, notes
```

**Positions Table:**
```
position_id, position_code, position_name, position_type, position_level,
parent_position_id, directorate_id, work_unit_id, affair_id,
description, responsibilities, active_from, active_until, is_active, sort_order,
created_at, created_by, updated_at, updated_by, notes
```

### Complete Data Flow Example: Creating a Work Unit

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     CREATE WORK UNIT - COMPLETE FLOW                    │
└─────────────────────────────────────────────────────────────────────────┘

1. USER ACTION
   User clicks "Add Work Unit" button
   onclick="showModal('work-unit')"

2. MODAL DISPLAY (assets/js/modals.html)
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

### Error Handling & Validation

**Frontend Validation:**
- Required field checks before API call
- Client-side format validation
- User-friendly error messages via toast notifications

**Backend Validation:**
- Data type validation in controller
- Referential integrity checks (parent must exist)
- Business rule validation (cannot delete entity with active children)

**API Response Format:**
```javascript
// Success
{ success: true, data: {...}, message: "..." }

// Error
{ success: false, message: "Error description", error: "Detailed error" }
```

### Debug Logging

All operations use `debugLog(category, message, data)` for debugging:
- `'CRUD'` - CRUD operations
- `'ORG_DT'` - DataTable operations
- `'DELETE'` - Delete operations
- `'VIEW'` - View toggle operations
- `'DIAGRAM'` - Diagram operations

---

## Models Documentation

### Models/User.gs

**Purpose**: User data model and business logic.

**Methods**:

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

---

### Models/Organization.gs

**Purpose**: Organization structure model with hierarchical operations.

**Nested Models**:

#### OrganizationModel.Directorate
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

**Key Fields**: `directorate_id`, `directorate_code`, `directorate_name`, `description`, `director_position_id`, `is_active`, `sort_order`

---

#### OrganizationModel.WorkUnit
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

**Key Fields**: `work_unit_id`, `directorate_id`, `work_unit_code`, `work_unit_name`, `deputy_position_id`, `is_active`, `sort_order`

**Data Enhancement**: Results include `directorate_name` (e.g., "DIR-001 - Finance")

---

#### OrganizationModel.Affair
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

**Key Fields**: `affair_id`, `work_unit_id`, `affair_code`, `affair_name`, `assistant_deputy_position_id`, `is_active`, `sort_order`

**Data Enhancement**: Results include `work_unit_name` and `directorate_name`

---

#### OrganizationModel.Position
**Purpose**: Fourth-level - job positions that can be assigned to users

| Method | Description |
|--------|-------------|
| `findById(positionId)` | Find position by ID |
| `getAll(filters)` | Get all positions with JOINed hierarchy names |
| `create(data)` | Create position with auto-generated code |
| `update(positionId, data)` | Update position fields |
| `delete(positionId)` | Delete only if no active assignments |
| `generateCode()` | Generate next position code (POS-XXX) |

**Key Fields**: `position_id`, `position_code`, `position_name`, `position_type`, `position_level`, `parent_position_id`, `directorate_id`, `work_unit_id`, `affair_id`, `is_active`, `sort_order`

**Data Enhancement**: Results include `affair_name`, `work_unit_name`, `directorate_name`

**Position Types**: EXECUTIVE, MANAGER, STAFF, CONTRACTOR, INTERN
**Position Levels**: C_LEVEL, DIRECTOR, MANAGER, SUPERVISOR, STAFF, TRAINEE

---

#### OrganizationModel.PositionAssignment
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

**Key Fields**: `assignment_id`, `user_id`, `position_id`, `assignment_date`, `start_date`, `end_date`, `is_primary`, `assignment_status`, `assignment_letter_number`

**Assignment Status**: ACTIVE, ENDED, SUSPENDED, ON_LEAVE

---

### Models/Strategic.gs

**Purpose**: Strategic planning model.

**Nested Models**:
- `StrategicModel.Period` - Strategic periods
- `StrategicModel.Vision` - Vision statements
- `StrategicModel.Mission` - Mission statements
- `StrategicModel.Initiative` - Strategic initiatives
- `StrategicModel.Goal` - Organizational goals
- `StrategicModel.WorkUnitGoal` - Work unit goals

---

### Models/KPI.gs

**Purpose**: KPI data model.

**Nested Models**:
- `KPIModel` - Organizational KPIs
- `KPIModel.Progress` - Monthly progress tracking
- `KPIModel.Individual` - Individual KPIs

---

### Models/OKR.gs

**Purpose**: OKR data model.

**Methods**:
- `getByUser(userId, year, quarter)` - Get OKRs by user
- `getCurrentWeekOKR(userId)` - Get current week OKR
- `create(data)`, `update(okrId, data)`, `submit(okrId)`, `review(...)`

---

### Models/Program.gs

**Purpose**: Program and Activity models.

**Nested Models**:
- `ProgramModel` - Programs
- `ActivityModel` - Activities

---

### Models/Role.gs

**Purpose**: Role and permissions model.

**Methods**:
- `getAll()`, `findById(roleId)`, `create(data)`, `update(roleId, data)`, `delete(roleId)`
- `clone(roleId, newRoleName, creatorId)` - Clone existing role

---

## Services Documentation

### DatabaseService.gs

**Purpose**: Core database operations with Google Sheets.

**Key Functions**:

| Function | Description |
|----------|-------------|
| `getSpreadsheet()` | Get or create database spreadsheet |
| `initializeDatabase()` | Create all 28 sheets with headers |
| `getTableData(sheetName)` | Get all data from sheet as objects |
| `insertRecord(sheetName, data)` | Insert new record |
| `updateRecord(sheetName, idField, idValue, data)` | Update record |
| `deleteRecord(sheetName, idField, idValue)` | Delete record |
| `getDatabaseStats()` | Get database statistics |
| `generateGoogleSheets(sheetName, data)` | Create export spreadsheet |
| `moveSheetToFolder(spreadsheetId, folderId)` | Move sheet to Drive folder |

**Database Sheets (28 total)**:

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

---

### NotificationService.gs

**Purpose**: Notifications and email alerts.

**Methods**:

| Method | Description |
|--------|-------------|
| `sendNotification(userId, type, title, message, linkUrl)` | Send notification |
| `sendEmailNotification(userId, subject, message)` | Send email |
| `getUserNotifications(userId, unreadOnly)` | Get user notifications |
| `markAsRead(notificationId)` | Mark notification as read |
| `markAllAsRead(userId)` | Mark all as read |
| `broadcastNotification(userIds, type, title, message)` | Broadcast to multiple users |
| `checkAndNotifyCriticalKPIs()` | Check and alert on critical KPIs |

**Notification Types**: INFO, WARNING, SUCCESS, ERROR

---

### ReportService.gs

**Purpose**: Report generation and export.

**Methods**:

| Method | Description |
|--------|-------------|
| `generateKPISummary(filters)` | Generate KPI summary report |
| `generateOKRSummary(filters)` | Generate OKR summary report |
| `generatePerformanceDashboard(year)` | Generate performance dashboard |
| `exportToCSV(data, filename)` | Export data to CSV |
| `exportToGoogleSheets(data, sheetName)` | Export to Google Sheets |
| `sendEmailReport(recipientEmail, subject, reportData)` | Send email report |

---

## Frontend Structure

### Page Templates (pages/)

Each page template renders the main content area and includes:
- HTML structure with Bootstrap classes
- Page-specific modals (optional)
- Page-specific scripts (optional)

**Pages**:
- `login.html` - Login form
- `dashboard.html` - Main dashboard with widgets
- `organization.html` - **Organization hierarchy with two views (Table + Diagram)**
- `strategic-plan.html` - Strategic planning interface
- `kpi.html` - KPI management
- `okrs.html` - OKR management
- `users.html` - User management
- `roles.html` - Role management
- `programs.html` - Program management
- `reports.html` - Reports and analytics
- `audit-trail.html` - Audit trail viewer
- `swot.html` - SWOT analysis
- `notifications.html` - Notifications panel
- `settings.html` - Application settings

### Organization Module Frontend Files

The Organization Module uses the following specialized frontend files:

| File | Purpose |
|------|---------|
| `pages/organization.html` | Main page with tabs, table view, and diagram view containers |
| `layout/modals/organization_modals.html` | Modal forms for CRUD operations (4 entity types) |
| `assets/js/organization_datatables.html` | DataTable management with lazy loading and caching |
| `assets/js/organization_crud.html` | CRUD operations and enhanced delete with cascade/reassign |
| `assets/js/view-toggle.html` | Switch between table and diagram views |
| `assets/js/org-diagram.html` | D3.js hierarchical tree visualization |
| `assets/js/org-diagram-controls.html` | Diagram toolbar controls |
| `assets/js/org-diagram-tooltip.html` | Node tooltip on hover |
| `assets/js/org-diagram-context-menu.html` | Right-click context menu |
| `assets/js/organization-view-functions.html` | Helper functions for view toggle |

**Organization Module Data Flow:**
```
Page Load → OrganizationManager.initialize() → Load active tab data
User clicks tab → loadEntityDataIfNotCached() → API call → Render DataTable
User clicks "Add" → showModal(type) → Open modal → saveX() → Refresh table
User clicks "Diagram" → ViewToggle.switchView('diagram') → OrgDiagram.init()
User clicks "Table" → ViewToggle.switchView('table') → OrgDiagram.destroy()
```

### Script Templates (assets/js/)

**Common Scripts**:
- `api_helper.html` - API communication wrapper
- `ui_helpers.html` - Common UI functions (toasts, modals)
- `modals.html` - Common modal functions
- `ajax_loader.html` - AJAX loading indicator
- `router.html` - SPA router for navigation

**CRUD Scripts**:
- `users_crud.html` - User CRUD operations
- `roles_crud.html` - Role CRUD operations
- `organization_crud.html` - **Organization CRUD (4 entities + cascade delete)**
- `strategic_crud.html` - Strategic plan CRUD
- `kpi_crud.html` - KPI CRUD operations
- `okr_crud.html` - OKR CRUD operations
- `programs_crud.html` - Program CRUD operations
- `reports_crud.html` - Report generation
- `audit_crud.html` - Audit trail viewer
- `swot_crud.html` - SWOT CRUD operations
- `notifications_crud.html` - Notification management

**Specialized Scripts**:
- `dashboard_widgets.html` - Dashboard widgets
- `datatables_manager.html` - DataTables initialization
- `organization_datatables.html` - **Organization DataTable manager with lazy loading**
- `org-diagram.html` - **Organization D3.js tree visualization**
- `org-diagram-controls.html` - **Diagram controls (zoom, export, etc.)**
- `org-diagram-tooltip.html` - **Diagram node tooltips**
- `org-diagram-context-menu.html` - **Diagram right-click menu**
- `view-toggle.html` - **Table/Diagram view switcher**
- `auth.html` - Authentication functions
- `delete_confirm.html` - Delete confirmation dialogs

### Layout Components (layout/)

- `loading_overlay.html` - Loading overlay
- `toasts.html` - Toast notifications
- `sidebar.html` - Navigation sidebar
- `modals/*.html` - Page-specific modals
  - `okr_modals.html` - OKR form modals
  - `organization_modals.html` - **Organization entity modals (directorates, work-units, affairs, positions)**
  - `program_modals.html` - Program form modals
  - `swot_modals.html` - SWOT form modals

### Organization Module Modal Structure

**File**: `layout/modals/organization_modals.html`

Contains 4 Bootstrap modals:
1. **directorateModal** - Fields: code, name, description
2. **work-unitModal** - Fields: code, name, directorate (dropdown)
3. **affairModal** - Fields: code, name, work unit (dropdown)
4. **positionModal** - Fields: code, name, level, work unit (dropdown), assigned user (dropdown)
5. **deleteConfirmModal** - Dynamic delete confirmation with:
   - Children count display
   - Cascade delete option (radio)
   - Reassign children option (radio + dropdown)

**Modal Usage Pattern:**
```javascript
// Open modal for create
showModal('directorate') → Opens with empty form

// Open modal for edit
editItem('directorate', id) → Fetches data → Populates form → Opens modal

// Save from modal
onclick="saveDirectorate()" → Validates → API call → Closes modal → Refreshes table

// Delete with confirmation
deleteItem('directorate', id) → Checks children → Shows appropriate modal
```

---

## Development Workflow

### 1. Initial Setup

```javascript
// Run this function from Apps Script editor
setupCompleteDatabase()
```

This will:
- Create all 28 database sheets
- Set up headers
- Create default roles (Super Admin, Admin, Manager, User, Viewer)
- Create super admin user

**Super Admin Credentials**:
- Email: mohammad.afwanul@bpjsketenagakerjaan.go.id
- Username: mohammad.afwanul
- Password: SuperAdmin@2026

### 2. Development Mode

Set `DEVELOPMENT_MODE = true` in Index.html to:
- Bypass authentication
- Use mock data
- Enable debug panel

### 3. Deploying Changes

```bash
# Using clasp CLI
clasp push

# Or manually copy-paste in Apps Script editor
```

### 4. Testing

1. Open web app URL
2. Login with credentials
3. Navigate to pages to test
4. Check browser console for errors
5. Check Apps Script Logger for backend logs

### 5. Debugging

- **Frontend**: Browser DevTools (Console, Network tab)
- **Backend**: Apps Script Logger (View > Logs)
- **Debug Panel**: Enable in Index.html with `ENABLE_DEBUG_PANEL = true`

---

## Common Patterns and Conventions

### Response Format

All API responses follow this format:

```javascript
// Success
{
  success: true,
  data: { ... },
  message: "Optional success message"
}

// Error
{
  success: false,
  message: "Error description",
  error: "Detailed error"
}
```

### Response Formatter

```javascript
// Use ResponseFormatter.formatSuccess() and formatError()
return ResponseFormatter.formatSuccess(data, message);
return ResponseFormatter.formatError(message, details);
return ResponseFormatter.formatValidationError(errors);
return ResponseFormatter.formatNotFound(resource);
```

### Controller Pattern

```javascript
const MyController = {
  create(data, creatorId) {
    try {
      // 1. Validate
      const validation = validateMyEntity(data);
      if (!validation.isValid) {
        return { success: false, message: 'Validation failed', errors: validation.errors };
      }

      // 2. Check uniqueness/constraints
      if (!MyModel.isUnique(data.field)) {
        return { success: false, message: 'Field already exists' };
      }

      // 3. Call model
      data.created_by = creatorId;
      const result = MyModel.create(data);

      // 4. Log audit
      if (result.success) {
        logAudit('CREATE', 'MyEntity', result.data.id, creatorId, 'Entity created');
      }

      return result;
    } catch (error) {
      Logger.log('MyController.create error: ' + error);
      return { success: false, message: 'Failed to create', error: error.toString() };
    }
  }
};
```

### Model Pattern

```javascript
const MyModel = {
  findById(id) {
    const items = getTableData(DB_CONFIG.SHEET_NAMES.MY_ENTITY);
    return items.find(item => item.id === id) || null;
  },

  getAll(filters = {}) {
    let items = getTableData(DB_CONFIG.SHEET_NAMES.MY_ENTITY);
    // Apply filters...
    return items;
  },

  create(data) {
    const newItem = {
      id: generateUUID(),
      ...data,
      created_at: formatDateTime(new Date()),
      updated_at: formatDateTime(new Date())
    };
    const result = insertRecord(DB_CONFIG.SHEET_NAMES.MY_ENTITY, newItem);
    return result.success
      ? { success: true, data: newItem, message: 'Created successfully' }
      : { success: false, error: result.error };
  },

  update(id, data) {
    const updateData = {
      ...data,
      updated_at: formatDateTime(new Date())
    };
    delete updateData.id;
    delete updateData.created_at;

    const result = updateRecord(DB_CONFIG.SHEET_NAMES.MY_ENTITY, 'id', id, updateData);
    return result.success
      ? { success: true, data: { id, ...updateData }, message: 'Updated successfully' }
      : { success: false, error: result.error };
  }
};
```

### Validation Pattern

```javascript
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
  if (data.email && !validateEmail(data.email)) {
    errors.push({ field: 'email', message: 'Invalid email format' });
  }

  return {
    isValid: errors.length === 0,
    errors: errors
  };
}
```

### Audit Logging Pattern

```javascript
// Simple audit
logAudit('CREATE', 'MyEntity', entityId, userId, 'Entity created');

// Field-level revisions
logMultipleRevisions('MyEntity', entityId, changes, 'UPDATE', userId, 'Updated entity');

// For each change
logRevision('MyEntity', entityId, 'fieldName', oldValue, newValue, 'UPDATE', userId, 'Reason');
```

### UUID Generation

```javascript
const id = generateUUID(); // Uses Utilities.getUuid()
```

### Date Formatting

```javascript
// ISO format (YYYY-MM-DD)
const date = formatDateISO(new Date());

// DateTime format (YYYY-MM-DD HH:mm:ss)
const datetime = formatDateTime(new Date());
```

### Permission Check Pattern

```javascript
// In API.gs doPost
case 'myEntity.create':
  requirePermission(sessionToken, 'myEntity', 'create');
  response = MyController.create(data, getCurrentUser(sessionToken).user_id);
  break;
```

---

## API Endpoint Reference

### Authentication

| Action | Description |
|--------|-------------|
| `auth.login` | User login |
| `auth.logout` | User logout |
| `auth.getCurrentUser` | Get current user |
| `auth.changePassword` | Change password |

### Users

| Action | Description |
|--------|-------------|
| `users.list` | Get all users |
| `users.getById` | Get user by ID |
| `users.create` | Create user |
| `users.update` | Update user |
| `users.delete` | Delete user |

### Roles

| Action | Description |
|--------|-------------|
| `roles.list` | Get all roles |
| `roles.create` | Create role |
| `roles.clone` | Clone role |

### Organization

| Action | Description |
|--------|-------------|
| `directorates.list` | List directorates |
| `directorates.get` | Get directorate |
| `directorates.create` | Create directorate |
| `directorates.update` | Update directorate |
| `directorates.delete` | Delete directorate |
| `directorates.check-children` | Check child entities |
| `directorates.get-alternatives` | Get reassignment options |
| `directorates.delete-cascade` | Cascade delete |
| `directorates.delete-reassign` | Reassign and delete |
| `work-units.list` | List work units |
| `work-units.get` | Get work unit |
| `work-units.create` | Create work unit |
| `work-units.update` | Update work unit |
| `work-units.delete` | Delete work unit |
| `affairs.list` | List affairs |
| `affairs.create` | Create affair |
| `positions.list` | List positions |
| `positions.create` | Create position |

### Strategic Planning

| Action | Description |
|--------|-------------|
| `periods.list` | List periods |
| `periods.getActive` | Get active period |
| `periods.setActive` | Set active period |
| `visions.create` | Create vision |
| `visions.approve` | Approve vision |
| `missions.create` | Create mission |
| `goals.create` | Create goal |

### KPIs

| Action | Description |
|--------|-------------|
| `kpis.list` | List KPIs |
| `kpis.create` | Create KPI |
| `kpis.update` | Update KPI |
| `kpis.progress.record` | Record progress |
| `kpis.progress.verify` | Verify progress |

### Programs

| Action | Description |
|--------|-------------|
| `programs.create` | Create program |
| `programs.update` | Update program |
| `activities.create` | Create activity |

### OKRs

| Action | Description |
|--------|-------------|
| `okrs.get` | Get OKRs |
| `okrs.getCurrentWeek` | Get current week OKR |
| `okrs.create` | Create OKR |
| `okrs.update` | Update OKR |
| `okrs.submit` | Submit OKR |
| `okrs.review` | Review OKR |

### Reports

| Action | Description |
|--------|-------------|
| `reports.kpi` | Generate KPI report |
| `reports.okr` | Generate OKR report |
| `reports.performance` | Generate performance dashboard |
| `reports.export.csv` | Export to CSV |
| `reports.export.sheets` | Export to Sheets |

### Notifications

| Action | Description |
|--------|-------------|
| `notifications.get` | Get notifications |
| `notifications.markAsRead` | Mark as read |
| `notifications.markAllAsRead` | Mark all as read |

### SWOT

| Action | Description |
|--------|-------------|
| `swot.matrix` | Get SWOT matrix |
| `swot.create` | Create SWOT item |
| `swot.update` | Update SWOT item |
| `swot.delete` | Delete SWOT item |
| `swot.impact` | Get impact analysis |

### Audit/Revisions

| Action | Description |
|--------|-------------|
| `revisions.getHistory` | Get revision history |
| `revisions.restore` | Restore revision |

---

## Utility Functions

### StringUtils.gs

| Function | Description |
|--------|-------------|
| `generateUUID()` | Generate unique ID |
| `generateCode(prefix, number, padding)` | Generate code (e.g., DIR-001) |
| `parseCodeNumber(code)` | Extract number from code |
| `slugify(text)` | Convert text to URL-safe slug |
| `truncate(text, length, suffix)` | Truncate text with suffix |
| `capitalize(text)` | Capitalize first letter |

### DateUtils.gs

| Function | Description |
|--------|-------------|
| `formatDateISO(date)` | Format as YYYY-MM-DD |
| `formatDateTime(date)` | Format as YYYY-MM-DD HH:mm:ss |
| `parseDate(dateString)` | Parse date string |
| `getWeekNumber(date)` | Get week number |
| `getWeekStart(date)` | Get week start (Monday) |
| `getWeekEnd(date)` | Get week end (Sunday) |
| `getQuarterFromMonth(month)` | Get quarter from month |
| `addDays(date, days)` | Add days to date |
| `diffDays(date1, date2)` | Get days difference |

---

## Database Schema Summary

### Users Table
- `user_id`, `username`, `email`, `password_hash`, `full_name`, `role_id`
- `active_from`, `active_until`, `is_active`, `last_login`
- `created_at`, `created_by`, `updated_at`, `updated_by`, `notes`

### Roles Table
- `role_id`, `role_name`, `role_code`, `description`, `permissions` (JSON)
- `is_system_role`, `created_at`, `created_by`, `updated_at`, `updated_by`

### Directorates Table
- `directorate_id`, `directorate_code`, `directorate_name`, `description`
- `director_position_id`, `active_from`, `active_until`, `is_active`, `sort_order`
- `created_at`, `created_by`, `updated_at`, `updated_by`, `notes`

### WorkUnits Table
- `work_unit_id`, `directorate_id`, `work_unit_code`, `work_unit_name`, `description`
- `deputy_position_id`, `active_from`, `active_until`, `is_active`, `sort_order`
- `created_at`, `created_by`, `updated_at`, `updated_by`, `notes`

### Affairs Table
- `affair_id`, `work_unit_id`, `affair_code`, `affair_name`, `description`
- `assistant_deputy_position_id`, `active_from`, `active_until`, `is_active`, `sort_order`
- `created_at`, `created_by`, `updated_at`, `updated_by`, `notes`

### Positions Table
- `position_id`, `position_code`, `position_name`, `position_type`, `position_level`
- `parent_position_id`, `directorate_id`, `work_unit_id`, `affair_id`
- `description`, `responsibilities`, `active_from`, `active_until`, `is_active`, `sort_order`
- `created_at`, `created_by`, `updated_at`, `updated_by`, `notes`

### KPIs Table
- `kpi_id`, `work_unit_goal_id`, `kpi_code`, `year`, `directorate_id`, `work_unit_id`
- `kpi_type`, `perspective`, `goal_id`, `kpi_name`, `weight_percentage`
- `target_value`, `unit_of_measurement`, `assessment_type`, `calculation_type`
- `glossary`, `is_derived_kpi`, `parent_kpi_id`, `maximum_limit`, `measurement_period`
- `baseline_value`, `created_at`, `created_by`, `updated_at`, `updated_by`, `status`, `notes`

### OKRs Table
- `okr_id`, `user_id`, `position_id`, `year`, `quarter`, `week_number`
- `week_start_date`, `week_end_date`, `objective_text`
- `key_result_1`, `key_result_1_progress`, `key_result_2`, `key_result_2_progress`
- `key_result_3`, `key_result_3_progress`, `overall_progress`
- `challenges`, `support_needed`, `created_at`, `updated_at`
- `submitted_at`, `reviewed_by`, `reviewed_at`, `review_notes`, `status`, `notes`

---

## Quick Reference

### Adding a New Page

1. Create `pages/my-page.html`
2. Create `assets/js/my_page_crud.html` (if needed)
3. Add to `Services/PagesConfig.gs`:
```javascript
myPage: {
  title: 'My Page',
  template: 'pages/my-page.html',
  scripts: ['assets/js/my_page_crud.html'],
  modals: ''
}
```
4. Add `myPage` to `validPages` array
5. Add sidebar link in `layout/sidebar.html`

### Adding a New API Endpoint

1. Add controller method in appropriate controller
2. Add case in `API.gs` doPost switch:
```javascript
case 'myEntity.myAction':
  requirePermission(sessionToken, 'myEntity', 'read');
  response = MyController.myAction(data);
  break;
```

### Debug Mode

Enable in Index.html:
```javascript
const DEVELOPMENT_MODE = true;
const ENABLE_DEBUG_PANEL = true;
const MOCK_DATA = true;
```

---

## License

Copyright (c) 2026 Strategic Execution Monitoring. All rights reserved.
