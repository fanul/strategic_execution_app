/**
 * Controllers/OrganizationController.js
 * Organizational structure management controller
 */

const OrganizationController = {
  // ===== DIRECTORATES =====
  Directorate: {
    create(data, creatorId) {
      const validation = validateDirectorate(data);
      if (!validation.isValid) {
        return { success: false, message: 'Validation failed', errors: validation.errors };
      }
      
      data.created_by = creatorId;
      const result = OrganizationModel.Directorate.create(data);
      
      if (result.success) {
        logAudit('CREATE', 'Directorates', result.data.directorate_id, creatorId, 'Directorate created');
      }
      
      return result;
    },

    update(directorateId, data, updaterId) {
      const validation = validateDirectorate(data, true);
      if (!validation.isValid) {
        return { success: false, message: 'Validation failed', errors: validation.errors };
      }
      
      data.updated_by = updaterId;
      const result = OrganizationModel.Directorate.update(directorateId, data);
      
      if (result.success) {
        logMultipleRevisions('Directorates', directorateId, data, 'UPDATE', updaterId, 'Directorate updated');
      }
      
      return result;
    },

    delete(directorateId, deleterId) {
      const result = OrganizationModel.Directorate.delete(directorateId);
      
      if (result.success) {
        logAudit('DELETE', 'Directorates', directorateId, deleterId, 'Directorate deleted');
      }
      
      return result;
    },

    getAll(filters) {
      Logger.log('OrganizationController.Directorate.getAll called with: ' + JSON.stringify(filters));
      const directorates = OrganizationModel.Directorate.getAll(filters);
      Logger.log('OrganizationController.Directorate.getAll result: success=true, count=' + (directorates ? directorates.length : 0));
      return { success: true, data: directorates };
    },

    getById(directorateId) {
      const directorate = OrganizationModel.Directorate.findById(directorateId);
      return directorate
        ? { success: true, data: directorate }
        : { success: false, message: 'Directorate not found' };
    },

    checkChildren(directorateId) {
      const children = OrganizationModel.Directorate.checkChildren(directorateId);
      return { success: true, data: children };
    },

    getAlternatives(directorateId) {
      const alternatives = OrganizationModel.Directorate.getAlternatives(directorateId);
      return { success: true, data: alternatives };
    },

    cascadeDelete(directorateId, deleterId) {
      const result = OrganizationModel.Directorate.cascadeDelete(directorateId, deleterId);
      if (result.success) {
        logAudit('DELETE', 'Directorates', directorateId, deleterId, 'Directorate cascade deleted with all children');
      }
      return result;
    },

    reassignAndDelete(directorateId, newDirectorateId, deleterId) {
      const result = OrganizationModel.Directorate.reassignAndDelete(directorateId, newDirectorateId, deleterId);
      if (result.success) {
        logAudit('DELETE', 'Directorates', directorateId, deleterId, 'Directorate deleted after reassigning children to ' + newDirectorateId);
      }
      return result;
    }
  },

  // ===== WORK UNITS =====
  WorkUnit: {
    create(data, creatorId) {
      data.created_by = creatorId;
      const result = OrganizationModel.WorkUnit.create(data);
      
      if (result.success) {
        logAudit('CREATE', 'WorkUnits', result.data.work_unit_id, creatorId, 'Work unit created');
      }
      
      return result;
    },

    update(workUnitId, data, updaterId) {
      data.updated_by = updaterId;
      const result = OrganizationModel.WorkUnit.update(workUnitId, data);
      
      if (result.success) {
        logMultipleRevisions('WorkUnits', workUnitId, data, 'UPDATE', updaterId, 'Work unit updated');
      }
      
      return result;
    },

    delete(workUnitId, deleterId) {
      const result = OrganizationModel.WorkUnit.delete(workUnitId);
      
      if (result.success) {
        logAudit('DELETE', 'WorkUnits', workUnitId, deleterId, 'Work unit deleted');
      }
      
      return result;
    },

    getAll(filters) {
      Logger.log('OrganizationController.WorkUnit.getAll called with: ' + JSON.stringify(filters));
      const workUnits = OrganizationModel.WorkUnit.getAll(filters);
      Logger.log('OrganizationController.WorkUnit.getAll result: success=true, count=' + (workUnits ? workUnits.length : 0));
      return { success: true, data: workUnits };
    },

    getById(workUnitId) {
      const workUnit = OrganizationModel.WorkUnit.findById(workUnitId);
      return workUnit
        ? { success: true, data: workUnit }
        : { success: false, message: 'Work Unit not found' };
    },

    getByDirectorate(directorateId) {
      const workUnits = OrganizationModel.WorkUnit.getByDirectorate(directorateId);
      return { success: true, data: workUnits };
    },

    checkChildren(workUnitId) {
      const children = OrganizationModel.WorkUnit.checkChildren(workUnitId);
      return { success: true, data: children };
    },

    getAlternatives(workUnitId) {
      const alternatives = OrganizationModel.WorkUnit.getAlternatives(workUnitId);
      return { success: true, data: alternatives };
    },

    cascadeDelete(workUnitId, deleterId) {
      const result = OrganizationModel.WorkUnit.cascadeDelete(workUnitId, deleterId);
      if (result.success) {
        logAudit('DELETE', 'WorkUnits', workUnitId, deleterId, 'Work unit cascade deleted with all children');
      }
      return result;
    },

    reassignAndDelete(workUnitId, newWorkUnitId, deleterId) {
      const result = OrganizationModel.WorkUnit.reassignAndDelete(workUnitId, newWorkUnitId, deleterId);
      if (result.success) {
        logAudit('DELETE', 'WorkUnits', workUnitId, deleterId, 'Work unit deleted after reassigning children to ' + newWorkUnitId);
      }
      return result;
    }
  },

  // ===== AFFAIRS =====
  Affair: {
    create(data, creatorId) {
      data.created_by = creatorId;
      const result = OrganizationModel.Affair.create(data);
      
      if (result.success) {
        logAudit('CREATE', 'Affairs', result.data.affair_id, creatorId, 'Affair created');
      }
      
      return result;
    },

    update(affairId, data, updaterId) {
      data.updated_by = updaterId;
      const result = OrganizationModel.Affair.update(affairId, data);
      
      if (result.success) {
        logMultipleRevisions('Affairs', affairId, data, 'UPDATE', updaterId, 'Affair updated');
      }
      
      return result;
    },

    delete(affairId, deleterId) {
      const result = OrganizationModel.Affair.delete(affairId);
      
      if (result.success) {
        logAudit('DELETE', 'Affairs', affairId, deleterId, 'Affair deleted');
      }
      
      return result;
    },

    getByWorkUnit(workUnitId) {
      const affairs = OrganizationModel.Affair.getByWorkUnit(workUnitId);
      return { success: true, data: affairs };
    },

    getAll(filters) {
      Logger.log('OrganizationController.Affair.getAll called with: ' + JSON.stringify(filters));
      const affairs = OrganizationModel.Affair.getAll(filters);
      Logger.log('OrganizationController.Affair.getAll result: success=true, count=' + (affairs ? affairs.length : 0));
      return { success: true, data: affairs };
    },

    getById(affairId) {
      const affair = OrganizationModel.Affair.findById(affairId);
      return affair
        ? { success: true, data: affair }
        : { success: false, message: 'Affair not found' };
    },

    checkChildren(affairId) {
      const children = OrganizationModel.Affair.checkChildren(affairId);
      return { success: true, data: children };
    },

    getAlternatives(affairId) {
      const alternatives = OrganizationModel.Affair.getAlternatives(affairId);
      return { success: true, data: alternatives };
    },

    cascadeDelete(affairId, deleterId) {
      const result = OrganizationModel.Affair.cascadeDelete(affairId, deleterId);
      if (result.success) {
        logAudit('DELETE', 'Affairs', affairId, deleterId, 'Affair cascade deleted with all children');
      }
      return result;
    },

    reassignAndDelete(affairId, newAffairId, deleterId) {
      const result = OrganizationModel.Affair.reassignAndDelete(affairId, newAffairId, deleterId);
      if (result.success) {
        logAudit('DELETE', 'Affairs', affairId, deleterId, 'Affair deleted after reassigning children to ' + newAffairId);
      }
      return result;
    }
  },

  // ===== POSITIONS =====
  Position: {
    create(data, creatorId) {
      data.created_by = creatorId;
      const result = OrganizationModel.Position.create(data);
      
      if (result.success) {
        logAudit('CREATE', 'Positions', result.data.position_id, creatorId, 'Position created');
      }
      
      return result;
    },

    update(positionId, data, updaterId) {
      data.updated_by = updaterId;
      const result = OrganizationModel.Position.update(positionId, data);
      
      if (result.success) {
        logMultipleRevisions('Positions', positionId, data, 'UPDATE', updaterId, 'Position updated');
      }
      
      return result;
    },

    delete(positionId, deleterId) {
      const result = OrganizationModel.Position.delete(positionId);
      
      if (result.success) {
        logAudit('DELETE', 'Positions', positionId, deleterId, 'Position deleted');
      }
      
      return result;
    },

    getAll(filters) {
      Logger.log('OrganizationController.Position.getAll called with: ' + JSON.stringify(filters));
      const positions = OrganizationModel.Position.getAll(filters);
      Logger.log('OrganizationController.Position.getAll result: success=true, count=' + (positions ? positions.length : 0));
      return { success: true, data: positions };
    },

    getById(positionId) {
      const position = OrganizationModel.Position.findById(positionId);
      return position
        ? { success: true, data: position }
        : { success: false, message: 'Position not found' };
    }
  },

  // ===== POSITION ASSIGNMENTS =====
  PositionAssignment: {
    create(data, creatorId) {
      data.created_by = creatorId;
      const result = OrganizationModel.PositionAssignment.create(data);
      
      if (result.success) {
        logAudit('CREATE', 'PositionAssignments', result.data.assignment_id, creatorId, 'Position assignment created');
      }
      
      return result;
    },

    update(assignmentId, data, updaterId) {
      data.updated_by = updaterId;
      const result = OrganizationModel.PositionAssignment.update(assignmentId, data);
      
      if (result.success) {
        logMultipleRevisions('PositionAssignments', assignmentId, data, 'UPDATE', updaterId, 'Assignment updated');
      }
      
      return result;
    },

    endAssignment(assignmentId, endDate, updaterId) {
      const result = OrganizationModel.PositionAssignment.endAssignment(assignmentId, endDate, updaterId);
      
      if (result.success) {
        logAudit('UPDATE', 'PositionAssignments', assignmentId, updaterId, 'Assignment ended');
      }
      
      return result;
    },

    getAll(filters) {
      const assignments = OrganizationModel.PositionAssignment.getAll(filters);
      return { success: true, data: assignments };
    },

    getByUser(userId) {
      const assignments = OrganizationModel.PositionAssignment.getByUser(userId);
      return { success: true, data: assignments };
    }
  }
};

// Top-level convenience functions for API routing
OrganizationController.getAllDirectorates = function(data) {
  Logger.log('OrganizationController.getAllDirectorates called with: ' + JSON.stringify(data));
  const result = OrganizationController.Directorate.getAll(data);
  Logger.log('OrganizationController.getAllDirectorates result: ' + (result ? 'success=' + result.success : 'null'));
  return result;
};

OrganizationController.createDirectorate = function(data) {
  return OrganizationController.Directorate.create(data, data.created_by || 'system');
};

OrganizationController.getAllWorkUnits = function(data) {
  return OrganizationController.WorkUnit.getAll(data);
};
