'use client';

import { useEffect } from 'react';
import { useTimeStore } from '@/lib/timeStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

const startTime = new Date('2020-01-09T00:00:00Z');
const endTime = new Date('2020-03-10T23:55:00Z');

export function SimulatedClockControls() {
  const {
    currentTime,
    isPlaying,
    speed,
    setIsPlaying,
    setSpeed,
    setTime,
  } = useTimeStore();

  // Auto-reset logic
  useEffect(() => {
    if (currentTime >= endTime) {
      setIsPlaying(false);
      setTime(startTime);
    }
  }, [currentTime]);

  return (
    <Card className="max-w-xl mx-auto my-4">
      <CardHeader>
        <CardTitle>Simulation Controls</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Current Time:</Label>
          <span>{currentTime.toUTCString()}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <Button onClick={() => setIsPlaying(!isPlaying)}>
            {isPlaying ? 'Pause' : 'Play'}
          </Button>
          <Button onClick={() => setSpeed(speed * 2)}>Speed x{speed * 2}</Button>
          <Button onClick={() => setSpeed(1)} disabled={speed <= 1}>
            Reset
          </Button>
          <Button onClick={() => setSpeed(speed /2)}>Speed /{speed/2}</Button>
        </div>
        <div className="flex items-center space-x-4">
          <Label htmlFor="jump-time">Jump to Time:</Label>
          <Input
            id="jump-time"
            type="datetime-local"
            className="w-full"
            value={currentTime.toISOString().slice(0, 16)}
            onChange={(e) => setTime(new Date(e.target.value))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="progress-slider">Progress:</Label>
          <input
            id="progress-slider"
            type="range"
            min={startTime.getTime()}
            max={endTime.getTime()}
            step={5 * 60 * 1000}
            value={currentTime.getTime()}
            onChange={(e) => setTime(new Date(Number(e.target.value)))}
            className="w-full"
          />
          <div className="text-center text-sm text-muted-foreground">
            {new Date(currentTime).toUTCString()}
          </div>
        </div>        
      </CardContent>
    </Card>
  );
}
