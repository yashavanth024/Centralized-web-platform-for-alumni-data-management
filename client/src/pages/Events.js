import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import './Events.css';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('upcoming');
  const { user } = useAuth();

  useEffect(() => {
    fetchEvents();
  }, [filter]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params = filter === 'upcoming' ? '?upcoming=true' : '';
      const response = await axios.get(`/api/events${params}`);
      setEvents(response.data.events || []);
    } catch (error) {
      console.error('Failed to fetch events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (eventId) => {
    if (!user) {
      toast.error('Please login to register for events');
      return;
    }

    try {
      await axios.post(`/api/events/${eventId}/register`);
      toast.success('Successfully registered for the event!');
      fetchEvents(); // Refresh events list
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div className="events-page">
      <div className="container">
        <div className="page-header">
          <h1>Events & Gatherings</h1>
          <p>Connect, learn, and grow with alumni community events</p>
        </div>

        <div className="events-controls">
          <div className="filter-tabs">
            <button
              className={`filter-tab ${filter === 'upcoming' ? 'active' : ''}`}
              onClick={() => setFilter('upcoming')}
            >
              Upcoming Events
            </button>
            <button
              className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All Events
            </button>
          </div>
          
          {user && (
            <a href="/dashboard" className="btn btn-primary">
              My Registrations
            </a>
          )}
        </div>

        {loading ? (
          <div className="loading">Loading events...</div>
        ) : events.length === 0 ? (
          <div className="no-events">
            <p>No events found. Check back soon for upcoming events!</p>
          </div>
        ) : (
          <div className="events-grid">
            {events.map(event => (
              <div key={event.id} className="event-card">
                <div className="event-header">
                  <span className={`event-type ${event.event_type?.toLowerCase()}`}>
                    {event.event_type}
                  </span>
                  {event.max_attendees && (
                    <span className="event-capacity">
                      {event.current_attendees || 0}/{event.max_attendees} spots
                    </span>
                  )}
                </div>
                
                <div className="event-date">
                  <div className="date-day">{new Date(event.event_date).getDate()}</div>
                  <div className="date-month">
                    {new Date(event.event_date).toLocaleDateString('en-US', { month: 'short' })}
                  </div>
                </div>
                
                <div className="event-content">
                  <h3>{event.title}</h3>
                  <p className="event-description">{event.description}</p>
                  
                  <div className="event-details">
                    <div className="detail-item">
                      <span className="detail-icon">📅</span>
                      <span>{formatDate(event.event_date)}</span>
                    </div>
                    {event.event_time && (
                      <div className="detail-item">
                        <span className="detail-icon">⏰</span>
                        <span>{formatTime(event.event_time)}</span>
                      </div>
                    )}
                    <div className="detail-item">
                      <span className="detail-icon">📍</span>
                      <span>{event.location}</span>
                    </div>
                    {event.organizer_id && (
                      <div className="detail-item">
                        <span className="detail-icon">👤</span>
                        <span>Organized by {event.first_name} {event.last_name}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="event-actions">
                    {new Date(event.event_date) >= new Date() ? (
                      user ? (
                        <button
                          onClick={() => handleRegister(event.id)}
                          className="btn btn-primary"
                          disabled={event.max_attendees && event.current_attendees >= event.max_attendees}
                        >
                          {event.max_attendees && event.current_attendees >= event.max_attendees
                            ? 'Event Full'
                            : 'Register Now'}
                        </button>
                      ) : (
                        <button className="btn btn-primary" disabled>
                          Login to Register
                        </button>
                      )
                    ) : (
                      <span className="event-ended">Event Ended</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;