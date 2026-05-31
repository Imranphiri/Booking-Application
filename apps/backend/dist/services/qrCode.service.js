"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.qrCodeService = void 0;
const crypto_1 = require("crypto");
const qrcode_1 = __importDefault(require("qrcode"));
class QRCodeService {
    constructor() {
        this.DEFAULT_SIZE = 300;
        this.DEFAULT_MARGIN = 4;
        this.DEFAULT_COLOR = {
            dark: '#000000',
            light: '#FFFFFF'
        };
    }
    /**
     * Generate a unique QR code for a ticket
     */
    async generateTicketQRCode(ticketData) {
        // Generate a unique signature for this ticket
        const signature = this.generateSignature(ticketData);
        // Create complete ticket data with signature
        const completeTicketData = {
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
    validateTicketQRCode(qrCodeData) {
        try {
            // Parse the QR code data
            const ticketData = JSON.parse(qrCodeData);
            // Validate required fields
            const requiredFields = ['ticketId', 'bookingId', 'seatNumber', 'departureTime', 'arrivalTime', 'price', 'signature'];
            for (const field of requiredFields) {
                if (!ticketData[field]) {
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
        }
        catch (error) {
            return {
                isValid: false,
                error: 'Invalid QR code format'
            };
        }
    }
    /**
     * Generate a secure signature for ticket data
     */
    generateSignature(ticketData) {
        const dataString = JSON.stringify(ticketData, Object.keys(ticketData).sort());
        return (0, crypto_1.randomBytes)(32).toString('hex');
    }
    /**
     * Generate QR code as base64 data URL
     */
    async generateQRCodeDataURL(data, options = {}) {
        const qrOptions = {
            width: options.size || this.DEFAULT_SIZE,
            margin: options.margin || this.DEFAULT_MARGIN,
            color: {
                dark: options.color?.dark || this.DEFAULT_COLOR.dark,
                light: options.color?.light || this.DEFAULT_COLOR.light
            },
            errorCorrectionLevel: options.errorCorrectionLevel || 'M'
        };
        try {
            const dataUrl = await qrcode_1.default.toDataURL(data, qrOptions);
            return dataUrl;
        }
        catch (error) {
            throw new Error(`Failed to generate QR code: ${error}`);
        }
    }
    /**
     * Generate QR code as string for storage
     */
    async generateQRCodeString(data, options = {}) {
        const qrOptions = {
            width: options.size || this.DEFAULT_SIZE,
            margin: options.margin || this.DEFAULT_MARGIN,
            color: {
                dark: options.color?.dark || this.DEFAULT_COLOR.dark,
                light: options.color?.light || this.DEFAULT_COLOR.light
            },
            errorCorrectionLevel: options.errorCorrectionLevel || 'M'
        };
        try {
            return await qrcode_1.default.toString(data, qrOptions);
        }
        catch (error) {
            throw new Error(`Failed to generate QR code: ${error}`);
        }
    }
    /**
     * Generate a unique ticket ID
     */
    generateTicketId() {
        return `TKT_${Date.now()}_${(0, crypto_1.randomBytes)(4).toString('hex').toUpperCase()}`;
    }
    /**
     * Generate booking reference
     */
    generateBookingReference() {
        return `BK_${Date.now()}_${(0, crypto_1.randomBytes)(3).toString('hex').toUpperCase()}`;
    }
    /**
     * Format ticket data for display
     */
    formatTicketForDisplay(ticketData) {
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
    isValidQRCodeFormat(qrCode) {
        try {
            // Try to parse the QR code data
            const data = JSON.parse(qrCode);
            // Check if it has required ticket structure
            return data &&
                typeof data === 'object' &&
                typeof data.ticketId === 'string' &&
                typeof data.bookingId === 'string' &&
                typeof data.seatNumber === 'string';
        }
        catch {
            return false;
        }
    }
}
exports.qrCodeService = new QRCodeService();
