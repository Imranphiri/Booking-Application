import api from './api';

export interface Route {
  id: string;
  origin: string;
  destination: string;
  distancekm: number;
  price: number;
  createdAt: string;
  updatedAt: string;
  _count?: {
    trips: number;
  };
}

export interface CreateRouteData {
  origin: string;
  destination: string;
  distancekm: number;
  price: number;
}

export interface UpdateRouteData {
  origin?: string;
  destination?: string;
  distancekm?: number;
  price?: number;
}

export const routeService = {
  async getAll(): Promise<{ routes: Route[] }> {
    const response = await api.get('/routes');
    return response.data;
  },

  async getById(id: string): Promise<{ route: Route }> {
    const response = await api.get(`/routes/${id}`);
    return response.data;
  },

  async create(data: CreateRouteData): Promise<{ message: string; route: Route }> {
    const response = await api.post('/routes', data);
    return response.data;
  },

  async update(id: string, data: UpdateRouteData): Promise<{ message: string; route: Route }> {
    const response = await api.patch(`/routes/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<{ message: string }> {
    const response = await api.delete(`/routes/${id}`);
    return response.data;
  },
};
