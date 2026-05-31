import { Router } from 'express';
import { createTrip, getAllTrips, getTripById, updateTrip, deleteTrip } from '../controllers/trip.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authenticate, authorize('ADMIN', 'OPERATOR'), createTrip);
router.get('/', getAllTrips);
router.get('/:id', getTripById);
router.patch('/:id', authenticate, authorize('ADMIN', 'OPERATOR'), updateTrip);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteTrip);

export default router;