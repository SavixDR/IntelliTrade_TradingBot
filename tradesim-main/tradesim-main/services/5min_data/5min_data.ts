import { useEffect, useRef, useState } from "react";
import { createClient } from "@/utils/supbase/client";
import { useTimeStore } from "@/lib/timeStore";

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

	const currentDate = currentTime.toISOString().slice(0, 10);
	const currentTimestamp = currentTime.getTime();

	useEffect(() => {
		if (!symbols.length) return;

		const fetchDayData = async () => {
			if (cacheRef.current[currentDate]) return;

      const supabase = createClient();
      const { data, error } = await supabase
        .from('5min_data')
        .select('sym_root, time_bucket, close, volume')
        .in('sym_root', symbols)
        .eq('date', currentDate)
		.limit(6500); // Limit to 6500 rows per day

			if (error) {
				console.error("Supabase fetch error:", error.message);
				return;
			}

			console.log(
				`Fetched ${
					data?.length || 0
				} rows for date ${currentDate} and symbols: ${symbols.join(", ")}`
			);
			cacheRef.current[currentDate] = data ?? [];
		};

		fetchDayData();
	}, [currentDate, symbols]);

	useEffect(() => {
		const flatData = Object.values(cacheRef.current).flat();

		const latestPerSymbol = symbols
			.map((symbol) => {
				const relevantRows = flatData
					.filter((row) => {
						const rowTime = new Date(row.time_bucket).getTime();
						const isValid =
							row.sym_root === symbol && rowTime <= currentTimestamp;
						return isValid;
					})
					.sort(
						(a, b) =>
							new Date(b.time_bucket).getTime() -
							new Date(a.time_bucket).getTime()
					);

				return relevantRows[0]; // most recent row before or at currentTime
			})
			.filter(Boolean);

		if (latestPerSymbol.length === 0) {
			setData([]);
			console.warn(
				"No intraday data found matching current time for any symbol."
			);
			return;
		}

		setData(latestPerSymbol);
	}, [currentTime, symbols]);

	const getOpenPrice = (symbol: string): number | null => {
		const rows = cacheRef.current[currentDate] || [];
		const openRow = rows.find(
			(r) =>
				r.sym_root === symbol &&
				new Date(r.time_bucket).getUTCHours() === 9 &&
				new Date(r.time_bucket).getUTCMinutes() === 30
		);
		return openRow?.close ?? null;
	};

	const getClosePrice = (symbol: string): number | null => {
		const rows = cacheRef.current[currentDate] || [];
		const closeRow = rows.find(
			(r) =>
				r.sym_root === symbol &&
				new Date(r.time_bucket).getUTCHours() === 16 &&
				new Date(r.time_bucket).getUTCMinutes() === 0
		);
		return closeRow?.close ?? null;
	};

	return {
		data,
		getOpenPrice,
		getClosePrice,
	};
}
