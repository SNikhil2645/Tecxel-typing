import { useState, useEffect, useCallback } from 'react';

export function useAntiCheat({ isActive = false, onDisqualify, onWarning } = {}) {
  const [tabSwitches, setTabSwitches] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(Boolean(document.fullscreenElement));
  const [warningMessage, setWarningMessage] = useState(null);

  // Tab switch and blur detection
  useEffect(() => {
    if (!isActive) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitches((prev) => {
          const newCount = prev + 1;
          if (newCount >= 5) {
            setWarningMessage('Disqualified! You exceeded the maximum allowed tab switches (5).');
            if (onDisqualify) onDisqualify();
          } else if (newCount >= 3) {
            setWarningMessage(`Warning (${newCount}/5 tab switches): Switching tabs is considered cheating!`);
            if (onWarning) onWarning(newCount);
          } else {
            setWarningMessage(`Tab switch detected (${newCount}/5). Please stay on this window.`);
            if (onWarning) onWarning(newCount);
          }
          return newCount;
        });
      }
    };

    const handleFullscreenChange = () => {
      const isFull = Boolean(document.fullscreenElement);
      setIsFullscreen(isFull);
      if (!isFull && isActive) {
        setWarningMessage('Exited fullscreen. Please stay in fullscreen mode during the round.');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [isActive, onDisqualify, onWarning]);

  const enterFullscreen = useCallback(async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      }
    } catch (err) {
      console.warn('Fullscreen request denied or not supported:', err.message);
    }
  }, []);

  const exitFullscreen = useCallback(async () => {
    try {
      if (document.exitFullscreen && document.fullscreenElement) {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.warn('Error exiting fullscreen:', err.message);
    }
  }, []);

  const clearWarning = useCallback(() => {
    setWarningMessage(null);
  }, []);

  return {
    tabSwitches,
    isFullscreen,
    warningMessage,
    enterFullscreen,
    exitFullscreen,
    clearWarning,
  };
}
