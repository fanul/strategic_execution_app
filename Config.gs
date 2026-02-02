/**
 * Config.js
 * Central configuration and constants for the Strategic Execution Monitoring application.
 */

const CONFIG = {
  // Application Settings
  APP: {
    NAME: 'Strategic Execution Monitoring',
    VERSION: '1.0.0',
    ENVIRONMENT: 'development' // 'development', 'staging', 'production'
  },

  // Google Drive Configuration
  DRIVE: {
    FOLDER_ID: '1ItoW5btD3xWLSgsmW2v0moi3cK9pYk9Q', // Main folder for database spreadsheet
    BACKUP_FOLDER_ID: null // Set for automated backups
  },

  // Session Configuration
  SESSION: {
    TIMEOUT_MINUTES: 30,
    TOKEN_EXPIRY_HOURS: 24,
    MAX_LOGIN_ATTEMPTS: 5,
    LOCKOUT_DURATION_MINUTES: 15
  },

  // API Configuration
  API: {
    RATE_LIMIT_PER_MINUTE: 60,
    CACHE_DURATION_SECONDS: 300, // 5 minutes
    MAX_RECORDS_PER_PAGE: 100
  },

  // Email Configuration
  EMAIL: {
    FROM_NAME: 'Strategic Execution Monitor',
    ADMIN_EMAIL: 'admin@example.com', // Change to actual admin email
    ENABLE_NOTIFICATIONS: true
  },

  // KPI Thresholds
  KPI: {
    THRESHOLDS: {
      ON_TRACK_MIN: 90,     // ≥90%
      AT_RISK_MIN: 75,      // 75-89%
      OFF_TRACK_MAX: 75,    // <75%
    },
    CALCULATION_TYPES: ['CUMULATIVE', 'AVERAGE', 'MAXIMUM', 'MINIMUM', 'LATEST'],
    MEASUREMENT_PERIODS: ['WEEKLY', 'MONTHLY', 'QUARTERLY', 'ANNUALLY']
  },

  // Validation Rules
  VALIDATION: {
    PASSWORD: {
      MIN_LENGTH: 8,
      REQUIRE_UPPERCASE: true,
      REQUIRE_LOWERCASE: true,
      REQUIRE_NUMBER: true,
      REQUIRE_SPECIAL: true
    },
    USERNAME: {
      MIN_LENGTH: 3,
      PATTERN: /^[a-zA-Z0-9_]+$/
    },
    TEXT_FIELD_MAX_LENGTH: {
      VISION: 1000,
      MISSION: 1500,
      DESCRIPTION: 5000,
      NOTES: 2000
    }
  },

  // Status Enums
  STATUS: {
    GENERAL: ['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'ACTIVE', 'INACTIVE', 'COMPLETED', 'CANCELLED'],
    KPI: ['ON_TRACK', 'AT_RISK', 'OFF_TRACK', 'NOT_STARTED', 'UNKNOWN'],
    ASSIGNMENT: ['ACTIVE', 'ENDED', 'SUSPENDED'],
    APPROVAL: ['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED']
  },

  // Enums for structured data
  ENUMS: {
    POSITION_TYPE: ['HORIZONTAL', 'VERTICAL'],
    POSITION_LEVEL: ['DIRECTOR', 'DEPUTY', 'ASSISTANT_DEPUTY', 'STAFF', 'OTHER'],
    KPI_TYPE: ['OUTCOME', 'OUTPUT', 'INPUT', 'PROCESS'],
    PERSPECTIVE: ['FINANCIAL', 'CUSTOMER', 'INTERNAL_PROCESS', 'LEARNING_GROWTH'],
    ASSESSMENT_TYPE: ['QUANTITATIVE', 'QUALITATIVE'],
    ANALYSIS_TYPE: ['INTERNAL', 'EXTERNAL'],
    ANALYSIS_CATEGORY: ['STRENGTH', 'WEAKNESS', 'OPPORTUNITY', 'THREAT'],
    IMPACT_LEVEL: ['HIGH', 'MEDIUM', 'LOW'],
    NOTIFICATION_TYPE: ['INFO', 'WARNING', 'SUCCESS', 'ERROR'],
    RESPONSIBILITY_LEVEL: ['PRIMARY', 'SUPPORTING', 'INFORMED']
  },

  // Default Roles (System Roles) - Kept for reference, actual roles are in DB
  DEFAULT_ROLES: [
    {
      role_code: 'SUPER_ADMIN',
      role_name: 'Super Administrator',
      description: 'Full system access',
      is_system_role: true
    },
    {
      role_code: 'ADMIN',
      role_name: 'Administrator',
      description: 'Administrative access excluding system settings',
      is_system_role: true
    },
    {
      role_code: 'MANAGER',
      role_name: 'Manager',
      description: 'Can read all data and manage strategic plans and KPIs',
      is_system_role: true
    },
    {
      role_code: 'USER',
      role_name: 'User',
      description: 'Can view own data and edit own OKRs',
      is_system_role: true
    },
    {
      role_code: 'VIEWER',
      role_name: 'Viewer',
      description: 'Read-only access to most data',
      is_system_role: true
    }
  ],

  // Feature Flags
  FEATURES: {
    ENABLE_OKR: true,
    ENABLE_TWO_FACTOR_AUTH: false,
    ENABLE_EMAIL_VERIFICATION: true,
    ENABLE_AUDIT_LOG: true,
    ENABLE_DUMMY_DATA: true // For development/testing
  }
};

// Database Configuration (Global Access)
const DB_CONFIG = {
  SHEET_NAMES: {
    // User Management
    USERS: 'Users',
    ROLES: 'Roles',
    
    // Organization Structure
    DIRECTORATES: 'Directorates',  // DEPRECATED - Use OrganizationalUnits instead
    WORK_UNITS: 'WorkUnits',        // DEPRECATED - Use OrganizationalUnits instead
    AFFAIRS: 'Affairs',            // DEPRECATED - Use OrganizationalUnits instead
    ORGANIZATIONAL_UNITS: 'OrganizationalUnits',  // NEW - Unified organizational structure
    OFFICE_LIFECYCLE_HISTORY: 'OfficeLifecycleHistory',  // NEW - Audit trail for office changes
    POSITIONS: 'Positions',
    POSITION_ASSIGNMENTS: 'PositionAssignments',
    
    // Strategic Planning
    PERIODS: 'Periods',
    VISIONS: 'Visions',
    MISSIONS: 'Missions',
    STRATEGIC_INITIATIVES: 'StrategicInitiatives',
    MISSION_INITIATIVE_MAPPING: 'MissionInitiativeMapping',
    
    // Goals and Analysis
    ORGANIZATIONAL_GOALS: 'OrganizationalGoals',
    IMPACT_CENTERS: 'ImpactCenters',
    IC_MONTHLY_PROGRESS: 'ICMonthlyProgress',
    IC_WORK_UNIT_MAPPING: 'ICWorkUnitMapping',
    ANALYSIS_ITEMS: 'AnalysisItems',
    
    // Work Unit Goals and KPIs
    WORK_UNIT_GOALS: 'WorkUnitGoals',
    KPIS: 'KPIs',
    KPI_MONTHLY_PROGRESS: 'KPIMonthlyProgress',
    
    // Programs and Activities
    PROGRAMS: 'Programs',
    KPI_PROGRAM_MAPPING: 'KPIProgramMapping',
    ACTIVITIES: 'Activities',
    
    // Individual Performance
    INDIVIDUAL_KPIS: 'IndividualKPIs',
    INDIVIDUAL_KPI_MONTHLY_PROGRESS: 'IndividualKPIMonthlyProgress',
    OKRS: 'OKRs',
    
    // System
    REVISIONS: 'Revisions',
    APP_SETTINGS: 'AppSettings',
    NOTIFICATIONS: 'Notifications'
  },
  
  HEADERS: {
    USERS: [
      'user_id', 'username', 'email', 'password_hash', 'full_name', 'role_id',
      'active_from', 'active_until', 'is_active', 'last_login',
      'created_at', 'created_by', 'updated_at', 'updated_by', 'notes'
    ],
    
    ROLES: [
      'role_id', 'role_name', 'role_code', 'description', 'permissions',
      'is_system_role', 'created_at', 'created_by', 'updated_at', 'updated_by'
    ],
    
    DIRECTORATES: [
      'directorate_id', 'directorate_code', 'directorate_name', 'description',
      'director_position_id', 'active_from', 'active_until', 'is_active',
      'sort_order', 'created_at', 'created_by', 'updated_at', 'updated_by', 'notes'
    ],
    
    WORK_UNITS: [
      'work_unit_id', 'directorate_id', 'work_unit_code', 'work_unit_name',
      'description', 'deputy_position_id', 'active_from', 'active_until',
      'is_active', 'sort_order', 'created_at', 'created_by', 'updated_at', 'updated_by', 'notes'
    ],
    
    AFFAIRS: [
      'affair_id', 'work_unit_id', 'affair_code', 'affair_name', 'description',
      'assistant_deputy_position_id', 'active_from', 'active_until', 'is_active',
      'sort_order', 'created_at', 'created_by', 'updated_at', 'updated_by', 'notes'
    ],

    ORGANIZATIONAL_UNITS: [
      'unit_id', 'unit_type', 'parent_unit_id', 'unit_code', 'unit_name',
      'unit_level', 'classification', 'geographical_scope', 'province', 'city',
      'address', 'head_position_id', 'active_from', 'active_until', 'is_active',
      'lifecycle_status', 'closed_date', 'closure_reason', 'merged_into_unit_id',
      'split_from_unit_id', 'previous_classification', 'created_at', 'created_by',
      'updated_at', 'updated_by', 'notes'
    ],

    OFFICE_LIFECYCLE_HISTORY: [
      'history_id', 'unit_id', 'event_type', 'event_date', 'event_reason',
      'previous_status', 'new_status', 'previous_classification', 'new_classification',
      'related_unit_id', 'performed_by', 'supporting_documents', 'notes', 'created_at'
    ],

    POSITIONS: [
      'position_id', 'position_code', 'position_name', 'position_type', 'position_level',
      'parent_position_id', 'directorate_id', 'work_unit_id', 'affair_id',
      'organizational_context', 'branch_classification', 'unit_id',
      'description', 'responsibilities', 'active_from', 'active_until', 'is_active',
      'sort_order', 'created_at', 'created_by', 'updated_at', 'updated_by', 'notes'
    ],
    
    POSITION_ASSIGNMENTS: [
      'assignment_id', 'user_id', 'position_id', 'assignment_date', 'start_date',
      'end_date', 'is_primary', 'assignment_status', 'assignment_letter_number',
      'created_at', 'created_by', 'updated_at', 'updated_by', 'notes'
    ],
    
    PERIODS: [
      'period_id', 'period_code', 'start_year', 'end_year', 'description',
      'is_active', 'created_at', 'created_by', 'updated_at', 'updated_by', 'notes'
    ],
    
    VISIONS: [
      'vision_id', 'period_id', 'vision_code', 'vision_text', 'description',
      'created_at', 'created_by', 'updated_at', 'updated_by',
      'approval_status', 'approved_by', 'approved_at', 'notes'
    ],
    
    MISSIONS: [
      'mission_id', 'vision_id', 'mission_code', 'mission_text', 'mission_order',
      'description', 'created_at', 'created_by', 'updated_at', 'updated_by',
      'approval_status', 'approved_by', 'approved_at', 'notes'
    ],
    
    STRATEGIC_INITIATIVES: [
      'initiative_id', 'year', 'theme_code', 'theme_name', 'target_description',
      'description', 'budget_allocated', 'created_at', 'created_by',
      'updated_at', 'updated_by', 'status', 'notes'
    ],
    
    MISSION_INITIATIVE_MAPPING: [
      'mapping_id', 'mission_id', 'initiative_id', 'relationship_type',
      'weight_percentage', 'created_at', 'created_by', 'notes'
    ],
    
    ORGANIZATIONAL_GOALS: [
      'goal_id', 'year', 'goal_code', 'goal_name', 'goal_description',
      'target_description', 'created_at', 'created_by', 'updated_at',
      'updated_by', 'status', 'notes'
    ],
    
    IMPACT_CENTERS: [
      'ic_id', 'goal_id', 'ic_code', 'ic_name', 'description', 'formula',
      'deliverable', 'completion_percentage', 'baseline_value', 'target_value',
      'created_at', 'created_by', 'updated_at', 'updated_by', 'status', 'notes'
    ],
    
    IC_MONTHLY_PROGRESS: [
      'progress_id', 'ic_id', 'year', 'month', 'completion_percentage',
      'actual_value', 'notes', 'evidence_url', 'reported_by', 'reported_at',
      'verified_by', 'verified_at', 'status'
    ],
    
    IC_WORK_UNIT_MAPPING: [
      'mapping_id', 'ic_id', 'work_unit_id', 'responsibility_level',
      'weight_percentage', 'created_at', 'created_by', 'notes'
    ],
    
    ANALYSIS_ITEMS: [
      'analysis_id', 'goal_id', 'analysis_type', 'analysis_category',
      'analysis_code', 'title', 'description', 'impact_level', 'priority',
      'created_at', 'created_by', 'updated_at', 'updated_by', 'notes'
    ],
    
    WORK_UNIT_GOALS: [
      'work_unit_goal_id', 'goal_id', 'work_unit_id', 'goal_code', 'goal_name',
      'goal_description', 'target_description', 'created_at', 'created_by',
      'updated_at', 'updated_by', 'status', 'notes'
    ],
    
    KPIS: [
      'kpi_id', 'work_unit_goal_id', 'kpi_code', 'year', 'directorate_id',
      'work_unit_id', 'kpi_type', 'perspective', 'goal_id', 'kpi_name',
      'weight_percentage', 'target_value', 'unit_of_measurement', 'assessment_type',
      'calculation_type', 'glossary', 'is_derived_kpi', 'parent_kpi_id',
      'maximum_limit', 'measurement_period', 'baseline_value',
      'created_at', 'created_by', 'updated_at', 'updated_by', 'status', 'notes'
    ],
    
    KPI_MONTHLY_PROGRESS: [
      'progress_id', 'kpi_id', 'year', 'month', 'actual_value',
      'achievement_percentage', 'notes', 'evidence_url', 'reported_by',
      'reported_at', 'verified_by', 'verified_at', 'status'
    ],
    
    PROGRAMS: [
      'program_id', 'work_unit_goal_id', 'program_code', 'program_name',
      'program_description', 'start_date', 'end_date', 'budget_allocated',
      'budget_spent', 'created_at', 'created_by', 'updated_at', 'updated_by',
      'status', 'notes'
    ],
    
    KPI_PROGRAM_MAPPING: [
      'mapping_id', 'kpi_id', 'program_id', 'contribution_weight',
      'created_at', 'created_by', 'notes'
    ],
    
    ACTIVITIES: [
      'activity_id', 'program_id', 'activity_code', 'activity_name',
      'activity_description', 'unit_price', 'quantity', 'total_cost',
      'unit_of_measurement', 'start_date', 'end_date', 'responsible_position_id',
      'created_at', 'created_by', 'updated_at', 'updated_by', 'status',
      'completion_percentage', 'notes'
    ],
    
    INDIVIDUAL_KPIS: [
      'individual_kpi_id', 'activity_id', 'kpi_code', 'year', 'directorate_id',
      'work_unit_id', 'position_id', 'kpi_type', 'perspective', 'goal_id',
      'kpi_name', 'weight_percentage', 'target_value', 'unit_of_measurement',
      'assessment_type', 'calculation_type', 'glossary', 'is_derived_kpi',
      'parent_kpi_id', 'maximum_limit', 'measurement_period', 'baseline_value',
      'created_at', 'created_by', 'updated_at', 'updated_by', 'status', 'notes'
    ],
    
    INDIVIDUAL_KPI_MONTHLY_PROGRESS: [
      'progress_id', 'individual_kpi_id', 'year', 'month', 'actual_value',
      'achievement_percentage', 'notes', 'evidence_url', 'reported_by',
      'reported_at', 'verified_by', 'verified_at', 'status'
    ],
    
    OKRS: [
      'okr_id', 'user_id', 'position_id', 'year', 'quarter', 'week_number',
      'week_start_date', 'week_end_date', 'objective_text', 'key_result_1',
      'key_result_1_progress', 'key_result_2', 'key_result_2_progress',
      'key_result_3', 'key_result_3_progress', 'overall_progress',
      'challenges', 'support_needed', 'created_at', 'updated_at',
      'submitted_at', 'reviewed_by', 'reviewed_at', 'review_notes', 'status', 'notes'
    ],
    
    REVISIONS: [
      'revision_id', 'entity_type', 'entity_id', 'field_name', 'old_value',
      'new_value', 'change_type', 'changed_by', 'changed_at', 'reason',
      'ip_address', 'user_agent'
    ],
    
    APP_SETTINGS: [
      'setting_id', 'setting_key', 'setting_value', 'setting_category',
      'description', 'is_editable', 'updated_by', 'updated_at'
    ],
    
    NOTIFICATIONS: [
      'notification_id', 'user_id', 'title', 'message', 'type',
      'related_entity_type', 'related_entity_id', 'is_read', 'created_at'
    ]
  }
};

/**
 * Get configuration value by path (e.g., 'APP.NAME')
 * @param {string} path - Dot-notation path to config value
 * @returns {any} Configuration value
 */
function getConfig(path) {
  return path.split('.').reduce((obj, key) => obj?.[key], CONFIG);
}

/**
 * Set configuration value (use cautiously, primarily for runtime updates)
 * @param {string} path - Dot-notation path
 * @param {any} value - Value to set
 */
function setConfig(path, value) {
  const keys = path.split('.');
  const lastKey = keys.pop();
  const target = keys.reduce((obj, key) => obj[key] = obj[key] || {}, CONFIG);
  target[lastKey] = value;
}
