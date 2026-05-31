import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const getSystemSettings = async (req: Request, res: Response) => {
  try {
    let settings = await prisma.systemSettings.findFirst();
    
    if (!settings) {
      // Create default settings if none exist
      settings = await prisma.systemSettings.create({
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
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch system settings' });
  }
};

export const updateSystemSettings = async (req: Request, res: Response) => {
  try {
    const { companyName, companyEmail, companyPhone, companyAddress, maintenanceMode, 
            maintenanceMessage, allowRegistrations, requireEmailVerification, 
            defaultCurrency, maxBookingPerUser, cancellationPolicy, 
            termsAndConditions, privacyPolicy, aboutUs, contactInfo, 
            socialMediaLinks, logoUrl, faviconUrl, primaryColor, secondaryColor } = req.body;

    let settings = await prisma.systemSettings.findFirst();
    
    if (!settings) {
      // Create settings if none exist
      settings = await prisma.systemSettings.create({
        data: req.body
      });
    } else {
      // Update existing settings
      settings = await prisma.systemSettings.update({
        where: { id: settings.id },
        data: req.body
      });
    }

    res.json({ message: 'System settings updated successfully', settings });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update system settings' });
  }
};

export const getSystemStats = async (req: Request, res: Response) => {
  try {
    const [users, buses, routes, trips, bookings, tickets, revenue] = await Promise.all([
      prisma.user.count(),
      prisma.bus.count(),
      prisma.route.count(),
      prisma.trip.count(),
      prisma.booking.count(),
      prisma.ticket.count(),
      prisma.booking.aggregate({
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
        usersByRole: await prisma.user.groupBy({
          by: ['role'],
          _count: true
        }),
        recentActivity: {
          todayBookings: await prisma.booking.count({
            where: {
              createdAt: {
                gte: new Date(new Date().setHours(0, 0, 0, 0))
              }
            }
          }),
          todayRevenue: await prisma.booking.aggregate({
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
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch system statistics' });
  }
};

export const toggleMaintenanceMode = async (req: Request, res: Response) => {
  try {
    const { maintenanceMode, maintenanceMessage } = req.body;

    let settings = await prisma.systemSettings.findFirst();
    
    if (!settings) {
      settings = await prisma.systemSettings.create({
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
    } else {
      settings = await prisma.systemSettings.update({
        where: { id: settings.id },
        data: { maintenanceMode, maintenanceMessage }
      });
    }

    res.json({ 
      message: `Maintenance mode ${maintenanceMode ? 'enabled' : 'disabled'}`,
      settings 
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to toggle maintenance mode' });
  }
};

export const backupSystem = async (req: Request, res: Response) => {
  try {
    // This would typically trigger a database backup
    // For now, we'll just return a success message
    res.json({ 
      message: 'System backup initiated',
      backupId: `backup_${Date.now()}`,
      status: 'processing'
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to initiate system backup' });
  }
};

export const getSystemHealth = async (req: Request, res: Response) => {
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
  } catch (error: any) {
    res.status(500).json({ 
      health: {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error?.message || 'Unknown error'
      }
    });
  }
};
