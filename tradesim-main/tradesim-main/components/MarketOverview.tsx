'use client';

import { useEffect, useRef } from 'react';
import { useStore } from '@/lib/store';
import { useTimeStore } from '@/lib/timeStore';
import { useIntradayData } from '@/services/5min_data/5min_data' ;
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowUpIcon, ArrowDownIcon } from 'lucide-react';

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
  const { stocks, updateStocks } = useStore();
  const { currentTime } = useTimeStore();
  const previousRef = useRef<Map<string, number>>(new Map());
  const response = useIntradayData(SYMBOLS);
  const data = response.data || [];
  
  useEffect(() => {
    const loadPrices = async () => {

      interface PriceRow {
        sym_root: string;
        close: number;
        volume: number;
      }

      interface UpdatedStock {
        symbol: string;
        name: string;
        price: number;
        previousPrice: number;
        percentageChange: number;
        volume: number;
      }

      const updatedStocks: UpdatedStock[] = (data as PriceRow[]).map((row: PriceRow): UpdatedStock => {
        const previousPrice: number = previousRef.current.get(row.sym_root) ?? row.close;
        const percentageChange: number = ((row.close - previousPrice) / previousPrice) * 100;

        // Update the reference for the next frame
        previousRef.current.set(row.sym_root, row.close);

        return {
          symbol: row.sym_root,
          name: row.sym_root, // You could map this to company names if needed
          price: row.close,
          previousPrice,
          percentageChange,
          volume: row.volume,
        };
      });

      updateStocks(updatedStocks);
    };

    loadPrices();
  }, [currentTime]);

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
            <TableCell className="text-right">${stock.price.toFixed(2)}</TableCell>
            <TableCell className="text-right">
              <span
                className={`flex items-center justify-end ${
                  stock.percentageChange >= 0 ? 'text-green-600' : 'text-red-600'
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
