import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './StudentDashboard.css';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({});
  const [mentorships, setMentorships] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  // Update the fetchDashboardData function
const fetchDashboardData = async () => {
  try {
    setLoading(true);
    
    // Fetch all data in parallel
    const [mentorshipsRes, eventsRes, mentorshipAppsRes, jobAppsRes, userEventsRes] = await Promise.all([
      axios.get('/api/mentorship'),
      axios.get('/api/events?upcoming=true'),
      axios.get('/api/mentorship/my-applications'),
      axios.get('/api/jobs/user/applications'),
      axios.get('/api/events/user/registered')
    ]);

    setMentorships(mentorshipsRes.data.mentorships?.slice(0, 3) || []);
    setEvents(eventsRes.data.events?.slice(0, 3) || []);
    
    // Calculate correct counts
    setStats({
      mentorshipApps: mentorshipAppsRes.data.applications?.length || 0,
      jobApps: jobAppsRes.data.applications?.length || 0,
      eventsRegistered: userEventsRes.data.events?.length || 0
    });
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error);
  } finally {
    setLoading(false);
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
    <div className="student-dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1>Welcome, {user?.first_name}! 👋</h1>
          <p className="dashboard-subtitle">Student Dashboard - Punjab University</p>
          <div className="student-badge">
            <span className="badge-icon">🎓</span>
            Student Account
            {!user?.is_verified && (
              <span className="verification-badge pending">Pending Verification</span>
            )}
          </div>
        </div>

        <div className="stats-cards">
          <div className="stat-card">
            <div className="stat-icon">📚</div>
            <div className="stat-content">
              <h3>{stats.mentorshipApps || 0}</h3>
              <p>Mentorship Applications</p>
              <Link to="/mentorship" className="stat-link">Browse Mentors →</Link>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📅</div>
            <div className="stat-content">
              <h3>{stats.eventsRegistered || 0}</h3>
              <p>Events Registered</p>
              <Link to="/events" className="stat-link">View Events →</Link>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">💼</div>
            <div className="stat-content">
              <h3>{stats.jobApps || 0}</h3>
              <p>Job Applications</p>
              <Link to="/jobs" className="stat-link">Browse Jobs →</Link>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <h3>500+</h3>
              <p>Alumni Network</p>
              <Link to="/alumni" className="stat-link">Connect →</Link>
            </div>
          </div>
        </div>

        <div className="dashboard-sections">
          {/* Available Mentorships */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2>Available Mentorships</h2>
              <Link to="/mentorship" className="btn btn-primary">View All</Link>
            </div>
            {mentorships.length > 0 ? (
              <div className="mentorships-grid">
                {mentorships.map(mentorship => (
                  <div key={mentorship.id} className="mentorship-card">
                    <div className="mentor-info">
                      <div className="mentor-avatar">
                        {mentorship.first_name?.[0]}{mentorship.last_name?.[0]}
                      </div>
                      <div>
                        <h4>{mentorship.first_name} {mentorship.last_name}</h4>
                        <p className="mentor-title">{mentorship.current_job_title}</p>
                        <p className="mentor-company">{mentorship.current_company}</p>
                      </div>
                    </div>
                    <h3>{mentorship.title}</h3>
                    <p className="mentorship-description">
                      {mentorship.description?.substring(0, 100)}...
                    </p>
                    <div className="mentorship-meta">
                      <span className="expertise-tag">{mentorship.expertise_area}</span>
                      <span className="spots-available">
                        {mentorship.max_mentees ? 
                          `${mentorship.max_mentees - (mentorship.current_mentees || 0)} spots left` : 
                          'Open for applications'}
                      </span>
                    </div>
                    <Link to={`/mentorship`} className="btn btn-outline btn-block">
                      Apply Now
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-data">No mentorships available at the moment.</p>
            )}
          </div>

          {/* Upcoming Events */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2>Upcoming Events</h2>
              <Link to="/events" className="btn btn-primary">View All</Link>
            </div>
            {events.length > 0 ? (
              <div className="events-list">
                {events.map(event => (
                  <div key={event.id} className="event-item">
                    <div className="event-date">
                      {new Date(event.event_date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </div>
                    <div className="event-details">
                      <h4>{event.title}</h4>
                      <p className="event-location">📍 {event.location}</p>
                      <p className="event-description">
                        {event.description?.substring(0, 80)}...
                      </p>
                    </div>
                    <div className="event-actions">
                      <Link to={`/events`} className="btn btn-sm">
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-data">No upcoming events.</p>
            )}
          </div>

          {/* Quick Actions */}
          <div className="dashboard-section">
            <h2>Quick Actions</h2>
            <div className="quick-actions-grid">
              <Link to="/alumni" className="action-card">
                <div className="action-icon">🔍</div>
                <h3>Find Alumni</h3>
                <p>Connect with experienced graduates</p>
              </Link>

              <Link to="/jobs" className="action-card">
                <div className="action-icon">💼</div>
                <h3>Browse Jobs</h3>
                <p>Find internships & job opportunities</p>
              </Link>

              <Link to="/mentorship" className="action-card">
                <div className="action-icon">🎯</div>
                <h3>Get Mentored</h3>
                <p>Find career guidance</p>
              </Link>

              <Link to="/profile" className="action-card">
                <div className="action-icon">👤</div>
                <h3>Update Profile</h3>
                <p>Complete your student profile</p>
              </Link>
            </div>
          </div>
        </div>

        {!user?.is_verified && (
          <div className="verification-notice">
            <div className="notice-icon">⚠️</div>
            <div className="notice-content">
              <h3>Account Verification Pending</h3>
              <p>Your account is under review. Once verified by admin, you'll be able to:</p>
              <ul>
                <li>Apply for mentorships</li>
                <li>Register for events</li>
                <li>Apply for jobs</li>
                <li>Make donations</li>
              </ul>
              <p className="notice-contact">
                Contact admin at <a href="mailto:admin@alumni.edu">admin@alumni.edu</a> for questions.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;