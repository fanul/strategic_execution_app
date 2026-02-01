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
            scripts: [], // Scripts loaded dynamically via AJAX
            modals: '' // No modals needed
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
            scripts: [], // Loaded dynamically
            modals: '' // No modals - uses strategic_crud.html inline
        },

        kpi: {
            title: 'KPI Management',
            template: 'minimal/pages/kpi.html',
            scripts: [], // Loaded dynamically
            modals: '' // Uses kpi_crud.html inline
        },

        okrs: {
            title: 'OKR Management',
            template: 'minimal/pages/okrs.html',
            scripts: [], // Loaded dynamically
            modals: 'minimal/layout/modals/okr_modals.html'
        },

        users: {
            title: 'User Management',
            template: 'minimal/pages/users.html',
            scripts: [], // Loaded dynamically
            modals: '' // Uses users_crud.html inline
        },

        roles: {
            title: 'Role Management',
            template: 'minimal/pages/roles.html',
            scripts: [], // Loaded dynamically
            modals: '' // Uses roles_crud.html inline
        },

        programs: {
            title: 'Program Management',
            template: 'minimal/pages/programs.html',
            scripts: [], // Loaded dynamically
            modals: 'minimal/layout/modals/program_modals.html'
        },

        reports: {
            title: 'Reports & Analytics',
            template: 'minimal/pages/reports.html',
            scripts: [], // Loaded dynamically
            modals: '' // Uses reports_crud.html inline
        },

        'audit-trail': {
            title: 'Audit Trail',
            template: 'minimal/pages/audit-trail.html',
            scripts: [], // Loaded dynamically
            modals: '' // Uses audit_crud.html inline
        },

        swot: {
            title: 'SWOT Analysis',
            template: 'minimal/pages/swot.html',
            scripts: [], // Loaded dynamically
            modals: '' // Uses swot_crud.html inline (to be created)
        },

        notifications: {
            title: 'Notifications',
            template: 'minimal/pages/notifications.html',
            scripts: [], // Loaded dynamically
            modals: '' // Uses notifications_crud.html inline
        },

        settings: {
            title: 'Settings',
            template: 'minimal/pages/settings.html',
            scripts: [], // Loaded dynamically
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
