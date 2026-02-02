/**
 * Models/OKR.gs
 * OKR (Objectives and Key Results) model
 */

const OKRModel = {
  findById(okrId) {
    const okrs = getTableData(DB_CONFIG.SHEET_NAMES.OKRS);
    return okrs.find((o) => o.okr_id === okrId) || null;
  },

  getByUser(userId, year = null, quarter = null) {
    let okrs = getTableData(DB_CONFIG.SHEET_NAMES.OKRS);
    okrs = okrs.filter((o) => o.user_id === userId);
    if (year) okrs = okrs.filter((o) => o.year === year);
    if (quarter) okrs = okrs.filter((o) => o.quarter === quarter);
    return okrs.sort(
      (a, b) => b.year * 100 + b.week_number - (a.year * 100 + a.week_number),
    );
  },

  getByPosition(positionId, year = null) {
    let okrs = getTableData(DB_CONFIG.SHEET_NAMES.OKRS);
    okrs = okrs.filter((o) => o.position_id === positionId);
    if (year) okrs = okrs.filter((o) => o.year === year);
    return okrs;
  },

  create(data) {
    // Calculate overall progress
    const kr1Progress = parseFloat(data.key_result_1_progress) || 0;
    const kr2Progress = parseFloat(data.key_result_2_progress) || 0;
    const kr3Progress = parseFloat(data.key_result_3_progress) || 0;

    let count = 1;
    if (data.key_result_2) count++;
    if (data.key_result_3) count++;

    const overallProgress = (kr1Progress + kr2Progress + kr3Progress) / count;

    const newOKR = {
      okr_id: generateUUID(),
      user_id: data.user_id,
      position_id: data.position_id,
      year: data.year,
      quarter: data.quarter,
      week_number: data.week_number,
      week_start_date: data.week_start_date,
      week_end_date: data.week_end_date,
      objective_text: data.objective_text,
      key_result_1: data.key_result_1,
      key_result_1_progress: kr1Progress,
      key_result_2: data.key_result_2 || "",
      key_result_2_progress: kr2Progress,
      key_result_3: data.key_result_3 || "",
      key_result_3_progress: kr3Progress,
      overall_progress: overallProgress.toFixed(2),
      challenges: data.challenges || "",
      support_needed: data.support_needed || "",
      created_at: formatDateTime(new Date()),
      updated_at: formatDateTime(new Date()),
      submitted_at: null,
      reviewed_by: null,
      reviewed_at: null,
      review_notes: "",
      status: "DRAFT",
      notes: data.notes || "",
    };

    const result = insertRecord(DB_CONFIG.SHEET_NAMES.OKRS, newOKR);
    return result.success
      ? { success: true, data: newOKR, message: "OKR created successfully" }
      : {
          success: false,
          error: result.error,
          message: "Failed to create OKR",
        };
  },

  update(okrId, data) {
    const updateData = { ...data, updated_at: formatDateTime(new Date()) };
    delete updateData.okr_id;
    delete updateData.created_at;

    // Recalculate overall progress if key results are updated
    if (
      updateData.key_result_1_progress !== undefined ||
      updateData.key_result_2_progress !== undefined ||
      updateData.key_result_3_progress !== undefined
    ) {
      const okr = this.findById(okrId);
      const kr1Progress =
        parseFloat(
          updateData.key_result_1_progress ?? okr.key_result_1_progress,
        ) || 0;
      const kr2Progress =
        parseFloat(
          updateData.key_result_2_progress ?? okr.key_result_2_progress,
        ) || 0;
      const kr3Progress =
        parseFloat(
          updateData.key_result_3_progress ?? okr.key_result_3_progress,
        ) || 0;

      let count = 1;
      if (updateData.key_result_2 || okr.key_result_2) count++;
      if (updateData.key_result_3 || okr.key_result_3) count++;

      updateData.overall_progress = (
        (kr1Progress + kr2Progress + kr3Progress) /
        count
      ).toFixed(2);
    }

    const result = updateRecord(
      DB_CONFIG.SHEET_NAMES.OKRS,
      "okr_id",
      okrId,
      updateData,
    );
    return result.success
      ? {
          success: true,
          data: { okr_id: okrId, ...updateData },
          message: "OKR updated successfully",
        }
      : {
          success: false,
          error: result.error,
          message: "Failed to update OKR",
        };
  },

  submit(okrId) {
    return updateRecord(DB_CONFIG.SHEET_NAMES.OKRS, "okr_id", okrId, {
      submitted_at: formatDateTime(new Date()),
      status: "SUBMITTED",
    });
  },

  review(okrId, reviewerId, reviewNotes, approved = true) {
    return updateRecord(DB_CONFIG.SHEET_NAMES.OKRS, "okr_id", okrId, {
      reviewed_by: reviewerId,
      reviewed_at: formatDateTime(new Date()),
      review_notes: reviewNotes,
      status: approved ? "APPROVED" : "REVIEWED",
    });
  },

  getWeeklyOKR(userId, year, weekNumber) {
    const okrs = this.getByUser(userId, year);
    return okrs.find((o) => o.week_number === weekNumber) || null;
  },

  getCurrentWeekOKR(userId) {
    const now = new Date();
    const year = now.getFullYear();
    const weekNumber = getWeekNumber(now);
    return this.getWeeklyOKR(userId, year, weekNumber);
  },

  getPendingReviews(weekNumber = null) {
    let okrs = getTableData(DB_CONFIG.SHEET_NAMES.OKRS);
    okrs = okrs.filter((o) => o.status === "SUBMITTED");
    if (weekNumber) okrs = okrs.filter((o) => o.week_number === weekNumber);
    return okrs;
  },
};
