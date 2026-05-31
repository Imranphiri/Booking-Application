import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const createBus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { plateNumber, model, capacity, type, features, status, driver, currentRoute } = req.body;

    if (!plateNumber || !model || !capacity) {
      res.status(400).json({ message: 'Plate number, model, and capacity are required' });
      return;
    }

    const bus = await prisma.bus.create({
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
  } catch (error: any) {
    if (error.code === 'P2002') {
      res.status(409).json({ message: 'Plate number already exists' });
      return;
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAllBuses = async (req: Request, res: Response): Promise<void> => {
  try {
    const buses = await prisma.bus.findMany({
      include: { 
        _count: { select: { trips: true } }
      }
    });
    res.json({ buses });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getBusById = async (req: Request, res: Response): Promise<void> => {
  try {
    const bus = await prisma.bus.findUnique({
      where: { id: req.params.id as string },
      include: { trips: true }
    });

    if (!bus) {
      res.status(404).json({ message: 'Bus not found' });
      return;
    }

    res.json({ bus });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateBus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { plateNumber, model, capacity, type, features, status, driver, currentRoute } = req.body;
    const bus = await prisma.bus.update({
      where: { id: req.params.id as string },
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
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteBus = async (req: Request, res: Response): Promise<void> => {
  try {
    await prisma.bus.delete({ where: { id: req.params.id as string } });
    res.json({ message: 'Bus deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};