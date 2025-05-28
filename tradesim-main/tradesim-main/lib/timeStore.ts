import { create } from 'zustand';

interface TimeStore {
  currentTime: Date;
  isPlaying: boolean;
  speed: number; // 1 = normal, 2 = 2x speed, etc.
  setTime: (time: Date) => void;
  setIsPlaying: (playing: boolean) => void;
  setSpeed: (speed: number) => void;
  tickForward: () => void;
}

export const useTimeStore = create<TimeStore>((set, get) => ({
  currentTime: new Date('2019-11-01T00:00:00Z'), // starting point
  isPlaying: false,
  speed: 1,
  setTime: (time) => set({ currentTime: time }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setSpeed: (speed) => set({ speed }),
  tickForward: () => {
    const { currentTime, speed } = get();
    const newTime = new Date(currentTime.getTime() + speed * 5 * 60 * 1000); // 5-minute candles
    set({ currentTime: newTime });
  },
}));
