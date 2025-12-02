-- Import Data Table
CREATE TABLE IF NOT EXISTS import_data (
    id SERIAL PRIMARY KEY,
    job_no VARCHAR(50) NOT NULL,
    shipper_name VARCHAR(100),
    invoice_no_dt VARCHAR(100),
    fc_value DECIMAL(18, 2),
    description TEXT,
    forwarder_name VARCHAR(100),
    hbl_no_dt VARCHAR(100),
    mbl_no_dt VARCHAR(100),
    s_line VARCHAR(100),
    pol VARCHAR(100),
    pod VARCHAR(100),
    terms VARCHAR(100),
    container_nos VARCHAR(200),
    size VARCHAR(20),
    nn_copy_rcvd BOOLEAN DEFAULT FALSE,
    original_docs_rcvd BOOLEAN DEFAULT FALSE,
    eta_date DATE,
    remarks TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Export Data Table
CREATE TABLE IF NOT EXISTS export_data (
    id SERIAL PRIMARY KEY,
    job_no VARCHAR(50) NOT NULL,
    inv_no VARCHAR(100),
    date DATE,
    s_bill_no VARCHAR(100),
    s_bill_date DATE,
    leo_date DATE,
    forwarder_name VARCHAR(100),
    booking_no VARCHAR(100),
    container_no VARCHAR(100),
    size VARCHAR(20),
    s_line VARCHAR(100),
    pod VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
