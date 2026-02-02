/**
 * Models/KPI.gs
 * KPI model (KPIs, Monthly Progress, Individual KPIs)
 */

const KPIModel = {
  // ===== ORGANIZATIONAL KPIs =====
  findById(kpiId) {
    const kpis = getTableData(DB_CONFIG.SHEET_NAMES.KPIS);
    return kpis.find((k) => k.kpi_id === kpiId) || null;
  },

  getByWorkUnitGoal(workUnitGoalId) {
    const kpis = getTableData(DB_CONFIG.SHEET_NAMES.KPIS);
    return kpis.filter((k) => k.work_unit_goal_id === workUnitGoalId);
  },

  getByWorkUnit(workUnitId, year = null) {
    const kpis = getTableData(DB_CONFIG.SHEET_NAMES.KPIS);
    return kpis.filter(
      (k) => k.work_unit_id === workUnitId && (!year || k.year === year),
    );
  },

  getAll(year = null) {
    const kpis = getTableData(DB_CONFIG.SHEET_NAMES.KPIS);
    return year ? kpis.filter(k => k.year === year) : kpis;
  },

  delete(kpiId) {
    return deleteRecord(DB_CONFIG.SHEET_NAMES.KPIS, "kpi_id", kpiId);
  },

  create(data) {
    const newKPI = {
      kpi_id: generateUUID(),
      work_unit_goal_id: data.work_unit_goal_id,
      kpi_code:
        data.kpi_code ||
        this.generateCode(data.year, data.work_unit_id, data.perspective),
      year: data.year,
      directorate_id: data.directorate_id,
      work_unit_id: data.work_unit_id,
      kpi_type: data.kpi_type,
      perspective: data.perspective,
      goal_id: data.goal_id || null,
      kpi_name: data.kpi_name,
      weight_percentage: data.weight_percentage,
      target_value: data.target_value,
      unit_of_measurement: data.unit_of_measurement,
      assessment_type: data.assessment_type,
      calculation_type: data.calculation_type,
      glossary: data.glossary || "",
      is_derived_kpi: data.is_derived_kpi || false,
      parent_kpi_id: data.parent_kpi_id || null,
      maximum_limit: data.maximum_limit || null,
      measurement_period: data.measurement_period,
      baseline_value: data.baseline_value || null,
      created_at: formatDateTime(new Date()),
      created_by: data.created_by,
      updated_at: formatDateTime(new Date()),
      updated_by: data.created_by,
      status: "PLANNING",
      notes: data.notes || "",
    };
    const result = insertRecord(DB_CONFIG.SHEET_NAMES.KPIS, newKPI);
    return result.success
      ? { success: true, data: newKPI, message: "KPI created successfully" }
      : {
          success: false,
          error: result.error,
          message: "Failed to create KPI",
        };
  },

  update(kpiId, data) {
    const updateData = { ...data, updated_at: formatDateTime(new Date()) };
    delete updateData.kpi_id;
    delete updateData.created_at;
    delete updateData.created_by;

    const result = updateRecord(
      DB_CONFIG.SHEET_NAMES.KPIS,
      "kpi_id",
      kpiId,
      updateData,
    );
    return result.success
      ? {
          success: true,
          data: { kpi_id: kpiId, ...updateData },
          message: "KPI updated successfully",
        }
      : {
          success: false,
          error: result.error,
          message: "Failed to update KPI",
        };
  },

  generateCode(year, workUnitId, perspective) {
    const workUnit = OrganizationModel.WorkUnit.findById(workUnitId);
    const kpis = this.getByWorkUnit(workUnitId, year);
    const filtered = kpis.filter((k) => k.perspective === perspective);
    return generateKPICode(
      year,
      workUnit.work_unit_code,
      perspective,
      filtered.length + 1,
    );
  },

  // ===== KPI PROGRESS =====
  Progress: {
    findById(progressId) {
      const progress = getTableData(DB_CONFIG.SHEET_NAMES.KPI_MONTHLY_PROGRESS);
      return progress.find((p) => p.progress_id === progressId) || null;
    },

    getByKPI(kpiId, year = null, month = null) {
      let progress = getTableData(DB_CONFIG.SHEET_NAMES.KPI_MONTHLY_PROGRESS);
      progress = progress.filter((p) => p.kpi_id === kpiId);
      if (year) progress = progress.filter((p) => p.year === year);
      if (month) progress = progress.filter((p) => p.month === month);
      return progress.sort(
        (a, b) => a.year * 12 + a.month - (b.year * 12 + b.month),
      );
    },

    create(data) {
      const kpi = KPIModel.findById(data.kpi_id);
      const achievementPercentage =
        (parseFloat(data.actual_value) / parseFloat(kpi.target_value)) * 100;

      const newProgress = {
        progress_id: generateUUID(),
        kpi_id: data.kpi_id,
        year: data.year,
        month: data.month,
        actual_value: data.actual_value,
        achievement_percentage: achievementPercentage.toFixed(2),
        notes: data.notes || "",
        evidence_url: data.evidence_url || "",
        reported_by: data.reported_by,
        reported_at: formatDateTime(new Date()),
        verified_by: null,
        verified_at: null,
        status: "SUBMITTED",
      };
      const result = insertRecord(
        DB_CONFIG.SHEET_NAMES.KPI_MONTHLY_PROGRESS,
        newProgress,
      );
      return result.success
        ? {
            success: true,
            data: newProgress,
            message: "KPI progress recorded successfully",
          }
        : {
            success: false,
            error: result.error,
            message: "Failed to record KPI progress",
          };
    },

    verify(progressId, verifierId) {
      return updateRecord(
        DB_CONFIG.SHEET_NAMES.KPI_MONTHLY_PROGRESS,
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

  // ===== INDIVIDUAL KPIs =====
  Individual: {
    findById(individualKpiId) {
      const kpis = getTableData(DB_CONFIG.SHEET_NAMES.INDIVIDUAL_KPIS);
      return kpis.find((k) => k.individual_kpi_id === individualKpiId) || null;
    },

    getByPosition(positionId, year = null) {
      const kpis = getTableData(DB_CONFIG.SHEET_NAMES.INDIVIDUAL_KPIS);
      return kpis.filter(
        (k) => k.position_id === positionId && (!year || k.year === year),
      );
    },

    create(data) {
      const newKPI = {
        individual_kpi_id: generateUUID(),
        activity_id: data.activity_id || null,
        kpi_code:
          data.kpi_code ||
          this.generateCode(data.year, data.work_unit_id, data.position_id),
        year: data.year,
        directorate_id: data.directorate_id,
        work_unit_id: data.work_unit_id,
        position_id: data.position_id,
        kpi_type: data.kpi_type,
        perspective: data.perspective,
        goal_id: data.goal_id || null,
        kpi_name: data.kpi_name,
        weight_percentage: data.weight_percentage,
        target_value: data.target_value,
        unit_of_measurement: data.unit_of_measurement,
        assessment_type: data.assessment_type,
        calculation_type: data.calculation_type,
        glossary: data.glossary || "",
        is_derived_kpi: data.is_derived_kpi || false,
        parent_kpi_id: data.parent_kpi_id || null,
        maximum_limit: data.maximum_limit || null,
        measurement_period: data.measurement_period,
        baseline_value: data.baseline_value || null,
        created_at: formatDateTime(new Date()),
        created_by: data.created_by,
        updated_at: formatDateTime(new Date()),
        updated_by: data.created_by,
        status: "PLANNING",
        notes: data.notes || "",
      };
      const result = insertRecord(
        DB_CONFIG.SHEET_NAMES.INDIVIDUAL_KPIS,
        newKPI,
      );
      return result.success
        ? {
            success: true,
            data: newKPI,
            message: "Individual KPI created successfully",
          }
        : {
            success: false,
            error: result.error,
            message: "Failed to create individual KPI",
          };
    },

    generateCode(year, workUnitId, positionId) {
      const workUnit = OrganizationModel.WorkUnit.findById(workUnitId);
      const position = OrganizationModel.Position.findById(positionId);
      const kpis = this.getByPosition(positionId, year);
      return generateIndividualKPICode(
        year,
        workUnit.work_unit_code,
        position.position_code,
        kpis.length + 1,
      );
    },

    getAll(year = null) {
      const kpis = getTableData(DB_CONFIG.SHEET_NAMES.INDIVIDUAL_KPIS);
      return year ? kpis.filter(k => k.year === year) : kpis;
    },

    update(individualKpiId, data) {
      const updateData = { ...data, updated_at: formatDateTime(new Date()) };
      delete updateData.individual_kpi_id;
      delete updateData.created_at;
      delete updateData.created_by;

      return updateRecord(
        DB_CONFIG.SHEET_NAMES.INDIVIDUAL_KPIS,
        "individual_kpi_id",
        individualKpiId,
        updateData,
      );
    },

    delete(individualKpiId) {
      return deleteRecord(DB_CONFIG.SHEET_NAMES.INDIVIDUAL_KPIS, "individual_kpi_id", individualKpiId);
    },
  },
};
