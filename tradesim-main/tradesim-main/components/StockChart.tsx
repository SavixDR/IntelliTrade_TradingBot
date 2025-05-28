'use client';

import { useState, useEffect } from 'react';
import { useTimeStore } from '@/lib/timeStore';
import { useIntradayData } from '@/services/5min_data/5min_data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartTypeSelector } from '@/components/ChartTypeSelector';
import { StockSelector } from '@/components/StockSelector';
import { ChartContent } from '@/components/ChartContent';
import { Switch } from '@/components/ui/switch';

type ChartType = 'line' | 'area' | 'bar';

interface PriceData {
  [key: string]: number | string;
  time: string;
}

const SYMBOLS = ['AAPL', 'GOOG', 'MSFT', 'AMZN', 'TSLA'];

export function StockChart() {
  const { currentTime } = useTimeStore();
  const [selectedStocks, setSelectedStocks] = useState<string[]>([]);
  const [priceHistory, setPriceHistory] = useState<PriceData[]>([]);
  const [chartType, setChartType] = useState<ChartType>('line');
  const [showPercentages, setShowPercentages] = useState(true);

  const data = useIntradayData(SYMBOLS);

  useEffect(() => {
    if (selectedStocks.length === 0 && SYMBOLS.length > 0) {
      setSelectedStocks([SYMBOLS[0]]);
    }
  }, []);

  useEffect(() => {
    if (selectedStocks.length === 0 || data.length === 0) return;

    const relevantData = data.filter((d) => selectedStocks.includes(d.sym_root));

    const latestPoint: PriceData = {
      time: currentTime.toLocaleTimeString(),
    };

    selectedStocks.forEach((symbol) => {
      const last = [...relevantData].reverse().find((d) => d.sym_root === symbol);
      if (last) latestPoint[symbol] = last.CLOSE;
    });

    setPriceHistory((prev) => {
      const updated = [...prev, latestPoint].slice(-50);
      return updated;
    });
  }, [data, selectedStocks, currentTime]);

  return (
    <Card>
      <CardHeader className="space-y-3 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-normal">Price Chart</CardTitle>
          <ChartTypeSelector activeType={chartType} onChange={setChartType} />
        </div>
        <div className="flex justify-between flex-wrap items-center gap-4">
          <StockSelector
            stocks={SYMBOLS.map((symbol) => ({ symbol, name: symbol, price: 0, previousPrice: 0, percentageChange: 0, volume: 0 }))}
            selectedStocks={selectedStocks}
            onSelect={setSelectedStocks}
          />
          <div className="flex items-center space-x-2">
            <Switch
              checked={showPercentages}
              onCheckedChange={setShowPercentages}
              id="percentage-mode"
            />
            <label
              htmlFor="percentage-mode"
              className="text-sm text-muted-foreground whitespace-nowrap"
            >
              Show percentages
            </label>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          {selectedStocks.length > 0 && (
            <ChartContent
              data={priceHistory}
              type={chartType}
              dataKeys={selectedStocks}
              showPercentages={showPercentages}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
