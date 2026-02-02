/**
 * InitializeApp.gs
 * One-time initialization script for setting up the application
 * Enhanced with version tracking and easy migration system
 * Run this manually from Apps Script editor on first deployment
 */

// Version tracking for database migrations
var APP_VERSION = '3.0.0'; // Organization Structure Redesign
var DB_VERSION = '3.0.0';

/**
 * COMPREHENSIVE SETUP - Run this function to set up everything!
 * Creates all sheets, validates headers, creates roles, and creates super admin user
 * AUTOMATICALLY RUNS MIGRATIONS if database version is outdated
 */
function setupCompleteDatabase() {
  Logger.log('========================================');
  Logger.log('STARTING COMPLETE DATABASE SETUP');
  Logger.log('App Version: ' + APP_VERSION);
  Logger.log('DB Version: ' + DB_VERSION);
  Logger.log('========================================');

  try {
    // Step 0: Check DB version and run migrations if needed
    Logger.log('\n[0/5] Checking database version...');
    const currentVersion = getDatabaseVersion();
    Logger.log(`Current DB version: ${currentVersion}`);

    if (currentVersion !== DB_VERSION) {
      Logger.log(`Database migration needed: ${currentVersion} → ${DB_VERSION}`);
      const migrationResult = runDatabaseMigrations(currentVersion, DB_VERSION);
      if (!migrationResult.success) {
        throw new Error('Migration failed: ' + migrationResult.message);
      }
      Logger.log('✓ Database migration completed');
    } else {
      Logger.log('✓ Database version is up to date');
    }

    // Step 1: Create all database sheets
    Logger.log('\n[1/5] Creating database sheets...');
    const sheetsCreated = createAllSheets();
    Logger.log(`✓ Database sheets verified: ${sheetsCreated.created.length} created, ${sheetsCreated.existing.length} already existed`);
    
    // Step 2: Validate/fix sheet headers
    Logger.log('\n[2/5] Validating sheet headers...');
    const headersFixed = validateAndFixHeaders();
    Logger.log(`✓ Headers validated: ${headersFixed.fixed} sheets updated`);

    // Step 3: Create default roles
    Logger.log('\n[3/5] Creating default roles...');
    const roles = createDefaultRoles();
    Logger.log(`✓ Default roles created: ${Object.keys(roles).length} roles`);

    // Step 4: Create super admin user
    Logger.log('\n[4/5] Creating super admin user...');
    const superAdmin = createSuperAdminUser(roles.superAdminRoleId);
    Logger.log(`✓ Super admin user: ${superAdmin.email}`);

    // Step 5: Update database version
    Logger.log('\n[5/5] Updating database version...');
    updateDatabaseVersion(DB_VERSION);
    Logger.log('✓ Database version updated to: ' + DB_VERSION);
    
    Logger.log('\n========================================');
    Logger.log('DATABASE SETUP COMPLETED SUCCESSFULLY!');
    Logger.log('========================================');
    Logger.log('\nSuper Admin Credentials:');
    Logger.log('  Email: mohammad.afwanul@bpjsketenagakerjaan.go.id');
    Logger.log('  Username: mohammad.afwanul');
    Logger.log('  Password: SuperAdmin@2026');
    Logger.log('\n⚠️ IMPORTANT: Change password on first login!');
    Logger.log('\nNext Steps:');
    Logger.log('  1. Run clasp push to deploy latest code');
    Logger.log('  2. Set DEVELOPMENT_MODE = false in Index.html');
    Logger.log('  3. Refresh the web app and login');
    
    return {
      success: true,
      message: 'Database setup completed successfully!',
      data: {
        superAdminEmail: 'mohammad.afwanul@bpjsketenagakerjaan.go.id',
        defaultPassword: 'SuperAdmin@2026',
        rolesCreated: Object.keys(roles).length,
        sheetsCreated: sheetsCreated.created.length,
        sheetsExisting: sheetsCreated.existing.length
      }
    };
    
  } catch (error) {
    Logger.log('\n========================================');
    Logger.log('ERROR DURING SETUP: ' + error.message);
    Logger.log('Stack: ' + error.stack);
    Logger.log('========================================');
    return {
      success: false,
      message: 'Setup failed: ' + error.message,
      error: error.toString()
    };
  }
}

