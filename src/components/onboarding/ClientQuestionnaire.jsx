import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Home, MapPin, Phone, Calendar, Heart, Shield, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ClientQuestionnaire({ initialData = {}, onComplete, onSkip }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Contact Info
    phone_number: initialData.phone_number || '',
    
    // Home Details
    default_address: initialData.default_address || '',
    default_address_line2: initialData.default_address_line2 || '',
    default_city: initialData.default_city || '',
    default_state: initialData.default_state || '',
    default_zip: initialData.default_zip || '',
    default_bedrooms: initialData.default_bedrooms || '',
    default_bathrooms: initialData.default_bathrooms || '',
    default_square_feet: initialData.default_square_feet || '',
    default_home_type: initialData.default_home_type || 'house',
    
    // Pets & Access
    has_pets: initialData.has_pets || false,
    pet_details: initialData.pet_details || '',
    default_parking_instructions: initialData.default_parking_instructions || '',
    default_entry_instructions: initialData.default_entry_instructions || '',
    
    // Preferences
    preferred_days: initialData.preferred_days || [],
    preferred_time_of_day: initialData.preferred_time_of_day || 'flexible',
    preferred_frequency: initialData.preferred_frequency || 'as_needed',
    product_preferences: initialData.product_preferences || '',
    product_allergies: initialData.product_allergies || '',
    special_requests: initialData.special_requests || '',
    preferred_specialty_tags: initialData.preferred_specialty_tags || [],
    preferred_additional_services: initialData.preferred_additional_services || [],
    
    // Detailed Cleaning Preferences
    focus_areas: initialData.focus_areas || '',
    avoid_areas: initialData.avoid_areas || '',
    pet_temperament: initialData.pet_temperament || '',
    cleaning_priorities: initialData.cleaning_priorities || [],
    
    // Alternate Contact
    alternate_email: initialData.alternate_email || ''
  });

  const totalSteps = 6;
  const progress = (step / totalSteps) * 100;

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDayToggle = (day) => {
    setFormData(prev => ({
      ...prev,
      preferred_days: prev.preferred_days.includes(day)
        ? prev.preferred_days.filter(d => d !== day)
        : [...prev.preferred_days, day]
    }));
  };

  const handleSpecialtyToggle = (tag) => {
    setFormData(prev => ({
      ...prev,
      preferred_specialty_tags: prev.preferred_specialty_tags.includes(tag)
        ? prev.preferred_specialty_tags.filter(t => t !== tag)
        : [...prev.preferred_specialty_tags, tag]
    }));
  };

  const handleServiceToggle = (service) => {
    setFormData(prev => ({
      ...prev,
      preferred_additional_services: prev.preferred_additional_services.includes(service)
        ? prev.preferred_additional_services.filter(s => s !== service)
        : [...prev.preferred_additional_services, service]
    }));
  };

  const handlePriorityToggle = (priority) => {
    setFormData(prev => ({
      ...prev,
      cleaning_priorities: prev.cleaning_priorities.includes(priority)
        ? prev.cleaning_priorities.filter(p => p !== priority)
        : [...prev.cleaning_priorities, priority]
    }));
  };

  const nextStep = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    onComplete(formData);
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const specialties = [
    'Pet-Friendly',
    'Eco-Warrior',
    'Deep Clean Expert',
    'Move-Out Specialist',
    'Same-Day Available',
    'Senior-Friendly',
    'Child-Safe Products',
    'Allergy-Conscious'
  ];

  const additionalServices = [
    { value: 'windows', label: 'Windows', icon: '🪟' },
    { value: 'blinds', label: 'Blinds/Curtains', icon: '🪟' },
    { value: 'oven', label: 'Oven Deep Clean', icon: '🔥' },
    { value: 'refrigerator', label: 'Refrigerator', icon: '❄️' },
    { value: 'light_fixtures', label: 'Light Fixtures', icon: '💡' },
    { value: 'inside_cabinets', label: 'Inside Cabinets', icon: '🗄️' },
    { value: 'baseboards', label: 'Baseboards', icon: '📏' },
    { value: 'laundry', label: 'Laundry', icon: '👕' }
  ];

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-fredoka font-medium text-graphite">
            Step {step} of {totalSteps}
          </span>
          <span className="text-sm font-verdana text-gray-500">{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <AnimatePresence mode="wait">
        {/* STEP 1: Contact Information */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 brand-gradient rounded-xl flex items-center justify-center">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="font-fredoka text-2xl">Contact Information</CardTitle>
                    <CardDescription className="font-verdana">How can we reach you?</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="phone" className="font-fredoka">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={formData.phone_number}
                    onChange={(e) => handleChange('phone_number', e.target.value)}
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1 font-verdana">
                    We'll use this to send booking confirmations and updates
                  </p>
                </div>

                <div>
                  <Label htmlFor="alternate_email" className="font-fredoka">Alternate Email (Optional)</Label>
                  <Input
                    id="alternate_email"
                    type="email"
                    placeholder="alternate@email.com"
                    value={formData.alternate_email}
                    onChange={(e) => handleChange('alternate_email', e.target.value)}
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1 font-verdana">
                    An additional email for booking notifications or account recovery
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* STEP 2: Home Details */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 brand-gradient rounded-xl flex items-center justify-center">
                    <Home className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="font-fredoka text-2xl">Home Details</CardTitle>
                    <CardDescription className="font-verdana">Tell us about your space</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="address" className="font-fredoka">Address *</Label>
                  <Input
                    id="address"
                    placeholder="123 Main Street"
                    value={formData.default_address}
                    onChange={(e) => handleChange('default_address', e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="address2" className="font-fredoka">Apt/Suite/Unit (Optional)</Label>
                  <Input
                    id="address2"
                    placeholder="Apt 4B"
                    value={formData.default_address_line2}
                    onChange={(e) => handleChange('default_address_line2', e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city" className="font-fredoka">City *</Label>
                    <Input
                      id="city"
                      placeholder="San Francisco"
                      value={formData.default_city}
                      onChange={(e) => handleChange('default_city', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state" className="font-fredoka">State *</Label>
                    <Input
                      id="state"
                      placeholder="CA"
                      value={formData.default_state}
                      onChange={(e) => handleChange('default_state', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="zip" className="font-fredoka">ZIP Code *</Label>
                  <Input
                    id="zip"
                    placeholder="94102"
                    value={formData.default_zip}
                    onChange={(e) => handleChange('default_zip', e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="home_type" className="font-fredoka">Home Type *</Label>
                  <Select value={formData.default_home_type} onValueChange={(value) => handleChange('default_home_type', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select home type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="apartment">Apartment</SelectItem>
                      <SelectItem value="house">House</SelectItem>
                      <SelectItem value="condo">Condo</SelectItem>
                      <SelectItem value="townhouse">Townhouse</SelectItem>
                      <SelectItem value="office">Office</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="font-fredoka mb-2 block">Bedrooms</Label>
                  <div className="flex gap-2 flex-wrap">
                    {[1, 2, 3, 4, 5, '5+'].map(num => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => handleChange('default_bedrooms', num === '5+' ? 6 : num)}
                        className={`w-12 h-12 rounded-full font-fredoka font-semibold transition-all ${
                          formData.default_bedrooms === (num === '5+' ? 6 : num)
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-100 text-graphite hover:bg-gray-200'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="font-fredoka mb-2 block">Bathrooms</Label>
                  <div className="flex gap-2 flex-wrap">
                    {[1, 1.5, 2, 2.5, 3, 3.5, '4+'].map(num => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => handleChange('default_bathrooms', num === '4+' ? 4 : num)}
                        className={`w-12 h-12 rounded-full font-fredoka font-semibold transition-all ${
                          formData.default_bathrooms === (num === '4+' ? 4 : num)
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-100 text-graphite hover:bg-gray-200'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="font-fredoka mb-2 block">Home Size (Square Feet)</Label>
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => handleChange('default_square_feet', 800)}
                      className={`w-full px-4 py-3 rounded-lg font-verdana text-sm transition-all text-left ${
                        formData.default_square_feet === 800
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 text-graphite hover:bg-gray-200'
                      }`}
                    >
                      1000 or less
                    </button>
                    <button
                      type="button"
                      onClick={() => handleChange('default_square_feet', 1500)}
                      className={`w-full px-4 py-3 rounded-lg font-verdana text-sm transition-all text-left ${
                        formData.default_square_feet === 1500
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 text-graphite hover:bg-gray-200'
                      }`}
                    >
                      Less than 2500
                    </button>
                    <button
                      type="button"
                      onClick={() => handleChange('default_square_feet', 3000)}
                      className={`w-full px-4 py-3 rounded-lg font-verdana text-sm transition-all text-left ${
                        formData.default_square_feet === 3000
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 text-graphite hover:bg-gray-200'
                      }`}
                    >
                      Above 2500 sq ft
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* STEP 3: Access & Pets */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 brand-gradient rounded-xl flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="font-fredoka text-2xl">Access & Pets</CardTitle>
                    <CardDescription className="font-verdana">Help cleaners prepare for their visit</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="parking" className="font-fredoka">Parking Instructions</Label>
                  <Textarea
                    id="parking"
                    placeholder="Street parking available on Main St. Use visitor spots in front of building."
                    value={formData.default_parking_instructions}
                    onChange={(e) => handleChange('default_parking_instructions', e.target.value)}
                    className="mt-1"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="entry" className="font-fredoka">Entry/Access Instructions</Label>
                  <Textarea
                    id="entry"
                    placeholder="Key is under the mat. Ring doorbell if locked. Gate code is #1234."
                    value={formData.default_entry_instructions}
                    onChange={(e) => handleChange('default_entry_instructions', e.target.value)}
                    className="mt-1"
                    rows={3}
                  />
                </div>

                <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                  <Checkbox
                    id="pets"
                    checked={formData.has_pets}
                    onCheckedChange={(checked) => handleChange('has_pets', checked)}
                  />
                  <div className="flex-1">
                    <Label htmlFor="pets" className="font-fredoka cursor-pointer">I have pets</Label>
                    <p className="text-xs text-gray-500 font-verdana mt-1">
                      This helps us match you with pet-friendly cleaners
                    </p>
                  </div>
                </div>

                {formData.has_pets && (
                  <>
                    <div>
                      <Label htmlFor="pet_details" className="font-fredoka">Pet Details</Label>
                      <Textarea
                        id="pet_details"
                        placeholder="1 friendly golden retriever, 2 cats (usually hide during visits)"
                        value={formData.pet_details}
                        onChange={(e) => handleChange('pet_details', e.target.value)}
                        className="mt-1"
                        rows={2}
                      />
                    </div>
                    <div>
                      <Label htmlFor="pet_temperament" className="font-fredoka">Pet Temperament & Behavior</Label>
                      <Textarea
                        id="pet_temperament"
                        placeholder="Dog is very friendly and loves people. Cats might hiss but won't scratch. Keep bedroom door closed."
                        value={formData.pet_temperament}
                        onChange={(e) => handleChange('pet_temperament', e.target.value)}
                        className="mt-1"
                        rows={3}
                      />
                      <p className="text-xs text-gray-500 mt-1 font-verdana">
                        Help cleaners know what to expect and how to interact safely
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* STEP 4: Preferences */}
        {step === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 brand-gradient rounded-xl flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="font-fredoka text-2xl">Scheduling Preferences</CardTitle>
                    <CardDescription className="font-verdana">When works best for you?</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="font-fredoka mb-3 block">Preferred Days</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {days.map(day => (
                      <button
                        key={day}
                        onClick={() => handleDayToggle(day)}
                        className={`px-3 py-2 rounded-lg font-fredoka text-sm transition-all ${
                          formData.preferred_days.includes(day)
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-100 text-graphite hover:bg-gray-200'
                        }`}
                      >
                        {day.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="font-fredoka mb-2 block">Preferred Time of Day</Label>
                  <RadioGroup value={formData.preferred_time_of_day} onValueChange={(value) => handleChange('preferred_time_of_day', value)}>
                    <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                      <RadioGroupItem value="morning" id="morning" />
                      <Label htmlFor="morning" className="font-verdana cursor-pointer flex-1">
                        Morning (8am - 12pm)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                      <RadioGroupItem value="afternoon" id="afternoon" />
                      <Label htmlFor="afternoon" className="font-verdana cursor-pointer flex-1">
                        Afternoon (12pm - 5pm)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                      <RadioGroupItem value="evening" id="evening" />
                      <Label htmlFor="evening" className="font-verdana cursor-pointer flex-1">
                        Evening (5pm - 8pm)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                      <RadioGroupItem value="flexible" id="flexible" />
                      <Label htmlFor="flexible" className="font-verdana cursor-pointer flex-1">
                        Flexible - any time works!
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label className="font-fredoka mb-2 block">How Often Do You Plan to Book?</Label>
                  <Select value={formData.preferred_frequency} onValueChange={(value) => handleChange('preferred_frequency', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="biweekly">Every 2 weeks</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="as_needed">As needed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* STEP 5: Detailed Cleaning Preferences */}
        {step === 5 && (
          <motion.div
            key="step5"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 brand-gradient rounded-xl flex items-center justify-center">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="font-fredoka text-2xl">Cleaning Preferences</CardTitle>
                    <CardDescription className="font-verdana">Help us deliver exactly what you need</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="focus_areas" className="font-fredoka">Areas That Need Extra Attention</Label>
                  <Textarea
                    id="focus_areas"
                    placeholder="Please focus on kitchen tiles and grout, bathroom fixtures, and living room baseboards. Kitchen counters need deep scrubbing."
                    value={formData.focus_areas}
                    onChange={(e) => handleChange('focus_areas', e.target.value)}
                    className="mt-1"
                    rows={4}
                  />
                  <p className="text-xs text-gray-500 mt-1 font-verdana">
                    Be specific - this helps cleaners prioritize their time
                  </p>
                </div>

                <div>
                  <Label htmlFor="avoid_areas" className="font-fredoka">Areas to Avoid or Skip</Label>
                  <Textarea
                    id="avoid_areas"
                    placeholder="Please don't touch my home office desk or the craft room shelves. Guest bedroom doesn't need attention."
                    value={formData.avoid_areas}
                    onChange={(e) => handleChange('avoid_areas', e.target.value)}
                    className="mt-1"
                    rows={3}
                  />
                  <p className="text-xs text-gray-500 mt-1 font-verdana">
                    Let cleaners know what's off-limits
                  </p>
                </div>

                <div>
                  <Label className="font-fredoka mb-3 block">Cleaning Priorities</Label>
                  <p className="text-sm text-gray-600 font-verdana mb-3">
                    What matters most to you?
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'deep_clean', label: 'Deep Cleaning' },
                      { value: 'speed', label: 'Speed/Efficiency' },
                      { value: 'eco_products', label: 'Eco-Friendly Products' },
                      { value: 'attention_detail', label: 'Attention to Detail' },
                      { value: 'organization', label: 'Organization' },
                      { value: 'sanitization', label: 'Sanitization' }
                    ].map(priority => (
                      <button
                        key={priority.value}
                        onClick={() => handlePriorityToggle(priority.value)}
                        className={`px-3 py-2 rounded-lg font-verdana text-sm transition-all text-left ${
                          formData.cleaning_priorities.includes(priority.value)
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-100 text-graphite hover:bg-gray-200'
                        }`}
                      >
                        {priority.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="products" className="font-fredoka">Product Preferences</Label>
                  <Input
                    id="products"
                    placeholder="Eco-friendly, unscented products only"
                    value={formData.product_preferences}
                    onChange={(e) => handleChange('product_preferences', e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="allergies" className="font-fredoka">Product Allergies or Sensitivities</Label>
                  <Input
                    id="allergies"
                    placeholder="Allergic to lavender, sensitive to bleach"
                    value={formData.product_allergies}
                    onChange={(e) => handleChange('product_allergies', e.target.value)}
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* STEP 6: Cleaner Matching Preferences */}
        {step === 6 && (
          <motion.div
            key="step6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 brand-gradient rounded-xl flex items-center justify-center">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="font-fredoka text-2xl">Cleaner Matching</CardTitle>
                    <CardDescription className="font-verdana">Help us find your perfect match</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="font-fredoka mb-3 block">Preferred Cleaner Specialties</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {specialties.map(tag => (
                      <button
                        key={tag}
                        onClick={() => handleSpecialtyToggle(tag)}
                        className={`px-3 py-2 rounded-lg font-verdana text-sm transition-all text-left ${
                          formData.preferred_specialty_tags.includes(tag)
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-100 text-graphite hover:bg-gray-200'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="font-fredoka mb-3 block">Additional Services You Might Need</Label>
                  <p className="text-sm text-gray-600 font-verdana mb-3">
                    Select services you typically add to your cleanings (these can be added per booking)
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {additionalServices.map(service => (
                      <button
                        key={service.value}
                        onClick={() => handleServiceToggle(service.value)}
                        className={`px-3 py-2 rounded-lg font-verdana text-sm transition-all text-left flex items-center gap-2 ${
                          formData.preferred_additional_services.includes(service.value)
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-100 text-graphite hover:bg-gray-200'
                        }`}
                      >
                        <span>{service.icon}</span>
                        <span>{service.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="special" className="font-fredoka">Any Special Requests or Notes?</Label>
                  <Textarea
                    id="special"
                    placeholder="Please focus on the kitchen and bathrooms. Living room doesn't need much attention."
                    value={formData.special_requests}
                    onChange={(e) => handleChange('special_requests', e.target.value)}
                    className="mt-1"
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center mt-8">
        <div>
          {step > 1 && (
            <Button variant="outline" onClick={prevStep} className="rounded-full">
              Previous
            </Button>
          )}
        </div>

        <div className="flex gap-3">
          {onSkip && (
            <Button variant="ghost" onClick={onSkip} className="text-gray-500">
              Skip for now
            </Button>
          )}
          
          {step < totalSteps ? (
            <Button onClick={nextStep} className="brand-gradient text-white rounded-full font-fredoka font-semibold px-8">
              Next Step
            </Button>
          ) : (
            <Button onClick={handleSubmit} className="brand-gradient text-white rounded-full font-fredoka font-semibold px-8">
              <CheckCircle className="w-4 h-4 mr-2" />
              Complete Profile
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}