/**
 * Services/AuditService.js
 * Enhanced audit trail and revision tracking system.
 */

/**
 * Log a revision (field-level change tracking)
 * @param {string} entityType - Table/entity name
 * @param {string} entityId - Record ID
 * @param {string} fieldName - Field that changed
 * @param {any} oldValue - Previous value
 * @param {any} newValue - New value
 * @param {string} changeType - CREATE, UPDATE, DELETE, RESTORE
 * @param {string} userId - User who made the change
 * @param {string} reason - Optional reason for change
 * @returns {Object} Response
 */
function logRevision(entityType, entityId, fieldName, oldValue, newValue, changeType, userId, reason = '') {
  try {
    const ss = getSpreadsheet();
    const sheet = ss.getSheetByName(DB_CONFIG.SHEET_NAMES.REVISIONS);
    
    if (!sheet) {
      Logger.log('Revisions sheet not found');
      return formatError('Revisions tracking not available');
    }
    
    const revisionId = generateUUID();
    const now = new Date();
    
    // Get IP address and user agent (limited in Apps Script)
    const ipAddress = 'N/A'; // Apps Script doesn't provide direct access
    const userAgent = 'Google Apps Script';
    
    // Convert values to JSON strings for storage
    const oldValueJson = typeof oldValue === 'object' ? JSON.stringify(oldValue) : String(oldValue || '');
    const newValueJson = typeof newValue === 'object' ? JSON.stringify(newValue) : String(newValue || '');
    
    const row = [
      revisionId,
      entityType,
      entityId,
      fieldName,
      oldValueJson,
      newValueJson,
      changeType,
      userId,
      now,
      reason,
      ipAddress,
      userAgent
    ];
    
    sheet.appendRow(row);
    
    return formatSuccess({ revision_id: revisionId }, 'Revision logged');
  } catch (e) {
    Logger.log(`Error logging revision: ${e}`);
    return formatError('Failed to log revision', e);
  }
}

/**
 * Log multiple field changes at once
 * @param {string} entityType - Table/entity name
 * @param {string} entityId - Record ID
 * @param {Object} changes - Object with field: {oldValue, newValue} pairs
 * @param {string} changeType - CREATE, UPDATE, DELETE
 * @param {string} userId - User who made the change
 * @param {string} reason - Optional reason
 * @returns {Object} Response
 */
function logMultipleRevisions(entityType, entityId, changes, changeType, userId, reason = '') {
  const revisionIds = [];
  
  for (let fieldName in changes) {
    const result = logRevision(
      entityType,
      entityId,
      fieldName,
      changes[fieldName].oldValue,
      changes[fieldName].newValue,
      changeType,
      userId,
      reason
    );
    
    if (result.success) {
      revisionIds.push(result.data.revision_id);
    }
  }
  
  return formatSuccess(
    { revision_ids: revisionIds, count: revisionIds.length },
    `Logged ${revisionIds.length} revisions`
  );
}

/**
 * Get revision history for an entity
 * @param {string} entityType - Table/entity name
 * @param {string} entityId - Record ID
 * @param {number} limit - Maximum number of revisions to return
 * @returns {Object} Response with revisions
 */
function getRevisionHistory(entityType, entityId, limit = 50) {
  try {
    const revisions = getTableData(DB_CONFIG.SHEET_NAMES.REVISIONS);
    
    const filtered = revisions
      .filter(r => r.entity_type === entityType && r.entity_id === entityId)
      .sort((a, b) => new Date(b.changed_at) - new Date(a.changed_at))
      .slice(0, limit);
    
    return formatSuccess(filtered, `Found ${filtered.length} revisions`);
  } catch (e) {
    Logger.log(`Error getting revision history: ${e}`);
    return formatError('Failed to get revision history', e);
  }
}

/**
 * Get recent revisions across all entities
 * @param {number} limit - Maximum number of revisions
 * @param {string} userId - Optional filter by user
 * @returns {Object} Response with revisions
 */
function getRecentRevisions(limit = 100, userId = null) {
  try {
    let revisions = getTableData(DB_CONFIG.SHEET_NAMES.REVISIONS);
    
    if (userId) {
      revisions = revisions.filter(r => r.changed_by === userId);
    }
    
    const sorted = revisions
      .sort((a, b) => new Date(b.changed_at) - new Date(a.changed_at))
      .slice(0, limit);
    
    return formatSuccess(sorted, `Found ${sorted.length} revisions`);
  } catch (e) {
    Logger.log(`Error getting recent revisions: ${e}`);
    return formatError('Failed to get recent revisions', e);
  }
}

