/**
 * API Client for Strategic Execution Monitoring Application
 * Centralized API communication layer with error handling, caching, and retry logic
 */

// ============================================================================
// API CLIENT CLASS
// ============================================================================

class APIClient {
    constructor() {
        this.baseURL = window.location.href; // Google Apps Script URL
        this.timeout = 30000; // 30 seconds
        this.retryAttempts = 3;
        this.retryDelay = 1000; // 1 second
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
        this.requestQueue = [];
        this.isProcessingQueue = false;
    }

    // ========================================================================
    // CORE API METHODS
    // ========================================================================

    /**
     * Make API call to backend
     * @param {string} endpoint - API endpoint (e.g., 'users/list')
     * @param {object} data - Request data
     * @param {object} options - Additional options
     * @returns {Promise} API response
     */
    async call(endpoint, data = {}, options = {}) {
        const {
            method = 'POST',
            timeout = this.timeout,
            useCache = false,
            showLoading = true,
            retryCount = 0
        } = options;

        // Check cache
        if (useCache && this.cache.has(endpoint)) {
            const cached = this.cache.get(endpoint);
            if (Date.now() - cached.timestamp < this.cacheTimeout) {
                console.log(`[API Cache] Using cached response for ${endpoint}`);
                return cached.data;
            }
        }

        // Show loading indicator
        if (showLoading) {
            this.showLoading();
        }

        try {
            const response = await this._makeCall(endpoint, data, timeout);

            // Cache successful responses
            if (useCache && response.success) {
                this.cache.set(endpoint, {
                    data: response,
                    timestamp: Date.now()
                });
            }

            return response;

        } catch (error) {
            console.error(`[API Error] ${endpoint}:`, error);

            // Retry on failure
            if (retryCount < this.retryAttempts) {
                console.log(`[API Retry] Attempt ${retryCount + 1}/${this.retryAttempts}`);
                await this._delay(this.retryDelay * (retryCount + 1));
                return this.call(endpoint, data, { ...options, retryCount: retryCount + 1 });
            }

            // Return error response
            return {
                success: false,
                message: error.message || 'An error occurred',
                error: error,
                data: null
            };

        } finally {
            if (showLoading) {
                this.hideLoading();
            }
        }
    }

    /**
     * Internal method to make Google Apps Script call
     * @private
     */
    _makeCall(endpoint, data, timeout) {
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                reject(new Error('Request timeout'));
            }, timeout);

            google.script.run
                .withSuccessHandler(response => {
                    clearTimeout(timer);
                    resolve(response);
                })
                .withFailureHandler(error => {
                    clearTimeout(timer);
                    reject(error);
                })
                .callAPI(endpoint, data);
        });
    }

    /**
     * Delay helper
     * @private
     */
    _delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // ========================================================================
    // HTTP METHOD HELPERS
    // ========================================================================

    /**
     * GET request
     */
    async get(endpoint, params = {}, options = {}) {
        return this.call(endpoint, params, { ...options, method: 'GET' });
    }

    /**
     * POST request
     */
    async post(endpoint, data = {}, options = {}) {
        return this.call(endpoint, data, { ...options, method: 'POST' });
    }

    /**
     * PUT request
     */
    async put(endpoint, data = {}, options = {}) {
        return this.call(endpoint, data, { ...options, method: 'PUT' });
    }

    /**
     * DELETE request
     */
    async delete(endpoint, data = {}, options = {}) {
        return this.call(endpoint, data, { ...options, method: 'DELETE' });
    }

    // ========================================================================
    // LOADING INDICATORS
    // ========================================================================

    showLoading(message = 'Loading...') {
        // Show global loading spinner
        let loader = document.getElementById('global-loader');
        if (!loader) {
            loader = document.createElement('div');
            loader.id = 'global-loader';
            loader.className = 'global-loading-overlay';
            loader.innerHTML = `
                <div class="global-loading-spinner">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <div class="loading-message">${message}</div>
                </div>
            `;
            document.body.appendChild(loader);
        } else {
            loader.querySelector('.loading-message').textContent = message;
        }
        loader.style.display = 'flex';
    }

    hideLoading() {
        const loader = document.getElementById('global-loader');
        if (loader) {
            loader.style.display = 'none';
        }
    }

    // ========================================================================
    // CACHE MANAGEMENT
    // ========================================================================

    clearCache(endpoint = null) {
        if (endpoint) {
            this.cache.delete(endpoint);
        } else {
            this.cache.clear();
        }
    }

    // ========================================================================
    // REQUEST QUEUE
    // ========================================================================

    queueRequest(endpoint, data, options) {
        return new Promise((resolve, reject) => {
            this.requestQueue.push({ endpoint, data, options, resolve, reject });
            this._processQueue();
        });
    }

    async _processQueue() {
        if (this.isProcessingQueue || this.requestQueue.length === 0) {
            return;
        }

        this.isProcessingQueue = true;

        while (this.requestQueue.length > 0) {
            const request = this.requestQueue.shift();
            try {
                const response = await this.call(request.endpoint, request.data, request.options);
                request.resolve(response);
            } catch (error) {
                request.reject(error);
            }
        }

        this.isProcessingQueue = false;
    }
}

