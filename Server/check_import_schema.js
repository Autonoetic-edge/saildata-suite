const { Pool } = require('pg');

const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'freight_db',
    user: 'freight_user',
    password: 'YourSecurePassword123!',
});

async function checkImportSchema() {
    try {
        console.log('--- IMPORT DATA COLUMNS ---');
        const importCols = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'import_data'
    `);
        importCols.rows.forEach(row => console.log(`${row.column_name}: ${row.data_type}`));
    } catch (err) {
        console.error('Error checking import schema:', err);
    } finally {
        await pool.end();
    }
}

checkImportSchema();
