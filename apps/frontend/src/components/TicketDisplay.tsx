import React, { useState } from 'react';
import {
  TicketIcon,
  MapPinIcon,
  ClockIcon,
  UserIcon,
  CalendarIcon,
  QrCodeIcon,
  ArrowDownTrayIcon,
  ShareIcon,
  PrinterIcon,
  TruckIcon
} from '@heroicons/react/24/outline';
import Button from './ui/Button';
import Card, { CardContent, CardHeader } from './ui/Card';

interface TicketData {
  id: string;
  bookingId: string;
  passengerName: string;
  passengerEmail: string;
  seatNumber: string;
  busNumber: string;
  routeOrigin: string;
  routeDestination: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  status: string;
  qrCode?: string;
  qrCodeDataUrl?: string;
}

interface TicketDisplayProps {
  ticket: TicketData;
  showActions?: boolean;
}

const TicketDisplay: React.FC<TicketDisplayProps> = ({ ticket, showActions = true }) => {
  const [showQRCode, setShowQRCode] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'USED': return 'bg-blue-100 text-blue-800';
      case 'EXPIRED': return 'bg-gray-100 text-gray-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      // Simulate download
      await new Promise(resolve => setTimeout(resolve, 1500));
      // In real app, this would download the ticket as PDF
      console.log('Downloading ticket:', ticket.id);
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Booksync Ticket',
          text: `My ticket from ${ticket.routeOrigin} to ${ticket.routeDestination}`,
          url: window.location.href
        });
      } catch (error) {
        console.log('Share cancelled or failed');
      }
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Ticket Card */}
      <Card className="overflow-hidden">
        {/* Ticket Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <TicketIcon className="h-8 w-8" />
              <div>
                <h3 className="text-xl font-bold">Booksync Ticket</h3>
                <p className="text-primary-100 text-sm">Booking ID: {ticket.bookingId}</p>
              </div>
            </div>
            <div className="text-right">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(ticket.status)}`}>
                {ticket.status}
              </span>
            </div>
          </div>
        </div>

        {/* Ticket Body */}
        <CardContent className="p-6">
          {/* Journey Information */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{ticket.routeOrigin}</div>
                  <div className="text-sm text-gray-500">Departure</div>
                </div>
                <div className="flex-1 flex items-center">
                  <div className="border-t-2 border-dashed border-gray-300 flex-1"></div>
                  <div className="mx-4">
                    <TruckIcon className="h-6 w-6 text-primary-600" />
                  </div>
                  <div className="border-t-2 border-dashed border-gray-300 flex-1"></div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{ticket.routeDestination}</div>
                  <div className="text-sm text-gray-500">Arrival</div>
                </div>
              </div>
            </div>
          </div>

          {/* Trip Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <CalendarIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">Date</div>
                  <div className="font-medium">{new Date(ticket.departureTime).toLocaleDateString()}</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <ClockIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">Departure Time</div>
                  <div className="font-medium">{new Date(ticket.departureTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <ClockIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">Arrival Time</div>
                  <div className="font-medium">{new Date(ticket.arrivalTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <UserIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">Passenger</div>
                  <div className="font-medium">{ticket.passengerName}</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <TicketIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">Seat Number</div>
                  <div className="font-medium">{ticket.seatNumber}</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <MapPinIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">Bus Number</div>
                  <div className="font-medium">{ticket.busNumber}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Price and QR Code */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <div>
              <div className="text-sm text-gray-500">Ticket Price</div>
              <div className="text-2xl font-bold text-primary-600">MWK {ticket.price.toLocaleString()}</div>
            </div>
            
            {ticket.qrCodeDataUrl && (
              <div className="text-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowQRCode(!showQRCode)}
                  className="flex items-center space-x-2"
                >
                  <QrCodeIcon className="h-4 w-4" />
                  <span>{showQRCode ? 'Hide' : 'Show'} QR Code</span>
                </Button>
              </div>
            )}
          </div>

          {/* QR Code Display */}
          {showQRCode && ticket.qrCodeDataUrl && (
            <div className="mt-6 p-6 bg-gray-50 rounded-lg text-center">
              <div className="mb-4">
                <img 
                  src={ticket.qrCodeDataUrl} 
                  alt="Ticket QR Code" 
                  className="mx-auto w-48 h-48"
                />
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Scan this QR code at the boarding point
              </p>
              <div className="text-xs text-gray-500">
                Ticket ID: {ticket.id}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {showActions && (
            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                loading={downloading}
                className="flex items-center space-x-2"
              >
                <ArrowDownTrayIcon className="h-4 w-4" />
                <span>Download</span>
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="flex items-center space-x-2"
              >
                <ShareIcon className="h-4 w-4" />
                <span>Share</span>
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="flex items-center space-x-2"
              >
                <PrinterIcon className="h-4 w-4" />
                <span>Print</span>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Important Information */}
      <Card className="mt-6">
        <CardHeader>
          <h4 className="text-lg font-semibold">Important Information</h4>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start space-x-2">
              <span className="text-primary-600 mt-1">·</span>
              <span>Please arrive at the boarding point at least 30 minutes before departure</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-primary-600 mt-1">·</span>
              <span>Bring a valid ID document for verification</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-primary-600 mt-1">·</span>
              <span>This ticket is non-transferable and non-refundable</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-primary-600 mt-1">·</span>
              <span>Keep this ticket safe until your journey is complete</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default TicketDisplay;
