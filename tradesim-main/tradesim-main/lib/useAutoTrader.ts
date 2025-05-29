"use client";

import { useEffect, useRef } from "react";
import { useStore } from "@/lib/store";
import { useTimeStore } from "@/lib/timeStore";
import { createClient } from "@/utils/supbase/client";
import { Trade } from "@/lib/types";
import { useIntradayData } from "@/services/5min_data/5min_data";

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

export function useAutoTrader(predictions: Record<string, any>) {
	const { user, setUser, addTrade, updateBalance, updateCapitalHistory } =
		useStore();
	const { currentTime, autoMode } = useTimeStore();
	const { getOpenPrice, getClosePrice } = useIntradayData(SYMBOLS);

	// 🔒 Keep track of symbols bought today to prevent duplicates
	const tradedTodayRef = useRef<Set<string>>(new Set());
	const lastTradeDateRef = useRef<string | null>(null);

	useEffect(() => {
		if (!autoMode || !user) return;

		const today = currentTime.toISOString().slice(0, 10);

		// 🧼 Reset traded set if the day changes
		if (lastTradeDateRef.current !== today) {
			tradedTodayRef.current = new Set();
			lastTradeDateRef.current = today;
		}

		const currentHour = currentTime.getUTCHours();
		const currentMinute = currentTime.getUTCMinutes();
		const isMarketOpenTime =
			currentHour >= 9 && (currentHour > 9 || currentMinute >= 30);

		if (!isMarketOpenTime) return;

		SYMBOLS.forEach(async (symbol) => {
			const pred = predictions[symbol];
			const buyProb = pred?.buy_probability;

			if (buyProb && buyProb > 0.5 && !tradedTodayRef.current.has(symbol)) {
				const openPrice = getOpenPrice(symbol);
				if (!openPrice || user.balance < 1) return;

				const investAmount = (user.balance / SYMBOLS.length) * buyProb;
				const quantity = investAmount / openPrice;

				const trade: Trade = {
					symbol,
					type: "buy",
					price: openPrice,
					quantity,
					timestamp: new Date(currentTime),
				};

				const newBalance = user.balance - investAmount;

				const prevQty = user.portfolio[symbol]?.quantity || 0;
				const prevAvg = user.portfolio[symbol]?.averagePrice || 0;
				const newQty = prevQty + quantity;
				const newAvg = (prevQty * prevAvg + investAmount) / newQty;

				const updatedPortfolio = {
					...user.portfolio,
					[symbol]: {
						quantity: newQty,
						averagePrice: newAvg,
					},
				};

				setUser({ ...user, balance: newBalance, portfolio: updatedPortfolio });
				addTrade(trade);
				updateBalance(newBalance);
				updateCapitalHistory(today, newBalance);

				tradedTodayRef.current.add(symbol); // ✅ mark as traded today

				try {
					const supabase = createClient();
					await supabase.from("trades").insert({
						user_id: user.id,
						symbol,
						type: "buy",
						quantity,
						price: openPrice,
						timestamp: currentTime.toISOString().slice(0, 19).replace("T", " "),
					});
				} catch (err) {
					console.error("Supabase insert error:", err);
				}
			}
		});
	}, [currentTime, autoMode, user, predictions]);

	// 🔁 Sell at the end of the day
	useEffect(() => {
		if (!autoMode || !user) return;

		const currentHour = currentTime.getUTCHours();
		const currentMinute = currentTime.getUTCMinutes();
		const isMarketCloseTime = currentHour === 20 && currentMinute === 0; // 16:00 ET == 21:00 UTC

		const today = currentTime.toISOString().slice(0, 10);

		if (isMarketCloseTime) {
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

				const updatedPortfolio = { ...user.portfolio };
				delete updatedPortfolio[symbol];

				const newBalance = user.balance + value;

				setUser({ ...user, balance: newBalance, portfolio: updatedPortfolio });
				addTrade(trade);
				updateBalance(newBalance);
				updateCapitalHistory(today, newBalance);

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
		}
	}, [currentTime, autoMode, user]);
}
