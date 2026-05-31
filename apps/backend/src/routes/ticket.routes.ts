import { Router } from 'express';
import {
  createTicket,
  getTicketById,
  getAllTickets,
  validateTicket,
  invalidateTicket,
  getTicketScans,
  getTicketQRCode
} from '../controllers/ticket.controller';

const router = Router();

// Create a new ticket for a booking
router.post('/', createTicket);

// Get all tickets with optional filters
router.get('/', getAllTickets);

// Get ticket by ID
router.get('/:id', getTicketById);

// Validate a ticket (scan verification)
router.post('/validate', validateTicket);

// Get QR code for a ticket
router.get('/:id/qr-code', getTicketQRCode);

// Invalidate a ticket
router.patch('/:id/invalidate', invalidateTicket);

// Get ticket scan history
router.get('/scans', getTicketScans);

export default router;
