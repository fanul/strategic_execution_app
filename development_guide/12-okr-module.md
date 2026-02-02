# OKR Module - Complete Guide

## Overview

The OKR (Objectives and Key Results) module is a weekly performance management system that enables individuals to set, track, and review their objectives and measurable results. It includes submission workflows, manager reviews, and progress tracking.

## Key Features

- **Weekly OKR Entry**: Users create OKRs for each week
- **Multiple Key Results**: Up to 3 key results per objective
- **Progress Tracking**: 0-100% progress per key result
- **Submission Workflow**: Draft → Submit → Review → Approve/Reject
- **Historical Trends**: View OKR history and patterns
- **Manager Review**: Supervisors review and provide feedback

## Hierarchy Structure

```
OKR (Weekly)
│
├── Objective Text (What you want to achieve)
│   │
│   ├── Key Result 1 + Progress %
│   ├── Key Result 2 + Progress %
│   └── Key Result 3 + Progress %
│
├── Overall Progress (Average)
├── Challenges
├── Support Needed
└── Review Notes (from manager)
```

## Module Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            OKR MODULE ARCHITECTURE                          │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND LAYER                                  │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                          pages/okrs.html                              │  │
│  │  - Week selector (calendar-based)                                     │  │
│  │  - OKR entry form                                                     │  │
│  │  - Progress bars for each key result                                 │  │
│  │  - Challenge/support fields                                          │  │
│  │  - My OKRs history list                                              │  │
│  │  - Team OKRs view (for managers)                                     │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                      │                                       │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                        CRUD OPERATIONS LAYER                            │  │
│  │  assets/js/okr_crud.html                                              │  │
│  │  - saveOKR() - Create or update OKR                                  │  │
│  │  - submitOKR() - Submit for review                                   │  │
│  │  - loadCurrentWeek() - Get this week's OKR                           │  │
│  │  - loadMyOKRs() - Get history                                        │  │
│  │  - loadTeamOKRs() - Get team OKRs (managers)                         │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                      │                                       │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                      MODALS (layout/modals/)                            │  │
│  │  okr_modals.html                                                       │  │
│  │  - okrEntryModal - Weekly OKR form                                    │  │
│  │  - okrReviewModal - Manager review form                              │  │
│  │  - okrHistoryModal - View past OKRs                                   │  │
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
│  Routes to: OKRController                                                  │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          CONTROLLER LAYER                                    │
│  Controllers/OKRController.gs                                              │
│  - Validation, business logic, audit logging                               │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           MODEL LAYER                                        │
│  Models/OKR.gs                                                              │
│  - Database operations, progress calculations                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        DATABASE LAYER (Google Sheets)                        │
│  OKRs Table                                                                 │
└─────────────────────────────────────────────────────────────────────────────┘
```

## File Components

### Backend Files

| File | Description |
|------|-------------|
| [Controllers/OKRController.gs](../Controllers/OKRController.gs) | OKR business logic and workflow |
| [Models/OKR.gs](../Models/OKR.gs) | OKR data access and calculations |

### Frontend Files

| File | Description |
|------|-------------|
| [pages/okrs.html](../pages/okrs.html) | OKR management page |
| [layout/modals/okr_modals.html](../layout/modals/okr_modals.html) | OKR form modals |
| [assets/js/okr_crud.html](../assets/js/okr_crud.html) | OKR CRUD operations |

## Data Structure

### OKR Record

```javascript
{
    okr_id: 'uuid-1234-5678-9012',
    user_id: 'user-uuid',
    position_id: 'position-uuid',
    year: 2026,
    quarter: 1,
    week_number: 5,
    week_start_date: '2026-02-02',  // Monday
    week_end_date: '2026-02-08',    // Sunday
    objective_text: 'Complete quarterly reporting',
    key_result_1: 'Submit draft report to manager',
    key_result_1_progress: 75,      // 0-100
    key_result_2: 'Incorporate feedback from all departments',
    key_result_2_progress: 50,
    key_result_3: 'Get final approval from director',
    key_result_3_progress: 0,
    overall_progress: 41.67,        // Average of all KRs
    challenges: 'Waiting for data from finance department',
    support_needed: 'Need access to financial reporting system',
    created_at: '2026-02-01 09:00:00',
    updated_at: '2026-02-03 14:20:00',
    submitted_at: '2026-02-03 14:20:00',
    reviewed_by: 'manager-user-id',
    reviewed_at: null,
    review_notes: null,
    status: 'SUBMITTED',             // DRAFT, SUBMITTED, REVIEWED, APPROVED
    notes: 'On track for completion this week'
}
```

## Progress Calculation

### Overall Progress Formula

```javascript
function calculateOverallProgress(okrData) {
    const keyResults = [];

    // Collect non-empty key results
    if (okrData.key_result_1) keyResults.push(okrData.key_result_1_progress || 0);
    if (okrData.key_result_2) keyResults.push(okrData.key_result_2_progress || 0);
    if (okrData.key_result_3) keyResults.push(okrData.key_result_3_progress || 0);

    if (keyResults.length === 0) return 0;

    // Calculate average
    const sum = keyResults.reduce((a, b) => a + b, 0);
    return Math.round((sum / keyResults.length) * 100) / 100; // Round to 2 decimals
}
```

### Examples

```
Example 1: 3 key results
KR1: 80%, KR2: 60%, KR3: 100%
Overall: (80 + 60 + 100) / 3 = 80%

