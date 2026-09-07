import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';

export default function Results() {
  const [results, setResults] = useState([]);
  const [roundFilter, setRoundFilter] = useState('');
  const [participantFilter, setParticipantFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchResults = useCallback(async () => {
    setLoading(true);
    try {
      let query = '';
      if (roundFilter) query += `round=${roundFilter}&`;
      if (participantFilter) query += `participantId=${encodeURIComponent(participantFilter)}&`;

      const res = await api.get(`/admin/results?${query}`);
      setResults(res.data.results || []);
    } catch (err) {
      console.error('Failed to fetch results:', err);
    } finally {
      setLoading(false);
    }
  }, [roundFilter, participantFilter]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  return (
    <div>
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <select
          className="form-control"
          style={{ width: '160px' }}
          value={roundFilter}
          onChange={(e) => setRoundFilter(e.target.value)}
        >
          <option value="">All Rounds</option>
          <option value="1">Round 1</option>
          <option value="2">Round 2</option>
          <option value="3">Round 3</option>
        </select>

        <input
          type="text"
          className="form-control"
          style={{ maxWidth: '240px' }}
          placeholder="Filter Participant ID..."
          value={participantFilter}
          onChange={(e) => setParticipantFilter(e.target.value)}
        />

        <button onClick={fetchResults} className="btn btn-primary">
          Filter
        </button>
      </div>

      <div className="leaderboard-table-card">
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th>Participant</th>
              <th>Round</th>
              <th>WPM</th>
              <th>Accuracy</th>
              <th>Errors</th>
              <th>Speed Pts</th>
              <th>Round Score</th>
              <th>Tab Switches</th>
              <th>Duration</th>
              <th>Submitted At</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="10" style={{ textAlign: 'center', padding: '30px' }}>Loading results...</td>
              </tr>
            ) : results.length === 0 ? (
              <tr>
                <td colSpan="10" style={{ textAlign: 'center', padding: '30px' }}>No results match the filters.</td>
              </tr>
            ) : (
              results.map((r) => (
                <tr key={r._id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-primary)' }}>
                    {r.participantId}
                  </td>
                  <td><strong>Round {r.round}</strong></td>
                  <td>{r.wpm}</td>
                  <td>{r.accuracy}%</td>
                  <td style={{ color: r.errors > 0 ? 'var(--color-error)' : 'inherit' }}>{r.errors}</td>
                  <td>{r.speedScore}</td>
                  <td style={{ fontWeight: 800, color: 'var(--color-primary)' }}>{r.roundScore}</td>
                  <td>
                    {r.tabSwitches > 0 ? (
                      <span className="badge badge-danger">{r.tabSwitches}</span>
                    ) : (
                      '0'
                    )}
                  </td>
                  <td>{r.duration}s</td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--color-ink-secondary)' }}>
                    {new Date(r.completedAt).toLocaleTimeString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
