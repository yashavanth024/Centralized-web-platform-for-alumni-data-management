import React from 'react';
import { useAuth } from '../context/AuthContext';
import './VerificationPending.css';

const VerificationPending = () => {
  const { user } = useAuth();

  return (
    <div className="verification-pending">
      <div className="container">
        <div className="verification-card">
          <div className="verification-icon">⏳</div>
          <h1>Account Pending Verification</h1>
          <p>
            Thank you for registering, <strong>{user?.first_name}</strong>!
          </p>
          <div className="verification-info">
            <h3>What happens next?</h3>
            <ul>
              <li>Your account is under review by our admin team</li>
              <li>This usually takes 24-48 hours</li>
              <li>You'll receive an email once verified</li>
              <li>After verification, you can access all alumni features</li>
            </ul>
          </div>
          
          <div className="user-details">
            <h3>Your Registration Details</h3>
            <div className="details-grid">
              <div className="detail-item">
                <span className="detail-label">Name:</span>
                <span className="detail-value">{user?.first_name} {user?.last_name}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Email:</span>
                <span className="detail-value">{user?.email}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">USN:</span>
                <span className="detail-value">{user?.usn_number}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Status:</span>
                <span className="status-badge pending">Pending Verification</span>
              </div>
            </div>
          </div>

          <div className="actions">
            <button 
              onClick={() => window.location.href = '/'}
              className="btn btn-primary"
            >
              Go to Homepage
            </button>
            <button 
              onClick={() => {
                localStorage.removeItem('token');
                window.location.href = '/login';
              }}
              className="btn btn-outline"
            >
              Logout
            </button>
          </div>

          <div className="contact-info">
            <p>
              <strong>Need help?</strong> Contact admin at: 
              <a href="mailto:admin@alumni.edu"> admin@alumni.edu</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationPending;