"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const booking_controller_1 = require("../controllers/booking.controller");
const booking_middleware_1 = require("../middleware/booking.middleware");
const router = (0, express_1.Router)();
// Create a new booking
router.post('/', booking_middleware_1.validateBookingCreation, booking_controller_1.createBooking);
// Get all bookings with optional filters
router.get('/', booking_controller_1.getAllBookings);
// Get booking by ID
router.get('/:id', booking_controller_1.getBookingById);
// Update booking status
router.patch('/:id/status', booking_middleware_1.validateBookingUpdate, booking_controller_1.updateBookingStatus);
// Cancel a booking
router.patch('/:id/cancel', booking_middleware_1.validateBookingCancellation, booking_controller_1.cancelBooking);
// Get available seats for a specific trip
router.get('/trip/:tripId/seats', booking_controller_1.getAvailableSeats);
// Get all bookings for a specific user
router.get('/user/:userId', booking_controller_1.getUserBookings);
exports.default = router;
