/**
 * Models/User.gs
 * User model handling business logic for user entities.
 */

const UserModel = {
  /**
   * Find user by ID
   * @param {string} userId - User ID
   * @returns {Object|null} User object or null
   */
  findById(userId) {
    try {
      const users = getTableData(DB_CONFIG.SHEET_NAMES.USERS);
      return users.find((u) => u.user_id === userId) || null;
    } catch (error) {
      Logger.log("UserModel.findById error: " + error);
      return null;
    }
  },

  /**
   * Find user by email
   * @param {string} email - Email address
   * @returns {Object|null} User object or null
   */
  findByEmail(email) {
    try {
      const users = getTableData(DB_CONFIG.SHEET_NAMES.USERS);
      return (
        users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null
      );
    } catch (error) {
      Logger.log("UserModel.findByEmail error: " + error);
      return null;
    }
  },

  /**
   * Find user by username
   * @param {string} username - Username
   * @returns {Object|null} User object or null
   */
  findByUsername(username) {
    try {
      const users = getTableData(DB_CONFIG.SHEET_NAMES.USERS);
      return (
        users.find(
          (u) => u.username.toLowerCase() === username.toLowerCase(),
        ) || null
      );
    } catch (error) {
      Logger.log("UserModel.findByUsername error: " + error);
      return null;
    }
  },

  /**
   * Get all users with optional filters
   * @param {Object} filters - Filter criteria
   * @returns {Array} Array of user objects
   */
  getAll(filters = {}) {
    try {
      let users = getTableData(DB_CONFIG.SHEET_NAMES.USERS);

      if (filters.is_active !== undefined) {
        users = users.filter((u) => u.is_active === filters.is_active);
      }

      if (filters.role_id) {
        users = users.filter((u) => u.role_id === filters.role_id);
      }

      return users;
    } catch (error) {
      Logger.log("UserModel.getAll error: " + error);
      return [];
    }
  },

  /**
   * Get active users
   * @returns {Array} Array of active user objects
   */
  getActiveUsers() {
    return this.getAll({ is_active: true });
  },

  /**
   * Create a new user
   * @param {Object} userData - User data
   * @returns {Object} Response with created user
   */
  create(userData) {
    try {
      // Prepare user data
      const newUser = {
        user_id: generateUUID(),
        username: userData.username,
        email: userData.email,
        password_hash: hashPassword(userData.password),
        full_name: userData.full_name,
        role_id: userData.role_id,
        active_from: userData.active_from || formatDateTime(new Date()),
        active_until: userData.active_until || null,
        is_active: userData.is_active !== undefined ? userData.is_active : true,
        last_login: null,
        created_at: formatDateTime(new Date()),
        created_by: userData.created_by,
        updated_at: formatDateTime(new Date()),
        updated_by: userData.created_by,
        notes: userData.notes || "",
      };

      const result = insertRecord(DB_CONFIG.SHEET_NAMES.USERS, newUser);

      if (result.success) {
        return {
          success: true,
          data: newUser,
          message: "User created successfully",
        };
      } else {
        return {
          success: false,
          error: result.error,
          message: "Failed to create user",
        };
      }
    } catch (error) {
      Logger.log("UserModel.create error: " + error);
      return {
        success: false,
        error: error.toString(),
        message: "Failed to create user",
      };
    }
  },

  /**
   * Update user
   * @param {string} userId - User ID
   * @param {Object} userData - Updated user data
   * @returns {Object} Response
   */
  update(userId, userData) {
    try {
      const updateData = {
        ...userData,
        updated_at: formatDateTime(new Date()),
      };

      // Remove fields that shouldn't be updated this way
      delete updateData.user_id;
      delete updateData.created_at;
      delete updateData.created_by;

      // Hash password if provided
      if (updateData.password) {
        updateData.password_hash = hashPassword(updateData.password);
        delete updateData.password;
      }

      const result = updateRecord(
        DB_CONFIG.SHEET_NAMES.USERS,
        "user_id",
        userId,
        updateData,
      );

      if (result.success) {
        return {
          success: true,
          data: { user_id: userId, ...updateData },
          message: "User updated successfully",
        };
      } else {
        return {
          success: false,
          error: result.error,
          message: "Failed to update user",
        };
      }
    } catch (error) {
      Logger.log("UserModel.update error: " + error);
      return {
        success: false,
        error: error.toString(),
        message: "Failed to update user",
      };
    }
  },

  /**
   * Delete user (soft delete by setting is_active to false)
   * @param {string} userId - User ID
   * @returns {Object} Response
   */
  delete(userId) {
    try {
      return this.update(userId, { is_active: false });
    } catch (error) {
      Logger.log("UserModel.delete error: " + error);
      return {
        success: false,
        error: error.toString(),
        message: "Failed to delete user",
      };
    }
  },

  /**
   * Check if email is unique
   * @param {string} email - Email to check
   * @param {string} excludeId - User ID to exclude (for updates)
   * @returns {boolean} True if unique
   */
  isEmailUnique(email, excludeId = null) {
    const users = getTableData(DB_CONFIG.SHEET_NAMES.USERS);
    return !users.some(
      (u) =>
        u.email.toLowerCase() === email.toLowerCase() &&
        (!excludeId || u.user_id !== excludeId),
    );
  },

  /**
   * Check if username is unique
   * @param {string} username - Username to check
   * @param {string} excludeId - User ID to exclude (for updates)
   * @returns {boolean} True if unique
   */
  isUsernameUnique(username, excludeId = null) {
    const users = getTableData(DB_CONFIG.SHEET_NAMES.USERS);
    return !users.some(
      (u) =>
        u.username.toLowerCase() === username.toLowerCase() &&
        (!excludeId || u.user_id !== excludeId),
    );
  },

  /**
   * Get users by role
   * @param {string} roleId - Role ID
   * @returns {Array} Array of users
   */
  getByRole(roleId) {
    return this.getAll({ role_id: roleId });
  },

  /**
   * Update last login timestamp
   * @param {string} userId - User ID
   */
  updateLastLogin(userId) {
    this.update(userId, { last_login: formatDateTime(new Date()) });
  },
};
