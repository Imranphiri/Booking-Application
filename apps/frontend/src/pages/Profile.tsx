import React, { useState, useEffect } from 'react';
import {
  UserIcon,
  TicketIcon,
  CreditCardIcon,
  CogIcon,
  BellIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  ArrowRightIcon,
  QrCodeIcon
} from '@heroicons/react/24/outline';
import Button from '../components/ui/Button';
import Card, { CardContent, CardHeader } from '../components/ui/Card';
import Input from '../components/ui/Input';
import { bookingService } from '../services/booking.service';
import type { Booking } from '../services/booking.service';

const Profile: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [editMode, setEditMode] = useState(false);
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    nationality: 'Malawian',
    idNumber: ''
  });

  const menuItems = [
    { id: 'overview', name: 'Overview', icon: UserIcon },
    { id: 'bookings', name: 'My Bookings', icon: TicketIcon },
    { id: 'payments', name: 'Payment History', icon: CreditCardIcon },
    { id: 'settings', name: 'Settings', icon: CogIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon },
    { id: 'documents', name: 'Documents', icon: DocumentTextIcon }
  ];

  const [userBookings, setUserBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [showTicketModal, setShowTicketModal] = useState(false);

  useEffect(() => {
    fetchUserBookings();
  }, []);

  const fetchUserBookings = async () => {
    setLoading(true);
    try {
      // For now, we'll get all bookings since we don't have user authentication
      const response = await bookingService.getAll();
      const bookings = response.bookings;
      setUserBookings(bookings);
      
      // Populate user data from the first booking's user info
      if (bookings.length > 0 && bookings[0].user) {
        const user = bookings[0].user;
        setUserData({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
          phone: '', // Phone not available in booking user data
          dateOfBirth: '', // Date of birth not available
          nationality: 'Malawian',
          idNumber: ''
        });
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewTicket = (booking: Booking) => {
    setSelectedTicket(booking);
    setShowTicketModal(true);
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Confirmed': return 'bg-green-100 text-green-800';
      case 'Completed': return 'bg-blue-100 text-blue-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Profile Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Personal Information</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditMode(!editMode)}
                  >
                    {editMode ? 'Cancel' : 'Edit Profile'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="label">First Name</label>
                    <Input
                      value={userData.firstName}
                      onChange={(e) => setUserData({...userData, firstName: e.target.value})}
                      disabled={!editMode}
                    />
                  </div>
                  <div>
                    <label className="label">Last Name</label>
                    <Input
                      value={userData.lastName}
                      onChange={(e) => setUserData({...userData, lastName: e.target.value})}
                      disabled={!editMode}
                    />
                  </div>
                  <div>
                    <label className="label">Email</label>
                    <Input
                      type="email"
                      value={userData.email}
                      onChange={(e) => setUserData({...userData, email: e.target.value})}
                      disabled={!editMode}
                    />
                  </div>
                  <div>
                    <label className="label">Phone</label>
                    <Input
                      type="tel"
                      value={userData.phone}
                      onChange={(e) => setUserData({...userData, phone: e.target.value})}
                      disabled={!editMode}
                    />
                  </div>
                  <div>
                    <label className="label">Date of Birth</label>
                    <Input
                      type="date"
                      value={userData.dateOfBirth}
                      onChange={(e) => setUserData({...userData, dateOfBirth: e.target.value})}
                      disabled={!editMode}
                    />
                  </div>
                  <div>
                    <label className="label">Nationality</label>
                    <Input
                      value={userData.nationality}
                      onChange={(e) => setUserData({...userData, nationality: e.target.value})}
                      disabled={!editMode}
                    />
                  </div>
                </div>
                {editMode && (
                  <div className="mt-6 flex justify-end space-x-4">
                    <Button variant="outline" onClick={() => setEditMode(false)}>
                      Cancel
                    </Button>
                    <Button onClick={() => setEditMode(false)}>
                      Save Changes
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <TicketIcon className="h-8 w-8 text-primary-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{userBookings.length}</div>
                  <div className="text-sm text-gray-600">Total Bookings</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <CreditCardIcon className="h-8 w-8 text-success-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">
                    MWK {userBookings.reduce((total, booking) => total + (booking.price || 0), 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Total Spent</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <UserIcon className="h-8 w-8 text-warning-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">Member Since</div>
                  <div className="text-sm text-gray-600">
                    {userBookings.length > 0 
                      ? new Date(Math.min(...userBookings.map(b => new Date(b.createdAt).getTime()))).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                      : 'Not Available'
                    }
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'bookings':
        return (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">My Bookings</h3>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                </div>
              </div>
            ) : userBookings.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <TicketIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
                  <p className="text-gray-500">Your bookings will appear here once you start booking trips.</p>
                  <Button className="mt-4" onClick={() => window.location.href = '/bookings'}>
                    Book Your First Trip
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {userBookings.map((booking) => (
                  <Card key={booking.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-semibold text-gray-900">
                              {booking.trip?.route?.origin} to {booking.trip?.route?.destination}
                            </h4>
                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(booking.status)}`}>
                              {booking.status}
                            </span>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>Booking ID: {booking.id.slice(0, 8).toUpperCase()}</span>
                            <span>Date: {new Date(booking.createdAt).toLocaleDateString()}</span>
                            <span>Seat: {booking.seatNumber}</span>
                          </div>
                          {booking.trip && (
                            <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                              <span>Departure: {new Date(booking.trip.departureTime).toLocaleString()}</span>
                              <span>Bus: {booking.trip.bus?.plateNumber}</span>
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-primary-600">
                            MWK {booking.price?.toLocaleString() || 'N/A'}
                          </div>
                          {booking.ticket && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="mt-2"
                              onClick={() => handleViewTicket(booking)}
                            >
                              <QrCodeIcon className="h-4 w-4 mr-1" />
                              View Ticket
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        );

      case 'settings':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Preferences</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Email Notifications</h4>
                    <p className="text-sm text-gray-500">Receive booking confirmations and updates</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Configure
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">SMS Notifications</h4>
                    <p className="text-sm text-gray-500">Get text alerts for your trips</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Configure
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Language</h4>
                    <p className="text-sm text-gray-500">Choose your preferred language</p>
                  </div>
                  <select className="input">
                    <option>English</option>
                    <option>Chichewa</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-gray-500">
                <p>This section is under development.</p>
                <p className="text-sm mt-2">Check back soon for updates.</p>
              </div>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="page-container">
      <div className="content-container">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
          <p className="text-gray-600">Manage your account and view your travel history</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Menu */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-4">
                <nav className="space-y-2">
                  {menuItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors duration-200 ${
                        activeTab === item.id
                          ? 'bg-primary-50 text-primary-600'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <item.icon className="h-5 w-5" />
                      <span className="font-medium">{item.name}</span>
                      {activeTab === item.id && (
                        <ArrowRightIcon className="h-4 w-4 ml-auto" />
                      )}
                    </button>
                  ))}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {renderContent()}
          </div>
        </div>
      </div>

      {/* Ticket Modal */}
      {showTicketModal && selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <QrCodeIcon className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">E-Ticket</h3>
                
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <div className="text-sm text-gray-600 mb-2">Booking Reference</div>
                  <div className="text-lg font-mono font-semibold">{selectedTicket.id.slice(0, 8).toUpperCase()}</div>
                </div>

                <div className="space-y-3 text-left mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Passenger:</span>
                    <span className="font-medium">{selectedTicket.passengerName || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Route:</span>
                    <span className="font-medium">{selectedTicket.trip?.route?.origin} to {selectedTicket.trip?.route?.destination}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Seat:</span>
                    <span className="font-medium">{selectedTicket.seatNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bus:</span>
                    <span className="font-medium">{selectedTicket.trip?.bus?.plateNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Departure:</span>
                    <span className="font-medium">{selectedTicket.trip ? new Date(selectedTicket.trip.departureTime).toLocaleString() : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(selectedTicket.status)}`}>
                      {selectedTicket.status}
                    </span>
                  </div>
                </div>

                {selectedTicket.ticket && (
                  <div className="bg-yellow-50 p-3 rounded-lg mb-4">
                    <div className="text-sm text-yellow-800">
                      <strong>QR Code:</strong> {selectedTicket.ticket.qrCode}
                    </div>
                  </div>
                )}

                <Button
                  type="button"
                  onClick={() => setShowTicketModal(false)}
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

export default Profile;
