import React, { useState, useEffect } from 'react';
import { bookingService } from '../../services/booking.service';
import type { Booking } from '../../services/booking.service';
import {
  TicketIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  QrCodeIcon
} from '@heroicons/react/24/outline';
import Button from '../ui/Button';
import Card, { CardContent } from '../ui/Card';
import Input from '../ui/Input';

const TicketManagement: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [validateData, setValidateData] = useState({
    qrCode: '',
  });

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await bookingService.getAll();
      setBookings(response.bookings.filter(booking => booking.ticket)); // Only show bookings with tickets
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewQR = (booking: Booking) => {
    if (booking.ticket) {
      setSelectedBooking(booking);
      setShowQRModal(true);
    }
  };

  const handleValidateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Find booking by QR code
      const booking = bookings.find(b => b.ticket?.qrCode === validateData.qrCode);
      if (booking) {
        alert(`Ticket validated: ${booking.passengerName} - ${booking.trip?.route?.origin} to ${booking.trip?.route?.destination}`);
        setValidateData({ qrCode: '' });
      } else {
        alert('Invalid ticket QR code');
      }
    } catch (error: any) {
      alert(`Validation failed: ${error.response?.data?.message || 'Invalid ticket'}`);
    }
  };

  
  const filteredBookings = bookings.filter(booking =>
    (booking.passengerName?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
    (booking.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
    (booking.ticket?.qrCode?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
    (booking.trip?.bus?.plateNumber?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
    (booking.trip?.route?.origin?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
    (booking.trip?.route?.destination?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'INVALID': return 'bg-red-100 text-red-800';
      case 'USED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Ticket Management</h2>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search tickets by passenger, QR code, bus, route..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Ticket Validation */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Validate Ticket</h3>
          <form onSubmit={handleValidateTicket} className="flex space-x-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Enter QR code or scan ticket"
                value={validateData.qrCode}
                onChange={(e) => setValidateData({ qrCode: e.target.value })}
                required
              />
            </div>
            <Button type="submit">
              <CheckCircleIcon className="h-4 w-4 mr-2" />
              Validate
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Tickets Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading tickets...</p>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-8">
              <TicketIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No tickets found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Passenger
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Route
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bus
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Seat
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Departure
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      QR Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div className="font-medium">{booking.passengerName || 'N/A'}</div>
                          <div className="text-gray-500">{booking.user?.email || 'N/A'}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div className="font-medium">{booking.trip?.route?.origin || 'N/A'}</div>
                          <div className="text-gray-500">to {booking.trip?.route?.destination || 'N/A'}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div className="font-medium">{booking.trip?.bus?.plateNumber || 'N/A'}</div>
                          <div className="text-gray-500">{booking.trip?.bus?.model || 'N/A'}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {booking.seatNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(booking.trip?.departureTime || '').toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="font-mono text-xs">
                          {booking.ticket?.qrCode?.slice(0, 12) || 'N/A'}...
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewQR(booking)}
                          >
                            <QrCodeIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* QR Code Modal */}
      {showQRModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ticket QR Code</h3>
              <div className="text-center">
                <div className="w-32 h-32 bg-gray-100 border-2 border-gray-300 rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <QrCodeIcon className="h-16 w-16 text-gray-400" />
                </div>
                <div className="bg-gray-50 p-3 rounded-lg mb-4">
                  <div className="text-xs font-mono text-gray-600 break-all">
                    {selectedBooking.ticket?.qrCode || 'N/A'}
                  </div>
                </div>
                <div className="text-sm text-gray-600 text-left">
                  <p><strong>Passenger:</strong> {selectedBooking.passengerName || 'N/A'}</p>
                  <p><strong>Route:</strong> {selectedBooking.trip?.route?.origin} to {selectedBooking.trip?.route?.destination}</p>
                  <p><strong>Bus:</strong> {selectedBooking.trip?.bus?.plateNumber}</p>
                  <p><strong>Seat:</strong> {selectedBooking.seatNumber}</p>
                  <p><strong>Departure:</strong> {new Date(selectedBooking.trip?.departureTime || '').toLocaleString()}</p>
                  <p><strong>Status:</strong> {selectedBooking.status}</p>
                </div>
              </div>
              <div className="mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowQRModal(false)}
                  className="w-full"
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default TicketManagement;
