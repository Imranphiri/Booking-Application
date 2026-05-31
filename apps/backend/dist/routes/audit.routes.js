"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const audit_controller_1 = require("../controllers/audit.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Apply authentication middleware to all audit routes
router.use(auth_middleware_1.authenticate);
// Get audit logs with pagination and filtering
router.get('/logs', audit_controller_1.getAuditLogs);
// Get audit summary
router.get('/summary', audit_controller_1.getAuditSummary);
// Create security alert
router.post('/security-alerts', auth_middleware_1.authenticate, audit_controller_1.createSecurityAlert);
// Get security alerts
router.get('/security-alerts', auth_middleware_1.authenticate, audit_controller_1.getSecurityAlerts);
exports.default = router;