// ============================================================================
// API ENDPOINTS - ORGANIZED BY MODULE
// ============================================================================

class API {
    constructor() {
        this.client = new APIClient();
    }

    // ========================================================================
    // AUTHENTICATION
    // ========================================================================

    auth = {
        // Login
        login: (username, password) => {
            return this.client.post('auth/login', { username, password });
        },

        // Logout
        logout: () => {
            return this.client.post('auth/logout', {});
        },

        // Get current user
        me: () => {
            return this.client.get('auth/me', {});
        },

        // Change password
        changePassword: (oldPassword, newPassword) => {
            return this.client.post('auth/change-password', {
                old_password: oldPassword,
                new_password: newPassword
            });
        },

        // Reset password
        resetPassword: (email) => {
            return this.client.post('auth/reset-password', { email });
        },

        // Verify token
        verifyToken: (token) => {
            return this.client.post('auth/verify', { token });
        }
    };

    // ========================================================================
    // USERS
    // ========================================================================

    users = {
        // List all users
        list: (filters = {}) => {
            return this.client.get('users/list', filters, { useCache: true });
        },

        // Get user by ID
        get: (userId) => {
            return this.client.get('users/get', { user_id: userId });
        },

        // Create user
        create: (userData) => {
            return this.client.post('users/create', userData);
        },

        // Update user
        update: (userId, userData) => {
            return this.client.put('users/update', { user_id: userId, ...userData });
        },

        // Delete user
        delete: (userId) => {
            return this.client.delete('users/delete', { user_id: userId });
        },

        // Activate/deactivate user
        toggleStatus: (userId, isActive) => {
            return this.client.put('users/toggle-status', { user_id: userId, is_active: isActive });
        },

        // Bulk import users
        bulkImport: (users) => {
            return this.client.post('users/bulk-import', { users });
        }
    };

    // ========================================================================
    // ROLES
    // ========================================================================

    roles = {
        // List all roles
        list: () => {
            return this.client.get('roles/list', {}, { useCache: true });
        },

        // Get role by ID
        get: (roleId) => {
            return this.client.get('roles/get', { role_id: roleId });
        },

        // Create role
        create: (roleData) => {
            return this.client.post('roles/create', roleData);
        },

        // Update role
        update: (roleId, roleData) => {
            return this.client.put('roles/update', { role_id: roleId, ...roleData });
        },

        // Delete role
        delete: (roleId) => {
            return this.client.delete('roles/delete', { role_id: roleId });
        },

        // Clone role
        clone: (roleId, newName) => {
            return this.client.post('roles/clone', { role_id: roleId, new_name: newName });
        }
    };

    // ========================================================================
    // ORGANIZATION - DIRECTORATES
    // ========================================================================

    directorates = {
        list: () => this.client.get('directorates/list', {}, { useCache: true }),
        get: (id) => this.client.get('directorates/get', { directorate_id: id }),
        create: (data) => this.client.post('directorates/create', data),
        update: (id, data) => this.client.put('directorates/update', { directorate_id: id, ...data }),
        delete: (id) => this.client.delete('directorates/delete', { directorate_id: id })
    };

    // ========================================================================
    // ORGANIZATION - WORK UNITS
    // ========================================================================

