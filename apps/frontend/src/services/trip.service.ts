import api from './api';

export interface Trip {
  id: string;
  busId: string;
  routeId: string;
  departureTime: string;
  arrivalTime: string;
  availableSeats: number;
  pricePerSeat: number;
  createdAt: string;
  bus?: {
    id: string;
    plateNumber: string;
    model: string;
    totalSeats: number;
  };
  route?: {
    id: string;
    origin: string;
    destination: string;
    distanceKm: number;
  };
  seats?: {
    id: string;
    seatNumber: string;
    isBooked: boolean;
  }[];
}

export interface CreateTripData {
  busId: string;
  routeId: string;
  departureTime: string;
  arrivalTime: string;
  pricePerSeat: number;
}

export const tripService = {
  async getAll(params?: { origin?: string; destination?: string; date?: string }): Promise<{ trips: Trip[] }> {
    const response = await api.get('/trips', { params });
    return response.data;
  },

  async getById(id: string): Promise<{ trip: Trip }> {
    const response = await api.get(`/trips/${id}`);
    return response.data;
  },

  async create(data: CreateTripData): Promise<{ message: string; trip: Trip }> {
    const response = await api.post('/trips', data);
    return response.data;
  },

  async update(id: string, data: Partial<CreateTripData>): Promise<{ message: string; trip: Trip }> {
    const response = await api.patch(`/trips/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<{ message: string }> {
    const response = await api.delete(`/trips/${id}`);
    return response.data;
  },
};