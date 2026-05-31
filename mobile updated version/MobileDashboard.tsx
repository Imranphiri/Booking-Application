import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Home,
  Ticket,
  User,
  MapPin,
  Calendar,
  Search,
  Clock,
  ArrowRight,
  Edit,
  Mail,
  Phone,
  Save,
  Bell,
  Settings,
  LogOut
} from 'lucide-react';

export default function MobileDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'home' | 'tickets' | 'profile'>('home');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    from: '',
    to: '',
    date: '',
    passengers: '1'
  });
  const [profile, setProfile] = useState({
    fullName: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+265 123 456 789',
    address: 'Lilongwe, Malawi'
  });

  const myTickets = [
    {
      id: 'TH-2024-001',
      from: 'Lilongwe',
      to: 'Blantyre',
      date: '2026-04-25',
      time: '08:00 AM',
      seat: 'A12',
      status: 'Confirmed',
      price: '50,000'
    },
    {
      id: 'TH-2024-002',
      from: 'Blantyre',
      to: 'Zomba',
      date: '2026-04-28',
      time: '02:00 PM',
      seat: 'B05',
      status: 'Confirmed',
      price: '30,000'
    }
  ];

  const availableBuses = [
    {
      id: 1,
      route: 'Lilongwe → Blantyre',
      departure: '08:00 AM',
      arrival: '01:00 PM',
      price: '50,000',
      seats: 12
    },
    {
      id: 2,
      route: 'Lilongwe → Blantyre',
      departure: '02:00 PM',
      arrival: '07:00 PM',
      price: '50,000',
      seats: 8
    }
  ];

  const handleBookingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setBookingForm({
      ...bookingForm,
      [e.target.name]: e.target.value
    });
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-900 to-blue-600 px-4 pt-8 pb-6 rounded-b-3xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white">TransitHub</h1>
            <p className="text-blue-100 text-sm">Welcome, {profile.fullName}</p>
          </div>
          <div className="flex items-center space-x-2">
            <button className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Bell className="w-5 h-5 text-white" />
            </button>
            <button className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 -mt-2">
        {/* Home Tab */}
        {activeTab === 'home' && (
          <div className="space-y-4">
            {/* Search Card */}
            <div className="bg-white rounded-2xl shadow-md p-5">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                <Search className="w-5 h-5 mr-2 text-blue-600" />
                Book Your Trip
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">From</label>
                  <select
                    name="from"
                    value={bookingForm.from}
                    onChange={handleBookingChange}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="">Select city</option>
                    <option value="lilongwe">Lilongwe</option>
                    <option value="blantyre">Blantyre</option>
                    <option value="mzuzu">Mzuzu</option>
                    <option value="zomba">Zomba</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">To</label>
                  <select
                    name="to"
                    value={bookingForm.to}
                    onChange={handleBookingChange}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="">Select city</option>
                    <option value="lilongwe">Lilongwe</option>
                    <option value="blantyre">Blantyre</option>
                    <option value="mzuzu">Mzuzu</option>
                    <option value="zomba">Zomba</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Date</label>
                    <input
                      type="date"
                      name="date"
                      value={bookingForm.date}
                      onChange={handleBookingChange}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Passengers</label>
                    <select
                      name="passengers"
                      value={bookingForm.passengers}
                      onChange={handleBookingChange}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                    </select>
                  </div>
                </div>

                <button className="w-full bg-gradient-to-r from-blue-900 to-blue-600 text-white py-3 rounded-xl font-medium">
                  Search Buses
                </button>
              </div>
            </div>

            {/* Available Buses */}
            <div>
              <h3 className="font-bold text-gray-900 mb-3">Available Buses</h3>
              <div className="space-y-3">
                {availableBuses.map((bus) => (
                  <div key={bus.id} className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="font-semibold text-gray-900 mb-2">{bus.route}</div>
                    <div className="flex items-center space-x-4 text-xs text-gray-600 mb-3">
                      <div className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {bus.departure}
                      </div>
                      <span>→</span>
                      <div className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {bus.arrival}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs text-gray-500">Price</div>
                        <div className="text-lg font-bold text-green-600">MWK {bus.price}</div>
                        <div className="text-xs text-gray-500">{bus.seats} seats left</div>
                      </div>
                      <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium">
                        Select
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tickets Tab */}
        {activeTab === 'tickets' && (
          <div className="space-y-4 mt-4">
            <h3 className="font-bold text-gray-900">My Tickets</h3>
            {myTickets.map((ticket) => (
              <div key={ticket.id} className="bg-white rounded-2xl p-4 shadow-md">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-xs text-gray-500">Ticket ID</div>
                    <div className="font-semibold text-gray-900">{ticket.id}</div>
                  </div>
                  <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                    {ticket.status}
                  </div>
                </div>

                <div className="border-t border-dashed border-gray-200 pt-3 mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      <span className="font-medium">{ticket.from}</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      <span className="font-medium">{ticket.to}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <div className="text-xs text-gray-500">Date</div>
                      <div className="font-medium">{ticket.date}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Time</div>
                      <div className="font-medium">{ticket.time}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Seat</div>
                      <div className="font-medium">{ticket.seat}</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="text-xl font-bold text-gray-900">MWK {ticket.price}</div>
                  <button className="text-blue-600 text-sm font-medium">View Ticket</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-4 mt-4">
            <div className="bg-white rounded-2xl p-5 shadow-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900">My Profile</h3>
                {!isEditingProfile ? (
                  <button
                    onClick={() => setIsEditingProfile(true)}
                    className="flex items-center space-x-1 text-blue-600 text-sm"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setIsEditingProfile(false)}
                    className="flex items-center space-x-1 bg-blue-600 text-white px-3 py-1 rounded-lg text-sm"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save</span>
                  </button>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      name="fullName"
                      value={profile.fullName}
                      onChange={handleProfileChange}
                      disabled={!isEditingProfile}
                      className={`w-full pl-10 pr-3 py-3 border rounded-lg text-sm ${
                        !isEditingProfile ? 'bg-gray-50' : ''
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={profile.email}
                      onChange={handleProfileChange}
                      disabled={!isEditingProfile}
                      className={`w-full pl-10 pr-3 py-3 border rounded-lg text-sm ${
                        !isEditingProfile ? 'bg-gray-50' : ''
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={profile.phone}
                      onChange={handleProfileChange}
                      disabled={!isEditingProfile}
                      className={`w-full pl-10 pr-3 py-3 border rounded-lg text-sm ${
                        !isEditingProfile ? 'bg-gray-50' : ''
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      name="address"
                      value={profile.address}
                      onChange={handleProfileChange}
                      disabled={!isEditingProfile}
                      className={`w-full pl-10 pr-3 py-3 border rounded-lg text-sm ${
                        !isEditingProfile ? 'bg-gray-50' : ''
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate('/mobile')}
              className="w-full bg-red-50 text-red-600 py-3 rounded-xl font-medium flex items-center justify-center space-x-2"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3">
        <div className="flex items-center justify-around">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center space-y-1 ${
              activeTab === 'home' ? 'text-blue-600' : 'text-gray-400'
            }`}
          >
            <Home className="w-6 h-6" />
            <span className="text-xs font-medium">Home</span>
          </button>
          <button
            onClick={() => setActiveTab('tickets')}
            className={`flex flex-col items-center space-y-1 ${
              activeTab === 'tickets' ? 'text-blue-600' : 'text-gray-400'
            }`}
          >
            <Ticket className="w-6 h-6" />
            <span className="text-xs font-medium">Tickets</span>
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center space-y-1 ${
              activeTab === 'profile' ? 'text-blue-600' : 'text-gray-400'
            }`}
          >
            <User className="w-6 h-6" />
            <span className="text-xs font-medium">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
}
