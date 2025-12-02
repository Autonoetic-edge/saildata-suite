import { API_BASE_URL, headers } from './api';

export interface ImportRecord {
    id: number;
    job_no: string;
    shipper_name: string;
    invoice_no_dt: string;
    fc_value: number;
    description: string;
    forwarder_name: string;
    hbl_no_dt: string;
    mbl_no_dt: string;
    s_line: string;
    pol: string;
    pod: string;
    terms: string;
    container_nos: string;
    size: string;
    nn_copy_rcvd: boolean;
    original_docs_rcvd: boolean;
    eta_date: string;
    remarks: string;
    created_at: string;
    updated_at: string;
}

export interface ImportResponse {
    data: ImportRecord[];
    total: number;
    page: number;
    limit: number;
}

export const importService = {
    getImports: async (page = 1, limit = 50): Promise<ImportResponse> => {
        try {
            const response = await fetch(`${API_BASE_URL}/import?page=${page}&limit=${limit}`, {
                headers,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Failed to fetch import data: ${response.statusText}`);
            }

            return response.json();
        } catch (error) {
            console.error('Error in getImports:', error);
            throw error;
        }
    },

    createImport: async (data: Partial<ImportRecord>): Promise<ImportRecord> => {
        try {
            const response = await fetch(`${API_BASE_URL}/import`, {
                method: 'POST',
                headers,
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Failed to create import record: ${response.statusText}`);
            }

            return response.json();
        } catch (error) {
            console.error('Error in createImport:', error);
            throw error;
        }
    },

    updateImport: async (id: number, data: Partial<ImportRecord>): Promise<ImportRecord> => {
        try {
            const response = await fetch(`${API_BASE_URL}/import/${id}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Failed to update import record: ${response.statusText}`);
            }

            return response.json();
        } catch (error) {
            console.error('Error in updateImport:', error);
            throw error;
        }
    },

    deleteImport: async (id: number): Promise<void> => {
        try {
            const response = await fetch(`${API_BASE_URL}/import/${id}`, {
                method: 'DELETE',
                headers,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Failed to delete import record: ${response.statusText}`);
            }
        } catch (error) {
            console.error('Error in deleteImport:', error);
            throw error;
        }
    },

    uploadImport: async (file: File): Promise<any> => {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch(`${API_BASE_URL}/import/upload`, {
                method: 'POST',
                // headers: headers, // Do NOT set Content-Type for FormData
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Failed to upload import file: ${response.statusText}`);
            }

            return response.json();
        } catch (error) {
            console.error('Error in uploadImport:', error);
            throw error;
        }
    },
};
