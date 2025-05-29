'use client';

import { useState } from 'react';
import { Stock, Trade } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useStore } from '@/lib/store';
import { useTimeStore } from '@/lib/timeStore';

interface TradeModalProps {
  stock: Stock;
  type: 'buy' | 'sell';
  onClose: () => void;
  onConfirm: (trade: Trade) => void;
}

export function TradeModal({ stock, type, onClose, onConfirm }: TradeModalProps) {
  const [quantity, setQuantity] = useState('1');
  const { user } = useStore();
  const { toast } = useToast();
  const {currentTime} = useTimeStore();

  const handleTrade = () => {
    if (!user) return;

    const qty = parseInt(quantity);
    const total = qty * stock.price;

    if (type === 'buy' && total > user.balance) {
      toast({
        title: 'Insufficient funds',
        description: 'You do not have enough balance for this trade.',
        variant: 'destructive',
      });
      return;
    }

    const currentQty = user.portfolio[stock.symbol]?.quantity || 0;

    if (type === 'sell' && qty > currentQty) {
      toast({
        title: 'Insufficient shares',
        description: 'You do not have enough shares for this trade.',
        variant: 'destructive',
      });
      return;
    }

    const trade: Trade = {
      symbol: stock.symbol,
      quantity: qty,
      price: stock.price,
      type,
      timestamp: new Date(currentTime),
    };

    toast({
      title: 'Trade executed',
      description: `Successfully ${type === 'buy' ? 'bought' : 'sold'} ${qty} shares of ${stock.symbol}`,
    });

    onConfirm(trade);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{type === 'buy' ? 'Buy' : 'Sell'} {stock.symbol}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="quantity">Quantity</label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>
          <div className="text-sm">
            Total: ${(parseInt(quantity) * stock.price).toFixed(2)}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleTrade}>{type === 'buy' ? 'Buy' : 'Sell'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
