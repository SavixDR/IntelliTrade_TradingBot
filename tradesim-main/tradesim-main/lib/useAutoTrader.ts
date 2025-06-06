"use client";

import { useEffect, useRef } from "react";
import { useStore } from "@/lib/store";
import { useTimeStore } from "@/lib/timeStore";
import { createClient } from "@/utils/supbase/client";
import { Trade } from "@/lib/types";
import { useIntradayData } from "@/services/5min_data/5min_data";
import { useToast } from "@/components/ui/use-toast";

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

export function useAutoTrader(
	predictions: Record<string, any>,
	predictionReady: boolean | undefined
) {
	const { user, setUser, addTrade, updateBalance, updateCapitalHistory } =
		useStore();
	const { currentTime, autoMode } = useTimeStore();
	const { getOpenPrice, getClosePrice } = useIntradayData(SYMBOLS);
	const { toast } = useToast();

	// 🔒 Keep track of symbols bought today to prevent duplicates
	const tradedTodayRef = useRef<Set<string>>(new Set());
	const lastTradeDateRef = useRef<string | null>(null);

	console.log("AutoTrader initialized with predictions:", predictionReady);

	useEffect(() => {
		if (!autoMode || !user || (predictionReady ? !predictionReady : true))
			return;

		const today = currentTime.toISOString().slice(0, 10);

		// 🧼 Reset traded set if the day changes
		if (lastTradeDateRef.current !== today) {
			console.log("Resetting traded symbols for a new day:", today);
			tradedTodayRef.current = new Set();
			// I want to make sure todayTradeDateRef is null after reset
			console.log(tradedTodayRef.current, "after reset");
			console.log("Last trade date was:", lastTradeDateRef.current);
			lastTradeDateRef.current = today;
		}

		const currentHour = currentTime.getUTCHours();
		const currentMinute = currentTime.getUTCMinutes();
		const isMarketOpenTime =
			currentHour >= 9 && currentMinute >= 30 && currentMinute <= 45;

		if (!isMarketOpenTime) return;

		console.log("Portfolio before trading:", user.portfolio);
		console.log("Current time:", currentTime.toISOString());

		(async () => {
			const updatedPortfolio = { ...user.portfolio };
			let newBalance = user.balance;

			for (const symbol of SYMBOLS) {
				const pred = predictions[symbol];
				const buyProb = pred?.buy_probability;

				if (buyProb && buyProb > 0.5 && !tradedTodayRef.current.has(symbol)) {
					const openPrice = getOpenPrice(symbol);
					if (!openPrice || newBalance < 1) continue;

					const investAmount = (newBalance / SYMBOLS.length) * buyProb;
					const quantity = investAmount / openPrice;

					const trade: Trade = {
						symbol,
						type: "buy",
						price: openPrice,
						quantity,
						timestamp: new Date(currentTime),
					};

					const prevQty = updatedPortfolio[symbol]?.quantity || 0;
					const prevAvg = updatedPortfolio[symbol]?.averagePrice || 0;
					const newQty = prevQty + quantity;
					const newAvg = (prevQty * prevAvg + investAmount) / newQty;

					updatedPortfolio[symbol] = {
						quantity: newQty,
						averagePrice: newAvg,
					};

					newBalance -= investAmount;
					tradedTodayRef.current.add(symbol);
					addTrade(trade);

					try {
						const supabase = createClient();
						await supabase.from("trades").insert({
							user_id: user.id,
							symbol,
							type: "buy",
							quantity,
							price: openPrice,
							timestamp: currentTime
								.toISOString()
								.slice(0, 19)
								.replace("T", " "),
						});
					} catch (err) {
						console.error("Supabase insert error:", err);
					}

					toast({
						title: "Buy Trade Executed",
						description: `Bought ${symbol} at $${openPrice.toFixed(2)}`,
					});
				}
			}

			console.log("Updated portfolio:", updatedPortfolio);

			// ✅ Only once
			setUser({ ...user, balance: newBalance, portfolio: updatedPortfolio });
			updateBalance(newBalance);
			updateCapitalHistory(currentTime.toISOString().slice(0, 10), newBalance);
		})();

		console.log("Portfolio after trading:", user.portfolio);
		console.log("Traded today symbols:", Array.from(tradedTodayRef.current));
	}, [currentTime, autoMode, predictions]);

	// 🔁 Sell at the end of the day
	useEffect(() => {
		if (!autoMode || !user) return;

		const currentHour = currentTime.getUTCHours();
		const currentMinute = currentTime.getUTCMinutes();

		const isMarketCloseTime =
			currentHour >= 16 && currentMinute >= 0 && currentMinute <= 15; // 16:00 ET == 21:00 UTC

		if (!isMarketCloseTime) return;

		const today = currentTime.toISOString().slice(0, 10);
		let newBalance = user.balance;
		const updatedPortfolio = { ...user.portfolio };

		console.log("Today's symbols:", Array.from(tradedTodayRef.current));
		Array.from(tradedTodayRef.current).forEach(async (symbol) => {
			const position = user.portfolio[symbol];
			if (!position || position.quantity <= 0) return;

			const closePrice = getClosePrice(symbol);
			if (!closePrice || position.quantity <= 0) return;

			const quantity = position.quantity;
			const value = quantity * closePrice;

			const trade: Trade = {
				symbol,
				type: "sell",
				price: closePrice,
				quantity,
				timestamp: new Date(currentTime),
			};

			delete updatedPortfolio[symbol];

			newBalance = user.balance + value;

			addTrade(trade);

			toast({
				title: "Sell Trade Executed",
				description: `Sold shares of ${symbol} at $${closePrice.toFixed(2)}`,
				variant: "default",
			});

			try {
				const supabase = createClient();
				await supabase.from("trades").insert({
					user_id: user.id,
					symbol,
					type: "sell",
					quantity,
					price: closePrice,
					timestamp: currentTime.toISOString().slice(0, 19).replace("T", " "),
				});
			} catch (err) {
				console.error("Supabase sell error:", err);
			}
		});
		setUser({ ...user, balance: newBalance, portfolio: updatedPortfolio });
		updateBalance(newBalance);
		updateCapitalHistory(today, newBalance);
	}, [currentTime, autoMode]);
}
