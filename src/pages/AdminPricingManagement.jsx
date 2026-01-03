import React, { useState, useEffect } from 'react';
import { handleError } from '@/lib/errorHandler';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Loader2, Plus, Settings, Trash2, Edit, ToggleLeft, ToggleRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function AdminPricingManagement() {
  const [pricingRules, setPricingRules] = useState([]);
  const [bundleOffers, setBundleOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingRule, setEditingRule] = useState(null);
  const [showRuleDialog, setShowRuleDialog] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const rules = await base44.entities.PricingRule.filter({}, '-priority', 100);
      const bundles = await base44.entities.BundleOffer.filter({}, '-created_date', 100);
      setPricingRules(rules);
      setBundleOffers(bundles);
    } catch (error) {
      handleError(error, { userMessage: 'Error loading pricing data:', showToast: false });
    }
    setLoading(false);
  };

  const toggleRule = async (rule) => {
    try {
      await base44.entities.PricingRule.update(rule.id, {
        is_active: !rule.is_active
      });
      loadData();
    } catch (error) {
      handleError(error, { userMessage: 'Error toggling rule:', showToast: false });
    }
  };

  const deleteRule = async (ruleId) => {
    if (confirm('Delete this pricing rule?')) {
      try {
        await base44.entities.PricingRule.delete(ruleId);
        loadData();
      } catch (error) {
        handleError(error, { userMessage: 'Error deleting rule:', showToast: false });
      }
    }
  };

  const ruleTypeColors = {
    time_of_day: 'bg-blue-100 text-blue-800',
    day_of_week: 'bg-purple-100 text-purple-800',
    distance: 'bg-green-100 text-green-800',
    surge: 'bg-red-100 text-red-800',
    last_minute: 'bg-yellow-100 text-yellow-800',
    holiday: 'bg-pink-100 text-pink-800',
    first_booking_discount: 'bg-indigo-100 text-indigo-800'
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-fredoka font-bold text-graphite">Pricing Management</h1>
            <p className="text-gray-600 font-verdana mt-2">Manage dynamic pricing rules and bundle offers</p>
          </div>
          <Button className="brand-gradient text-white rounded-full font-fredoka">
            <Plus className="w-4 h-4 mr-2" />
            New Rule
          </Button>
        </div>

        {/* Pricing Rules */}
        <Card className="rounded-3xl border-0 shadow-xl mb-8">
          <CardHeader>
            <CardTitle className="font-fredoka text-2xl">Active Pricing Rules</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pricingRules.length === 0 ? (
              <div className="text-center py-12">
                <Settings className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-verdana">No pricing rules configured</p>
              </div>
            ) : (
              pricingRules.map((rule) => (
                <div
                  key={rule.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleRule(rule)}
                      className="rounded-full"
                    >
                      {rule.is_active ? (
                        <ToggleRight className="w-6 h-6 text-green-600" />
                      ) : (
                        <ToggleLeft className="w-6 h-6 text-gray-400" />
                      )}
                    </Button>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={ruleTypeColors[rule.rule_type] || 'bg-gray-100 text-gray-800'}>
                          {rule.rule_type?.replace('_', ' ')}
                        </Badge>
                        <span className="font-fredoka font-semibold text-graphite">
                          {rule.display_label || 'Unnamed Rule'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 font-verdana">
                        Multiplier: {((rule.multiplier || 1) * 100).toFixed(0)}% • Priority: {rule.priority || 0}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteRule(rule.id)}
                      className="text-red-600 hover:bg-red-50 rounded-full"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Bundle Offers */}
        <Card className="rounded-3xl border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="font-fredoka text-2xl">Bundle Offers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {bundleOffers.length === 0 ? (
              <div className="text-center py-12">
                <Settings className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-verdana">No bundle offers configured</p>
              </div>
            ) : (
              bundleOffers.map((bundle) => (
                <div
                  key={bundle.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary">
                        {bundle.offer_type?.replace('_', ' ')}
                      </Badge>
                      <span className="font-fredoka font-semibold text-graphite">
                        {bundle.display_message || 'Bundle Offer'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 font-verdana">
                      {bundle.discount_percentage && `${bundle.discount_percentage}% off`}
                      {bundle.discount_amount && `$${bundle.discount_amount} off`}
                    </p>
                  </div>

                  <Badge className={bundle.is_active ? 'bg-green-500' : 'bg-gray-400'}>
                    {bundle.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}