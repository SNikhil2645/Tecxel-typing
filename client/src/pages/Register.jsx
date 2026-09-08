import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/auth.css';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    rollNumber: '',
    course: 'BCA',
    year: '2',
    section: 'A',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [registeredId, setRegisteredId] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { participantId } = await register({
        name: formData.name,
        rollNumber: formData.rollNumber,
        course: formData.course,
        year: parseInt(formData.year, 10),
        section: formData.section,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      });

      setRegisteredId(participantId);
    } catch (err) {
      console.error('Registration failed:', err);
      const msg = err.response?.data?.message || 'Registration failed. Please check your inputs.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (registeredId) {
    return (
      <div className="container" style={{ paddingTop: '40px' }}>
        <div className="auth-wrapper">
          <div className="auth-card" style={{ textAlign: 'center' }}>
            <div className="badge badge-success" style={{ marginBottom: '16px' }}>
              REGISTRATION COMPLETE
            </div>
            <h2 className="auth-title">WELCOME TO TECXEL 2026</h2>
            <p className="auth-subtitle">
              Your official participant profile has been created. Keep your Participant ID safe:
            </p>

            <div className="participant-id-display-card">
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-ink-muted)' }}>
                YOUR OFFICIAL PARTICIPANT ID
              </span>
              <div className="participant-id-huge">{registeredId}</div>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-ink-secondary)' }}>
                Use this ID along with your password to log in at any time.
              </span>
            </div>

            <div style={{ marginTop: '24px' }}>
              <button
                onClick={() => navigate('/rules')}
                className="btn btn-primary btn-pixel"
                style={{ width: '100%' }}
              >
                PROCEED TO RULES & ROUND 1 →
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '20px', paddingBottom: '40px' }}>
      <div className="auth-wrapper">
        <div className="auth-card">
          <div className="auth-header">
            <span className="section-banner">PARTICIPANT REGISTRATION</span>
            <h2 className="auth-title">JOIN THE CHAMPIONSHIP</h2>
            <p className="auth-subtitle">
              Register now to participate in all 3 typing rounds.
            </p>
          </div>

          {error && (
            <div className="anticheat-warning-banner" style={{ borderColor: 'var(--color-error)', marginBottom: '20px' }}>
              <div>⚠️ {error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                name="name"
                required
                className="form-control"
                placeholder="e.g. Alex Sharma"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Roll / Student ID *</label>
                <input
                  type="text"
                  name="rollNumber"
                  required
                  className="form-control"
                  placeholder="e.g. 21BCE1042"
                  value={formData.rollNumber}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Course *</label>
                <select
                  name="course"
                  className="form-control"
                  value={formData.course}
                  onChange={handleChange}
                >
                  <option value="BCA">BCA</option>
                  <option value="BCA-DS">BCA-DS</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Year of Study *</label>
                <select
                  name="year"
                  className="form-control"
                  value={formData.year}
                  onChange={handleChange}
                >
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                  <option value="5">5th Year</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Section *</label>
                <input
                  type="text"
                  name="section"
                  required
                  className="form-control"
                  placeholder="e.g. A"
                  value={formData.section}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  required
                  className="form-control"
                  placeholder="e.g. alex@college.edu"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number (Optional)</label>
                <input
                  type="tel"
                  name="phone"
                  className="form-control"
                  placeholder="e.g. 9876543210"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Password *</label>
                <input
                  type="password"
                  name="password"
                  required
                  minLength={6}
                  className="form-control"
                  placeholder="Min 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Confirm Password *</label>
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  className="form-control"
                  placeholder="Repeat password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-pixel"
              style={{ width: '100%', marginTop: '8px' }}
            >
              {loading ? 'GENERATING PARTICIPANT ID...' : 'COMPLETE REGISTRATION →'}
            </button>
          </form>

          <div className="auth-footer">
            Already registered?{' '}
            <Link to="/login" style={{ fontWeight: 700 }}>
              Log in with Participant ID
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
