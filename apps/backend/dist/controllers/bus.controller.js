"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBus = exports.updateBus = exports.getBusById = exports.getAllBuses = exports.createBus = void 0;
const prisma_1 = require("../lib/prisma");
const createBus = async (req, res) => {
    try {
        const { plateNumber, model, capacity, type, features, status, driver, currentRoute } = req.body;
        if (!plateNumber || !model || !capacity) {
            res.status(400).json({ message: 'Plate number, model, and capacity are required' });
            return;
        }
        const bus = await prisma_1.prisma.bus.create({
            data: {
                plateNumber,
                model,
                capacity: parseInt(capacity),
                type: type || 'Standard',
                features: features || [],
                status: status || 'Active',
                driver: driver || null,
                currentRoute: currentRoute || null
            }
        });
        res.status(201).json({ message: 'Bus created', bus });
    }
    catch (error) {
        if (error.code === 'P2002') {
            res.status(409).json({ message: 'Plate number already exists' });
            return;
        }
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.createBus = createBus;
const getAllBuses = async (req, res) => {
    try {
        const buses = await prisma_1.prisma.bus.findMany({
            include: {
                _count: { select: { trips: true } }
            }
        });
        res.json({ buses });
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getAllBuses = getAllBuses;
const getBusById = async (req, res) => {
    try {
        const bus = await prisma_1.prisma.bus.findUnique({
            where: { id: req.params.id },
            include: { trips: true }
        });
        if (!bus) {
            res.status(404).json({ message: 'Bus not found' });
            return;
        }
        res.json({ bus });
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getBusById = getBusById;
const updateBus = async (req, res) => {
    try {
        const { plateNumber, model, capacity, type, features, status, driver, currentRoute } = req.body;
        const bus = await prisma_1.prisma.bus.update({
            where: { id: req.params.id },
            data: {
                plateNumber,
                model,
                capacity: capacity ? parseInt(capacity) : undefined,
                type,
                features,
                status,
                driver: driver || null,
                currentRoute: currentRoute || null
            }
        });
        res.json({ message: 'Bus updated', bus });
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.updateBus = updateBus;
const deleteBus = async (req, res) => {
    try {
        await prisma_1.prisma.bus.delete({ where: { id: req.params.id } });
        res.json({ message: 'Bus deleted' });
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.deleteBus = deleteBus;
