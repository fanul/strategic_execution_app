# Deployment Guide - Strategic Execution Monitoring Application

## Pre-Deployment Checklist

### ✅ Code Verification

- [x] All JavaScript files created and referenced
- [x] All HTML pages created
- [x] CSS styling complete
- [x] PWA manifest configured
- [x] Service worker registered
- [x] API routes defined in Code.js
- [x] Controllers created for new features
- [x] Documentation complete

### ✅ File Structure Verification

```
strategic execution/
├── Code.js                          ✅ Main entry point with API routing
├── Index.html                       ✅ Main app container with all scripts
├── Dashboard.html                   ✅ Executive dashboard with charts
├── appsscript.json                  ✅ Project configuration
├── manifest.json                    ✅ PWA manifest
├── service-worker.js                ✅ Offline support
│
├── Controllers/
│   ├── ImportController.js          ✅ Import functionality
│   └── SWOTController.js            ✅ SWOT analysis
│
├── pages/
│   ├── organization-diagram.html    ✅ D3.js org chart
│   ├── import.html                  ✅ Data import UI
│   ├── notifications.html           ✅ Notification center
│   ├── swot-analysis.html           ✅ SWOT analysis page
│   └── report-builder.html          ✅ Custom report builder
│
├── assets/
│   ├── css/
│   │   └── custom.css               ✅ Custom styling
│   │
│   └── js/
│       ├── utils.js                 ✅ Utility functions
│       ├── api.js                   ✅ API client
│       ├── auth.js                  ✅ Authentication
│       ├── components.js            ✅ UI components
│       ├── app.js                   ✅ Main app logic
│       ├── charts.js                ✅ Chart.js components
│       ├── org-diagram.js           ✅ D3.js diagram
│       ├── search.js                ✅ Global search
│       ├── notifications.js         ✅ Notification center
│       ├── export.js                ✅ PDF/Excel/PP export
│       ├── enhanced-features.js     ✅ Bulk actions, SMART validator
│       ├── security.js              ✅ CSRF, RLS, GDPR
│       └── pwa-install.js           ✅ PWA installation
│
└── docs/
    ├── API_REFERENCE.md             ✅ Complete API documentation
    ├── USER_MANUAL.md               ✅ User guide
    └── DEPLOYMENT_GUIDE.md          ✅ This file
```

---

## Step-by-Step Deployment

### Step 1: Install/Update Clasp

```bash
npm install -g @google/clasp
```

### Step 2: Login to Google Apps Script

```bash
clasp login
```

This will open a browser window for OAuth authentication.

### Step 3: Verify Project Configuration

Check `appsscript.json`:

```json
{
  "timeZone": "Asia/Jakarta",
  "dependencies": {
    "enabledAdvancedServices": [
      {
        "userSymbol": "Sheets",
        "serviceId": "v5",
        "version": "v5"
      }
    ]
  },
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8"
}
```

### Step 4: Check .clasp.json

Ensure `.clasp.json` exists with correct script ID:

```json
{
  "scriptId": "YOUR_SCRIPT_ID_HERE"
}
```

If you're creating a new project:
```bash
clasp create --title "Strategic Execution Monitoring" --type "webapp"
```

### Step 5: Pull Current Version (Safety Backup)

```bash
# Backup current remote code
clasp pull
mkdir backup_$(date +%Y%m%d)
cp -r * backup_$(date +%Y%m%d)/
```

### Step 6: Push All Files

```bash
# Push all files to Google Apps Script
clasp push
```

**Expected Output:**
```
└─ Code.js
├─ Controllers/ImportController.js
├─ Controllers/SWOTController.js
├─ assets/css/custom.css
├─ assets/js/app.js
├─ assets/js/api.js
├─ assets/js/auth.js
├─ assets/js/components.js
├─ assets/js/utils.js
├─ assets/js/charts.js
├─ assets/js/org-diagram.js
├─ assets/js/search.js
├─ assets/js/notifications.js
├─ assets/js/export.js
├─ assets/js/enhanced-features.js
├─ assets/js/security.js
├─ assets/js/pwa-install.js
├─ docs/API_REFERENCE.md
├─ docs/USER_MANUAL.md
├─ docs/DEPLOYMENT_GUIDE.md
├─ pages/organization-diagram.html
├─ pages/import.html
├─ pages/notifications.html
├─ pages/swot-analysis.html
├─ pages/report-builder.html
├─ Dashboard.html
├─ Index.html
├─ manifest.json
└─ service-worker.js

Pushed 30 files.
```

### Step 7: Deploy as Web App

```bash
clasp deploy
```

Or deploy via the Apps Script editor:

1. Open **Publish > Deploy as web app**
2. **Execute as:** Me (your email)
3. **Who has access:** Anyone within organization (or Anyone)
4. Click **Deploy**
5. Authorize access
6. **Copy the web app URL**

### Step 8: Verify Deployment

1. Open the deployed URL
2. Check that the page loads without errors
3. Open browser console (F12)
4. Verify no JavaScript errors
5. Test key features:
   - [ ] Login works
   - [ ] Dashboard loads with charts
   - [ ] Navigation between pages works
   - [ ] API calls successful
   - [ ] PWA install prompt appears
   - [ ] Export functions work

---

## Post-Deployment Tasks

### 1. Test All Features

Create a test plan:

```bash
# Test Document
- User authentication
- Dashboard loading
- KPI creation and updates
- Goal management
- Program tracking
- OKR submission
- SWOT analysis
- Import/Export
- Organization diagram
- Global search (Ctrl+K)
- Notifications
- Reports
```

### 2. Configure Web App Permissions

**Google Cloud Console:**
1. Go to your Apps Script project
2. Click **Gear icon > Cloud Platform settings**
3. Verify GCP project is linked
4. Check API enablement

### 3. Set Up Audit Logging

Ensure audit trail is working:
```javascript
// Test audit logging
AuditService.logAudit('TEST', 'Deployment', null, 'system', {
  timestamp: new Date().toISOString()
});
```

### 4. Monitor First 24 Hours

- Check execution logs in Apps Script Dashboard
- Monitor error rates
- Verify all controllers working
- Test with multiple users

---

## Troubleshooting Deployment Issues

### Issue: "File not found" errors

**Solution:**
- Verify all files exist locally
- Check file names match exactly (case-sensitive)
- Ensure files are in correct directories
- Run `clasp status` to check sync

### Issue: Script execution quota exceeded

**Solution:**
1. Check for infinite loops in controllers
2. Optimize API calls
3. Implement caching
4. Consider increasing quota (GCP Console)

### Issue: Static files not loading (CSS/JS)

**Solution:**
- Verify `serveStaticFile()` function in Code.js
- Check file paths are correct
- Ensure all JS files are referenced in Index.html
- Clear browser cache

### Issue: API calls failing

**Solution:**
1. Check `callAPI()` routing in Code.js
2. Verify controllers exist
3. Check function names match
4. Review Apps Script execution logs

### Issue: Charts not rendering

**Solution:**
- Verify Chart.js library loaded
- Check canvas elements exist
- Validate data format
- Check for JavaScript errors in console

---

## Performance Optimization

### After Deployment

1. **Enable caching** in service worker
2. **Minify** CSS/JS for production
3. **Optimize images** (use WebP format)
4. **Lazy load** components
5. **Implement** pagination for large datasets

### Monitoring

Set up monitoring:
- Apps Script Dashboard
- Cloud Logging
- Error reporting
- Performance metrics

---

## Security Checklist

### Before Production Use

- [ ] Change default admin password
- [ ] Set up 2-factor authentication (if available)
- [ ] Review user permissions
- [ ] Enable audit logging
- [ ] Configure data retention policies
- [ ] Set up backup procedures
- [ ] Review GDPR compliance
- [ ] Test CSRF protection
- [ ] Verify row-level security

---

## Maintenance Schedule

### Daily
- Monitor error logs
- Check performance metrics
- Verify backups running

### Weekly
- Review user feedback
- Check for updates
- Audit access logs

### Monthly
- Security audit
- Performance review
- Feature usage analysis
- Backup verification

### Quarterly
- Major updates
- Feature reviews
- User training
- Documentation updates

---

## Rollback Procedure

If critical issues found:

```bash
# Stop using new version
# In Apps Script Editor:
# 1. Go to Publish > Deployments
# 2. Find previous version
# 3. Click "Edit" > "Deploy as Web App"
# 4. Select previous version
# 5. Click "Deploy"

# Or restore from backup
clasp pull
# Select backup files
clasp push
```

---

## User Communication

### Announce Deployment

**Email Template:**

```
Subject: Strategic Execution Monitoring Application - Now Live!

Dear Team,

We're excited to announce the launch of the new Strategic Execution Monitoring Application!

Key Features:
- Real-time dashboards with interactive charts
- KPI tracking with traffic light indicators
- SWOT analysis and strategic planning tools
- Program management with Gantt charts
- Offline capability (install as PWA)

Getting Started:
1. Visit: [APP_URL]
2. Login with your credentials
3. Explore the User Manual: [DOCS_URL]
4. Check out the interactive tutorials

Training sessions: [SCHEDULE]

For support: support@example.com

Best regards,
IT Team
```

---

## Success Metrics

Track these metrics post-deployment:

- **User Adoption:** % of active users
- **Feature Usage:** Most/least used features
- **Performance:** Page load time, API response time
- **Errors:** Error rate, types of errors
- **Satisfaction:** User feedback scores
- **Data Quality:** % of complete records

---

## Next Steps

After successful deployment:

1. ✅ **Week 1:** Monitor closely, fix bugs
2. ✅ **Week 2:** Gather user feedback
3. ✅ **Week 3:** Plan improvements
4. ✅ **Week 4:** Release updates

---

## Support Contacts

- **Technical Issues:** developer@example.com
- **User Support:** support@example.com
- **Feature Requests:** product@example.com
- **Emergency:** +1-234-567-8900

---

**Document Version:** 1.0
**Last Updated:** January 30, 2025
**Deployment Target:** 100% Implementation Complete
