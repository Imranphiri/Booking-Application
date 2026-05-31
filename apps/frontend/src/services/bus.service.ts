import api from './api';

export interface Bus {
  id: string;
  plateNumber: string;
  model: string;
  totalSeats: number;
  type?: string;
  features?: string[];
  status?: string;
  driver?: string;
  currentRoute?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    trips: number;
  };
}

export interface CreateBusData {
  plateNumber: string;
  model: string;
  totalSeats: number;
  type?: string;
  features?: string[];
  status?: string;
  driver?: string;
  currentRoute?: string;
}

export interface UpdateBusData {
  plateNumber?: string;
  model?: string;
  totalSeats?: number;
  type?: string;
  features?: string[];
  status?: string;
  driver?: string;
  currentRoute?: string;
}

export const busService = {
  async getAll(): Promise<{ buses: Bus[] }> {
    const response = await api.get('/buses');
    return response.data;
  },

  async getById(id: string): Promise<{ bus: Bus }> {
    const response = await api.get(`/buses/${id}`);
    return response.data;
  },

  async create(data: CreateBusData): Promise<{ message: string; bus: Bus }> {
    const response = await api.post('/buses', data);
    return response.data;
  },

  async update(id: string, data: UpdateBusData): Promise<{ message: string; bus: Bus }> {
    const response = await api.patch(`/buses/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<{ message: string }> {
    const response = await api.delete(`/buses/${id}`);
    return response.data;
  },
};
