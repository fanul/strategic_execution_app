/**
 * Security Enhancements for Strategic Execution Monitoring Application
 * Provides CSRF protection, row-level security, GDPR compliance
 *
 * STATUS: PLANNED FEATURES - Not yet integrated into UI
 *
 * This module contains security enhancements that should be integrated for production use:
 *
 * TO INTEGRATE:
 * 1. CSRFManager - Call csrfManager.init() in app.js init()
 * 2. RowLevelSecurityManager - Call rlsManager.init() after authentication
 * 3. GDPRManager - Add consent dialog and privacy policy link
 * 4. SecurityAuditLogger - Log security events throughout the app
 *
 * Classes are exported to window object and ready to use when needed.
 *
 * CRITICAL: Review and test all security features before enabling in production.
 */

// ============================================================================
// CSRF PROTECTION MANAGER
// ============================================================================

class CSRFManager {
    constructor() {
        this.tokenName = 'X-CSRF-Token';
        this.token = null;
        this.tokenExpiry = null;
    }

    /**
     * Initialize CSRF protection
     */
    async init() {
        // Try to get token from storage
        const stored = StorageUtils.get('csrf-token', null);
        if (stored && stored.expiry > Date.now()) {
            this.token = stored.token;
            this.tokenExpiry = stored.expiry;
        } else {
            await this.refreshToken();
        }

        // Add token to all forms
        this._protectForms();
    }

    /**
     * Refresh CSRF token
     */
    async refreshToken() {
        try {
            const response = await api.call('auth/csrf-token');
            if (response.success && response.data && response.data.token) {
                this.token = response.data.token;
                this.tokenExpiry = Date.now() + (response.data.expiresIn || 3600000); // 1 hour default

                StorageUtils.save('csrf-token', {
                    token: this.token,
                    expiry: this.tokenExpiry
                });

                return this.token;
            }
        } catch (error) {
            console.warn('Failed to refresh CSRF token:', error);
        }
        return null;
    }

    /**
     * Get current CSRF token
     */
    getToken() {
        if (!this.token || (this.tokenExpiry && this.tokenExpiry < Date.now())) {
            this.refreshToken();
        }
        return this.token;
    }

    /**
     * Add CSRF token to request headers
     */
    addTokenToHeaders(headers = {}) {
        const token = this.getToken();
        if (token) {
            headers[this.tokenName] = token;
        }
        return headers;
    }

    /**
     * Protect all forms with CSRF tokens
     * @private
     */
    _protectForms() {
        const forms = document.querySelectorAll('form[data-csrf="true"]');
        forms.forEach(form => {
            // Add hidden input with CSRF token
            let tokenInput = form.querySelector(`input[name="${this.tokenName}"]`);
            if (!tokenInput) {
                tokenInput = document.createElement('input');
                tokenInput.type = 'hidden';
                tokenInput.name = this.tokenName;
                form.appendChild(tokenInput);
            }
            tokenInput.value = this.getToken() || '';

            // Refresh token before submit
            form.addEventListener('submit', async () => {
                tokenInput.value = this.getToken() || await this.refreshToken();
            });
        });
    }

    /**
     * Validate CSRF token on form submission
     */
    static validateToken(token) {
        // This would make an API call to validate the token
        // For now, just check if token exists and is not empty
        return token && token.length > 0;
    }
}

// ============================================================================
// ROW-LEVEL SECURITY MANAGER
// ============================================================================

class RowLevelSecurityManager {
    constructor() {
        this.userAccessScope = null;
        this.currentUser = null;
    }

    /**
     * Initialize RLS with current user context
     */
    async init() {
        try {
            const response = await api.call('auth/me');
            if (response.success && response.data) {
                this.currentUser = response.data;
                this.userAccessScope = this._calculateAccessScope(response.data);
            }
        } catch (error) {
            console.error('Failed to initialize RLS:', error);
        }
    }

    /**
     * Calculate user's access scope based on role and assignments
     * @private
     */
    _calculateAccessScope(user) {
        const scope = {
            canViewAll: false,
            canEditAll: false,
            canDeleteAll: false,
            allowedDirectorates: [],
            allowedWorkUnits: [],
            allowedPositions: [],
            allowedUsers: []
        };

        // Super Admin / System Admin
        if (user.role_code === 'SUPER_ADMIN' || user.role_code === 'SYSTEM_ADMIN') {
            scope.canViewAll = true;
            scope.canEditAll = true;
            scope.canDeleteAll = true;
            return scope;
        }

        // Directorate Head
        if (user.role_code === 'DIRECTORATE_HEAD' && user.directorate_id) {
            scope.allowedDirectorates.push(user.directorate_id);
            scope.canViewAll = false;
            scope.canEditAll = false;
        }

        // Work Unit Head
        if (user.role_code === 'WORK_UNIT_HEAD' && user.work_unit_id) {
            scope.allowedWorkUnits.push(user.work_unit_id);
            scope.canViewAll = false;
            scope.canEditAll = false;
        }

        // Regular User
        if (user.role_code === 'USER') {
            scope.allowedUsers.push(user.user_id);
            scope.canViewAll = false;
            scope.canEditAll = false;
        }

        return scope;
    }

