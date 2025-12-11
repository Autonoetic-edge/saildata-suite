-- Import Data Table
CREATE TABLE IF NOT EXISTS import_data (
    id SERIAL PRIMARY KEY,
    job_no VARCHAR(100) NOT NULL,
    shipper_name VARCHAR(255),
    invoice_no_dt VARCHAR(255),
    fc_value DECIMAL(15, 2),
    description TEXT,
    forwarder_name VARCHAR(255),
    hbl_no_dt VARCHAR(255),
    mbl_no_dt VARCHAR(255),
    s_line VARCHAR(255),
    pol VARCHAR(255),
    pod VARCHAR(255),
    terms VARCHAR(100),
    container_nos TEXT,
    size VARCHAR(50),
    nn_copy_rcvd BOOLEAN DEFAULT FALSE,
    original_docs_rcvd BOOLEAN DEFAULT FALSE,
    eta_date DATE,
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Export Data Table with all fields from Excel template
CREATE TABLE IF NOT EXISTS export_data (
    id SERIAL PRIMARY KEY,
    s_no VARCHAR(50),
    job_no VARCHAR(100) NOT NULL,
    inv_no VARCHAR(100),
    date DATE,
    s_bill_no VARCHAR(100),
    s_bill_date DATE,
    leo_date DATE,
    forwarder_name VARCHAR(255),
    booking_no VARCHAR(100),
    container_no VARCHAR(100),
    size VARCHAR(50),
    s_line VARCHAR(255),
    pod VARCHAR(255),
    train_no VARCHAR(100),
    wagon_no VARCHAR(100),
    wagon_date DATE,
    reward VARCHAR(100),
    inv_value_fc DECIMAL(15, 2),
    fob_value_inr DECIMAL(15, 2),
    dbk_amount DECIMAL(15, 2),
    igst_amount DECIMAL(15, 2),
    egm_no VARCHAR(100),
    egm_date DATE,
    current_qty VARCHAR(100),
    dbk_scroll_no VARCHAR(100),
    scroll_date DATE,
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_import_job_no ON import_data(job_no);
CREATE INDEX IF NOT EXISTS idx_export_job_no ON export_data(job_no);
CREATE INDEX IF NOT EXISTS idx_import_created_at ON import_data(created_at);
CREATE INDEX IF NOT EXISTS idx_export_created_at ON export_data(created_at);