Example 2: 2 key results
KR1: 50%, KR2: 75%
Overall: (50 + 75) / 2 = 62.5%

Example 3: 1 key result
KR1: 90%
Overall: 90%
```

## Workflow States

### State Diagram

```
┌─────────┐     submit      ┌──────────┐     review    ┌─────────┐
│  DRAFT  │ ──────────────> │SUBMITTED │ ────────────> │REVIEWED │
└─────────┘                 └──────────┘               └─────────┘
     ▲                           │                          │
     │                           ▼                          ▼
     │                      ┌─────────┐               ┌─────────┐
     └──────────────────────│REJECTED │               │APPROVED │
            (revise)         └─────────┘               └─────────┘
```

### State Descriptions

| State | Description |Editable By | Actions |
|-------|-------------|-------------|---------|
| `DRAFT` | Initial state, user is editing | User only | Save, Submit |
| `SUBMITTED` | Pending manager review | None | View only |
| `REVIEWED` | Manager added feedback | None | View only |
| `APPROVED` | Accepted by manager | None | View only |
| `REJECTED` | Sent back for revision | User only | Edit, Resubmit |

## API Endpoints

### CRUD Operations

| Endpoint | Method | Description |
|----------|--------|-------------|
| `okrs/getMyOKRs` | POST | Get current user's OKRs with filters |
| `okrs/getCurrentWeek` | POST | Get current week OKR for user |
| `okrs/getById` | POST | Get specific OKR by ID |
| `okrs/create` | POST | Create new OKR |
| `okrs/update` | POST | Update existing OKR |
| `okrs/delete` | POST | Delete OKR (draft only) |

### Workflow Operations

| Endpoint | Method | Description |
|----------|--------|-------------|
| `okrs/submit` | POST | Submit OKR for review |
| `okrs/review` | POST | Manager review (approve/reject) |
| `okrs/getToReview` | POST | Get OKRs pending review (for managers) |
| `okrs/getTeamOKRs` | POST | Get team OKRs (for managers) |

### Request/Response Examples

#### Get Current Week OKR

**Request**:
```javascript
{
    action: 'okrs.getCurrentWeek',
    data: {
        user_id: 'user-uuid',
        year: 2026,
        quarter: 1,
        week_number: 5
    }
}
```

**Response**:
```javascript
{
    success: true,
    data: {
        okr_id: 'okr-uuid',
        user_id: 'user-uuid',
        objective_text: 'Complete project deliverables',
        key_result_1: 'Finish module A',
        key_result_1_progress: 100,
        key_result_2: 'Test module B',
        key_result_2_progress: 60,
        overall_progress: 80,
        status: 'DRAFT'
    },
    message: 'OKR retrieved successfully'
}
```

#### Submit OKR

**Request**:
```javascript
{
    action: 'okrs.submit',
    data: {
        okr_id: 'okr-uuid',
        user_id: 'user-uuid'
    }
}
```

**Response**:
```javascript
{
    success: true,
    data: {
        okr_id: 'okr-uuid',
        status: 'SUBMITTED',
        submitted_at: '2026-02-03 14:30:00'
    },
    message: 'OKR submitted successfully'
}
```

#### Review OKR (Manager)

**Request**:
```javascript
{
    action: 'okrs.review',
    data: {
        okr_id: 'okr-uuid',
        reviewer_id: 'manager-uuid',
        approved: true,
        review_notes: 'Great progress! Keep up the good work.'
    }
}
```

**Response**:
```javascript
{
    success: true,
    data: {
        okr_id: 'okr-uuid',
        status: 'APPROVED',
        reviewed_by: 'manager-uuid',
        reviewed_at: '2026-02-04 09:15:00',
        review_notes: 'Great progress! Keep up the good work.'
    },
    message: 'OKR approved successfully'
}
```

## Complete Data Flow: Submitting Weekly OKR

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    SUBMIT WEEKLY OKR - COMPLETE FLOW                   │
└─────────────────────────────────────────────────────────────────────────┘

1. USER NAVIGATES TO OKR PAGE
   User clicks "My OKRs" in sidebar
   Router loads pages/okrs.html

2. PAGE INITIALIZATION
   loadCurrentWeek() called
   │
   ├─► Get current date
   ├─► Calculate week number and quarter
   └─► apiCall('okrs/getCurrentWeek', {user_id, year, quarter, week_number})

3. BACKEND: CHECK IF OKR EXISTS
   OKRController.getCurrentWeek(data)
   │
   ├─► Query OKRs table by user_id, year, quarter, week_number
   │
   ├─► If found:
   │   └─► Return existing OKR
   │
   └─► If not found:
       └─► Return { success: true, data: null }

4. FRONTEND: DISPLAY OKR FORM
   If OKR exists:
   │   └─► Populate form with existing data
   │
   If OKR doesn't exist:
   │   └─► Display empty form with defaults:
   │       - objective_text: ''
   │       - key_result_1: '', progress: 0
   │       - key_result_2: '', progress: 0
   │       - key_result_3: '', progress: 0

5. USER FILLS IN OKR
   User enters:
   - Objective: "Complete quarterly reporting"
   - KR1: "Submit draft report" - 75%
   - KR2: "Get approval" - 50%
   - KR3: "Distribute to stakeholders" - 0%
   - Challenges: "Waiting for finance data"
   - Support: "Need system access"

6. USER CLICKS "SAVE"
   onclick="saveOKR()"
   │
   ├─► Extract form values
   │   okrData = {
   │     objective_text: '...',
   │     key_result_1: '...',
   │     key_result_1_progress: 75,
   │     ...
   │   }
   │
   ├─► Determine if create or update:
   │   if (existingOKRId) → update
   │   else → create
   │
   └─► apiCall('okrs/create' or 'okrs/update', okrData)

7. BACKEND: SAVE OKR
   OKRController.save(data, userId)
   │
   ├─► Validate required fields
   │   - objective_text (required)
   │   - At least 1 key result (required)
   │
   ├─► Calculate overall_progress
   │   overall = (kr1 + kr2 + kr3) / count
   │
   ├─► Set metadata
   │   created_at/updated_at
   │   status = 'DRAFT'
   │
   └─► OKRModel.create(data) or update(okr_id, data)

8. DATABASE: INSERT/UPDATE RECORD
   OKRs sheet:
   │
   └─► Append or update row with OKR data

9. RESPONSE TO FRONTEND
   { success: true, data: okrData, message: 'OKR saved' }
   │
   └─► saveOKR() receives result

10. FRONTEND COMPLETION
    if (result.success):
    │
    ├─► Show toast: "OKR saved successfully"
    ├─► Update UI with saved data
    └─► Enable "Submit" button

11. USER CLICKS "SUBMIT"
    onclick="submitOKR()"
    │
    └─► apiCall('okrs/submit', {okr_id})

12. BACKEND: SUBMIT OKR
    OKRController.submit(okr_id, userId)
    │
    ├─► Validate OKR exists
    ├─► Validate status is 'DRAFT'
    ├─► Update status to 'SUBMITTED'
    ├─► Set submitted_at timestamp
    └─► Log audit trail

13. FRONTEND: UPDATE UI
    if (result.success):
    │
    ├─► Disable form fields (read-only)
    ├─► Show "Submitted" badge
    ├─► Display "Awaiting Review" message
    └─► Hide "Submit" button

14. MANAGER NOTIFICATION
    System triggers:
    ├─► In-app notification to manager
    ├─► Email notification (optional)
    └─► Dashboard badge update

15. MANAGER REVIEWS
    Manager navigates to "OKRs to Review"
    │
    ├─► Clicks "Review" on pending OKR
    ├─► Opens okrReviewModal
    ├─► Adds feedback: "Good progress, focus on KR3"
    ├─► Selects "Approve" or "Reject"
    └─► Clicks "Submit Review"

16. BACKEND: PROCESS REVIEW
    OKRController.review(data)
    │
    ├─► Validate manager permissions
    ├─► Update status to 'APPROVED' or 'REJECTED'
    ├─► Save review_notes
    ├─► Set reviewed_by, reviewed_at
    └─► Send notification to user

17. USER NOTIFICATION
    User receives:
    ├─► In-app notification
    ├─► Email with review feedback
    └─► OKR status update

┌─────────────────────────────────────────────────────────────────────────┐
│                         WORKFLOW COMPLETE                                │
└─────────────────────────────────────────────────────────────────────────┘
```

