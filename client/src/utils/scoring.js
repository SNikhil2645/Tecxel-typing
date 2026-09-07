/**
 * Client-Side Score Helpers for Live UX Feedback
 * (Server remains authoritative source of truth)
 */

export function calculateLiveStats(typedText = '', targetText = '', secondsElapsed = 1) {
  const safeTyped = typedText || '';
  const safeTarget = targetText || '';
  const durationSec = Math.max(secondsElapsed, 1);
  const minutesElapsed = durationSec / 60;

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

  if (safeTyped.length > safeTarget.length) {
    errors += safeTyped.length - safeTarget.length;
  }

  const totalCharacters = safeTyped.length;

  const rawWpm = (correctCharacters / 5) / minutesElapsed;
  const wpm = Math.max(0, Math.round(rawWpm * 10) / 10);

  const rawAccuracy = totalCharacters > 0 ? (correctCharacters / totalCharacters) * 100 : 100;
  const accuracy = Math.min(100, Math.max(0, Math.round(rawAccuracy * 10) / 10));

  const speedScore = Math.min(100, Math.max(0, Math.round(wpm)));
  const roundScore = Math.min(100, Math.max(0, Math.round(((speedScore * 0.5) + (accuracy * 0.5)) * 100) / 100));

  return {
    correctCharacters,
    totalCharacters,
    errors,
    wpm,
    accuracy,
    speedScore,
    roundScore,
  };
}

export function formatTime(seconds) {
  const safeSec = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(safeSec / 60);
  const secs = safeSec % 60;
  const minStr = String(mins).padStart(2, '0');
  const secStr = String(secs).padStart(2, '0');
  return `${minStr}:${secStr}`;
}
