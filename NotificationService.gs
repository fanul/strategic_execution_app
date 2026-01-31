/**
 * NotificationService.js
 * Notification and email service with comprehensive features
 */

const NotificationService = {
  /**
   * Send notification to user
   * @param {string} userId - User ID
   * @param {string} type - Notification type
   * @param {string} title - Notification title
   * @param {string} message - Notification message
   * @param {string} linkUrl - Optional link URL
   * @returns {Object} Response
   */
  sendNotification(userId, type, title, message, linkUrl = null) {
    try {
      const notification = {
        notification_id: generateUUID(),
        user_id: userId,
        notification_type: type,
        title: title,
        message: message,
        link_url: linkUrl,
        is_read: false,
        read_at: null,
        created_at: formatDateTime(new Date()),
        expires_at: null,
        priority: type === 'ERROR' ? 'HIGH' : 'MEDIUM'
      };

      const result = insertRecord(DB_CONFIG.SHEET_NAMES.NOTIFICATIONS, notification);

      // Send email if enabled and high priority
      if (result.success && CONFIG.EMAIL && CONFIG.EMAIL.ENABLE_NOTIFICATIONS && notification.priority === 'HIGH') {
        this.sendEmailNotification(userId, title, message);
      }

      return result.success
        ? { success: true, data: notification, message: 'Notification sent' }
        : { success: false, error: result.error };
    } catch (error) {
      Logger.log('NotificationService.sendNotification error: ' + error);
      return { success: false, error: error.toString() };
    }
  },

  /**
   * Send email notification
   * @param {string} userId - User ID
   * @param {string} subject - Email subject
   * @param {string} message - Email message
   * @returns {Object} Response
   */
  sendEmailNotification(userId, subject, message) {
    try {
      const user = UserModel.findById(userId);
      if (!user || !user.email) {
        return { success: false, message: 'User email not found' };
      }

      const htmlBody = this.getEmailTemplate(subject, message);

      MailApp.sendEmail({
        to: user.email,
        subject: `[SEM Alert] ${subject}`,
        htmlBody: htmlBody
      });

      return { success: true, message: 'Email sent successfully' };
    } catch (error) {
      Logger.log('NotificationService.sendEmailNotification error: ' + error);
      return { success: false, error: error.toString() };
    }
  },

  /**
   * Get user notifications
   * @param {string} userId - User ID
   * @param {boolean} unreadOnly - Filter for unread notifications only
   * @returns {Object} Response with notifications
   */
  getUserNotifications(userId, unreadOnly = false) {
    try {
      let notifications = getTableData(DB_CONFIG.SHEET_NAMES.NOTIFICATIONS);
      notifications = notifications.filter(n => n.user_id === userId);

      if (unreadOnly) {
        notifications = notifications.filter(n => !n.is_read);
      }

      // Filter out expired notifications
      const now = new Date();
      notifications = notifications.filter(n => 
        !n.expires_at || new Date(n.expires_at) > now
      );

      // Sort by created_at descending
      notifications.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      return { success: true, data: notifications, count: notifications.length };
    } catch (error) {
      Logger.log('NotificationService.getUserNotifications error: ' + error);
      return { success: false, error: error.toString() };
    }
  },

  /**
   * Mark notification as read
   * @param {string} notificationId - Notification ID
   * @returns {Object} Response
   */
  markAsRead(notificationId) {
    return updateRecord(DB_CONFIG.SHEET_NAMES.NOTIFICATIONS, 'notification_id', notificationId, {
      is_read: true,
      read_at: formatDateTime(new Date())
    });
  },

  /**
   * Mark all user notifications as read
   * @param {string} userId - User ID
   * @returns {Object} Response
   */
  markAllAsRead(userId) {
    try {
      const notifications = getTableData(DB_CONFIG.SHEET_NAMES.NOTIFICATIONS);
      const userNotifications = notifications.filter(n => n.user_id === userId && !n.is_read);

      userNotifications.forEach(n => {
        this.markAsRead(n.notification_id);
      });

      return { success: true, message: `Marked ${userNotifications.length} notifications as read` };
    } catch (error) {
      Logger.log('NotificationService.markAllAsRead error: ' + error);
      return { success: false, error: error.toString() };
    }
  },

  /**
   * Get HTML email template
   * @param {string} title - Email title
   * @param {string} content - Email content
   * @returns {string} HTML template
   */
  getEmailTemplate(title, content) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4285f4; color: white; padding: 20px; text-align: center; }
          .content { background-color: #f9f9f9; padding: 20px; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Strategic Execution Monitoring</h2>
          </div>
          <div class="content">
            <h3>${title}</h3>
            <p>${content}</p>
          </div>
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>&copy; ${new Date().getFullYear()} Strategic Execution Monitoring</p>
          </div>
        </div>
      </body>
      </html>
    `;
  },

  /**
   * Broadcast notification to multiple users
   * @param {Array} userIds - Array of user IDs
   * @param {string} type - Notification type
   * @param {string} title - Title
   * @param {string} message - Message
   * @returns {Object} Response
   */
  broadcastNotification(userIds, type, title, message) {
    try {
      let successCount = 0;
      let errorCount = 0;

      userIds.forEach(userId => {
        const result = this.sendNotification(userId, type, title, message);
        if (result.success) {
          successCount++;
        } else {
          errorCount++;
        }
      });

      return {
        success: true,
        message: `Sent to ${successCount} users, ${errorCount} errors`,
        data: { successCount, errorCount }
      };
    } catch (error) {
      Logger.log('NotificationService.broadcastNotification error: ' + error);
      return { success: false, error: error.toString() };
    }
  },

  /**
   * Checks for critical KPIs and sends alerts
   */
  checkAndNotifyCriticalKPIs() {
    try {
      const kpis = getTableData(DB_CONFIG.SHEET_NAMES.KPIS);
      const criticalKPIs = kpis.filter(kpi => kpi.status === 'OFF_TRACK');
      
      if (criticalKPIs.length > 0) {
        // Get admin users
        const users = UserModel.getAll({ is_active: true });
        const adminUsers = users.filter(u => {
          const role = RoleModel.findById(u.role_id);
          return role && role.is_admin;
        });
        
        const listHtml = criticalKPIs.map(k => `<li>${k.kpi_name}: ${k.status}</li>`).join('');
        const message = `<p>The following KPIs are off track:</p><ul>${listHtml}</ul>`;
        
        adminUsers.forEach(admin => {
          this.sendNotification(admin.user_id, 'ERROR', 
            `Action Required: ${criticalKPIs.length} KPIs Off Track`, 
            message);
        });
      }
      
      return { success: true, message: `Checked ${kpis.length} KPIs, found ${criticalKPIs.length} critical` };
    } catch (error) {
      Logger.log('NotificationService.checkAndNotifyCriticalKPIs error: ' + error);
      return { success: false, error: error.toString() };
    }
  }
};