## Week Calculation Logic

### Determine Week Number

```javascript
function getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

function getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
    return new Date(d.setDate(diff));
}

function getWeekEnd(date) {
    const start = getWeekStart(date);
    const end = new Date(start);
    end.setDate(start.getDate() + 6); // Add 6 days to get Sunday
    return end;
}

function getQuarterFromMonth(month) {
    return Math.floor(month / 3) + 1;
}
```

### Week Context

```javascript
// Example: 2026-02-03 (Tuesday)
{
    date: '2026-02-03',
    year: 2026,
    quarter: 1,              // Jan-Mar = Q1
    week_number: 5,          // 5th week of year
    week_start_date: '2026-02-02',  // Monday
    week_end_date: '2026-02-08'     // Sunday
}
```

## Validation Rules

### Frontend Validation

```javascript
function validateOKRForm(okrData) {
    const errors = [];

    // Objective text
    if (!okrData.objective_text || okrData.objective_text.trim() === '') {
        errors.push({
            field: 'objective_text',
            message: 'Objective is required'
        });
    }

    if (okrData.objective_text && okrData.objective_text.length > 500) {
        errors.push({
            field: 'objective_text',
            message: 'Objective too long (max 500 characters)'
        });
    }

    // At least one key result
    const hasKeyResult = okrData.key_result_1 ||
                        okrData.key_result_2 ||
                        okrData.key_result_3;

    if (!hasKeyResult) {
        errors.push({
            field: 'key_result_1',
            message: 'At least one key result is required'
        });
    }

    // Progress values
    ['key_result_1_progress', 'key_result_2_progress', 'key_result_3_progress'].forEach(field => {
        const value = okrData[field];
        if (value !== null && value !== undefined && value !== '') {
            if (value < 0 || value > 100) {
                errors.push({
                    field: field,
                    message: 'Progress must be between 0 and 100'
                });
            }
        }
    });

    return {
        isValid: errors.length === 0,
        errors: errors
    };
}
```

