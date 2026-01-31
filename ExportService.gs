/**
 * ExportService.gs
 * Handles data export requests.
 */

/**
 * Serves a CSV file of the requested dataset.
 * @param {string} type - 'KPIs', 'Goals'
 */
function downloadCSV(type) {
  let data = [];
  let filename = 'export.csv';

  if (type === 'KPIs') {
    data = getTableData('KPIs');
    filename = 'kpis_export.csv';
  } else if (type === 'Goals') {
    data = getTableData('StrategicGoals');
    filename = 'goals_export.csv';
  }

  if (data.length === 0) {
    return ContentService.createTextOutput('No data found.')
      .setMimeType(ContentService.MimeType.TEXT);
  }

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','), // Header row
    ...data.map(row => headers.map(header => JSON.stringify(row[header])).join(',')) // Data rows
  ].join('\n');

  return ContentService.createTextOutput(csvContent)
    .setMimeType(ContentService.MimeType.CSV)
    .downloadAsFile(filename);
}

/**
 * Gets the download URL for the web app (generic helper).
 * Note: generic 'doGet' needs to handle a '?export=true' parameter to actually serve this content
 * or we use a separate endpoint logic in doGet.
 */
function getExportUrl(type) {
  return ScriptApp.getService().getUrl() + '?action=export&type=' + type;
}
