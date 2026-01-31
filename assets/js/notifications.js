/**
 * Notification Center Component
 * Provides in-app notification UI with bell icon, dropdown, and notification center page
 */

// ============================================================================
// NOTIFICATION CENTER CLASS
// ============================================================================

class NotificationCenter {
    constructor(options = {}) {
        this.position = options.position || 'top-right'; // top-right, top-left, bottom-right, bottom-left
        this.autoRefresh = options.autoRefresh !== false;
        this.refreshInterval = options.refreshInterval || 60000; // 1 minute
        this.refreshTimer = null;
        this.unreadCount = 0;
        this.notifications = [];
        this.onNotificationClick = options.onNotificationClick || null;
        this.onMarkAsRead = options.onMarkAsRead || null;
    }

    /**
     * Initialize notification center
     */
    async init() {
        // Create bell icon in navbar
        this._createBellIcon();

        // Load initial notifications
        await this._loadNotifications();

        // Setup auto-refresh
        if (this.autoRefresh) {
            this._startAutoRefresh();
        }
    }

    /**
     * Create bell icon in navbar
     * @private
     */
    _createBellIcon() {
        // Find the navbar or create one
        const navbar = document.querySelector('.navbar') || document.querySelector('nav');
        if (!navbar) return;

        const bellContainer = document.createElement('div');
        bellContainer.className = 'notification-center';
        bellContainer.innerHTML = `
            <button class="btn btn-link position-relative" id="notification-bell" type="button">
                <i class="bi bi-bell fs-5"></i>
                <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger notification-badge" style="display: none;">
                    0
                </span>
            </button>
            <div class="notification-dropdown" id="notification-dropdown" style="display: none;">
                <div class="notification-dropdown-header p-2 border-bottom d-flex justify-content-between align-items-center">
                    <strong>Notifications</strong>
                    <div>
                        <a href="#" class="mark-all-read-link small me-2">Mark all read</a>
                        <a href="#" class="view-all-link small">View all</a>
                    </div>
                </div>
                <div class="notification-dropdown-list" id="notification-list">
                    <div class="text-center p-3 text-muted">
                        <div class="spinner-border spinner-border-sm" role="status">
                            <span class="visually-hidden">Loading...</span>
                        </div>
                    </div>
                </div>
                <div class="notification-dropdown-footer p-2 border-top">
                    <a href="#" class="notification-settings-link small">
                        <i class="bi bi-gear me-1"></i>Notification settings
                    </a>
                </div>
            </div>
        `;

        // Insert into navbar
        const navbarNav = navbar.querySelector('.navbar-nav') || navbar;
        navbarNav.appendChild(bellContainer);

        // Setup event listeners
        this._setupBellEventListeners();
    }

