import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Shield, FileText, Camera, Clock, AlertTriangle, 
  Scale, Eye, Lock, CheckCircle, DollarSign, Gift,
  ArrowRight, Mail
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function Legal() {
  const [activeTab, setActiveTab] = useState('privacy');

  const tabs = [
    { id: 'privacy', label: 'Privacy Policy', icon: Shield, color: 'blue' },
    { id: 'terms', label: 'Terms of Service', icon: FileText, color: 'green' },
    { id: 'photo', label: 'Photo Consent', icon: Camera, color: 'purple' },
    { id: 'cancellation', label: 'Cancellation Policy', icon: Clock, color: 'amber' },
    { id: 'damage', label: 'Damage & Claims', icon: AlertTriangle, color: 'red' }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100',
      green: 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100',
      purple: 'border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100',
      amber: 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100',
      red: 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-20 h-20 brand-gradient rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Scale className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl lg:text-6xl font-fredoka font-bold text-graphite mb-4">
            Legal Center
          </h1>
          <p className="text-xl text-gray-600 font-verdana max-w-2xl mx-auto">
            Your guide to PureTask policies, terms, and protections
          </p>
          <p className="text-sm text-gray-500 font-verdana mt-2">Last updated: November 2024</p>
        </motion.div>

        {/* Quick Links Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {[
            { 
              icon: Shield, 
              title: 'Privacy Policy', 
              desc: 'How we protect your data',
              link: createPageUrl('PrivacyPolicy'),
              color: 'blue'
            },
            { 
              icon: FileText, 
              title: 'Terms of Service', 
              desc: 'Platform rules & guidelines',
              link: createPageUrl('TermsOfService'),
              color: 'green'
            },
            { 
              icon: Camera, 
              title: 'Photo Consent', 
              desc: 'Transparency through photos',
              link: createPageUrl('PhotoConsent'),
              color: 'purple'
            },
            { 
              icon: Clock, 
              title: 'Cancellation Policy', 
              desc: 'Fees & grace cancellations',
              link: createPageUrl('CancellationPolicy'),
              color: 'amber'
            },
            { 
              icon: AlertTriangle, 
              title: 'Damage & Claims', 
              desc: 'Property protection policy',
              link: createPageUrl('DamageClaimsPolicy'),
              color: 'red'
            },
            { 
              icon: Mail, 
              title: 'Contact Legal', 
              desc: 'Get help with legal matters',
              link: 'mailto:legal@puretask.com',
              color: 'indigo'
            }
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Link to={item.link}>
                <Card className="h-full border-2 hover:shadow-xl transition-all duration-300 rounded-2xl cursor-pointer group" 
                  style={{ 
                    borderColor: item.color === 'blue' ? '#93C5FD' : 
                               item.color === 'green' ? '#86EFAC' :
                               item.color === 'purple' ? '#C4B5FD' :
                               item.color === 'amber' ? '#FCD34D' :
                               item.color === 'red' ? '#FCA5A5' : '#A5B4FC'
                  }}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0"
                        style={{
                          backgroundColor: item.color === 'blue' ? '#3B82F6' :
                                         item.color === 'green' ? '#10B981' :
                                         item.color === 'purple' ? '#8B5CF6' :
                                         item.color === 'amber' ? '#F59E0B' :
                                         item.color === 'red' ? '#EF4444' : '#6366F1'
                        }}>
                        <item.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-fredoka font-bold text-graphite mb-1 group-hover:text-puretask-blue transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-sm text-gray-600 font-verdana">{item.desc}</p>
                        <div className="mt-3 flex items-center gap-1 text-puretask-blue text-sm font-verdana font-semibold">
                          <span>Read More</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Tabbed Content Section */}
        <Card className="border-0 shadow-2xl rounded-2xl overflow-hidden">
          {/* Tab Navigation */}
          <div className="bg-white border-b-2 border-gray-200">
            <div className="flex overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-4 font-fredoka font-semibold whitespace-nowrap transition-all border-b-4 ${
                      isActive 
                        ? 'border-puretask-blue text-puretask-blue bg-blue-50' 
                        : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-graphite'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="hidden md:inline">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-8 lg:p-12 bg-white">
            {activeTab === 'privacy' && <PrivacyContent />}
            {activeTab === 'terms' && <TermsContent />}
            {activeTab === 'photo' && <PhotoContent />}
            {activeTab === 'cancellation' && <CancellationContent />}
            {activeTab === 'damage' && <DamageContent />}
          </div>
        </Card>

        {/* Contact Footer */}
        <Card className="mt-12 border-0 shadow-xl rounded-2xl bg-gradient-to-r from-blue-50 to-cyan-50">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-fredoka font-bold text-graphite mb-4">
              Have Questions About Our Policies?
            </h3>
            <p className="text-gray-600 font-verdana mb-6 max-w-2xl mx-auto">
              Our team is here to help clarify any legal questions or concerns you may have.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="mailto:legal@puretask.com">
                <Button className="brand-gradient text-white rounded-full font-fredoka font-semibold px-8 py-6 text-lg hover:scale-105 transition-transform">
                  <Mail className="w-5 h-5 mr-2" />
                  Contact Legal Team
                </Button>
              </a>
              <Link to={createPageUrl('Support')}>
                <Button variant="outline" className="rounded-full font-fredoka font-semibold px-8 py-6 text-lg border-2 border-puretask-blue text-puretask-blue hover:bg-blue-50">
                  Visit Support Center
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Privacy Policy Content
function PrivacyContent() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-fredoka font-bold text-graphite mb-4 flex items-center gap-2">
          <Shield className="w-8 h-8 text-puretask-blue" />
          Privacy Policy
        </h2>
        <p className="text-lg text-gray-600 font-verdana leading-relaxed mb-6">
          How we protect and handle your information
        </p>
      </div>

      <div className="space-y-4">
        <InfoSection 
          icon={Lock}
          title="Information We Collect"
          items={[
            'Account information (name, email, phone, payment details)',
            'Location data (GPS) during check-in/out for verification',
            'Before/after photos uploaded by cleaners',
            'Booking details, addresses, preferences, and reviews'
          ]}
        />

        <InfoSection 
          icon={Eye}
          title="How We Use Your Information"
          items={[
            'Facilitate bookings between clients and cleaners',
            'Process payments and payouts securely',
            'Calculate Reliability Scores for quality assurance',
            'Verify GPS check-ins for trust and transparency',
            'Send booking confirmations and reminders'
          ]}
        />

        <InfoSection 
          icon={Shield}
          title="Data Security"
          items={[
            'All data encrypted in transit (SSL/TLS) and at rest',
            'Role-based access controls for privacy',
            'PII minimization - collect only what is necessary',
            'Photos use tokenized URLs with expiring signed links'
          ]}
        />
      </div>

      <Link to={createPageUrl('PrivacyPolicy')}>
        <Button className="mt-6 brand-gradient text-white rounded-full font-fredoka">
          Read Full Privacy Policy <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </Link>
    </div>
  );
}

