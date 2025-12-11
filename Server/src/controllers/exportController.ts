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
                s_no, job_no, inv_no, date, s_bill_no, s_bill_date, leo_date, forwarder_name,
                booking_no, container_no, size, s_line, pod, train_no, wagon_no, wagon_date,
                reward, inv_value_fc, fob_value_inr, dbk_amount, igst_amount, egm_no, egm_date,
                current_qty, dbk_scroll_no, scroll_date, remarks
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27)
            RETURNING *;
        `;
        const values = [
            data.s_no, data.job_no, data.inv_no, data.date, data.s_bill_no, data.s_bill_date, data.leo_date, data.forwarder_name,
            data.booking_no, data.container_no, data.size, data.s_line, data.pod, data.train_no, data.wagon_no, data.wagon_date,
            data.reward, data.inv_value_fc, data.fob_value_inr, data.dbk_amount, data.igst_amount, data.egm_no, data.egm_date,
            data.current_qty, data.dbk_scroll_no, data.scroll_date, data.remarks
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
                s_no = $1, job_no = $2, inv_no = $3, date = $4, s_bill_no = $5, s_bill_date = $6, leo_date = $7, forwarder_name = $8,
                booking_no = $9, container_no = $10, size = $11, s_line = $12, pod = $13, train_no = $14, wagon_no = $15, wagon_date = $16,
                reward = $17, inv_value_fc = $18, fob_value_inr = $19, dbk_amount = $20, igst_amount = $21, egm_no = $22, egm_date = $23,
                current_qty = $24, dbk_scroll_no = $25, scroll_date = $26, remarks = $27, updated_at = NOW()
            WHERE id = $28
            RETURNING *;
        `;
        const values = [
            data.s_no, data.job_no, data.inv_no, data.date, data.s_bill_no, data.s_bill_date, data.leo_date, data.forwarder_name,
            data.booking_no, data.container_no, data.size, data.s_line, data.pod, data.train_no, data.wagon_no, data.wagon_date,
            data.reward, data.inv_value_fc, data.fob_value_inr, data.dbk_amount, data.igst_amount, data.egm_no, data.egm_date,
            data.current_qty, data.dbk_scroll_no, data.scroll_date, data.remarks, id
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

        if (parsedData.length === 0) {
            fs.unlinkSync(filePath);
            res.status(400).json({ message: 'No data found in Excel file' });
            return;
        }

        // Query with all fields matching the Excel template headers
        const query = `
            INSERT INTO export_data (
                s_no, job_no, inv_no, date, s_bill_no, s_bill_date, leo_date, forwarder_name,
                booking_no, container_no, size, s_line, pod, train_no, wagon_no, wagon_date,
                reward, inv_value_fc, fob_value_inr, dbk_amount, igst_amount, egm_no, egm_date,
                current_qty, dbk_scroll_no, scroll_date, remarks
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27)
            RETURNING *;
        `;

        const results = [];

        // Helper to parse date - handles Excel serial dates and string dates
        const parseDate = (dateStr: any) => {
            if (!dateStr) return null;
            if (String(dateStr).toLowerCase().trim() === 'do') return null; // Will be filled later
            // Handle Excel serial date number
            if (typeof dateStr === 'number') {
                const excelEpoch = new Date(1899, 11, 30);
                const date = new Date(excelEpoch.getTime() + dateStr * 86400000);
                return isNaN(date.getTime()) ? null : date;
            }
            const date = new Date(dateStr);
            return isNaN(date.getTime()) ? null : date;
        };

        // Helper to parse decimal values
        const parseDecimal = (val: any) => {
            if (val === null || val === undefined || val === '') return null;
            if (String(val).toLowerCase().trim() === 'do') return null; // Will be filled later
            const num = parseFloat(String(val).replace(/,/g, ''));
            return isNaN(num) ? null : num;
        };

        // Helper to check if value is "do" (meaning copy from first row)
        const isDo = (val: any): boolean => {
            if (val === null || val === undefined) return false;
            return String(val).toLowerCase().trim() === 'do';
        };

        // Helper to get value, or null if empty/do
        const getValue = (val: any): string => {
            if (val === null || val === undefined || val === '') return '';
            if (isDo(val)) return '';
            return String(val).trim();
        };

        // First pass: find the first row with actual data (not "do") for each column
        // This will be our reference row for filling "do" values
        const referenceValues: { [key: string]: any } = {};
        const columnKeys = [
            's/no', 'job.no', 'inv.no.', 'date', 's/bill no.', 's/bill date', 'leo date',
            'forward name', 'forwarder name', 'booking no.', 'contr.no.', 'contr.no',
            'size', 's/line', 'pod', 'train no.', 'wagon no.', 'wagon date', 'reward',
            'inv.value (fc)', 'fob value (inr)', 'dbk amt.(inr)', 'igst amount (inr)',
            'egm no.', 'egm date', 'current qty', 'dbk scroll no.', 'scroll dt.', 'remarks'
        ];

        // Find reference values from the first row that has actual data
        for (const row of parsedData) {
            const normalizedRow: any = {};
            Object.keys(row).forEach(key => {
                normalizedRow[key.toLowerCase().trim()] = row[key];
            });

            for (const key of columnKeys) {
                if (referenceValues[key] === undefined) {
                    const val = normalizedRow[key];
                    if (val !== null && val !== undefined && val !== '' && !isDo(val)) {
                        referenceValues[key] = val;
                    }
                }
            }
        }

        console.log('Reference values for "do" autofill:', referenceValues);

        // Second pass: process each row and replace "do" with reference values
        for (const row of parsedData) {
            const normalizedRow: any = {};
            Object.keys(row).forEach(key => {
                normalizedRow[key.toLowerCase().trim()] = row[key];
            });

            // Helper to get value with "do" replacement
            const getValueWithDoFill = (keys: string[]): any => {
                for (const key of keys) {
                    const val = normalizedRow[key];
                    if (val !== null && val !== undefined && val !== '') {
                        if (isDo(val)) {
                            // Find reference value from any of the keys
                            for (const refKey of keys) {
                                if (referenceValues[refKey] !== undefined) {
                                    return referenceValues[refKey];
                                }
                            }
                            return '';
                        }
                        return val;
                    }
                }
                return '';
            };

            // Map Excel headers to database columns with "do" autofill
            const rowValues = [
                getValue(normalizedRow['s/no']) || getValue(normalizedRow['s.no']) || '',
                getValueWithDoFill(['job.no', 'job_no']),
                getValueWithDoFill(['inv.no.', 'inv_no']),
                parseDate(getValueWithDoFill(['date'])),
                getValueWithDoFill(['s/bill no.', 's_bill_no']),
                parseDate(getValueWithDoFill(['s/bill date', 's_bill_date'])),
                parseDate(getValueWithDoFill(['leo date', 'leo_date'])),
                getValueWithDoFill(['forward name', 'forwarder name', 'forwarder_name']),
                getValueWithDoFill(['booking no.', 'booking_no']),
                getValueWithDoFill(['contr.no.', 'contr.no', 'container_no']),
                getValueWithDoFill(['size']),
                getValueWithDoFill(['s/line', 's_line']),
                getValueWithDoFill(['pod']),
                getValueWithDoFill(['train no.', 'train_no']),
                getValueWithDoFill(['wagon no.', 'wagon_no']),
                parseDate(getValueWithDoFill(['wagon date', 'wagon_date'])),
                getValueWithDoFill(['reward']),
                parseDecimal(getValueWithDoFill(['inv.value (fc)', 'inv_value_fc'])),
                parseDecimal(getValueWithDoFill(['fob value (inr)', 'fob_value_inr'])),
                parseDecimal(getValueWithDoFill(['dbk amt.(inr)', 'dbk_amount'])),
                parseDecimal(getValueWithDoFill(['igst amount (inr)', 'igst_amount'])),
                getValueWithDoFill(['egm no.', 'egm_no']),
                parseDate(getValueWithDoFill(['egm date', 'egm_date'])),
                getValueWithDoFill(['current qty', 'current_qty']),
                getValueWithDoFill(['dbk scroll no.', 'dbk_scroll_no']),
                parseDate(getValueWithDoFill(['scroll dt.', 'scroll_date'])),
                getValueWithDoFill(['remarks'])
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
