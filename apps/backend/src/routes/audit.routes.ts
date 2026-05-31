import { Router } from 'express';
import {
  getAuditLogs,
  getAuditSummary,
  createSecurityAlert,
  getSecurityAlerts
} from '../controllers/audit.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Apply authentication middleware to all audit routes
router.use(authenticate);

// Get audit logs with pagination and filtering
router.get('/logs', getAuditLogs);

// Get audit summary
router.get('/summary', getAuditSummary);

// Create security alert
router.post('/security-alerts', authenticate, createSecurityAlert);

// Get security alerts
router.get('/security-alerts', authenticate, getSecurityAlerts);

export default router;
