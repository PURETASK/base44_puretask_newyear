import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { 
  getTransactionTypeLabel, 
  getTransactionColor, 
  formatTransactionAmount,
  creditsToUSD 
} from './CreditSystemService';
import { format } from 'date-fns';

export default function TransactionHistory({ clientEmail, limit = 20 }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTransactions();
  }, [clientEmail]);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const txs = await base44.entities.CreditTransaction.filter(
        { client_email: clientEmail },
        '-created_date',
        limit
      );
      setTransactions(txs);
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-puretask-blue" />
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <Card className="rounded-3xl border-0 shadow-xl">
        <CardContent className="p-8 text-center">
          <p className="text-gray-500 font-verdana">No transactions yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-3xl border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="font-fredoka text-2xl">Transaction History</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {transactions.map((tx) => {
          const isPositive = tx.amount_credits >= 0;
          const color = getTransactionColor(tx.transaction_type);
          
          return (
            <div
              key={tx.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-full ${isPositive ? 'bg-green-100' : 'bg-red-100'}`}>
                  {isPositive ? (
                    <ArrowUpCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <ArrowDownCircle className="w-5 h-5 text-red-600" />
                  )}
                </div>
                <div>
                  <p className="font-fredoka font-semibold text-graphite">
                    {getTransactionTypeLabel(tx.transaction_type)}
                  </p>
                  {tx.note && (
                    <p className="text-sm text-gray-600 font-verdana">{tx.note}</p>
                  )}
                  <p className="text-xs text-gray-500 font-verdana mt-1">
                    {format(new Date(tx.created_date), 'MMM d, yyyy h:mm a')}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-fredoka font-bold text-xl ${color}`}>
                  {formatTransactionAmount(tx.amount_credits)}
                </p>
                <p className="text-sm text-gray-500 font-verdana">
                  ${creditsToUSD(Math.abs(tx.amount_credits)).toFixed(2)}
                </p>
                <p className="text-xs text-gray-400 font-verdana mt-1">
                  Balance: {tx.balance_after?.toLocaleString() || 'N/A'}
                </p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}