    workUnits = {
        list: (filters = {}) => this.client.get('work-units/list', filters, { useCache: true }),
        get: (id) => this.client.get('work-units/get', { work_unit_id: id }),
        create: (data) => this.client.post('work-units/create', data),
        update: (id, data) => this.client.put('work-units/update', { work_unit_id: id, ...data }),
        delete: (id) => this.client.delete('work-units/delete', { work_unit_id: id })
    };

    // ========================================================================
    // ORGANIZATION - AFFAIRS
    // ========================================================================

    affairs = {
        list: (filters = {}) => this.client.get('affairs/list', filters, { useCache: true }),
        get: (id) => this.client.get('affairs/get', { affair_id: id }),
        create: (data) => this.client.post('affairs/create', data),
        update: (id, data) => this.client.put('affairs/update', { affair_id: id, ...data }),
        delete: (id) => this.client.delete('affairs/delete', { affair_id: id })
    };

    // ========================================================================
    // ORGANIZATION - POSITIONS
    // ========================================================================

    positions = {
        list: (filters = {}) => this.client.get('positions/list', filters, { useCache: true }),
        get: (id) => this.client.get('positions/get', { position_id: id }),
        create: (data) => this.client.post('positions/create', data),
        update: (id, data) => this.client.put('positions/update', { position_id: id, ...data }),
        delete: (id) => this.client.delete('positions/delete', { position_id: id })
    };

    // ========================================================================
    // ORGANIZATION - POSITION ASSIGNMENTS
    // ========================================================================

    positionAssignments = {
        list: (filters = {}) => this.client.get('position-assignments/list', filters),
        get: (id) => this.client.get('position-assignments/get', { assignment_id: id }),
        create: (data) => this.client.post('position-assignments/create', data),
        update: (id, data) => this.client.put('position-assignments/update', { assignment_id: id, ...data }),
        delete: (id) => this.client.delete('position-assignments/delete', { assignment_id: id })
    };

    // ========================================================================
    // STRATEGIC PLANNING - PERIODS
    // ========================================================================

    periods = {
        list: () => this.client.get('periods/list', {}, { useCache: true }),
        get: (id) => this.client.get('periods/get', { period_id: id }),
        getActive: () => this.client.get('periods/active', {}),
        create: (data) => this.client.post('periods/create', data),
        update: (id, data) => this.client.put('periods/update', { period_id: id, ...data }),
        delete: (id) => this.client.delete('periods/delete', { period_id: id }),
        activate: (id) => this.client.put('periods/activate', { period_id: id }),
        rollover: (id, options = {}) => this.client.post('periods/rollover', { period_id: id, ...options })
    };

    // ========================================================================
    // STRATEGIC PLANNING - VISIONS
    // ========================================================================

    visions = {
        list: (filters = {}) => this.client.get('visions/list', filters, { useCache: true }),
        get: (id) => this.client.get('visions/get', { vision_id: id }),
        create: (data) => this.client.post('visions/create', data),
        update: (id, data) => this.client.put('visions/update', { vision_id: id, ...data }),
        delete: (id) => this.client.delete('visions/delete', { vision_id: id }),
        approve: (id) => this.client.put('visions/approve', { vision_id: id })
    };

    // ========================================================================
    // STRATEGIC PLANNING - MISSIONS
    // ========================================================================

    missions = {
        list: (filters = {}) => this.client.get('missions/list', filters, { useCache: true }),
        get: (id) => this.client.get('missions/get', { mission_id: id }),
        create: (data) => this.client.post('missions/create', data),
        update: (id, data) => this.client.put('missions/update', { mission_id: id, ...data }),
        delete: (id) => this.client.delete('missions/delete', { mission_id: id }),
        reorder: (id, newOrder) => this.client.put('missions/reorder', { mission_id: id, mission_order: newOrder })
    };

    // ========================================================================
    // STRATEGIC PLANNING - STRATEGIC INITIATIVES
    // ========================================================================

    initiatives = {
        list: (filters = {}) => this.client.get('initiatives/list', filters, { useCache: true }),
        get: (id) => this.client.get('initiatives/get', { initiative_id: id }),
        create: (data) => this.client.post('initiatives/create', data),
        update: (id, data) => this.client.put('initiatives/update', { initiative_id: id, ...data }),
        delete: (id) => this.client.delete('initiatives/delete', { initiative_id: id })
    };

    // ========================================================================
    // STRATEGIC PLANNING - ORGANIZATIONAL GOALS
    // ========================================================================

