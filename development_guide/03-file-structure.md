# File Structure

## Root Level Files

```
strategic-execution-app/
├── Code.gs                          # Main entry point, doGet, renderTemplate (REFACTORED v2.0)
├── API.gs                           # API routing with doPost
├── Config.gs                        # Application configuration
├── Auth.gs                          # Authentication & authorization
├── InitializeApp.gs                 # Database initialization
├── DatabaseService.gs               # Database operations
├── DebugDatabase.gs                 # Database debugging tools
├── ExportService.gs                 # Export functionality
├── NotificationService.gs           # Notifications & emails
├── Index.html                       # Main page template
├── headerTitle.html                 # Page header/title
├── linkReel.html                    # CSS/JS includes
├── minimalStyle.html                # Custom styles
├── .claspignore                     # clasp deployment exclusions
├── DEVELOPMENT_GUIDE.md             # Development guide (root)
├── TESTING_GUIDE.md                 # Testing guide
├── development_guide/               # Modular development guides (this folder)
└── Routing/                         # ⭐ NEW Modular API routing system
    ├── README.md                    # Routing documentation
    ├── Router.gs                    # Main router dispatcher
    ├── RouteRegistry.gs             # Route mapping registry
    ├── AuthRoutes.gs                # Authentication routes
    ├── UserRoutes.gs                # User & role management routes
    ├── OrganizationRoutes.gs        # Organization hierarchy routes
    ├── StrategicRoutes.gs           # Strategic planning routes (OKR, KPI, SWOT, Programs)
    ├── DashboardRoutes.gs           # Dashboard & reports routes
    └── SystemRoutes.gs              # System-level routes (notifications, settings, pages)
```

## Controllers Directory

```
Controllers/
├── DashboardController.gs           # Dashboard data aggregation
├── ImpactCenterController.gs        # Impact center management
├── ImportController.gs              # Data import functionality
├── KPIController.gs                 # KPI CRUD and progress
├── OKRController.gs                 # OKR management
├── OrganizationController.gs        # Organization hierarchy
├── ProgramController.gs             # Program and activity management
├── ReportController.gs              # Report generation
├── RoleController.gs                # Role and permission management
├── StrategicController.gs           # Strategic planning (vision, mission, goals)
└── UserController.gs                # User management
```

## Models Directory

```
Models/
├── ImpactCenter.gs                  # Impact center model
├── KPI.gs                           # KPI and progress models
├── OKR.gs                           # OKR model
├── Organization.gs                  # Organization hierarchy models
├── Program.gs                       # Program and activity models
├── Role.gs                          # Role model
├── Strategic.gs                     # Strategic planning models
└── User.gs                          # User model
```

## Services Directory

```
Services/
├── AuditService.gs                  # Audit trail and revisions
├── PagesConfig.gs                   # Page configuration
├── ReportService.gs                 # Report generation
├── SettingsService.gs               # Application settings
└── ValidationService.gs             # Input validation
```

## Utils Directory

```
Utils/
├── DateUtils.gs                     # Date formatting and utilities
├── ResponseFormatter.gs             # API response formatting
└── StringUtils.gs                   # String manipulation utilities
```

## Assets Directory

```
assets/
├── css/                            # (Not in repo - uses Bootstrap CDN)
└── js/
    ├── ajax_loader.html             # AJAX loading indicator
    ├── api_helper.html              # API communication wrapper
    ├── app_init.html                # Application initialization
    ├── auth.html                    # Authentication functions
    ├── crud_operations.html         # Generic CRUD operations
    ├── dashboard_widgets.html       # Dashboard widget scripts
    ├── datatables_manager.html      # DataTables initialization
    ├── debug_panel_script.html      # Debug panel functionality
    ├── delete_confirm.html          # Delete confirmation dialogs
    ├── kpi_crud.html                # KPI CRUD operations
    ├── modals.html                  # Common modal functions
    ├── notifications_crud.html      # Notification CRUD
    ├── okr_crud.html                # OKR CRUD operations
    ├── org-diagram.html             # D3.js org diagram
    ├── org-diagram-context-menu.html # Diagram context menu
    ├── org-diagram-controls.html    # Diagram toolbar
    ├── org-diagram-tooltip.html     # Diagram node tooltips
    ├── organization_crud.html       # Organization CRUD operations
    ├── organization_datatables.html # Organization DataTable manager
    ├── organization-view-functions.html # Organization view helpers
    ├── programs_crud.html           # Program CRUD operations
    ├── reports_crud.html            # Report generation
    ├── roles_crud.html              # Role CRUD operations
    ├── router.html                  # SPA router
    ├── settings_manager.html        # Settings management
    ├── strategic_crud.html          # Strategic planning CRUD
    ├── swot_crud.html               # SWOT CRUD operations
    ├── ui_helpers.html              # UI utility functions
    ├── users_crud.html              # User CRUD operations
    └── view-toggle.html             # Table/diagram view toggle
```

