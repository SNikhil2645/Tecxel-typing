import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/auth.css';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [participantId, setParticipantId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!participantId || !password) {
      setError('Please enter both Participant ID and Password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await login(participantId.trim().toUpperCase(), password);
      const destination = location.state?.from?.pathname || '/rules';
      navigate(destination, { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      const msg = err.response?.data?.message || 'Invalid Participant ID or password.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
      <div className="auth-wrapper">
        <div className="auth-card">
          <div className="auth-header">
            <span className="section-banner">PARTICIPANT ACCESS</span>
            <h2 className="auth-title">LOG IN TO COMPETE</h2>
            <p className="auth-subtitle">
              Enter your assigned Participant ID (e.g. TCX-001) and password.
            </p>
          </div>

          {error && (
            <div className="anticheat-warning-banner" style={{ borderColor: 'var(--color-error)', marginBottom: '20px' }}>
              <div>⚠️ {error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Participant ID *</label>
              <input
                type="text"
                required
                className="form-control"
                placeholder="e.g. TCX-001"
                value={participantId}
                onChange={(e) => setParticipantId(e.target.value)}
                style={{ textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password *</label>
              <input
                type="password"
                required
                className="form-control"
                placeholder="Your secret password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-pixel"
              style={{ width: '100%', marginTop: '12px' }}
            >
              {loading ? 'AUTHENTICATING...' : 'ENTER CHAMPIONSHIP →'}
            </button>
          </form>

          <div className="auth-footer">
            Don't have a Participant ID?{' '}
            <Link to="/register" style={{ fontWeight: 700 }}>
              Register for the event
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
