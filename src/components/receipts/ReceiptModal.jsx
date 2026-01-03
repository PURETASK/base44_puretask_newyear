import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Download, Receipt } from 'lucide-react';
import { format } from 'date-fns';

export default function ReceiptModal({ booking, payment, onClose }) {
  if (!booking) return null;

  const handleDownload = () => {
    // In production, generate PDF here
    alert('PDF download functionality would be implemented here with a library like jsPDF');
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="w-6 h-6 text-emerald-500" />
            Receipt
          </DialogTitle>
        </DialogHeader>

        <div className="bg-white p-8 rounded-lg border">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">PureTask</h2>
            <p className="text-slate-600">Cleaning Services Receipt</p>
          </div>

          <Separator className="mb-6" />

          {/* Receipt Details */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-sm text-slate-600 mb-1">Receipt Date</p>
              <p className="font-semibold text-slate-900">
                {payment ? format(new Date(payment.paid_at), 'MMM d, yyyy') : format(new Date(), 'MMM d, yyyy')}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-1">Booking ID</p>
              <p className="font-semibold text-slate-900">{booking.id.substring(0, 8)}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-1">Service Date</p>
              <p className="font-semibold text-slate-900">
                {format(new Date(booking.date), 'MMM d, yyyy')} at {booking.start_time}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-1">Duration</p>
              <p className="font-semibold text-slate-900">{booking.hours} hours</p>
            </div>
          </div>

          <Separator className="mb-6" />

          {/* Service Address */}
          <div className="mb-6">
            <p className="text-sm text-slate-600 mb-1">Service Location</p>
            <p className="font-semibold text-slate-900">{booking.address}</p>
          </div>

          <Separator className="mb-6" />

          {/* Cleaner Info */}
          <div className="mb-6">
            <p className="text-sm text-slate-600 mb-1">Cleaner</p>
            <p className="font-semibold text-slate-900">{booking.cleaner_email}</p>
          </div>

          <Separator className="mb-6" />

          {/* Price Breakdown */}
          <div className="space-y-3 mb-6">
            <div className="flex justify-between">
              <span className="text-slate-700">Cleaning Service ({booking.hours} hours)</span>
              <span className="font-semibold text-slate-900">${(booking.total_price / 1.15).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-700">Platform Fee (15%)</span>
              <span className="font-semibold text-slate-900">${(booking.total_price * 0.15 / 1.15).toFixed(2)}</span>
            </div>
            {payment && payment.amount < booking.total_price && (
              <div className="flex justify-between text-emerald-600">
                <span>Credits Applied</span>
                <span className="font-semibold">-${(booking.total_price - payment.amount).toFixed(2)}</span>
              </div>
            )}
          </div>

          <Separator className="mb-6" />

          {/* Total */}
          <div className="flex justify-between items-center mb-6">
            <span className="text-xl font-semibold text-slate-900">Total Paid</span>
            <span className="text-3xl font-bold text-emerald-600">
              ${payment ? payment.amount.toFixed(2) : booking.total_price.toFixed(2)}
            </span>
          </div>

          {payment && (
            <>
              <Separator className="mb-6" />
              <div className="text-center text-sm text-slate-600">
                <p>Payment Method: {payment.payment_method || 'Credit Card'}</p>
                <p className="mt-1">Transaction ID: {payment.stripe_payment_intent_id || payment.id.substring(0, 16)}</p>
              </div>
            </>
          )}
        </div>

        <div className="flex gap-3">
          <Button onClick={onClose} variant="outline" className="flex-1">
            Close
          </Button>
          <Button onClick={handleDownload} className="flex-1 bg-emerald-500 hover:bg-emerald-600">
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}