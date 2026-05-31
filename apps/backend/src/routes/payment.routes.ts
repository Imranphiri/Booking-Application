import { Router } from 'express';
import {
  createPayment,
  getPaymentById,
  getAllPayments,
  processRefund,
  getTransactionLogs,
  getPaymentMethods
} from '../controllers/payment.controller';

const router = Router();

// Create a new payment for a booking
router.post('/', createPayment);

// Get all payments with optional filters
router.get('/', getAllPayments);

// Get payment by ID
router.get('/:id', getPaymentById);

// Process refund for a payment
router.post('/:paymentId/refund', processRefund);

// Get transaction logs
router.get('/logs', getTransactionLogs);

// Get supported payment methods
router.get('/methods', getPaymentMethods);

export default router;
