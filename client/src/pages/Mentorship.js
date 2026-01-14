import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import './Mentorship.css';

const Mentorship = () => {
  const [mentorships, setMentorships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(null);
  const [applicationText, setApplicationText] = useState('');
  const { user } = useAuth();

  // ✅ Redirect alumni (non-admin) to create mentorship page
  useEffect(() => {
    if (user?.role === 'alumni' && !user?.is_admin) {
      window.location.href = '/mentorship/create';
    }
  }, [user]);

  // Existing fetch logic (students)
  useEffect(() => {
    fetchMentorships();
  }, []);

  const fetchMentorships = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/mentorship');
      setMentorships(response.data.mentorships || []);
    } catch (error) {
      console.error('Failed to fetch mentorships:', error);
      toast.error('Failed to load mentorship opportunities');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (mentorshipId) => {
    if (!user) {
      toast.error('Please login to apply for mentorship');
      return;
    }

    if (!applicationText.trim()) {
      toast.error('Please enter your application message');
      return;
    }

    try {
      setApplying(mentorshipId);
      await axios.post(`/api/mentorship/${mentorshipId}/apply`, {
        application_text: applicationText
      });

      toast.success('Mentorship application submitted successfully!');
      setApplying(null);
      setApplicationText('');
      fetchMentorships();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Application failed');
      setApplying(null);
    }
  };

  return (
    <div className="mentorship-page">
      <div className="container">
        <div className="page-header">
          <h1>Mentorship Program</h1>
          <p>Learn from experienced alumni and guide the next generation</p>
        </div>

        <div className="mentorship-intro">
          <div className="intro-card">
            <h3>Why Become a Mentee?</h3>
            <ul>
              <li>Get career guidance from industry experts</li>
              <li>Learn from alumni who've walked your path</li>
              <li>Expand your professional network</li>
              <li>Receive personalized advice and support</li>
            </ul>
          </div>

          {user && (
            <div className="my-applications-link">
              <a href="/dashboard" className="btn btn-outline">
                View My Applications
              </a>
            </div>
          )}
        </div>

        {loading ? (
          <div className="loading">Loading mentorship opportunities...</div>
        ) : mentorships.length === 0 ? (
          <div className="no-mentorships">
            <p>No mentorship opportunities available at the moment.</p>
            <p>Check back soon or consider becoming a mentor!</p>
          </div>
        ) : (
          <div className="mentorship-grid">
            {mentorships.map((mentorship) => (
              <div key={mentorship.id} className="mentorship-card">
                <div className="mentor-header">
                  <div className="mentor-avatar">
                    {mentorship.first_name?.[0]}
                    {mentorship.last_name?.[0]}
                  </div>
                  <div className="mentor-info">
                    <h3>
                      {mentorship.first_name} {mentorship.last_name}
                    </h3>
                    <p className="mentor-title">
                      {mentorship.current_job_title}
                    </p>
                    <p className="mentor-company">
                      {mentorship.current_company}
                    </p>
                  </div>
                </div>

                <div className="mentorship-content">
                  <h4>{mentorship.title}</h4>
                  <p className="mentorship-description">
                    {mentorship.description}
                  </p>

                  <div className="mentorship-details">
                    <div className="expertise-tag">
                      <span className="tag-icon">🎯</span>
                      {mentorship.expertise_area}
                    </div>
                    <div className="availability">
                      <span
                        className={`status-dot ${mentorship.availability?.toLowerCase()}`}
                      ></span>
                      {mentorship.availability}
                    </div>
                    {mentorship.max_mentees && (
                      <div className="mentee-count">
                        <span className="count-icon">👥</span>
                        {mentorship.current_mentees || 0}/
                        {mentorship.max_mentees} mentees
                      </div>
                    )}
                  </div>
                </div>

                <div className="mentorship-actions">
                  {applying === mentorship.id ? (
                    <div className="application-form">
                      <textarea
                        value={applicationText}
                        onChange={(e) =>
                          setApplicationText(e.target.value)
                        }
                        placeholder="Why are you interested in this mentorship?"
                        rows="3"
                        className="form-control"
                      />
                      <div className="form-actions">
                        <button
                          onClick={() => handleApply(mentorship.id)}
                          className="btn btn-primary"
                          disabled={!applicationText.trim()}
                        >
                          Submit Application
                        </button>
                        <button
                          onClick={() => {
                            setApplying(null);
                            setApplicationText('');
                          }}
                          className="btn btn-secondary"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setApplying(mentorship.id)}
                      className="btn btn-primary"
                      disabled={
                        !user || mentorship.availability !== 'Available'
                      }
                    >
                      {!user
                        ? 'Login to Apply'
                        : mentorship.availability !== 'Available'
                        ? 'Not Available'
                        : 'Apply for Mentorship'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Mentorship;
