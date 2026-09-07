import React from 'react';
import { Link } from 'react-router-dom';

export default function RoundCard({
  roundNumber,
  title,
  subtitle,
  description,
  difficulty,
  time = '2 Minutes',
  status = 'available', // 'completed' | 'current' | 'locked'
  score = null,
  onStart,
}) {
  return (
    <div className="round-info-card">
      <div className="round-info-badge">ROUND {roundNumber}</div>
      <h3 className="round-info-title">{title}</h3>
      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '8px' }}>
        {subtitle}
      </div>
      <p className="round-info-desc">{description}</p>

      <div className="round-info-meta">
        <span>⏱ {time}</span>
        <span style={{ textTransform: 'capitalize' }}>🔥 {difficulty}</span>
        <span>
          {status === 'completed' && <span className="badge badge-success">COMPLETED</span>}
          {status === 'current' && <span className="badge badge-accent">NEXT UP</span>}
          {status === 'locked' && <span className="badge" style={{ opacity: 0.6 }}>LOCKED</span>}
        </span>
      </div>

      {score !== null && (
        <div style={{ marginTop: '12px', fontSize: '0.85rem', fontWeight: 700 }}>
          Round Score: <span style={{ color: 'var(--color-primary)' }}>{score} pts</span>
        </div>
      )}

      {status === 'current' && onStart && (
        <button onClick={onStart} className="btn btn-primary" style={{ marginTop: '14px', width: '100%' }}>
          Start Round {roundNumber}
        </button>
      )}

      {status === 'current' && !onStart && (
        <Link to={`/round/${roundNumber}`} className="btn btn-primary" style={{ marginTop: '14px', width: '100%' }}>
          Enter Round {roundNumber}
        </Link>
      )}

      {status === 'completed' && (
        <Link to={`/result/${roundNumber}`} className="btn btn-secondary" style={{ marginTop: '14px', width: '100%' }}>
          View Result
        </Link>
      )}
    </div>
  );
}
