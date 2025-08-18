/**
 * User Routes Handler
 * Handles user profile management and user-related operations
 */


const Validators = require('../utils/validators');
const ErrorHandler = require('../middleware/errorHandler');
const bcrypt = require('bcrypt');
const config = require('../utils/config');

class UserRoutes {
    async handle(req, res, context) {
        const { authMiddleware, parsedUrl } = context;
        const method = req.method.toUpperCase();

        // All routes here are protected and require authentication
        authMiddleware.requireAuth(req, res, async () => {
            const pathname = parsedUrl.pathname;

            // Route: GET /user/profile -> Fetches the user's complete profile
            if (pathname === '/user/profile' && method === 'GET') {
                return await this.getProfile(req, res, context);
            }
            // Route: PUT /user/profile -> Handles updates from the "Profili" section
            if (pathname === '/user/profile' && method === 'PUT') {
                return await this.updateProfile(req, res, context);
            }
            // Route: POST /user/password -> Securely handles password changes
            if (pathname === '/user/password' && method === 'POST') {
                return await this.changePassword(req, res, context);
            }
            
            // Your other existing user-related routes
            if (pathname === '/user/balance' && method === 'GET') {
                return await this.getBalance(req, res, context);
            }
            if (pathname === '/user/stats' && method === 'GET') {
                return await this.getUserStats(req, res, context);
            }

            return this.sendError(res, 404, 'User endpoint not found');
        });
    }

    async getProfile(req, res, { databaseManager }) {
        try {
            const userId = req.user.userId;
            const user = await databaseManager.get(`
                SELECT u.id, u.email, u.full_name, u.date_of_birth, u.employment_status, up.job_title
                FROM users u
                LEFT JOIN user_profiles up ON u.id = up.user_id
                WHERE u.id = ? AND u.is_active = 1
            `, [userId]);

            if (!user) {
                return this.sendError(res, 404, 'User not found');
            }
            this.sendSuccess(res, 200, { user });
        } catch (error) {
            ErrorHandler.logError(error, req);
            return this.sendError(res, 500, 'Failed to get profile');
        }
    }

    async updateProfile(req, res, { databaseManager }) {
        try {
            const userId = req.user.userId;
            // This will handle data from your "Ndrysho emrin", "Ndrysho statusin", etc. modals
            const { fullName, status, profession } = req.body;

            const updates = [];
            const params = [];
            if (fullName) {
                updates.push('full_name = ?');
                params.push(fullName);
            }
            if (status) {
                updates.push('employment_status = ?');
                params.push(status);
            }
            
            if (updates.length > 0) {
                params.push(userId);
                await databaseManager.run(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, params);
            }

            if (profession) {
                await databaseManager.run(
                    'INSERT INTO user_profiles (user_id, job_title) VALUES (?, ?) ON DUPLICATE KEY UPDATE job_title = VALUES(job_title)',
                    [userId, profession]
                );
            }

            this.sendSuccess(res, 200, { message: 'Profile updated successfully.' });

        } catch (error) {
            ErrorHandler.logError(error, req);
            return this.sendError(res, 500, 'Failed to update profile');
        }
    }
    
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

            const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
            if (!isMatch) {
                return this.sendError(res, 401, 'Your current password is not correct.');
            }

            const newHashedPassword = await bcrypt.hash(newPassword, config.security.bcryptRounds);
            await databaseManager.run('UPDATE users SET password_hash = ? WHERE id = ?', [newHashedPassword, userId]);

            this.sendSuccess(res, 200, { message: 'Password changed successfully.' });

        } catch (error) {
            ErrorHandler.logError(error, req);
            return this.sendError(res, 500, 'Failed to change password.');
        }
    }

    async getBalance(req, res, { databaseManager }) {
        try {
            const userId = req.user.userId;
            const result = await databaseManager.get(`
                SELECT 
                    COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
                    COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expenses
                FROM transactions 
                WHERE user_id = ?
            `, [userId]);

            const balance = result.total_income - result.total_expenses;

            this.sendSuccess(res, 200, {
                balance: parseFloat(balance.toFixed(2)),
                totalIncome: parseFloat(result.total_income.toFixed(2)),
                totalExpenses: parseFloat(result.total_expenses.toFixed(2))
            });

        } catch (error) {
            ErrorHandler.logError(error, req);
            return this.sendError(res, 500, 'Failed to get balance');
        }
    }

    async getUserStats(req, res, { databaseManager }) {
        try {
            const userId = req.user.userId;
            const stats = await databaseManager.get(`
                SELECT 
                    COUNT(*) as total_transactions
                FROM transactions 
                WHERE user_id = ?
            `, [userId]);

            this.sendSuccess(res, 200, { stats });
        } catch (error) {
            ErrorHandler.logError(error, req);
            return this.sendError(res, 500, 'Failed to get user statistics');
        }
    }

    sendSuccess(res, statusCode, data) {
        res.writeHead(statusCode, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            success: true,
            ...data,
            timestamp: new Date().toISOString()
        }));
    }

    sendError(res, statusCode, message) {
        res.writeHead(statusCode, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            success: false,
            error: {
                message: message,
                code: statusCode,
                timestamp: new Date().toISOString()
            }
        }));
    }
}

module.exports = new UserRoutes();