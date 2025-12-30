const { Pool } = require('pg');

const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'freight_db',
    user: 'freight_user',
    password: 'YourSecurePassword123!',
});

async function checkSchema() {
    try {
        console.log('--- EXPORT DATA COLUMNS ---');
        const exportCols = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'export_data'
    `);
        exportCols.rows.forEach(row => console.log(`${row.column_name}: ${row.data_type}`));

        console.log('\n--- IMPORT DATA COLUMNS ---');
        const importCols = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'import_data'
    `);
        importCols.rows.forEach(row => console.log(`${row.column_name}: ${row.data_type}`));
    } catch (err) {
        console.error('Error checking schema:', err);
    } finally {
        await pool.end();
    }
}

checkSchema();
