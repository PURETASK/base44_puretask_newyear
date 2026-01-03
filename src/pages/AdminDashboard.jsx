import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Shield, Users, Briefcase, DollarSign, BarChart3, MessageSquare,
  Mail, Tag, AlertTriangle, Package, Sparkles, TrendingUp, Gift,
  Calendar, ChevronRight, Loader2, Eye, Settings, FileText, Wallet
} from 'lucide-react';
import { motion } from 'framer-motion';
import { usePermission } from '@/hooks/useAuth';
import { handleError } from '@/lib/errorHandler';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const isAdmin = usePermission('admin');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBookings: 0,
    activeCleaners: 0,
    activeClients: 0,
    totalRevenue: 0,
    pendingDisputes: 0,
    unprocessedMessages: 0
  });

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      const currentUser = await base44.auth.me();
      
      // Check if user is admin via built-in role OR AdminUser table
      let isAdminUser = currentUser?.role === 'admin';
      if (!isAdminUser) {
        try {
          const adminUsers = await base44.entities.AdminUser.filter({ 
            email: currentUser?.email,
            is_active: true
          });
          isAdminUser = adminUsers.length > 0;
        } catch (error) {
          // AdminUser table not accessible, rely on role check
        }
      }
      
      if (!currentUser || !isAdminUser) {
        navigate(createPageUrl('Home'));
        return;
      }
      setUser(currentUser);

      // Load basic stats
      const [bookings, cleaners, clients, disputes] = await Promise.all([
        base44.entities.Booking.list(),
        base44.entities.CleanerProfile.filter({ is_active: true }),
        base44.entities.ClientProfile.list(),
        base44.entities.Dispute.filter({ status: { $in: ['open', 'investigating'] } })
      ]);

      const revenue = bookings
        .filter(b => b.status === 'approved')
        .reduce((sum, b) => sum + (b.total_price * 0.15), 0);

      setStats({
        totalBookings: bookings.length,
        activeCleaners: cleaners.length,
        activeClients: clients.length,
        totalRevenue: revenue,
        pendingDisputes: disputes.length,
        unprocessedMessages: 0
      });
    } catch (error) {
      handleError(error, {
        userMessage: 'Failed to load admin dashboard',
        context: { page: 'AdminDashboard' }
      });
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-soft-cloud flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-puretask-blue" />
      </div>
    );
  }

  const adminPages = [
    {
      category: 'Operations & Management',
      pages: [
        { 
          title: 'Bookings Console', 
          icon: Briefcase, 
          description: 'Advanced booking management & actions',
          path: 'AdminBookingsConsole',
          color: 'from-blue-50 to-cyan-50',
          iconColor: 'text-puretask-blue',
          badge: stats.totalBookings > 0 ? stats.totalBookings : null
        },
        { 
          title: 'Client Management', 
          icon: Users, 
          description: 'Client profiles, credits & risk',
          path: 'AdminClientManagement',
          color: 'from-purple-50 to-indigo-50',
          iconColor: 'text-purple-600'
        },
        { 
          title: 'Cleaner Management', 
          icon: Users, 
          description: 'Cleaner profiles, tiers & performance',
          path: 'AdminCleanerManagement',
          color: 'from-green-50 to-emerald-50',
          iconColor: 'text-fresh-mint'
        },
        { 
          title: 'Support Tickets', 
          icon: MessageSquare, 
          description: 'Customer support queue',
          path: 'AdminSupportTickets',
          color: 'from-cyan-50 to-teal-50',
          iconColor: 'text-cyan-600'
        }
      ]
    },
    {
      category: 'Trust & Safety',
      pages: [
        { 
          title: 'Trust & Safety Hub', 
          icon: Shield, 
          description: 'Fraud prevention and safety monitoring',
          path: 'TrustSafetyDashboard',
          color: 'from-red-50 to-pink-50',
          iconColor: 'text-red-600',
          badge: stats.pendingDisputes > 0 ? `${stats.pendingDisputes}` : null
        },
        { 
          title: 'Dispute Resolution', 
          icon: FileText, 
          description: 'Handle disputes and refunds',
          path: 'AdminDisputeManagement',
          color: 'from-amber-50 to-orange-50',
          iconColor: 'text-amber-600'
        }
      ]
    },
    {
      category: 'Financial Management',
      pages: [
        { 
          title: 'Finance Center', 
          icon: DollarSign, 
          description: 'Payouts, revenue & financial KPIs',
          path: 'AdminFinanceCenter',
          color: 'from-green-50 to-emerald-50',
          iconColor: 'text-fresh-mint'
        },
        { 
          title: 'Credit Management', 
          icon: Wallet, 
          description: 'Grant credits and manage balances',
          path: 'AdminCreditManagement',
          color: 'from-blue-50 to-cyan-50',
          iconColor: 'text-puretask-blue'
        },
        { 
          title: 'Pricing Rules', 
          icon: TrendingUp, 
          description: 'Configure dynamic pricing multipliers',
          path: 'AdminPricingRules',
          color: 'from-amber-50 to-yellow-50',
          iconColor: 'text-amber-600'
        },
        { 
          title: 'Bundle Offers', 
          icon: Tag, 
          description: 'Create upsell and bundle deals',
          path: 'AdminBundleOffers',
          color: 'from-pink-50 to-rose-50',
          iconColor: 'text-pink-600'
        }
      ]
    },
    {
      category: 'Analytics & Insights',
      pages: [
        { 
          title: 'Analytics Dashboard', 
          icon: BarChart3, 
          description: 'Platform metrics and insights',
          path: 'AdminAnalyticsDashboard',
          color: 'from-purple-50 to-indigo-50',
          iconColor: 'text-purple-600'
        },
        { 
          title: 'Analytics Viewer', 
          icon: Eye, 
          description: 'View tracked user events',
          path: 'AdminAnalyticsViewer',
          color: 'from-cyan-50 to-teal-50',
          iconColor: 'text-cyan-600'
        }
      ]
    },
    {
      category: 'System & Audit',
      pages: [
        { 
          title: 'System Configuration', 
          icon: Settings, 
          description: 'Platform settings and thresholds',
          path: 'AdminSystemConfig',
          color: 'from-slate-50 to-gray-50',
          iconColor: 'text-slate-600'
        },
        { 
          title: 'Audit Log', 
          icon: FileText, 
          description: 'Complete history of admin actions',
          path: 'AdminAuditLog',
          color: 'from-indigo-50 to-violet-50',
          iconColor: 'text-indigo-600'
        }
      ]
    },
    {
      category: 'Communications',
      pages: [
        { 
          title: 'Message Delivery Logs', 
          icon: MessageSquare, 
          description: 'Track all platform messages',
          path: 'AdminMessages',
          color: 'from-blue-50 to-indigo-50',
          iconColor: 'text-blue-600'
        },
        { 
          title: 'Email Templates', 
          icon: Mail, 
          description: 'Manage notification templates',
          path: 'AdminEmailTemplates',
          color: 'from-purple-50 to-pink-50',
          iconColor: 'text-purple-600'
        }
      ]
    },
    {
      category: 'Platform Resources',
      pages: [
        { 
          title: 'Allergy Management', 
          icon: AlertTriangle, 
          description: 'Common allergies database',
          path: 'AllergyManagement',
          color: 'from-red-50 to-orange-50',
          iconColor: 'text-red-600'
        },
        { 
          title: 'Seasonal Tips', 
          icon: Sparkles, 
          description: 'Manage seasonal cleaning tips',
          path: 'SeasonalTipsManagement',
          color: 'from-green-50 to-teal-50',
          iconColor: 'text-green-600'
        },
        { 
          title: 'Partner Discounts', 
          icon: Tag, 
          description: 'Cleaner supply discounts',
          path: 'PartnerDiscounts',
          color: 'from-indigo-50 to-violet-50',
          iconColor: 'text-indigo-600'
        },
        { 
          title: 'Materials List', 
          icon: Package, 
          description: 'Recommended cleaning supplies',
          path: 'MaterialsList',
          color: 'from-cyan-50 to-blue-50',
          iconColor: 'text-cyan-600'
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-soft-cloud p-6 lg:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 brand-gradient rounded-2xl flex items-center justify-center shadow-lg">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-fredoka font-bold text-graphite">
                Admin Dashboard
              </h1>
              <p className="text-lg text-gray-600 font-verdana">
                Platform management and oversight
              </p>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl">
            <CardContent className="p-6">
              <Briefcase className="w-8 h-8 text-puretask-blue mb-3" />
              <p className="text-3xl font-fredoka font-bold text-graphite mb-1">{stats.totalBookings}</p>
              <p className="text-sm text-gray-600 font-verdana">Total Bookings</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl">
            <CardContent className="p-6">
              <Users className="w-8 h-8 text-fresh-mint mb-3" />
              <p className="text-3xl font-fredoka font-bold text-graphite mb-1">{stats.activeCleaners}</p>
              <p className="text-sm text-gray-600 font-verdana">Active Cleaners</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl">
            <CardContent className="p-6">
              <Users className="w-8 h-8 text-purple-600 mb-3" />
              <p className="text-3xl font-fredoka font-bold text-graphite mb-1">{stats.activeClients}</p>
              <p className="text-sm text-gray-600 font-verdana">Active Clients</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl">
            <CardContent className="p-6">
              <DollarSign className="w-8 h-8 text-amber-600 mb-3" />
              <p className="text-3xl font-fredoka font-bold text-graphite mb-1">${stats.totalRevenue.toFixed(0)}</p>
              <p className="text-sm text-gray-600 font-verdana">Platform Revenue</p>
            </CardContent>
          </Card>
        </div>

        {/* All Admin Tools by Category */}
        <div className="space-y-10">
          {adminPages.map((category, catIdx) => (
            <motion.div
              key={category.category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: catIdx * 0.1 }}
            >
              <h2 className="text-2xl font-fredoka font-bold text-graphite mb-6">
                {category.category}
              </h2>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.pages.map((page, pageIdx) => (
                  <motion.div
                    key={page.path}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: (catIdx * 0.1) + (pageIdx * 0.05) }}
                  >
                    <Card 
                      className={`border-0 shadow-lg hover:shadow-xl transition-all rounded-2xl cursor-pointer bg-gradient-to-br ${page.color}`}
                      onClick={() => navigate(createPageUrl(page.path))}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <page.icon className={`w-10 h-10 ${page.iconColor}`} />
                          {page.badge && (
                            <Badge className="bg-puretask-blue text-white rounded-full font-fredoka">
                              {page.badge}
                            </Badge>
                          )}
                        </div>
                        <h3 className="font-fredoka font-bold text-graphite text-lg mb-2">{page.title}</h3>
                        <p className="text-sm text-gray-600 font-verdana mb-4">{page.description}</p>
                        <div className="flex items-center text-puretask-blue font-fredoka font-medium text-sm">
                          Manage <ChevronRight className="w-4 h-4 ml-1" />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* System Health Alert */}
        {stats.pendingDisputes > 0 && (
          <Card className="mt-8 border-2 border-red-300 bg-red-50 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-8 h-8 text-red-600" />
                <div>
                  <p className="font-fredoka font-bold text-red-900 mb-1">
                    {stats.pendingDisputes} Pending Dispute{stats.pendingDisputes !== 1 ? 's' : ''}
                  </p>
                  <p className="text-sm text-red-700 font-verdana">Action required - review and resolve disputes</p>
                </div>
                <Button
                  onClick={() => navigate(createPageUrl('AdminClientJobs'))}
                  className="ml-auto bg-red-600 text-white rounded-full font-fredoka"
                >
                  Review Now
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}