import { Request, Response, NextFunction } from 'express';
import pool from '../config/database';
import { ExportData } from '../models/ExportModel';
import { parseExcel } from '../utils/excelParser';
import fs from 'fs';

export const getAllExports = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const offset = (page - 1) * limit;

        const result = await pool.query('SELECT * FROM export_data ORDER BY created_at DESC LIMIT $1 OFFSET $2', [limit, offset]);
        const countResult = await pool.query('SELECT COUNT(*) FROM export_data');

        res.status(200).json({
            data: result.rows,
            total: parseInt(countResult.rows[0].count),
            page,
            limit
        });
    } catch (error) {
        next(error);
    }
};

export const createExport = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data: ExportData = req.body;
        const query = `
            INSERT INTO export_data (
                job_no, inv_no, date, s_bill_no, s_bill_date, leo_date, forwarder_name,
                booking_no, container_no, size, s_line, pod
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING *;
        `;
        const values = [
            data.job_no, data.inv_no, data.date, data.s_bill_no, data.s_bill_date, data.leo_date, data.forwarder_name,
            data.booking_no, data.container_no, data.size, data.s_line, data.pod
        ];

        const result = await pool.query(query, values);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        next(error);
    }
};

export const updateExport = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = parseInt(req.params.id || '0');
        const data: ExportData = req.body;
        const query = `
            UPDATE export_data SET
                job_no = $1, inv_no = $2, date = $3, s_bill_no = $4, s_bill_date = $5, leo_date = $6, forwarder_name = $7,
                booking_no = $8, container_no = $9, size = $10, s_line = $11, pod = $12, updated_at = NOW()
            WHERE id = $13
            RETURNING *;
        `;
        const values = [
            data.job_no, data.inv_no, data.date, data.s_bill_no, data.s_bill_date, data.leo_date, data.forwarder_name,
            data.booking_no, data.container_no, data.size, data.s_line, data.pod, id
        ];

        const result = await pool.query(query, values);
        if (result.rows.length === 0) {
            res.status(404).json({ message: 'Export record not found' });
            return;
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        next(error);
    }
};

export const deleteExport = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = parseInt(req.params.id || '0');
        const result = await pool.query('DELETE FROM export_data WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            res.status(404).json({ message: 'Export record not found' });
            return;
        }
        res.status(200).json({ message: 'Export record deleted successfully' });
    } catch (error) {
        next(error);
    }
};

export const bulkUploadExports = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.file) {
            res.status(400).json({ message: 'No file uploaded' });
            return;
        }

        const filePath = req.file.path;
        const parsedData = parseExcel(filePath);

        // Map Excel data to DB columns
        const values: any[] = [];
        const query = `
            INSERT INTO export_data (
                job_no, inv_no, date, s_bill_no, s_bill_date, leo_date, forwarder_name,
                booking_no, container_no, size, s_line, pod
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING *;
        `;

        const results = [];

        // Helper to parse date
        const parseDate = (dateStr: any) => {
            if (!dateStr) return null;
            // Handle Excel serial date if necessary, or string date
            const date = new Date(dateStr);
            return isNaN(date.getTime()) ? null : date;
        };

        for (const row of parsedData) {
            // Normalize keys to lowercase for easier matching
            const normalizedRow: any = {};
            Object.keys(row).forEach(key => {
                normalizedRow[key.toLowerCase().trim()] = row[key];
            });

            const rowValues = [
                normalizedRow['job no'] || '',
                normalizedRow['invoice no'] || '',
                parseDate(normalizedRow['invoice date']),
                normalizedRow['s/bill no'] || '',
                parseDate(normalizedRow['s/bill date']),
                parseDate(normalizedRow['leo date']),
                normalizedRow['forwarder name'] || '',
                normalizedRow['booking no'] || '',
                normalizedRow['container no'] || '',
                normalizedRow['size'] || '',
                normalizedRow['shipping line'] || '',
                normalizedRow['pod - port of discharge'] || normalizedRow['pod'] || ''
            ];

            try {
                const result = await pool.query(query, rowValues);
                results.push(result.rows[0]);
            } catch (err) {
                console.error('Error inserting row:', row, err);
                // Continue with other rows or throw? Let's continue and report errors?
                // For now, let's just log it.
            }
        }

        // Clean up uploaded file
        fs.unlinkSync(filePath);

        res.status(201).json({ message: 'Bulk upload processed', count: results.length, total: parsedData.length });
    } catch (error) {
        next(error);
    }
};
