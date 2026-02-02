# Routing Module

## Overview

The Routing module provides a modular, maintainable API routing system that decouples route handling from the main Code.gs file. Each domain has its own route handler, making the codebase easier to understand, debug, and extend.

## Architecture

```
Code.gs (Entry Point)
    ↓
callAPI(endpoint, data)
    ↓
Router.route(endpoint, data, userId)
    ↓
RouteRegistry.getRoute(resource)
    ↓
[Domain]Routes.route[action](action, data, userId)
    ↓
[Domain]Controller.action()
```

## File Structure

```
Routing/
├── README.md                  # This file
├── Router.gs                  # Main router dispatcher
├── RouteRegistry.gs           # Route mapping registry
├── AuthRoutes.gs              # Authentication routes
├── UserRoutes.gs              # User & role management routes
├── OrganizationRoutes.gs      # Organization hierarchy routes
├── StrategicRoutes.gs         # Strategic planning routes
├── DashboardRoutes.gs         # Dashboard & reports routes
└── SystemRoutes.gs            # System-level routes (notifications, settings, etc.)
```

## Components

### Router.gs

**Purpose**: Main dispatcher that routes API requests to appropriate handlers

**Key Functions**:
- `parseEndpoint(endpoint)` - Parse endpoint into resource and action
- `route(endpoint, data, userId)` - Dispatch request to route handler
- `isValidEndpoint(endpoint)` - Validate endpoint format

**Usage**:
```javascript
// In Code.gs
const response = Router.route('directorates/list', data, userId);
```

### RouteRegistry.gs

**Purpose**: Central registry mapping resources to their route handlers

**Key Functions**:
- `getRoute(resource)` - Get routing function for resource
- `hasRoute(resource)` - Check if route exists
- `getAllResources()` - Get all registered resources

**Usage**:
```javascript
// Check if route exists
if (RouteRegistry.hasRoute('users')) {
  const handler = RouteRegistry.getRoute('users');
  const response = handler('list', data, userId);
}
```

### Domain Route Files

Each domain has its own route file with a consistent pattern:

#### AuthRoutes.gs
Handles authentication endpoints:
- `auth/login`
- `auth/logout`
- `auth/getCurrentUser`
- `auth/changePassword`

#### UserRoutes.gs
Handles user and role management:
- `users/*` - User CRUD operations
- `roles/*` - Role CRUD operations

#### OrganizationRoutes.gs
Handles organization hierarchy:
- `directorates/*` - Directorate management
- `work-units/*` - Work unit management
- `affairs/*` - Affair management
- `positions/*` - Position management

#### StrategicRoutes.gs
Handles strategic planning:
- `okrs/*` - OKR management
- `kpis/*` - KPI management
- `strategic/*` - Strategic planning
- `swot/*` - SWOT analysis
- `programs/*` - Program management
- `activities/*` - Activity management

#### DashboardRoutes.gs
Handles dashboard and reports:
- `dashboard/quick-stats`
- `dashboard/kpi-by-perspective`
- `dashboard/goals-progress`
- etc.

#### SystemRoutes.gs
Handles system-level operations:
- `notifications/*` - Notification management
- `revisions/*` - Audit trail
- `settings/*` - Application settings
- `page/get` - AJAX page navigation

## How Routing Works

### 1. Request Received

```javascript
// Frontend calls
google.script.run
  .apiCallHandler('directorates/list', {})
  .withSuccessHandler(onSuccess)
  .withFailureHandler(onFailure);
```

### 2. Code.gs Processes

```javascript
function apiCallHandler(endpoint, data) {
  const apiResult = callAPI(endpoint, data);
  // ... serialization and return
}
```

### 3. callAPI Routes

```javascript
function callAPI(endpoint, data) {
  const userId = data.userId || Session.getActiveUser().getEmail();
  const response = Router.route(endpoint, data, userId);
  // ... logging and serialization
  return response;
}
```

### 4. Router Dispatches

```javascript
// In Router.gs
route: function(endpoint, data, userId) {
  const parsed = this.parseEndpoint(endpoint);
  const routeHandler = RouteRegistry.getRoute(parsed.resource);
  return routeHandler(parsed.action, data, userId);
}
```

### 5. Domain Route Handles

```javascript
// In OrganizationRoutes.gs
routeDirectorates: function(action, data, userId) {
  switch (action) {
    case 'list':
      return OrganizationController.Directorate.getAll(data);
    case 'create':
      return OrganizationController.Directorate.create(data, userId);
    // ... more actions
  }
}
```

### 6. Controller Processes

```javascript
// In OrganizationController
Directorate: {
  getAll: function(filters) {
    // Business logic, validation, database calls
    return { success: true, data: [...] };
  }
}
```

