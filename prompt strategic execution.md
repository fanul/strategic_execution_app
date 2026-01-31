# PROMPT FOR MANUS.AI: Strategic Execution Monitoring Application

## CRITICAL INSTRUCTIONS FOR AI AGENT
You are tasked with building a comprehensive Strategic Execution Monitoring application. This prompt contains detailed requirements, but you are EXPECTED and ENCOURAGED to:

1. **ENHANCE USER EXPERIENCE**: Add features, fields, validations, and UX improvements that make the application more intuitive and professional
2. **OPTIMIZE WORKFLOWS**: Suggest and implement better data flows, automation, and user interactions
3. **ADD MISSING FUNCTIONALITIES**: Include standard features that would be expected in enterprise applications (audit trails, notifications, exports, etc.)
4. **IMPROVE DATA INTEGRITY**: Add validations, constraints, and business rules to ensure data quality
5. **SUGGEST IMPROVEMENTS**: Document any enhancements you make and why they improve the system

---

## PROJECT OVERVIEW

Build a **Progressive Web Application (PWA)** for Strategic Execution Monitoring using Google Apps Script, designed for multi-organizational strategic planning, KPI tracking, and performance monitoring.

### Core Technologies
- **Backend**: Google Apps Script (API-based, modular architecture)
- **Database**: Google Sheets (auto-generated, organized structure)
- **Frontend**: Bootstrap-based Admin Template (PWA-enabled)
- **Architecture**: Asynchronous data exchange, RESTful API design
- **Deployment**: Web app accessible via modern browsers and mobile devices

---

## TECHNICAL REQUIREMENTS

### 1. Architecture & Code Structure

#### Backend (Google Apps Script)
```
Project Structure:
├── Code.js (main entry point)
├── Config.js (configuration & constants)
├── Database.js (Google Sheets operations)
├── API.js (API endpoints router)
├── Auth.js (authentication & authorization)
├── Models/
│   ├── User.js
│   ├── Role.js
│   ├── Organization.js
│   ├── Strategic.js
│   ├── KPI.js
│   └── OKR.js
├── Controllers/
│   ├── UserController.js
│   ├── OrganizationController.js
│   ├── StrategicController.js
│   └── DashboardController.js
├── Services/
│   ├── ValidationService.js
│   ├── NotificationService.js
│   ├── AuditService.js
│   └── ReportService.js
└── Utils/
    ├── DateUtils.js
    ├── StringUtils.js
    └── ResponseFormatter.js
```

**Implementation Requirements**:
- Use `async/await` pattern for all data operations
- Implement proper error handling with try-catch blocks
- Return standardized JSON responses: `{success: boolean, data: any, message: string, error: any}`
- Use Google Apps Script caching for performance optimization
- Implement rate limiting and request validation

#### Frontend (PWA)
```
Frontend Structure:
├── index.html (main shell)
├── manifest.json (PWA manifest)
├── service-worker.js (offline functionality)
├── assets/
│   ├── css/
│   │   ├── bootstrap.min.css
│   │   ├── custom.css
│   │   └── themes.css
│   ├── js/
│   │   ├── app.js (main application logic)
│   │   ├── api.js (API communication layer)
│   │   ├── auth.js (authentication handling)
│   │   ├── components.js (reusable components)
│   │   └── utils.js (helper functions)
│   └── icons/ (PWA icons)
├── pages/
│   ├── dashboard.html
│   ├── organization.html
│   ├── strategic-plan.html
│   ├── kpi.html
│   └── settings.html
└── components/
    ├── navbar.html
    ├── sidebar.html
    └── modals.html
```

**Design Requirements**:
- **UI Framework**: Bootstrap 5+ with custom theme
- **Color Scheme**: Professional, accessible (WCAG 2.1 AA compliant)
- **Typography**: Clear hierarchy, readable fonts (minimum 14px body text)
- **Responsive**: Mobile-first design, tablet & desktop optimized
- **Icons**: Use Font Awesome or Bootstrap Icons
- **Loading States**: Skeleton screens, spinners, progress indicators
- **Feedback**: Toast notifications, inline validation, success/error messages

### 2. Database Schema (Google Sheets)

#### Setup Functions Required
```javascript
function generateGoogleSheets(sheetName) {
  // Create new spreadsheet with specified name
  // Return spreadsheet ID and URL
}

function moveSheetToFolder(spreadsheetId, folderId) {
  // Move spreadsheet to specified folder
  // Return success status
}

function initializeAllSheets() {
  // Create all required sheets with proper headers
  // Set up data validations and formulas
  // Return configuration object
}
```

#### Required Sheets & Columns

**Sheet: Users**
- user_id (PK, auto-generated UUID)
- username* (unique, min 3 chars)
- email* (unique, valid email format)
- password_hash* (encrypted)
- full_name*
- role_id* (FK to Roles)
- active_from* (default: creation timestamp)
- active_until (default: null = forever)
- is_active (boolean, default: true)
- last_login
- created_at
- created_by
- updated_at
- updated_by
- notes

**Sheet: Roles**
- role_id (PK, auto-generated UUID)
- role_name* (unique)
- role_code* (unique, uppercase)
- description
- permissions (JSON string: {module: [create, read, update, delete]})
- is_system_role (boolean, prevents deletion)
- created_at
- created_by
- updated_at
- updated_by

**Sheet: Directorates**
- directorate_id (PK, auto-generated UUID)
- directorate_code* (unique, e.g., "DIR-001")
- directorate_name*
- description
- director_position_id (FK to Positions)
- active_from* (default: creation timestamp)
- active_until (default: null = forever)
- is_active (boolean)
- sort_order (for display ordering)
- created_at
- created_by
- updated_at
- updated_by
- notes

**Sheet: WorkUnits**
- work_unit_id (PK, auto-generated UUID)
- directorate_id* (FK to Directorates)
- work_unit_code* (unique, e.g., "WU-001")
- work_unit_name*
- description
- deputy_position_id (FK to Positions)
- active_from* (default: creation timestamp)
- active_until (default: null = forever)
- is_active (boolean)
- sort_order
- created_at
- created_by
- updated_at
- updated_by
- notes

**Sheet: Affairs (Urusan)**
- affair_id (PK, auto-generated UUID)
- work_unit_id* (FK to WorkUnits)
- affair_code* (unique, e.g., "AFF-001")
- affair_name*
- description
- assistant_deputy_position_id (FK to Positions)
- active_from* (default: creation timestamp)
- active_until (default: null = forever)
- is_active (boolean)
- sort_order
- created_at
- created_by
- updated_at
- updated_by
- notes

**Sheet: Positions**
- position_id (PK, auto-generated UUID)
- position_code* (unique, e.g., "POS-001")
- position_name*
- position_type* (ENUM: 'HORIZONTAL', 'VERTICAL')
- position_level* (ENUM: 'DIRECTOR', 'DEPUTY', 'ASSISTANT_DEPUTY', 'STAFF', 'OTHER')
- parent_position_id (FK to Positions, for hierarchy)
- directorate_id (FK to Directorates, nullable)
- work_unit_id (FK to WorkUnits, nullable)
- affair_id (FK to Affairs, nullable)
- description
- responsibilities (text)
- active_from* (default: creation timestamp)
- active_until (default: null = forever)
- is_active (boolean)
- sort_order
- created_at
- created_by
- updated_at
- updated_by
- notes

**Sheet: PositionAssignments**
- assignment_id (PK, auto-generated UUID)
- user_id* (FK to Users)
- position_id* (FK to Positions)
- assignment_date*
- start_date*
- end_date (nullable)
- is_primary (boolean, one primary position per user)
- assignment_status* (ENUM: 'ACTIVE', 'ENDED', 'SUSPENDED')
- assignment_letter_number
- created_at
- created_by
- updated_at
- updated_by
- notes

