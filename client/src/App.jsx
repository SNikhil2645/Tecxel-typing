import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import Rules from './pages/Rules';
import Round from './pages/Round';
import RoundResult from './pages/RoundResult';
import FinalResult from './pages/FinalResult';
import LeaderboardPage from './pages/LeaderboardPage';
import AdminLogin from './pages/Admin/AdminLogin';
import Dashboard from './pages/Admin/Dashboard';

export default function App() {
  return (
    <>
      <Navbar />

      <main className="main-content">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          {/* Leaderboard is admin-only */}
          <Route
            path="/leaderboard"
            element={
              <ProtectedRoute requireAdmin={true}>
                <LeaderboardPage />
              </ProtectedRoute>
            }
          />

          {/* Participant Protected Routes */}
          <Route
            path="/rules"
            element={
              <ProtectedRoute>
                <Rules />
              </ProtectedRoute>
            }
          />
          <Route
            path="/round/:round"
            element={
              <ProtectedRoute>
                <Round />
              </ProtectedRoute>
            }
          />
          <Route
            path="/result/:round"
            element={
              <ProtectedRoute>
                <RoundResult />
              </ProtectedRoute>
            }
          />
          <Route
            path="/final-result"
            element={
              <ProtectedRoute>
                <FinalResult />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin={true}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/:tab"
            element={
              <ProtectedRoute requireAdmin={true}>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Footer with TECXEL Diagonal Ribbon and Tagline */}
      <footer className="tecxl-footer">
        <div className="tecxl-ribbon"></div>
        <div className="tecxl-footer-ribbon-text">
          ★ THINK BEYOND · BUILD BEYOND ★ TECXEL 2026
        </div>
        <div className="tecxl-footer-info">
          TECXEL Typing Championship · Server-Authoritative Competition System · 50% Speed + 50% Accuracy
        </div>
      </footer>
    </>
  );
}
