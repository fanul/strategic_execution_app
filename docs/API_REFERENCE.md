# API Reference - Strategic Execution Monitoring Application

## Overview

The Strategic Execution Monitoring Application uses a RESTful API architecture with a unified `callAPI()` function as the single entry point for all frontend-backend communication.

## Base URL

```
https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

## Authentication

All API calls require valid authentication. The application uses session-based authentication managed by the `AuthManager` class.

```javascript
// Example: Login
api.call('auth/login', { username, password })
```

## API Endpoint Structure

All endpoints follow this pattern:

```
callAPI(endpoint, data)
```

Where `endpoint` is structured as: `controller/resource/action`

## Controllers & Endpoints

### 1. Authentication Controller (`auth`)

#### Get Current User
```javascript
callAPI('auth/me', {})
```
**Response:**
```json
{
  "success": true,
  "data": {
    "user_id": "user-001",
    "username": "mohammad.afwanul",
    "email": "mohammad.afwanul@bpjsketenagakerjaan.go.id",
    "full_name": "Mohammad Afwanul",
    "role_name": "Super Admin",
    "role_code": "SUPER_ADMIN",
    "is_admin": true
  }
}
```

#### Logout
```javascript
callAPI('auth/logout', {})
```

---

### 2. Organization Controller (`organization`)

#### Directorates

**List all directorates:**
```javascript
callAPI('organization/directorate/list', {})
```

**Create directorate:**
```javascript
callAPI('organization/directorate/create', {
  directorate_name: "Information Technology",
  description: "IT Department"
})
```

**Update directorate:**
```javascript
callAPI('organization/directorate/update', {
  directorate_id: "dir-uuid",
  directorate_name: "Technology",
  description: "Updated description"
})
```

**Delete directorate:**
```javascript
callAPI('organization/directorate/delete', {
  directorate_id: "dir-uuid"
})
```

#### Work Units

**List all work units:**
```javascript
callAPI('organization/workunit/list', {})
```

**Create work unit:**
```javascript
callAPI('organization/workunit/create', {
  work_unit_name: "Software Development",
  directorate_id: "dir-uuid",
  description: "Dev team"
})
```

**Update work unit:**
```javascript
callAPI('organization/workunit/update', {
  work_unit_id: "wu-uuid",
  work_unit_name: "Development",
  description: "Updated"
})
```

**Delete work unit:**
```javascript
callAPI('organization/workunit/delete', {
  work_unit_id: "wu-uuid"
})
```

#### Affairs

**List affairs:**
```javascript
callAPI('organization/affair/list', {})
```

**Create affair:**
```javascript
callAPI('organization/affair/create', {
  affair_name: "Application Development",
  work_unit_id: "wu-uuid"
})
```

#### Positions

**List positions:**
```javascript
callAPI('organization/position/list', {})
```

**Create position:**
```javascript
callAPI('organization/position/create', {
  position_name: "Senior Developer",
  position_level: 5,
  work_unit_id: "wu-uuid"
})
```

#### Position Assignments

**List assignments:**
```javascript
callAPI('organization/assignment/list', {
  position_id: "pos-uuid"
})
```

**Create assignment:**
```javascript
callAPI('organization/assignment/create', {
  user_id: "user-uuid",
  position_id: "pos-uuid",
  start_date: "2025-01-01",
  end_date: "2025-12-31"
})
```

---

### 3. Strategic Controller (`strategic`)

#### Periods

**List periods:**
```javascript
callAPI('strategic/periods/list', {})
```

**Create period:**
```javascript
callAPI('strategic/periods/create', {
  period_name: "2025 Strategic Plan",
  start_date: "2025-01-01",
  end_date: "2025-12-31"
})
```

**Set active period:**
```javascript
callAPI('strategic/periods/set-active', {
  period_id: "period-uuid"
})
```

#### Visions

**Get visions by period:**
```javascript
callAPI('strategic/visions/by-period', {
  period_id: "period-uuid"
})
```

**Create vision:**
```javascript
callAPI('strategic/visions/create', {
  period_id: "period-uuid",
  vision_name: "Become industry leader by 2030",
  vision_description: "..."
})
```

**Approve vision:**
```javascript
callAPI('strategic/visions/approve', {
  visionId: "vision-uuid"
})
```

#### Missions

**Get missions by vision:**
```javascript
callAPI('strategic/missions/by-vision', {
  vision_id: "vision-uuid"
})
```

**Create mission:**
```javascript
callAPI('strategic/missions/create', {
  vision_id: "vision-uuid",
  mission_name: "Deliver innovative solutions",
  mission_description: "..."
})
```

#### Goals

**Get goals by year:**
```javascript
callAPI('strategic/goals/by-year', {
  year: 2025
})
```

**Get goal details:**
```javascript
callAPI('strategic/goals/get', {
  goal_id: "goal-uuid"
})
```

**Create goal:**
```javascript
callAPI('strategic/goals/create', {
  goal_name: "Digital Transformation",
  goal_description: "Achieve digital excellence",
  year: 2025,
  target_value: 100
})
```

#### Initiatives

**Get initiatives by year:**
```javascript
callAPI('strategic/initiatives/by-year', {
  year: 2025
})
```

**Create initiative:**
```javascript
callAPI('strategic/initiatives/create', {
  initiative_name: "Cloud Migration",
  year: 2025
})
```

---

### 4. KPI Controller (`kpi`)

#### Organizational KPIs

**List organizational KPIs:**
```javascript
callAPI('kpi/organizational/list', {
  year: 2025,
  work_unit_id: "wu-uuid" // optional
})
```

**Create KPI:**
```javascript
callAPI('kpi/organizational/create', {
  kpi_name: "Customer Satisfaction",
  year: 2025,
  directorate_id: "dir-uuid",
  work_unit_id: "wu-uuid",
  perspective: "CUSTOMER",
  target_value: 90
})
```

**Update KPI:**
```javascript
callAPI('kpi/organizational/update', {
  kpi_id: "kpi-uuid",
  target_value: 95
})
```

#### Individual KPIs

**Get user KPIs:**
```javascript
callAPI('kpi/individual/list', {
  user_id: "user-uuid",
  year: 2025
})
```

**Create individual KPI:**
```javascript
callAPI('kpi/individual/create', {
  kpi_name: "Task Completion Rate",
  user_id: "user-uuid",
  year: 2025,
  target_value: 90
})
```

#### Progress Recording

**Record KPI progress:**
```javascript
callAPI('kpi/progress/record', {
  kpi_id: "kpi-uuid",
  actual_value: 85,
  period: "Q1",
  recording_date: "2025-03-31"
})
```

---

### 5. Programs Controller (`programs`)

**List all programs:**
```javascript
callAPI('programs/list', {
  year: 2025
})
```

**Create program:**
```javascript
callAPI('programs/create', {
  program_name: "Digital Platform",
  description: "Build new platform",
  start_date: "2025-01-01",
  end_date: "2025-12-31",
  budget_allocated: 500000
})
```

**Update program:**
```javascript
callAPI('programs/update', {
  program_id: "prog-uuid",
  progress_percentage: 75
})
```

**Get program activities:**
```javascript
callAPI('programs/activities', {
  programId: "prog-uuid"
})
```

**Create activity:**
```javascript
callAPI('programs/activity/create', {
  program_id: "prog-uuid",
  activity_name: "Design Phase",
  start_date: "2025-01-01",
  end_date: "2025-03-31"
})
```

---

### 6. OKR Controller (`okr`)

**Get my OKRs:**
```javascript
callAPI('okr/my-okrs', {
  user_id: "user-uuid",
  year: 2025
})
```

**Create OKR:**
```javascript
callAPI('okr/create', {
  objective: "Improve team productivity",
  key_result: "Complete 50 tasks per week",
  target_value: 50,
  week_number: 1,
  year: 2025
})
```

**Submit OKR:**
```javascript
callAPI('okr/submit', {
  okr_id: "okr-uuid"
})
```

---

### 7. Impact Centers Controller (`impact-centers`)

**List impact centers:**
```javascript
callAPI('impact-centers/list', {})
```

**Create impact center:**
```javascript
callAPI('impact-centers/create', {
  center_name: "Digital Innovation Hub",
  description: "...",
  leader_id: "user-uuid",
  target_completion_date: "2025-12-31"
})
```

**Submit progress:**
```javascript
callAPI('impact-centers/progress/submit', {
  impact_center_id: "ic-uuid",
  progress_percentage: 50,
  achievements: "...",
  challenges: "..."
})
```

**Get assigned work units:**
```javascript
callAPI('impact-centers/work-units/list', {
  impact_center_id: "ic-uuid"
})
```

**Assign work unit:**
```javascript
callAPI('impact-centers/work-units/assign', {
  impact_center_id: "ic-uuid",
  work_unit_id: "wu-uuid"
})
```

---

### 8. SWOT Analysis Controller (`swot`)

**Get SWOT by goal:**
```javascript
callAPI('swot/list', {
  goal_id: "goal-uuid"
})
```

**Get SWOT matrix:**
```javascript
callAPI('swot/matrix', {
  goal_id: "goal-uuid"
})
```

**Get impact analysis:**
```javascript
callAPI('swot/impact', {
  goal_id: "goal-uuid"
})
```

**Create SWOT item:**
```javascript
callAPI('swot/create', {
  goal_id: "goal-uuid",
  category: "S", // S, W, O, T
  factor: "Strong brand recognition",
  description: "Well-known in the market",
  impact_level: "HIGH",
  priority_level: "HIGH"
})
```

**Update SWOT:**
```javascript
callAPI('swot/update', {
  analysis_id: "swot-uuid",
  factor: "Updated factor"
})
```

**Delete SWOT:**
```javascript
callAPI('swot/delete', {
  analysis_id: "swot-uuid"
})
```

---

### 9. Import Controller (`import`)

**Validate import data:**
```javascript
callAPI('import/validate', {
  entity_type: "users", // users, directorates, workunits, kpis, goals
  data: [...] // Array of objects to validate
})
```

**Process import:**
```javascript
callAPI('import/process', {
  entity_type: "users",
  data: [...],
  options: {
    updateExisting: false,
    skipDuplicates: true
  }
})
```

**Get template:**
```javascript
callAPI('import/template', {
  entity_type: "users"
})
```

---

### 10. Reports Controller (`reports`)

**Generate KPI report:**
```javascript
callAPI('reports/kpi-summary', {
  year: 2025,
  directorate_id: "dir-uuid" // optional
})
```

**Generate OKR report:**
```javascript
callAPI('reports/okr-performance', {
  year: 2025,
  user_id: "user-uuid" // optional
})
```

---

### 11. Users Controller (`users`)

**List all users:**
```javascript
callAPI('users/list', {})
```

**Create user:**
```javascript
callAPI('users/create', {
  username: "john.doe",
  email: "john.doe@example.com",
  full_name: "John Doe",
  role_id: "role-uuid",
  password: "SecurePassword123!"
})
```

**Update user:**
```javascript
callAPI('users/update', {
  user_id: "user-uuid",
  full_name: "John Smith",
  email: "john.smith@example.com"
})
```

**Delete user:**
```javascript
callAPI('users/delete', {
  user_id: "user-uuid"
})
```

---

### 12. Roles Controller (`roles`)

**List all roles:**
```javascript
callAPI('roles/list', {})
```

**Create role:**
```javascript
callAPI('roles/create', {
  role_name: "Department Head",
  role_code: "DEPT_HEAD",
  permissions: {
    users: { create: false, read: true, update: false, delete: false },
    kpi: { create: true, read: true, update: true, delete: false }
  }
})
```

**Update role:**
```javascript
callAPI('roles/update', {
  role_id: "role-uuid",
  permissions: { ... }
})
```

**Delete role:**
```javascript
callAPI('roles/delete', {
  role_id: "role-uuid"
})
```

---

## Response Format

All API responses follow this standard format:

### Success Response
```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Operation completed successfully"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

