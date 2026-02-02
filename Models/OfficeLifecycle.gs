/**
 * Models/OfficeLifecycle.gs
 * Office lifecycle history model for tracking organizational changes
 */

const OfficeLifecycleModel = {
  /**
   * Get all lifecycle events with optional filters
   */
  getAll(filters = {}) {
    let events = getTableData(DB_CONFIG.SHEET_NAMES.OFFICE_LIFECYCLE_HISTORY);

    // Filter by unit_id
    if (filters.unit_id) {
      events = events.filter(e => e.unit_id === filters.unit_id);
    }

    // Filter by event_type
    if (filters.event_type) {
      events = events.filter(e => e.event_type === filters.event_type);
    }

    // Filter by date range
    if (filters.from_date) {
      events = events.filter(e => new Date(e.event_date) >= new Date(filters.from_date));
    }
    if (filters.to_date) {
      events = events.filter(e => new Date(e.event_date) <= new Date(filters.to_date));
    }

    // Filter by performer
    if (filters.performed_by) {
      events = events.filter(e => e.performed_by === filters.performed_by);
    }

    // Sort by date descending
    events.sort((a, b) => new Date(b.event_date) - new Date(a.event_date));

    return events;
  },

  /**
   * Get lifecycle events for a specific unit
   */
  getByUnit(unitId) {
    return this.getAll({ unit_id: unitId });
  },

  /**
   * Get lifecycle timeline for a unit
   */
  getTimeline(unitId) {
    const events = this.getByUnit(unitId);

    return events.map(event => {
      const unit = OrganizationModel.OrganizationalUnit.findById(event.unit_id);
      const relatedUnit = event.related_unit_id ?
        OrganizationModel.OrganizationalUnit.findById(event.related_unit_id) : null;

      return {
        ...event,
        unit_name: unit ? unit.unit_name : 'Unknown',
        related_unit_name: relatedUnit ? relatedUnit.unit_name : null,
        event_description: this.getEventDescription(event)
      };
    });
  },

  /**
   * Get human-readable event description
   */
  getEventDescription(event) {
    const descriptions = {
      'CREATED': 'Unit was created',
      'CLOSED': `Unit was closed: ${event.event_reason}`,
      'MERGED': `Unit was merged into another unit: ${event.event_reason}`,
      'SPLIT': 'Unit was split into multiple units',
      'RECLASSIFIED': `Unit was reclassified from ${event.previous_classification} to ${event.new_classification}`,
      'REOPENED': 'Unit was reopened'
    };

    return descriptions[event.event_type] || event.event_type;
  },

  /**
   * Get events by type
   */
  getByEventType(eventType) {
    return this.getAll({ event_type: eventType });
  },

  /**
   * Get events by date range
   */
  getByDateRange(startDate, endDate) {
    return this.getAll({
      from_date: startDate,
      to_date: endDate
    });
  },

  /**
   * Get all changes in a specific period (for audit/reports)
   */
  getChangesInPeriod(startDate, endDate, eventType = null) {
    const filters = {
      from_date: startDate,
      to_date: endDate
    };

    if (eventType) {
      filters.event_type = eventType;
    }

    return this.getAll(filters);
  },

  /**
   * Get summary statistics
   */
  getStatistics(filters = {}) {
    const events = this.getAll(filters);

    const stats = {
      total: events.length,
      by_type: {},
      by_date: {},
      by_unit: {}
    };

    events.forEach(event => {
      // Count by type
      stats.by_type[event.event_type] = (stats.by_type[event.event_type] || 0) + 1;

      // Count by date (YYYY-MM)
      const dateKey = event.event_date.substring(0, 7);
      stats.by_date[dateKey] = (stats.by_date[dateKey] || 0) + 1;

      // Count by unit
      stats.by_unit[event.unit_id] = (stats.by_unit[event.unit_id] || 0) + 1;
    });

    return stats;
  },

  /**
   * Create lifecycle history entry
   */
  create(historyData) {
    const requiredFields = ['unit_id', 'event_type', 'event_date', 'event_reason', 'performed_by'];

    for (const field of requiredFields) {
      if (!historyData[field]) {
        return { success: false, message: `Missing required field: ${field}` };
      }
    }

    const newEntry = {
      history_id: generateUUID(),
      unit_id: historyData.unit_id,
      event_type: historyData.event_type,
      event_date: historyData.event_date,
      event_reason: historyData.event_reason,
      previous_status: historyData.previous_status || null,
      new_status: historyData.new_status || null,
      previous_classification: historyData.previous_classification || null,
      new_classification: historyData.new_classification || null,
      related_unit_id: historyData.related_unit_id || null,
      performed_by: historyData.performed_by,
      supporting_documents: historyData.supporting_documents ?
        (typeof historyData.supporting_documents === 'string' ?
          historyData.supporting_documents :
          JSON.stringify(historyData.supporting_documents)) :
        null,
      notes: historyData.notes || '',
      created_at: formatDateTime(new Date())
    };

    const result = insertRecord(DB_CONFIG.SHEET_NAMES.OFFICE_LIFECYCLE_HISTORY, newEntry);

    return result.success ? {
      success: true,
      data: newEntry,
      message: 'Lifecycle history entry created'
    } : {
      success: false,
      error: result.error,
      message: 'Failed to create lifecycle history entry'
    };
  },

  /**
   * Get recent changes (for dashboard)
   */
  getRecentChanges(limit = 10) {
    const events = this.getAll();
    return events.slice(0, limit);
  }
};
