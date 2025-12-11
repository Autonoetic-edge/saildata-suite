# Database Schema Fixes

This document records the changes made to the PostgreSQL database to resolve bulk upload errors (specifically "column does not exist" errors).

## Problem 1: Missing `s_no` and related columns
The `export_data` table was missing several columns that the backend code attempted to write to.

### Fix Applied
We verified the missing columns and added them using the following SQL commands.

**SQL Migration File ([Server/migrations/001_add_missing_export_columns.sql](file:///d:/Softwares/saildata-suite-master/Server/migrations/001_add_missing_export_columns.sql)):**
```sql
ALTER TABLE export_data
ADD COLUMN IF NOT EXISTS s_no VARCHAR(50),
ADD COLUMN IF NOT EXISTS train_no VARCHAR(100),
ADD COLUMN IF NOT EXISTS wagon_no VARCHAR(100),
ADD COLUMN IF NOT EXISTS wagon_date DATE,
ADD COLUMN IF NOT EXISTS reward VARCHAR(100),
ADD COLUMN IF NOT EXISTS inv_value_fc DECIMAL(15, 2),
ADD COLUMN IF NOT EXISTS fob_value_inr DECIMAL(15, 2),
ADD COLUMN IF NOT EXISTS dbk_amount DECIMAL(15, 2),
ADD COLUMN IF NOT EXISTS igst_amount DECIMAL(15, 2),
ADD COLUMN IF NOT EXISTS egm_no VARCHAR(100),
ADD COLUMN IF NOT EXISTS egm_date DATE,
ADD COLUMN IF NOT EXISTS current_qty VARCHAR(100),
ADD COLUMN IF NOT EXISTS dbk_scroll_no VARCHAR(100),
ADD COLUMN IF NOT EXISTS scroll_date DATE;
```

**Command to Apply to Docker Container:**
Because the database is running inside a Docker container (`db`), we used `docker-compose exec` to run the SQL inside the container.
```powershell
Get-Content Server/migrations/001_add_missing_export_columns.sql | docker-compose exec -T db psql -U freight_user -d freight_db
```

---

## Problem 2: Missing `remarks` column
After fixing the first set of columns, the upload failed on the `remarks` column, which was also missing.

### Fix Applied
We added the `remarks` column directly using a single SQL command.

**Command:**
```powershell
docker-compose exec -T db psql -U freight_user -d freight_db -c "ALTER TABLE export_data ADD COLUMN IF NOT EXISTS remarks TEXT;"
```

## Summary
The `export_data` table schema now matches the columns expected by the [exportController.ts](file:///d:/Softwares/saildata-suite-master/Server/src/controllers/exportController.ts) logic and the Excel upload template.
