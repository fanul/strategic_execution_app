# User Manual - Strategic Execution Monitoring Application

## Table of Contents
1. [Getting Started](#getting-started)
2. [Dashboard](#dashboard)
3. [Strategic Planning](#strategic-planning)
4. [KPI Management](#kpi-management)
5. [Program Management](#program-management)
6. [OKR Tracking](#okr-tracking)
7. [Organization Management](#organization-management)
8. [SWOT Analysis](#swot-analysis)
9. [Reports](#reports)
10. [Import & Export](#import--export)

---

## Getting Started

### System Requirements

- **Web Browser:** Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Internet:** Stable connection (offline mode available after install)
- **Screen Resolution:** 1280x720 minimum (recommended: 1920x1080)

### First Time Login

1. Navigate to the application URL
2. Enter your username and password
3. Click **Login**
4. Complete your profile if prompted

### Password Reset

1. Click **Forgot Password** on login screen
2. Enter your email address
3. Check your email for reset link
4. Create new password

---

## Dashboard

### Overview

The dashboard provides an at-a-glance view of your strategic execution status.

### Key Metrics

- **Total Goals:** Number of active strategic goals
- **Active KPIs:** KPIs being tracked this period
- **Performance Score:** Overall achievement percentage
- **Pending Reviews:** Items awaiting approval

### Traffic Light Indicators

- 🟢 **Green:** >90% achievement (on track)
- 🟡 **Yellow:** 70-90% achievement (needs attention)
- 🔴 **Red:** <70% achievement (critical)

### Using the Dashboard

1. **View Charts:** Hover over charts for detailed values
2. **Filter by Period:** Use the period dropdown to change time range
3. **Drill Down:** Click on any metric to see details
4. **Export:** Click export icon to save dashboard as PDF/image

---

## Strategic Planning

### Periods

**Create Strategic Period:**
1. Navigate to **Strategic Plan > Periods**
2. Click **+ New Period**
3. Enter period name, start/end dates
4. Click **Save**

**Set Active Period:**
- Click the star icon next to a period to make it active

### Visions

**Create Vision:**
1. Navigate to **Strategic Plan > Visions**
2. Click **+ New Vision**
3. Select period and enter vision statement
4. Add description
5. Click **Save**

**SMART Vision Checker:**
- Use the built-in validator to check if your vision meets SMART criteria
- Click the "Validate" button when creating/editing

### Missions

**Create Mission:**
1. Navigate to **Strategic Plan > Missions**
2. Select parent vision
3. Enter mission statement
4. Click **Save**

### Goals

**Create Goal:**
1. Navigate to **Strategic Plan > Goals**
2. Click **+ New Goal**
3. Enter goal name and description
4. Set target year and value
5. Link to parent vision/mission (optional)
6. Click **Save**

**Period Rollover:**
1. Go to **Strategic Plan > Periods**
2. Select a period
3. Click **Rollover** button
4. Choose target year
5. Select items to copy (visions, missions, goals)
6. Click **Execute**

---

## KPI Management

### Creating KPIs

1. Navigate to **KPIs > Organizational KPIs**
2. Click **+ New KPI**
3. Fill in the form:
   - **KPI Name:** Clear, specific name
   - **Description:** What it measures
   - **Perspective:** Financial, Customer, Process, Learning
   - **Target Value:** Numeric target
   - **Unit:** %, number, currency, etc.
   - **Directorate/Work Unit:** Organizational assignment
4. Click **Save**

### Recording Progress

1. Navigate to **KPIs > My KPIs**
2. Find the KPI to update
3. Click **Record Progress**
4. Enter actual value
5. Add notes/comments
6. Click **Save**

### KPI Dashboard

- **Traffic Light View:** Visual status of all KPIs
- **Trend Analysis:** Historical performance charts
- **Achievement Forecast:** Predicts if KPI will meet target

---

## Program Management

### Creating Programs

1. Navigate to **Programs**
2. Click **+ New Program**
3. Enter program details:
   - **Program Name**
   - **Description**
   - **Start/End Dates**
   - **Budget**
   - **Program Manager**
4. Click **Save**

### Adding Activities

1. Open a program
2. Go to **Activities** tab
3. Click **+ Add Activity**
4. Enter activity name, dates, responsible person
5. Set dependencies (optional)
6. Click **Save**

### Gantt Chart View

1. Open a program
2. Click **Gantt Chart** tab
3. **Drag** activities to adjust dates
4. **Zoom** in/out with mouse wheel
5. **Click** activities for details

---

## OKR Tracking

### Weekly OKR Submission

1. Navigate to **OKRs > My OKRs**
2. Click **+ New OKR**
3. Enter:
   - **Objective:** What you want to achieve
   - **Key Result:** Measurable outcome
   - **Target Value:** Number to hit
   - **Week Number:** Current week
4. Click **Save**
5. Click **Submit** when ready

### OKR Quality Scoring

- The system automatically scores your OKRs
- Aim for **80%+ score** for high-quality OKRs
- Check suggestions for improvement

### OKR-KPI Alignment

- View alignment percentage in OKR details
- Ensures your OKRs support organizational KPIs

---

## Organization Management

### Organization Structure

**Add Directorate:**
1. Navigate to **Organization > Directorates**
2. Click **+ New Directorate**
3. Enter name and description
4. Click **Save**

**Add Work Unit:**
1. Select a directorate
2. Go to **Work Units** tab
3. Click **+ New Work Unit**
4. Enter details
5. Click **Save**

### Position Management

**Create Position:**
1. Navigate to **Organization > Positions**
2. Click **+ New Position**
3. Enter position name, level
4. Assign to work unit
5. Click **Save**

**Assign Position:**
1. Open position details
2. Click **Assign**
3. Select user and dates
4. System checks for overlap
5. Click **Save**

### Organization Diagram

1. Navigate to **Organization > Diagram**
2. **Interactive Controls:**
   - **Zoom:** +/- buttons or mouse wheel
   - **Pan:** Click and drag
   - **Collapse/Expand:** Click node icons
   - **Search:** Type name to highlight
3. **Right-Click Menu:**
   - Add/Edit/Delete nodes
   - View details
   - Export as PDF/PNG

---

## SWOT Analysis

### Creating SWOT

1. Navigate to **Reports > SWOT Analysis**
2. Select a goal
3. Click **+ Add SWOT Item**
4. Choose category:
   - **S**trength (Internal positive)
   - **W**eakness (Internal negative)
   - **O**pportunity (External positive)
   - **T**hreat (External negative)
5. Enter factor and description
6. Set impact and priority level
7. Click **Save**

### Using SWOT Matrix

- **Matrix View:** Visual quadrants showing all items
- **Strategy View:** Auto-generated TOWS strategies
  - **SO:** Use strengths to capitalize on opportunities
  - **WO:** Address weaknesses to pursue opportunities
  - **ST:** Use strengths to mitigate threats
  - **WT:** Minimize weaknesses to avoid threats

### Impact vs Priority Chart

- Scatter plot showing all SWOT items
- X-axis: Impact level
- Y-axis: Priority level
- Use for prioritization decisions

---

## Reports

### Custom Report Builder

1. Navigate to **Reports > Report Builder**
2. **Select Data Source:** KPIs, Goals, Programs, etc.
3. **Choose Fields:** Drag fields to report canvas
4. **Add Filters:** Set criteria to filter data
5. **Add Sections:** Tables, charts, or KPI cards
6. **Preview:** Click **Generate Report**
7. **Export:** Choose PDF, Excel, or CSV

### Pre-built Reports

- **KPI Summary Report:** All KPIs with status
- **Goal Progress Report:** Strategic goal tracking
- **OKR Status Report:** Weekly OKR overview
- **Program Timeline:** Gantt chart view
- **Budget Analysis:** Financial performance
- **Organization Summary:** Structure overview

### Export Options

- **PDF:** Best for printing and sharing
- **Excel:** For further analysis
- **PowerPoint:** For presentations
- **CSV:** For data processing

---

## Import & Export

### Import Data

1. Navigate to **Settings > Import**
2. **Select Entity Type:** Users, KPIs, Goals, etc.
3. **Download Template:** Get the correct format
4. **Prepare Data:** Fill in template
5. **Upload File:** Excel, CSV, or JSON
6. **Map Columns:** Match file columns to system fields
7. **Preview:** Check first 10 rows
8. **Validate:** Check for errors
9. **Import:** Click **Start Import**
10. **Review:** See import summary

### Export Data

1. Navigate to any list view
2. Click **Export** button
3. Choose format:
   - **Excel:** Formatted with multiple sheets
   - **PDF:** Professional report
   - **CSV:** Raw data
   - **PowerPoint:** Presentation slides
4. Click **Download**

---

## Global Search

### Quick Search (Ctrl+K / Cmd+K)

1. Press **Ctrl+K** (Windows) or **Cmd+K** (Mac)
2. Type your search query
3. Results grouped by entity type
4. Click to navigate

### Recent Searches

- Shows your last 5 searches
- Click to re-run
- Clear history anytime

---

## Notifications

### Notification Bell

- Located in top-right corner
- Shows unread count
- Red badge for urgent items

### Notification Center

1. Click bell icon
2. See recent notifications
3. Click notification to view details
4. Mark as read automatically

### Notification Settings

1. Go to **Settings > Notifications**
2. Configure per-type preferences:
   - OKR reminders
   - KPI update due
   - Approval requests
   - Budget alerts
   - Deadline warnings

---

## PWA Installation

### Install on Desktop (Chrome/Edge)

1. Look for install icon in address bar
2. Click **Install**
3. Confirm installation
4. App available from Start menu

### Install on Mobile (iOS)

1. Tap **Share** button
2. Scroll down, tap **Add to Home Screen**
3. Tap **Add**
4. App appears on home screen

### Install on Mobile (Android)

1. Tap menu (three dots)
2. Tap **Add to Home Screen** or **Install App**
3. Confirm installation

### Offline Mode

After installation:
- App works without internet
- Changes sync when back online
- View cached data offline

---

## Tips & Best Practices

### KPIs

- Set realistic targets based on historical data
- Update progress regularly (monthly recommended)
- Use trend analysis to identify patterns
- Red KPIs require immediate action

### OKRs

- Submit every week
- Write measurable key results
- Aim for 3-5 objectives per week
- Use auto-scoring to improve quality

### Strategic Planning

- Create visions 3-5 years out
- Break down into missions and goals
- Review and update annually
- Use period rollover to save time

### Programs

- Break large initiatives into activities
- Set realistic timelines
- Assign clear ownership
- Use Gantt chart to visualize dependencies

### SWOT Analysis

- Be honest about weaknesses
- Involve team in brainstorming
- Update quarterly
- Use generated strategies for planning

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Ctrl+K / Cmd+K | Global search |
| Ctrl+N | New record (context-aware) |
| Ctrl+S | Save current form |
| Esc | Close modal/dropdown |
| Ctrl+E | Export current view |
| F5 | Refresh data |

---

## Troubleshooting

### App Won't Load

1. Check internet connection
2. Clear browser cache
3. Try different browser
4. Check if service is down

### Data Not Saving

1. Check for error messages
2. Ensure all required fields filled
3. Check network connection
4. Try again after refresh

### Export Not Working

1. Disable popup blocker
2. Check download folder
3. Try different format
4. Clear browser cache

### Performance Issues

1. Close other browser tabs
2. Clear browser cache
3. Use latest browser version
4. Check internet speed

---

## Getting Help

### Contact Support

- **Email:** support@example.com
- **Phone:** +1-234-567-8900
- **Hours:** Mon-Fri, 9AM-5PM

### Documentation

- [API Reference](./API_REFERENCE.md)
- [Admin Guide](./ADMIN_GUIDE.md)

### Training

- Request training session through your manager
- Online tutorials available in Help menu
- Video walkthroughs on YouTube channel

---

## Privacy & Security

### Your Data

- All data encrypted in transit
- Regular security audits
- GDPR compliant
- Data retention: 7 years post-employment

### Your Rights

- Export your data anytime
- Request deletion
- Update consent preferences
- View privacy policy in Settings

---

## Version History

- **v1.0** (January 2025) - Initial release
- **v1.1** (February 2025) - Added SWOT analysis, offline mode
- **v1.2** (March 2025) - Enhanced reporting, PWA support

---

**Document Version:** 1.0
**Last Updated:** January 30, 2025
