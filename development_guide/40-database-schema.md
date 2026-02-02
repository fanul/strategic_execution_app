# Database Schema

## Overview

The Strategic Execution Monitoring system uses **Google Sheets** as its database backend, with 28 interconnected sheets storing all application data. This document provides the complete schema for all tables.

## Database Setup

### Initialization

Run the following function from the Apps Script editor to initialize all sheets:

```javascript
setupCompleteDatabase()
```

This will:
- Create all 28 database sheets with proper headers
- Set up data validation rules
- Create default roles and super admin user
- Configure sheet protection and formatting

### Database Configuration

**Location**: Configured in `Config.gs`

```javascript
DB_CONFIG = {
  SHEET_NAMES: {
    // User Management
    USERS: 'Users',
    ROLES: 'Roles',

    // Organization
    DIRECTORATES: 'Directorates',
    WORK_UNITS: 'WorkUnits',
    AFFAIRS: 'Affairs',
    POSITIONS: 'Positions',
    POSITION_ASSIGNMENTS: 'PositionAssignments',

    // Strategic Planning
    PERIODS: 'Periods',
    VISIONS: 'Visions',
    MISSIONS: 'Missions',
    STRATEGIC_INITIATIVES: 'StrategicInitiatives',
    MISSION_INITIATIVE_MAPPING: 'MissionInitiativeMapping',

    // Goals
    ORGANIZATIONAL_GOALS: 'OrganizationalGoals',
    IMPACT_CENTERS: 'ImpactCenters',
    IC_MONTHLY_PROGRESS: 'ICMonthlyProgress',
    IC_WORK_UNIT_MAPPING: 'ICWorkUnitMapping',
    ANALYSIS_ITEMS: 'AnalysisItems',

    // KPIs
    WORK_UNIT_GOALS: 'WorkUnitGoals',
    KPIS: 'KPIs',
    KPI_MONTHLY_PROGRESS: 'KPIMonthlyProgress',

    // Programs
    PROGRAMS: 'Programs',
    KPI_PROGRAM_MAPPING: 'KPIProgramMapping',
    ACTIVITIES: 'Activities',

    // Individual
    INDIVIDUAL_KPIS: 'IndividualKPIs',
    INDIVIDUAL_KPI_MONTHLY_PROGRESS: 'IndividualKPIMonthlyProgress',
    OKRS: 'OKRs',

    // System
    REVISIONS: 'Revisions',
    APP_SETTINGS: 'AppSettings',
    NOTIFICATIONS: 'Notifications'
  }
}
```

---

## User Management Tables

### 1. Users Table

**Purpose**: Store user account information and authentication data.

**Sheet Name**: `Users`

| Column | Type | Required | Unique | Description |
|--------|------|----------|--------|-------------|
| `user_id` | UUID (PK) | ✅ | ✅ | Primary key, auto-generated |
| `username` | String(50) | ✅ | ✅ | Login username (min 3 chars) |
| `email` | Email(255) | ✅ | ✅ | User email address |
| `password_hash` | String(255) | ✅ | | SHA-256 hashed password |
| `full_name` | String(100) | ✅ | | Full display name |
| `role_id` | UUID (FK) | ✅ | | Foreign key to Roles.role_id |
| `active_from` | Date | ✅ | | Account activation date (default: created_at) |
| `active_until` | Date | | | Account deactivation date (null = forever) |
| `is_active` | Boolean | | | Active status (default: true) |
| `last_login` | DateTime | | | Last successful login timestamp |
| `created_at` | DateTime | ✅ | | Record creation timestamp |
| `created_by` | UUID (FK) | ✅ | | User who created this record |
| `updated_at` | DateTime | ✅ | | Last update timestamp |
| `updated_by` | UUID (FK) | ✅ | | User who last updated |
| `notes` | Text | | | Additional notes |

**Indexes**:
- `username` (unique)
- `email` (unique)
- `is_active` (for active user queries)

**Validations**:
- `username`: Must be alphanumeric with underscores, min 3 characters
- `email`: Valid email format
- `password`: Min 8 characters, must contain uppercase, lowercase, number, special char
- `active_until` must be >= `active_from` if both set

**Relationships**:
- Many-to-One with Roles (`role_id` → Roles.role_id)
- One-to-Many with PositionAssignments (`user_id` → PositionAssignments.user_id)
- One-to-Many with OKRs (`user_id` → OKRs.user_id)

---

### 2. Roles Table

**Purpose**: Define user roles and their permissions.

**Sheet Name**: `Roles`

| Column | Type | Required | Unique | Description |
|--------|------|----------|--------|-------------|
| `role_id` | UUID (PK) | ✅ | ✅ | Primary key |
| `role_name` | String(100) | ✅ | ✅ | Display name (e.g., "Super Admin") |
| `role_code` | String(50) | ✅ | ✅ | Unique code (e.g., "SUPER_ADMIN") |
| `description` | Text | | | Role description |
| `permissions` | JSON | ✅ | | Permission matrix (see format below) |
| `is_system_role` | Boolean | | | Prevents deletion (default: false) |
| `created_at` | DateTime | ✅ | | Creation timestamp |
| `created_by` | UUID (FK) | ✅ | | Creator user ID |
| `updated_at` | DateTime | ✅ | | Update timestamp |
| `updated_by` | UUID (FK) | ✅ | | Updater user ID |

