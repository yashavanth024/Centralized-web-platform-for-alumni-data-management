import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3> Alumni Connect</h3>
            <p>A platform to bring alumni together</p>
            <p>Connecting alumni for a stronger educational community</p>
          </div>
          
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul className="footer-links">
              <li><a href="/">Home</a></li>
              <li><a href="/alumni">Alumni Directory</a></li>
              <li><a href="/events">Events</a></li>
              <li><a href="/mentorship">Mentorship</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Contact</h4>
            <p>Email: support@alumniconnect.in</p>
            <p>Phone: +91  93805 79172</p>
            
          </div>
        </div>
        
        <div className="footer-bottom">
  <p>&copy; {new Date().getFullYear()} Alumni Connect. All rights reserved.</p>
  <p className="footer-disclaimer">
    Alumni Connect is a platform designed to foster meaningful alumni engagement and networking.
  </p>
</div>

      </div>
    </footer>
  );
};

export default Footer;