// Terms of Service Content
function TermsContent() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-fredoka font-bold text-graphite mb-4 flex items-center gap-2">
          <FileText className="w-8 h-8 text-fresh-mint" />
          Terms of Service
        </h2>
        <p className="text-lg text-gray-600 font-verdana leading-relaxed mb-6">
          Platform rules, user responsibilities, and legal agreements
        </p>
      </div>

      <div className="space-y-4">
        <InfoSection 
          icon={CheckCircle}
          title="Platform Usage"
          items={[
            'Must be 18+ to use PureTask',
            'Cleaners complete identity verification',
            'Background checks for all service providers',
            'Respect community guidelines and standards'
          ]}
        />

        <InfoSection 
          icon={DollarSign}
          title="Payment Terms"
          items={[
            'Credits: 10 credits = $1 USD',
            'Credits held in escrow until job completion',
            'Platform fee: 15% of transaction value',
            'Cleaners receive 80-85% based on tier'
          ]}
        />

        <InfoSection 
          icon={Scale}
          title="Independent Contractor Status"
          items={[
            'Cleaners are independent contractors, not employees',
            'Cleaners set their own rates and availability',
            'Cleaners provide their own equipment',
            'Responsible for own taxes and insurance'
          ]}
        />
      </div>

      <Link to={createPageUrl('TermsOfService')}>
        <Button className="mt-6 brand-gradient text-white rounded-full font-fredoka">
          Read Full Terms of Service <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </Link>
    </div>
  );
}

// Photo Consent Content
function PhotoContent() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-fredoka font-bold text-graphite mb-4 flex items-center gap-2">
          <Camera className="w-8 h-8 text-purple-600" />
          Photo Proof & Consent
        </h2>
        <p className="text-lg text-gray-600 font-verdana leading-relaxed mb-6">
          Transparency through before/after documentation
        </p>
      </div>

      <div className="space-y-4">
        <InfoSection 
          icon={Eye}
          title="Why Photo Proof Matters"
          items={[
            'Transparency: Clients see exactly what was cleaned',
            'Quality: Visual proof before payment release',
            'Protection: Resolves disputes with evidence',
            'Reliability: Boosts cleaner scores'
          ]}
        />

        <InfoSection 
          icon={Camera}
          title="Photo Requirements"
          items={[
            'Minimum 3 photos total (before + after)',
            'Good lighting and clear focus',
            'No client PII visible',
            'Automatically geotagged and timestamped'
          ]}
        />

        <InfoSection 
          icon={Lock}
          title="Photo Security"
          items={[
            'Stored in private AWS S3 buckets',
            'Signed, expiring URLs for access',
            'EXIF data scrubbed for privacy',
            'Retained for 90 days post-completion'
          ]}
        />
      </div>

      <Link to={createPageUrl('PhotoConsent')}>
        <Button className="mt-6 brand-gradient text-white rounded-full font-fredoka">
          Read Full Photo Policy <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </Link>
    </div>
  );
}

