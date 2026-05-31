"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanupExpiredLocks = exports.getSeatCategories = exports.releaseSeatLocks = exports.lockSeats = exports.getSeatMap = void 0;
const prisma_1 = require("../lib/prisma");
const getSeatMap = async (req, res) => {
    try {
        const { tripId } = req.params;
        const trip = await prisma_1.prisma.trip.findUnique({
            where: { id: tripId },
            include: {
                bus: true,
                bookings: {
                    where: { status: { in: ['PENDING', 'CONFIRMED'] } }
                }
            }
        });
        if (!trip) {
            res.status(404).json({ message: 'Trip not found' });
            return;
        }
        const capacity = trip.bus.capacity;
        const bookedSeats = trip.bookings.map((b) => b.seatNumber);
        // Generate seat map
        const seatMap = generateSeatLayout(capacity, bookedSeats);
        res.json({
            tripId,
            bus: trip.bus,
            seatMap,
            bookedSeats,
            availableSeats: capacity - bookedSeats.length,
            categories: (0, exports.getSeatCategories)()
        });
    }
    catch (error) {
        console.error('Error fetching seat map:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getSeatMap = getSeatMap;
const lockSeats = async (req, res) => {
    try {
        const { tripId, seatNumbers, userId, lockDuration = 10 } = req.body;
        // Validate trip
        const trip = await prisma_1.prisma.trip.findUnique({
            where: { id: tripId },
            include: {
                bus: true,
                bookings: {
                    where: {
                        status: { in: ['PENDING', 'CONFIRMED'] },
                        seatNumber: { in: seatNumbers }
                    }
                }
            }
        });
        if (!trip) {
            res.status(404).json({ message: 'Trip not found' });
            return;
        }
        // Check if seats are already booked
        const alreadyBooked = trip.bookings.map((b) => b.seatNumber);
        if (alreadyBooked.length > 0) {
            res.status(409).json({
                message: 'Some seats are already booked',
                bookedSeats: alreadyBooked
            });
            return;
        }
        // Check existing locks
        const existingLocks = await prisma_1.prisma.seatLock.findMany({
            where: {
                tripId,
                seatNumber: { in: seatNumbers },
                expiresAt: { gt: new Date() }
            }
        });
        if (existingLocks.length > 0) {
            res.status(409).json({
                message: 'Some seats are already locked',
                lockedSeats: existingLocks.map((l) => l.seatNumber)
            });
            return;
        }
        // Create seat locks
        const expiresAt = new Date(Date.now() + lockDuration * 60 * 1000);
        const seatLocks = await prisma_1.prisma.seatLock.createMany({
            data: seatNumbers.map(seatNumber => ({
                tripId,
                seatNumber,
                userId,
                expiresAt
            }))
        });
        res.json({
            message: 'Seats locked successfully',
            lockedSeats: seatNumbers,
            expiresAt,
            lockDuration
        });
    }
    catch (error) {
        console.error('Error locking seats:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.lockSeats = lockSeats;
const releaseSeatLocks = async (req, res) => {
    try {
        const { tripId, seatNumbers, userId } = req.body;
        await prisma_1.prisma.seatLock.deleteMany({
            where: {
                tripId,
                seatNumber: { in: seatNumbers },
                userId
            }
        });
        res.json({ message: 'Seat locks released successfully' });
    }
    catch (error) {
        console.error('Error releasing seat locks:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.releaseSeatLocks = releaseSeatLocks;
const getSeatCategories = () => {
    return [
        {
            id: 'vip',
            name: 'VIP',
            priceMultiplier: 1.5,
            features: ['Extra legroom', 'Priority boarding', 'Complimentary refreshments'],
            color: '#FFD700',
            position: [] // Will be populated based on bus layout
        },
        {
            id: 'standard',
            name: 'Standard',
            priceMultiplier: 1.0,
            features: ['Standard seating', 'Air conditioning'],
            color: '#4CAF50',
            position: []
        },
        {
            id: 'economy',
            name: 'Economy',
            priceMultiplier: 0.8,
            features: ['Basic seating'],
            color: '#2196F3',
            position: []
        }
    ];
};
exports.getSeatCategories = getSeatCategories;
const generateSeatLayout = (capacity, bookedSeats) => {
    const rows = Math.ceil(capacity / 4); // 4 seats per row
    const layout = [];
    for (let row = 0; row < rows; row++) {
        const rowSeats = [];
        for (let col = 0; col < 4; col++) {
            const seatNumber = `${row + 1}${String.fromCharCode(65 + col)}`;
            const seatIndex = row * 4 + col;
            if (seatIndex < capacity) {
                rowSeats.push({
                    number: seatNumber,
                    isBooked: bookedSeats.includes(seatNumber),
                    category: getSeatCategory(seatNumber, capacity),
                    position: { row, column: col }
                });
            }
        }
        layout.push(rowSeats);
    }
    return layout;
};
const getSeatCategory = (seatNumber, capacity) => {
    const row = parseInt(seatNumber.replace(/\D/g, ''));
    const totalRows = Math.ceil(capacity / 4);
    // First 2 rows are VIP, last 2 rows are Economy
    if (row <= 2)
        return 'vip';
    if (row >= totalRows - 1)
        return 'economy';
    return 'standard';
};
// Cleanup expired locks (should be run as a cron job)
const cleanupExpiredLocks = async () => {
    try {
        const result = await prisma_1.prisma.seatLock.deleteMany({
            where: {
                expiresAt: { lte: new Date() }
            }
        });
    }
    catch (error) {
        console.error('Error cleaning up expired locks:', error);
    }
};
exports.cleanupExpiredLocks = cleanupExpiredLocks;
