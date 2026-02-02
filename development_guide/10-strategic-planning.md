# Strategic Planning Module

## Overview

The Strategic Planning module manages organizational strategic direction through:
- Strategic Periods (timeframes)
- Vision statements
- Mission statements
- Strategic Initiatives
- Organizational Goals
- Work Unit Goals

## Hierarchy

```
Strategic Period (e.g., 2026-2030)
│
├── Vision
│   │
│   └── Mission
│       │
│       └── Strategic Initiative
│           │
│           └── Organizational Goal
│               │
│               └── Work Unit Goal
│                   │
│                   ├── KPI
│                   └── Program
```

## Backend Files

| File | Description |
|------|-------------|
| Controllers/StrategicController.gs | Strategic business logic |
| Models/Strategic.gs | Strategic data model |

## Frontend Files

| File | Description |
|------|-------------|
| pages/strategic-plan.html | Strategic planning page |
| assets/js/strategic_crud.html | Strategic CRUD operations |

## Data Structures

### Strategic Period

```javascript
{
    period_id: 'uuid',
    period_name: '2026-2030 Strategic Plan',
    start_year: 2026,
    end_year: 2030,
    description: 'Five year strategic direction',
    is_active: true,
    created_at: '2026-01-01 09:00:00',
    created_by: 'user-uuid',
    updated_at: '2026-02-01 14:20:00',
    updated_by: 'user-uuid'
}
```

### Vision

```javascript
{
    vision_id: 'uuid',
    period_id: 'period-uuid',
    vision_text: 'To be the leading provider...',
    perspective: 'FINANCIAL',  // FINANCIAL, CUSTOMER, INTERNAL_PROCESS, LEARNING_GROWTH
    status: 'APPROVED',  // DRAFT, SUBMITTED, APPROVED
    approved_by: 'user-uuid',
    approved_at: '2026-01-15 10:00:00',
    created_at: '2026-01-01 09:00:00',
    created_by: 'user-uuid',
    updated_at: '2026-02-01 14:20:00',
    updated_by: 'user-uuid'
}
```

### Mission

```javascript
{
    mission_id: 'uuid',
    vision_id: 'vision-uuid',
    mission_text: 'We will achieve this by...',
    status: 'APPROVED',
    approved_by: 'user-uuid',
    approved_at: '2026-01-15 10:00:00',
    created_at: '2026-01-01 09:00:00',
    created_by: 'user-uuid',
    updated_at: '2026-02-01 14:20:00',
    updated_by: 'user-uuid'
}
```

### Organizational Goal

```javascript
{
    goal_id: 'uuid',
    goal_code: 'G-2026-001',
    goal_name: 'Increase market share',
    goal_type: 'PERFORMANCE',  // PERFORMANCE, STRATEGIC, OPERATIONAL
    perspective: 'CUSTOMER',
    year: 2026,
    description: '...',
    target_value: '25%',
    baseline_value: '15%',
    unit_of_measurement: '%',
    weight: 10,
    status: 'ACTIVE',
    created_at: '2026-01-01 09:00:00',
    created_by: 'user-uuid',
    updated_at: '2026-02-01 14:20:00',
    updated_by: 'user-uuid'
}
```

## API Endpoints

### Periods

| Endpoint | Description |
|----------|-------------|
| `periods/list` | Get all periods |
| `periods/getActive` | Get active period |
| `periods/setActive` | Set period as active |
| `periods/create` | Create new period |
| `periods/update` | Update period |
| `periods/delete` | Delete period |
| `periods/getDeletionImpact` | Check cascade impact |
| `periods/deleteCascade` | Delete with cascade |

### Visions

| Endpoint | Description |
|----------|-------------|
| `visions/create` | Create vision (max 1000 chars) |
| `visions/update` | Update vision |
| `visions/delete` | Delete vision |
| `visions/approve` | Approve vision |
| `visions/getByPeriod` | Get visions by period |

### Missions

| Endpoint | Description |
|----------|-------------|
| `missions/create` | Create mission (max 1500 chars) |
| `missions/update` | Update mission |
| `missions/delete` | Delete mission |
| `missions/approve` | Approve mission |
| `missions/getByVision` | Get missions by vision |

### Goals

| Endpoint | Description |
|----------|-------------|
| `goals/create` | Create organizational goal |
| `goals/update` | Update goal |
| `goals/delete` | Delete goal |
| `goals/getByYear` | Get goals by year |

### Work Unit Goals

| Endpoint | Description |
|----------|-------------|
| `workUnitGoals/create` | Create work unit goal |
| `goals/getByWorkUnit` | Get goals by work unit |
| `goals/getByOrgGoal` | Get work unit goals by org goal |

## Next Steps

- See [Controllers](./06-controllers.md#strategiccontrollergs) for controller details
- See [Models](./07-models.md#modelsstrategicgs) for model details
