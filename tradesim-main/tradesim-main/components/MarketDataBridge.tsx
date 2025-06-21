import { useEffect, useRef } from "react";
import { useStore } from "@/lib/store";
import { useIntradayData } from "@/services/5min_data/5min_data"; // assuming this is where it lives
import { useTimeStore } from "@/lib/timeStore";
import { GLOBAL_SYMBOLS } from "@/lib/constants";

const SYMBOLS = GLOBAL_SYMBOLS;

export function MarketDataBridge() {
	const { updateStocks } = useStore();
	const { currentTime } = useTimeStore();
	const previousRef = useRef<Map<string, number>>(new Map());
	const response = useIntradayData(SYMBOLS);
	const data = response.data || [];
	const getOpenPrice = response.getOpenPrice;
	const openPriceRef = useRef<Map<string, number>>(new Map());
	const lastDateRef = useRef<string | null>(null);

	useEffect(() => {
		const today = currentTime.toISOString().slice(0, 10);

		// Reset open prices on day change
		if (lastDateRef.current !== today) {
			lastDateRef.current = today;
			openPriceRef.current = new Map();
		}
		const loadPrices = async () => {
			interface PriceRow {
				sym_root: string;
				close: number;
				volume: number;
			}

			interface UpdatedStock {
				symbol: string;
				name: string;
				price: number;
				previousPrice: number;
				percentageChange: number;
				volume: number;
			}

			const updatedStocks: UpdatedStock[] = (data as PriceRow[]).map(
				(row: PriceRow): UpdatedStock => {
					let openPrice = openPriceRef.current.get(row.sym_root)
						? openPriceRef.current.get(row.sym_root)
						: null;

					if (!openPrice) {
						openPrice = getOpenPrice(row.sym_root);
						if (openPrice !== null) {
							openPriceRef.current.set(row.sym_root, openPrice);
						}
					}

					const previousPrice = previousRef.current.get(row.sym_root);

					if (previousPrice !== row.close) {
						console.log(
							"Symbol:",
							row.sym_root,
							"Previous Price:",
							previousPrice,
							"Current Price:",
							row.close
						);
					}

					// Calculate change only if open price exists
					const percentageChange = openPrice
						? ((row.close - openPrice) / openPrice) * 100
						: 0;

					// Update for next time after computing change
					previousRef.current.set(row.sym_root, row.close);

					return {
						symbol: row.sym_root,
						name: row.sym_root,
						price: row.close,
						previousPrice: previousPrice ?? row.close,
						percentageChange: percentageChange,
						volume: row.volume,
					};
				}
			);

			updateStocks(updatedStocks);
		};

		loadPrices();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentTime]);

	return null;
}
