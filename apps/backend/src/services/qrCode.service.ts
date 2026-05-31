import { randomBytes } from 'crypto';
import QRCode from 'qrcode';

export interface TicketData {
  ticketId: string;
  bookingId: string;
  passengerName?: string | null;
  passengerEmail?: string | null;
  seatNumber: string;
  busNumber?: string | null;
  routeOrigin?: string | null;
  routeDestination?: string | null;
  departureTime: Date;
  arrivalTime: Date;
  price: number;
  createdAt: Date;
  signature: string;
}

export interface QRCodeOptions {
  size?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
}

class QRCodeService {
  private readonly DEFAULT_SIZE = 300;
  private readonly DEFAULT_MARGIN = 4;
  private readonly DEFAULT_COLOR = {
    dark: '#000000',
    light: '#FFFFFF'
  };

  /**
   * Generate a unique QR code for a ticket
   */
  async generateTicketQRCode(ticketData: Omit<TicketData, 'signature'>): Promise<{
    qrCode: string;
    qrCodeDataUrl: string;
    signature: string;
    ticketData: TicketData;
  }> {
    // Generate a unique signature for this ticket
    const signature = this.generateSignature(ticketData);
    
    // Create complete ticket data with signature
    const completeTicketData: TicketData = {
      ...ticketData,
      signature
    };

    // Convert ticket data to JSON string
    const dataString = JSON.stringify(completeTicketData);
    
    // Generate QR code as base64 data URL
    const qrCodeDataUrl = await this.generateQRCodeDataURL(dataString);
    
    // Generate QR code as raw string for storage
    const qrCode = await this.generateQRCodeString(dataString);

    return {
      qrCode,
      qrCodeDataUrl,
      signature,
      ticketData: completeTicketData
    };
  }

  /**
   * Validate QR code data and signature
   */
  validateTicketQRCode(qrCodeData: string): {
    isValid: boolean;
    ticketData?: TicketData;
    error?: string;
  } {
    try {
      // Parse the QR code data
      const ticketData: TicketData = JSON.parse(qrCodeData);
      
      // Validate required fields
      const requiredFields = ['ticketId', 'bookingId', 'seatNumber', 'departureTime', 'arrivalTime', 'price', 'signature'];
      for (const field of requiredFields) {
        if (!ticketData[field as keyof TicketData]) {
          return {
            isValid: false,
            error: `Missing required field: ${field}`
          };
        }
      }

      // Verify signature
      const expectedSignature = this.generateSignature({
        ticketId: ticketData.ticketId,
        bookingId: ticketData.bookingId,
        passengerName: ticketData.passengerName,
        passengerEmail: ticketData.passengerEmail,
        seatNumber: ticketData.seatNumber,
        busNumber: ticketData.busNumber,
        routeOrigin: ticketData.routeOrigin,
        routeDestination: ticketData.routeDestination,
        departureTime: ticketData.departureTime,
        arrivalTime: ticketData.arrivalTime,
        price: ticketData.price,
        createdAt: ticketData.createdAt
      });

      if (ticketData.signature !== expectedSignature) {
        return {
          isValid: false,
          error: 'Invalid QR code signature'
        };
      }

      // Check if ticket is expired (departure time has passed)
      const now = new Date();
      if (new Date(ticketData.departureTime) < now) {
        return {
          isValid: false,
          error: 'Ticket has expired'
        };
      }

      return {
        isValid: true,
        ticketData
      };

    } catch (error) {
      return {
        isValid: false,
        error: 'Invalid QR code format'
      };
    }
  }

  /**
   * Generate a secure signature for ticket data
   */
  private generateSignature(ticketData: Omit<TicketData, 'signature'>): string {
    const dataString = JSON.stringify(ticketData, Object.keys(ticketData).sort());
    return randomBytes(32).toString('hex');
  }

  /**
   * Generate QR code as base64 data URL
   */
  private async generateQRCodeDataURL(
    data: string,
    options: QRCodeOptions = {}
  ): Promise<string> {
    const qrOptions = {
      width: options.size || this.DEFAULT_SIZE,
      margin: options.margin || this.DEFAULT_MARGIN,
      color: {
        dark: options.color?.dark || this.DEFAULT_COLOR.dark,
        light: options.color?.light || this.DEFAULT_COLOR.light
      },
      errorCorrectionLevel: options.errorCorrectionLevel || 'M' as const
    };

    try {
      const dataUrl = await QRCode.toDataURL(data, qrOptions);
      return dataUrl;
    } catch (error) {
      throw new Error(`Failed to generate QR code: ${error}`);
    }
  }

  /**
   * Generate QR code as string for storage
   */
  private async generateQRCodeString(
    data: string,
    options: QRCodeOptions = {}
  ): Promise<string> {
    const qrOptions = {
      width: options.size || this.DEFAULT_SIZE,
      margin: options.margin || this.DEFAULT_MARGIN,
      color: {
        dark: options.color?.dark || this.DEFAULT_COLOR.dark,
        light: options.color?.light || this.DEFAULT_COLOR.light
      },
      errorCorrectionLevel: options.errorCorrectionLevel || 'M' as const
    };

    try {
      return await QRCode.toString(data, qrOptions);
    } catch (error) {
      throw new Error(`Failed to generate QR code: ${error}`);
    }
  }

  /**
   * Generate a unique ticket ID
   */
  generateTicketId(): string {
    return `TKT_${Date.now()}_${randomBytes(4).toString('hex').toUpperCase()}`;
  }

  /**
   * Generate booking reference
   */
  generateBookingReference(): string {
    return `BK_${Date.now()}_${randomBytes(3).toString('hex').toUpperCase()}`;
  }

  /**
   * Format ticket data for display
   */
  formatTicketForDisplay(ticketData: TicketData): {
    ticketId: string;
    passengerInfo: {
      name?: string;
      email?: string;
    };
    journeyInfo: {
      origin?: string;
      destination?: string;
      departureTime: string;
      arrivalTime: string;
      seatNumber: string;
      busNumber?: string;
    };
    pricingInfo: {
      price: number;
      currency: string;
    };
    validityInfo: {
      issued: string;
      status: string;
    };
  } {
    return {
      ticketId: ticketData.ticketId,
      passengerInfo: {
        name: ticketData.passengerName || undefined,
        email: ticketData.passengerEmail || undefined
      },
      journeyInfo: {
        origin: ticketData.routeOrigin || undefined,
        destination: ticketData.routeDestination || undefined,
        departureTime: new Date(ticketData.departureTime).toLocaleString(),
        arrivalTime: new Date(ticketData.arrivalTime).toLocaleString(),
        seatNumber: ticketData.seatNumber,
        busNumber: ticketData.busNumber || undefined
      },
      pricingInfo: {
        price: ticketData.price,
        currency: 'MWK'
      },
      validityInfo: {
        issued: new Date(ticketData.createdAt).toLocaleString(),
        status: 'ACTIVE'
      }
    };
  }

  /**
   * Check if QR code format is valid
   */
  isValidQRCodeFormat(qrCode: string): boolean {
    try {
      // Try to parse the QR code data
      const data = JSON.parse(qrCode);
      
      // Check if it has required ticket structure
      return data && 
             typeof data === 'object' && 
             typeof data.ticketId === 'string' &&
             typeof data.bookingId === 'string' &&
             typeof data.seatNumber === 'string';
    } catch {
      return false;
    }
  }
}

export const qrCodeService = new QRCodeService();
