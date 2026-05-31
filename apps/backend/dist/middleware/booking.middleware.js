"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBookingCancellation = exports.validateBookingUpdate = exports.validateBookingCreation = void 0;
const prisma_1 = require("../lib/prisma");
const validateBookingCreation = async (req, res, next) => {
    try {
        const { userId, tripId, passengers, paymentMethod, passengerDetails } = req.body;
        // Validate required fields
        if (!tripId || !passengers) {
            res.status(400).json({
                message: 'Missing required fields',
                required: ['tripId', 'passengers']
            });
            return;
        }
        // Validate passengers count
        if (passengers < 1 || passengers > 10) {
            res.status(400).json({ message: 'Number of passengers must be between 1 and 10' });
            return;
        }
        // Check if trip exists and is available for booking
        const trip = await prisma_1.prisma.trip.findUnique({
            where: { id: tripId },
            include: {
                bus: true,
                route: true,
                bookings: {
                    where: { status: { in: ['PENDING', 'CONFIRMED'] } }
                }
            }
        });
        if (!trip) {
            res.status(404).json({ message: 'Trip not found' });
            return;
        }
        if (trip.status !== 'SCHEDULED') {
            res.status(400).json({
                message: 'Trip is not available for booking',
                status: trip.status
            });
            return;
        }
        // Check if departure time is in the future
        const departureTime = new Date(trip.departureTime);
        const now = new Date();
        if (departureTime <= now) {
            res.status(400).json({ message: 'Cannot book trips that have already departed' });
            return;
        }
        // Check if bus has enough capacity
        if (trip.bookings.length + passengers > trip.bus.capacity) {
            res.status(400).json({
                message: 'Not enough seats available',
                capacity: trip.bus.capacity,
                booked: trip.bookings.length,
                requested: passengers
            });
            return;
        }
        // Add validated data to request for controller use
        req.validatedTrip = trip;
        next();
    }
    catch (error) {
        console.error('Booking validation error:', error);
        res.status(500).json({ message: 'Validation error' });
    }
};
exports.validateBookingCreation = validateBookingCreation;
const validateBookingUpdate = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        if (!id) {
            res.status(400).json({ message: 'Booking ID is required' });
            return;
        }
        if (!status) {
            res.status(400).json({ message: 'Status is required' });
            return;
        }
        const validStatuses = ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'];
        if (!validStatuses.includes(status)) {
            res.status(400).json({
                message: 'Invalid status',
                validStatuses
            });
            return;
        }
        const booking = await prisma_1.prisma.booking.findUnique({
            where: { id: id },
            include: {
                trip: true,
                user: true
            }
        });
        if (!booking) {
            res.status(404).json({ message: 'Booking not found' });
            return;
        }
        // Business logic for status transitions
        if (booking.status === 'CANCELLED' && status !== 'CANCELLED') {
            res.status(400).json({ message: 'Cannot reactivate cancelled booking' });
            return;
        }
        if (booking.status === 'COMPLETED' && status !== 'COMPLETED') {
            res.status(400).json({ message: 'Cannot modify completed booking' });
            return;
        }
        req.validatedBooking = booking;
        next();
    }
    catch (error) {
        console.error('Booking update validation error:', error);
        res.status(500).json({ message: 'Validation error' });
    }
};
exports.validateBookingUpdate = validateBookingUpdate;
const validateBookingCancellation = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!id) {
            res.status(400).json({ message: 'Booking ID is required' });
            return;
        }
        const booking = await prisma_1.prisma.booking.findUnique({
            where: { id: id },
            include: {
                trip: true,
                user: true
            }
        });
        if (!booking) {
            res.status(404).json({ message: 'Booking not found' });
            return;
        }
        if (booking.status === 'CANCELLED') {
            res.status(400).json({ message: 'Booking is already cancelled' });
            return;
        }
        if (booking.status === 'COMPLETED') {
            res.status(400).json({ message: 'Cannot cancel completed booking' });
            return;
        }
        // Check if trip departure time is within 2 hours (cancellation policy)
        const departureTime = new Date(booking.trip.departureTime);
        const now = new Date();
        const timeDiff = departureTime.getTime() - now.getTime();
        const hoursDiff = timeDiff / (1000 * 60 * 60);
        if (hoursDiff < 2) {
            res.status(400).json({
                message: 'Cannot cancel booking less than 2 hours before departure',
                departureTime: booking.trip.departureTime,
                currentTime: now,
                hoursUntilDeparture: hoursDiff
            });
            return;
        }
        req.validatedBooking = booking;
        next();
    }
    catch (error) {
        console.error('Booking cancellation validation error:', error);
        res.status(500).json({ message: 'Validation error' });
    }
};
exports.validateBookingCancellation = validateBookingCancellation;
