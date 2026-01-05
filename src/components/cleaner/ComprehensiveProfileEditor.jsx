import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { 
  DollarSign, Sparkles, Calendar, MessageSquare, Camera, Video, 
  Image, CheckCircle, Clock, User, Bell, Shield, Settings, AlertTriangle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const PRODUCT_PREFERENCES = [
  { value: 'standard', label: 'Standard Cleaning Products', description: 'Effective, affordable cleaning supplies' },
  { value: 'eco-friendly', label: 'Eco-Friendly Products', description: 'Environmentally conscious, natural cleaners' },
  { value: 'professional-grade', label: 'Professional-Grade Products', description: 'Commercial-quality cleaning supplies' },
  { value: 'premium-eco', label: 'Premium Eco-Luxury', description: 'Top-tier eco-friendly and specialized products' }
];

const SPECIALTY_TAGS = [
  'Pet-Friendly', 'Eco-Warrior', 'Deep Clean Expert', 'Move-Out Specialist', 
  'Same-Day Available', 'Senior-Friendly', 'Child-Safe Products', 'Allergy-Conscious',
  'Organization Pro', 'Post-Construction'
];

const ADDITIONAL_SERVICES = [
  { value: 'windows', label: 'Window Cleaning' },
  { value: 'blinds', label: 'Blinds Cleaning' },
  { value: 'oven', label: 'Oven Cleaning' },
  { value: 'refrigerator', label: 'Refrigerator Cleaning' },
  { value: 'light_fixtures', label: 'Light Fixtures' },
  { value: 'inside_cabinets', label: 'Inside Cabinets' },
  { value: 'baseboards', label: 'Baseboards' },
  { value: 'laundry', label: 'Laundry Service' }
];

export function ProfileTab({ formData, setFormData, editing, user, cleanerProfile }) {
  return (
    <>
      <Card className="border-0 shadow-xl rounded-2xl">
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-2xl">
          <CardTitle className="flex items-center gap-2 font-fredoka text-graphite">
            <User className="w-6 h-6 text-fresh-mint" />
            Performance Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-green-50 p-4 rounded-2xl border-2 border-green-200">
              <p className="text-sm text-green-600 font-verdana mb-1">Reliability Score</p>
              <p className="text-3xl font-fredoka font-bold text-green-900">{cleanerProfile.reliability_score || 75}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-2xl border-2 border-blue-200">
              <p className="text-sm text-puretask-blue font-verdana mb-1">On-Time Rate</p>
              <p className="text-3xl font-fredoka font-bold text-blue-900">{cleanerProfile.on_time_rate}%</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-2xl border-2 border-purple-200">
              <p className="text-sm text-purple-600 font-verdana mb-1">Photo Compliance</p>
              <p className="text-3xl font-fredoka font-bold text-purple-900">{cleanerProfile.photo_compliance_rate}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-xl rounded-2xl">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-t-2xl">
          <CardTitle className="font-fredoka text-graphite">Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {editing ? (
            <>
              <div>
                <Label htmlFor="full_name" className="font-fredoka text-graphite">Full Name</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="rounded-full font-verdana"
                />
              </div>
              <div>
                <Label htmlFor="phone" className="font-fredoka text-graphite">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="rounded-full font-verdana"
                />
              </div>
              <div>
                <Label htmlFor="bio" className="font-fredoka text-graphite">Professional Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={4}
                  placeholder="Tell clients about your experience, approach to cleaning, and what makes you unique..."
                  className="rounded-2xl font-verdana"
                />
              </div>
            </>
          ) : (
            <>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-gray-600 font-fredoka">Email</Label>
                  <p className="text-graphite mt-1 flex items-center gap-2 font-verdana">
                    {user.email}
                  </p>
                </div>
                <div>
                  <Label className="text-gray-600 font-fredoka">Phone</Label>
                  <p className="text-graphite mt-1 flex items-center gap-2 font-verdana">
                    {user.phone || 'Not set'}
                  </p>
                </div>
              </div>
              
              {cleanerProfile.bio && (
                <div>
                  <Label className="text-gray-600 font-fredoka">Bio</Label>
                  <p className="text-graphite mt-2 leading-relaxed font-verdana">{cleanerProfile.bio}</p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </>
  );
}

export function PricingTab({ formData, setFormData, editing, cleanerProfile }) {
  return (
    <Card className="border-0 shadow-xl rounded-2xl">
      <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-2xl">
        <CardTitle className="font-fredoka text-graphite flex items-center gap-2">
          <DollarSign className="w-6 h-6 text-fresh-mint" />
          Pricing & Rates
        </CardTitle>
        <CardDescription className="font-verdana">Configure your base rates and add-on pricing</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {editing ? (
          <>
            <div>
              <Label className="font-fredoka text-graphite mb-2 block">Base Rate (Credits/Hour)</Label>
              <Input
                type="number"
                value={formData.base_rate_credits_per_hour}
                onChange={(e) => setFormData({ ...formData, base_rate_credits_per_hour: e.target.value })}
                min="150"
                max="850"
                className="rounded-full font-verdana"
              />
              <p className="text-xs text-gray-500 mt-1 font-verdana">Recommended: 150-850 credits/hr depending on tier</p>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="font-fredoka text-graphite mb-2 block">Deep Clean Add-On (Credits/Hour)</Label>
                <Input
                  type="number"
                  value={formData.deep_addon_credits_per_hour}
                  onChange={(e) => setFormData({ ...formData, deep_addon_credits_per_hour: e.target.value })}
                  min="30"
                  max="80"
                  className="rounded-full font-verdana"
                />
                <p className="text-xs text-gray-500 mt-1 font-verdana">Typical: 30-80 credits/hr</p>
              </div>
              <div>
                <Label className="font-fredoka text-graphite mb-2 block">Move-Out Add-On (Credits/Hour)</Label>
                <Input
                  type="number"
                  value={formData.moveout_addon_credits_per_hour}
                  onChange={(e) => setFormData({ ...formData, moveout_addon_credits_per_hour: e.target.value })}
                  min="30"
                  max="80"
                  className="rounded-full font-verdana"
                />
                <p className="text-xs text-gray-500 mt-1 font-verdana">Typical: 30-80 credits/hr</p>
              </div>
            </div>
            <div>
              <Label htmlFor="hourly_rate" className="font-fredoka text-graphite">Display Hourly Rate ($)</Label>
              <Input
                id="hourly_rate"
                type="number"
                value={formData.hourly_rate}
                onChange={(e) => setFormData({ ...formData, hourly_rate: e.target.value })}
                min="15"
                max="200"
                className="rounded-full font-verdana"
              />
              <p className="text-xs text-gray-500 mt-1 font-verdana">This is displayed to clients as reference</p>
            </div>
          </>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-green-50 p-4 rounded-2xl border-2 border-green-200">
              <p className="text-sm text-green-600 font-verdana mb-1">Base Rate</p>
              <p className="text-3xl font-fredoka font-bold text-green-900">{cleanerProfile.base_rate_credits_per_hour || 150}</p>
              <p className="text-xs text-gray-600 font-verdana">credits/hour</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-2xl border-2 border-blue-200">
              <p className="text-sm text-blue-600 font-verdana mb-1">Deep Clean +</p>
              <p className="text-3xl font-fredoka font-bold text-blue-900">+{cleanerProfile.deep_addon_credits_per_hour || 50}</p>
              <p className="text-xs text-gray-600 font-verdana">credits/hour</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-2xl border-2 border-purple-200">
              <p className="text-sm text-purple-600 font-verdana mb-1">Move-Out +</p>
              <p className="text-3xl font-fredoka font-bold text-purple-900">+{cleanerProfile.moveout_addon_credits_per_hour || 50}</p>
              <p className="text-xs text-gray-600 font-verdana">credits/hour</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function ServicesTab({ formData, setFormData, editing, toggleSpecialty, toggleService }) {
  return (
    <Card className="border-0 shadow-xl rounded-2xl">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-2xl">
        <CardTitle className="font-fredoka text-graphite flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-purple-600" />
          Services & Specialties
        </CardTitle>
        <CardDescription className="font-verdana">Showcase your unique skills and services to attract the right clients</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Specialty Tags */}
        <div>
          <Label className="font-fredoka text-graphite mb-3 block">Specialty Tags</Label>
          <p className="text-sm text-gray-600 font-verdana mb-3">Select all that apply to highlight your expertise</p>
          <div className="flex flex-wrap gap-2">
            {SPECIALTY_TAGS.map(tag => (
              <motion.button
                key={tag}
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => editing && toggleSpecialty(tag)}
                disabled={!editing}
                className={`px-4 py-2 rounded-full font-fredoka font-medium transition-all ${
                  formData.specialty_tags.includes(tag)
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } ${!editing && 'cursor-default'}`}
              >
                {tag}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Additional Services */}
        <div>
          <Label className="font-fredoka text-graphite mb-3 block">Additional Services Offered</Label>
          <p className="text-sm text-gray-600 font-verdana mb-3">Expand your earning potential by offering these extras</p>
          <div className="grid md:grid-cols-2 gap-3">
            {ADDITIONAL_SERVICES.map(service => (
              <button
                key={service.value}
                type="button"
                onClick={() => editing && toggleService(service.value)}
                disabled={!editing}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                  formData.offers_additional_services.includes(service.value)
                    ? 'border-fresh-mint bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                } ${!editing && 'cursor-default'}`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  formData.offers_additional_services.includes(service.value)
                    ? 'border-fresh-mint bg-fresh-mint'
                    : 'border-gray-300'
                }`}>
                  {formData.offers_additional_services.includes(service.value) && (
                    <CheckCircle className="w-4 h-4 text-white" />
                  )}
                </div>
                <span className="font-fredoka text-graphite">{service.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Product Preference */}
        <div>
          <Label className="font-fredoka text-graphite mb-3 block">Product Preference</Label>
          <p className="text-sm text-gray-600 font-verdana mb-3">Let clients know what products you use</p>
          <div className="space-y-3">
            {PRODUCT_PREFERENCES.map(pref => (
              <button
                key={pref.value}
                type="button"
                onClick={() => editing && setFormData({ ...formData, product_preference: pref.value })}
                disabled={!editing}
                className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
                  formData.product_preference === pref.value
                    ? 'border-fresh-mint bg-green-50'
                    : 'border-gray-200 hover:border-fresh-mint'
                } ${!editing && 'cursor-default'}`}
              >
                <div className="flex items-start gap-3">
                  {formData.product_preference === pref.value && (
                    <CheckCircle className="w-5 h-5 text-fresh-mint mt-0.5 flex-shrink-0" />
                  )}
                  <div>
                    <p className="font-fredoka font-semibold text-graphite">{pref.label}</p>
                    <p className="text-sm text-gray-600 font-verdana">{pref.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function AvailabilityTab({ formData, setFormData, editing }) {
  return (
    <Card className="border-0 shadow-xl rounded-2xl">
      <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-t-2xl">
        <CardTitle className="font-fredoka text-graphite flex items-center gap-2">
          <Calendar className="w-6 h-6 text-orange-600" />
          Availability Preferences
        </CardTitle>
        <CardDescription className="font-verdana">Manage your booking preferences and availability settings</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Instant Book */}
        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-2xl border-2 border-blue-200">
          <div className="flex-1">
            <Label className="font-fredoka text-graphite mb-1 block">Instant Book</Label>
            <p className="text-sm text-gray-600 font-verdana">Auto-accept bookings within your availability</p>
          </div>
          <Switch
            checked={formData.instant_book_enabled}
            onCheckedChange={(checked) => editing && setFormData({ ...formData, instant_book_enabled: checked })}
            disabled={!editing}
          />
        </div>

        {formData.instant_book_enabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Label className="font-fredoka text-graphite mb-2 block">Instant Book Window (Hours)</Label>
            <Input
              type="number"
              value={formData.instant_book_hours}
              onChange={(e) => setFormData({ ...formData, instant_book_hours: e.target.value })}
              min="24"
              max="168"
              disabled={!editing}
              className="rounded-full font-verdana"
            />
            <p className="text-xs text-gray-500 mt-1 font-verdana">Auto-accept bookings scheduled within this timeframe</p>
          </motion.div>
        )}

        {/* Subscriptions */}
        <div className="flex items-center justify-between p-4 bg-purple-50 rounded-2xl border-2 border-purple-200">
          <div className="flex-1">
            <Label className="font-fredoka text-graphite mb-1 block">Accept Recurring Bookings</Label>
            <p className="text-sm text-gray-600 font-verdana">Allow clients to book you for recurring cleanings</p>
          </div>
          <Switch
            checked={formData.accepts_subscriptions}
            onCheckedChange={(checked) => editing && setFormData({ ...formData, accepts_subscriptions: checked })}
            disabled={!editing}
          />
        </div>

        {/* Advanced Availability */}
        <div className="p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl border-2 border-indigo-200">
          <p className="font-fredoka font-semibold text-graphite mb-2">Advanced Availability</p>
          <p className="text-sm text-gray-600 font-verdana mb-3">Set custom time slots and manage your weekly schedule in detail</p>
          <Link to={createPageUrl('CleanerSchedule')}>
            <Button variant="outline" className="rounded-full font-fredoka">
              <Clock className="w-4 h-4 mr-2" />
              Manage Schedule
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export function CommunicationTab({ formData, setFormData, editing }) {
  return (
    <Card className="border-0 shadow-xl rounded-2xl">
      <CardHeader className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-t-2xl">
        <CardTitle className="font-fredoka text-graphite flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-cyan-600" />
          Automated Communication
        </CardTitle>
        <CardDescription className="font-verdana">Configure automatic messages to clients for a professional experience</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Booking Confirmation */}
        <div className="p-4 rounded-2xl border-2 border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div>
              <Label className="font-fredoka text-graphite">Booking Confirmation</Label>
              <p className="text-sm text-gray-600 font-verdana">Send confirmation when job is accepted</p>
            </div>
            <Switch
              checked={formData.communication_settings.booking_confirmation.enabled}
              onCheckedChange={(checked) => editing && setFormData({
                ...formData,
                communication_settings: {
                  ...formData.communication_settings,
                  booking_confirmation: { ...formData.communication_settings.booking_confirmation, enabled: checked }
                }
              })}
              disabled={!editing}
            />
          </div>
        </div>

        {/* Pre-Cleaning Reminder */}
        <div className="p-4 rounded-2xl border-2 border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div>
              <Label className="font-fredoka text-graphite">Pre-Cleaning Reminder</Label>
              <p className="text-sm text-gray-600 font-verdana">Remind client before arrival (1 day before)</p>
            </div>
            <Switch
              checked={formData.communication_settings.pre_cleaning_reminder.enabled}
              onCheckedChange={(checked) => editing && setFormData({
                ...formData,
                communication_settings: {
                  ...formData.communication_settings,
                  pre_cleaning_reminder: { ...formData.communication_settings.pre_cleaning_reminder, enabled: checked }
                }
              })}
              disabled={!editing}
            />
          </div>
        </div>

        {/* On My Way */}
        <div className="p-4 rounded-2xl border-2 border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div>
              <Label className="font-fredoka text-graphite">On My Way Notification</Label>
              <p className="text-sm text-gray-600 font-verdana">Alert client when heading to location with ETA</p>
            </div>
            <Switch
              checked={formData.communication_settings.on_my_way.enabled}
              onCheckedChange={(checked) => editing && setFormData({
                ...formData,
                communication_settings: {
                  ...formData.communication_settings,
                  on_my_way: { ...formData.communication_settings.on_my_way, enabled: checked }
                }
              })}
              disabled={!editing}
            />
          </div>
        </div>

        {/* Post-Cleaning Summary */}
        <div className="p-4 rounded-2xl border-2 border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div>
              <Label className="font-fredoka text-graphite">Post-Cleaning Summary</Label>
              <p className="text-sm text-gray-600 font-verdana">Send summary after job completion</p>
            </div>
            <Switch
              checked={formData.communication_settings.post_cleaning_summary.enabled}
              onCheckedChange={(checked) => editing && setFormData({
                ...formData,
                communication_settings: {
                  ...formData.communication_settings,
                  post_cleaning_summary: { ...formData.communication_settings.post_cleaning_summary, enabled: checked }
                }
              })}
              disabled={!editing}
            />
          </div>
        </div>

        {/* Review Request */}
        <div className="p-4 rounded-2xl border-2 border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div>
              <Label className="font-fredoka text-graphite">Review Request</Label>
              <p className="text-sm text-gray-600 font-verdana">Ask for feedback 24 hours after completion</p>
            </div>
            <Switch
              checked={formData.communication_settings.review_request.enabled}
              onCheckedChange={(checked) => editing && setFormData({
                ...formData,
                communication_settings: {
                  ...formData.communication_settings,
                  review_request: { ...formData.communication_settings.review_request, enabled: checked }
                }
              })}
              disabled={!editing}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function PortfolioTab({ cleanerProfile }) {
  return (
    <Card className="border-0 shadow-xl rounded-2xl">
      <CardHeader className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-t-2xl">
        <CardTitle className="font-fredoka text-graphite flex items-center gap-2">
          <Camera className="w-6 h-6 text-pink-600" />
          Portfolio & Media
        </CardTitle>
        <CardDescription className="font-verdana">Showcase your best work to attract more clients</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Video Intro */}
        <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-200">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <Video className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <Label className="font-fredoka text-graphite text-lg mb-2 block">Video Introduction</Label>
              <p className="text-sm text-gray-600 font-verdana mb-3">
                {cleanerProfile.video_intro_url
                  ? 'Your video intro is set! Clients love seeing who they\'ll be working with.'
                  : 'Upload a 30-60 second intro video to stand out and build trust with clients. Cleaners with videos get 3x more bookings!'}
              </p>
              <Button variant="outline" className="rounded-full font-fredoka" disabled>
                <Video className="w-4 h-4 mr-2" />
                {cleanerProfile.video_intro_url ? 'Update Video' : 'Add Video Intro'}
              </Button>
            </div>
          </div>
        </div>

        {/* Portfolio Items */}
        <div className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border-2 border-blue-200">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <Image className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <Label className="font-fredoka text-graphite text-lg mb-2 block">Work Portfolio</Label>
              <p className="text-sm text-gray-600 font-verdana mb-3">
                {cleanerProfile.portfolio_items?.length > 0
                  ? `You have ${cleanerProfile.portfolio_items.length} portfolio items. Keep adding your best work to showcase your skills!`
                  : 'Upload before/after photos of your best cleaning jobs. Portfolios increase booking rates by up to 5x!'}
              </p>
              <Button variant="outline" className="rounded-full font-fredoka" disabled>
                <Camera className="w-4 h-4 mr-2" />
                {cleanerProfile.portfolio_items?.length > 0 ? 'Manage Portfolio' : 'Add Portfolio Items'}
              </Button>
            </div>
          </div>
        </div>

        {/* Profile Photo */}
        <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <User className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <Label className="font-fredoka text-graphite text-lg mb-2 block">Profile Photo</Label>
              <p className="text-sm text-gray-600 font-verdana mb-3">
                {cleanerProfile.profile_photo_url
                  ? 'Your profile photo looks great! A professional photo builds trust and credibility.'
                  : 'Add a friendly, professional photo to your profile. Profiles with photos get 2x more views!'}
              </p>
              <Button variant="outline" className="rounded-full font-fredoka" disabled>
                <Camera className="w-4 h-4 mr-2" />
                {cleanerProfile.profile_photo_url ? 'Update Photo' : 'Add Profile Photo'}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function SettingsTab({ formData, setFormData, editing }) {
  return (
    <div className="space-y-6">
      {/* Notification Preferences */}
      <Card className="border-0 shadow-xl rounded-2xl">
        <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-t-2xl">
          <CardTitle className="font-fredoka text-graphite flex items-center gap-2">
            <Bell className="w-6 h-6 text-indigo-600" />
            Notification Preferences
          </CardTitle>
          <CardDescription className="font-verdana">Choose how you want to receive notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-2xl border-2 border-gray-200">
            <div className="flex-1">
              <Label className="font-fredoka text-graphite mb-1 block">Email Notifications</Label>
              <p className="text-sm text-gray-600 font-verdana">Receive updates via email</p>
            </div>
            <Switch disabled={!editing} defaultChecked />
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl border-2 border-gray-200">
            <div className="flex-1">
              <Label className="font-fredoka text-graphite mb-1 block">SMS Notifications</Label>
              <p className="text-sm text-gray-600 font-verdana">Get text messages for important updates</p>
            </div>
            <Switch disabled={!editing} defaultChecked />
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl border-2 border-gray-200">
            <div className="flex-1">
              <Label className="font-fredoka text-graphite mb-1 block">Push Notifications</Label>
              <p className="text-sm text-gray-600 font-verdana">Receive in-app notifications</p>
            </div>
            <Switch disabled={!editing} defaultChecked />
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl border-2 border-gray-200">
            <div className="flex-1">
              <Label className="font-fredoka text-graphite mb-1 block">Marketing Emails</Label>
              <p className="text-sm text-gray-600 font-verdana">Receive tips, promotions, and updates</p>
            </div>
            <Switch disabled={!editing} />
          </div>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card className="border-0 shadow-xl rounded-2xl">
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-2xl">
          <CardTitle className="font-fredoka text-graphite flex items-center gap-2">
            <Shield className="w-6 h-6 text-green-600" />
            Privacy & Security
          </CardTitle>
          <CardDescription className="font-verdana">Manage your privacy and security preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-2xl border-2 border-gray-200">
            <div className="flex-1">
              <Label className="font-fredoka text-graphite mb-1 block">Profile Visibility</Label>
              <p className="text-sm text-gray-600 font-verdana">Make your profile visible to clients</p>
            </div>
            <Switch disabled={!editing} defaultChecked />
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl border-2 border-gray-200">
            <div className="flex-1">
              <Label className="font-fredoka text-graphite mb-1 block">Show Reviews</Label>
              <p className="text-sm text-gray-600 font-verdana">Display client reviews on your profile</p>
            </div>
            <Switch disabled={!editing} defaultChecked />
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl border-2 border-gray-200">
            <div className="flex-1">
              <Label className="font-fredoka text-graphite mb-1 block">Two-Factor Authentication</Label>
              <p className="text-sm text-gray-600 font-verdana">Add an extra layer of security</p>
            </div>
            <Button variant="outline" className="rounded-full font-fredoka" size="sm" disabled>
              Enable 2FA
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Account Preferences */}
      <Card className="border-0 shadow-xl rounded-2xl">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-t-2xl">
          <CardTitle className="font-fredoka text-graphite flex items-center gap-2">
            <Settings className="w-6 h-6 text-blue-600" />
            Account Preferences
          </CardTitle>
          <CardDescription className="font-verdana">Customize your account settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-2xl border-2 border-gray-200">
            <Label className="font-fredoka text-graphite mb-2 block">Language</Label>
            <select className="w-full p-2 border rounded-full font-verdana" disabled={!editing}>
              <option>English</option>
              <option>Spanish</option>
              <option>French</option>
            </select>
          </div>

          <div className="p-4 rounded-2xl border-2 border-gray-200">
            <Label className="font-fredoka text-graphite mb-2 block">Timezone</Label>
            <select className="w-full p-2 border rounded-full font-verdana" disabled={!editing}>
              <option>Eastern Time (ET)</option>
              <option>Central Time (CT)</option>
              <option>Mountain Time (MT)</option>
              <option>Pacific Time (PT)</option>
            </select>
          </div>

          <div className="p-4 rounded-2xl border-2 border-gray-200">
            <Label className="font-fredoka text-graphite mb-2 block">Currency</Label>
            <select className="w-full p-2 border rounded-full font-verdana" disabled={!editing}>
              <option>USD ($)</option>
              <option>CAD ($)</option>
              <option>EUR (€)</option>
              <option>GBP (£)</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-0 shadow-xl rounded-2xl border-2 border-red-200">
        <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 rounded-t-2xl">
          <CardTitle className="font-fredoka text-red-600 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6" />
            Danger Zone
          </CardTitle>
          <CardDescription className="font-verdana">Irreversible actions - proceed with caution</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-2xl border-2 border-gray-200">
            <Label className="font-fredoka text-graphite mb-1 block">Deactivate Account</Label>
            <p className="text-sm text-gray-600 font-verdana mb-3">Temporarily disable your account</p>
            <Button variant="outline" className="rounded-full font-fredoka text-orange-600 border-orange-600 hover:bg-orange-50" disabled>
              Deactivate
            </Button>
          </div>

          <div className="p-4 rounded-2xl border-2 border-red-200 bg-red-50">
            <Label className="font-fredoka text-red-600 mb-1 block">Delete Account</Label>
            <p className="text-sm text-red-700 font-verdana mb-3">Permanently delete your account and all data</p>
            <Button variant="destructive" className="rounded-full font-fredoka" disabled>
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}