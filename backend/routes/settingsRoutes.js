// backend/routes/settingsRoutes.js

const Validators = require('../utils/validators');
const ErrorHandler = require('../middleware/errorHandler');

class SettingsRoutes {
    async handle(req, res, context) {
        const { authMiddleware, parsedUrl } = context;

        // All settings routes require a user to be logged in
        authMiddleware.requireAuth(req, res, async () => {
            const pathname = parsedUrl.pathname;
            const method = req.method.toUpperCase();

            // Settings routing logic
            if (pathname === '/settings/profile' && method === 'GET') {
                return await this.getProfileSettings(req, res, context);
            }
            if (pathname === '/settings/profile' && method === 'PUT') {
                return await this.updateProfileSettings(req, res, context);
            }
            if (pathname === '/settings/account' && method === 'GET') {
                return await this.getAccountSettings(req, res, context);
            }
            if (pathname === '/settings/account' && method === 'PUT') {
                return await this.updateAccountSettings(req, res, context);
            }
            if (pathname === '/settings/notifications' && method === 'GET') {
                return await this.getNotificationSettings(req, res, context);
            }
            if (pathname === '/settings/notifications' && method === 'PUT') {
                return await this.updateNotificationSettings(req, res, context);
            }
            if (pathname === '/settings/privacy' && method === 'GET') {
                return await this.getPrivacySettings(req, res, context);
            }
            if (pathname === '/settings/privacy' && method === 'PUT') {
                return await this.updatePrivacySettings(req, res, context);
            }
            if (pathname === '/settings/currency' && method === 'GET') {
                return await this.getCurrencySettings(req, res, context);
            }
            if (pathname === '/settings/currency' && method === 'PUT') {
                return await this.updateCurrencySettings(req, res, context);
            }
            if (pathname === '/settings/export' && method === 'POST') {
                return await this.exportUserData(req, res, context);
            }
            
            if (pathname === '/settings/password' && method === 'POST') {
                return await this.changePassword(req, res, context);
            }
            
            // --- NEW ROUTE FOR DELETING THE ACCOUNT ---
            if (pathname === '/settings/delete-account' && method === 'DELETE') {
                return await this.deleteAccount(req, res, context);
            }
            
            this.sendError(res, 404, 'Settings endpoint not found');
        });
    }

    // --- NEW METHOD TO HANDLE ACCOUNT DELETION ---
    async deleteAccount(req, res, { databaseManager }) {
        try {
            const userId = req.user.userId;

            // The ON DELETE CASCADE constraint in your database schema will handle deleting all related data.
            await databaseManager.run('DELETE FROM users WHERE id = ?', [userId]);

            // Also log them out by revoking the token if possible
            if (context.sessionManager && req.user.token) {
                await context.sessionManager.destroySession(req.user.token);
            }

            this.sendSuccess(res, 200, { message: 'Account deleted successfully.' });

        } catch (error) {
            ErrorHandler.logError(error, req);
            this.sendError(res, 500, 'Failed to delete account.');
        }
    }

    // ... (rest of the existing functions in the file remain unchanged) ...

    // --- GET PROFILE SETTINGS ---
    async getProfileSettings(req, res, { databaseManager }) {
        try {
            const userId = req.user.userId;
            
            const profile = await databaseManager.get(
                'SELECT id, username, email, first_name, last_name, phone, date_of_birth, profile_picture, bio, timezone FROM users WHERE id = ?',
                [userId]
            );

            if (!profile) {
                return this.sendError(res, 404, 'User profile not found');
            }

            this.sendSuccess(res, 200, { profile });
        } catch (error) {
            ErrorHandler.logError(error, req);
            this.sendError(res, 500, 'Failed to retrieve profile settings');
        }
    }