**Permissions JSON Format**:
```json
{
  "users": {"create": true, "read": true, "update": true, "delete": true},
  "roles": {"create": true, "read": true, "update": true, "delete": false},
  "directorates": {"create": true, "read": true, "update": true, "delete": true},
  "work-units": {"create": true, "read": true, "update": true, "delete": true},
  "affairs": {"create": true, "read": true, "update": true, "delete": true},
  "positions": {"create": true, "read": true, "update": true, "delete": true},
  "strategic-plan": {"create": true, "read": true, "update": true, "delete": false},
  "kpi": {"create": true, "read": true, "update": true, "delete": false},
  "okr": {"create": true, "read": true, "update": true, "delete": false},
  "programs": {"create": true, "read": true, "update": true, "delete": false},
  "reports": {"create": false, "read": true, "update": false, "delete": false},
  "settings": {"create": false, "read": true, "update": false, "delete": false}
}
```

**Default Roles**:
1. **Super Admin** (`SUPER_ADMIN`) - All permissions, `is_system_role = true`
2. **Admin** (`ADMIN`) - Most permissions except system settings
3. **Manager** (`MANAGER`) - Read all, edit strategic & KPI
4. **User** (`USER`) - Read own data, edit own OKRs
5. **Viewer** (`VIEWER`) - Read-only access

**Relationships**:
- One-to-Many with Users (`role_id` → Users.role_id)

---

## Organization Tables

### 3. Directorates Table

**Purpose**: Top-level organizational units (e.g., "Directorate of Finance").

**Sheet Name**: `Directorates`

| Column | Type | Required | Unique | Description |
|--------|------|----------|--------|-------------|
| `directorate_id` | UUID (PK) | ✅ | ✅ | Primary key |
| `directorate_code` | String(50) | ✅ | ✅ | Unique code (e.g., "DIR-001") |
| `directorate_name` | String(200) | ✅ | | Directorate name |
| `description` | Text | | | Description |
| `director_position_id` | UUID (FK) | | | Position ID of director |
| `active_from` | Date | ✅ | | Activation date |
| `active_until` | Date | | | Deactivation date |
| `is_active` | Boolean | | | Active status (default: true) |
| `sort_order` | Integer | | | Display order |
| `created_at` | DateTime | ✅ | | Creation timestamp |
| `created_by` | UUID (FK) | ✅ | | Creator |
| `updated_at` | DateTime | ✅ | | Update timestamp |
| `updated_by` | UUID (FK) | ✅ | | Updater |
| `notes` | Text | | | Notes |

**Relationships**:
- One-to-Many with WorkUnits (`directorate_id` → WorkUnits.directorate_id)
- Optional Many-to-One with Positions (`director_position_id` → Positions.position_id)

---

### 4. WorkUnits Table

**Purpose**: Second-level units under directorates (e.g., "Accounting Department").

**Sheet Name**: `WorkUnits`

| Column | Type | Required | Unique | Description |
|--------|------|----------|--------|-------------|
| `work_unit_id` | UUID (PK) | ✅ | ✅ | Primary key |
| `directorate_id` | UUID (FK) | ✅ | | Parent directorate |
| `work_unit_code` | String(50) | ✅ | ✅ | Unique code (e.g., "WU-001") |
| `work_unit_name` | String(200) | ✅ | | Work unit name |
| `description` | Text | | | Description |
| `deputy_position_id` | UUID (FK) | | | Deputy position |
| `active_from` | Date | ✅ | | Activation date |
| `active_until` | Date | | | Deactivation date |
| `is_active` | Boolean | | | Active status |
| `sort_order` | Integer | | | Display order |
| `created_at` | DateTime | ✅ | | Creation |
| `created_by` | UUID (FK) | ✅ | | Creator |
| `updated_at` | DateTime | ✅ | | Update |
| `updated_by` | UUID (FK) | ✅ | | Updater |
| `notes` | Text | | | Notes |

**Relationships**:
- Many-to-One with Directorates (`directorate_id` → Directorates.directorate_id)
- One-to-Many with Affairs (`work_unit_id` → Affairs.work_unit_id)
- One-to-Many with Positions (`work_unit_id` → Positions.work_unit_id)
- Optional Many-to-One with Positions (`deputy_position_id` → Positions.position_id)

---

### 5. Affairs Table

**Purpose**: Third-level units under work units (e.g., "Budget Planning").

**Sheet Name**: `Affairs`

| Column | Type | Required | Unique | Description |
|--------|------|----------|--------|-------------|
| `affair_id` | UUID (PK) | ✅ | ✅ | Primary key |
| `work_unit_id` | UUID (FK) | ✅ | | Parent work unit |
| `affair_code` | String(50) | ✅ | ✅ | Unique code (e.g., "AFF-001") |
| `affair_name` | String(200) | ✅ | | Affair name |
| `description` | Text | | | Description |
| `assistant_deputy_position_id` | UUID (FK) | | | Assistant deputy |
| `active_from` | Date | ✅ | | Activation |
| `active_until` | Date | | | Deactivation |
| `is_active` | Boolean | | | Active status |
| `sort_order` | Integer | | | Display order |
| `created_at` | DateTime | ✅ | | Creation |
| `created_by` | UUID (FK) | ✅ | | Creator |
| `updated_at` | DateTime | ✅ | | Update |
| `updated_by` | UUID (FK) | ✅ | | Updater |
| `notes` | Text | | | Notes |

**Relationships**:
- Many-to-One with WorkUnits (`work_unit_id` → WorkUnits.work_unit_id)
- One-to-Many with Positions (`affair_id` → Positions.affair_id)
- Optional Many-to-One with Positions (`assistant_deputy_position_id` → Positions.position_id)

---

### 6. Positions Table

**Purpose**: Job positions that can be assigned to users.

**Sheet Name**: `Positions`

