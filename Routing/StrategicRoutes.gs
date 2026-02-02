/**
 * StrategicRoutes.gs
 * Strategic planning API routes (OKRs, KPIs, Strategic Planning, SWOT, Programs)
 */

var StrategicRoutes = {
  /**
   * Route OKR requests
   * @param {string} action - Action to perform
   * @param {Object} data - Request data
   * @param {string} userId - Current user ID
   * @returns {Object} Response object
   */
  routeOKRs: function(action, data, userId) {
    const id = data.okrId || data.okr_id || data.id;

    switch (action) {
      case 'list':
        return OKRController.getByUser(userId, data.year, data.quarter);

      case 'get':
        return OKRController.getById(id);

      case 'create':
        return OKRController.create(data, userId);

      case 'update':
        return OKRController.update(id, data, userId);

      case 'delete':
        return OKRController.delete(id, userId);

      case 'getCurrentWeek':
      case 'get-current-week':
        return OKRController.getCurrentWeek(userId);

      case 'submit':
        return OKRController.submit(id, userId);

      case 'review':
        return OKRController.review(
          id,
          userId,
          data.reviewNotes || data.review_notes || '',
          data.approved !== false
        );

      default:
        return { success: false, message: 'Unknown okrs action: ' + action };
    }
  },

  /**
   * Route KPI requests
   * @param {string} action - Action to perform
   * @param {Object} data - Request data
   * @param {string} userId - Current user ID
   * @returns {Object} Response object
   */
  routeKPIs: function(action, data, userId) {
    const id = data.kpiId || data.kpi_id || data.id;

    switch (action) {
      case 'list':
        return KPIController.getByWorkUnit(data.workUnitId || data.work_unit_id, data.year);

      case 'get':
        return KPIController.getById(id);

      case 'create':
        return KPIController.create(data, userId);

      case 'update':
        return KPIController.update(id, data, userId);

      case 'delete':
        return KPIController.delete(id, userId);

      case 'progress':
      case 'record':
      case 'progress/record':
        return KPIController.Progress.record(data, userId);

      case 'verify':
      case 'progress/verify':
        return KPIController.Progress.verify(data.progressId || data.progress_id || data.id, userId);

      default:
        return { success: false, message: 'Unknown kpis action: ' + action };
    }
  },

  /**
   * Route strategic planning requests
   * @param {string} action - Action to perform
   * @param {Object} data - Request data
   * @param {string} userId - Current user ID
   * @returns {Object} Response object
   */
  routeStrategic: function(action, data, userId) {
    switch (action) {
      case 'list':
        return StrategicController.Period.getAll();

      case 'goals':
      case 'get-goals':
        return StrategicController.Goal.getByYear(data.year || new Date().getFullYear());

      case 'periods':
      case 'get-periods':
        return StrategicController.Period.getAll();

      default:
        return { success: false, message: 'Unknown strategic action: ' + action };
    }
  },

  /**
   * Route SWOT analysis requests
   * @param {string} action - Action to perform
   * @param {Object} data - Request data
   * @param {string} userId - Current user ID
   * @returns {Object} Response object
   */
  routeSWOT: function(action, data, userId) {
    const id = data.itemId || data.item_id || data.analysis_id || data.id;
    const goalId = data.goalId || data.goal_id;

    switch (action) {
      case 'matrix':
      case 'get-matrix':
        return SWOTController.getMatrix(goalId);

      case 'create':
        return SWOTController.create(data, userId);

      case 'update':
        return SWOTController.update(id, data, userId);

      case 'delete':
        return SWOTController.delete(id, userId);

      case 'impact':
      case 'get-impact':
        return SWOTController.getImpactAnalysis(goalId);

      default:
        return { success: false, message: 'Unknown swot action: ' + action };
    }
  },

  /**
   * Route program requests
   * @param {string} action - Action to perform
   * @param {Object} data - Request data
   * @param {string} userId - Current user ID
   * @returns {Object} Response object
   */
  routePrograms: function(action, data, userId) {
    const id = data.programId || data.program_id || data.id;

    switch (action) {
      case 'list':
        return ProgramController.getAllPrograms(data);

      case 'get':
        return ProgramController.getById(id);

      case 'create':
        return ProgramController.create(data, userId);

      case 'update':
        return ProgramController.update(id, data, userId);

      case 'delete':
        return ProgramController.delete(id, userId);

      default:
        return { success: false, message: 'Unknown programs action: ' + action };
    }
  },

  /**
   * Route activity requests
   * @param {string} action - Action to perform
   * @param {Object} data - Request data
   * @param {string} userId - Current user ID
   * @returns {Object} Response object
   */
  routeActivities: function(action, data, userId) {
    const id = data.activityId || data.activity_id || data.id;

    switch (action) {
      case 'list':
      case 'byProgram':
      case 'by-program':
        return ProgramController.Activity.getByProgram(data.programId || data.program_id);

      case 'get':
        return { success: false, message: 'Use activities/byProgram with programId' };

      case 'create':
        return ProgramController.Activity.create(data, userId);

      case 'update':
        return ProgramController.Activity.update(id, data, userId);

      case 'delete':
        return ProgramController.Activity.delete(id, userId);

      default:
        return { success: false, message: 'Unknown activities action: ' + action };
    }
  }
};
