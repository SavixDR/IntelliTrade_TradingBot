import React from 'react';

type Prediction = {
  buy: number;
  neutral: number;
  sell: number;
};

type PredictionData = {
  [symbol: string]: Prediction;
};

type Props = {
  data?: PredictionData;
};

const PredictionPane: React.FC<Props> = ({ data = {} }) => {
  return (
    <aside className="fixed top-[64px] left-0 bottom-0 w-[240px] bg-background text-foreground pt-6 px-4 shadow-md z-40 overflow-y-auto border-r border-border">
      <h3 className="text-base font-semibold mb-6 text-center">Our predictions:</h3>

      {Object.entries(data).map(([symbol, { buy, neutral, sell }]) => (
        <div key={symbol} className="mb-8 w-full flex flex-col items-center">
          <div className="font-medium mb-2 text-center">{symbol}</div>

          <div className="w-full max-w-[160px] h-4 rounded overflow-hidden bg-muted flex">
            <div
              className="bg-green-500"
              style={{ width: `${buy * 100}%` }}
              title={`Buy: ${(buy * 100).toFixed(0)}%`}
            />
            <div
              className="bg-yellow-400"
              style={{ width: `${neutral * 100}%` }}
              title={`Neutral: ${(neutral * 100).toFixed(0)}%`}
            />
            <div
              className="bg-red-500"
              style={{ width: `${sell * 100}%` }}
              title={`Sell: ${(sell * 100).toFixed(0)}%`}
            />
          </div>

          <div className="flex justify-between gap-3 mt-2 text-xs font-medium w-full max-w-[160px]">
            <span className="text-green-500">Buy</span>
            <span className="text-yellow-400">Neutral</span>
            <span className="text-red-500">Sell</span>
          </div>
        </div>
      ))}
    </aside>
  );
};

export default PredictionPane;
