const Result = require('../models/Result');
const Passage = require('../models/Passage');
const Participant = require('../models/Participant');
const { calculateMetrics } = require('../utils/scoreCalculator');

const ROUND_CONFIG = {
  1: { duration: 120, title: 'The Sprinter' },
  2: { duration: 180, title: 'The Precisionist' },
  3: { duration: 300, title: 'The Typing Master' },
};

// POST /api/results/submit
const submitResult = async (req, res) => {
  try {
    const participantId = req.participantId;
    const { round, passageId, typedText, startTime, endTime, tabSwitches = 0 } = req.body;

    const roundNumber = parseInt(round, 10);
    if (![1, 2, 3].includes(roundNumber)) {
      return res.status(400).json({ message: 'Invalid round number. Must be 1, 2, or 3.' });
    }

    // 1. Verify if round was already completed
    const existing = await Result.findOne({ participantId, round: roundNumber });
    if (existing) {
      // If already recorded (e.g. participant retried or duplicate network request),
      // return 200 OK with the saved metrics. This guarantees that retries or rapid clicks never fail!
      return res.status(200).json({
        message: `Round ${roundNumber} submitted successfully!`,
        round: existing.round,
        wpm: existing.wpm,
        accuracy: existing.accuracy,
        errors: existing.errors,
        speedScore: existing.speedScore,
        roundScore: existing.roundScore,
        finalScore: existing.finalScore,
        duration: existing.duration,
        completedAt: existing.completedAt,
      });
    }

    // 2. Progression check: ensure earlier rounds were done
    if (roundNumber > 1) {
      const prevResult = await Result.findOne({ participantId, round: roundNumber - 1 });
      if (!prevResult) {
        return res.status(403).json({ message: `Must complete Round ${roundNumber - 1} before submitting Round ${roundNumber}.` });
      }
    }

    // 3. Fetch passage directly from DB — never trust client text
    let passage = null;
    if (passageId) {
      passage = await Passage.findById(passageId);
    }
    if (!passage) {
      passage = await Passage.findOne({ round: roundNumber, isActive: true });
    }

    if (!passage) {
      return res.status(404).json({ message: `No active passage found for Round ${roundNumber}.` });
    }

    // 4. Timestamp & duration calculation based on exact round configuration
    const roundNominalDuration = ROUND_CONFIG[roundNumber]?.duration || 120;
    const start = startTime ? new Date(startTime) : new Date(Date.now() - roundNominalDuration * 1000);
    const end = endTime ? new Date(endTime) : new Date();
    let durationSeconds = (end.getTime() - start.getTime()) / 1000;

    // Safety checks on duration
    if (isNaN(durationSeconds) || durationSeconds < 1) {
      durationSeconds = roundNominalDuration;
    }
    durationSeconds = Math.min(Math.max(durationSeconds, 2), roundNominalDuration + 30);

    // 5. Anti-cheat tab switch check: if >= 5 switches, mark participant disqualified
    const switches = Number(tabSwitches) || 0;
    if (switches >= 5) {
      await Participant.findOneAndUpdate({ participantId }, { isDisqualified: true });
      return res.status(403).json({
        message: 'Disqualified due to excessive tab switches (anti-cheating policy).',
        disqualified: true,
      });
    }

    // 6. Calculate all metrics on the server
    const metrics = calculateMetrics(typedText || '', passage.content, durationSeconds);

    // 7. Check if this completes all 3 rounds and compute finalScore
    let finalScore = null;

    if (roundNumber === 3) {
      const r1 = await Result.findOne({ participantId, round: 1 });
      const r2 = await Result.findOne({ participantId, round: 2 });
      const r1Score = r1 ? r1.roundScore : 0;
      const r2Score = r2 ? r2.roundScore : 0;
      const avgScore = (r1Score + r2Score + metrics.roundScore) / 3;
      finalScore = Math.round(avgScore * 100) / 100;
    }

    // Create Result document
    const resultDoc = new Result({
      participantId,
      round: roundNumber,
      typedText: typedText || '',
      targetText: passage.content,
      correctCharacters: metrics.correctCharacters,
      totalCharacters: metrics.totalCharacters,
      errors: metrics.errors,
      wpm: metrics.wpm,
      accuracy: metrics.accuracy,
      speedScore: metrics.speedScore,
      roundScore: metrics.roundScore,
      finalScore: finalScore,
      tabSwitches: switches,
      startTime: start,
      endTime: end,
      duration: metrics.duration,
      completedAt: new Date(),
    });

    try {
      await resultDoc.save();
    } catch (saveErr) {
      // If a race condition caused duplicate key 11000, retrieve the saved record
      if (saveErr.code === 11000) {
        const saved = await Result.findOne({ participantId, round: roundNumber });
        if (saved) {
          return res.status(200).json({
            message: `Round ${roundNumber} submitted successfully!`,
            round: saved.round,
            wpm: saved.wpm,
            accuracy: saved.accuracy,
            errors: saved.errors,
            speedScore: saved.speedScore,
            roundScore: saved.roundScore,
            finalScore: saved.finalScore,
            duration: saved.duration,
            completedAt: saved.completedAt,
          });
        }
      }
      throw saveErr;
    }

    // If finalScore was calculated, update round 1 and 2 results as well
    if (finalScore !== null) {
      await Result.updateMany({ participantId }, { finalScore });
    }

    return res.status(201).json({
      message: `Round ${roundNumber} submitted successfully!`,
      round: roundNumber,
      wpm: metrics.wpm,
      accuracy: metrics.accuracy,
      errors: metrics.errors,
      speedScore: metrics.speedScore,
      roundScore: metrics.roundScore,
      finalScore: finalScore,
      duration: metrics.duration,
      completedAt: resultDoc.completedAt,
    });
  } catch (error) {
    console.error('Submit result error:', error);
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Result for this round was already recorded.' });
    }
    return res.status(500).json({ message: 'Server error processing round submission', error: error.message });
  }
};

