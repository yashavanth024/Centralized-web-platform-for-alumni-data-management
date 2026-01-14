import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import './JobsMy.css';

const JobsMy = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && (user.role === 'alumni' || user.is_admin)) {
      fetchMyJobs();
    }
  }, [user]);

  const fetchMyJobs = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/jobs/my');
      setJobs(response.data.jobs || []);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
      toast.error('Failed to load your jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (jobId) => {
    if (window.confirm('Are you sure you want to delete this job posting?')) {
      try {
        await axios.delete(`/api/jobs/${jobId}`);
        toast.success('Job deleted successfully!');
        fetchMyJobs();
      } catch (error) {
        toast.error('Failed to delete job');
      }
    }
  };

  const handleToggleActive = async (jobId, isActive) => {
    try {
      await axios.put(`/api/jobs/${jobId}`, { is_active: !isActive });
      toast.success(`Job ${!isActive ? 'activated' : 'deactivated'} successfully!`);
      fetchMyJobs();
    } catch (error) {
      toast.error('Failed to update job');
    }
  };

  if (loading) {
    return (
      <div className="jobs-my">
        <div className="container">
          <div className="loading">Loading your jobs...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="jobs-my">
      <div className="container">
        <div className="page-header">
          <h1>My Job Postings</h1>
          <p>Manage jobs you have posted</p>
          <Link to="/jobs/create" className="btn btn-primary">
            + Post New Job
          </Link>
        </div>

        {jobs.length === 0 ? (
          <div className="no-jobs">
            <div className="empty-state">
              <div className="empty-icon">💼</div>
              <h3>No Jobs Posted Yet</h3>
              <p>Share job opportunities with current students and alumni</p>
              <Link to="/jobs/create" className="btn btn-primary">
                Post Your First Job
              </Link>
            </div>
          </div>
        ) : (
          <div className="jobs-list">
            <div className="jobs-stats">
              <div className="stat-card">
                <span className="stat-number">{jobs.length}</span>
                <span className="stat-label">Total Jobs</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">
                  {jobs.filter(j => j.is_active).length}
                </span>
                <span className="stat-label">Active Jobs</span>
              </div>
            </div>

            <div className="jobs-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Job Title</th>
                    <th>Company</th>
                    <th>Type</th>
                    <th>Applications</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map(job => (
                    <tr key={job.id}>
                      <td>
                        <strong>{job.job_title}</strong>
                        <div className="job-meta">
                          Posted: {new Date(job.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td>{job.company_name}</td>
                      <td>
                        <span className={`type-badge ${job.job_type?.toLowerCase()}`}>
                          {job.job_type}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-sm btn-outline">
                          View Applications
                        </button>
                      </td>
                      <td>
                        <span className={`status-badge ${job.is_active ? 'active' : 'inactive'}`}>
                          {job.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <Link 
                            to={`/jobs/edit/${job.id}`}
                            className="btn btn-sm"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleToggleActive(job.id, job.is_active)}
                            className={`btn btn-sm ${job.is_active ? 'btn-warning' : 'btn-success'}`}
                          >
                            {job.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => handleDelete(job.id)}
                            className="btn btn-sm btn-danger"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobsMy;