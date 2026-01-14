import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../../components/admin/AdminLayout';
import { toast } from 'react-toastify';
import './AdminEvents.css';

const AdminEvents = () => {
  const [events, setEvents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRegistrations, setShowRegistrations] = useState(null);
  const [eventRegistrations, setEventRegistrations] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: '',
    event_time: '',
    location: '',
    event_type: 'Other',
    max_attendees: '',
    registration_deadline: '',
    image_url: '',
    status: 'active'
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/events');
      setEvents(response.data.events || []);
    } catch (error) {
      console.error('Failed to fetch events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  // In handleViewRegistrations function, fix the API endpoint
const fetchEventRegistrations = async (eventId) => {
  try {
    const response = await axios.get(`/api/admin/events/${eventId}/registrations`);
    setEventRegistrations(response.data.registrations || []);
  } catch (error) {
    console.error('Registration fetch error:', error);
    toast.error(error.response?.data?.message || 'Failed to load registrations');
  }
};

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleEdit = (event) => {
    setEditingEvent(event.id);
    setFormData({
      title: event.title,
      description: event.description,
      event_date: event.event_date.split('T')[0],
      event_time: event.event_time || '',
      location: event.location,
      event_type: event.event_type,
      max_attendees: event.max_attendees || '',
      registration_deadline: event.registration_deadline?.split('T')[0] || '',
      image_url: event.image_url || '',
      status: event.status || 'active'
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingEvent) {
        await axios.put(`/api/admin/events/${editingEvent}`, formData);
        toast.success('Event updated successfully!');
      } else {
        await axios.post('/api/events', formData);
        toast.success('Event created successfully!');
      }
      
      setShowForm(false);
      setEditingEvent(null);
      setFormData({
        title: '',
        description: '',
        event_date: '',
        event_time: '',
        location: '',
        event_type: 'Other',
        max_attendees: '',
        registration_deadline: '',
        image_url: '',
        status: 'active'
      });
      fetchEvents();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save event');
    }
  };

  const handleDelete = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      try {
        await axios.delete(`/api/admin/events/${eventId}`);
        toast.success('Event deleted successfully!');
        fetchEvents();
      } catch (error) {
        toast.error('Failed to delete event');
      }
    }
  };

  const handleViewRegistrations = (eventId) => {
    setShowRegistrations(eventId);
    fetchEventRegistrations(eventId);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <AdminLayout>
      <div className="admin-events">
        <div className="page-header">
          <div>
            <h2>Event Management</h2>
            <p>Create, edit, and manage alumni events</p>
          </div>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditingEvent(null);
              setFormData({
                title: '',
                description: '',
                event_date: '',
                event_time: '',
                location: '',
                event_type: 'Other',
                max_attendees: '',
                registration_deadline: '',
                image_url: '',
                status: 'active'
              });
            }}
            className="btn btn-primary"
          >
            {showForm ? 'Cancel' : '➕ Create Event'}
          </button>
        </div>

        {/* Create/Edit Event Form */}
        {showForm && (
          <div className="create-form">
            <h3>{editingEvent ? 'Edit Event' : 'Create New Event'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Event Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="form-control"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Event Date *</label>
                  <input
                    type="date"
                    name="event_date"
                    value={formData.event_date}
                    onChange={handleInputChange}
                    className="form-control"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Event Time</label>
                  <input
                    type="time"
                    name="event_time"
                    value={formData.event_time}
                    onChange={handleInputChange}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label>Location *</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="form-control"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Event Type</label>
                  <select
                    name="event_type"
                    value={formData.event_type}
                    onChange={handleInputChange}
                    className="form-control"
                  >
                    <option value="Networking">Networking</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Reunion">Reunion</option>
                    <option value="Seminar">Seminar</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Max Attendees</label>
                  <input
                    type="number"
                    name="max_attendees"
                    value={formData.max_attendees}
                    onChange={handleInputChange}
                    className="form-control"
                    min="1"
                  />
                </div>

                <div className="form-group">
                  <label>Registration Deadline</label>
                  <input
                    type="date"
                    name="registration_deadline"
                    value={formData.registration_deadline}
                    onChange={handleInputChange}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label>Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="form-control"
                  >
                    <option value="active">Active</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Image URL (Optional)</label>
                  <input
                    type="url"
                    name="image_url"
                    value={formData.image_url}
                    onChange={handleInputChange}
                    className="form-control"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="form-control"
                  rows="4"
                  required
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  {editingEvent ? 'Update Event' : 'Create Event'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingEvent(null);
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Events List */}
        <div className="events-list">
          <h3>All Events ({events.length})</h3>
          
          {loading ? (
            <div className="loading">Loading events...</div>
          ) : events.length === 0 ? (
            <div className="no-events">
              <p>No events created yet.</p>
            </div>
          ) : (
            <div className="events-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Event</th>
                    <th>Date</th>
                    <th>Location</th>
                    <th>Type</th>
                    <th>Attendees</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map(event => (
                    <tr key={event.id}>
                      <td>
                        <div className="event-info">
                          <h4>{event.title}</h4>
                          <p className="event-description">
                            {event.description?.substring(0, 80)}...
                          </p>
                        </div>
                      </td>
                      <td>{formatDate(event.event_date)}</td>
                      <td>{event.location}</td>
                      <td>
                        <span className={`event-type ${event.event_type?.toLowerCase()}`}>
                          {event.event_type}
                        </span>
                      </td>
                      <td>
                        {event.current_attendees || 0}
                        {event.max_attendees ? ` / ${event.max_attendees}` : ''}
                      </td>
                      <td>
                        <span className={`status-badge ${event.status}`}>
                          {event.status}
                        </span>
                      </td>
                      <td>
                        <div className="event-actions">
                          <button
                            onClick={() => handleEdit(event)}
                            className="btn btn-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(event.id)}
                            className="btn btn-sm btn-danger"
                          >
                            Delete
                          </button>
                          <button
                            onClick={() => handleViewRegistrations(event.id)}
                            className="btn btn-sm btn-outline"
                          >
                            View Registrations
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

        {/* Registrations Modal */}
        {showRegistrations && (
          <div className="modal-overlay">
            <div className="modal large">
              <div className="modal-header">
                <h3>Event Registrations</h3>
                <button 
                  onClick={() => setShowRegistrations(null)}
                  className="modal-close"
                >
                  ×
                </button>
              </div>
              <div className="modal-body">
                <div className="registrations-list">
                  {eventRegistrations.length === 0 ? (
                    <p className="no-registrations">No registrations yet.</p>
                  ) : (
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Graduation</th>
                          <th>Department</th>
                          <th>Registered On</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {eventRegistrations.map(reg => (
                          <tr key={reg.id}>
                            <td>
                              {reg.first_name} {reg.last_name}
                            </td>
                            <td>{reg.email}</td>
                            <td>{reg.graduation_year || 'N/A'}</td>
                            <td>{reg.department || 'N/A'}</td>
                            <td>
                              {new Date(reg.registration_date).toLocaleDateString()}
                            </td>
                            <td>
                              <span className={`status-badge ${reg.attendance_status?.toLowerCase()}`}>
                                {reg.attendance_status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button
                  onClick={() => setShowRegistrations(null)}
                  className="btn btn-primary"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminEvents;