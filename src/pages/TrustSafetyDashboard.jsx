import React, { useState, useEffect } from 'react';
import { handleError } from '@/lib/errorHandler';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Flag, AlertTriangle, FileText, BarChart3, Loader2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TrustSafetyDashboard() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({});

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = async () => {
    try {
      const [profiles, flags, incidents, actionLogs] = await Promise.all([
        base44.entities.RiskProfile.list(),
        base44.entities.RiskFlag.filter({ status: 'open' }),
        base44.entities.SafetyIncident.filter({ status: 'open' }),
        base44.entities.RiskActionLog.list('-created_date', 10)
      ]);
      
      setSummary({
        totalProfiles: profiles.length,
        normalUsers: profiles.filter(p => p.risk_tier === 'normal').length,
        watchList: profiles.filter(p => p.risk_tier === 'watch').length,
        restricted: profiles.filter(p => p.risk_tier === 'restricted').length,
        blocked: profiles.filter(p => p.risk_tier === 'blocked').length,
        openFlags: flags.length,
        criticalFlags: flags.filter(f => f.severity === 'critical').length,
        openIncidents: incidents.length,
        criticalIncidents: incidents.filter(i => i.severity === 'critical').length,
        recentActions: actionLogs.length
      });
      
      setLoading(false);
    } catch (error) {
      handleError(error, { userMessage: 'Error loading summary:', showToast: false });
      setLoading(false);
    }
  };

  const modules = [
    {
      title: 'Risk Management',
      description: 'Monitor user risk profiles, scores, and enforcement tiers',
      icon: Shield,
      color: '#66B3FF',
      path: 'AdminRiskManagement',
      stats: [
        { label: 'Watch List', value: summary.watchList || 0, color: 'text-yellow-600' },
        { label: 'Restricted', value: summary.restricted || 0, color: 'text-amber-600' },
        { label: 'Blocked', value: summary.blocked || 0, color: 'text-red-600' }
      ]
    },
    {
      title: 'Risk Flags',
      description: 'Review automated fraud detection and abuse pattern alerts',
      icon: Flag,
      color: '#FF9F43',
      path: 'AdminRiskFlags',
      stats: [
        { label: 'Open Flags', value: summary.openFlags || 0, color: 'text-amber-600' },
        { label: 'Critical', value: summary.criticalFlags || 0, color: 'text-red-600' }
      ]
    },
    {
      title: 'Safety Incidents',
      description: 'Handle safety reports, harassment, theft, and dangerous situations',
      icon: AlertTriangle,
      color: '#EA5455',
      path: 'AdminSafetyIncidents',
      stats: [
        { label: 'Open Cases', value: summary.openIncidents || 0, color: 'text-red-600' },
        { label: 'Critical', value: summary.criticalIncidents || 0, color: 'text-red-800' }
      ]
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-soft-cloud flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-puretask-blue" />
      </div>
    );
  }

  const totalHighRisk = (summary.restricted || 0) + (summary.blocked || 0);
  const highRiskRate = summary.totalProfiles > 0 ? 
    (totalHighRisk / summary.totalProfiles) * 100 : 0;

  return (
    <div className="min-h-screen bg-soft-cloud p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-fredoka font-bold text-graphite">Trust & Safety Hub</h1>
          <p className="text-gray-600 font-verdana mt-2">
            Fraud prevention, risk management & safety monitoring
          </p>
        </div>

        {/* Alert Banner */}
        {(summary.criticalFlags > 0 || summary.criticalIncidents > 0) && (
          <Card className="border-2 border-red-500 bg-red-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-8 h-8 text-red-600" />
                <div>
                  <p className="font-fredoka font-bold text-lg text-graphite">
                    Critical Issues Require Attention
                  </p>
                  <p className="text-sm text-gray-600 font-verdana">
                    {summary.criticalFlags} critical flags • {summary.criticalIncidents} critical incidents
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Platform Health Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="font-fredoka text-xl">Platform Trust Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-green-50 rounded-xl">
                <p className="text-4xl font-fredoka font-bold text-fresh-mint">
                  {((summary.normalUsers || 0) / (summary.totalProfiles || 1) * 100).toFixed(1)}%
                </p>
                <p className="text-sm text-gray-600 font-verdana mt-1">Normal Users</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-xl">
                <p className="text-4xl font-fredoka font-bold text-yellow-600">
                  {summary.watchList || 0}
                </p>
                <p className="text-sm text-gray-600 font-verdana mt-1">Watch List</p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-xl">
                <p className="text-4xl font-fredoka font-bold text-red-600">
                  {highRiskRate.toFixed(1)}%
                </p>
                <p className="text-sm text-gray-600 font-verdana mt-1">High Risk Rate</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-xl">
                <p className="text-4xl font-fredoka font-bold text-puretask-blue">
                  {summary.recentActions || 0}
                </p>
                <p className="text-sm text-gray-600 font-verdana mt-1">Recent Actions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Module Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {modules.map((module, idx) => (
            <motion.div
              key={module.path}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Link to={createPageUrl(module.path)}>
                <Card className="border-2 hover:shadow-xl transition-all cursor-pointer h-full" style={{ borderColor: module.color }}>
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: module.color }}>
                        <module.icon className="w-6 h-6 text-white" />
                      </div>
                      <CardTitle className="font-fredoka text-xl">{module.title}</CardTitle>
                    </div>
                    <p className="text-sm text-gray-600 font-verdana">{module.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      {module.stats.map((stat, i) => (
                        <div key={i} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                          <span className="text-sm font-verdana text-gray-600">{stat.label}</span>
                          <span className={`text-lg font-fredoka font-bold ${stat.color}`}>
                            {stat.value}
                          </span>
                        </div>
                      ))}
                    </div>
                    <Button className="w-full font-fredoka" style={{ backgroundColor: module.color }}>
                      Open Module
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle className="font-fredoka text-xl flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-puretask-blue" />
              Trust & Safety Engine Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm font-verdana text-gray-600 mb-1">Real-time Monitoring</p>
                <p className="text-xl font-fredoka font-bold text-green-700">Active ✓</p>
                <p className="text-xs text-gray-500 font-verdana mt-1">Event-driven risk detection</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm font-verdana text-gray-600 mb-1">Nightly Risk Scan</p>
                <p className="text-xl font-fredoka font-bold text-blue-700">Scheduled ✓</p>
                <p className="text-xs text-gray-500 font-verdana mt-1">Risk decay & recalculation</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-sm font-verdana text-gray-600 mb-1">Safety Escalation</p>
                <p className="text-xl font-fredoka font-bold text-purple-700">Automated ✓</p>
                <p className="text-xs text-gray-500 font-verdana mt-1">Critical incidents auto-escalate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}