/**
 * Models/Organization.gs
 * Organizational structure model (Directorates, WorkUnits, Affairs, Positions, PositionAssignments)
 */

const OrganizationModel = {
  // ===== DIRECTORATES =====
  Directorate: {
    findById(directorateId) {
      const directorates = getTableData(DB_CONFIG.SHEET_NAMES.DIRECTORATES);
      return (
        directorates.find((d) => d.directorate_id === directorateId) || null
      );
    },

    getById(directorateId) {
      const position = this.findById(directorateId);
      return position ? { success: true, data: position } : { success: false, message: 'Directorate not found' };
    },

    getAll(filters = {}) {
      let directorates = getTableData(DB_CONFIG.SHEET_NAMES.DIRECTORATES);
      if (filters.is_active !== undefined) {
        directorates = directorates.filter(
          (d) => d.is_active === filters.is_active,
        );
      }
      return directorates.sort(
        (a, b) => (a.sort_order || 0) - (b.sort_order || 0),
      );
    },

    create(data) {
      const newDirectorate = {
        directorate_id: generateUUID(),
        directorate_code: data.directorate_code || this.generateCode(),
        directorate_name: data.directorate_name,
        description: data.description || "",
        director_position_id: data.director_position_id || null,
        active_from: data.active_from || formatDateTime(new Date()),
        active_until: data.active_until || null,
        is_active: data.is_active !== undefined ? data.is_active : true,
        sort_order: data.sort_order || 0,
        created_at: formatDateTime(new Date()),
        created_by: data.created_by,
        updated_at: formatDateTime(new Date()),
        updated_by: data.created_by,
        notes: data.notes || "",
      };
      const result = insertRecord(
        DB_CONFIG.SHEET_NAMES.DIRECTORATES,
        newDirectorate,
      );
      return result.success
        ? {
            success: true,
            data: newDirectorate,
            message: "Directorate created successfully",
          }
        : {
            success: false,
            error: result.error,
            message: "Failed to create directorate",
          };
    },

    update(directorateId, data) {
      const updateData = { ...data, updated_at: formatDateTime(new Date()) };
      delete updateData.directorate_id;
      delete updateData.created_at;
      delete updateData.created_by;

      const result = updateRecord(
        DB_CONFIG.SHEET_NAMES.DIRECTORATES,
        "directorate_id",
        directorateId,
        updateData,
      );
      return result.success
        ? {
            success: true,
            data: { directorate_id: directorateId, ...updateData },
            message: "Directorate updated successfully",
          }
        : {
            success: false,
            error: result.error,
            message: "Failed to update directorate",
          };
    },

    delete(directorateId) {
      // Check for work units
      const workUnits = getTableData(DB_CONFIG.SHEET_NAMES.WORK_UNITS);
      if (
        workUnits.some(
          (wu) => wu.directorate_id === directorateId && wu.is_active,
        )
      ) {
        return {
          success: false,
          message: "Cannot delete directorate with active work units",
        };
      }
      return deleteRecord(
        DB_CONFIG.SHEET_NAMES.DIRECTORATES,
        "directorate_id",
        directorateId,
      );
    },

    generateCode() {
      const directorates = getTableData(DB_CONFIG.SHEET_NAMES.DIRECTORATES);
      const maxNumber = Math.max(
        0,
        ...directorates.map((d) => parseCodeNumber(d.directorate_code)),
      );
      return generateCode("DIR", maxNumber + 1, 3);
    },

    // Enhanced delete functions
    checkChildren(directorateId) {
      const workUnits = getTableData(DB_CONFIG.SHEET_NAMES.WORK_UNITS);
      const activeWorkUnits = workUnits.filter(
        (wu) => wu.directorate_id === directorateId && wu.is_active
      );

      // Count total descendants
      let totalAffairs = 0;
      let totalPositions = 0;

      activeWorkUnits.forEach(wu => {
        const affairs = getTableData(DB_CONFIG.SHEET_NAMES.AFFAIRS);
        const activeAffairs = affairs.filter(a => a.work_unit_id === wu.work_unit_id && a.is_active);
        totalAffairs += activeAffairs.length;

        const positions = getTableData(DB_CONFIG.SHEET_NAMES.POSITIONS);
        const workUnitPositions = positions.filter(p => p.work_unit_id === wu.work_unit_id && p.is_active);
        totalPositions += workUnitPositions.length;

        // Also count positions under affairs
        activeAffairs.forEach(affair => {
          const affairPositions = positions.filter(p => p.affair_id === affair.affair_id && p.is_active);
          totalPositions += affairPositions.length;
        });
      });

      return {
        hasChildren: activeWorkUnits.length > 0,
        workUnits: activeWorkUnits.length,
        affairs: totalAffairs,
        positions: totalPositions,
        total: activeWorkUnits.length + totalAffairs + totalPositions
      };
    },

    getAlternatives(directorateId) {
      const directorates = getTableData(DB_CONFIG.SHEET_NAMES.DIRECTORATES);
      return directorates
        .filter(d => d.directorate_id !== directorateId && d.is_active)
        .map(d => ({
          id: d.directorate_id,
          code: d.directorate_code,
          name: d.directorate_name,
          display: `${d.directorate_code} - ${d.directorate_name}`
        }));
    },

    cascadeDelete(directorateId, deleterId) {
      // Get all work units under this directorate
      const workUnits = getTableData(DB_CONFIG.SHEET_NAMES.WORK_UNITS);
      const childWorkUnits = workUnits.filter(wu => wu.directorate_id === directorateId);

      // Delete all positions under work units (via work_unit_id)
      const positions = getTableData(DB_CONFIG.SHEET_NAMES.POSITIONS);
      const childPositions = positions.filter(p => childWorkUnits.some(wu => wu.work_unit_id === p.work_unit_id));
      childPositions.forEach(p => {
        deleteRecord(DB_CONFIG.SHEET_NAMES.POSITIONS, "position_id", p.position_id);
        logAudit('DELETE', 'Positions', p.position_id, deleterId, 'Position cascade deleted');
      });

      // Delete all affairs under work units
      const affairs = getTableData(DB_CONFIG.SHEET_NAMES.AFFAIRS);
      const childAffairs = affairs.filter(a => childWorkUnits.some(wu => wu.work_unit_id === a.work_unit_id));
      childAffairs.forEach(a => {
        // Also delete positions under affairs
        const affairPositions = positions.filter(p => p.affair_id === a.affair_id);
        affairPositions.forEach(p => {
          deleteRecord(DB_CONFIG.SHEET_NAMES.POSITIONS, "position_id", p.position_id);
          logAudit('DELETE', 'Positions', p.position_id, deleterId, 'Position cascade deleted (via affair)');
        });
        deleteRecord(DB_CONFIG.SHEET_NAMES.AFFAIRS, "affair_id", a.affair_id);
        logAudit('DELETE', 'Affairs', a.affair_id, deleterId, 'Affair cascade deleted');
      });

      // Delete all work units
      childWorkUnits.forEach(wu => {
        deleteRecord(DB_CONFIG.SHEET_NAMES.WORK_UNITS, "work_unit_id", wu.work_unit_id);
        logAudit('DELETE', 'WorkUnits', wu.work_unit_id, deleterId, 'Work unit cascade deleted');
      });

      // Finally delete the directorate
      return deleteRecord(DB_CONFIG.SHEET_NAMES.DIRECTORATES, "directorate_id", directorateId);
    },

    reassignAndDelete(directorateId, newDirectorateId, deleterId) {
      // Get all work units under this directorate
      const workUnits = getTableData(DB_CONFIG.SHEET_NAMES.WORK_UNITS);
      const childWorkUnits = workUnits.filter(wu => wu.directorate_id === directorateId);

      // Reassign work units to new directorate
      childWorkUnits.forEach(wu => {
        updateRecord(DB_CONFIG.SHEET_NAMES.WORK_UNITS, "work_unit_id", wu.work_unit_id, {
          directorate_id: newDirectorateId,
          updated_at: formatDateTime(new Date()),
          updated_by: deleterId
        });
        logAudit('UPDATE', 'WorkUnits', wu.work_unit_id, deleterId, 'Work unit reassigned');
      });

      // Delete the directorate
      return deleteRecord(DB_CONFIG.SHEET_NAMES.DIRECTORATES, "directorate_id", directorateId);
    },
  },

  // ===== WORK UNITS =====
  WorkUnit: {
    findById(workUnitId) {
      const workUnits = getTableData(DB_CONFIG.SHEET_NAMES.WORK_UNITS);
      return workUnits.find((wu) => wu.work_unit_id === workUnitId) || null;
    },

    getById(workUnitId) {
      const position = this.findById(workUnitId);
      return position ? { success: true, data: position } : { success: false, message: 'Work Unit not found' };
    },

    getAll(filters = {}) {
      let workUnits = getTableData(DB_CONFIG.SHEET_NAMES.WORK_UNITS);
      if (filters.directorate_id) {
        workUnits = workUnits.filter(
          (wu) => wu.directorate_id === filters.directorate_id,
        );
      }
      if (filters.is_active !== undefined) {
        workUnits = workUnits.filter(
          (wu) => wu.is_active === filters.is_active,
        );
      }

      // JOIN with Directorates to get directorate names
      const directorates = getTableData(DB_CONFIG.SHEET_NAMES.DIRECTORATES);
      workUnits = workUnits.map(wu => {
        const directorate = directorates.find(d => d.directorate_id === wu.directorate_id);
        return {
          ...wu,
          directorate_name: directorate
            ? `${directorate.directorate_code} - ${directorate.directorate_name}`
            : '-'
        };
      });

      return workUnits.sort(
        (a, b) => (a.sort_order || 0) - (b.sort_order || 0),
      );
    },

    getByDirectorate(directorateId) {
      return this.getAll({ directorate_id: directorateId, is_active: true });
    },

    create(data) {
      const newWorkUnit = {
        work_unit_id: generateUUID(),
        directorate_id: data.directorate_id,
        work_unit_code: data.work_unit_code || this.generateCode(),
        work_unit_name: data.work_unit_name,
        description: data.description || "",
        deputy_position_id: data.deputy_position_id || null,
        active_from: data.active_from || formatDateTime(new Date()),
        active_until: data.active_until || null,
        is_active: data.is_active !== undefined ? data.is_active : true,
        sort_order: data.sort_order || 0,
        created_at: formatDateTime(new Date()),
        created_by: data.created_by,
        updated_at: formatDateTime(new Date()),
        updated_by: data.created_by,
        notes: data.notes || "",
      };
      const result = insertRecord(
        DB_CONFIG.SHEET_NAMES.WORK_UNITS,
        newWorkUnit,
      );
      return result.success
        ? {
            success: true,
            data: newWorkUnit,
            message: "Work unit created successfully",
          }
        : {
            success: false,
            error: result.error,
            message: "Failed to create work unit",
          };
    },

    update(workUnitId, data) {
      const updateData = { ...data, updated_at: formatDateTime(new Date()) };
      delete updateData.work_unit_id;
      delete updateData.created_at;
      delete updateData.created_by;

      const result = updateRecord(
        DB_CONFIG.SHEET_NAMES.WORK_UNITS,
        "work_unit_id",
        workUnitId,
        updateData,
      );
      return result.success
        ? {
            success: true,
            data: { work_unit_id: workUnitId, ...updateData },
            message: "Work unit updated successfully",
          }
        : {
            success: false,
            error: result.error,
            message: "Failed to update work unit",
          };
    },

    delete(workUnitId) {
      // Check for affairs
      const affairs = getTableData(DB_CONFIG.SHEET_NAMES.AFFAIRS);
      if (affairs.some((a) => a.work_unit_id === workUnitId && a.is_active)) {
        return {
          success: false,
          message: "Cannot delete work unit with active affairs",
        };
      }
      return deleteRecord(
        DB_CONFIG.SHEET_NAMES.WORK_UNITS,
        "work_unit_id",
        workUnitId,
      );
    },

    generateCode() {
      const workUnits = getTableData(DB_CONFIG.SHEET_NAMES.WORK_UNITS);
      const maxNumber = Math.max(
        0,
        ...workUnits.map((wu) => parseCodeNumber(wu.work_unit_code)),
      );
      return generateCode("WU", maxNumber + 1, 3);
    },

    // Enhanced delete functions
    checkChildren(workUnitId) {
      const affairs = getTableData(DB_CONFIG.SHEET_NAMES.AFFAIRS);
      const activeAffairs = affairs.filter(
        (a) => a.work_unit_id === workUnitId && a.is_active
      );

      const positions = getTableData(DB_CONFIG.SHEET_NAMES.POSITIONS);
      // Count positions directly under work unit
      const workUnitPositions = positions.filter(
        (p) => p.work_unit_id === workUnitId && p.is_active
      );

      // Count positions under affairs
      let affairPositions = 0;
      activeAffairs.forEach(affair => {
        const count = positions.filter(p => p.affair_id === affair.affair_id && p.is_active).length;
        affairPositions += count;
      });

      const totalPositions = workUnitPositions.length + affairPositions;

      return {
        hasChildren: activeAffairs.length > 0 || workUnitPositions.length > 0,
        affairs: activeAffairs.length,
        positions: totalPositions,
        total: activeAffairs.length + totalPositions
      };
    },

    getAlternatives(workUnitId) {
      const workUnit = this.findById(workUnitId);
      if (!workUnit) return [];

      const workUnits = getTableData(DB_CONFIG.SHEET_NAMES.WORK_UNITS);

      // Return all other active work units (across all directorates)
      return workUnits
        .filter(wu => wu.work_unit_id !== workUnitId && wu.is_active)
        .map(wu => ({
          id: wu.work_unit_id,
          type: 'work-unit',
          code: wu.work_unit_code,
          name: wu.work_unit_name,
          directorate_code: wu.directorate_id ? workUnit.directorate_code : '',
          display: `${wu.work_unit_code} - ${wu.work_unit_name}${wu.directorate_id !== workUnit.directorate_id ? ' (Different Directorate)' : ''}`
        }));
    },

    cascadeDelete(workUnitId, deleterId) {
      // Get all affairs under this work unit
      const affairs = getTableData(DB_CONFIG.SHEET_NAMES.AFFAIRS);
      const childAffairs = affairs.filter(a => a.work_unit_id === workUnitId);

      // Delete all positions under affairs
      const positions = getTableData(DB_CONFIG.SHEET_NAMES.POSITIONS);
      childAffairs.forEach(a => {
        const affairPositions = positions.filter(p => p.affair_id === a.affair_id);
        affairPositions.forEach(p => {
          deleteRecord(DB_CONFIG.SHEET_NAMES.POSITIONS, "position_id", p.position_id);
          logAudit('DELETE', 'Positions', p.position_id, deleterId, 'Position cascade deleted (via affair)');
        });
        deleteRecord(DB_CONFIG.SHEET_NAMES.AFFAIRS, "affair_id", a.affair_id);
        logAudit('DELETE', 'Affairs', a.affair_id, deleterId, 'Affair cascade deleted');
      });

      // Delete positions directly under work unit
      const workUnitPositions = positions.filter(p => p.work_unit_id === workUnitId);
      workUnitPositions.forEach(p => {
        deleteRecord(DB_CONFIG.SHEET_NAMES.POSITIONS, "position_id", p.position_id);
        logAudit('DELETE', 'Positions', p.position_id, deleterId, 'Position cascade deleted');
      });

      // Finally delete the work unit
      return deleteRecord(DB_CONFIG.SHEET_NAMES.WORK_UNITS, "work_unit_id", workUnitId);
    },

    reassignAndDelete(workUnitId, newParentId, deleterId) {
      // Get all affairs under this work unit
      const affairs = getTableData(DB_CONFIG.SHEET_NAMES.AFFAIRS);
      const childAffairs = affairs.filter(a => a.work_unit_id === workUnitId);

      // Reassign affairs to new work unit
      childAffairs.forEach(a => {
        updateRecord(DB_CONFIG.SHEET_NAMES.AFFAIRS, "affair_id", a.affair_id, {
          work_unit_id: newParentId,
          updated_at: formatDateTime(new Date()),
          updated_by: deleterId
        });
        logAudit('UPDATE', 'Affairs', a.affair_id, deleterId, 'Affair reassigned to new work unit');
      });

      // Reassign positions directly under work unit
      const positions = getTableData(DB_CONFIG.SHEET_NAMES.POSITIONS);
      const workUnitPositions = positions.filter(p => p.work_unit_id === workUnitId);
      workUnitPositions.forEach(p => {
        updateRecord(DB_CONFIG.SHEET_NAMES.POSITIONS, "position_id", p.position_id, {
          work_unit_id: newParentId,
          updated_at: formatDateTime(new Date()),
          updated_by: deleterId
        });
        logAudit('UPDATE', 'Positions', p.position_id, deleterId, 'Position reassigned to new work unit');
      });

      // Delete the work unit
      return deleteRecord(DB_CONFIG.SHEET_NAMES.WORK_UNITS, "work_unit_id", workUnitId);
    },
  },

  // ===== AFFAIRS =====
  Affair: {
    findById(affairId) {
      const affairs = getTableData(DB_CONFIG.SHEET_NAMES.AFFAIRS);
      return affairs.find((a) => a.affair_id === affairId) || null;
    },

    getById(affairId) {
      const position = this.findById(affairId);
      return position ? { success: true, data: position } : { success: false, message: 'Affair not found' };
    },

    getAll(filters = {}) {
      let affairs = getTableData(DB_CONFIG.SHEET_NAMES.AFFAIRS);
      if (filters.work_unit_id) {
        affairs = affairs.filter(
          (a) => a.work_unit_id === filters.work_unit_id,
        );
      }
      if (filters.is_active !== undefined) {
        affairs = affairs.filter((a) => a.is_active === filters.is_active);
      }

      // JOIN with WorkUnits and Directorates
      const workUnits = getTableData(DB_CONFIG.SHEET_NAMES.WORK_UNITS);
      const directorates = getTableData(DB_CONFIG.SHEET_NAMES.DIRECTORATES);

      affairs = affairs.map(affair => {
        const workUnit = workUnits.find(wu => wu.work_unit_id === affair.work_unit_id);
        const directorate = workUnit
          ? directorates.find(d => d.directorate_id === workUnit.directorate_id)
          : null;

        return {
          ...affair,
          work_unit_name: workUnit
            ? `${workUnit.work_unit_code} - ${workUnit.work_unit_name}`
            : '-',
          directorate_name: directorate && workUnit
            ? `${directorate.directorate_code} - ${directorate.directorate_name}`
            : '-'
        };
      });

      return affairs.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
    },

    getByWorkUnit(workUnitId) {
      return this.getAll({ work_unit_id: workUnitId, is_active: true });
    },

    create(data) {
      const newAffair = {
        affair_id: generateUUID(),
        work_unit_id: data.work_unit_id,
        affair_code: data.affair_code || this.generateCode(),
        affair_name: data.affair_name,
        description: data.description || "",
        assistant_deputy_position_id: data.assistant_deputy_position_id || null,
        active_from: data.active_from || formatDateTime(new Date()),
        active_until: data.active_until || null,
        is_active: data.is_active !== undefined ? data.is_active : true,
        sort_order: data.sort_order || 0,
        created_at: formatDateTime(new Date()),
        created_by: data.created_by,
        updated_at: formatDateTime(new Date()),
        updated_by: data.created_by,
        notes: data.notes || "",
      };
      const result = insertRecord(DB_CONFIG.SHEET_NAMES.AFFAIRS, newAffair);
      return result.success
        ? {
            success: true,
            data: newAffair,
            message: "Affair created successfully",
          }
        : {
            success: false,
            error: result.error,
            message: "Failed to create affair",
          };
    },

    update(affairId, data) {
      const updateData = { ...data, updated_at: formatDateTime(new Date()) };
      delete updateData.affair_id;
      delete updateData.created_at;
      delete updateData.created_by;

      const result = updateRecord(
        DB_CONFIG.SHEET_NAMES.AFFAIRS,
        "affair_id",
        affairId,
        updateData,
      );
      return result.success
        ? {
            success: true,
            data: { affair_id: affairId, ...updateData },
            message: "Affair updated successfully",
          }
        : {
            success: false,
            error: result.error,
            message: "Failed to update affair",
          };
    },

    delete(affairId) {
      return deleteRecord(DB_CONFIG.SHEET_NAMES.AFFAIRS, "affair_id", affairId);
    },

    generateCode() {
      const affairs = getTableData(DB_CONFIG.SHEET_NAMES.AFFAIRS);
      const maxNumber = Math.max(
        0,
        ...affairs.map((a) => parseCodeNumber(a.affair_code)),
      );
      return generateCode("AFF", maxNumber + 1, 3);
    },

    // Enhanced delete functions
    checkChildren(affairId) {
      const positions = getTableData(DB_CONFIG.SHEET_NAMES.POSITIONS);
      const activePositions = positions.filter(
        (p) => p.affair_id === affairId && p.is_active
      );

      return {
        hasChildren: activePositions.length > 0,
        positions: activePositions.length,
        total: activePositions.length
      };
    },

    getAlternatives(affairId) {
      const affair = this.findById(affairId);
      if (!affair) return [];

      const affairs = getTableData(DB_CONFIG.SHEET_NAMES.AFFAIRS);
      return affairs
        .filter(a => a.work_unit_id === affair.work_unit_id && a.affair_id !== affairId && a.is_active)
        .map(a => ({
          id: a.affair_id,
          code: a.affair_code,
          name: a.affair_name,
          display: `${a.affair_code} - ${a.affair_name}`
        }));
    },

    cascadeDelete(affairId, deleterId) {
      // Delete all positions under this affair
      const positions = getTableData(DB_CONFIG.SHEET_NAMES.POSITIONS);
      const childPositions = positions.filter(p => p.affair_id === affairId);

      childPositions.forEach(p => {
        deleteRecord(DB_CONFIG.SHEET_NAMES.POSITIONS, "position_id", p.position_id);
        logAudit('DELETE', 'Positions', p.position_id, deleterId, 'Position cascade deleted (via affair)');
      });

      // Delete the affair
      return deleteRecord(DB_CONFIG.SHEET_NAMES.AFFAIRS, "affair_id", affairId);
    },

    reassignAndDelete(affairId, newAffairId, deleterId) {
      // Reassign positions to new affair
      const positions = getTableData(DB_CONFIG.SHEET_NAMES.POSITIONS);
      const childPositions = positions.filter(p => p.affair_id === affairId);

      childPositions.forEach(p => {
        updateRecord(DB_CONFIG.SHEET_NAMES.POSITIONS, "position_id", p.position_id, {
          affair_id: newAffairId,
          updated_at: formatDateTime(new Date()),
          updated_by: deleterId
        });
        logAudit('UPDATE', 'Positions', p.position_id, deleterId, 'Position reassigned to new affair');
      });

      // Delete the affair
      return deleteRecord(DB_CONFIG.SHEET_NAMES.AFFAIRS, "affair_id", affairId);
    },
  },

  // ===== POSITIONS =====
  Position: {
    findById(positionId) {
      const positions = getTableData(DB_CONFIG.SHEET_NAMES.POSITIONS);
      return positions.find((p) => p.position_id === positionId) || null;
    },

    getById(positionId) {
      const position = this.findById(positionId);
      return position ? { success: true, data: position } : { success: false, message: 'Position not found' };
    },

    getAll(filters = {}) {
      let positions = getTableData(DB_CONFIG.SHEET_NAMES.POSITIONS);
      if (filters.position_type) {
        positions = positions.filter(
          (p) => p.position_type === filters.position_type,
        );
      }
      if (filters.position_level) {
        positions = positions.filter(
          (p) => p.position_level === filters.position_level,
        );
      }
      if (filters.is_active !== undefined) {
        positions = positions.filter((p) => p.is_active === filters.is_active);
      }

      // JOIN with Affairs, WorkUnits, and Directorates
      const affairs = getTableData(DB_CONFIG.SHEET_NAMES.AFFAIRS);
      const workUnits = getTableData(DB_CONFIG.SHEET_NAMES.WORK_UNITS);
      const directorates = getTableData(DB_CONFIG.SHEET_NAMES.DIRECTORATES);

      positions = positions.map(position => {
        const affair = position.affair_id
          ? affairs.find(a => a.affair_id === position.affair_id)
          : null;
        const workUnit = position.work_unit_id
          ? workUnits.find(wu => wu.work_unit_id === position.work_unit_id)
          : (affair ? workUnits.find(wu => wu.work_unit_id === affair.work_unit_id) : null);
        const directorate = workUnit
          ? directorates.find(d => d.directorate_id === workUnit.directorate_id)
          : null;

        let affairDisplay = affair ? `${affair.affair_code} - ${affair.affair_name}` : '-';
        let workUnitDisplay = workUnit ? `${workUnit.work_unit_code} - ${workUnit.work_unit_name}` : '-';
        let directorateDisplay = directorate ? `${directorate.directorate_code} - ${directorate.directorate_name}` : '-';

        return {
          ...position,
          affair_name: affairDisplay,
          work_unit_name: workUnitDisplay,
          directorate_name: directorateDisplay
        };
      });

      return positions.sort(
        (a, b) => (a.sort_order || 0) - (b.sort_order || 0),
      );
    },

    create(data) {
      const newPosition = {
        position_id: generateUUID(),
        position_code: data.position_code || this.generateCode(),
        position_name: data.position_name,
        position_type: data.position_type,
        position_level: data.position_level,
        parent_position_id: data.parent_position_id || null,
        directorate_id: data.directorate_id || null,
        work_unit_id: data.work_unit_id || null,
        affair_id: data.affair_id || null,
        description: data.description || "",
        responsibilities: data.responsibilities || "",
        active_from: data.active_from || formatDateTime(new Date()),
        active_until: data.active_until || null,
        is_active: data.is_active !== undefined ? data.is_active : true,
        sort_order: data.sort_order || 0,
        created_at: formatDateTime(new Date()),
        created_by: data.created_by,
        updated_at: formatDateTime(new Date()),
        updated_by: data.created_by,
        notes: data.notes || "",
      };
      const result = insertRecord(DB_CONFIG.SHEET_NAMES.POSITIONS, newPosition);
      return result.success
        ? {
            success: true,
            data: newPosition,
            message: "Position created successfully",
          }
        : {
            success: false,
            error: result.error,
            message: "Failed to create position",
          };
    },

    update(positionId, data) {
      const updateData = { ...data, updated_at: formatDateTime(new Date()) };
      delete updateData.position_id;
      delete updateData.created_at;
      delete updateData.created_by;

      const result = updateRecord(
        DB_CONFIG.SHEET_NAMES.POSITIONS,
        "position_id",
        positionId,
        updateData,
      );
      return result.success
        ? {
            success: true,
            data: { position_id: positionId, ...updateData },
            message: "Position updated successfully",
          }
        : {
            success: false,
            error: result.error,
            message: "Failed to update position",
          };
    },

    delete(positionId) {
      // Check for assignments
      const assignments = getTableData(
        DB_CONFIG.SHEET_NAMES.POSITION_ASSIGNMENTS,
      );
      if (
        assignments.some(
          (a) =>
            a.position_id === positionId && a.assignment_status === "ACTIVE",
        )
      ) {
        return {
          success: false,
          message: "Cannot delete position with active assignments",
        };
      }
      return deleteRecord(
        DB_CONFIG.SHEET_NAMES.POSITIONS,
        "position_id",
        positionId,
      );
    },

    generateCode() {
      const positions = getTableData(DB_CONFIG.SHEET_NAMES.POSITIONS);
      const maxNumber = Math.max(
        0,
        ...positions.map((p) => parseCodeNumber(p.position_code)),
      );
      return generateCode("POS", maxNumber + 1, 3);
    },
  },

  // ===== POSITION ASSIGNMENTS =====
  PositionAssignment: {
    findById(assignmentId) {
      const assignments = getTableData(
        DB_CONFIG.SHEET_NAMES.POSITION_ASSIGNMENTS,
      );
      return assignments.find((a) => a.assignment_id === assignmentId) || null;
    },

    getAll(filters = {}) {
      let assignments = getTableData(
        DB_CONFIG.SHEET_NAMES.POSITION_ASSIGNMENTS,
      );
      if (filters.user_id) {
        assignments = assignments.filter((a) => a.user_id === filters.user_id);
      }
      if (filters.position_id) {
        assignments = assignments.filter(
          (a) => a.position_id === filters.position_id,
        );
      }
      if (filters.assignment_status) {
        assignments = assignments.filter(
          (a) => a.assignment_status === filters.assignment_status,
        );
      }
      return assignments;
    },

    getByUser(userId) {
      return this.getAll({ user_id: userId, assignment_status: "ACTIVE" });
    },

    getPrimaryPosition(userId) {
      const assignments = this.getByUser(userId);
      return assignments.find((a) => a.is_primary === true) || null;
    },

    create(data) {
      const newAssignment = {
        assignment_id: generateUUID(),
        user_id: data.user_id,
        position_id: data.position_id,
        assignment_date: data.assignment_date || formatDateISO(new Date()),
        start_date: data.start_date,
        end_date: data.end_date || null,
        is_primary: data.is_primary !== undefined ? data.is_primary : false,
        assignment_status: data.assignment_status || "ACTIVE",
        assignment_letter_number: data.assignment_letter_number || "",
        created_at: formatDateTime(new Date()),
        created_by: data.created_by,
        updated_at: formatDateTime(new Date()),
        updated_by: data.created_by,
        notes: data.notes || "",
      };
      const result = insertRecord(
        DB_CONFIG.SHEET_NAMES.POSITION_ASSIGNMENTS,
        newAssignment,
      );
      return result.success
        ? {
            success: true,
            data: newAssignment,
            message: "Position assignment created successfully",
          }
        : {
            success: false,
            error: result.error,
            message: "Failed to create position assignment",
          };
    },

    update(assignmentId, data) {
      const updateData = { ...data, updated_at: formatDateTime(new Date()) };
      delete updateData.assignment_id;
      delete updateData.created_at;
      delete updateData.created_by;

      const result = updateRecord(
        DB_CONFIG.SHEET_NAMES.POSITION_ASSIGNMENTS,
        "assignment_id",
        assignmentId,
        updateData,
      );
      return result.success
        ? {
            success: true,
            data: { assignment_id: assignmentId, ...updateData },
            message: "Position assignment updated successfully",
          }
        : {
            success: false,
            error: result.error,
            message: "Failed to update position assignment",
          };
    },

    endAssignment(assignmentId, endDate, updaterId) {
      return this.update(assignmentId, {
        end_date: endDate || formatDateISO(new Date()),
        assignment_status: "ENDED",
        updated_by: updaterId,
      });
    },
  },

  // ===== ORGANIZATIONAL UNITS (New Unified Structure for BPJS) =====
  OrganizationalUnit: {
    /**
     * Find organizational unit by ID
     */
    findById(unitId) {
      const units = getTableData(DB_CONFIG.SHEET_NAMES.ORGANIZATIONAL_UNITS);
      return units.find(u => u.unit_id === unitId) || null;
    },

    /**
     * Get unit by ID with response wrapper
     */
    getById(unitId) {
      const unit = this.findById(unitId);
      return unit ? { success: true, data: unit } : { success: false, message: 'Organizational unit not found' };
    },

    /**
     * Get all organizational units with optional filters
     */
    getAll(filters = {}) {
      let units = getTableData(DB_CONFIG.SHEET_NAMES.ORGANIZATIONAL_UNITS);

      // Filter by is_active (default: only active)
      if (filters.is_active !== undefined) {
        units = units.filter(u => u.is_active === filters.is_active);
      } else if (filters.include_inactive !== true) {
        // Default to showing only active units
        units = units.filter(u => u.is_active === true);
      }

      // Filter by unit_type
      if (filters.unit_type) {
        units = units.filter(u => u.unit_type === filters.unit_type);
      }

      // Filter by classification
      if (filters.classification) {
        units = units.filter(u => u.classification === filters.classification);
      }

      // Filter by parent
      if (filters.parent_unit_id) {
        units = units.filter(u => u.parent_unit_id === filters.parent_unit_id);
      }

      // Filter by geographical scope
      if (filters.geographical_scope) {
        units = units.filter(u => u.geographical_scope === filters.geographical_scope);
      }

      // Filter by province
      if (filters.province) {
        units = units.filter(u => u.province === filters.province);
      }

      // Filter by city
      if (filters.city) {
        units = units.filter(u => u.city === filters.city);
      }

      // Sort by unit_level, then sort_order
      units.sort((a, b) => {
        if (a.unit_level !== b.unit_level) {
          return a.unit_level - b.unit_level;
        }
        return (a.unit_name || '').localeCompare(b.unit_name || '');
      });

      return units;
    },

    /**
     * Get units by type
     */
    getByType(type) {
      return this.getAll({ unit_type: type });
    },

    /**
     * Get units by classification
     */
    getByClassification(classification) {
      return this.getAll({ classification: classification });
    },

    /**
     * Get regional offices only
     */
    getRegionalOffices() {
      return this.getAll({ unit_type: 'REGIONAL_OFFICE' });
    },

    /**
     * Get branch offices only
     */
    getBranchOffices() {
      return this.getAll({ unit_type: 'BRANCH_OFFICE' });
    },

    /**
     * Get subsidiaries only
     */
    getSubsidiaries() {
      return this.getAll({ unit_type: 'SUBSIDIARY' });
    },

    /**
     * Get children of a unit
     */
    getChildren(unitId) {
      return this.getAll({ parent_unit_id: unitId });
    },

    /**
     * Get parent of a unit
     */
    getParent(unitId) {
      const unit = this.findById(unitId);
      if (!unit || !unit.parent_unit_id) return null;
      return this.findById(unit.parent_unit_id);
    },

    /**
     * Get complete hierarchy tree
     */
    getHierarchyTree(filters = {}) {
      const units = this.getAll(filters);

      // Build tree structure
      const buildTree = (parentId) => {
        return units
          .filter(u => u.parent_unit_id === parentId)
          .map(u => ({
            ...u,
            children: buildTree(u.unit_id)
          }));
      };

      // Find root nodes: either parent_unit_id is null OR unit_type is ROOT
      // This handles the case where ROOT units might have themselves as parent or no parent
      let roots;
      const nullParentUnits = units.filter(u => !u.parent_unit_id || u.parent_unit_id === '');

      if (nullParentUnits.length > 0) {
        // Use units with no parent as roots
        roots = nullParentUnits.map(u => ({
          ...u,
          children: buildTree(u.unit_id)
        }));
      } else {
        // Fallback: Find ROOT type units or units that reference themselves as parent
        const rootTypeUnits = units.filter(u => u.unit_type === 'ROOT');
        if (rootTypeUnits.length > 0) {
          roots = rootTypeUnits.map(u => ({
            ...u,
            children: buildTree(u.unit_id)
          }));
        } else {
          // Last resort: Find units whose parent doesn't exist in the dataset
          roots = units.filter(u => {
            const parentExists = units.some(p => p.unit_id === u.parent_unit_id);
            return !parentExists;
          }).map(u => ({
            ...u,
            children: buildTree(u.unit_id)
          }));
        }
      }

      return roots;
    },

    /**
     * Create new organizational unit
     */
    create(data) {
      // Validation
      if (!data.unit_type) {
        return { success: false, message: 'unit_type is required' };
      }
      if (!data.unit_name) {
        return { success: false, message: 'unit_name is required' };
      }

      // Validate parent-child relationship
      if (data.parent_unit_id) {
        const parent = this.findById(data.parent_unit_id);
        if (!parent) {
          return { success: false, message: 'Parent unit not found' };
        }

        const validation = this.validateParentChild(parent.unit_type, data.unit_type);
        if (!validation.valid) {
          return { success: false, message: validation.message };
        }

        // Set unit_level
        data.unit_level = parent.unit_level + 1;
      } else {
        data.unit_level = 0;
      }

      // Auto-generate unit_code if not provided
      if (!data.unit_code) {
        data.unit_code = this.generateCode(data.unit_type);
      }

      const newUnit = {
        unit_id: generateUUID(),
        unit_type: data.unit_type,
        parent_unit_id: data.parent_unit_id || null,
        unit_code: data.unit_code,
        unit_name: data.unit_name,
        unit_level: data.unit_level,
        classification: data.classification || null,
        geographical_scope: data.geographical_scope || null,
        province: data.province || null,
        city: data.city || null,
        address: data.address || null,
        head_position_id: data.head_position_id || null,
        active_from: data.active_from || formatDateTime(new Date()),
        active_until: data.active_until || null,
        is_active: data.is_active !== undefined ? data.is_active : true,
        lifecycle_status: 'ACTIVE',
        closed_date: null,
        closure_reason: null,
        merged_into_unit_id: null,
        split_from_unit_id: null,
        previous_classification: null,
        created_at: formatDateTime(new Date()),
        created_by: data.created_by,
        updated_at: formatDateTime(new Date()),
        updated_by: data.created_by,
        notes: data.notes || ''
      };

      const result = insertRecord(DB_CONFIG.SHEET_NAMES.ORGANIZATIONAL_UNITS, newUnit);

      return result.success ? {
        success: true,
        data: newUnit,
        message: 'Organizational unit created successfully'
      } : {
        success: false,
        error: result.error,
        message: 'Failed to create organizational unit'
      };
    },

    /**
     * Update organizational unit
     */
    update(unitId, data) {
      const existing = this.findById(unitId);
      if (!existing) {
        return { success: false, message: 'Organizational unit not found' };
      }

      const updateData = { ...data, updated_at: formatDateTime(new Date()) };

      // Remove fields that shouldn't be updated directly
      delete updateData.unit_id;
      delete updateData.created_at;
      delete updateData.created_by;

      // If changing parent, validate and update unit_level
      if (updateData.parent_unit_id && updateData.parent_unit_id !== existing.parent_unit_id) {
        const newParent = this.findById(updateData.parent_unit_id);
        if (!newParent) {
          return { success: false, message: 'New parent unit not found' };
        }

        // Prevent circular reference
        if (updateData.parent_unit_id === unitId) {
          return { success: false, message: 'Cannot set parent to self' };
        }

        const validation = this.validateParentChild(newParent.unit_type, existing.unit_type);
        if (!validation.valid) {
          return { success: false, message: validation.message };
        }

        updateData.unit_level = newParent.unit_level + 1;
      }

      const result = updateRecord(
        DB_CONFIG.SHEET_NAMES.ORGANIZATIONAL_UNITS,
        'unit_id',
        unitId,
        updateData
      );

      return result.success ? {
        success: true,
        data: { unit_id: unitId, ...updateData },
        message: 'Organizational unit updated successfully'
      } : {
        success: false,
        error: result.error,
        message: 'Failed to update organizational unit'
      };
    },

    /**
     * Delete organizational unit (soft delete by setting is_active=false)
     */
    delete(unitId) {
      // Check for children
      const children = this.getChildren(unitId);
      if (children.length > 0) {
        return {
          success: false,
          message: 'Cannot delete unit with active children. Delete or reassign children first.',
          children: children.map(c => ({ id: c.unit_id, name: c.unit_name }))
        };
      }

      // Check for positions assigned to this unit
      const positions = getTableData(DB_CONFIG.SHEET_NAMES.POSITIONS);
      const assignedPositions = positions.filter(p => p.unit_id === unitId && p.is_active);

      if (assignedPositions.length > 0) {
        return {
          success: false,
          message: 'Cannot delete unit with active positions. Reassign positions first.',
          positions: assignedPositions.map(p => ({ id: p.position_id, name: p.position_name }))
        };
      }

      return this.closeUnit(unitId, 'Deleted via system', new Date());
    },

    /**
     * Close an organizational unit
     */
    closeUnit(unitId, reason, closedBy) {
      const unit = this.findById(unitId);
      if (!unit) {
        return { success: false, message: 'Unit not found' };
      }

      if (unit.lifecycle_status !== 'ACTIVE') {
        return { success: false, message: 'Unit is not active' };
      }

      const updateData = {
        is_active: false,
        lifecycle_status: 'CLOSED',
        closed_date: formatDateTime(closedBy || new Date()),
        closure_reason: reason,
        updated_at: formatDateTime(new Date()),
        updated_by: closedBy
      };

      const result = updateRecord(
        DB_CONFIG.SHEET_NAMES.ORGANIZATIONAL_UNITS,
        'unit_id',
        unitId,
        updateData
      );

      if (result.success) {
        // Create lifecycle history entry
        this.createLifecycleHistory(unitId, 'CLOSED', reason, closedBy);
      }

      return result.success ? {
        success: true,
        message: 'Unit closed successfully'
      } : {
        success: false,
        message: 'Failed to close unit'
      };
    },

    /**
     * Merge two units
     */
    mergeUnits(sourceId, targetId, reason, performedBy) {
      const source = this.findById(sourceId);
      const target = this.findById(targetId);

      if (!source) {
        return { success: false, message: 'Source unit not found' };
      }
      if (!target) {
        return { success: false, message: 'Target unit not found' };
      }
      if (sourceId === targetId) {
        return { success: false, message: 'Cannot merge unit with itself' };
      }
      if (source.lifecycle_status !== 'ACTIVE' || target.lifecycle_status !== 'ACTIVE') {
        return { success: false, message: 'Both units must be active to merge' };
      }

      // Validate merge compatibility
      if (source.unit_type !== target.unit_type) {
        return { success: false, message: 'Cannot merge units of different types' };
      }

      // Update source unit
      const sourceUpdate = {
        is_active: false,
        lifecycle_status: 'MERGED',
        merged_into_unit_id: targetId,
        closed_date: formatDateTime(new Date()),
        closure_reason: reason,
        updated_at: formatDateTime(new Date()),
        updated_by: performedBy
      };

      const sourceResult = updateRecord(
        DB_CONFIG.SHEET_NAMES.ORGANIZATIONAL_UNITS,
        'unit_id',
        sourceId,
        sourceUpdate
      );

      if (!sourceResult.success) {
        return { success: false, message: 'Failed to update source unit' };
      }

      // Reassign children
      const children = this.getChildren(sourceId);
      children.forEach(child => {
        this.update(child.unit_id, { parent_unit_id: targetId, updated_by: performedBy });
      });

      // Reassign positions
      const positions = getTableData(DB_CONFIG.SHEET_NAMES.POSITIONS);
      positions
        .filter(p => p.unit_id === sourceId && p.is_active)
        .forEach(pos => {
          updateRecord(DB_CONFIG.SHEET_NAMES.POSITIONS, 'position_id', pos.position_id, {
            unit_id: targetId,
            updated_at: formatDateTime(new Date()),
            updated_by: performedBy
          });
        });

      // Create lifecycle history
      this.createLifecycleHistory(sourceId, 'MERGED', reason, performedBy, targetId);

      return {
        success: true,
        message: `Merged ${source.unit_name} into ${target.unit_name}`,
        source_unit: source.unit_name,
        target_unit: target.unit_name,
        children_reassigned: children.length
      };
    },

    /**
     * Reclassify a unit (e.g., change branch class from KELAS_2 to KELAS_1)
     */
    reclassifyUnit(unitId, newClassification, reason, performedBy) {
      const unit = this.findById(unitId);
      if (!unit) {
        return { success: false, message: 'Unit not found' };
      }

      if (!unit.classification) {
        return { success: false, message: 'Unit does not have a classification to change' };
      }

      if (unit.classification === newClassification) {
        return { success: false, message: 'Unit already has this classification' };
      }

      const oldClassification = unit.classification;

      const updateData = {
        previous_classification: oldClassification,
        classification: newClassification,
        lifecycle_status: 'RECLASSIFIED',
        updated_at: formatDateTime(new Date()),
        updated_by: performedBy,
        notes: (unit.notes || '') + ` | Reclassified from ${oldClassification} to ${newClassification}: ${reason}`
      };

      const result = updateRecord(
        DB_CONFIG.SHEET_NAMES.ORGANIZATIONAL_UNITS,
        'unit_id',
        unitId,
        updateData
      );

      if (result.success) {
        // Create lifecycle history
        const historyData = {
          unit_id: unitId,
          event_type: 'RECLASSIFIED',
          event_date: formatDateTime(new Date()),
          event_reason: reason,
          previous_status: 'ACTIVE',
          new_status: 'ACTIVE',
          previous_classification: oldClassification,
          new_classification: newClassification,
          performed_by: performedBy,
          created_at: formatDateTime(new Date())
        };
        insertRecord(DB_CONFIG.SHEET_NAMES.OFFICE_LIFECYCLE_HISTORY, historyData);

        // Update positions under this unit
        const positions = getTableData(DB_CONFIG.SHEET_NAMES.POSITIONS);
        positions
          .filter(p => p.unit_id === unitId)
          .forEach(pos => {
            updateRecord(DB_CONFIG.SHEET_NAMES.POSITIONS, 'position_id', pos.position_id, {
              branch_classification: newClassification,
              updated_at: formatDateTime(new Date()),
              updated_by: performedBy
            });
          });
      }

      return result.success ? {
        success: true,
        message: `Unit reclassified from ${oldClassification} to ${newClassification}`,
        previous_classification: oldClassification,
        new_classification: newClassification
      } : {
        success: false,
        message: 'Failed to reclassify unit'
      };
    },

    /**
     * Generate auto code for unit
     */
    generateCode(unitType) {
      const units = getTableData(DB_CONFIG.SHEET_NAMES.ORGANIZATIONAL_UNITS);
      const typeUnits = units.filter(u => u.unit_type === unitType);

      const prefixes = {
        'ROOT': 'ROOT',
        'DIRECTORATE': 'DIR',
        'WORK_UNIT': 'WU',
        'AFFAIR': 'AFF',
        'REGIONAL_OFFICE': 'RO',
        'BRANCH_OFFICE': 'BO',
        'SUBSIDIARY': 'SUB',
        'SUBSIDIARY_UNIT': 'SU'
      };

      const prefix = prefixes[unitType] || 'UNIT';
      const maxNumber = Math.max(0, ...typeUnits.map(u => parseCodeNumber(u.unit_code)));

      return generateCode(prefix, maxNumber + 1, 3);
    },

    /**
     * Validate parent-child relationship
     */
    validateParentChild(parentType, childType) {
      const validRelationships = {
        'ROOT': ['DIRECTORATE', 'REGIONAL_OFFICE', 'SUBSIDIARY'],
        'DIRECTORATE': ['WORK_UNIT'],
        'WORK_UNIT': ['AFFAIR'],
        'AFFAIR': [],
        'REGIONAL_OFFICE': ['BRANCH_OFFICE'],
        'BRANCH_OFFICE': [],
        'SUBSIDIARY': ['SUBSIDIARY_UNIT'],
        'SUBSIDIARY_UNIT': []
      };

      const validChildren = validRelationships[parentType] || [];

      if (validChildren.length === 0) {
        return { valid: false, message: `${parentType} cannot have children` };
      }

      if (!validChildren.includes(childType)) {
        return {
          valid: false,
          message: `${childType} cannot be a child of ${parentType}. Valid children are: ${validChildren.join(', ')}`
        };
      }

      return { valid: true };
    },

    /**
     * Check if unit has children
     */
    hasChildren(unitId) {
      const children = this.getChildren(unitId);
      return {
        hasChildren: children.length > 0,
        count: children.length,
        children: children
      };
    },

    /**
     * Create lifecycle history entry
     */
    createLifecycleHistory(unitId, eventType, reason, performedBy, relatedUnitId = null) {
      const unit = this.findById(unitId);

      const historyEntry = {
        history_id: generateUUID(),
        unit_id: unitId,
        event_type: eventType,
        event_date: formatDateTime(new Date()),
        event_reason: reason,
        previous_status: unit ? unit.lifecycle_status : null,
        new_status: eventType === 'CLOSED' ? 'CLOSED' : (eventType === 'MERGED' ? 'MERGED' : 'ACTIVE'),
        previous_classification: unit ? unit.classification : null,
        new_classification: unit ? unit.classification : null,
        related_unit_id: relatedUnitId,
        performed_by: performedBy,
        supporting_documents: null,
        notes: '',
        created_at: formatDateTime(new Date())
      };

      return insertRecord(DB_CONFIG.SHEET_NAMES.OFFICE_LIFECYCLE_HISTORY, historyEntry);
    },

    /**
     * Get lifecycle history for a unit
     */
    getLifecycleHistory(unitId) {
      const history = getTableData(DB_CONFIG.SHEET_NAMES.OFFICE_LIFECYCLE_HISTORY);
      return history
        .filter(h => h.unit_id === unitId)
        .sort((a, b) => new Date(b.event_date) - new Date(a.event_date));
    }
  }
};