/**
 * Get the database spreadsheet - uses same logic as DatabaseService.js
 */
function getSpreadsheet() {
  try {
    // Try to get active spreadsheet first (for bound scripts)
    let ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // If not bound, check for linked spreadsheet ID
    if (!ss) {
      const props = PropertiesService.getScriptProperties();
      const sheetId = props.getProperty('LINKED_SHEET_ID');
      
      if (sheetId) {
        try {
          ss = SpreadsheetApp.openById(sheetId);
          Logger.log(`✓ Using linked spreadsheet: ${sheetId}`);
        } catch (err) {
          Logger.log('Linked sheet not found: ' + err.message);
          ss = null;
        }
      }
      
      // Create new spreadsheet if needed
      if (!ss) {
        Logger.log('Creating new database spreadsheet...');
        ss = SpreadsheetApp.create('Strategic Execution Database');
        
        // Move to specified folder if configured
        const folderId = getConfig('DRIVE.FOLDER_ID');
        if (folderId) {
          try {
            const file = DriveApp.getFileById(ss.getId());
            const folder = DriveApp.getFolderById(folderId);
            file.moveTo(folder);
            Logger.log(`✓ Moved spreadsheet to folder: ${folderId}`);
          } catch (moveErr) {
            Logger.log('Could not move to folder: ' + moveErr.message);
          }
        }
        
        // Save spreadsheet ID for future access
        props.setProperty('LINKED_SHEET_ID', ss.getId());
        Logger.log(`✓ Created and linked new spreadsheet: ${ss.getId()}`);
        Logger.log(`✓ Spreadsheet URL: ${ss.getUrl()}`);
      }
    }
    
    return ss;
  } catch (error) {
    throw new Error('Failed to get spreadsheet: ' + error.message);
  }
}

/**
 * Create all required database sheets
 */
function createAllSheets() {
  const ss = getSpreadsheet();
  const created = [];
  const existing = [];
  
  // Get all sheet names from DB_CONFIG
  for (const key in DB_CONFIG.SHEET_NAMES) {
    const sheetName = DB_CONFIG.SHEET_NAMES[key];
    let sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      created.push(sheetName);
      Logger.log(`  ✓ Created sheet: ${sheetName}`);
    } else {
      existing.push(sheetName);
    }
  }
  
  return { created, existing };
}

/**
 * Validate and fix sheet headers according to DB_CONFIG.HEADERS
 */
function validateAndFixHeaders() {
  const ss = getSpreadsheet();
  let fixed = 0;
  
  // For each sheet in DB_CONFIG.SHEET_NAMES, validate headers
  for (const key in DB_CONFIG.SHEET_NAMES) {
    const sheetName = DB_CONFIG.SHEET_NAMES[key];
    const expectedColumns = DB_CONFIG.HEADERS[key];
    
    if (!expectedColumns) {
      Logger.log(`  ! No header config for: ${sheetName}`);
      continue;
    }
    
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) continue;
    
    // Check if sheet is empty or has wrong headers
    const lastRow = sheet.getLastRow();
    const lastCol = sheet.getLastColumn();
    
    if (lastRow === 0 || lastCol === 0 || lastCol !== expectedColumns.length) {
      // Sheet is empty or has wrong structure - set headers
      sheet.clear();
      sheet.appendRow(expectedColumns);
      sheet.getRange(1, 1, 1, expectedColumns.length).setFontWeight('bold');
      fixed++;
      Logger.log(`  ✓ Fixed headers for: ${sheetName}`);
    }
  }
  
  return { fixed };
}

/**
 * Create default roles with proper permissions
 */
