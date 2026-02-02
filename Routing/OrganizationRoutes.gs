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
  }
};