    goals = {
        list: (filters = {}) => this.client.get('goals/list', filters, { useCache: true }),
        get: (id) => this.client.get('goals/get', { goal_id: id }),
        create: (data) => this.client.post('goals/create', data),
        update: (id, data) => this.client.put('goals/update', { goal_id: id, ...data }),
        delete: (id) => this.client.delete('goals/delete', { goal_id: id })
    };

    // ========================================================================
    // STRATEGIC PLANNING - WORK UNIT GOALS
    // ========================================================================

    workUnitGoals = {
        list: (filters = {}) => this.client.get('work-unit-goals/list', filters, { useCache: true }),
        get: (id) => this.client.get('work-unit-goals/get', { work_unit_goal_id: id }),
        create: (data) => this.client.post('work-unit-goals/create', data),
        update: (id, data) => this.client.put('work-unit-goals/update', { work_unit_goal_id: id, ...data }),
        delete: (id) => this.client.delete('work-unit-goals/delete', { work_unit_goal_id: id })
    };

    // ========================================================================
    // IMPACT CENTERS
    // ========================================================================

    impactCenters = {
        list: (filters = {}) => this.client.get('impact-centers/list', filters, { useCache: true }),
        get: (id) => this.client.get('impact-centers/get', { ic_id: id }),
        create: (data) => this.client.post('impact-centers/create', data),
        update: (id, data) => this.client.put('impact-centers/update', { ic_id: id, ...data }),
        delete: (id) => this.client.delete('impact-centers/delete', { ic_id: id }),
        updateProgress: (id, progressData) => this.client.post('impact-centers/progress', { ic_id: id, ...progressData }),
        getProgress: (id, year) => this.client.get('impact-centers/progress', { ic_id: id, year }),
        assignWorkUnit: (id, workUnitId, data) => this.client.post('impact-centers/assign-work-unit', { ic_id: id, work_unit_id: workUnitId, ...data }),
        unassignWorkUnit: (id, workUnitId) => this.client.delete('impact-centers/unassign-work-unit', { ic_id: id, work_unit_id: workUnitId })
    };

    // ========================================================================
    // KPIS
    // ========================================================================

    kpis = {
        // Organizational KPIs
        list: (filters = {}) => this.client.get('kpis/list', filters, { useCache: true }),
        get: (id) => this.client.get('kpis/get', { kpi_id: id }),
        create: (data) => this.client.post('kpis/create', data),
        update: (id, data) => this.client.put('kpis/update', { kpi_id: id, ...data }),
        delete: (id) => this.client.delete('kpis/delete', { kpi_id: id }),
        updateProgress: (id, progressData) => this.client.post('kpis/progress', { kpi_id: id, ...progressData }),
        getProgress: (id, year) => this.client.get('kpis/progress', { kpi_id: id, year }),

        // Individual KPIs
        individual: {
            list: (filters = {}) => this.client.get('individual-kpis/list', filters, { useCache: true }),
            get: (id) => this.client.get('individual-kpis/get', { individual_kpi_id: id }),
            create: (data) => this.client.post('individual-kpis/create', data),
            update: (id, data) => this.client.put('individual-kpis/update', { individual_kpi_id: id, ...data }),
            delete: (id) => this.client.delete('individual-kpis/delete', { individual_kpi_id: id }),
            updateProgress: (id, progressData) => this.client.post('individual-kpis/progress', { individual_kpi_id: id, ...progressData }),
            getProgress: (id, year) => this.client.get('individual-kpis/progress', { individual_kpi_id: id, year })
        }
    };

    // ========================================================================
    // PROGRAMS
    // ========================================================================

    programs = {
        list: (filters = {}) => this.client.get('programs/list', filters, { useCache: true }),
        get: (id) => this.client.get('programs/get', { program_id: id }),
        create: (data) => this.client.post('programs/create', data),
        update: (id, data) => this.client.put('programs/update', { program_id: id, ...data }),
        delete: (id) => this.client.delete('programs/delete', { program_id: id }),

        // Activities
        activities: {
            list: (filters = {}) => this.client.get('activities/list', filters, { useCache: true }),
            get: (id) => this.client.get('activities/get', { activity_id: id }),
            create: (data) => this.client.post('activities/create', data),
            update: (id, data) => this.client.put('activities/update', { activity_id: id, ...data }),
            delete: (id) => this.client.delete('activities/delete', { activity_id: id })
        }
    };

