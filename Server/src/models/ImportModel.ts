export interface ImportData {
    id?: number;
    job_no: string;
    shipper_name?: string;
    invoice_no_dt?: string;
    fc_value?: number;
    description?: string;
    forwarder_name?: string;
    hbl_no_dt?: string;
    mbl_no_dt?: string;
    s_line?: string;
    pol?: string;
    pod?: string;
    terms?: string;
    container_nos?: string;
    size?: string;
    nn_copy_rcvd?: boolean;
    original_docs_rcvd?: boolean;
    eta_date?: Date;
    remarks?: string;
    created_at?: Date;
    updated_at?: Date;
}
