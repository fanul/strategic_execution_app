# Development Workflow

## Overview

This guide covers the development workflow for the SEM application.

## Initial Setup

### 1. Prerequisites

- Google Account with Google Apps Script access
- Node.js and npm installed
- clasp CLI installed: `npm install -g @google/clasp`
- Git installed (optional)

### 2. Clone/Download Project

```bash
# If using Git
git clone <repository-url>
cd strategic-execution-app

# Or download and extract
```

### 3. Install clasp

```bash
npm install -g @google/clasp
```

### 4. Login to Google

```bash
clasp login
```

This opens a browser for Google authentication.

### 5. Clone Existing Project (if needed)

```bash
# Get script ID from Apps Script URL
# https://script.google.com/d/<SCRIPT_ID>/edit

clasp clone <SCRIPT_ID>
```

### 6. Initialize Database

```bash
# Open Apps Script editor
# Run setupCompleteDatabase() function
```

This will:
- Create all 28 database sheets
- Set up headers
- Create default roles
- Create super admin user

**Default Credentials**:
- Email: mohammad.afwanul@bpjsketenagakerjaan.go.id
- Username: mohammad.afwanul
- Password: SuperAdmin@2026

## Development Mode

Enable development mode in Index.html:

```javascript
const DEVELOPMENT_MODE = true;
const ENABLE_DEBUG_PANEL = true;
const MOCK_DATA = false;
```

Development mode provides:
- Debug panel visibility
- Detailed logging
- Bypassed authentication (when MOCK_DATA = true)

## Development Workflow

### 1. Make Changes

Edit files in your project directory. The main file types are:

| File Type | Extension | Description |
|-----------|-----------|-------------|
| Server Script | .gs | Google Apps Script (JavaScript) |
| HTML Template | .html | HTML with server-side templating |
| JavaScript Module | .html in assets/js/ | Client-side scripts |

### 2. Test Locally (if applicable)

Most functionality requires server-side execution. Use the debug panel to trace issues.

### 3. Deploy Changes

```bash
# Push all changes to Google Apps Script
clasp push

# Watch for changes and auto-push
clasp push --watch
```

### 4. Test in Browser

1. Open web app URL
2. Test functionality
3. Check browser console for errors
4. Check debug panel for API calls

## Clasp Commands

```bash
# Push changes
clasp push

# Pull changes
clasp pull

# Open in browser
clasp open

# List files
clasp list

# Deploy
clasp deploy

# Versions
clasp versions

# Undeploy
clasp undeploy <deploymentId>
```

## .claspignore

The `.claspignore` file specifies which files to exclude from deployment:

```
node_modules/
.git/
development_guide/
TESTING_GUIDE.md
DEVELOPMENT_GUIDE.md
**/*.md
```

## Debugging

### Frontend Debugging

1. **Browser Console**: Open DevTools (F12)
2. **Debug Panel**: Enable in Index.html with `ENABLE_DEBUG_PANEL = true`
3. **Network Tab**: Monitor API calls

### Backend Debugging

1. **Apps Script Logger**: View > Logs in Apps Script editor
2. **Stackdriver Logging**: For production debugging

### Debug Logging

Use `debugLog()` throughout the code:

```javascript
debugLog('CATEGORY', 'Message', data);
```

Categories:
- `CRUD` - CRUD operations
- `API` - API calls
- `DT` - DataTable operations
- `VIEW` - View operations
- `DELETE` - Delete operations

## Testing

### Manual Testing Checklist

- [ ] Login/logout works
- [ ] All pages accessible
- [ ] CRUD operations work
- [ ] DataTable pagination, search, sort
- [ ] Modals open/close correctly
- [ ] Toast notifications display
- [ ] Error handling works
- [ ] Audit trail records changes

See [TESTING_GUIDE.md](../TESTING_GUIDE.md) for detailed testing instructions.

## Code Review Checklist

Before pushing changes:

- [ ] Code follows naming conventions
- [ ] Functions have JSDoc comments
- [ ] Error handling implemented
- [ ] Audit logging added
- [ ] Frontend validation implemented
- [ ] Backend validation implemented
- [ ] No hardcoded values (use Config)
- [ ] Debug logs added for troubleshooting

## Deployment

### Production Deployment

1. Update version in Config.gs:
```javascript
VERSION: '1.0.1'
```

2. Deploy as new version:
```bash
clasp deploy version <versionNumber> "Description"
```

3. Update web app URL if needed

### Rollback

If issues occur:

1. Go to Apps Script editor
2. File > Project Versions
3. Select previous version
4. Deploy

## Troubleshooting

### "Cannot read property of undefined"

- Check if element exists before accessing
- Verify data structure from API
- Check API response in debug panel

### API returns success: false

- Check browser console for errors
- Check debug panel for API response
- Check Apps Script Logger for backend errors

### DataTable not initializing

- Verify jQuery and DataTables loaded
- Check table ID matches
- Verify data structure matches columns

### Modal not opening

- Check modal ID matches
- Verify Bootstrap loaded
- Check for JavaScript errors

## Best Practices

1. **Use IIFE pattern** for all JavaScript modules
2. **Always validate** input on both client and server
3. **Log audit trail** for all data changes
4. **Use async/await** for API calls
5. **Handle errors** gracefully with user-friendly messages
6. **Comment complex logic** for maintainability
7. **Follow naming conventions** consistently

## Next Steps

- See [Patterns & Conventions](./31-patterns-conventions.md) for coding standards
- See [API Reference](./32-api-reference.md) for API documentation
- See [Creating a New Module](./50-creating-new-module.md) for module development
