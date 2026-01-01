import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, User, Briefcase, Check } from 'lucide-react';
import '../assets/styles/signup.css';

function Signup({ navigate }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    nicNumber: '',
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    licenseNumber: '',
    specialization: '',
    yearsOfExperience: '',
    clinicName: '',
    clinicAddress: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const validateStep1 = () => {
    const { firstname, lastname, nicNumber, email, phone, password, confirmPassword } = formData;
    
    if (!firstname || !lastname || !nicNumber || !email || !phone || !password || !confirmPassword) {
      setError('Please fill in all required fields');
      return false;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setError('');
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
    setError('');
  };

  const handleSubmit = async () => {
    const { licenseNumber, specialization, yearsOfExperience, clinicName, clinicAddress } = formData;
    
    if (!licenseNumber || !specialization || !yearsOfExperience || !clinicName || !clinicAddress) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    const { confirmPassword, ...dataToSend } = formData;

    try {
      const response = await fetch('/api/veterinarian/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend)
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Signup failed');
        setLoading(false);
        return;
      }

      setSuccess(data.message + ' ' + (data.note || ''));
      
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
      
    } catch (err) {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        {/* Progress Indicator */}
        <div className="progress-container">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: step === 1 ? '50%' : '100%' }}
            />
          </div>
          <div className="steps-indicator">
            <div className="step-item">
              <div className={`step-circle ${step >= 1 ? 'active' : ''}`}>
                {step > 1 ? <Check size={16} /> : <User size={16} />}
              </div>
              <span className="step-label">Personal Info</span>
            </div>
            <div className="step-item">
              <div className={`step-circle ${step >= 2 ? 'active' : ''}`}>
                <Briefcase size={16} />
              </div>
              <span className="step-label">Professional Info</span>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="signup-header">
          <h1>Veterinarian Registration</h1>
          <p>{step === 1 ? 'Step 1: Personal Information' : 'Step 2: Professional Information'}</p>
        </div>

        <div className="signup-form">
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          {step === 1 ? (
            // Step 1: Personal Information
            <div className="form-section">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstname">First Name *</label>
                  <input
                    type="text"
                    id="firstname"
                    name="firstname"
                    value={formData.firstname}
                    onChange={handleChange}
                    required
                    placeholder="Enter first name"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="lastname">Last Name *</label>
                  <input
                    type="text"
                    id="lastname"
                    name="lastname"
                    value={formData.lastname}
                    onChange={handleChange}
                    required
                    placeholder="Enter last name"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="nicNumber">NIC Number *</label>
                <input
                  type="text"
                  id="nicNumber"
                  name="nicNumber"
                  value={formData.nicNumber}
                  onChange={handleChange}
                  required
                  placeholder="Enter NIC number"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="Enter email address"
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number *</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  placeholder="Enter phone number"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="password">Password *</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="Enter password (min 6 characters)"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm Password *</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    placeholder="Confirm password"
                  />
                </div>
              </div>

              <button onClick={handleNext} className="next-button">
                Next Step
                <ChevronRight size={20} className="button-icon-right" />
              </button>
            </div>
          ) : (
            // Step 2: Professional Information
            <div className="form-section">
              <div className="form-group">
                <label htmlFor="licenseNumber">License Number *</label>
                <input
                  type="text"
                  id="licenseNumber"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleChange}
                  required
                  placeholder="Enter veterinary license number"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="specialization">Specialization *</label>
                  <input
                    type="text"
                    id="specialization"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Small Animals"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="yearsOfExperience">Years of Experience *</label>
                  <input
                    type="number"
                    id="yearsOfExperience"
                    name="yearsOfExperience"
                    value={formData.yearsOfExperience}
                    onChange={handleChange}
                    required
                    min="0"
                    placeholder="Enter years"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="clinicName">Clinic Name *</label>
                <input
                  type="text"
                  id="clinicName"
                  name="clinicName"
                  value={formData.clinicName}
                  onChange={handleChange}
                  required
                  placeholder="Enter clinic name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="clinicAddress">Clinic Address *</label>
                <textarea
                  id="clinicAddress"
                  name="clinicAddress"
                  value={formData.clinicAddress}
                  onChange={handleChange}
                  required
                  placeholder="Enter full clinic address"
                  rows="3"
                />
              </div>

              <div className="button-row">
                <button onClick={handleBack} className="back-button">
                  <ChevronLeft size={20} className="button-icon-left" />
                  Back
                </button>
                <button 
                  onClick={handleSubmit} 
                  className="signup-button"
                  disabled={loading}
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>
              </div>
            </div>
          )}

          <div className="login-link">
            Already have an account? <a href="/login">Login here</a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;