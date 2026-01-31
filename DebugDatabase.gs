
function debugDatabaseConnection() {
  Logger.log('DEBUG: Starting Database Connection Check');
  
  try {
    // 1. Check Config
    Logger.log('1. Checking DB_CONFIG');
    if (typeof DB_CONFIG === 'undefined') {
      Logger.log('❌ DB_CONFIG is undefined!');
    } else {
      Logger.log('✓ DB_CONFIG is defined');
      Logger.log('  Directorates Sheet Name: ' + DB_CONFIG.SHEET_NAMES.DIRECTORATES);
    }
    
    // 2. Check Spreadsheet Connection
    Logger.log('\n2. Checking Spreadsheet Connection');
    const ss = getSpreadsheet();
    if (!ss) {
      Logger.log('❌ getSpreadsheet() returned null');
      return;
    }
    Logger.log('✓ Spreadsheet found');
    Logger.log('  Name: ' + ss.getName());
    Logger.log('  ID: ' + ss.getId());
    Logger.log('  URL: ' + ss.getUrl());
    
    // 3. Check Script Property
    const props = PropertiesService.getScriptProperties();
    Logger.log('  Linked Sheet ID Property: ' + props.getProperty('LINKED_SHEET_ID'));
    
    // 4. Check Directorates Sheet
    Logger.log('\n3. Checking Directorates Sheet');
    const sheetName = DB_CONFIG.SHEET_NAMES.DIRECTORATES;
    const sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      Logger.log(`❌ Sheet "${sheetName}" NOT found in the spreadsheet!`);
      const actualSheets = ss.getSheets().map(s => s.getName());
      Logger.log('  Available sheets: ' + actualSheets.join(', '));
      return;
    }
    
    Logger.log(`✓ Sheet "${sheetName}" found`);
    
    // 5. Check Data
    const lastRow = sheet.getLastRow();
    const lastCol = sheet.getLastColumn();
    Logger.log(`  Dimensions: ${lastRow} rows x ${lastCol} columns`);
    
    if (lastRow > 0) {
      const data = sheet.getDataRange().getValues();
      Logger.log(`  Total rows retrieved: ${data.length}`);
      
      if (data.length > 0) {
        Logger.log('  Header Row: ' + JSON.stringify(data[0]));
      }
      if (data.length > 1) {
        Logger.log('  First Data Row: ' + JSON.stringify(data[1]));
      } else {
        Logger.log('  ❌ No data rows found (only header?)');
      }
    } else {
      Logger.log('  ❌ Sheet is completely empty (0 rows)');
    }
    
    // 6. Test getTableData
    Logger.log('\n4. Testing getTableData()');
    try {
      const tableData = getTableData(sheetName);
      Logger.log(`  getTableData returned ${tableData.length} records`);
      if (tableData.length > 0) {
        Logger.log('  First record: ' + JSON.stringify(tableData[0]));
      }
    } catch (e) {
      Logger.log('❌ getTableData failed: ' + e.message);
    }
    
  } catch (error) {
    Logger.log('❌ FATAL ERROR: ' + error.message);
    Logger.log(error.stack);
  }
}
