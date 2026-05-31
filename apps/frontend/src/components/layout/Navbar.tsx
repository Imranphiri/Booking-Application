import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { MapPin, User, LogOut } from 'lucide-react';
import '../../styles/Home.css';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    setIsAuthenticated(!!token);
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-content">
          {/* Logo */}
          <div className="navbar-logo">
            <Link to="/" className="logo-link">
              <div className="logo-icon">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="logo-title">Booksync</div>
                <div className="logo-subtitle">Malawi Transport Management</div>
              </div>
            </Link>
          </div>

          {/* Menu Items */}
          <div className="navbar-menu">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/bookings" className="nav-link">Bookings</Link>
            
            {isAuthenticated ? (
              <div className="navbar-user-menu">
                <Link to="/dashboard" className="nav-link user-link">
                  <User className="w-4 h-4" />
                  {user?.name || 'Profile'}
                </Link>
                <button className="navbar-logout" onClick={handleLogout}>
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="navbar-auth-buttons">
                <Link to="/login" className="navbar-login">Login</Link>
                <Link to="/signup" className="navbar-cta">Get Started</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
