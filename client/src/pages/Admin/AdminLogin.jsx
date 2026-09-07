import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/auth.css';

export default function AdminLogin() {
  const { adminLogin } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('admin@tecxl.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await adminLogin(email, password);
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      console.error('Admin login failed:', err);
      setError(err.response?.data?.message || 'Invalid admin credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: '40px' }}>
      <div className="auth-wrapper">
        <div className="auth-card" style={{ borderTop: '4px solid var(--color-ink)' }}>
          <div className="auth-header">
            <span className="section-banner">RESTRICTED ACCESS</span>
            <h2 className="auth-title">ADMINISTRATOR CONSOLE</h2>
            <p className="auth-subtitle">
              TECXEL Championship official control & monitoring portal.
            </p>
          </div>

          {error && (
            <div className="anticheat-warning-banner" style={{ borderColor: 'var(--color-error)', marginBottom: '20px' }}>
              <div>⚠️ {error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Admin Email</label>
              <input
                type="email"
                required
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                required
                className="form-control"
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
              {loading ? 'AUTHENTICATING...' : 'ENTER CONTROL CONSOLE →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
