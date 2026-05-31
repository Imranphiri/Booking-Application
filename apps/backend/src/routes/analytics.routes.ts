import { Router } from 'express';
import {
  getExecutiveDashboard,
  getRevenueReports,
  getRoutePerformance,
  getBookingTrends,
  exportReports
} from '../controllers/analytics.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// Apply authentication middleware to all analytics routes
router.use(authenticate);

// Executive dashboard data
router.get('/executive-dashboard', authenticate, authorize('ADMIN'), getExecutiveDashboard);

// Revenue reports
router.get('/revenue', getRevenueReports);

// Route performance
router.get('/route-performance', getRoutePerformance);

// Booking trends
router.get('/booking-trends', getBookingTrends);

// Export reports
router.get('/export', exportReports);

export default router;
