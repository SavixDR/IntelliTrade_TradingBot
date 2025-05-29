"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useTimeStore } from "@/lib/timeStore";
import { Label } from "@/components/ui/label";
import { AutoTraderWrapper } from '@/components/useAutoTradeWrapper';


type Prediction = {
	buy: number;
	neutral: number;
	sell: number;
};

type ApiResponse = {
	[symbol: string]: {
		buy_probability: number;
		hold_probability: number;
		sell_probability: number;
		prediction: string;
		reference_date: string;
		sym_root: string;
	};
};

const SYMBOLS = [
	"AAPL",
	"ABBV",
	"ADBE",
	"AMZN",
	"BA",
	"BABA",
	"CRM",
	"CSCO",
	"DIS",
	"GOOG",
	"KO",
	"MA",
	"MSFT",
	"NFLX",
	"NVDA",
	"SHOP",
	"TSLA",
	"TWLO",
	"V",
	"VOO",
	"VTI",
];

const PredictionPane: React.FC = () => {
	const [loading, setLoading] = useState(false);
	const [predictionMap, setPredictionMap] = useState<
		Record<string, Prediction>
	>({});
	const { currentTime, autoMode, setAutoMode } = useTimeStore();
	const [lastFetchedDate, setLastFetchedDate] = useState<string | null>(null);
  const [apiResponse, setApiResponse] = useState<ApiResponse>({});

  // Fetch predictions from the API 
	const fetchPrediction = async () => {
		setLoading(true);
		try {
			const response = await fetch("/api/predictions", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					date: currentTime.toISOString().slice(0, 10),
					symbols: SYMBOLS,
				}),
			});

			const data: ApiResponse = await response.json();

			const formatted: Record<string, Prediction> = {};

			for (const symbol of SYMBOLS) {
				const entry = data[symbol];
				if (entry) {
					formatted[symbol] = {
						buy: entry.buy_probability,
						neutral: entry.hold_probability,
						sell: entry.sell_probability,
					};
				}
			}
      setApiResponse(data);
setPredictionMap(formatted);


			setPredictionMap(formatted);
		} catch (error) {
			console.error("Error fetching prediction:", error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		const currentHour = currentTime.getUTCHours();
		const currentMinute = currentTime.getUTCMinutes();
		const today = currentTime.toISOString().slice(0, 10);

		const isMarketOpenTime = currentHour >= 9 && currentMinute >= 30;

    console.log("Current Time:", currentTime);
    console.log("Is Market Open Time:", isMarketOpenTime);
    console.log("starts getting predictions");

		if (isMarketOpenTime && lastFetchedDate !== today) {
			fetchPrediction();
			setLastFetchedDate(today);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentTime]);

	return (
		<aside className="fixed top-[64px] left-0 bottom-0 w-[240px] bg-background text-foreground pt-6 px-4 shadow-md z-40 overflow-y-auto border-r border-border">
			<h3 className="text-base font-semibold mb-6 text-center">
				Our predictions:
			</h3>

			{Object.entries(predictionMap)
				.sort(([, a], [, b]) => b.buy - a.buy) // Sort by highest buy
				.map(([symbol, { buy, neutral, sell }]) => (
					<div
						key={symbol}
						className="mb-8 w-full flex flex-col items-center"
					>
						<div className="font-medium mb-2 text-center">{symbol}</div>

						<div className="w-full max-w-[160px] h-4 rounded overflow-hidden bg-muted flex">
							<div
								className="bg-green-500"
								style={{ width: `${buy * 100}%` }}
								title={`Buy: ${(buy * 100).toFixed(1)}%`}
							/>
							<div
								className="bg-yellow-400"
								style={{ width: `${neutral * 100}%` }}
								title={`Neutral: ${(neutral * 100).toFixed(1)}%`}
							/>
							<div
								className="bg-red-500"
								style={{ width: `${sell * 100}%` }}
								title={`Sell: ${(sell * 100).toFixed(1)}%`}
							/>
						</div>

						<div className="flex justify-between gap-3 mt-2 text-xs font-medium w-full max-w-[160px]">
							<span className="text-green-500">Buy</span>
							<span className="text-yellow-400">Neutral</span>
							<span className="text-red-500">Sell</span>
						</div>
					</div>
				))}

			<div className="text-center mt-4">
				<Button
					onClick={fetchPrediction}
					disabled={loading}
				>
					{loading ? "Fetching..." : "Refresh Predictions"}
				</Button>
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
							onChange={() => setAutoMode && setAutoMode(!autoMode)}
						/>
						<div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:bg-green-500" />
					</label>
				</div>
				{autoMode && (
					<p className="text-sm mt-2 text-muted-foreground">
						When Auto Mode is enabled, our <strong>IntelliTrade Bot</strong>{" "}
						will execute trades automatically based on predictions. Check your
						dashboard for results.
					</p>
				)}
			</div>
      {Object.keys(apiResponse).length > 0 && (
  <AutoTraderWrapper predictions={apiResponse} />
)}

		</aside>
	);
};

export default PredictionPane;
