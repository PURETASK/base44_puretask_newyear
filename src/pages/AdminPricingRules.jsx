import React, { useState, useEffect } from 'react';
import { handleError } from '@/lib/errorHandler';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Loader2, DollarSign, Plus, Edit, Trash2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { DEFAULT_PRICING_RULES } from '../components/pricing/PricingRules';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function AdminPricingRules() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [expandedConditions, setExpandedConditions] = useState({});

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    try {
      let dbRules = await base44.entities.PricingRule.list();
      
      // If no rules in DB, create defaults
      if (dbRules.length === 0) {
        for (const rule of DEFAULT_PRICING_RULES) {
          await base44.entities.PricingRule.create(rule);
        }
        dbRules = await base44.entities.PricingRule.list();
      }
      
      setRules(dbRules);
    } catch (error) {
      handleError(error, { userMessage: 'Error loading rules:', showToast: false });
      toast.error('Failed to load pricing rules');
    }
    setLoading(false);
  };

  const toggleRule = async (ruleId, currentStatus) => {
    try {
      await base44.entities.PricingRule.update(ruleId, {
        is_active: !currentStatus
      });
      toast.success(`Rule ${!currentStatus ? 'enabled' : 'disabled'}`);
      loadRules();
    } catch (error) {
      handleError(error, { userMessage: 'Error toggling rule:', showToast: false });
      toast.error('Failed to update rule');
    }
  };

  const updateMultiplier = async (ruleId, newMultiplier) => {
    try {
      await base44.entities.PricingRule.update(ruleId, {
        multiplier: parseFloat(newMultiplier)
      });
      toast.success('Multiplier updated');
      loadRules();
    } catch (error) {
      handleError(error, { userMessage: 'Error updating multiplier:', showToast: false });
      toast.error('Failed to update multiplier');
    }
  };

  const deleteRule = async (ruleId) => {
    try {
      await base44.entities.PricingRule.delete(ruleId);
      toast.success('Rule deleted successfully');
      loadRules();
    } catch (error) {
      handleError(error, { userMessage: 'Error deleting rule:', showToast: false });
      toast.error('Failed to delete rule');
    }
  };

  const pricingRuleSchema = z.object({
    rule_name: z.string().min(1, "Rule Name is required"),
    rule_type: z.enum(["time_of_day", "day_of_week", "distance", "surge", "last_minute", "holiday", "first_booking_discount"]),
    multiplier: z.coerce.number().min(0, "Multiplier cannot be negative"),
    conditions: z.string().refine((val) => {
      try {
        JSON.parse(val);
        return true;
      } catch {
        return false;
      }
    }, { message: "Must be valid JSON" }),
    is_active: z.boolean().default(true),
    display_label: z.string().optional(),
    priority: z.coerce.number().int().min(0).default(0),
  });

  const form = useForm({
    resolver: zodResolver(pricingRuleSchema),
    defaultValues: {
      rule_name: "",
      rule_type: "time_of_day",
      multiplier: 1.0,
      conditions: "{}",
      is_active: true,
      display_label: "",
      priority: 0,
    },
  });

  const onSubmit = async (data) => {
    try {
      const ruleData = { ...data };
      ruleData.conditions = JSON.parse(ruleData.conditions);

      if (editingRule) {
        await base44.entities.PricingRule.update(editingRule.id, ruleData);
        toast.success('Rule updated successfully');
      } else {
        await base44.entities.PricingRule.create(ruleData);
        toast.success('Rule created successfully');
      }
      setIsDialogOpen(false);
      setEditingRule(null);
      form.reset();
      loadRules();
    } catch (error) {
      handleError(error, { userMessage: 'Error saving rule:', showToast: false });
      toast.error(`Failed to save rule: ${error.message}`);
    }
  };

  const handleEditClick = (rule) => {
    setEditingRule(rule);
    form.reset({
      rule_name: rule.rule_name,
      rule_type: rule.rule_type,
      multiplier: rule.multiplier,
      conditions: JSON.stringify(rule.conditions, null, 2),
      is_active: rule.is_active,
      display_label: rule.display_label || "",
      priority: rule.priority || 0,
    });
    setIsDialogOpen(true);
  };

  const handleAddClick = () => {
    setEditingRule(null);
    form.reset({
      rule_name: "",
      rule_type: "time_of_day",
      multiplier: 1.0,
      conditions: "{}",
      is_active: true,
      display_label: "",
      priority: 0,
    });
    setIsDialogOpen(true);
  };

  const toggleConditionsExpanded = (ruleId) => {
    setExpandedConditions(prev => ({ ...prev, [ruleId]: !prev[ruleId] }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-soft-cloud flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-puretask-blue" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-soft-cloud p-6 lg:p-10">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-4xl font-fredoka font-bold text-graphite mb-2 flex items-center gap-3">
              <DollarSign className="w-10 h-10 text-puretask-blue" />
              Pricing Rules Manager
            </h1>
            <p className="text-lg text-gray-600 font-verdana">
              Configure dynamic pricing multipliers for different scenarios
            </p>
          </div>
          <Button onClick={handleAddClick} className="brand-gradient text-white rounded-full font-fredoka font-semibold shadow-lg">
            <Plus className="w-4 h-4 mr-2" /> Add New Rule
          </Button>
        </div>

        <Alert className="mb-6 bg-blue-50 border-blue-200">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800 font-verdana">
            Rules are applied based on priority order (higher priority first). Multiple rules can be combined for complex pricing strategies.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          {rules.map(rule => (
            <Card 
              key={rule.id} 
              className={`border-0 shadow-lg rounded-2xl transition-all ${
                rule.is_active 
                  ? 'bg-gradient-to-br from-green-50 to-emerald-50' 
                  : 'opacity-60 bg-white'
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="text-xl font-fredoka font-bold text-graphite">{rule.rule_name}</h3>
                      <Badge variant="outline" className="text-xs font-fredoka capitalize">
                        {rule.rule_type.replace(/_/g, ' ')}
                      </Badge>
                      {rule.is_active ? (
                        <Badge className="bg-green-500 text-white font-fredoka text-xs">
                          <CheckCircle className="w-3 h-3 mr-1" /> Active
                        </Badge>
                      ) : (
                        <Badge className="bg-red-500 text-white font-fredoka text-xs">
                          <XCircle className="w-3 h-3 mr-1" /> Inactive
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 font-verdana mb-1">{rule.display_label}</p>
                    <p className="text-xs text-gray-500 font-verdana">Priority: {rule.priority}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEditClick(rule)} className="h-9">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" className="h-9">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Pricing Rule?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the pricing rule "{rule.rule_name}".
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteRule(rule.id)} className="bg-red-600 hover:bg-red-700">
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    <Switch
                      checked={rule.is_active}
                      onCheckedChange={() => toggleRule(rule.id, rule.is_active)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-fredoka font-semibold mb-2 block text-graphite">Multiplier</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={rule.multiplier}
                      onChange={(e) => updateMultiplier(rule.id, e.target.value)}
                      disabled={!rule.is_active}
                      className="text-lg font-fredoka font-bold"
                    />
                    <p className={`text-xs mt-1 font-verdana ${
                      rule.multiplier > 1 ? 'text-amber-600' : 'text-fresh-mint'
                    }`}>
                      {rule.multiplier > 1 
                        ? `+${((rule.multiplier - 1) * 100).toFixed(0)}% increase`
                        : `-${((1 - rule.multiplier) * 100).toFixed(0)}% discount`
                      }
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-fredoka font-semibold mb-2 block text-graphite">Example Impact</Label>
                    <div className="p-3 bg-white rounded-2xl border border-gray-200">
                      <p className="text-sm text-gray-600 font-verdana">$100 booking becomes</p>
                      <p className="text-2xl font-fredoka font-bold text-fresh-mint">
                        ${(100 * rule.multiplier).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-gray-50 rounded-2xl border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-fredoka font-semibold text-graphite">Conditions:</p>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => toggleConditionsExpanded(rule.id)}
                      className="h-6 text-xs"
                    >
                      {expandedConditions[rule.id] ? 'Hide' : 'Show'} JSON
                    </Button>
                  </div>
                  {expandedConditions[rule.id] ? (
                    <pre className="text-xs text-gray-600 font-mono whitespace-pre-wrap">
                      {JSON.stringify(rule.conditions, null, 2)}
                    </pre>
                  ) : (
                    <p className="text-xs text-gray-500 font-verdana italic">
                      {Object.keys(rule.conditions || {}).length} condition(s) defined
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Create/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-fredoka text-2xl">
                {editingRule ? 'Edit Pricing Rule' : 'Create New Pricing Rule'}
              </DialogTitle>
              <DialogDescription className="font-verdana">
                {editingRule ? 'Update the details of the pricing rule.' : 'Add a new pricing rule to your system.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="rule_name" className="font-fredoka font-semibold">Rule Name *</Label>
                <Input 
                  id="rule_name" 
                  {...form.register('rule_name')} 
                  placeholder="e.g., Weekend Premium"
                />
                {form.formState.errors.rule_name && (
                  <p className="text-red-500 text-sm font-verdana">{form.formState.errors.rule_name.message}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="rule_type" className="font-fredoka font-semibold">Rule Type *</Label>
                <Select 
                  onValueChange={(value) => form.setValue('rule_type', value)} 
                  value={form.watch('rule_type')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a rule type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="time_of_day">Time of Day</SelectItem>
                    <SelectItem value="day_of_week">Day of Week</SelectItem>
                    <SelectItem value="distance">Distance</SelectItem>
                    <SelectItem value="surge">Surge</SelectItem>
                    <SelectItem value="last_minute">Last Minute</SelectItem>
                    <SelectItem value="holiday">Holiday</SelectItem>
                    <SelectItem value="first_booking_discount">First Booking Discount</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.rule_type && (
                  <p className="text-red-500 text-sm font-verdana">{form.formState.errors.rule_type.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="multiplier" className="font-fredoka font-semibold">Multiplier *</Label>
                  <Input 
                    id="multiplier" 
                    type="number" 
                    step="0.01" 
                    {...form.register('multiplier')}
                    placeholder="1.0"
                  />
                  {form.formState.errors.multiplier && (
                    <p className="text-red-500 text-sm font-verdana">{form.formState.errors.multiplier.message}</p>
                  )}
                  <p className="text-xs text-gray-500 font-verdana">
                    1.0 = no change, 1.2 = +20%, 0.8 = -20%
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="priority" className="font-fredoka font-semibold">Priority</Label>
                  <Input 
                    id="priority" 
                    type="number" 
                    {...form.register('priority')}
                    placeholder="0"
                  />
                  {form.formState.errors.priority && (
                    <p className="text-red-500 text-sm font-verdana">{form.formState.errors.priority.message}</p>
                  )}
                  <p className="text-xs text-gray-500 font-verdana">Higher = applies first</p>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="display_label" className="font-fredoka font-semibold">Display Label</Label>
                <Input 
                  id="display_label" 
                  {...form.register('display_label')}
                  placeholder="e.g., 20% weekend surcharge"
                />
                <p className="text-xs text-gray-500 font-verdana">Shown to users when rule applies</p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="conditions" className="font-fredoka font-semibold">Conditions (JSON) *</Label>
                <Textarea 
                  id="conditions" 
                  {...form.register('conditions')} 
                  className="min-h-[100px] font-mono text-xs"
                  placeholder='{"day_of_week": ["Saturday", "Sunday"]}'
                />
                {form.formState.errors.conditions && (
                  <p className="text-red-500 text-sm font-verdana">{form.formState.errors.conditions.message}</p>
                )}
                <p className="text-xs text-gray-500 font-verdana">Define when this rule applies (valid JSON object)</p>
              </div>

              <div className="flex items-center gap-2">
                <Switch 
                  id="is_active" 
                  checked={form.watch('is_active')} 
                  onCheckedChange={(checked) => form.setValue('is_active', checked)}
                />
                <Label htmlFor="is_active" className="font-fredoka">Active</Label>
              </div>

              <DialogFooter className="gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsDialogOpen(false);
                    setEditingRule(null);
                    form.reset();
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="brand-gradient text-white rounded-full font-fredoka font-semibold" 
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingRule ? 'Save Changes' : 'Create Rule'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}