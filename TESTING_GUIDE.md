# Strategic Execution Monitoring - Testing Guide

## Table of Contents

1. [Testing Overview](#testing-overview)
2. [Testing Checklist by Page](#testing-checklist-by-page)
3. [Modal Testing Checklist](#modal-testing-checklist)
4. [Navigation Testing](#navigation-testing)
5. [Error Handling Testing](#error-handling-testing)
6. [API Endpoint Testing](#api-endpoint-testing)
7. [Cross-Browser Testing](#cross-browser-testing)

---

## Testing Overview

### Testing Environment

**Development Mode Setup**:
1. Open `Index.html`
2. Set `DEVELOPMENT_MODE = true` to bypass authentication
3. Set `ENABLE_DEBUG_PANEL = true` for debug tools
4. Set `MOCK_DATA = true` to use sample data

**Production Testing**:
1. Set `DEVELOPMENT_MODE = false` in Index.html
2. Use valid credentials for authentication testing
3. Test all permission-based features

### Test Accounts

After running `setupCompleteDatabase()`:

| Role | Username | Password | Permissions |
|------|----------|----------|-------------|
| Super Admin | mohammad.afwanul | SuperAdmin@2026 | Full access |
| Admin | (Create manually) | (Set manually) | All except system settings |
| Manager | (Create manually) | (Set manually) | Strategic, KPI, Programs read/write |
| User | (Create manually) | (Set manually) | Own OKR read/write |
| Viewer | (Create manually) | (Set manually) | Read-only |

---

## Testing Checklist by Page

### 1. Login Page

**Purpose**: User authentication and session management.

**File**: `pages/login.html`

#### Test Scenarios

| Scenario | Steps | Expected Result |
|----------|-------|-----------------|
| Valid login | Enter valid username/password, click Sign In | Redirect to dashboard |
| Invalid credentials | Enter invalid username/password | Show error message |
| Empty fields | Click Sign In with empty fields | Show validation errors |
| Password visibility | Click eye icon in password field | Toggle password visibility |
| Enter key | Press Enter in password field | Submit login form |
| Session persistence | Login, close browser, reopen | Remain logged in (if within timeout) |
| Session expiry | Wait 30 minutes without activity | Redirect to login on next action |
| Locked account | Fail login 5 times | Show locked account message |

#### API Endpoint Checks

| Endpoint | Method | Test |
|----------|--------|------|
| `auth.login` | POST | Valid credentials return success with sessionToken |
| `auth.login` | POST | Invalid credentials return error |
| `auth.getCurrentUser` | POST | Valid sessionToken returns user data |
| `auth.logout` | POST | Session invalidated, redirect to login |

#### Form Validation Checks

- [ ] Username is required
- [ ] Password is required
- [ ] Show loading state during authentication
- [ ] Show error message for invalid credentials
- [ ] Show error message for locked account
- [ ] Clear password field on failed login
- [ ] Remember username option (if implemented)

---

### 2. Dashboard

**Purpose**: Main overview with statistics and quick access to features.

**File**: `pages/dashboard.html`

#### Test Scenarios

| Scenario | Steps | Expected Result |
|----------|-------|-----------------|
| Load dashboard | Navigate to dashboard | All widgets load correctly |
| Quick stats | View KPI, OKR, goal counts | Accurate counts displayed |
| KPI by perspective | View KPI breakdown chart | Chart renders with correct data |
| Goals progress | View goals progress chart | Progress bars show correct percentages |
| Impact centers | View impact center status | All impact centers listed with status |
| Recent activities | View recent activity list | Activities sorted by date (newest first) |
| Performance score | View overall performance | Score calculated correctly |
| Refresh data | Click refresh button | Data updates without page reload |

#### API Endpoint Checks

| Endpoint | Method | Test |
|----------|--------|------|
| `dashboard.quick-stats` | POST | Returns user stats (KPIs, OKRs, performance) |
| `dashboard.kpi-by-perspective` | POST | Returns KPI data grouped by perspective |
| `dashboard.goals-progress` | POST | Returns goals with progress percentages |
| `dashboard.impact-centers-status` | POST | Returns impact center status data |
| `dashboard.recent-activities` | POST | Returns recent audit trail entries |

#### Widget-Specific Tests

**Quick Stats Widget**:
- [ ] Total KPIs count is correct
- [ ] Active KPIs count is correct
- [ ] Total OKRs count is correct
- [ ] Performance score displays (0-100)

**KPI Chart Widget**:
- [ ] Chart renders (no console errors)
- [ ] Data matches backend
- [ ] Legend displays correctly
- [ ] Colors match perspectives

**Goals Progress Widget**:
- [ ] All goals listed
- [ ] Progress bars accurate
- [ ] Goals with 0% progress show correctly
- [ ] Goals with 100% progress show as completed

---

### 3. Organization

**Purpose**: Manage organizational hierarchy (Directorates, Work Units, Affairs, Positions).

**File**: `pages/organization.html`

#### Test Scenarios

| Scenario | Steps | Expected Result |
|----------|-------|-----------------|
| View organization tree | Navigate to Organization | Tree view loads with expandable nodes |
| Expand/collapse nodes | Click expand/collapse icons | Nodes expand/collapse smoothly |
| View data tables | Switch to table view | Data tables render correctly |
| Create directorate | Click Add Directorate | Form opens, save creates record |
| Create work unit | Select directorate, add work unit | Work unit added under directorate |
| Create affair | Select work unit, add affair | Affair added under work unit |
| Create position | Click Add Position | Position created successfully |
| Edit entity | Click edit icon | Form pre-populated with data |
| Delete entity | Click delete icon | Delete confirmation shown |
| Cascade delete | Delete with children | All children deleted with warning |
| Reassign children | Delete, choose reassign option | Children moved to new parent |

#### API Endpoint Checks

| Endpoint | Method | Test |
|----------|--------|------|
| `directorates.list` | POST | Returns all directorates |
| `directorates.create` | POST | Creates new directorate |
| `directorates.update` | POST | Updates directorate |
| `directorates.delete` | POST | Deletes directorate (if no children) |
| `directorates.check-children` | POST | Returns count of child entities |
| `directorates.get-alternatives` | POST | Returns other directorates for reassignment |
| `directorates.delete-cascade` | POST | Deletes directorate and all children |
| `directorates.delete-reassign` | POST | Reassigns children and deletes |
| `work-units.list` | POST | Returns all work units |
| `work-units.create` | POST | Creates new work unit |
| `affairs.list` | POST | Returns all affairs |
| `affairs.create` | POST | Creates new affair |
| `positions.list` | POST | Returns all positions |
| `positions.create` | POST | Creates new position |

#### Form Validation Checks

**Directorate Form**:
- [ ] Directorate code is required
- [ ] Directorate name is required
- [ ] Code format validation (DIR-XXX)
- [ ] Duplicate code prevention
- [ ] Description optional
- [ ] Director position optional

**Work Unit Form**:
- [ ] Work unit code is required
- [ ] Work unit name is required
- [ ] Directorate selection required
- [ ] Code format validation (WU-XXX)
- [ ] Duplicate code prevention within directorate

**Affair Form**:
- [ ] Affair code is required
- [ ] Affair name is required
- [ ] Work unit selection required
- [ ] Code format validation (AFF-XXX)

**Position Form**:
- [ ] Position code is required
- [ ] Position name is required
- [ ] Position type selection required (Horizontal/Vertical)
- [ ] Position level selection required
- [ ] Parent position optional
- [ ] At least one organizational unit required (directorate/work unit/affair)

#### Organization Diagram Tests

- [ ] Tree view renders without errors
- [ ] Nodes display correct names
- [ ] Expand/collapse works
- [ ] Hover tooltips show entity details
- [ ] Right-click context menu appears
- [ ] Context menu actions work correctly
- [ ] Zoom in/out works
- [ ] Fit to screen works
- [ ] Download/export diagram works (if implemented)

---

### 4. Strategic Plan

**Purpose**: Manage strategic planning (Periods, Visions, Missions, Goals).

**File**: `pages/strategic-plan.html`

#### Test Scenarios

| Scenario | Steps | Expected Result |
|----------|-------|-----------------|
| View active period | Navigate to Strategic Plan | Active period displayed prominently |
| Create period | Click Add Period | Period created, only one can be active |
| Set active period | Click activate on period | Previous period deactivated |
| Create vision | Click Add Vision | Vision created (max 1000 chars) |
| Approve vision | Click approve button | Vision status changes to APPROVED |
| Create mission | Click Add Mission | Mission created (max 1500 chars) |
| Link mission to vision | Select vision when creating | Mission linked to vision |
| Create strategic initiative | Click Add Initiative | Initiative created for year |
| Create organizational goal | Click Add Goal | Goal created for year |
| View goal details | Click on goal | Full details displayed |
| Edit strategic element | Click edit button | Form pre-populated |

#### API Endpoint Checks

| Endpoint | Method | Test |
|----------|--------|------|
| `periods.list` | POST | Returns all periods |
| `periods.getActive` | POST | Returns active period |
| `periods.setActive` | POST | Sets specified period as active |
| `periods.create` | POST | Creates new period |
| `visions.create` | POST | Creates new vision |
| `visions.approve` | POST | Approves vision |
| `visions.update` | POST | Updates vision |
| `missions.create` | POST | Creates new mission |
| `missions.approve` | POST | Approves mission |
| `goals.create` | POST | Creates organizational goal |
| `initiatives.create` | POST | Creates strategic initiative |

#### Form Validation Checks

**Period Form**:
- [ ] Period code required
- [ ] Start year required
- [ ] End year required
- [ ] End year > Start year
- [ ] Only one active period allowed

**Vision Form**:
- [ ] Period selection required
- [ ] Vision text required (max 1000 characters)
- [ ] Character counter displays
- [ ] Description optional

**Mission Form**:
- [ ] Vision selection required
- [ ] Mission text required (max 1500 characters)
- [ ] Mission order required
- [ ] Character counter displays

**Goal Form**:
- [ ] Year required
- [ ] Goal code required
- [ ] Goal name required
- [ ] Goal description required
- [ ] Target description optional

---

### 5. KPI Management

**Purpose**: Manage organizational KPIs and track monthly progress.

**File**: `pages/kpi.html`

#### Test Scenarios

| Scenario | Steps | Expected Result |
|----------|-------|-----------------|
| View KPI list | Navigate to KPI page | All KPIs displayed in table |
| Filter by work unit | Select work unit filter | Table shows filtered KPIs |
| Filter by year | Select year filter | Table shows filtered KPIs |
| Create KPI | Click Add KPI | KPI created successfully |
| Link to work unit goal | Select work unit goal | KPI linked to goal |
| Set KPI type | Select KPI type | Type saved correctly |
| Set perspective | Select BSC perspective | Perspective saved correctly |
| Record progress | Click Add Progress | Progress entry created |
| Verify progress | Click verify button | Progress marked as verified |
| View progress history | Click on KPI | All progress entries shown |
| Calculate achievement | Enter actual value | Achievement % calculated |
| Delete KPI | Click delete button | Confirmation shown, KPI deleted |

#### API Endpoint Checks

| Endpoint | Method | Test |
|----------|--------|------|
| `kpis.list` | POST | Returns KPIs for work unit/year |
| `kpis.create` | POST | Creates new KPI |
| `kpis.update` | POST | Updates KPI |
| `kpis.delete` | POST | Deletes KPI |
| `kpis.progress.record` | POST | Records monthly progress |
| `kpis.progress.verify` | POST | Verifies progress entry |
| `kpis.getById` | POST | Returns KPI details |

#### Form Validation Checks

**KPI Form**:
- [ ] KPI code required
- [ ] KPI name required
- [ ] Work unit goal required
- [ ] Year required
- [ ] KPI type required (Outcome/Output/Input/Process)
- [ ] Perspective required (Financial/Customer/Internal Process/Learning)
- [ ] Target value required
- [ ] Unit of measurement required
- [ ] Assessment type required (Quantitative/Qualitative)
- [ ] Weight percentage between 0-100
- [ ] Calculation type required
- [ ] Parent KPI required if derived KPI

**Progress Form**:
- [ ] KPI selection required
- [ ] Year required
- [ ] Month required
- [ ] Actual value required
- [ ] Achievement % auto-calculated
- [ ] Notes optional
- [ ] Evidence URL optional

#### Status Tests

- [ ] ON_TRACK: Achievement >= 90%
- [ ] AT_RISK: Achievement 75-89%
- [ ] OFF_TRACK: Achievement < 75%
- [ ] Status badges colored correctly (green/yellow/red)

---

### 6. OKR Management

**Purpose**: Manage weekly Objectives and Key Results for individuals.

**File**: `pages/okrs.html`

#### Test Scenarios

| Scenario | Steps | Expected Result |
|----------|-------|-----------------|
| View my OKRs | Navigate to OKR page | Current week OKR displayed |
| Create new OKR | Click Create OKR | Form for new OKR opens |
| Set objective | Enter objective text | Objective saved |
| Add key results | Enter up to 3 key results | All key results saved |
| Auto-calculate week | Create OKR | Week number auto-populated |
| Update progress | Change key result progress | Overall progress recalculated |
| Submit OKR | Click Submit button | Status changes to SUBMITTED |
| Review OKR | Manager clicks Review | Review form opens |
| Approve OKR | Click Approve | Status changes to APPROVED |
| Reject OKR | Click Reject | Status changes to REJECTED |
| View OKR history | Select previous week | Historical OKR displayed |
| Delete draft OKR | Click delete (draft only) | OKR deleted |

#### API Endpoint Checks

| Endpoint | Method | Test |
|----------|--------|------|
| `okrs.get` | POST | Returns OKRs for user/year/quarter |
| `okrs.getCurrentWeek` | POST | Returns current week OKR |
| `okrs.create` | POST | Creates new OKR |
| `okrs.update` | POST | Updates OKR |
| `okrs.submit` | POST | Submits OKR for review |
| `okrs.review` | POST | Reviews OKR (approve/reject) |
| `okrs.getById` | POST | Returns OKR details |

#### Form Validation Checks

**OKR Form**:
- [ ] Objective text required
- [ ] At least one key result required
- [ ] Week number auto-calculated
- [ ] Quarter auto-calculated
- [ ] Year auto-populated
- [ ] Progress values between 0-100
- [ ] Overall progress auto-calculated

**Progress Calculation**:
- [ ] Overall = average of all key result progresses
- [ ] Empty key results ignored in calculation
- [ ] Validation prevents progress > 100

#### Workflow Tests

- [ ] Draft status: Editable by user
- [ ] Submitted status: Read-only for user, editable by reviewer
- [ ] Approved status: Read-only for all
- [ ] Rejected status: Editable by user to resubmit
- [ ] Review notes captured for rejected OKRs

---

### 7. Users

**Purpose**: Manage user accounts and access.

**File**: `pages/users.html`

#### Test Scenarios

| Scenario | Steps | Expected Result |
|----------|-------|-----------------|
| View user list | Navigate to Users page | All users displayed in table |
| Filter by role | Select role filter | Table shows filtered users |
| Filter by status | Select active/inactive | Table shows filtered users |
| Create user | Click Add User | User created with password |
| Edit user | Click edit icon | Form pre-populated, updates save |
| Assign role | Select role in form | Role assigned to user |
| Set active period | Set active from/until dates | User active only within dates |
| Deactivate user | Uncheck is_active | User cannot login |
| Delete user | Click delete | User soft-deactivated |
| Change password | Click change password | Password updated |
| Reset password | Click reset password | Temporary password generated |

#### API Endpoint Checks

| Endpoint | Method | Test |
|----------|--------|------|
| `users.list` | POST | Returns all users with filters |
| `users.getById` | POST | Returns user details |
| `users.create` | POST | Creates new user |
| `users.update` | POST | Updates user |
| `users.delete` | POST | Soft deletes user (sets is_active=false) |
| `auth.changePassword` | POST | Changes user password |

#### Form Validation Checks

**User Form**:
- [ ] Username required (min 3 characters)
- [ ] Username unique
- [ ] Email required and valid format
- [ ] Email unique
- [ ] Full name required
- [ ] Role selection required
- [ ] Password required on create (min 8 chars, uppercase, lowercase, number, special)
- [ ] Password confirmation matches
- [ ] Active from date defaults to today
- [ ] Active until date optional
- [ ] Notes optional

#### Security Tests

- [ ] Password hashed before storage
- [ ] Password not visible in table
- [ ] Cannot delete own account
- [ ] Cannot modify own role
- [ ] Last login timestamp updated on login
- [ ] Force password change on first login (if implemented)

---

### 8. Roles

**Purpose**: Manage roles and permissions.

**File**: `pages/roles.html`

#### Test Scenarios

| Scenario | Steps | Expected Result |
|----------|-------|-----------------|
| View role list | Navigate to Roles page | All roles displayed |
| View permissions | Click on role | Permission matrix shown |
| Create role | Click Add Role | Role created with permissions |
| Clone role | Click clone button | New role created with same permissions |
| Edit role | Click edit icon | Permissions updated |
| Edit permissions | Check/uncheck permissions | Changes saved |
| Delete custom role | Click delete | Role deleted |
| Cannot delete system role | Try to delete ADMIN | Error message shown |
| Assign role to user | In user form, select role | User gets role permissions |

#### API Endpoint Checks

| Endpoint | Method | Test |
|----------|--------|------|
| `roles.list` | POST | Returns all roles |
| `roles.getById` | POST | Returns role details |
| `roles.create` | POST | Creates new role |
| `roles.clone` | POST | Clones existing role |
| `roles.update` | POST | Updates role |
| `roles.delete` | POST | Deletes role (if not system role) |

#### Permission Matrix

**Modules**: users, roles, organization, strategic_plan, kpi, okr, programs, impact_centers, reports, settings

**Actions**: create, read, update, delete, approve

#### Form Validation Checks

- [ ] Role code required
- [ ] Role code unique
- [ ] Role name required
- [ ] Role name unique
- [ ] Description optional
- [ ] At least one permission selected
- [ ] System roles cannot be deleted
- [ ] System roles cannot have codes modified

---

### 9. Programs

**Purpose**: Manage programs and activities with budget tracking.

**File**: `pages/programs.html`

#### Test Scenarios

| Scenario | Steps | Expected Result |
|----------|-------|-----------------|
| View program list | Navigate to Programs page | All programs displayed |
| Filter by work unit | Select work unit | Filtered programs shown |
| Create program | Click Add Program | Program created |
| Link to KPI | Select KPIs | Program linked to KPIs |
| Add activities | Click Add Activity | Activity added to program |
| Set budget | Enter budget allocated | Budget saved |
| Track spending | Enter budget spent | Spending calculated |
| View activities | Expand program | All activities listed |
| Edit activity | Click edit activity | Activity updated |
| Calculate activity cost | Set unit price, quantity | Total cost auto-calculated |
| Delete program | Click delete | Confirmation shown |

#### API Endpoint Checks

| Endpoint | Method | Test |
|----------|--------|------|
| `programs.create` | POST | Creates new program |
| `programs.update` | POST | Updates program |
| `programs.delete` | POST | Deletes program |
| `activities.create` | POST | Creates new activity |
| `activities.update` | POST | Updates activity |
| `activities.delete` | POST | Deletes activity |
| `activities.getByProgram` | POST | Returns activities for program |

#### Form Validation Checks

**Program Form**:
- [ ] Program code required
- [ ] Program name required
- [ ] Work unit goal required
- [ ] Description optional
- [ ] Start date required
- [ ] End date required (> start date)
- [ ] Budget allocated numeric
- [ ] Budget spent <= budget allocated

**Activity Form**:
- [ ] Activity code required
- [ ] Activity name required
- [ ] Unit price numeric
- [ ] Quantity numeric
- [ ] Total cost auto-calculated (unit price * quantity)
- [ ] Unit of measurement required
- [ ] Start date required
- [ ] End date required
- [ ] Responsible position optional

---

### 10. Reports

**Purpose**: Generate and export reports.

**File**: `pages/reports.html`

#### Test Scenarios

| Scenario | Steps | Expected Result |
|----------|-------|-----------------|
| KPI report | Select KPI report type | Report generated with KPI data |
| OKR report | Select OKR report type | Report generated with OKR data |
| Performance dashboard | Select year | Dashboard generated |
| Filter by work unit | Select work unit | Report filtered |
| Filter by year | Select year | Report filtered |
| Export to CSV | Click export CSV | CSV file downloaded |
| Export to Sheets | Click export Sheets | Google Sheets created |
| Email report | Enter email, click send | Email sent |
| Print report | Click print | Print dialog opens |

#### API Endpoint Checks

| Endpoint | Method | Test |
|----------|--------|------|
| `reports.kpi` | POST | Returns KPI report data |
| `reports.okr` | POST | Returns OKR report data |
| `reports.performance` | POST | Returns performance dashboard data |
| `reports.export.csv` | POST | Returns CSV blob |
| `reports.export.sheets` | POST | Creates Google Sheets |
| `reports.email` | POST | Sends email report |

#### Report Validation Checks

- [ ] Date ranges validated
- [ ] Required filters selected
- [ ] Export formats correct
- [ ] Email addresses validated
- [ ] Large datasets paginated
- [ ] Summary calculations correct

---

### 11. Audit Trail

**Purpose**: View all system changes and revisions.

**File**: `pages/audit-trail.html`

#### Test Scenarios

| Scenario | Steps | Expected Result |
|----------|-------|-----------------|
| View audit log | Navigate to Audit Trail | All revisions displayed |
| Filter by entity | Select entity type | Filtered revisions shown |
| Filter by user | Select user | Filtered revisions shown |
| Filter by date range | Select dates | Revisions within range shown |
| View changes | Click on revision | Old and new values shown |
| Restore revision | Click restore | Entity reverted to previous state |
| Compare revisions | Select two revisions | Side-by-side comparison shown |
| Export log | Click export | Audit log exported |

#### API Endpoint Checks

| Endpoint | Method | Test |
|----------|--------|------|
| `revisions.getHistory` | POST | Returns revision history for entity |
| `revisions.restore` | POST | Restores entity to previous state |
| `revisions.getStatistics` | POST | Returns revision statistics |

#### Display Tests

- [ ] Timestamp formatted correctly
- [ ] User names displayed
- [ ] Change types colored (CREATE=green, UPDATE=blue, DELETE=red, RESTORE=orange)
- [ ] Field names human-readable
- [ ] Old/new values shown for updates
- [ ] Long values truncated with expand option
- [ ] Pagination for large datasets

---

### 12. SWOT Analysis

**Purpose**: Analyze Strengths, Weaknesses, Opportunities, Threats.

**File**: `pages/swot.html`

#### Test Scenarios

| Scenario | Steps | Expected Result |
|----------|-------|-----------------|
| View SWOT matrix | Navigate to SWOT page | Matrix with 4 quadrants shown |
| Select goal | Select goal from dropdown | SWOT items for goal displayed |
| Add strength | Click Add, select Strength | Item added to Strength quadrant |
| Add weakness | Click Add, select Weakness | Item added to Weakness quadrant |
| Add opportunity | Click Add, select Opportunity | Item added to Opportunity quadrant |
| Add threat | Click Add, select Threat | Item added to Threat quadrant |
| Set impact level | Select High/Medium/Low | Impact level saved |
| View TOWS strategies | Click Generate TOWS | Strategy combinations shown |
| View impact analysis | Click Impact Analysis | Impact score and recommendations shown |
| Edit SWOT item | Click edit item | Item updated |
| Delete SWOT item | Click delete item | Item removed |

#### API Endpoint Checks

| Endpoint | Method | Test |
|----------|--------|------|
| `swot.matrix` | POST | Returns SWOT matrix for goal |
| `swot.create` | POST | Creates new SWOT item |
| `swot.update` | POST | Updates SWOT item |
| `swot.delete` | POST | Deletes SWOT item |
| `swot.impact` | POST | Returns impact analysis |

#### Form Validation Checks

- [ ] Goal selection required
- [ ] Analysis type required (Internal/External)
- [ ] Analysis category required (Strength/Weakness/Opportunity/Threat)
- [ ] Title required
- [ ] Description optional
- [ ] Impact level required (High/Medium/Low)
- [ ] Priority optional

#### Matrix Display Tests

- [ ] Four quadrants displayed correctly
- [ ] Items grouped by category
- [ ] Color-coded quadrants
- [ ] Counts shown per quadrant
- [ ] Items sorted by priority/impact
- [ ] TOWS strategies generated correctly
- [ ] SO (Strengths + Opportunities) combinations shown
- [ ] WO (Weaknesses + Opportunities) combinations shown
- [ ] ST (Strengths + Threats) combinations shown
- [ ] WT (Weaknesses + Threats) combinations shown

---

### 13. Notifications

**Purpose**: View and manage system notifications.

**File**: `pages/notifications.html`

#### Test Scenarios

| Scenario | Steps | Expected Result |
|----------|-------|-----------------|
| View notifications | Navigate to Notifications | All notifications listed |
| Filter unread | Click Unread filter | Only unread shown |
| Mark as read | Click on notification | Marked as read |
| Mark all as read | Click Mark all read | All notifications marked read |
| Notification types | Icons for INFO/WARNING/SUCCESS/ERROR | Correct colors/icons |
| Click notification | Click on notification | Navigate to related entity |
| Delete notification | Click delete | Notification removed |
| Notification badge | View bell icon | Unread count shown |

#### API Endpoint Checks

| Endpoint | Method | Test |
|----------|--------|------|
| `notifications.get` | POST | Returns user notifications |
| `notifications.markAsRead` | POST | Marks notification as read |
| `notifications.markAllAsRead` | POST | Marks all as read |

#### Notification Tests

- [ ] Real-time updates (if polling implemented)
- [ ] Notifications sorted by date (newest first)
- [ ] Expired notifications filtered out
- [ ] Link URL navigates correctly
- [ ] High-priority notifications highlighted
- [ ] Email notifications sent for high priority (if enabled)

---

### 14. Settings

**Purpose**: Application configuration.

**File**: `pages/settings.html`

#### Test Scenarios

| Scenario | Steps | Expected Result |
|----------|-------|-----------------|
| View settings | Navigate to Settings | All settings displayed |
| Edit setting | Click edit setting | Form opens with current value |
| Save setting | Change value, click save | Setting updated |
| Reset to default | Click reset | Value reverts to default |
| Non-editable settings | View system settings | Show as read-only |
| Clear cache | Click clear cache | Cache cleared confirmation |

#### Settings to Test

| Setting | Description | Test |
|---------|-------------|------|
| APP_NAME | Application name | Change reflects in header |
| SESSION_TIMEOUT_MINUTES | Session timeout | Test timeout after change |
| ENABLE_EMAIL_NOTIFICATIONS | Email notifications | Toggle on/off |
| ADMIN_EMAIL | Admin email | Change receives test email |

---

## Modal Testing Checklist

### Common Modal Tests

All modals should:

| Test | Expected Result |
|------|-----------------|
| Open on trigger click | Modal appears smoothly |
| Close on X button | Modal closes |
| Close on backdrop click | Modal closes |
| Close on Escape key | Modal closes |
| Display validation errors | Errors shown within modal |
| Show loading state | Loading indicator during save |
| Close on success | Modal closes after successful save |
| Show error message | Error displayed if save fails |
| Scroll if content long | Modal body scrolls independently |
| Focus first input | Cursor in first input on open |

### Modal-Specific Tests

**Organization Modals** (`layout/modals/organization_modals.html`):
- [ ] Directorate modal: Form validates, saves correctly
- [ ] Work unit modal: Parent directorate dropdown populated
- [ ] Affair modal: Parent work unit dropdown populated
- [ ] Position modal: Parent hierarchy selections work
- [ ] Delete confirmation modal: Child count displayed
- [ ] Reassign modal: Alternative dropdown populated

**OKR Modals** (`layout/modals/okr_modals.html`):
- [ ] Create OKR modal: Week info auto-populated
- [ ] Edit OKR modal: Current data pre-populated
- [ ] Review modal: Key results displayed with progress

**Program Modals** (`layout/modals/program_modals.html`):
- [ ] Program modal: Work unit goal selection works
- [ ] Activity modal: Program selection works
- [ ] Cost calculation: Unit price * quantity = total

**SWOT Modals** (`layout/modals/swot_modals.html`):
- [ ] SWOT item modal: Goal selection works
- [ ] Impact level selection: High/Medium/Low options
- [ ] Category selection: S/W/O/T options

---

## Navigation Testing

### Sidebar Navigation

| Test | Expected Result |
|------|-----------------|
| All menu items visible | All pages accessible |
| Active page highlighted | Current page marked in sidebar |
| Click menu item | Page loads without full refresh |
| Mobile menu toggle | Sidebar shows/hides on mobile |
| Collapsed sidebar | Sidebar collapses to icons only |
| Expanded sidebar | Full sidebar with text labels |

### Router Testing

| Test | Expected Result |
|------|-----------------|
| Direct URL access | Page loads correctly |
| Browser back button | Returns to previous page |
| Browser forward button | Goes forward in history |
| Page refresh | Current page reloads |
| Invalid page URL | Shows 404 or redirects to dashboard |

### AJAX Navigation

| Test | Expected Result |
|------|-----------------|
| Click navigation link | Content area updates only |
| Loading indicator shows | Spinner visible during navigation |
| Page scripts execute | Page-specific JavaScript runs |
| URL parameter updates | ?page parameter changes |
| Page title updates | Document title reflects current page |

---

## Error Handling Testing

### API Error Handling

| Error Type | Test | Expected Result |
|------------|------|-----------------|
| Network error | Disconnect network | Show connection error |
| Server error | Mock 500 error | Show server error message |
| Timeout | Slow API response | Show timeout message |
| Invalid response | Mock malformed response | Show parsing error |
| Rate limit | Exceed rate limit | Show rate limit message |

### Form Error Handling

| Error Type | Test | Expected Result |
|------------|------|-----------------|
| Required field | Submit with empty required field | Show field-specific error |
| Invalid format | Enter invalid email | Show format error |
| Duplicate value | Enter duplicate code | Show duplicate error |
| Constraint violation | Violate business rule | Show constraint error |
| Validation errors | Multiple errors | Show all errors at once |

### User Feedback

| Scenario | Test | Expected Result |
|------------|------|-----------------|
| Success toast | Complete successful action | Green toast shows briefly |
| Error toast | Action fails | Red toast shows with error |
| Warning toast | Action has warning | Yellow toast shows |
| Info toast | General information | Blue toast shows |
| Confirm dialog | Destructive action | Confirmation dialog appears |
| Loading state | Action in progress | Button disabled, spinner shows |

---

## API Endpoint Testing

### Testing API Endpoints

Use browser console or API testing tool:

```javascript
// Example API call
google.script.run
  .withSuccessHandler(function(response) {
    console.log('Success:', response);
  })
  .withFailureHandler(function(error) {
    console.error('Error:', error);
  })
  .callAPI('actionName', { data });
```

### Endpoint Coverage Checklist

#### Authentication

- [ ] `auth.login` - Valid credentials
- [ ] `auth.login` - Invalid credentials
- [ ] `auth.login` - Empty credentials
- [ ] `auth.logout` - Valid session
- [ ] `auth.getCurrentUser` - Valid sessionToken
- [ ] `auth.getCurrentUser` - Invalid sessionToken
- [ ] `auth.changePassword` - Valid old password
- [ ] `auth.changePassword` - Invalid old password

#### Users

- [ ] `users.list` - No filters
- [ ] `users.list` - With is_active filter
- [ ] `users.list` - With role_id filter
- [ ] `users.getById` - Valid user ID
- [ ] `users.getById` - Invalid user ID
- [ ] `users.create` - Valid data
- [ ] `users.create` - Duplicate email
- [ ] `users.create` - Duplicate username
- [ ] `users.update` - Valid data
- [ ] `users.update` - Duplicate email (different user)
- [ ] `users.delete` - Valid user ID

#### Roles

- [ ] `roles.list` - All roles
- [ ] `roles.getById` - Valid role ID
- [ ] `roles.create` - Valid data
- [ ] `roles.create` - Duplicate code
- [ ] `roles.clone` - Valid role ID
- [ ] `roles.clone` - Invalid role ID
- [ ] `roles.update` - Valid data
- [ ] `roles.delete` - Custom role
- [ ] `roles.delete` - System role (should fail)

#### Organization

- [ ] `directorates.list` - All directorates
- [ ] `directorates.get` - Valid ID
- [ ] `directorates.create` - Valid data
- [ ] `directorates.update` - Valid data
- [ ] `directorates.delete` - No children
- [ ] `directorates.delete` - With children (should fail)
- [ ] `directorates.check-children` - Has children
- [ ] `directorates.check-children` - No children
- [ ] `directorates.get-alternatives` - Valid ID
- [ ] `directorates.delete-cascade` - Valid ID
- [ ] `directorates.delete-reassign` - Valid IDs
- [ ] `work-units.list` - All work units
- [ ] `work-units.create` - Valid data
- [ ] `work-units.delete` - No children
- [ ] `affairs.list` - All affairs
- [ ] `affairs.create` - Valid data
- [ ] `positions.list` - All positions
- [ ] `positions.create` - Valid data

#### Strategic Planning

- [ ] `periods.list` - All periods
- [ ] `periods.getActive` - Active period
- [ ] `periods.setActive` - Valid period ID
- [ ] `periods.create` - Valid data (end_year > start_year)
- [ ] `periods.create` - Invalid data (end_year <= start_year)
- [ ] `visions.create` - Valid data (< 1000 chars)
- [ ] `visions.create` - Invalid data (> 1000 chars)
- [ ] `visions.approve` - Valid vision ID
- [ ] `missions.create` - Valid data (< 1500 chars)
- [ ] `missions.create` - Invalid data (> 1500 chars)
- [ ] `goals.create` - Valid data

#### KPIs

- [ ] `kpis.list` - All KPIs for work unit
- [ ] `kpis.create` - Valid data
- [ ] `kpis.update` - Valid data
- [ ] `kpis.delete` - Valid KPI ID
- [ ] `kpis.progress.record` - Valid progress data
- [ ] `kpis.progress.verify` - Valid progress ID
- [ ] `kpis.getById` - Valid KPI ID

#### OKRs

- [ ] `okrs.get` - User OKRs for year/quarter
- [ ] `okrs.getCurrentWeek` - Current week OKR
- [ ] `okrs.create` - Valid data
- [ ] `okrs.update` - Valid data
- [ ] `okrs.submit` - Valid OKR ID
- [ ] `okrs.review` - Approve OKR
- [ ] `okrs.review` - Reject OKR

#### Programs

- [ ] `programs.create` - Valid data
- [ ] `programs.update` - Valid data
- [ ] `programs.delete` - Valid program ID
- [ ] `activities.create` - Valid data
- [ ] `activities.update` - Valid data
- [ ] `activities.delete` - Valid activity ID

#### Reports

- [ ] `reports.kpi` - With filters
- [ ] `reports.okr` - With filters
- [ ] `reports.performance` - For year
- [ ] `reports.export.csv` - Valid data
- [ ] `reports.export.sheets` - Valid data

#### Notifications

- [ ] `notifications.get` - All notifications
- [ ] `notifications.get` - UnreadOnly=true
- [ ] `notifications.markAsRead` - Valid notification ID
- [ ] `notifications.markAllAsRead` - Current user

#### SWOT

- [ ] `swot.matrix` - Valid goal ID
- [ ] `swot.create` - Valid data
- [ ] `swot.update` - Valid analysis ID
- [ ] `swot.delete` - Valid analysis ID
- [ ] `swot.impact` - Valid goal ID

#### Audit

- [ ] `revisions.getHistory` - Valid entity
- [ ] `revisions.restore` - Valid revision ID
- [ ] `revisions.getStatistics` - With filters

---

## Cross-Browser Testing

### Browser Compatibility

| Browser | Version | Notes |
|---------|---------|-------|
| Chrome | Latest | Primary support |
| Firefox | Latest | Full support |
| Safari | Latest | Full support |
| Edge | Latest | Full support |
| IE 11 | - | Not supported |

### Mobile Testing

| Device | Orientation | Notes |
|--------|-------------|-------|
| Desktop | - | Primary layout |
| Tablet | Portrait | Sidebar collapses |
| Tablet | Landscape | Sidebar visible |
| Mobile | Portrait | Hamburger menu |
| Mobile | Landscape | Hamburger menu |

---

## Performance Testing

### Load Time Targets

| Page | Target |
|------|--------|
| Login | < 1 second |
| Dashboard | < 2 seconds |
| Data tables (100 rows) | < 2 seconds |
| Data tables (500 rows) | < 5 seconds |
| Organization tree | < 3 seconds |

### Optimization Checks

- [ ] DataTables use server-side processing for large datasets
- [ ] Images optimized and lazy-loaded
- [ ] API responses use pagination
- [ ] Cache headers set appropriately
- [ ] Minimal blocking JavaScript
- [ ] CSS minified in production

---

## Security Testing

### Authentication & Authorization

| Test | Expected Result |
|------|-----------------|
| Access without login | Redirect to login page |
| Access with invalid session | Redirect to login page |
| Access forbidden resource | Show 403 error |
| SQL injection attempts | Input sanitized |
| XSS attempts | Output encoded |
| CSRF protection | Tokens validated |

### Data Security

| Test | Expected Result |
|------|-----------------|
| Passwords hashed | Passwords never stored in plain text |
| Sensitive data masked | Passwords not visible in UI |
| Session timeout | Auto-logout after inactivity |
| Rate limiting | Brute force protection active |
| Audit trail | All changes logged |

---

## Pre-Deployment Checklist

### Code Review

- [ ] No console.log statements left in production code
- [ ] No hardcoded credentials
- [ ] All features tested with valid and invalid inputs
- [ ] Error messages are user-friendly
- [ ] Loading states for all async operations
- [ ] Sensitive actions require confirmation

### Configuration

- [ ] DEVELOPMENT_MODE set to false
- [ ] MOCK_DATA set to false
- [ ] Database initialized in production
- [ ] Admin account created and tested
- [ ] Email configuration verified
- [ ] Folder IDs configured correctly

### Documentation

- [ ] README updated with latest changes
- [ ] API documentation current
- [ ] Known issues documented
- [ ] Deployment instructions verified

---

## Test Execution Log

Use this template to track testing progress:

| Date | Tester | Page/Feature | Status | Notes |
|------|--------|--------------|--------|-------|
| YYYY-MM-DD | Name | Login | Pass/Fail | Notes |
| YYYY-MM-DD | Name | Dashboard | Pass/Fail | Notes |
| ... | ... | ... | ... | ... |

---

## Bug Reporting Template

```markdown
**Title**: [Brief bug description]

**Steps to Reproduce**:
1. Go to ...
2. Click on ...
3. ...

**Expected Result**: What should happen

**Actual Result**: What actually happens

**Browser**: Chrome/Firefox/Safari/Edge + version

**Screenshots**: If applicable

**Console Errors**: Copy any console errors
```

---

## Notes

- Always test with multiple user roles to verify permission-based access
- Test both create and edit workflows
- Test with empty data states (no records in database)
- Test with large datasets to verify pagination and performance
- Test browser back/forward button behavior
- Test refresh behavior on each page

---

Last Updated: 2026
Version: 1.0.0