| Column | Type | Required | Unique | Description |
|--------|------|----------|--------|-------------|
| `position_id` | UUID (PK) | ✅ | ✅ | Primary key |
| `position_code` | String(50) | ✅ | ✅ | Unique code (e.g., "POS-001") |
| `position_name` | String(200) | ✅ | | Position title |
| `position_type` | Enum | ✅ | | HORIZONTAL, VERTICAL |
| `position_level` | Enum | ✅ | | EXECUTIVE, DIRECTOR, MANAGER, SUPERVISOR, STAFF, TRAINEE |
| `parent_position_id` | UUID (FK) | | | Parent position (for hierarchy) |
| `directorate_id` | UUID (FK) | | | Directorate assignment |
| `work_unit_id` | UUID (FK) | | | Work unit assignment |
| `affair_id` | UUID (FK) | | | Affair assignment |
| `description` | Text | | | Job description |
| `responsibilities` | Text | | | Responsibilities list |
| `active_from` | Date | ✅ | | Activation |
| `active_until` | Date | | | Deactivation |
| `is_active` | Boolean | | | Active status |
| `sort_order` | Integer | | | Display order |
| `created_at` | DateTime | ✅ | | Creation |
| `created_by` | UUID (FK) | ✅ | | Creator |
| `updated_at` | DateTime | ✅ | | Update |
| `updated_by` | UUID (FK) | ✅ | | Updater |
| `notes` | Text | | | Notes |

**Position Types**:
- `HORIZONTAL`: Director, Deputy, Assistant Deputy positions
- `VERTICAL`: Staff positions under affairs

**Relationships**:
- Optional Many-to-One with Directorates (`directorate_id` → Directorates.directorate_id)
- Optional Many-to-One with WorkUnits (`work_unit_id` → WorkUnits.work_unit_id)
- Optional Many-to-One with Affairs (`affair_id` → Affairs.affair_id)
- Optional Many-to-One with Positions (self, `parent_position_id` → Positions.position_id)
- One-to-Many with PositionAssignments (`position_id` → PositionAssignments.position_id)

---

### 7. PositionAssignments Table

**Purpose**: Assign users to positions with validity tracking.

**Sheet Name**: `PositionAssignments`

| Column | Type | Required | Unique | Description |
|--------|------|----------|--------|-------------|
| `assignment_id` | UUID (PK) | ✅ | ✅ | Primary key |
| `user_id` | UUID (FK) | ✅ | | Assigned user |
| `position_id` | UUID (FK) | ✅ | | Assigned position |
| `assignment_date` | Date | ✅ | | Assignment date |
| `start_date` | Date | ✅ | | Assignment start |
| `end_date` | Date | | | Assignment end (null = ongoing) |
| `is_primary` | Boolean | | | Primary position (one per user) |
| `assignment_status` | Enum | ✅ | | ACTIVE, ENDED, SUSPENDED, ON_LEAVE |
| `assignment_letter_number` | String(100) | | | Official letter reference |
| `created_at` | DateTime | ✅ | | Creation |
| `created_by` | UUID (FK) | ✅ | | Creator |
| `updated_at` | DateTime | ✅ | | Update |
| `updated_by` | UUID (FK) | ✅ | | Updater |
| `notes` | Text | | | Notes |

**Relationships**:
- Many-to-One with Users (`user_id` → Users.user_id)
- Many-to-One with Positions (`position_id` → Positions.position_id)

---

## Strategic Planning Tables

### 8. Periods Table

**Purpose**: Strategic planning periods (year ranges).

**Sheet Name**: `Periods`

| Column | Type | Required | Unique | Description |
|--------|------|----------|--------|-------------|
| `period_id` | UUID (PK) | ✅ | ✅ | Primary key |
| `period_code` | String(50) | ✅ | ✅ | Period code (e.g., "2024-2029") |
| `start_year` | Integer | ✅ | | Start year (4-digit) |
| `end_year` | Integer | ✅ | | End year (4-digit) |
| `description` | Text | | | Description |
| `is_active` | Boolean | | | Active period (only one true) |
| `created_at` | DateTime | ✅ | | Creation |
| `created_by` | UUID (FK) | ✅ | | Creator |
| `updated_at` | DateTime | ✅ | | Update |
| `updated_by` | UUID (FK) | ✅ | | Updater |
| `notes` | Text | | | Notes |

**Business Rules**:
- Only one period can have `is_active = true`
- `end_year` must be > `start_year`

---

### 9. Visions Table

**Purpose**: Vision statements per period.

**Sheet Name**: `Visions`

| Column | Type | Required | Unique | Description |
|--------|------|----------|--------|-------------|
| `vision_id` | UUID (PK) | ✅ | ✅ | Primary key |
| `period_id` | UUID (FK) | ✅ | | Strategic period |
| `vision_code` | String(50) | ✅ | ✅ | Code (e.g., "VIS-2024-001") |
| `vision_text` | Text(1000) | ✅ | | Vision statement |
| `description` | Text | | | Description |
| `created_at` | DateTime | ✅ | | Creation |
| `created_by` | UUID (FK) | ✅ | | Creator |
| `updated_at` | DateTime | ✅ | | Update |
| `updated_by` | UUID (FK) | ✅ | | Updater |
| `approval_status` | Enum | | | DRAFT, SUBMITTED, APPROVED, REJECTED |
| `approved_by` | UUID (FK) | | | Approver |
| `approved_at` | DateTime | | | Approval timestamp |
| `notes` | Text | | | Notes |

---

### 10. Missions Table

**Purpose**: Mission statements under visions.

**Sheet Name**: `Missions`

