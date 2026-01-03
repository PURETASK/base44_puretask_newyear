import React from 'react';
import { MapPin, CheckCircle, Clock, AlertTriangle, XCircle, Info } from 'lucide-react';

/**
 * Design System Demo Page
 * Showcases PureTask's locked color system and typography
 */
export default function DesignSystemDemo() {
  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="font-heading text-6xl font-bold text-slate-900">
            PureTask Design System
          </h1>
          <p className="font-body text-xl text-slate-600">
            Locked color palette and semantic usage rules
          </p>
          <div className="inline-block bg-brand-primary text-slate-900 font-heading font-semibold px-6 py-2 rounded-full">
            Version 1.0.0 - LOCKED
          </div>
        </div>

        {/* Brand Color */}
        <section>
          <h2 className="font-heading text-3xl font-bold text-slate-900 mb-6">
            Brand Color
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <div className="bg-brand-primary h-24 rounded-lg mb-4"></div>
              <h3 className="font-heading text-xl font-semibold text-slate-900">
                Brand Primary
              </h3>
              <p className="font-body text-slate-600 mb-2">#00FFFF</p>
              <p className="font-body text-sm text-slate-500">
                Use for: CTAs, active nav, links
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <h3 className="font-heading text-xl font-semibold text-slate-900 mb-4">
                Usage Examples
              </h3>
              <div className="space-y-3">
                <button className="w-full bg-brand-primary text-slate-900 font-heading font-semibold px-6 py-3 rounded-lg">
                  Primary CTA Button
                </button>
                <a href="#" className="block font-body text-brand-primary font-semibold">
                  Active Link Example
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Semantic Colors */}
        <section>
          <h2 className="font-heading text-3xl font-bold text-slate-900 mb-6">
            Semantic Colors
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Success/Reliability */}
            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <div className="bg-success h-16 rounded-lg mb-4"></div>
              <h3 className="font-heading text-xl font-semibold text-slate-900 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-success" />
                Success
              </h3>
              <p className="font-body text-slate-600 mb-2">#22C55E</p>
              <p className="font-body text-sm text-slate-500 mb-4">
                Reliability, completed, positive metrics
              </p>
              
              {/* Example Card */}
              <div className="bg-success-soft border border-success-border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-body text-xs text-slate-600">Reliability Score</p>
                    <p className="font-heading text-2xl font-bold text-success">87</p>
                  </div>
                  <span className="bg-success text-white font-heading font-medium px-3 py-1 rounded-full text-sm">
                    ✓ Complete
                  </span>
                </div>
              </div>
            </div>

            {/* System/Tracking */}
            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <div className="bg-system h-16 rounded-lg mb-4"></div>
              <h3 className="font-heading text-xl font-semibold text-slate-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-system" />
                System
              </h3>
              <p className="font-body text-slate-600 mb-2">#06B6D4</p>
              <p className="font-body text-sm text-slate-500 mb-4">
                GPS tracking, live updates, activity
              </p>
              
              {/* Example Card */}
              <div className="bg-system-soft border-l-4 border-system rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-system text-white p-2 rounded-full">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-heading font-semibold text-system-text text-sm">
                      Checked In
                    </p>
                    <p className="font-body text-xs text-slate-600">10:05 AM</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Warning */}
            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <div className="bg-warning h-16 rounded-lg mb-4"></div>
              <h3 className="font-heading text-xl font-semibold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-warning" />
                Warning
              </h3>
              <p className="font-body text-slate-600 mb-2">#F59E0B</p>
              <p className="font-body text-sm text-slate-500 mb-4">
                Awaiting approval, needs attention
              </p>
              
              {/* Example Badge */}
              <div className="bg-warning-soft border border-warning-border rounded-lg p-4">
                <span className="bg-warning text-white font-heading font-medium px-3 py-2 rounded-full text-sm">
                  ⏳ Pending
                </span>
              </div>
            </div>

            {/* Error */}
            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <div className="bg-error h-16 rounded-lg mb-4"></div>
              <h3 className="font-heading text-xl font-semibold text-slate-900 flex items-center gap-2">
                <XCircle className="w-5 h-5 text-error" />
                Error
              </h3>
              <p className="font-body text-slate-600 mb-2">#EF4444</p>
              <p className="font-body text-sm text-slate-500 mb-4">
                Critical issues, failures, disputes
              </p>
              
              {/* Example Alert */}
              <div className="bg-error-soft border border-error-border rounded-lg p-4">
                <span className="bg-error text-white font-heading font-medium px-3 py-2 rounded-full text-sm">
                  ✕ Disputed
                </span>
              </div>
            </div>

            {/* Info */}
            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <div className="bg-info h-16 rounded-lg mb-4"></div>
              <h3 className="font-heading text-xl font-semibold text-slate-900 flex items-center gap-2">
                <Info className="w-5 h-5 text-info" />
                Info
              </h3>
              <p className="font-body text-slate-600 mb-2">#3B82F6</p>
              <p className="font-body text-sm text-slate-500 mb-4">
                Informational, neutral status
              </p>
              
              {/* Example Tooltip */}
              <div className="bg-info-soft border border-info-border rounded-lg p-4">
                <span className="bg-info text-white font-heading font-medium px-3 py-2 rounded-full text-sm">
                  ℹ Scheduled
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Typography */}
        <section>
          <h2 className="font-heading text-3xl font-bold text-slate-900 mb-6">
            Typography
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Headings (Poppins) */}
            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <h3 className="font-heading text-xl font-semibold text-slate-900 mb-4">
                Headings - Poppins
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="font-body text-xs text-slate-500 mb-1">H1 - Display</p>
                  <h1 className="font-heading text-4xl font-bold text-slate-900">
                    Trust-First Marketplace
                  </h1>
                </div>
                <div>
                  <p className="font-body text-xs text-slate-500 mb-1">H2 - Section</p>
                  <h2 className="font-heading text-3xl font-bold text-slate-900">
                    Find Your Perfect Cleaner
                  </h2>
                </div>
                <div>
                  <p className="font-body text-xs text-slate-500 mb-1">H3 - Card Title</p>
                  <h3 className="font-heading text-xl font-semibold text-slate-900">
                    Reliability Score
                  </h3>
                </div>
                <div>
                  <p className="font-body text-xs text-slate-500 mb-1">Button Text</p>
                  <button className="bg-brand-primary text-slate-900 font-heading font-semibold px-6 py-2 rounded-lg">
                    Book Now
                  </button>
                </div>
              </div>
            </div>

            {/* Body (Quicksand) */}
            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <h3 className="font-heading text-xl font-semibold text-slate-900 mb-4">
                Body Text - Quicksand
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="font-body text-xs text-slate-500 mb-1">Large Body</p>
                  <p className="font-body text-lg text-slate-700">
                    Connect with verified, professional cleaners in your area.
                  </p>
                </div>
                <div>
                  <p className="font-body text-xs text-slate-500 mb-1">Regular Body</p>
                  <p className="font-body text-base text-slate-600">
                    PureTask ensures quality through GPS tracking, photo verification, and performance-based ratings.
                  </p>
                </div>
                <div>
                  <p className="font-body text-xs text-slate-500 mb-1">Small/Helper Text</p>
                  <p className="font-body text-sm text-slate-500">
                    All cleaners are background checked and identity verified.
                  </p>
                </div>
                <div>
                  <p className="font-body text-xs text-slate-500 mb-1">Extra Small</p>
                  <p className="font-body text-xs text-slate-400">
                    Last updated: January 2, 2026
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Real-World Examples */}
        <section>
          <h2 className="font-heading text-3xl font-bold text-slate-900 mb-6">
            Real-World Component Examples
          </h2>
          
          <div className="space-y-6">
            
            {/* Booking Card Example */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-md">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-heading text-2xl font-semibold text-slate-900">
                    Deep Cleaning - 4 hours
                  </h3>
                  <p className="font-body text-slate-600 mt-1">
                    December 28, 2025 • 10:00 AM
                  </p>
                </div>
                <span className="bg-success text-white font-heading font-medium px-4 py-2 rounded-full">
                  ✓ Completed
                </span>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-success-soft border border-success-border rounded-lg p-3">
                  <p className="font-body text-xs text-slate-600">On Time</p>
                  <p className="font-heading font-bold text-success text-lg">✓</p>
                </div>
                <div className="bg-success-soft border border-success-border rounded-lg p-3">
                  <p className="font-body text-xs text-slate-600">Photos</p>
                  <p className="font-heading font-bold text-success text-lg">8</p>
                </div>
                <div className="bg-success-soft border border-success-border rounded-lg p-3">
                  <p className="font-body text-xs text-slate-600">Rating</p>
                  <p className="font-heading font-bold text-success text-lg">5.0</p>
                </div>
              </div>
            </div>

            {/* Live Tracking Banner */}
            <div className="bg-system text-white py-4 px-6 rounded-lg shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="animate-pulse">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="font-heading font-semibold text-lg">
                      Job In Progress
                    </h4>
                    <p className="font-body text-sm text-cyan-100">
                      Sarah checked in at 10:05 AM
                    </p>
                  </div>
                </div>
                <button className="bg-white text-system font-heading font-medium px-4 py-2 rounded-lg">
                  View Live
                </button>
              </div>
            </div>

            {/* Tier Badges */}
            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <h3 className="font-heading text-xl font-semibold text-slate-900 mb-4">
                Cleaner Tiers
              </h3>
              <div className="flex flex-wrap gap-3">
                <div className="bg-success text-white font-heading font-bold px-4 py-2 rounded-full flex items-center gap-2">
                  <span>💎</span> Elite
                </div>
                <div className="bg-success-soft text-success-text border border-success-border font-heading font-semibold px-4 py-2 rounded-full flex items-center gap-2">
                  <span>🌟</span> Pro
                </div>
                <div className="bg-info-soft text-info-text border border-info-border font-heading font-semibold px-4 py-2 rounded-full flex items-center gap-2">
                  <span>⭐</span> Semi-Pro
                </div>
                <div className="bg-slate-100 text-slate-700 font-heading font-medium px-4 py-2 rounded-full flex items-center gap-2">
                  <span>🌱</span> Developing
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Usage Rules */}
        <section>
          <h2 className="font-heading text-3xl font-bold text-slate-900 mb-6">
            Usage Rules (Non-Negotiable)
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* DO */}
            <div className="bg-success-soft border-l-4 border-success rounded-lg p-6">
              <h3 className="font-heading text-xl font-semibold text-success-text mb-4">
                ✅ DO
              </h3>
              <ul className="font-body text-sm text-slate-700 space-y-2">
                <li>• Use brand color for CTAs and active states</li>
                <li>• Use success green for reliability and completion</li>
                <li>• Use system cyan for GPS and live tracking</li>
                <li>• Use Poppins for all headings</li>
                <li>• Use Quicksand for body text</li>
                <li>• Maintain semantic color meanings consistently</li>
              </ul>
            </div>

            {/* DON'T */}
            <div className="bg-error-soft border-l-4 border-error rounded-lg p-6">
              <h3 className="font-heading text-xl font-semibold text-error-text mb-4">
                ❌ DON'T
              </h3>
              <ul className="font-body text-sm text-slate-700 space-y-2">
                <li>• Use brand color for card backgrounds</li>
                <li>• Mix semantic meanings (green for tracking)</li>
                <li>• Use colors decoratively without purpose</li>
                <li>• Use Quicksand for headings</li>
                <li>• Use Poppins for long body text</li>
                <li>• Suggest alternative colors</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="text-center py-8 border-t border-slate-200">
          <p className="font-body text-slate-500">
            Design System v1.0.0 - LOCKED • Last Updated: January 2, 2026
          </p>
          <p className="font-body text-sm text-slate-400 mt-2">
            Do not modify without explicit approval
          </p>
        </div>

      </div>
    </div>
  );
}

