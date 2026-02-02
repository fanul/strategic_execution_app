/**
 * Controllers/KPIController.js
 * KPI management controller (migrated and enhanced)
 */

const KPIController = {
  // ===== ORGANIZATIONAL KPIs =====
  create(data, creatorId) {
    try {
      const validation = validateKPI(data);
      if (!validation.isValid) {
        return { success: false, message: 'Validation failed', errors: validation.errors };
      }

      data.created_by = creatorId;
      const result = KPIModel.create(data);

      if (result.success) {
        logAudit('CREATE', 'KPIs', result.data.kpi_id, creatorId, 'KPI created');
      }

      return result;
    } catch (error) {
      Logger.log('KPIController.create error: ' + error);
      return { success: false, message: 'Failed to create KPI', error: error.toString() };
    }
  },

  update(kpiId, data, updaterId) {
    try {
      const validation = validateKPI(data, true);
      if (!validation.isValid) {
        return { success: false, message: 'Validation failed', errors: validation.errors };
      }

      data.updated_by = updaterId;
      const result = KPIModel.update(kpiId, data);

      if (result.success) {
        logMultipleRevisions('KPIs', kpiId, data, 'UPDATE', updaterId, 'KPI updated');
      }

      return result;
    } catch (error) {
      Logger.log('KPIController.update error: ' + error);
      return { success: false, message: 'Failed to update KPI', error: error.toString() };
    }
  },

  getByWorkUnit(workUnitId, year) {
    const kpis = KPIModel.getByWorkUnit(workUnitId, year);
    return { success: true, data: kpis };
  },

  getById(kpiId) {
    const kpi = KPIModel.findById(kpiId);
    return kpi 
      ? { success: true, data: kpi }
      : { success: false, message: 'KPI not found' };
  },

  delete(kpiId, deleterId) {
    const result = KPIModel.delete(kpiId);
    if (result.success) {
      logAudit('DELETE', 'KPIs', kpiId, deleterId, 'KPI deleted');
    }
    return result;
  },

  // ===== KPI PROGRESS =====
  Progress: {
    record(data, reporterId) {
      try {
        data.reported_by = reporterId;
        const result = KPIModel.Progress.create(data);

        if (result.success) {
          logAudit('CREATE', 'KPIMonthlyProgress', result.data.progress_id, reporterId, 
                   `KPI progress recorded: ${data.actual_value}`);
        }

        return result;
      } catch (error) {
        Logger.log('KPIController.Progress.record error: ' + error);
        return { success: false, message: 'Failed to record progress', error: error.toString() };
      }
    },

    verify(progressId, verifierId) {
      const result = KPIModel.Progress.verify(progressId, verifierId);

      if (result.success) {
        logAudit('UPDATE', 'KPIMonthlyProgress', progressId, verifierId, 'Progress verified');
      }

      return result;
    },

    getByKPI(kpiId, year, month) {
      const progress = KPIModel.Progress.getByKPI(kpiId, year, month);
      return { success: true, data: progress };
    }
  },

  // ===== INDIVIDUAL KPIs =====
  Individual: {
    create(data, creatorId) {
      try {
        const validation = validateKPI(data);
        if (!validation.isValid) {
          return { success: false, message: 'Validation failed', errors: validation.errors };
        }

        data.created_by = creatorId;
        const result = KPIModel.Individual.create(data);

        if (result.success) {
          logAudit('CREATE', 'IndividualKPIs', result.data.individual_kpi_id, creatorId, 'Individual KPI created');
        }

        return result;
      } catch (error) {
        Logger.log('KPIController.Individual.create error: ' + error);
        return { success: false, message: 'Failed to create individual KPI', error: error.toString() };
      }
    },

    update(individualKpiId, data, updaterId) {
      try {
        const validation = validateKPI(data, true);
        if (!validation.isValid) {
          return { success: false, message: 'Validation failed', errors: validation.errors };
        }

        data.updated_by = updaterId;
        const result = KPIModel.Individual.update(individualKpiId, data);

        if (result.success) {
          logMultipleRevisions('IndividualKPIs', individualKpiId, data, 'UPDATE', updaterId, 'Individual KPI updated');
        }

        return result;
      } catch (error) {
        Logger.log('KPIController.Individual.update error: ' + error);
        return { success: false, message: 'Failed to update individual KPI', error: error.toString() };
      }
    },

    delete(individualKpiId, deleterId) {
      try {
        const result = KPIModel.Individual.delete(individualKpiId);

        if (result.success) {
          logAudit('DELETE', 'IndividualKPIs', individualKpiId, deleterId, 'Individual KPI deleted');
        }

        return result;
      } catch (error) {
        Logger.log('KPIController.Individual.delete error: ' + error);
        return { success: false, message: 'Failed to delete individual KPI', error: error.toString() };
      }
    },

    getByPosition(positionId, year) {
      const kpis = KPIModel.Individual.getByPosition(positionId, year);
      return { success: true, data: kpis };
    }
  }
};

// Top-level convenience functions for API routing
KPIController.getAllOrganizationalKPIs = function(data) {
  const year = data && data.year ? data.year : new Date().getFullYear();
  const workUnitId = data && data.work_unit_id ? data.work_unit_id : null;
  
  if (workUnitId) {
    return KPIController.getByWorkUnit(workUnitId, year);
  }
  
  // Return empty for now - need to add getAll method
  return { success: true, data: [] };
};

KPIController.createKPI = function(data) {
  return KPIController.create(data, data.created_by || data.updated_by || 'system');
};

KPIController.updateKPI = function(data) {
  return KPIController.update(data.kpi_id || data.kpiId, data, data.updated_by || 'system');
};

KPIController.deleteKPI = function(data) {
  return KPIController.delete(data.kpi_id || data.kpiId, data.updated_by || 'system');
};

KPIController.getAllIndividualKPIs = function(data) {
  const year = data && data.year ? data.year : new Date().getFullYear();
  const kpis = KPIModel.Individual.getAll(year);
  return { success: true, data: kpis };
};

KPIController.createIndividualKPI = function(data) {
  return KPIController.Individual.create(data, data.created_by || 'system');
};

KPIController.updateIndividualKPI = function(data) {
  return KPIController.Individual.update(data.individual_kpi_id || data.individualKpiId, data, data.updated_by || 'system');
};

KPIController.deleteIndividualKPI = function(data) {
  return KPIController.Individual.delete(data.individual_kpi_id || data.individualKpiId, data.updated_by || 'system');
};