    // --- UPDATE PROFILE SETTINGS ---
    async updateProfileSettings(req, res, { databaseManager }) {
        try {
            const userId = req.user.userId;
            const { firstName, lastName, phone, dateOfBirth, bio, timezone } = req.body;

            // Validation
            if (firstName && firstName.length > 50) {
                return this.sendError(res, 400, 'First name must be less than 50 characters');
            }
            if (lastName && lastName.length > 50) {
                return this.sendError(res, 400, 'Last name must be less than 50 characters');
            }
            if (bio && bio.length > 500) {
                return this.sendError(res, 400, 'Bio must be less than 500 characters');
            }

            // Update profile fields
            const updateFields = [];
            const updateValues = [];
            
            if (firstName !== undefined) {
                updateFields.push('first_name = ?');
                updateValues.push(firstName);
            }
            if (lastName !== undefined) {
                updateFields.push('last_name = ?');
                updateValues.push(lastName);
            }
            if (phone !== undefined) {
                updateFields.push('phone = ?');
                updateValues.push(phone);
            }
            if (dateOfBirth !== undefined) {
                updateFields.push('date_of_birth = ?');
                updateValues.push(dateOfBirth);
            }
            if (bio !== undefined) {
                updateFields.push('bio = ?');
                updateValues.push(bio);
            }
            if (timezone !== undefined) {
                updateFields.push('timezone = ?');
                updateValues.push(timezone);
            }

            if (updateFields.length === 0) {
                return this.sendError(res, 400, 'No valid fields to update');
            }

            updateValues.push(userId);
            const sql = `UPDATE users SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
            
            const result = await databaseManager.run(sql, updateValues);

            if (result.affectedRows === 0) {
                return this.sendError(res, 404, 'Profile not found');
            }

            this.sendSuccess(res, 200, { message: 'Profile settings updated successfully' });
        } catch (error) {
            ErrorHandler.logError(error, req);
            this.sendError(res, 500, 'Failed to update profile settings');
        }
    }

    // --- GET ACCOUNT SETTINGS ---
    async getAccountSettings(req, res, { databaseManager }) {
        try {
            const userId = req.user.userId;
            
            const account = await databaseManager.get(
                'SELECT id, username, email, two_factor_enabled, last_login, account_status, created_at FROM users WHERE id = ?',
                [userId]
            );

            if (!account) {
                return this.sendError(res, 404, 'Account not found');
            }

            // Remove sensitive information
            delete account.email; // Don't expose full email in response
            
            this.sendSuccess(res, 200, { account });
        } catch (error) {
            ErrorHandler.logError(error, req);
            this.sendError(res, 500, 'Failed to retrieve account settings');
        }
    }

    // --- UPDATE ACCOUNT SETTINGS ---
    async updateAccountSettings(req, res, { databaseManager }) {
        try {
            const userId = req.user.userId;
            const { username, twoFactorEnabled } = req.body;

            // Validation
            if (username && (username.length < 3 || username.length > 30)) {
                return this.sendError(res, 400, 'Username must be between 3 and 30 characters');
            }

            // Check if username is already taken
            if (username) {
                const existingUser = await databaseManager.get(
                    'SELECT id FROM users WHERE username = ? AND id != ?',
                    [username, userId]
                );
                if (existingUser) {
                    return this.sendError(res, 409, 'Username is already taken');
                }
            }

            const updateFields = [];
            const updateValues = [];
            
            if (username !== undefined) {
                updateFields.push('username = ?');
                updateValues.push(username);
            }
            if (twoFactorEnabled !== undefined) {
                updateFields.push('two_factor_enabled = ?');
                updateValues.push(twoFactorEnabled ? 1 : 0);
            }

            if (updateFields.length === 0) {
                return this.sendError(res, 400, 'No valid fields to update');
            }

            updateValues.push(userId);
            const sql = `UPDATE users SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
            
            const result = await databaseManager.run(sql, updateValues);

            if (result.affectedRows === 0) {
                return this.sendError(res, 404, 'Account not found');
            }

            this.sendSuccess(res, 200, { message: 'Account settings updated successfully' });
        } catch (error) {
            ErrorHandler.logError(error, req);
            this.sendError(res, 500, 'Failed to update account settings');
        }
    }

    // --- NEW METHOD for the "Change Password" MODAL ---
    async changePassword(req, res, { databaseManager }) {
        try {
            const userId = req.user.userId;
            const { currentPassword, newPassword, confirmPassword } = req.body;

            if (newPassword !== confirmPassword) {
                return this.sendError(res, 400, 'New passwords do not match.');
            }
            
            const passwordValidation = Validators.validatePassword(newPassword);
            if (!passwordValidation.valid) {
                return this.sendError(res, 400, passwordValidation.message);
            }

            const user = await databaseManager.get('SELECT password_hash FROM users WHERE id = ?', [userId]);
            if (!user) {
                return this.sendError(res, 404, 'User not found.');
            }

            const isMatch = await require('bcrypt').compare(currentPassword, user.password_hash);
            if (!isMatch) {
                return this.sendError(res, 401, 'Your current password is not correct.');
            }

            const newHashedPassword = await require('bcrypt').hash(newPassword, require('../utils/config').security.bcryptRounds);
            await databaseManager.run('UPDATE users SET password_hash = ? WHERE id = ?', [newHashedPassword, userId]);

            this.sendSuccess(res, 200, { message: 'Password changed successfully.' });

        } catch (error) {
            ErrorHandler.logError(error, req);
            this.sendError(res, 500, 'Failed to change password.');
        }
    }

