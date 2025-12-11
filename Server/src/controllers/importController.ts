import { Request, Response, NextFunction } from 'express';
import pool from '../config/database';
import { ImportData } from '../models/ImportModel';
import { parseExcel } from '../utils/excelParser';
import fs from 'fs';

export const getAllImports = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const offset = (page - 1) * limit;

        const result = await pool.query('SELECT * FROM import_data ORDER BY created_at DESC LIMIT $1 OFFSET $2', [limit, offset]);
        const countResult = await pool.query('SELECT COUNT(*) FROM import_data');

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

export const createImport = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data: ImportData = req.body;
        const query = `
            INSERT INTO import_data (
                job_no, shipper_name, invoice_no_dt, fc_value, description, forwarder_name,
                hbl_no_dt, mbl_no_dt, s_line, pol, pod, terms, container_nos, size,
                nn_copy_rcvd, original_docs_rcvd, eta_date, remarks
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
            RETURNING *;
        `;
        const values = [
            data.job_no, data.shipper_name, data.invoice_no_dt, data.fc_value, data.description, data.forwarder_name,
            data.hbl_no_dt, data.mbl_no_dt, data.s_line, data.pol, data.pod, data.terms, data.container_nos, data.size,
            data.nn_copy_rcvd, data.original_docs_rcvd, data.eta_date, data.remarks
        ];

        const result = await pool.query(query, values);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        next(error);
    }
};

export const updateImport = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = parseInt(req.params.id || '0');
        const data: ImportData = req.body;
        const query = `
            UPDATE import_data SET
                job_no = $1, shipper_name = $2, invoice_no_dt = $3, fc_value = $4, description = $5, forwarder_name = $6,
                hbl_no_dt = $7, mbl_no_dt = $8, s_line = $9, pol = $10, pod = $11, terms = $12, container_nos = $13, size = $14,
                nn_copy_rcvd = $15, original_docs_rcvd = $16, eta_date = $17, remarks = $18, updated_at = NOW()
            WHERE id = $19
            RETURNING *;
        `;
        const values = [
            data.job_no, data.shipper_name, data.invoice_no_dt, data.fc_value, data.description, data.forwarder_name,
            data.hbl_no_dt, data.mbl_no_dt, data.s_line, data.pol, data.pod, data.terms, data.container_nos, data.size,
            data.nn_copy_rcvd, data.original_docs_rcvd, data.eta_date, data.remarks, id
        ];

        const result = await pool.query(query, values);
        if (result.rows.length === 0) {
            res.status(404).json({ message: 'Import record not found' });
            return;
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        next(error);
    }
};

export const deleteImport = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = parseInt(req.params.id || '0');
        const result = await pool.query('DELETE FROM import_data WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            res.status(404).json({ message: 'Import record not found' });
            return;
        }
        res.status(200).json({ message: 'Import record deleted successfully' });
    } catch (error) {
        next(error);
    }
};

export const bulkUploadImports = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.file) {
            res.status(400).json({ message: 'No file uploaded' });
            return;
        }

        const filePath = req.file.path;
        const parsedData = parseExcel(filePath);

        // Map Excel data to DB columns
        const query = `
            INSERT INTO import_data (
                job_no, shipper_name, invoice_no_dt, fc_value, description, forwarder_name,
                hbl_no_dt, mbl_no_dt, s_line, pol, pod, terms, container_nos, size,
                nn_copy_rcvd, original_docs_rcvd, eta_date, remarks
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
            RETURNING *;
        `;

        const results = [];

        // Helper to parse boolean
        const parseBoolean = (val: any) => {
            if (typeof val === 'boolean') return val;
            if (typeof val === 'string') {
                const lower = val.toLowerCase().trim();
                return lower === 'yes' || lower === 'true' || lower === '1';
            }
            return false;
        };

        for (const row of parsedData) {
            // Normalize keys to lowercase for easier matching
            const normalizedRow: any = {};
            Object.keys(row).forEach(key => {
                normalizedRow[key.toLowerCase().trim()] = row[key];
            });

            const rowValues = [
                normalizedRow['job no'] || '',
                normalizedRow['shipper name'] || '',
                normalizedRow['invoice no & date'] || '',
                parseFloat(normalizedRow['fc value']) || 0,
                normalizedRow['description'] || '',
                normalizedRow['forwarder name'] || '',
                normalizedRow['hbl no & date'] || '',
                normalizedRow['mbl no & date'] || '',
                normalizedRow['shipping line'] || '',
                normalizedRow['pol - port of loading'] || normalizedRow['pol'] || '',
                normalizedRow['pod - port of discharge'] || normalizedRow['pod'] || 'Chennai', // Default if missing
                normalizedRow['terms'] || '',
                normalizedRow['container nos'] || '',
                normalizedRow['size'] || '',
                parseBoolean(normalizedRow['n.n copy received']),
                parseBoolean(normalizedRow['original docs received']),
                new Date(), // Default ETA date if missing from excel
                normalizedRow['remarks'] || ''
            ];

            try {
                const result = await pool.query(query, rowValues);
                results.push(result.rows[0]);
            } catch (err) {
                console.error('Error inserting row:', row, err);
            }
        }

        // Clean up uploaded file
        fs.unlinkSync(filePath);

        res.status(201).json({ message: 'Bulk upload processed', count: results.length, total: parsedData.length });
    } catch (error) {
        next(error);
    }
};