| Column | Type | Required | Unique | Description |
|--------|------|----------|--------|-------------|
| `mission_id` | UUID (PK) | ✅ | ✅ | Primary key |
| `vision_id` | UUID (FK) | ✅ | | Parent vision |
| `mission_code` | String(50) | ✅ | ✅ | Code (e.g., "MIS-2024-001") |
| `mission_text` | Text(1500) | ✅ | | Mission statement |
| `mission_order` | Integer | | | Sequencing order |
| `description` | Text | | | Description |
| `created_at` | DateTime | ✅ | | Creation |
| `created_by` | UUID (FK) | ✅ | | Creator |
| `updated_at` | DateTime | ✅ | | Update |
| `updated_by` | UUID (FK) | ✅ | | Updater |
| `approval_status` | Enum | | | DRAFT, SUBMITTED, APPROVED, REJECTED |
| `approved_by` | UUID (FK) | | | Approver |
| `approved_at` | DateTime | | | Approval |
| `notes` | Text | | | Notes |

---

### 11. StrategicInitiatives Table

**Purpose**: Strategic initiative themes by year.

**Sheet Name**: `StrategicInitiatives`

| Column | Type | Required | Unique | Description |
|--------|------|----------|--------|-------------|
| `initiative_id` | UUID (PK) | ✅ | ✅ | Primary key |
| `year` | Integer | ✅ | | 4-digit year |
| `theme_code` | String(50) | ✅ | ✅ | Code (e.g., "STI-2024-001") |
| `theme_name` | String(200) | ✅ | | Theme name |
| `target_description` | Text | | | Target description |
| `description` | Text | | | Full description |
| `budget_allocated` | Decimal | | | Allocated budget |
| `created_at` | DateTime | ✅ | | Creation |
| `created_by` | UUID (FK) | ✅ | | Creator |
| `updated_at` | DateTime | ✅ | | Update |
| `updated_by` | UUID (FK) | ✅ | | Updater |
| `status` | Enum | | | PLANNING, ONGOING, COMPLETED, CANCELLED |
| `notes` | Text | | | Notes |

---

### 12. MissionInitiativeMapping Table

**Purpose**: Many-to-many relationship between missions and initiatives.

**Sheet Name**: `MissionInitiativeMapping`

| Column | Type | Required | Unique | Description |
|--------|------|----------|--------|-------------|
| `mapping_id` | UUID (PK) | ✅ | ✅ | Primary key |
| `mission_id` | UUID (FK) | ✅ | | Mission |
| `initiative_id` | UUID (FK) | ✅ | | Strategic initiative |
| `relationship_type` | String(100) | | | Relationship type |
| `weight_percentage` | Decimal | | | Contribution weight |
| `created_at` | DateTime | ✅ | | Creation |
| `created_by` | UUID (FK) | ✅ | | Creator |
| `notes` | Text | | | Notes |

---

## Goals Tables

### 13. OrganizationalGoals Table

**Purpose**: Organizational-level goals per year.

**Sheet Name**: `OrganizationalGoals`

| Column | Type | Required | Unique | Description |
|--------|------|----------|--------|-------------|
| `goal_id` | UUID (PK) | ✅ | ✅ | Primary key |
| `year` | Integer | ✅ | | 4-digit year |
| `goal_code` | String(50) | ✅ | ✅ | Code (e.g., "SB-2024-001") |
| `goal_name` | String(200) | ✅ | | Goal name |
| `goal_description` | Text | | | Description |
| `target_description` | Text | | | Target |
| `created_at` | DateTime | ✅ | | Creation |
| `created_by` | UUID (FK) | ✅ | | Creator |
| `updated_at` | DateTime | ✅ | | Update |
| `updated_by` | UUID (FK) | ✅ | | Updater |
| `status` | Enum | | | PLANNING, ONGOING, COMPLETED, CANCELLED |
| `notes` | Text | | | Notes |

---

### 14. ImpactCenters Table

**Purpose**: Impact centers (IC) for measuring goal achievement.

**Sheet Name**: `ImpactCenters`

| Column | Type | Required | Unique | Description |
|--------|------|----------|--------|-------------|
| `ic_id` | UUID (PK) | ✅ | ✅ | Primary key |
| `goal_id` | UUID (FK) | ✅ | | Parent goal |
| `ic_code` | String(50) | ✅ | ✅ | Code (e.g., "2024.IC.001") |
| `ic_name` | String(200) | ✅ | | IC name |
| `description` | Text | | | Description |
| `formula` | Text | | | Calculation formula |
| `deliverable` | Text | ✅ | | Deliverable description |
| `completion_percentage` | Decimal | | | Completion % (0-100) |
| `baseline_value` | Decimal | | | Baseline |
| `target_value` | Decimal | | | Target |
| `created_at` | DateTime | ✅ | | Creation |
| `created_by` | UUID (FK) | ✅ | | Creator |
| `updated_at` | DateTime | ✅ | | Update |
| `updated_by` | UUID (FK) | ✅ | | Updater |
| `status` | Enum | | | Status |
| `notes` | Text | | | Notes |

---

### 15. ICMonthlyProgress Table

**Purpose**: Monthly progress tracking for impact centers.

**Sheet Name**: `ICMonthlyProgress`

| Column | Type | Required | Unique | Description |
|--------|------|----------|--------|-------------|
| `progress_id` | UUID (PK) | ✅ | ✅ | Primary key |
| `ic_id` | UUID (FK) | ✅ | | Impact center |
| `year` | Integer | ✅ | | Year |
| `month` | Integer(1-12) | ✅ | | Month |
| `completion_percentage` | Decimal | ✅ | | Completion % (0-100) |
| `actual_value` | Decimal | | | Actual value |
| `notes` | Text | | | Notes |
| `evidence_url` | String(500) | | | Evidence link |
| `reported_by` | UUID (FK) | ✅ | | Reporter |
| `reported_at` | DateTime | ✅ | | Report timestamp |
| `verified_by` | UUID (FK) | | | Verifier |
| `verified_at` | DateTime | | | Verification |
| `status` | Enum | | | DRAFT, SUBMITTED, VERIFIED, REJECTED |

