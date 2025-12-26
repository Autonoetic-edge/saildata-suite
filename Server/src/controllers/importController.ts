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
                s_no, job_no, shipper_name, invoice_no_dt, forwarder_name,
                currency_fc, invoice_value, description, hbl_no_dt, mbl_no_dt,
                shipping_line, pol, terms, container_nos, container_size,
                nn_copy_rcvd, original_docs_rcvd, arrival_status, ro_date,
                do_status_validity, be_no, be_date, assess_date, hs_code,
                ass_value_inr, duty_paid, ooc_date, destuffed_date,
                security_amt_rs, security_payment_date, mode_of_payment,
                security_receipt_no, security_receipt_date, remarks
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34)
            RETURNING *;
        `;
        const values = [
            data.s_no, data.job_no, data.shipper_name, data.invoice_no_dt, data.forwarder_name,
            data.currency_fc, data.invoice_value, data.description, data.hbl_no_dt, data.mbl_no_dt,
            data.shipping_line, data.pol, data.terms, data.container_nos, data.container_size,
            data.nn_copy_rcvd, data.original_docs_rcvd, data.arrival_status, data.ro_date,
            data.do_status_validity, data.be_no, data.be_date, data.assess_date, data.hs_code,
            data.ass_value_inr, data.duty_paid, data.ooc_date, data.destuffed_date,
            data.security_amt_rs, data.security_payment_date, data.mode_of_payment,
            data.security_receipt_no, data.security_receipt_date, data.remarks
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
                s_no = $1, job_no = $2, shipper_name = $3, invoice_no_dt = $4, forwarder_name = $5,
                currency_fc = $6, invoice_value = $7, description = $8, hbl_no_dt = $9, mbl_no_dt = $10,
                shipping_line = $11, pol = $12, terms = $13, container_nos = $14, container_size = $15,
                nn_copy_rcvd = $16, original_docs_rcvd = $17, arrival_status = $18, ro_date = $19,
                do_status_validity = $20, be_no = $21, be_date = $22, assess_date = $23, hs_code = $24,
                ass_value_inr = $25, duty_paid = $26, ooc_date = $27, destuffed_date = $28,
                security_amt_rs = $29, security_payment_date = $30, mode_of_payment = $31,
                security_receipt_no = $32, security_receipt_date = $33, remarks = $34, updated_at = NOW()
            WHERE id = $35
            RETURNING *;
        `;
        const values = [
            data.s_no, data.job_no, data.shipper_name, data.invoice_no_dt, data.forwarder_name,
            data.currency_fc, data.invoice_value, data.description, data.hbl_no_dt, data.mbl_no_dt,
            data.shipping_line, data.pol, data.terms, data.container_nos, data.container_size,
            data.nn_copy_rcvd, data.original_docs_rcvd, data.arrival_status, data.ro_date,
            data.do_status_validity, data.be_no, data.be_date, data.assess_date, data.hs_code,
            data.ass_value_inr, data.duty_paid, data.ooc_date, data.destuffed_date,
            data.security_amt_rs, data.security_payment_date, data.mode_of_payment,
            data.security_receipt_no, data.security_receipt_date, data.remarks, id
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

        if (parsedData.length === 0) {
            fs.unlinkSync(filePath);
            res.status(400).json({ message: 'No data found in Excel file' });
            return;
        }

        const query = `
            INSERT INTO import_data (
                s_no, job_no, shipper_name, invoice_no_dt, forwarder_name,
                currency_fc, invoice_value, description, hbl_no_dt, mbl_no_dt,
                shipping_line, pol, terms, container_nos, container_size,
                nn_copy_rcvd, original_docs_rcvd, arrival_status, ro_date,
                do_status_validity, be_no, be_date, assess_date, hs_code,
                ass_value_inr, duty_paid, ooc_date, destuffed_date,
                security_amt_rs, security_payment_date, mode_of_payment,
                security_receipt_no, security_receipt_date, remarks
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34)
            RETURNING *;
        `;

        const results = [];

        const parseBoolean = (val: any) => {
            if (typeof val === 'boolean') return val;
            if (typeof val === 'string') {
                const lower = val.toLowerCase().trim();
                return lower === 'yes' || lower === 'true' || lower === '1';
            }
            return false;
        };

        const parseDate = (dateStr: any) => {
            if (!dateStr) return null;
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
            const num = parseFloat(String(val).replace(/,/g, ''));
            return isNaN(num) ? null : num;
        };

        for (const row of parsedData) {
            const normalizedRow: any = {};
            Object.keys(row).forEach(key => {
                normalizedRow[key.toLowerCase().trim()] = row[key];
            });

            const rowValues = [
                normalizedRow['s_no'] || '',
                normalizedRow['job_no'] || '',
                normalizedRow['shipper_name'] || '',
                normalizedRow['invoice_no_dt'] || '',
                normalizedRow['forwarder_name'] || '',
                normalizedRow['currency_fc'] || '',
                parseDecimal(normalizedRow['invoice_value']),
                normalizedRow['description'] || '',
                normalizedRow['hbl_no_dt'] || '',
                normalizedRow['mbl_no_dt'] || '',
                normalizedRow['shipping_line'] || '',
                normalizedRow['pol'] || '',
                normalizedRow['terms'] || '',
                normalizedRow['container_nos'] || '',
                normalizedRow['container_size'] || '',
                parseBoolean(normalizedRow['nn_copy_rcvd']),
                parseBoolean(normalizedRow['original_docs_rcvd']),
                normalizedRow['arrival_status'] || '',
                parseDate(normalizedRow['ro_date']),
                parseDate(normalizedRow['do_status_validity']),
                normalizedRow['be_no'] || '',
                parseDate(normalizedRow['be_date']),
                parseDate(normalizedRow['assess_date']),
                normalizedRow['hs_code'] || '',
                parseDecimal(normalizedRow['ass_value_inr']),
                parseDecimal(normalizedRow['duty_paid']),
                parseDate(normalizedRow['ooc_date']),
                parseDate(normalizedRow['destuffed_date']),
                parseDecimal(normalizedRow['security_amt_rs']),
                parseDate(normalizedRow['security_payment_date']),
                normalizedRow['mode_of_payment'] || '',
                normalizedRow['security_receipt_no'] || '',
                parseDate(normalizedRow['security_receipt_date']),
                normalizedRow['remarks'] || ''
            ];

            try {
                const result = await pool.query(query, rowValues);
                results.push(result.rows[0]);
            } catch (err) {
                console.error('Error inserting row (Import):', row, err);
            }
        }

        fs.unlinkSync(filePath);
        res.status(201).json({ message: 'Bulk upload processed', count: results.length, total: parsedData.length });
    } catch (error) {
        next(error);
    }
};
