import { Request, Response, NextFunction } from 'express';
import pool from '../config/database';

export const getAnalyticsOverview = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Get monthly trends for the last 6 months
        const monthlyData = await pool.query(`
            WITH months AS (
                SELECT generate_series(
                    date_trunc('month', CURRENT_DATE - INTERVAL '5 months'),
                    date_trunc('month', CURRENT_DATE),
                    '1 month'::interval
                ) as month
            ),
            import_counts AS (
                SELECT date_trunc('month', created_at) as month, COUNT(*) as count
                FROM import_data
                WHERE created_at >= date_trunc('month', CURRENT_DATE - INTERVAL '5 months')
                GROUP BY date_trunc('month', created_at)
            ),
            export_counts AS (
                SELECT date_trunc('month', created_at) as month, COUNT(*) as count
                FROM export_data
                WHERE created_at >= date_trunc('month', CURRENT_DATE - INTERVAL '5 months')
                GROUP BY date_trunc('month', created_at)
            )
            SELECT 
                to_char(m.month, 'Mon') as month,
                COALESCE(i.count, 0)::int as import,
                COALESCE(e.count, 0)::int as export
            FROM months m
            LEFT JOIN import_counts i ON m.month = i.month
            LEFT JOIN export_counts e ON m.month = e.month
            ORDER BY m.month
        `);

        res.status(200).json(monthlyData.rows);
    } catch (error) {
        next(error);
    }
};

export const getForwarderStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Get shipments by forwarder (combined imports and exports)
        const forwarderData = await pool.query(`
            WITH combined AS (
                SELECT forwarder_name FROM import_data WHERE forwarder_name IS NOT NULL AND forwarder_name != ''
                UNION ALL
                SELECT forwarder_name FROM export_data WHERE forwarder_name IS NOT NULL AND forwarder_name != ''
            )
            SELECT forwarder_name as name, COUNT(*) as value
            FROM combined
            GROUP BY forwarder_name
            ORDER BY value DESC
            LIMIT 10
        `);

        res.status(200).json(forwarderData.rows.map(row => ({
            name: row.name,
            value: parseInt(row.value)
        })));
    } catch (error) {
        next(error);
    }
};

export const getContainerStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Get container size distribution
        const containerData = await pool.query(`
            WITH import_sizes AS (
                SELECT size, COUNT(*) as count FROM import_data 
                WHERE size IS NOT NULL AND size != ''
                GROUP BY size
            ),
            export_sizes AS (
                SELECT size, COUNT(*) as count FROM export_data 
                WHERE size IS NOT NULL AND size != ''
                GROUP BY size
            ),
            all_sizes AS (
                SELECT DISTINCT size FROM import_data WHERE size IS NOT NULL AND size != ''
                UNION
                SELECT DISTINCT size FROM export_data WHERE size IS NOT NULL AND size != ''
            )
            SELECT 
                s.size as name,
                COALESCE(i.count, 0)::int as import,
                COALESCE(e.count, 0)::int as export
            FROM all_sizes s
            LEFT JOIN import_sizes i ON s.size = i.size
            LEFT JOIN export_sizes e ON s.size = e.size
            ORDER BY s.size
        `);

        res.status(200).json(containerData.rows);
    } catch (error) {
        next(error);
    }
};

export const getAnalyticsTotals = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Get total shipments
        const importCount = await pool.query('SELECT COUNT(*) FROM import_data');
        const exportCount = await pool.query('SELECT COUNT(*) FROM export_data');
        const totalShipments = parseInt(importCount.rows[0].count) + parseInt(exportCount.rows[0].count);

        // Get import and export volumes
        const importVolume = parseInt(importCount.rows[0].count);
        const exportVolume = parseInt(exportCount.rows[0].count);

        // Get total FC value from imports (this column should exist)
        let importValueTotal = 0;
        try {
            const importValue = await pool.query('SELECT COALESCE(SUM(fc_value), 0) as total FROM import_data');
            importValueTotal = parseFloat(importValue.rows[0].total) || 0;
        } catch (err) {
            console.log('fc_value column may not exist, using 0');
        }

        // Get total FOB value from exports - handle if column doesn't exist yet
        let exportValueTotal = 0;
        try {
            const exportValue = await pool.query('SELECT COALESCE(SUM(fob_value_inr), 0) as total FROM export_data');
            exportValueTotal = parseFloat(exportValue.rows[0].total) || 0;
        } catch (err) {
            console.log('fob_value_inr column may not exist yet, using 0');
        }

        const totalValue = importValueTotal + exportValueTotal;

        // Calculate month-over-month trends
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
        const thisMonthImports = await pool.query(`
            SELECT COUNT(*) FROM import_data 
            WHERE created_at >= date_trunc('month', CURRENT_DATE)
        `);
        const thisMonthExports = await pool.query(`
            SELECT COUNT(*) FROM export_data 
            WHERE created_at >= date_trunc('month', CURRENT_DATE)
        `);

        const lastMonthTotal = parseInt(lastMonthImports.rows[0].count) + parseInt(lastMonthExports.rows[0].count) || 1;
        const thisMonthTotal = parseInt(thisMonthImports.rows[0].count) + parseInt(thisMonthExports.rows[0].count);
        const totalTrend = Math.round(((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100);

        const lastMonthImportVal = parseInt(lastMonthImports.rows[0].count) || 1;
        const lastMonthExportVal = parseInt(lastMonthExports.rows[0].count) || 1;
        const importTrend = Math.round(((parseInt(thisMonthImports.rows[0].count) - lastMonthImportVal) / lastMonthImportVal) * 100);
        const exportTrend = Math.round(((parseInt(thisMonthExports.rows[0].count) - lastMonthExportVal) / lastMonthExportVal) * 100);

        res.status(200).json({
            totalShipments,
            importVolume,
            exportVolume,
            totalValue,
            totalTrend,
            importTrend,
            exportTrend,
            valueTrend: 15 // Placeholder - would need historical value data
        });
    } catch (error) {
        next(error);
    }
};

export const getStatusStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Since we don't have explicit status field, we'll derive status from documentation
        const statusData = await pool.query(`
            SELECT 
                CASE 
                    WHEN nn_copy_rcvd = true AND original_docs_rcvd = true THEN 'Delivered'
                    WHEN nn_copy_rcvd = true OR original_docs_rcvd = true THEN 'In Transit'
                    ELSE 'Pending'
                END as name,
                COUNT(*) as value
            FROM import_data
            GROUP BY 
                CASE 
                    WHEN nn_copy_rcvd = true AND original_docs_rcvd = true THEN 'Delivered'
                    WHEN nn_copy_rcvd = true OR original_docs_rcvd = true THEN 'In Transit'
                    ELSE 'Pending'
                END
        `);

        res.status(200).json(statusData.rows.map(row => ({
            name: row.name,
            value: parseInt(row.value)
        })));
    } catch (error) {
        next(error);
    }
};
