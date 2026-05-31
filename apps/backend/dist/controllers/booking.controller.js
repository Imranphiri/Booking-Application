"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserBookings = exports.getAvailableSeats = exports.cancelBooking = exports.updateBookingStatus = exports.getBookingById = exports.getAllBookings = exports.createBooking = void 0;
const prisma_1 = require("../lib/prisma");
const email_service_1 = require("../services/email.service");
const createBooking = async (req, res) => {
    try {
        const { userId, tripId, passengers, paymentMethod, passengerDetails } = req.body;
        // For testing, create or get a default user
        let currentUserId = userId;
        if (!currentUserId) {
            try {
                // Try to find or create a default user
                let defaultUser = await prisma_1.prisma.user.findFirst({
                    where: { email: 'test@transithub.com' }
                });
                if (!defaultUser) {
                    defaultUser = await prisma_1.prisma.user.create({
                        data: {
                            email: 'test@transithub.com',
                            name: 'Test User',
                            password: 'test123', // In production, this should be hashed
                            role: 'PASSENGER'
                        }
                    });
                }
                currentUserId = defaultUser.id;
            }
            catch (error) {
                console.error('Error creating default user:', error);
                res.status(500).json({ message: 'Failed to create user account' });
                return;
            }
        }
        if (!currentUserId || !tripId) {
            res.status(400).json({ message: 'User ID and trip ID are required' });
            return;
        }
        if (!passengers || passengers < 1) {
            res.status(400).json({ message: 'Number of passengers is required' });
            return;
        }
        // Check if trip exists and has available seats
        const trip = await prisma_1.prisma.trip.findUnique({
            where: { id: tripId },
            include: {
                bus: true,
                route: true,
                bookings: true
            }
        });
        if (!trip) {
            res.status(404).json({ message: 'Trip not found' });
            return;
        }
        if (trip.status !== 'SCHEDULED') {
            res.status(400).json({ message: 'Trip is not available for booking' });
            return;
        }
        // Get current bookings for this trip
        const currentBookings = await prisma_1.prisma.booking.findMany({
            where: {
                tripId,
                status: { in: ['PENDING', 'CONFIRMED'] }
            },
            select: { seatNumber: true }
        });
        // Check if bus has enough capacity
        if (currentBookings.length + passengers > trip.bus.capacity) {
            res.status(400).json({ message: 'Not enough seats available' });
            return;
        }
        // Find available seats in ascending order
        const bookedSeats = currentBookings.map(booking => booking.seatNumber);
        const availableSeats = [];
        for (let i = 1; i <= trip.bus.capacity; i++) {
            if (!bookedSeats.includes(i.toString())) {
                availableSeats.push(i.toString());
            }
        }
        if (availableSeats.length < passengers) {
            res.status(400).json({ message: 'Not enough available seats' });
            return;
        }
        // Assign seats to passengers
        const assignedSeats = availableSeats.slice(0, passengers);
        // Create bookings for each passenger
        const bookings = [];
        for (let i = 0; i < passengers; i++) {
            const booking = await prisma_1.prisma.booking.create({
                data: {
                    userId: currentUserId,
                    tripId,
                    seatNumber: assignedSeats[i],
                    price: trip.route.price,
                    status: 'CONFIRMED', // Auto-confirm for testing
                    paymentMethod: paymentMethod || 'cash',
                    passengerName: passengerDetails ?
                        `${passengerDetails.firstName} ${passengerDetails.lastName}` :
                        `Passenger ${i + 1}`
                },
                include: {
                    trip: {
                        include: {
                            bus: true,
                            route: true
                        }
                    },
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                }
            });
            // Generate ticket for this booking
            const ticket = await prisma_1.prisma.ticket.create({
                data: {
                    bookingId: booking.id,
                    qrCode: `QR-${booking.id}-${Date.now()}`,
                    status: 'ACTIVE',
                    passengerName: booking.passengerName || '',
                    passengerEmail: passengerDetails?.email || '',
                    seatNumber: booking.seatNumber,
                    busNumber: trip.bus.plateNumber,
                    routeOrigin: trip.route.origin,
                    routeDestination: trip.route.destination,
                    departureTime: trip.departureTime,
                    arrivalTime: trip.arrivalTime,
                    price: booking.price
                }
            });
            bookings.push({ ...booking, ticket });
        }
        // Send email notifications with tickets
        try {
            for (const booking of bookings) {
                if (booking.ticket && passengerDetails?.email) {
                    await email_service_1.emailService.sendBookingConfirmation({
                        passengerName: booking.passengerName,
                        email: passengerDetails.email,
                        trip: booking.trip,
                        seatNumber: booking.seatNumber,
                        price: booking.price,
                        ticket: booking.ticket
                    });
                }
            }
        }
        catch (emailError) {
            console.error('Failed to send email notifications:', emailError);
            // Don't fail the booking if email fails, just log the error
        }
        res.status(201).json({ message: 'Booking created successfully', bookings });
    }
    catch (error) {
        console.error('Create booking error:', error);
        console.error('Request body:', req.body);
        // Send more detailed error information for debugging
        if (error.code === 'P2002') {
            res.status(409).json({ message: 'Duplicate booking detected' });
        }
        else if (error.code === 'P2025') {
            res.status(404).json({ message: 'Related record not found' });
        }
        else if (error.message.includes('Foreign key constraint')) {
            res.status(400).json({ message: 'Invalid user or trip ID' });
        }
        else {
            res.status(500).json({
                message: 'Internal server error',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
};
exports.createBooking = createBooking;
const getAllBookings = async (req, res) => {
    try {
        const { userId, tripId, status } = req.query;
        const where = {};
        if (userId)
            where.userId = userId;
        if (tripId)
            where.tripId = tripId;
        if (status)
            where.status = status;
        const bookings = await prisma_1.prisma.booking.findMany({
            where,
            include: {
                trip: {
                    include: {
                        bus: true,
                        route: true
                    }
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                payment: true,
                ticket: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        res.json({ bookings });
    }
    catch (error) {
        console.error('Get all bookings error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getAllBookings = getAllBookings;
const getBookingById = async (req, res) => {
    try {
        const booking = await prisma_1.prisma.booking.findUnique({
            where: { id: req.params.id },
            include: {
                trip: {
                    include: {
                        bus: true,
                        route: true
                    }
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                payment: true,
                ticket: true
            }
        });
        if (!booking) {
            res.status(404).json({ message: 'Booking not found' });
            return;
        }
        res.json({ booking });
    }
    catch (error) {
        console.error('Get booking by ID error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getBookingById = getBookingById;
const updateBookingStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!status || !['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'].includes(status)) {
            res.status(400).json({ message: 'Valid status is required (PENDING, CONFIRMED, CANCELLED, COMPLETED)' });
            return;
        }
        const booking = await prisma_1.prisma.booking.update({
            where: { id: req.params.id },
            data: { status },
            include: {
                trip: {
                    include: {
                        bus: true,
                        route: true
                    }
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });
        res.json({ message: 'Booking status updated', booking });
    }
    catch (error) {
        if (error.code === 'P2025') {
            res.status(404).json({ message: 'Booking not found' });
            return;
        }
        console.error('Update booking status error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.updateBookingStatus = updateBookingStatus;
const cancelBooking = async (req, res) => {
    try {
        const booking = await prisma_1.prisma.booking.findUnique({
            where: { id: req.params.id },
            include: { trip: true }
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
        // Check if trip departure time is within 2 hours
        const departureTime = new Date(booking.trip.departureTime);
        const now = new Date();
        const timeDiff = departureTime.getTime() - now.getTime();
        const hoursDiff = timeDiff / (1000 * 60 * 60);
        if (hoursDiff < 2) {
            res.status(400).json({ message: 'Cannot cancel booking less than 2 hours before departure' });
            return;
        }
        const updatedBooking = await prisma_1.prisma.booking.update({
            where: { id: req.params.id },
            data: { status: 'CANCELLED' },
            include: {
                trip: {
                    include: {
                        bus: true,
                        route: true
                    }
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });
        res.json({ message: 'Booking cancelled successfully', booking: updatedBooking });
    }
    catch (error) {
        console.error('Cancel booking error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.cancelBooking = cancelBooking;
const getAvailableSeats = async (req, res) => {
    try {
        const { tripId } = req.params;
        if (!tripId) {
            res.status(400).json({ message: 'Trip ID is required' });
            return;
        }
        const trip = await prisma_1.prisma.trip.findUnique({
            where: { id: tripId },
            include: { bus: true }
        });
        if (!trip) {
            res.status(404).json({ message: 'Trip not found' });
            return;
        }
        const bookedSeats = await prisma_1.prisma.booking.findMany({
            where: {
                tripId: tripId,
                status: { in: ['PENDING', 'CONFIRMED'] }
            },
            select: { seatNumber: true }
        });
        const bookedSeatNumbers = bookedSeats.map(booking => booking.seatNumber);
        const totalSeats = trip.bus.capacity;
        // Generate all possible seat numbers (1 to capacity)
        const allSeats = Array.from({ length: totalSeats }, (_, i) => (i + 1).toString());
        const availableSeats = allSeats.filter(seat => !bookedSeatNumbers.includes(seat));
        res.json({
            tripId,
            totalSeats,
            bookedSeats: bookedSeatNumbers.length,
            availableSeats,
            availableCount: availableSeats.length
        });
    }
    catch (error) {
        console.error('Get available seats error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getAvailableSeats = getAvailableSeats;
const getUserBookings = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!userId) {
            res.status(400).json({ message: 'User ID is required' });
            return;
        }
        const bookings = await prisma_1.prisma.booking.findMany({
            where: { userId: userId },
            include: {
                trip: {
                    include: {
                        bus: true,
                        route: true
                    }
                },
                payment: true,
                ticket: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        res.json({ bookings });
    }
    catch (error) {
        console.error('Get user bookings error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getUserBookings = getUserBookings;
