import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../../components/admin/AdminLayout';
import './AdminDonations.css';

const AdminDonations = () => {
  const [stats, setStats] = useState(null);
  const [recentDonations, setRecentDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDonationStats();
  }, []);

  const fetchDonationStats = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/donations/stats');
      setStats(response.data.stats);
      setRecentDonations(response.data.stats?.recent_donations || []);
    } catch (error) {
      console.error('Failed to fetch donation stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="loading">Loading donation statistics...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-donations">
        <div className="page-header">
          <h2>Donation Management</h2>
          <p>View and manage donation statistics</p>
        </div>

        {/* Donation Summary */}
        <div className="donation-summary">
          <div className="summary-card total">
            <div className="summary-icon">💰</div>
            <div className="summary-content">
              <h3>{formatCurrency(stats?.total_amount || 0)}</h3>
              <p>Total Donations</p>
            </div>
          </div>

          <div className="summary-card count">
            <div className="summary-icon">📊</div>
            <div className="summary-content">
              <h3>{stats?.donation_count || 0}</h3>
              <p>Total Donations</p>
            </div>
          </div>

          <div className="summary-card average">
            <div className="summary-icon">📈</div>
            <div className="summary-content">
              <h3>
                {stats?.donation_count > 0 
                  ? formatCurrency((stats?.total_amount || 0) / stats.donation_count)
                  : formatCurrency(0)
                }
              </h3>
              <p>Average Donation</p>
            </div>
          </div>
        </div>

        {/* Recent Donations */}
        <div className="recent-donations">
          <h3>Recent Donations</h3>
          
          {recentDonations.length === 0 ? (
            <div className="no-donations">
              <p>No donations received yet.</p>
            </div>
          ) : (
            <div className="donations-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Donor</th>
                    <th>Amount</th>
                    <th>Type</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Message</th>
                  </tr>
                </thead>
                <tbody>
                  {recentDonations.map(donation => (
                    <tr key={donation.id}>
                      <td>
                        {donation.is_anonymous ? (
                          <em>Anonymous</em>
                        ) : (
                          donation.donor_name
                        )}
                      </td>
                      <td>
                        <strong>{formatCurrency(donation.amount)}</strong>
                      </td>
                      <td>{donation.donation_type || 'General'}</td>
                      <td>{formatDate(donation.donation_date)}</td>
                      <td>
                        <span className={`status-badge ${donation.payment_status?.toLowerCase()}`}>
                          {donation.payment_status}
                        </span>
                      </td>
                      <td className="donation-message">
                        {donation.message ? (
                          <div title={donation.message}>
                            {donation.message.substring(0, 50)}
                            {donation.message.length > 50 ? '...' : ''}
                          </div>
                        ) : (
                          <em>No message</em>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Donation Insights */}
        <div className="insights-section">
          <h3>Donation Insights</h3>
          <div className="insights-cards">
            <div className="insight-card">
              <div className="insight-icon">🎯</div>
              <div className="insight-content">
                <h4>Top Donation Type</h4>
                <p>General Donations</p>
                <small>Most common donation category</small>
              </div>
            </div>

            <div className="insight-card">
              <div className="insight-icon">🤫</div>
              <div className="insight-content">
                <h4>Anonymous Donations</h4>
                <p>
                  {recentDonations.filter(d => d.is_anonymous).length} of {recentDonations.length}
                </p>
                <small>Prefer to remain anonymous</small>
              </div>
            </div>

            <div className="insight-card">
              <div className="insight-icon">📅</div>
              <div className="insight-content">
                <h4>Recent Activity</h4>
                <p>
                  {recentDonations.length > 0 
                    ? formatDate(recentDonations[0].donation_date)
                    : 'No activity'
                  }
                </p>
                <small>Latest donation date</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDonations;