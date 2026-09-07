import { useState, useMemo, useCallback } from 'react';
import { calculateLiveStats } from '../utils/scoring';

export function useTypingEngine(targetText = '', secondsElapsed = 1) {
  const [typedText, setTypedText] = useState('');

  const handleInputChange = useCallback((value) => {
    // Only allow typing up to target text length + safety margin
    if (value.length <= targetText.length + 50) {
      setTypedText(value);
    }
  }, [targetText.length]);

  const resetTyping = useCallback(() => {
    setTypedText('');
  }, []);

  // Character breakdown for target text display
  const characterList = useMemo(() => {
    const chars = [];
    const targetLen = targetText.length;
    const typedLen = typedText.length;

    for (let i = 0; i < targetLen; i++) {
      const targetChar = targetText[i];
      let status = 'pending';

      if (i < typedLen) {
        status = typedText[i] === targetChar ? 'correct' : 'incorrect';
      }

      chars.push({
        char: targetChar,
        status,
        isCursor: i === typedLen,
      });
    }

    return chars;
  }, [targetText, typedText]);

  // Compute live metrics
  const stats = useMemo(() => {
    return calculateLiveStats(typedText, targetText, secondsElapsed);
  }, [typedText, targetText, secondsElapsed]);

  const isComplete = typedText.length >= targetText.length && targetText.length > 0;

  return {
    typedText,
    handleInputChange,
    resetTyping,
    characterList,
    stats,
    isComplete,
  };
}
