# Strategic Execution Monitoring - Development Guide

Welcome to the comprehensive development guide for the Strategic Execution Monitoring (SEM) system. This guide is modularized to help you quickly find the information you need for developing specific modules.

## Quick Navigation

### Getting Started
- [01. Project Overview](./01-project-overview.md) - Introduction, technology stack, features
- [02. Architecture](./02-architecture.md) - System architecture and design patterns

### Core Files & Configuration
- [03. File Structure](./03-file-structure.md) - Complete project file structure ⭐ **UPDATED**
- [04. Core Files](./04-core-files.md) - Code.gs, API.gs, Config.gs, Auth.gs ⭐ **Code.gs REFACTORED**
- [05. Services](./05-services.md) - PagesConfig, AuditService, DatabaseService

### Backend Modules
- [06. Controllers](./06-controllers.md) - All controller documentation
- [07. Models](./07-models.md) - All model documentation
- [08. Routing System](../Routing/README.md) - **NEW Modular API routing** ⭐

### Feature Modules
- [08. Organization Module](./08-organization-module.md) - **Complete organization management system** ⭐
  - Table view (DataTables) and Diagram view (D3.js)
  - CRUD operations for Directorates, Work Units, Affairs, Positions
  - Enhanced delete with cascade/reassign options
  - Lazy loading and caching
- [09. User Management](./09-user-management.md) - User and role management
- [10. Strategic Planning](./10-strategic-planning.md) - Vision, mission, goals, initiatives
- [11. KPI Module](./11-kpi-module.md) - KPI management and tracking
- [12. OKR Module](./12-okr-module.md) - **Weekly OKR management with workflow** ⭐
  - Weekly objective entry
  - Key results tracking (up to 3 per objective)
  - Submit → Review → Approve workflow
  - Progress calculations
  - Manager review system
- [13. Program Module](./13-program-module.md) - Program and activity management
- [14. SWOT Module](./14-swot-module.md) - SWOT analysis
- [15. Reports Module](./15-reports-module.md) - Report generation

### Frontend
- [20. Frontend Structure](./20-frontend-structure.md) - Frontend architecture
- [21. Frontend Components](./21-frontend-components.md) - UI components and patterns
- [22. JavaScript Modules](./22-javascript-modules.md) - Client-side modules

### Development
- [30. Development Workflow](./30-development-workflow.md) - Setup, deployment, testing
- [31. Patterns & Conventions](./31-patterns-conventions.md) - Coding standards
- [32. API Reference](./32-api-reference.md) - Complete API endpoint reference

### Reference
- [40. Database Schema](./40-database-schema.md) - **Complete database schema** ⭐
  - All 28 tables with detailed column definitions
  - Relationships and constraints
  - Enumerations and data types
  - Validation rules and business logic
  - Performance considerations
- [41. Utility Functions](./41-utility-functions.md) - **StringUtils and DateUtils reference** ⭐
  - String manipulation functions
  - Date formatting and calculations
  - UUID generation, code generation
  - Complete examples and usage patterns

### Module Development Guides
- [50. Creating a New Module](./50-creating-new-module.md) - Step-by-step guide for creating new modules
- [51. Creating CRUD Module](./51-creating-crud-module.md) - Guide for CRUD modules
- [52. Creating Dashboard Widget](./52-creating-dashboard-widget.md) - Dashboard widget guide

## ⭐ Featured Documentation

These documents have been recently enhanced with comprehensive details:

1. **[Routing System](../Routing/README.md)** - **NEW Modular API routing** ⭐
   - Complete routing architecture
   - Modular route files by domain
   - Router, RouteRegistry, and domain routes
   - Step-by-step routing flow
   - How to add new routes
   - Migration guide from old Code.gs

2. **[Code.gs Refactoring](./04-core-files.md#codegs)** - **REFACTORED v2.0** ⭐
   - Reduced from 850+ lines to 365 lines
   - Extracted all API routing to Routing/ folder
   - Cleaner separation of concerns
   - Easier to debug and maintain

3. **[Organization Module](./08-organization-module.md)** - The most complete module documentation with:
   - Full architecture diagrams
   - Complete data flow examples
   - Enhanced delete flow (cascade/reassign)
   - DataTable manager with lazy loading
   - D3.js diagram visualization
   - API endpoints and request/response examples

4. **[OKR Module](./12-okr-module.md)** - Recently enhanced with:
   - Complete workflow documentation
   - Progress calculation formulas
   - Week calculation logic
   - Validation rules (frontend and backend)
   - Detailed data flow diagrams
   - Manager review system

5. **[Database Schema](./40-database-schema.md)** - Comprehensive reference with:
   - All 28 tables fully documented
   - Column types, constraints, relationships
   - Enumerations reference
   - Validation rules
   - Performance considerations

6. **[Utility Functions](./41-utility-functions.md)** - Complete reference with:
   - StringUtils functions (20+ utilities)
   - DateUtils functions (30+ utilities)
   - Usage examples for each function
   - Best practices and performance tips

## How to Use This Guide

### For New Developers
1. Start with [Project Overview](./01-project-overview.md)
2. Review [Architecture](./02-architecture.md) for system design
3. **NEW**: Study [Routing System](../Routing/README.md) to understand API flow
4. Study [Organization Module](./08-organization-module.md) as a reference implementation
5. Explore [Database Schema](./40-database-schema.md) to understand data structure

### For Feature Development
1. Find your module in Feature Modules section
2. Review the module's architecture and data flow
3. Follow the patterns from [Organization Module](./08-organization-module.md)
4. Use [Utility Functions](./41-utility-functions.md) for common operations

### For Creating New Modules
1. Follow [Creating a New Module](./50-creating-new-module.md)
2. Adapt patterns from [Organization Module](./08-organization-module.md)
3. Reference [Patterns & Conventions](./31-patterns-conventions.md)
4. Check [API Reference](./32-api-reference.md) for endpoint patterns

### For API Development
1. Review [API Reference](./32-api-reference.md) for endpoint formats
2. Study [Controllers](./06-controllers.md) for implementation patterns
3. Use [Response Patterns](./31-patterns-conventions.md) for consistent responses

## Module Templates

The following modules serve as templates for building similar features:

| Module | Template For | Key Features |
|--------|--------------|--------------|
| **Organization Module** | Hierarchical entities | Table + Diagram views, cascade delete, lazy loading |
| **OKR Module** | Workflow-based entities | State transitions, approval workflow, progress tracking |
| **KPI Module** | Time-series data | Monthly progress, calculations, verification |
| **User Management** | CRUD with permissions | Role-based access, permissions, audit trail |

## Conventions Used

| Symbol | Meaning |
|--------|---------|
| `code` | Code or file name |
| **Bold** | Important concept |
| *Italic* | Emphasis |
| [Link] | Reference to another document |
| ⭐ | Recently enhanced or featured documentation |

## Common Patterns

### Response Format
All API responses follow this format:
```javascript
{
  success: boolean,
  data: any,
  message: string,
  error: any
}
```

### Controller Pattern
```javascript
const MyController = {
  create(data, creatorId) {
    // 1. Validate
    // 2. Check constraints
    // 3. Call model
    // 4. Log audit
    // 5. Return result
  }
};
```

### Model Pattern
```javascript
const MyModel = {
  findById(id) { ... },
  getAll(filters) { ... },
  create(data) { ... },
  update(id, data) { ... }
};
```

## Support

For questions or issues, refer to:
- [Testing Guide](../TESTING_GUIDE.md) - Testing procedures
- [Development Workflow](./30-development-workflow.md) - Setup and deployment
- [Patterns & Conventions](./31-patterns-conventions.md) - Coding standards

## Documentation Improvements

This guide is continuously improving. The following modules have been recently enhanced to match the detail level of the [Organization Module](./08-organization-module.md):

### ✅ Completed
- [x] [Database Schema](./40-database-schema.md) - Complete table documentation
- [x] [Utility Functions](./41-utility-functions.md) - StringUtils and DateUtils reference
- [x] [OKR Module](./12-okr-module.md) - Enhanced with workflow and validation details

### 🚧 In Progress
- [ ] Strategic Planning Module enhancement
- [ ] KPI Module enhancement
- [ ] Program Module enhancement
- [ ] SWOT Module enhancement
- [ ] Reports Module enhancement
- [ ] Authentication & Authorization module
- [ ] Roles & Permissions module

### 📋 Planned
- [ ] Creating CRUD Module guide (detailed step-by-step)
- [ ] Frontend Component guide (Bootstrap patterns)
- [ ] Testing Guide (unit and integration tests)
- [ ] Performance Optimization guide
- [ ] Security Best Practices guide

## Tips for Contributors

When adding or improving documentation:

1. **Follow the Organization Module template** - It's our most comprehensive example
2. **Include complete data flows** - Show end-to-end processes with ASCII diagrams
3. **Add code examples** - Real, working code snippets
4. **Document API endpoints** - Request/response examples for each endpoint
5. **Include validation rules** - Both frontend and backend
6. **Add error handling** - Common errors and solutions
7. **Show architecture diagrams** - ASCII art for system components
8. **Reference related modules** - Link to related documentation

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.3.0 | 2026-02-02 | **Code.gs Refactored**: Modular routing system, updated file structure |
| 1.2.0 | 2026-02-02 | Added Database Schema and Utility Functions, enhanced OKR Module |
| 1.1.0 | 2026-02-02 | Enhanced Organization Module with complete documentation |
| 1.0.0 | 2026-02-01 | Initial modular documentation structure |

---

**Version**: 1.3.0
**Last Updated**: 2026-02-02
**Maintainer**: Development Team
