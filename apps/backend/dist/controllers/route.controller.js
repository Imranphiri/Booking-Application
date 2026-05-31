"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteRoute = exports.updateRoute = exports.getRouteById = exports.getAllRoutes = exports.createRoute = void 0;
const prisma_1 = require("../lib/prisma");
const createRoute = async (req, res) => {
    try {
        const { origin, destination, distance, price } = req.body;
        if (!origin || !destination || !distance || !price) {
            res.status(400).json({ message: 'All fields are required' });
            return;
        }
        const route = await prisma_1.prisma.route.create({
            data: { origin, destination, distance: parseFloat(distance), price: parseFloat(price) }
        });
        res.status(201).json({ message: 'Route created', route });
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.createRoute = createRoute;
const getAllRoutes = async (req, res) => {
    try {
        const routes = await prisma_1.prisma.route.findMany({
            include: { _count: { select: { trips: true } } }
        });
        res.json({ routes });
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getAllRoutes = getAllRoutes;
const getRouteById = async (req, res) => {
    try {
        const route = await prisma_1.prisma.route.findUnique({
            where: { id: req.params.id },
            include: { trips: { include: { bus: true } } }
        });
        if (!route) {
            res.status(404).json({ message: 'Route not found' });
            return;
        }
        res.json({ route });
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getRouteById = getRouteById;
const updateRoute = async (req, res) => {
    try {
        const { origin, destination, distance, price } = req.body;
        const route = await prisma_1.prisma.route.update({
            where: { id: req.params.id },
            data: {
                origin,
                destination,
                distance: distance ? parseFloat(distance) : undefined,
                price: price ? parseFloat(price) : undefined
            }
        });
        res.json({ message: 'Route updated', route });
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.updateRoute = updateRoute;
const deleteRoute = async (req, res) => {
    try {
        await prisma_1.prisma.route.delete({ where: { id: req.params.id } });
        res.json({ message: 'Route deleted' });
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.deleteRoute = deleteRoute;
