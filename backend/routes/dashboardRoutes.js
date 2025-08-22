// backend/routes/dashboardRoutes.js

const ErrorHandler = require('../middleware/errorHandler');
const BaseRoutes = require('./BaseRoutes');

class DashboardRoutes extends BaseRoutes {
    async handle(req, res, context) {
        const { authMiddleware, parsedUrl } = context;
        const pathname = parsedUrl.pathname;
        const method = req.method.toUpperCase();

        // This simplified structure uses the middleware correctly.
        // It ensures requireAuth runs and attaches req.user before any route logic.
        authMiddleware.requireAuth(req, res, async () => {
            if (pathname === '/dashboard/home' && method === 'GET') {
                return await this.getHomeDashboardData(req, res, context);
            }
            
            // Add any other future dashboard-related routes inside this block
            // For example:
            // if (pathname === '/dashboard/yearly-report' && method === 'GET') {
            //     return await this.getYearlyReport(req, res, context);
            // }

            this.sendError(res, 404, 'Dashboard endpoint not found');
        });
    }

    async getHomeDashboardData(req, res, { databaseManager }) {
        // Now, req.user is guaranteed to be defined here by the middleware
        const userId = req.user.userId;
        try {
            const [overview, notifications, spendingStats] = await Promise.all([
                this.buildDashboardOverview(databaseManager, userId),
                this.generateDashboardInsights(databaseManager, userId),
                this.buildDashboardStatistics(databaseManager, userId)
            ]);
            
            const homeData = {
                balance: overview.summary.totalBalance,
                monthlyIncome: overview.currentMonth.income,
                monthlyExpenses: overview.currentMonth.expenses,
                notifications: notifications,
                spendingByCategory: spendingStats.byCategory,
                expenseChangePercentage: 0 // Placeholder as this is a complex comparison
            };

            this.sendSuccess(res, 200, homeData);
        } catch (error) {
            ErrorHandler.logError(error, req);
            this.sendError(res, 500, 'Failed to retrieve home dashboard data');
        }
    }

    async buildDashboardOverview(databaseManager, userId) {
        try {
            const currentMonthISO = new Date().toISOString().slice(0, 7);
            
            const monthlyTotals = await databaseManager.get(`
                SELECT
                    COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as income,
                    COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as expenses
                FROM transactions 
                WHERE user_id = ? AND SUBSTR(date, 1, 7) = ?`,
                [userId, currentMonthISO]
            );

            const totalBalance = await this.calculateTotalBalance(databaseManager, userId);
            
            return {
                currentMonth: {
                    income: monthlyTotals.income || 0,
                    expenses: monthlyTotals.expenses || 0
                },
                summary: {
                    totalBalance: totalBalance
                }
            };
        } catch (error) {
            throw new Error(`Failed to build dashboard overview: ${error.message}`);
        }
    }

    async generateDashboardInsights(databaseManager, userId) {
        try {
            const insights = [];
            const thirtyDaysAgo = new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0];
            
            const largeTransaction = await databaseManager.get(
                'SELECT amount, category FROM transactions WHERE user_id = ? AND type = "expense" AND amount > 200 AND date >= ? ORDER BY date DESC LIMIT 1',
                [userId, thirtyDaysAgo]
            );

            if (largeTransaction) {
                 insights.push({ type: 'info', text: `Keni një transaksion të pazakontë: -${largeTransaction.amount}€ në ${largeTransaction.category}.` });
            }

            // These are placeholders and can be developed further
            insights.push({ type: 'warning', text: 'Pagesa e internetit skadon pas 2 ditësh.' });
            insights.push({ type: 'danger', text: 'Keni tejkaluar buxhetin për Ushqime këtë muaj.' });
            insights.push({ type: 'info', text: 'Keni kursyer më shumë këtë muaj!' });

            return insights.slice(0, 4);
        } catch (error) {
            throw new Error(`Failed to generate dashboard insights: ${error.message}`);
        }
    }

    async buildDashboardStatistics(databaseManager, userId) {
        const transactions = await databaseManager.all(
            "SELECT amount, category FROM transactions WHERE user_id = ? AND type = 'expense'",
            [userId]
        );
            
        const categoryStats = {};
        for (let transaction of transactions) {
            if (!categoryStats[transaction.category]) {
                categoryStats[transaction.category] = 0;
            }
            categoryStats[transaction.category] += transaction.amount;
        }
            
        return {
            byCategory: categoryStats,
        };
    }

    async calculateTotalBalance(databaseManager, userId) {
        const result = await databaseManager.get(`
            SELECT 
                COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as totalIncome,
                COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as totalExpenses
            FROM transactions 
            WHERE user_id = ?`, 
            [userId]
        );
        return (result.totalIncome || 0) - (result.totalExpenses || 0);
    }
}

module.exports = new DashboardRoutes();