import { API_BASE_URL, headers } from './api';

export interface DashboardStats {
    totalImports: number;
    totalExports: number;
    thisMonthTotal: number;
    pendingReviews: number;
    importTrend: number;
    exportTrend: number;
}

export interface RecentActivity {
    id: number;
    type: 'import' | 'export';
    jobNo: string;
    action: string;
    time: string;
}

export const dashboardService = {
    getStats: async (): Promise<DashboardStats> => {
        try {
            const response = await fetch(`${API_BASE_URL}/dashboard/stats`, {
                headers,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Failed to fetch dashboard stats: ${response.statusText}`);
            }

            return response.json();
        } catch (error) {
            console.error('Error in getStats:', error);
            throw error;
        }
    },

    getRecentActivity: async (limit = 10): Promise<RecentActivity[]> => {
        try {
            const response = await fetch(`${API_BASE_URL}/dashboard/recent-activity?limit=${limit}`, {
                headers,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Failed to fetch recent activity: ${response.statusText}`);
            }

            return response.json();
        } catch (error) {
            console.error('Error in getRecentActivity:', error);
            throw error;
        }
    },
};
