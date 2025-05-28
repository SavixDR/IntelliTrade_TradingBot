import { NextResponse } from 'next/server';
import { fetchEthDataByDate } from '@/services/eth_data/eth_data_fetcher';
import { EthData } from '@/lib/types';

export const dynamic = 'force-dynamic';

const PREDICTION_API = 'https://intellitrade-model-api.onrender.com/predict';
const MAX_CONCURRENT_REQUESTS = 3; // Limit concurrency
const RETRY_LIMIT = 2;
const RETRY_DELAY_MS = 1000;

export function buildPredictionInputMap(data: EthData[], referenceDate: string): Record<string, any> {
	const symbolMap: Record<string, any> = {};

	for (const row of data) {
		const isReference = row.date === referenceDate;

		const entry = {
			date: row.date,
			pre_market_price_start: row.pre_market_price_start,
			pre_market_price_end: row.pre_market_price_end,
			pre_market_price_min: row.pre_market_price_min,
			pre_market_price_max: row.pre_market_price_max,
			pre_market_price_mean: row.pre_market_price_mean,
			pre_market_price_std: row.pre_market_price_std,
			...(isReference
				? {
						post_market_price_start: null,
						post_market_price_end: null,
						post_market_price_min: null,
						post_market_price_max: null,
						post_market_price_mean: null,
						post_market_price_std: null,
						high: null,
						low: null,
						close: null,
						open: null,
				  }
				: {
						post_market_price_start: row.post_market_price_start,
						post_market_price_end: row.post_market_price_end,
						post_market_price_min: row.post_market_price_min,
						post_market_price_max: row.post_market_price_max,
						post_market_price_mean: row.post_market_price_mean,
						post_market_price_std: row.post_market_price_std,
						high: row.high,
						low: row.low,
						close: row.close,
						open: row.open,
				  }),
		};

		if (!symbolMap[row.sym_root]) {
			symbolMap[row.sym_root] = {
				sym_root: row.sym_root,
				reference_date: referenceDate,
				daily_raw_data_list: [],
			};
		}

		symbolMap[row.sym_root].daily_raw_data_list.push(entry);
	}

	return symbolMap;
}

async function postWithRetry(symbol: string, payload: any): Promise<[string, any]> {
	let attempt = 0;
	let errorLog = null;

	while (attempt < RETRY_LIMIT) {
		try {
			const res = await fetch(PREDICTION_API, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
			});

			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			const json = await res.json();
			return [symbol, json];
		} catch (error) {
			attempt++;
			errorLog = `Failed for ${symbol} (attempt ${attempt}): ${error instanceof Error ? error.message : error}`;
			console.error(errorLog);
			if (attempt < RETRY_LIMIT) {
				await new Promise((res) => setTimeout(res, RETRY_DELAY_MS));
			}
		}
	}

	return [symbol, { error: errorLog || 'Failed after retries' }];
}

function limitConcurrency(tasks: (() => Promise<[string, any]>)[], limit: number): Promise<Record<string, any>> {
	const results: Record<string, any> = {};
	let index = 0;

	return new Promise((resolve, reject) => {
		let active = 0;

		function next() {
			if (index === tasks.length && active === 0) {
				return resolve(results);
			}

			while (active < limit && index < tasks.length) {
				const taskIndex = index++;
				const task = tasks[taskIndex];
				active++;
				task()
					.then(([symbol, result]) => {
						results[symbol] = result;
					})
					.catch((err) => {
						console.error(`Unexpected failure in task ${taskIndex}`, err);
					})
					.finally(() => {
						active--;
						next();
					});
			}
		}

		next();
	});
}

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const { date, symbols }: { date: string; symbols: string[] } = body;

		const ethData = await fetchEthDataByDate(date, symbols);
		const inputMap = buildPredictionInputMap(ethData, date);

		const tasks = Object.entries(inputMap).map(([symbol, payload]) => () => postWithRetry(symbol, payload));
		const predictions = await limitConcurrency(tasks, MAX_CONCURRENT_REQUESTS);

        console.log('Predictions:', predictions);

		return NextResponse.json(predictions, {
			headers: {
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Methods': 'POST, OPTIONS',
				'Access-Control-Allow-Headers': 'Content-Type',
			},
		});
	} catch (error) {
		console.error('Unexpected Error:', error);
		return NextResponse.json(
			{ message: error instanceof Error ? error.message : 'Unknown error' },
			{ status: 500 }
		);
	}
}
