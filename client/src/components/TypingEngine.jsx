import React, { useState, useEffect, useRef, useCallback, memo, forwardRef } from 'react';
import { useTimer } from '../hooks/useTimer';
import { useAntiCheat } from '../hooks/useAntiCheat';
import { useTypingEngine } from '../hooks/useTypingEngine';
import Timer from './Timer';
import Stats from './Stats';
import TypingInput from './TypingInput';
import api from '../services/api';
import { getRoundDuration } from '../utils/constants';
import { formatTime } from '../utils/scoring';
import '../styles/typing.css';

// Memoized per-character span. Only re-renders when a character's own
// appearance changes, so an entire long passage no longer reconciles on
// every keystroke (this was the main cause of typing feeling "paused" on
// laptops during the long Round 3 passages).
const CharSpan = memo(
  forwardRef(function CharSpan({ char, status, isCursor }, ref) {
    let className = 'char-pending';
    if (status === 'correct') className = 'char-correct';
    if (status === 'incorrect') className = 'char-incorrect';

    return (
      <span ref={ref} className={`${className} ${isCursor ? 'char-cursor' : ''}`}>
        {char}
      </span>
    );
  }),
  (prev, next) =>
    prev.char === next.char &&
    prev.status === next.status &&
    prev.isCursor === next.isCursor
);

