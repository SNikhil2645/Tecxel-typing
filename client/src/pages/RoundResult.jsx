import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import Loading from '../components/Loading';
import api from '../services/api';
import '../styles/result.css';

export default function RoundResult() {
  const { round } = useParams();
  const roundNum = parseInt(round, 10);
  const navigate = useNavigate();
  const location = useLocation();

  const [result, setResult] = useState(location.state?.result || null);
  const [loading, setLoading] = useState(!result);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (result) return;

    const fetchResult = async () => {
      try {
        const res = await api.get(`/results/round/${roundNum}`);
        setResult(res.data);
      } catch (err) {
        console.error('Failed to load result:', err);
        setError(err.response?.data?.message || 'Could not load round result.');
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [roundNum, result]);

  if (loading) {
    return <Loading text={`Retrieving Round ${roundNum} Verified Results...`} />;
  }

  if (error || !result) {
    return (
      <div className="container" style={{ paddingTop: '40px' }}>
        <div className="tecxl-card" style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
          <div className="badge badge-danger">RESULT NOT FOUND</div>
          <h2 style={{ fontFamily: 'var(--font-pixel)', margin: '16px 0' }}>Round {roundNum} Result Unavailable</h2>
          <p style={{ color: 'var(--color-ink-secondary)', marginBottom: '20px' }}>
            {error || 'No submitted result found for this round.'}
          </p>
          <button onClick={() => navigate('/rules')} className="btn btn-primary">
            Return to Rules
          </button>
        </div>
      </div>
    );
  }

  const nextRound = roundNum + 1;
  const isLastRound = roundNum === 3;

  return (
    <div className="container" style={{ paddingBottom: '60px' }}>
      <div className="result-container">
        <div className="result-card">
          <div className="badge badge-primary" style={{ marginBottom: '12px' }}>
            OFFICIAL SERVER-VERIFIED RESULT
          </div>
          <h1 className="result-header-title">ROUND {roundNum} COMPLETE</h1>
          <div className="result-header-subtitle">SPEED & ACCURACY ASSESSMENT</div>

          {/* Primary Round Score Box */}
          <div className="score-highlight-box">
            <div className="score-highlight-label">ROUND {roundNum} SCORE</div>
            <div className="score-highlight-val">{result.roundScore}</div>
            <div className="score-highlight-sub">Points (Max 100)</div>
          </div>

          {/* Metrics Breakdown Grid */}
          <div className="metrics-breakdown-grid">
            <div className="metric-cell">
              <div className="metric-cell-title">Speed</div>
              <div className="metric-cell-number" style={{ color: 'var(--color-primary)' }}>
                {result.wpm} <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-sans)' }}>WPM</span>
              </div>
            </div>

            <div className="metric-cell">
              <div className="metric-cell-title">Accuracy</div>
              <div className="metric-cell-number" style={{ color: 'var(--color-success)' }}>
                {result.accuracy}%
              </div>
            </div>

            <div className="metric-cell">
              <div className="metric-cell-title">Speed Score</div>
              <div className="metric-cell-number">
                {result.speedScore} / 100
              </div>
            </div>

            <div className="metric-cell">
              <div className="metric-cell-title">Errors</div>
              <div className="metric-cell-number" style={{ color: result.errors > 0 ? 'var(--color-error)' : 'inherit' }}>
                {result.errors}
              </div>
            </div>
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
            Formula: ({result.speedScore} Speed × 0.5) + ({result.accuracy}% Accuracy × 0.5) = <strong>{result.roundScore} pts</strong>
          </div>

          {/* Action CTAs */}
          <div className="result-actions-group">
            {isLastRound ? (
              <button
                onClick={() => navigate('/final-result')}
                className="btn btn-primary btn-pixel"
                style={{ padding: '14px 24px' }}
              >
                VIEW FINAL RESULT 🏅
              </button>
            ) : roundNum === 2 ? (
              <button
                onClick={() => navigate('/round/3')}
                className="btn btn-primary btn-pixel"
                style={{ padding: '14px 24px' }}
              >
                CONTINUE TO FINAL ROUND →
              </button>
            ) : (
              <button
                onClick={() => navigate('/round/2')}
                className="btn btn-primary btn-pixel"
                style={{ padding: '14px 24px' }}
              >
                CONTINUE TO ROUND 2 →
              </button>
            )}

            <Link to="/leaderboard" className="btn btn-secondary">
              Check Leaderboard 🏆
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