    // ========================================================================
    // OKRS
    // ========================================================================

    okrs = {
        list: (filters = {}) => this.client.get('okrs/list', filters, { useCache: true }),
        get: (id) => this.client.get('okrs/get', { okr_id: id }),
        create: (data) => this.client.post('okrs/create', data),
        update: (id, data) => this.client.put('okrs/update', { okr_id: id, ...data }),
        delete: (id) => this.client.delete('okrs/delete', { okr_id: id }),
        submit: (id) => this.client.put('okrs/submit', { okr_id: id }),
        review: (id, reviewData) => this.client.put('okrs/review', { okr_id: id, ...reviewData }),
        getMyOKRs: () => this.client.get('okrs/my', {}),
        getTeamOKRs: () => this.client.get('okrs/team', {})
    };

    // ========================================================================
    // DASHBOARD
    // ========================================================================

    dashboard = {
        getExecutiveData: () => this.client.get('dashboard/executive', {}, { useCache: true, cacheTimeout: 300000 }),
        getKPIData: (filters = {}) => this.client.get('dashboard/kpi', filters, { useCache: true, cacheTimeout: 300000 }),
        getImpactCenterData: (filters = {}) => this.client.get('dashboard/impact-center', filters, { useCache: true, cacheTimeout: 300000 }),
        getBudgetData: (filters = {}) => this.client.get('dashboard/budget', filters, { useCache: true, cacheTimeout: 300000 }),
        getRecentActivities: (limit = 10) => this.client.get('dashboard/activities', { limit }, { useCache: true, cacheTimeout: 60000 })
    };

    // ========================================================================
    // REPORTS
    // ========================================================================

    reports = {
        generate: (reportConfig) => this.client.post('reports/generate', reportConfig),
        exportToCSV: (reportType, filters = {}) => this.client.post('reports/export/csv', { report_type: reportType, filters }),
        exportToExcel: (reportType, filters = {}) => this.client.post('reports/export/excel', { report_type: reportType, filters }),
        exportToPDF: (reportType, filters = {}) => this.client.post('reports/export/pdf', { report_type: reportType, filters }),
        exportToPowerPoint: (reportType, filters = {}) => this.client.post('reports/export/ppt', { report_type: reportType, filters })
    };

    // ========================================================================
    // NOTIFICATIONS
    // ========================================================================

    notifications = {
        list: (filters = {}) => this.client.get('notifications/list', filters),
        get: (id) => this.client.get('notifications/get', { notification_id: id }),
        markAsRead: (id) => this.client.put('notifications/read', { notification_id: id }),
        markAllAsRead: () => this.client.put('notifications/read-all', {}),
        delete: (id) => this.client.delete('notifications/delete', { notification_id: id }),
        getUnreadCount: () => this.client.get('notifications/unread-count', {})
    };

    // ========================================================================
    // SETTINGS
    // ========================================================================

    settings = {
        get: (key) => this.client.get('settings/get', { setting_key: key }),
        set: (key, value) => this.client.post('settings/set', { setting_key: key, setting_value: value }),
        getAll: () => this.client.get('settings/all', {}, { useCache: true })
    };

    // ========================================================================
    // IMPORT/EXPORT
    // ========================================================================

    import = {
        validate: (fileType, data) => this.client.post('import/validate', { file_type: fileType, data }),
        process: (fileType, data, options = {}) => this.client.post('import/process', { file_type: fileType, data, ...options })
    };

    // ========================================================================
    // SEARCH
    // ========================================================================

    search = {
        global: (query, filters = {}) => this.client.get('search/global', { query, ...filters }),
        inModule: (module, query, filters = {}) => this.client.get('search/module', { module, query, ...filters })
    };

    // ========================================================================
    // SYSTEM
    // ========================================================================

    system = {
        initialize: () => this.client.post('system/initialize', {}),
        getHealthCheck: () => this.client.get('system/health', {}),
        getLogs: (filters = {}) => this.client.get('system/logs', filters),
        clearCache: () => this.client.post('system/clear-cache', {})
    };
}

// ============================================================================
// CREATE GLOBAL API INSTANCE
// ============================================================================

const api = new API();

// Make available globally
if (typeof window !== 'undefined') {
    window.API = API;
    window.api = api;
}
