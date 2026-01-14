import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import './Donations.css';

const Donations = () => {
  const [formData, setFormData] = useState({
    amount: '',
    donation_type: 'General',
    message: '',
    is_anonymous: false
  });
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const donationTypes = [
    'General',
    'Scholarship Fund',
    'Infrastructure',
    'Research',
    'Student Support',
    'Event Sponsorship'
  ];

  const presetAmounts = [500, 1000, 2000, 5000, 10000];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handlePresetAmount = (amount) => {
    setFormData({
      ...formData,
      amount: amount.toString()
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please login to make a donation');
      return;
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error('Please enter a valid donation amount');
      return;
    }

    try {
      setLoading(true);
      await axios.post('/api/donations', formData);
      
      toast.success('Thank you for your generous donation!');
      setFormData({
        amount: '',
        donation_type: 'General',
        message: '',
        is_anonymous: false
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Donation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="donations-page">
      <div className="container">
        <div className="page-header">
          <h1>Support Your Alma Mater</h1>
          <p>Give back to the institution that shaped your journey</p>
        </div>

        <div className="donation-content">
          <div className="donation-info">
            <div className="info-card">
              <h3>Why Donate?</h3>
              <ul>
                <li>Support scholarships for deserving students</li>
                <li>Fund infrastructure development</li>
                <li>Enable cutting-edge research</li>
                <li>Create better learning facilities</li>
                <li>Support student welfare programs</li>
              </ul>
            </div>

            <div className="impact-card">
              <h3>Your Impact</h3>
              <div className="impact-items">
                <div className="impact-item">
                  <span className="impact-icon">🎓</span>
                  <div>
                    <h4>Scholarships</h4>
                    <p>Help students pursue education</p>
                  </div>
                </div>
                <div className="impact-item">
                  <span className="impact-icon">🏫</span>
                  <div>
                    <h4>Infrastructure</h4>
                    <p>Build better facilities</p>
                  </div>
                </div>
                <div className="impact-item">
                  <span className="impact-icon">🔬</span>
                  <div>
                    <h4>Research</h4>
                    <p>Support innovation</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="donation-form-section">
            <div className="form-card">
              <h3>Make a Donation</h3>
              
              {!user ? (
                <div className="login-prompt">
                  <p>Please login to make a donation</p>
                  <a href="/login" className="btn btn-primary">
                    Login Now
                  </a>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label>Donation Amount (INR) *</label>
                    <div className="amount-presets">
                      {presetAmounts.map(amount => (
                        <button
                          key={amount}
                          type="button"
                          onClick={() => handlePresetAmount(amount)}
                          className={`amount-preset ${
                            formData.amount === amount.toString() ? 'active' : ''
                          }`}
                        >
                          ₹{amount.toLocaleString()}
                        </button>
                      ))}
                    </div>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleChange}
                      placeholder="Enter custom amount"
                      className="form-control"
                      min="1"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Donation Type</label>
                    <select
                      name="donation_type"
                      value={formData.donation_type}
                      onChange={handleChange}
                      className="form-control"
                    >
                      {donationTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Message (Optional)</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Add a personal message with your donation"
                      rows="3"
                      className="form-control"
                    />
                  </div>

                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="is_anonymous"
                        checked={formData.is_anonymous}
                        onChange={handleChange}
                      />
                      <span>Make this donation anonymous</span>
                    </label>
                  </div>

                  <div className="donation-summary">
                    <div className="summary-item">
                      <span>Donation Amount:</span>
                      <span>₹{formData.amount ? parseFloat(formData.amount).toLocaleString() : '0'}</span>
                    </div>
                    <div className="summary-total">
                      <span>Total Amount:</span>
                      <span>₹{formData.amount ? parseFloat(formData.amount).toLocaleString() : '0'}</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary btn-block btn-donate"
                    disabled={loading || !formData.amount}
                  >
                    {loading ? 'Processing...' : `Donate ₹${formData.amount ? parseFloat(formData.amount).toLocaleString() : '0'}`}
                  </button>

                  <p className="donation-note">
                    Your donation is secure and tax-deductible as per Indian laws.
                    You will receive a receipt for your records.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Donations;