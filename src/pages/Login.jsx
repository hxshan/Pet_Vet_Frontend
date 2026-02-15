import React, { useState } from 'react';
import '../assets/styles/login.css';
import { useAuth } from '../context/useAuth.js';

function Login({ navigate }) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await login(formData);
      if (!res.ok) {
        const msg = (res.data && res.data.message) || res.error || `Login failed (${res.status || 'error'})`;
        setError(msg);
        setLoading(false);
        return;
      }

      console.log('Login successful', res.data);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError('Network error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Veterinarian Login</h1>
          <p>Access your veterinary account</p>
        </div>

        <div className="login-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
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
              required
              placeholder="Enter your password"
            />
          </div>

          <div className="form-options">
            <label className="remember-me">
              <input type="checkbox" />
              <span>Remember me</span>
            </label>
            <a href="/forgot-password" className="forgot-password">
              Forgot Password?
            </a>
          </div>

          <button 
            onClick={handleSubmit} 
            className="login-button" 
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

          <div className="signup-link">
            Don't have an account? <a href="/signup">Sign up here</a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;