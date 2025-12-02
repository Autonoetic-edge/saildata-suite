import { API_BASE_URL, headers } from './api';

export interface ExportRecord {
    id: number;
    job_no: string;
    inv_no: string;
    date: string;
    s_bill_no: string;
    s_bill_date: string;
    leo_date: string;
    forwarder_name: string;
    booking_no: string;
    container_no: string;
    size: string;
    s_line: string;
    pod: string;
    created_at: string;
    updated_at: string;
}

export interface ExportResponse {
    data: ExportRecord[];
    total: number;
    page: number;
    limit: number;
}

export const exportService = {
    getExports: async (page = 1, limit = 50): Promise<ExportResponse> => {
        try {
            const response = await fetch(`${API_BASE_URL}/export?page=${page}&limit=${limit}`, {
                headers,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Failed to fetch export data: ${response.statusText}`);
            }

            return response.json();
        } catch (error) {
            console.error('Error in getExports:', error);
            throw error;
        }
    },

    createExport: async (data: Partial<ExportRecord>): Promise<ExportRecord> => {
        try {
            const response = await fetch(`${API_BASE_URL}/export`, {
                method: 'POST',
                headers,
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Failed to create export record: ${response.statusText}`);
            }

            return response.json();
        } catch (error) {
            console.error('Error in createExport:', error);
            throw error;
        }
    },

    updateExport: async (id: number, data: Partial<ExportRecord>): Promise<ExportRecord> => {
        try {
            const response = await fetch(`${API_BASE_URL}/export/${id}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Failed to update export record: ${response.statusText}`);
            }

            return response.json();
        } catch (error) {
            console.error('Error in updateExport:', error);
            throw error;
        }
    },

    deleteExport: async (id: number): Promise<void> => {
        try {
            const response = await fetch(`${API_BASE_URL}/export/${id}`, {
                method: 'DELETE',
                headers,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Failed to delete export record: ${response.statusText}`);
            }
        } catch (error) {
            console.error('Error in deleteExport:', error);
            throw error;
        }
    },

    uploadExport: async (file: File): Promise<any> => {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch(`${API_BASE_URL}/export/upload`, {
                method: 'POST',
                // headers: headers, // Do NOT set Content-Type for FormData, browser does it
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Failed to upload export file: ${response.statusText}`);
            }

            return response.json();
        } catch (error) {
            console.error('Error in uploadExport:', error);
            throw error;
        }
    },
};
