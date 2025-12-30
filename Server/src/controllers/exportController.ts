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

        const query = `
            SELECT 
                id, s_no, job_no, inv_no, inv_date as date, 
                s_bill_no, s_bill_date, leo_date, forwarder_name, 
                booking_no, contr_no as container_no, size, 
                shipping_line as s_line, pod, train_no, wagon_no, 
                train_wagon_date as wagon_date, reward, 
                inv_value_fc, fob_value_inr, dbk_amt_inr as dbk_amount, 
                igst_amount_inr as igst_amount, egm_no, egm_date, 
                current_qye as current_qty, dbk_scroll_no, scroll_dt as scroll_date, 
                remarks, created_at, updated_at
            FROM export_data 
            ORDER BY created_at DESC 
            LIMIT $1 OFFSET $2
        `;

        const result = await pool.query(query, [limit, offset]);
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
        const data: any = req.body;
        const query = `
            INSERT INTO export_data (
                s_no, job_no, inv_no, inv_date, s_bill_no, s_bill_date, leo_date, forwarder_name,
                booking_no, contr_no, size, shipping_line, pod, train_no, wagon_no, train_wagon_date,
                reward, inv_value_fc, fob_value_inr, dbk_amt_inr, igst_amount_inr, egm_no, egm_date,
                current_qye, dbk_scroll_no, scroll_dt, remarks
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27)
            RETURNING *;
        `;

        // Map frontend expected names to DB names
        const values = [
            data.s_no,
            data.job_no,
            data.inv_no,
            data.inv_date || data.date,
            data.s_bill_no,
            data.s_bill_date,
            data.leo_date,
            data.forwarder_name,
            data.booking_no,
            data.contr_no || data.container_no,
            data.size,
            data.shipping_line || data.s_line,
            data.pod,
            data.train_no,
            data.wagon_no,
            data.train_wagon_date || data.wagon_date,
            data.reward,
            data.inv_value_fc,
            data.fob_value_inr,
            data.dbk_amt_inr || data.dbk_amount,
            data.igst_amount_inr || data.igst_amount,
            data.egm_no,
            data.egm_date,
            data.current_qye || data.current_qty,
            data.dbk_scroll_no,
            data.scroll_dt || data.scroll_date,
            data.remarks
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
        const data: any = req.body;
        const query = `
            UPDATE export_data SET
                s_no = $1, job_no = $2, inv_no = $3, inv_date = $4, s_bill_no = $5, s_bill_date = $6, leo_date = $7, forwarder_name = $8,
                booking_no = $9, contr_no = $10, size = $11, shipping_line = $12, pod = $13, train_no = $14, wagon_no = $15, train_wagon_date = $16,
                reward = $17, inv_value_fc = $18, fob_value_inr = $19, dbk_amt_inr = $20, igst_amount_inr = $21, egm_no = $22, egm_date = $23,
                current_qye = $24, dbk_scroll_no = $25, scroll_dt = $26, remarks = $27, updated_at = NOW()
            WHERE id = $28
            RETURNING *;
        `;

        // Map frontend expected names to DB names
        const values = [
            data.s_no,
            data.job_no,
            data.inv_no,
            data.inv_date || data.date,
            data.s_bill_no,
            data.s_bill_date,
            data.leo_date,
            data.forwarder_name,
            data.booking_no,
            data.contr_no || data.container_no,
            data.size,
            data.shipping_line || data.s_line,
            data.pod,
            data.train_no,
            data.wagon_no,
            data.train_wagon_date || data.wagon_date,
            data.reward,
            data.inv_value_fc,
            data.fob_value_inr,
            data.dbk_amt_inr || data.dbk_amount,
            data.igst_amount_inr || data.igst_amount,
            data.egm_no,
            data.egm_date,
            data.current_qye || data.current_qty,
            data.dbk_scroll_no,
            data.scroll_dt || data.scroll_date,
            data.remarks,
            id
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

        const query = `
            INSERT INTO export_data (
                s_no, job_no, inv_no, inv_date, s_bill_no, s_bill_date, leo_date, forwarder_name,
                booking_no, contr_no, size, shipping_line, pod, train_no, wagon_no, train_wagon_date,
                reward, inv_value_fc, fob_value_inr, dbk_amt_inr, igst_amount_inr, egm_no, egm_date,
                current_qye, dbk_scroll_no, scroll_dt, remarks
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27)
            RETURNING *;
        `;

        const normalizeHeader = (h: string) => h.toLowerCase().replace(/[^a-z0-9]/g, '');

        const columnMap: { [key: string]: string } = {
            'sno': 's_no',
            'jobno': 'job_no',
            'invno': 'inv_no',
            'invdate': 'inv_date',
            'sbillno': 's_bill_no',
            'sbilldate': 's_bill_date',
            'leodate': 'leo_date',
            'forwardername': 'forwarder_name',
            'bookingno': 'booking_no',
            'contrno': 'contr_no',
            'containerno': 'contr_no',
            'size': 'size',
            'shippingline': 'shipping_line',
            'sline': 'shipping_line',
            'pod': 'pod',
            'trainno': 'train_no',
            'wagonno': 'wagon_no',
            'trainwagondate': 'train_wagon_date',
            'reward': 'reward',
            'invvaluefc': 'inv_value_fc',
            'fobvalueinr': 'fob_value_inr',
            'dbkamtinr': 'dbk_amt_inr',
            'igstamountinr': 'igst_amount_inr',
            'egmno': 'egm_no',
            'egmdate': 'egm_date',
            'currentqye': 'current_qye',
            'dbkscrollno': 'dbk_scroll_no',
            'scrolldt': 'scroll_dt',
            'remarks': 'remarks'
        };

        const results = [];

        const parseDate = (dateStr: any) => {
            if (!dateStr) return null;
            if (String(dateStr).toLowerCase().trim() === 'do') return null;
            if (dateStr instanceof Date) return isNaN(dateStr.getTime()) ? null : dateStr;
            if (typeof dateStr === 'number') {
                const excelEpoch = new Date(1899, 11, 30);
                const date = new Date(excelEpoch.getTime() + dateStr * 86400000);
                return isNaN(date.getTime()) ? null : date;
            }
            const date = new Date(dateStr);
            return isNaN(date.getTime()) ? null : date;
        };

        const parseDecimal = (val: any) => {
            if (val === null || val === undefined || val === '') return null;
            if (String(val).toLowerCase().trim() === 'do') return null;
            const num = parseFloat(String(val).replace(/,/g, ''));
            return isNaN(num) ? null : num;
        };

        const isDo = (val: any): boolean => {
            if (val === null || val === undefined) return false;
            return String(val).toLowerCase().trim() === 'do';
        };

        const getValue = (val: any): string => {
            if (val === null || val === undefined || val === '') return '';
            if (isDo(val)) return '';
            return String(val).trim();
        };

        const orderOfColumns = [
            's_no', 'job_no', 'inv_no', 'inv_date', 's_bill_no', 's_bill_date', 'leo_date', 'forwarder_name',
            'booking_no', 'contr_no', 'size', 'shipping_line', 'pod', 'train_no', 'wagon_no', 'train_wagon_date',
            'reward', 'inv_value_fc', 'fob_value_inr', 'dbk_amt_inr', 'igst_amount_inr', 'egm_no', 'egm_date',
            'current_qye', 'dbk_scroll_no', 'scroll_dt', 'remarks'
        ];

        const lastValues: { [key: string]: any } = {};

        for (const row of parsedData) {
            const normalizedRow: any = {};
            Object.keys(row).forEach(key => {
                const normalizedKey = normalizeHeader(key);
                const dbKey = columnMap[normalizedKey] || normalizedKey;
                normalizedRow[dbKey] = row[key];
            });

            const rowValues = orderOfColumns.map(key => {
                let val = normalizedRow[key];

                if (isDo(val)) {
                    val = lastValues[key];
                } else if (val !== null && val !== undefined && val !== '') {
                    lastValues[key] = val;
                }

                // Handle type specific parsing after "do" filling
                if (['inv_date', 's_bill_date', 'leo_date', 'train_wagon_date', 'egm_date', 'scroll_dt'].includes(key)) {
                    return parseDate(val);
                }
                if (['inv_value_fc', 'fob_value_inr', 'dbk_amt_inr', 'igst_amount_inr'].includes(key)) {
                    return parseDecimal(val);
                }
                if (key === 's_no') {
                    return getValue(val);
                }
                return val !== null && val !== undefined && val !== '' ? String(val).trim() : '';
            });

            try {
                const result = await pool.query(query, rowValues);
                results.push(result.rows[0]);
            } catch (err) {
                console.error('Error inserting row (Export):', row, err);
            }
        }

        fs.unlinkSync(filePath);
        res.status(201).json({ message: 'Bulk upload processed', count: results.length, total: parsedData.length });
    } catch (error) {
        next(error);
    }
};
