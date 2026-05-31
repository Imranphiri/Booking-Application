import React, { useState, useEffect } from 'react';
import { bookingService } from '../../services/booking.service';
import type { Booking } from '../../services/booking.service';
import {
  UsersIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  TruckIcon
} from '@heroicons/react/24/outline';
import Button from '../ui/Button';
import Card, { CardContent } from '../ui/Card';
import Input from '../ui/Input';

const BookingManagement: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await bookingService.getAll();
      setBookings(response.bookings);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await bookingService.updateStatus(id, status);
      fetchBookings();
    } catch (error) {
      console.error('Failed to update booking status:', error);
    }
  };

  const handleCancel = async (id: string) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await bookingService.cancel(id);
        fetchBookings();
      } catch (error) {
        console.error('Failed to cancel booking:', error);
      }
    }
  };

  const filteredBookings = bookings.filter(booking =>
    (booking.user?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
    (booking.user?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
    (booking.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
    (booking.trip?.route?.origin?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
    (booking.trip?.route?.destination?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
    (booking.passengerName?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      case 'COMPLETED': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (paymentStatus: string) => {
    switch (paymentStatus) {
      case 'PAID': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'FAILED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Calculate bus statistics
  const getBusStatistics = () => {
    const busStats: { [key: string]: { total: number; capacity: number; utilization: number } } = {};
    
    bookings.forEach(booking => {
      if (booking.trip?.bus) {
        const busId = booking.trip.bus.plateNumber;
        if (!busStats[busId]) {
          busStats[busId] = {
            total: 0,
            capacity: booking.trip.bus.capacity || 50,
            utilization: 0
          };
        }
        busStats[busId].total++;
      }
    });
    
    // Calculate utilization percentage
    Object.keys(busStats).forEach(busId => {
      const stats = busStats[busId];
      stats.utilization = Math.round((stats.total / stats.capacity) * 100);
    });
    
    return busStats;
  };

  const busStats = getBusStatistics();

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Booking Management</h2>
      </div>

      {/* Bus Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {Object.entries(busStats).map(([busPlate, stats]) => (
          <Card key={busPlate}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <TruckIcon className="h-5 w-5 text-primary-600" />
                <span className="text-sm font-medium text-gray-900">{busPlate}</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Bookings:</span>
                  <span className="font-medium">{stats.total}/{stats.capacity}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Utilization:</span>
                  <span className={`font-medium ${stats.utilization >= 80 ? 'text-green-600' : stats.utilization >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {stats.utilization}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className={`h-2 rounded-full ${stats.utilization >= 80 ? 'bg-green-500' : stats.utilization >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${stats.utilization}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {Object.keys(busStats).length === 0 && (
          <Card className="md:col-span-4">
            <CardContent className="p-4 text-center">
              <TruckIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">No bus statistics available</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search bookings by customer, route..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Bookings Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading bookings...</p>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-8">
              <UsersIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No bookings found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Booking ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Route
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bus
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Departure
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Seat
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{booking.id.slice(-6)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div className="font-medium">
                            {booking.user?.firstName} {booking.user?.lastName}
                          </div>
                          <div className="text-gray-500">{booking.user?.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div className="font-medium">
                            {booking.trip?.route?.origin}
                          </div>
                          <div className="text-gray-500">
                            to {booking.trip?.route?.destination}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div className="font-medium">
                            {booking.trip?.bus?.plateNumber}
                          </div>
                          <div className="text-gray-500">
                            {booking.trip?.bus?.model}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(booking.trip?.departureTime || '').toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {booking.seatNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${getPaymentStatusColor(booking.paymentStatus)}`}>
                          {booking.paymentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {booking.status === 'PENDING' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStatusUpdate(booking.id, 'CONFIRMED')}
                              className="text-green-600 hover:text-green-700"
                            >
                              <CheckCircleIcon className="h-4 w-4" />
                            </Button>
                          )}
                          {booking.status === 'CONFIRMED' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStatusUpdate(booking.id, 'COMPLETED')}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <ClockIcon className="h-4 w-4" />
                            </Button>
                          )}
                          {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCancel(booking.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <XCircleIcon className="h-4 w-4" />
                            </Button>
                          )}
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
    </div>
  );
};

export default BookingManagement;
