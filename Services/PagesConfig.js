/**
 * PagesConfig Service
 * Centralized configuration for all pages in the application
 * Eliminates the need for massive switch statements in Code.gs
 */

var PagesConfig = {
    // Valid page names (for security validation)
    validPages: [
        'login',
        'dashboard',
        'organization',
        'strategic-plan',
        'kpi',
        'okrs',
        'users',
        'roles',
        'programs',
        'reports',
        'audit-trail',
        'swot',
        'notifications',
        'settings'
    ],

    // Page configurations
    pages: {
        login: {
            title: 'Sign In',
            template: 'pages/login.html',
            scripts: ['assets/js/auth.html'],
            modals: ''
        },

        dashboard: {
            title: 'Dashboard',
            template: 'pages/dashboard.html',
            scripts: ['assets/js/dashboard_widgets.html'],
            modals: ''
        },

        organization: {
            title: 'Organization',
            template: 'pages/organization.html',
            scripts: [
                'assets/js/organization_datatables.html',
                'assets/js/organization_crud.html',
                'assets/js/view-toggle.html',
                'assets/js/org-diagram-controls.html',
                'assets/js/org-diagram-tooltip.html',
                'assets/js/org-diagram-context-menu.html',
                'assets/js/org-diagram.html'
            ],
            modals: 'layout/modals/organization_modals.html'
        },

        'strategic-plan': {
            title: 'Strategic Planning',
            template: 'pages/strategic-plan.html',
            scripts: ['assets/js/strategic_crud.html'],
            modals: ''
        },

        kpi: {
            title: 'KPI Management',
            template: 'pages/kpi.html',
            scripts: ['assets/js/kpi_crud.html'],
            modals: ''
        },

        okrs: {
            title: 'OKR Management',
            template: 'pages/okrs.html',
            scripts: ['assets/js/okr_crud.html'],
            modals: 'layout/modals/okr_modals.html'
        },

        users: {
            title: 'User Management',
            template: 'pages/users.html',
            scripts: ['assets/js/users_crud.html'],
            modals: ''
        },

        roles: {
            title: 'Role Management',
            template: 'pages/roles.html',
            scripts: ['assets/js/roles_crud.html'],
            modals: ''
        },

        programs: {
            title: 'Program Management',
            template: 'pages/programs.html',
            scripts: ['assets/js/programs_crud.html'],
            modals: 'layout/modals/program_modals.html'
        },

        reports: {
            title: 'Reports & Analytics',
            template: 'pages/reports.html',
            scripts: ['assets/js/reports_crud.html'],
            modals: ''
        },

        'audit-trail': {
            title: 'Audit Trail',
            template: 'pages/audit-trail.html',
            scripts: ['assets/js/audit_crud.html'],
            modals: ''
        },

        swot: {
            title: 'SWOT Analysis',
            template: 'pages/swot.html',
            scripts: ['assets/js/swot_crud.html'],
            modals: 'layout/modals/swot_modals.html'
        },

        notifications: {
            title: 'Notifications',
            template: 'pages/notifications.html',
            scripts: ['assets/js/notifications_crud.html'],
            modals: ''
        },

        settings: {
            title: 'Settings',
            template: 'pages/settings.html',
            scripts: ['assets/js/settings_manager.html'],
            modals: ''
        }
    },

    /**
     * Get page configuration
     * @param {string} pageName - The page name
     * @returns {Object|null} Page configuration or null if not found
     */
    getPageConfig: function(pageName) {
        return this.pages[pageName] || null;
    },

    /**
     * Check if page is valid
     * @param {string} pageName - The page name
     * @returns {boolean} True if valid
     */
    isValidPage: function(pageName) {
        return this.validPages.indexOf(pageName) !== -1;
    },

    /**
     * Get page scripts
     * @param {string} pageName - The page name
     * @param {Object} dataTemplate - Data template
     * @returns {string} Combined script HTML
     */
    getPageScripts: function(pageName, dataTemplate) {
        const config = this.getPageConfig(pageName);
        if (!config || !config.scripts || config.scripts.length === 0) {
            return '';
        }

        Logger.log('Loading ' + config.scripts.length + ' scripts for: ' + pageName);

        // Combine all scripts
        return config.scripts.map(function(scriptFile) {
            return renderTemplate(scriptFile, dataTemplate);
        }).join('\n');
    },

    /**
     * Get page modals
     * @param {string} pageName - The page name
     * @param {Object} dataTemplate - Data template
     * @returns {string} Modal HTML
     */
    getPageModals: function(pageName, dataTemplate) {
        const config = this.getPageConfig(pageName);
        if (!config || !config.modals) {
            return '';
        }

        Logger.log('Loading modals for: ' + pageName);
        return renderTemplate(config.modals, dataTemplate);
    }
};
