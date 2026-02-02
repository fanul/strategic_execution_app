/**
 * SettingsService.js
 * Manages application settings, preferences, and configurations
 * Uses PropertiesService for persistent storage
 */

const SETTINGS_PROPERTIES_KEY = 'APP_SETTINGS';

/**
 * Get all application settings
 * @returns {Object} Formatted response with settings data
 */
function getSettings() {
  try {
    const properties = PropertiesService.getScriptProperties();
    const settingsJson = properties.getProperty(SETTINGS_PROPERTIES_KEY);

    let settings = {};
    if (settingsJson) {
      try {
        settings = JSON.parse(settingsJson);
      } catch (parseError) {
        Logger.log('Error parsing settings JSON: ' + parseError);
        settings = getDefaultSettings();
      }
    } else {
      // Initialize with default settings if none exist
      settings = getDefaultSettings();
      saveSettingsToProperties(settings);
    }

    return formatSuccess(settings, 'Settings retrieved successfully');
  } catch (error) {
    Logger.log('Error getting settings: ' + error);
    return formatError('Failed to retrieve settings', error.message);
  }
}

/**
 * Save general settings
 * @param {Object} data - Settings data to save
 * @param {string} userId - User ID making the change
 * @returns {Object} Formatted response
 */
function saveSettings(data, userId) {
  try {
    const properties = PropertiesService.getScriptProperties();
    const currentSettings = getCurrentSettings();

    // Update settings with new values
    const updatedSettings = {
      ...currentSettings,
      appName: data.appName || currentSettings.appName,
      defaultLanguage: data.defaultLanguage || currentSettings.defaultLanguage,
      dateFormat: data.dateFormat || currentSettings.dateFormat,
      timeZone: data.timeZone || currentSettings.timeZone,
      debugMode: data.debugMode !== undefined ? data.debugMode : currentSettings.debugMode,
      lastUpdated: new Date().toISOString(),
      lastUpdatedBy: userId
    };

    saveSettingsToProperties(updatedSettings);

    // Log the change
    logAuditEvent('settings', 'update', userId, {
      updatedFields: Object.keys(data),
      debugMode: updatedSettings.debugMode
    });

    return formatSuccess(updatedSettings, 'Settings saved successfully');
  } catch (error) {
    Logger.log('Error saving settings: ' + error);
    return formatError('Failed to save settings', error.message);
  }
}

/**
 * Save security settings
 * @param {Object} data - Security settings to save
 * @param {string} userId - User ID making the change
 * @returns {Object} Formatted response
 */
function saveSecuritySettings(data, userId) {
  try {
    const properties = PropertiesService.getScriptProperties();
    const currentSettings = getCurrentSettings();

    const updatedSettings = {
      ...currentSettings,
      security: {
        sessionTimeout: data.sessionTimeout || 60,
        requireUppercase: data.requireUppercase !== undefined ? data.requireUppercase : true,
        requireNumbers: data.requireNumbers !== undefined ? data.requireNumbers : true,
        requireSpecialChars: data.requireSpecialChars !== undefined ? data.requireSpecialChars : false,
        minPasswordLength: data.minPasswordLength || 8,
        enableTwoFactor: data.enableTwoFactor || false
      },
      lastUpdated: new Date().toISOString(),
      lastUpdatedBy: userId
    };

    saveSettingsToProperties(updatedSettings);

    logAuditEvent('settings', 'update_security', userId, data);

    return formatSuccess(updatedSettings, 'Security settings saved successfully');
  } catch (error) {
    Logger.log('Error saving security settings: ' + error);
    return formatError('Failed to save security settings', error.message);
  }
}

/**
 * Save notification settings
 * @param {Object} data - Notification preferences to save
 * @param {string} userId - User ID making the change
 * @returns {Object} Formatted response
 */
function saveNotificationSettings(data, userId) {
  try {
    const properties = PropertiesService.getScriptProperties();
    const currentSettings = getCurrentSettings();

    const updatedSettings = {
      ...currentSettings,
      notifications: {
        kpiUpdates: data.kpiUpdates !== undefined ? data.kpiUpdates : true,
        okrReviews: data.okrReviews !== undefined ? data.okrReviews : true,
        deadlineReminders: data.deadlineReminders !== undefined ? data.deadlineReminders : true,
        systemUpdates: data.systemUpdates !== undefined ? data.systemUpdates : true,
        mentions: data.mentions !== undefined ? data.mentions : true
      },
      lastUpdated: new Date().toISOString(),
      lastUpdatedBy: userId
    };

    saveSettingsToProperties(updatedSettings);

    logAuditEvent('settings', 'update_notifications', userId, data);

    return formatSuccess(updatedSettings, 'Notification preferences saved successfully');
  } catch (error) {
    Logger.log('Error saving notification settings: ' + error);
    return formatError('Failed to save notification preferences', error.message);
  }
}

/**
 * Export settings data
 * @param {string} format - Export format (csv, json, excel)
 * @returns {Object} Formatted response with export data
 */
