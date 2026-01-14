import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import './Profile.css';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    graduation_year: '',
    degree: '',
    department: '',
    current_job_title: '',
    current_company: '',
    location: '',
    contact_number: '',
    linkedin_url: ''
  });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        graduation_year: user.graduation_year || '',
        degree: user.degree || '',
        department: user.department || '',
        current_job_title: user.current_job_title || '',
        current_company: user.current_company || '',
        location: user.location || '',
        contact_number: user.contact_number || '',
        linkedin_url: user.linkedin_url || ''
      });
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      await axios.get('/api/auth/me');
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const result = await updateProfile(formData);
      if (result.success) {
        toast.success('Profile updated successfully!');
      } else {
        toast.error(result.message || 'Update failed');
      }
    } catch (error) {
      toast.error('An error occurred while updating profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="container">
          <div className="loading">Loading profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="container">
        <div className="page-header">
          <h1>My Profile</h1>
          <p>Manage your alumni profile information</p>
        </div>

        <div className="profile-content">
          <div className="profile-sidebar">
            <div className="profile-card">
              <div className="profile-avatar">
                {user?.first_name?.[0]}{user?.last_name?.[0]}
              </div>
              <div className="profile-info">
                <h3>{user?.first_name} {user?.last_name}</h3>
                <p className="profile-email">{user?.email}</p>
                <div className="profile-status">
                  <span className={`status-badge ${user?.is_verified ? 'verified' : 'pending'}`}>
                    {user?.is_verified ? '✓ Verified' : 'Pending Verification'}
                  </span>
                </div>
              </div>
            </div>

            <div className="stats-card">
              <h4>Account Stats</h4>
              <div className="stats-grid">
                <div className="stat-item">
                  <div className="stat-number">0</div>
                  <div className="stat-label">Events</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">0</div>
                  <div className="stat-label">Connections</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">0</div>
                  <div className="stat-label">Posts</div>
                </div>
              </div>
            </div>
          </div>

          <div className="profile-main">
            <form onSubmit={handleSubmit} className="profile-form">
              <div className="form-section">
                <h3>Personal Information</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="first_name">First Name *</label>
                    <input
                      type="text"
                      id="first_name"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      className="form-control"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="last_name">Last Name *</label>
                    <input
                      type="text"
                      id="last_name"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      className="form-control"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="graduation_year">Graduation Year</label>
                    <input
                      type="number"
                      id="graduation_year"
                      name="graduation_year"
                      value={formData.graduation_year}
                      onChange={handleChange}
                      className="form-control"
                      min="1950"
                      max={new Date().getFullYear() + 5}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="degree">Degree</label>
                    <input
                      type="text"
                      id="degree"
                      name="degree"
                      value={formData.degree}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="e.g., B.Tech, MBA"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="department">Department</label>
                  <input
                    type="text"
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="e.g., Computer Science"
                  />
                </div>
              </div>

              <div className="form-section">
                <h3>Professional Information</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="current_job_title">Current Job Title</label>
                    <input
                      type="text"
                      id="current_job_title"
                      name="current_job_title"
                      value={formData.current_job_title}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="e.g., Software Engineer"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="current_company">Current Company</label>
                    <input
                      type="text"
                      id="current_company"
                      name="current_company"
                      value={formData.current_company}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="e.g., Tech Corporation"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="location">Location</label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="e.g., Chandigarh, Punjab"
                  />
                </div>
              </div>

              <div className="form-section">
                <h3>Contact Information</h3>
                <div className="form-group">
                  <label htmlFor="contact_number">Contact Number</label>
                  <input
                    type="tel"
                    id="contact_number"
                    name="contact_number"
                    value={formData.contact_number}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="+91 XXX XXX XXXX"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="linkedin_url">LinkedIn Profile</label>
                  <input
                    type="url"
                    id="linkedin_url"
                    name="linkedin_url"
                    value={formData.linkedin_url}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Update Profile'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => window.location.reload()}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;