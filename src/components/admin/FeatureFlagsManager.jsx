import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Flag, Plus, Edit, Trash2, AlertCircle, CheckCircle, Users, Zap, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const CATEGORIES = [
  'trust_safety',
  'payments',
  'booking',
  'messaging',
  'analytics',
  'ui',
  'experimental'
];

const TARGET_USERS = [
  'all',
  'clients',
  'cleaners',
  'admins',
  'beta_users'
];

const CATEGORY_COLORS = {
  trust_safety: 'emerald',
  payments: 'blue',
  booking: 'purple',
  messaging: 'pink',
  analytics: 'amber',
  ui: 'cyan',
  experimental: 'orange'
};

export default function FeatureFlagsManager() {
  const [flags, setFlags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingFlag, setEditingFlag] = useState(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [formData, setFormData] = useState({
    flag_key: '',
    flag_name: '',
    description: '',
    is_enabled: false,
    category: 'experimental',
    target_users: 'all',
    rollout_percentage: 100,
    notes: ''
  });

  useEffect(() => {
    loadFlags();
  }, []);

  const loadFlags = async () => {
    setLoading(true);
    try {
      const allFlags = await base44.entities.FeatureFlag.list('-created_date');
      setFlags(allFlags);
    } catch (error) {
      console.error('Error loading flags:', error);
      toast.error('Failed to load feature flags');
    }
    setLoading(false);
  };

  const handleToggleFlag = async (flag) => {
    try {
      const newEnabledState = !flag.is_enabled;
      const updateData = {
        is_enabled: newEnabledState,
        [newEnabledState ? 'enabled_date' : 'disabled_date']: new Date().toISOString()
      };

      await base44.entities.FeatureFlag.update(flag.id, updateData);
      
      toast.success(`Feature ${newEnabledState ? 'enabled' : 'disabled'}: ${flag.flag_name}`);
      loadFlags();
    } catch (error) {
      console.error('Error toggling flag:', error);
      toast.error('Failed to toggle feature flag');
    }
  };

  const handleCreateFlag = async () => {
    if (!formData.flag_key || !formData.flag_name) {
      toast.error('Flag key and name are required');
      return;
    }

    try {
      await base44.entities.FeatureFlag.create({
        ...formData,
        flag_key: formData.flag_key.toLowerCase().replace(/\s+/g, '_')
      });

      toast.success('Feature flag created successfully!');
      setShowCreateDialog(false);
      setFormData({
        flag_key: '',
        flag_name: '',
        description: '',
        is_enabled: false,
        category: 'experimental',
        target_users: 'all',
        rollout_percentage: 100,
        notes: ''
      });
      loadFlags();
    } catch (error) {
      console.error('Error creating flag:', error);
      toast.error('Failed to create feature flag');
    }
  };

  const handleUpdateFlag = async () => {
    if (!editingFlag) return;

    try {
      await base44.entities.FeatureFlag.update(editingFlag.id, formData);
      
      toast.success('Feature flag updated successfully!');
      setEditingFlag(null);
      loadFlags();
    } catch (error) {
      console.error('Error updating flag:', error);
      toast.error('Failed to update feature flag');
    }
  };

  const handleDeleteFlag = async (flag) => {
    if (!confirm(`Are you sure you want to delete "${flag.flag_name}"?`)) return;

    try {
      await base44.entities.FeatureFlag.delete(flag.id);
      toast.success('Feature flag deleted');
      loadFlags();
    } catch (error) {
      console.error('Error deleting flag:', error);
      toast.error('Failed to delete feature flag');
    }
  };

  const startEdit = (flag) => {
    setFormData({
      flag_key: flag.flag_key,
      flag_name: flag.flag_name,
      description: flag.description || '',
      is_enabled: flag.is_enabled,
      category: flag.category,
      target_users: flag.target_users,
      rollout_percentage: flag.rollout_percentage,
      notes: flag.notes || ''
    });
    setEditingFlag(flag);
  };

  const groupedFlags = flags.reduce((acc, flag) => {
    if (!acc[flag.category]) {
      acc[flag.category] = [];
    }
    acc[flag.category].push(flag);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Flag className="w-6 h-6 text-purple-600" />
            Feature Flags
          </h2>
          <p className="text-slate-600">Control feature rollout and experiments</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Flag
        </Button>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="border-emerald-200 bg-emerald-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-700">Enabled</p>
                <p className="text-2xl font-bold text-emerald-900">
                  {flags.filter(f => f.is_enabled).length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-slate-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-700">Disabled</p>
                <p className="text-2xl font-bold text-slate-900">
                  {flags.filter(f => !f.is_enabled).length}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-slate-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-700">Total Flags</p>
                <p className="text-2xl font-bold text-purple-900">{flags.length}</p>
              </div>
              <Flag className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Flags by Category */}
      {CATEGORIES.map(category => {
        const categoryFlags = groupedFlags[category] || [];
        if (categoryFlags.length === 0) return null;

        const color = CATEGORY_COLORS[category];

        return (
          <Card key={category} className="border-0 shadow-lg">
            <CardHeader className={`bg-gradient-to-r from-${color}-50 to-${color}-100`}>
              <CardTitle className="capitalize">
                {category.replace(/_/g, ' ')} ({categoryFlags.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                {categoryFlags.map((flag, idx) => (
                  <motion.div
                    key={flag.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card className={`border-2 ${flag.is_enabled ? `border-${color}-200` : 'border-slate-200'}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-slate-900">{flag.flag_name}</h3>
                              <Badge
                                className={flag.is_enabled ? `bg-${color}-500` : 'bg-slate-400'}
                              >
                                {flag.is_enabled ? 'Enabled' : 'Disabled'}
                              </Badge>
                              {flag.rollout_percentage < 100 && (
                                <Badge variant="outline" className="text-blue-600 border-blue-300">
                                  {flag.rollout_percentage}% rollout
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-slate-600 mb-2">{flag.description}</p>
                            <div className="flex items-center gap-3 text-xs text-slate-500">
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {flag.target_users}
                              </span>
                              <span className="font-mono bg-slate-100 px-2 py-0.5 rounded">
                                {flag.flag_key}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Switch
                              checked={flag.is_enabled}
                              onCheckedChange={() => handleToggleFlag(flag)}
                            />
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => startEdit(flag)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleDeleteFlag(flag)}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {flags.length === 0 && (
        <Alert>
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>
            No feature flags configured yet. Click "New Flag" to create one.
          </AlertDescription>
        </Alert>
      )}

      {/* Create/Edit Dialog */}
      <Dialog 
        open={showCreateDialog || !!editingFlag} 
        onOpenChange={(open) => {
          if (!open) {
            setShowCreateDialog(false);
            setEditingFlag(null);
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingFlag ? 'Edit Feature Flag' : 'Create Feature Flag'}
            </DialogTitle>
            <DialogDescription>
              {editingFlag ? 'Update feature flag settings' : 'Add a new feature flag to control functionality'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Flag Key *</label>
              <Input
                value={formData.flag_key}
                onChange={(e) => setFormData({ ...formData, flag_key: e.target.value })}
                placeholder="e.g., gps_validation_enabled"
                disabled={!!editingFlag}
              />
              <p className="text-xs text-slate-500 mt-1">
                Unique identifier (lowercase, underscores only)
              </p>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Flag Name *</label>
              <Input
                value={formData.flag_name}
                onChange={(e) => setFormData({ ...formData, flag_name: e.target.value })}
                placeholder="e.g., GPS Validation"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="What does this flag control?"
                rows={3}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Category</label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat}>
                        {cat.replace(/_/g, ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Target Users</label>
                <Select 
                  value={formData.target_users} 
                  onValueChange={(value) => setFormData({ ...formData, target_users: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TARGET_USERS.map(target => (
                      <SelectItem key={target} value={target}>
                        {target}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Rollout Percentage: {formData.rollout_percentage}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={formData.rollout_percentage}
                onChange={(e) => setFormData({ ...formData, rollout_percentage: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Internal Notes</label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Internal notes about this flag..."
                rows={2}
              />
            </div>

            <div className="flex gap-3">
              <Button
                onClick={editingFlag ? handleUpdateFlag : handleCreateFlag}
                className="flex-1"
              >
                {editingFlag ? 'Update Flag' : 'Create Flag'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateDialog(false);
                  setEditingFlag(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}