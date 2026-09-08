import React, { useState, useCallback } from 'react';
import api from '../../services/api';
import Leaderboard from '../../components/Leaderboard';
import Loading from '../../components/Loading';

export default function AdminLeaderboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [resetting, setResetting] = useState(false);

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/leaderboard');
      setData(res.data);
    } catch (err) {
      console.error('Failed to load leaderboard:', err);
      setError(err.response?.data?.message || 'Failed to load leaderboard.');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const handleReset = async () => {
    if (!window.confirm('Restart the leaderboard? This will permanently delete ALL round scores and results for every participant. This cannot be undone.')) {
      return;
    }
    setResetting(true);
    setError(null);
    try {
      const res = await api.post('/admin/reset-leaderboard');
      alert(res.data.message || 'Leaderboard restarted.');
      await fetchLeaderboard();
    } catch (err) {
      console.error('Failed to reset leaderboard:', err);
      setError(err.response?.data?.message || 'Failed to reset leaderboard.');
    } finally {
      setResetting(false);
    }
  };

  return (
    <div>
      <div className="admin-header-row" style={{ marginBottom: '20px' }}>
        <div>
          <h3 className="admin-actions-title">ADMIN LEADERBOARD VIEW</h3>
          <div style={{ fontSize: '0.85rem', color: 'var(--color-ink-secondary)', marginTop: '4px' }}>
            Live read of the public leaderboard. Use restart to clear all scores and start a fresh championship.
          </div>
        </div>
        <button
          onClick={handleReset}
          disabled={resetting}
          className="btn btn-danger"
          style={{ padding: '8px 16px', fontSize: '0.8rem' }}
        >
          {resetting ? 'RESTARTING...' : '🔄 RESTART LEADERBOARD'}
        </button>
      </div>

      {error && (
        <div className="anticheat-warning-banner" style={{ borderColor: 'var(--color-error)', marginBottom: '20px' }}>
          <div>⚠️ {error}</div>
        </div>
      )}

      {loading && !data ? (
        <Loading text="Loading leaderboard..." />
      ) : (
        <Leaderboard
          leaderboard={data?.leaderboard || []}
          isFrozen={data?.isFrozen || false}
          onRefresh={fetchLeaderboard}
          isLive={false}
        />
      )}
    </div>
  );
}