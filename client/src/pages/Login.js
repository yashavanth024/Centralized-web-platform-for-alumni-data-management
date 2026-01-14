import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import './Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      toast.success('Login successful!');
      navigate('/dashboard');
    } else {
      toast.error(result.message || 'Login failed');
    }
    
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="container">
        <div className="auth-card">
          <div className="auth-header">
            <h2>Welcome Back</h2>
            <p>Login to your alumni account</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>

            <div className="form-group">
              <button 
                type="submit" 
                className="btn btn-primary btn-block"
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </div>

            <div className="auth-footer">
              <p>
                Don't have an account?{' '}
                <Link to="/register">Register here</Link>
              </p>
              <p>
                <Link to="/forgot-password">Forgot Password?</Link>
              </p>
            </div>
          </form>

          <div className="auth-divider">
            <span>Or login with</span>
          </div>

          <div className="social-login">
            <button className="btn btn-social btn-google">
              <span className="social-icon">G</span>
              Google
            </button>
            <button className="btn btn-social btn-linkedin">
              <span className="social-icon">in</span>
              LinkedIn
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;