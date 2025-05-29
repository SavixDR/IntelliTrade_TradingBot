'use client'

import PredictionPane from "@/components/PredictionPane";
import { Suspense, use } from "react";
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
      <MarketDataBridge/>
			<PredictionPane/>
			<div className="ml-[240px] flex-1 overflow-x-hidden">
				<ConnectionStatus />
				<div className="container mx-auto px-4 py-8">
					<h1 className="text-4xl font-bold mb-8">Intellitrade Trading Platform</h1>
					<div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
						<div className="lg:col-span-8">
							<Suspense fallback={<div>Loading market data...</div>}>
								<MarketOverview />
							</Suspense>
							<div className="mt-8">
								<Suspense fallback={<div>Loading chart...</div>}>
									<StockChart />
								</Suspense>
							</div>
						</div>
						<div className="lg:col-span-4 space-y-4">
							<Suspense fallback={<div>Loading trading dashboard...</div>}>
								<TradingDashboard />
							</Suspense>
						</div>
						<div className="lg:col-span-12 mt-8">
						  <SimulatedClockControls />
              <CapitalChart />
						</div>
					</div>
				</div>
			</div>
		</main>
	);
}
