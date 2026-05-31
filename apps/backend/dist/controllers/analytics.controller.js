"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportReports = exports.getBookingTrends = exports.getRoutePerformance = exports.getRevenueReports = exports.getExecutiveDashboard = void 0;
const prisma_1 = require("../lib/prisma");
const getExecutiveDashboard = async (req, res) => {
    try {
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        // Total bookings
        const totalBookings = await prisma_1.prisma.booking.count();
        // Today's bookings
        const todayBookings = await prisma_1.prisma.booking.count({
            where: { createdAt: { gte: startOfDay } }
        });
        // This month's bookings
        const monthlyBookings = await prisma_1.prisma.booking.count({
            where: {
                createdAt: { gte: startOfMonth }
            }
        });
        // Active trips today
        const activeTrips = await prisma_1.prisma.trip.count({
            where: {
                departureTime: {
                    gte: startOfDay,
                    lte: new Date(today.setHours(23, 59, 59, 999))
                },
                status: 'SCHEDULED'
            }
        });
        // Total revenue - simplified
        const confirmedBookings = await prisma_1.prisma.booking.findMany({
            where: { status: 'CONFIRMED' }
        });
        const totalRevenue = confirmedBookings.reduce((sum, booking) => sum + booking.price, 0);
        // Today's revenue
        const todayBookingsData = await prisma_1.prisma.booking.findMany({
            where: {
                status: 'CONFIRMED',
                createdAt: { gte: startOfDay }
            }
        });
        const todayRevenue = todayBookingsData.reduce((sum, booking) => sum + booking.price, 0);
        // Monthly revenue
        const monthlyBookingsData = await prisma_1.prisma.booking.findMany({
            where: {
                status: 'CONFIRMED',
                createdAt: { gte: startOfMonth }
            }
        });
        const monthlyRevenue = monthlyBookingsData.reduce((sum, booking) => sum + booking.price, 0);
        res.json({
            totalBookings,
            todayBookings,
            monthlyBookings,
            activeTrips,
            totalRevenue,
            todayRevenue,
            monthlyRevenue,
            occupancyRate: 0, // Simplified for now
            lastUpdated: new Date()
        });
    }
    catch (error) {
        console.error('Error fetching executive dashboard:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getExecutiveDashboard = getExecutiveDashboard;
const getRevenueReports = async (req, res) => {
    try {
        // Simple revenue reports for now
        const revenueByPaymentMethod = await prisma_1.prisma.booking.groupBy({
            by: ['paymentMethod'],
            _sum: { price: true },
            _count: { id: true },
            where: {
                status: 'CONFIRMED',
                paymentMethod: { not: null }
            }
        });
        res.json({
            revenueByPaymentMethod,
            totalRevenue: revenueByPaymentMethod.reduce((sum, item) => sum + (item._sum?.price || 0), 0),
            totalBookings: revenueByPaymentMethod.reduce((sum, item) => sum + (item._count?.id || 0), 0)
        });
    }
    catch (error) {
        console.error('Error fetching revenue reports:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getRevenueReports = getRevenueReports;
const getRoutePerformance = async (req, res) => {
    try {
        res.json({ message: 'Route performance temporarily disabled for debugging' });
    }
    catch (error) {
        console.error('Error fetching route performance:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getRoutePerformance = getRoutePerformance;
const getBookingTrends = async (req, res) => {
    try {
        res.json({ message: 'Booking trends temporarily disabled for debugging' });
    }
    catch (error) {
        console.error('Error fetching booking trends:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getBookingTrends = getBookingTrends;
const exportReports = async (req, res) => {
    try {
        res.json({ message: 'Report export functionality' });
    }
    catch (error) {
        console.error('Error exporting reports:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.exportReports = exportReports;
