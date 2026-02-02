/**
 * Services/ValidationService.js
 * Handles all input validation across the application.
 */

/**
 * Validate user input data
 * @param {Object} data - User data object
 * @param {boolean} isUpdate - Whether this is an update (some fields optional)
 * @returns {Object} Validation result {isValid, errors}
 */
function validateUser(data, isUpdate = false) {
  const errors = {};
  
  // Username validation
  if (!isUpdate || data.username) {
    if (!data.username || data.username.trim().length === 0) {
      errors.username = 'Username is required';
    } else if (!isValidUsername(data.username)) {
      const config = getConfig('VALIDATION.USERNAME');
      errors.username = `Username must be at least ${config.MIN_LENGTH} characters and contain only letters, numbers, and underscores`;
    }
  }
  
  // Email validation
  if (!isUpdate || data.email) {
    if (!data.email || data.email.trim().length === 0) {
      errors.email = 'Email is required';
    } else if (!isValidEmail(data.email)) {
      errors.email = 'Invalid email format';
    }
  }
  
  // Password validation (only for new users or password changes)
  if (!isUpdate && data.password) {
    const pwdConfig = getConfig('VALIDATION.PASSWORD');
    if (data.password.length < pwdConfig.MIN_LENGTH) {
      errors.password = `Password must be at least ${pwdConfig.MIN_LENGTH} characters`;
    } else {
      if (pwdConfig.REQUIRE_UPPERCASE && !/[A-Z]/.test(data.password)) {
        errors.password = 'Password must contain at least one uppercase letter';
      }
      if (pwdConfig.REQUIRE_LOWERCASE && !/[a-z]/.test(data.password)) {
        errors.password = 'Password must contain at least one lowercase letter';
      }
      if (pwdConfig.REQUIRE_NUMBER && !/[0-9]/.test(data.password)) {
        errors.password = 'Password must contain at least one number';
      }
      if (pwdConfig.REQUIRE_SPECIAL && !/[^A-Za-z0-9]/.test(data.password)) {
        errors.password = 'Password must contain at least one special character';
      }
    }
  }
  
  // Full name validation
  if (!isUpdate || data.full_name) {
    if (!data.full_name || data.full_name.trim().length === 0) {
      errors.full_name = 'Full name is required';
    }
  }
  
  // Role ID validation
  if (!isUpdate || data.role_id) {
    if (!data.role_id) {
      errors.role_id = 'Role is required';
    }
  }
  
  // Date validation
  if (data.active_from && !isValidDateString(data.active_from)) {
    errors.active_from = 'Invalid date format (use YYYY-MM-DD)';
  }
  
  if (data.active_until && !isValidDateString(data.active_until)) {
    errors.active_until = 'Invalid date format (use YYYY-MM-DD)';
  }
  
  // Date range validation
  if (data.active_from && data.active_until) {
    if (isDateAfter(data.active_from, data.active_until)) {
      errors.active_until = 'End date must be after start date';
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors: errors
  };
}

/**
 * Validate directorate data
 * @param {Object} data - Directorate data
 * @param {boolean} isUpdate - Whether this is an update
 * @returns {Object} Validation result
 */
function validateDirectorate(data, isUpdate = false) {
  const errors = {};
  
  if (!isUpdate || data.directorate_name) {
    if (!data.directorate_name || data.directorate_name.trim().length === 0) {
      errors.directorate_name = 'Directorate name is required';
    }
  }
  
  if (!isUpdate || data.directorate_code) {
    if (!data.directorate_code || data.directorate_code.trim().length === 0) {
      errors.directorate_code = 'Directorate code is required';
    }
  }
  
  // Date validations
  if (data.active_from && !isValidDateString(data.active_from)) {
    errors.active_from = 'Invalid date format';
  }
  
  if (data.active_until && !isValidDateString(data.active_until)) {
    errors.active_until = 'Invalid date format';
  }
  
  if (data.active_from && data.active_until && isDateAfter(data.active_from, data.active_until)) {
    errors.active_until = 'End date must be after start date';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors: errors
  };
}

/**
 * Validate KPI data
 * @param {Object} data - KPI data
 * @param {boolean} isUpdate - Whether this is an update
 * @returns {Object} Validation result
 */
function validateKPI(data, isUpdate = false) {
  const errors = {};
  
  // Required fields
  const requiredFields = ['kpi_name', 'kpi_type', 'perspective', 'target_value', 'unit_of_measurement', 'assessment_type', 'calculation_type'];
  
  requiredFields.forEach(field => {
    if (!isUpdate || data[field] !== undefined) {
      if (!data[field] || (typeof data[field] === 'string' && data[field].trim().length === 0)) {
        errors[field] = `${field.replace(/_/g, ' ')} is required`;
      }
    }
  });
  
  // Enum validations
  if (data.kpi_type && !getConfig('ENUMS.KPI_TYPE').includes(data.kpi_type)) {
    errors.kpi_type = 'Invalid KPI type';
  }
  
  if (data.perspective && !getConfig('ENUMS.PERSPECTIVE').includes(data.perspective)) {
    errors.perspective = 'Invalid perspective';
  }
  
  if (data.assessment_type && !getConfig('ENUMS.ASSESSMENT_TYPE').includes(data.assessment_type)) {
    errors.assessment_type = 'Invalid assessment type';
  }
  
  if (data.calculation_type && !getConfig('KPI.CALCULATION_TYPES').includes(data.calculation_type)) {
    errors.calculation_type = 'Invalid calculation type';
  }
  
  // Numeric validations
  if (data.weight_percentage !== undefined) {
    const weight = parseFloat(data.weight_percentage);
    if (isNaN(weight) || weight < 0 || weight > 100) {
      errors.weight_percentage = 'Weight must be between 0 and 100';
    }
  }
  
  if (data.target_value !== undefined) {
    const target = parseFloat(data.target_value);
    if (isNaN(target)) {
      errors.target_value = 'Target value must be a number';
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors: errors
  };
}

/**
 * Validate goal data
 * @param {Object} data - Goal data
 * @param {boolean} isUpdate - Whether this is an update
 * @returns {Object} Validation result
 */
function validateGoal(data, isUpdate = false) {
  const errors = {};
  
  if (!isUpdate || data.goal_name) {
    if (!data.goal_name || data.goal_name.trim().length === 0) {
      errors.goal_name = 'Goal name is required';
    }
  }
  
  if (data.start_date && !isValidDateString(data.start_date)) {
    errors.start_date = 'Invalid date format';
  }
  
  if (data.end_date && !isValidDateString(data.end_date)) {
    errors.end_date = 'Invalid date format';
  }
  
  if (data.start_date && data.end_date && isDateAfter(data.start_date, data.end_date)) {
    errors.end_date = 'End date must be after start date';
  }
  
  // Text length validation
  const maxLengths = getConfig('VALIDATION.TEXT_FIELD_MAX_LENGTH');
  if (data.goal_description && data.goal_description.length > maxLengths.DESCRIPTION) {
    errors.goal_description = `Description must not exceed ${maxLengths.DESCRIPTION} characters`;
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors: errors
  };
}

/**
 * Validate program data
 * @param {Object} data - Program data
 * @param {boolean} isUpdate - Whether this is an update
 * @returns {Object} Validation result
 */
function validateProgram(data, isUpdate = false) {
  const errors = {};
  
  if (!isUpdate || data.program_name) {
    if (!data.program_name || data.program_name.trim().length === 0) {
      errors.program_name = 'Program name is required';
    }
  }
  
  if (data.start_date && !isValidDateString(data.start_date)) {
    errors.start_date = 'Invalid date format';
  }
  
  if (data.end_date && !isValidDateString(data.end_date)) {
    errors.end_date = 'Invalid date format';
  }
  
  if (data.start_date && data.end_date && isDateAfter(data.start_date, data.end_date)) {
    errors.end_date = 'End date must be after start date';
  }
  
  if (data.budget_allocated !== undefined) {
    const budget = parseFloat(data.budget_allocated);
    if (isNaN(budget) || budget < 0) {
      errors.budget_allocated = 'Budget must be a positive number';
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors: errors
  };
}

/**
 * Validate OKR data
 * @param {Object} data - OKR data
 * @param {boolean} isUpdate - Whether this is an update
 * @returns {Object} Validation result
 */
function validateOKR(data, isUpdate = false) {
  const errors = {};
  
  if (!isUpdate || data.objective_text) {
    if (!data.objective_text || data.objective_text.trim().length === 0) {
      errors.objective_text = 'Objective is required';
    }
  }
  
  if (!isUpdate || data.key_result_1) {
    if (!data.key_result_1 || data.key_result_1.trim().length === 0) {
      errors.key_result_1 = 'At least one key result is required';
    }
  }
  
  // Progress validations
  ['key_result_1_progress', 'key_result_2_progress', 'key_result_3_progress'].forEach(field => {
    if (data[field] !== undefined && data[field] !== '') {
      const progress = parseFloat(data[field]);
      if (isNaN(progress) || progress < 0 || progress > 100) {
        errors[field] = 'Progress must be between 0 and 100';
      }
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors: errors
  };
}

/**
 * Check for duplicate values in a sheet
 * @param {string} sheetName - Sheet name
 * @param {string} field - Field name to check
 * @param {string} value - Value to check
 * @param {string} excludeId - ID to exclude (for updates)
 * @returns {boolean} True if duplicate found
 */
function isDuplicate(sheetName, field, value, excludeId = null) {
  try {
    const data = getTableData(sheetName);
    const idField = Object.keys(data[0] || {})[0]; // First column is usually ID
    
    for (let record of data) {
      if (record[field] === value && (!excludeId || record[idField] !== excludeId)) {
        return true;
      }
    }
    
    return false;
  } catch (e) {
    Logger.log(`Error checking duplicate: ${e}`);
    return false;
  }
}

/**
 * Check if a foreign key exists
 * @param {string} sheetName - Sheet name
 * @param {string} idField - ID field name
 * @param {string} idValue - ID value to check
 * @returns {boolean} True if exists
 */
function foreignKeyExists(sheetName, idField, idValue) {
  try {
    const data = getTableData(sheetName);
    return data.some(record => record[idField] === idValue);
  } catch (e) {
    Logger.log(`Error checking foreign key: ${e}`);
    return false;
  }
}

/**
 * Sanitize all fields in an object
 * @param {Object} data - Data object
 * @returns {Object} Sanitized data
 */
function sanitizeData(data) {
  const sanitized = {};

  for (let key in data) {
    if (typeof data[key] === 'string') {
      sanitized[key] = sanitizeInput(data[key]);
    } else {
      sanitized[key] = data[key];
    }
  }

  return sanitized;
}

/**
 * Validate Impact Center data
 * @param {Object} data - Impact Center data
 * @param {boolean} isUpdate - Whether this is an update
 * @returns {Object} Validation result
 */
function validateImpactCenter(data, isUpdate = false) {
  const errors = {};

  if (!isUpdate || data.ic_name) {
    if (!data.ic_name || data.ic_name.trim().length === 0) {
      errors.ic_name = 'Impact Center name is required';
    }
  }

  if (!isUpdate || data.goal_id) {
    if (!data.goal_id) {
      errors.goal_id = 'Goal ID is required';
    }
  }

  if (!isUpdate || data.deliverable) {
    if (!data.deliverable || data.deliverable.trim().length === 0) {
      errors.deliverable = 'Deliverable is required';
    }
  }

  if (!isUpdate || data.ic_code) {
    if (!data.ic_code || data.ic_code.trim().length === 0) {
      errors.ic_code = 'IC code is required';
    }
  }

  // Numeric validations
  if (data.baseline_value !== undefined && data.baseline_value !== null && data.baseline_value !== '') {
    const baseline = parseFloat(data.baseline_value);
    if (isNaN(baseline)) {
      errors.baseline_value = 'Baseline value must be a number';
    }
  }

  if (data.target_value !== undefined && data.target_value !== null && data.target_value !== '') {
    const target = parseFloat(data.target_value);
    if (isNaN(target)) {
      errors.target_value = 'Target value must be a number';
    }
  }

  // Completion percentage validation (if provided)
  if (data.completion_percentage !== undefined && data.completion_percentage !== null && data.completion_percentage !== '') {
    const completion = parseFloat(data.completion_percentage);
    if (isNaN(completion) || completion < 0 || completion > 100) {
      errors.completion_percentage = 'Completion percentage must be between 0 and 100';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors: errors
  };
}
