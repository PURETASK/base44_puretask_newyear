import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { History, TrendingUp, TrendingDown, Loader2, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function ClientCreditHistory({ clientEmail }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentBalance, setCurrentBalance] = useState(0);

  useEffect(() => {
    if (clientEmail) {
      loadHistory();
    }
  }, [clientEmail]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const [txns, profiles] = await Promise.all([
        base44.entities.CreditTransaction.filter({ client_email: clientEmail }),
        base44.entities.ClientProfile.filter({ user_email: clientEmail })
      ]);

      const sorted = txns.sort((a, b) => 
        new Date(b.created_date) - new Date(a.created_date)
      );

      setTransactions(sorted);
      setCurrentBalance(profiles[0]?.credits_balance || 0);
    } catch (error) {
      console.error('Error loading credit history:', error);
    }
    setLoading(false);
  };

  const getTransactionColor = (type) => {
    const colors = {
      purchase: 'bg-green-100 text-green-800',
      promo: 'bg-purple-100 text-purple-800',
      charge: 'bg-red-100 text-red-800',
      refund: 'bg-blue-100 text-blue-800',
      adjustment: 'bg-amber-100 text-amber-800',
      late_cancel_charge: 'bg-orange-100 text-orange-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getTransactionIcon = (amount) => {
    return amount >= 0 ? (
      <ArrowUpCircle className="w-4 h-4 text-green-600" />
    ) : (
      <ArrowDownCircle className="w-4 h-4 text-red-600" />
    );
  };

  if (!clientEmail) {
    return (
      <Card className="border-0 shadow-xl rounded-2xl">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-2xl">
          <CardTitle className="flex items-center gap-2 font-fredoka text-graphite">
            <History className="w-6 h-6 text-purple-600" />
            Credit Transaction History
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 text-center">
          <p className="text-gray-500 font-verdana">Select a client to view their credit history</p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="border-0 shadow-xl rounded-2xl">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-2xl">
          <CardTitle className="flex items-center gap-2 font-fredoka text-graphite">
            <History className="w-6 h-6 text-purple-600" />
            Credit Transaction History
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-puretask-blue" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-xl rounded-2xl">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-2xl">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 font-fredoka text-graphite">
            <History className="w-6 h-6 text-purple-600" />
            Credit Transaction History
          </CardTitle>
          <div className="text-right">
            <p className="text-sm text-gray-600 font-verdana">Current Balance</p>
            <p className="text-2xl font-fredoka font-bold text-graphite">{currentBalance.toLocaleString()} credits</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <p className="text-sm text-gray-600 font-verdana mb-4">
          Client: <span className="font-medium text-graphite">{clientEmail}</span>
        </p>

        {transactions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 font-verdana">No transactions found for this client</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-gray-200">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-fredoka">Date</TableHead>
                  <TableHead className="font-fredoka">Type</TableHead>
                  <TableHead className="font-fredoka text-right">Amount</TableHead>
                  <TableHead className="font-fredoka text-right">Balance After</TableHead>
                  <TableHead className="font-fredoka">Note</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((txn) => (
                  <TableRow key={txn.id} className="hover:bg-gray-50">
                    <TableCell className="font-verdana text-sm">
                      {format(new Date(txn.created_date), 'MMM dd, yyyy HH:mm')}
                    </TableCell>
                    <TableCell>
                      <Badge className={getTransactionColor(txn.transaction_type)}>
                        {txn.transaction_type.replace(/_/g, ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {getTransactionIcon(txn.amount_credits)}
                        <span className={`font-fredoka font-semibold ${txn.amount_credits >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {txn.amount_credits >= 0 ? '+' : ''}{txn.amount_credits.toLocaleString()}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-verdana text-sm">
                      {txn.balance_after?.toLocaleString() || '-'}
                    </TableCell>
                    <TableCell className="font-verdana text-sm text-gray-600 max-w-xs truncate">
                      {txn.note || '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}