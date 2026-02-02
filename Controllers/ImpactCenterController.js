/**
 * ImpactCenterController.js
 * Controller for Impact Center management
 */

const ImpactCenterController = {
  
  /**
   * Create new Impact Center
   */
  create(data, creatorId) {
    try {
      // Validate input
      const validation = validateImpactCenter(data);
      if (!validation.isValid) {
        return { success: false, message: 'Validation failed', errors: validation.errors };
      }

      data.created_by = creatorId;
      const result = ImpactCenterModel.create(data);

      if (result.success) {
        logAudit('CREATE', 'ImpactCenters', result.data.ic_id, creatorId, 'Impact Center created');
      }

      return result;
    } catch (error) {
      Logger.log('Error creating impact center: ' + error.message);
      return { success: false, message: error.message, error: error.toString() };
    }
  },

  /**
   * Get Impact Center by ID
   */
  getById(impactCenterId) {
    try {
      const impactCenter = ImpactCenterModel.findById(impactCenterId);

      if (!impactCenter) {
        return { success: false, message: 'Impact Center not found' };
      }

      return { success: true, data: impactCenter };
    } catch (error) {
      Logger.log('Error getting impact center: ' + error.message);
      return { success: false, message: error.message, error: error.toString() };
    }
  },

  /**
   * Get all Impact Centers
   */
  getAll(filters = {}) {
    try {
      let impactCenters = ImpactCenterModel.getAll();

      // Apply filters
      if (filters.year) {
        impactCenters = impactCenters.filter(ic => ic.ic_code && ic.ic_code.startsWith(filters.year));
      }

      if (filters.goal_id) {
        impactCenters = impactCenters.filter(ic => ic.goal_id === filters.goal_id);
      }

      return { success: true, data: impactCenters };
    } catch (error) {
      Logger.log('Error getting impact centers: ' + error.message);
      return { success: false, message: error.message, error: error.toString() };
    }
  },

  getAllImpactCenters(filters) {
    return this.getAll(filters);
  },

  /**
   * Update Impact Center
   */
  update(impactCenterId, data, updaterId) {
    try {
      // Get existing record
      const existing = ImpactCenterModel.findById(impactCenterId);
      if (!existing) {
        return { success: false, message: 'Impact Center not found' };
      }

      // Validate
      const validation = validateImpactCenter(data);
      if (!validation.isValid) {
        return { success: false, message: 'Validation failed', errors: validation.errors };
      }

      data.updated_by = updaterId;
      const result = ImpactCenterModel.update(impactCenterId, data);

      if (result.success) {
        logAudit('UPDATE', 'ImpactCenters', impactCenterId, updaterId, 'Impact Center updated');
      }

      return result;
    } catch (error) {
      Logger.log('Error updating impact center: ' + error.message);
      return { success: false, message: error.message, error: error.toString() };
    }
  },

  /**
   * Delete Impact Center
   */
  delete(impactCenterId, deleterId) {
    try {
      const existing = ImpactCenterModel.findById(impactCenterId);
      if (!existing) {
        return { success: false, message: 'Impact Center not found' };
      }

      // Check for dependencies using the Progress model
      const progress = ImpactCenterModel.Progress.getByIC(impactCenterId);
      if (progress.length > 0) {
        return {
          success: false,
          message: 'Cannot delete Impact Center with existing progress records'
        };
      }

      const result = ImpactCenterModel.delete(impactCenterId);

      if (result.success) {
        logAudit('DELETE', 'ImpactCenters', impactCenterId, deleterId, 'Impact Center deleted');
      }

      return result;
    } catch (error) {
      Logger.log('Error deleting impact center: ' + error.message);
      return { success: false, message: error.message, error: error.toString() };
    }
  },

  /**
   * Submit monthly progress
   */
  submitProgress(data, reporterId) {
    try {
      // Validate
      if (!data.ic_id || !data.year || !data.month) {
        return { success: false, message: 'Missing required fields: ic_id, year, month' };
      }

      data.reported_by = reporterId;
      // Create progress record
      const result = ImpactCenterModel.Progress.create(data);

      if (result.success) {
        logAudit('CREATE', 'ICMonthlyProgress', result.data.progress_id, reporterId,
                 `IC progress submitted: ${data.completion_percentage}%`);
      }

      return result;
    } catch (error) {
      Logger.log('Error submitting progress: ' + error.message);
      return { success: false, message: error.message, error: error.toString() };
    }
  },

  /**
   * Get monthly progress for an Impact Center
   */
  getProgress(impactCenterId, year = null) {
    try {
      const progress = ImpactCenterModel.Progress.getByIC(impactCenterId, year);
      return { success: true, data: progress };
    } catch (error) {
      Logger.log('Error getting progress: ' + error.message);
      return { success: false, message: error.message, error: error.toString() };
    }
  },

  /**
   * Assign work unit to Impact Center
   */
  assignWorkUnit(data, creatorId) {
    try {
      if (!data.ic_id || !data.work_unit_id) {
        return { success: false, message: 'Missing required fields: ic_id, work_unit_id' };
      }

      data.created_by = creatorId;
      const result = ImpactCenterModel.Mapping.create(data);

      if (result.success) {
        logAudit('CREATE', 'ICWorkUnitMapping', result.data.mapping_id, creatorId,
                 `Work unit assigned to Impact Center`);
      }

      return result;
    } catch (error) {
      Logger.log('Error assigning work unit: ' + error.message);
      return { success: false, message: error.message, error: error.toString() };
    }
  },

  /**
   * Get work units assigned to Impact Center
   */
  getAssignedWorkUnits(impactCenterId) {
    try {
      const workUnits = ImpactCenterModel.Mapping.getByIC(impactCenterId);
      return { success: true, data: workUnits };
    } catch (error) {
      Logger.log('Error getting assigned work units: ' + error.message);
      return { success: false, message: error.message, error: error.toString() };
    }
  },

  /**
   * Remove work unit assignment
   */
  removeWorkUnit(mappingId, deleterId) {
    try {
      const result = ImpactCenterModel.Mapping.delete(mappingId);

      if (result.success) {
        logAudit('DELETE', 'ICWorkUnitMapping', mappingId, deleterId, 'Work unit removed from Impact Center');
      }

      return { success: true, message: 'Work unit removed successfully' };
    } catch (error) {
      Logger.log('Error removing work unit: ' + error.message);
      return { success: false, message: error.message, error: error.toString() };
    }
  }
};

// Top-level convenience functions for API routing
ImpactCenterController.listImpactCenters = function(data) {
  return ImpactCenterController.getAll(data);
};

ImpactCenterController.saveImpactCenter = function(data) {
  const id = data.impact_center_id;
  return id ? ImpactCenterController.update(id, data, data.updated_by || 'system') : ImpactCenterController.create(data, data.created_by || 'system');
};

ImpactCenterController.deleteImpactCenter = function(data) {
  return ImpactCenterController.delete(data.impact_center_id, data.updated_by || 'system');
};

ImpactCenterController.listProgress = function(data) {
  return ImpactCenterController.getProgress(data.impact_center_id, data.year);
};

ImpactCenterController.submitProgress = function(data) {
  return ImpactCenterController.submitProgress(data, data.reported_by || 'system');
};
