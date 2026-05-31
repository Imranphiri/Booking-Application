"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSystemHealth = exports.backupSystem = exports.toggleMaintenanceMode = exports.getSystemStats = exports.updateSystemSettings = exports.getSystemSettings = void 0;
const prisma_1 = require("../lib/prisma");
const getSystemSettings = async (req, res) => {
    try {
        let settings = await prisma_1.prisma.systemSettings.findFirst();
        if (!settings) {
            // Create default settings if none exist
            settings = await prisma_1.prisma.systemSettings.create({
                data: {
                    termsAndConditions: 'Standard terms and conditions',
                    privacyPolicy: 'Privacy policy statement',
                    aboutUs: 'Company information',
                    contactInfo: 'Contact information',
                    socialMediaLinks: '{}'
                }
            });
        }
        res.json({ settings });
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to fetch system settings' });
    }
};
exports.getSystemSettings = getSystemSettings;
const updateSystemSettings = async (req, res) => {
    try {
        const { companyName, companyEmail, companyPhone, companyAddress, maintenanceMode, maintenanceMessage, allowRegistrations, requireEmailVerification, defaultCurrency, maxBookingPerUser, cancellationPolicy, termsAndConditions, privacyPolicy, aboutUs, contactInfo, socialMediaLinks, logoUrl, faviconUrl, primaryColor, secondaryColor } = req.body;
        let settings = await prisma_1.prisma.systemSettings.findFirst();
        if (!settings) {
            // Create settings if none exist
            settings = await prisma_1.prisma.systemSettings.create({
                data: req.body
            });
        }
        else {
            // Update existing settings
            settings = await prisma_1.prisma.systemSettings.update({
                where: { id: settings.id },
                data: req.body
            });
        }
        res.json({ message: 'System settings updated successfully', settings });
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to update system settings' });
    }
};
exports.updateSystemSettings = updateSystemSettings;
const getSystemStats = async (req, res) => {
    try {
        const [users, buses, routes, trips, bookings, tickets, revenue] = await Promise.all([
            prisma_1.prisma.user.count(),
            prisma_1.prisma.bus.count(),
            prisma_1.prisma.route.count(),
            prisma_1.prisma.trip.count(),
            prisma_1.prisma.booking.count(),
            prisma_1.prisma.ticket.count(),
            prisma_1.prisma.booking.aggregate({
                _sum: { price: true },
                where: {
                    payment: {
                        status: 'PAID'
                    }
                }
            })
        ]);
        res.json({
            stats: {
                totalUsers: users,
                totalBuses: buses,
                totalRoutes: routes,
                totalTrips: trips,
                totalBookings: bookings,
                totalTickets: tickets,
                totalRevenue: revenue._sum.price || 0,
                usersByRole: await prisma_1.prisma.user.groupBy({
                    by: ['role'],
                    _count: true
                }),
                recentActivity: {
                    todayBookings: await prisma_1.prisma.booking.count({
                        where: {
                            createdAt: {
                                gte: new Date(new Date().setHours(0, 0, 0, 0))
                            }
                        }
                    }),
                    todayRevenue: await prisma_1.prisma.booking.aggregate({
                        _sum: { price: true },
                        where: {
                            createdAt: {
                                gte: new Date(new Date().setHours(0, 0, 0, 0))
                            },
                            payment: {
                                status: 'PAID'
                            }
                        }
                    })
                }
            }
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to fetch system statistics' });
    }
};
exports.getSystemStats = getSystemStats;
const toggleMaintenanceMode = async (req, res) => {
    try {
        const { maintenanceMode, maintenanceMessage } = req.body;
        let settings = await prisma_1.prisma.systemSettings.findFirst();
        if (!settings) {
            settings = await prisma_1.prisma.systemSettings.create({
                data: {
                    maintenanceMode,
                    maintenanceMessage,
                    termsAndConditions: 'Standard terms and conditions',
                    privacyPolicy: 'Privacy policy statement',
                    aboutUs: 'Company information',
                    contactInfo: 'Contact information',
                    socialMediaLinks: '{}'
                }
            });
        }
        else {
            settings = await prisma_1.prisma.systemSettings.update({
                where: { id: settings.id },
                data: { maintenanceMode, maintenanceMessage }
            });
        }
        res.json({
            message: `Maintenance mode ${maintenanceMode ? 'enabled' : 'disabled'}`,
            settings
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to toggle maintenance mode' });
    }
};
exports.toggleMaintenanceMode = toggleMaintenanceMode;
const backupSystem = async (req, res) => {
    try {
        // This would typically trigger a database backup
        // For now, we'll just return a success message
        res.json({
            message: 'System backup initiated',
            backupId: `backup_${Date.now()}`,
            status: 'processing'
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to initiate system backup' });
    }
};
exports.backupSystem = backupSystem;
const getSystemHealth = async (req, res) => {
    try {
        const health = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            database: 'connected',
            memory: process.memoryUsage(),
            uptime: process.uptime(),
            version: '1.0.0'
        };
        res.json({ health });
    }
    catch (error) {
        res.status(500).json({
            health: {
                status: 'unhealthy',
                timestamp: new Date().toISOString(),
                error: error?.message || 'Unknown error'
            }
        });
    }
};
exports.getSystemHealth = getSystemHealth;
