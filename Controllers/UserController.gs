/**
 * Controllers/UserController.gs
 * User management controller
 */

const UserController = {
  create(userData, creatorId) {
    try {
      // 1. Validate
      const validation = validateUser(userData);
      if (!validation.isValid) {
        return {
          success: false,
          message: "Validation failed",
          errors: validation.errors,
        };
      }

      // 2. Check uniqueness
      if (!UserModel.isEmailUnique(userData.email)) {
        return { success: false, message: "Email already exists" };
      }
      if (!UserModel.isUsernameUnique(userData.username)) {
        return { success: false, message: "Username already exists" };
      }

      // 3. Call model
      userData.created_by = creatorId;
      const result = UserModel.create(userData);

      // 4. Log audit
      if (result.success) {
        logAudit(
          "CREATE",
          "Users",
          result.data.user_id,
          creatorId,
          "User created",
        );
      }

      return result;
    } catch (error) {
      Logger.log("UserController.create error: " + error);
      return {
        success: false,
        message: "Failed to create user",
        error: error.toString(),
      };
    }
  },

  update(userId, userData, updaterId) {
    try {
      // 1. Validate
      const validation = validateUser(userData, true);
      if (!validation.isValid) {
        return {
          success: false,
          message: "Validation failed",
          errors: validation.errors,
        };
      }

      // 2. Check uniqueness if email/username changed
      if (userData.email && !UserModel.isEmailUnique(userData.email, userId)) {
        return { success: false, message: "Email already exists" };
      }
      if (
        userData.username &&
        !UserModel.isUsernameUnique(userData.username, userId)
      ) {
        return { success: false, message: "Username already exists" };
      }

      // 3. Call model
      userData.updated_by = updaterId;
      const result = UserModel.update(userId, userData);

      // 4. Log audit
      if (result.success) {
        logMultipleRevisions(
          "Users",
          userId,
          userData,
          "UPDATE",
          updaterId,
          "User updated",
        );
      }

      return result;
    } catch (error) {
      Logger.log("UserController.update error: " + error);
      return {
        success: false,
        message: "Failed to update user",
        error: error.toString(),
      };
    }
  },

  delete(userId, deleterId) {
    try {
      const result = UserModel.delete(userId);

      if (result.success) {
        logAudit(
          "DELETE",
          "Users",
          userId,
          deleterId,
          "User deleted (soft delete)",
        );
      }

      return result;
    } catch (error) {
      Logger.log("UserController.delete error: " + error);
      return {
        success: false,
        message: "Failed to delete user",
        error: error.toString(),
      };
    }
  },

  getById(userId) {
    const user = UserModel.findById(userId);
    return user
      ? { success: true, data: user }
      : { success: false, message: "User not found" };
  },

  getAll(filters = {}) {
    const users = UserModel.getAll(filters);
    return { success: true, data: users, count: users.length };
  },

  changePassword(userId, oldPassword, newPassword, updaterId) {
    try {
      const user = UserModel.findById(userId);
      if (!user) {
        return { success: false, message: "User not found" };
      }

      if (!verifyPassword(oldPassword, user.password_hash)) {
        return { success: false, message: "Current password is incorrect" };
      }

      const result = UserModel.update(userId, {
        password: newPassword,
        updated_by: updaterId,
      });

      if (result.success) {
        logAudit("UPDATE", "Users", userId, updaterId, "Password changed");
      }

      return result;
    } catch (error) {
      Logger.log("UserController.changePassword error: " + error);
      return {
        success: false,
        message: "Failed to change password",
        error: error.toString(),
      };
    }
  },
};