function exportSettingsData(format) {
  try {
    const settings = getCurrentSettings();

    switch (format) {
      case 'json':
        return formatSuccess({
          data: JSON.stringify(settings, null, 2),
          filename: 'settings_export.json'
        }, 'Settings exported as JSON');

      case 'csv':
        // Convert settings to CSV format
        const csvContent = convertSettingsToCSV(settings);
        return formatSuccess({
          data: csvContent,
          filename: 'settings_export.csv'
        }, 'Settings exported as CSV');

      case 'excel':
        // For now, return CSV (can be enhanced to use SpreadsheetApp)
        const excelContent = convertSettingsToCSV(settings);
        return formatSuccess({
          data: excelContent,
          filename: 'settings_export.csv'
        }, 'Settings exported (CSV format)');

      default:
        return formatError('Invalid export format', 'Supported formats: json, csv, excel');
    }
  } catch (error) {
    Logger.log('Error exporting settings: ' + error);
    return formatError('Failed to export settings', error.message);
  }
}

/**
 * Clear application cache
 * @param {string} userId - User ID requesting the cache clear
 * @returns {Object} Formatted response
 */
function clearApplicationCache(userId) {
  try {
    const cache = CacheService.getScriptCache();
    const keys = cache.getAllKeys();

    // Clear all cached data
    cache.removeAll(keys);

    logAuditEvent('settings', 'clear_cache', userId, {
      clearedKeys: keys.length
    });

    return formatSuccess({
      clearedKeys: keys.length
    }, 'Application cache cleared successfully');
  } catch (error) {
    Logger.log('Error clearing cache: ' + error);
    return formatError('Failed to clear cache', error.message);
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get current settings from properties
 * @returns {Object} Current settings
 */
function getCurrentSettings() {
  const properties = PropertiesService.getScriptProperties();
  const settingsJson = properties.getProperty(SETTINGS_PROPERTIES_KEY);

  if (settingsJson) {
    try {
      return JSON.parse(settingsJson);
    } catch (parseError) {
      Logger.log('Error parsing settings, returning defaults: ' + parseError);
      return getDefaultSettings();
    }
  }

  return getDefaultSettings();
}

/**
 * Save settings to properties
 * @param {Object} settings - Settings object to save
 */
function saveSettingsToProperties(settings) {
  const properties = PropertiesService.getScriptProperties();
  properties.setProperty(SETTINGS_PROPERTIES_KEY, JSON.stringify(settings));
}

/**
 * Get default settings
 * @returns {Object} Default settings object
 */
function getDefaultSettings() {
  return {
    appName: 'Strategic Execution Management',
    defaultLanguage: 'en',
    dateFormat: 'dd/mm/yyyy',
    timeZone: 'UTC',
    debugMode: true, // Default to true for development
    security: {
      sessionTimeout: 60,
      requireUppercase: true,
      requireNumbers: true,
      requireSpecialChars: false,
      minPasswordLength: 8,
      enableTwoFactor: false
    },
    notifications: {
      kpiUpdates: true,
      okrReviews: true,
      deadlineReminders: true,
      systemUpdates: true,
      mentions: true
    },
    version: '1.0.0',
    createdAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString()
  };
}

/**
 * Convert settings to CSV format
 * @param {Object} settings - Settings object
 * @returns {string} CSV content
 */
function convertSettingsToCSV(settings) {
  const rows = [
    ['Setting', 'Value', 'Category'],
    ['Application Name', settings.appName, 'General'],
    ['Default Language', settings.defaultLanguage, 'General'],
    ['Date Format', settings.dateFormat, 'General'],
    ['Time Zone', settings.timeZone, 'General'],
    ['Debug Mode', settings.debugMode ? 'Enabled' : 'Disabled', 'General'],
    ['Session Timeout', settings.security.sessionTimeout + ' minutes', 'Security'],
    ['Require Uppercase', settings.security.requireUppercase ? 'Yes' : 'No', 'Security'],
    ['Require Numbers', settings.security.requireNumbers ? 'Yes' : 'No', 'Security'],
    ['Require Special Characters', settings.security.requireSpecialChars ? 'Yes' : 'No', 'Security'],
    ['Min Password Length', settings.security.minPasswordLength, 'Security'],
    ['Two-Factor Authentication', settings.security.enableTwoFactor ? 'Enabled' : 'Disabled', 'Security'],
    ['KPI Updates Notifications', settings.notifications.kpiUpdates ? 'Enabled' : 'Disabled', 'Notifications'],
    ['OKR Review Notifications', settings.notifications.okrReviews ? 'Enabled' : 'Disabled', 'Notifications'],
    ['Deadline Reminders', settings.notifications.deadlineReminders ? 'Enabled' : 'Disabled', 'Notifications'],
    ['System Updates', settings.notifications.systemUpdates ? 'Enabled' : 'Disabled', 'Notifications'],
    ['Mentions', settings.notifications.mentions ? 'Enabled' : 'Disabled', 'Notifications']
  ];

  return rows.map(row => row.join(',')).join('\n');
}

/**
 * Log audit event for settings changes
 * @param {string} entityType - Entity type (settings)
 * @param {string} action - Action performed
 * @param {string} userId - User ID
 * @param {Object} details - Event details
 */
function logAuditEvent(entityType, action, userId, details) {
  try {
    // Check if AuditService is available
    if (typeof logAudit === 'function') {
      logAudit(entityType, null, userId, action, details);
    } else {
      Logger.log('Audit: ' + entityType + ' - ' + action + ' by ' + userId);
    }
  } catch (error) {
    Logger.log('Error logging audit event: ' + error);
  }
}