    /**
     * Setup bell icon event listeners
     * @private
     */
    _setupBellEventListeners() {
        const bell = document.getElementById('notification-bell');
        const dropdown = document.getElementById('notification-dropdown');

        if (bell) {
            bell.addEventListener('click', (e) => {
                e.stopPropagation();
                this._toggleDropdown();
            });
        }

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.notification-center')) {
                this._closeDropdown();
            }
        });

        // Mark all as read
        document.querySelector('.mark-all-read-link')?.addEventListener('click', (e) => {
            e.preventDefault();
            this._markAllAsRead();
        });

        // View all notifications
        document.querySelector('.view-all-link')?.addEventListener('click', (e) => {
            e.preventDefault();
            this._closeDropdown();
            app.switchView('notifications');
        });

        // Settings link
        document.querySelector('.notification-settings-link')?.addEventListener('click', (e) => {
            e.preventDefault();
            this._closeDropdown();
            app.switchView('settings');
        });
    }

    /**
     * Toggle dropdown visibility
     * @private
     */
    _toggleDropdown() {
        const dropdown = document.getElementById('notification-dropdown');
        if (!dropdown) return;

        if (dropdown.style.display === 'none') {
            dropdown.style.display = 'block';
            this._renderNotificationList();
        } else {
            this._closeDropdown();
        }
    }

    /**
     * Close dropdown
     * @private
     */
    _closeDropdown() {
        const dropdown = document.getElementById('notification-dropdown');
        if (dropdown) {
            dropdown.style.display = 'none';
        }
    }

    /**
     * Load notifications from API
     * @private
     */
    async _loadNotifications() {
        try {
            const response = await api.notifications.list({ limit: 10, unread_only: false });

            if (response.success && response.data) {
                this.notifications = response.data;
                this.unreadCount = response.data.filter(n => !n.is_read).length;
                this._updateBadge();
            }
        } catch (error) {
            console.error('Error loading notifications:', error);
        }
    }

    /**
     * Render notification list in dropdown
     * @private
     */
    _renderNotificationList() {
        const listContainer = document.getElementById('notification-list');
        if (!listContainer) return;

        if (this.notifications.length === 0) {
            listContainer.innerHTML = `
                <div class="text-center p-3 text-muted">
                    <i class="bi bi-bell-slash fs-1 d-block mb-2"></i>
                    <p class="mb-0">No notifications</p>
                </div>
            `;
            return;
        }

        listContainer.innerHTML = this.notifications.map(notification => `
            <div class="notification-item ${notification.is_read ? '' : 'unread'} p-2 border-bottom"
                 data-notification-id="${notification.notification_id}">
                <div class="d-flex">
                    <div class="notification-icon me-2">
                        <i class="bi bi-${this._getNotificationIcon(notification.notification_type)}"></i>
                    </div>
                    <div class="flex-grow-1" style="cursor: pointer;" onclick="NotificationCenter.handleNotificationClick('${notification.notification_id}')">
                        <div class="notification-title">${notification.title}</div>
                        <div class="notification-content small">${notification.message}</div>
                        <div class="notification-time small text-muted">${DateUtils.getRelativeTime(notification.created_at)}</div>
                    </div>
                    ${!notification.is_read ? `
                        <div class="notification-actions ms-2">
                            <button class="btn btn-sm btn-link p-0 mark-read-btn" data-id="${notification.notification_id}" title="Mark as read">
                                <i class="bi bi-check2"></i>
                            </button>
                        </div>
                    ` : ''}
                </div>
            </div>
        `).join('');

        // Add click handlers for mark as read buttons
        listContainer.querySelectorAll('.mark-read-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this._markAsRead(btn.dataset.id);
            });
        });
    }

    /**
     * Get icon for notification type
     * @private
     */
    _getNotificationIcon(type) {
        const icons = {
            'info': 'info-circle-fill text-info',
            'warning': 'exclamation-triangle-fill text-warning',
            'success': 'check-circle-fill text-success',
            'error': 'x-circle-fill text-danger',
            'default': 'bell-fill text-secondary'
        };
        return icons[type] || icons['default'];
    }

    /**
     * Update unread count badge
     * @private
     */
    _updateBadge() {
        const badge = document.querySelector('.notification-badge');

        if (badge) {
            if (this.unreadCount > 0) {
                badge.textContent = this.unreadCount > 99 ? '99+' : this.unreadCount;
                badge.style.display = 'block';
            } else {
                badge.style.display = 'none';
            }
        }
    }

    /**
     * Mark notification as read
     * @private
     */
    async _markAsRead(notificationId) {
        try {
            const response = await api.notifications.markAsRead(notificationId);

            if (response.success) {
                // Update local state
                const notification = this.notifications.find(n => n.notification_id === notificationId);
                if (notification) {
                    notification.is_read = true;
                    this.unreadCount--;
                }

                this._updateBadge();
                this._renderNotificationList();

                if (this.onMarkAsRead) {
                    this.onMarkAsRead(notificationId);
                }
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    }

    /**
     * Mark all notifications as read
     * @private
     */
    async _markAllAsRead() {
        try {
            const response = await api.notifications.markAllAsRead();

            if (response.success) {
                // Update local state
                this.notifications.forEach(n => n.is_read = true);
                this.unreadCount = 0;

                this._updateBadge();
                this._renderNotificationList();

                showSuccessToast('All notifications marked as read');
            }
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    }

    /**
     * Start auto-refresh
     * @private
     */
    _startAutoRefresh() {
        this.refreshTimer = setInterval(() => {
            this._loadNotifications();
        }, this.refreshInterval);
    }

    /**
     * Stop auto-refresh
     * @private
     */
    _stopAutoRefresh() {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
            this.refreshTimer = null;
        }
    }

    /**
     * Handle notification click
     * @static
     */
    static async handleNotificationClick(notificationId) {
        const notification = notificationCenter.notifications.find(n => n.notification_id === notificationId);

        if (notification) {
            // Mark as read
            await notificationCenter._markAsRead(notificationId);

            // Navigate if link provided
            if (notification.link_url) {
                window.location.href = notification.link_url;
            }

            // Call custom handler
            if (notificationCenter.onNotificationClick) {
                notificationCenter.onNotificationClick(notification);
            }
        }
    }

    /**
     * Create new notification
     */
    static create(title, message, type = 'info', options = {}) {
        // This would call the backend to create a notification
        const notification = {
            notification_type: type,
            title,
            message,
            priority: options.priority || 'medium',
            link_url: options.link || null
        };

        return notification;
    }

    /**
     * Show toast notification
     */
    static showToast(message, type = 'info') {
        showToast(message, 'Notification', type);
    }

    /**
     * Show success toast
     */
    static showSuccess(message) {
        this.showToast(message, 'success');
    }

    /**
     * Show warning toast
     */
    static showWarning(message) {
        this.showToast(message, 'warning');
    }

    /**
     * Show error toast
     */
    static showError(message) {
        this.showToast(message, 'error');
    }
}

// ============================================================================
// CREATE GLOBAL INSTANCE
// ============================================================================

const notificationCenter = new NotificationCenter();

// Make available globally
if (typeof window !== 'undefined') {
    window.NotificationCenter = NotificationCenter;
    window.notificationCenter = notificationCenter;
}

// ============================================================================
// AUTO-INITIALIZE WHEN DOM IS READY
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    notificationCenter.init();
});
