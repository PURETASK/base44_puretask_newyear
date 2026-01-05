
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, MapPin, Calendar, DollarSign, Home, Navigation, MessageSquare, CheckCircle, Camera } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';

export default function JobDetailsFullModal({ job, onClose, onStartJob, onCompleteJob }) {
  const [showFullMap, setShowFullMap] = useState(false);

  if (!job) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-500 text-white';
      case 'cleaning_now': return 'bg-green-500 text-white';
      case 'in_progress': return 'bg-purple-500 text-white';
      case 'awaiting_cleaner': return 'bg-amber-500 text-white';
      case 'completed': return 'bg-emerald-500 text-white';
      default: return 'bg-slate-500 text-white';
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      'scheduled': 'Scheduled',
      'cleaning_now': 'Cleaning Now',
      'in_progress': 'In Progress',
      'awaiting_cleaner': 'Awaiting Confirmation',
      'completed': 'Completed'
    };
    return labels[status] || status;
  };

  const openInGoogleMaps = () => {
    if (job.latitude && job.longitude) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${job.latitude},${job.longitude}`, '_blank');
    } else {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(job.address)}`, '_blank');
    }
  };

  // Google Maps Static API for preview
  const mapImageUrl = job.latitude && job.longitude
    ? `https://maps.googleapis.com/maps/api/staticmap?center=${job.latitude},${job.longitude}&zoom=15&size=600x300&markers=color:red%7C${job.latitude},${job.longitude}&key=YOUR_GOOGLE_MAPS_API_KEY`
    : null;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0 rounded-xl flex flex-col">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col h-full"
        >
          {/* Header */}
          <DialogHeader className="sticky top-0 bg-gradient-to-r from-blue-500 to-cyan-600 text-white p-6 flex items-start justify-between rounded-t-xl z-10">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="w-6 h-6" />
                <h2 className="text-2xl font-bold">
                  {format(parseISO(job.date), 'EEEE, MMMM d, yyyy')}
                </h2>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              <X className="w-6 h-6" />
            </Button>
          </DialogHeader>

          <div className="p-6 space-y-6 flex-1 overflow-y-auto">
            {/* Location Section with Map */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05, duration: 0.3 }}
            >
              <Card className="border-2 border-blue-200 bg-blue-50/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-900">
                    <MapPin className="w-5 h-5" />
                    Location
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-white p-4 rounded-lg">
                    <p className="font-medium text-slate-900 mb-1">{job.address}</p>
                    {job.latitude && job.longitude && (
                      <p className="text-sm text-slate-500">
                        GPS: {job.latitude.toFixed(6)}, {job.longitude.toFixed(6)}
                      </p>
                    )}
                  </div>

                  {/* Map Preview */}
                  {mapImageUrl && (
                    <div className="relative">
                      <img
                        src={mapImageUrl}
                        alt="Location Map"
                        className="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => setShowFullMap(!showFullMap)}
                      />
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-white text-slate-900 shadow-lg">
                          Click to expand
                        </Badge>
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={openInGoogleMaps}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <Navigation className="w-4 h-4 mr-2" />
                    Get Directions in Google Maps
                  </Button>

                  {job.parking_instructions && (
                    <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg">
                      <p className="text-sm font-medium text-amber-900 mb-1">Parking Instructions:</p>
                      <p className="text-sm text-amber-800">{job.parking_instructions}</p>
                    </div>
                  )}

                  {job.entry_instructions && (
                    <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                      <p className="text-sm font-medium text-blue-900 mb-1">Entry Instructions:</p>
                      <p className="text-sm text-blue-800">{job.entry_instructions}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Payment Info */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
            >
              <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    Payment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Total</span>
                      <span className="text-2xl font-bold text-slate-900">${job.total_price.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-600">Your Earnings (85%)</span>
                      <span className="font-semibold text-green-600">${(job.total_price * 0.85).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-600">Platform Fee (15%)</span>
                      <span className="text-slate-500">${(job.total_price * 0.15).toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Date & Time (New Card - extracted from old header) */}
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    Job Schedule & Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Date</span>
                      <span className="font-medium">{format(parseISO(job.date), 'MMMM d, yyyy')}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Start Time</span>
                      <span className="font-medium">{job.start_time}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Duration</span>
                      <span className="font-medium">{job.hours} hours</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t mt-2">
                      <span className="text-slate-600">Status</span>
                      <Badge className={getStatusColor(job.status)}>
                        {getStatusLabel(job.status)}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Property Info */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Home className="w-5 h-5 text-purple-600" />
                    Property Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Type</span>
                      <span className="font-medium capitalize">{job.home_type || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Bedrooms</span>
                      <span className="font-medium">{job.bedrooms || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Bathrooms</span>
                      <span className="font-medium">{job.bathrooms || 'N/A'}</span>
                    </div>
                    {job.square_feet && (
                      <div className="flex justify-between">
                        <span className="text-slate-600">Square Feet</span>
                        <span className="font-medium">{job.square_feet} sq ft</span>
                      </div>
                    )}
                    {job.has_pets && (
                      <div className="flex items-center gap-2 pt-2 border-t">
                        <Badge className="bg-amber-100 text-amber-800">
                          Pets Present
                        </Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Tasks */}
            {job.tasks && job.tasks.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                      Tasks to Complete
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-2">
                      {job.tasks.map((task, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-slate-50 p-3 rounded-lg">
                          <CheckCircle className="w-4 h-4 text-emerald-500" />
                          <span className="text-sm font-medium text-slate-700">{task}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Special Instructions */}
            {(job.product_allergies || job.product_preferences || job.notes) && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.3 }}
              >
                <Card className="border-2 border-amber-200 bg-amber-50/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-amber-900">
                      <MessageSquare className="w-5 h-5" />
                      Special Instructions & Preferences
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {job.product_allergies && (
                      <div className="bg-white p-3 rounded-lg">
                        <p className="text-sm font-semibold text-red-700 mb-1">⚠️ Product Allergies:</p>
                        <p className="text-sm text-slate-700">{job.product_allergies}</p>
                      </div>
                    )}
                    {job.product_preferences && (
                      <div className="bg-white p-3 rounded-lg">
                        <p className="text-sm font-semibold text-blue-700 mb-1">Product Preferences:</p>
                        <p className="text-sm text-slate-700">{job.product_preferences}</p>
                      </div>
                    )}
                    {job.notes && (
                      <div className="bg-white p-3 rounded-lg">
                        <p className="text-sm font-semibold text-slate-700 mb-1">Additional Notes:</p>
                        <p className="text-sm text-slate-700">{job.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.3 }}
            className="p-6 pt-4 border-t bg-white sticky bottom-0 z-10 flex gap-3"
          >
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Close
            </Button>
            {job.status === 'scheduled' && onStartJob && (
              <Button
                onClick={() => onStartJob(job)}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Check In & Start Job
              </Button>
            )}
            {(job.status === 'cleaning_now' || job.status === 'in_progress') && onCompleteJob && (
              <Button
                onClick={() => onCompleteJob(job)}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                <Camera className="w-4 h-4 mr-2" />
                Complete & Upload Photos
              </Button>
            )}
          </motion.div>
        </motion.div>
      </DialogContent>

      {/* Full Map Modal */}
      {showFullMap && mapImageUrl && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4"
          onClick={() => setShowFullMap(false)}
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.95 }}
            className="relative max-w-6xl w-full"
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowFullMap(false)}
              className="absolute top-2 right-2 bg-white text-slate-900 hover:bg-slate-100 z-10"
            >
              <X className="w-6 h-6" />
            </Button>
            <img
              src={mapImageUrl}
              alt="Full Map"
              className="w-full h-auto rounded-lg"
            />
          </motion.div>
        </motion.div>
      )}
    </Dialog>
  );
}
