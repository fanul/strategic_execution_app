/**
 * Controllers/StrategicController.js
 * Strategic planning management controller
 */

const StrategicController = {
  // ===== PERIODS =====
  Period: {
    create(data, creatorId) {
      if (data.start_year >= data.end_year) {
        return { success: false, message: 'End year must be after start year' };
      }
      
      data.created_by = creatorId;
      const result = StrategicModel.Period.create(data);
      
      if (result.success) {
        logAudit('CREATE', 'Periods', result.data.period_id, creatorId, 'Period created');
      }
      
      return result;
    },

    setActive(periodId, userId) {
      const result = StrategicModel.Period.setActive(periodId, userId);
      
      if (result.success) {
        logAudit('UPDATE', 'Periods', periodId, userId, 'Period activated');
      }
      
      return result;
    },

    update(periodId, updates, userId) {
      updates.updated_by = userId;
      const result = StrategicModel.Period.update(periodId, updates);
      
      if (result.success) {
        logAudit('UPDATE', 'Periods', periodId, userId, 'Period updated');
      }
      
      return result;
    },

    getDeletionImpact(periodId) {
      return StrategicModel.Period.getDeletionImpact(periodId);
    },

    deleteCascade(periodId, userId) {
      const result = StrategicModel.Period.deleteCascade(periodId);
      
      if (result.success) {
        logAudit('DELETE', 'Periods', periodId, userId, 'Period deleted with cascade');
      }
      
      return result;
    },

    getAll() {
      const periods = StrategicModel.Period.getAll();
      return { success: true, data: periods };
    },

    getActive() {
      const period = StrategicModel.Period.getActive();
      return period 
        ? { success: true, data: period }
        : { success: false, message: 'No active period found' };
    }
  },

  // ===== VISIONS =====
  Vision: {
    create(data, creatorId) {
      if (!data.vision_text || data.vision_text.length > 1000) {
        return { success: false, message: 'Vision text is required and must be max 1000 characters' };
      }
      
      data.created_by = creatorId;
      const result = StrategicModel.Vision.create(data);
      
      if (result.success) {
        logAudit('CREATE', 'Visions', result.data.vision_id, creatorId, 'Vision created');
      }
      
      return result;
    },

    approve(visionId, approverId) {
      const result = StrategicModel.Vision.approve(visionId, approverId);
      
      if (result.success) {
        logAudit('UPDATE', 'Visions', visionId, approverId, 'Vision approved');
      }
      
      return result;
    },

    getByPeriod(periodId) {
      const visions = StrategicModel.Vision.getByPeriod(periodId);
      return { success: true, data: visions };
    },

    update(visionId, updates, userId) {
      updates.updated_by = userId;
      const result = StrategicModel.Vision.update(visionId, updates);
      if (result.success) {
        logAudit('UPDATE', 'Visions', visionId, userId, 'Vision updated');
      }
      return result;
    },

    delete(visionId, userId) {
      const result = StrategicModel.Vision.delete(visionId);
      if (result.success) {
        logAudit('DELETE', 'Visions', visionId, userId, 'Vision deleted');
      }
      return result;
    }
  },

  // ===== MISSIONS =====
  Mission: {
    create(data, creatorId) {
      if (!data.mission_text || data.mission_text.length > 1500) {
        return { success: false, message: 'Mission text is required and must be max 1500 characters' };
      }
      
      // Vision auto-approves, so no check needed
      data.created_by = creatorId;
      const result = StrategicModel.Mission.create(data);
      
      if (result.success) {
        logAudit('CREATE', 'Missions', result.data.mission_id, creatorId, 'Mission created');
      }
      
      return result;
    },

    approve(missionId, approverId) {
      const result = StrategicModel.Mission.approve(missionId, approverId);
      
      if (result.success) {
        logAudit('UPDATE', 'Missions', missionId, approverId, 'Mission approved');
      }
      
      return result;
    },

    getByVision(visionId) {
      const missions = StrategicModel.Mission.getByVision(visionId);
      return { success: true, data: missions };
    },

    update(missionId, updates, userId) {
      updates.updated_by = userId;
      const result = StrategicModel.Mission.update(missionId, updates);
      if (result.success) {
        logAudit('UPDATE', 'Missions', missionId, userId, 'Mission updated');
      }
      return result;
    },

    delete(missionId, userId) {
      const result = StrategicModel.Mission.delete(missionId);
      if (result.success) {
        logAudit('DELETE', 'Missions', missionId, userId, 'Mission deleted');
      }
      return result;
    }
  },

  // ===== STRATEGIC INITIATIVES =====
  Initiative: {
    create(data, creatorId) {
      data.created_by = creatorId;
      const result = StrategicModel.Initiative.create(data);
      
      if (result.success) {
        logAudit('CREATE', 'StrategicInitiatives', result.data.initiative_id, creatorId, 'Initiative created');
      }
      
      return result;
    },

    getByYear(year) {
      const initiatives = StrategicModel.Initiative.getByYear(year);
      return { success: true, data: initiatives };
    },

    update(initiativeId, updates, userId) {
      updates.updated_by = userId;
      const result = StrategicModel.Initiative.update(initiativeId, updates);
      if (result.success) {
        logAudit('UPDATE', 'StrategicInitiatives', initiativeId, userId, 'Initiative updated');
      }
      return result;
    },

    delete(initiativeId, userId) {
      const result = StrategicModel.Initiative.delete(initiativeId);
      if (result.success) {
        logAudit('DELETE', 'StrategicInitiatives', initiativeId, userId, 'Initiative deleted');
      }
      return result;
    }
  },

  // ===== ORGANIZATIONAL GOALS =====
  Goal: {
    create(data, creatorId) {
      const validation = validateGoal(data);
      if (!validation.isValid) {
        return { success: false, message: 'Validation failed', errors: validation.errors };
      }
      
      data.created_by = creatorId;
      const result = StrategicModel.Goal.create(data);
      
      if (result.success) {
        logAudit('CREATE', 'OrganizationalGoals', result.data.goal_id, creatorId, 'Goal created');
      }
      
      return result;
    },

    getByYear(year) {
      const goals = StrategicModel.Goal.getByYear(year);
      return { success: true, data: goals };
    },

    update(goalId, updates, userId) {
      updates.updated_by = userId;
      const result = StrategicModel.Goal.update(goalId, updates);
      if (result.success) {
        logAudit('UPDATE', 'OrganizationalGoals', goalId, userId, 'Goal updated');
      }
      return result;
    },

    delete(goalId, userId) {
      const result = StrategicModel.Goal.delete(goalId);
      if (result.success) {
        logAudit('DELETE', 'OrganizationalGoals', goalId, userId, 'Goal deleted');
      }
      return result;
    }
  },

  // ===== WORK UNIT GOALS =====
  WorkUnitGoal: {
    create(data, creatorId) {
      const validation = validateGoal(data);
      if (!validation.isValid) {
        return { success: false, message: 'Validation failed', errors: validation.errors };
      }
      
      data.created_by = creatorId;
      const result = StrategicModel.WorkUnitGoal.create(data);
      
      if (result.success) {
        logAudit('CREATE', 'WorkUnitGoals', result.data.work_unit_goal_id, creatorId, 'Work unit goal created');
      }
      
      return result;
    },

    getByOrgGoal(orgGoalId) {
      const goals = StrategicModel.WorkUnitGoal.getByOrgGoal(orgGoalId);
      return { success: true, data: goals };
    },

    getByWorkUnit(workUnitId) {
      const goals = StrategicModel.WorkUnitGoal.getByWorkUnit(workUnitId);
      return { success: true, data: goals };
    }
  }
};

