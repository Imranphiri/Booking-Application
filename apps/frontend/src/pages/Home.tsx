import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Users, Clock, ArrowRight,
  Shield, CheckCircle, Ticket, CreditCard,
  Bell, Globe, TrendingUp, Building2, MapPin, Calendar
} from 'lucide-react';
import '../styles/Home.css';

const Home: React.FC = () => {
  const navigate = useNavigate();

  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [popularRoutes, setPopularRoutes] = useState([]);

  const features = [
    { icon: <Ticket className="w-6 h-6" />, title: "Easy Booking", description: "Book your tickets online in minutes with our simple booking system" },
    { icon: <CreditCard className="w-6 h-6" />, title: "Mobile Money", description: "Pay conveniently using Airtel Money, TNM Mpamba, and other platforms" },
    { icon: <Ticket className="w-6 h-6" />, title: "Digital Tickets", description: "Receive instant digital tickets via SMS and email" },
    { icon: <Shield className="w-6 h-6" />, title: "Secure & Reliable", description: "Travel safely with our well-maintained fleet and experienced drivers" },
    { icon: <Bell className="w-6 h-6" />, title: "Real-time Updates", description: "Get notified about your trip status and any schedule changes" },
    { icon: <Globe className="w-6 h-6" />, title: "Nationwide Coverage", description: "We connect all major cities and towns across Malawi" }
  ];

  const stats = [
    { icon: <TrendingUp className="w-8 h-8" />, value: "500+", label: "Daily Trips" },
    { icon: <Building2 className="w-8 h-8" />, value: "25+", label: "Cities Covered" },
    { icon: <Users className="w-8 h-8" />, value: "50K+", label: "Happy Passengers" },
    { icon: <Clock className="w-8 h-8" />, value: "10+", label: "Years of Service" }
  ];

  // Fetch popular routes from backend with available trips
  useEffect(() => {
    const fetchPopularRoutes = async () => {
      try {
        // First get all routes
        const routesResponse = await fetch('http://localhost:3000/api/routes');
        if (!routesResponse.ok) {
          throw new Error('Failed to fetch routes');
        }
        const routesData = await routesResponse.json();
        
        // Get today's date to check for available trips
        const today = new Date().toISOString().split('T')[0];
        
        // For each route, check if there are available trips
        const routesWithTrips = await Promise.all(
          routesData.routes.map(async (route: any) => {
            try {
              const tripsResponse = await fetch(`http://localhost:3000/api/trips?origin=${route.origin.toLowerCase()}&destination=${route.destination.toLowerCase()}&date=${today}`);
              if (tripsResponse.ok) {
                const tripsData = await tripsResponse.json();
                // Only include routes that have available trips
                if (tripsData.trips && tripsData.trips.length > 0) {
                  return {
                    from: route.origin,
                    to: route.destination,
                    price: route.price.toString(),
                    availableTrips: tripsData.trips.length,
                    trips: tripsData.trips
                  };
                }
              }
              return null;
            } catch (error) {
              console.error(`Failed to fetch trips for route ${route.origin}-${route.destination}:`, error);
              return null;
            }
          })
        );
        
        // Filter out null values and sort by number of available trips
        const validRoutes = routesWithTrips
          .filter(route => route !== null)
          .sort((a, b) => b.availableTrips - a.availableTrips)
          .slice(0, 6); // Show top 6 routes with most trips
        
        setPopularRoutes(validRoutes);
        
        // If no routes with trips found, show fallback routes
        if (validRoutes.length === 0) {
          setPopularRoutes([
            { from: "Lilongwe", to: "Blantyre", price: "50,000", availableTrips: 0, trips: [] },
            { from: "Lilongwe", to: "Mzuzu", price: "50,000", availableTrips: 0, trips: [] },
            { from: "Blantyre", to: "Zomba", price: "30,000", availableTrips: 0, trips: [] }
          ]);
        }
      } catch (error) {
        console.error('Failed to fetch popular routes:', error);
        // Fallback to static routes
        setPopularRoutes([
          { from: "Lilongwe", to: "Blantyre", price: "50,000", availableTrips: 0, trips: [] },
          { from: "Lilongwe", to: "Mzuzu", price: "50,000", availableTrips: 0, trips: [] },
          { from: "Blantyre", to: "Zomba", price: "30,000", availableTrips: 0, trips: [] }
        ]);
      }
    };

    fetchPopularRoutes();
  }, []);

  const handleBookRoute = (route: any) => {
    // Set the search form with the route data
    setFrom(route.from.toLowerCase());
    setTo(route.to.toLowerCase());
    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    setDate(today);
    
    // Navigate to bookings page with pre-filled search data and available trips
    navigate('/bookings', { 
      state: { 
        searchData: { 
          from: route.from.toLowerCase(), 
          to: route.to.toLowerCase(), 
          date: today 
        },
        searchResults: route.trips || [],
        routeInfo: {
          from: route.from,
          to: route.to,
          price: route.price,
          availableTrips: route.availableTrips || 0
        }
      } 
    });
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!from || !to || !date) {
      alert('Please fill in all search fields');
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch(`http://localhost:3000/api/trips?origin=${from}&destination=${to}&date=${date}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch trips');
      }
      
      const data = await response.json();
      console.log('Search results:', data);
      
      // Update search results with admin-added buses
      if (data.trips && data.trips.length > 0) {
        // Navigate to bookings page with search results
        navigate('/bookings', { state: { searchResults: data.trips, searchData: { from, to, date } } });
      } else {
        alert('No buses found for your search criteria');
      }
      
    } catch (error) {
      console.error('Search error:', error);
      alert('Failed to search buses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-container">

      
      {/* HERO */}
      <section className="hero-banner">
        <div className="hero-banner-container">
          <div className="hero-banner-content">
            <h1 className="hero-banner-title">KUYENDA MOPAMBANA</h1>
            <p className="hero-banner-subtitle">Travel safe with us</p>
          </div>
        </div>
      </section>

      {/* HERO MAIN */}
      <section className="hero-main" id="home">
        <div className="hero-main-container">
          <div className="hero-grid">

            {/* LEFT */}
            <div>
              <h2 className="hero-title">Your Journey Starts Here</h2>
              <p className="hero-description">
                Experience seamless bus travel across Malawi with Booksync.
                Book tickets, pay with mobile money, and enjoy comfortable journeys.
              </p>

              {/* Quick Booking Form */}
              <div className="booking-form">
                <h3 className="booking-form-title">Find Your Bus</h3>
                <div className="booking-form-content">
                  <div className="booking-form-row">
                    <div className="form-field">
                      <label className="form-label">From</label>
                      <div className="form-input-wrapper">
                        <MapPin className="form-input-icon" />
                        <select
                          value={from}
                          onChange={(e) => setFrom(e.target.value)}
                          className="form-input"
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
                    <div className="form-field">
                      <label className="form-label">To</label>
                      <div className="form-input-wrapper">
                        <MapPin className="form-input-icon" />
                        <select
                          value={to}
                          onChange={(e) => setTo(e.target.value)}
                          className="form-input"
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
                  <div className="form-field">
                    <label className="form-label">Travel Date</label>
                    <div className="form-input-wrapper">
                      <Calendar className="form-input-icon" />
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="form-input"
                      />
                    </div>
                  </div>
                  <button className="search-button" onClick={handleSearch} disabled={loading}>
                    {loading ? (
                      <div className="search-spinner"></div>
                    ) : (
                      <Search className="w-5 h-5" />
                    )}
                    <span>{loading ? 'Searching...' : 'Search Buses'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT */}
            <div className="hero-right">
              <div className="hero-image-container">
                <img
                  src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&h=600&fit=crop"
                  alt="Modern bus"
                  className="hero-image"
                />
              </div>

              {/* Glassmorphism Stats Overlay */}
              <div className="stats-overlay">
                <div className="stats-grid">
                  {stats.map((stat, index) => (
                    <div key={index} className="stat-item">
                      <div className="stat-icon">
                        {stat.icon}
                      </div>
                      <div className="stat-value">{stat.value}</div>
                      <div className="stat-label">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="features-section">
        <div className="features-container">
          <div className="section-header">
            <h2 className="section-title">Why Choose Booksync?</h2>
            <p className="section-subtitle">
              We're committed to making your bus travel experience safe, comfortable, and affordable.
            </p>
          </div>

          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">
                  {feature.icon}
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ROUTES */}
      <section id="routes" className="popular-routes-section">
        <div className="popular-routes-container">
          <div className="section-header">
            <h2 className="section-title">Popular Routes</h2>
            <p className="section-subtitle">
              Travel between Malawi's major cities with our most popular routes
            </p>
          </div>

          <div className="routes-grid">
            {popularRoutes.map((route, index) => (
              <div key={index} className={`route-card ${route.availableTrips > 0 ? 'has-trips' : 'no-trips'}`}>
                <div className="route-header">
                  <div className="route-location">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    <span className="route-city">{route.from}</span>
                  </div>
                  <div className="route-arrow">→</div>
                  <div className="route-location">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    <span className="route-city">{route.to}</span>
                  </div>
                </div>

                <div className="route-price">
                  <div className="price-label">from</div>
                  <div className="price-value">
                    <span className="price-amount">MWK {route.price}</span>
                  </div>
                </div>

                <div className="route-availability">
                  {route.availableTrips > 0 ? (
                    <div className="availability-badge available">
                      <span className="availability-text">{route.availableTrips} trips available</span>
                    </div>
                  ) : (
                    <div className="availability-badge unavailable">
                      <span className="availability-text">No trips available</span>
                    </div>
                  )}
                </div>

                <button 
                  className={`book-button ${route.availableTrips > 0 ? 'available' : 'disabled'}`}
                  onClick={() => route.availableTrips > 0 ? handleBookRoute(route) : null}
                  disabled={route.availableTrips === 0}
                >
                  {route.availableTrips > 0 ? 'Book Now' : 'No Trips Available'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-container">
          <h2 className="cta-title">Ready to Start Your Journey?</h2>
          <p className="cta-subtitle">
            Book your next trip with Booksync and experience the best bus travel service in Malawi
          </p>

          <div className="cta-buttons">
            <button className="cta-primary" onClick={() => navigate('/bookings')}>
              <span>Book a Ticket Now</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          <div className="cta-features">
            <div className="cta-feature">
              <CheckCircle className="w-6 h-6" />
              <span>24/7 Customer Support</span>
            </div>
            <div className="cta-feature">
              <CheckCircle className="w-6 h-6" />
              <span>Safe & Comfortable</span>
            </div>
            <div className="cta-feature">
              <CheckCircle className="w-6 h-6" />
              <span>Best Prices Guaranteed</span>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;