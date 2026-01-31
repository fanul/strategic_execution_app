/**
 * Models/Program.gs
 * Program and Activity model
 */

const ProgramModel = {
  findById(programId) {
    const programs = getTableData(DB_CONFIG.SHEET_NAMES.PROGRAMS);
    return programs.find((p) => p.program_id === programId) || null;
  },

  getAll(filters = {}) {
    let programs = getTableData(DB_CONFIG.SHEET_NAMES.PROGRAMS);
    if (filters.work_unit_goal_id) {
        programs = programs.filter(p => p.work_unit_goal_id === filters.work_unit_goal_id);
    }
    // Add other filters as needed
    return programs;
  },

  getByWorkUnitGoal(workUnitGoalId) {
    const programs = getTableData(DB_CONFIG.SHEET_NAMES.PROGRAMS);
    return programs.filter((p) => p.work_unit_goal_id === workUnitGoalId);
  },

  create(data) {
    const newProgram = {
      program_id: generateUUID(),
      work_unit_goal_id: data.work_unit_goal_id,
      program_code: data.program_code || this.generateCode(),
      program_name: data.program_name,
      program_description: data.program_description || "",
      start_date: data.start_date,
      end_date: data.end_date,
      budget_allocated: data.budget_allocated || 0,
      budget_spent: 0,
      created_at: formatDateTime(new Date()),
      created_by: data.created_by,
      updated_at: formatDateTime(new Date()),
      updated_by: data.created_by,
      status: "PLANNING",
      notes: data.notes || "",
    };
    const result = insertRecord(DB_CONFIG.SHEET_NAMES.PROGRAMS, newProgram);
    return result.success
      ? {
          success: true,
          data: newProgram,
          message: "Program created successfully",
        }
      : {
          success: false,
          error: result.error,
          message: "Failed to create program",
        };
  },

  update(programId, data) {
    const updateData = { ...data, updated_at: formatDateTime(new Date()) };
    delete updateData.program_id;
    delete updateData.created_at;
    delete updateData.created_by;

    const result = updateRecord(
      DB_CONFIG.SHEET_NAMES.PROGRAMS,
      "program_id",
      programId,
      updateData,
    );
    return result.success
      ? {
          success: true,
          data: { program_id: programId, ...updateData },
          message: "Program updated successfully",
        }
      : {
          success: false,
          error: result.error,
          message: "Failed to update program",
        };
  },

  delete(programId) {
    // Check for activities
    const activities = getTableData(DB_CONFIG.SHEET_NAMES.ACTIVITIES);
    if (activities.some((a) => a.program_id === programId)) {
      return {
        success: false,
        message: "Cannot delete program with activities",
      };
    }
    return deleteRecord(
      DB_CONFIG.SHEET_NAMES.PROGRAMS,
      "program_id",
      programId,
    );
  },

  generateCode() {
    const programs = getTableData(DB_CONFIG.SHEET_NAMES.PROGRAMS);
    const maxNumber = Math.max(
      0,
      ...programs.map((p) => parseCodeNumber(p.program_code)),
    );
    return generateCode("PRG", maxNumber + 1, 3);
  },

  updateBudgetSpent(programId) {
    const activities = ActivityModel.getByProgram(programId);
    const totalSpent = activities.reduce(
      (sum, a) => sum + (parseFloat(a.total_cost) || 0),
      0,
    );
    return this.update(programId, { budget_spent: totalSpent });
  },

  // ===== ACTIVITIES =====
  Activity: {},
};

const ActivityModel = {
  findById(activityId) {
    const activities = getTableData(DB_CONFIG.SHEET_NAMES.ACTIVITIES);
    return activities.find((a) => a.activity_id === activityId) || null;
  },

  getByProgram(programId) {
    const activities = getTableData(DB_CONFIG.SHEET_NAMES.ACTIVITIES);
    return activities.filter((a) => a.program_id === programId);
  },

  create(data) {
    const totalCost =
      (parseFloat(data.unit_price) || 0) * (parseFloat(data.quantity) || 0);

    const newActivity = {
      activity_id: generateUUID(),
      program_id: data.program_id,
      activity_code: data.activity_code || this.generateCode(),
      activity_name: data.activity_name,
      activity_description: data.activity_description || "",
      unit_price: data.unit_price,
      quantity: data.quantity,
      total_cost: totalCost,
      unit_of_measurement: data.unit_of_measurement || "",
      start_date: data.start_date,
      end_date: data.end_date,
      responsible_position_id: data.responsible_position_id || null,
      created_at: formatDateTime(new Date()),
      created_by: data.created_by,
      updated_at: formatDateTime(new Date()),
      updated_by: data.created_by,
      status: "PLANNING",
      completion_percentage: 0,
      notes: data.notes || "",
    };

    const result = insertRecord(DB_CONFIG.SHEET_NAMES.ACTIVITIES, newActivity);

    if (result.success) {
      // Update program budget spent
      ProgramModel.updateBudgetSpent(data.program_id);
      return {
        success: true,
        data: newActivity,
        message: "Activity created successfully",
      };
    }
    return {
      success: false,
      error: result.error,
      message: "Failed to create activity",
    };
  },

  update(activityId, data) {
    const updateData = { ...data, updated_at: formatDateTime(new Date()) };
    delete updateData.activity_id;
    delete updateData.created_at;
    delete updateData.created_by;

    // Recalculate total cost if unit price or quantity changed
    if (
      updateData.unit_price !== undefined ||
      updateData.quantity !== undefined
    ) {
      const activity = this.findById(activityId);
      const unitPrice =
        parseFloat(updateData.unit_price ?? activity.unit_price) || 0;
      const quantity =
        parseFloat(updateData.quantity ?? activity.quantity) || 0;
      updateData.total_cost = unitPrice * quantity;
    }

    const result = updateRecord(
      DB_CONFIG.SHEET_NAMES.ACTIVITIES,
      "activity_id",
      activityId,
      updateData,
    );

    if (result.success && updateData.total_cost !== undefined) {
      // Update program budget spent
      const activity = this.findById(activityId);
      ProgramModel.updateBudgetSpent(activity.program_id);
    }

    return result.success
      ? {
          success: true,
          data: { activity_id: activityId, ...updateData },
          message: "Activity updated successfully",
        }
      : {
          success: false,
          error: result.error,
          message: "Failed to update activity",
        };
  },

  delete(activityId) {
    const activity = this.findById(activityId);
    const result = deleteRecord(
      DB_CONFIG.SHEET_NAMES.ACTIVITIES,
      "activity_id",
      activityId,
    );

    if (result.success) {
      // Update program budget spent
      ProgramModel.updateBudgetSpent(activity.program_id);
    }

    return result;
  },

  generateCode() {
    const activities = getTableData(DB_CONFIG.SHEET_NAMES.ACTIVITIES);
    const maxNumber = Math.max(
      0,
      ...activities.map((a) => parseCodeNumber(a.activity_code)),
    );
    return generateCode("ACT", maxNumber + 1, 3);
  },
};

// Assign ActivityModel to ProgramModel
ProgramModel.Activity = ActivityModel;
