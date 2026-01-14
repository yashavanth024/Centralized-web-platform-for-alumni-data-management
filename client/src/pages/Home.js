import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Home.css';

const Home = () => {
  const [stats, setStats] = useState({});
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [recentNews, setRecentNews] = useState([]);

  useEffect(() => {
    fetchStats();
    fetchUpcomingEvents();
    fetchRecentNews();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/users/stats/summary');
      setStats(response.data.stats);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchUpcomingEvents = async () => {
    try {
      const response = await axios.get('/api/events?upcoming=true');
      setUpcomingEvents(response.data.events.slice(0, 3));
    } catch (error) {
      console.error('Failed to fetch events:', error);
    }
  };

  const fetchRecentNews = async () => {
    try {
      const response = await axios.get('/api/news');
      setRecentNews(response.data.news.slice(0, 3));
    } catch (error) {
      console.error('Failed to fetch news:', error);
    }
  };

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1>Welcome to Alumni Connect</h1>
            <p className="hero-subtitle">
              Connecting alumni, fostering growth, and building lifelong relationships
            </p>
            <div className="hero-buttons">
              <Link to="/register" className="btn btn-primary btn-large">
                Join Our Community
              </Link>
              <Link to="/alumni" className="btn btn-secondary btn-large">
                Find Alumni
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <h2 className="section-title">Our Community in Numbers</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">{stats.total_alumni || 0}+</div>
              <div className="stat-label">Alumni Members</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{upcomingEvents.length}+</div>
              <div className="stat-label">Upcoming Events</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">50+</div>
              <div className="stat-label">Mentors Available</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">100+</div>
              <div className="stat-label">Success Stories</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">What We Offer</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🤝</div>
              <h3>Networking</h3>
              <p>Connect with alumni from various batches and industries</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>Mentorship</h3>
              <p>Get guidance from experienced professionals</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💼</div>
              <h3>Career Opportunities</h3>
              <p>Find jobs and internships through alumni network</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎓</div>
              <h3>Events</h3>
              <p>Participate in reunions, workshops, and seminars</p>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="events-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Upcoming Events</h2>
            <Link to="/events" className="btn">View All Events</Link>
          </div>
          <div className="events-grid">
            {upcomingEvents.map(event => (
              <div key={event.id} className="event-card">
                <div className="event-date">
                  {new Date(event.event_date).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </div>
                <h3>{event.title}</h3>
                <p className="event-location">📍 {event.location}</p>
                <p className="event-description">
                  {event.description.substring(0, 100)}...
                </p>
                <Link to={`/events/${event.id}`} className="btn btn-outline">
                  Learn More
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent News */}
      <section className="news-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Latest News</h2>
            <Link to="/news" className="btn">View All News</Link>
          </div>
          <div className="news-grid">
            {recentNews.map(news => (
              <div key={news.id} className="news-card">
                <h3>{news.title}</h3>
                <p className="news-date">
                  {new Date(news.created_at).toLocaleDateString()}
                </p>
                <p className="news-content">
                  {news.content.substring(0, 150)}...
                </p>
                <Link to={`/news/${news.id}`} className="read-more">
                  Read More →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Reconnect?</h2>
            <p>Join thousands of alumni who are already part of our growing network</p>
            <div className="cta-buttons">
              <Link to="/register" className="btn btn-primary btn-large">
                Register Now
              </Link>
              <Link to="/login" className="btn btn-outline btn-large">
                Login
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;