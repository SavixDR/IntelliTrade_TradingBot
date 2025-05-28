'use client';

import { useEffect, useState } from 'react';
import { useTimeStore } from '@/lib/timeStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

const startTime = new Date('2019-11-01T00:00:00Z');
const endTime = new Date('2020-03-10T23:55:00Z');

export function SimulatedClockControls() {
  const {
    currentTime,
    isPlaying,
    speed,
    setIsPlaying,
    setSpeed,
    setTime,
    tickForward,
  } = useTimeStore();

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [autoMode, setAutoMode] = useState(false);

  // Auto-reset logic
  useEffect(() => {
    if (currentTime >= endTime) {
      setIsPlaying(false);
      setTime(startTime);
    }
  }, [currentTime]);

  const fetchPrediction = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/predictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: currentTime.toISOString().slice(0, 10),
          symbols: ['AAPL', 'MSFT', 'GOOG', 'AMZN', 'TSLA'],
        }),
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error fetching prediction:', error);
    } finally {
      setLoading(false);
    }
  };

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

        <div className="border-t pt-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="auto-mode">Auto Mode:</Label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                id="auto-mode"
                className="sr-only peer"
                checked={autoMode}
                onChange={() => setAutoMode(!autoMode)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:bg-green-500" />
            </label>
          </div>
          {autoMode && (
            <p className="text-sm mt-2 text-muted-foreground">
              When Auto Mode is enabled, our <strong>IntelliTrade Bot</strong> will execute trades
              automatically based on predictions. Check your dashboard for results.
            </p>
          )}
        </div>

        <div className="text-center">
          <Button onClick={fetchPrediction} disabled={loading}>
            {loading ? 'Fetching...' : 'Fetch Prediction'}
          </Button>
          {result && (
            <pre className="mt-4 text-xs bg-muted p-2 rounded overflow-x-auto max-h-96">
              {JSON.stringify(result, null, 2)}
            </pre>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
