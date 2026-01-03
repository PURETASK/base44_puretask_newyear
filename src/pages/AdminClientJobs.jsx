
import React, { useState, useEffect } from 'react';
import { handleError } from '@/lib/errorHandler';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, Eye, Calendar, DollarSign, MapPin, User, ArrowLeft, Home, Download, Filter, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import ClientJobDetailsModal from '../components/admin/ClientJobDetailsModal';
import { convertTo12Hour } from '../components/utils/timeUtils';

export default function AdminClientJobs() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    active: 0,
    cancelled: 0,
    totalRevenue: 0,
    avgBookingPrice: 0
  });

  useEffect(() => {
    checkAdminAccess();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [searchTerm, statusFilter, bookings]);

  const checkAdminAccess = async () => {
    try {
      const user = await base44.auth.me();
      if (user.role !== 'admin') {
        navigate(createPageUrl('Home'));
        return;
      }
      await loadBookings();
    } catch (error) {
      handleError(error, { userMessage: 'Error checking admin access:', showToast: false });
      navigate(createPageUrl('Home'));
    }
  };

  const loadBookings = async () => {
    setLoading(true);
    try {
      const allBookings = await base44.entities.Booking.list('-created_date');
      setBookings(allBookings);
      
      // Calculate stats
      const completed = allBookings.filter(b => b.status === 'completed');
      const active = allBookings.filter(b => ['scheduled', 'cleaning_now', 'in_progress'].includes(b.status));
      const cancelled = allBookings.filter(b => b.status === 'cancelled');
      const totalRevenue = completed.reduce((sum, b) => sum + (b.total_price * 0.15), 0);
      const avgBookingPrice = allBookings.length > 0 ? allBookings.reduce((sum, b) => sum + b.total_price, 0) / allBookings.length : 0;

      setStats({
        total: allBookings.length,
        completed: completed.length,
        active: active.length,
        cancelled: cancelled.length,
        totalRevenue,
        avgBookingPrice
      });
    } catch (error) {
      handleError(error, { userMessage: 'Error loading bookings:', showToast: false });
    }
    setLoading(false);
  };

  const filterBookings = () => {
    let filtered = [...bookings];

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(booking => 
        booking.client_email?.toLowerCase().includes(search) ||
        booking.cleaner_email?.toLowerCase().includes(search) ||
        booking.address?.toLowerCase().includes(search) ||
        booking.id?.toLowerCase().includes(search)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(b => b.status === statusFilter);
    }

    setFilteredBookings(filtered);
  };

  const getStatusColor = (status) => {
    const colors = {
      'available': 'bg-slate-100 text-slate-800',
      'payment_hold': 'bg-amber-100 text-amber-800',
      'awaiting_cleaner': 'bg-yellow-100 text-yellow-800',
      'scheduled': 'bg-blue-100 text-blue-800',
      'reschedule_requested': 'bg-purple-100 text-purple-800',
      'cleaning_now': 'bg-indigo-100 text-indigo-800',
      'in_progress': 'bg-cyan-100 text-cyan-800',
      'completed': 'bg-emerald-100 text-emerald-800',
      'cancelled': 'bg-red-100 text-red-800',
      'disputed': 'bg-orange-100 text-orange-800'
    };
    return colors[status] || 'bg-slate-100 text-slate-800';
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Client', 'Cleaner', 'Address', 'Tasks', 'Price', 'Status'];
    const rows = filteredBookings.map(b => [
      b.date,
      b.client_email,
      b.cleaner_email || 'Unassigned',
      b.address,
      b.tasks?.join(', ') || '',
      `$${b.total_price.toFixed(2)}`,
      b.status
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `client-jobs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-soft-cloud flex items-center justify-center">
        <div className="text-center">
          <Calendar className="w-12 h-12 animate-spin text-puretask-blue mx-auto mb-4" />
          <p className="text-lg text-graphite font-verdana">Loading client jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-soft-cloud p-6 lg:p-10">
      <div className="max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          {/* Navigation */}
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
            <Button
              variant="outline"
              size="default"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 bg-white hover:bg-gray-50 rounded-full font-fredoka"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <Button
              variant="outline"
              size="default"
              onClick={() => navigate(createPageUrl('AdminDashboard'))}
              className="flex items-center gap-2 bg-white hover:bg-green-50 border-green-300 text-fresh-mint rounded-full font-fredoka"
            >
              <Home className="w-4 h-4" />
              Admin Dashboard
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-fredoka font-bold text-graphite mb-2 flex items-center gap-3">
                <div className="w-12 h-12 brand-gradient rounded-2xl flex items-center justify-center shadow-lg">
                  <Calendar className="w-7 h-7 text-white" />
                </div>
                Client Jobs
              </h1>
              <p className="text-lg text-gray-600 font-verdana">Comprehensive view of all client bookings and requests</p>
            </div>

            <Button onClick={exportToCSV} variant="outline" className="flex items-center gap-2 bg-white hover:bg-gray-50 rounded-full font-fredoka">
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="border-0 shadow-lg rounded-2xl">
              <CardContent className="p-6">
                <Calendar className="w-8 h-8 text-puretask-blue mb-2" />
                <p className="text-3xl font-fredoka font-bold text-graphite">{stats.total}</p>
                <p className="text-sm text-gray-600 font-verdana">Total Jobs</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl">
              <CardContent className="p-6">
                <Calendar className="w-8 h-8 text-fresh-mint mb-2" />
                <p className="text-3xl font-fredoka font-bold text-graphite">{stats.completed}</p>
                <p className="text-sm text-gray-600 font-verdana">Completed</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl">
              <CardContent className="p-6">
                <Calendar className="w-8 h-8 text-puretask-blue mb-2" />
                <p className="text-3xl font-fredoka font-bold text-graphite">{stats.active}</p>
                <p className="text-sm text-gray-600 font-verdana">Active</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl">
              <CardContent className="p-6">
                <AlertCircle className="w-8 h-8 text-red-600 mb-2" />
                <p className="text-3xl font-fredoka font-bold text-graphite">{stats.cancelled}</p>
                <p className="text-sm text-gray-600 font-verdana">Cancelled</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Card className="border-0 shadow-lg rounded-2xl">
              <CardContent className="p-6">
                <DollarSign className="w-8 h-8 text-fresh-mint mb-2" />
                <p className="text-3xl font-fredoka font-bold text-graphite">${stats.totalRevenue.toFixed(0)}</p>
                <p className="text-sm text-gray-600 font-verdana">Platform Revenue</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <Card className="border-0 shadow-lg rounded-2xl">
              <CardContent className="p-6">
                <DollarSign className="w-8 h-8 text-purple-600 mb-2" />
                <p className="text-3xl font-fredoka font-bold text-graphite">${stats.avgBookingPrice.toFixed(0)}</p>
                <p className="text-sm text-gray-600 font-verdana">Avg Job Price</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Filters */}
        <Card className="mb-8 border-0 shadow-lg rounded-2xl">
          <CardHeader>
            <CardTitle className="font-fredoka text-graphite flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-600" />
              Search & Filter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  placeholder="Search by client, cleaner, address, or booking ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="cleaning_now">Cleaning Now</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="disputed">Disputed</SelectItem>
                  <SelectItem value="awaiting_cleaner">Awaiting Cleaner</SelectItem>
                  <SelectItem value="payment_hold">Payment Hold</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(searchTerm || statusFilter !== 'all') && (
              <div className="mt-4 flex items-center gap-2">
                <p className="text-sm text-slate-600">
                  Showing {filteredBookings.length} of {bookings.length} jobs
                </p>
                {(searchTerm || statusFilter !== 'all') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bookings Table */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Cleaner</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Tasks</TableHead>
                    <TableHead>Home Details</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings.map((booking) => (
                    <TableRow key={booking.id} className="hover:bg-slate-50">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <div>
                            <div className="font-medium">
                              {format(new Date(booking.date), 'MMM d, yyyy')}
                            </div>
                            <div className="text-sm text-slate-500">
                              {convertTo12Hour(booking.start_time)} ({booking.hours}hrs)
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-blue-500" />
                          <div className="text-sm max-w-[150px] truncate">{booking.client_email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-emerald-500" />
                          <div className="text-sm max-w-[150px] truncate">
                            {booking.cleaner_email || <span className="text-slate-400">Unassigned</span>}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-red-500" />
                          <div className="text-sm max-w-[200px] truncate">{booking.address}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {booking.tasks?.slice(0, 2).map((task, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {task.replace(/_/g, ' ')}
                            </Badge>
                          ))}
                          {booking.tasks?.length > 2 && (
                            <Badge variant="outline" className="text-xs">+{booking.tasks.length - 2}</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs text-slate-600 space-y-1">
                          <div>{booking.bedrooms} bed, {booking.bathrooms} bath</div>
                          <div>{booking.square_feet} sq ft</div>
                          <div className="capitalize">{booking.home_type}</div>
                          {booking.has_pets && <Badge variant="outline" className="text-xs">Pets</Badge>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-green-600" />
                          <div className="font-medium text-green-600">${booking.total_price.toFixed(2)}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(booking.status)}>
                          {booking.status.replace(/_/g, ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedBooking(booking)}
                          className="hover:bg-blue-50"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {filteredBookings.length === 0 && (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">No jobs found matching your criteria</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Details Modal */}
        {selectedBooking && (
          <ClientJobDetailsModal
            booking={selectedBooking}
            onClose={() => setSelectedBooking(null)}
            onUpdate={loadBookings}
          />
        )}
      </div>
    </div>
  );
}
