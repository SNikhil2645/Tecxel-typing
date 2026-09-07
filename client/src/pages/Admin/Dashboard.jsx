import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Participants from './Participants';
import Results from './Results';
import Passages from './Passages';
import Export from './Export';
import Loading from '../../components/Loading';
import api from '../../services/api';
import '../../styles/admin.css';

export default function Dashboard() {
  const { admin } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [freezeToggling, setFreezeToggling] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/dashboard');
      setStats(res.data);
    } catch (err) {
      console.error('Failed to load dashboard statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleToggleFreeze = async () => {
    setFreezeToggling(true);
    try {
      const newFreezeState = !stats?.isFrozen;
      const res = await api.post('/admin/freeze-leaderboard', { frozen: newFreezeState });
      setStats((prev) => ({ ...prev, isFrozen: res.data.isFrozen }));
    } catch (err) {
      alert('Failed to toggle freeze state');
    } finally {
      setFreezeToggling(false);
    }
  };

  if (loading) {
    return <Loading text="Loading admin control systems..." />;
  }

  return (
    <div className="container admin-container" style={{ paddingBottom: '60px' }}>
      <div className="admin-header-row">
        <div>
          <div className="section-banner">ADMINISTRATION</div>
          <h1 className="admin-title">TECXEL CHAMPIONSHIP CONSOLE</h1>
          <div style={{ fontSize: '0.85rem', color: 'var(--color-ink-secondary)', marginTop: '4px' }}>
            Logged in as: <strong>{admin?.email}</strong> ({admin?.role})
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button
            onClick={handleToggleFreeze}
            disabled={freezeToggling}
            className={`btn ${stats?.isFrozen ? 'btn-success' : 'btn-danger'}`}
            style={{ padding: '8px 16px', fontSize: '0.8rem' }}
          >
            {stats?.isFrozen ? '❄️ UNFREEZE LEADERBOARD' : '🔒 FREEZE LEADERBOARD'}
          </button>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="admin-tabs-nav">
        <button
          className={`admin-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => { setActiveTab('overview'); fetchStats(); }}
        >
          Overview
        </button>
        <button
          className={`admin-tab-btn ${activeTab === 'participants' ? 'active' : ''}`}
          onClick={() => setActiveTab('participants')}
        >
          Participants
        </button>
        <button
          className={`admin-tab-btn ${activeTab === 'results' ? 'active' : ''}`}
          onClick={() => setActiveTab('results')}
        >
          Results
        </button>
        <button
          className={`admin-tab-btn ${activeTab === 'passages' ? 'active' : ''}`}
          onClick={() => setActiveTab('passages')}
        >
          Passages
        </button>
        <button
          className={`admin-tab-btn ${activeTab === 'export' ? 'active' : ''}`}
          onClick={() => setActiveTab('export')}
        >
          Export
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div>
          {/* Key Metrics Grid */}
          <div className="admin-stats-grid">
            <div className="admin-stat-card">
              <div className="admin-stat-title">Registered Participants</div>
              <div className="admin-stat-number">{stats?.totalParticipants || 0}</div>
            </div>

            <div className="admin-stat-card">
              <div className="admin-stat-title">Completed Round 1</div>
              <div className="admin-stat-number">{stats?.completed?.round1 || 0}</div>
            </div>

            <div className="admin-stat-card">
              <div className="admin-stat-title">Completed Round 2</div>
              <div className="admin-stat-number">{stats?.completed?.round2 || 0}</div>
            </div>

            <div className="admin-stat-card">
              <div className="admin-stat-title">Completed Round 3</div>
              <div className="admin-stat-number">{stats?.completed?.round3 || 0}</div>
            </div>

            <div className="admin-stat-card">
              <div className="admin-stat-title">Full 3-Round Finishers</div>
              <div className="admin-stat-number" style={{ color: 'var(--color-success)' }}>
                {stats?.completed?.allThree || 0}
              </div>
            </div>

            <div className="admin-stat-card">
              <div className="admin-stat-title">Active Passages Pool</div>
              <div className="admin-stat-number">{stats?.passagesCount || 0}</div>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="admin-actions-card">
            <h3 className="admin-actions-title">CHAMPIONSHIP QUICK CONTROLS</h3>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <button onClick={() => setActiveTab('passages')} className="btn btn-primary">
                Manage Typing Passages
              </button>
              <button onClick={() => setActiveTab('participants')} className="btn btn-secondary">
                Search & Audit Participants
              </button>
              <button onClick={() => setActiveTab('export')} className="btn btn-secondary">
                Download Official Results
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'participants' && <Participants />}
      {activeTab === 'results' && <Results />}
      {activeTab === 'passages' && <Passages />}
      {activeTab === 'export' && <Export />}
    </div>
  );
}
