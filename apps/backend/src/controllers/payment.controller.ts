import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { paymentGateway, PaymentRequest, RefundRequest } from '../services/paymentGateway.service';

export const createPayment = async (req: Request, res: Response): Promise<void> => {
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
    if (!paymentGateway.validatePaymentMethod(method)) {
      res.status(400).json({ 
        message: 'Invalid payment method',
        supportedMethods: paymentGateway.getSupportedPaymentMethods().map(m => m.id)
      });
      return;
    }

    // Validate payment details based on method
    if (!paymentGateway.validatePaymentDetails({
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
      } else if (method.includes('CARD')) {
        res.status(400).json({ message: 'Invalid card details' });
        return;
      } else {
        res.status(400).json({ message: 'Invalid payment details' });
        return;
      }
    }

    // Check if booking exists and has no existing payment
    const booking = await prisma.booking.findUnique({
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
    const payment = await prisma.payment.create({
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
    await prisma.transactionLog.create({
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
    const paymentRequest: PaymentRequest = {
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

    const gatewayResponse = await paymentGateway.processPayment(paymentRequest);

    // Update payment based on gateway response
    const updatedPayment = await prisma.payment.update({
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
    await prisma.transactionLog.create({
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
      await prisma.booking.update({
        where: { id: bookingId },
        data: { status: 'CONFIRMED' }
      });
    }

    res.status(gatewayResponse.success ? 200 : 400).json({
      message: gatewayResponse.message,
      payment: updatedPayment,
      gatewayResponse
    });
  } catch (error: any) {
    console.error('Create payment error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getPaymentById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const payment = await prisma.payment.findUnique({
      where: { id: id as string },
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
  } catch (error) {
    console.error('Get payment by ID error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAllPayments = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, method, bookingId } = req.query;

    const where: any = {};
    
    if (status) where.status = status as string;
    if (method) where.method = method as string;
    if (bookingId) where.bookingId = bookingId as string;

    const payments = await prisma.payment.findMany({
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
  } catch (error) {
    console.error('Get all payments error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const processRefund = async (req: Request, res: Response): Promise<void> => {
  try {
    const { paymentId } = req.params;
    const { amount, reason } = req.body;

    if (!amount || amount <= 0) {
      res.status(400).json({ message: 'Valid refund amount is required' });
      return;
    }

    // Get payment details
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId as string },
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
    await prisma.transactionLog.create({
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
    const refundRequest: RefundRequest = {
      transactionId: payment.transactionId,
      amount,
      reason
    };

    const refundResponse = await paymentGateway.processRefund(refundRequest);

    if (refundResponse.success) {
      // Update payment with refund information
      const updatedPayment = await prisma.payment.update({
        where: { id: paymentId as string },
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
      await prisma.transactionLog.create({
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
        await prisma.booking.update({
          where: { id: payment.bookingId },
          data: { status: 'CANCELLED' }
        });
      }

      res.json({
        message: 'Refund processed successfully',
        refund: refundResponse,
        payment: updatedPayment
      });
    } else {
      // Log failed refund
      await prisma.transactionLog.create({
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
  } catch (error: any) {
    console.error('Process refund error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getTransactionLogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { paymentId, type, status } = req.query;

    const where: any = {};
    
    if (paymentId) where.paymentId = paymentId as string;
    if (type) where.type = type as string;
    if (status) where.status = status as string;

    const logs = await prisma.transactionLog.findMany({
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
  } catch (error) {
    console.error('Get transaction logs error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getPaymentMethods = async (req: Request, res: Response): Promise<void> => {
  try {
    const methods = paymentGateway.getSupportedPaymentMethods();
    res.json({ methods });
  } catch (error) {
    console.error('Get payment methods error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
