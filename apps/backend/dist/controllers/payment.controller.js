"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPaymentMethods = exports.getTransactionLogs = exports.processRefund = exports.getAllPayments = exports.getPaymentById = exports.createPayment = void 0;
const prisma_1 = require("../lib/prisma");
const paymentGateway_service_1 = require("../services/paymentGateway.service");
const createPayment = async (req, res) => {
    try {
        const { bookingId, method, cardNumber, expiryMonth, expiryYear, cvv, email, phoneNumber, mobileMoneyPin } = req.body;
        if (!bookingId || !method) {
            res.status(400).json({
                message: 'Missing required fields',
                required: ['bookingId', 'method']
            });
            return;
        }
        // Validate payment method
        if (!paymentGateway_service_1.paymentGateway.validatePaymentMethod(method)) {
            res.status(400).json({
                message: 'Invalid payment method',
                supportedMethods: paymentGateway_service_1.paymentGateway.getSupportedPaymentMethods().map(m => m.id)
            });
            return;
        }
        // Validate payment details based on method
        if (!paymentGateway_service_1.paymentGateway.validatePaymentDetails({
            amount: 0, // Not needed for validation
            method,
            cardNumber,
            expiryMonth,
            expiryYear,
            cvv,
            phoneNumber,
            mobileMoneyPin
        })) {
            if (method === 'AIRTEL_MONEY' || method === 'MPAMBA') {
                res.status(400).json({ message: 'Invalid mobile money details. Please provide valid Malawian phone number and PIN' });
                return;
            }
            else if (method.includes('CARD')) {
                res.status(400).json({ message: 'Invalid card details' });
                return;
            }
            else {
                res.status(400).json({ message: 'Invalid payment details' });
                return;
            }
        }
        // Check if booking exists and has no existing payment
        const booking = await prisma_1.prisma.booking.findUnique({
            where: { id: bookingId },
            include: {
                trip: {
                    include: {
                        route: true
                    }
                },
                payment: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });
        if (!booking) {
            res.status(404).json({ message: 'Booking not found' });
            return;
        }
        if (booking.payment) {
            res.status(400).json({
                message: 'Payment already exists for this booking',
                paymentId: booking.payment.id,
                status: booking.payment.status
            });
            return;
        }
        if (booking.status === 'CANCELLED') {
            res.status(400).json({ message: 'Cannot pay for cancelled booking' });
            return;
        }
        // Create payment record
        const payment = await prisma_1.prisma.payment.create({
            data: {
                bookingId,
                amount: booking.price,
                method,
                status: 'PENDING'
            },
            include: {
                booking: {
                    include: {
                        trip: {
                            include: {
                                route: true,
                                bus: true
                            }
                        },
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true
                            }
                        }
                    }
                }
            }
        });
        // Log transaction attempt
        await prisma_1.prisma.transactionLog.create({
            data: {
                paymentId: payment.id,
                type: 'PAYMENT',
                amount: payment.amount,
                status: 'PENDING',
                gateway: 'SimulatedPay',
                description: `Payment initiated for booking ${bookingId}`
            }
        });
        // Process payment through gateway
        const paymentRequest = {
            amount: payment.amount,
            method,
            cardNumber,
            expiryMonth,
            expiryYear,
            cvv,
            email: email || booking.user.email,
            phoneNumber,
            mobileMoneyPin
        };
        const gatewayResponse = await paymentGateway_service_1.paymentGateway.processPayment(paymentRequest);
        // Update payment based on gateway response
        const updatedPayment = await prisma_1.prisma.payment.update({
            where: { id: payment.id },
            data: {
                status: gatewayResponse.status,
                transactionId: gatewayResponse.transactionId,
                gatewayResponse: JSON.stringify(gatewayResponse.gatewayResponse),
                processedAt: gatewayResponse.success ? new Date() : null,
                failureReason: gatewayResponse.failureReason
            },
            include: {
                booking: {
                    include: {
                        trip: {
                            include: {
                                route: true,
                                bus: true
                            }
                        },
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true
                            }
                        }
                    }
                }
            }
        });
        // Log transaction result
        await prisma_1.prisma.transactionLog.create({
            data: {
                paymentId: payment.id,
                type: gatewayResponse.success ? 'PAYMENT' : 'FAILED',
                amount: payment.amount,
                status: gatewayResponse.success ? 'SUCCESS' : 'FAILED',
                gateway: 'SimulatedPay',
                gatewayTxId: gatewayResponse.transactionId,
                description: gatewayResponse.message,
                metadata: JSON.stringify(gatewayResponse.gatewayResponse)
            }
        });
        // Update booking status if payment successful
        if (gatewayResponse.success) {
            await prisma_1.prisma.booking.update({
                where: { id: bookingId },
                data: { status: 'CONFIRMED' }
            });
        }
        res.status(gatewayResponse.success ? 200 : 400).json({
            message: gatewayResponse.message,
            payment: updatedPayment,
            gatewayResponse
        });
    }
    catch (error) {
        console.error('Create payment error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.createPayment = createPayment;
const getPaymentById = async (req, res) => {
    try {
        const { id } = req.params;
        const payment = await prisma_1.prisma.payment.findUnique({
            where: { id: id },
            include: {
                booking: {
                    include: {
                        trip: {
                            include: {
                                route: true,
                                bus: true
                            }
                        },
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true
                            }
                        }
                    }
                },
                transactionLogs: {
                    orderBy: {
                        createdAt: 'desc'
                    }
                }
            }
        });
        if (!payment) {
            res.status(404).json({ message: 'Payment not found' });
            return;
        }
        res.json({ payment });
    }
    catch (error) {
        console.error('Get payment by ID error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getPaymentById = getPaymentById;
const getAllPayments = async (req, res) => {
    try {
        const { status, method, bookingId } = req.query;
        const where = {};
        if (status)
            where.status = status;
        if (method)
            where.method = method;
        if (bookingId)
            where.bookingId = bookingId;
        const payments = await prisma_1.prisma.payment.findMany({
            where,
            include: {
                booking: {
                    include: {
                        trip: {
                            include: {
                                route: true,
                                bus: true
                            }
                        },
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true
                            }
                        }
                    }
                },
                transactionLogs: {
                    orderBy: {
                        createdAt: 'desc'
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        res.json({ payments });
    }
    catch (error) {
        console.error('Get all payments error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getAllPayments = getAllPayments;
const processRefund = async (req, res) => {
    try {
        const { paymentId } = req.params;
        const { amount, reason } = req.body;
        if (!amount || amount <= 0) {
            res.status(400).json({ message: 'Valid refund amount is required' });
            return;
        }
        // Get payment details
        const payment = await prisma_1.prisma.payment.findUnique({
            where: { id: paymentId },
            include: {
                booking: true
            }
        });
        if (!payment) {
            res.status(404).json({ message: 'Payment not found' });
            return;
        }
        if (payment.status !== 'PAID') {
            res.status(400).json({
                message: 'Can only refund paid payments',
                currentStatus: payment.status
            });
            return;
        }
        if (payment.refundAmount && payment.refundAmount >= payment.amount) {
            res.status(400).json({ message: 'Payment already fully refunded' });
            return;
        }
        const remainingRefundable = payment.amount - (payment.refundAmount || 0);
        if (amount > remainingRefundable) {
            res.status(400).json({
                message: 'Refund amount exceeds remaining refundable amount',
                refundableAmount: remainingRefundable,
                requestedAmount: amount
            });
            return;
        }
        if (!payment.transactionId) {
            res.status(400).json({ message: 'Cannot refund payment without transaction ID' });
            return;
        }
        // Log refund attempt
        await prisma_1.prisma.transactionLog.create({
            data: {
                paymentId: payment.id,
                type: 'REFUND',
                amount,
                status: 'PENDING',
                gateway: 'SimulatedPay',
                description: `Refund initiated: ${reason || 'No reason provided'}`
            }
        });
        // Process refund through gateway
        const refundRequest = {
            transactionId: payment.transactionId,
            amount,
            reason
        };
        const refundResponse = await paymentGateway_service_1.paymentGateway.processRefund(refundRequest);
        if (refundResponse.success) {
            // Update payment with refund information
            const updatedPayment = await prisma_1.prisma.payment.update({
                where: { id: paymentId },
                data: {
                    refundAmount: (payment.refundAmount || 0) + refundResponse.refundedAmount,
                    status: refundResponse.refundedAmount >= payment.amount ? 'REFUNDED' : 'PAID'
                },
                include: {
                    booking: {
                        include: {
                            trip: {
                                include: {
                                    route: true,
                                    bus: true
                                }
                            },
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true
                                }
                            }
                        }
                    }
                }
            });
            // Log successful refund
            await prisma_1.prisma.transactionLog.create({
                data: {
                    paymentId: payment.id,
                    type: 'REFUND',
                    amount: refundResponse.refundedAmount,
                    status: 'SUCCESS',
                    gateway: 'SimulatedPay',
                    gatewayTxId: refundResponse.refundId,
                    description: refundResponse.message,
                    metadata: JSON.stringify(refundResponse)
                }
            });
            // Update booking status if fully refunded
            if (refundResponse.refundedAmount >= payment.amount) {
                await prisma_1.prisma.booking.update({
                    where: { id: payment.bookingId },
                    data: { status: 'CANCELLED' }
                });
            }
            res.json({
                message: 'Refund processed successfully',
                refund: refundResponse,
                payment: updatedPayment
            });
        }
        else {
            // Log failed refund
            await prisma_1.prisma.transactionLog.create({
                data: {
                    paymentId: payment.id,
                    type: 'REFUND',
                    amount,
                    status: 'FAILED',
                    gateway: 'SimulatedPay',
                    description: refundResponse.message,
                    metadata: JSON.stringify(refundResponse)
                }
            });
            res.status(400).json({
                message: 'Refund failed',
                refund: refundResponse
            });
        }
    }
    catch (error) {
        console.error('Process refund error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.processRefund = processRefund;
const getTransactionLogs = async (req, res) => {
    try {
        const { paymentId, type, status } = req.query;
        const where = {};
        if (paymentId)
            where.paymentId = paymentId;
        if (type)
            where.type = type;
        if (status)
            where.status = status;
        const logs = await prisma_1.prisma.transactionLog.findMany({
            where,
            include: {
                payment: {
                    include: {
                        booking: {
                            include: {
                                user: {
                                    select: {
                                        id: true,
                                        name: true,
                                        email: true
                                    }
                                }
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        res.json({ logs });
    }
    catch (error) {
        console.error('Get transaction logs error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getTransactionLogs = getTransactionLogs;
const getPaymentMethods = async (req, res) => {
    try {
        const methods = paymentGateway_service_1.paymentGateway.getSupportedPaymentMethods();
        res.json({ methods });
    }
    catch (error) {
        console.error('Get payment methods error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getPaymentMethods = getPaymentMethods;
