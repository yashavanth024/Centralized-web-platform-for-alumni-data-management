import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import './Jobs.css';

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: '',
    search: ''
  });

  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect alumni to their job management page
  useEffect(() => {
    if (user?.role === 'alumni' && !user?.is_admin) {
      navigate('/jobs/my');
    }
  }, [user, navigate]);

  useEffect(() => {
    fetchJobs();
  }, [filters]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.type) params.append('type', filters.type);
      if (filters.search) params.append('search', filters.search);
      
      const response = await axios.get(`/api/jobs?${params}`);
      setJobs(response.data.jobs || []);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
      toast.error('Failed to load job postings');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (jobId) => {
    if (!user) {
      toast.error('Please login to apply for jobs');
      return;
    }

    try {
      await axios.post(`/api/jobs/${jobId}/apply`, {
        cover_letter: '',
        resume_url: ''
      });
      toast.success('Job application submitted successfully!');
      fetchJobs();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Application failed');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No deadline';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Deadline passed';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    return `in ${diffDays} days`;
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="jobs-page">
      <div className="container">
        <div className="page-header">
          <h1>Career Opportunities</h1>
          <p>Find jobs and internships posted by alumni and partner companies</p>
        </div>

        <div className="jobs-controls">
          <div className="search-section">
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search jobs by title or company..."
              className="search-input"
            />
          </div>

          <div className="filter-section">
            <select
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
              className="filter-select"
            >
              <option value="">All Job Types</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Internship">Internship</option>
              <option value="Contract">Contract</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="loading">Loading job postings...</div>
        ) : jobs.length === 0 ? (
          <div className="no-jobs">
            <p>No job postings found matching your criteria.</p>
            <p>Check back soon for new opportunities!</p>
          </div>
        ) : (
          <div className="jobs-grid">
            {jobs.map(job => (
              <div key={job.id} className="job-card">
                <div className="job-header">
                  <div className="company-info">
                    <div className="company-logo">
                      {job.company_name?.[0]}
                    </div>
                    <div>
                      <h3>{job.company_name}</h3>
                      <p className="job-posted-by">
                        Posted by {job.posted_by_name || 'Alumni'}
                      </p>
                    </div>
                  </div>
                  <span className={`job-type ${job.job_type?.toLowerCase()}`}>
                    {job.job_type}
                  </span>
                </div>

                <div className="job-content">
                  <h4>{job.job_title}</h4>
                  
                  <div className="job-details">
                    {job.location && (
                      <div className="detail-item">
                        <span className="detail-icon">📍</span>
                        <span>{job.location}</span>
                      </div>
                    )}
                    {job.salary_range && (
                      <div className="detail-item">
                        <span className="detail-icon">💰</span>
                        <span>{job.salary_range}</span>
                      </div>
                    )}
                    {job.application_deadline && (
                      <div className="detail-item">
                        <span className="detail-icon">⏰</span>
                        <span>Apply {formatDate(job.application_deadline)}</span>
                      </div>
                    )}
                  </div>

                  <p className="job-description">
                    {job.job_description?.substring(0, 150)}...
                  </p>

                  {job.requirements && (
                    <div className="job-requirements">
                      <strong>Requirements:</strong>
                      <p>{job.requirements.substring(0, 100)}...</p>
                    </div>
                  )}
                </div>

                <div className="job-actions">
                  {user?.role === 'student' && user?.is_verified ? (
                    <button
                      onClick={() => handleApply(job.id)}
                      className="btn btn-primary"
                    >
                      Apply Now
                    </button>
                  ) : user?.role === 'alumni' ? (
                    <button className="btn btn-primary" disabled>
                      Alumni Cannot Apply
                    </button>
                  ) : (
                    <button className="btn btn-primary" disabled>
                      {!user ? 'Login to Apply' : 'Verification Required'}
                    </button>
                  )}

                  <button className="btn btn-outline">
                    View Details
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

export default Jobs;
