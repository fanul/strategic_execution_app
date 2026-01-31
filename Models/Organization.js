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
      return workUnits
        .filter(wu => wu.directorate_id === workUnit.directorate_id && wu.work_unit_id !== workUnitId && wu.is_active)
        .map(wu => ({
          id: wu.work_unit_id,
          code: wu.work_unit_code,
          name: wu.work_unit_name,
          display: `${wu.work_unit_code} - ${wu.work_unit_name}`
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

    reassignAndDelete(workUnitId, newWorkUnitId, deleterId) {
      // Get all affairs under this work unit
      const affairs = getTableData(DB_CONFIG.SHEET_NAMES.AFFAIRS);
      const childAffairs = affairs.filter(a => a.work_unit_id === workUnitId);

      // Reassign affairs to new work unit
      childAffairs.forEach(a => {
        updateRecord(DB_CONFIG.SHEET_NAMES.AFFAIRS, "affair_id", a.affair_id, {
          work_unit_id: newWorkUnitId,
          updated_at: formatDateTime(new Date()),
          updated_by: deleterId
        });
        logAudit('UPDATE', 'Affairs', a.affair_id, deleterId, 'Affair reassigned');
      });

      // Reassign positions directly under work unit
      const positions = getTableData(DB_CONFIG.SHEET_NAMES.POSITIONS);
      const workUnitPositions = positions.filter(p => p.work_unit_id === workUnitId);
      workUnitPositions.forEach(p => {
        updateRecord(DB_CONFIG.SHEET_NAMES.POSITIONS, "position_id", p.position_id, {
          work_unit_id: newWorkUnitId,
          updated_at: formatDateTime(new Date()),
          updated_by: deleterId
        });
        logAudit('UPDATE', 'Positions', p.position_id, deleterId, 'Position reassigned');
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
};
