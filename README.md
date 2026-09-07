# TECXEL — Typing Championship 2026

> **Event:** TECXEL "Think Beyond, Build Beyond" · 8–9 Sep 2026  
> **Tech Stack:** React 18 (Vite) · Node.js + Express · MongoDB (Mongoose) + In-Memory Fallback  
> **Scale:** ~50 concurrent users · 3 rounds · No elimination  
> **Scoring:** 50% Speed (Gross WPM) + 50% Accuracy · Server-Authoritative  

---

## ⚡ Quick Start

### 1. Start Backend Server
```bash
cd server
npm install
npm start
```
The server will start at `http://localhost:5000`.
- If a local MongoDB or Atlas cluster is available, it connects automatically.
- If no MongoDB instance is running, it automatically spins up an in-memory database and seeds 30 passages (10 per round) and the default admin account.

### 2. Start Frontend Client
In a new terminal window:
```bash
cd client
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🔑 Default Credentials

- **Admin Portal:** `http://localhost:5173/admin/login`
  - **Email:** `admin@tecxl.com`
  - **Password:** `admin123`
- **Participant Access:**
  - Register at `http://localhost:5173/register` to receive an auto-generated Participant ID (e.g. `TCX-001`).

---

## 🏆 Championship Format

1. **Round 1 — The Sprinter**: Flowing prose, common vocabulary, establishing baseline cadence (2:00 fixed).
2. **Round 2 — The Precisionist**: Heavy punctuation, dialog, quotes, dashes, and semicolons (2:00 fixed).
3. **Round 3 — The Typing Master**: Programming syntax, numbers, brackets, and code tokens (2:00 fixed).
4. **Final Scoring**:
   - **Gross WPM** = `(correctCharacters / 5) / minutesElapsed`
   - **Accuracy** = `(correctCharacters / totalTypedCharacters) * 100`
   - **Speed Score** = `min(WPM, 100)`
   - **Round Score** = `(Speed Score × 0.5) + (Accuracy × 0.5)`
   - **Final Championship Score** = `(Round 1 + Round 2 + Round 3) / 3`

---

## 🛡️ Anti-Cheating System

- **Paste Prevention:** Clipboard pasting, Ctrl+V, Shift+Insert, and context menus are completely blocked.
- **Tab Switch Audit:** Real-time `visibilitychange` detector logs window unfocus events. Warnings appear after 3 switches, and automatic disqualification occurs at 5.
- **Single Attempt Lock:** Once a round is submitted, participants cannot re-attempt unless an admin resets their round.
- **Server Authority:** The server independently recomputes all metrics from raw keystrokes and server-stored passages.

---

## 🧪 Testing

Run the automated unit and end-to-end integration test suite:
```bash
cd server
npm test
```
The test suite validates:
- Score calculator math and benchmark normalization
- Participant registration, duplicate rejection, and login
- Single attempt locks and round progression guards
- Full 3-round gauntlet completion and final score aggregation
- Live leaderboard rank assignment
- Admin controls and CSV export generation

---

## 📡 Local Fest LAN Deployment (Option B)

To run the championship on a local college network without external internet:
1. Find the host laptop's local IP address (`ipconfig` on Windows, e.g. `192.168.1.50`).
2. Set `PORT=5000` in `server/.env`.
3. In `client/vite.config.js`, set `server: { host: '0.0.0.0', port: 5173 }`.
4. Participants connect via college Wi-Fi to `http://192.168.1.50:5173`.
