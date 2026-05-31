import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  MapPin,
  User,
  LogOut,
  Settings
} from 'lucide-react';
import '../styles/Header.css';

const Header: React.FC = () => {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const updateAuthState = () => {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      setIsAuthenticated(!!token);
      
      if (user) {
        const userData = JSON.parse(user);
        setIsAdmin(userData.role === 'SUPER_ADMIN' || userData.role === 'ADMIN' || userData.role === 'OPERATOR');
      }
    };

    updateAuthState();
    
    // Listen for storage changes
    const handleStorageChange = () => {
      updateAuthState();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Bookings', href: '/bookings' },
  ];

  return (
    <header className="booksync-header">
      <div className="booksync-header-container">
        <div className="booksync-header-content">
          {/* Logo */}
          <div className="booksync-header-logo">
            <Link to="/" className="booksync-logo-link">
              <div className="booksync-logo-icon">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="booksync-logo-title">Booksync</h1>
                <p className="booksync-logo-subtitle">Malawi Transport Management</p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="booksync-nav-menu">
              {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`booksync-nav-link ${location.pathname === item.href ? 'active' : ''}`}
              >
                {item.name}
              </Link>
            ))}
            {isAdmin && (
              <Link
                to="/admin"
                className={`booksync-nav-link ${location.pathname === '/admin' ? 'active' : ''}`}
              >
                <Settings className="w-4 h-4" />
                Admin
              </Link>
            )}
          </nav>

          {/* User Actions */}
          <div className="booksync-header-actions">
            {isAuthenticated ? (
              <div className="booksync-user-menu">
                <div className="booksync-user-info">
                  <User className="w-5 h-5" />
                  <span>Profile</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="booksync-logout-button"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="booksync-auth-buttons">
                <Link to="/login" className="booksync-login-button">
                  Login
                </Link>
                <Link to="/register" className="booksync-register-button">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;