## Layout Directory

```
layout/
├── loading_overlay.html             # Loading overlay component
├── modals/                          # Page-specific modals
│   ├── okr_modals.html              # OKR form modals
│   ├── organization_modals.html     # Organization entity modals
│   ├── program_modals.html          # Program form modals
│   └── swot_modals.html             # SWOT form modals
├── sidebar.html                     # Navigation sidebar
└── toasts.html                      # Toast notifications
```

## Pages Directory

```
pages/
├── audit-trail.html                 # Audit trail viewer
├── dashboard.html                   # Main dashboard
├── kpi.html                         # KPI management page
├── login.html                       # Login page
├── notifications.html               # Notifications panel
├── okrs.html                        # OKR management page
├── organization.html                # Organization management
├── programs.html                    # Program management page
├── reports.html                     # Reports and analytics
├── roles.html                       # Role management page
├── settings.html                    # Application settings
├── strategic-plan.html              # Strategic planning page
└── swot.html                        # SWOT analysis page
```

## File Naming Conventions

| Convention | Example | Description |
|------------|---------|-------------|
| Backend file | `MyController.gs` | PascalCase for Controllers |
| Backend file | `MyModel.gs` | PascalCase for Models |
| Backend file | `myService.gs` | camelCase for Services/Utils |
| Frontend page | `my-page.html` | kebab-case for pages |
| Frontend script | `my_script.html` | snake_case for script templates |
| Frontend script | `organization_crud.html` | {module}_{type}.html pattern |

## File Dependencies

### Backend Dependency Graph

```
Code.gs
    ├── Config.gs
    ├── Auth.gs
    │   └── Config.gs
    ├── Services/PagesConfig.gs
    │   └── Config.gs
    └── All Controllers
        └── All Models
            └── DatabaseService.gs

API.gs
    ├── Config.gs
    ├── Auth.gs
    ├── All Controllers
    └── Services/AuditService.gs
```

### Frontend Dependency Graph

```
Index.html
    ├── linkReel.html (Bootstrap, jQuery, DataTables, D3.js)
    ├── headerTitle.html
    ├── minimalStyle.html
    ├── layout/sidebar.html
    ├── layout/toasts.html
    ├── pages/{page}.html
    └── assets/js/* (dynamically loaded via PagesConfig)

assets/js/api_helper.html
    └── google.script.run (GAS API)

assets/js/crud_operations.html
    ├── assets/js/api_helper.html
    └── assets/js/ui_helpers.html

assets/js/organization_crud.html
    ├── assets/js/api_helper.html
    ├── assets/js/ui_helpers.html
    └── assets/js/organization_datatables.html
```

## Module File Mapping

| Module | Backend Files | Frontend Files |
|--------|---------------|----------------|
| **Organization** | Controllers/OrganizationController.gs<br>Models/Organization.gs | pages/organization.html<br>layout/modals/organization_modals.html<br>assets/js/organization_crud.html<br>assets/js/organization_datatables.html<br>assets/js/org-diagram.html<br>assets/js/view-toggle.html |
| **Users** | Controllers/UserController.gs<br>Models/User.gs<br>Controllers/RoleController.gs<br>Models/Role.gs | pages/users.html<br>pages/roles.html<br>assets/js/users_crud.html<br>assets/js/roles_crud.html |
| **Strategic** | Controllers/StrategicController.gs<br>Models/Strategic.gs | pages/strategic-plan.html<br>assets/js/strategic_crud.html |
| **KPI** | Controllers/KPIController.gs<br>Models/KPI.gs | pages/kpi.html<br>assets/js/kpi_crud.html |
| **OKR** | Controllers/OKRController.gs<br>Models/OKR.gs | pages/okrs.html<br>layout/modals/okr_modals.html<br>assets/js/okr_crud.html |
| **Programs** | Controllers/ProgramController.gs<br>Models/Program.gs | pages/programs.html<br>layout/modals/program_modals.html<br>assets/js/programs_crud.html |
| **SWOT** | Controllers/SWOTController.gs (if exists)<br>Models/ (part of Strategic) | pages/swot.html<br>layout/modals/swot_modals.html<br>assets/js/swot_crud.html |
| **Reports** | Controllers/ReportController.gs<br>Services/ReportService.gs | pages/reports.html<br>assets/js/reports_crud.html |

## Next Steps

- See [Core Files](./04-core-files.md) for details on Code.gs, API.gs, etc.
- See [Controllers](./06-controllers.md) for controller documentation
- See [Frontend Structure](./20-frontend-structure.md) for frontend architecture
