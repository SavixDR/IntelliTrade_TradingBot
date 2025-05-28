import PredictionPane from "@/components/PredictionPane";
import { Suspense } from "react";
import MarketOverview from "@/components/MarketOverview";
import TradingDashboard from "@/components/TradingDashboard";
import { StockChart } from "@/components/StockChart";
import { ConnectionStatus } from "@/components/ConnectionStatus";
import { SimulatedClockControls } from "@/components/SimulatedClockController";

const mockPredictions = {
	AAPL: { buy: 0.6, neutral: 0.3, sell: 0.1 },
	MSFT: { buy: 0.4, neutral: 0.4, sell: 0.2 },
	GOOGL: { buy: 0.3, neutral: 0.2, sell: 0.5 },
	AMZN: { buy: 0.2, neutral: 0.3, sell: 0.5 },
	TSLA: { buy: 0.5, neutral: 0.3, sell: 0.2 },
};

export default function Home() {
	return (
		<main className="min-h-screen bg-background">
			<PredictionPane data={mockPredictions} />
			<div className="ml-[240px] flex-1 overflow-x-hidden">
				<ConnectionStatus />
				<div className="container mx-auto px-4 py-8">
					<h1 className="text-4xl font-bold mb-8">TradeSim Trading Platform</h1>
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
						<div className="lg:col-span-4">
							<Suspense fallback={<div>Loading trading dashboard...</div>}>
								<TradingDashboard />
							</Suspense>
						</div>
						<SimulatedClockControls />
					</div>
				</div>
			</div>
		</main>
	);
}
