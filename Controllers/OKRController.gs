/**
 * Controllers/OKRController.js
 * OKR management controller
 */

const OKRController = {
  create(data, creatorId) {
    try {
      const validation = validateOKR(data);
      if (!validation.isValid) {
        return { success: false, message: 'Validation failed', errors: validation.errors };
      }

      // Calculate week dates if not provided
      if (!data.week_start_date || !data.week_end_date) {
        const weekStart = getWeekStart(new Date());
        const weekEnd = getWeekEnd(new Date());
        data.week_start_date = formatDateISO(weekStart);
        data.week_end_date = formatDateISO(weekEnd);
      }

      if (!data.week_number) {
        data.week_number = getWeekNumber(new Date());
      }

      if (!data.year) {
        data.year = new Date().getFullYear();
      }

      if (!data.quarter) {
        const month = new Date().getMonth() + 1;
        data.quarter = getQuarterFromMonth(month);
      }

      const result = OKRModel.create(data);

      if (result.success) {
        logAudit('CREATE', 'OKRs', result.data.okr_id, creatorId, 
                 `OKR created for week ${data.week_number}`);
      }

      return result;
    } catch (error) {
      Logger.log('OKRController.create error: ' + error);
      return { success: false, message: 'Failed to create OKR', error: error.toString() };
    }
  },

  update(okrId, data, updaterId) {
    try {
      const validation = validateOKR(data, true);
      if (!validation.isValid) {
        return { success: false, message: 'Validation failed', errors: validation.errors };
      }

      const result = OKRModel.update(okrId, data);

      if (result.success) {
        logMultipleRevisions('OKRs', okrId, data, 'UPDATE', updaterId, 'OKR updated');
      }

      return result;
    } catch (error) {
      Logger.log('OKRController.update error: ' + error);
      return { success: false, message: 'Failed to update OKR', error: error.toString() };
    }
  },

  submit(okrId, userId) {
    const result = OKRModel.submit(okrId);

    if (result.success) {
      logAudit('UPDATE', 'OKRs', okrId, userId, 'OKR submitted for review');
    }

    return result;
  },

  review(okrId, reviewerId, reviewNotes, approved = true) {
    const result = OKRModel.review(okrId, reviewerId, reviewNotes, approved);

    if (result.success) {
      logAudit('UPDATE', 'OKRs', okrId, reviewerId, approved ? 'OKR approved' : 'OKR reviewed');
    }

    return result;
  },

  getByUser(userId, year, quarter) {
    const okrs = OKRModel.getByUser(userId, year, quarter);
    return { success: true, data: okrs };
  },

  getCurrentWeek(userId) {
    const okr = OKRModel.getCurrentWeekOKR(userId);
    return okr 
      ? { success: true, data: okr }
      : { success: false, message: 'No OKR found for current week' };
  },

  getMyOKRs(data) {
    const userId = data.user_id || 'user-001'; 
    const week = data.week;
    const year = new Date().getFullYear();
    const okr = OKRModel.getWeeklyOKR(userId, year, week);
    return okr 
      ? { success: true, data: [okr] }
      : { success: true, data: [] };
  },

  getOKRsToReview(data) {
    const week = data.week;
    const okrs = OKRModel.getPendingReviews(week);
    return { success: true, data: okrs };
  },

  save(data, userId) {
    if (data.okr_id) {
      return this.update(data.okr_id, data, userId);
    } else {
      return this.create(data, userId);
    }
  },

  getById(okrId) {
    const okr = OKRModel.findById(okrId);
    return okr 
      ? { success: true, data: okr }
      : { success: false, message: 'OKR not found' };
  }
};

// Top-level convenience functions for API routing
OKRController.saveOKR = function(data) {
  return OKRController.save(data, data.user_id || 'user-001');
};

OKRController.submitOKR = function(data) {
  return OKRController.submit(data.okr_id, data.user_id || 'user-001');
};

OKRController.reviewOKR = function(data) {
  return OKRController.review(data.okr_id, data.reviewer_id || 'user-001', data.review_notes, data.approved);
};
