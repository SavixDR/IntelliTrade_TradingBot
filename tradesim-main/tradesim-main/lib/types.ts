export interface Stock {
	symbol: string;
	name: string;
	price: number;
	previousPrice: number;
	percentageChange: number;
	volume: number;
}

export interface User {
	id: string;
	email: string;
	balance: number;
	portfolio: Portfolio;
}

export interface Portfolio {
	[symbol: string]: {
		quantity: number;
		averagePrice: number;
	};
}

export interface Trade {
	symbol: string;
	quantity: number;
	price: number;
	type: "buy" | "sell";
	timestamp: Date;
}

export interface EthData {
	date: string;
	sym_root: string;
	post_market_price_mean: number | null;
	pre_market_price_mean: number | null;
	post_market_price_std: number | null;
	pre_market_price_std: number | null;
	post_market_price_min: number | null;
	pre_market_price_min: number | null;
	post_market_price_max: number | null;
	pre_market_price_max: number | null;
	post_market_price_median: number | null;
	pre_market_price_median: number | null;
	post_market_price_start: number | null;
	pre_market_price_start: number | null;
	post_market_price_end: number | null;
	pre_market_price_end: number | null;
	post_market_volume: number | null;
	pre_market_volume: number | null;
	open: number | null;
	close: number | null;
	high: number | null;
	low: number | null;
	ewo: number | null;
	ewo_lag_1: number | null;
	ewo_lag_2: number | null;
	day_of_week: string | null;
}

export type RawEthData = {
	sym_root: string;
	date: string;
	open: number;
	high: number;
	low: number;
	close: number;
	pre_market_price_start: number;
	pre_market_price_end: number;
	pre_market_price_min: number;
	pre_market_price_max: number;
	pre_market_price_mean: number;
	pre_market_price_std: number;
	post_market_price_start: number;
	post_market_price_end: number;
	post_market_price_min: number;
	post_market_price_max: number;
	post_market_price_mean: number;
	post_market_price_std: number;
};

export type PredictionResult = {
	sym_root: string;
	reference_date: string;
	daily_raw_data_list: any[];
} | null;

export type CapitalSnapshot = {
  date: string;
  capital: number;
};