**Sheet: Periods**
- period_id (PK, auto-generated UUID)
- period_code* (unique, e.g., "2024-2029")
- start_year* (4-digit year)
- end_year* (4-digit year)
- description
- is_active (boolean, only one active period)
- created_at
- created_by
- updated_at
- updated_by
- notes

**Sheet: Visions**
- vision_id (PK, auto-generated UUID)
- period_id* (FK to Periods)
- vision_code* (unique, e.g., "VIS-2024-001")
- vision_text* (rich text, max 1000 chars)
- description
- created_at
- created_by
- updated_at
- updated_by
- approval_status (ENUM: 'DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED')
- approved_by
- approved_at
- notes

**Sheet: Missions**
- mission_id (PK, auto-generated UUID)
- vision_id* (FK to Visions)
- mission_code* (unique, e.g., "MIS-2024-001")
- mission_text* (rich text, max 1500 chars)
- mission_order (integer, for sequencing)
- description
- created_at
- created_by
- updated_at
- updated_by
- approval_status (ENUM: 'DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED')
- approved_by
- approved_at
- notes

**Sheet: StrategicInitiatives**
- initiative_id (PK, auto-generated UUID)
- year* (4-digit year, from period breakdown)
- theme_code* (e.g., "STI-2024-001")
- theme_name*
- target_description (text)
- description
- budget_allocated (decimal)
- created_at
- created_by
- updated_at
- updated_by
- status (ENUM: 'PLANNING', 'ONGOING', 'COMPLETED', 'CANCELLED')
- notes

**Sheet: MissionInitiativeMapping**
- mapping_id (PK, auto-generated UUID)
- mission_id* (FK to Missions)
- initiative_id* (FK to StrategicInitiatives)
- relationship_type (text)
- weight_percentage (decimal, for contribution calculation)
- created_at
- created_by
- notes

**Sheet: OrganizationalGoals (Sasaran Badan)**
- goal_id (PK, auto-generated UUID)
- year* (4-digit year)
- goal_code* (unique, e.g., "SB-2024-001")
- goal_name*
- goal_description (text)
- target_description (text)
- created_at
- created_by
- updated_at
- updated_by
- status (ENUM: 'PLANNING', 'ONGOING', 'COMPLETED', 'CANCELLED')
- notes

**Sheet: ImpactCenters**
- ic_id (PK, auto-generated UUID)
- goal_id* (FK to OrganizationalGoals)
- ic_code* (format: "{year}.IC.{auto_number}")
- ic_name*
- description
- formula (text, calculation formula)
- deliverable*
- completion_percentage (decimal, 0-100)
- baseline_value (decimal)
- target_value (decimal)
- created_at
- created_by
- updated_at
- updated_by
- status
- notes

**Sheet: ICMonthlyProgress**
- progress_id (PK, auto-generated UUID)
- ic_id* (FK to ImpactCenters)
- year*
- month* (1-12)
- completion_percentage* (decimal, 0-100)
- actual_value (decimal)
- notes
- evidence_url (link to supporting documents)
- reported_by*
- reported_at*
- verified_by
- verified_at
- status (ENUM: 'DRAFT', 'SUBMITTED', 'VERIFIED', 'REJECTED')

**Sheet: ICWorkUnitMapping**
- mapping_id (PK, auto-generated UUID)
- ic_id* (FK to ImpactCenters)
- work_unit_id* (FK to WorkUnits)
- responsibility_level (ENUM: 'PRIMARY', 'SUPPORTING', 'INFORMED')
- weight_percentage (decimal)
- created_at
- created_by
- notes

**Sheet: AnalysisItems (Internal/External)**
- analysis_id (PK, auto-generated UUID)
- goal_id* (FK to OrganizationalGoals)
- analysis_type* (ENUM: 'INTERNAL', 'EXTERNAL')
- analysis_category* (ENUM: 'STRENGTH', 'WEAKNESS', 'OPPORTUNITY', 'THREAT')
- analysis_code* (e.g., "ANL-INT-001")
- title*
- description*
- impact_level (ENUM: 'HIGH', 'MEDIUM', 'LOW')
- priority (ENUM: 'HIGH', 'MEDIUM', 'LOW')
- created_at
- created_by
- updated_at
- updated_by
- notes

**Sheet: WorkUnitGoals (Sasaran Unit Kerja)**
- work_unit_goal_id (PK, auto-generated UUID)
- goal_id* (FK to OrganizationalGoals)
- work_unit_id* (FK to WorkUnits)
- goal_code* (unique, e.g., "SUK-2024-001")
- goal_name*
- goal_description
- target_description
- created_at
- created_by
- updated_at
- updated_by
- status
- notes

**Sheet: KPIs**
- kpi_id (PK, auto-generated UUID)
- work_unit_goal_id* (FK to WorkUnitGoals)
- kpi_code* (format: "{year}.KPI.{work_unit_code}.{perspective}.{auto}")
- year*
- directorate_id* (FK to Directorates)
- work_unit_id* (FK to WorkUnits)
- kpi_type* (ENUM: 'OUTCOME', 'OUTPUT', 'INPUT', 'PROCESS')
- perspective* (ENUM: 'FINANCIAL', 'CUSTOMER', 'INTERNAL_PROCESS', 'LEARNING_GROWTH')
- goal_id (FK to OrganizationalGoals)
- kpi_name*
- weight_percentage* (decimal, 0-100)
- target_value*
- unit_of_measurement*
- assessment_type* (ENUM: 'QUANTITATIVE', 'QUALITATIVE')
- calculation_type* (ENUM: 'CUMULATIVE', 'AVERAGE', 'MAXIMUM', 'MINIMUM', 'LATEST')
- glossary (text definition)
- is_derived_kpi (boolean)
- parent_kpi_id (FK to KPIs, for derived KPIs)
- maximum_limit (decimal)
- measurement_period* (ENUM: 'MONTHLY', 'QUARTERLY', 'ANNUALLY')
- baseline_value (decimal)
- created_at
- created_by
- updated_at
- updated_by
- status
- notes

**Sheet: KPIMonthlyProgress**
- progress_id (PK, auto-generated UUID)
- kpi_id* (FK to KPIs)
- year*
- month* (1-12)
- actual_value*
- achievement_percentage (calculated)
- notes
- evidence_url
- reported_by*
- reported_at*
- verified_by
- verified_at
- status (ENUM: 'DRAFT', 'SUBMITTED', 'VERIFIED', 'REJECTED')

**Sheet: Programs**
- program_id (PK, auto-generated UUID)
- work_unit_goal_id* (FK to WorkUnitGoals)
- program_code* (unique, e.g., "PRG-2024-001")
- program_name*
- program_description
- start_date
- end_date
- budget_allocated (decimal)
- budget_spent (decimal, calculated from activities)
- created_at
- created_by
- updated_at
- updated_by
- status
- notes

**Sheet: KPIProgramMapping**
- mapping_id (PK, auto-generated UUID)
- kpi_id* (FK to KPIs)
- program_id* (FK to Programs)
- contribution_weight (decimal)
- created_at
- created_by
- notes

**Sheet: Activities**
- activity_id (PK, auto-generated UUID)
- program_id* (FK to Programs)
- activity_code* (unique, e.g., "ACT-2024-001")
- activity_name*
- activity_description
- unit_price* (decimal)
- quantity* (decimal)
- total_cost (calculated: unit_price * quantity)
- unit_of_measurement
- start_date
- end_date
- responsible_position_id (FK to Positions)
- created_at
- created_by
- updated_at
- updated_by
- status
- completion_percentage (decimal, 0-100)
- notes

