import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Register = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    usn_number: '',
    role: 'student', // ✅ default role
    graduation_year: '',
    degree: '',
    department: ''
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { register } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    toast.success('ID card selected successfully');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      toast.error('Please upload your ID card');
      return;
    }

    if (formData.role === 'alumni' && !formData.graduation_year) {
      toast.error('Graduation year is required for alumni');
      return;
    }

    setLoading(true);

    try {
      const formDataObj = new FormData();

      Object.keys(formData).forEach((key) => {
        formDataObj.append(key, formData[key]);
      });

      formDataObj.append('id_card', selectedFile);

      const result = await register(formDataObj);

      if (result.success) {
        toast.success('Registration successful! Await admin verification.');
        navigate('/verification-pending');
      } else {
        toast.error(result.message || 'Registration failed');
      }
    } catch (error) {
      toast.error('An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Create Account</h2>
          <p>Join the Punjab Alumni Network</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form" encType="multipart/form-data">

          {/* 🔹 Role Selection */}
          <div className="form-group">
            <label>Account Type *</label>
            <div className="role-selection">
              <div className="role-option">
                <input
                  type="radio"
                  id="role_student"
                  name="role"
                  value="student"
                  checked={formData.role === 'student'}
                  onChange={handleChange}
                />
                <label htmlFor="role_student" className="role-label">
                  <div className="role-icon">🎓</div>
                  <div className="role-content">
                    <h4>Student</h4>
                    <p>Currently enrolled in university</p>
                    <ul className="role-features">
                      <li>Browse alumni mentors</li>
                      <li>Apply for mentorship</li>
                      <li>Access events & jobs</li>
                    </ul>
                  </div>
                </label>
              </div>

              <div className="role-option">
                <input
                  type="radio"
                  id="role_alumni"
                  name="role"
                  value="alumni"
                  checked={formData.role === 'alumni'}
                  onChange={handleChange}
                />
                <label htmlFor="role_alumni" className="role-label">
                  <div className="role-icon">👨‍🎓</div>
                  <div className="role-content">
                    <h4>Alumni</h4>
                    <p>Graduated from university</p>
                    <ul className="role-features">
                      <li>Create mentorship opportunities</li>
                      <li>Post job opportunities</li>
                      <li>Guide current students</li>
                    </ul>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>First Name *</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Last Name *</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>USN Number *</label>
            <input
              type="text"
              name="usn_number"
              value={formData.usn_number}
              onChange={handleChange}
              placeholder="e.g. 1PU18CS001"
              required
            />
          </div>

          <div className="form-group">
            <label>Password *</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              minLength={6}
              required
            />
          </div>

          {/* 🎯 Conditional Graduation Year */}
          {formData.role === 'alumni' && (
            <div className="form-group">
              <label>Graduation Year *</label>
              <input
                type="number"
                name="graduation_year"
                value={formData.graduation_year}
                onChange={handleChange}
                min="1950"
                max={new Date().getFullYear()}
                required
              />
              <small className="form-text">
                Required for alumni registration
              </small>
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label>Degree</label>
              <input
                type="text"
                name="degree"
                value={formData.degree}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Department</label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label>ID Card Upload *</label>
            <input
              type="file"
              name="id_card"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={handleFileChange}
              required
            />
            {selectedFile && (
              <small style={{ color: 'green' }}>
                Selected: {selectedFile.name}
              </small>
            )}
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Registering...' : 'Register for Verification'}
          </button>

          <div className="auth-footer">
            <p>
              Already have an account? <Link to="/login">Login</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
