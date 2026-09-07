import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';

export default function Passages() {
  const [passages, setPassages] = useState([]);
  const [roundFilter, setRoundFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  const [formData, setFormData] = useState({
    round: '1',
    title: '',
    difficulty: 'easy',
    content: '',
  });

  const fetchPassages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/passages${roundFilter ? `?round=${roundFilter}` : ''}`);
      setPassages(res.data.passages || []);
    } catch (err) {
      console.error('Failed to fetch passages:', err);
    } finally {
      setLoading(false);
    }
  }, [roundFilter]);

  useEffect(() => {
    fetchPassages();
  }, [fetchPassages]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/passage', {
        round: parseInt(formData.round, 10),
        title: formData.title,
        difficulty: formData.difficulty,
        content: formData.content,
      });
      setIsAdding(false);
      setFormData({ round: '1', title: '', difficulty: 'easy', content: '' });
      fetchPassages();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating passage');
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      await api.put(`/admin/passage/${id}`, { isActive: !currentStatus });
      fetchPassages();
    } catch (err) {
      alert('Error updating passage');
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete passage "${title}"?`)) return;
    try {
      await api.delete(`/admin/passage/${id}`);
      fetchPassages();
    } catch (err) {
      alert('Error deleting passage');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <select
            className="form-control"
            style={{ width: '160px' }}
            value={roundFilter}
            onChange={(e) => setRoundFilter(e.target.value)}
          >
            <option value="">All Rounds</option>
            <option value="1">Round 1 (Sprinter)</option>
            <option value="2">Round 2 (Precisionist)</option>
            <option value="3">Round 3 (Typing Master)</option>
          </select>
        </div>

        <button onClick={() => setIsAdding(!isAdding)} className="btn btn-primary">
          {isAdding ? '✕ Cancel' : '+ Add New Passage'}
        </button>
      </div>

      {isAdding && (
        <div className="tecxl-card" style={{ marginBottom: '24px', backgroundColor: '#F8F9FA' }}>
          <h3 style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.95rem', marginBottom: '16px' }}>
            NEW PASSAGE GENERATOR
          </h3>
          <form onSubmit={handleCreate}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Round</label>
                <select
                  className="form-control"
                  value={formData.round}
                  onChange={(e) => setFormData({ ...formData, round: e.target.value })}
                >
                  <option value="1">Round 1 (Sprinter)</option>
                  <option value="2">Round 2 (Precisionist)</option>
                  <option value="3">Round 3 (Typing Master)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Difficulty</label>
                <select
                  className="form-control"
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Passage Title</label>
              <input
                type="text"
                required
                className="form-control"
                placeholder="e.g. Distributed Consensus Algorithms"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Passage Content (The text participants type)</label>
              <textarea
                required
                rows={5}
                className="form-control font-mono"
                placeholder="Type or paste the complete passage content here..."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              />
              <div style={{ fontSize: '0.8rem', color: 'var(--color-ink-muted)', marginTop: '4px' }}>
                Character count: {formData.content.length}
              </div>
            </div>

            <button type="submit" className="btn btn-success">
              Save Passage to Competition Pool
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading passages...</div>
      ) : passages.length === 0 ? (
        <div className="tecxl-card" style={{ textAlign: 'center', padding: '40px' }}>
          No passages found. Click "+ Add New Passage" or run the seed script.
        </div>
      ) : (
        passages.map((p) => (
          <div key={p._id} className="passage-card-item">
            <div className="passage-card-header">
              <div>
                <span className="badge badge-primary" style={{ marginRight: '8px' }}>
                  ROUND {p.round}
                </span>
                <strong style={{ fontSize: '1.05rem' }}>{p.title}</strong>
                <span style={{ marginLeft: '8px', fontSize: '0.8rem', color: 'var(--color-ink-secondary)' }}>
                  ({p.characterCount || p.content.length} chars · {p.difficulty})
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => handleToggleActive(p._id, p.isActive)}
                  className={`btn ${p.isActive ? 'btn-secondary' : 'btn-success'}`}
                  style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                >
                  {p.isActive ? 'Disable' : 'Enable'}
                </button>
                <button
                  onClick={() => handleDelete(p._id, p.title)}
                  className="btn btn-danger"
                  style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                >
                  Delete
                </button>
              </div>
            </div>
            <div className="passage-card-text">{p.content}</div>
          </div>
        ))
      )}
    </div>
  );
}
