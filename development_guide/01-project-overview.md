# Project Overview

## What is Strategic Execution Monitoring (SEM)?

The Strategic Execution Monitoring (SEM) system is a comprehensive web application built on Google Apps Script for organizational strategic planning and execution tracking. It provides tools for managing organizational hierarchy, setting strategic goals, tracking KPIs, managing OKRs, and monitoring progress across all levels of an organization.

## Core Features

### 1. Strategic Planning
- **Vision & Mission**: Define organizational vision and mission statements
- **Strategic Initiatives**: Create and track high-level strategic initiatives
- **Organizational Goals**: Set and monitor organizational goals
- **Work Unit Goals**: Cascade goals down to work units

### 2. Organization Management
- **Hierarchical Structure**: Directorates → Work Units → Affairs → Positions
- **Visual Organization Chart**: Interactive D3.js tree diagram
- **Table View**: DataTables with search, sort, and pagination
- **Position Assignment**: Assign users to positions with tracking

### 3. KPI Tracking
- **Organizational KPIs**: Define KPIs at work unit level
- **Individual KPIs**: Personal KPIs for each position
- **Monthly Progress**: Record and verify monthly progress
- **Automated Calculations**: Achievement percentages and status

### 4. OKR Management
- **Weekly OKRs**: Set weekly objectives and key results
- **Progress Tracking**: Update progress throughout the week
- **Review Workflow**: Submit, review, and approve OKRs
- **Historical Data**: Track OKR history over time

### 5. Program Management
- **Programs**: Create programs linked to work unit goals
- **Activities**: Break down programs into activities
- **Budget Tracking**: Monitor program and activity budgets
- **Progress Monitoring**: Track implementation status

### 6. SWOT Analysis
- **Goal-Based SWOT**: Analyze strengths, weaknesses, opportunities, threats
- **Impact Analysis**: Get recommendations based on SWOT items
- **Visual Matrix**: View SWOT in quadrant format

### 7. Reporting & Analytics
- **KPI Reports**: Summary reports with trend analysis
- **OKR Reports**: Team and individual OKR summaries
- **Performance Dashboard**: Visual performance indicators
- **Export Options**: Export to CSV and Google Sheets

### 8. User Management
- **Role-Based Access**: Define roles with permissions
- **User Administration**: Create and manage user accounts
- **Position Assignment**: Assign users to organizational positions
- **Audit Trail**: Track all user actions

## Technology Stack

### Backend
| Technology | Purpose |
|------------|---------|
| **Google Apps Script** | Server-side JavaScript runtime |
| **Google Sheets** | Database (28 sheets) |
| **Google Drive** | File storage and backups |

### Frontend
| Technology | Purpose |
|------------|---------|
| **HTML5** | Page structure |
| **Bootstrap 5** | UI framework and components |
| **jQuery** | DOM manipulation and AJAX |
| **DataTables** | Advanced table features |
| **D3.js** | Data visualization (org chart) |
| **Bootstrap Icons** | Icon set |

### Development Tools
| Tool | Purpose |
|------|---------|
| **clasp** | Google Apps Script CLI |
| **Git** | Version control |

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend Layer                        │
│  (HTML Templates, Bootstrap UI, jQuery, DataTables)         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                         API Routing                          │
│                    (Code.gs, API.gs)                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       Controllers Layer                       │
│  (UserController, OrganizationController, KPIController...)  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                         Models Layer                         │
│    (UserModel, OrganizationModel, KPIModel, OKRModel...)    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       Services Layer                         │
│  (DatabaseService, AuditService, NotificationService...)     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Google Sheets Database                  │
│                    (28 Data Sheets)                         │
└─────────────────────────────────────────────────────────────┘
```

## Database Structure

The system uses 28 Google Sheets as database tables:

| Category | Sheets |
|----------|--------|
| User Management | Users, Roles |
| Organization | Directorates, WorkUnits, Affairs, Positions, PositionAssignments |
| Strategic Planning | Periods, Visions, Missions, StrategicInitiatives, MissionInitiativeMapping |
| Goals | OrganizationalGoals, ImpactCenters, ICMonthlyProgress, ICWorkUnitMapping, AnalysisItems |
| KPIs | WorkUnitGoals, KPIs, KPIMonthlyProgress |
| Programs | Programs, KPIProgramMapping, Activities |
| Individual | IndividualKPIs, IndividualKPIMonthlyProgress, OKRs |
| System | Revisions, AppSettings, Notifications |

## Key Design Patterns

1. **MVC Pattern**: Controllers handle business logic, Models manage data, Views are HTML templates
2. **Repository Pattern**: DatabaseService abstracts Google Sheets operations
3. **Service Layer**: AuditService, NotificationService provide cross-cutting concerns
4. **IIFE Pattern**: JavaScript modules use IIFE for encapsulation
5. **Promise-based Async**: All API calls return Promises

## Default Access

**Super Admin Credentials**:
- Email: mohammad.afwanul@bpjsketenagakerjaan.go.id
- Username: mohammad.afwanul
- Password: SuperAdmin@2026

## Next Steps

- Continue to [Architecture](./02-architecture.md) for system design details
- See [File Structure](./03-file-structure.md) for project organization
- Check [Development Workflow](./30-development-workflow.md) to get started with development
