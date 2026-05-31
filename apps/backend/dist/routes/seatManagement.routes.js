"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const seatManagement_controller_1 = require("../controllers/seatManagement.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Get seat map for a trip
router.get('/seat-map/:tripId', seatManagement_controller_1.getSeatMap);
// Lock seats for booking
router.post('/lock', auth_middleware_1.authenticate, seatManagement_controller_1.lockSeats);
// Release seat locks
router.post('/release', auth_middleware_1.authenticate, seatManagement_controller_1.releaseSeatLocks);
// Cleanup expired locks (internal endpoint)
router.post('/cleanup-expired', seatManagement_controller_1.cleanupExpiredLocks);
exports.default = router;
