import { Router } from 'express';
import {
  createBooking,
  getAllBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
  getAvailableSeats,
  getUserBookings
} from '../controllers/booking.controller';
import {
  validateBookingCreation,
  validateBookingUpdate,
  validateBookingCancellation
} from '../middleware/booking.middleware';

const router = Router();

// Create a new booking
router.post('/', validateBookingCreation, createBooking);

// Get all bookings with optional filters
router.get('/', getAllBookings);

// Get booking by ID
router.get('/:id', getBookingById);

// Update booking status
router.patch('/:id/status', validateBookingUpdate, updateBookingStatus);

// Cancel a booking
router.patch('/:id/cancel', validateBookingCancellation, cancelBooking);

// Get available seats for a specific trip
router.get('/trip/:tripId/seats', getAvailableSeats);

// Get all bookings for a specific user
router.get('/user/:userId', getUserBookings);

export default router;
