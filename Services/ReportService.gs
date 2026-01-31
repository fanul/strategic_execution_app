/**
 * Services/ReportService.js
 * Report generation and export service
 */

const ReportService = {
  /**
   * Generate KPI summary report
   * @param {Object} filters - Report filters
   * @returns {Object} Report data
   */
  generateKPISummary(filters = {}) {
    return ReportController.generateKPIReport(filters);
  },

  /**
   * Generate OKR summary report
   * @param {Object} filters - Report filters  
   * @returns {Object} Report data
   */
  generateOKRSummary(filters = {}) {
    return ReportController.generateOKRReport(filters);
  },

  /**
   * Generate performance dashboard
   * @param {number} year - Year for report
   * @returns {Object} Dashboard data
   */
  generatePerformanceDashboard(year) {
    return ReportController.generatePerformanceDashboard(year);
  },

  /**
   * Export data to CSV format
   * @param {Array} data - Array of objects to export
   * @param {string} filename - Output filename
   * @returns {Blob} CSV blob
   */
  exportToCSV(data, filename) {
    try {
      if (!data || data.length === 0) {
        return {success: false, message: 'No data to export' };
      }

      // Get headers from first object
      const headers = Object.keys(data[0]);
      
      // Create CSV content
      let csvContent = headers.join(',') + '\n';
      
      data.forEach(row => {
        const values = headers.map(header => {
          const value = row[header] || '';
          // Escape commas and quotes
          return typeof value === 'string' && (value.includes(',') || value.includes('"'))
            ? `"${value.replace(/"/g, '""')}"`
            : value;
        });
        csvContent += values.join(',') + '\n';
      });

      // Create blob
      const blob = Utilities.newBlob(csvContent, 'text/csv', filename || 'export.csv');
      
      return { success: true, data: blob };
    } catch (error) {
      Logger.log('ReportService.exportToCSV error: ' + error);
      return { success: false, message: 'Failed to export to CSV', error: error.toString() };
    }
  },

  /**
   * Export data to Google Sheets
   * @param {Array} data - Array of objects to export
   * @param {string} sheetName - Name for the new sheet
   * @returns {Object} Response with spreadsheet URL
   */
  exportToGoogleSheets(data, sheetName) {
    try {
      if (!data || data.length === 0) {
        return { success: false, message: 'No data to export' };
      }

      // Create new spreadsheet
      const ss = SpreadsheetApp.create(sheetName || 'Export');
      const sheet = ss.getActiveSheet();
      
      // Get headers
      const headers = Object.keys(data[0]);
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      
      // Add data
      const rows = data.map(row => headers.map(h => row[h] || ''));
      sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
      
      // Format header
      sheet.getRange(1, 1, 1, headers.length)
        .setFontWeight('bold')
        .setBackground('#4285f4')
        .setFontColor('#ffffff');

      return {
        success: true,
        data: {
          spreadsheetId: ss.getId(),
          url: ss.getUrl()
        },
        message: 'Data exported successfully'
      };
    } catch (error) {
      Logger.log('ReportService.exportToGoogleSheets error: ' + error);
      return { success: false, message: 'Failed to export to Google Sheets', error: error.toString() };
    }
  },

  /**
   * Generate and send email report
   * @param {string} recipientEmail - Email address
   * @param {string} subject - Email subject
   * @param {Object} reportData - Report data to include
   * @returns {Object} Response
   */
  sendEmailReport(recipientEmail, subject, reportData) {
    try {
      // Generate HTML email body
      let htmlBody = '<h2>' + subject + '</h2>';
      htmlBody += '<p>Generated on: ' + formatDateTime(new Date()) + '</p>';
      
      if (reportData.summary) {
        htmlBody += '<h3>Summary</h3><ul>';
        Object.keys(reportData.summary).forEach(key => {
          htmlBody += `<li><strong>${key}:</strong> ${reportData.summary[key]}</li>`;
        });
        htmlBody += '</ul>';
      }

      if (reportData.data && reportData.data.length > 0) {
        htmlBody += '<h3>Details</h3>';
        htmlBody += '<table border="1" cellpadding="5" style="border-collapse: collapse;">';
        
        // Header
        const headers = Object.keys(reportData.data[0]);
        htmlBody += '<tr style="background-color: #4285f4; color: white;">';
        headers.forEach(h => htmlBody += `<th>${h}</th>`);
        htmlBody += '</tr>';
        
        // Rows (limit to first 50)
        const rowsToShow = reportData.data.slice(0, 50);
        rowsToShow.forEach(row => {
          htmlBody += '<tr>';
          headers.forEach(h => htmlBody += `<td>${row[h] || ''}</td>`);
          htmlBody += '</tr>';
        });
        
        if (reportData.data.length > 50) {
          htmlBody += '<tr><td colspan="' + headers.length + '"><em>... and ' + (reportData.data.length - 50) + ' more rows</em></td></tr>';
        }
        
        htmlBody += '</table>';
      }

      MailApp.sendEmail({
        to: recipientEmail,
        subject: subject,
        htmlBody: htmlBody
      });

      return { success: true, message: 'Report sent successfully' };
    } catch (error) {
      Logger.log('ReportService.sendEmailReport error: ' + error);
      return { success: false, message: 'Failed to send email report', error: error.toString() };
    }
  }
};