export default function TypingEngine({
  roundNumber = 1,
  roundTitle,
  difficulty = 'easy',
  passageId,
  targetText = '',
  durationSeconds,
  onComplete,
}) {
  const roundNum = parseInt(roundNumber, 10) || 1;
  const targetDuration = Number(durationSeconds) || getRoundDuration(roundNum);

  const [hasStarted, setHasStarted] = useState(false);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [startTime, setStartTime] = useState(null);

  const isSubmittingRef = useRef(false);
  const startTimeRef = useRef(null);
  const targetContainerRef = useRef(null);
  const cursorRef = useRef(null);
  const typedTextRef = useRef('');

  // Anti-cheat hook (active only after participant clicks START)
  const { tabSwitches, warningMessage, clearWarning, enterFullscreen } = useAntiCheat({
    isActive: hasStarted && !isSubmitting && !isTimeUp,
  });

  // Submit Handler with strict duplicate-request prevention
  const performSubmit = useCallback(async (textToSubmit) => {
    // Synchronous double-submission check
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setIsSubmitting(true);
    setSubmitError(null);

    const actualTyped = textToSubmit !== undefined ? textToSubmit : typedTextRef.current;
    const effectiveStartTime = startTimeRef.current || new Date(Date.now() - targetDuration * 1000);
    const endTime = new Date();

    const payload = {
      round: roundNum,
      passageId,
      typedText: actualTyped,
      startTime: effectiveStartTime,
      endTime,
      tabSwitches,
    };

    try {
      const res = await api.post('/results/submit', payload);
      if (onComplete) {
        onComplete(res.data);
      }
    } catch (err) {
      console.error('Submission error:', err);
      const errMsg =
        err.response?.data?.message ||
        'Network error while submitting round result. Please click Retry.';
      setSubmitError(errMsg);
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  }, [roundNum, passageId, targetDuration, tabSwitches, onComplete]);

  // Timer hook initialized with the exact round duration
  const { timeLeft, timeElapsed, startTimer, pauseTimer } = useTimer(targetDuration, () => {
    // When the timer reaches 00:00: stop typing immediately and submit
    setIsTimeUp(true);
    performSubmit(typedTextRef.current);
  });

  // Typing logic hook
  const { typedText, handleInputChange, characterList, stats, isComplete } = useTypingEngine(
    targetText,
    timeElapsed
  );

  // Keep typedTextRef up to date
  useEffect(() => {
    typedTextRef.current = typedText;
  }, [typedText]);

  // Handle participant manually clicking the START button
  const handleStartRound = () => {
    if (hasStarted) return;
    const now = new Date();
    startTimeRef.current = now;
    setStartTime(now);
    setHasStarted(true);
    setIsTimeUp(false);
    startTimer();
    enterFullscreen();
  };

  // If user completes typing the entire passage before timer expires
  useEffect(() => {
    if (isComplete && hasStarted && !isTimeUp && !isSubmittingRef.current) {
      setIsTimeUp(true);
      pauseTimer();
      performSubmit(typedText);
    }
  }, [isComplete, hasStarted, isTimeUp, typedText, pauseTimer, performSubmit]);

  // Auto-scroll target text when cursor moves (rAF-throttled to avoid
  // synchronous layout thrash on every keystroke)
  useEffect(() => {
    if (cursorRef.current && targetContainerRef.current) {
      const container = targetContainerRef.current;
      const cursor = cursorRef.current;

      const rafId = requestAnimationFrame(() => {
        const cursorTop = cursor.offsetTop;
        const cursorBottom = cursorTop + cursor.offsetHeight;
        const viewTop = container.scrollTop;
        const viewBottom = viewTop + container.clientHeight;

        if (cursorBottom > viewBottom - 30) {
          container.scrollTop = cursorBottom - container.clientHeight + 40;
        } else if (cursorTop < viewTop + 30) {
          container.scrollTop = Math.max(0, cursorTop - 30);
        }
      });

      return () => cancelAnimationFrame(rafId);
    }
  }, [typedText.length]);

  const isFinalRound = roundNumber === 3;
  const startButtonLabel = isFinalRound
    ? '▶ START FINAL ROUND'
    : `▶ START ROUND ${roundNumber}`;

  const submitButtonLabel = isSubmitting
    ? isFinalRound
      ? 'SUBMITTING FINAL RESULT...'
      : 'SUBMITTING RESULT...'
    : isFinalRound
    ? 'SUBMIT FINAL RESULT 🏅'
    : `SUBMIT ROUND ${roundNumber} RESULT →`;

  return (
    <div className="typing-container">
      {/* Header bar */}
      <div className="typing-header-bar">
        <div className="round-pill">
          <span className="pixel-cube"></span>
          <span>ROUND {roundNumber} — {roundTitle?.toUpperCase()}</span>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span
            className={`badge ${
              difficulty === 'hard'
                ? 'badge-danger'
                : difficulty === 'medium'
                ? 'badge-primary'
                : 'badge-success'
            }`}
          >
            {difficulty?.toUpperCase()}
          </span>
          <span className="badge badge-primary">
            DURATION: {Math.floor(targetDuration / 60)} MIN ({formatTime(targetDuration)})
          </span>
          {tabSwitches > 0 && (
            <span className="badge badge-danger">
              Tab Switches: {tabSwitches}/5
            </span>
          )}
        </div>
      </div>

      {/* Anti-cheat warning alert banner */}
      {warningMessage && (
        <div className="anticheat-warning-banner">
          <div>⚠️ {warningMessage}</div>
          <button
            onClick={clearWarning}
            className="btn btn-secondary"
            style={{ padding: '2px 8px', fontSize: '0.75rem' }}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Live Stats */}
      <Stats
        wpm={hasStarted ? stats.wpm : 0}
        accuracy={hasStarted ? stats.accuracy : 100}
        errors={hasStarted ? stats.errors : 0}
        speedScore={hasStarted ? stats.speedScore : 0}
      />

      {/* Countdown Timer */}
      <Timer timeLeft={timeLeft} totalSeconds={targetDuration} />

      {/* Pre-Start Instructions Card (Shown before clicking START) */}
      {!hasStarted && (
        <div
          className="tecxl-card"
          style={{
            backgroundColor: '#F8F9FA',
            border: '2px solid var(--color-primary)',
            padding: '16px 20px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div>
            <div
              style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '0.85rem',
                color: 'var(--color-primary)',
                marginBottom: '4px',
              }}
            >
              📖 READ THE PASSAGE CAREFULLY
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--color-ink-secondary)' }}>
              The timer will NOT begin until you click the Start button. Prepare your hands on the home keys.
            </div>
          </div>

          <button
            onClick={handleStartRound}
            className="btn btn-primary btn-pixel"
            style={{
              padding: '14px 28px',
              fontSize: '0.9rem',
              backgroundColor: 'var(--color-success)',
              boxShadow: '4px 4px 0px var(--color-ink)',
            }}
          >
            {startButtonLabel}
          </button>
        </div>
      )}

      {/* Target Text Display with character highlights */}
      <div className="target-text-panel" ref={targetContainerRef}>
        {characterList.map((item, index) => (
          <CharSpan
            key={index}
            char={item.char}
            status={item.status}
            isCursor={Boolean(item.isCursor && hasStarted)}
            ref={item.isCursor && hasStarted ? cursorRef : undefined}
          />
        ))}
      </div>

      {/* Typing Input */}
      <TypingInput
        value={typedText}
        onChange={handleInputChange}
        disabled={!hasStarted || isTimeUp || isSubmitting}
        autoFocus={hasStarted && !isTimeUp}
        placeholder={
          !hasStarted
            ? 'The passage is displayed above for reading. Click the START button to begin typing...'
            : isTimeUp
            ? 'Time is up! Typing has stopped.'
            : 'Type the passage here...'
        }
      />

      {/* Completion & Manual Submit Action Bar */}
      {isTimeUp && (
        <div
          className="tecxl-card"
          style={{
            backgroundColor: '#F0F4FF',
            border: '2px solid var(--color-primary)',
            padding: '20px',
            textAlign: 'center',
            marginBottom: '20px',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '1rem',
              color: 'var(--color-primary)',
              marginBottom: '8px',
            }}
          >
            {isFinalRound ? '🏁 FINAL ROUND COMPLETE' : `🏁 ROUND ${roundNumber} COMPLETE`}
          </div>
          <p style={{ color: 'var(--color-ink-secondary)', fontSize: '0.9rem', marginBottom: '16px' }}>
            {isFinalRound
              ? 'Click below to submit your final round and compute your overall Championship Score and Ranking.'
              : 'Click below to submit your round and proceed to your verified results.'}
          </p>

          <button
            onClick={() => performSubmit(typedText)}
            disabled={isSubmitting}
            className="btn btn-primary btn-pixel"
            style={{
              padding: '16px 32px',
              fontSize: '0.95rem',
              opacity: isSubmitting ? 0.7 : 1,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
            }}
          >
            {submitButtonLabel}
          </button>
        </div>
      )}

      {/* Submission error message with Retry CTA */}
      {submitError && (
        <div
          className="anticheat-warning-banner"
          style={{
            borderColor: 'var(--color-error)',
            backgroundColor: 'var(--color-error-bg)',
            marginTop: '16px',
          }}
        >
          <div>❌ {submitError}</div>
          <button
            onClick={() => performSubmit(typedText)}
            disabled={isSubmitting}
            className="btn btn-danger"
            style={{ padding: '6px 14px', fontSize: '0.8rem' }}
          >
            {isSubmitting ? 'Retrying...' : 'Retry Submit'}
          </button>
        </div>
      )}

      {/* Submitting Overlay with Loading Indicator */}
      {isSubmitting && (
        <div className="countdown-overlay">
          <div
            style={{
              width: '40px',
              height: '40px',
              border: '4px solid #ffffff',
              borderTopColor: 'var(--color-accent)',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              marginBottom: '20px',
            }}
          />
          <div className="font-pixel" style={{ fontSize: '1.2rem', marginBottom: '12px' }}>
            {isFinalRound ? 'CALCULATING FINAL CHAMPIONSHIP SCORE...' : 'RECORDING ROUND RESULTS...'}
          </div>
          <div style={{ color: '#D0D5DD', fontSize: '0.9rem' }}>
            Authoritative server-side verification in progress. Please wait...
          </div>
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
