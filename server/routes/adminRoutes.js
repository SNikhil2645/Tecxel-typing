const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const {
  getDashboardStats,
  getParticipants,
  getResults,
  getPassages,
  addPassage,
  updatePassage,
  deletePassage,
  disqualifyParticipant,
  requalifyParticipant,
  resetRound,
  deleteParticipant,
  toggleLeaderboardFreeze,
  exportResults,
} = require('../controllers/adminController');

// All admin routes are protected by adminAuth
router.use(adminAuth);

router.get('/dashboard', getDashboardStats);
router.get('/participants', getParticipants);
router.get('/results', getResults);
router.get('/passages', getPassages);
router.post('/passage', addPassage);
router.put('/passage/:id', updatePassage);
router.delete('/passage/:id', deletePassage);
router.post('/disqualify', disqualifyParticipant);
router.post('/re-qualify', requalifyParticipant);
router.post('/reset-round', resetRound);
router.delete('/participant/:participantId', deleteParticipant);
router.post('/freeze-leaderboard', toggleLeaderboardFreeze);
router.get('/export', exportResults);

module.exports = router;
