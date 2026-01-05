import React, { useState, useEffect } from 'react';
import { handleError } from '@/lib/errorHandler';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User as UserIcon, Mail, Phone, MapPin, Shield, Edit2, Save, X, CheckCircle, 
  Sparkles, Star, Briefcase, Loader2, DollarSign, Calendar, MessageSquare, 
  Camera, Settings
} from 'lucide-react';
import ReliabilityMeterV2 from '../components/reliability/ReliabilityMeterV2';
import AddressAutocomplete from '../components/address/AddressAutocomplete';
import { getTierColorClasses, getProductColors } from '../components/utils/colorSystem';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { 
  ProfileTab, 
  PricingTab, 
  ServicesTab, 
  AvailabilityTab, 
  CommunicationTab, 
  PortfolioTab,
  SettingsTab
} from '../components/cleaner/ComprehensiveProfileEditor';

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [cleanerProfile, setCleanerProfile] = useState(null);
  const [clientProfile, setClientProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    bio: '',
    hourly_rate: '',
    base_rate_credits_per_hour: 150,
    deep_addon_credits_per_hour: 50,
    moveout_addon_credits_per_hour: 50,
    default_address: '',
    home_size: 'medium',
    latitude: null,
    longitude: null,
    product_preference: 'standard',
    specialty_tags: [],
    offers_additional_services: [],
    instant_book_enabled: false,
    instant_book_hours: 48,
    accepts_subscriptions: true,
    service_locations: [],
    communication_settings: {
      booking_confirmation: { enabled: true, channels: ['in_app', 'email'] },
      pre_cleaning_reminder: { enabled: true, days_before: 1, channels: ['sms', 'in_app'] },
      on_my_way: { enabled: true, channels: ['sms', 'in_app'], include_eta: true },
      post_cleaning_summary: { enabled: true, channels: ['in_app', 'email'] },
      review_request: { enabled: true, hours_after_completion: 24, channels: ['in_app', 'email'] }
    }
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      setUserType(currentUser.user_type);

      if (currentUser.user_type === 'cleaner') {
        const profiles = await base44.entities.CleanerProfile.filter({ user_email: currentUser.email });
        if (profiles.length > 0) {
          const profile = profiles[0];
          setCleanerProfile(profile);
          setFormData({
            full_name: currentUser.full_name || '',
            phone: currentUser.phone || '',
            bio: profile.bio || '',
            hourly_rate: profile.hourly_rate || '',
            base_rate_credits_per_hour: profile.base_rate_credits_per_hour || 150,
            deep_addon_credits_per_hour: profile.deep_addon_credits_per_hour || 50,
            moveout_addon_credits_per_hour: profile.moveout_addon_credits_per_hour || 50,
            product_preference: profile.product_preference || 'standard',
            specialty_tags: profile.specialty_tags || [],
            offers_additional_services: profile.offers_additional_services || [],
            instant_book_enabled: profile.instant_book_enabled || false,
            instant_book_hours: profile.instant_book_hours || 48,
            accepts_subscriptions: profile.accepts_subscriptions !== false,
            service_locations: profile.service_locations || [],
            communication_settings: profile.communication_settings || formData.communication_settings,
            default_address: formData.default_address,
            home_size: formData.home_size,
            latitude: formData.latitude,
            longitude: formData.longitude,
          });
        }
      } else if (currentUser.user_type === 'client') {
        const profiles = await base44.entities.ClientProfile.filter({ user_email: currentUser.email });
        if (profiles.length > 0) {
          setClientProfile(profiles[0]);
          setFormData({
            full_name: currentUser.full_name || '',
            phone: currentUser.phone || '',
            default_address: profiles[0].default_address || '',
            home_size: profiles[0].home_size || 'medium',
            latitude: profiles[0].latitude || null,
            longitude: profiles[0].longitude || null,
            bio: formData.bio,
            hourly_rate: formData.hourly_rate,
            product_preference: formData.product_preference,
          });
        }
      }
    } catch (error) {
      handleError(error, { userMessage: 'Error loading profile:', showToast: false });
      navigate(createPageUrl('Home'));
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');

    try {
      await base44.entities.User.update(user.id, {
        full_name: formData.full_name,
        phone: formData.phone
      });

      if (userType === 'cleaner' && cleanerProfile) {
        await base44.entities.CleanerProfile.update(cleanerProfile.id, {
          bio: formData.bio,
          hourly_rate: parseFloat(formData.hourly_rate) || cleanerProfile.hourly_rate,
          base_rate_credits_per_hour: parseFloat(formData.base_rate_credits_per_hour) || 150,
          deep_addon_credits_per_hour: parseFloat(formData.deep_addon_credits_per_hour) || 50,
          moveout_addon_credits_per_hour: parseFloat(formData.moveout_addon_credits_per_hour) || 50,
          product_preference: formData.product_preference,
          specialty_tags: formData.specialty_tags,
          offers_additional_services: formData.offers_additional_services,
          instant_book_enabled: formData.instant_book_enabled,
          instant_book_hours: parseInt(formData.instant_book_hours) || 48,
          accepts_subscriptions: formData.accepts_subscriptions,
          service_locations: formData.service_locations,
          communication_settings: formData.communication_settings
        });
      } else if (userType === 'client' && clientProfile) {
        await base44.entities.ClientProfile.update(clientProfile.id, {
          default_address: formData.default_address,
          home_size: formData.home_size,
          latitude: formData.latitude,
          longitude: formData.longitude
        });
      }

      toast.success('Profile updated successfully!');
      setMessage('Profile updated successfully!');
      setEditing(false);
      await loadProfile();
    } catch (error) {
      handleError(error, { userMessage: 'Error saving profile:', showToast: false });
      toast.error('Failed to save changes. Please try again.');
      setMessage('Failed to save changes. Please try again.');
    }
    setSaving(false);
  };

  const toggleSpecialty = (tag) => {
    setFormData(prev => ({
      ...prev,
      specialty_tags: prev.specialty_tags.includes(tag)
        ? prev.specialty_tags.filter(t => t !== tag)
        : [...prev.specialty_tags, tag]
    }));
  };

  const toggleService = (service) => {
    setFormData(prev => ({
      ...prev,
      offers_additional_services: prev.offers_additional_services.includes(service)
        ? prev.offers_additional_services.filter(s => s !== service)
        : [...prev.offers_additional_services, service]
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-soft-cloud p-6 lg:p-10 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-puretask-blue" />
      </div>
    );
  }

  const tierConfig = cleanerProfile ? getTierColorClasses(cleanerProfile.tier) : null;
  const productConfig = cleanerProfile?.product_preference ? getProductColors(cleanerProfile.product_preference) : null;

  return (
    <div className="min-h-screen bg-soft-cloud">
      {/* Hero Header for Cleaners */}
      {userType === 'cleaner' && cleanerProfile && (
        <div className={`bg-gradient-to-r ${tierConfig.gradient} py-12 px-6 lg:px-10 shadow-xl`}>
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col md:flex-row items-center md:items-start gap-6"
            >
              {/* Profile Photo */}
              <div className="relative">
                {cleanerProfile.profile_photo_url ? (
                  <img
                    src={cleanerProfile.profile_photo_url}
                    alt={user.full_name}
                    className="w-32 h-32 rounded-2xl object-cover shadow-2xl border-4 border-white"
                  />
                ) : (
                  <div className="w-32 h-32 bg-white/20 rounded-2xl flex items-center justify-center text-5xl font-fredoka font-bold text-white shadow-2xl border-4 border-white">
                    {user.full_name?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
                <div className="absolute -bottom-2 -right-2">
                  <ReliabilityMeterV2 
                    score={cleanerProfile.reliability_score || 75}
                    tier={cleanerProfile.tier}
                    size="small"
                    showLabel={false}
                  />
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center gap-3 mb-3">
                  <h1 className="text-3xl lg:text-4xl font-fredoka font-bold text-white">{user.full_name}</h1>
                  <Badge className={`${tierConfig.bg} ${tierConfig.text} border-0 text-base px-3 py-1 rounded-full font-fredoka`}>
                    {tierConfig.icon} {cleanerProfile.tier}
                  </Badge>
                </div>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-4">
                  {/* Rating */}
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-2 rounded-full">
                    <Star className="w-4 h-4 fill-amber-300 text-amber-300" />
                    <span className="text-white font-fredoka font-semibold">
                      {cleanerProfile.average_rating?.toFixed(1) || '5.0'}
                    </span>
                    <span className="text-white/80 text-sm font-verdana">({cleanerProfile.total_reviews || 0})</span>
                  </div>

                  {/* Jobs */}
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-2 rounded-full">
                    <Briefcase className="w-4 h-4 text-white" />
                    <span className="text-white font-fredoka font-semibold">{cleanerProfile.total_jobs || 0} jobs</span>
                  </div>

                  {/* Rate */}
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-2 rounded-full">
                    <span className="text-2xl font-fredoka font-bold text-white">${cleanerProfile.hourly_rate}</span>
                    <span className="text-white/80 text-sm font-verdana">/hr</span>
                  </div>
                </div>

                {!editing && (
                  <Button
                    onClick={() => setEditing(true)}
                    className="bg-white text-fresh-mint hover:bg-green-50 rounded-full font-fredoka font-semibold"
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {/* Header for Clients */}
      {userType === 'client' && (
        <div className="brand-gradient py-12 px-6 lg:px-10 shadow-xl">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-white/20 rounded-2xl flex items-center justify-center text-4xl font-fredoka font-bold text-white shadow-2xl border-4 border-white">
                {user.full_name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1">
                <h1 className="text-3xl lg:text-4xl font-fredoka font-bold text-white mb-2">{user.full_name}</h1>
                <Badge className="bg-white/20 text-white border-0 rounded-full font-fredoka">Client Member</Badge>
              </div>
              {!editing && (
                <Button
                  onClick={() => setEditing(true)}
                  className="bg-white text-puretask-blue hover:bg-blue-50 rounded-full font-fredoka font-semibold"
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 lg:px-10 py-10">
        {message && (
          <Alert className="mb-6 border-fresh-mint bg-green-50 rounded-2xl">
            <CheckCircle className="w-4 h-4 text-fresh-mint" />
            <AlertDescription className="text-green-900 font-verdana">{message}</AlertDescription>
          </Alert>
        )}

        {editing && (
          <div className="flex justify-end gap-2 mb-6">
            <Button
              onClick={() => {
                setEditing(false);
                loadProfile();
              }}
              variant="outline"
              className="rounded-full font-fredoka"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="brand-gradient text-white rounded-full font-fredoka font-semibold"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        )}

        {/* Cleaner Profile Content */}
        {userType === 'cleaner' && cleanerProfile && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-7 bg-white rounded-2xl p-1 shadow-lg">
              <TabsTrigger value="profile" className="rounded-xl font-fredoka data-[state=active]:bg-puretask-blue data-[state=active]:text-white">
                <UserIcon className="w-4 h-4 mr-2" />Profile
              </TabsTrigger>
              <TabsTrigger value="pricing" className="rounded-xl font-fredoka data-[state=active]:bg-puretask-blue data-[state=active]:text-white">
                <DollarSign className="w-4 h-4 mr-2" />Pricing
              </TabsTrigger>
              <TabsTrigger value="services" className="rounded-xl font-fredoka data-[state=active]:bg-puretask-blue data-[state=active]:text-white">
                <Sparkles className="w-4 h-4 mr-2" />Services
              </TabsTrigger>
              <TabsTrigger value="availability" className="rounded-xl font-fredoka data-[state=active]:bg-puretask-blue data-[state=active]:text-white">
                <Calendar className="w-4 h-4 mr-2" />Availability
              </TabsTrigger>
              <TabsTrigger value="communication" className="rounded-xl font-fredoka data-[state=active]:bg-puretask-blue data-[state=active]:text-white">
                <MessageSquare className="w-4 h-4 mr-2" />Communication
              </TabsTrigger>
              <TabsTrigger value="portfolio" className="rounded-xl font-fredoka data-[state=active]:bg-puretask-blue data-[state=active]:text-white">
                <Camera className="w-4 h-4 mr-2" />Portfolio
              </TabsTrigger>
              <TabsTrigger value="settings" className="rounded-xl font-fredoka data-[state=active]:bg-puretask-blue data-[state=active]:text-white">
                <Settings className="w-4 h-4 mr-2" />Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <ProfileTab formData={formData} setFormData={setFormData} editing={editing} user={user} cleanerProfile={cleanerProfile} />
            </TabsContent>

            <TabsContent value="pricing">
              <PricingTab formData={formData} setFormData={setFormData} editing={editing} cleanerProfile={cleanerProfile} />
            </TabsContent>

            <TabsContent value="services">
              <ServicesTab formData={formData} setFormData={setFormData} editing={editing} toggleSpecialty={toggleSpecialty} toggleService={toggleService} />
            </TabsContent>

            <TabsContent value="availability">
              <AvailabilityTab formData={formData} setFormData={setFormData} editing={editing} />
            </TabsContent>

            <TabsContent value="communication">
              <CommunicationTab formData={formData} setFormData={setFormData} editing={editing} />
            </TabsContent>

            <TabsContent value="portfolio">
              <PortfolioTab cleanerProfile={cleanerProfile} />
            </TabsContent>

            <TabsContent value="settings">
              <SettingsTab formData={formData} setFormData={setFormData} editing={editing} />
            </TabsContent>
          </Tabs>
        )}

        {/* Client Profile Content */}
        {userType === 'client' && clientProfile && (
          <div className="space-y-6">
            {/* Client Stats */}
            <Card className="border-0 shadow-xl rounded-2xl">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-t-2xl">
                <CardTitle className="font-fredoka text-graphite">Membership Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-2xl border-2 border-blue-200">
                    <p className="text-sm text-puretask-blue font-verdana mb-1">Total Bookings</p>
                    <p className="text-3xl font-fredoka font-bold text-blue-900">{clientProfile.total_bookings}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-2xl border-2 border-green-200">
                    <p className="text-sm text-fresh-mint font-verdana mb-1">Credits Balance</p>
                    <p className="text-3xl font-fredoka font-bold text-green-900">${clientProfile.credits_balance?.toFixed(2) || '0.00'}</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-2xl border-2 border-purple-200">
                    <p className="text-sm text-purple-600 font-verdana mb-1">Membership</p>
                    <Badge className="text-lg px-3 py-1 rounded-full font-fredoka">{clientProfile.membership_tier}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Profile Details */}
            <Card className="border-0 shadow-xl rounded-2xl">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-t-2xl">
                <CardTitle className="font-fredoka text-graphite">Profile Details</CardTitle>
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
                    <AddressAutocomplete
                      value={formData.default_address}
                      onChange={(address) => setFormData({ ...formData, default_address: address })}
                      onLocationSelect={(location) => setFormData({
                        ...formData,
                        default_address: location.address,
                        latitude: location.latitude,
                        longitude: location.longitude
                      })}
                      label="Default Cleaning Address"
                    />
                    <div>
                      <Label htmlFor="home_size" className="font-fredoka text-graphite">Home Size</Label>
                      <select
                        id="home_size"
                        className="w-full p-2 border rounded-full font-verdana"
                        value={formData.home_size}
                        onChange={(e) => setFormData({ ...formData, home_size: e.target.value })}
                      >
                        <option value="small">Small (under 1000 sq ft)</option>
                        <option value="medium">Medium (1000-2000 sq ft)</option>
                        <option value="large">Large (over 2000 sq ft)</option>
                      </select>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label className="text-gray-600 font-fredoka">Email</Label>
                        <p className="text-graphite mt-1 flex items-center gap-2 font-verdana">
                          <Mail className="w-4 h-4 text-gray-400" />
                          {user.email}
                        </p>
                      </div>
                      <div>
                        <Label className="text-gray-600 font-fredoka">Phone</Label>
                        <p className="text-graphite mt-1 flex items-center gap-2 font-verdana">
                          <Phone className="w-4 h-4 text-gray-400" />
                          {user.phone || 'Not set'}
                        </p>
                      </div>
                    </div>
                    
                    {clientProfile.default_address && (
                      <div>
                        <Label className="text-gray-600 font-fredoka">Default Address</Label>
                        <p className="text-graphite mt-1 flex items-center gap-2 font-verdana">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          {clientProfile.default_address}
                        </p>
                      </div>
                    )}
                    
                    <div>
                      <Label className="text-gray-600 font-fredoka">Home Size</Label>
                      <p className="text-graphite mt-1 capitalize font-verdana">{clientProfile.home_size}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Account Security */}
        <Card className="border-0 shadow-xl rounded-2xl">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-t-2xl">
            <CardTitle className="flex items-center gap-2 font-fredoka text-graphite">
              <Shield className="w-6 h-6 text-gray-700" />
              Account Security
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label className="text-gray-600 font-fredoka">Member Since</Label>
                <p className="text-graphite mt-1 font-verdana">
                  {new Date(user?.created_date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              {userType === 'cleaner' && (
                <>
                  <div>
                    <Label className="text-gray-600 font-fredoka">KYC Status</Label>
                    <Badge className={`mt-1 rounded-full font-fredoka ${
                      user?.kyc_status === 'approved' ? 'bg-fresh-mint' :
                      user?.kyc_status === 'rejected' ? 'bg-red-500' : 'bg-amber-500'
                    }`}>
                      {user?.kyc_status}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-gray-600 font-fredoka">Background Check</Label>
                    <Badge className={`mt-1 rounded-full font-fredoka ${
                      user?.background_check_status === 'approved' ? 'bg-fresh-mint' :
                      user?.background_check_status === 'rejected' ? 'bg-red-500' : 'bg-amber-500'
                    }`}>
                      {user?.background_check_status}
                    </Badge>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}