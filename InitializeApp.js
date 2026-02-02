/**
 * InitializeApp.js
 * One-time initialization script for setting up the application
 * Run this manually from Apps Script editor on first deployment
 */

/**
 * COMPREHENSIVE SETUP - Run this function to set up everything!
 * Creates all sheets, validates headers, creates roles, and creates super admin user
 */
function setupCompleteDatabase() {
  Logger.log('========================================');
  Logger.log('STARTING COMPLETE DATABASE SETUP');
  Logger.log('========================================');
  
  try {
    // Step 1: Create all database sheets
    Logger.log('\n[1/4] Creating database sheets...');
    const sheetsCreated = createAllSheets();
    Logger.log(`✓ Database sheets verified: ${sheetsCreated.created.length} created, ${sheetsCreated.existing.length} already existed`);
    
    // Step 2: Validate/fix sheet headers
    Logger.log('\n[2/4] Validating sheet headers...');
    const headersFixed = validateAndFixHeaders();
    Logger.log(`✓ Headers validated: ${headersFixed.fixed} sheets updated`);
    
    // Step 3: Create default roles
    Logger.log('\n[3/4] Creating default roles...');
    const roles = createDefaultRoles();
    Logger.log(`✓ Default roles created: ${Object.keys(roles).length} roles`);
    
    // Step 4: Create super admin user
    Logger.log('\n[4/4] Creating super admin user...');
    const superAdmin = createSuperAdminUser(roles.superAdminRoleId);
    Logger.log(`✓ Super admin user: ${superAdmin.email}`);
    
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
