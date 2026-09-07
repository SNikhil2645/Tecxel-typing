import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TypingEngine from '../components/TypingEngine';
import Loading from '../components/Loading';
import api from '../services/api';
import { ROUND_CONFIG, getRoundDuration } from '../utils/constants';

export default function Round() {
  const { round } = useParams();
  const navigate = useNavigate();
  const roundNum = parseInt(round, 10);

  const [passageData, setPassageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (![1, 2, 3].includes(roundNum)) {
      navigate('/rules', { replace: true });
      return;
    }

    const fetchRound = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/competition/round/${roundNum}`);
        setPassageData(res.data);
      } catch (err) {
        console.error('Failed to load round:', err);
        if (err.response && err.response.status === 409) {
          // Round already completed!
          if (roundNum === 3) {
            navigate('/final-result', { replace: true });
          } else {
            navigate(`/result/${roundNum}`, { replace: true });
          }
          return;
        }
        if (err.response && err.response.status === 403) {
          setError(err.response.data.message || 'Must complete previous round first.');
          return;
        }
        setError(err.response?.data?.message || 'Error loading passage from server.');
      } finally {
        setLoading(false);
      }
    };

    fetchRound();
  }, [roundNum, navigate]);

  const handleRoundComplete = (resultData) => {
    // Navigate to round result screen, or for round 3 directly to final result
    if (roundNum === 3) {
      navigate('/final-result', { state: { result: resultData } });
    } else {
      navigate(`/result/${roundNum}`, { state: { result: resultData } });
    }
  };

  if (loading) {
    return <Loading text={`Preparing Round ${roundNum} Arena...`} />;
  }

  if (error) {
    return (
      <div className="container" style={{ paddingTop: '40px' }}>
        <div className="tecxl-card" style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
          <div className="badge badge-danger" style={{ marginBottom: '16px' }}>ACCESS RESTRICTED</div>
          <h2 style={{ fontFamily: 'var(--font-pixel)', fontSize: '1.2rem', color: 'var(--color-ink)' }}>
            ROUND {roundNum} NOT AVAILABLE
          </h2>
          <p style={{ color: 'var(--color-ink-secondary)', margin: '16px 0' }}>{error}</p>
          <button onClick={() => navigate('/rules')} className="btn btn-primary">
            Back to Rules & Progress
          </button>
        </div>
      </div>
    );
  }

  const roundConfig = ROUND_CONFIG[roundNum] || {
    title: `Round ${roundNum}`,
    difficulty: 'easy',
    duration: getRoundDuration(roundNum),
  };

  const exactDuration =
    passageData?.duration ||
    passageData?.passage?.duration ||
    roundConfig.duration ||
    getRoundDuration(roundNum);

  return (
    <div className="container" style={{ paddingTop: '10px', paddingBottom: '40px' }}>
      <TypingEngine
        key={`typing-engine-round-${roundNum}`}
        roundNumber={roundNum}
        roundTitle={passageData?.passage?.title || roundConfig.title}
        difficulty={passageData?.passage?.difficulty || roundConfig.difficulty}
        passageId={passageData?.passage?._id}
        targetText={passageData?.passage?.content || ''}
        durationSeconds={exactDuration}
        onComplete={handleRoundComplete}
      />
    </div>
  );
}