**Sheet: IndividualKPIs**
- individual_kpi_id (PK, auto-generated UUID)
- activity_id (FK to Activities, can be null)
- kpi_code* (format: "{year}.KPIINDIVIDU.{work_unit_code}.{position_code}.{auto}")
- year*
- directorate_id* (FK to Directorates)
- work_unit_id* (FK to WorkUnits)
- position_id* (FK to Positions)
- kpi_type* (ENUM: 'OUTCOME', 'OUTPUT', 'INPUT', 'PROCESS')
- perspective* (ENUM: 'FINANCIAL', 'CUSTOMER', 'INTERNAL_PROCESS', 'LEARNING_GROWTH')
- goal_id (FK to OrganizationalGoals)
- kpi_name*
- weight_percentage* (decimal, 0-100)
- target_value*
- unit_of_measurement*
- assessment_type* (ENUM: 'QUANTITATIVE', 'QUALITATIVE')
- calculation_type* (ENUM: 'CUMULATIVE', 'AVERAGE', 'MAXIMUM', 'MINIMUM', 'LATEST')
- glossary
- is_derived_kpi (boolean)
- parent_kpi_id (FK to IndividualKPIs)
- maximum_limit (decimal)
- measurement_period* (ENUM: 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'ANNUALLY')
- baseline_value (decimal)
- created_at
- created_by
- updated_at
- updated_by
- status
- notes

**Sheet: IndividualKPIMonthlyProgress**
- progress_id (PK, auto-generated UUID)
- individual_kpi_id* (FK to IndividualKPIs)
- year*
- month* (1-12)
- actual_value*
- achievement_percentage (calculated)
- notes
- evidence_url
- reported_by*
- reported_at*
- verified_by
- verified_at
- status

**Sheet: OKRs (Objectives and Key Results)**
- okr_id (PK, auto-generated UUID)
- user_id* (FK to Users)
- position_id* (FK to Positions)
- year*
- quarter* (1-4)
- week_number* (1-53)
- week_start_date* (Monday of the week)
- week_end_date* (Sunday of the week)
- objective_text*
- key_result_1*
- key_result_1_progress (decimal, 0-100)
- key_result_2
- key_result_2_progress (decimal, 0-100)
- key_result_3
- key_result_3_progress (decimal, 0-100)
- overall_progress (calculated average)
- challenges (text)
- support_needed (text)
- created_at
- updated_at
- submitted_at
- reviewed_by (FK to Users)
- reviewed_at
- review_notes
- status (ENUM: 'DRAFT', 'SUBMITTED', 'REVIEWED', 'APPROVED')
- notes

**Sheet: Revisions (Audit Trail)**
- revision_id (PK, auto-generated UUID)
- entity_type* (table name being revised)
- entity_id* (ID of the record)
- field_name* (column being changed)
- old_value (JSON string)
- new_value (JSON string)
- change_type* (ENUM: 'CREATE', 'UPDATE', 'DELETE', 'RESTORE')
- changed_by* (FK to Users)
- changed_at*
- reason (text)
- ip_address
- user_agent

**Sheet: AppSettings**
- setting_id (PK, auto-generated UUID)
- setting_key* (unique)
- setting_value* (JSON string)
- setting_category (e.g., "SYSTEM", "EMAIL", "NOTIFICATION")
- description
- is_editable (boolean)
- updated_by
- updated_at

**Sheet: Notifications**
- notification_id (PK, auto-generated UUID)
- user_id* (FK to Users, can be null for broadcast)
- notification_type* (ENUM: 'INFO', 'WARNING', 'SUCCESS', 'ERROR')
- title*
- message*
- link_url
- is_read (boolean, default: false)
- read_at
- created_at
- expires_at
- priority (ENUM: 'HIGH', 'MEDIUM', 'LOW')

---

## FEATURE REQUIREMENTS

### 3. User Management Module

#### User CRUD Operations
**Features to Implement**:
- Create, Read, Update, Delete users
- Password encryption (use Google Apps Script encryption utilities)
- Email validation (format and uniqueness check)
- Username validation (min 3 chars, alphanumeric + underscore)
- Active period management (from-until dates with validation)
- User activation/deactivation toggle
- Last login tracking
- Bulk user import from CSV/Excel
- User profile photo upload (store in Google Drive)
- Password reset functionality with email notification

**UI Components**:
- User list table with search, filter, pagination
- User form modal (create/edit)
- User detail view with activity history
- Password change form
- Bulk actions: activate, deactivate, delete (with confirmation)

**Validations**:
- Cannot delete user with active assignments
- Cannot set active_until before active_from
- Email uniqueness across all users
- Strong password requirements (min 8 chars, mix of upper, lower, numbers, symbols)

**AI Enhancement Suggestions**:
- Add user profile completeness indicator
- Implement user activity dashboard
- Add email verification step for new users
- Include user preferences (language, timezone, notification settings)
- Add profile fields: phone, department, supervisor
- Implement user status history tracking

---

### 4. Role Management Module

#### Role CRUD Operations
**Features to Implement**:
- Create, Read, Update, Delete roles
- Granular permission management per module
- Permission matrix UI (modules vs CRUD operations)
- System roles protection (prevent deletion/modification)
- Role cloning functionality
- User count per role

**Permissions Structure (JSON)**:
```json
{
  "users": {"create": true, "read": true, "update": true, "delete": false},
  "roles": {"create": false, "read": true, "update": false, "delete": false},
  "directorates": {"create": true, "read": true, "update": true, "delete": true},
  "strategic_plan": {"create": true, "read": true, "update": true, "delete": false},
  "kpi": {"create": true, "read": true, "update": true, "delete": false},
  "reports": {"create": false, "read": true, "update": false, "delete": false}
}
```

**Default Roles to Create**:
1. Super Admin (all permissions)
2. Admin (most permissions except system settings)
3. Manager (read all, edit strategic & KPI)
4. User (read own data, edit own OKRs)
5. Viewer (read-only access)

**UI Components**:
- Role list with permission summary
- Role form with permission checkboxes/toggles
- Permission template selector
- Role assignment history

**AI Enhancement Suggestions**:
- Add role hierarchy (inheritable permissions)
- Implement permission groups for easier management
- Add audit log for permission changes
- Include role-based dashboard customization
- Add temporary role elevation with expiry

---

### 5. Organization Configuration Module

#### 5.1 Directorate Management
**Features**:
- CRUD operations for directorates
- Auto-generated directorate codes (DIR-001, DIR-002, etc.)
- Director position assignment from Positions table
- Active period management with validation
- Hierarchical sorting/ordering
- Directorate status tracking

**UI Components**:
- Directorate list with work unit count
- Directorate form with position searchable dropdown
- Organizational chart view
- Drag-and-drop reordering

**Business Rules**:
- Cannot delete directorate with active work units
- Cannot assign inactive position as director
- Active period must overlap with position assignment period

**AI Enhancement Suggestions**:
- Add directorate performance summary dashboard
- Include budget allocation tracking per directorate
- Add directorate head contact information
- Implement directorate merger/split functionality
- Add geographical location/coverage fields

---

#### 5.2 Work Unit Management
**Features**:
- CRUD operations for work units
- Parent directorate selection (searchable dropdown)
- Auto-generated work unit codes (WU-001, WU-002, etc.)
- Deputy position assignment
- Active period management
- Work unit type categorization

