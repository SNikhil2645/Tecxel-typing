/**
 * Server-Authoritative Score Calculator
 * Based on Section 10 of TECXEL Typing Championship Specifications
 */

function calculateMetrics(typedText, targetText, durationInSeconds) {
  const safeTyped = typedText || '';
  const safeTarget = targetText || '';
  const duration = Math.max(Number(durationInSeconds) || 1, 1);
  const minutesElapsed = duration / 60;

  let correctCharacters = 0;
  let errors = 0;

  const compareLength = Math.min(safeTyped.length, safeTarget.length);

  for (let i = 0; i < compareLength; i++) {
    if (safeTyped[i] === safeTarget[i]) {
      correctCharacters++;
    } else {
      errors++;
    }
  }

  // Any characters typed beyond target length are errors
  if (safeTyped.length > safeTarget.length) {
    errors += (safeTyped.length - safeTarget.length);
  }

  const totalCharacters = safeTyped.length;

  // Gross WPM = (correctCharacters / 5) / minutesElapsed
  const rawWpm = (correctCharacters / 5) / minutesElapsed;
  const wpm = Math.max(0, Math.round(rawWpm * 10) / 10);

  // Accuracy = (correctCharacters / totalCharacters) * 100
  const rawAccuracy = totalCharacters > 0 ? (correctCharacters / totalCharacters) * 100 : 0;
  const accuracy = Math.min(100, Math.max(0, Math.round(rawAccuracy * 100) / 100));

  // Speed score: 100 WPM = 100 points, capped at 100
  const speedScore = Math.min(100, Math.max(0, Math.round((wpm / 100) * 100 * 100) / 100));

  // Round score = (Speed Score * 0.5) + (Accuracy * 0.5)
  const roundScore = Math.min(100, Math.max(0, Math.round(((speedScore * 0.5) + (accuracy * 0.5)) * 100) / 100));

  return {
    correctCharacters,
    totalCharacters,
    errors,
    wpm,
    accuracy,
    speedScore,
    roundScore,
    duration: Math.round(duration),
  };
}

module.exports = {
  calculateMetrics,
};