function createDefaultRoles() {
  const roles = getTableData(DB_CONFIG.SHEET_NAMES.ROLES);
  const roleIds = {};
  
  // Define default roles
  const defaultRoles = [
    {
      name: 'Super Admin',
      code: 'SUPER_ADMIN',
      description: 'Full system access with all permissions',
      permissions: {
        users: {create: true, read: true, update: true, delete: true},
        roles: {create: true, read: true, update: true, delete: true},
        organization: {create: true, read: true, update: true, delete: true},
        strategic: {create: true, read: true, update: true, delete: true},
        kpi: {create: true, read: true, update: true, delete: true},
        okr: {create: true, read: true, update: true, delete: true},
        programs: {create: true, read: true, update: true, delete: true},
        'impact-centers': {create: true, read: true, update: true, delete: true},
        reports: {create: true, read: true, update: true, delete: true},
        settings: {create: true, read: true, update: true, delete: true}
      },
      isSystemRole: true
    },
    {
      name: 'Admin',
      code: 'ADMIN',
      description: 'Administrative access except system settings',
      permissions: {
        users: {create: true, read: true, update: true, delete: false},
        roles: {create: false, read: true, update: false, delete: false},
        organization: {create: true, read: true, update: true, delete: true},
        strategic: {create: true, read: true, update: true, delete: true},
        kpi: {create: true, read: true, update: true, delete: true},
        okr: {create: true, read: true, update: true, delete: false},
        programs: {create: true, read: true, update: true, delete: true},
        'impact-centers': {create: true, read: true, update: true, delete: true},
        reports: {create: true, read: true, update: true, delete: false},
        settings: {create: false, read: true, update: true, delete: false}
      },
      isSystemRole: true
    },
    {
      name: 'Manager',
      code: 'MANAGER',
      description: 'Can manage strategic plans and KPIs',
      permissions: {
        users: {create: false, read: true, update: false, delete: false},
        roles: {create: false, read: true, update: false, delete: false},
        organization: {create: false, read: true, update: true, delete: false},
        strategic: {create: true, read: true, update: true, delete: false},
        kpi: {create: true, read: true, update: true, delete: false},
        okr: {create: false, read: true, update: true, delete: false},
        programs: {create: true, read: true, update: true, delete: false},
        'impact-centers': {create: true, read: true, update: true, delete: false},
        reports: {create: false, read: true, update: false, delete: false},
        settings: {create: false, read: true, update: false, delete: false}
      },
      isSystemRole: true
    },
    {
      name: 'User',
      code: 'USER',
      description: 'Standard user - can manage own OKRs and view data',
      permissions: {
        users: {create: false, read: true, update: false, delete: false},
        roles: {create: false, read: false, update: false, delete: false},
        organization: {create: false, read: true, update: false, delete: false},
        strategic: {create: false, read: true, update: false, delete: false},
        kpi: {create: false, read: true, update: false, delete: false},
        okr: {create: true, read: true, update: true, delete: false},
        programs: {create: false, read: true, update: false, delete: false},
        'impact-centers': {create: false, read: true, update: false, delete: false},
        reports: {create: false, read: true, update: false, delete: false},
        settings: {create: false, read: true, update: true, delete: false}
      },
      isSystemRole: true
    },
    {
      name: 'Viewer',
      code: 'VIEWER',
      description: 'Read-only access to all data',
      permissions: {
        users: {create: false, read: false, update: false, delete: false},
        roles: {create: false, read: false, update: false, delete: false},
        organization: {create: false, read: true, update: false, delete: false},
        strategic: {create: false, read: true, update: false, delete: false},
        kpi: {create: false, read: true, update: false, delete: false},
        okr: {create: false, read: true, update: false, delete: false},
        programs: {create: false, read: true, update: false, delete: false},
        'impact-centers': {create: false, read: true, update: false, delete: false},
        reports: {create: false, read: true, update: false, delete: false},
        settings: {create: false, read: true, update: false, delete: false}
      },
      isSystemRole: true
    }
  ];
  
  // Create each role if it doesn't exist
  defaultRoles.forEach(roleData => {
    const existing = roles.find(r => r.role_code === roleData.code);
    
    if (!existing) {
      const roleId = generateUUID();
      const now = formatDateTime(new Date());
      
      insertRecord(DB_CONFIG.SHEET_NAMES.ROLES, {
        role_id: roleId,
        role_name: roleData.name,
        role_code: roleData.code,
        description: roleData.description,
        permissions: JSON.stringify(roleData.permissions),
        is_system_role: roleData.isSystemRole,
        created_at: now,
        created_by: 'SYSTEM',
        updated_at: now,
        updated_by: 'SYSTEM'
      });
      
      const keyName = roleData.code.toLowerCase().replace('_', '') + 'RoleId';
      roleIds[keyName] = roleId;
      Logger.log(`  ✓ Created role: ${roleData.name}`);
    } else {
      const keyName = roleData.code.toLowerCase().replace('_', '') + 'RoleId';
      roleIds[keyName] = existing.role_id;
      Logger.log(`  - Role exists: ${roleData.name}`);
    }
  });
  
  return roleIds;
}