/**
 * Compare two revisions (before/after)
 * @param {string} revisionId1 - First revision ID
 * @param {string} revisionId2 - Second revision ID
 * @returns {Object} Comparison data
 */
function compareRevisions(revisionId1, revisionId2) {
  try {
    const revisions = getTableData(DB_CONFIG.SHEET_NAMES.REVISIONS);
    
    const rev1 = revisions.find(r => r.revision_id === revisionId1);
    const rev2 = revisions.find(r => r.revision_id === revisionId2);
    
    if (!rev1 || !rev2) {
      return formatError('One or both revisions not found');
    }
    
    return formatSuccess({
      revision1: rev1,
      revision2: rev2,
      fieldName: rev1.field_name,
      changed: rev1.new_value !== rev2.new_value
    }, 'Comparison complete');
  } catch (e) {
    Logger.log(`Error comparing revisions: ${e}`);
    return formatError('Failed to compare revisions', e);
  }
}

/**
 * Restore a previous version (rollback)
 * @param {string} revisionId - Revision ID to restore
 * @param {string} userId - User performing the restore
 * @param {string} reason - Reason for restore
 * @returns {Object} Response
 */
function restoreRevision(revisionId, userId, reason) {
  try {
    const revisions = getTableData(DB_CONFIG.SHEET_NAMES.REVISIONS);
    const revision = revisions.find(r => r.revision_id === revisionId);
    
    if (!revision) {
      return formatError('Revision not found');
    }
    
    // Get the sheet and field to restore
    const sheetName = revision.entity_type;
    const entityId = revision.entity_id;
    const fieldName = revision.field_name;
    const valueToRestore = revision.old_value; // Restore to OLD value
    
    // Update the record
    const updateData = {};
    updateData[fieldName] = valueToRestore;
    
    const result = updateRecord(
      sheetName,
      Object.keys(getTableData(sheetName)[0])[0], // First column is ID
      entityId,
      updateData
    );
    
    if (result.success) {
      // Log the restore as a new revision
      logRevision(
        sheetName,
        entityId,
        fieldName,
        revision.new_value,
        valueToRestore,
        'RESTORE',
        userId,
        `Restored from revision ${revisionId}. Reason: ${reason}`
      );
      
      return formatSuccess(null, 'Revision restored successfully');
    } else {
      return result;
    }
  } catch (e) {
    Logger.log(`Error restoring revision: ${e}`);
    return formatError('Failed to restore revision', e);
  }
}

/**
 * Get revision statistics
 * @param {Object} filters - Optional filters {entityType, userId, startDate, endDate}
 * @returns {Object} Statistics
 */
function getRevisionStatistics(filters = {}) {
  try {
    let revisions = getTableData(DB_CONFIG.SHEET_NAMES.REVISIONS);
    
    // Apply filters
    if (filters.entityType) {
      revisions = revisions.filter(r => r.entity_type === filters.entityType);
    }
    if (filters.userId) {
      revisions = revisions.filter(r => r.changed_by === filters.userId);
    }
    if (filters.startDate) {
      revisions = revisions.filter(r => new Date(r.changed_at) >= new Date(filters.startDate));
    }
    if (filters.endDate) {
      revisions = revisions.filter(r => new Date(r.changed_at) <= new Date(filters.endDate));
    }
    
    // Calculate statistics
    const stats = {
      total: revisions.length,
      byType: {},
      byUser: {},
      byEntity: {}
    };
    
    revisions.forEach(rev => {
      // By change type
      stats.byType[rev.change_type] = (stats.byType[rev.change_type] || 0) + 1;
      
      // By user
      stats.byUser[rev.changed_by] = (stats.byUser[rev.changed_by] || 0) + 1;
      
      // By entity type
      stats.byEntity[rev.entity_type] = (stats.byEntity[rev.entity_type] || 0) + 1;
    });
    
    return formatSuccess(stats, 'Statistics generated');
  } catch (e) {
    Logger.log(`Error getting statistics: ${e}`);
    return formatError('Failed to get statistics', e);
  }
}

/**
 * Simple audit log (for basic tracking without field-level detail)
 * @param {string} action - Action performed
 * @param {string} entityType - Entity type
 * @param {string} entityId - Entity ID
 * @param {string} userId - User ID
 * @param {string} details - Additional details
 */
function logAudit(action, entityType, entityId, userId, details = '') {
  Logger.log(`AUDIT [${action}] ${entityType}:${entityId} by ${userId} - ${details}`);
  
  // For backward compatibility, also log as a revision with special type
  logRevision(
    entityType,
    entityId,
    '_audit_',
    '',
    details,
    action,
    userId,
    details
  );
}
