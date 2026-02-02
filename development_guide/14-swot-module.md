# SWOT Module

## Overview

The SWOT (Strengths, Weaknesses, Opportunities, Threats) module provides:
- Goal-based SWOT analysis
- Impact analysis with recommendations
- Visual matrix display

## Backend Files

| File | Description |
|------|-------------|
| Controllers/SWOTController.gs | SWOT business logic (if exists) |
| Models/ (SWOT is part of Strategic model) | Data model |

## Frontend Files

| File | Description |
|------|-------------|
| pages/swot.html | SWOT analysis page |
| layout/modals/swot_modals.html | SWOT form modals |
| assets/js/swot_crud.html | SWOT CRUD operations |

## SWOT Categories

| Category | Description |
|----------|-------------|
| **Strengths (S)** | Internal positive attributes |
| **Weaknesses (W)** | Internal negative attributes |
| **Opportunities (O)** | External positive factors |
| **Threats (T)** | External negative factors |

## Data Structure

```javascript
{
    analysis_id: 'uuid',
    goal_id: 'goal-uuid',
    category: 'STRENGTH',  // STRENGTH, WEAKNESS, OPPORTUNITY, THREAT
    title: 'Strong brand recognition',
    description: 'Our brand is well-known in the market...',
    impact_level: 'HIGH',  // HIGH, MEDIUM, LOW
    probability: 'HIGH',  // For O and T: HIGH, MEDIUM, LOW
    status: 'ACTIVE',  // ACTIVE, MITIGATED, EXPLOITED, CLOSED
    mitigation_strategy: '...',
    created_at: '2026-01-01 09:00:00',
    created_by: 'user-uuid',
    updated_at: '2026-02-01 14:20:00',
    updated_by: 'user-uuid'
}
```

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `swot/matrix` | Get SWOT matrix for a goal |
| `swot/create` | Create SWOT item |
| `swot/update` | Update SWOT item |
| `swot/delete` | Delete SWOT item |
| `swot/impact` | Get impact analysis with recommendations |
| `swot/getByGoal` | Get all SWOT items for a goal |

## Impact Analysis

The impact analysis provides:
- Summary of SWOT items by category
- Priority items based on impact level
- Strategic recommendations
- TOWS Matrix integration

## Next Steps

- See [Controllers](./06-controllers.md#swotcontrollergs) for controller details
- See [Strategic Planning](./10-strategic-planning.md) for related module
