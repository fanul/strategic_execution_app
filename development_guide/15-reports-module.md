# Reports Module

## Overview

The Reports module generates:
- KPI summary reports
- OKR summary reports
- Performance dashboards
- Exportable data (CSV, Google Sheets)

## Backend Files

| File | Description |
|------|-------------|
| Controllers/ReportController.gs | Report business logic |
| Services/ReportService.gs | Report generation utilities |
| ExportService.gs | Export functionality |

## Frontend Files

| File | Description |
|------|-------------|
| pages/reports.html | Reports and analytics page |
| assets/js/reports_crud.html | Report generation scripts |

## Report Types

### KPI Summary Report

```javascript
{
    title: 'KPI Summary Report',
    period: 'January 2026',
    summary: {
        totalKPIs: 45,
        onTrack: 30,
        atRisk: 10,
        offTrack: 5
    },
    byDirectorate: [
        {
            directorate: 'Finance',
            totalKPIs: 10,
            onTrack: 8,
            atRisk: 2,
            offTrack: 0,
            averageAchievement: 92
        },
        // ...
    ]
}
```

### OKR Summary Report

```javascript
{
    title: 'OKR Summary Report',
    period: 'Q1 2026',
    summary: {
        totalOKRs: 120,
        submitted: 110,
        approved: 100,
        averageProgress: 72
    },
    byWorkUnit: [
        {
            workUnit: 'IT Department',
            totalOKRs: 15,
            averageProgress: 78,
            completionRate: 93
        },
        // ...
    ]
}
```

### Performance Dashboard

```javascript
{
    year: 2026,
    overallScore: 82,
    kpiPerformance: {
        organizational: 85,
        individual: 79
    },
    okrPerformance: {
        averageProgress: 75,
        completionRate: 88
    },
    trend: [
        { month: 'Jan', score: 78 },
        { month: 'Feb', score: 82 }
    ]
}
```

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `reports/kpi` | Generate KPI report |
| `reports/okr` | Generate OKR report |
| `reports/performance` | Generate performance dashboard |
| `reports/export/csv` | Export data to CSV |
| `reports/export/sheets` | Export to Google Sheets |
| `reports/sendEmail` | Send report via email |

## Export Formats

### CSV Export

```javascript
{
    filename: 'kpi_report_2026_02.csv',
    data: [
        ['KPI Code', 'KPI Name', 'Target', 'Actual', 'Achievement %'],
        ['KPI-001', 'Revenue', 1000000, 850000, 85]
    ]
}
```

### Google Sheets Export

Creates a new Google Sheet with formatted data and returns the sheet ID.

## Next Steps

- See [Controllers](./06-controllers.md#reportcontrollergs) for controller details
- See [Services](./05-services.md#reportservicegs) for service details