/**
 * Create super admin user
 */
function createSuperAdminUser(superAdminRoleId) {
  const users = getTableData(DB_CONFIG.SHEET_NAMES.USERS);
  const superAdminEmail = 'mohammad.afwanul@bpjsketenagakerjaan.go.id';
  
  // Check if user already exists
  const existing = users.find(u => u.email === superAdminEmail);
  
  if (existing) {
    Logger.log('  - Super admin already exists');
    return existing;
  }
  
  // Create new super admin user
  const userId = generateUUID();
  const now = formatDateTime(new Date());
  const defaultPassword = 'SuperAdmin@2026';
  
  const userData = {
    user_id: userId,
    username: 'mohammad.afwanul',
    email: superAdminEmail,
    password_hash: hashPassword(defaultPassword),
    full_name: 'Mohammad Afwanul',
    role_id: superAdminRoleId,
    active_from: formatDateISO(new Date()),
    active_until: null,
    is_active: true,
    last_login: null,
    password_changed_at: null,
    force_password_change: true,
    created_at: now,
    created_by: 'SYSTEM',
    updated_at: now,
    updated_by: 'SYSTEM',
    notes: 'Super Administrator - Initial Setup'
  };
  
  insertRecord(DB_CONFIG.SHEET_NAMES.USERS, userData);
  
  Logger.log(`  ✓ Created super admin: ${superAdminEmail}`);
  
  return userData;
}

/**
 * Helper: Hash password
 */
function hashPassword(password) {
  const digest = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    password + 'SALT_KEY_2026'
  );
  
  return digest.map(byte => {
    const v = (byte < 0) ? 256 + byte : byte;
    return ('0' + v.toString(16)).slice(-2);
  }).join('');
}

/**
 * LEGACY FUNCTION - Use setupCompleteDatabase() instead
 */
function initializeApp() {
  Logger.log('NOTE: initializeApp() is deprecated. Use setupCompleteDatabase() for comprehensive setup.');
  return setupCompleteDatabase();
}

// ============================================================================
// DATABASE MIGRATION SYSTEM
// Easy update scheme - just add new migration blocks when needed
// ============================================================================

/**
 * Get current database version from AppSettings
 */
function getDatabaseVersion() {
  try {
    const settings = getTableData(DB_CONFIG.SHEET_NAMES.APP_SETTINGS);
    const versionSetting = settings.find(s => s.setting_key === 'db_version');
    return versionSetting ? versionSetting.setting_value : '1.0.0';
  } catch (error) {
    // If AppSettings doesn't exist yet, return old version
    return '1.0.0';
  }
}

/**
 * Update database version in AppSettings
 */
function updateDatabaseVersion(version) {
  try {
    const settings = getTableData(DB_CONFIG.SHEET_NAMES.APP_SETTINGS);
    const versionIndex = settings.findIndex(s => s.setting_key === 'db_version');

    if (versionIndex >= 0) {
      settings[versionIndex].setting_value = version;
      settings[versionIndex].updated_at = formatDateTime(new Date());
      settings[versionIndex].updated_by = 'SYSTEM';
      updateAllRecords(DB_CONFIG.SHEET_NAMES.APP_SETTINGS, settings);
    } else {
      insertRecord(DB_CONFIG.SHEET_NAMES.APP_SETTINGS, {
        setting_id: generateUUID(),
        setting_key: 'db_version',
        setting_value: version,
        setting_category: 'SYSTEM',
        description: 'Database schema version',
        is_editable: false,
        updated_by: 'SYSTEM',
        updated_at: formatDateTime(new Date())
      });
    }

    Logger.log('Database version updated to: ' + version);
  } catch (error) {
    Logger.log('Warning: Could not update DB version - ' + error.message);
  }
}

/**
 * Run database migrations based on version
 * EASY UPDATE: Just add new migration blocks here when needed
 */
function runDatabaseMigrations(fromVersion, toVersion) {
  Logger.log('========================================');
  Logger.log('DATABASE MIGRATION');
  Logger.log(`From: ${fromVersion} → To: ${toVersion}`);
  Logger.log('========================================');

  try {
    // Migration 2.x → 3.0: Organization Structure Redesign
    if (compareVersions(fromVersion, '3.0.0') < 0) {
      Logger.log('Running migration: Organization Structure v3.0.0');
      migrateToOrganizationalUnits();
    }

    // Add future migrations here as else-if blocks
    // Example template for future migrations:
    // else if (compareVersions(fromVersion, '3.1.0') < 0) {
    //   Logger.log('Running migration: New Feature v3.1.0');
    //   migrateNewFeature();
    // }

    Logger.log('========================================');
    Logger.log('MIGRATION COMPLETED SUCCESSFULLY!');
    Logger.log('========================================');

    return {
      success: true,
      message: 'Migration completed',
      fromVersion: fromVersion,
      toVersion: toVersion
    };

  } catch (error) {
    Logger.log('========================================');
    Logger.log('MIGRATION FAILED: ' + error.message);
    Logger.log('Stack: ' + error.stack);
    Logger.log('========================================');

    return {
      success: false,
      message: error.message,
      error: error.toString()
    };
  }
}

/**
 * Migration: Create OrganizationalUnits structure
 * Migrates from old Directorate/WorkUnit/Affair to unified OrganizationalUnits
 * This is for BPJS Ketenagakerjaan's actual organizational structure
 */
function migrateToOrganizationalUnits() {
  Logger.log('-- migrateToOrganizationalUnits START --');

  const ss = getSpreadsheet();

  // 1. Create new tables if they don't exist
  Logger.log('Step 1: Creating new tables...');

  // Create OrganizationalUnits table
  let orgUnitsSheet = ss.getSheetByName(DB_CONFIG.SHEET_NAMES.ORGANIZATIONAL_UNITS);
  if (!orgUnitsSheet) {
    orgUnitsSheet = ss.insertSheet(DB_CONFIG.SHEET_NAMES.ORGANIZATIONAL_UNITS);
    const orgUnitHeaders = [
      'unit_id', 'unit_type', 'parent_unit_id', 'unit_code', 'unit_name',
      'unit_level', 'classification', 'geographical_scope', 'province', 'city',
      'address', 'head_position_id', 'active_from', 'active_until', 'is_active',
      'lifecycle_status', 'closed_date', 'closure_reason', 'merged_into_unit_id',
      'split_from_unit_id', 'previous_classification', 'created_at', 'created_by',
      'updated_at', 'updated_by', 'notes'
    ];
    orgUnitsSheet.appendRow(orgUnitHeaders);
    orgUnitsSheet.getRange(1, 1, 1, orgUnitHeaders.length).setFontWeight('bold');
    Logger.log('  ✓ Created OrganizationalUnits table');
  } else {
    Logger.log('  - OrganizationalUnits table already exists');
  }

  // Create OfficeLifecycleHistory table
  let lifecycleSheet = ss.getSheetByName(DB_CONFIG.SHEET_NAMES.OFFICE_LIFECYCLE_HISTORY);
  if (!lifecycleSheet) {
    lifecycleSheet = ss.insertSheet(DB_CONFIG.SHEET_NAMES.OFFICE_LIFECYCLE_HISTORY);
    const lifecycleHeaders = [
      'history_id', 'unit_id', 'event_type', 'event_date', 'event_reason',
      'previous_status', 'new_status', 'previous_classification', 'new_classification',
      'related_unit_id', 'performed_by', 'supporting_documents', 'notes', 'created_at'
    ];
    lifecycleSheet.appendRow(lifecycleHeaders);
    lifecycleSheet.getRange(1, 1, 1, lifecycleHeaders.length).setFontWeight('bold');
    Logger.log('  ✓ Created OfficeLifecycleHistory table');
  } else {
    Logger.log('  - OfficeLifecycleHistory table already exists');
  }

  // 2. Enhance Positions table with new columns
  Logger.log('Step 2: Enhancing Positions table...');
  enhancePositionsTable();

  // 3. Migrate existing data from old structure
  Logger.log('Step 3: Migrating existing data...');

  // Migrate Directorates
  try {
    const directorates = getTableData(DB_CONFIG.SHEET_NAMES.DIRECTORATES);
    Logger.log(`  Found ${directorates.length} directorates to migrate`);

    directorates.forEach(dir => {
      const orgUnit = {
        unit_id: dir.directorate_id,
        unit_type: 'DIRECTORATE',
        parent_unit_id: null, // Will link to ROOT later
        unit_code: dir.directorate_code,
        unit_name: dir.directorate_name,
        unit_level: 2, // Level 2: ROOT(0) → Kantor Pusat(1) → Directorate(2)
        classification: 'HQ',
        head_position_id: dir.director_position_id,
        active_from: dir.active_from,
        active_until: dir.active_until,
        is_active: dir.is_active,
        lifecycle_status: 'ACTIVE',
        created_at: dir.created_at || formatDateTime(new Date()),
        created_by: dir.created_by || 'SYSTEM',
        updated_at: dir.updated_at || formatDateTime(new Date()),
        updated_by: dir.updated_by || 'SYSTEM',
        notes: (dir.notes || '') + ' | Migrated from Directorates table'
      };
      insertRecord(DB_CONFIG.SHEET_NAMES.ORGANIZATIONAL_UNITS, orgUnit);
    });
    Logger.log('  ✓ Migrated directorates');
  } catch (e) {
    Logger.log('  ! Could not migrate directorates: ' + e.message);
  }

  // Migrate WorkUnits
  try {
    const workUnits = getTableData(DB_CONFIG.SHEET_NAMES.WORK_UNITS);
    Logger.log(`  Found ${workUnits.length} work units to migrate`);

    workUnits.forEach(wu => {
      const orgUnit = {
        unit_id: wu.work_unit_id,
        unit_type: 'WORK_UNIT',
        parent_unit_id: wu.directorate_id,
        unit_code: wu.work_unit_code,
        unit_name: wu.work_unit_name,
        unit_level: 3,
        classification: 'HQ',
        head_position_id: wu.deputy_position_id,
        active_from: wu.active_from,
        active_until: wu.active_until,
        is_active: wu.is_active,
        lifecycle_status: 'ACTIVE',
        created_at: wu.created_at || formatDateTime(new Date()),
        created_by: wu.created_by || 'SYSTEM',
        updated_at: wu.updated_at || formatDateTime(new Date()),
        updated_by: wu.updated_by || 'SYSTEM',
        notes: (wu.notes || '') + ' | Migrated from WorkUnits table'
      };
      insertRecord(DB_CONFIG.SHEET_NAMES.ORGANIZATIONAL_UNITS, orgUnit);
    });
    Logger.log('  ✓ Migrated work units');
  } catch (e) {
    Logger.log('  ! Could not migrate work units: ' + e.message);
  }

  // Migrate Affairs
  try {
    const affairs = getTableData(DB_CONFIG.SHEET_NAMES.AFFAIRS);
    Logger.log(`  Found ${affairs.length} affairs to migrate`);

    affairs.forEach(aff => {
      const orgUnit = {
        unit_id: aff.affair_id,
        unit_type: 'AFFAIR',
        parent_unit_id: aff.work_unit_id,
        unit_code: aff.affair_code,
        unit_name: aff.affair_name,
        unit_level: 4,
        classification: 'HQ',
        head_position_id: aff.assistant_deputy_position_id,
        active_from: aff.active_from,
        active_until: aff.active_until,
        is_active: aff.is_active,
        lifecycle_status: 'ACTIVE',
        created_at: aff.created_at || formatDateTime(new Date()),
        created_by: aff.created_by || 'SYSTEM',
        updated_at: aff.updated_at || formatDateTime(new Date()),
        updated_by: aff.updated_by || 'SYSTEM',
        notes: (aff.notes || '') + ' | Migrated from Affairs table'
      };
      insertRecord(DB_CONFIG.SHEET_NAMES.ORGANIZATIONAL_UNITS, orgUnit);
    });
    Logger.log('  ✓ Migrated affairs');
  } catch (e) {
    Logger.log('  ! Could not migrate affairs: ' + e.message);
  }

  // 4. Create ROOT organizational unit
  Logger.log('Step 4: Creating ROOT unit...');
  const existingRoot = getTableData(DB_CONFIG.SHEET_NAMES.ORGANIZATIONAL_UNITS)
    .find(u => u.unit_type === 'ROOT');

  let rootUnitId;
  if (!existingRoot) {
    const rootUnit = {
      unit_id: generateUUID(),
      unit_type: 'ROOT',
      parent_unit_id: null,
      unit_code: 'ROOT',
      unit_name: 'BPJS Ketenagakerjaan',
      unit_level: 0,
      classification: 'HQ',
      head_position_id: null,
      active_from: formatDateTime(new Date()),
      active_until: null,
      is_active: true,
      lifecycle_status: 'ACTIVE',
      created_at: formatDateTime(new Date()),
      created_by: 'SYSTEM',
      updated_at: formatDateTime(new Date()),
      updated_by: 'SYSTEM',
      notes: 'Root organization unit - BPJS Ketenagakerjaan'
    };
    insertRecord(DB_CONFIG.SHEET_NAMES.ORGANIZATIONAL_UNITS, rootUnit);
    rootUnitId = rootUnit.unit_id;
    Logger.log('  ✓ Created ROOT unit');
  } else {
    rootUnitId = existingRoot.unit_id;
    Logger.log('  - ROOT unit already exists');
  }

  // 5. Update all directorates to point to ROOT as parent
  Logger.log('Step 5: Updating directorate parent references...');
  try {
    const orgUnits = getTableData(DB_CONFIG.SHEET_NAMES.ORGANIZATIONAL_UNITS);
    const directorateUnits = orgUnits.filter(u => u.unit_type === 'DIRECTORATE');

    directorateUnits.forEach(dir => {
      if (!dir.parent_unit_id) {
        updateRecord(DB_CONFIG.SHEET_NAMES.ORGANIZATIONAL_UNITS, 'unit_id', dir.unit_id, {
          parent_unit_id: rootUnitId
        });
      }
    });
    Logger.log(`  ✓ Updated ${directorateUnits.length} directorate parent references`);
  } catch (e) {
    Logger.log('  ! Could not update directorate parents: ' + e.message);
  }

  // 6. Update Positions table with new organizational_context field
  Logger.log('Step 6: Updating Positions table...');
  try {
    const positions = getTableData(DB_CONFIG.SHEET_NAMES.POSITIONS);
    let positionUpdateCount = 0;

    positions.forEach(pos => {
      // Determine context based on existing FKs
      let orgContext = 'HQ';
      let unitId = null;

      if (pos.directorate_id) {
        orgContext = 'HQ';
        unitId = pos.directorate_id;
      } else if (pos.work_unit_id) {
        orgContext = 'HQ';
        unitId = pos.work_unit_id;
      } else if (pos.affair_id) {
        orgContext = 'HQ';
        unitId = pos.affair_id;
      }

      // Update position if it has the new fields
      const posData = { ...pos };
      if (!posData.organizational_context) {
        posData.organizational_context = orgContext;
      }
      if (!posData.unit_id && unitId) {
        posData.unit_id = unitId;
      }

      updateRecord(DB_CONFIG.SHEET_NAMES.POSITIONS, 'position_id', pos.position_id, {
        organizational_context: posData.organizational_context,
        unit_id: posData.unit_id
      });
      positionUpdateCount++;
    });

    Logger.log(`  ✓ Updated ${positionUpdateCount} positions`);
  } catch (e) {
    Logger.log('  ! Could not update positions: ' + e.message);
  }

  // 7. Mark old tables as deprecated
  Logger.log('Step 7: Marking old tables as deprecated...');
  try {
    markTableAsDeprecated(DB_CONFIG.SHEET_NAMES.DIRECTORATES);
    markTableAsDeprecated(DB_CONFIG.SHEET_NAMES.WORK_UNITS);
    markTableAsDeprecated(DB_CONFIG.SHEET_NAMES.AFFAIRS);
    Logger.log('  ✓ Old tables marked as deprecated');
  } catch (e) {
    Logger.log('  ! Could not mark tables as deprecated: ' + e.message);
  }

  Logger.log('-- migrateToOrganizationalUnits COMPLETE --');
  Logger.log('Migration summary:');
  Logger.log('  - Created OrganizationalUnits table');
  Logger.log('  - Created OfficeLifecycleHistory table');
  Logger.log('  - Enhanced Positions table with organizational_context');
  Logger.log('  - Migrated Directorates, WorkUnits, Affairs → OrganizationalUnits');
  Logger.log('  - Created ROOT unit (BPJS Ketenagakerjaan)');
  Logger.log('  - Old tables marked as deprecated (kept for backup)');
}