---

### 16. ICWorkUnitMapping Table

**Purpose**: Assign work units to impact centers.

**Sheet Name**: `ICWorkUnitMapping`

| Column | Type | Required | Unique | Description |
|--------|------|----------|--------|-------------|
| `mapping_id` | UUID (PK) | ✅ | ✅ | Primary key |
| `ic_id` | UUID (FK) | ✅ | | Impact center |
| `work_unit_id` | UUID (FK) | ✅ | | Work unit |
| `responsibility_level` | Enum | | | PRIMARY, SUPPORTING, INFORMED |
| `weight_percentage` | Decimal | | | Responsibility weight |
| `created_at` | DateTime | ✅ | | Creation |
| `created_by` | UUID (FK) | ✅ | | Creator |
| `notes` | Text | | | Notes |

---

### 17. AnalysisItems Table

**Purpose**: SWOT analysis items (Strengths, Weaknesses, Opportunities, Threats).

**Sheet Name**: `AnalysisItems`

| Column | Type | Required | Unique | Description |
|--------|------|----------|--------|-------------|
| `analysis_id` | UUID (PK) | ✅ | ✅ | Primary key |
| `goal_id` | UUID (FK) | ✅ | | Related goal |
| `analysis_type` | Enum | ✅ | | INTERNAL, EXTERNAL |
| `analysis_category` | Enum | ✅ | | STRENGTH, WEAKNESS, OPPORTUNITY, THREAT |
| `analysis_code` | String(50) | ✅ | ✅ | Code (e.g., "ANL-INT-001") |
| `title` | String(200) | ✅ | | Title |
| `description` | Text | ✅ | | Description |
| `impact_level` | Enum | | | HIGH, MEDIUM, LOW |
| `priority` | Enum | | | HIGH, MEDIUM, LOW |
| `created_at` | DateTime | ✅ | | Creation |
| `created_by` | UUID (FK) | ✅ | | Creator |
| `updated_at` | DateTime | ✅ | | Update |
| `updated_by` | UUID (FK) | ✅ | | Updater |
| `notes` | Text | | | Notes |

---

## KPI Tables

### 18. WorkUnitGoals Table

**Purpose**: Work unit goals linked to organizational goals.

**Sheet Name**: `WorkUnitGoals`

| Column | Type | Required | Unique | Description |
|--------|------|----------|--------|-------------|
| `work_unit_goal_id` | UUID (PK) | ✅ | ✅ | Primary key |
| `goal_id` | UUID (FK) | ✅ | | Parent organizational goal |
| `work_unit_id` | UUID (FK) | ✅ | | Work unit |
| `goal_code` | String(50) | ✅ | ✅ | Code (e.g., "SUK-2024-001") |
| `goal_name` | String(200) | ✅ | | Goal name |
| `goal_description` | Text | | | Description |
| `target_description` | Text | | | Target |
| `created_at` | DateTime | ✅ | | Creation |
| `created_by` | UUID (FK) | ✅ | | Creator |
| `updated_at` | DateTime | ✅ | | Update |
| `updated_by` | UUID (FK) | ✅ | | Updater |
| `status` | Enum | | | Status |
| `notes` | Text | | | Notes |

---

### 19. KPIs Table

**Purpose**: Organizational KPIs linked to work unit goals.

**Sheet Name**: `KPIs`

| Column | Type | Required | Unique | Description |
|--------|------|----------|--------|-------------|
| `kpi_id` | UUID (PK) | ✅ | ✅ | Primary key |
| `work_unit_goal_id` | UUID (FK) | ✅ | | Parent work unit goal |
| `kpi_code` | String(50) | ✅ | ✅ | Code (e.g., "2026.KPI.DIR001.FIN.001") |
| `year` | Integer | ✅ | | Year |
| `directorate_id` | UUID (FK) | ✅ | | Directorate |
| `work_unit_id` | UUID (FK) | ✅ | | Work unit |
| `kpi_type` | Enum | ✅ | | OUTCOME, OUTPUT, INPUT, PROCESS |
| `perspective` | Enum | ✅ | | FINANCIAL, CUSTOMER, INTERNAL_PROCESS, LEARNING_GROWTH |
| `goal_id` | UUID (FK) | | | Organizational goal |
| `kpi_name` | String(200) | ✅ | | KPI name |
| `weight_percentage` | Decimal | ✅ | | Weight (0-100) |
| `target_value` | Decimal | ✅ | | Target |
| `unit_of_measurement` | String(50) | ✅ | | Unit |
| `assessment_type` | Enum | ✅ | | QUANTITATIVE, QUALITATIVE |
| `calculation_type` | Enum | ✅ | | CUMULATIVE, AVERAGE, MAXIMUM, MINIMUM, LATEST |
| `glossary` | Text | | | Definition |
| `is_derived_kpi` | Boolean | | | Derived from other KPIs |
| `parent_kpi_id` | UUID (FK) | | | Parent KPI (if derived) |
| `maximum_limit` | Decimal | | | Maximum value |
| `measurement_period` | Enum | ✅ | | MONTHLY, QUARTERLY, ANNUALLY |
| `baseline_value` | Decimal | | | Baseline |
| `created_at` | DateTime | ✅ | | Creation |
| `created_by` | UUID (FK) | ✅ | | Creator |
| `updated_at` | DateTime | ✅ | | Update |
| `updated_by` | UUID (FK) | ✅ | | Updater |
| `status` | Enum | | | Status |
| `notes` | Text | | | Notes |

