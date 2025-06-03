import { useEffect } from "react";
import { useStore } from "@/lib/store";
import { useIntradayData } from "@/services/5min_data/5min_data"; // assuming this is where it lives

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

export function MarketDataBridge() {
	const response = useIntradayData(SYMBOLS);
	const intradayData = response.data || [];
    
	const updateStocks = useStore((s) => s.updateStocks);

	useEffect(() => {
		const formatted = intradayData.map((row) => ({
			symbol: row .sym_root,
			name: row.sym_root, // or map from metadata
			price: row.close,
			previousPrice: row.close, // For simplicity
			percentageChange: 0,
			volume: row.volume,
		}));

        if (formatted.length === 0) {   
            console.warn("MarketDataBridge - No data available to update stocks.");
            return;
        }

		updateStocks(formatted);
	}, [intradayData]);

	return null;
}
