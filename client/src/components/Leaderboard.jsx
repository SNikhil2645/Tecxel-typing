import React from 'react';
import '../styles/leaderboard.css';

export default function Leaderboard({
  leaderboard = [],
  isFrozen = false,
  onRefresh,
  lastUpdated,
  isLive = true,
}) {
  const topThree = leaderboard.slice(0, 3);
  const first = topThree[0];
  const second = topThree[1];
  const third = topThree[2];

  return (
    <div className="leaderboard-container">
      {isFrozen && (
        <div className="frozen-banner">
          <span>❄️</span>
          <span>
            LEADERBOARD IS CURRENTLY FROZEN BY ADMINISTRATION — FINAL SCORES ARE LOCKED.
          </span>
        </div>
      )}

      <div className="leaderboard-header-row">
        <div>
          <h2 className="leaderboard-title">CHAMPIONSHIP LEADERBOARD</h2>
          <div className="leaderboard-refresh-info">
            {isLive && <span>🟢 Auto-refreshing every 10s</span>}
            {lastUpdated && <span>· Last updated: {new Date(lastUpdated).toLocaleTimeString()}</span>}
          </div>
        </div>

        {onRefresh && (
          <button onClick={onRefresh} className="btn btn-secondary">
            🔄 Refresh Now
          </button>
        )}
      </div>

      {/* Podium for Top 3 */}
      {topThree.length > 0 && (
        <div className="podium-container">
          {/* 2nd Place */}
          <div className="podium-card podium-second">
            <div className="podium-medal">🥈</div>
            <div className="podium-name">{second ? second.name : '—'}</div>
            <div className="podium-id">{second ? second.participantId : 'TCX-???'}</div>
            <div className="podium-score">{second ? `${second.finalScore} pts` : '—'}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-ink-secondary)', marginTop: '4px' }}>
              {second ? `${second.course} · Sec ${second.section}` : ''}
            </div>
          </div>

          {/* 1st Place */}
          <div className="podium-card podium-first">
            <div className="podium-medal">🥇</div>
            <div className="podium-name" style={{ fontSize: '1.25rem' }}>{first ? first.name : '—'}</div>
            <div className="podium-id" style={{ fontSize: '0.85rem' }}>{first ? first.participantId : 'TCX-???'}</div>
            <div className="podium-score" style={{ fontSize: '1.8rem', color: 'var(--color-primary)' }}>
              {first ? `${first.finalScore} pts` : '—'}
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-primary)', marginTop: '6px' }}>
              SPEED + ACCURACY MASTER
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-ink-secondary)', marginTop: '2px' }}>
              {first ? `${first.course} · Sec ${first.section}` : ''}
            </div>
          </div>

          {/* 3rd Place */}
          <div className="podium-card podium-third">
            <div className="podium-medal">🥉</div>
            <div className="podium-name">{third ? third.name : '—'}</div>
            <div className="podium-id">{third ? third.participantId : 'TCX-???'}</div>
            <div className="podium-score">{third ? `${third.finalScore} pts` : '—'}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-ink-secondary)', marginTop: '4px' }}>
              {third ? `${third.course} · Sec ${third.section}` : ''}
            </div>
          </div>
        </div>
      )}

      {/* Full Leaderboard Table */}
      <div className="leaderboard-table-card">
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th style={{ width: '70px' }}>Rank</th>
              <th>Participant</th>
              <th>Course / Year</th>
              <th>Round 1</th>
              <th>Round 2</th>
              <th>Round 3</th>
              <th style={{ textAlign: 'right' }}>Final Score</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--color-ink-muted)' }}>
                  No participants have completed all 3 rounds yet. Scores will appear here once submitted!
                </td>
              </tr>
            ) : (
              leaderboard.map((entry) => {
                let rankClass = '';
                if (entry.rank === 1) rankClass = 'rank-gold';
                else if (entry.rank === 2) rankClass = 'rank-silver';
                else if (entry.rank === 3) rankClass = 'rank-bronze';

                const r1 = entry.rounds?.find((r) => r.round === 1);
                const r2 = entry.rounds?.find((r) => r.round === 2);
                const r3 = entry.rounds?.find((r) => r.round === 3);

                return (
                  <tr key={entry.participantId}>
                    <td>
                      <span className={`leaderboard-rank-badge ${rankClass}`}>
                        {entry.rank}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700 }}>{entry.name}</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--color-primary)' }}>
                        {entry.participantId}
                      </div>
                    </td>
                    <td>
                      {entry.course} · Year {entry.year} ({entry.section})
                    </td>
                    <td>
                      {r1 ? (
                        <div className="round-chips">
                          <span className="round-chip">{r1.wpm} WPM</span>
                          <span className="round-chip">{r1.roundScore} pt</span>
                        </div>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td>
                      {r2 ? (
                        <div className="round-chips">
                          <span className="round-chip">{r2.wpm} WPM</span>
                          <span className="round-chip">{r2.roundScore} pt</span>
                        </div>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td>
                      {r3 ? (
                        <div className="round-chips">
                          <span className="round-chip">{r3.wpm} WPM</span>
                          <span className="round-chip">{r3.roundScore} pt</span>
                        </div>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span className="leaderboard-final-score">{entry.finalScore}</span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