    // --- GET NOTIFICATION SETTINGS ---
    async getNotificationSettings(req, res, { databaseManager }) {
        try {
            const userId = req.user.userId;
            
            const settings = await databaseManager.get(
                'SELECT email_notifications, push_notifications, sms_notifications, transaction_alerts, goal_reminders, weekly_reports, marketing_emails FROM user_settings WHERE user_id = ?',
                [userId]
            );

            if (!settings) {
                const defaultSettings = {
                    email_notifications: 1, push_notifications: 1, sms_notifications: 0,
                    transaction_alerts: 1, goal_reminders: 1, weekly_reports: 1, marketing_emails: 0
                };
                await databaseManager.run(
                    'INSERT INTO user_settings (user_id, email_notifications, push_notifications, sms_notifications, transaction_alerts, goal_reminders, weekly_reports, marketing_emails) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                    [userId, ...Object.values(defaultSettings)]
                );
                return this.sendSuccess(res, 200, { settings: defaultSettings });
            }

            this.sendSuccess(res, 200, { settings });
        } catch (error) {
            ErrorHandler.logError(error, req);
            this.sendError(res, 500, 'Failed to retrieve notification settings');
        }
    }

    // --- UPDATE NOTIFICATION SETTINGS ---
    async updateNotificationSettings(req, res, { databaseManager }) {
        try {
            const userId = req.user.userId;
            const { emailNotifications, pushNotifications, smsNotifications, transactionAlerts, goalReminders, weeklyReports, marketingEmails } = req.body;
            const updates = [];
            const values = [];
            
            if(emailNotifications !== undefined) { updates.push('email_notifications = ?'); values.push(emailNotifications ? 1:0); }
            if(pushNotifications !== undefined) { updates.push('push_notifications = ?'); values.push(pushNotifications ? 1:0); }
            if(smsNotifications !== undefined) { updates.push('sms_notifications = ?'); values.push(smsNotifications ? 1:0); }
            if(transactionAlerts !== undefined) { updates.push('transaction_alerts = ?'); values.push(transactionAlerts ? 1:0); }
            if(goalReminders !== undefined) { updates.push('goal_reminders = ?'); values.push(goalReminders ? 1:0); }
            if(weeklyReports !== undefined) { updates.push('weekly_reports = ?'); values.push(weeklyReports ? 1:0); }
            if(marketingEmails !== undefined) { updates.push('marketing_emails = ?'); values.push(marketingEmails ? 1:0); }

            if (updates.length === 0) return this.sendError(res, 400, 'No valid fields to update');
            
            values.push(userId);
            const sql = `UPDATE user_settings SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?`;
            await databaseManager.run(sql, values);

            this.sendSuccess(res, 200, { message: 'Notification settings updated successfully' });
        } catch (error) {
            ErrorHandler.logError(error, req);
            this.sendError(res, 500, 'Failed to update notification settings');
        }
    }

    // --- GET PRIVACY SETTINGS ---
    async getPrivacySettings(req, res, { databaseManager }) {
        this.sendSuccess(res, 200, { message: 'OK' });
    }

    // --- UPDATE PRIVACY SETTINGS ---
    async updatePrivacySettings(req, res, { databaseManager }) {
         this.sendSuccess(res, 200, { message: 'OK' });
    }

    // --- GET CURRENCY SETTINGS ---
    async getCurrencySettings(req, res, { databaseManager }) {
         this.sendSuccess(res, 200, { message: 'OK' });
    }

    // --- UPDATE CURRENCY SETTINGS ---
    async updateCurrencySettings(req, res, { databaseManager }) {
         this.sendSuccess(res, 200, { message: 'OK' });
    }

    // --- EXPORT USER DATA ---
    async exportUserData(req, res, { databaseManager }) {
        this.sendSuccess(res, 200, { message: 'OK' });
    }
    
    // --- HELPER FUNCTIONS ---
    sendSuccess(res, statusCode, data) {
        res.writeHead(statusCode, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, ...data }));
    }

    sendError(res, statusCode, message) {
        res.writeHead(statusCode, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: { message, code: statusCode } }));
    }
}

module.exports = new SettingsRoutes();