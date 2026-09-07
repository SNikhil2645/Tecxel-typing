import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import RoundCard from '../components/RoundCard';
import Loading from '../components/Loading';
import api from '../services/api';

export default function Rules() {
  const { participant } = useAuth();
  const navigate = useNavigate();

  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await api.get('/competition/status');
        setStatus(res.data);
      } catch (err) {
        console.error('Error fetching status:', err);
        setError('Failed to load competition progress.');
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, []);

  if (loading) {
    return <Loading text="Loading your championship progress..." />;
  }

  const roundsCompleted = status?.roundsCompleted || [];
  const currentRound = status?.currentRound || 1;
  const allDone = status?.allDone || roundsCompleted.length === 3;

  const getRoundStatus = (rNum) => {
    if (roundsCompleted.includes(rNum)) return 'completed';
    if (rNum === currentRound) return 'current';
    return 'locked';
  };

  const getRoundScore = (rNum) => {
    const found = status?.completedResults?.find((r) => r.round === rNum);
    return found ? found.roundScore : null;
  };

  return (
    <div className="container" style={{ paddingBottom: '60px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '36px' }}>
        <div className="section-banner">OFFICIAL CHAMPIONSHIP PROTOCOL</div>
        <h1 style={{ fontFamily: 'var(--font-pixel)', fontSize: '1.6rem', color: 'var(--color-ink)' }}>
          WELCOME, {participant?.name?.toUpperCase()}
        </h1>
        <p style={{ color: 'var(--color-ink-secondary)', marginTop: '8px' }}>
          Participant ID: <strong style={{ color: 'var(--color-primary)' }}>{participant?.participantId}</strong> · Course: {participant?.course}
        </p>
      </div>

      {allDone ? (
        <div className="tecxl-card" style={{ textAlign: 'center', marginBottom: '40px', borderColor: 'var(--color-success)' }}>
          <div className="badge badge-success" style={{ marginBottom: '12px' }}>ALL 3 ROUNDS COMPLETED</div>
          <h2 style={{ fontFamily: 'var(--font-pixel)', fontSize: '1.2rem', color: 'var(--color-ink)' }}>
            CHAMPIONSHIP GAUNTLET FINISHED!
          </h2>
          <p style={{ color: 'var(--color-ink-secondary)', margin: '12px auto', maxWidth: '600px' }}>
            You have successfully completed all three rounds of the TECXEL Typing Championship. Check your final score breakdown and current position on the live leaderboard.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '20px' }}>
            <button onClick={() => navigate('/final-result')} className="btn btn-primary btn-pixel">
              VIEW FINAL RESULT 🏅
            </button>
            <button onClick={() => navigate('/leaderboard')} className="btn btn-secondary">
              LIVE LEADERBOARD 🏆
            </button>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <button
            onClick={() => navigate(`/round/${currentRound}`)}
            className="btn btn-primary btn-pixel"
            style={{ padding: '16px 28px', fontSize: '0.9rem' }}
          >
            ENTER ROUND {currentRound} NOW →
          </button>
        </div>
      )}

      {/* Rounds Progression Cards */}
      <div className="rounds-overview-grid">
        <RoundCard
          roundNumber={1}
          title="The Sprinter"
          subtitle="ROUND 1 · FLOW & CADENCE"
          difficulty="easy"
          time="02:00 (2 Min)"
          description="Easy sentences, familiar words, high-velocity flow. Set a strong opening score."
          status={getRoundStatus(1)}
          score={getRoundScore(1)}
          onStart={getRoundStatus(1) === 'current' ? () => navigate('/round/1') : null}
        />

        <RoundCard
          roundNumber={2}
          title="The Precisionist"
          subtitle="ROUND 2 · PUNCTUATION MASTERY"
          difficulty="medium"
          time="03:00 (3 Min)"
          description="A natural, engaging story packed with dialogue, question marks, quotation marks, commas, and apostrophes. Speed with zero compromise on precision."
          status={getRoundStatus(2)}
          score={getRoundScore(2)}
          onStart={getRoundStatus(2) === 'current' ? () => navigate('/round/2') : null}
        />

        <RoundCard
          roundNumber={3}
          title="The Typing Master"
          subtitle="ROUND 3 · THE MASTER FINAL"
          difficulty="hard"
          time="05:00 (5 Min)"
          description="A realistic and substantial narrative containing dates, times, decimals, quotes, names, colons, and semicolons. The ultimate concentration gauntlet."
          status={getRoundStatus(3)}
          score={getRoundScore(3)}
          onStart={getRoundStatus(3) === 'current' ? () => navigate('/round/3') : null}
        />
      </div>

      <div className="tecxl-ribbon" style={{ margin: '36px 0' }}></div>

      {/* Scoring Protocol Card */}
      <div className="tecxl-card">
        <div className="tecxl-card-header">
          <h3 style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.95rem', color: 'var(--color-ink)' }}>
            SCORING SYSTEM & FORMULAS
          </h3>
          <span className="badge badge-primary">50% SPEED / 50% ACCURACY</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
          <div>
            <div style={{ fontWeight: 800, color: 'var(--color-primary)' }}>GROSS WPM</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', margin: '4px 0', background: 'var(--color-surface-dim)', padding: '6px' }}>
              (CorrectChars / 5) / Minutes
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-ink-secondary)' }}>
              Standard 5 characters per word. Displayed live during typing.
            </p>
          </div>

          <div>
            <div style={{ fontWeight: 800, color: 'var(--color-primary)' }}>ACCURACY RATE</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', margin: '4px 0', background: 'var(--color-surface-dim)', padding: '6px' }}>
              (Correct / TotalTyped) × 100
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-ink-secondary)' }}>
              Accuracy percentage directly contributes 50% of each round score.
            </p>
          </div>

          <div>
            <div style={{ fontWeight: 800, color: 'var(--color-primary)' }}>ROUND SCORE</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', margin: '4px 0', background: 'var(--color-surface-dim)', padding: '6px' }}>
              (SpeedScore × 0.5) + (Accuracy × 0.5)
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-ink-secondary)' }}>
              Normalized on a 0-100 scale. Speed score is based on a 100 WPM benchmark.
            </p>
          </div>

          <div>
            <div style={{ fontWeight: 800, color: 'var(--color-primary)' }}>FINAL SCORE</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', margin: '4px 0', background: 'var(--color-surface-dim)', padding: '6px' }}>
              (R1 + R2 + R3) / 3
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-ink-secondary)' }}>
              Averaged over all three rounds. Ties resolved by higher accuracy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