---

## Error Codes

| Code | Description |
|------|-------------|
| `AUTH_REQUIRED` | User not authenticated |
| `PERMISSION_DENIED` | Insufficient permissions |
| `INVALID_INPUT` | Invalid request data |
| `NOT_FOUND` | Resource not found |
| `DUPLICATE_ENTRY` | Duplicate record exists |
| `VALIDATION_ERROR` | Data validation failed |
| `SERVER_ERROR` | Internal server error |

---

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **100 requests per minute** per user
- **1000 requests per hour** per user

Exceeding limits returns `429 Too Many Requests`.

---

## Pagination

List endpoints support pagination:

```javascript
callAPI('users/list', {
  page: 1,
  pageSize: 50
})
```

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [...],
    "pagination": {
      "page": 1,
      "pageSize": 50,
      "totalPages": 10,
      "totalRecords": 500
    }
  }
}
```

---

## Filtering & Sorting

List endpoints support filtering and sorting:

```javascript
callAPI('kpi/organizational/list', {
  year: 2025,
  directorate_id: "dir-uuid",
  sortBy: "kpi_name",
  sortOrder: "asc"
})
```

---

## Frontend API Client

Use the `APIClient` class from `assets/js/api.js`:

```javascript
import api from 'assets/js/api.js';

// Example calls
const kpis = await api.call('kpi/organizational/list', { year: 2025 });
const result = await api.call('strategic/goals/create', goalData);
```

---

## Webhooks

The application supports webhooks for real-time notifications:

### Register Webhook
```javascript
callAPI('webhooks/register', {
  url: "https://your-server.com/webhook",
  events: ["kpi.updated", "goal.created"],
  secret: "webhook-secret-key"
})
```

### Webhook Payload
```json
{
  "event": "kpi.updated",
  "timestamp": "2025-01-30T10:00:00Z",
  "data": {
    "kpi_id": "kpi-uuid",
    "changes": { ... }
  },
  "signature": "sha256=..."
}
```

---

## Versioning

API version: **v1.0**

Include version in requests:
```javascript
callAPI('v1/users/list', {})
```

---

## Support

For API issues or questions, contact: support@example.com
