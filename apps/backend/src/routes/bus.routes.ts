import { Router } from 'express';
import { createBus, getAllBuses, getBusById, updateBus, deleteBus } from '../controllers/bus.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authenticate, authorize('ADMIN', 'OPERATOR'), createBus);
router.get('/', getAllBuses);
router.get('/:id', getBusById);
router.patch('/:id', authenticate, authorize('ADMIN', 'OPERATOR'), updateBus);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteBus);

export default router;