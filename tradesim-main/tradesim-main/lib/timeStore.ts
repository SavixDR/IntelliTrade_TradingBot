import { create } from 'zustand';

interface TimeStore {
  currentTime: Date;
  isPlaying: boolean;
  speed: number;
  autoMode: boolean;
  normalSpeed: number;
  setTime: (time: Date) => void;
  setIsPlaying: (playing: boolean) => void;
  setSpeed: (speed: number) => void;
  setAutoMode: (auto: boolean) => void;
  setNormalSpeed: (normalSpeed: number) => void;
  tickForward: () => void;
}

export const useTimeStore = create<TimeStore>((set, get) => ({
  currentTime: new Date('2020-01-09T00:00:00Z'),
  isPlaying: false,
  speed: 1,
  autoMode: false,
  normalSpeed: 1, // Normal speed is 1x
  setTime: (time) => set({ currentTime: time }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setSpeed: (speed) => set({ speed }),
  setAutoMode: (auto) => set({ autoMode: auto }),
  setNormalSpeed: (normalSpeed) => set({ normalSpeed }),
  tickForward: () => {
    const { currentTime, speed } = get();
    const newTime = new Date(currentTime.getTime() + speed * 5 * 60 * 1000);
    set({ currentTime: newTime });
  },
}));
