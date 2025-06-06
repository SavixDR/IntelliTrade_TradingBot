import { useEffect, useRef, useState } from "react";
import { createClient } from "@/utils/supbase/client";
import { useTimeStore } from "@/lib/timeStore";

export interface FiveMinData {
  sym_root: string;
  time_bucket: string;
  close: number;
  volume: number;
}

interface TimeIndexedCache {
  [symbol: string]: {
    [timestamp: number]: FiveMinData;
  };
}

export function useIntradayData(symbols: string[]) {
  const { currentTime } = useTimeStore();
  const [data, setData] = useState<FiveMinData[]>([]);
  const cacheRef = useRef<{ [date: string]: TimeIndexedCache }>({});
  const currentDate = currentTime.toISOString().slice(0, 10);
  const currentTimestamp = currentTime.getTime();

  // 🚀 Fetch and index the data ONCE per date
  useEffect(() => {
    if (!symbols.length) return;

    const fetchDayData = async () => {
      if (cacheRef.current[currentDate]) return;

      const supabase = createClient();
      const { data, error } = await supabase
        .from("5min_data")
        .select("sym_root, time_bucket, close, volume")
        .in("sym_root", symbols)
        .eq("date", currentDate)
        .limit(6500);

      if (error) {
        console.error("Supabase fetch error:", error.message);
        return;
      }

      const index: TimeIndexedCache = {};

      for (const row of data || []) {
        const symbol = row.sym_root;
        const time = new Date(row.time_bucket).getTime();

        if (!index[symbol]) index[symbol] = {};
        index[symbol][time] = row;
      }

      cacheRef.current[currentDate] = index;
      console.log(`Indexed ${data?.length || 0} rows for ${currentDate}`);
    };

    fetchDayData();
  }, [currentDate, symbols]);

  // 🧠 Update active data for the chart/table
  useEffect(() => {
    const index = cacheRef.current[currentDate];
    if (!index) return;

    const latestPerSymbol = symbols.map((symbol) => {
      const entries = index[symbol];
      if (!entries) return null;

      const times = Object.keys(entries)
        .map(Number)
        .filter((t) => t <= currentTimestamp);
      if (times.length === 0) return null;

      const latestTime = Math.max(...times);
      return entries[latestTime];
    }).filter(Boolean) as FiveMinData[];

    setData(latestPerSymbol);
  }, [currentTime, symbols]);

  // 📌 Efficient open/close getters using the indexed data
  const getOpenPrice = (symbol: string): number | null => {
    const rows = cacheRef.current[currentDate]?.[symbol] || {};
    const targetTime = new Date(`${currentDate}T09:30:00Z`).getTime();
    return rows[targetTime]?.close ?? null;
  };

  const getClosePrice = (symbol: string): number | null => {
    const rows = cacheRef.current[currentDate]?.[symbol] || {};
    const targetTime = new Date(`${currentDate}T16:00:00Z`).getTime();
    return rows[targetTime]?.close ?? null;
  };

  return {
    data,
    getOpenPrice,
    getClosePrice,
  };
}
