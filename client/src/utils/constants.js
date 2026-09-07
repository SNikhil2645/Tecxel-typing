/**
 * Central Competition & Round Configuration
 * Exact Timings:
 * - Round 1: 2 Minutes (120 Seconds), Display: 02:00
 * - Round 2: 3 Minutes (180 Seconds), Display: 03:00
 * - Round 3 / Final: 5 Minutes (300 Seconds), Display: 05:00
 */

export const ROUND_CONFIG = {
  1: {
    round: 1,
    title: 'The Sprinter',
    subtitle: 'ROUND 1 · FLOW & CADENCE',
    difficulty: 'easy',
    duration: 120, // 2 minutes (02:00)
    displayTime: '02:00',
    timeLabel: '2:00 Fixed',
    description: 'Easy sentences, familiar words, high-velocity flow. Set a strong opening score.',
  },
  2: {
    round: 2,
    title: 'The Precisionist',
    subtitle: 'ROUND 2 · PUNCTUATION MASTERY',
    difficulty: 'medium',
    duration: 180, // 3 minutes (03:00)
    displayTime: '03:00',
    timeLabel: '3:00 Fixed',
    description: 'A natural, engaging story packed with dialogue, question marks, quotation marks, commas, and apostrophes. Speed with zero compromise on precision.',
  },
  3: {
    round: 3,
    title: 'The Typing Master',
    subtitle: 'ROUND 3 · THE MASTER FINAL',
    difficulty: 'hard',
    duration: 300, // 5 minutes (05:00)
    displayTime: '05:00',
    timeLabel: '5:00 Fixed',
    description: 'A realistic and substantial narrative containing dates, times, decimals, quotes, names, colons, and semicolons. The ultimate concentration gauntlet.',
  },
};

export const getRoundDuration = (roundNum) => {
  const num = parseInt(roundNum, 10);
  if (num === 2) return 180;
  if (num === 3) return 300;
  return 120;
};
