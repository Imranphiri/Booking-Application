import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { qrCodeService, TicketData } from '../services/qrCode.service';

export const createTicket = async (req: Request, res: Response): Promise<void> => {
  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      res.status(400).json({ 
        message: 'Booking ID is required' 
      });
      return;
    }

    // Check if booking exists and has a successful payment
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        trip: {
          include: {
            route: true,
            bus: true
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

    if (booking.ticket) {
      res.status(400).json({ 
        message: 'Ticket already exists for this booking',
        ticketId: booking.ticket.id
      });
      return;
    }

    if (!booking.payment || booking.payment.status !== 'PAID') {
      res.status(400).json({ 
        message: 'Ticket can only be generated for paid bookings',
        paymentStatus: booking.payment?.status
      });
      return;
    }

    if (booking.status !== 'CONFIRMED') {
      res.status(400).json({ 
        message: 'Booking must be confirmed to generate ticket',
        bookingStatus: booking.status
      });
      return;
    }

    // Generate QR code for the ticket
    const ticketId = qrCodeService.generateTicketId();
    const qrCodeResult = await qrCodeService.generateTicketQRCode({
      ticketId,
      bookingId,
      passengerName: booking.user.name || null,
      passengerEmail: booking.user.email || null,
      seatNumber: booking.seatNumber,
      busNumber: booking.trip.bus.plateNumber,
      routeOrigin: booking.trip.route.origin,
      routeDestination: booking.trip.route.destination,
      departureTime: booking.trip.departureTime,
      arrivalTime: booking.trip.arrivalTime,
      price: booking.price,
      createdAt: new Date()
    });

    // Create ticket in database
    const ticket = await prisma.ticket.create({
      data: {
        id: ticketId,
        bookingId,
        qrCode: qrCodeResult.qrCode,
        status: 'ACTIVE',
        passengerName: booking.user.name,
        passengerEmail: booking.user.email,
        seatNumber: booking.seatNumber,
        busNumber: booking.trip.bus.plateNumber,
        routeOrigin: booking.trip.route.origin,
        routeDestination: booking.trip.route.destination,
        departureTime: booking.trip.departureTime,
        arrivalTime: booking.trip.arrivalTime,
        price: booking.price,
        validationData: JSON.stringify({
          signature: qrCodeResult.signature,
          generatedAt: new Date().toISOString(),
          version: '1.0'
        })
      },
      include: {
        booking: {
          include: {
            trip: {
              include: {
                route: true,
                bus: true
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
        }
      }
    });

    res.status(201).json({
      message: 'Ticket created successfully',
      ticket: {
        ...ticket,
        qrCodeDataUrl: qrCodeResult.qrCodeDataUrl
      }
    });
  } catch (error: any) {
    console.error('Create ticket error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getTicketById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const ticket = await prisma.ticket.findUnique({
      where: { id: id as string },
      include: {
        booking: {
          include: {
            trip: {
              include: {
                route: true,
                bus: true
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
        },
        ticketScans: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!ticket) {
      res.status(404).json({ message: 'Ticket not found' });
      return;
    }

    // Format ticket for display
    const formattedTicket = qrCodeService.formatTicketForDisplay({
      ticketId: ticket.id,
      bookingId: ticket.bookingId,
      passengerName: ticket.passengerName,
      passengerEmail: ticket.passengerEmail,
      seatNumber: ticket.seatNumber,
      busNumber: ticket.busNumber,
      routeOrigin: ticket.routeOrigin,
      routeDestination: ticket.routeDestination,
      departureTime: ticket.departureTime,
      arrivalTime: ticket.arrivalTime,
      price: ticket.price,
      createdAt: ticket.createdAt,
      signature: JSON.parse(ticket.validationData || '{}').signature
    });

    res.json({ 
      ticket: {
        ...ticket,
        formatted: formattedTicket
      }
    });
  } catch (error) {
    console.error('Get ticket by ID error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAllTickets = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, bookingId, passengerEmail } = req.query;

    const where: any = {};
    
    if (status) where.status = status as string;
    if (bookingId) where.bookingId = bookingId as string;
    if (passengerEmail) where.passengerEmail = passengerEmail as string;

    const tickets = await prisma.ticket.findMany({
      where,
      include: {
        booking: {
          include: {
            trip: {
              include: {
                route: true,
                bus: true
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
        },
        ticketScans: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Format tickets for display
    const formattedTickets = tickets.map(ticket => ({
      ...ticket,
      formatted: qrCodeService.formatTicketForDisplay({
        ticketId: ticket.id,
        bookingId: ticket.bookingId,
        passengerName: ticket.passengerName || null,
        passengerEmail: ticket.passengerEmail || null,
        seatNumber: ticket.seatNumber,
        busNumber: ticket.busNumber || null,
        routeOrigin: ticket.routeOrigin || null,
        routeDestination: ticket.routeDestination || null,
        departureTime: ticket.departureTime,
        arrivalTime: ticket.arrivalTime,
        price: ticket.price,
        createdAt: ticket.createdAt,
        signature: JSON.parse(ticket.validationData || '{}').signature
      })
    }));

    res.json({ tickets: formattedTickets });
  } catch (error) {
    console.error('Get all tickets error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const validateTicket = async (req: Request, res: Response): Promise<void> => {
  try {
    const { qrCodeData, scannedBy, scanLocation, scanType, latitude, longitude, deviceInfo, notes } = req.body;

    if (!qrCodeData) {
      res.status(400).json({ 
        message: 'QR code data is required' 
      });
      return;
    }

    // Validate QR code format and signature
    const validation = qrCodeService.validateTicketQRCode(qrCodeData);

    if (!validation.isValid) {
      res.status(400).json({ 
        message: 'Invalid ticket',
        error: validation.error,
        isValid: false
      });
      return;
    }

    // Get ticket from database
    const ticket = await prisma.ticket.findUnique({
      where: { id: validation.ticketData!.ticketId },
      include: {
        booking: {
          include: {
            trip: true
          }
        },
        ticketScans: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!ticket) {
      res.status(404).json({ 
        message: 'Ticket not found in system',
        isValid: false
      });
      return;
    }

    if (!ticket.isValid) {
      res.status(400).json({ 
        message: 'Ticket is not valid',
        isValid: false,
        ticketStatus: ticket.status
      });
      return;
    }

    // Check if trip has already departed
    const now = new Date();
    if (new Date(ticket.departureTime) < now) {
      res.status(400).json({ 
        message: 'Trip has already departed',
        isValid: false
      });
      return;
    }

    // Check for reuse prevention (multiple scans)
    const recentScans = ticket.ticketScans.filter(scan => {
      const scanTime = new Date(scan.createdAt);
      const hoursDiff = (now.getTime() - scanTime.getTime()) / (1000 * 60 * 60);
      return hoursDiff < 1; // Scans within last hour
    });

    if (recentScans.length > 0 && scanType === 'ENTRY') {
      res.status(400).json({ 
        message: 'Ticket has already been used for entry',
        isValid: false,
        lastScan: recentScans[0]
      });
      return;
    }

    // Create scan record
    const ticketScan = await prisma.ticketScan.create({
      data: {
        ticketId: ticket.id,
        scannedBy,
        scanLocation,
        scanType: scanType || 'VALIDATION',
        isValid: true,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        deviceInfo,
        notes
      }
    });

    // Update ticket scan information
    const updatedTicket = await prisma.ticket.update({
      where: { id: ticket.id },
      data: {
        scannedAt: !ticket.scannedAt ? now : ticket.scannedAt,
        lastScannedAt: now,
        scanCount: ticket.scanCount + 1
      }
    });

    res.json({
      message: 'Ticket validated successfully',
      isValid: true,
      ticket: updatedTicket,
      scan: ticketScan,
      validation: validation
    });
  } catch (error: any) {
    console.error('Validate ticket error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const invalidateTicket = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      res.status(400).json({ 
        message: 'Invalidation reason is required' 
      });
      return;
    }

    const ticket = await prisma.ticket.findUnique({
      where: { id: id as string }
    });

    if (!ticket) {
      res.status(404).json({ message: 'Ticket not found' });
      return;
    }

    if (!ticket.isValid) {
      res.status(400).json({ 
        message: 'Ticket is already invalid',
        status: ticket.status
      });
      return;
    }

    const updatedTicket = await prisma.ticket.update({
      where: { id: id as string },
      data: {
        isValid: false,
        status: 'INVALIDATED',
        validationData: JSON.stringify({
          ...JSON.parse(ticket.validationData || '{}'),
          invalidatedAt: new Date().toISOString(),
          invalidationReason: reason
        })
      }
    });

    res.json({
      message: 'Ticket invalidated successfully',
      ticket: updatedTicket
    });
  } catch (error) {
    console.error('Invalidate ticket error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getTicketScans = async (req: Request, res: Response): Promise<void> => {
  try {
    const { ticketId, scannedBy, scanType } = req.query;

    const where: any = {};
    
    if (ticketId) where.ticketId = ticketId as string;
    if (scannedBy) where.scannedBy = scannedBy as string;
    if (scanType) where.scanType = scanType as string;

    const scans = await prisma.ticketScan.findMany({
      where,
      include: {
        ticket: {
          include: {
            booking: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({ scans });
  } catch (error) {
    console.error('Get ticket scans error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getTicketQRCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const ticket = await prisma.ticket.findUnique({
      where: { id: id as string },
      include: {
        booking: {
          include: {
            trip: {
              include: {
                route: true,
                bus: true
              }
            }
          }
        }
      }
    });

    if (!ticket) {
      res.status(404).json({ message: 'Ticket not found' });
      return;
    }

    if (!ticket.isValid) {
      res.status(400).json({ 
        message: 'Ticket is not valid',
        status: ticket.status
      });
      return;
    }

    // Generate QR code data URL for display
    const qrCodeResult = await qrCodeService.generateTicketQRCode({
      ticketId: ticket.id,
      bookingId: ticket.bookingId,
      passengerName: ticket.passengerName || null,
      passengerEmail: ticket.passengerEmail || null,
      seatNumber: ticket.seatNumber,
      busNumber: ticket.busNumber || null,
      routeOrigin: ticket.routeOrigin || null,
      routeDestination: ticket.routeDestination || null,
      departureTime: ticket.departureTime,
      arrivalTime: ticket.arrivalTime,
      price: ticket.price,
      createdAt: ticket.createdAt
    });

    res.json({
      ticketId: ticket.id,
      qrCodeDataUrl: qrCodeResult.qrCodeDataUrl,
      qrCode: qrCodeResult.qrCode
    });
  } catch (error) {
    console.error('Get ticket QR code error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
