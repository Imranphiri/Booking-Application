import { Router } from 'express';
import { 
  getSeatMap, 
  lockSeats, 
  releaseSeatLocks, 
  cleanupExpiredLocks 
} from '../controllers/seatManagement.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Get seat map for a trip
router.get('/seat-map/:tripId', getSeatMap);

// Lock seats for booking
router.post('/lock', authenticate, lockSeats);

// Release seat locks
router.post('/release', authenticate, releaseSeatLocks);

// Cleanup expired locks (internal endpoint)
router.post('/cleanup-expired', cleanupExpiredLocks);

export default router;
