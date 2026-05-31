import { randomBytes } from 'crypto';

export interface PaymentRequest {
  amount: number;
  method: string;
  cardNumber?: string;
  expiryMonth?: string;
  expiryYear?: string;
  cvv?: string;
  email?: string;
  phoneNumber?: string;
  mobileMoneyPin?: string;
}

export interface PaymentResponse {
  success: boolean;
  transactionId?: string;
  status: 'PENDING' | 'PAID' | 'FAILED';
  message: string;
  gatewayResponse?: any;
  failureReason?: string;
}

export interface RefundRequest {
  transactionId: string;
  amount: number;
  reason?: string;
}

export interface RefundResponse {
  success: boolean;
  refundId?: string;
  status: 'SUCCESS' | 'FAILED';
  message: string;
  refundedAmount: number;
}

class SimulatedPaymentGateway {
  private readonly GATEWAY_NAME = 'SimulatedPay';
  private readonly SUCCESS_RATE = 0.85; // 85% success rate for testing

  async processPayment(request: PaymentRequest): Promise<PaymentResponse> {
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

  async processRefund(request: RefundRequest): Promise<RefundResponse> {
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

  async getTransactionStatus(transactionId: string): Promise<{
    status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
    details?: any;
  }> {
    // Simulate checking transaction status
    await this.simulateNetworkDelay();

    // For simulation, return a mock status
    const statuses: ('PENDING' | 'PAID' | 'FAILED' | 'REFUNDED')[] = ['PAID', 'FAILED', 'REFUNDED'];
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

  private generateTransactionId(): string {
    return `TXN_${Date.now()}_${randomBytes(4).toString('hex').toUpperCase()}`;
  }

  private generateAuthCode(): string {
    return `AUTH_${randomBytes(3).toString('hex').toUpperCase()}`;
  }

  private async simulateNetworkDelay(): Promise<void> {
    // Simulate 1-3 seconds network delay
    const delay = Math.random() * 2000 + 1000;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  // Validation methods
  validatePaymentMethod(method: string): boolean {
    const validMethods = ['AIRTEL_MONEY', 'MPAMBA', 'CREDIT_CARD', 'DEBIT_CARD', 'BANK_TRANSFER'];
    return validMethods.includes(method);
  }

  validateCardDetails(cardNumber?: string, expiryMonth?: string, expiryYear?: string, cvv?: string): boolean {
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

  validateMobileMoneyDetails(phoneNumber?: string, pin?: string): boolean {
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

  validatePaymentDetails(request: PaymentRequest): boolean {
    if (request.method === 'AIRTEL_MONEY' || request.method === 'MPAMBA') {
      return this.validateMobileMoneyDetails(request.phoneNumber, request.mobileMoneyPin);
    } else if (request.method.includes('CARD')) {
      return this.validateCardDetails(request.cardNumber, request.expiryMonth, request.expiryYear, request.cvv);
    } else if (request.method === 'BANK_TRANSFER') {
      return true; // Bank transfers don't require additional validation at this level
    }
    
    return false;
  }

  // Mock payment methods for testing
  getSupportedPaymentMethods(): Array<{
    id: string;
    name: string;
    type: string;
    fees: number;
    description?: string;
  }> {
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

export const paymentGateway = new SimulatedPaymentGateway();
