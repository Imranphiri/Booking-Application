"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const payment_controller_1 = require("../controllers/payment.controller");
const router = (0, express_1.Router)();
// Create a new payment for a booking
router.post('/', payment_controller_1.createPayment);
// Get all payments with optional filters
router.get('/', payment_controller_1.getAllPayments);
// Get payment by ID
router.get('/:id', payment_controller_1.getPaymentById);
// Process refund for a payment
router.post('/:paymentId/refund', payment_controller_1.processRefund);
// Get transaction logs
router.get('/logs', payment_controller_1.getTransactionLogs);
// Get supported payment methods
router.get('/methods', payment_controller_1.getPaymentMethods);
exports.default = router;
