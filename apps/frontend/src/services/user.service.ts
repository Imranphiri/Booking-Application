import api from './api';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    bookings: number;
  };
}

export interface UpdateUserRoleData {
  role: string;
}

export const userService = {
  async getAll(): Promise<{ users: User[] }> {
    const response = await api.get('/users');
    return response.data;
  },

  async getById(id: string): Promise<{ user: User }> {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  async updateRole(id: string, data: UpdateUserRoleData): Promise<{ message: string; user: User }> {
    const response = await api.patch(`/users/${id}/role`, data);
    return response.data;
  },

  async delete(id: string): Promise<{ message: string }> {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  async updateProfile(data: Partial<User>): Promise<{ message: string; user: User }> {
    const response = await api.patch('/users/me/profile', data);
    return response.data;
  },
};
