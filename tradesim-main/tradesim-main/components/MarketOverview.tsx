"use client";

import { useStore } from "@/lib/store";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";

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

export default function MarketOverview() {
	const { stocks } = useStore();

	return (
		<div className="rounded-lg border bg-card min-h-[200px] max-h-[500px] overflow-y-auto">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Symbol</TableHead>
						<TableHead>Name</TableHead>
						<TableHead className="text-right">Price</TableHead>
						<TableHead className="text-right">Change</TableHead>
						<TableHead className="text-right">Volume</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{stocks.map((stock) => (
						<TableRow key={stock.symbol}>
							<TableCell className="font-medium">{stock.symbol}</TableCell>
							<TableCell>{stock.name}</TableCell>
							<TableCell className="text-right">
								${stock.price.toFixed(2)}
							</TableCell>
							<TableCell className="text-right">
								<span
									className={`flex items-center justify-end ${
										stock.percentageChange >= 0
											? "text-green-600"
											: "text-red-600"
									}`}
								>
									{stock.percentageChange >= 0 ? (
										<ArrowUpIcon className="h-4 w-4 mr-1" />
									) : (
										<ArrowDownIcon className="h-4 w-4 mr-1" />
									)}
									{Math.abs(stock.percentageChange).toFixed(2)}%
								</span>
							</TableCell>
							<TableCell className="text-right">
								{stock.volume.toLocaleString()}
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}






