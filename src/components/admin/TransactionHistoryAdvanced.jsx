/**
 * Transaction History Advanced - Section 5
 * Comprehensive view of all credit transactions with filtering and export
 */

import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  History, Search, Download, Filter, Loader2, 
  ArrowUpCircle, ArrowDownCircle, Lock, Unlock, RefreshCw,
  ChevronLeft, ChevronRight, Calendar, ExternalLink
} from 'lucide-react';
import { creditsToUSD } from '../credits/CreditCalculator';

export default function TransactionHistoryAdvanced() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [filteredTxns, setFilteredTxns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [clientFilter, setClientFilter] = useState('all');
  const [dateRangeFilter, setDateRangeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [clients, setClients] = useState([]);

  useEffect(() => {
    loadTransactions();
    loadClients();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [transactions, searchQuery, typeFilter, clientFilter, dateRangeFilter, statusFilter, sortOrder]);

  useEffect(() => {
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchQuery, typeFilter, clientFilter, dateRangeFilter, statusFilter]);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const txns = await base44.entities.CreditTransaction.list('-created_date', 1000);
      setTransactions(txns);
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
    setLoading(false);
  };

  const loadClients = async () => {
    try {
      const clientProfiles = await base44.entities.ClientProfile.list('', 1000);
      const uniqueClients = [...new Set(clientProfiles.map(c => c.user_email))].sort();
      setClients(uniqueClients);
    } catch (error) {
      console.error('Error loading clients:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...transactions];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(txn =>
        txn.client_email?.toLowerCase().includes(query) ||
        txn.note?.toLowerCase().includes(query) ||
        txn.booking_id?.includes(query)
      );
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(txn => txn.transaction_type === typeFilter);
    }

    // Client filter
    if (clientFilter !== 'all') {
      filtered = filtered.filter(txn => txn.client_email === clientFilter);
    }

    // Date range filter
    if (dateRangeFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateRangeFilter) {
        case '7days':
          filterDate.setDate(now.getDate() - 7);
          break;
        case '30days':
          filterDate.setDate(now.getDate() - 30);
          break;
        case '90days':
          filterDate.setDate(now.getDate() - 90);
          break;
      }
      
      if (dateRangeFilter !== 'all') {
        filtered = filtered.filter(txn => new Date(txn.created_date) >= filterDate);
      }
    }

    // Status filter (prepared for future use)
    if (statusFilter !== 'all' && filtered.some(txn => txn.status)) {
      filtered = filtered.filter(txn => txn.status === statusFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      const dateA = new Date(a.created_date);
      const dateB = new Date(b.created_date);
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    setFilteredTxns(filtered);
  };

  const getTransactionIcon = (type) => {
    const icons = {
      purchase: <ArrowDownCircle className="w-5 h-5 text-emerald-600" />,
      hold: <Lock className="w-5 h-5 text-amber-600" />,
      release: <Unlock className="w-5 h-5 text-blue-600" />,
      charge: <ArrowUpCircle className="w-5 h-5 text-purple-600" />,
      refund: <RefreshCw className="w-5 h-5 text-green-600" />,
      reversal: <ArrowDownCircle className="w-5 h-5 text-red-600" />
    };
    return icons[type] || <History className="w-5 h-5 text-slate-400" />;
  };

  const getTypeBadge = (type) => {
    const styles = {
      purchase: 'bg-emerald-100 text-emerald-700',
      hold: 'bg-amber-100 text-amber-700',
      release: 'bg-blue-100 text-blue-700',
      charge: 'bg-purple-100 text-purple-700',
      refund: 'bg-green-100 text-green-700',
      reversal: 'bg-red-100 text-red-700'
    };
    return (
      <Badge className={`${styles[type] || 'bg-slate-100 text-slate-700'} capitalize`}>
        {type?.replace('_', ' ')}
      </Badge>
    );
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Client', 'Type', 'Credits', 'USD Value', 'Note', 'Balance After', 'Booking ID'];
    const rows = filteredTxns.map(txn => [
      new Date(txn.created_date).toISOString(),
      txn.client_email,
      txn.transaction_type,
      txn.amount_credits,
      creditsToUSD(Math.abs(txn.amount_credits)).toFixed(2),
      txn.note,
      txn.balance_after || '',
      txn.booking_id || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `credit_transactions_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Calculate stats
  const totalPurchases = filteredTxns
    .filter(txn => txn.transaction_type === 'purchase' && txn.amount_credits > 0)
    .reduce((sum, txn) => sum + txn.amount_credits, 0);

  const totalCharges = filteredTxns
    .filter(txn => txn.transaction_type === 'charge')
    .reduce((sum, txn) => sum + Math.abs(txn.amount_credits), 0);

  const totalRefunds = filteredTxns
    .filter(txn => txn.transaction_type === 'refund')
    .reduce((sum, txn) => sum + txn.amount_credits, 0);

  // Pagination
  const totalPages = Math.ceil(filteredTxns.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedTxns = filteredTxns.slice(startIndex, endIndex);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Loader2 className="w-12 h-12 animate-spin text-emerald-500 mx-auto mb-4" />
          <p className="text-slate-600">Loading transaction history...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-6 h-6 text-slate-600" />
            Transaction History
          </div>
          <Button
            onClick={exportToCSV}
            variant="outline"
            size="sm"
            disabled={filteredTxns.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Summary Stats */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
            <p className="text-sm text-emerald-700 mb-1">Total Purchases</p>
            <p className="text-2xl font-bold text-emerald-600">
              {totalPurchases.toLocaleString()}
            </p>
            <p className="text-xs text-emerald-600">
              ≈ ${creditsToUSD(totalPurchases).toFixed(2)}
            </p>
          </div>

          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <p className="text-sm text-purple-700 mb-1">Total Charges</p>
            <p className="text-2xl font-bold text-purple-600">
              {totalCharges.toLocaleString()}
            </p>
            <p className="text-xs text-purple-600">
              ≈ ${creditsToUSD(totalCharges).toFixed(2)}
            </p>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-700 mb-1">Total Refunds</p>
            <p className="text-2xl font-bold text-blue-600">
              {totalRefunds.toLocaleString()}
            </p>
            <p className="text-xs text-blue-600">
              ≈ ${creditsToUSD(totalRefunds).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                placeholder="Search by email, note, or booking ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="purchase">Purchase</SelectItem>
                <SelectItem value="promo">Promo</SelectItem>
                <SelectItem value="adjustment">Adjustment</SelectItem>
                <SelectItem value="charge">Charge</SelectItem>
                <SelectItem value="refund">Refund</SelectItem>
                <SelectItem value="reversal">Reversal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <Select value={clientFilter} onValueChange={setClientFilter}>
              <SelectTrigger className="w-full md:w-64">
                <SelectValue placeholder="All Clients" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Clients</SelectItem>
                {clients.map(email => (
                  <SelectItem key={email} value={email}>{email}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={dateRangeFilter} onValueChange={setDateRangeFilter}>
              <SelectTrigger className="w-full md:w-48">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue placeholder="All Time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="7days">Last 7 Days</SelectItem>
                <SelectItem value="30days">Last 30 Days</SelectItem>
                <SelectItem value="90days">Last 90 Days</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortOrder} onValueChange={setSortOrder}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Newest First</SelectItem>
                <SelectItem value="asc">Oldest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Count & Pagination Controls */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <p className="text-sm text-slate-600">
              Showing {startIndex + 1}-{Math.min(endIndex, filteredTxns.length)} of {filteredTxns.length} transactions
            </p>
            <Select value={pageSize.toString()} onValueChange={(val) => { setPageSize(Number(val)); setCurrentPage(1); }}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="25">25 per page</SelectItem>
                <SelectItem value="50">50 per page</SelectItem>
                <SelectItem value="100">100 per page</SelectItem>
                <SelectItem value="200">200 per page</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={loadTransactions}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <div className="flex items-center gap-2 border rounded-lg p-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm text-slate-600 px-2">
                Page {currentPage} of {totalPages || 1}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || totalPages === 0}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Transaction Table */}
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="w-12"></TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Credits</TableHead>
                <TableHead className="text-right">USD Value</TableHead>
                <TableHead>Note</TableHead>
                <TableHead className="text-right">Balance After</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedTxns.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12">
                    <History className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">No transactions found</p>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedTxns.map((txn) => (
                  <TableRow key={txn.id} className="hover:bg-slate-50">
                    <TableCell>
                      {getTransactionIcon(txn.transaction_type)}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {new Date(txn.created_date).toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </TableCell>
                    <TableCell className="font-medium">
                      <button
                        onClick={() => navigate(createPageUrl('AdminClientManagement') + '?search=' + txn.client_email)}
                        className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                      >
                        {txn.client_email}
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </TableCell>
                    <TableCell>
                      {getTypeBadge(txn.transaction_type)}
                    </TableCell>
                    <TableCell className={`text-right font-bold ${
                      txn.amount_credits > 0 ? 'text-emerald-600' : 'text-slate-900'
                    }`}>
                      {txn.amount_credits > 0 ? '+' : ''}
                      {txn.amount_credits.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right text-sm text-slate-600">
                      ${creditsToUSD(Math.abs(txn.amount_credits)).toFixed(2)}
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-sm text-slate-600">
                      {txn.note}
                      {txn.booking_id && (
                        <button
                          onClick={() => navigate(createPageUrl('AdminBookingsConsoleV2') + '?bookingId=' + txn.booking_id)}
                          className="block text-xs text-blue-600 hover:text-blue-800 hover:underline mt-1 flex items-center gap-1"
                        >
                          Booking: {txn.booking_id.slice(0, 8)}...
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {txn.balance_after !== null && txn.balance_after !== undefined
                        ? txn.balance_after.toLocaleString()
                        : 'N/A'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}