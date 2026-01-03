import React, { useState, useEffect } from 'react';
import { handleError } from '@/lib/errorHandler';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tag, Plus, Edit, Trash2, Sparkles, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import OfferConditionsBuilder from '../components/admin/OfferConditionsBuilder';

export default function AdminBundleOffers() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingOffer, setEditingOffer] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [formData, setFormData] = useState({
    offer_name: '',
    offer_type: 'multi_service',
    display_message: '',
    discount_amount: 0,
    discount_percentage: 0,
    conditions: {},
    is_active: true,
    valid_until: ''
  });

  useEffect(() => {
    loadOffers();
  }, []);

  const loadOffers = async () => {
    try {
      const allOffers = await base44.entities.BundleOffer.list();
      setOffers(allOffers);
    } catch (error) {
      handleError(error, { userMessage: 'Error loading offers:', showToast: false });
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingOffer) {
        await base44.entities.BundleOffer.update(editingOffer.id, formData);
        setMessage({ type: 'success', text: 'Offer updated successfully' });
      } else {
        await base44.entities.BundleOffer.create(formData);
        setMessage({ type: 'success', text: 'Offer created successfully' });
      }
      
      resetForm();
      loadOffers();
    } catch (error) {
      handleError(error, { userMessage: 'Error saving offer:', showToast: false });
      setMessage({ type: 'error', text: 'Failed to save offer' });
    }
  };

  const handleEdit = (offer) => {
    setEditingOffer(offer);
    setFormData({
      offer_name: offer.offer_name,
      offer_type: offer.offer_type,
      display_message: offer.display_message,
      discount_amount: offer.discount_amount || 0,
      discount_percentage: offer.discount_percentage || 0,
      conditions: offer.conditions || {},
      is_active: offer.is_active,
      valid_until: offer.valid_until || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (offerId) => {
    if (!window.confirm('Are you sure you want to delete this offer?')) return;
    
    try {
      await base44.entities.BundleOffer.delete(offerId);
      setMessage({ type: 'success', text: 'Offer deleted' });
      loadOffers();
    } catch (error) {
      handleError(error, { userMessage: 'Error deleting offer:', showToast: false });
      setMessage({ type: 'error', text: 'Failed to delete offer' });
    }
  };

  const resetForm = () => {
    setFormData({
      offer_name: '',
      offer_type: 'multi_service',
      display_message: '',
      discount_amount: 0,
      discount_percentage: 0,
      conditions: {},
      is_active: true,
      valid_until: ''
    });
    setEditingOffer(null);
    setShowForm(false);
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
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-fredoka font-bold text-graphite mb-2">Bundle Offers Management</h1>
          <p className="text-lg text-gray-600 font-verdana">Create and manage upsell offers for clients</p>
        </div>

        {message.text && (
          <Alert className={`mb-6 rounded-2xl ${message.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
            <AlertDescription className={`font-verdana ${message.type === 'success' ? 'text-green-900' : 'text-red-900'}`}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex justify-end mb-6">
          <Button
            onClick={() => setShowForm(!showForm)}
            className="brand-gradient text-white rounded-full font-fredoka font-semibold"
          >
            <Plus className="w-4 h-4 mr-2" />
            {showForm ? 'Cancel' : 'Create New Offer'}
          </Button>
        </div>

        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="border-0 shadow-xl mb-8 rounded-2xl">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-2xl">
                  <CardTitle className="font-fredoka text-graphite">
                    {editingOffer ? 'Edit Offer' : 'Create New Offer'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label className="font-fredoka font-medium text-graphite">Offer Name</Label>
                        <Input
                          value={formData.offer_name}
                          onChange={(e) => setFormData({...formData, offer_name: e.target.value})}
                          placeholder="e.g., Deep Clean Upgrade"
                          required
                          className="font-verdana"
                        />
                      </div>

                      <div>
                        <Label className="font-fredoka font-medium text-graphite">Offer Type</Label>
                        <Select
                          value={formData.offer_type}
                          onValueChange={(value) => setFormData({...formData, offer_type: value})}
                        >
                          <SelectTrigger className="font-verdana">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="multi_service">Multi-Service Bundle</SelectItem>
                            <SelectItem value="upgrade_upsell">Upgrade Upsell</SelectItem>
                            <SelectItem value="multi_booking">Multi-Booking Discount</SelectItem>
                            <SelectItem value="single_offer">Single Offer</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label className="font-fredoka font-medium text-graphite">Display Message</Label>
                      <Textarea
                        value={formData.display_message}
                        onChange={(e) => setFormData({...formData, display_message: e.target.value})}
                        placeholder="What clients will see"
                        rows={3}
                        required
                        className="rounded-2xl font-verdana"
                      />
                    </div>

                    <OfferConditionsBuilder
                      offerType={formData.offer_type}
                      conditions={formData.conditions}
                      onChange={(newConditions) => setFormData({...formData, conditions: newConditions})}
                    />

                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <Label className="font-fredoka font-medium text-graphite">Discount Amount ($)</Label>
                        <Input
                          type="number"
                          value={formData.discount_amount}
                          onChange={(e) => setFormData({...formData, discount_amount: parseFloat(e.target.value)})}
                          min="0"
                          step="0.01"
                          className="font-verdana"
                        />
                      </div>

                      <div>
                        <Label className="font-fredoka font-medium text-graphite">Discount Percentage (%)</Label>
                        <Input
                          type="number"
                          value={formData.discount_percentage}
                          onChange={(e) => setFormData({...formData, discount_percentage: parseFloat(e.target.value)})}
                          min="0"
                          max="100"
                          className="font-verdana"
                        />
                      </div>

                      <div>
                        <Label className="font-fredoka font-medium text-graphite">Valid Until</Label>
                        <Input
                          type="date"
                          value={formData.valid_until}
                          onChange={(e) => setFormData({...formData, valid_until: e.target.value})}
                          className="font-verdana"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                        id="is_active"
                        className="w-4 h-4"
                      />
                      <Label htmlFor="is_active" className="font-verdana text-graphite">Active</Label>
                    </div>

                    <div className="flex gap-3">
                      <Button type="button" variant="outline" onClick={resetForm} className="rounded-full font-fredoka">
                        Cancel
                      </Button>
                      <Button type="submit" className="bg-fresh-mint text-white rounded-full font-fredoka font-semibold hover:opacity-90">
                        {editingOffer ? 'Update' : 'Create'} Offer
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid md:grid-cols-2 gap-6">
          {offers.map((offer) => (
            <Card key={offer.id} className="border-0 shadow-lg rounded-2xl">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-2xl">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="font-fredoka text-graphite flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-purple-600" />
                      {offer.offer_name}
                    </CardTitle>
                    <Badge className="mt-2 bg-purple-100 text-purple-700 rounded-full font-fredoka" variant="outline">
                      {offer.offer_type.replace('_', ' ')}
                    </Badge>
                  </div>
                  <Badge className={`rounded-full font-fredoka ${offer.is_active ? 'bg-fresh-mint text-white' : 'bg-gray-400 text-white'}`}>
                    {offer.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <p className="text-gray-700 font-verdana">{offer.display_message}</p>
                
                {offer.conditions && Object.keys(offer.conditions).length > 0 && (
                  <div className="bg-gray-50 rounded-xl p-3 space-y-1">
                    <p className="text-xs font-fredoka font-semibold text-gray-600 mb-2">Conditions:</p>
                    {Object.entries(offer.conditions).map(([key, value]) => (
                      <p key={key} className="text-xs text-gray-600 font-verdana">
                        <span className="font-semibold">{key.replace(/_/g, ' ')}:</span> {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}
                      </p>
                    ))}
                  </div>
                )}
                
                <div className="flex gap-4">
                  {offer.discount_amount > 0 && (
                    <Badge variant="outline" className="text-fresh-mint border-fresh-mint rounded-full font-fredoka">
                      -${offer.discount_amount} off
                    </Badge>
                  )}
                  {offer.discount_percentage > 0 && (
                    <Badge variant="outline" className="text-puretask-blue border-puretask-blue rounded-full font-fredoka">
                      {offer.discount_percentage}% off
                    </Badge>
                  )}
                </div>

                {offer.valid_until && (
                  <p className="text-xs text-gray-500 font-verdana">
                    Valid until: {new Date(offer.valid_until).toLocaleDateString()}
                  </p>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(offer)}
                    className="rounded-full font-fredoka"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(offer.id)}
                    className="text-red-600 hover:bg-red-50 rounded-full font-fredoka"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {offers.length === 0 && (
          <Card className="border-0 shadow-lg rounded-2xl">
            <CardContent className="p-12 text-center">
              <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-lg text-gray-600 font-verdana mb-2">No bundle offers yet</p>
              <p className="text-sm text-gray-500 font-verdana">Create your first offer to increase average order value</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}