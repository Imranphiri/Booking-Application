import { Router } from 'express';
import {
  getSystemSettings,
  updateSystemSettings,
  getSystemStats,
  toggleMaintenanceMode,
  backupSystem,
  getSystemHealth
} from '../controllers/system.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// Public routes (for basic system info)
router.get('/health', getSystemHealth);
router.get('/settings', getSystemSettings);

// Protected routes (require SUPER_ADMIN role)
router.get('/stats', authenticate, authorize('SUPER_ADMIN'), getSystemStats);
router.put('/settings', authenticate, authorize('SUPER_ADMIN'), updateSystemSettings);
router.patch('/maintenance', authenticate, authorize('SUPER_ADMIN'), toggleMaintenanceMode);
router.post('/backup', authenticate, authorize('SUPER_ADMIN'), backupSystem);

export default router;
