/**
 * OrganizationRoutes.gs
 * Organization management API routes (Directorates, Work Units, Affairs, Positions)
 */

var OrganizationRoutes = {
  /**
   * Route directorate requests
   * @param {string} action - Action to perform
   * @param {Object} data - Request data
   * @param {string} userId - Current user ID
   * @returns {Object} Response object
   */
  routeDirectorates: function(action, data, userId) {
    const id = data.directorateId || data.directorate_id || data.id;

    switch (action) {
      case 'list':
        return OrganizationController.Directorate.getAll(data);

      case 'get':
        return OrganizationController.Directorate.getById(id);

      case 'create':
        return OrganizationController.Directorate.create(data, userId);

      case 'update':
        return OrganizationController.Directorate.update(id, data, userId);

      case 'delete':
        return OrganizationController.Directorate.delete(id, userId);

      case 'check-children':
      case 'checkChildren':
        return OrganizationController.Directorate.checkChildren(id);

      case 'get-alternatives':
      case 'getAlternatives':
        return OrganizationController.Directorate.getAlternatives(id);

      case 'delete-cascade':
      case 'cascadeDelete':
        return OrganizationController.Directorate.cascadeDelete(id, userId);

      case 'delete-reassign':
      case 'reassignAndDelete':
        return OrganizationController.Directorate.reassignAndDelete(
          id,
          data.newDirectorateId || data.new_directorate_id,
          userId
        );

      default:
        return { success: false, message: 'Unknown directorates action: ' + action };
    }
  },

  /**
   * Route work unit requests
   * @param {string} action - Action to perform
   * @param {Object} data - Request data
   * @param {string} userId - Current user ID
   * @returns {Object} Response object
   */
  routeWorkUnits: function(action, data, userId) {
    const id = data.workUnitId || data.work_unit_id || data.id;

    switch (action) {
      case 'list':
        return OrganizationController.WorkUnit.getAll(data);

      case 'get':
        return OrganizationController.WorkUnit.getById(id);

      case 'create':
        return OrganizationController.WorkUnit.create(data, userId);

      case 'update':
        return OrganizationController.WorkUnit.update(id, data, userId);

      case 'delete':
        return OrganizationController.WorkUnit.delete(id, userId);

      case 'check-children':
      case 'checkChildren':
        return OrganizationController.WorkUnit.checkChildren(id);

      case 'get-alternatives':
      case 'getAlternatives':
        return OrganizationController.WorkUnit.getAlternatives(id);

      case 'delete-cascade':
      case 'cascadeDelete':
        return OrganizationController.WorkUnit.cascadeDelete(id, userId);

      case 'delete-reassign':
      case 'reassignAndDelete':
        return OrganizationController.WorkUnit.reassignAndDelete(
          id,
          data.newWorkUnitId || data.new_work_unit_id,
          userId
        );

      default:
        return { success: false, message: 'Unknown work-units action: ' + action };
    }
  },

  /**
   * Route affair requests
   * @param {string} action - Action to perform
   * @param {Object} data - Request data
   * @param {string} userId - Current user ID
   * @returns {Object} Response object
   */
  routeAffairs: function(action, data, userId) {
    const id = data.affairId || data.affair_id || data.id;

    switch (action) {
      case 'list':
        return OrganizationController.Affair.getAll(data);

      case 'get':
        return OrganizationController.Affair.getById(id);

      case 'create':
        return OrganizationController.Affair.create(data, userId);

      case 'update':
        return OrganizationController.Affair.update(id, data, userId);

      case 'delete':
        return OrganizationController.Affair.delete(id, userId);

      default:
        return { success: false, message: 'Unknown affairs action: ' + action };
    }
  },

  /**
   * Route position requests
   * @param {string} action - Action to perform
   * @param {Object} data - Request data
   * @param {string} userId - Current user ID
   * @returns {Object} Response object
   */
  routePositions: function(action, data, userId) {
    const id = data.positionId || data.position_id || data.id;

    switch (action) {
      case 'list':
        return OrganizationController.Position.getAll(data);

      case 'get':
        return OrganizationController.Position.getById(id);

      case 'create':
        return OrganizationController.Position.create(data, userId);

      case 'update':
        return OrganizationController.Position.update(id, data, userId);

      case 'delete':
        return OrganizationController.Position.delete(id, userId);

      default:
        return { success: false, message: 'Unknown positions action: ' + action };
    }
  },

  /**
   * Route organizational unit requests (NEW unified structure)
   * @param {string} action - Action to perform
   * @param {Object} data - Request data
   * @param {string} userId - Current user ID
   * @returns {Object} Response object
   */
  routeOrganizationalUnits: function(action, data, userId) {
    const id = data.unitId || data.unit_id || data.id;

    switch (action) {
      case 'list':
        return OrganizationController.OrganizationalUnit.getAll(data);

      case 'get':
        return OrganizationController.OrganizationalUnit.getById(id);

      case 'create':
        return OrganizationController.OrganizationalUnit.create(data, userId);

      case 'update':
        return OrganizationController.OrganizationalUnit.update(id, data, userId);

      case 'delete':
        return OrganizationController.OrganizationalUnit.delete(id, userId);

      case 'hierarchy':
      case 'getHierarchy':
        return OrganizationController.OrganizationalUnit.getHierarchy(data);

      case 'children':
      case 'getChildren':
        return OrganizationController.OrganizationalUnit.getChildren(id);

      case 'parent':
      case 'getParent':
        return OrganizationController.OrganizationalUnit.getParent(id);

      case 'byType':
      case 'by-type':
        return OrganizationController.OrganizationalUnit.getByType(data.unit_type);

      case 'byClassification':
      case 'by-classification':
        return OrganizationController.OrganizationalUnit.getByClassification(data.classification);

      case 'hasChildren':
      case 'has-children':
        return OrganizationController.OrganizationalUnit.hasChildren(id);

      case 'history':
      case 'getHistory':
        return OrganizationController.OrganizationalUnit.getHistory(id);

      case 'timeline':
      case 'getTimeline':
        return OrganizationController.OrganizationalUnit.getTimeline(id);

      default:
        return { success: false, message: 'Unknown organizational-units action: ' + action };
    }
  },

  /**
   * Route regional office requests
   * @param {string} action - Action to perform
   * @param {Object} data - Request data
   * @param {string} userId - Current user ID
   * @returns {Object} Response object
   */
  routeRegionalOffices: function(action, data, userId) {
    // Regional offices are a type of organizational unit
    data.unit_type = 'REGIONAL_OFFICE';

    switch (action) {
      case 'list':
        return OrganizationController.OrganizationalUnit.getRegionalOffices();

      case 'get':
        return OrganizationController.OrganizationalUnit.getById(data.unitId || data.id);

      case 'create':
        return OrganizationController.OrganizationalUnit.create(data, userId);

      case 'update':
        return OrganizationController.OrganizationalUnit.update(data.unitId || data.id, data, userId);

      case 'delete':
        return OrganizationController.OrganizationalUnit.delete(data.unitId || data.id, userId);

      default:
        return { success: false, message: 'Unknown regional-offices action: ' + action };
    }
  },

  /**
   * Route branch office requests
   * @param {string} action - Action to perform
   * @param {Object} data - Request data
   * @param {string} userId - Current user ID
   * @returns {Object} Response object
   */
  routeBranchOffices: function(action, data, userId) {
    // Branch offices are a type of organizational unit
    data.unit_type = 'BRANCH_OFFICE';

    switch (action) {
      case 'list':
        return OrganizationController.OrganizationalUnit.getBranchOffices();

      case 'get':
        return OrganizationController.OrganizationalUnit.getById(data.unitId || data.id);

      case 'create':
        return OrganizationController.OrganizationalUnit.create(data, userId);

      case 'update':
        return OrganizationController.OrganizationalUnit.update(data.unitId || data.id, data, userId);

      case 'delete':
        return OrganizationController.OrganizationalUnit.delete(data.unitId || data.id, userId);

      case 'reclassify':
        return OrganizationController.OrganizationalUnit.reclassify(data.unitId || data.id, data, userId);

      default:
        return { success: false, message: 'Unknown branch-offices action: ' + action };
    }
  },

  /**
   * Route subsidiary requests
   * @param {string} action - Action to perform
   * @param {Object} data - Request data
   * @param {string} userId - Current user ID
   * @returns {Object} Response object
   */
  routeSubsidiaries: function(action, data, userId) {
    // Subsidiaries are a type of organizational unit
    data.unit_type = 'SUBSIDIARY';

    switch (action) {
      case 'list':
        return OrganizationController.OrganizationalUnit.getSubsidiaries();

      case 'get':
        return OrganizationController.OrganizationalUnit.getById(data.unitId || data.id);

      case 'create':
        return OrganizationController.OrganizationalUnit.create(data, userId);

      case 'update':
        return OrganizationController.OrganizationalUnit.update(data.unitId || data.id, data, userId);

      case 'delete':
        return OrganizationController.OrganizationalUnit.delete(data.unitId || data.id, userId);

      default:
        return { success: false, message: 'Unknown subsidiaries action: ' + action };
    }
  },

  /**
   * Route office lifecycle management requests
   * @param {string} action - Action to perform
   * @param {Object} data - Request data
   * @param {string} userId - Current user ID
   * @returns {Object} Response object
   */
  routeOfficeLifecycle: function(action, data, userId) {
    const id = data.unitId || data.unit_id || data.id;

    switch (action) {
      case 'list':
      case 'getEvents':
        return OrganizationController.Lifecycle.getEvents(data);

      case 'history':
      case 'getHistory':
        return OrganizationController.Lifecycle.getHistory(id);

      case 'timeline':
      case 'getTimeline':
        return OrganizationController.Lifecycle.getTimeline(id);

      case 'byType':
      case 'by-type':
        return OrganizationController.Lifecycle.getByEventType(data.event_type);

      case 'byDateRange':
      case 'by-date-range':
        return OrganizationController.Lifecycle.getByDateRange(data.start_date, data.end_date);

      case 'statistics':
      case 'getStatistics':
        return OrganizationController.Lifecycle.getStatistics(data);

      case 'recent':
      case 'getRecent':
        return OrganizationController.Lifecycle.getRecentChanges(data.limit);

      case 'create':
        return OrganizationController.Lifecycle.create(data, userId);

      default:
        return { success: false, message: 'Unknown office-lifecycle action: ' + action };
    }
  }
};