**UI Components**:
- Work unit list grouped by directorate
- Cascading dropdowns (directorate → work unit)
- Work unit detail with affairs list
- Tree view of directorate → work units → affairs

**Business Rules**:
- Work unit must belong to active directorate
- Cannot delete work unit with active affairs or programs
- Deputy position must be from valid position type

**AI Enhancement Suggestions**:
- Add work unit capacity/headcount tracking
- Include work unit location/office information
- Add work unit expertise/specialization tags
- Implement work unit collaboration matrix
- Add work unit resource allocation dashboard

---

#### 5.3 Affairs (Urusan) Management
**Features**:
- CRUD operations for affairs
- Parent work unit selection (searchable dropdown with directorate filter)
- Auto-generated affair codes (AFF-001, AFF-002, etc.)
- Assistant deputy position assignment
- Active period management
- Affair categorization

**UI Components**:
- Affairs list grouped by work unit
- Cascading filters (directorate → work unit → affair)
- Affair detail with assigned positions
- Hierarchical tree view

**Business Rules**:
- Affair must belong to active work unit
- Cannot delete affair with active position assignments
- Assistant deputy position must be valid

**AI Enhancement Suggestions**:
- Add affair workload indicator
- Include affair performance metrics
- Add affair collaboration tools
- Implement affair knowledge base
- Add affair-specific templates

---

#### 5.4 Position Management
**Features**:
- CRUD operations for positions
- Position type classification (HORIZONTAL vs VERTICAL)
- Position level hierarchy (Director → Deputy → Assistant Deputy → Staff)
- Parent position assignment (reporting structure)
- Organization unit mapping (directorate/work unit/affair)
- Position responsibilities and requirements
- Active period management
- Position grade/salary band (optional)

**UI Components**:
- Position list with type and level filters
- Position form with conditional fields based on type
- Organizational hierarchy tree view
- Position description editor (rich text)
- Reporting structure diagram

**Business Rules**:
- Horizontal positions: Director, Deputy, Assistant Deputy
- Vertical positions: Any position under affairs
- Cannot delete position with active assignments
- Parent position must be from higher level
- Position must map to appropriate organizational unit

**AI Enhancement Suggestions**:
- Add position competency requirements
- Include position succession planning
- Add position workload analysis
- Implement position benchmark comparison
- Add position rotation tracking
- Include certification/qualification requirements

---

#### 5.5 Position Assignment Management
**Features**:
- CRUD operations for position assignments
- User to position mapping with validity period
- Primary position designation (one per user)
- Assignment status tracking (Active, Ended, Suspended)
- Assignment letter documentation
- Assignment history tracking
- Overlap detection and prevention

**UI Components**:
- Assignment list with user and position details
- Assignment form with date validation
- User assignment history timeline
- Position occupancy calendar
- Assignment approval workflow

**Business Rules**:
- User can have multiple positions but only one primary
- Assignment dates cannot overlap for same position
- Cannot assign to inactive position
- Assignment must be within position active period
- Cannot end assignment before start date

**AI Enhancement Suggestions**:
- Add assignment approval workflow
- Include acting/temporary assignment support
- Add assignment effectiveness tracking
- Implement automatic notification before assignment expiry
- Add succession planning integration
- Include assignment cost tracking
- Add skill-position matching recommendations

---

### 6. Organization Diagram View

**Advanced Interactive Features**:
- **Hierarchical Visualization**:
  - Top-down flow: Period → Vision → Mission → Initiatives → Goals → Programs → Activities
  - Side-by-side flow: Organizational structure (Directorate → Work Unit → Affairs → Positions)
  - Cross-linking visualization for mappings
  
- **Interactive Features**:
  - Zoom in/out controls
  - Pan/drag canvas
  - Right-click context menu for CRUD operations:
    - Add child node
    - Edit current node
    - Delete node (with dependency check)
    - View details
    - Duplicate node
    - Export branch
  - Drag-and-drop to reorder/reparent nodes
  - Collapse/expand branches
  - Search and highlight nodes
  - Filter by year, status, organization unit
  
- **Visual Indicators**:
  - Color coding by status (active, completed, cancelled)
  - Size indicating importance/budget
  - Progress bars on nodes
  - Alert icons for issues (missing data, overdue, etc.)
  - Connection line styles (solid, dashed) for different relationship types

- **Export Options**:
  - Export as PNG/SVG image
  - Export as PDF report
  - Export selected branch as JSON
  - Print-optimized view

**Technology Suggestions**:
- Use libraries: D3.js, GoJS, JointJS, or vis.js
- Implement virtual rendering for large datasets
- Add minimap for navigation
- Include node templates for different entity types

**AI Enhancement Suggestions**:
- Add automatic layout optimization
- Implement node clustering for similar items
- Add impact analysis (show downstream effects of changes)
- Include timeline view mode
- Add comparison mode (compare two periods/scenarios)
- Implement AI-powered anomaly detection in structure

---

### 7. Revision & Audit System

**Features to Implement**:
- Automatic revision tracking for all entities
- Before/after comparison popup modal
- Field-level change tracking
- User activity log
- Rollback functionality (restore previous version)
- Change approval workflow for critical fields
- Bulk revision view (see all changes in a period)
- Export revision history as report

**UI Components**:
- Revision history panel (side panel or modal)
- Before/After comparison table with highlighting
- Timeline view of changes
- User filter for revisions
- Date range selector
- Change summary dashboard

**Data to Track**:
- What changed (entity type, ID, field name)
- Old value vs new value
- Who made the change
- When it was changed
- Why it was changed (reason field)
- IP address and user agent (security)

**Popup Modal Structure**:
```
┌─────────────────────────────────────────┐
│ Revision Details - [Entity Name]        │
├─────────────────────────────────────────┤
│ Changed By: John Doe                    │
│ Changed At: 2024-01-15 14:30:45         │
│ Reason: Correcting budget allocation    │
├─────────────────────────────────────────┤
│ Field Name    │ Before    │ After       │
├───────────────┼───────────┼─────────────┤
│ Budget        │ 50000000  │ 75000000    │
│ Status        │ Planning  │ Approved    │
│ End Date      │ 2024-12   │ 2025-03     │
└─────────────────────────────────────────┘
[Restore This Version] [View Full History] [Close]
```

**AI Enhancement Suggestions**:
- Add change impact analysis
- Implement anomaly detection for unusual changes
- Add change pattern analysis
- Include predictive alerts for risky changes
- Add collaborative commenting on revisions
- Implement change request workflow
- Add compliance checking for changes

---

### 8. Strategic Planning Flow Implementation

#### 8.1 Period Management
**Features**:
- CRUD for planning periods (year ranges)
- Single active period enforcement
- Period activation/deactivation
- Period rollover functionality (copy structure to new period)
- Period comparison tools

**UI Components**:
- Period selector dropdown (global)
- Period timeline visualization
- Period activation toggle with confirmation
- Period duplication wizard

**Business Rules**:
- Only one active period at a time
- Start year must be before end year
- Cannot delete period with associated data
- Period codes must be unique

**AI Enhancement Suggestions**:
- Add period performance summary
- Include period-to-period comparison analytics
- Add automatic period archival
- Implement period template system
- Add period health indicators

---

#### 8.2 Vision Management
**Features**:
- One vision per period
- Rich text editor for vision statement
- Vision approval workflow
- Vision history tracking
- Vision alignment scoring

**UI Components**:
- Vision editor (WYSIWYG)
- Vision preview card
- Approval status indicator
- Vision impact dashboard

**Business Rules**:
- Vision must be linked to active period
- Maximum 1000 characters
- Requires approval before missions can be added
- Cannot delete vision with associated missions

