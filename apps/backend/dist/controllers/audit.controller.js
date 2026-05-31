"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditMiddleware = exports.getSecurityAlerts = exports.createSecurityAlert = exports.getAuditSummary = exports.getAuditLogs = exports.logAuditEvent = void 0;
const prisma_1 = require("../lib/prisma");
const logAuditEvent = async (data) => {
    try {
        await prisma_1.prisma.auditLog.create({
            data: {
                userId: data.userId || null,
                action: data.action,
                resource: data.resource,
                resourceId: data.resourceId || null,
                details: data.details ? JSON.stringify(data.details) : null,
                ipAddress: data.ipAddress || null,
                userAgent: data.userAgent || null,
                status: data.status,
                timestamp: new Date()
            }
        });
    }
    catch (error) {
        console.error('Failed to log audit event:', error);
        // Don't throw error to avoid breaking main functionality
    }
};
exports.logAuditEvent = logAuditEvent;
const getAuditLogs = async (req, res) => {
    try {
        const { page = 1, limit = 50, userId, action, resource, status, startDate, endDate } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const whereClause = {};
        if (userId)
            whereClause.userId = userId;
        if (action)
            whereClause.action = { contains: action };
        if (resource)
            whereClause.resource = resource;
        if (status)
            whereClause.status = status;
        if (startDate || endDate) {
            whereClause.timestamp = {};
            if (startDate)
                whereClause.timestamp.gte = new Date(startDate);
            if (endDate)
                whereClause.timestamp.lte = new Date(endDate);
        }
        const [logs, total] = await Promise.all([
            prisma_1.prisma.auditLog.findMany({
                where: whereClause,
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            role: true
                        }
                    }
                },
                orderBy: { timestamp: 'desc' },
                skip,
                take: Number(limit)
            }),
            prisma_1.prisma.auditLog.count({ where: whereClause })
        ]);
        res.json({
            logs,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        });
    }
    catch (error) {
        console.error('Error fetching audit logs:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getAuditLogs = getAuditLogs;
const getAuditSummary = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const dateFilter = {};
        if (startDate || endDate) {
            dateFilter.timestamp = {};
            if (startDate)
                dateFilter.timestamp.gte = new Date(startDate);
            if (endDate)
                dateFilter.timestamp.lte = new Date(endDate);
        }
        // Activity by action type
        const actionCounts = await prisma_1.prisma.auditLog.groupBy({
            by: ['action'],
            _count: { id: true },
            where: dateFilter,
            orderBy: { _count: { id: 'desc' } }
        });
        // Activity by resource type
        const resourceCounts = await prisma_1.prisma.auditLog.groupBy({
            by: ['resource'],
            _count: { id: true },
            where: dateFilter,
            orderBy: { _count: { id: 'desc' } }
        });
        // Activity by status
        const statusCounts = await prisma_1.prisma.auditLog.groupBy({
            by: ['status'],
            _count: { id: true },
            where: dateFilter
        });
        // Top active users
        const topUsers = await prisma_1.prisma.auditLog.groupBy({
            by: ['userId'],
            _count: { id: true },
            where: {
                ...dateFilter,
                userId: { not: null }
            },
            orderBy: { _count: { id: 'desc' } },
            take: 10
        });
        // Get user details for top users
        const topUsersWithDetails = await Promise.all(topUsers.map(async (item) => {
            const user = await prisma_1.prisma.user.findUnique({
                where: { id: item.userId },
                select: { id: true, name: true, email: true, role: true }
            });
            return {
                ...item,
                user
            };
        }));
        // Recent failed attempts (security monitoring)
        const recentFailures = await prisma_1.prisma.auditLog.findMany({
            where: {
                status: 'FAILED',
                timestamp: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: { timestamp: 'desc' },
            take: 20
        });
        res.json({
            actionCounts,
            resourceCounts,
            statusCounts,
            topUsers: topUsersWithDetails,
            recentFailures,
            totalEvents: actionCounts.reduce((sum, item) => sum + item._count.id, 0)
        });
    }
    catch (error) {
        console.error('Error fetching audit summary:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getAuditSummary = getAuditSummary;
const createSecurityAlert = async (req, res) => {
    try {
        const { type, severity, description, userId, ipAddress } = req.body;
        const alert = await prisma_1.prisma.securityAlert.create({
            data: {
                type,
                severity,
                description,
                userId: userId || null,
                ipAddress: ipAddress || null,
                status: 'ACTIVE',
                createdAt: new Date()
            }
        });
        // Log the security alert as an audit event
        await (0, exports.logAuditEvent)({
            action: 'SECURITY_ALERT_CREATED',
            resource: 'SecurityAlert',
            resourceId: alert.id,
            details: { type, severity, description },
            ipAddress,
            status: 'WARNING'
        });
        res.status(201).json({ message: 'Security alert created', alert });
    }
    catch (error) {
        console.error('Error creating security alert:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.createSecurityAlert = createSecurityAlert;
const getSecurityAlerts = async (req, res) => {
    try {
        const { page = 1, limit = 20, status, severity } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const whereClause = {};
        if (status)
            whereClause.status = status;
        if (severity)
            whereClause.severity = severity;
        const [alerts, total] = await Promise.all([
            prisma_1.prisma.securityAlert.findMany({
                where: whereClause,
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: Number(limit)
            }),
            prisma_1.prisma.securityAlert.count({ where: whereClause })
        ]);
        res.json({
            alerts,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        });
    }
    catch (error) {
        console.error('Error fetching security alerts:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getSecurityAlerts = getSecurityAlerts;
// Middleware to automatically log audit events
const auditMiddleware = (action, resource) => {
    return (req, res, next) => {
        const originalSend = res.send;
        res.send = (body) => {
            // Log action after response is sent
            setImmediate(async () => {
                try {
                    const user = req.user;
                    await (0, exports.logAuditEvent)({
                        userId: user?.id,
                        action,
                        resource,
                        resourceId: req.params.id || req.body.id,
                        details: {
                            ...req.body,
                            timestamp: new Date().toISOString()
                        },
                        ipAddress: req.ip,
                        userAgent: req.get('User-Agent'),
                        status: res.statusCode >= 400 ? 'FAILED' : 'SUCCESS'
                    });
                }
                catch (error) {
                    console.error('Audit logging error:', error);
                }
            });
            originalSend.call(this, body);
        };
        next();
    };
};
exports.auditMiddleware = auditMiddleware;