// Top-level convenience functions for API routing
StrategicController.getAllPeriods = function(data) {
  return StrategicController.Period.getAll();
};

StrategicController.getActivePeriod = function(data) {
  return StrategicController.Period.getActive();
};

StrategicController.createPeriod = function(data) {
  return StrategicController.Period.create(data, data.created_by || 'system');
};

StrategicController.updatePeriod = function(data) {
  return StrategicController.Period.update(data.periodId, data.updates, data.updated_by || 'system');
};

StrategicController.getPeriodDeletionImpact = function(data) {
  return StrategicController.Period.getDeletionImpact(data.periodId);
};

StrategicController.deletePeriod = function(data) {
  return StrategicController.Period.deleteCascade(data.periodId, data.updated_by || 'system');
};

StrategicController.updateVision = function(data) {
  return StrategicController.Vision.update(data.visionId, data.updates, data.updated_by || 'system');
};

StrategicController.createMission = function(data) {
  return StrategicController.Mission.create(data, data.created_by || 'system');
};

StrategicController.updateMission = function(data) {
  return StrategicController.Mission.update(data.missionId, data.updates, data.updated_by || 'system');
};

StrategicController.deleteMission = function(data) {
  return StrategicController.Mission.delete(data.missionId, data.updated_by || 'system');
};

StrategicController.approveVision = function(data) {
  return StrategicController.Vision.approve(data.visionId, data.updated_by || 'system');
};

StrategicController.createInitiative = function(data) {
  return StrategicController.Initiative.create(data, data.created_by || 'system');
};

StrategicController.updateInitiative = function(data) {
  return StrategicController.Initiative.update(data.initiativeId, data.updates, data.updated_by || 'system');
};

StrategicController.deleteInitiative = function(data) {
  return StrategicController.Initiative.delete(data.initiativeId, data.updated_by || 'system');
};

StrategicController.createGoal = function(data) {
  return StrategicController.Goal.create(data, data.created_by || 'system');
};

StrategicController.updateGoal = function(data) {
  return StrategicController.Goal.update(data.goalId, data.updates, data.updated_by || 'system');
};

StrategicController.deleteGoal = function(data) {
  return StrategicController.Goal.delete(data.goalId, data.updated_by || 'system');
};


