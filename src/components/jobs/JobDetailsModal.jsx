import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  MapPin, Clock, DollarSign, Home, Bed, Bath, Maximize,
  X, Calendar, User, Briefcase, CheckCircle, AlertTriangle,
  Navigation, Shield, Sparkles, Camera
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { convertTo12Hour } from '../utils/timeUtils';
import { ServiceBadge } from '../utils/serviceIcons';
import { motion } from 'framer-motion';

export default function JobDetailsModal({ job, onClose, onClaim, canClaim = true, isMine = false }) {
  if (!job) return null;

  const formattedDate = format(parseISO(job.date), 'EEEE, MMMM d, yyyy');

  const openInGoogleMaps = () => {
    if (job.latitude && job.longitude) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${job.latitude},${job.longitude}`, '_blank');
    } else {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(job.address)}`, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with gradient */}
        <div className="sticky top-0 bg-gradient-to-r from-emerald-500 to-green-600 text-white p-6 rounded-t-2xl flex items-start justify-between z-10">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-6 h-6" />
              <h2 className="text-2xl font-bold">{formattedDate}</h2>
            </div>
            <div className="flex items-center gap-4 text-white/90">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{convertTo12Hour(job.start_time)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                <span>{job.hours} Hour{job.hours !== 1 ? 's' : ''}</span>
              </div>
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
        </div>

        <div className="p-6 space-y-6">
          {/* Status Alert */}
          {isMine && (
            <Alert className="bg-emerald-50 border-emerald-200">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <AlertDescription className="text-emerald-900 font-semibold">
                You've Claimed This Job!
              </AlertDescription>
            </Alert>
          )}

          {/* Top Grid: Payment + Property */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Payment Card */}
            <Card className="border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <DollarSign className="w-6 h-6 text-emerald-600" />
                  <h3 className="text-lg font-bold text-slate-900">Your Earnings</h3>
                </div>
                <div className="text-center py-4">
                  <p className="text-5xl font-black text-emerald-600 mb-2">
                    ${(job.total_price * 0.85).toFixed(2)}
                  </p>
                  <p className="text-sm text-slate-600 mb-1">85% Of Total</p>
                  <p className="text-xs text-slate-500">Total: ${job.total_price.toFixed(2)} (15% Platform Fee)</p>
                </div>
              </CardContent>
            </Card>

            {/* Property Details Card */}
            <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Home className="w-6 h-6 text-blue-600" />
                  <h3 className="text-lg font-bold text-slate-900">Property Details</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-white rounded-lg">
                    <Bed className="w-6 h-6 text-slate-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-slate-900">{job.bedrooms || 0}</p>
                    <p className="text-xs text-slate-500">Bedrooms</p>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg">
                    <Bath className="w-6 h-6 text-slate-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-slate-900">{job.bathrooms || 0}</p>
                    <p className="text-xs text-slate-500">Bathrooms</p>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg">
                    <Maximize className="w-6 h-6 text-slate-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-slate-900">{job.square_feet || 'N/A'}</p>
                    <p className="text-xs text-slate-500">Sq Ft</p>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg">
                    <Home className="w-6 h-6 text-slate-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-slate-900 capitalize">{job.home_type || 'N/A'}</p>
                    <p className="text-xs text-slate-500">Type</p>
                  </div>
                </div>
                {job.has_pets && (
                  <Badge className="mt-3 w-full justify-center bg-amber-100 text-amber-800">
                    🐾 Pets Present
                  </Badge>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Location Section */}
          <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-6 h-6 text-purple-600" />
                <h3 className="text-lg font-bold text-slate-900">Location & Access</h3>
              </div>
              
              <div className="bg-white p-4 rounded-xl mb-4">
                <p className="font-semibold text-slate-900 text-lg">{job.address}</p>
                {job.latitude && job.longitude && (
                  <p className="text-sm text-slate-500 mt-1">
                    GPS: {job.latitude.toFixed(6)}, {job.longitude.toFixed(6)}
                  </p>
                )}
              </div>

              <Button
                onClick={openInGoogleMaps}
                className="w-full bg-purple-600 hover:bg-purple-700 mb-4"
              >
                <Navigation className="w-4 h-4 mr-2" />
                Get Directions In Google Maps
              </Button>

              {job.parking_instructions && (
                <div className="bg-amber-50 border-2 border-amber-200 p-4 rounded-lg mb-3">
                  <p className="text-sm font-bold text-amber-900 mb-1">🅿️ Parking Instructions:</p>
                  <p className="text-sm text-amber-800">{job.parking_instructions}</p>
                </div>
              )}

              {job.entry_instructions && (
                <div className="bg-blue-50 border-2 border-blue-200 p-4 rounded-lg">
                  <p className="text-sm font-bold text-blue-900 mb-1">🔑 Entry Instructions:</p>
                  <p className="text-sm text-blue-800">{job.entry_instructions}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Services/Tasks Section */}
          <Card className="border-2 border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-6 h-6 text-indigo-600" />
                <h3 className="text-lg font-bold text-slate-900">Services Requested</h3>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {job.tasks?.map((task, idx) => (
                  <ServiceBadge key={idx} serviceName={task} size="default" className="justify-center py-3" />
                ))}
              </div>

              {job.task_quantities && Object.keys(job.task_quantities).length > 0 && (
                <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm font-bold text-slate-700 mb-2">📋 Quantities:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(job.task_quantities).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="text-slate-600 capitalize">{key.replace(/_/g, ' ')}:</span>
                        <span className="font-semibold text-slate-900">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Special Instructions */}
          {(job.notes || job.product_allergies || job.product_preferences) && (
            <Card className="border-2 border-amber-200 bg-amber-50/50">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="w-6 h-6 text-amber-600" />
                  <h3 className="text-lg font-bold text-amber-900">Special Instructions & Preferences</h3>
                </div>

                <div className="space-y-3">
                  {job.product_allergies && (
                    <Alert className="bg-red-50 border-red-300">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      <AlertDescription>
                        <p className="font-bold text-red-900 mb-1">⚠️ Product Allergies:</p>
                        <p className="text-red-800">{job.product_allergies}</p>
                      </AlertDescription>
                    </Alert>
                  )}

                  {job.product_preferences && (
                    <div className="bg-green-50 border-2 border-green-200 p-4 rounded-lg">
                      <p className="text-sm font-bold text-green-900 mb-1">✨ Product Preferences:</p>
                      <p className="text-sm text-green-800">{job.product_preferences}</p>
                    </div>
                  )}

                  {job.notes && (
                    <div className="bg-blue-50 border-2 border-blue-200 p-4 rounded-lg">
                      <p className="text-sm font-bold text-blue-900 mb-1">📝 Additional Notes:</p>
                      <p className="text-sm text-blue-800">{job.notes}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t-2 border-slate-200">
            <Button variant="outline" onClick={onClose} className="flex-1" size="lg">
              Close
            </Button>
            {!isMine && canClaim && onClaim && (
              <Button 
                onClick={() => onClaim(job.id)} 
                className="flex-1 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white"
                size="lg"
              >
                <Briefcase className="w-5 h-5 mr-2" />
                Claim This Job
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}