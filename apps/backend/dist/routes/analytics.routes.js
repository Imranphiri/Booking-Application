"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const analytics_controller_1 = require("../controllers/analytics.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Apply authentication middleware to all analytics routes
router.use(auth_middleware_1.authenticate);
// Executive dashboard data
router.get('/executive-dashboard', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('ADMIN'), analytics_controller_1.getExecutiveDashboard);
// Revenue reports
router.get('/revenue', analytics_controller_1.getRevenueReports);
// Route performance
router.get('/route-performance', analytics_controller_1.getRoutePerformance);
// Booking trends
router.get('/booking-trends', analytics_controller_1.getBookingTrends);
// Export reports
router.get('/export', analytics_controller_1.exportReports);
exports.default = router;
