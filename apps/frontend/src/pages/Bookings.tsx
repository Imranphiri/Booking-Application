import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Search,
  MapPin,
  Calendar,
  Users,
  Clock,
  ArrowRight,
  Shield,
  CheckCircle,
  X,
  ChevronRight
} from 'lucide-react';
import '../styles/Bookings.css';

interface Trip {
  id: string;
  route: {
    origin: string;
    destination: string;
    price: number;
  };
  bus: {
    type: string;
    totalSeats: number;
  };
  departureTime: string;
  arrivalTime: string;
  availableSeats: number;
}

interface BookingData {
  tripId: string;
  passengers: number;
  passengerDetails: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  paymentMethod: string;
}

const Bookings: React.FC = () => {
  const location = useLocation();

  // Helper function to get proper city name from search value
  const getCityName = (value: string): string => {
    const cityMap: { [key: string]: string } = {
      'lilongwe': 'Lilongwe',
      'blantyre': 'Blantyre', 
      'mzuzu': 'Mzuzu',
      'zomba': 'Zomba',
      'kasungu': 'Kasungu'
    };
    return cityMap[value.toLowerCase()] || value;
  };

  const [searchData, setSearchData] = useState({
    from: '',
    to: '',
    date: '',
    passengers: 1
  });
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<Trip[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingStep, setBookingStep] = useState<'details' | 'payment' | 'confirmation'>('details');
  const [showTripDetailsModal, setShowTripDetailsModal] = useState(false);
  const [viewingTrip, setViewingTrip] = useState<Trip | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('airtel_money');
  const [passengerDetails, setPassengerDetails] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });

  const popularRoutes = [
    { from: 'Lilongwe', to: 'Blantyre', price: 50000, duration: '4h 30m' },
    { from: 'Lilongwe', to: 'Mzuzu', price: 50000, duration: '2h 45m' },
    { from: 'Blantyre', to: 'Zomba', price: 30000, duration: '1h 30m' },
    { from: 'Lilongwe', to: 'Zomba', price: 40000, duration: '2h 15m' }
  ];

  // Handle search results passed from Home.tsx and selectedBus from Dashboard
  useEffect(() => {
    if (location.state?.searchResults) {
      const { searchResults, searchData } = location.state;
      
      // Transform backend data to match frontend interface
      const transformedResults: Trip[] = searchResults.map((trip: any) => ({
        id: trip.id,
        route: {
          origin: trip.route?.origin || trip.origin || getCityName(searchData.from),
          destination: trip.route?.destination || trip.destination || getCityName(searchData.to),
          price: trip.route?.price || trip.price || 50000
        },
        bus: {
          type: trip.bus?.type || 'Standard',
          totalSeats: trip.bus?.totalSeats || 50
        },
        departureTime: trip.departureTime,
        arrivalTime: trip.arrivalTime,
        availableSeats: trip.availableSeats || 40
      }));
      
      setSearchResults(transformedResults);
      setSearchData(searchData);
    }
    
    // Handle selected bus passed from Dashboard
    if (location.state?.selectedBus) {
      const { selectedBus, searchData } = location.state;
      
      // Transform selected bus data to match Trip interface
      const transformedBus: Trip = {
        id: selectedBus.id,
        route: {
          origin: searchData.from,
          destination: searchData.to,
          price: parseInt(selectedBus.price.replace(/,/g, '')) || 50000
        },
        bus: {
          type: 'Standard',
          totalSeats: 50
        },
        departureTime: new Date().toISOString(), // Will be updated with actual trip data
        arrivalTime: new Date().toISOString(), // Will be updated with actual trip data
        availableSeats: selectedBus.seats || 40
      };
      
      setSearchResults([transformedBus]);
      setSearchData(searchData);
      // Auto-select this trip for booking
      setSelectedTrip(transformedBus);
      setShowBookingModal(true);
    }
  }, [location.state]);

  // Debug modal state changes
  useEffect(() => {
    console.log('Modal state changed:', { showTripDetailsModal, viewingTrip });
  }, [showTripDetailsModal, viewingTrip]);

  // Real API call to backend
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch(`http://localhost:3000/api/trips?origin=${searchData.from}&destination=${searchData.to}&date=${searchData.date}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch trips');
      }
      
      const data = await response.json();
      console.log('Backend trip data:', data);
      
      // Transform backend data to match frontend interface
      const transformedResults: Trip[] = data.trips.map((trip: any) => ({
        id: trip.id,
        route: {
          origin: trip.route?.origin || trip.origin || getCityName(searchData.from),
          destination: trip.route?.destination || trip.destination || getCityName(searchData.to),
          price: trip.route?.price || trip.price || 50000
        },
        bus: {
          type: trip.bus?.type || 'Standard',
          totalSeats: trip.bus?.totalSeats || 50
        },
        departureTime: trip.departureTime,
        arrivalTime: trip.arrivalTime,
        availableSeats: trip.availableSeats || 40
      }));
      
      setSearchResults(transformedResults);
    } catch (error) {
      console.error('Failed to search trips:', error);
      setSearchResults([]);
      alert('Failed to search trips. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBookTrip = (trip: Trip) => {
    setSelectedTrip(trip);
    setBookingStep('details');
    setShowBookingModal(true);
  };

  const handleCloseBookingModal = () => {
    setShowBookingModal(false);
    setSelectedTrip(null);
    setBookingStep('details');
    setPassengerDetails({
      firstName: '',
      lastName: '',
      email: '',
      phone: ''
    });
    setPaymentMethod('airtel_money');
  };

  const handleProceedToPayment = () => {
    setBookingStep('payment');
  };

  const handleViewTrip = (trip: Trip) => {
    console.log('View Trip clicked:', trip);
    alert('View Trip clicked! Check console for details.');
    setViewingTrip(trip);
    setShowTripDetailsModal(true);
  };

  const handleCloseTripDetails = () => {
    setShowTripDetailsModal(false);
    setViewingTrip(null);
  };

  const handleBookFromDetails = () => {
    if (viewingTrip) {
      setShowTripDetailsModal(false);
      handleBookTrip(viewingTrip);
    }
  };

  const handleConfirmBooking = async () => {
    if (!selectedTrip) return;
    
    // Validate required fields
    if (!passengerDetails.firstName || !passengerDetails.lastName || !passengerDetails.email || !passengerDetails.phone) {
      alert('Please fill in all passenger details');
      return;
    }
    
    if (!paymentMethod) {
      alert('Please select a payment method');
      return;
    }
    
    setBookingLoading(true);
    try {
      const bookingData: BookingData = {
        tripId: selectedTrip.id,
        passengers: searchData.passengers,
        paymentMethod,
        passengerDetails
      };
      
      const response = await fetch('http://localhost:3000/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Booking failed');
      }
      
      const result = await response.json();
      console.log('Booking successful:', result);
      setBookingStep('confirmation');
      
      // Reset after successful booking
      setTimeout(() => {
        handleCloseBookingModal();
      }, 3000);
    } catch (error: any) {
      console.error('Failed to create booking:', error);
      alert(`Booking failed: ${error.message || 'Please try again.'}`);
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="bookings-page">
      {/* Navbar */}
      <nav className="bookings-navbar">
        <div className="bookings-navbar-container">
          <div className="bookings-navbar-content">
            <div className="bookings-navbar-logo">
              <div className="bookings-logo-icon">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="bookings-logo-title">Booksync</div>
                <div className="bookings-logo-subtitle">Book Your Journey</div>
              </div>
            </div>
            <div className="bookings-navbar-menu">
              <a href="/" className="bookings-nav-link">Home</a>
              <a href="/bookings" className="bookings-nav-link active">Bookings</a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bookings-hero">
        <div className="bookings-hero-container">
          <div className="bookings-hero-content">
            <h1 className="bookings-hero-title">
              Find Your Perfect Journey
            </h1>
            <p className="bookings-hero-subtitle">
              Search and book bus tickets across Malawi with ease
            </p>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="bookings-search-section">
        <div className="bookings-search-container">
          <div className="bookings-search-card">
            <h2 className="bookings-search-title">Search Trips</h2>
            <form onSubmit={handleSearch} className="bookings-search-form">
              <div className="bookings-form-grid">
                <div className="bookings-form-field">
                  <label className="bookings-form-label">
                    <MapPin className="w-4 h-4" />
                    From
                  </label>
                  <select
                    value={searchData.from}
                    onChange={(e) => setSearchData({...searchData, from: e.target.value})}
                    className="bookings-form-input"
                    required
                  >
                    <option value="">Select departure city</option>
                    <option value="Lilongwe">Lilongwe</option>
                    <option value="Blantyre">Blantyre</option>
                    <option value="Mzuzu">Mzuzu</option>
                    <option value="Zomba">Zomba</option>
                    <option value="Kasungu">Kasungu</option>
                  </select>
                </div>
                
                <div className="bookings-form-field">
                  <label className="bookings-form-label">
                    <MapPin className="w-4 h-4" />
                    To
                  </label>
                  <select
                    value={searchData.to}
                    onChange={(e) => setSearchData({...searchData, to: e.target.value})}
                    className="bookings-form-input"
                    required
                  >
                    <option value="">Select destination city</option>
                    <option value="Lilongwe">Lilongwe</option>
                    <option value="Blantyre">Blantyre</option>
                    <option value="Mzuzu">Mzuzu</option>
                    <option value="Zomba">Zomba</option>
                    <option value="Kasungu">Kasungu</option>
                  </select>
                </div>
                
                <div className="bookings-form-field">
                  <label className="bookings-form-label">
                    <Calendar className="w-4 h-4" />
                    Travel Date
                  </label>
                  <input
                    type="date"
                    value={searchData.date}
                    onChange={(e) => setSearchData({...searchData, date: e.target.value})}
                    className="bookings-form-input"
                    required
                  />
                </div>
                
                <div className="bookings-form-field">
                  <label className="bookings-form-label">
                    <Users className="w-4 h-4" />
                    Passengers
                  </label>
                  <select
                    value={searchData.passengers}
                    onChange={(e) => setSearchData({...searchData, passengers: parseInt(e.target.value)})}
                    className="bookings-form-input"
                    required
                  >
                    <option value="1">1 Passenger</option>
                    <option value="2">2 Passengers</option>
                    <option value="3">3 Passengers</option>
                    <option value="4">4 Passengers</option>
                    <option value="5">5 Passengers</option>
                  </select>
                </div>
              </div>
              
              <button type="submit" className="bookings-search-button" disabled={loading}>
                {loading ? (
                  <div className="bookings-spinner"></div>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    Search Trips
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Popular Routes */}
      <section className="bookings-popular-section">
        <div className="bookings-popular-container">
          <div className="bookings-section-header">
            <h2 className="bookings-section-title">Popular Routes</h2>
            <p className="bookings-section-subtitle">Most frequently traveled routes across Malawi</p>
          </div>
          
          <div className="bookings-routes-grid">
            {popularRoutes.map((route, index) => (
              <div key={index} className="bookings-route-card">
                <div className="bookings-route-header">
                  <div className="bookings-route-location">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    <span className="bookings-route-city">{route.from}</span>
                  </div>
                  <div className="bookings-route-arrow">→</div>
                  <div className="bookings-route-location">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    <span className="bookings-route-city">{route.to}</span>
                  </div>
                </div>

                <div className="bookings-route-details">
                  <div className="bookings-route-duration">
                    <Clock className="w-4 h-4" />
                    {route.duration}
                  </div>
                  <div className="bookings-route-price">
                    <span className="bookings-price-label">from</span>
                    <span className="bookings-price-amount">MWK {route.price.toLocaleString()}</span>
                  </div>
                </div>

                <button className="bookings-route-button">View Trips</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Search Results */}
      {searchResults.length > 0 && !loading && (
        <section className="bookings-results-section">
          <div className="bookings-results-container">
            <div className="bookings-section-header">
              <h2 className="bookings-section-title">Available Trips</h2>
              <p className="bookings-section-subtitle">Found {searchResults.length} trips for your journey</p>
            </div>
            
            <div className="bookings-results-grid">
              {searchResults.map((trip) => (
                <div key={trip.id} className="bookings-trip-card">
                  <div className="bookings-trip-header">
                    <div className="bookings-trip-route">
                      <div className="bookings-trip-location">
                        <MapPin className="w-5 h-5 text-blue-600" />
                        <span className="bookings-trip-city">{trip.route.origin}</span>
                      </div>
                      <div className="bookings-trip-arrow">→</div>
                      <div className="bookings-trip-location">
                        <MapPin className="w-5 h-5 text-blue-600" />
                        <span className="bookings-trip-city">{trip.route.destination}</span>
                      </div>
                    </div>
                    
                    <div className="bookings-trip-type">
                      <span className="bookings-type-badge">{trip.bus.type}</span>
                    </div>
                  </div>
                  
                  <div className="bookings-trip-details">
                    <div className="bookings-trip-time">
                      <div className="bookings-time-item">
                        <Clock className="w-4 h-4" />
                        <div>
                          <div className="bookings-time-value">
                            {new Date(trip.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                          <div className="bookings-time-label">Departure</div>
                        </div>
                      </div>
                      <div className="bookings-time-item">
                        <Clock className="w-4 h-4" />
                        <div>
                          <div className="bookings-time-value">
                            {new Date(trip.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                          <div className="bookings-time-label">Arrival</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bookings-trip-seats">
                      <Users className="w-4 h-4" />
                      <span>{trip.availableSeats} seats available</span>
                    </div>
                  </div>
                  
                  <div className="bookings-trip-footer">
                    <div className="bookings-trip-price">
                      <span className="bookings-price-label">from</span>
                      <span className="bookings-price-amount">MWK {trip.route.price.toLocaleString()}</span>
                    </div>
                    <div className="bookings-trip-actions">
                      <button className="bookings-view-button" onClick={() => handleViewTrip(trip)}>
                        View Trip
                        <ChevronRight className="w-4 h-4" />
                      </button>
                      <button className="bookings-book-button" onClick={() => handleBookTrip(trip)}>
                        Book Now
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Booking Modal */}
      {showBookingModal && selectedTrip && (
        <div className="bookings-modal-overlay">
          <div className="bookings-modal">
            <div className="bookings-modal-header">
              <h3 className="bookings-modal-title">
                {bookingStep === 'details' && 'Trip Details'}
                {bookingStep === 'payment' && 'Passenger Details & Payment'}
                {bookingStep === 'confirmation' && 'Booking Confirmed!'}
              </h3>
              <button className="bookings-modal-close" onClick={handleCloseBookingModal}>
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="bookings-modal-content">
              {/* Step 1: Trip Details */}
              {bookingStep === 'details' && (
                <div className="bookings-modal-step">
                  <div className="bookings-trip-summary">
                    <div className="bookings-summary-item">
                      <span className="bookings-summary-label">Route:</span>
                      <span className="bookings-summary-value">
                        {selectedTrip.route.origin} to {selectedTrip.route.destination}
                      </span>
                    </div>
                    <div className="bookings-summary-item">
                      <span className="bookings-summary-label">Date:</span>
                      <span className="bookings-summary-value">
                        {new Date(selectedTrip.departureTime).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="bookings-summary-item">
                      <span className="bookings-summary-label">Departure:</span>
                      <span className="bookings-summary-value">
                        {new Date(selectedTrip.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="bookings-summary-item">
                      <span className="bookings-summary-label">Arrival:</span>
                      <span className="bookings-summary-value">
                        {new Date(selectedTrip.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="bookings-summary-item">
                      <span className="bookings-summary-label">Bus Type:</span>
                      <span className="bookings-summary-value">{selectedTrip.bus.type}</span>
                    </div>
                    <div className="bookings-summary-item">
                      <span className="bookings-summary-label">Passengers:</span>
                      <span className="bookings-summary-value">{searchData.passengers}</span>
                    </div>
                    <div className="bookings-summary-divider"></div>
                    <div className="bookings-summary-item">
                      <span className="bookings-summary-label total">Total Price:</span>
                      <span className="bookings-summary-value total">
                        MWK {(selectedTrip.route.price * searchData.passengers).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  ssss
                  <div className="bookings-modal-actions">
                    <button className="bookings-button secondary" onClick={handleCloseBookingModal}>
                      Cancel
                    </button>
                    <button className="bookings-button primary" onClick={handleProceedToPayment}>
                      Proceed to Payment
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Passenger Details & Payment */}
              {bookingStep === 'payment' && (
                <div className="bookings-modal-step">
                  <div className="bookings-passenger-form">
                    <div className="bookings-form-row">
                      <div className="bookings-form-field">
                        <label className="bookings-form-label">First Name</label>
                        <input
                          type="text"
                          placeholder="Enter first name"
                          value={passengerDetails.firstName}
                          onChange={(e) => setPassengerDetails({...passengerDetails, firstName: e.target.value})}
                          className="bookings-form-input"
                          required
                        />
                      </div>
                      <div className="bookings-form-field">
                        <label className="bookings-form-label">Last Name</label>
                        <input
                          type="text"
                          placeholder="Enter last name"
                          value={passengerDetails.lastName}
                          onChange={(e) => setPassengerDetails({...passengerDetails, lastName: e.target.value})}
                          className="bookings-form-input"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="bookings-form-field">
                      <label className="bookings-form-label">Email</label>
                      <input
                        type="email"
                        placeholder="Enter email address"
                        value={passengerDetails.email}
                        onChange={(e) => setPassengerDetails({...passengerDetails, email: e.target.value})}
                        className="bookings-form-input"
                        required
                      />
                    </div>
                    
                    <div className="bookings-form-field">
                      <label className="bookings-form-label">Phone Number</label>
                      <input
                        type="tel"
                        placeholder="Enter phone number"
                        value={passengerDetails.phone}
                        onChange={(e) => setPassengerDetails({...passengerDetails, phone: e.target.value})}
                        className="bookings-form-input"
                        required
                      />
                    </div>
                    
                    <div className="bookings-payment-section">
                      <h4 className="bookings-payment-title">Payment Method</h4>
                      <div className="bookings-payment-grid">
                        <div 
                          className={`bookings-payment-option ${paymentMethod === 'airtel_money' ? 'active' : ''}`}
                          onClick={() => setPaymentMethod('airtel_money')}
                        >
                          <img 
                            src="/images/payment/airtel.png" 
                            alt="Airtel Money" 
                            className="bookings-payment-image"
                            onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                              // Fallback to styled div if image not found
                              const target = e.currentTarget as HTMLImageElement;
                              target.style.display = 'none';
                              const nextElement = target.nextElementSibling as HTMLElement;
                              if (nextElement) {
                                nextElement.style.display = 'flex';
                              }
                            }}
                          />
                          <div className="bookings-payment-icon airtel" style={{display: 'none'}}>
                            <span>A</span>
                          </div>
                          <span>Airtel Money</span>
                        </div>
                        <div 
                          className={`bookings-payment-option ${paymentMethod === 'mpamba' ? 'active' : ''}`}
                          onClick={() => setPaymentMethod('mpamba')}
                        >
                          <img 
                            src="/images/payment/mpamba.png" 
                            alt="Mpamba" 
                            className="bookings-payment-image"
                            onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                              // Fallback to styled div if image not found
                              const target = e.currentTarget as HTMLImageElement;
                              target.style.display = 'none';
                              const nextElement = target.nextElementSibling as HTMLElement;
                              if (nextElement) {
                                nextElement.style.display = 'flex';
                              }
                            }}
                          />
                          <div className="bookings-payment-icon mpamba" style={{display: 'none'}}>
                            <span>M</span>
                          </div>
                          <span>Mpamba</span>
                        </div>
                        <div 
                          className={`bookings-payment-option ${paymentMethod === 'mnb_card' ? 'active' : ''}`}
                          onClick={() => setPaymentMethod('mnb_card')}
                        >
                          <div className="bookings-payment-icon mnb">
                            <span>MNB</span>
                          </div>
                          <span>MNB Card</span>
                        </div>
                        <div 
                          className={`bookings-payment-option ${paymentMethod === 'cash' ? 'active' : ''}`}
                          onClick={() => setPaymentMethod('cash')}
                        >
                          <div className="bookings-payment-icon cash">
                            <span>$</span>
                          </div>
                          <span>Cash</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bookings-modal-actions">
                    <button className="bookings-button secondary" onClick={() => setBookingStep('details')}>
                      Back
                    </button>
                    <button className="bookings-button primary" onClick={handleConfirmBooking} disabled={bookingLoading}>
                      {bookingLoading ? (
                        <div className="bookings-spinner"></div>
                      ) : (
                        <>
                          Confirm Booking
                          <CheckCircle className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Confirmation */}
              {bookingStep === 'confirmation' && (
                <div className="bookings-modal-step">
                  <div className="bookings-confirmation">
                    <div className="bookings-success-icon">
                      <CheckCircle className="w-12 h-12" />
                    </div>
                    <h3 className="bookings-confirmation-title">Booking Confirmed!</h3>
                    <p className="bookings-confirmation-message">
                      Your booking has been successfully confirmed. A confirmation email has been sent to {passengerDetails.email}.
                    </p>
                    
                    <div className="bookings-confirmation-details">
                      <div className="bookings-booking-ref">
                        <span className="bookings-ref-label">Booking Reference</span>
                        <span className="bookings-ref-number">TH-{Date.now()}</span>
                      </div>
                      
                      <div className="bookings-seat-info">
                        <span className="bookings-seat-label">Seat Assignment</span>
                        <span className="bookings-seat-number">
                          {searchData.passengers === 1 ? 'Seat 1' : `Seats 1-${searchData.passengers}`}
                        </span>
                      </div>
                      
                      <div className="bookings-boarding-info">
                        <Shield className="w-5 h-5" />
                        <span>Please arrive 30 minutes before departure</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bookings-modal-actions">
                    <button className="bookings-button primary" onClick={handleCloseBookingModal}>
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Debug indicator */}
      {showTripDetailsModal && (
        <div style={{
          position: 'fixed',
          top: '10px',
          right: '10px',
          background: 'red',
          color: 'white',
          padding: '10px',
          zIndex: 9999,
          borderRadius: '5px'
        }}>
          Modal should be visible!
        </div>
      )}

      {/* Trip Details Modal */}
      {showTripDetailsModal && viewingTrip && (
        <div className="bookings-modal-overlay">
          <div className="bookings-modal trip-details-modal">
            <div className="bookings-modal-header">
              <h3 className="bookings-modal-title">Trip Details</h3>
              <button className="bookings-modal-close" onClick={handleCloseTripDetails}>
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="bookings-modal-content">
              <div className="trip-details-content">
                <div className="trip-details-header">
                  <div className="trip-route-info">
                    <div className="trip-route-main">
                      <div className="trip-location">
                        <MapPin className="w-5 h-5 text-blue-600" />
                        <span className="trip-city">{viewingTrip.route.origin}</span>
                      </div>
                      <div className="trip-arrow">→</div>
                      <div className="trip-location">
                        <MapPin className="w-5 h-5 text-blue-600" />
                        <span className="trip-city">{viewingTrip.route.destination}</span>
                      </div>
                    </div>
                    <div className="trip-type-badge">{viewingTrip.bus.type}</div>
                  </div>
                </div>

                <div className="trip-details-grid">
                  <div className="trip-detail-item">
                    <div className="trip-detail-icon">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div className="trip-detail-info">
                      <div className="trip-detail-label">Departure Time</div>
                      <div className="trip-detail-value">
                        {new Date(viewingTrip.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="trip-detail-date">
                        {new Date(viewingTrip.departureTime).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="trip-detail-item">
                    <div className="trip-detail-icon">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div className="trip-detail-info">
                      <div className="trip-detail-label">Arrival Time</div>
                      <div className="trip-detail-value">
                        {new Date(viewingTrip.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="trip-detail-date">
                        {new Date(viewingTrip.arrivalTime).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="trip-detail-item">
                    <div className="trip-detail-icon">
                      <Users className="w-5 h-5" />
                    </div>
                    <div className="trip-detail-info">
                      <div className="trip-detail-label">Available Seats</div>
                      <div className="trip-detail-value">{viewingTrip.availableSeats}</div>
                      <div className="trip-detail-sublabel">out of {viewingTrip.bus.totalSeats} total</div>
                    </div>
                  </div>

                  <div className="trip-detail-item">
                    <div className="trip-detail-icon">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div className="trip-detail-info">
                      <div className="trip-detail-label">Bus Type</div>
                      <div className="trip-detail-value">{viewingTrip.bus.type}</div>
                      <div className="trip-detail-sublabel">{viewingTrip.bus.totalSeats} seats</div>
                    </div>
                  </div>
                </div>

                <div className="trip-details-footer">
                  <div className="trip-price-info">
                    <div className="trip-price-label">Price per passenger</div>
                    <div className="trip-price-value">MWK {viewingTrip.route.price.toLocaleString()}</div>
                  </div>
                  
                  <div className="trip-availability">
                    {viewingTrip.availableSeats > 0 ? (
                      <div className="availability-status available">
                        <CheckCircle className="w-4 h-4" />
                        <span>Available for booking</span>
                      </div>
                    ) : (
                      <div className="availability-status unavailable">
                        <X className="w-4 h-4" />
                        <span>No seats available</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="trip-details-actions">
                  <button className="bookings-button secondary" onClick={handleCloseTripDetails}>
                    Close
                  </button>
                  <button 
                    className="bookings-button primary" 
                    onClick={handleBookFromDetails}
                    disabled={viewingTrip.availableSeats === 0}
                  >
                    {viewingTrip.availableSeats > 0 ? (
                      <>
                        Book This Trip
                        <ArrowRight className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        Not Available
                        <X className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bookings;