/**
 * Enhance Positions table with new columns for organization structure
 */
function enhancePositionsTable() {
  try {
    const sheet = getSheet(DB_CONFIG.SHEET_NAMES.POSITIONS);
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

    // Columns to add
    const newColumns = [
      { name: 'organizational_context', defaultValue: 'HQ' },
      { name: 'branch_classification', defaultValue: null },
      { name: 'unit_id', defaultValue: null }
    ];

    newColumns.forEach(col => {
      if (!headers.includes(col.name)) {
        const lastCol = sheet.getLastColumn();
        sheet.getRange(1, lastCol + 1).setValue(col.name);

        // Set default value for existing rows
        if (col.defaultValue !== null) {
          const lastRow = sheet.getLastRow();
          if (lastRow > 1) {
            const dataRange = sheet.getRange(2, lastCol + 1, lastRow - 1, 1);
            dataRange.setValue(col.defaultValue);
          }
        }

        Logger.log(`    Added column to Positions: ${col.name}`);
      }
    });
  } catch (error) {
    Logger.log('  ! Could not enhance Positions table: ' + error.message);
  }
}

/**
 * Mark table as deprecated by adding a note to A1
 */
function markTableAsDeprecated(sheetName) {
  try {
    const sheet = getSheet(sheetName);
    const deprecationMessage =
      'DEPRECATED: This table is deprecated. Use OrganizationalUnits table instead.\n' +
      'Migration completed on: ' + formatDateTime(new Date()) + '\n' +
      'Old table kept for backup/reference purposes.';

    sheet.getRange('A1').setNote(deprecationMessage);
  } catch (error) {
    Logger.log('  ! Could not mark table as deprecated: ' + error.message);
  }
}

