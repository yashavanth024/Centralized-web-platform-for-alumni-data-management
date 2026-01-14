import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './AlumniDashboard.css';

const AlumniDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({});
  const [myMentorships, setMyMentorships] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [mentorshipsRes, jobsRes] = await Promise.all([
        axios.get('/api/mentorship/my-mentorships'),
        axios.get('/api/jobs?postedBy=me')
      ]);

      setMyMentorships(mentorshipsRes.data.mentorships?.slice(0, 3) || []);
      
      setStats({
        activeMentorships: mentorshipsRes.data.mentorships?.filter(m => m.status === 'active').length || 0,
        totalApplications: mentorshipsRes.data.mentorships?.reduce((sum, m) => sum + (m.application_count || 0), 0) || 0,
        pendingApplications: mentorshipsRes.data.mentorships?.reduce((sum, m) => sum + (m.pending_count || 0), 0) || 0,
        jobsPosted: jobsRes.data.jobs?.length || 0
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMentorshipStatus = async (mentorshipId, status) => {
    try {
      await axios.put(`/api/mentorship/${mentorshipId}/status`, { status });
      fetchDashboardData();
    } catch (error) {
      console.error('Failed to update mentorship:', error);
    }
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="container">
          <div className="loading">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="alumni-dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1>Welcome back, {user?.first_name}! 👋</h1>
          <p className="dashboard-subtitle">Alumni Dashboard - Give Back to Students</p>
          <div className="alumni-badge">
            <span className="badge-icon">👨‍🎓</span>
            Alumni Account • Batch of {user?.graduation_year}
            {!user?.is_verified && (
              <span className="verification-badge pending">Pending Verification</span>
            )}
          </div>
        </div>

        <div className="stats-cards">
          <div className="stat-card">
            <div className="stat-icon">🎯</div>
            <div className="stat-content">
              <h3>{stats.activeMentorships || 0}</h3>
              <p>Active Mentorships</p>
              <Link to="/mentorship/create" className="stat-link">Create New →</Link>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📨</div>
            <div className="stat-content">
              <h3>{stats.totalApplications || 0}</h3>
              <p>Total Applications</p>
              <Link to="/mentorship/manage" className="stat-link">View All →</Link>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">⏳</div>
            <div className="stat-content">
              <h3>{stats.pendingApplications || 0}</h3>
              <p>Pending Reviews</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">💼</div>
            <div className="stat-content">
              <h3>{stats.jobsPosted || 0}</h3>
              <p>Jobs Posted</p>
              <Link to="/jobs/create" className="stat-link">Post Job →</Link>
            </div>
          </div>
        </div>

        <div className="dashboard-sections">
          {/* My Mentorships */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2>My Mentorships</h2>
              <Link to="/mentorship/create" className="btn btn-primary">Create New</Link>
            </div>
            {myMentorships.length > 0 ? (
              <div className="mentorships-list">
                {myMentorships.map(mentorship => (
                  <div key={mentorship.id} className="mentorship-card">
                    <div className="mentorship-header">
                      <h3>{mentorship.title}</h3>
                      <span className={`status-badge ${mentorship.status}`}>
                        {mentorship.status}
                      </span>
                    </div>
                    <p className="mentorship-description">
                      {mentorship.description?.substring(0, 120)}...
                    </p>
                    <div className="mentorship-stats">
                      <div className="stat">
                        <span className="stat-label">Applications:</span>
                        <span className="stat-value">{mentorship.application_count || 0}</span>
                      </div>
                      <div className="stat">
                        <span className="stat-label">Pending:</span>
                        <span className="stat-value">{mentorship.pending_count || 0}</span>
                      </div>
                      <div className="stat">
                        <span className="stat-label">Expertise:</span>
                        <span className="stat-value">{mentorship.expertise_area}</span>
                      </div>
                    </div>
                    <div className="mentorship-actions">
<Link
  to={`/mentorship/${mentorship.id}/applications`}
  className="btn btn-sm"
>
  View Applications
</Link>

                      <button
                        onClick={() => handleMentorshipStatus(
                          mentorship.id, 
                          mentorship.status === 'active' ? 'inactive' : 'active'
                        )}
                        className={`btn btn-sm ${
                          mentorship.status === 'active' ? 'btn-warning' : 'btn-success'
                        }`}
                      >
                        {mentorship.status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-mentorships">
                <div className="empty-state">
                  <div className="empty-icon">🎯</div>
                  <h3>No Mentorships Created Yet</h3>
                  <p>Share your experience and guide current students by creating a mentorship opportunity.</p>
                  <Link to="/mentorship/create" className="btn btn-primary">
                    Create Your First Mentorship
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="dashboard-section">
            <h2>Alumni Actions</h2>
            <div className="quick-actions-grid">
              <Link to="/mentorship/create" className="action-card">
                <div className="action-icon">🎯</div>
                <h3>Create Mentorship</h3>
                <p>Guide students with your experience</p>
              </Link>

              <Link to="/jobs/create" className="action-card">
                <div className="action-icon">💼</div>
                <h3>Post Job</h3>
                <p>Share job opportunities</p>
              </Link>

              <Link to="/alumni" className="action-card">
                <div className="action-icon">👥</div>
                <h3>Network</h3>
                <p>Connect with fellow alumni</p>
              </Link>

              <Link to="/donations" className="action-card">
                <div className="action-icon">💰</div>
                <h3>Donate</h3>
                <p>Support university initiatives</p>
              </Link>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="dashboard-section">
            <h2>How You're Making a Difference</h2>
            <div className="impact-list">
              <div className="impact-item">
                <div className="impact-icon">🎓</div>
                <div className="impact-content">
                  <h4>Mentorship Impact</h4>
                  <p>Each mentorship can guide multiple students in their career paths.</p>
                </div>
              </div>
              <div className="impact-item">
                <div className="impact-icon">💼</div>
                <div className="impact-content">
                  <h4>Career Opportunities</h4>
                  <p>Job postings help students find internships and full-time roles.</p>
                </div>
              </div>
              <div className="impact-item">
                <div className="impact-icon">🏫</div>
                <div className="impact-content">
                  <h4>University Support</h4>
                  <p>Your donations help fund scholarships and infrastructure.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {!user?.is_verified && (
          <div className="verification-notice">
            <div className="notice-icon">⚠️</div>
            <div className="notice-content">
              <h3>Account Verification Pending</h3>
              <p>Your alumni account is under review. Once verified by admin, you'll be able to:</p>
              <ul>
                <li>Create mentorship opportunities</li>
                <li>Post job opportunities</li>
                <li>Access all alumni features</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlumniDashboard;