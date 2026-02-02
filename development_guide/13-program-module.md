# Program Module

## Overview

The Program module manages:
- Programs linked to work unit goals
- Activities within programs
- Budget tracking
- Progress monitoring

## Backend Files

| File | Description |
|------|-------------|
| Controllers/ProgramController.gs | Program business logic |
| Models/Program.gs | Program data model |

## Frontend Files

| File | Description |
|------|-------------|
| pages/programs.html | Program management page |
| layout/modals/program_modals.html | Program form modals |
| assets/js/programs_crud.html | Program CRUD operations |

## Hierarchy

```
Work Unit Goal
│
└── Program
    │
    ├── KPI Mapping
    │
    └── Activities
```

## Data Structures

### Program

```javascript
{
    program_id: 'uuid',
    work_unit_goal_id: 'goal-uuid',
    program_code: 'PRG-2026-001',
    program_name: 'Digital Transformation Initiative',
    program_type: 'STRATEGIC',  // STRATEGIC, OPERATIONAL, ROUTINE
    description: '...',
    objective: 'Modernize IT infrastructure',
    start_date: '2026-01-01',
    end_date: '2026-12-31',
    budget: 500000000,
    currency: 'IDR',
    status: 'ACTIVE',  // DRAFT, ACTIVE, ON_HOLD, COMPLETED, CANCELLED
    progress_percentage: 45,
    responsible_person_id: 'user-uuid',
    created_at: '2026-01-01 09:00:00',
    created_by: 'user-uuid',
    updated_at: '2026-02-01 14:20:00',
    updated_by: 'user-uuid',
    notes: ''
}
```

### Activity

```javascript
{
    activity_id: 'uuid',
    program_id: 'program-uuid',
    activity_code: 'ACT-001',
    activity_name: 'Server Migration',
    description: '...',
    start_date: '2026-02-01',
    end_date: '2026-03-31',
    budget: 50000000,
    status: 'IN_PROGRESS',  // NOT_STARTED, IN_PROGRESS, COMPLETED, DELAYED
    progress_percentage: 30,
    responsible_person_id: 'user-uuid',
    created_at: '2026-01-01 09:00:00',
    created_by: 'user-uuid',
    updated_at: '2026-02-01 14:20:00',
    updated_by: 'user-uuid',
    notes: ''
}
```

### KPI-Program Mapping

```javascript
{
    mapping_id: 'uuid',
    kpi_id: 'kpi-uuid',
    program_id: 'program-uuid',
    weight_percentage: 25,
    contribution_type: 'DIRECT',  // DIRECT, INDIRECT
    created_at: '2026-01-01 09:00:00',
    created_by: 'user-uuid'
}
```

## API Endpoints

### Programs

| Endpoint | Description |
|----------|-------------|
| `programs/list` | Get all programs |
| `programs/get` | Get program by ID |
| `programs/create` | Create program |
| `programs/update` | Update program |
| `programs/delete` | Delete program |
| `programs/getByWorkUnitGoal` | Get programs by work unit goal |

### Activities

| Endpoint | Description |
|----------|-------------|
| `activities/create` | Create activity |
| `activities/update` | Update activity |
| `activities/delete` | Delete activity |
| `activities/getByProgram` | Get activities by program |

## Next Steps

- See [Controllers](./06-controllers.md#programcontrollergs) for controller details
- See [Models](./07-models.md#modelsprogramgs) for model details
