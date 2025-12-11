import { Request, Response, NextFunction } from 'express';
import pool from '../config/database';

export const getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Get total import records
        const importCountResult = await pool.query('SELECT COUNT(*) FROM import_data');
        const totalImports = parseInt(importCountResult.rows[0].count) || 0;

        // Get total export records
        const exportCountResult = await pool.query('SELECT COUNT(*) FROM export_data');
        const totalExports = parseInt(exportCountResult.rows[0].count) || 0;

        // Get this month's records
        const thisMonthImports = await pool.query(`
            SELECT COUNT(*) FROM import_data 
            WHERE created_at >= date_trunc('month', CURRENT_DATE)
        `);
        const thisMonthExports = await pool.query(`
            SELECT COUNT(*) FROM export_data 
            WHERE created_at >= date_trunc('month', CURRENT_DATE)
        `);
        const thisMonthTotal = parseInt(thisMonthImports.rows[0].count) + parseInt(thisMonthExports.rows[0].count);

        // Get last month's records for comparison
        const lastMonthImports = await pool.query(`
            SELECT COUNT(*) FROM import_data 
            WHERE created_at >= date_trunc('month', CURRENT_DATE - INTERVAL '1 month')
            AND created_at < date_trunc('month', CURRENT_DATE)
        `);
        const lastMonthExports = await pool.query(`
            SELECT COUNT(*) FROM export_data 
            WHERE created_at >= date_trunc('month', CURRENT_DATE - INTERVAL '1 month')
            AND created_at < date_trunc('month', CURRENT_DATE)
        `);

        // Calculate trends
        const lastMonthImportCount = parseInt(lastMonthImports.rows[0].count) || 1;
        const lastMonthExportCount = parseInt(lastMonthExports.rows[0].count) || 1;
        const importTrend = Math.round(((parseInt(thisMonthImports.rows[0].count) - lastMonthImportCount) / lastMonthImportCount) * 100);
        const exportTrend = Math.round(((parseInt(thisMonthExports.rows[0].count) - lastMonthExportCount) / lastMonthExportCount) * 100);

        // Get pending reviews (e.g., records without complete documentation)
        const pendingReviews = await pool.query(`
            SELECT COUNT(*) FROM import_data 
            WHERE nn_copy_rcvd = false OR original_docs_rcvd = false
        `);

        res.status(200).json({
            totalImports,
            totalExports,
            thisMonthTotal,
            pendingReviews: parseInt(pendingReviews.rows[0].count) || 0,
            importTrend,
            exportTrend
        });
    } catch (error) {
        next(error);
    }
};

export const getRecentActivity = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const limit = parseInt(req.query.limit as string) || 10;

        // Get recent imports
        const recentImports = await pool.query(`
            SELECT id, job_no, 'import' as type, created_at, updated_at
            FROM import_data
            ORDER BY GREATEST(created_at, updated_at) DESC
            LIMIT $1
        `, [limit]);

        // Get recent exports
        const recentExports = await pool.query(`
            SELECT id, job_no, 'export' as type, created_at, updated_at
            FROM export_data
            ORDER BY GREATEST(created_at, updated_at) DESC
            LIMIT $1
        `, [limit]);

        // Combine and sort by date
        const combined = [...recentImports.rows, ...recentExports.rows];
        combined.sort((a, b) => {
            const dateA = new Date(Math.max(new Date(a.created_at).getTime(), new Date(a.updated_at || a.created_at).getTime()));
            const dateB = new Date(Math.max(new Date(b.created_at).getTime(), new Date(b.updated_at || b.created_at).getTime()));
            return dateB.getTime() - dateA.getTime();
        });

        // Format the activity items
        const activity = combined.slice(0, limit).map(item => {
            const createdAt = new Date(item.created_at);
            const updatedAt = item.updated_at ? new Date(item.updated_at) : createdAt;
            const action = updatedAt > createdAt ? 'Updated' : 'Added';
            const time = formatTimeAgo(Math.max(createdAt.getTime(), updatedAt.getTime()));

            return {
                id: item.id,
                type: item.type,
                jobNo: item.job_no,
                action,
                time
            };
        });

        res.status(200).json(activity);
    } catch (error) {
        next(error);
    }
};

// Helper function to format time ago
function formatTimeAgo(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
}
