"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentGateway = void 0;
const crypto_1 = require("crypto");
class SimulatedPaymentGateway {
    constructor() {
        this.GATEWAY_NAME = 'SimulatedPay';
        this.SUCCESS_RATE = 0.85; // 85% success rate for testing
    }
    async processPayment(request) {
        // Simulate network delay
        await this.simulateNetworkDelay();
        const transactionId = this.generateTransactionId();
        const isSuccess = Math.random() < this.SUCCESS_RATE;
        if (!isSuccess) {
            const failureReasons = [
                'Insufficient funds',
                'Invalid card details',
                'Card expired',
                'Transaction declined by bank',
                'Network timeout',
                'Fraud detection triggered'
            ];
            const failureReason = failureReasons[Math.floor(Math.random() * failureReasons.length)];
            return {
                success: false,
                status: 'FAILED',
                message: `Payment failed: ${failureReason}`,
                failureReason,
                gatewayResponse: {
                    gateway: this.GATEWAY_NAME,
                    transactionId,
                    timestamp: new Date().toISOString(),
                    errorCode: 'PAYMENT_FAILED',
                    errorDetails: failureReason
                }
            };
        }
        // Successful payment
        return {
            success: true,
            transactionId,
            status: 'PAID',
            message: 'Payment processed successfully',
            gatewayResponse: {
                gateway: this.GATEWAY_NAME,
                transactionId,
                timestamp: new Date().toISOString(),
                authorizationCode: this.generateAuthCode(),
                method: request.method,
                amount: request.amount,
                currency: 'MWK'
            }
        };
    }
    async processRefund(request) {
        // Simulate network delay
        await this.simulateNetworkDelay();
        const refundId = this.generateTransactionId();
        const isSuccess = Math.random() < 0.9; // 90% refund success rate
        if (!isSuccess) {
            return {
                success: false,
                status: 'FAILED',
                message: 'Refund failed: Original transaction not found or refund period expired',
                refundedAmount: 0
            };
        }
        return {
            success: true,
            refundId,
            status: 'SUCCESS',
            message: 'Refund processed successfully',
            refundedAmount: request.amount
        };
    }
    async getTransactionStatus(transactionId) {
        // Simulate checking transaction status
        await this.simulateNetworkDelay();
        // For simulation, return a mock status
        const statuses = ['PAID', 'FAILED', 'REFUNDED'];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        return {
            status,
            details: {
                gateway: this.GATEWAY_NAME,
                transactionId,
                timestamp: new Date().toISOString(),
                lastUpdated: new Date().toISOString()
            }
        };
    }
    generateTransactionId() {
        return `TXN_${Date.now()}_${(0, crypto_1.randomBytes)(4).toString('hex').toUpperCase()}`;
    }
    generateAuthCode() {
        return `AUTH_${(0, crypto_1.randomBytes)(3).toString('hex').toUpperCase()}`;
    }
    async simulateNetworkDelay() {
        // Simulate 1-3 seconds network delay
        const delay = Math.random() * 2000 + 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
    }
    // Validation methods
    validatePaymentMethod(method) {
        const validMethods = ['AIRTEL_MONEY', 'MPAMBA', 'CREDIT_CARD', 'DEBIT_CARD', 'BANK_TRANSFER'];
        return validMethods.includes(method);
    }
    validateCardDetails(cardNumber, expiryMonth, expiryYear, cvv) {
        if (!cardNumber || !expiryMonth || !expiryYear || !cvv) {
            return false;
        }
        // Basic card number validation (should be 13-19 digits)
        if (!/^\d{13,19}$/.test(cardNumber.replace(/\s/g, ''))) {
            return false;
        }
        // Basic expiry validation
        const month = parseInt(expiryMonth);
        const year = parseInt(expiryYear);
        const currentYear = new Date().getFullYear() % 100;
        const currentMonth = new Date().getMonth() + 1;
        if (month < 1 || month > 12 || year < currentYear || (year === currentYear && month < currentMonth)) {
            return false;
        }
        // Basic CVV validation (3-4 digits)
        if (!/^\d{3,4}$/.test(cvv)) {
            return false;
        }
        return true;
    }
    validateMobileMoneyDetails(phoneNumber, pin) {
        if (!phoneNumber || !pin) {
            return false;
        }
        // Malawian phone number validation (should start with +265, 088, or 099 and be 9-12 digits)
        const cleanPhone = phoneNumber.replace(/\s/g, '');
        const phoneRegex = /^(\+265|088|099)\d{6,8}$/;
        if (!phoneRegex.test(cleanPhone)) {
            return false;
        }
        // Basic PIN validation (should be 4-6 digits)
        if (!/^\d{4,6}$/.test(pin)) {
            return false;
        }
        return true;
    }
    validatePaymentDetails(request) {
        if (request.method === 'AIRTEL_MONEY' || request.method === 'MPAMBA') {
            return this.validateMobileMoneyDetails(request.phoneNumber, request.mobileMoneyPin);
        }
        else if (request.method.includes('CARD')) {
            return this.validateCardDetails(request.cardNumber, request.expiryMonth, request.expiryYear, request.cvv);
        }
        else if (request.method === 'BANK_TRANSFER') {
            return true; // Bank transfers don't require additional validation at this level
        }
        return false;
    }
    // Mock payment methods for testing
    getSupportedPaymentMethods() {
        return [
            {
                id: 'AIRTEL_MONEY',
                name: 'Airtel Money',
                type: 'mobile_money',
                fees: 0.02, // 2% fee
                description: 'Airtel Malawi mobile money service'
            },
            {
                id: 'MPAMBA',
                name: 'Mpamba',
                type: 'mobile_money',
                fees: 0.025, // 2.5% fee
                description: 'TNM Mpamba mobile money service'
            },
            {
                id: 'CREDIT_CARD',
                name: 'Credit Card',
                type: 'card',
                fees: 0.029, // 2.9% fee
                description: 'International credit card payments'
            },
            {
                id: 'DEBIT_CARD',
                name: 'Debit Card',
                type: 'card',
                fees: 0.015, // 1.5% fee
                description: 'International debit card payments'
            },
            {
                id: 'BANK_TRANSFER',
                name: 'Bank Transfer',
                type: 'bank',
                fees: 0.005, // 0.5% fee
                description: 'Direct bank transfer to Malawian banks'
            }
        ];
    }
}
exports.paymentGateway = new SimulatedPaymentGateway();
