// components/SimulatedClock.tsx
'use client';

import { useEffect } from 'react';
import { useTimeStore } from '@/lib/timeStore';

export function SimulatedClock() {
  const { isPlaying, tickForward } = useTimeStore();

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      tickForward();
    }, 500); // Every 500ms → 5 min of simulated time

    return () => clearInterval(interval);
  }, [isPlaying, tickForward]);

  return null; // No UI; just logic
}
