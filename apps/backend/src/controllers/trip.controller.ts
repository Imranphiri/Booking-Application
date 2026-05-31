import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const createTrip = async (req: Request, res: Response): Promise<void> => {
  try {
    const { routeId, busId, departureTime, arrivalTime, pricePerSeat } = req.body;

    if (!routeId || !busId || !departureTime || !arrivalTime || !pricePerSeat) {
      res.status(400).json({ message: 'All fields are required' });
      return;
    }

    // get bus to know capacity
    const bus = await prisma.bus.findUnique({ where: { id: busId } });
    if (!bus) {
      res.status(404).json({ message: 'Bus not found' });
      return;
    }

    // create trip
    const trip = await prisma.trip.create({
      data: {
        routeId,
        busId,
        departureTime: new Date(departureTime),
        arrivalTime: new Date(arrivalTime)
      }
    });

    res.status(201).json({ message: 'Trip created with seats', trip });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAllTrips = async (req: Request, res: Response): Promise<void> => {
  try {
    const { origin, destination, date } = req.query;

    const where: any = {};

    if (origin || destination) {
      where.route = {};
      if (origin) where.route.origin = { contains: origin as string, mode: 'insensitive' };
      if (destination) where.route.destination = { contains: destination as string, mode: 'insensitive' };
    }

    if (date) {
      const searchDate = new Date(date as string);
      const nextDay = new Date(searchDate);
      nextDay.setDate(nextDay.getDate() + 1);
      where.departureTime = { gte: searchDate, lt: nextDay };
    }

    const trips = await prisma.trip.findMany({
      where,
      include: {
        route: true,
        bus: true,
        _count: { select: { bookings: true } }
      },
      orderBy: { departureTime: 'asc' }
    });

    res.json({ trips });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getTripById = async (req: Request, res: Response): Promise<void> => {
  try {
    const trip = await prisma.trip.findUnique({
      where: { id: req.params.id as string },
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
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateTrip = async (req: Request, res: Response): Promise<void> => {
  try {
    const { departureTime, arrivalTime } = req.body;
    const trip = await prisma.trip.update({
      where: { id: req.params.id as string },
      data: {
        departureTime: departureTime ? new Date(departureTime) : undefined,
        arrivalTime: arrivalTime ? new Date(arrivalTime) : undefined
      }
    });
    res.json({ message: 'Trip updated', trip });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteTrip = async (req: Request, res: Response): Promise<void> => {
  try {
    await prisma.trip.delete({ where: { id: req.params.id as string } });
    res.json({ message: 'Trip deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};