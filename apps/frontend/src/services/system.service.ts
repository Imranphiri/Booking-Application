import api from './api';

export interface SystemSettings {
  id: string;
  companyName: string;
  companyEmail: string;
  companyPhone: string;
  companyAddress?: string;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  allowRegistrations: boolean;
  requireEmailVerification: boolean;
  defaultCurrency: string;
  maxBookingPerUser: number;
  cancellationPolicy: string;
  termsAndConditions?: string;
  privacyPolicy?: string;
  aboutUs?: string;
  contactInfo?: string;
  socialMediaLinks?: string;
  logoUrl?: string;
  faviconUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  darkMode: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SystemStats {
  totalUsers: number;
  totalBuses: number;
  totalRoutes: number;
  totalTrips: number;
  totalBookings: number;
  totalTickets: number;
  totalRevenue: number;
  usersByRole: Array<{
    role: string;
    _count: number;
  }>;
  recentActivity: {
    todayBookings: number;
    todayRevenue: {
      _sum: {
        price: number | null;
      };
    };
  };
}

export interface SystemHealth {
  status: string;
  timestamp: string;
  database: string;
  memory: any;
  uptime: number;
  version: string;
}

export const systemService = {
  async getSettings(): Promise<{ settings: SystemSettings }> {
    const response = await api.get('/system/settings');
    return response.data;
  },

  async updateSettings(data: Partial<SystemSettings>): Promise<{ message: string; settings: SystemSettings }> {
    const response = await api.put('/system/settings', data);
    return response.data;
  },

  async getStats(): Promise<{ stats: SystemStats }> {
    const response = await api.get('/system/stats');
    return response.data;
  },

  async toggleMaintenanceMode(maintenanceMode: boolean, maintenanceMessage?: string): Promise<{ message: string; settings: SystemSettings }> {
    const response = await api.patch('/system/maintenance', { maintenanceMode, maintenanceMessage });
    return response.data;
  },

  async backupSystem(): Promise<{ message: string; backupId: string; status: string }> {
    const response = await api.post('/system/backup');
    return response.data;
  },

  async getHealth(): Promise<{ health: SystemHealth }> {
    const response = await api.get('/system/health');
    return response.data;
  },
};
