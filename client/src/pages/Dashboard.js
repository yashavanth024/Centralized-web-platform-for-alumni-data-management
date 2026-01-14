import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import './Dashboard.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard = () => {
  const { user } = useAuth();
  const [userStats, setUserStats] = useState({});
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    if (user) {
      fetchUserStats();
      fetchRegisteredEvents();
      fetchApplications();
    }
  }, [user]);

  const fetchUserStats = async () => {
    try {
      const [eventsRes, jobsRes, mentorshipRes] = await Promise.all([
        axios.get('/api/events/user/registered'),
        axios.get('/api/jobs/user/applications'),
        axios.get('/api/mentorship/my-applications')
      ]);

      setUserStats({
        eventsCount: eventsRes.data.events.length,
        jobsApplied: jobsRes.data.applications?.length || 0,
        mentorshipApps: mentorshipRes.data.applications?.length || 0
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchRegisteredEvents = async () => {
    try {
      const response = await axios.get('/api/events/user/registered');
      setRegisteredEvents(response.data.events.slice(0, 5));
    } catch (error) {
      console.error('Failed to fetch events:', error);
    }
  };

  const fetchApplications = async () => {
    try {
      const [jobsRes, mentorshipRes] = await Promise.all([
        axios.get('/api/jobs/user/applications'),
        axios.get('/api/mentorship/my-applications')
      ]);

      setApplications([
        ...(jobsRes.data.applications || []).map(app => ({
          ...app,
          type: 'job',
          title: app.job_title
        })),
        ...(mentorshipRes.data.applications || []).map(app => ({
          ...app,
          type: 'mentorship',
          title: app.title
        }))
      ].slice(0, 5));
    } catch (error) {
      console.error('Failed to fetch applications:', error);
    }
  };

  const eventData = {
    labels: registeredEvents.map(event => 
      new Date(event.event_date).toLocaleDateString('en-US', { month: 'short' })
    ),
    datasets: [
      {
        label: 'Events Registered',
        data: registeredEvents.map((_, index) => index + 1),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
      }
    ]
  };

  const statsData = {
    labels: ['Events', 'Jobs Applied', 'Mentorship'],
    datasets: [
      {
        data: [userStats.eventsCount || 0, userStats.jobsApplied || 0, userStats.mentorshipApps || 0],
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)'
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1>Welcome back, {user?.first_name}!</h1>
          <p>Here's what's happening with your account</p>
        </div>

        {user?.is_admin && (
  <div style={{ marginBottom: '20px', textAlign: 'center' }}>
    <Link to="/admin/dashboard" className="btn btn-primary">
      🛠️ Go to Admin Panel
    </Link>
  </div>
)}



        <div className="stats-cards">
          <div className="stat-card">
            <div className="stat-icon">📅</div>
            <div className="stat-content">
              <h3>{userStats.eventsCount || 0}</h3>
              <p>Events Registered</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">💼</div>
            <div className="stat-content">
              <h3>{userStats.jobsApplied || 0}</h3>
              <p>Jobs Applied</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <h3>{userStats.mentorshipApps || 0}</h3>
              <p>Mentorship Applications</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">🌟</div>
            <div className="stat-content">
              <h3>{user?.is_verified ? 'Verified' : 'Pending'}</h3>
              <p>Account Status</p>
            </div>
          </div>
        </div>

        <div className="dashboard-grid">
          <div className="chart-section">
            <div className="card">
              <h3>Event Registration Trend</h3>
              <div className="chart-container">
                <Line data={eventData} options={{ responsive: true }} />
              </div>
            </div>
          </div>

          <div className="chart-section">
            <div className="card">
              <h3>Your Activities</h3>
              <div className="chart-container">
                <Doughnut data={statsData} options={{ responsive: true }} />
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-grid">
          <div className="recent-events">
            <div className="card">
              <h3>Upcoming Events</h3>
              {registeredEvents.length > 0 ? (
                <ul className="event-list">
                  {registeredEvents.map(event => (
                    <li key={event.id} className="event-item">
                      <div className="event-date">
                        {new Date(event.event_date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </div>
                      <div className="event-details">
                        <h4>{event.title}</h4>
                        <p className="event-location">{event.location}</p>
                        <span className={`status-badge status-${event.attendance_status.toLowerCase()}`}>
                          {event.attendance_status}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="no-data">No upcoming events registered</p>
              )}
            </div>
          </div>

          <div className="recent-applications">
            <div className="card">
              <h3>Recent Applications</h3>
              {applications.length > 0 ? (
                <ul className="application-list">
                  {applications.map(app => (
                    <li key={app.id} className="application-item">
                      <div className="application-type">
                        {app.type === 'job' ? '💼' : '👥'}
                      </div>
                      <div className="application-details">
                        <h4>{app.title}</h4>
                        <p>Applied: {new Date(app.applied_date || app.created_at).toLocaleDateString()}</p>
                        <span className={`status-badge status-${app.status.toLowerCase()}`}>
                          {app.status}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="no-data">No recent applications</p>
              )}
            </div>
          </div>
        </div>

        <div className="quick-actions">
          <div className="card">
            <h3>Quick Actions</h3>
            <div className="action-buttons">
              <button className="btn btn-primary">Update Profile</button>
              <button className="btn">Browse Events</button>
              <button className="btn">Find Mentors</button>
              <button className="btn">View Jobs</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;