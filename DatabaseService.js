/**
 * DatabaseService.js
 * Handles all interactions with the Google Sheets database.
 * COMPLETE implementation with all 28 required sheets.
 */

// DB_CONFIG is now defined globally in Config.js - DO NOT REDEFINE HERE

/**
 * Get or create the database spreadsheet
 * @returns {GoogleAppsScript.Spreadsheet.Spreadsheet}
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
        } catch (err) {
          Logger.log('Linked sheet not found, will create new one.');
          ss = null;
        }
      }
      
      // Create new spreadsheet if needed
      if (!ss) {
        ss = SpreadsheetApp.create('Strategic Execution Database');
        
        // Move to specified folder
        const folderId = getConfig('DRIVE.FOLDER_ID');
        if (folderId) {
          try {
            const file = DriveApp.getFileById(ss.getId());
            const folder = DriveApp.getFolderById(folderId);
            file.moveTo(folder);
            Logger.log('Database spreadsheet moved to folder: ' + folderId);
          } catch (moveErr) {
            Logger.log('Could not move file to folder: ' + moveErr);
          }
        }
        
        // Save spreadsheet ID for future access
        props.setProperty('LINKED_SHEET_ID', ss.getId());
        Logger.log('Created new database spreadsheet with ID: ' + ss.getId());
      }
    }
    
    return ss;
  } catch (e) {
    Logger.log('Error connecting to spreadsheet: ' + e);
    throw new Error('Could not connect to the database. ' + e.message);
  }
}

/**
 * FIRST RUN / INITIALIZATION FUNCTION
 * Run this once to set up the entire database structure
 * This will create all 28 required sheets with proper headers
 */
function initializeDatabase() {
  Logger.log('═══════════════════════════════════════════════════════');
  Logger.log('Starting Database Initialization...');
  Logger.log('═══════════════════════════════════════════════════════');
  
  const ss = getSpreadsheet();
  const existingSheets = ss.getSheets();
  const existingSheetNames = existingSheets.map(s => s.getName());
  
  let createdCount = 0;
  let existingCount = 0;
  
  // Create all sheets as defined in DB_CONFIG
  Object.keys(DB_CONFIG.SHEET_NAMES).forEach(key => {
    const sheetName = DB_CONFIG.SHEET_NAMES[key];
    const headers = DB_CONFIG.HEADERS[key];
    
    if (!existingSheetNames.includes(sheetName)) {
      const newSheet = ss.insertSheet(sheetName);
      newSheet.appendRow(headers);
      
      // Format header row
      const headerRange = newSheet.getRange(1, 1, 1, headers.length);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#4285f4');
      headerRange.setFontColor('#ffffff');
      
      // Freeze header row
      newSheet.setFrozenRows(1);
      
      // Auto-resize columns
      for (let i = 1; i <= headers.length; i++) {
        newSheet.autoResizeColumn(i);
      }
      
      Logger.log(`✓ Created sheet: ${sheetName} (${headers.length} columns)`);
      createdCount++;
    } else {
      Logger.log(`  Sheet already exists: ${sheetName}`);
      existingCount++;
    }
  });
  
  // Remove default "Sheet1" if it exists and is empty
  const defaultSheet = ss.getSheetByName('Sheet1');
  if (defaultSheet && defaultSheet.getLastRow() === 0) {
    ss.deleteSheet(defaultSheet);
    Logger.log('✓ Removed default "Sheet1"');
  }
  
  // Initialize default roles
  initializeDefaultRoles();
  
  // Initialize default app settings
  initializeDefaultSettings();
  
  Logger.log('═══════════════════════════════════════════════════════');
  Logger.log(`Database Initialization Complete!`);
  Logger.log(`  - Sheets created: ${createdCount}`);
  Logger.log(`  - Sheets existing: ${existingCount}`);
  Logger.log(`  - Total sheets: ${createdCount + existingCount}/28`);
  Logger.log(`  - Spreadsheet ID: ${ss.getId()}`);
  Logger.log(`  - Spreadsheet URL: ${ss.getUrl()}`);
  Logger.log('═══════════════════════════════════════════════════════');
  
  return formatSuccess({
    spreadsheetId: ss.getId(),
    spreadsheetUrl: ss.getUrl(),
    sheetsCreated: createdCount,
    sheetsExisting: existingCount,
    totalSheets: createdCount + existingCount
  }, 'Database initialized successfully!');
}

