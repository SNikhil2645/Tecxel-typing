import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';

export default function Participants() {
  const [participants, setParticipants] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null); // { participantId, name }
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchParticipants = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/participants?search=${encodeURIComponent(search)}&limit=50`);
      setParticipants(res.data.participants || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error('Failed to fetch participants:', err);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchParticipants();
  }, [fetchParticipants]);

  const handleDisqualify = async (participantId) => {
    if (!window.confirm(`Disqualify participant ${participantId}?`)) return;
    try {
      await api.post('/admin/disqualify', { participantId });
      setActionMsg(`Participant ${participantId} disqualified.`);
      fetchParticipants();
    } catch (err) {
      alert('Error disqualifying participant.');
    }
  };

  const handleRequalify = async (participantId) => {
    try {
      await api.post('/admin/re-qualify', { participantId });
      setActionMsg(`Participant ${participantId} re-qualified.`);
      fetchParticipants();
    } catch (err) {
      alert('Error re-qualifying participant.');
    }
  };

  const handleResetRound = async (participantId, round) => {
    const confirm = window.prompt(`Reset Round ${round} for ${participantId}? Type YES to confirm:`);
    if (confirm !== 'YES') return;

    try {
      await api.post('/admin/reset-round', { participantId, round });
      setActionMsg(`Round ${round} reset for ${participantId}. Participant can now re-attempt.`);
      fetchParticipants();
    } catch (err) {
      alert('Error resetting round.');
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await api.delete(`/admin/participant/${deleteTarget.participantId}`);
      setActionMsg(res.data.message || `Participant ${deleteTarget.participantId} deleted.`);
      setDeleteTarget(null);
      fetchParticipants();
    } catch (err) {
      console.error('Delete error:', err);
      alert(err.response?.data?.message || 'Error deleting participant.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <div className="admin-search-bar">
        <input
          type="text"
          className="form-control"
          placeholder="Search by name, ID, roll, or course..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button onClick={fetchParticipants} className="btn btn-primary">
          Search
        </button>
      </div>

      {actionMsg && (
        <div className="anticheat-warning-banner" style={{ borderColor: 'var(--color-success)', marginBottom: '16px' }}>
          <div>✅ {actionMsg}</div>
          <button onClick={() => setActionMsg(null)} className="btn btn-secondary" style={{ padding: '2px 8px' }}>✕</button>
        </div>
      )}

      {/* Confirmation Dialog for Delete */}
      {deleteTarget && (
        <div className="countdown-overlay" style={{ zIndex: 999 }}>
          <div className="tecxl-card" style={{ maxWidth: '460px', textAlign: 'center', margin: '20px' }}>
            <div className="badge badge-danger" style={{ marginBottom: '12px' }}>
              CONFIRM DELETION
            </div>
            <h3 style={{ fontFamily: 'var(--font-pixel)', fontSize: '1rem', marginBottom: '12px' }}>
              DELETE PARTICIPANT?
            </h3>
            <p style={{ color: 'var(--color-ink-secondary)', fontSize: '0.9rem', marginBottom: '20px', lineHeight: 1.6 }}>
              Are you sure you want to delete participant <strong>{deleteTarget.name}</strong> ({deleteTarget.participantId})?
              <br />
              <span style={{ fontSize: '0.8rem', color: 'var(--color-error)' }}>
                This will permanently delete their account and all associated round results from the championship.
              </span>
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="btn btn-secondary"
                style={{ padding: '10px 20px' }}
              >
                CANCEL
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="btn btn-danger"
                style={{ padding: '10px 24px', backgroundColor: 'var(--color-error)' }}
              >
                {isDeleting ? 'DELETING...' : 'DELETE'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="leaderboard-table-card">
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name / Roll</th>
              <th>Course / Sec</th>
              <th>Email</th>
              <th>Rounds Done</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '30px' }}>Loading participants...</td>
              </tr>
            ) : participants.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '30px' }}>No participants found.</td>
              </tr>
            ) : (
              participants.map((p) => (
                <tr key={p._id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-primary)' }}>
                    {p.participantId}
                  </td>
                  <td>
                    <div style={{ fontWeight: 700 }}>{p.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-ink-secondary)' }}>{p.rollNumber}</div>
                  </td>
                  <td>
                    {p.course} · Year {p.year} ({p.section})
                  </td>
                  <td style={{ fontSize: '0.85rem' }}>{p.email}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {[1, 2, 3].map((r) => (
                        <span
                          key={r}
                          className="round-chip"
                          style={{
                            backgroundColor: p.roundsCompleted?.includes(r) ? 'var(--color-accent)' : '#eee',
                            color: p.roundsCompleted?.includes(r) ? '#fff' : '#888',
                          }}
                        >
                          R{r}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    {p.isDisqualified ? (
                      <span className="badge badge-danger">DISQUALIFIED</span>
                    ) : (
                      <span className="badge badge-success">ACTIVE</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                      {/* Delete Option with Confirmation */}
                      <button
                        onClick={() => setDeleteTarget({ participantId: p.participantId, name: p.name })}
                        className="btn btn-danger"
                        style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                        title={`Delete participant ${p.participantId}`}
                      >
                        Delete
                      </button>

                      {p.isDisqualified ? (
                        <button
                          onClick={() => handleRequalify(p.participantId)}
                          className="btn btn-secondary"
                          style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                        >
                          Re-qualify
                        </button>
                      ) : (
                        <button
                          onClick={() => handleDisqualify(p.participantId)}
                          className="btn btn-secondary"
                          style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                        >
                          Disqualify
                        </button>
                      )}

                      {[1, 2, 3].map((r) => (
                        <button
                          key={r}
                          onClick={() => handleResetRound(p.participantId, r)}
                          className="btn btn-secondary"
                          style={{ padding: '4px 6px', fontSize: '0.7rem' }}
                          title={`Reset Round ${r}`}
                        >
                          Reset R{r}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: '12px', fontSize: '0.85rem', color: 'var(--color-ink-muted)' }}>
        Total Registered Participants: {total}
      </div>
    </div>
  );
}
