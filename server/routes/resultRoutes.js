const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { submitResult, getMyResults, getRoundResult } = require('../controllers/resultController');

router.post('/submit', auth, submitResult);
router.get('/my-results', auth, getMyResults);
router.get('/round/:round', auth, getRoundResult);

module.exports = router;
