import React from 'react';
import { formatTime } from '../utils/scoring';

export default function Timer({ timeLeft, totalSeconds = 120 }) {
  const safeTotal = totalSeconds && totalSeconds > 0 ? totalSeconds : 120;
  const safeTimeLeft = typeof timeLeft === 'number' ? timeLeft : safeTotal;
  const isLow = safeTimeLeft <= 20;
  const progressPercent = Math.max(0, Math.min(100, (safeTimeLeft / safeTotal) * 100));

  return (
    <div className="timer-container">
      <div className={`timer-clock ${isLow ? 'warning' : ''}`}>
        ⏱ {formatTime(safeTimeLeft)}
      </div>
      <div className="timer-progress-track">
        <div
          className={`timer-progress-fill ${isLow ? 'low' : ''}`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
}
