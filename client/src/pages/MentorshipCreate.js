import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import './MentorshipCreate.css';

const MentorshipCreate = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    expertise_area: '',
    max_mentees: '',
    status: 'active'
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user?.is_verified) {
      toast.error('Please verify your alumni account first');
      return;
    }

    if (!formData.title || !formData.description || !formData.expertise_area) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      setLoading(true);
      await axios.post('/api/mentorship', formData);
      
      toast.success('Mentorship opportunity created successfully!');
      navigate('/alumni/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create mentorship');
    } finally {
      setLoading(false);
    }
  };

  const expertiseAreas = [
    'Software Engineering',
    'Data Science',
    'Business & Management',
    'Marketing',
    'Finance',
    'Product Management',
    'UI/UX Design',
    'Career Guidance',
    'Higher Education',
    'Entrepreneurship',
    'Other'
  ];

  return (
    <div className="mentorship-create">
      <div className="container">
        <div className="page-header">
          <h1>Create Mentorship Opportunity</h1>
          <p>Share your experience and guide current students</p>
        </div>

        <div className="create-guide">
          <div className="guide-card">
            <h3>🎯 Why Create a Mentorship?</h3>
            <ul>
              <li>Help students navigate their career paths</li>
              <li>Share industry insights and experience</li>
              <li>Build your professional network</li>
              <li>Give back to your alma mater</li>
            </ul>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mentorship-form">
          <div className="form-section">
            <h3>Mentorship Details</h3>
            
            <div className="form-group">
              <label htmlFor="title">Mentorship Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="form-control"
                placeholder="e.g., Career Guidance in Tech Industry"
                required
              />
              <small className="form-text">Be clear about what you're offering</small>
            </div>

            <div className="form-group">
              <label htmlFor="expertise_area">Expertise Area *</label>
              <select
                id="expertise_area"
                name="expertise_area"
                value={formData.expertise_area}
                onChange={handleChange}
                className="form-control"
                required
              >
                <option value="">Select your expertise</option>
                {expertiseAreas.map(area => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="max_mentees">Maximum Students (Optional)</label>
              <input
                type="number"
                id="max_mentees"
                name="max_mentees"
                value={formData.max_mentees}
                onChange={handleChange}
                className="form-control"
                min="1"
                max="10"
                placeholder="Leave empty for unlimited"
              />
              <small className="form-text">Limit how many students can apply</small>
            </div>
          </div>

          <div className="form-section">
            <h3>Mentorship Description</h3>
            
            <div className="form-group">
              <label htmlFor="description">What will you offer? *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="form-control"
                rows="6"
                placeholder="Describe what students can expect from this mentorship, including:
• Areas you can help with
• Frequency of meetings
• Expected commitment
• Any specific requirements"
                required
              />
              <small className="form-text">Be specific about your offering</small>
            </div>
          </div>

          <div className="form-section">
            <h3>Commitment & Expectations</h3>
            
            <div className="expectations-grid">
              <div className="expectation-card">
                <div className="expectation-icon">⏰</div>
                <h4>Time Commitment</h4>
                <p>Estimate how much time you can dedicate per week/month</p>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g., 2 hours per week"
                />
              </div>

              <div className="expectation-card">
                <div className="expectation-icon">🎯</div>
                <h4>Focus Areas</h4>
                <p>What specific areas will you focus on?</p>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g., Resume review, Interview prep"
                />
              </div>

              <div className="expectation-card">
                <div className="expectation-icon">📅</div>
                <h4>Duration</h4>
                <p>How long will this mentorship last?</p>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g., 3 months, Ongoing"
                />
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary btn-large"
              disabled={loading || !user?.is_verified}
            >
              {loading ? 'Creating...' : 'Create Mentorship Opportunity'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/alumni/dashboard')}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>

          {!user?.is_verified && (
            <div className="verification-alert">
              <div className="alert-icon">⚠️</div>
              <div className="alert-content">
                <h4>Account Verification Required</h4>
                <p>Please wait for admin verification before creating mentorship opportunities.</p>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default MentorshipCreate;