/**
 * Initialize default system roles
 */
function initializeDefaultRoles() {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(DB_CONFIG.SHEET_NAMES.ROLES);
  
  // Check if roles already exist
  if (sheet.getLastRow() > 1) {
    Logger.log('  Default roles already exist, skipping...');
    return;
  }
  
  const roles = getConfig('DEFAULT_ROLES');
  const now = new Date();
  const systemUser = 'SYSTEM';
  
  roles.forEach(role => {
    const roleId = generateUUID();
    const row = [
      roleId,
      role.role_name,
      role.role_code,
      role.description,
      JSON.stringify(role.permissions),
      role.is_system_role,
      now,
      systemUser,
      now,
      systemUser
    ];
    sheet.appendRow(row);
  });
  
  Logger.log(`✓ Initialized ${roles.length} default roles`);
}

/**
 * Initialize default application settings
 */
function initializeDefaultSettings() {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(DB_CONFIG.SHEET_NAMES.APP_SETTINGS);
  
  // Check if settings already exist
  if (sheet.getLastRow() > 1) {
    Logger.log('  Default settings already exist, skipping...');
    return;
  }
  
  const now = new Date();
  const systemUser = 'SYSTEM';
  
  const defaultSettings = [
    {
      key: 'APP_NAME',
      value: getConfig('APP.NAME'),
      category: 'SYSTEM',
      description: 'Application name',
      editable: true
    },
    {
      key: 'APP_VERSION',
      value: getConfig('APP.VERSION'),
      category: 'SYSTEM',
      description: 'Application version',
      editable: false
    },
    {
      key: 'SESSION_TIMEOUT_MINUTES',
      value: String(getConfig('SESSION.TIMEOUT_MINUTES')),
      category: 'SYSTEM',
      description: 'Session timeout in minutes',
      editable: true
    },
    {
      key: 'ENABLE_EMAIL_NOTIFICATIONS',
      value: String(getConfig('EMAIL.ENABLE_NOTIFICATIONS')),
      category: 'EMAIL',
      description: 'Enable email notifications',
      editable: true
    },
    {
      key: 'ADMIN_EMAIL',
      value: getConfig('EMAIL.ADMIN_EMAIL'),
      category: 'EMAIL',
      description: 'Administrator email address',
      editable: true
    }
  ];
  
  defaultSettings.forEach(setting => {
    const settingId = generateUUID();
    const row = [
      settingId,
      setting.key,
      setting.value,
      setting.category,
      setting.description,
      setting.editable,
      systemUser,
      now
    ];
    sheet.appendRow(row);
  });
  
  Logger.log(`✓ Initialized ${defaultSettings.length} default settings`);
}

/**
 * Get all data from a sheet as array of objects
 * @param {string} sheetName - Name of the sheet
 * @returns {Array<Object>} Array of data objects
 */
function getTableData(sheetName) {
  Logger.log('DatabaseService.getTableData: sheetName=' + sheetName);

  try {
    // Get spreadsheet
    Logger.log('Step 1: Getting spreadsheet...');
    const ss = getSpreadsheet();
    if (!ss) {
      Logger.log('✗ ERROR: Spreadsheet not found');
      throw new Error('Spreadsheet not found');
    }
    Logger.log('✓ Step 1: Spreadsheet found');

    // Get sheet
    Logger.log('Step 2: Getting sheet: ' + sheetName);
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      Logger.log('✗ ERROR: Sheet not found - ' + sheetName);
      throw new Error(`Sheet '${sheetName}' not found. Run initializeDatabase() first.`);
    }
    Logger.log('✓ Step 2: Sheet found');

    // Get data
    Logger.log('Step 3: Getting data range...');
    const dataRange = sheet.getDataRange();
    const rawData = dataRange.getValues();
    Logger.log('✓ Step 3: Data retrieved, rows=' + rawData.length);

    if (rawData.length <= 1) {
      Logger.log('⚠ WARNING: Sheet has no data rows (only headers or empty)');
      return []; // No data, only headers
    }

    // Process headers
    Logger.log('Step 4: Processing headers...');
    const headers = rawData[0];
    Logger.log('Headers: ' + JSON.stringify(headers));

    // Map data to objects
    Logger.log('Step 5: Mapping data to objects...');
    const result = [];
    for (let i = 1; i < rawData.length; i++) {
      const row = rawData[i];
      let obj = {};
      for (let j = 0; j < headers.length; j++) {
        obj[headers[j]] = row[j];
      }
      result.push(obj);
    }
    Logger.log('✓ Step 5: Data mapped, ' + result.length + ' objects created');

    Logger.log('✓ getTableData COMPLETE: ' + sheetName + ' returned ' + result.length + ' rows');
    return result;

  } catch (e) {
    Logger.log('✗ getTableData ERROR: ' + e.toString());
    Logger.log('Stack: ' + e.stack);
    throw e;
  }
}

/**
 * Insert a new record into a sheet
 * @param {string} sheetName - Sheet name
 * @param {Object} data - Data object with field: value pairs
 * @returns {Object} Response with inserted record ID
 */
function insertRecord(sheetName, data) {
  try {
    const ss = getSpreadsheet();
    const sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      throw new Error(`Sheet '${sheetName}' not found.`);
    }
    
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const row = headers.map(header => data[header] !== undefined ? data[header] : '');
    
    sheet.appendRow(row);
    
    return formatSuccess({ id: data[headers[0]] }, 'Record inserted successfully');
  } catch (e) {
    Logger.log(`Error inserting record: ${e}`);
    return formatError('Failed to insert record', e);
  }
}

/**
 * Update a record in a sheet
 * @param {string} sheetName - Sheet name
 * @param {string} idField - Name of ID field
 * @param {string} idValue - Value of ID to update
 * @param {Object} data - Data to update
 * @returns {Object} Response
 */
function updateRecord(sheetName, idField, idValue, data) {
  try {
    const ss = getSpreadsheet();
    const sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      throw new Error(`Sheet '${sheetName}' not found.`);
    }
    
    const allData = sheet.getDataRange().getValues();
    const headers = allData[0];
    const idIndex = headers.indexOf(idField);
    
    if (idIndex === -1) {
      throw new Error(`ID field '${idField}' not found in sheet.`);
    }
    
    // Find row with matching ID
    for (let i = 1; i < allData.length; i++) {
      if (allData[i][idIndex] === idValue) {
        // Update fields
        headers.forEach((header, index) => {
          if (data[header] !== undefined) {
            sheet.getRange(i + 1, index + 1).setValue(data[header]);
          }
        });
        
        return formatSuccess({ updated: true }, 'Record updated successfully');
      }
    }
    
    return formatError('Record not found');
  } catch (e) {
    Logger.log(`Error updating record: ${e}`);
    return formatError('Failed to update record', e);
  }
}

/**
 * Delete a record from a sheet
 * @param {string} sheetName - Sheet name
 * @param {string} idField - Name of ID field
 * @param {string} idValue - Value of ID to delete
 * @returns {Object} Response
 */