// Cancellation Policy Content
function CancellationContent() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-fredoka font-bold text-graphite mb-4 flex items-center gap-2">
          <Clock className="w-8 h-8 text-amber-600" />
          Cancellation Policy
        </h2>
        <p className="text-lg text-gray-600 font-verdana leading-relaxed mb-6">
          Fees, grace cancellations, and refund policies
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <Card className="border-2 border-green-200 bg-green-50">
          <CardContent className="p-6 text-center">
            <Badge className="bg-green-600 text-white text-xl mb-3 px-4 py-2">0% Fee</Badge>
            <h3 className="font-fredoka font-bold text-green-900 mb-2">Free Cancellation</h3>
            <p className="text-sm text-green-800 font-verdana">More than 48 hours notice</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-amber-200 bg-amber-50">
          <CardContent className="p-6 text-center">
            <Badge className="bg-amber-600 text-white text-xl mb-3 px-4 py-2">50% Fee</Badge>
            <h3 className="font-fredoka font-bold text-amber-900 mb-2">Partial Fee</h3>
            <p className="text-sm text-amber-800 font-verdana">24-48 hours notice</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <Badge className="bg-red-600 text-white text-xl mb-3 px-4 py-2">100% Fee</Badge>
            <h3 className="font-fredoka font-bold text-red-900 mb-2">Full Fee</h3>
            <p className="text-sm text-red-800 font-verdana">Less than 24 hours</p>
          </CardContent>
        </Card>
      </div>

      <InfoSection 
        icon={Gift}
        title="Grace Cancellations"
        items={[
          'Every client gets 2 free grace cancellations',
          'Waives 50% or 100% fees for emergencies',
          'Automatically offered during cancellation',
          'Once used, they do not replenish'
        ]}
      />

      <Link to={createPageUrl('CancellationPolicy')}>
        <Button className="mt-6 brand-gradient text-white rounded-full font-fredoka">
          Read Full Cancellation Policy <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </Link>
    </div>
  );
}

// Damage Claims Content
function DamageContent() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-fredoka font-bold text-graphite mb-4 flex items-center gap-2">
          <AlertTriangle className="w-8 h-8 text-red-600" />
          Damage & Claims Policy
        </h2>
        <p className="text-lg text-gray-600 font-verdana leading-relaxed mb-6">
          How we handle property damage and claims resolution
        </p>
      </div>

      <div className="space-y-4">
        <InfoSection 
          icon={Clock}
          title="How to Report Damage"
          items={[
            'Report within 48 hours of completion',
            'Open a dispute in booking details',
            'Provide clear photos and description',
            'Include estimated repair costs'
          ]}
        />

        <InfoSection 
          icon={CheckCircle}
          title="What is Covered"
          items={[
            'Accidental damage during cleaning',
            'Damage from improper product use',
            'Lost or misplaced items',
            'Surface damage and breakage'
          ]}
        />

        <InfoSection 
          icon={Scale}
          title="Resolution Process"
          items={[
            'Evidence review within 24-48 hours',
            'Contact both parties for statements',
            'Determine responsibility fairly',
            'Process refunds or compensation'
          ]}
        />
      </div>

      <Link to={createPageUrl('DamageClaimsPolicy')}>
        <Button className="mt-6 brand-gradient text-white rounded-full font-fredoka">
          Read Full Claims Policy <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </Link>
    </div>
  );
}

// Helper Component
function InfoSection({ icon: Icon, title, items }) {
  return (
    <Card className="border-2 border-gray-200 rounded-2xl">
      <CardContent className="p-6">
        <h3 className="flex items-center gap-2 font-fredoka font-bold text-xl text-graphite mb-4">
          <Icon className="w-6 h-6 text-puretask-blue" />
          {title}
        </h3>
        <ul className="space-y-2">
          {items.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 text-gray-700 font-verdana">
              <CheckCircle className="w-5 h-5 text-fresh-mint mt-0.5 flex-shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}