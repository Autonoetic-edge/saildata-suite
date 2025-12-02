import * as XLSX from 'xlsx';

export const parseExcel = (filePath: string): any[] => {
    try {
        const workbook = XLSX.readFile(filePath, { cellDates: true });
        const sheetName = workbook.SheetNames[0];
        if (!sheetName) {
            throw new Error('No sheets found in Excel file');
        }
        const sheet = workbook.Sheets[sheetName];
        if (!sheet) {
            throw new Error('Sheet not found');
        }
        return XLSX.utils.sheet_to_json(sheet);
    } catch (error) {
        console.error('Error parsing Excel file:', error);
        throw new Error('Failed to parse Excel file');
    }
};
