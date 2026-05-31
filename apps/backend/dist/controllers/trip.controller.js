"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTrip = exports.updateTrip = exports.getTripById = exports.getAllTrips = exports.createTrip = void 0;
const prisma_1 = require("../lib/prisma");
const createTrip = async (req, res) => {
    try {
        const { routeId, busId, departureTime, arrivalTime, pricePerSeat } = req.body;
        if (!routeId || !busId || !departureTime || !arrivalTime || !pricePerSeat) {
            res.status(400).json({ message: 'All fields are required' });
            return;
        }
        // get bus to know capacity
        const bus = await prisma_1.prisma.bus.findUnique({ where: { id: busId } });
        if (!bus) {
            res.status(404).json({ message: 'Bus not found' });
            return;
        }
        // create trip
        const trip = await prisma_1.prisma.trip.create({
            data: {
                routeId,
                busId,
                departureTime: new Date(departureTime),
                arrivalTime: new Date(arrivalTime)
            }
        });
        res.status(201).json({ message: 'Trip created with seats', trip });
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.createTrip = createTrip;
const getAllTrips = async (req, res) => {
    try {
        const { origin, destination, date } = req.query;
        const where = {};
        if (origin || destination) {
            where.route = {};
            if (origin)
                where.route.origin = { contains: origin, mode: 'insensitive' };
            if (destination)
                where.route.destination = { contains: destination, mode: 'insensitive' };
        }
        if (date) {
            const searchDate = new Date(date);
            const nextDay = new Date(searchDate);
            nextDay.setDate(nextDay.getDate() + 1);
            where.departureTime = { gte: searchDate, lt: nextDay };
        }
        const trips = await prisma_1.prisma.trip.findMany({
            where,
            include: {
                route: true,
                bus: true,
                _count: { select: { bookings: true } }
            },
            orderBy: { departureTime: 'asc' }
        });
        res.json({ trips });
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getAllTrips = getAllTrips;
const getTripById = async (req, res) => {
    try {
        const trip = await prisma_1.prisma.trip.findUnique({
            where: { id: req.params.id },
            include: {
                route: true,
                bus: true
            }
        });
        if (!trip) {
            res.status(404).json({ message: 'Trip not found' });
            return;
        }
        res.json({ trip });
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getTripById = getTripById;
const updateTrip = async (req, res) => {
    try {
        const { departureTime, arrivalTime } = req.body;
        const trip = await prisma_1.prisma.trip.update({
            where: { id: req.params.id },
            data: {
                departureTime: departureTime ? new Date(departureTime) : undefined,
                arrivalTime: arrivalTime ? new Date(arrivalTime) : undefined
            }
        });
        res.json({ message: 'Trip updated', trip });
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.updateTrip = updateTrip;
const deleteTrip = async (req, res) => {
    try {
        await prisma_1.prisma.trip.delete({ where: { id: req.params.id } });
        res.json({ message: 'Trip deleted' });
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.deleteTrip = deleteTrip;
