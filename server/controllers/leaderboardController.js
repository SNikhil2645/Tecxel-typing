const Result = require('../models/Result');
const Participant = require('../models/Participant');

// Leaderboard state (can be toggled by admin)
let isLeaderboardFrozen = false;
let frozenLeaderboardSnapshot = null;

const getLeaderboard = async (req, res) => {
  try {
    if (isLeaderboardFrozen && frozenLeaderboardSnapshot) {
      return res.status(200).json({
        isFrozen: true,
        leaderboard: frozenLeaderboardSnapshot,
      });
    }

    // Find all results where finalScore is set (participants who completed round 3)
    const participantsWithFinalScore = await Result.aggregate([
      { $match: { finalScore: { $ne: null } } },
      {
        $group: {
          _id: '$participantId',
          finalScore: { $first: '$finalScore' },
        },
      },
      { $sort: { finalScore: -1 } },
    ]);

    if (!participantsWithFinalScore || participantsWithFinalScore.length === 0) {
      return res.status(200).json({
        isFrozen: isLeaderboardFrozen,
        leaderboard: [],
      });
    }

    const participantIds = participantsWithFinalScore.map((p) => p._id);

    // Fetch participant details (exclude disqualified)
    const participants = await Participant.find({
      participantId: { $in: participantIds },
      isDisqualified: false,
    }).select('participantId name course year section');

    const participantMap = new Map();
    participants.forEach((p) => {
      participantMap.set(p.participantId, p);
    });

    // Fetch all rounds for these participants
    const allResults = await Result.find({
      participantId: { $in: participantIds },
    }).select('participantId round wpm accuracy roundScore duration');

    const roundsMap = new Map();
    allResults.forEach((r) => {
      if (!roundsMap.has(r.participantId)) {
        roundsMap.set(r.participantId, []);
      }
      roundsMap.get(r.participantId).push({
        round: r.round,
        wpm: r.wpm,
        accuracy: r.accuracy,
        roundScore: r.roundScore,
        duration: r.duration,
      });
    });

    // Build ranked list
    const leaderboard = [];
    let rank = 1;

    for (const item of participantsWithFinalScore) {
      const pInfo = participantMap.get(item._id);
      // Skip disqualified or removed
      if (!pInfo) continue;

      const pRounds = (roundsMap.get(item._id) || []).sort((a, b) => a.round - b.round);

      leaderboard.push({
        rank,
        participantId: pInfo.participantId,
        name: pInfo.name,
        course: pInfo.course,
        year: pInfo.year,
        section: pInfo.section,
        finalScore: item.finalScore,
        rounds: pRounds,
      });

      rank++;
    }

    return res.status(200).json({
      isFrozen: isLeaderboardFrozen,
      leaderboard,
    });
  } catch (error) {
    console.error('Leaderboard error:', error);
    return res.status(500).json({ message: 'Server error retrieving leaderboard' });
  }
};

const toggleFreeze = (frozen) => {
  isLeaderboardFrozen = Boolean(frozen);
  if (!isLeaderboardFrozen) {
    frozenLeaderboardSnapshot = null;
  }
};

const setFrozenSnapshot = (snapshot) => {
  frozenLeaderboardSnapshot = snapshot;
};

const getFreezeStatus = () => isLeaderboardFrozen;

module.exports = {
  getLeaderboard,
  toggleFreeze,
  setFrozenSnapshot,
  getFreezeStatus,
};
