/**
 * Controllers/RoleController.js
 * Role and permission management controller
 */

const RoleController = {
  create(roleData, creatorId) {
    try {
      // Validate
      if (!roleData.role_code || !roleData.role_name) {
        return { success: false, message: 'Role code and name are required' };
      }

      // Check uniqueness
      if (!RoleModel.isCodeUnique(roleData.role_code)) {
        return { success: false, message: 'Role code already exists' };
      }
      if (!RoleModel.isNameUnique(roleData.role_name)) {
        return { success: false, message: 'Role name already exists' };
      }

      // Create role
      roleData.created_by = creatorId;
      const result = RoleModel.create(roleData);

      if (result.success) {
        logAudit('CREATE', 'Roles', result.data.role_id, creatorId, 'Role created');
      }

      return result;
    } catch (error) {
      Logger.log('RoleController.create error: ' + error);
      return { success: false, message: 'Failed to create role', error: error.toString() };
    }
  },

  update(roleId, roleData, updaterId) {
    try {
      // Check uniqueness
      if (roleData.role_code && !RoleModel.isCodeUnique(roleData.role_code, roleId)) {
        return { success: false, message: 'Role code already exists' };
      }
      if (roleData.role_name && !RoleModel.isNameUnique(roleData.role_name, roleId)) {
        return { success: false, message: 'Role name already exists' };
      }

      roleData.updated_by = updaterId;
      const result = RoleModel.update(roleId, roleData);

      if (result.success) {
        logMultipleRevisions('Roles', roleId, roleData, 'UPDATE', updaterId, 'Role updated');
      }

      return result;
    } catch (error) {
      Logger.log('RoleController.update error: ' + error);
      return { success: false, message: 'Failed to update role', error: error.toString() };
    }
  },

  delete(roleId, deleterId) {
    try {
      const result = RoleModel.delete(roleId);
      
      if (result.success) {
        logAudit('DELETE', 'Roles', roleId, deleterId, 'Role deleted');
      }

      return result;
    } catch (error) {
      Logger.log('RoleController.delete error: ' + error);
      return { success: false, message: 'Failed to delete role', error: error.toString() };
    }
  },

  getAll() {
    const roles = RoleModel.getAll();
    return { success: true, data: roles, count: roles.length };
  },

  getById(roleId) {
    const role = RoleModel.findById(roleId);
    return role 
      ? { success: true, data: role }
      : { success: false, message: 'Role not found' };
  },

  clone(roleId, newRoleName, creatorId) {
    return RoleModel.clone(roleId, newRoleName, creatorId);
  }
};
