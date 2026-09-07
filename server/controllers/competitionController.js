const Passage = require('../models/Passage');
const Result = require('../models/Result');

// GET /api/competition/status
const getStatus = async (req, res) => {
  try {
    const participantId = req.participantId;
    const completedResults = await Result.find({ participantId }).select('round completedAt roundScore wpm accuracy');
    const roundsCompleted = completedResults.map((r) => r.round).sort((a, b) => a - b);

    let currentRound = 1;
    if (roundsCompleted.includes(1) && !roundsCompleted.includes(2)) {
      currentRound = 2;
    } else if (roundsCompleted.includes(1) && roundsCompleted.includes(2) && !roundsCompleted.includes(3)) {
      currentRound = 3;
    } else if (roundsCompleted.length >= 3) {
      currentRound = 3;
    }

    const allDone = roundsCompleted.length === 3;

    return res.status(200).json({
      participantId,
      roundsCompleted,
      currentRound,
      allDone,
      completedResults,
    });
  } catch (error) {
    console.error('Error fetching competition status:', error);
    return res.status(500).json({ message: 'Server error checking competition status' });
  }
};

// GET /api/competition/round/:round
const getRoundPassage = async (req, res) => {
  try {
    const participantId = req.participantId;
    const roundNumber = parseInt(req.params.round, 10);

    if (![1, 2, 3].includes(roundNumber)) {
      return res.status(400).json({ message: 'Invalid round number. Must be 1, 2, or 3.' });
    }

    // Check if round is already completed
    const existingResult = await Result.findOne({ participantId, round: roundNumber });
    if (existingResult) {
      return res.status(409).json({
        message: `Round ${roundNumber} has already been completed. You cannot re-attempt this round.`,
        completed: true,
      });
    }

    // Enforce round progression (1 -> 2 -> 3)
    if (roundNumber > 1) {
      const prevRoundResult = await Result.findOne({ participantId, round: roundNumber - 1 });
      if (!prevRoundResult) {
        return res.status(403).json({
          message: `Round ${roundNumber - 1} must be completed before accessing Round ${roundNumber}.`,
        });
      }
    }

    // Fetch active passages for this round
    const passages = await Passage.find({ round: roundNumber, isActive: true });
    if (!passages || passages.length === 0) {
      return res.status(404).json({
        message: `No active passages found for Round ${roundNumber}. Please contact the administrator.`,
      });
    }

    // Randomly select one passage
    const randomIndex = Math.floor(Math.random() * passages.length);
    const selectedPassage = passages[randomIndex];

    const ROUND_DURATIONS = { 1: 120, 2: 180, 3: 300 };
    const roundDuration = ROUND_DURATIONS[roundNumber] || 120;

    return res.status(200).json({
      round: roundNumber,
      duration: roundDuration,
      totalPassages: passages.length,
      passage: {
        _id: selectedPassage._id,
        title: selectedPassage.title,
        content: selectedPassage.content,
        difficulty: selectedPassage.difficulty,
        duration: roundDuration,
        characterCount: selectedPassage.characterCount || selectedPassage.content.length,
      },
    });
  } catch (error) {
    console.error('Error fetching round passage:', error);
    return res.status(500).json({ message: 'Server error retrieving round passage' });
  }
};

module.exports = {
  getStatus,
  getRoundPassage,
};