/**
 * Version comparison helper
 * Returns: -1 if v1 < v2, 0 if v1 == v2, 1 if v1 > v2
 */
function compareVersions(v1, v2) {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);

  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const p1 = parts1[i] || 0;
    const p2 = parts2[i] || 0;
    if (p1 < p2) return -1;
    if (p1 > p2) return 1;
  }
  return 0;
}

/**
 * Test function to verify setup worked
 */
function testSetup() {
  Logger.log('========================================');
  Logger.log('TESTING DATABASE SETUP');
  Logger.log('========================================');
  
  try {
    const users = getTableData(DB_CONFIG.SHEET_NAMES.USERS);
    const roles = getTableData(DB_CONFIG.SHEET_NAMES.ROLES);
    
    Logger.log(`\n✓ Total Roles: ${roles.length}`);
    Logger.log(`✓ Total Users: ${users.length}`);
    
    const superAdmin = users.find(u => u.email === 'mohammad.afwanul@bpjsketenagakerjaan.go.id');
    if (superAdmin) {
      Logger.log('\n✓ Super Admin user found:');
      Logger.log(`  - Username: ${superAdmin.username}`);
      Logger.log(`  - Email: ${superAdmin.email}`);
      Logger.log(`  - Active: ${superAdmin.is_active}`);
      
      const role = roles.find(r => r.role_id === superAdmin.role_id);
      if (role) {
        Logger.log(`  - Role: ${role.role_name} (${role.role_code})`);
      }
    } else {
      Logger.log('\n✗ Super Admin user NOT found!');
    }
    
    Logger.log('\n========================================');
    Logger.log('TEST COMPLETED');
    Logger.log('========================================');
    
  } catch (error) {
    Logger.log('TEST FAILED: ' + error.message);
  }
}
