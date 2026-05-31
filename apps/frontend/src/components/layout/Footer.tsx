import React from 'react';
import {
  MapPin,
  Phone,
  Mail
} from 'lucide-react';
import '../styles/Footer.css';

const Footer: React.FC = () => {
  return (
    <footer className="booksync-footer">
      <div className="booksync-footer-container">
        <div className="booksync-footer-content">
          {/* Main Footer Content */}
          <div className="booksync-footer-grid">
            {/* Company Info */}
            <div className="booksync-footer-company">
              <div className="booksync-footer-logo">
                <div className="booksync-footer-logo-icon">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="booksync-footer-title">Booksync</h3>
                  <p className="booksync-footer-subtitle">Malawi Transport Management</p>
                </div>
              </div>
              <p className="booksync-footer-description">
                Your trusted partner for comfortable and reliable bus travel across Malawi. 
                We connect cities and communities with modern fleets and exceptional service.
              </p>
              <div className="booksync-footer-contact">
                <div className="booksync-contact-item">
                  <Phone className="w-4 h-4" />
                  <span>+265 999 123 456</span>
                </div>
                <div className="booksync-contact-item">
                  <Mail className="w-4 h-4" />
                  <span>info@booksync.com</span>
                </div>
                <div className="booksync-contact-item">
                  <MapPin className="w-4 h-4" />
                  <span>Lilongwe, Malawi</span>
                </div>
              </div>
              <div className="booksync-footer-social">
                <a href="#" className="booksync-social-link">
                  <span className="w-5 h-5">📘</span>
                </a>
                <a href="#" className="booksync-social-link">
                  <span className="w-5 h-5">🐦</span>
                </a>
                <a href="#" className="booksync-social-link">
                  <span className="w-5 h-5">📷</span>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="booksync-footer-section">
              <h4 className="booksync-footer-heading">Quick Links</h4>
              <div className="booksync-footer-links">
                <a href="/" className="booksync-footer-link">Home</a>
                <a href="/bookings" className="booksync-footer-link">Book Tickets</a>
                <a href="/about" className="booksync-footer-link">About Us</a>
                <a href="/contact" className="booksync-footer-link">Contact</a>
              </div>
            </div>

            {/* Services */}
            <div className="booksync-footer-section">
              <h4 className="booksync-footer-heading">Services</h4>
              <div className="booksync-footer-links">
                <a href="#" className="booksync-footer-link">Bus Booking</a>
                <a href="#" className="booksync-footer-link">Cargo Transport</a>
                <a href="#" className="booksync-footer-link">Charter Services</a>
                <a href="#" className="booksync-footer-link">Group Travel</a>
              </div>
            </div>

            {/* Support */}
            <div className="booksync-footer-section">
              <h4 className="booksync-footer-heading">Support</h4>
              <div className="booksync-footer-links">
                <a href="#" className="booksync-footer-link">Help Center</a>
                <a href="#" className="booksync-footer-link">FAQs</a>
                <a href="#" className="booksync-footer-link">Terms of Service</a>
                <a href="#" className="booksync-footer-link">Privacy Policy</a>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="booksync-footer-bottom">
            <div className="booksync-footer-bottom-content">
              <div className="booksync-footer-location">
                <MapPin className="w-4 h-4" />
                <span>Serving all major cities in Malawi</span>
              </div>
              <div className="booksync-footer-copyright">
                <p>© 2024 Booksync. All rights reserved.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
