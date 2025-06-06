'use client';

import { useAutoTrader } from '@/lib/useAutoTrader';

type SinglePrediction = {
  buy_probability: number;
  hold_probability: number;
  sell_probability: number;
  prediction: string;
  reference_date: string;
  sym_root: string;
};

type ApiResponse = Record<string, SinglePrediction>;

interface Props {
  predictions: ApiResponse;
  predictionReady?: boolean; // Optional, if you want to pass a specific date
}

export function AutoTraderWrapper({ predictions,predictionReady }: Props) {
  useAutoTrader(predictions,predictionReady);
  return null; // No UI
}
