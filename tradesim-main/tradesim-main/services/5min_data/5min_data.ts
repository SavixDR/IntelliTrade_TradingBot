import { useEffect, useRef, useState } from 'react';
import { createClient } from '@/utils/supbase/client';
import { useTimeStore } from '@/lib/timeStore';

export interface FiveMinData {
  sym_root: string;
  time_bucket: string;
  close: number;
  volume: number;
}

export function useIntradayData(symbols: string[]) {
  const { currentTime } = useTimeStore();
  const [data, setData] = useState<FiveMinData[]>([]);
  const cacheRef = useRef<{ [date: string]: FiveMinData[] }>({});

  const currentDate = currentTime.toISOString().slice(0, 10); // e.g., '2019-11-01'

  useEffect(() => {
    if (!symbols.length) return;

    const fetchDayData = async () => {
      if (cacheRef.current[currentDate]) return; // already fetched

      const supabase = createClient();
      const { data, error } = await supabase
        .from('5min_data')
        .select('sym_root, time_bucket, close, volume')
        .in('sym_root', symbols)
        .eq('date', currentDate);

      if (error) {
        console.error('Supabase fetch error:', error.message);
        return;
      }

      cacheRef.current[currentDate] = data ?? [];
    };

    fetchDayData();
  }, [currentDate, symbols]);

  useEffect(() => {
    const flatData = Object.values(cacheRef.current).flat();

    const latestPerSymbol = symbols.map((symbol) => {
      const relevantRows = flatData
        .filter((row) => row.sym_root === symbol && new Date(row.time_bucket) <= currentTime)
        .sort((a, b) => new Date(b.time_bucket).getTime() - new Date(a.time_bucket).getTime());

      return relevantRows[0]; // most recent row before or at currentTime
    }).filter(Boolean);
    
    // Filter out any undefined values in case a symbol has no data
    if (latestPerSymbol.length === 0) {
      setData([]);
      return;
    }

    console.log('Latest data per symbol:', latestPerSymbol);
    // Update state with the latest data for each symbol

    setData(latestPerSymbol);
  }, [currentTime, symbols]);

  const getOpenPrice = (symbol: string): number | null => {
    const rows = cacheRef.current[currentDate] || [];
    const openRow = rows.find((r) =>
      r.sym_root === symbol &&
      new Date(r.time_bucket).getUTCHours() === 9 && // 9:30 ET = 14:30 UTC
      new Date(r.time_bucket).getUTCMinutes() === 30
    );
    return openRow?.close ?? null;
  };

  const getClosePrice = (symbol: string): number | null => {
    const rows = cacheRef.current[currentDate] || [];
    const closeRow = rows.find(
      (r) =>
        r.sym_root === symbol &&
        new Date(r.time_bucket).getUTCHours() === 15 &&
        new Date(r.time_bucket).getUTCMinutes() === 55
    );
    return closeRow?.close ?? null;
  };

  return {data, getOpenPrice, getClosePrice};
}