## Adding a New Route

### Step 1: Add to Route Registry

Edit `RouteRegistry.gs`:

```javascript
routes: {
  // ... existing routes
  'newresource': NewRoutes.routeHandler
}
```

### Step 2: Create Route File

Create `Routing/NewRoutes.gs`:

```javascript
var NewRoutes = {
  routeHandler: function(action, data, userId) {
    switch (action) {
      case 'list':
        return NewController.getAll(data);
      case 'create':
        return NewController.create(data, userId);
      // ... more actions
      default:
        return { success: false, message: 'Unknown action: ' + action };
    }
  }
};
```

### Step 3: Create Controller

Create `Controllers/NewController.gs`:

```javascript
var NewController = {
  getAll: function(filters) {
    // Implementation
  },
  create: function(data, userId) {
    // Implementation
  }
  // ... more methods
};
```

## Benefits of Modular Routing

### 1. **Separation of Concerns**
- Each domain has its own route file
- Clear boundaries between different parts of the system
- Easy to locate and modify specific routes

### 2. **Improved Maintainability**
- Smaller, focused files (one domain per file)
- Easier to understand the flow
- Reduced cognitive load

### 3. **Better Debugging**
- Clear logging at each level
- Easy to trace where errors occur
- Isolated testing possible

### 4. **Easier Extension**
- Add new routes without touching main Code.gs
- No risk of breaking existing functionality
- Consistent pattern to follow

### 5. **Team Collaboration**
- Multiple developers can work on different route files
- Fewer merge conflicts
- Clear ownership

## Migration from Old Code.gs

### Before (Bloated)
```javascript
// 700+ lines in Code.gs
function callAPI(endpoint, data) {
  // Huge switch statement with all routes
  switch (resource) {
    case 'directorates':
      switch (action) {
        case 'list': // ...
        case 'create': // ...
        // 20+ more cases
      }
    case 'work-units':
      // Another 20+ cases
    // ... 10+ more resources
  }
}
```

### After (Modular)
```javascript
// 60 lines in Code.gs
function callAPI(endpoint, data) {
  const response = Router.route(endpoint, data, userId);
  // ... logging and serialization
  return response;
}
```

## Route Naming Conventions

### Endpoint Format
```
{resource}/{action}
```

### Examples
- `directorates/list` - List all directorates
- `users/create` - Create new user
- `okrs/getCurrentWeek` - Get current week OKR
- `kpis/progress/record` - Record KPI progress

### Action Naming
- **CRUD**: `list`, `get`, `create`, `update`, `delete`
- **Special**: `submit`, `review`, `verify`, `approve`
- **Nested**: Use `/` separator (e.g., `progress/record`)

## Error Handling

Each route file handles errors consistently:

```javascript
routeHandler: function(action, data, userId) {
  try {
    // ... route logic
    return result;
  } catch (error) {
    Logger.log('Error in route: ' + error.message);
    return {
      success: false,
      message: 'Error processing request',
      error: error.toString()
    };
  }
}
```

## Testing Routes

### Test Function

```javascript
function testRoute(endpoint, data) {
  const userId = Session.getActiveUser().getEmail();
  const response = Router.route(endpoint, data, userId);
  Logger.log('Response: ' + JSON.stringify(response));
  return response;
}

// Usage
testRoute('directorates/list', {});
testRoute('users/create', { username: 'test', email: 'test@example.com' });
```

## Performance Considerations

1. **Route Lookup**: O(1) via object property lookup in RouteRegistry
2. **Minimal Overhead**: One function call per request (Router.route)
3. **Caching**: Routes are registered at startup, no runtime compilation

## Best Practices

1. **Keep Routes Simple**: Routes should only dispatch, not contain business logic
2. **Consistent Response Format**: All routes return `{ success, data, message }`
3. **Log Everything**: Use Logger.log at each level for debugging
4. **Validate Early**: Validate endpoints and parameters before calling controllers
5. **Handle Errors Gracefully**: Always return valid response objects, never throw

## Troubleshooting

### Route Not Found
```
Error: Unknown resource: xxx
```
**Solution**: Add route to RouteRegistry.gs

### Action Not Found
```
Error: Unknown xxx action: yyy
```
**Solution**: Add action case to appropriate route file

### Controller Not Found
```
TypeError: Cannot read property 'getAll' of undefined
```
**Solution**: Create controller file being referenced

## Future Enhancements

- [ ] Add middleware support (authentication, logging, rate limiting)
- [ ] Add route versioning (v1/directorates, v2/directorates)
- [ ] Add route parameter validation
- [ ] Add batch route operations
- [ ] Add route documentation generator

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-02-02 | Initial modular routing system |

---

**Maintainer**: Development Team
**Last Updated**: 2026-02-02
