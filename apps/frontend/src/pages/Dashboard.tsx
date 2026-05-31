import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Calendar,
  Search,
  User,
  Ticket,
  CreditCard,
  Clock,
  ArrowRight,
  Edit,
  Save,
  Mail,
  Phone
} from 'lucide-react';
import '../styles/Dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'book' | 'tickets' | 'profile'>('book');
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

  const [availableBuses, setAvailableBuses] = useState([
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
  ]);

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

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bookingForm.from || !bookingForm.to || !bookingForm.date) {
      alert('Please fill in all search fields');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/trips?origin=${bookingForm.from}&destination=${bookingForm.to}&date=${bookingForm.date}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch trips');
      }
      
      const data = await response.json();
      console.log('Search results:', data);
      
      // Update availableBuses with search results
      if (data.trips && data.trips.length > 0) {
        const transformedBuses = data.trips.map((trip: any) => ({
          id: trip.id,
          route: `${trip.route?.origin || bookingForm.from} → ${trip.route?.destination || bookingForm.to}`,
          departure: new Date(trip.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          arrival: new Date(trip.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          price: trip.route?.price?.toString() || '50,000',
          seats: trip.availableSeats || 40
        }));
        setAvailableBuses(transformedBuses);
      } else {
        setAvailableBuses([]);
        alert('No buses found for your search criteria');
      }
      
    } catch (error) {
      console.error('Search error:', error);
      alert('Failed to search buses. Please try again.');
    }
  };

  const handleSelectBus = (bus: any) => {
    // Navigate to bookings page with selected bus and search data
    navigate('/bookings', { 
      state: { 
        selectedBus: bus,
        searchData: {
          from: bookingForm.from,
          to: bookingForm.to,
          date: bookingForm.date,
          passengers: bookingForm.passengers
        }
      } 
    });
  };

  return (
    <div className="dashboard-main-container">
      <div className="dashboard-grid">
        {/* Sidebar */}
        <div className="sidebar-col">
          <div className="sidebar-card">
            <div className="sidebar-nav">
              <button
                onClick={() => setActiveTab('book')}
                className={"nav-button " + (activeTab === 'book' ? 'active' : 'inactive')}
              >
                <Ticket className="nav-icon" />
                <span>Book a Trip</span>
              </button>

              <button
                onClick={() => setActiveTab('tickets')}
                className={"nav-button " + (activeTab === 'tickets' ? 'active' : 'inactive')}
              >
                <CreditCard className="nav-icon" />
                <span>My Tickets</span>
              </button>

              <button
                onClick={() => setActiveTab('profile')}
                className={"nav-button " + (activeTab === 'profile' ? 'active' : 'inactive')}
              >
                <User className="nav-icon" />
                <span>My Profile</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="main-content-col">
          {/* Book a Trip Tab */}
          {activeTab === 'book' && (
            <div className="tab-content">
              <div className="content-card">
                <h2 className="page-title">Book Your Trip</h2>

                <form onSubmit={handleSearch} className="booking-form-section">
                  <div className="form-grid">
                    <div>
                      <label className="form-label">
                        From
                      </label>
                      <div className="input-with-icon">
                        <MapPin className="input-icon-position" />
                        <select
                          name="from"
                          value={bookingForm.from}
                          onChange={handleBookingChange}
                          className="form-select"
                        >
                          <option value="">Select city</option>
                          <option value="lilongwe">Lilongwe</option>
                          <option value="blantyre">Blantyre</option>
                          <option value="mzuzu">Mzuzu</option>
                          <option value="zomba">Zomba</option>
                          <option value="kasungu">Kasungu</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="form-label">
                        To
                      </label>
                      <div className="input-with-icon">
                        <MapPin className="input-icon-position" />
                        <select
                          name="to"
                          value={bookingForm.to}
                          onChange={handleBookingChange}
                          className="form-select"
                        >
                          <option value="">Select city</option>
                          <option value="lilongwe">Lilongwe</option>
                          <option value="blantyre">Blantyre</option>
                          <option value="mzuzu">Mzuzu</option>
                          <option value="zomba">Zomba</option>
                          <option value="kasungu">Kasungu</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="form-grid">
                    <div>
                      <label className="form-label">
                        Travel Date
                      </label>
                      <div className="input-with-icon">
                        <Calendar className="input-icon-position" />
                        <input
                          type="date"
                          name="date"
                          value={bookingForm.date}
                          onChange={handleBookingChange}
                          className="form-input"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="form-label">
                        Passengers
                      </label>
                      <select
                        name="passengers"
                        value={bookingForm.passengers}
                        onChange={handleBookingChange}
                        className="form-select without-icon"
                      >
                        <option value="1">1 Passenger</option>
                        <option value="2">2 Passengers</option>
                        <option value="3">3 Passengers</option>
                        <option value="4">4 Passengers</option>
                      </select>
                    </div>
                  </div>

                  <button type="submit" className="search-button">
                    <Search className="nav-icon" />
                    <span>Search Buses</span>
                  </button>
                </form>
              </div>

              {/* Available Buses */}
              <div className="content-card">
                <h3 className="page-title">Available Buses</h3>
                <div className="buses-list">
                  {availableBuses.map((bus) => (
                    <div
                      key={bus.id}
                      className="bus-card"
                    >
                      <div className="bus-header">
                        <div>
                          <h4>{bus.route}</h4>
                          <div className="bus-times">
                            <div className="bus-time-item">
                              <Clock className="bus-time-icon" />
                              <span>Departs: {bus.departure}</span>
                            </div>
                            <div className="bus-time-item">
                              <Clock className="bus-time-icon" />
                              <span>Arrives: {bus.arrival}</span>
                            </div>
                          </div>
                        </div>
                        <div className="bus-price-info">
                          <div className="price-label">from</div>
                          <div className="bus-price">
                            MWK {bus.price}
                          </div>
                          <div className="seats-info">{bus.seats} seats left</div>
                        </div>
                      </div>
                      <button className="select-bus-button" onClick={() => handleSelectBus(bus)}>
                        <span>Select Bus</span>
                        <ArrowRight className="bus-time-icon" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* My Tickets Tab */}
          {activeTab === 'tickets' && (
            <div className="content-card">
              <h2 className="page-title">My Tickets</h2>
              <div className="tickets-list">
                {myTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="ticket-card"
                  >
                    <div className="ticket-header">
                      <div className="ticket-id-info">
                        <div className="ticket-id-label">Ticket ID</div>
                        <div className="ticket-id-value">{ticket.id}</div>
                      </div>
                      <div className="ticket-status">
                        {ticket.status}
                      </div>
                    </div>

                    <div className="ticket-details-grid">
                      <div className="ticket-detail-item">
                        <div className="ticket-detail-label">Route</div>
                        <div className="ticket-detail-value">
                          {ticket.from} → {ticket.to}
                        </div>
                      </div>
                      <div className="ticket-detail-item">
                        <div className="ticket-detail-label">Date</div>
                        <div className="ticket-detail-value">{ticket.date}</div>
                      </div>
                      <div className="ticket-detail-item">
                        <div className="ticket-detail-label">Time</div>
                        <div className="ticket-detail-value">{ticket.time}</div>
                      </div>
                      <div className="ticket-detail-item">
                        <div className="ticket-detail-label">Seat</div>
                        <div className="ticket-detail-value">{ticket.seat}</div>
                      </div>
                    </div>

                    <div className="ticket-footer">
                      <div className="ticket-price">
                        MWK {ticket.price}
                      </div>
                      <button className="view-details-button">
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="content-card">
              <div className="profile-header">
                <h2 className="profile-title">My Profile</h2>
                {!isEditingProfile ? (
                  <button
                    onClick={() => setIsEditingProfile(true)}
                    className="edit-profile-button"
                  >
                    <Edit className="nav-icon" />
                    <span>Edit Profile</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setIsEditingProfile(false)}
                    className="save-profile-button"
                  >
                    <Save className="nav-icon" />
                    <span>Save Changes</span>
                  </button>
                )}
              </div>

              <div className="profile-form-section">
                <div>
                  <label className="form-label">
                    Full Name
                  </label>
                  <div className="input-with-icon">
                    <User className="input-icon-position" />
                    <input
                      type="text"
                      name="fullName"
                      value={profile.fullName}
                      onChange={handleProfileChange}
                      disabled={!isEditingProfile}
                      className="form-input profile-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label">
                    Email Address
                  </label>
                  <div className="input-with-icon">
                    <Mail className="input-icon-position" />
                    <input
                      type="email"
                      name="email"
                      value={profile.email}
                      onChange={handleProfileChange}
                      disabled={!isEditingProfile}
                      className="form-input profile-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label">
                    Phone Number
                  </label>
                  <div className="input-with-icon">
                    <Phone className="input-icon-position" />
                    <input
                      type="tel"
                      name="phone"
                      value={profile.phone}
                      onChange={handleProfileChange}
                      disabled={!isEditingProfile}
                      className="form-input profile-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label">
                    Address
                  </label>
                  <div className="input-with-icon">
                    <MapPin className="input-icon-position" />
                    <input
                      type="text"
                      name="address"
                      value={profile.address}
                      onChange={handleProfileChange}
                      disabled={!isEditingProfile}
                      className="form-input profile-input"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
