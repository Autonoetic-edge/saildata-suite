const { Pool } = require('pg');

const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'freight_db',
    user: 'freight_user',
    password: 'YourSecurePassword123!',
});

async function checkDb() {
    try {
        console.log('Connecting to database...');
        const exportCount = await pool.query('SELECT count(*) FROM export_data');
        console.log('Export Data Count:', exportCount.rows[0].count);

        if (parseInt(exportCount.rows[0].count) > 0) {
            const lastExport = await pool.query('SELECT * FROM export_data ORDER BY created_at DESC LIMIT 1');
            console.log('Last Export Record JSON:', JSON.stringify(lastExport.rows[0]));
        }

        const importCount = await pool.query('SELECT count(*) FROM import_data');
        console.log('Import Data Count:', importCount.rows[0].count);

        if (parseInt(importCount.rows[0].count) > 0) {
            const lastImport = await pool.query('SELECT * FROM import_data ORDER BY created_at DESC LIMIT 1');
            console.log('Last Import Record JSON:', JSON.stringify(lastImport.rows[0]));
        }
    } catch (err) {
        console.error('Error checking DB:', err);
    } finally {
        await pool.end();
    }
}

checkDb();
