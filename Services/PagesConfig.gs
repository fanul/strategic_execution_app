/**
 * PagesConfig Service
 * Centralized configuration for all pages in the application
 * Eliminates the need for massive switch statements in Code.gs
 */

var PagesConfig = {
    // Valid page names (for security validation)
    validPages: [
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
        dashboard: {
            title: 'Dashboard',
            template: 'minimal/pages/dashboard.html',
            scripts: ['minimal/assets/js/dashboard_widgets.html'],
            modals: ''
        },

        organization: {
            title: 'Organization',
            template: 'minimal/pages/organization.html',
            scripts: [
                'minimal/assets/js/organization_datatables.html',
                'minimal/assets/js/organization_crud.html',
                'minimal/assets/js/view-toggle.html',
                'minimal/assets/js/org-diagram-controls.html',
                'minimal/assets/js/org-diagram-tooltip.html',
                'minimal/assets/js/org-diagram-context-menu.html',
                'minimal/assets/js/org-diagram.html'
            ],
            modals: 'minimal/layout/modals/organization_modals.html'
        },

        'strategic-plan': {
            title: 'Strategic Planning',
            template: 'minimal/pages/strategic-plan.html',
            scripts: ['minimal/assets/js/strategic_crud.html'],
            modals: ''
        },

        kpi: {
            title: 'KPI Management',
            template: 'minimal/pages/kpi.html',
            scripts: ['minimal/assets/js/kpi_crud.html'],
            modals: ''
        },

        okrs: {
            title: 'OKR Management',
            template: 'minimal/pages/okrs.html',
            scripts: ['minimal/assets/js/okr_crud.html'],
            modals: 'minimal/layout/modals/okr_modals.html'
        },

        users: {
            title: 'User Management',
            template: 'minimal/pages/users.html',
            scripts: ['minimal/assets/js/users_crud.html'],
            modals: ''
        },

        roles: {
            title: 'Role Management',
            template: 'minimal/pages/roles.html',
            scripts: ['minimal/assets/js/roles_crud.html'],
            modals: ''
        },

        programs: {
            title: 'Program Management',
            template: 'minimal/pages/programs.html',
            scripts: ['minimal/assets/js/programs_crud.html'],
            modals: 'minimal/layout/modals/program_modals.html'
        },

        reports: {
            title: 'Reports & Analytics',
            template: 'minimal/pages/reports.html',
            scripts: ['minimal/assets/js/reports_crud.html'],
            modals: ''
        },

        'audit-trail': {
            title: 'Audit Trail',
            template: 'minimal/pages/audit-trail.html',
            scripts: ['minimal/assets/js/audit_crud.html'],
            modals: ''
        },

        swot: {
            title: 'SWOT Analysis',
            template: 'minimal/pages/swot.html',
            scripts: [],
            modals: ''
        },

        notifications: {
            title: 'Notifications',
            template: 'minimal/pages/notifications.html',
            scripts: ['minimal/assets/js/notifications_crud.html'],
            modals: ''
        },

        settings: {
            title: 'Settings',
            template: 'minimal/pages/settings.html',
            scripts: ['minimal/assets/js/settings_manager.html'],
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
