import React, { useState, useEffect } from 'react';
import {
  MagnifyingGlassIcon,
  ClockIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import Card, { CardContent, CardHeader } from '../ui/Card';
import Input from '../ui/Input';
import Button from '../ui/Button';

interface SeatMapData {
  tripId: string;
  bus: {
    plateNumber: string;
    model: string;
    capacity: number;
  };
  seatMap: Array<Array<{
    number: string;
    isBooked: boolean;
    category: string;
    position: { row: number; column: number };
  }>>;
  bookedSeats: string[];
  availableSeats: number;
  categories: Array<{
    id: string;
    name: string;
    priceMultiplier: number;
    features: string[];
    color: string;
  }>;
}

interface SeatLock {
  id: string;
  tripId: string;
  seatNumber: string;
  userId: string;
  expiresAt: string;
  createdAt: string;
}

const SeatManagement: React.FC = () => {
  const [selectedTripId, setSelectedTripId] = useState('');
  const [seatMapData, setSeatMapData] = useState<SeatMapData | null>(null);
  const [activeLocks, setActiveLocks] = useState<SeatLock[]>([]);
  const [, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (selectedTripId) {
      fetchSeatMap(selectedTripId);
    }
    fetchActiveLocks();
  }, [selectedTripId]);

  const fetchSeatMap = async (tripId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/seats/seat-map/${tripId}`);
      const data = await response.json();
      setSeatMapData(data);
    } catch (error) {
      console.error('Failed to fetch seat map:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveLocks = async () => {
    try {
      const response = await fetch('/api/seats/active-locks');
      const data = await response.json();
      setActiveLocks(data.locks || []);
    } catch (error) {
      console.error('Failed to fetch active locks:', error);
    }
  };

  const releaseLock = async (lockId: string) => {
    try {
      await fetch('/api/seats/release-lock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lockId })
      });
      fetchActiveLocks();
    } catch (error) {
      console.error('Failed to release lock:', error);
    }
  };

  const getSeatColor = (seat: any) => {
    if (seat.isBooked) return 'bg-red-500 text-white';
    if (seat.category === 'vip') return 'bg-yellow-500 text-white';
    if (seat.category === 'economy') return 'bg-blue-500 text-white';
    return 'bg-green-500 text-white';
  };

  const isSeatLocked = (seatNumber: string) => {
    return activeLocks.some(lock => lock.seatNumber === seatNumber);
  };

  const filteredLocks = activeLocks.filter(lock =>
    lock.seatNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lock.userId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Trip Selection */}
      <Card>
        <CardHeader>
          <h2 className="text-2xl font-bold text-gray-900">Seat Management</h2>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Trip for Seat Map
              </label>
              <Input
                type="text"
                placeholder="Enter Trip ID"
                value={selectedTripId}
                onChange={(e) => setSelectedTripId(e.target.value)}
                className="max-w-md"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Seat Map Visualization */}
      {seatMapData && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                Seat Map - {seatMapData.bus.plateNumber}
              </h3>
              <div className="flex space-x-4 text-sm">
                <span className="flex items-center">
                  <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
                  Available
                </span>
                <span className="flex items-center">
                  <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
                  Booked
                </span>
                <span className="flex items-center">
                  <div className="w-4 h-4 bg-yellow-500 rounded mr-2"></div>
                  VIP
                </span>
                <span className="flex items-center">
                  <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
                  Economy
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-2 max-w-2xl mx-auto">
                {seatMapData.seatMap.map((row, rowIndex) =>
                  row.map((seat, seatIndex) => (
                    <div
                      key={`${rowIndex}-${seatIndex}`}
                      className={`p-2 rounded text-center text-xs font-medium ${getSeatColor(seat)} ${
                        isSeatLocked(seat.number) ? 'ring-2 ring-orange-400' : ''
                      }`}
                      title={`Seat ${seat.number} - ${seat.category.toUpperCase()}`}
                    >
                      {seat.number}
                    </div>
                  ))
                )}
              </div>
              
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>Capacity: {seatMapData.bus.capacity}</span>
                <span>Available: {seatMapData.availableSeats}</span>
                <span>Booked: {seatMapData.bookedSeats.length}</span>
                <span>Occupancy: {Math.round((seatMapData.bookedSeats.length / seatMapData.bus.capacity) * 100)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Seat Locks */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Active Seat Locks</h3>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search locks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredLocks.length === 0 ? (
            <div className="text-center py-8">
              <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No active seat locks found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredLocks.map((lock) => (
                <div key={lock.id} className="flex justify-between items-center p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <ClockIcon className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Seat {lock.seatNumber}</p>
                      <p className="text-sm text-gray-500">
                        User: {lock.userId} • Expires: {new Date(lock.expiresAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      new Date(lock.expiresAt) > new Date() 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {new Date(lock.expiresAt) > new Date() ? 'Active' : 'Expired'}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => releaseLock(lock.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <XCircleIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Seat Categories */}
      {seatMapData && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Seat Categories</h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {seatMapData.categories.map((category) => (
                <div key={category.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{category.name}</h4>
                    <div 
                      className="w-6 h-6 rounded"
                      style={{ backgroundColor: category.color }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Price Multiplier: {category.priceMultiplier}x
                  </p>
                  <ul className="text-xs text-gray-500 space-y-1">
                    {category.features.map((feature, index) => (
                      <li key={index}>• {feature}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SeatManagement;
