import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Configure email transporter
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER || 'your-email@gmail.com',
        pass: process.env.SMTP_PASS || 'your-app-password'
      }
    });
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      const mailOptions = {
        from: process.env.SMTP_FROM || '"TransitHub" <noreply@transithub.com>',
        to: options.to,
        subject: options.subject,
        html: options.html
      };

      await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully to:', options.to);
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  generateBookingConfirmationEmail(bookingData: any): string {
    const { passengerName, email, trip, seatNumber, price, ticket } = bookingData;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Booking Confirmation - TransitHub</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: #2563eb;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 8px 8px 0 0;
          }
          .content {
            background: #f9fafb;
            padding: 30px;
            border-radius: 0 0 8px 8px;
          }
          .ticket-info {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #2563eb;
          }
          .qr-code {
            background: #e5e7eb;
            padding: 20px;
            text-align: center;
            border-radius: 8px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            color: #6b7280;
            font-size: 12px;
          }
          .btn {
            display: inline-block;
            padding: 12px 24px;
            background: #2563eb;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Booking Confirmation</h1>
          <p>Your trip has been successfully booked!</p>
        </div>
        
        <div class="content">
          <h2>Hello ${passengerName},</h2>
          <p>Thank you for choosing TransitHub for your journey. Your booking has been confirmed and your e-ticket is attached below.</p>
          
          <div class="ticket-info">
            <h3>Booking Details</h3>
            <p><strong>Route:</strong> ${trip?.route?.origin} to ${trip?.route?.destination}</p>
            <p><strong>Bus:</strong> ${trip?.bus?.plateNumber} (${trip?.bus?.model})</p>
            <p><strong>Seat Number:</strong> ${seatNumber}</p>
            <p><strong>Departure:</strong> ${new Date(trip?.departureTime).toLocaleString()}</p>
            <p><strong>Arrival:</strong> ${new Date(trip?.arrivalTime).toLocaleString()}</p>
            <p><strong>Price:</strong> MWK ${price?.toLocaleString()}</p>
            <p><strong>Booking ID:</strong> ${ticket?.qrCode?.slice(0, 8).toUpperCase()}</p>
          </div>
          
          <div class="qr-code">
            <h3>E-Ticket QR Code</h3>
            <p><strong>QR Code:</strong> ${ticket?.qrCode}</p>
            <p><small>Please present this QR code at the boarding point</small></p>
          </div>
          
          <div class="footer">
            <p>Need help? Contact our support team</p>
            <p>Email: support@transithub.com | Phone: +265 999 123 456</p>
            <p>&copy; 2024 TransitHub. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async sendBookingConfirmation(bookingData: any): Promise<void> {
    const emailContent = this.generateBookingConfirmationEmail(bookingData);
    
    await this.sendEmail({
      to: bookingData.email,
      subject: `Booking Confirmation - TransitHub - ${bookingData.trip?.route?.origin} to ${bookingData.trip?.route?.destination}`,
      html: emailContent
    });
  }
}

export const emailService = new EmailService();
