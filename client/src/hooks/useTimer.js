import { useState, useEffect, useRef, useCallback } from 'react';

export function useTimer(initialSeconds = 120, onExpire) {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const onExpireRef = useRef(onExpire);
  const intervalRef = useRef(null);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  // Synchronize timeLeft whenever initialSeconds changes (e.g. round switch) while timer is paused
  useEffect(() => {
    if (!isRunning) {
      setTimeLeft(initialSeconds);
    }
  }, [initialSeconds, isRunning]);

  // Manage single countdown interval strictly governed by isRunning state
  useEffect(() => {
    if (isRunning) {
      if (intervalRef.current) clearInterval(intervalRef.current);

      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
            setIsRunning(false);
            if (onExpireRef.current) {
              onExpireRef.current();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning]);

  const startTimer = useCallback(() => {
    setIsRunning(true);
  }, []);

  const pauseTimer = useCallback(() => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const resetTimer = useCallback((newSeconds = initialSeconds) => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setTimeLeft(newSeconds);
  }, [initialSeconds]);

  const timeElapsed = Math.max(0, initialSeconds - timeLeft);

  return {
    timeLeft,
    timeElapsed,
    isRunning,
    startTimer,
    pauseTimer,
    resetTimer,
  };
}
