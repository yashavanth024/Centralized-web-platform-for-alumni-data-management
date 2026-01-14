import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import './MentorshipApplications.css';

const MentorshipApplications = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [mentorship, setMentorship] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'alumni') {
      navigate('/dashboard');
      return;
    }
    
    fetchMentorshipApplications();
  }, [id, user]);

  const fetchMentorshipApplications = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/mentorship/${id}/applications`);
      setApplications(response.data.applications || []);
      
      // Also fetch mentorship details
      const mentorshipRes = await axios.get(`/api/mentorship/my-mentorships`);
      const myMentorship = mentorshipRes.data.mentorships?.find(m => m.id === parseInt(id));
      setMentorship(myMentorship);
    } catch (error) {
      console.error('Failed to fetch applications:', error);
      toast.error('Failed to load applications');
      navigate('/alumni/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (applicationId, status) => {
    try {
      await axios.put(`/api/mentorship/applications/${applicationId}/status`, { status });
      toast.success(`Application ${status.toLowerCase()}`);
      fetchMentorshipApplications();
    } catch (error) {
      toast.error('Failed to update application');
    }
  };

  if (loading) {
    return (
      <div className="mentorship-applications">
        <div className="container">
          <div className="loading">Loading applications...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="mentorship-applications">
      <div className="container">
        <div className="page-header">
          <button 
            onClick={() => navigate('/alumni/dashboard')}
            className="btn btn-outline"
          >
            ← Back to Dashboard
          </button>
          <h1>Mentorship Applications</h1>
          {mentorship && (
            <p className="mentorship-title">{mentorship.title}</p>
          )}
        </div>

        {applications.length === 0 ? (
          <div className="no-applications">
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <h3>No Applications Yet</h3>
              <p>Students haven't applied to this mentorship yet.</p>
              <button 
                onClick={() => navigate('/alumni/dashboard')}
                className="btn btn-primary"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        ) : (
          <div className="applications-list">
            <div className="applications-header">
              <h2>{applications.length} Application(s)</h2>
              <p>Review and respond to student applications</p>
            </div>

            {applications.map(application => (
              <div key={application.id} className="application-card">
                <div className="applicant-header">
                  <div className="applicant-avatar">
                    {application.first_name?.[0]}{application.last_name?.[0]}
                  </div>
                  <div className="applicant-info">
                    <h3>{application.first_name} {application.last_name}</h3>
                    <p className="applicant-email">{application.email}</p>
                    <p className="applicant-meta">
                      {application.graduation_year && `Batch of ${application.graduation_year}`}
                      {application.department && ` • ${application.department}`}
                    </p>
                  </div>
                  <div className="application-status">
                    <span className={`status-badge ${application.status?.toLowerCase()}`}>
                      {application.status}
                    </span>
                  </div>
                </div>

                <div className="application-content">
                  <h4>Application Message</h4>
                  <p className="application-text">{application.application_text}</p>
                  
                  <div className="application-meta">
                    <div className="meta-item">
                      <span className="meta-label">Applied on:</span>
                      <span className="meta-value">
                        {new Date(application.applied_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="application-actions">
                  {application.status === 'Pending' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(application.id, 'Accepted')}
                        className="btn btn-success"
                      >
                        Accept Application
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(application.id, 'Rejected')}
                        className="btn btn-danger"
                      >
                        Reject Application
                      </button>
                    </>
                  )}
                  <button className="btn btn-outline">
                    Send Message
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MentorshipApplications;