---

### 20. KPIMonthlyProgress Table

**Purpose**: Monthly KPI progress tracking.

**Sheet Name**: `KPIMonthlyProgress`

| Column | Type | Required | Unique | Description |
|--------|------|----------|--------|-------------|
| `progress_id` | UUID (PK) | ✅ | ✅ | Primary key |
| `kpi_id` | UUID (FK) | ✅ | | KPI |
| `year` | Integer | ✅ | | Year |
| `month` | Integer(1-12) | ✅ | | Month |
| `actual_value` | Decimal | ✅ | | Actual value |
| `achievement_percentage` | Decimal | | | Achievement % |
| `notes` | Text | | | Notes |
| `evidence_url` | String(500) | | | Evidence |
| `reported_by` | UUID (FK) | ✅ | | Reporter |
| `reported_at` | DateTime | ✅ | | Report time |
| `verified_by` | UUID (FK) | | | Verifier |
| `verified_at` | DateTime | | | Verification |
| `status` | Enum | | | DRAFT, SUBMITTED, VERIFIED, REJECTED |

---

## Program Tables

### 21. Programs Table

**Purpose**: Programs linked to work unit goals.

**Sheet Name**: `Programs`

| Column | Type | Required | Unique | Description |
|--------|------|----------|--------|-------------|
| `program_id` | UUID (PK) | ✅ | ✅ | Primary key |
| `work_unit_goal_id` | UUID (FK) | ✅ | | Parent work unit goal |
| `program_code` | String(50) | ✅ | ✅ | Code (e.g., "PRG-2024-001") |
| `program_name` | String(200) | ✅ | | Program name |
| `program_description` | Text | | | Description |
| `start_date` | Date | | | Start date |
| `end_date` | Date | | | End date |
| `budget_allocated` | Decimal | | | Allocated budget |
| `budget_spent` | Decimal | | | Spent budget (calculated) |
| `created_at` | DateTime | ✅ | | Creation |
| `created_by` | UUID (FK) | ✅ | | Creator |
| `updated_at` | DateTime | ✅ | | Update |
| `updated_by` | UUID (FK) | ✅ | | Updater |
| `status` | Enum | | | Status |
| `notes` | Text | | | Notes |

---

### 22. KPIProgramMapping Table

**Purpose**: Link KPIs to programs.

**Sheet Name**: `KPIProgramMapping`

| Column | Type | Required | Unique | Description |
|--------|------|----------|--------|-------------|
| `mapping_id` | UUID (PK) | ✅ | ✅ | Primary key |
| `kpi_id` | UUID (FK) | ✅ | | KPI |
| `program_id` | UUID (FK) | ✅ | | Program |
| `contribution_weight` | Decimal | | | Contribution weight |
| `created_at` | DateTime | ✅ | | Creation |
| `created_by` | UUID (FK) | ✅ | | Creator |
| `notes` | Text | | | Notes |

---

### 23. Activities Table

**Purpose**: Activities within programs.

**Sheet Name**: `Activities`

| Column | Type | Required | Unique | Description |
|--------|------|----------|--------|-------------|
| `activity_id` | UUID (PK) | ✅ | ✅ | Primary key |
| `program_id` | UUID (FK) | ✅ | | Parent program |
| `activity_code` | String(50) | ✅ | ✅ | Code (e.g., "ACT-2024-001") |
| `activity_name` | String(200) | ✅ | | Activity name |
| `activity_description` | Text | | | Description |
| `unit_price` | Decimal | ✅ | | Unit price |
| `quantity` | Decimal | ✅ | | Quantity |
| `total_cost` | Decimal | | | Total cost (price × quantity) |
| `unit_of_measurement` | String(50) | | | Unit |
| `start_date` | Date | | | Start |
| `end_date` | Date | | | End |
| `responsible_position_id` | UUID (FK) | | | Responsible position |
| `created_at` | DateTime | ✅ | | Creation |
| `created_by` | UUID (FK) | ✅ | | Creator |
| `updated_at` | DateTime | ✅ | | Update |
| `updated_by` | UUID (FK) | ✅ | | Updater |
| `status` | Enum | | | Status |
| `completion_percentage` | Decimal | | | Completion % (0-100) |
| `notes` | Text | | | Notes |

---

## Individual Tables

### 24. IndividualKPIs Table

**Purpose**: Individual KPIs assigned to positions.

**Sheet Name**: `IndividualKPIs`

| Column | Type | Required | Unique | Description |
|--------|------|----------|--------|-------------|
| `individual_kpi_id` | UUID (PK) | ✅ | ✅ | Primary key |
| `activity_id` | UUID (FK) | | | Related activity |
| `kpi_code` | String(50) | ✅ | ✅ | Code (e.g., "2026.KPIINDIVIDU.DIR001.POS001.001") |
| `year` | Integer | ✅ | | Year |
| `directorate_id` | UUID (FK) | ✅ | | Directorate |
| `work_unit_id` | UUID (FK) | ✅ | | Work unit |
| `position_id` | UUID (FK) | ✅ | | Position |
| `kpi_type` | Enum | ✅ | | OUTCOME, OUTPUT, INPUT, PROCESS |
| `perspective` | Enum | ✅ | | FINANCIAL, CUSTOMER, INTERNAL_PROCESS, LEARNING_GROWTH |
| `goal_id` | UUID (FK) | | | Organizational goal |
| `kpi_name` | String(200) | ✅ | | KPI name |
| `weight_percentage` | Decimal | ✅ | | Weight (0-100) |
| `target_value` | Decimal | ✅ | | Target |
| `unit_of_measurement` | String(50) | ✅ | | Unit |
| `assessment_type` | Enum | ✅ | | QUANTITATIVE, QUALITATIVE |
| `calculation_type` | Enum | ✅ | | CUMULATIVE, AVERAGE, MAXIMUM, MINIMUM, LATEST |
| `glossary` | Text | | | Definition |
| `is_derived_kpi` | Boolean | | | Derived |
| `parent_kpi_id` | UUID (FK) | | | Parent |
| `maximum_limit` | Decimal | | | Maximum |
| `measurement_period` | Enum | ✅ | | WEEKLY, MONTHLY, QUARTERLY, ANNUALLY |
| `baseline_value` | Decimal | | | Baseline |
| `created_at` | DateTime | ✅ | | Creation |
| `created_by` | UUID (FK) | ✅ | | Creator |
| `updated_at` | DateTime | ✅ | | Update |
| `updated_by` | UUID (FK) | ✅ | | Updater |
| `status` | Enum | | | Status |
| `notes` | Text | | | Notes |

---

### 25. IndividualKPIMonthlyProgress Table

**Purpose**: Monthly progress for individual KPIs.

**Sheet Name**: `IndividualKPIMonthlyProgress`

| Column | Type | Required | Unique | Description |
|--------|------|----------|--------|-------------|
| `progress_id` | UUID (PK) | ✅ | ✅ | Primary key |
| `individual_kpi_id` | UUID (FK) | ✅ | | Individual KPI |
| `year` | Integer | ✅ | | Year |
| `month` | Integer(1-12) | ✅ | | Month |
| `actual_value` | Decimal | ✅ | | Actual |
| `achievement_percentage` | Decimal | | | Achievement % |
| `notes` | Text | | | Notes |
| `evidence_url` | String(500) | | | Evidence |
| `reported_by` | UUID (FK) | ✅ | | Reporter |
| `reported_at` | DateTime | ✅ | | Report time |
| `verified_by` | UUID (FK) | | | Verifier |
| `verified_at` | DateTime | | | Verification |
| `status` | Enum | | | DRAFT, SUBMITTED, VERIFIED, REJECTED |

---

### 26. OKRs Table

**Purpose**: Weekly Objectives and Key Results for individuals.

**Sheet Name**: `OKRs`

| Column | Type | Required | Unique | Description |
|--------|------|----------|--------|-------------|
| `okr_id` | UUID (PK) | ✅ | ✅ | Primary key |
| `user_id` | UUID (FK) | ✅ | | User |
| `position_id` | UUID (FK) | ✅ | | Position |
| `year` | Integer | ✅ | | Year |
| `quarter` | Integer(1-4) | ✅ | | Quarter |
| `week_number` | Integer(1-53) | ✅ | | Week number |
| `week_start_date` | Date | ✅ | | Week start (Monday) |
| `week_end_date` | Date | ✅ | | Week end (Sunday) |
| `objective_text` | Text | ✅ | | Objective |
| `key_result_1` | Text | ✅ | | Key result 1 |
| `key_result_1_progress` | Decimal | | | KR1 progress (0-100) |
| `key_result_2` | Text | | | Key result 2 |
| `key_result_2_progress` | Decimal | | | KR2 progress |
| `key_result_3` | Text | | | Key result 3 |
| `key_result_3_progress` | Decimal | | | KR3 progress |
| `overall_progress` | Decimal | | | Overall progress |
| `challenges` | Text | | | Challenges faced |
| `support_needed` | Text | | | Support needed |
| `created_at` | DateTime | ✅ | | Creation |
| `updated_at` | DateTime | ✅ | | Update |
| `submitted_at` | DateTime | | | Submission |
| `reviewed_by` | UUID (FK) | | | Reviewer |
| `reviewed_at` | DateTime | | | Review time |
| `review_notes` | Text | | | Review notes |
| `status` | Enum | | | DRAFT, SUBMITTED, REVIEWED, APPROVED |
| `notes` | Text | | | Notes |

---

## System Tables

### 27. Revisions Table

**Purpose**: Audit trail for all entity changes.

**Sheet Name**: `Revisions`

| Column | Type | Required | Unique | Description |
|--------|------|----------|--------|-------------|
| `revision_id` | UUID (PK) | ✅ | ✅ | Primary key |
| `entity_type` | String(50) | ✅ | | Table/entity name |
| `entity_id` | UUID | ✅ | | Entity record ID |
| `field_name` | String(100) | ✅ | | Field changed |
| `old_value` | JSON | | | Previous value |
| `new_value` | JSON | | | New value |
| `change_type` | Enum | ✅ | | CREATE, UPDATE, DELETE, RESTORE |
| `changed_by` | UUID (FK) | ✅ | | User who made change |
| `changed_at` | DateTime | ✅ | | Change timestamp |
| `reason` | Text | | | Reason for change |
| `ip_address` | String(50) | | | IP address |
| `user_agent` | String(500) | | | Browser/client info |

**Change Types**:
- `CREATE`: New record created
- `UPDATE`: Field value updated
- `DELETE`: Record deleted
- `RESTORE`: Record restored from deletion

---

### 28. AppSettings Table

**Purpose**: Application configuration settings.

**Sheet Name**: `AppSettings`

| Column | Type | Required | Unique | Description |
|--------|------|----------|--------|-------------|
| `setting_id` | UUID (PK) | ✅ | ✅ | Primary key |
| `setting_key` | String(100) | ✅ | ✅ | Setting key |
| `setting_value` | JSON | ✅ | | Setting value |
| `setting_category` | String(50) | | | SYSTEM, EMAIL, NOTIFICATION |
| `description` | Text | | | Description |
| `is_editable` | Boolean | | | Can be edited |
| `updated_by` | UUID (FK) | | | Last updater |
| `updated_at` | DateTime | | | Update time |

