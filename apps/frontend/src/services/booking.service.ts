import api from './api';

export interface Booking {
  id: string;
  userId: string;
  tripId: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  trip?: {
    id: string;
    departureTime: string;
    arrivalTime: string;
    pricePerSeat: number;
    bus?: { plateNumber: string; model: string };
    route?: { origin: string; destination: string };
  };
  seats?: { id: string; seatNumber: string }[];
  ticket?: { id: string; qrCode: string; isValidated: boolean };
  payment?: { id: string; status: string; amount: number };
}

export interface CreateBookingData {
  tripId: string;
  seatIds: string[];
}

export const bookingService = {
  async getAll(): Promise<{ bookings: Booking[] }> {
    const response = await api.get('/bookings');
    return response.data;
  },

  async getMine(): Promise<{ bookings: Booking[] }> {
    const response = await api.get('/bookings/my');
    return response.data;
  },

  async getById(id: string): Promise<{ booking: Booking }> {
    const response = await api.get(`/bookings/${id}`);
    return response.data;
  },

  async create(data: CreateBookingData): Promise<{ message: string; booking: Booking }> {
    const response = await api.post('/bookings', data);
    return response.data;
  },

  async cancel(id: string): Promise<{ message: string }> {
    const response = await api.patch(`/bookings/${id}/cancel`);
    return response.data;
  },

  async updateStatus(id: string, status: string): Promise<{ message: string; booking: Booking }> {
    const response = await api.patch(`/bookings/${id}/status`, { status });
    return response.data;
  },
};