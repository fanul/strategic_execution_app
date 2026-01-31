/**
 * Auth.js
 * Handles authentication and authorization for the application.
 */

/**
 * Hash a password using Google Apps Script's built-in encryption
 * @param {string} password - Plain text password
 * @returns {string} Hashed password (hex string)
 */
function hashPassword(password) {
  const digest = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    password,
    Utilities.Charset.UTF_8
  );
  
  // Convert bytes to hex string
  return digest.map(byte => {
    const hex = (byte & 0xFF).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

/**
 * Verify a password against a hash
 * @param {string} password - Plain text password
 * @param {string} hash - Hashed password
 * @returns {boolean} True if match
 */
function verifyPassword(password, hash) {
  return hashPassword(password) === hash;
}

/**
 * Authenticate a user with username/email and password
 * @param {string} usernameOrEmail - Username or email
 * @param {string} password - Plain text password
 * @returns {Object} Response with user data and session token
 */
function login(usernameOrEmail, password) {
  try {
    // Input validation
    if (!usernameOrEmail || !password) {
      return formatError('Username/email and password are required');
    }
    
    // Get user from database
    const users = getTableData(DB_CONFIG.SHEET_NAMES.USERS);
    const user = users.find(u => 
      u.username === usernameOrEmail || u.email === usernameOrEmail
    );
    
    if (!user) {
      // Log failed attempt
      logSecurityEvent('LOGIN_FAILED', null, `Invalid username/email: ${usernameOrEmail}`);
      return formatError('Invalid username/email or password');
    }
    
    // Check if user is active
    if (!user.is_active) {
      logSecurityEvent('LOGIN_FAILED', user.user_id, 'Account is inactive');
      return formatError('Your account is inactive. Please contact an administrator.');
    }
    
    // Check active period
    const now = new Date();
    if (user.active_from && new Date(user.active_from) > now) {
      return formatError('Your account is not yet active');
    }
    if (user.active_until && new Date(user.active_until) < now) {
      return formatError('Your account has expired');
    }
    
    // Verify password
    if (!verifyPassword(password, user.password_hash)) {
      // Increment failed login attempts
      incrementFailedLoginAttempts(user.user_id);
      logSecurityEvent('LOGIN_FAILED', user.user_id, 'Invalid password');
      return formatError('Invalid username/email or password');
    }
    
    // Check if account is locked
    if (isAccountLocked(user.user_id)) {
      return formatError('Account is locked due to too many failed login attempts. Please try again later.');
    }
    
    // Get user role and permissions
    const role = getUserRole(user.role_id);
    if (!role) {
      return formatError('User role not found');
    }
    
    // Create session token
    const sessionToken = createSessionToken(user.user_id);
    
    // Update last login
    updateLastLogin(user.user_id);
    
    // Reset failed attempts
    resetFailedLoginAttempts(user.user_id);
    
    // Log successful login
    logSecurityEvent('LOGIN_SUCCESS', user.user_id, 'Login successful');
    
    return formatSuccess({
      user: {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        role: {
          role_id: role.role_id,
          role_name: role.role_name,
          role_code: role.role_code,
          permissions: JSON.parse(role.permissions || '{}')
        }
      },
      sessionToken: sessionToken,
      expiresAt: new Date(Date.now() + getConfig('SESSION.TIMEOUT_MINUTES') * 60 * 1000)
    }, 'Login successful');
    
  } catch (e) {
    Logger.log(`Login error: ${e}`);
    return formatError('An error occurred during login', e);
  }
}

/**
 * Logout a user
 * @param {string} sessionToken - Session token
 * @returns {Object} Response
 */
function logout(sessionToken) {
  try {
    deleteSessionToken(sessionToken);
    return formatSuccess(null, 'Logged out successfully');
  } catch (e) {
    Logger.log(`Logout error: ${e}`);
    return formatError('An error occurred during logout', e);
  }
}

/**
 * Get current user from session token
 * @param {string} sessionToken - Session token
 * @returns {Object} User object or null
 */
function getCurrentUser(sessionToken) {
  try {
    if (!sessionToken) return null;
    
    const userId = validateSessionToken(sessionToken);
    if (!userId) return null;
    
    const users = getTableData(DB_CONFIG.SHEET_NAMES.USERS);
    const user = users.find(u => u.user_id === userId);
    
    if (!user) return null;
    
    const role = getUserRole(user.role_id);
    
    return {
      user_id: user.user_id,
      username: user.username,
      email: user.email,
      full_name: user.full_name,
      role: {
        role_id: role.role_id,
        role_name: role.role_name,
        role_code: role.role_code,
        permissions: JSON.parse(role.permissions || '{}')
      }
    };
  } catch (e) {
    Logger.log(`Get current user error: ${e}`);
    return null;
  }
}

/**
 * Check if user has permission for an action
 * @param {string} sessionToken - Session token
 * @param {string} module - Module name (e.g., 'users', 'kpi')
 * @param {string} action - Action (create, read, update, delete)
 * @returns {boolean} True if has permission
 */
function hasPermission(sessionToken, module, action) {
  try {
    const user = getCurrentUser(sessionToken);
    if (!user) return false;
    
    const permissions = user.role.permissions;
    return permissions[module] && permissions[module][action] === true;
  } catch (e) {
    Logger.log(`Permission check error: ${e}`);
    return false;
  }
}

/**
 * Require authentication - throws error if not authenticated
 * @param {string} sessionToken - Session token
 * @returns {Object} Current user
 */
function requireAuth(sessionToken) {
  const user = getCurrentUser(sessionToken);
  if (!user) {
    throw new Error('UNAUTHORIZED: Please log in');
  }
  return user;
}

/**
 * Require specific permission - throws error if not authorized
 * @param {string} sessionToken - Session token
 * @param {string} module - Module name
 * @param {string} action - Action
 * @returns {Object} Current user
 */
function requirePermission(sessionToken, module, action) {
  const user = requireAuth(sessionToken);
  
  if (!hasPermission(sessionToken, module, action)) {
    throw new Error(`FORBIDDEN: You do not have permission to ${action} ${module}`);
  }
  
  return user;
}

// ===== Session Management =====

/**
 * Create a session token
 * @param {string} userId - User ID
 * @returns {string} Session token
 */
function createSessionToken(userId) {
  const token = generateUUID();
  const expiresAt = new Date(Date.now() + getConfig('SESSION.TIMEOUT_MINUTES') * 60 * 1000);
  
  const cache = CacheService.getUserCache();
  cache.put(`session_${token}`, userId, getConfig('SESSION.TIMEOUT_MINUTES') * 60);
  
  return token;
}

/**
 * Validate a session token
 * @param {string} token - Session token
 * @returns {string|null} User ID or null if invalid
 */
function validateSessionToken(token) {
  if (!token) return null;
  
  const cache = CacheService.getUserCache();
  const userId = cache.get(`session_${token}`);
  
  // Refresh session timeout on activity
  if (userId) {
    cache.put(`session_${token}`, userId, getConfig('SESSION.TIMEOUT_MINUTES') * 60);
  }
  
  return userId;
}

/**
 * Delete a session token
 * @param {string} token - Session token
 */
function deleteSessionToken(token) {
  const cache = CacheService.getUserCache();
  cache.remove(`session_${token}`);
}

// ===== Helper Functions =====

/**
 * Get user role
 * @param {string} roleId - Role ID
 * @returns {Object} Role object
 */
function getUserRole(roleId) {
  const roles = getTableData(DB_CONFIG.SHEET_NAMES.ROLES);
  return roles.find(r => r.role_id === roleId);
}

/**
 * Update last login timestamp
 * @param {string} userId - User ID
 */
function updateLastLogin(userId) {
  updateRecord(
    DB_CONFIG.SHEET_NAMES.USERS,
    'user_id',
    userId,
    { last_login: new Date() }
  );
}

/**
 * Increment failed login attempts
 * @param {string} userId - User ID
 */
function incrementFailedLoginAttempts(userId) {
  const cache = CacheService.getUserCache();
  const key = `failed_attempts_${userId}`;
  const attempts = parseInt(cache.get(key) || '0') + 1;
  
  // Store for lockout duration
  cache.put(key, String(attempts), getConfig('SESSION.LOCKOUT_DURATION_MINUTES') * 60);
}

/**
 * Reset failed login attempts
 * @param {string} userId - User ID
 */
function resetFailedLoginAttempts(userId) {
  const cache = CacheService.getUserCache();
  cache.remove(`failed_attempts_${userId}`);
}

/**
 * Check if account is locked
 * @param {string} userId - User ID
 * @returns {boolean} True if locked
 */
function isAccountLocked(userId) {
  const cache = CacheService.getUserCache();
  const attempts = parseInt(cache.get(`failed_attempts_${userId}`) || '0');
  return attempts >= getConfig('SESSION.MAX_LOGIN_ATTEMPTS');
}

/**
 * Log security events
 * @param {string} eventType - Event type
 * @param {string} userId - User ID (can be null)
 * @param {string} details - Event details
 */
function logSecurityEvent(eventType, userId, details) {
  Logger.log(`SECURITY [${eventType}] User: ${userId || 'N/A'} - ${details}`);
  
  // You can also log to a separate security log sheet if needed
  // This is just a basic implementation using Logger
}

/**
 * Change user password
 * @param {string} sessionToken - Session token
 * @param {string} oldPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Object} Response
 */
function changePassword(sessionToken, oldPassword, newPassword) {
  try {
    const user = requireAuth(sessionToken);
    
    // Get full user record
    const users = getTableData(DB_CONFIG.SHEET_NAMES.USERS);
    const userRecord = users.find(u => u.user_id === user.user_id);
    
    // Verify old password
    if (!verifyPassword(oldPassword, userRecord.password_hash)) {
      return formatError('Current password is incorrect');
    }
    
    // Validate new password
    const validation = validateUser({ password: newPassword }, false);
    if (!validation.isValid) {
      return formatValidationError(validation.errors);
    }
    
    // Update password
    const newHash = hashPassword(newPassword);
    updateRecord(
      DB_CONFIG.SHEET_NAMES.USERS,
      'user_id',
      user.user_id,
      { password_hash: newHash, updated_at: new Date() }
    );
    
    logSecurityEvent('PASSWORD_CHANGED', user.user_id, 'Password changed successfully');
    
    return formatSuccess(null, 'Password changed successfully');
  } catch (e) {
    Logger.log(`Change password error: ${e}`);
    return formatError('Failed to change password', e);
  }
}
