const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getStatus, getRoundPassage } = require('../controllers/competitionController');

router.get('/status', auth, getStatus);
router.get('/round/:round', auth, getRoundPassage);

module.exports = router;