    /**
     * Filter data based on user's access scope
     */
    filterData(data, entityType) {
        if (!this.userAccessScope || this.userAccessScope.canViewAll) {
            return data;
        }

        return data.filter(item => this._hasAccess(item, entityType));
    }

    /**
     * Check if user has access to a specific item
     * @private
     */
    _hasAccess(item, entityType) {
        const scope = this.userAccessScope;

        // Check directorate access
        if (scope.allowedDirectorates.length > 0) {
            const directorateField = item.directorate_id || item.directorateId || item.directorate;
            if (directorateField && scope.allowedDirectorates.includes(directorateField)) {
                return true;
            }
        }

        // Check work unit access
        if (scope.allowedWorkUnits.length > 0) {
            const workUnitField = item.work_unit_id || item.workUnitId || item.work_unit;
            if (workUnitField && scope.allowedWorkUnits.includes(workUnitField)) {
                return true;
            }
        }

        // Check ownership
        if (scope.allowedUsers.length > 0) {
            const ownerField = item.created_by || item.createdBy || item.owner_id || item.userId;
            if (ownerField && scope.allowedUsers.includes(ownerField)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Check if user can perform an action on an entity
     */
    canPerform(action, entityType, item) {
        if (!this.userAccessScope) return false;

        // Super admins can do everything
        if (this.userAccessScope.canViewAll && this.userAccessScope.canEditAll) return true;

        // Check access based on action
        switch (action) {
            case 'view':
                return this._hasAccess(item, entityType);
            case 'edit':
            case 'update':
                return this._hasAccess(item, entityType) && !this.userAccessScope.readOnly;
            case 'delete':
                return this.userAccessScope.canDeleteAll || this._isOwner(item);
            default:
                return false;
        }
    }

    /**
     * Check if user is the owner of an item
     * @private
     */
    _isOwner(item) {
        if (!this.currentUser) return false;
        const ownerField = item.created_by || item.createdBy || item.user_id;
        return ownerField === this.currentUser.user_id;
    }

    /**
     * Add RLS filters to API request
     */
    addRLSFilters(requestData) {
        if (!this.userAccessScope || this.userAccessScope.canViewAll) {
            return requestData;
        }

        const filters = { ...requestData };

        if (this.userAccessScope.allowedDirectorates.length > 0) {
            filters.directorate_ids = this.userAccessScope.allowedDirectorates;
        }

        if (this.userAccessScope.allowedWorkUnits.length > 0) {
            filters.work_unit_ids = this.userAccessScope.allowedWorkUnits;
        }

        if (this.userAccessScope.allowedUsers.length > 0) {
            filters.user_ids = this.userAccessScope.allowedUsers;
        }

        return filters;
    }
}

// ============================================================================
// GDPR COMPLIANCE MANAGER
// ============================================================================

class GDPRManager {
    /**
     * Export all user data (Right to Data Portability)
     */
    static async exportUserData(userId) {
        showLoadingOverlay();

        try {
            // Collect all user-related data from various endpoints
            const endpoints = [
                { name: 'User Profile', endpoint: 'users/get', data: { user_id: userId } },
                { name: 'Assignments', endpoint: 'organization/assignments/list', data: { user_id: userId } },
                { name: 'KPIs', endpoint: 'kpi/individual/list', data: { user_id: userId } },
                { name: 'OKRs', endpoint: 'okr/my-okrs', data: { user_id: userId } },
                { name: 'Program Activities', endpoint: 'programs/activities', data: { assigned_to: userId } }
            ];

            const userData = {
                exportDate: new Date().toISOString(),
                userId: userId,
                data: {}
            };

            for (const endpoint of endpoints) {
                try {
                    const response = await api.call(endpoint.endpoint, endpoint.data);
                    if (response.success) {
                        userData.data[endpoint.name] = response.data;
                    }
                } catch (error) {
                    userData.data[endpoint.name] = { error: error.message };
                }
            }

            // Download as JSON
            const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `user-data-${userId}-${Date.now()}.json`;
            a.click();
            URL.revokeObjectURL(url);

            showSuccessMessage('User data exported successfully');

        } catch (error) {
            console.error('Data export error:', error);
            showErrorMessage('Failed to export user data: ' + error.message);
        } finally {
            hideLoadingOverlay();
        }
    }

    /**
     * Request user data deletion (Right to be Forgotten)
     */
    static async requestUserDataDeletion(userId) {
        const confirmed = confirm(
            'This will request permanent deletion of all personal data.\n\n' +
            'This action cannot be undone. The data will be anonymized or deleted ' +
            'in accordance with retention policies.\n\n' +
            'Do you want to proceed?'
        );

        if (!confirmed) return;

        showLoadingOverlay();

        try {
            // This would typically create a deletion request that needs admin approval
            const response = await api.call('users/request-deletion', {
                user_id: userId,
                requested_at: new Date().toISOString(),
                reason: 'User exercised right to be forgotten (GDPR Article 17)'
            });

            if (response.success) {
                showSuccessMessage('Deletion request submitted. An administrator will review this request.');
            } else {
                showErrorMessage(response.message || 'Failed to submit deletion request');
            }
        } catch (error) {
            console.error('Deletion request error:', error);
            showErrorMessage('Failed to submit deletion request: ' + error.message);
        } finally {
            hideLoadingOverlay();
        }
    }

    /**
     * Show consent management dialog
     */
    static showConsentManager() {
        const consentData = StorageUtils.get('gdpr-consent', {
            essential: true,
            analytics: false,
            marketing: false,
            date: null
        });

        const modalHtml = `
            <div class="modal fade" id="consentModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Privacy Consent Management</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <p>Manage your privacy preferences and data processing consent.</p>

                            <div class="form-check mb-3">
                                <input class="form-check-input" type="checkbox" id="consent-essential"
                                       disabled ${consentData.essential ? 'checked' : ''}>
                                <label class="form-check-label" for="consent-essential">
                                    <strong>Essential Cookies</strong>
                                    <small class="d-block text-muted">Required for the application to function</small>
                                </label>
                            </div>

                            <div class="form-check mb-3">
                                <input class="form-check-input" type="checkbox" id="consent-analytics"
                                       ${consentData.analytics ? 'checked' : ''}>
                                <label class="form-check-label" for="consent-analytics">
                                    <strong>Analytics & Performance</strong>
                                    <small class="d-block text-muted">Help us improve the application</small>
                                </label>
                            </div>

                            <div class="form-check mb-3">
                                <input class="form-check-input" type="checkbox" id="consent-marketing"
                                       ${consentData.marketing ? 'checked' : ''}>
                                <label class="form-check-label" for="consent-marketing">
                                    <strong>Marketing Communications</strong>
                                    <small class="d-block text-muted">Receive updates and promotional content</small>
                                </label>
                            </div>

                            <hr>

                            <div class="d-grid gap-2">
                                <button class="btn btn-primary" onclick="GDPRManager.saveConsent()">
                                    Save Preferences
                                </button>
                                <button class="btn btn-outline-secondary" onclick="GDPRManager.exportUserData('${auth.currentUser?.user_id || ''}')">
                                    <i class="bi bi-download me-1"></i>Export My Data
                                </button>
                                <button class="btn btn-outline-danger" onclick="GDPRManager.requestUserDataDeletion('${auth.currentUser?.user_id || ''}')">
                                    <i class="bi bi-trash me-1"></i>Request Data Deletion
                                </button>
                            </div>

                            ${consentData.date ? `<p class="text-muted small mt-3">Last updated: ${new Date(consentData.date).toLocaleString()}</p>` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;

        const existingModal = document.getElementById('consentModal');
        if (existingModal) existingModal.remove();

        document.body.insertAdjacentHTML('beforeend', modalHtml);
        new bootstrap.Modal(document.getElementById('consentModal')).show();
    }

    /**
     * Save user consent preferences
     */
    static saveConsent() {
        const consent = {
            essential: true,
            analytics: document.getElementById('consent-analytics').checked,
            marketing: document.getElementById('consent-marketing').checked,
            date: new Date().toISOString()
        };

        StorageUtils.save('gdpr-consent', consent);

        showSuccessMessage('Consent preferences saved');
        bootstrap.Modal.getInstance(document.getElementById('consentModal')).hide();
    }

    /**
     * Check if user has given consent for a specific purpose
     */
    static hasConsent(purpose) {
        const consent = StorageUtils.get('gdpr-consent', {});
        return consent[purpose] === true || purpose === 'essential';
    }

    /**
     * Show initial consent dialog (for first-time users)
     */
    static showInitialConsent() {
        const consent = StorageUtils.get('gdpr-consent', null);
        if (consent) return; // Already shown

        this.showConsentManager();
    }

    /**
     * Get privacy policy content
     */
    static getPrivacyPolicy() {
        return `
            <h4>Privacy Policy</h4>
            <p>Last updated: January 2025</p>

            <h5>Data Collection</h5>
            <p>We collect the following types of personal data:</p>
            <ul>
                <li>Account information (name, email, role)</li>
                <li>Organizational assignments</li>
                <li>Performance metrics and KPIs</li>
                <li>Activity logs and audit trails</li>
            </ul>

            <h5>Data Usage</h5>
            <p>Your data is used for:</p>
            <ul>
                <li>Managing strategic planning and execution</li>
                <li>Tracking performance and KPIs</li>
                <li>Generating reports and analytics</li>
                <li>Improving application functionality</li>
            </ul>

            <h5>Data Rights</h5>
            <p>Under GDPR, you have the right to:</p>
            <ul>
                <li><strong>Access</strong> - Request a copy of your personal data</li>
                <li><strong>Rectification</strong> - Correct inaccurate data</li>
                <li><strong>Erasure</strong> - Request deletion of your data</li>
                <li><strong>Portability</strong> - Receive your data in a structured format</li>
                <li><strong>Object</strong> - Object to processing of your data</li>
            </ul>

            <h5>Data Retention</h5>
            <p>Personal data is retained for the duration of your employment plus 7 years, in accordance with legal requirements.</p>

            <h5>Contact</h5>
            <p>For privacy inquiries, contact: privacy@example.com</p>
        `;
    }
}

// ============================================================================
// SECURITY AUDIT LOGGER
// ============================================================================

class SecurityAuditLogger {
    /**
     * Log security event
     */
    static async log(eventType, details) {
        const logEntry = {
            event_type: eventType,
            timestamp: new Date().toISOString(),
            user_id: auth.currentUser?.user_id || 'anonymous',
            user_agent: navigator.userAgent,
            ip_address: await this._getClientIP(),
            details: details
        };

        try {
            // Send to backend for permanent logging
            await api.call('audit/log-security', logEntry);
        } catch (error) {
            // Log to console as fallback
            console.warn('Security event:', logEntry);
        }

        // Store locally for immediate analysis
        const localLogs = StorageUtils.get('security-audit-logs', []);
        localLogs.push(logEntry);

        // Keep only last 1000 logs locally
        if (localLogs.length > 1000) {
            localLogs.splice(0, localLogs.length - 1000);
        }

        StorageUtils.save('security-audit-logs', localLogs);
    }

    /**
     * Get client IP address
     * @private
     */
    static async _getClientIP() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch {
            return 'unknown';
        }
    }

    /**
     * Log authentication attempt
     */
    static logAuthAttempt(success, username, failureReason = null) {
        this.log('AUTH_ATTEMPT', {
            success,
            username,
            failure_reason: failureReason,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Log permission denied event
     */
    static logPermissionDenied(resource, action, reason) {
        this.log('PERMISSION_DENIED', {
            resource,
            action,
            reason,
            user_role: auth.currentUser?.role_code
        });
    }

    /**
     * Log data access
     */
    static logDataAccess(resourceType, resourceId, accessType) {
        this.log('DATA_ACCESS', {
            resource_type: resourceType,
            resource_id: resourceId,
            access_type: accessType // 'view', 'edit', 'delete'
        });
    }

    /**
     * Get recent security events
     */
    static getRecentEvents(limit = 50) {
        const logs = StorageUtils.get('security-audit-logs', []);
        return logs.slice(-limit);
    }

    /**
     * Detect suspicious activity
     */
    static detectSuspiciousActivity() {
        const logs = this.getRecentEvents(100);
        const suspicious = [];

        // Multiple failed login attempts
        const failedLogins = logs.filter(l =>
            l.event_type === 'AUTH_ATTEMPT' && !l.details.success
        );

        const failedByUser = {};
        failedLogins.forEach(log => {
            const user = log.details.username;
            failedByUser[user] = (failedByUser[user] || 0) + 1;
        });

        for (const [user, count] of Object.entries(failedByUser)) {
            if (count >= 5) {
                suspicious.push({
                    type: 'MULTIPLE_FAILED_LOGINS',
                    user,
                    count,
                    severity: count >= 10 ? 'HIGH' : 'MEDIUM'
                });
            }
        }

        // Permission denials
        const permissionDenials = logs.filter(l => l.event_type === 'PERMISSION_DENIED');
        if (permissionDenials.length >= 10) {
            suspicious.push({
                type: 'EXCESSIVE_PERMISSION_DENIALS',
                count: permissionDenials.length,
                severity: 'MEDIUM'
            });
        }

        return suspicious;
    }
}

// ============================================================================
// EXPORT
// ============================================================================

if (typeof window !== 'undefined') {
    window.CSRFManager = CSRFManager;
    window.RowLevelSecurityManager = RowLevelSecurityManager;
    window.GDPRManager = GDPRManager;
    window.SecurityAuditLogger = SecurityAuditLogger;

    // Initialize global instances
    window.csrfManager = new CSRFManager();
    window.rlsManager = new RowLevelSecurityManager();
}