// GET /api/results/my-results
const getMyResults = async (req, res) => {
  try {
    const participantId = req.participantId;
    const results = await Result.find({ participantId }).sort({ round: 1 });

    const roundData = results.map((r) => ({
      round: r.round,
      wpm: r.wpm,
      accuracy: r.accuracy,
      errors: r.errors,
      speedScore: r.speedScore,
      roundScore: r.roundScore,
      duration: r.duration,
      completedAt: r.completedAt,
    }));

    let finalScore = null;
    if (results.length === 3) {
      const avg = results.reduce((acc, curr) => acc + curr.roundScore, 0) / 3;
      finalScore = Math.round(avg * 100) / 100;
    }

    // Calculate current rank among all 3-round finishers
    let rank = null;
    if (finalScore !== null) {
      const finishers = await Result.aggregate([
        { $match: { finalScore: { $ne: null } } },
        { $group: { _id: '$participantId', finalScore: { $first: '$finalScore' } } },
        { $sort: { finalScore: -1 } },
      ]);
      const rankIndex = finishers.findIndex((f) => f._id === participantId);
      if (rankIndex !== -1) {
        rank = rankIndex + 1;
      }
    }

    return res.status(200).json({
      participantId,
      rounds: roundData,
      finalScore,
      rank,
      totalCompleted: results.length,
    });
  } catch (error) {
    console.error('Error getting participant results:', error);
    return res.status(500).json({ message: 'Server error retrieving results' });
  }
};

// GET /api/results/round/:round
const getRoundResult = async (req, res) => {
  try {
    const participantId = req.participantId;
    const roundNumber = parseInt(req.params.round, 10);

    const result = await Result.findOne({ participantId, round: roundNumber });
    if (!result) {
      return res.status(404).json({ message: `No result found for Round ${roundNumber}` });
    }

    return res.status(200).json({
      round: result.round,
      wpm: result.wpm,
      accuracy: result.accuracy,
      errors: result.errors,
      speedScore: result.speedScore,
      roundScore: result.roundScore,
      finalScore: result.finalScore,
      duration: result.duration,
      completedAt: result.completedAt,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error retrieving round result' });
  }
};

module.exports = {
  submitResult,
  getMyResults,
  getRoundResult,
};
