import { Router } from 'express';
import { createRoute, getAllRoutes, getRouteById, updateRoute, deleteRoute } from '../controllers/route.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authenticate, authorize('ADMIN', 'OPERATOR'), createRoute);
router.get('/', getAllRoutes);
router.get('/:id', getRouteById);
router.patch('/:id', authenticate, authorize('ADMIN', 'OPERATOR'), updateRoute);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteRoute);

export default router;