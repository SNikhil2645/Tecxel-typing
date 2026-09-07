import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/Loading';
import api from '../services/api';
import '../styles/result.css';

export default function FinalResult() {
  const { participant } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await api.get('/results/my-results');
        setData(res.data);

        // Fire confetti celebration if participant finished all 3 rounds!
        if (res.data?.rounds?.length === 3) {
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#1B2A9E', '#3B5BFF', '#D4AF37', '#2E7D32'],
          });
        }
      } catch (err) {
        console.error('Error fetching final results:', err);
        setError('Failed to load final championship scores.');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  if (loading) {
    return <Loading text="Aggregating all 3 championship rounds..." />;
  }

  const rounds = data?.rounds || [];
  const finalScore = data?.finalScore;
  const rank = data?.rank;

  if (rounds.length < 3) {
    return (
      <div className="container" style={{ paddingTop: '40px' }}>
        <div className="tecxl-card" style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
          <div className="badge badge-primary" style={{ marginBottom: '16px' }}>ROUNDS INCOMPLETE</div>
          <h2 style={{ fontFamily: 'var(--font-pixel)', fontSize: '1.1rem' }}>
            YOU HAVE COMPLETED {rounds.length} OF 3 ROUNDS
          </h2>
          <p style={{ color: 'var(--color-ink-secondary)', margin: '16px 0' }}>
            To receive your official Final Score and Championship Rank, all 3 rounds must be finished.
          </p>
          <button onClick={() => navigate('/rules')} className="btn btn-primary btn-pixel">
            CONTINUE ROUNDS →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingBottom: '60px' }}>
      <div className="result-container">
        <div className="result-card">
          <div className="badge badge-success" style={{ marginBottom: '12px' }}>
            CHAMPIONSHIP FINISHER 🏅
          </div>
          <h1 className="result-header-title">{participant?.name?.toUpperCase()}</h1>
          <div className="result-header-subtitle">
            PARTICIPANT ID: {participant?.participantId} · {participant?.course}
          </div>

          {/* Final Score and Rank Dual Highlight */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap', margin: '24px 0' }}>
            <div className="score-highlight-box" style={{ margin: 0, minWidth: '220px' }}>
              <div className="score-highlight-label">FINAL SCORE</div>
              <div className="score-highlight-val">{finalScore}</div>
              <div className="score-highlight-sub">Average of 3 Rounds</div>
            </div>

            <div className="score-highlight-box" style={{ margin: 0, minWidth: '220px', borderColor: '#D4AF37' }}>
              <div className="score-highlight-label">OVERALL RANK</div>
              <div className="score-highlight-val" style={{ color: rank <= 3 ? '#D4AF37' : 'var(--color-primary)' }}>
                {rank ? `#${rank}` : '—'}
              </div>
              <div className="score-highlight-sub">Championship Standing</div>
            </div>
          </div>

          {/* Detailed 3-Round Table */}
          <div style={{ marginTop: '32px' }}>
            <h3 style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.9rem', marginBottom: '14px', textAlign: 'left' }}>
              ROUND-BY-ROUND BREAKDOWN
            </h3>

            <table className="final-rounds-table">
              <thead>
                <tr>
                  <th>Round</th>
                  <th>Speed (WPM)</th>
                  <th>Accuracy</th>
                  <th>Errors</th>
                  <th>Speed Pts</th>
                  <th>Round Score</th>
                </tr>
              </thead>
              <tbody>
                {rounds.map((r) => (
                  <tr key={r.round}>
                    <td style={{ fontWeight: 800 }}>Round {r.round}</td>
                    <td>{r.wpm} WPM</td>
                    <td>{r.accuracy}%</td>
                    <td>{r.errors}</td>
                    <td>{r.speedScore}</td>
                    <td style={{ fontWeight: 800, color: 'var(--color-primary)' }}>{r.roundScore} pts</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div
            style={{
              backgroundColor: 'var(--color-surface-dim)',
              padding: '12px 16px',
              border: '1.5px solid #D0D5DD',
              fontSize: '0.85rem',
              color: 'var(--color-ink-secondary)',
              marginBottom: '28px',
            }}
          >
            Formula: ({rounds[0]?.roundScore || 0} + {rounds[1]?.roundScore || 0} + {rounds[2]?.roundScore || 0}) / 3 = <strong>{finalScore} pts</strong>
          </div>

          {/* Action CTAs */}
          <div className="result-actions-group">
            <Link to="/leaderboard" className="btn btn-primary btn-pixel" style={{ padding: '14px 28px' }}>
              VIEW LIVE LEADERBOARD 🏆
            </Link>
            <Link to="/" className="btn btn-secondary">
              Home Page
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
