import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export default function InsuranceAddon({ bookingPrice, onInsuranceChange }) {
  const [selected, setSelected] = useState(false);
  const insuranceFee = 7; // Fixed $7 fee

  const handleToggle = (checked) => {
    setSelected(checked);
    onInsuranceChange(checked, insuranceFee);
  };

  return (
    <Card className="border-2 border-blue-300 bg-gradient-to-r from-blue-50 to-cyan-50">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Checkbox
            id="insurance"
            checked={selected}
            onCheckedChange={handleToggle}
            className="mt-1"
          />
          <div className="flex-1">
            <Label htmlFor="insurance" className="text-lg font-semibold text-slate-900 cursor-pointer flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              PureTask Protect
              <Badge className="bg-blue-600 text-white ml-2">+${insuranceFee}</Badge>
            </Label>
            <p className="text-sm text-slate-600 mt-1 mb-4">
              Complete peace of mind for your cleaning
            </p>

            <div className="grid md:grid-cols-2 gap-3 mb-4">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-slate-900">Damage Protection</p>
                  <p className="text-slate-600">Up to $500</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-slate-900">Lost Items</p>
                  <p className="text-slate-600">Up to $300</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-slate-900">No-Show Protection</p>
                  <p className="text-slate-600">Free replacement</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-slate-900">Instant Refund</p>
                  <p className="text-slate-600">If unsatisfied</p>
                </div>
              </div>
            </div>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="link" className="text-blue-600 p-0 h-auto text-sm">
                  View full coverage details
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Shield className="w-6 h-6 text-blue-600" />
                    PureTask Protect Coverage
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">What's Covered:</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span><strong>Accidental Damage:</strong> Up to $500 for items damaged during cleaning</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span><strong>Lost/Stolen Items:</strong> Up to $300 for items that go missing</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span><strong>No-Show Protection:</strong> Free same-day replacement cleaner</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span><strong>Satisfaction Guarantee:</strong> Instant refund if you're not happy</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-amber-900">
                        <p className="font-semibold mb-1">How Claims Work:</p>
                        <ul className="list-disc list-inside space-y-1">
                          <li>Claims under $100 are auto-approved instantly</li>
                          <li>Larger claims reviewed within 24 hours</li>
                          <li>Submit via the app with photos</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-slate-500">
                    <p>* Claims must be submitted within 48 hours of cleaning completion. See full terms and conditions for exclusions and limits.</p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}