### Backend Validation

```javascript
// In OKRController.gs
function validateOKRData(data, isUpdate = false) {
    const errors = [];

    // Required fields
    if (!data.objective_text) {
        errors.push('Objective text is required');
    }

    if (!data.year || data.year < 2020 || data.year > 2100) {
        errors.push('Invalid year');
    }

    if (!data.quarter || data.quarter < 1 || data.quarter > 4) {
        errors.push('Invalid quarter');
    }

    if (!data.week_number || data.week_number < 1 || data.week_number > 53) {
        errors.push('Invalid week number');
    }

    // Week date validation
    if (data.week_start_date && data.week_end_date) {
        const start = new Date(data.week_start_date);
        const end = new Date(data.week_end_date);
        const diff = (end - start) / (1000 * 60 * 60 * 24);

        if (diff !== 6) {
            errors.push('Week range must be exactly 7 days (Monday to Sunday)');
        }
    }

    // Duplicate check
    if (!isUpdate) {
        const existing = OKRModel.getByUserWeek(data.user_id, data.year, data.quarter, data.week_number);
        if (existing) {
            errors.push('OKR already exists for this week');
        }
    }

    return {
        isValid: errors.length === 0,
        errors: errors
    };
}
```

## UI Components

### OKR Entry Form

**Features**:
- Rich text editor for objective
- Dynamic key result fields (show/hide based on usage)
- Progress sliders for each KR
- Challenge/support text areas
- Auto-save (draft)
- Submit button with validation

### OKR Review Form (Manager)

**Features**:
- Read-only OKR display
- Overall progress visualization
- Review notes text area
- Approve/Reject buttons
- Historical comparison (previous weeks)

### Progress Dashboard

**Features**:
- Week-by-week trend chart
- Average progress across period
- Completion rate by KR
- Challenge summary
- Team comparison (managers)

## Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "OKR already exists for this week" | User tries to create duplicate | Load existing OKR for editing |
| "Cannot edit submitted OKR" | Status is SUBMITTED or higher | Must reject first |
| "At least one key result required" | No KR filled in | Require KR1 |
| "Progress must be 0-100" | Invalid progress value | Validate input range |
| "Not authorized to review" | Non-manager tries review | Check permissions |

### Error Messages

```javascript
const OKR_ERRORS = {
    DUPLICATE_OKR: 'You already have an OKR for this week. Please edit the existing one.',
    INVALID_STATUS: 'Cannot edit OKR with status: {status}',
    MISSING_OBJECTIVE: 'Please enter an objective.',
    MISSING_KEY_RESULT: 'Please add at least one key result.',
    INVALID_PROGRESS: 'Progress values must be between 0 and 100.',
    UNAUTHORIZED_REVIEW: 'You do not have permission to review OKRs.',
    INVALID_WEEK: 'Invalid week number or date range.',
    ALREADY_SUBMITTED: 'This OKR has already been submitted.',
    NOT_PENDING_REVIEW: 'This OKR is not pending review.'
};
```

## Debug Logging

Categories used in OKR module:

| Category | Usage |
|----------|-------|
| `'OKR'` | General OKR operations |
| `'OKR_CRUD'` | Create, update, delete |
| `'OKR_WORKFLOW'` | Submit, review, approve |
| `'OKR_PROGRESS'` | Progress calculations |
| `'OKR_VALIDATION'` | Validation errors |

Example:
```javascript
debugLog('OKR_WORKFLOW', 'OKR submitted', {
    okr_id: okrData.okr_id,
    user_id: okrData.user_id,
    week: `${okrData.year}-Q${okrData.quarter}-W${okrData.week_number}`
});
```

## Next Steps

- See [Controllers](./06-controllers.md#okrcontrollergs) for controller implementation
- See [Models](./07-models.md#modelsokrgs) for data model
- See [Database Schema](./40-database-schema.md#26-okrs-table) for table structure
- See [Creating CRUD Module](./51-creating-crud-module.md) for patterns
