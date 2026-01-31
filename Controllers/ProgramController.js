/**
 * Controllers/ProgramController.js
 * Program and Activity management controller
 */

const ProgramController = {
  create(data, creatorId) {
    try {
      const validation = validateProgram(data);
      if (!validation.isValid) {
        return { success: false, message: 'Validation failed', errors: validation.errors };
      }

      data.created_by = creatorId;
      const result = ProgramModel.create(data);

      if (result.success) {
        logAudit('CREATE', 'Programs', result.data.program_id, creatorId, 'Program created');
      }

      return result;
    } catch (error) {
      Logger.log('ProgramController.create error: ' + error);
      return { success: false, message: 'Failed to create program', error: error.toString() };
    }
  },

  update(programId, data, updaterId) {
    try {
      const validation = validateProgram(data, true);
      if (!validation.isValid) {
        return { success: false, message: 'Validation failed', errors: validation.errors };
      }

      data.updated_by = updaterId;
      const result = ProgramModel.update(programId, data);

      if (result.success) {
        logMultipleRevisions('Programs', programId, data, 'UPDATE', updaterId, 'Program updated');
      }

      return result;
    } catch (error) {
      Logger.log('ProgramController.update error: ' + error);
      return { success: false, message: 'Failed to update program', error: error.toString() };
    }
  },

  delete(programId, deleterId) {
    try {
      const result = ProgramModel.delete(programId);

      if (result.success) {
        logAudit('DELETE', 'Programs', programId, deleterId, 'Program deleted');
      }

      return result;
    } catch (error) {
      Logger.log('ProgramController.delete error: ' + error);
      return { success: false, message: 'Failed to delete program', error: error.toString() };
    }
  },

  getByWorkUnitGoal(workUnitGoalId) {
    const programs = ProgramModel.getByWorkUnitGoal(workUnitGoalId);
    return { success: true, data: programs };
  },

  getAllPrograms(filters) {
    const programs = ProgramModel.getAll(filters);
    return { success: true, data: programs };
  },

  getById(programId) {
    const program = ProgramModel.findById(programId);
    return program 
      ? { success: true, data: program }
      : { success: false, message: 'Program not found' };
  },

  // ===== ACTIVITIES =====
  Activity: {
    create(data, creatorId) {
      try {
        data.created_by = creatorId;
        const result = ActivityModel.create(data);

        if (result.success) {
          logAudit('CREATE', 'Activities', result.data.activity_id, creatorId, 
                   `Activity created with cost: ${result.data.total_cost}`);
        }

        return result;
      } catch (error) {
        Logger.log('ProgramController.Activity.create error: ' + error);
        return { success: false, message: 'Failed to create activity', error: error.toString() };
      }
    },

    update(activityId, data, updaterId) {
      try {
        data.updated_by = updaterId;
        const result = ActivityModel.update(activityId, data);

        if (result.success) {
          logMultipleRevisions('Activities', activityId, data, 'UPDATE', updaterId, 'Activity updated');
        }

        return result;
      } catch (error) {
        Logger.log('ProgramController.Activity.update error: ' + error);
        return { success: false, message: 'Failed to update activity', error: error.toString() };
      }
    },

    delete(activityId, deleterId) {
      try {
        const result = ActivityModel.delete(activityId);

        if (result.success) {
          logAudit('DELETE', 'Activities', activityId, deleterId, 'Activity deleted');
        }

        return result;
      } catch (error) {
        Logger.log('ProgramController.Activity.delete error: ' + error);
        return { success: false, message: 'Failed to delete activity', error: error.toString() };
      }
    },

    getByProgram(programId) {
      const activities = ActivityModel.getByProgram(programId);
      return { success: true, data: activities };
    }
  }
};

// Top-level convenience functions for API routing
ProgramController.listPrograms = function(data) {
  return ProgramController.getAllPrograms(data);
};

ProgramController.saveProgram = function(data) {
  return data.program_id ? ProgramController.update(data.program_id, data, 'system') : ProgramController.create(data, 'system');
};

ProgramController.deleteProgram = function(data) {
  return ProgramController.delete(data.program_id, 'system');
};

ProgramController.getActivities = function(data) {
  return ProgramController.Activity.getByProgram(data.programId);
};

ProgramController.saveActivity = function(data) {
  const activityData = { ...data };
  const id = activityData.activity_id;
  delete activityData.activity_id;
  return id ? ProgramController.Activity.update(id, activityData, 'system') : ProgramController.Activity.create(activityData, 'system');
};

ProgramController.deleteActivity = function(data) {
  return ProgramController.Activity.delete(data.activity_id, 'system');
};
