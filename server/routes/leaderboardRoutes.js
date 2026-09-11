const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const { getLeaderboard } = require('../controllers/leaderboardController');

// Leaderboard is admin-only. Participants no longer have public access.
router.get('/', adminAuth, getLeaderboard);

module.exports = router;
