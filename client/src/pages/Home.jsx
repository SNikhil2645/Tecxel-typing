import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import RoundCard from '../components/RoundCard';
import '../styles/home.css';

export default function Home() {
  const { isAuthenticated, participant } = useAuth();

  return (
    <div className="container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-tagline-top">
          THINK BEYOND · BUILD BEYOND · 8–9 SEP 2026
        </div>

        <h1 className="hero-title">
          TECXEL PRESENTS<br />TYPING CHAMPIONSHIP
        </h1>

        <div className="hero-subtitle">
          SPEED × ACCURACY × PRECISION
        </div>

        <div className="hero-cta-group">
          {isAuthenticated ? (
            <Link to="/rules" className="btn btn-primary btn-pixel">
              CONTINUE CHAMPIONSHIP →
            </Link>
          ) : (
            <>
              <Link to="/register" className="btn btn-primary btn-pixel">
                REGISTER TO COMPETE
              </Link>
              <Link to="/login" className="btn btn-secondary">
                PARTICIPANT LOGIN
              </Link>
            </>
          )}
          <Link to="/leaderboard" className="btn btn-secondary">
            VIEW LEADERBOARD 🏆
          </Link>
        </div>

        {/* Event Highlights Ribbon Bar */}
        <div className="event-details-bar">
          <div className="event-stat">
            <span className="event-stat-label">Rounds</span>
            <span className="event-stat-val">3 ROUNDS</span>
          </div>
          <div className="event-stat">
            <span className="event-stat-label">Round Timings</span>
            <span className="event-stat-val">2m / 3m / 5m</span>
          </div>
          <div className="event-stat">
            <span className="event-stat-label">Scoring Balance</span>
            <span className="event-stat-val">50% SPEED + 50% ACC</span>
          </div>
          <div className="event-stat">
            <span className="event-stat-label">Format</span>
            <span className="event-stat-val">NO ELIMINATION</span>
          </div>
        </div>
      </section>

      <div className="tecxl-ribbon" style={{ margin: '24px 0 48px' }}></div>

      {/* Rounds Overview */}
      <section>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div className="section-banner">COMPETITION STRUCTURE</div>
          <h2 style={{ fontFamily: 'var(--font-pixel)', fontSize: '1.2rem', color: 'var(--color-ink)' }}>
            THREE GAUNTLETS OF INCREASING MASTERY
          </h2>
          <p style={{ color: 'var(--color-ink-secondary)', marginTop: '8px' }}>
            Every participant completes all three rounds. Your final ranking is determined by your averaged score.
          </p>
        </div>

        <div className="rounds-overview-grid">
          <RoundCard
            roundNumber={1}
            title="The Sprinter"
            subtitle="ROUND 1 · PURE CADENCE"
            difficulty="easy"
            time="02:00 (2 Min)"
            description="Pure, flowing prose with common vocabulary. Warm up your fingers, establish a rhythmic stroke, and build momentum."
            status="available"
          />

          <RoundCard
            roundNumber={2}
            title="The Precisionist"
            subtitle="ROUND 2 · PUNCTUATION & CADENCE"
            difficulty="medium"
            time="03:00 (3 Min)"
            description="Challenging, natural stories packed with dialogue, question marks, quotation marks, and commas. Accuracy counts for half your score."
            status="available"
          />

          <RoundCard
            roundNumber={3}
            title="The Typing Master"
            subtitle="ROUND 3 · THE MASTER FINAL"
            difficulty="hard"
            time="05:00 (5 Min)"
            description="Realistic and long narrative articles with dates, times, decimals, quotes, names, and numbers. The ultimate concentration gauntlet."
            status="available"
          />
        </div>
      </section>

      {/* Rules Snapshot Banner */}
      <section className="tecxl-card" style={{ marginTop: '48px', marginBottom: '48px' }}>
        <div className="tecxl-card-header">
          <h3 style={{ fontFamily: 'var(--font-pixel)', fontSize: '1rem', color: 'var(--color-ink)' }}>
            SERVER-AUTHORITATIVE RULES
          </h3>
          <span className="badge badge-primary">FAIR PLAY</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
          <div>
            <div style={{ fontWeight: 800, color: 'var(--color-primary)' }}>1. ANTI-PASTE SYSTEM</div>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-ink-secondary)', marginTop: '4px' }}>
              Pasting, context menus, and drag-and-drop are blocked. Every character must be struck organically.
            </p>
          </div>
          <div>
            <div style={{ fontWeight: 800, color: 'var(--color-primary)' }}>2. TAB SWITCH AUDIT</div>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-ink-secondary)', marginTop: '4px' }}>
              Switching windows or tabs is logged in real-time. Exceeding 5 tab switches results in immediate disqualification.
            </p>
          </div>
          <div>
            <div style={{ fontWeight: 800, color: 'var(--color-primary)' }}>3. NO ELIMINATIONS</div>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-ink-secondary)', marginTop: '4px' }}>
              Everyone participates through all 3 rounds. Final ranking is computed as the average of all 3 rounds.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