function deleteRecord(sheetName, idField, idValue) {
  try {
    const ss = getSpreadsheet();
    const sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      throw new Error(`Sheet '${sheetName}' not found.`);
    }
    
    const allData = sheet.getDataRange().getValues();
    const headers = allData[0];
    const idIndex = headers.indexOf(idField);
    
    if (idIndex === -1) {
      throw new Error(`ID field '${idField}' not found in sheet.`);
    }
    
    // Find and delete row
    for (let i = 1; i < allData.length; i++) {
      if (allData[i][idIndex] === idValue) {
        sheet.deleteRow(i + 1);
        return formatSuccess({ deleted: true }, 'Record deleted successfully');
      }
    }
    
    return formatError('Record not found');
  } catch (e) {
    Logger.log(`Error deleting record: ${e}`);
    return formatError('Failed to delete record', e);
  }
}

/**
 * Get database statistics
 * @returns {Object} Database statistics
 */
function getDatabaseStats() {
  const ss = getSpreadsheet();
  const sheets = ss.getSheets();
  
  const stats = {
    totalSheets: sheets.length,
    sheets: []
  };
  
  sheets.forEach(sheet => {
    stats.sheets.push({
      name: sheet.getName(),
      rows: sheet.getLastRow() - 1, // Exclude header
      columns: sheet.getLastColumn()
    });
  });
  
  return formatSuccess(stats, 'Database statistics retrieved');
}

/**
 * Generate a new Google Sheets file for specific data export
 * @param {string} sheetName - Name of the sheet to create
 * @param {Array} data - Array of data objects
 * @returns {Object} Response with spreadsheet info
 */
function generateGoogleSheets(sheetName, data = []) {
  try {
    // Create new spreadsheet
    const newSs = SpreadsheetApp.create(sheetName);
    const sheet = newSs.getActiveSheet();
    
    if (data.length > 0) {
      // Get headers from first object
      const headers = Object.keys(data[0]);
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      
      // Add data rows
      const rows = data.map(obj => headers.map(h => obj[h] || ''));
      if (rows.length > 0) {
        sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
      }
      
      // Format header
      sheet.getRange(1, 1, 1, headers.length)
        .setFontWeight('bold')
        .setBackground('#4285f4')
        .setFontColor('#ffffff');
      sheet.setFrozenRows(1);
      
      // Auto-resize columns
      for (let i = 1; i <= headers.length; i++) {
        sheet.autoResizeColumn(i);
      }
    }
    
    Logger.log(`Generated new spreadsheet: ${sheetName} with ID: ${newSs.getId()}`);
    
    return formatSuccess({
      spreadsheetId: newSs.getId(),
      spreadsheetUrl: newSs.getUrl(),
      rowCount: data.length
    }, 'Spreadsheet generated successfully');
  } catch (e) {
    Logger.log(`Error generating spreadsheet: ${e}`);
    return formatError('Failed to generate spreadsheet', e);
  }
}

/**
 * Move a spreadsheet to a specific Google Drive folder
 * @param {string} spreadsheetId - ID of the spreadsheet to move
 * @param {string} folderId - ID of the destination folder
 * @returns {Object} Response
 */
function moveSheetToFolder(spreadsheetId, folderId) {
  try {
    const file = DriveApp.getFileById(spreadsheetId);
    const folder = DriveApp.getFolderById(folderId);
    
    // Remove from all current parent folders
    const parents = file.getParents();
    while (parents.hasNext()) {
      const parent = parents.next();
      parent.removeFile(file);
    }
    
    // Add to new folder
    folder.addFile(file);
    
    Logger.log(`Moved spreadsheet ${spreadsheetId} to folder ${folderId}`);
    
    return formatSuccess({
      fileId: spreadsheetId,
      folderId: folderId,
      fileName: file.getName(),
      folderName: folder.getName()
    }, 'Spreadsheet moved successfully');
  } catch (e) {
    Logger.log(`Error moving spreadsheet: ${e}`);
    return formatError('Failed to move spreadsheet', e);
  }
}

