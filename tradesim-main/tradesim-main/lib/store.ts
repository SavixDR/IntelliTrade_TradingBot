import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Stock, User, Trade } from './types';

interface StoreState {
  stocks: Stock[];
  user: User | null;
  trades: Trade[];
  isConnected: boolean;
  capitalHistory: { date: string; capital: number }[];
  updateStocks: (stocks: Stock[]) => void;
  setUser: (user: User | null) => void;
  addTrade: (trade: Trade) => void;
  updateBalance: (amount: number) => void;
  updateCapitalHistory: (date: string, capital: number) => void;
  getPriceForSymbol: (symbol: string, date: string, field: keyof Stock) => number | null;
  setConnectionStatus: (status: boolean) => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      stocks: [],
      user: null,
      trades: [],
      isConnected: true,
      capitalHistory: [],
      updateStocks: (stocks) => set({ stocks }),
      setUser: (user) => set({ user }),
      addTrade: (trade) =>
        set((state) => ({ trades: [...state.trades, trade] })),
      updateBalance: (amount) =>
        set((state) => ({
          user: state.user ? { ...state.user, balance: amount } : null,
        })),
      updateCapitalHistory: (date, capital) =>
        set((state) => ({
          capitalHistory: [
            ...state.capitalHistory,
            { date, capital },
          ],
        })),
      getPriceForSymbol: (symbol, date, field) => {
        const stock = get().stocks.find((s) => s.symbol === symbol);
        return stock && field in stock ? (stock as any)[field] : null;
      },
      setConnectionStatus: (status) => set({ isConnected: status }),
    }),
    {
      name: 'tradesim',
      partialize: (state) => ({
        user: state.user,
        trades: state.trades,
        capitalHistory: state.capitalHistory,
      }),
    }
  )
);