**AI Enhancement Suggestions**:
- Add vision clarity scoring (AI analysis)
- Include vision-mission alignment checker
- Add collaborative editing with version control
- Implement vision sentiment analysis
- Add vision benchmarking against industry standards

---

#### 8.3 Mission Management
**Features**:
- Multiple missions per vision
- Mission sequencing/ordering
- Mission approval workflow
- Mission-vision alignment indicator
- Mission breakdown by year

**UI Components**:
- Mission list with drag-and-drop reordering
- Mission form with rich text editor
- Mission-vision relationship diagram
- Year breakdown selector

**Business Rules**:
- Must link to approved vision
- Maximum 1500 characters per mission
- Mission order must be unique within vision
- Cannot delete mission with strategic initiative mappings

**Yearly Breakdown Logic**:
- After mission approval, system creates yearly records
- Each year gets separate tracking for initiatives, goals, etc.
- User selects year context when working on lower-level items

**AI Enhancement Suggestions**:
- Add mission SMART criteria checker
- Include mission feasibility analysis
- Add mission resource estimation
- Implement mission risk assessment
- Add mission dependency mapping

---

#### 8.4 Strategic Initiative Management
**Features**:
- Multiple initiatives per year
- Initiative theme categorization
- Mission-initiative mapping (many-to-many)
- Initiative target tracking
- Budget allocation per initiative
- Initiative status workflow

**UI Components**:
- Initiative list grouped by year and theme
- Initiative form with theme selector
- Mission mapping interface (drag-and-drop or checkboxes)
- Initiative performance dashboard
- Budget vs actual spending chart

**Business Rules**:
- Initiative must be mapped to at least one mission
- Theme code auto-generated: STI-{YEAR}-{NUMBER}
- Budget must be positive number
- Initiative year must be within period range
- Total weight percentage of mission mappings should equal 100%

**AI Enhancement Suggestions**:
- Add initiative prioritization matrix
- Include initiative impact prediction
- Add initiative resource optimization
- Implement initiative risk scoring
- Add initiative benchmarking
- Include strategic fit analysis

---

#### 8.5 Organizational Goal (Sasaran Badan) Management
**Features**:
- Multiple organizational goals per year
- Goal-initiative alignment tracking
- Impact center mapping (one-to-many)
- Work unit responsibility assignment
- Internal/external analysis linking
- Goal status tracking and progress monitoring

**UI Components**:
- Goal list with filters (year, status, work unit)
- Goal form with multi-mapping interface
- Goal dashboard with KPIs
- Goal network diagram (relationships)
- Progress tracking chart

**Impact Center Integration**:
- Create/link impact centers to goals
- Auto-generate IC codes: {YEAR}.IC.{AUTO_NUMBER}
- Monthly progress tracking interface
- Work unit accountability matrix
- Deliverable checklist

**Analysis Integration**:
- SWOT analysis module (Strength, Weakness, Opportunity, Threat)
- Link analysis items to goals
- Analysis impact assessment
- Strategy formulation based on analysis

**Business Rules**:
- Goal must have at least one impact center
- Impact center must be assigned to work unit
- Cannot delete goal with active programs
- IC completion percentage must be 0-100
- Monthly progress required for active ICs

**AI Enhancement Suggestions**:
- Add goal achievability scoring
- Include automated SWOT analysis from data
- Add goal dependency graph
- Implement goal risk heat map
- Add predictive goal achievement analytics
- Include resource sufficiency checker
- Add strategic alignment scoring

---

#### 8.6 Work Unit Goal (Sasaran Unit Kerja) Management
**Features**:
- Multiple work unit goals per organizational goal
- Work unit assignment via searchable dropdown
- KPI mapping and creation
- Program linkage
- Goal cascading visualization

**UI Components**:
- Work unit goal list filtered by directorate/unit
- Goal creation wizard with templates
- KPI association interface
- Goal hierarchy tree view
- Performance scorecard

**KPI Integration**:
- Create organizational KPIs linked to work unit goals
- Auto-generate KPI codes: {YEAR}.KPI.{UNIT_CODE}.{PERSPECTIVE}.{AUTO}
- Define KPI parameters (type, perspective, weight, target)
- Monthly progress tracking
- KPI dashboard with traffic light indicators

**Business Rules**:
- Work unit goal must link to organizational goal
- Work unit must be active
- KPI weights must sum to 100% per goal
- Cannot delete goal with active KPIs or programs
- Monthly KPI reporting required

**AI Enhancement Suggestions**:
- Add goal-KPI alignment checker
- Include KPI recommendation engine
- Add workload balancing across units
- Implement automated KPI target setting
- Add cross-unit goal coordination alerts
- Include KPI trend analysis and forecasting

---

#### 8.7 Program Management
**Features**:
- Multiple programs per work unit goal
- Program-KPI mapping (many-to-many)
- Budget planning and tracking
- Program timeline management (Gantt chart)
- Program status workflow
- Activity aggregation and rollup

**UI Components**:
- Program list with search and filters
- Program form with budget calculator
- Program timeline (Gantt view)
- Program-KPI relationship matrix
- Budget burn rate chart
- Program portfolio dashboard

**Business Rules**:
- Program must link to work unit goal
- Start date must be before end date
- Budget spent cannot exceed allocated budget (warning)
- Cannot delete program with activities
- Program dates must be within period range

**AI Enhancement Suggestions**:
- Add program risk assessment
- Include resource conflict detection
- Add program portfolio optimization
- Implement automated program scheduling
- Add program success prediction
- Include benchmark comparison with similar programs
- Add program dependency management

---

#### 8.8 Activity Management
**Features**:
- Multiple activities per program
- Unit price and quantity calculation
- Automatic cost rollup to program and higher levels
- Activity scheduling with dependencies
- Responsible position assignment
- Activity completion tracking
- Individual KPI linkage

**UI Components**:
- Activity list with program grouping
- Activity form with cost calculator
- Activity Gantt chart with dependencies
- Activity completion checklist
- Cost summary dashboard (activity → program → goal → mission → vision)
- Resource allocation view

**Individual KPI Integration**:
- Map activities to individual KPIs
- Auto-generate individual KPI codes: {YEAR}.KPIINDIVIDU.{UNIT}.{POSITION}.{AUTO}
- Assign KPIs to positions (not specific individuals)
- Monthly progress tracking per individual
- Individual performance dashboard

**Business Rules**:
- Activity must link to active program
- Total cost = unit price × quantity
- Activity dates must be within program dates
- Responsible position must be active
- Cannot delete activity with KPI mappings
- Individual KPI must be assigned to valid position

**Cost Rollup Logic**:
```
Activity Total Cost
  ↓ SUM
Program Budget Spent
  ↓ SUM
Work Unit Goal Cost
  ↓ SUM
Organizational Goal Cost
  ↓ SUM
Mission Cost
  ↓ SUM
Vision Total Budget
```

**AI Enhancement Suggestions**:
- Add activity duration estimation (AI-based)
- Include critical path analysis
- Add resource leveling optimization
- Implement activity risk scoring
- Add activity template library
- Include automated activity sequencing
- Add cost variance alerts
- Implement activity performance prediction

---

#### 8.9 OKR (Objectives and Key Results) Management
**Features**:
- Weekly OKR entry for each individual
- OKR linked to user's assigned position(s)
- Multiple key results per objective (up to 3-5)
- Progress tracking per key result
- Weekly submission and review workflow
- OKR history and trends

**UI Components**:
- Weekly OKR entry form (calendar-based)
- OKR dashboard (current week, month, quarter)
- Progress charts per key result
- OKR review interface (for supervisors)
- OKR history timeline
- Team OKR rollup view

