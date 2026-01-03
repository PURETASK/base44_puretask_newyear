import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DollarSign } from 'lucide-react';

const TIP_PERCENTAGES = [15, 18, 20, 25];

export default function TipSelector({ bookingTotal, onTipChange }) {
  const [selectedPercentage, setSelectedPercentage] = useState(null);
  const [customAmount, setCustomAmount] = useState('');

  const handlePercentageSelect = (percentage) => {
    setSelectedPercentage(percentage);
    setCustomAmount('');
    const tipAmount = bookingTotal * (percentage / 100);
    onTipChange(tipAmount, percentage);
  };

  const handleCustomAmount = (amount) => {
    setCustomAmount(amount);
    setSelectedPercentage(null);
    onTipChange(parseFloat(amount) || 0, null);
  };

  return (
    <div className="space-y-4">
      <Label className="text-lg font-semibold">Add a Tip (Optional)</Label>
      <p className="text-sm text-slate-600">
        Show your appreciation for great service! 100% goes to your cleaner.
      </p>

      {/* Percentage Buttons */}
      <div className="grid grid-cols-4 gap-2">
        {TIP_PERCENTAGES.map(percent => {
          const tipAmount = bookingTotal * (percent / 100);
          return (
            <Button
              key={percent}
              variant={selectedPercentage === percent ? "default" : "outline"}
              onClick={() => handlePercentageSelect(percent)}
              className={selectedPercentage === percent ? "bg-emerald-500 hover:bg-emerald-600" : ""}
            >
              <div className="text-center w-full">
                <div className="font-bold">{percent}%</div>
                <div className="text-xs">${tipAmount.toFixed(2)}</div>
              </div>
            </Button>
          );
        })}
      </div>

      {/* Custom Amount */}
      <div>
        <Label>Custom Tip Amount</Label>
        <div className="relative mt-2">
          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            type="number"
            value={customAmount}
            onChange={(e) => handleCustomAmount(e.target.value)}
            placeholder="0.00"
            className="pl-8"
            min="0"
            step="0.01"
          />
        </div>
      </div>

      {(selectedPercentage || customAmount) && (
        <div className="bg-emerald-50 p-3 rounded-lg">
          <p className="text-sm text-emerald-800">
            <strong>Thank you for your generosity!</strong> Your tip will be added to the cleaner's payout.
          </p>
        </div>
      )}
    </div>
  );
}