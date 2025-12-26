-- Import Data Table
CREATE TABLE IF NOT EXISTS import_data (
    id SERIAL PRIMARY KEY,
    s_no VARCHAR(50),
    job_no VARCHAR(50) NOT NULL,
    shipper_name VARCHAR(255),
    invoice_no_dt VARCHAR(100),
    forwarder_name VARCHAR(255),
    currency_fc VARCHAR(10),
    invoice_value DECIMAL(15, 2),
    description TEXT,
    hbl_no_dt VARCHAR(100),
    mbl_no_dt VARCHAR(100),
    shipping_line VARCHAR(255),
    pol VARCHAR(100),
    terms VARCHAR(100),
    container_nos TEXT,
    container_size VARCHAR(50),
    nn_copy_rcvd BOOLEAN DEFAULT FALSE,
    original_docs_rcvd BOOLEAN DEFAULT FALSE,
    arrival_status VARCHAR(255),
    ro_date DATE,
    do_status_validity DATE,
    be_no VARCHAR(100),
    be_date DATE,
    assess_date DATE,
    hs_code VARCHAR(50),
    ass_value_inr DECIMAL(15, 2),
    duty_paid DECIMAL(15, 2),
    ooc_date DATE,
    destuffed_date DATE,
    security_amt_rs DECIMAL(15, 2),
    security_payment_date DATE,
    mode_of_payment VARCHAR(100),
    security_receipt_no VARCHAR(100),
    security_receipt_date DATE,
    remarks TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Export Data Table
CREATE TABLE IF NOT EXISTS export_data (
    id SERIAL PRIMARY KEY,
    s_no VARCHAR(50),
    job_no VARCHAR(100) NOT NULL,
    inv_no VARCHAR(100),
    inv_date DATE,
    s_bill_no VARCHAR(100),
    s_bill_date DATE,
    leo_date DATE,
    forwarder_name VARCHAR(255),
    booking_no VARCHAR(100),
    contr_no VARCHAR(100),
    size VARCHAR(50),
    shipping_line VARCHAR(255),
    pod VARCHAR(255),
    train_no VARCHAR(100),
    wagon_no VARCHAR(100),
    train_wagon_date DATE,
    reward VARCHAR(100),
    inv_value_fc DECIMAL(15, 2),
    fob_value_inr DECIMAL(15, 2),
    dbk_amt_inr DECIMAL(15, 2),
    igst_amount_inr DECIMAL(15, 2),
    egm_no VARCHAR(100),
    egm_date DATE,
    current_qye VARCHAR(100),
    dbk_scroll_no VARCHAR(100),
    scroll_dt DATE,
    remarks TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_import_job_no ON import_data(job_no);
CREATE INDEX IF NOT EXISTS idx_export_job_no ON export_data(job_no);
CREATE INDEX IF NOT EXISTS idx_import_created_at ON import_data(created_at);
CREATE INDEX IF NOT EXISTS idx_export_created_at ON export_data(created_at);

-- Grant permissions to the application user
-- GRANT ALL PRIVILEGES ON TABLE import_data TO freight_user;
-- GRANT ALL PRIVILEGES ON TABLE export_data TO freight_user;
-- GRANT ALL PRIVILEGES ON SEQUENCE import_data_id_seq TO freight_user;
-- GRANT ALL PRIVILEGES ON SEQUENCE export_data_id_seq TO freight_user;
