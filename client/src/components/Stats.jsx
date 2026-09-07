import React from 'react';

export default function Stats({ wpm = 0, accuracy = 100, errors = 0, speedScore = 0 }) {
  return (
    <div className="live-stats-bar">
      <div className="stat-box">
        <div className="stat-box-label">Speed (WPM)</div>
        <div className="stat-box-value accent">{wpm}</div>
      </div>
      <div className="stat-box">
        <div className="stat-box-label">Accuracy</div>
        <div className="stat-box-value">{accuracy}%</div>
      </div>
      <div className="stat-box">
        <div className="stat-box-label">Errors</div>
        <div className={`stat-box-value ${errors > 0 ? 'danger' : ''}`}>{errors}</div>
      </div>
      <div className="stat-box">
        <div className="stat-box-label">Speed Score</div>
        <div className="stat-box-value">{speedScore}</div>
      </div>
    </div>
  );
}
