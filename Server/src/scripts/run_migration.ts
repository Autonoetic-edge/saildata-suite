import pool from '../config/database';
import fs from 'fs';
import path from 'path';

const runMigration = async () => {
    try {
        const migrationPath = path.join(__dirname, '../../migrations/001_add_missing_export_columns.sql');
        const sql = fs.readFileSync(migrationPath, 'utf8');

        console.log('Running migration...');
        await pool.query(sql);
        console.log('Migration completed successfully.');
    } catch (err) {
        console.error('Error running migration:', err);
    } finally {
        await pool.end();
    }
};

runMigration();