**OKR Structure**:
- Objective: What you want to achieve (qualitative)
- Key Results: How you measure success (quantitative, 3-5 per objective)
- Progress: 0-100% per key result
- Overall Progress: Average of all key results

**Workflow**:
1. User creates OKR at start of week (Monday)
2. User updates progress during week
3. User submits OKR by end of week (Friday)
4. Supervisor reviews and provides feedback
5. System archives and starts new week cycle

**Business Rules**:
- OKR must be submitted weekly
- Week starts Monday, ends Sunday
- One OKR set per user per week
- Progress must be between 0-100%
- Key results must be measurable
- Cannot edit submitted OKR (must create revision)

**AI Enhancement Suggestions**:
- Add OKR quality scoring (SMART criteria)
- Include OKR-KPI alignment checker
- Add OKR achievement prediction
- Implement automated OKR suggestions based on role/activities
- Add peer OKR comparison (anonymized)
- Include OKR coaching tips
- Add OKR aggregation to team/unit level
- Implement OKR trend analysis
- Add automated reminders for OKR submission
- Include OKR template library by role

---

### 9. Dashboard & Reporting Module

#### 9.1 Executive Dashboard
**Widgets to Include**:
- Active period summary
- Vision achievement overview
- Mission completion status
- Strategic initiative progress
- Organizational goal status matrix
- Total budget vs spent (all levels)
- Impact center completion summary
- Top performing work units
- Recent activities
- Upcoming deadlines/milestones

**Filters**:
- Period selector
- Date range
- Directorate/work unit
- Status filters

---

#### 9.2 Impact Center Dashboard
**Features**:
- IC list with completion percentages
- Monthly progress trend chart
- Work unit accountability matrix
- IC performance heat map
- Deliverable status checklist
- Comparative analysis (IC vs IC)
- Export to PDF/Excel

**Visualizations**:
- Progress line chart (monthly)
- Completion gauge charts
- Work unit comparison bar chart
- Status distribution pie chart

---

#### 9.3 KPI Dashboard
**Features**:
- Organizational KPI scorecard
- Traffic light indicators (Red: <70%, Yellow: 70-90%, Green: >90%)
- Trend analysis charts
- KPI comparison (actual vs target)
- Perspective-based grouping
- Work unit performance ranking
- Monthly progress tracking
- KPI achievement forecast

**Filters**:
- Year
- Directorate/work unit
- KPI type
- Perspective
- Status

---

#### 9.4 Individual KPI Dashboard
**Features**:
- Individual performance scorecard
- Position-based KPI list
- Personal KPI trends
- Peer comparison (anonymized)
- Monthly achievement chart
- OKR-KPI alignment view
- Performance improvement suggestions

**Views**:
- My KPIs (current user)
- Team KPIs (supervisor view)
- Unit KPIs (manager view)
- Position KPIs (HR view)

---

#### 9.5 Budget Analysis Dashboard
**Features**:
- Budget allocation by level (vision → mission → goal → program → activity)
- Budget utilization percentage
- Budget variance analysis
- Budget forecasting
- Cost driver analysis
- Budget burn rate
- Budget reallocation simulator

**Visualizations**:
- Sunburst chart (hierarchical budget)
- Waterfall chart (budget breakdown)
- Time-series budget spending
- Budget vs actual comparison

---

#### 9.6 Custom Report Builder
**Features**:
- Drag-and-drop report designer
- Custom field selection
- Multiple data sources
- Custom filters and grouping
- Scheduled report generation
- Report templates library
- Export formats (PDF, Excel, CSV, PowerPoint)

**AI Enhancement Suggestions**:
- Add natural language query interface
- Include automated insight generation
- Add anomaly detection in reports
- Implement predictive analytics
- Add report recommendation engine
- Include interactive drill-down capabilities

---

### 10. Data Management Features

#### 10.1 Dummy Data Generator
**Implementation for Each Module**:

**Functionality**:
- Button: "Generate Dummy Data"
- Popup modal with input field: "Number of records to generate: [___]"
- Validation: minimum 1, maximum 1000
- Progress bar during generation
- Success message with record count

**Data Generation Rules**:
- Maintain referential integrity (FKs must exist)
- Generate realistic data (proper names, dates, values)
- Respect active period constraints
- Create complete hierarchies (parent before child)
- Randomize but keep logical (e.g., end_date > start_date)

**Example Dummy Data**:
- Users: firstname.lastname@company.com, random roles
- Directorates: "Directorate of {Technology/Finance/Operations/HR/Marketing}"
- KPIs: Realistic targets based on type and perspective
- OKRs: Sample objectives and key results

**Code Template**:
```javascript
function generateDummyData(sheetName, recordCount) {
  const data = [];
  for (let i = 0; i < recordCount; i++) {
    data.push(generateRandomRecord(sheetName));
  }
  writeToSheet(sheetName, data);
  return {success: true, count: recordCount};
}
```

---

#### 10.2 Delete Dummy Data
**Functionality**:
- Button: "Delete All Dummy Data"
- Confirmation popup: "Are you sure you want to delete all dummy data? This action cannot be undone."
- Delete in reverse dependency order (child before parent)
- Progress indicator
- Success message with deletion count

**Safety Features**:
- Only delete records created by dummy generator (flag in data)
- Cannot delete if referenced by non-dummy data
- Backup option before deletion
- Deletion log in audit trail

**Code Template**:
```javascript
function deleteDummyData(sheetName) {
  const sheet = getSheet(sheetName);
  const data = sheet.getDataRange().getValues();
  const dummyRows = data.filter(row => row.is_dummy === true);
  deleteRows(sheet, dummyRows);
  return {success: true, count: dummyRows.length};
}
```

---

### 11. Authentication & Authorization

