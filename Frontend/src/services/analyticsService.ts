import { API_BASE_URL, headers } from './api';

export interface MonthlyData {
    month: string;
    import: number;
    export: number;
}

export interface ForwarderData {
    name: string;
    value: number;
}

export interface ContainerData {
    name: string;
    import: number;
    export: number;
}

export interface StatusData {
    name: string;
    value: number;
}

export interface AnalyticsTotals {
    totalShipments: number;
    importVolume: number;
    exportVolume: number;
    totalValue: number;
    totalTrend: number;
    importTrend: number;
    exportTrend: number;
    valueTrend: number;
}

export const analyticsService = {
    getOverview: async (): Promise<MonthlyData[]> => {
        try {
            const response = await fetch(`${API_BASE_URL}/analytics/overview`, {
                headers,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Failed to fetch analytics overview: ${response.statusText}`);
            }

            return response.json();
        } catch (error) {
            console.error('Error in getOverview:', error);
            throw error;
        }
    },

    getForwarderStats: async (): Promise<ForwarderData[]> => {
        try {
            const response = await fetch(`${API_BASE_URL}/analytics/forwarders`, {
                headers,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Failed to fetch forwarder stats: ${response.statusText}`);
            }

            return response.json();
        } catch (error) {
            console.error('Error in getForwarderStats:', error);
            throw error;
        }
    },

    getContainerStats: async (): Promise<ContainerData[]> => {
        try {
            const response = await fetch(`${API_BASE_URL}/analytics/containers`, {
                headers,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Failed to fetch container stats: ${response.statusText}`);
            }

            return response.json();
        } catch (error) {
            console.error('Error in getContainerStats:', error);
            throw error;
        }
    },

    getTotals: async (): Promise<AnalyticsTotals> => {
        try {
            const response = await fetch(`${API_BASE_URL}/analytics/totals`, {
                headers,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Failed to fetch analytics totals: ${response.statusText}`);
            }

            return response.json();
        } catch (error) {
            console.error('Error in getTotals:', error);
            throw error;
        }
    },

    getStatusStats: async (): Promise<StatusData[]> => {
        try {
            const response = await fetch(`${API_BASE_URL}/analytics/status`, {
                headers,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Failed to fetch status stats: ${response.statusText}`);
            }

            return response.json();
        } catch (error) {
            console.error('Error in getStatusStats:', error);
            throw error;
        }
    },
};
