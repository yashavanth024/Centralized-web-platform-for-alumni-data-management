import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../../components/admin/AdminLayout';
import { toast } from 'react-toastify';
import './AdminJobs.css';

const AdminJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showApplications, setShowApplications] = useState(null);
  const [jobApplications, setJobApplications] = useState([]);
  const [formData, setFormData] = useState({
    company_name: '',
    job_title: '',
    job_description: '',
    requirements: '',
    location: '',
    job_type: 'Full-time',
    salary_range: '',
    application_deadline: '',
    is_active: true
  });

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/jobs');
      setJobs(response.data.jobs || []);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const fetchJobApplications = async (jobId) => {
    try {
      const response = await axios.get(`/api/admin/jobs/${jobId}/applications`);
      setJobApplications(response.data.applications || []);
    } catch (error) {
      toast.error('Failed to load applications');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleEdit = (job) => {
    setEditingJob(job.id);
    setFormData({
      company_name: job.company_name,
      job_title: job.job_title,
      job_description: job.job_description,
      requirements: job.requirements || '',
      location: job.location || '',
      job_type: job.job_type,
      salary_range: job.salary_range || '',
      application_deadline: job.application_deadline?.split('T')[0] || '',
      is_active: job.is_active
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingJob) {
        await axios.put(`/api/admin/jobs/${editingJob}`, formData);
        toast.success('Job updated successfully!');
      } else {
        await axios.post('/api/jobs', formData);
        toast.success('Job posted successfully!');
      }
      
      setShowForm(false);
      setEditingJob(null);
      setFormData({
        company_name: '',
        job_title: '',
        job_description: '',
        requirements: '',
        location: '',
        job_type: 'Full-time',
        salary_range: '',
        application_deadline: '',
        is_active: true
      });
      fetchJobs();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save job');
    }
  };

 // In handleDelete function, ensure refresh
const handleDelete = async (jobId) => {
  if (window.confirm('Are you sure you want to delete this job posting?')) {
    try {
      await axios.delete(`/api/admin/jobs/${jobId}`);
      toast.success('Job deleted successfully!');
      fetchJobs(); // Refresh the list
    } catch (error) {
      toast.error('Failed to delete job');
    }
  }
};

  const handleViewApplications = (jobId) => {
    setShowApplications(jobId);
    fetchJobApplications(jobId);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No deadline';
    return new Date(dateString).toLocaleDateString('en-US');
  };

  return (
    <AdminLayout>
      <div className="admin-jobs">
        <div className="page-header">
          <div>
            <h2>Job Management</h2>
            <p>Post, edit, and manage job opportunities</p>
          </div>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditingJob(null);
              setFormData({
                company_name: '',
                job_title: '',
                job_description: '',
                requirements: '',
                location: '',
                job_type: 'Full-time',
                salary_range: '',
                application_deadline: '',
                is_active: true
              });
            }}
            className="btn btn-primary"
          >
            {showForm ? 'Cancel' : '💼 Post Job'}
          </button>
        </div>

        {/* Create/Edit Job Form */}
        {showForm && (
          <div className="create-form">
            <h3>{editingJob ? 'Edit Job Posting' : 'Post New Job'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Company Name *</label>
                  <input
                    type="text"
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleInputChange}
                    className="form-control"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Job Title *</label>
                  <input
                    type="text"
                    name="job_title"
                    value={formData.job_title}
                    onChange={handleInputChange}
                    className="form-control"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label>Job Type</label>
                  <select
                    name="job_type"
                    value={formData.job_type}
                    onChange={handleInputChange}
                    className="form-control"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Internship">Internship</option>
                    <option value="Contract">Contract</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Salary Range</label>
                  <input
                    type="text"
                    name="salary_range"
                    value={formData.salary_range}
                    onChange={handleInputChange}
                    className="form-control"
                    placeholder="e.g., ₹5-10 LPA"
                  />
                </div>

                <div className="form-group">
                  <label>Application Deadline</label>
                  <input
                    type="date"
                    name="application_deadline"
                    value={formData.application_deadline}
                    onChange={handleInputChange}
                    className="form-control"
                  />
                </div>

                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleInputChange}
                    />
                    <span> Active Job Posting</span>
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label>Job Description *</label>
                <textarea
                  name="job_description"
                  value={formData.job_description}
                  onChange={handleInputChange}
                  className="form-control"
                  rows="4"
                  required
                />
              </div>

              <div className="form-group">
                <label>Requirements (Optional)</label>
                <textarea
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleInputChange}
                  className="form-control"
                  rows="3"
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  {editingJob ? 'Update Job' : 'Post Job'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingJob(null);
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Jobs List */}
        <div className="jobs-list">
          <h3>All Job Postings ({jobs.length})</h3>
          
          {loading ? (
            <div className="loading">Loading jobs...</div>
          ) : jobs.length === 0 ? (
            <div className="no-jobs">
              <p>No job postings yet.</p>
            </div>
          ) : (
            <div className="jobs-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Job Title</th>
                    <th>Location</th>
                    <th>Type</th>
                    <th>Salary</th>
                    <th>Deadline</th>
                    <th>Status</th>
                    <th>Apps</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map(job => (
                    <tr key={job.id}>
                      <td>
                        <div className="company-info">
                          <div className="company-logo">
                            {job.company_name?.[0]}
                          </div>
                          <div>
                            <strong>{job.company_name}</strong>
                          </div>
                        </div>
                      </td>
                      <td>
                        <strong>{job.job_title}</strong>
                      </td>
                      <td>{job.location || 'Remote'}</td>
                      <td>
                        <span className={`type-badge ${job.job_type?.toLowerCase()}`}>
                          {job.job_type}
                        </span>
                      </td>
                      <td>{job.salary_range || 'Not specified'}</td>
                      <td>{formatDate(job.application_deadline)}</td>
                      <td>
                        <span className={`status-badge ${job.is_active ? 'active' : 'inactive'}`}>
                          {job.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => handleViewApplications(job.id)}
                          className="btn btn-sm btn-outline"
                        >
                          View
                        </button>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            onClick={() => handleEdit(job)}
                            className="btn btn-sm"
                          >
                            Edit
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
          )}
        </div>

        {/* Applications Modal */}
        {showApplications && (
          <div className="modal-overlay">
            <div className="modal large">
              <div className="modal-header">
                <h3>Job Applications</h3>
                <button 
                  onClick={() => setShowApplications(null)}
                  className="modal-close"
                >
                  ×
                </button>
              </div>
              <div className="modal-body">
                <div className="applications-list">
                  {jobApplications.length === 0 ? (
                    <p className="no-applications">No applications yet.</p>
                  ) : (
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Applicant</th>
                          <th>Email</th>
                          <th>Current Position</th>
                          <th>Applied On</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {jobApplications.map(app => (
                          <tr key={app.id}>
                            <td>
                              {app.first_name} {app.last_name}
                              <div className="applicant-meta">
                                {app.graduation_year && `Batch of ${app.graduation_year}`}
                                {app.department && ` | ${app.department}`}
                              </div>
                            </td>
                            <td>{app.email}</td>
                            <td>
                              {app.current_job_title || 'N/A'}
                              {app.current_company && ` at ${app.current_company}`}
                            </td>
                            <td>
                              {new Date(app.applied_date).toLocaleDateString()}
                            </td>
                            <td>
                              <span className={`status-badge ${app.status?.toLowerCase()}`}>
                                {app.status}
                              </span>
                            </td>
                            <td>
                              <button
                                onClick={() => {
                                  if (app.resume_url) {
                                    window.open(app.resume_url, '_blank');
                                  } else {
                                    toast.info('No resume uploaded');
                                  }
                                }}
                                className="btn btn-sm"
                              >
                                View Resume
                              </button>
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
                  onClick={() => setShowApplications(null)}
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

export default AdminJobs;