import api from './api';

export interface Ticket {
  id: string;
  bookingId: string;
  qrCode: string;
  issuedAt: string;
  isValidated: boolean;
  booking?: {
    id: string;
    totalAmount: number;
    user?: { name: string; email: string };
    trip?: {
      departureTime: string;
      route?: { origin: string; destination: string };
      bus?: { plateNumber: string; model: string };
    };
    seats?: { seatNumber: string }[];
  };
}

export const ticketService = {
  async getAll(): Promise<{ tickets: Ticket[] }> {
    const response = await api.get('/tickets');
    return response.data;
  },

  async getById(id: string): Promise<{ ticket: Ticket }> {
    const response = await api.get(`/tickets/${id}`);
    return response.data;
  },

  async getByBookingId(bookingId: string): Promise<{ ticket: Ticket }> {
    const response = await api.get(`/tickets/booking/${bookingId}`);
    return response.data;
  },

  async validate(bookingId: string): Promise<{ message: string; ticket: Ticket }> {
    const response = await api.patch(`/tickets/validate/${bookingId}`);
    return response.data;
  },
};