#### Authentication
**Features**:
- Login form (username/email + password)
- Password hashing (use Google Apps Script's Utilities.computeDigest)
- Session management with timeout (30 minutes default)
- Remember me functionality
- Password reset via email
- Account lockout after failed attempts (5 tries)
- Two-factor authentication (optional, via email OTP)

**UI Components**:
- Login page (full-screen)
- Forgot password modal
- Password reset page
- OTP verification modal

---

#### Authorization
**Features**:
- Role-based access control (RBAC)
- Permission checking before every operation
- Frontend permission hiding (hide UI elements)
- Backend permission enforcement (API level)
- Access denied page
- Audit log for security events

**Permission Check Flow**:
1. User attempts action
2. Frontend checks permission (hide/disable if no permission)
3. API call includes user token
4. Backend validates token and checks permission
5. If authorized, proceed; else return 403 Forbidden

**Code Template**:
```javascript
function hasPermission(userId, module, action) {
  const user = getUser(userId);
  const role = getRole(user.role_id);
  const permissions = JSON.parse(role.permissions);
  return permissions[module] && permissions[module][action];
}
```

---

### 12. Search & Filter Features

**Global Search**:
- Search bar in navbar
- Search across all modules (configurable)
- Show results grouped by entity type
- Click result to navigate to detail page
- Recent searches history
- Search suggestions/autocomplete

**Advanced Filters**:
- Filter panel (collapsible sidebar)
- Multiple filter criteria (AND/OR logic)
- Date range pickers
- Status multi-select
- Organizational unit cascading filters
- Saved filter presets
- Clear all filters button

**Searchable Dropdowns**:
- Use Select2 or similar library
- Lazy loading for large datasets (>100 items)
- Type-ahead search
- Multiple selection option
- Clear selection button
- Placeholder text

**Implementation Libraries**:
- Select2 (for searchable dropdowns)
- List.js (for client-side filtering)
- Fuse.js (for fuzzy search)

---

### 13. Export & Import Features

#### Export Features
**Supported Formats**:
- Excel (.xlsx) - with formatting, formulas
- CSV (.csv) - for data import/export
- PDF (.pdf) - for reports, presentation-ready
- PowerPoint (.pptx) - for executive summaries
- JSON (.json) - for data backup/migration

**Export Options**:
- Export current view (filtered data)
- Export all data
- Export template (headers only)
- Scheduled exports (email delivery)

**Excel Export Enhancements**:
- Multiple sheets in one file
- Formatted headers (bold, colored)
- Auto-fit column widths
- Frozen header rows
- Data validation dropdowns
- Conditional formatting (traffic lights, data bars)
- Charts and graphs
- Print-ready layout

---

#### Import Features
**Supported Formats**:
- Excel (.xlsx, .xls)
- CSV (.csv)
- JSON (.json)

**Import Process**:
1. Upload file
2. Map columns to fields (drag-and-drop or dropdown)
3. Preview data (first 10 rows)
4. Validate data (show errors/warnings)
5. Import with options (create new, update existing, skip duplicates)
6. Show import summary (success, errors, warnings)

**Validation Rules**:
- Required fields check
- Data type validation
- Foreign key existence check
- Unique constraint check
- Date format validation
- Range validation (min/max values)

**Error Handling**:
- Show row number and column for each error
- Allow correction and retry
- Option to skip error rows
- Download error report

---

### 14. Notification System

**Notification Types**:
- System notifications (updates, maintenance)
- Task notifications (approvals, deadlines)
- Alert notifications (overdue, budget exceeded)
- Achievement notifications (KPI met, milestone reached)

**Delivery Channels**:
- In-app notifications (bell icon with count badge)
- Email notifications (configurable per user)
- Browser push notifications (if supported)

**Notification Features**:
- Mark as read/unread
- Bulk mark all as read
- Notification filtering
- Notification preferences (per notification type)
- Notification history (last 30 days)
- Click notification to navigate to relevant page

**UI Components**:
- Notification dropdown in navbar
- Notification center page
- Notification settings page
- Toast notifications (temporary popups)

**Auto-Triggers**:
- OKR submission due (every Friday)
- KPI update required (monthly)
- Approval pending (immediate)
- Assignment expiring (7 days before)
- Budget threshold reached (80%, 90%, 100%)
- Goal deadline approaching (7, 3, 1 days before)

---

### 15. API Design

**RESTful API Structure**:
```
Base URL: https://script.google.com/macros/s/{SCRIPT_ID}/exec

Endpoints:
GET    /api/users              - List users
GET    /api/users/:id          - Get user detail
POST   /api/users              - Create user
PUT    /api/users/:id          - Update user
DELETE /api/users/:id          - Delete user

GET    /api/roles              - List roles
POST   /api/roles              - Create role
PUT    /api/roles/:id          - Update role
DELETE /api/roles/:id          - Delete role

GET    /api/directorates       - List directorates
POST   /api/directorates       - Create directorate
PUT    /api/directorates/:id   - Update directorate
DELETE /api/directorates/:id   - Delete directorate

GET    /api/kpis               - List KPIs (with filters)
GET    /api/kpis/:id           - Get KPI detail
POST   /api/kpis               - Create KPI
PUT    /api/kpis/:id           - Update KPI
POST   /api/kpis/:id/progress  - Add monthly progress

GET    /api/okrs               - List OKRs (filtered by user/date)
POST   /api/okrs               - Create/update weekly OKR
GET    /api/okrs/:id           - Get OKR detail

GET    /api/dashboard/executive      - Executive dashboard data
GET    /api/dashboard/kpi            - KPI dashboard data
GET    /api/dashboard/impact-center  - IC dashboard data

... (similar for all modules)
```

**Request Format**:
```json
{
  "token": "user_session_token",
  "action": "create",
  "entity": "user",
  "data": {
    "username": "john.doe",
    "email": "john.doe@company.com",
    "role_id": "role-uuid-123"
  }
}
```

**Response Format**:
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "user_id": "user-uuid-456",
    "username": "john.doe",
    "created_at": "2024-01-15T10:30:00Z"
  },
  "errors": null
}
```

**Error Response**:
```json
{
  "success": false,
  "message": "Validation failed",
  "data": null,
  "errors": [
    {
      "field": "email",
      "message": "Email already exists"
    },
    {
      "field": "password",
      "message": "Password must be at least 8 characters"
    }
  ]
}
```

**Authentication**:
- Include token in request header or body
- Token expires after 30 minutes of inactivity
- Refresh token mechanism
- Logout endpoint to invalidate token

---

### 16. Performance Optimization

**Backend Optimization**:
- Use Google Apps Script caching (CacheService)
- Batch read/write operations to Sheets
- Use SpreadsheetApp.flush() sparingly
- Implement pagination for large datasets
- Use indexes (colored columns or separate index sheet)
- Optimize formulas in sheets
- Use V8 runtime for Apps Script

**Frontend Optimization**:
- Lazy loading for tables (load 50 rows at a time)
- Virtual scrolling for large lists
- Debounce search inputs (300ms delay)
- Cache API responses in localStorage
- Minimize DOM manipulations
- Use event delegation
- Compress assets (minify CSS/JS)
- Implement service worker for offline caching

**Database Optimization**:
- Create separate sheets for large tables
- Use named ranges for frequent lookups
- Implement soft delete (is_deleted flag) instead of hard delete
- Archive old data to separate sheets
- Use formulas instead of scripts where possible

---

### 17. Security Features

**Data Security**:
- Encrypt sensitive fields (passwords, personal data)
- Use HTTPS for all communications
- Sanitize all user inputs (XSS prevention)
- Implement CSRF protection
- SQL injection prevention (parameterized queries equivalent)
- Rate limiting on API calls
- Input validation on both frontend and backend

**Access Security**:
- Role-based access control (RBAC)
- Row-level security (users see only their data)
- Audit trail for all sensitive operations
- Session timeout (30 minutes)
- Account lockout after failed login attempts
- IP whitelisting (optional)
- Two-factor authentication (optional)

**Data Privacy**:
- GDPR compliance features:
  - User data export
  - User data deletion
  - Consent management
  - Privacy policy display
- Anonymize user data in reports
- Data retention policies
- Secure data disposal

---

### 18. Mobile Responsiveness

**Mobile-First Design Principles**:
- Touch-friendly UI elements (minimum 44x44px tap targets)
- Responsive breakpoints:
  - Mobile: < 768px
  - Tablet: 768px - 1024px
  - Desktop: > 1024px
- Collapsible navigation (hamburger menu on mobile)
- Stacked layouts on mobile (vertical scrolling)
- Swipe gestures for navigation
- Mobile-optimized forms (large inputs, native inputs)
- Bottom navigation bar (mobile)

**PWA Features**:
- Installable on home screen
- Offline functionality (service worker)
- Push notifications
- Fast loading (< 3 seconds)
- App-like experience
- Splash screen
- Theme color customization

**Mobile-Specific Features**:
- Pull-to-refresh
- Infinite scroll
- Bottom sheets for modals
- Floating action buttons (FAB)
- Native date/time pickers
- Camera integration (profile photos, evidence upload)
- Geolocation (if needed for field work)

---

### 19. Help & Documentation

**In-App Help**:
- Contextual help tooltips (question mark icons)
- Interactive tutorials (first-time user guide)
- Help center page (searchable knowledge base)
- Video tutorials (embedded YouTube)
- Feature announcements (changelog)
- FAQ section

**Documentation**:
- User manual (PDF export)
- Admin guide
- API documentation
- Developer guide
- Troubleshooting guide

**Support Features**:
- In-app feedback form
- Bug report form (with screenshot attachment)
- Feature request form
- Contact support page
- Live chat integration (optional)

---

### 20. Testing & Quality Assurance

**Testing Requirements**:
- Unit tests for critical functions
- Integration tests for API endpoints
- UI/UX testing (cross-browser)
- Mobile responsiveness testing
- Performance testing (load testing)
- Security testing (penetration testing)
- Accessibility testing (WCAG 2.1 compliance)
- User acceptance testing (UAT)

**Test Data**:
- Use dummy data generator for testing
- Create test user accounts for different roles
- Test edge cases (empty data, large datasets, special characters)
- Test error scenarios (network errors, invalid input, permission errors)

**Quality Metrics**:
- Code coverage (>80%)
- Page load time (<3 seconds)
- API response time (<500ms)
- Error rate (<1%)
- User satisfaction score (>4.5/5)

---

## AI AGENT ENHANCEMENT MANDATE

As the AI agent building this system, you are **REQUIRED** to enhance this specification with:

### 1. **User Experience Improvements**
- Add intuitive workflows and wizards
- Implement smart defaults and auto-fill
- Add helpful error messages and validation feedback
- Include onboarding tutorials and tooltips
- Add keyboard shortcuts for power users
- Implement undo/redo functionality
- Add confirmation dialogs for destructive actions

### 2. **Data Integrity Enhancements**
- Add comprehensive validation rules
- Implement referential integrity checks
- Add data consistency checks (e.g., date ranges, budget totals)
- Implement duplicate detection
- Add data quality scoring
- Include data cleansing tools

### 3. **Business Intelligence Features**
- Add trend analysis and forecasting
- Implement anomaly detection
- Add comparative analytics
- Include what-if analysis tools
- Add automated insights generation
- Implement predictive analytics

### 4. **Workflow Automation**
- Add approval workflows
- Implement email notifications
- Add scheduled reports
- Include automated reminders
- Add task assignment automation
- Implement escalation rules

### 5. **Additional Features to Consider**
- **Collaboration Tools**: Comments, mentions, activity feeds
- **Version Control**: Track document versions, rollback capabilities
- **Templates**: Pre-built templates for common scenarios
- **Integrations**: Email, calendar, file storage integrations
- **Gamification**: Badges, leaderboards for KPI achievement
- **AI Assistant**: Chatbot for help and data queries
- **Advanced Analytics**: Machine learning for predictions
- **Custom Fields**: Allow users to add custom fields to entities
- **Tagging System**: Flexible tagging for categorization
- **Favorites/Bookmarks**: Quick access to frequently used items
- **Bulk Operations**: Bulk edit, delete, export, import
- **Data Lineage**: Track data origin and transformations
- **Compliance Tracking**: Audit readiness, policy compliance
- **Resource Management**: People, budget, equipment allocation
- **Risk Management**: Risk register, risk mitigation tracking
- **Dependency Management**: Predecessor/successor relationships
- **Milestone Tracking**: Key milestones with alerts
- **Variance Analysis**: Plan vs actual comparison
- **Scenario Planning**: Create and compare multiple scenarios
- **Mobile App**: Native mobile application (optional)
- **API for Third-Party Integration**: Allow external systems to integrate

### 6. **Code Quality Requirements**
- Write clean, modular, well-commented code
- Follow naming conventions consistently
- Implement error handling everywhere
- Use design patterns appropriately
- Optimize for performance
- Write reusable functions and components
- Document complex logic
- Include code examples in documentation

### 7. **Documentation Requirements**
For each enhancement you add, document:
- **What**: What feature/field/validation did you add?
- **Why**: Why does this improve the system?
- **How**: How does it work?
- **Impact**: What is the user benefit?

Create a separate "AI Enhancements" document listing all improvements made beyond the original specification.

---

## DEVELOPMENT APPROACH

### Phase 1: Foundation (Week 1-2)
- Set up Google Apps Script project structure
- Implement database schema (Google Sheets setup)
- Create base API framework
- Implement authentication/authorization
- Build basic frontend shell (HTML, CSS, JS)

### Phase 2: Core Modules (Week 3-5)
- User and role management
- Organization configuration (directorates, work units, affairs, positions)
- Position assignments
- Basic CRUD operations for all entities

### Phase 3: Strategic Planning (Week 6-8)
- Period, vision, mission management
- Strategic initiatives
- Organizational goals
- Impact centers with progress tracking
- Work unit goals
- KPI management (organizational and individual)

### Phase 4: Programs & Activities (Week 9-10)
- Program management
- Activity management with cost tracking
- OKR management
- Budget rollup calculations

### Phase 5: Dashboards & Reporting (Week 11-12)
- Executive dashboard
- KPI dashboards (organizational & individual)
- Impact center dashboard
- Budget analysis dashboard
- Custom report builder

### Phase 6: Advanced Features (Week 13-14)
- Organization diagram view (interactive)
- Revision/audit system with popups
- Search and filter enhancements
- Export/import functionality
- Notification system

### Phase 7: Testing & Refinement (Week 15-16)
- Comprehensive testing (functional, performance, security)
- Bug fixes
- UI/UX refinements
- Documentation completion
- User training materials
- Deployment preparation

---

## DELIVERABLES

1. **Fully Functional Web Application**
   - Deployed as Google Apps Script web app
   - PWA-enabled with offline capabilities
   - Mobile-responsive on all devices

2. **Source Code**
   - Well-organized Google Apps Script project
   - Frontend code (HTML, CSS, JavaScript)
   - Complete with inline comments

3. **Database**
   - Pre-configured Google Sheets with all tables
   - Sample data populated
   - Data validation rules set up

4. **Documentation**
   - User manual (PDF)
   - Admin guide (PDF)
   - API documentation (HTML)
   - Developer guide (Markdown)
   - Video tutorials (YouTube links)
   - AI Enhancements document

5. **Setup Scripts**
   - One-click deployment script
   - Database initialization script
   - Dummy data generator
   - Backup/restore scripts

6. **Training Materials**
   - User training presentation (PowerPoint)
   - Quick start guide (PDF)
   - FAQ document
   - Troubleshooting guide

---

## SUCCESS CRITERIA

The application will be considered successful when:

1. ✅ All specified modules are fully functional
2. ✅ All CRUD operations work correctly with validation
3. ✅ Authentication and authorization work as designed
4. ✅ Dashboards display accurate, real-time data
5. ✅ Mobile responsiveness works on all device sizes
6. ✅ Performance: Page loads < 3 seconds, API calls < 500ms
7. ✅ Security: No critical vulnerabilities, data is encrypted
8. ✅ User Experience: Intuitive, easy to navigate, minimal training needed
9. ✅ Data Integrity: No orphaned records, referential integrity maintained
10. ✅ Extensibility: Easy to add new modules or modify existing ones

---

## FINAL NOTES FOR AI AGENT

**Remember**:
- This is a **living specification** - improve it as you build
- **User experience is paramount** - make it intuitive and delightful
- **Data quality matters** - validate everything, prevent bad data
- **Performance is key** - optimize for speed and responsiveness
- **Security is non-negotiable** - protect user data at all costs
- **Think like a product manager** - what would make this product truly great?
- **Document your decisions** - help future developers understand your choices

**Your Mission**:
Build a world-class strategic execution monitoring system that organizations will love to use. Make it so good that users will want to use it every day, not because they have to, but because it makes their work easier and more meaningful.

**Go forth and build something amazing!** 🚀
