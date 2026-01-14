import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../../components/admin/AdminLayout';
import { toast } from 'react-toastify';
import './AdminDonations.css';

const AdminDonations = () => {
  const [stats, setStats] = useState(null);
  const [allDonations, setAllDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchDonationStats();
    fetchAllDonations();
  }, []);

  const fetchDonationStats = async () => {
    try {
      const response = await axios.get('/api/donations/stats');
      setStats(response.data.stats);
    } catch (error) {
      console.error('Failed to fetch donation stats:', error);
    }
  };

  const fetchAllDonations = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/donations');
      setAllDonations(response.data.donations || []);
    } catch (error) {
      console.error('Failed to fetch donations:', error);
      toast.error('Failed to load donations');
    } finally {
      setLoading(false);
    }
  };

  const filteredDonations = allDonations.filter(donation => {
    if (filter === 'all') return true;
    if (filter === 'completed') return donation.payment_status === 'Completed';
    if (filter === 'pending') return donation.payment_status === 'Pending';
    if (filter === 'anonymous') return donation.is_anonymous;
    return true;
  });

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

  const getTotalFilteredAmount = () => {
    return filteredDonations.reduce((sum, donation) => sum + parseFloat(donation.amount), 0);
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
          <p>View and manage all donations</p>
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

          <div className="summary-card filtered">
            <div className="summary-icon">🎯</div>
            <div className="summary-content">
              <h3>{formatCurrency(getTotalFilteredAmount())}</h3>
              <p>Filtered Amount</p>
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="filter-controls">
          <div className="filter-tabs">
            <button
              className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All Donations ({allDonations.length})
            </button>
            <button
              className={`filter-tab ${filter === 'completed' ? 'active' : ''}`}
              onClick={() => setFilter('completed')}
            >
              Completed
            </button>
            <button
              className={`filter-tab ${filter === 'pending' ? 'active' : ''}`}
              onClick={() => setFilter('pending')}
            >
              Pending
            </button>
            <button
              className={`filter-tab ${filter === 'anonymous' ? 'active' : ''}`}
              onClick={() => setFilter('anonymous')}
            >
              Anonymous
            </button>
          </div>
        </div>

        {/* Donations Table */}
        <div className="donations-section">
          <h3>All Donations ({filteredDonations.length})</h3>
          
          {filteredDonations.length === 0 ? (
            <div className="no-donations">
              <p>No donations found.</p>
            </div>
          ) : (
            <div className="donations-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Donor</th>
                    <th>Email</th>
                    <th>Amount</th>
                    <th>Type</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Message</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDonations.map(donation => (
                    <tr key={donation.id}>
                      <td>
                        {donation.is_anonymous ? (
                          <em>Anonymous</em>
                        ) : (
                          donation.donor_name
                        )}
                      </td>
                      <td>
                        {donation.is_anonymous ? 'N/A' : donation.donor_email}
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
                          <div className="message-tooltip" title={donation.message}>
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

        {/* Export Section */}
        <div className="export-section">
          <h3>Export Data</h3>
          <div className="export-actions">
            <button className="btn btn-outline">
              📥 Export as CSV
            </button>
            <button className="btn btn-outline">
              📊 Generate Report
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDonations;