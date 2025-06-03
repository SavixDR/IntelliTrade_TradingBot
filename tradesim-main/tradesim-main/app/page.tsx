// app/page.tsx or app/page.jsx
"use client";

import { Suspense } from "react";
import PredictionPane from "@/components/PredictionPane";
import MarketOverview from "@/components/MarketOverview";
import TradingDashboard from "@/components/TradingDashboard";
import { StockChart } from "@/components/StockChart";
import { ConnectionStatus } from "@/components/ConnectionStatus";
import { SimulatedClockControls } from "@/components/SimulatedClockController";
import { MarketDataBridge } from "@/components/MarketDataBridge";
import CapitalChart from "@/components/CapitalChart";

export default function Home() {
	return (
		<main className="min-h-screen bg-background">
			<MarketDataBridge />

			<div className="grid grid-cols-12 gap-4 px-4 py-6">
				{/* Prediction Pane (Left sidebar) */}
				<div className="col-span-2">
					<PredictionPane />
				</div>

				{/* Market Overview & Chart */}
				<div className="col-span-6 flex flex-col gap-4">
					<Suspense fallback={<div>Loading Market Overview...</div>}>
						<MarketOverview />
					</Suspense>
					<Suspense fallback={<div>Loading Chart...</div>}>
						<StockChart />
					</Suspense>
				</div>

				{/* Trading Dashboard & Portfolio */}
				<div className="col-span-3 flex flex-col gap-4">
					<Suspense fallback={<div>Loading Trading Dashboard...</div>}>
						<TradingDashboard />
					</Suspense>
				</div>
			</div>

			{/* Footer: Clock + Capital */}
			<div className="px-4">
				<ConnectionStatus />
				<SimulatedClockControls />
				<CapitalChart />
			</div>
		</main>
	);
}
