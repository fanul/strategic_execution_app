# KPI Module

## Overview

The KPI (Key Performance Indicator) module manages:
- Organizational KPIs at work unit level
- Individual KPIs at position level
- Monthly progress tracking
- Achievement calculation and status

## Backend Files

| File | Description |
|------|-------------|
| Controllers/KPIController.gs | KPI business logic |
| Models/KPI.gs | KPI data model |

## Frontend Files

| File | Description |
|------|-------------|
| pages/kpi.html | KPI management page |
| assets/js/kpi_crud.html | KPI CRUD operations |

## KPI Hierarchy

```
Work Unit Goal
│
├── Organizational KPI
│   │
│   └── Monthly Progress (actual, target, achievement %)
│
└── Program
    └── KPI-Program Mapping
```

```
Position
│
└── Individual KPI
    │
    └── Monthly Progress (actual, target, achievement %)
```

## Data Structures

### Organizational KPI

```javascript
{
    kpi_id: 'uuid',
    work_unit_goal_id: 'goal-uuid',
    kpi_code: 'KPI-2026-001',
    year: 2026,
    directorate_id: 'directorate-uuid',
    work_unit_id: 'work-unit-uuid',
    kpi_type: 'ORGANIZATIONAL',  // ORGANIZATIONAL, INDIVIDUAL
    perspective: 'FINANCIAL',  // FINANCIAL, CUSTOMER, INTERNAL_PROCESS, LEARNING_GROWTH
    goal_id: 'goal-uuid',
    kpi_name: 'Revenue Growth',
    weight_percentage: 15,
    target_value: 1000000,
    unit_of_measurement: 'IDR',
    assessment_type: 'NUMERICAL',  // NUMERICAL, PERCENTAGE, QUALITATIVE
    calculation_type: 'ACTUAL_MINUS_TARGET',  // ACTUAL_MINUS_TARGET, PERCENTAGE, CUSTOM
    glossary: 'Total revenue for the period',
    is_derived_kpi: false,
    parent_kpi_id: null,
    maximum_limit: 2000000,
    measurement_period: 'MONTHLY',
    baseline_value: 800000,
    status: 'ACTIVE',
    created_at: '2026-01-01 09:00:00',
    created_by: 'user-uuid',
    updated_at: '2026-02-01 14:20:00',
    updated_by: 'user-uuid',
    notes: ''
}
```

### KPI Monthly Progress

```javascript
{
    progress_id: 'uuid',
    kpi_id: 'kpi-uuid',
    year: 2026,
    month: 2,
    actual_value: 850000,
    target_value: 1000000,
    achievement_percentage: 85,
    variance: -150000,
    variance_percentage: -15,
    status: 'OFF_TRACK',  // ON_TRACK, AT_RISK, OFF_TRACK
    verified_by: 'user-uuid',
    verified_at: '2026-02-15 10:00:00',
    notes: 'Lower than expected due to market conditions',
    created_at: '2026-02-01 09:00:00',
    created_by: 'user-uuid',
    updated_at: '2026-02-15 10:00:00',
    updated_by: 'user-uuid'
}
```

### Individual KPI

```javascript
{
    individual_kpi_id: 'uuid',
    position_id: 'position-uuid',
    year: 2026,
    kpi_code: 'IKPI-2026-001',
    kpi_name: 'Project Completion Rate',
    perspective: 'INTERNAL_PROCESS',
    weight_percentage: 20,
    target_value: 90,
    unit_of_measurement: '%',
    assessment_type: 'PERCENTAGE',
    calculation_type: 'PERCENTAGE',
    description: 'Percentage of projects completed on time',
    status: 'ACTIVE',
    created_at: '2026-01-01 09:00:00',
    created_by: 'user-uuid',
    updated_at: '2026-02-01 14:20:00',
    updated_by: 'user-uuid',
    notes: ''
}
```

## KPI Status Calculation

| Achievement % | Status |
|---------------|--------|
| >= 90% | ON_TRACK |
| 75-89% | AT_RISK |
| < 75% | OFF_TRACK |

## API Endpoints

### Organizational KPIs

| Endpoint | Description |
|----------|-------------|
| `kpis/list` | Get all KPIs |
| `kpis/get` | Get KPI by ID |
| `kpis/create` | Create KPI |
| `kpis/update` | Update KPI |
| `kpis/delete` | Delete KPI |
| `kpis/getByWorkUnit` | Get KPIs by work unit and year |

### KPI Progress

| Endpoint | Description |
|----------|-------------|
| `kpis.progress/record` | Record monthly progress |
| `kpis.progress/verify` | Verify progress entry |
| `kpis.progress/getByKPI` | Get progress for KPI |
| `kpis.progress/getByWorkUnit` | Get progress for work unit |

### Individual KPIs

| Endpoint | Description |
|----------|-------------|
| `kpis.individual/create` | Create individual KPI |
| `kpis.individual/update` | Update individual KPI |
| `kpis.individual/delete` | Delete individual KPI |
| `kpis.individual/getByPosition` | Get KPIs by position and year |

## Next Steps

- See [Controllers](./06-controllers.md#kpicontrollergs) for controller details
- See [Models](./07-models.md#modelskpigs) for model details
