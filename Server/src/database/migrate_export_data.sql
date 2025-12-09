-- Migration script to add new columns to export_data table
-- Run this if you already have an existing export_data table with data

-- Add new columns to export_data table
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
ADD COLUMN IF NOT EXISTS scroll_date DATE,
ADD COLUMN IF NOT EXISTS remarks TEXT;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_export_forwarder ON export_data(forwarder_name);
CREATE INDEX IF NOT EXISTS idx_export_pod ON export_data(pod);
CREATE INDEX IF NOT EXISTS idx_export_size ON export_data(size);
