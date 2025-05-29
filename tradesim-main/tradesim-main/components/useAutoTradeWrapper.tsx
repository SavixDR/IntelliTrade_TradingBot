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
}

export function AutoTraderWrapper({ predictions }: Props) {
  useAutoTrader(predictions);
  return null; // No UI
}
