"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { TradeModal } from "@/components/TradeModal";
import { Stock } from "@/lib/types";
import { Portfolio } from "@/components/Portfolio";
import { TradeHistory } from "@/components/TradeHistory";
import { createClient } from "@/utils/supbase/client";
import { useTimeStore } from "@/lib/timeStore";
import { toast } from "@/hooks/use-toast";

export default function TradingDashboard() {
	const {
		stocks,
		user,
		setUser,
		updateBalance,
		addTrade,
		updateCapitalHistory,
	} = useStore();
	const { currentTime } = useTimeStore();
	const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
	const [tradeType, setTradeType] = useState<"buy" | "sell">("buy");

	const handleTrade = (stock: Stock, type: "buy" | "sell") => {
		setSelectedStock(stock);
		setTradeType(type);
	};

	const onConfirmTrade = async (trade: {
		symbol: string;
		quantity: number;
		price: number;
		type: "buy" | "sell";
		timestamp: Date;
	}) => {
		// 1. Update balance
		const amount = trade.quantity * trade.price;
		if (!user) return;
		if (trade.type === "buy") {
			updateBalance(user.balance - amount);
		} else {
			updateBalance(user.balance + amount);
		}

		const existing = user.portfolio[trade.symbol] || {
			quantity: 0,
			averagePrice: 0,
		};
		const portfolio = { ...user.portfolio };

		if (trade.type === "buy") {
			const newQty = existing.quantity + trade.quantity;
			const totalCost =
				existing.quantity * existing.averagePrice +
				trade.quantity * trade.price;
			const avgPrice = totalCost / newQty;

			portfolio[trade.symbol] = {
				quantity: newQty,
				averagePrice: avgPrice,
			};
		} else {
			const remainingQty = existing.quantity - trade.quantity;
			if (remainingQty <= 0) {
				delete portfolio[trade.symbol];
			} else {
				portfolio[trade.symbol] = {
					...existing,
					quantity: remainingQty,
				};
			}
		}

		setUser({ ...user, portfolio: portfolio });

		console.log("Updated user portfolio:", user.portfolio);

		// 2. Add trade
		addTrade(trade);

		// 3. Update capital history
		const tradeDate = trade.timestamp.toISOString().slice(0, 10);
		updateCapitalHistory(tradeDate, user.balance);

		// 4. Optionally insert into Supabase
		const supabase = createClient();
		const { error, data } = await supabase.from("trades").insert([
			{
				id: user.id,
				symbol: trade.symbol,
				type: trade.type,
				quantity: trade.quantity,
				price: trade.price,
				timestamp: currentTime.toISOString().slice(0, 19).replace("T", " "),
			},
		]);

		if (error) {
			console.error("Error inserting trade into Supabase:", error);
		} else {
			console.log("Trade inserted into Supabase:", data);
		}

		console.log("Trade inserted into Supabase:", data, error);
		// 5. Show success toast
		toast({
			title: "Trade Executed",
			description: `Successfully ${trade.type === "buy" ? "bought" : "sold"} ${
				trade.quantity
			} shares of ${trade.symbol} at $${trade.price.toFixed(2)}`,
		});

		// Close modal
		setSelectedStock(null);
	};

	if (!user) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Trading Dashboard</CardTitle>
					<CardDescription>Please log in to start trading</CardDescription>
				</CardHeader>
			</Card>
		);
	}

	return (
		<>
			<Card>
				<CardHeader>
					<CardTitle>Trading Dashboard</CardTitle>
					<CardDescription>Balance: ${user.balance.toFixed(2)}</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="max-h-[400px] overflow-y-auto space-y-4 pr-2">
						{stocks.map((stock) => (
							<div
								key={stock.symbol}
								className="flex items-center justify-between p-4 border rounded-lg"
							>
								<div>
									<h3 className="font-semibold">{stock.symbol}</h3>
									<p className="text-sm text-muted-foreground">
										${stock.price.toFixed(2)}
									</p>
								</div>
								<div className="space-x-2">
									<Button
										variant="outline"
										onClick={() => handleTrade(stock, "buy")}
									>
										Buy
									</Button>
									<Button
										variant="outline"
										onClick={() => handleTrade(stock, "sell")}
									>
										Sell
									</Button>
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
			<div className="mt-4">
				<Portfolio />
			</div>
			<div className="mt-4">
				<TradeHistory />
			</div>
			{selectedStock && (
				<TradeModal
					stock={selectedStock}
					type={tradeType}
					onClose={() => setSelectedStock(null)}
					onConfirm={onConfirmTrade}
				/>
			)}
		</>
	);
}
