"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ticket_controller_1 = require("../controllers/ticket.controller");
const router = (0, express_1.Router)();
// Create a new ticket for a booking
router.post('/', ticket_controller_1.createTicket);
// Get all tickets with optional filters
router.get('/', ticket_controller_1.getAllTickets);
// Get ticket by ID
router.get('/:id', ticket_controller_1.getTicketById);
// Validate a ticket (scan verification)
router.post('/validate', ticket_controller_1.validateTicket);
// Get QR code for a ticket
router.get('/:id/qr-code', ticket_controller_1.getTicketQRCode);
// Invalidate a ticket
router.patch('/:id/invalidate', ticket_controller_1.invalidateTicket);
// Get ticket scan history
router.get('/scans', ticket_controller_1.getTicketScans);
exports.default = router;
