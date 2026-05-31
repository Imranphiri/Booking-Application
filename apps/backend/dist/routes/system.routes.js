"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const system_controller_1 = require("../controllers/system.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Public routes (for basic system info)
router.get('/health', system_controller_1.getSystemHealth);
router.get('/settings', system_controller_1.getSystemSettings);
// Protected routes (require SUPER_ADMIN role)
router.get('/stats', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('SUPER_ADMIN'), system_controller_1.getSystemStats);
router.put('/settings', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('SUPER_ADMIN'), system_controller_1.updateSystemSettings);
router.patch('/maintenance', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('SUPER_ADMIN'), system_controller_1.toggleMaintenanceMode);
router.post('/backup', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('SUPER_ADMIN'), system_controller_1.backupSystem);
exports.default = router;
