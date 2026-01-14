import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './AlumniDirectory.css';

const AlumniDirectory = () => {
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    graduation_year: '',
    department: ''
  });
  const [departments, setDepartments] = useState([]);
  const [years, setYears] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    fetchAlumni();
  }, []);

  const fetchAlumni = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.graduation_year) params.append('graduation_year', filters.graduation_year);
      if (filters.department) params.append('department', filters.department);
      
      const response = await axios.get(`/api/users?${params}`);
      setAlumni(response.data.users || []);
      
      // Extract unique departments and years for filters
      const uniqueDepartments = [...new Set(response.data.users.map(a => a.department).filter(Boolean))];
      const uniqueYears = [...new Set(response.data.users.map(a => a.graduation_year).filter(Boolean))].sort((a, b) => b - a);
      
      setDepartments(uniqueDepartments);
      setYears(uniqueYears);
    } catch (error) {
      console.error('Failed to fetch alumni:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchAlumni();
  };

  const handleReset = () => {
    setFilters({
      search: '',
      graduation_year: '',
      department: ''
    });
    fetchAlumni();
  };

  return (
    <div className="alumni-directory">
      <div className="container">
        <div className="page-header">
          <h1>Alumni Directory</h1>
          <p>Connect with fellow alumni from our institution</p>
        </div>

        <div className="filter-section">
          <form onSubmit={handleSearch} className="filter-form">
            <div className="search-box">
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Search by name or company..."
                className="search-input"
              />
              <button type="submit" className="btn btn-primary">
                Search
              </button>
            </div>

            <div className="filter-row">
              <select
                name="graduation_year"
                value={filters.graduation_year}
                onChange={handleFilterChange}
                className="filter-select"
              >
                <option value="">All Graduation Years</option>
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>

              <select
                name="department"
                value={filters.department}
                onChange={handleFilterChange}
                className="filter-select"
              >
                <option value="">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>

              <button type="button" onClick={handleReset} className="btn btn-secondary">
                Reset Filters
              </button>
            </div>
          </form>
        </div>

        {loading ? (
          <div className="loading">Loading alumni...</div>
        ) : alumni.length === 0 ? (
          <div className="no-results">
            <p>No alumni found matching your criteria.</p>
          </div>
        ) : (
          <>
            <div className="alumni-stats">
              <p>Found {alumni.length} alumni members</p>
            </div>

            <div className="alumni-grid">
              {alumni.map(alumnus => (
                <div key={alumnus.id} className="alumni-card">
                  <div className="alumni-avatar">
                    {alumnus.first_name?.[0]}{alumnus.last_name?.[0]}
                  </div>
                  <div className="alumni-info">
                    <h3>{alumnus.first_name} {alumnus.last_name}</h3>
                    {alumnus.graduation_year && (
                      <p className="alumni-meta">
                        <span className="meta-icon">🎓</span> Batch of {alumnus.graduation_year}
                      </p>
                    )}
                    {alumnus.department && (
                      <p className="alumni-meta">
                        <span className="meta-icon">📚</span> {alumnus.department}
                      </p>
                    )}
                    {alumnus.current_job_title && alumnus.current_company && (
                      <p className="alumni-meta">
                        <span className="meta-icon">💼</span> {alumnus.current_job_title} at {alumnus.current_company}
                      </p>
                    )}
                    {alumnus.location && (
                      <p className="alumni-meta">
                        <span className="meta-icon">📍</span> {alumnus.location}
                      </p>
                    )}
                  </div>
                  {user && (
                    <div className="alumni-actions">
                      <button className="btn btn-outline btn-sm">
                        Connect
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AlumniDirectory;