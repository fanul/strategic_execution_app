/**
 * Models/ImpactCenter.gs
 * Impact Center model with monthly progress tracking
 */

const ImpactCenterModel = {
  findById(icId) {
    const impactCenters = getTableData(DB_CONFIG.SHEET_NAMES.IMPACT_CENTERS);
    return impactCenters.find((ic) => ic.ic_id === icId) || null;
  },

  getByGoal(goalId) {
    const impactCenters = getTableData(DB_CONFIG.SHEET_NAMES.IMPACT_CENTERS);
    return impactCenters.filter((ic) => ic.goal_id === goalId);
  },

  getAll() {
    return getTableData(DB_CONFIG.SHEET_NAMES.IMPACT_CENTERS);
  },

  create(data) {
    const newIC = {
      ic_id: generateUUID(),
      goal_id: data.goal_id,
      ic_code: data.ic_code || this.generateCode(data.year),
      ic_name: data.ic_name,
      description: data.description || "",
      formula: data.formula || "",
      deliverable: data.deliverable,
      completion_percentage: 0,
      baseline_value: data.baseline_value || null,
      target_value: data.target_value || null,
      created_at: formatDateTime(new Date()),
      created_by: data.created_by,
      updated_at: formatDateTime(new Date()),
      updated_by: data.created_by,
      status: "PLANNING",
      notes: data.notes || "",
    };
    const result = insertRecord(DB_CONFIG.SHEET_NAMES.IMPACT_CENTERS, newIC);
    return result.success
      ? {
          success: true,
          data: newIC,
          message: "Impact center created successfully",
        }
      : {
          success: false,
          error: result.error,
          message: "Failed to create impact center",
        };
  },

  update(icId, data) {
    const updateData = { ...data, updated_at: formatDateTime(new Date()) };
    delete updateData.ic_id;
    delete updateData.created_at;
    delete updateData.created_by;

    const result = updateRecord(
      DB_CONFIG.SHEET_NAMES.IMPACT_CENTERS,
      "ic_id",
      icId,
      updateData,
    );
    return result.success
      ? {
          success: true,
          data: { ic_id: icId, ...updateData },
          message: "Impact center updated successfully",
        }
      : {
          success: false,
          error: result.error,
          message: "Failed to update impact center",
        };
  },

  delete(icId) {
    return deleteRecord(DB_CONFIG.SHEET_NAMES.IMPACT_CENTERS, "ic_id", icId);
  },

  generateCode(year) {
    const impactCenters = getTableData(DB_CONFIG.SHEET_NAMES.IMPACT_CENTERS);
    const yearICs = impactCenters.filter((ic) =>
      ic.ic_code.startsWith(`${year}.IC.`),
    );
    return generateICCode(year, yearICs.length + 1);
  },

  // ===== IC MONTHLY PROGRESS =====
  Progress: {
    findById(progressId) {
      const progress = getTableData(DB_CONFIG.SHEET_NAMES.IC_MONTHLY_PROGRESS);
      return progress.find((p) => p.progress_id === progressId) || null;
    },

    getByIC(icId, year = null, month = null) {
      let progress = getTableData(DB_CONFIG.SHEET_NAMES.IC_MONTHLY_PROGRESS);
      progress = progress.filter((p) => p.ic_id === icId);
      if (year) progress = progress.filter((p) => p.year === year);
      if (month) progress = progress.filter((p) => p.month === month);
      return progress.sort(
        (a, b) => a.year * 12 + a.month - (b.year * 12 + b.month),
      );
    },

    create(data) {
      const newProgress = {
        progress_id: generateUUID(),
        ic_id: data.ic_id,
        year: data.year,
        month: data.month,
        completion_percentage: data.completion_percentage,
        actual_value: data.actual_value || null,
        notes: data.notes || "",
        evidence_url: data.evidence_url || "",
        reported_by: data.reported_by,
        reported_at: formatDateTime(new Date()),
        verified_by: null,
        verified_at: null,
        status: "SUBMITTED",
      };
      const result = insertRecord(
        DB_CONFIG.SHEET_NAMES.IC_MONTHLY_PROGRESS,
        newProgress,
      );

      if (result.success) {
        // Update IC completion percentage
        ImpactCenterModel.update(data.ic_id, {
          completion_percentage: data.completion_percentage,
        });
      }

      return result.success
        ? {
            success: true,
            data: newProgress,
            message: "IC progress recorded successfully",
          }
        : {
            success: false,
            error: result.error,
            message: "Failed to record IC progress",
          };
    },

    verify(progressId, verifierId) {
      return updateRecord(
        DB_CONFIG.SHEET_NAMES.IC_MONTHLY_PROGRESS,
        "progress_id",
        progressId,
        {
          verified_by: verifierId,
          verified_at: formatDateTime(new Date()),
          status: "VERIFIED",
        },
      );
    },
  },

  // ===== IC WORK UNIT MAPPING =====
  Mapping: {
    getByIC(icId) {
      const mappings = getTableData(DB_CONFIG.SHEET_NAMES.IC_WORK_UNIT_MAPPING);
      return mappings.filter((m) => m.ic_id === icId);
    },

    getByWorkUnit(workUnitId) {
      const mappings = getTableData(DB_CONFIG.SHEET_NAMES.IC_WORK_UNIT_MAPPING);
      return mappings.filter((m) => m.work_unit_id === workUnitId);
    },

    create(data) {
      const newMapping = {
        mapping_id: generateUUID(),
        ic_id: data.ic_id,
        work_unit_id: data.work_unit_id,
        responsibility_level: data.responsibility_level,
        weight_percentage: data.weight_percentage || 0,
        created_at: formatDateTime(new Date()),
        created_by: data.created_by,
        notes: data.notes || "",
      };
      const result = insertRecord(
        DB_CONFIG.SHEET_NAMES.IC_WORK_UNIT_MAPPING,
        newMapping,
      );
      return result.success
        ? {
            success: true,
            data: newMapping,
            message: "IC work unit mapping created successfully",
          }
        : {
            success: false,
            error: result.error,
            message: "Failed to create IC work unit mapping",
          };
    },

    delete(mappingId) {
      return deleteRecord(
        DB_CONFIG.SHEET_NAMES.IC_WORK_UNIT_MAPPING,
        "mapping_id",
        mappingId,
      );
    },
  },
};
