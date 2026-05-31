import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const createRoute = async (req: Request, res: Response): Promise<void> => {
  try {
    const { origin, destination, distance, price } = req.body;

    if (!origin || !destination || !distance || !price) {
      res.status(400).json({ message: 'All fields are required' });
      return;
    }

    const route = await prisma.route.create({
      data: { origin, destination, distance: parseFloat(distance), price: parseFloat(price) }
    });

    res.status(201).json({ message: 'Route created', route });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAllRoutes = async (req: Request, res: Response): Promise<void> => {
  try {
    const routes = await prisma.route.findMany({
      include: { _count: { select: { trips: true } } }
    });
    res.json({ routes });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getRouteById = async (req: Request, res: Response): Promise<void> => {
  try {
    const route = await prisma.route.findUnique({
      where: { id: req.params.id as string },
      include: { trips: { include: { bus: true } } }
    });

    if (!route) {
      res.status(404).json({ message: 'Route not found' });
      return;
    }

    res.json({ route });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateRoute = async (req: Request, res: Response): Promise<void> => {
  try {
    const { origin, destination, distance, price } = req.body;
    const route = await prisma.route.update({
      where: { id: req.params.id as string },
      data: {
        origin,
        destination,
        distance: distance ? parseFloat(distance) : undefined,
        price: price ? parseFloat(price) : undefined
      }
    });
    res.json({ message: 'Route updated', route });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteRoute = async (req: Request, res: Response): Promise<void> => {
  try {
    await prisma.route.delete({ where: { id: req.params.id as string } });
    res.json({ message: 'Route deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};