---

### 29. Notifications Table

**Purpose**: User notifications and alerts.

**Sheet Name**: `Notifications`

| Column | Type | Required | Unique | Description |
|--------|------|----------|--------|-------------|
| `notification_id` | UUID (PK) | ✅ | ✅ | Primary key |
| `user_id` | UUID (FK) | | | Target user (null = broadcast) |
| `notification_type` | Enum | ✅ | | INFO, WARNING, SUCCESS, ERROR |
| `title` | String(200) | ✅ | | Title |
| `message` | Text | ✅ | | Message |
| `link_url` | String(500) | | | Action link |
| `is_read` | Boolean | | | Read status (default: false) |
| `read_at` | DateTime | | | Read timestamp |
| `created_at` | DateTime | ✅ | | Creation |
| `expires_at` | DateTime | | | Expiry |
| `priority` | Enum | | | HIGH, MEDIUM, LOW |

---

## Enumerations Reference

### Position Types
- `HORIZONTAL` - Director, Deputy, Assistant Deputy
- `VERTICAL` - Staff positions under affairs

### Position Levels
- `EXECUTIVE` - C-level executives
- `DIRECTOR` - Directorate heads
- `MANAGER` - Work unit heads
- `SUPERVISOR` - Team leaders
- `STAFF` - Regular staff
- `TRAINEE` - Trainees/interns

### KPI Types
- `OUTCOME` - End results
- `OUTPUT` - Deliverables
- `INPUT` - Resources
- `PROCESS` - Efficiency metrics

### KPI Perspectives (Balanced Scorecard)
- `FINANCIAL` - Financial performance
- `CUSTOMER` - Customer satisfaction
- `INTERNAL_PROCESS` - Internal operations
- `LEARNING_GROWTH` - Learning and development

### Assessment Types
- `QUANTITATIVE` - Numerical measurement
- `QUALITATIVE` - Descriptive assessment

### Calculation Types
- `CUMULATIVE` - Sum over time
- `AVERAGE` - Average over time
- `MAXIMUM` - Maximum value
- `MINIMUM` - Minimum value
- `LATEST` - Most recent value

### Measurement Periods
- `WEEKLY` - Weekly tracking
- `MONTHLY` - Monthly tracking
- `QUARTERLY` - Quarterly tracking
- `ANNUALLY` - Annual tracking

### Approval/Status Values
- `DRAFT` - Initial state
- `SUBMITTED` - Pending review
- `APPROVED` - Accepted
- `REJECTED` - Not accepted
- `VERIFIED` - Confirmed

### Notification Types
- `INFO` - Information
- `WARNING` - Warning
- `SUCCESS` - Success message
- `ERROR` - Error message

---

## Database Operations Reference

### Common Operations

**Get All Records**:
```javascript
const data = getTableData(DB_CONFIG.SHEET_NAMES.USERS);
```

**Insert Record**:
```javascript
const result = insertRecord(DB_CONFIG.SHEET_NAMES.USERS, userData);
```

**Update Record**:
```javascript
const result = updateRecord(
  DB_CONFIG.SHEET_NAMES.USERS,
  'user_id',
  userId,
  updateData
);
```

**Delete Record**:
```javascript
const result = deleteRecord(
  DB_CONFIG.SHEET_NAMES.USERS,
  'user_id',
  userId
);
```

---

## Data Integrity Rules

### Referential Integrity
1. Foreign keys must reference existing records
2. Cannot delete parent records with active child records
3. Cascading deletes require explicit user action

### Business Rules
1. Only one active period at a time
2. One primary position assignment per user
3. KPI weights must sum to 100% per goal
4. Week dates must be Monday-Sunday
5. End dates must be after start dates
6. Budget spent cannot exceed allocated (warning only)

### Validation Rules
1. All UUIDs must be valid format
2. Email addresses must be valid format
3. Dates must be ISO format (YYYY-MM-DD)
4. Percentages must be 0-100
5. Required fields cannot be empty

---

## Performance Considerations

### Indexing Strategy
- Frequently queried fields should be indexed (use separate index sheets)
- Unique fields (codes, emails) act as natural indexes
- Foreign key relationships should be indexed

### Caching Strategy
- Cache reference data (roles, organizations) in CacheService
- Cache duration: 5 minutes for dashboard data
- Invalidate cache on data updates

### Query Optimization
- Use specific filters instead of full table scans
- Batch read operations when possible
- Minimize calls to SpreadsheetApp.flush()

---

## Backup & Recovery

### Backup Strategy
```javascript
// Run weekly backups
function backupDatabase() {
  const spreadsheet = getSpreadsheet();
  const backupFile = spreadsheet.copy("Database Backup " + formatDateISO(new Date()));
  moveSheetToFolder(backupFile.getId(), CONFIG.DRIVE.BACKUP_FOLDER_ID);
}
```

### Recovery Process
1. Identify backup to restore
2. Export critical data from backup
3. Import to production database
4. Verify referential integrity
5. Test application functionality

---

## Migration Strategy

When modifying schema:

1. **Add Column**: Add column to headers, migrate existing data
2. **Remove Column**: Set to deprecated, remove in next version
3. **Modify Column**: Create new column, migrate data, deprecate old
4. **Add Table**: Create new sheet, set up relationships
5. **Remove Table**: Backup data, deprecate in code, remove after period

---

## Next Steps

- See [DatabaseService](../Services/DatabaseService.gs) for implementation
- See [Creating CRUD Module](./51-creating-crud-module.md) for usage patterns
- See [Testing Guide](../TESTING_GUIDE.md) for testing database operations
