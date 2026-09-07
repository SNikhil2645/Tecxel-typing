import React, { useState, useEffect, useCallback } from 'react';
import Leaderboard from '../components/Leaderboard';
import Loading from '../components/Loading';
import api from '../services/api';

export default function LeaderboardPage() {
  const [data, setData] = useState({ leaderboard: [], isFrozen: false });
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(Date.now());
  const [isProjectorMode, setIsProjectorMode] = useState(false);

  const fetchLeaderboard = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const res = await api.get('/leaderboard');
      setData({
        leaderboard: res.data.leaderboard || [],
        isFrozen: Boolean(res.data.isFrozen),
      });
      setLastUpdated(Date.now());
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchLeaderboard(false);
  }, [fetchLeaderboard]);

  // Polling every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchLeaderboard(true);
    }, 10000);

    return () => clearInterval(interval);
  }, [fetchLeaderboard]);

  const toggleProjectorMode = () => {
    setIsProjectorMode((prev) => !prev);
  };

  if (loading) {
    return <Loading text="Loading live championship standings..." />;
  }

  return (
    <div
      className={isProjectorMode ? 'projector-view' : 'container'}
      style={
        isProjectorMode
          ? {
              backgroundColor: '#0A0A0A',
              color: '#ffffff',
              minHeight: '100vh',
              padding: '40px 20px',
            }
          : { paddingBottom: '60px' }
      }
    >
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
        <button
          onClick={toggleProjectorMode}
          className="btn btn-secondary"
          style={{ fontSize: '0.8rem', padding: '6px 12px' }}
        >
          {isProjectorMode ? '✕ Exit Stage Mode' : '📺 Stage Projector View'}
        </button>
      </div>

      <Leaderboard
        leaderboard={data.leaderboard}
        isFrozen={data.isFrozen}
        onRefresh={() => fetchLeaderboard(false)}
        lastUpdated={lastUpdated}
        isLive={!data.isFrozen}
      />
    </div>
  );
}
