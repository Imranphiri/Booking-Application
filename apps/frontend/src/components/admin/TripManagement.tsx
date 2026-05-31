import React, { useState, useEffect } from 'react';
import { tripService } from '../../services/trip.service';
import { busService } from '../../services/bus.service';
import { routeService } from '../../services/route.service';
import type { Trip, CreateTripData } from '../../services/trip.service';
import type { Bus } from '../../services/bus.service';
import type { Route } from '../../services/route.service';
import {
  TicketIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import Button from '../ui/Button';
import Card, { CardContent } from '../ui/Card';
import Input from '../ui/Input';

const TripManagement: React.FC = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<CreateTripData>({
    busId: '',
    routeId: '',
    departureTime: '',
    arrivalTime: '',
    price: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tripsRes, busesRes, routesRes] = await Promise.all([
        tripService.getAll(),
        busService.getAll(),
        routeService.getAll(),
      ]);
      setTrips(tripsRes.trips);
      setBuses(busesRes.buses);
      setRoutes(routesRes.routes);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Map frontend field names to backend expectations
      const tripData = {
        ...formData,
        pricePerSeat: formData.price
      };
      
      if (editingTrip) {
        await tripService.update(editingTrip.id, tripData);
      } else {
        await tripService.create(tripData);
      }
      
      fetchData();
      setShowModal(false);
      setEditingTrip(null);
      setFormData({
        busId: '',
        routeId: '',
        departureTime: '',
        arrivalTime: '',
        price: 0,
      });
    } catch (error: any) {
      console.error('Failed to save trip:', error);
    }
  };

  const handleEdit = (trip: Trip) => {
    setEditingTrip(trip);
    setFormData({
      busId: trip.busId,
      routeId: trip.routeId,
      departureTime: trip.departureTime,
      arrivalTime: trip.arrivalTime,
      price: trip.route?.price || 0,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    // Find the trip to check for bookings
    const trip = trips.find(t => t.id === id);
    
    // Check if trip has existing bookings
    if (trip && (trip as any)._count?.bookings > 0) {
      alert(`Cannot delete trip: This trip has ${(trip as any)._count.bookings} existing booking(s). Please cancel the bookings first.`);
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this trip?')) {
      try {
        await tripService.delete(id);
        fetchData();
        alert('Trip deleted successfully');
      } catch (error: any) {
        console.error('Failed to delete trip:', error);
        
        // Provide specific error messages
        if (error.response?.status === 401) {
          alert('Authentication error: Please log in again');
          // Redirect to login if token is invalid
          window.location.href = '/login';
        } else if (error.response?.status === 403) {
          alert('Permission denied: You do not have permission to delete trips');
        } else if (error.response?.status === 400) {
          alert('Cannot delete trip: ' + (error.response.data?.message || 'Trip has existing bookings'));
        } else if (error.response?.status === 404) {
          alert('Trip not found');
        } else {
          alert('Failed to delete trip: ' + (error.response.data?.message || error.message || 'Unknown error'));
        }
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTrip(null);
    setFormData({
      busId: '',
      routeId: '',
      departureTime: '',
      arrivalTime: '',
      price: 0,
    });
  };

  const filteredTrips = trips.filter(trip =>
    trip.bus?.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trip.route?.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trip.route?.destination.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Trip Management</h2>
        <Button onClick={() => setShowModal(true)}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Trip
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search trips by bus, route..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Trips Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading trips...</p>
            </div>
          ) : filteredTrips.length === 0 ? (
            <div className="text-center py-8">
              <TicketIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No trips found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bus
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Route
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Departure
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Arrival
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTrips.map((trip) => (
                    <tr key={trip.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div className="font-medium">{trip.bus?.plateNumber}</div>
                          <div className="text-gray-500">{trip.bus?.model}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div className="font-medium">{trip.route?.origin}</div>
                          <div className="text-gray-500">to {trip.route?.destination}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(trip.departureTime).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(trip.arrivalTime).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        MWK {trip.route?.price?.toLocaleString() || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(trip.status)}`}>
                          {trip.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(trip)}
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(trip.id)}
                            className="text-red-600 hover:text-red-700"
                            disabled={(trip as any)._count?.bookings > 0}
                            title={(trip as any)._count?.bookings > 0 ? `Cannot delete: ${(trip as any)._count.bookings} booking(s) exist` : 'Delete trip'}
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </div>
                        {(trip as any)._count?.bookings > 0 && (
                          <div className="text-xs text-amber-600 mt-1">
                            {(trip as any)._count.bookings} booking(s)
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {editingTrip ? 'Edit Trip' : 'Add New Trip'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label">Bus</label>
                  <select
                    value={formData.busId}
                    onChange={(e) => setFormData({ ...formData, busId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  >
                    <option value="">Select a bus</option>
                    {buses.map((bus) => (
                      <option key={bus.id} value={bus.id}>
                        {bus.plateNumber} - {bus.model} ({bus.capacity} seats)
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Route</label>
                  <select
                    value={formData.routeId}
                    onChange={(e) => setFormData({ ...formData, routeId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  >
                    <option value="">Select a route</option>
                    {routes.map((route) => (
                      <option key={route.id} value={route.id}>
                        {route.origin} to {route.destination} (MWK {route.price})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Departure Time</label>
                  <Input
                    type="datetime-local"
                    value={formData.departureTime}
                    onChange={(e) => setFormData({ ...formData, departureTime: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="label">Arrival Time</label>
                  <Input
                    type="datetime-local"
                    value={formData.arrivalTime}
                    onChange={(e) => setFormData({ ...formData, arrivalTime: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="label">Price (MWK)</label>
                  <Input
                    type="number"
                    placeholder="e.g., 8000"
                    value={formData.price || ''}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>
                <div className="flex space-x-3 pt-4">
                  <Button type="submit" className="flex-1">
                    {editingTrip ? 'Update' : 'Create'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCloseModal}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default TripManagement;
