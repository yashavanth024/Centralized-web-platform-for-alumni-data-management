import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../../components/admin/AdminLayout';
import { toast } from 'react-toastify';
import './AdminUsers.css';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(null);

  useEffect(() => {
    fetchUsers();
    fetchPendingUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/users');
      setUsers(response.data.users || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const fetchPendingUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/users/pending');
      setPendingUsers(response.data.users || []);
    } catch (error) {
      console.error('Failed to fetch pending users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyUser = async (userId) => {
    try {
      await axios.put(`/api/admin/users/${userId}/verify`);
      toast.success('User verified successfully!');
      fetchPendingUsers();
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to verify user');
    }
  };

  const handleRejectUser = async (userId) => {
    if (!rejectReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    try {
      const response = await axios.delete(`/api/admin/users/${userId}`, {
        data: { reason: rejectReason }
      });

      toast.success(`User rejected. Email sent to ${response.data.email}`);
      setShowRejectModal(null);
      setRejectReason('');
      fetchPendingUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject user');
    }
  };

  // ✅ DELETE USER HANDLER
  const handleDeleteUser = async (userId, userEmail) => {
    if (
      !window.confirm(
        `Are you sure you want to permanently delete user ${userEmail}? This action cannot be undone.`
      )
    ) {
      return;
    }

    const reason = prompt('Please provide a reason for deletion:');
    if (!reason) {
      toast.error('Please provide a reason for deletion');
      return;
    }

    try {
      await axios.delete(`/api/admin/users/${userId}/permanent`, {
        data: { reason }
      });

      toast.success(`User ${userEmail} deleted successfully`);
      fetchUsers();
      fetchPendingUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleViewIDCard = (url) => {
  if (!url) {
    toast.error('No ID card uploaded');
    return;
  }

  const backendURL = 'http://localhost:5000'; // change in prod
  window.open(`${backendURL}${url}`, '_blank', 'noopener,noreferrer');
};



  return (
    <AdminLayout>
      <div className="admin-users">
        <div className="page-header">
          <h2>User Management</h2>
          <p>Manage alumni accounts and verifications</p>
        </div>

        <div className="user-tabs">
          <button
            className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            ⏳ Pending Verification ({pendingUsers.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            ✅ All Users ({users.length})
          </button>
        </div>

        {activeTab === 'pending' ? (
  <div className="pending-users-section">
    {loading ? (
      <p>Loading pending users...</p>
    ) : pendingUsers.length === 0 ? (
      <p className="no-data">No users pending verification</p>
    ) : (
      <div className="users-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>USN</th>
              <th>Role</th>
              <th>Department</th>
              <th>ID Card</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pendingUsers.map(user => (
              <tr key={user.id}>
                <td>
                  <strong>
                    {user.first_name} {user.last_name}
                  </strong>
                </td>
                <td>{user.email}</td>
                <td>{user.usn_number}</td>
                <td>
                  <span className="type-badge user">User</span>
                </td>
                <td>{user.department || 'N/A'}</td>
                <td>
                  <button
                    onClick={() => handleViewIDCard(user.id_card_url)}
                    className="btn btn-sm"
                  >
                    View ID
                  </button>
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      onClick={() => handleVerifyUser(user.id)}
                      className="btn btn-sm btn-success"
                    >
                      Verify
                    </button>

                    <button
                      onClick={() => setShowRejectModal(user.id)}
                      className="btn btn-sm btn-danger"
                    >
                      Reject
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
) : (

          <div className="all-users-section">
            <div className="controls">
              <input
                type="text"
                placeholder="Search users..."
                className="search-input"
              />
              <select className="filter-select">
                <option value="all">All Users</option>
                <option value="verified">Verified Only</option>
                <option value="unverified">Unverified Only</option>
                <option value="admins">Admins Only</option>
              </select>
            </div>

            <div className="users-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>USN</th>
                    <th>Graduation</th>
                    <th>Department</th>
                    <th>Status</th>
                    <th>Type</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id}>
                      <td>
                        <div className="user-info">
                          <div className="user-avatar">
                            {user.first_name?.[0]}
                            {user.last_name?.[0]}
                          </div>
                          <div>
                            <strong>
                              {user.first_name} {user.last_name}
                            </strong>
                          </div>
                        </div>
                      </td>
                      <td>{user.email}</td>
                      <td>{user.usn_number || 'N/A'}</td>
                      <td>{user.graduation_year || 'N/A'}</td>
                      <td>{user.department || 'N/A'}</td>
                      <td>
                        <span
                          className={`status-badge ${
                            user.is_verified ? 'verified' : 'pending'
                          }`}
                        >
                          {user.is_verified ? 'Verified' : 'Pending'}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`type-badge ${
                            user.is_admin ? 'admin' : 'user'
                          }`}
                        >
                          {user.is_admin ? 'Admin' : 'Alumni'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button className="btn btn-sm">View</button>

                          {!user.is_admin && !user.is_verified && (
                            <button
                              onClick={() => handleVerifyUser(user.id)}
                              className="btn btn-sm btn-success"
                            >
                              Verify
                            </button>
                          )}

                          {/* ✅ DELETE BUTTON */}
                          {!user.is_admin && (
                            <button
                              onClick={() =>
                                handleDeleteUser(user.id, user.email)
                              }
                              className="btn btn-sm btn-danger"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Reject Modal unchanged */}
        {showRejectModal && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h3>Reject User Registration</h3>
                <button
                  onClick={() => setShowRejectModal(null)}
                  className="modal-close"
                >
                  ×
                </button>
              </div>
              <div className="modal-body">
                <p>Please provide a reason for rejecting this user:</p>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g., Invalid ID card, Information mismatch, etc."
                  rows="4"
                  className="form-control"
                />
                <small>The user will receive this reason via email.</small>
              </div>
              <div className="modal-footer">
                <button
                  onClick={() => setShowRejectModal(null)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRejectUser(showRejectModal)}
                  className="btn btn-danger"
                >
                  Reject User
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
