/**
 * Models/Role.gs
 * Role model handling business logic for role and permission entities.
 */

const RoleModel = {
  /**
   * Find role by ID
   * @param {string} roleId - Role ID
   * @returns {Object|null} Role object or null
   */
  findById(roleId) {
    try {
      const roles = getTableData(DB_CONFIG.SHEET_NAMES.ROLES);
      return roles.find((r) => r.role_id === roleId) || null;
    } catch (error) {
      Logger.log("RoleModel.findById error: " + error);
      return null;
    }
  },

  /**
   * Find role by code
   * @param {string} roleCode - Role code
   * @returns {Object|null} Role object or null
   */
  findByCode(roleCode) {
    try {
      const roles = getTableData(DB_CONFIG.SHEET_NAMES.ROLES);
      return roles.find((r) => r.role_code === roleCode) || null;
    } catch (error) {
      Logger.log("RoleModel.findByCode error: " + error);
      return null;
    }
  },

  /**
   * Get all roles
   * @returns {Array} Array of role objects
   */
  getAll() {
    try {
      return getTableData(DB_CONFIG.SHEET_NAMES.ROLES);
    } catch (error) {
      Logger.log("RoleModel.getAll error: " + error);
      return [];
    }
  },

  /**
   * Get system roles (non-editable)
   * @returns {Array} Array of system role objects
   */
  getSystemRoles() {
    try {
      const roles = getTableData(DB_CONFIG.SHEET_NAMES.ROLES);
      return roles.filter((r) => r.is_system_role === true);
    } catch (error) {
      Logger.log("RoleModel.getSystemRoles error: " + error);
      return [];
    }
  },

  /**
   * Get custom roles (editable)
   * @returns {Array} Array of custom role objects
   */
  getCustomRoles() {
    try {
      const roles = getTableData(DB_CONFIG.SHEET_NAMES.ROLES);
      return roles.filter((r) => r.is_system_role !== true);
    } catch (error) {
      Logger.log("RoleModel.getCustomRoles error: " + error);
      return [];
    }
  },

  /**
   * Create a new role
   * @param {Object} roleData - Role data
   * @returns {Object} Response with created role
   */
  create(roleData) {
    try {
      const newRole = {
        role_id: generateUUID(),
        role_code: roleData.role_code,
        role_name: roleData.role_name,
        description: roleData.description || "",
        permissions: JSON.stringify(roleData.permissions || {}),
        is_system_role: false,
        created_at: formatDateTime(new Date()),
        created_by: roleData.created_by,
        updated_at: formatDateTime(new Date()),
        updated_by: roleData.created_by,
      };

      const result = insertRecord(DB_CONFIG.SHEET_NAMES.ROLES, newRole);

      if (result.success) {
        return {
          success: true,
          data: newRole,
          message: "Role created successfully",
        };
      } else {
        return {
          success: false,
          error: result.error,
          message: "Failed to create role",
        };
      }
    } catch (error) {
      Logger.log("RoleModel.create error: " + error);
      return {
        success: false,
        error: error.toString(),
        message: "Failed to create role",
      };
    }
  },

  /**
   * Update role
   * @param {string} roleId - Role ID
   * @param {Object} roleData - Updated role data
   * @returns {Object} Response
   */
  update(roleId, roleData) {
    try {
      // Check if system role
      const existingRole = this.findById(roleId);
      if (existingRole && existingRole.is_system_role) {
        return { success: false, message: "Cannot modify system roles" };
      }

      const updateData = {
        ...roleData,
        updated_at: formatDateTime(new Date()),
      };

      // Remove protected fields
      delete updateData.role_id;
      delete updateData.is_system_role;
      delete updateData.created_at;
      delete updateData.created_by;

      // Stringify permissions if it's an object
      if (typeof updateData.permissions === "object") {
        updateData.permissions = JSON.stringify(updateData.permissions);
      }

      const result = updateRecord(
        DB_CONFIG.SHEET_NAMES.ROLES,
        "role_id",
        roleId,
        updateData,
      );

      if (result.success) {
        return {
          success: true,
          data: { role_id: roleId, ...updateData },
          message: "Role updated successfully",
        };
      } else {
        return {
          success: false,
          error: result.error,
          message: "Failed to update role",
        };
      }
    } catch (error) {
      Logger.log("RoleModel.update error: " + error);
      return {
        success: false,
        error: error.toString(),
        message: "Failed to update role",
      };
    }
  },

  /**
   * Delete role
   * @param {string} roleId - Role ID
   * @returns {Object} Response
   */
  delete(roleId) {
    try {
      // Check if system role
      const role = this.findById(roleId);
      if (role && role.is_system_role) {
        return { success: false, message: "Cannot delete system roles" };
      }

      // Check if role is assigned to users
      const users = getTableData(DB_CONFIG.SHEET_NAMES.USERS);
      const assignedUsers = users.filter((u) => u.role_id === roleId);

      if (assignedUsers.length > 0) {
        return {
          success: false,
          message: `Cannot delete role. ${assignedUsers.length} user(s) are assigned to this role.`,
        };
      }

      const result = deleteRecord(
        DB_CONFIG.SHEET_NAMES.ROLES,
        "role_id",
        roleId,
      );

      if (result.success) {
        return { success: true, message: "Role deleted successfully" };
      } else {
        return {
          success: false,
          error: result.error,
          message: "Failed to delete role",
        };
      }
    } catch (error) {
      Logger.log("RoleModel.delete error: " + error);
      return {
        success: false,
        error: error.toString(),
        message: "Failed to delete role",
      };
    }
  },

  /**
   * Check if role code is unique
   * @param {string} roleCode - Role code to check
   * @param {string} excludeId - Role ID to exclude (for updates)
   * @returns {boolean} True if unique
   */
  isCodeUnique(roleCode, excludeId = null) {
    const roles = getTableData(DB_CONFIG.SHEET_NAMES.ROLES);
    return !roles.some(
      (r) =>
        r.role_code === roleCode && (!excludeId || r.role_id !== excludeId),
    );
  },

  /**
   * Check if role name is unique
   * @param {string} roleName - Role name to check
   * @param {string} excludeId - Role ID to exclude (for updates)
   * @returns {boolean} True if unique
   */
  isNameUnique(roleName, excludeId = null) {
    const roles = getTableData(DB_CONFIG.SHEET_NAMES.ROLES);
    return !roles.some(
      (r) =>
        r.role_name.toLowerCase() === roleName.toLowerCase() &&
        (!excludeId || r.role_id !== excludeId),
    );
  },

  /**
   * Get role permissions
   * @param {string} roleId - Role ID
   * @returns {Object} Permissions object
   */
  getPermissions(roleId) {
    try {
      const role = this.findById(roleId);
      if (!role) return {};

      return typeof role.permissions === "string"
        ? JSON.parse(role.permissions)
        : role.permissions;
    } catch (error) {
      Logger.log("RoleModel.getPermissions error: " + error);
      return {};
    }
  },

  /**
   * Check if role has specific permission
   * @param {string} roleId - Role ID
   * @param {string} module - Module name
   * @param {string} action - Action (create, read, update, delete)
   * @returns {boolean} True if has permission
   */
  hasPermission(roleId, module, action) {
    try {
      const permissions = this.getPermissions(roleId);
      return permissions[module] && permissions[module][action] === true;
    } catch (error) {
      Logger.log("RoleModel.hasPermission error: " + error);
      return false;
    }
  },

  /**
   * Get user count for role
   * @param {string} roleId - Role ID
   * @returns {number} Number of users with this role
   */
  getUserCount(roleId) {
    try {
      const users = getTableData(DB_CONFIG.SHEET_NAMES.USERS);
      return users.filter((u) => u.role_id === roleId).length;
    } catch (error) {
      Logger.log("RoleModel.getUserCount error: " + error);
      return 0;
    }
  },

  /**
   * Clone role (create copy with new name)
   * @param {string} roleId - Role ID to clone
   * @param {string} newRoleName - New role name
   * @param {string} creatorId - Creator user ID
   * @returns {Object} Response
   */
  clone(roleId, newRoleName, creatorId) {
    try {
      const sourceRole = this.findById(roleId);
      if (!sourceRole) {
        return { success: false, message: "Source role not found" };
      }

      const newRoleCode = slugify(newRoleName).toUpperCase();

      const newRoleData = {
        role_code: newRoleCode,
        role_name: newRoleName,
        description: `Cloned from ${sourceRole.role_name}`,
        permissions:
          typeof sourceRole.permissions === "string"
            ? JSON.parse(sourceRole.permissions)
            : sourceRole.permissions,
        created_by: creatorId,
      };

      return this.create(newRoleData);
    } catch (error) {
      Logger.log("RoleModel.clone error: " + error);
      return {
        success: false,
        error: error.toString(),
        message: "Failed to clone role",
      };
    }
  },
};
