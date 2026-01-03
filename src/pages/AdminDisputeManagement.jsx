import React, { useState, useEffect } from 'react';
import { handleError } from '@/lib/errorHandler';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, AlertCircle, Eye } from 'lucide-react';
import DisputeResolutionTool from '../components/disputes/DisputeResolutionTool';

export default function AdminDisputeManagement() {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    loadDisputes();
  }, []);

  const loadDisputes = async () => {
    setLoading(true);
    try {
      const results = await base44.entities.Dispute.filter({}, '-created_date', 100);
      setDisputes(results);
    } catch (error) {
      handleError(error, { userMessage: 'Error loading disputes:', showToast: false });
    }
    setLoading(false);
  };

  const handleViewDispute = async (dispute) => {
    try {
      const bookings = await base44.entities.Booking.filter({ id: dispute.booking_id });
      if (bookings.length > 0) {
        setSelectedBooking(bookings[0]);
        setSelectedDispute(dispute);
        setShowDialog(true);
      }
    } catch (error) {
      handleError(error, { userMessage: 'Error loading booking:', showToast: false });
    }
  };

  const statusColors = {
    open: 'bg-red-100 text-red-800',
    investigating: 'bg-yellow-100 text-yellow-800',
    awaiting_client: 'bg-blue-100 text-blue-800',
    awaiting_cleaner: 'bg-purple-100 text-purple-800',
    resolved: 'bg-green-100 text-green-800',
    closed: 'bg-gray-100 text-gray-800'
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-puretask-blue" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 lg:p-10 bg-soft-cloud">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-fredoka font-bold text-graphite mb-2">
            Dispute Management
          </h1>
          <p className="text-gray-600 font-verdana">
            Review and resolve booking disputes
          </p>
        </div>

        <Card className="rounded-3xl border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="font-fredoka text-2xl">All Disputes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {disputes.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-verdana">No disputes found</p>
              </div>
            ) : (
              disputes.map((dispute) => (
                <div
                  key={dispute.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={statusColors[dispute.status]}>
                        {dispute.status}
                      </Badge>
                      <Badge variant="secondary">
                        {dispute.category}
                      </Badge>
                      <Badge variant="outline">
                        Filed by: {dispute.filed_by}
                      </Badge>
                    </div>
                    <p className="text-sm font-verdana text-gray-700 line-clamp-2">
                      {dispute.description}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 font-verdana">
                      Booking: {dispute.booking_id} • 
                      Created: {new Date(dispute.created_date).toLocaleDateString()}
                    </p>
                  </div>

                  <Button
                    onClick={() => handleViewDispute(dispute)}
                    variant="outline"
                    className="rounded-full font-fredoka"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Review
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Resolution Dialog */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="font-fredoka text-2xl">
                Dispute #{selectedDispute?.id?.slice(0, 8)}
              </DialogTitle>
            </DialogHeader>
            {selectedDispute && selectedBooking && (
              <DisputeResolutionTool
                dispute={selectedDispute}
                booking={selectedBooking}
                onResolved={() => {
                  setShowDialog(false);
                  loadDisputes();
                }}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}