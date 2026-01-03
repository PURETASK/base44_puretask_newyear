import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tag, Plus, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BundleOfferCard({ offer, onApply, applied = false }) {
  const getSavingsText = () => {
    if (offer.discount_amount) {
      return `Save $${offer.discount_amount}`;
    }
    if (offer.discount_percentage) {
      return `Save ${offer.discount_percentage}%`;
    }
    return 'Special Offer';
  };

  const getOfferTypeColor = () => {
    switch (offer.offer_type) {
      case 'multi_service':
        return 'from-blue-500 to-cyan-500';
      case 'multi_booking':
        return 'from-purple-500 to-pink-500';
      case 'upgrade_upsell':
        return 'from-emerald-500 to-green-500';
      default:
        return 'from-slate-500 to-gray-500';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`border-2 ${applied ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-emerald-300'} transition-all`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className={`w-10 h-10 bg-gradient-to-r ${getOfferTypeColor()} rounded-lg flex items-center justify-center`}>
                <Tag className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">{offer.offer_name}</h3>
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white mt-1">
                  {getSavingsText()}
                </Badge>
              </div>
            </div>
            {applied && (
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            )}
          </div>

          <p className="text-sm text-slate-600 mb-4">
            {offer.display_message}
          </p>

          {offer.valid_until && (
            <p className="text-xs text-slate-500 mb-3">
              Valid until {new Date(offer.valid_until).toLocaleDateString()}
            </p>
          )}

          {!applied ? (
            <Button
              onClick={() => onApply(offer)}
              className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Apply Offer
            </Button>
          ) : (
            <Button
              onClick={() => onApply(null)}
              variant="outline"
              className="w-full border-emerald-500 text-emerald-600"
              size="sm"
            >
              Remove Offer
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}