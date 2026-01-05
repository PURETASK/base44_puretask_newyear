import React, { useState, useEffect } from 'react';
import { handleError } from '@/lib/errorHandler';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  HelpCircle, Send, Clock, CheckCircle, AlertCircle, Loader2, 
  MessageSquare, Search, Filter, ChevronDown, ChevronUp,
  Book, CreditCard, Calendar, Shield, Phone, Mail, ExternalLink,
  TrendingUp, User, Package, Zap, Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Support() {
  const [user, setUser] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [allTickets, setAllTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isAdmin, setIsAdmin] = useState(false);
  const [expandedFAQ, setExpandedFAQ] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    category: '',
    priority: 'medium',
    booking_id: ''
  });

  const categories = [
    { value: 'cancellation', label: 'Cancellation', icon: Calendar, color: 'text-red-500' },
    { value: 'no_show', label: 'No Show', icon: AlertCircle, color: 'text-orange-500' },
    { value: 'late_arrival', label: 'Late Arrival', icon: Clock, color: 'text-amber-500' },
    { value: 'quality_issue', label: 'Quality Issue', icon: Shield, color: 'text-purple-500' },
    { value: 'payment', label: 'Payment', icon: CreditCard, color: 'text-blue-500' },
    { value: 'technical', label: 'Technical', icon: Zap, color: 'text-cyan-500' },
    { value: 'account', label: 'Account', icon: User, color: 'text-green-500' },
    { value: 'other', label: 'Other', icon: Package, color: 'text-gray-500' }
  ];

  const faqs = [
    {
      category: 'Bookings',
      icon: Calendar,
      color: 'blue',
      questions: [
        {
          q: 'How do I cancel a booking?',
          a: 'Go to your booking details and click "Cancel Booking". Cancellation fees apply based on notice period: Free (48+ hrs), 50% fee (24-48 hrs), Full charge (<24 hrs). See our Cancellation Policy for details.'
        },
        {
          q: 'Can I reschedule my cleaning?',
          a: 'Yes! Go to your booking and click "Reschedule". Same fees apply as cancellation. Contact your cleaner directly through messaging for faster coordination.'
        },
        {
          q: 'What if my cleaner doesn\'t show up?',
          a: 'You\'ll automatically receive full credits back plus a no-show credit. We\'ll also help you find a replacement cleaner immediately. GPS tracking ensures accountability.'
        }
      ]
    },
    {
      category: 'Payments',
      icon: CreditCard,
      color: 'green',
      questions: [
        {
          q: 'How does payment work?',
          a: 'Credits are held in escrow when you book. Payment is only released after the cleaner completes the job, uploads before/after photos, and you approve the work. You have 48 hours to review.'
        },
        {
          q: 'What if I\'m not satisfied with the cleaning?',
          a: 'Don\'t approve the work! Open a dispute within 48 hours. Our team will review the photos and resolve fairly. Payment is held until resolution.'
        },
        {
          q: 'How do credits work?',
          a: '10 credits = $1 USD. Buy credits in your wallet and use them for any booking. Unused credits never expire and can be refunded anytime.'
        }
      ]
    },
    {
      category: 'Quality & Safety',
      icon: Shield,
      color: 'purple',
      questions: [
        {
          q: 'Are cleaners background checked?',
          a: 'Yes! All cleaners undergo full KYC verification, background checks, and identity verification. We also track reliability scores based on performance.'
        },
        {
          q: 'What about insurance and damages?',
          a: 'Report any damage within 48 hours through the dispute system. We review evidence (photos) and resolve fairly. See our Damage & Claims Policy for full details.'
        },
        {
          q: 'How do I know the cleaning was done well?',
          a: 'Cleaners must upload before/after photos with GPS check-in/out. You review the photos before approving payment. Rate your experience to help others.'
        }
      ]
    },
    {
      category: 'Account & Technical',
      icon: User,
      color: 'cyan',
      questions: [
        {
          q: 'How do I update my account details?',
          a: 'Go to Profile > Edit Profile. You can update your name, contact info, default address, and payment methods.'
        },
        {
          q: 'I forgot my password',
          a: 'Click "Forgot Password" on the login page. You\'ll receive a reset link via email within minutes.'
        },
        {
          q: 'How do I contact my cleaner?',
          a: 'Use the built-in messaging system in your booking details. Messages are instant and both parties get notifications.'
        }
      ]
    }
  ];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterTickets();
  }, [tickets, searchQuery, statusFilter, categoryFilter]);

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      const adminCheck = currentUser.role === 'admin';
      setIsAdmin(adminCheck);

      if (adminCheck) {
        const allUserTickets = await base44.entities.SupportTicket.list('-created_date');
        setAllTickets(allUserTickets);
        setTickets(allUserTickets);
      } else {
        const userTickets = await base44.entities.SupportTicket.filter({ 
          user_email: currentUser.email 
        }, '-created_date');
        setTickets(userTickets);
      }
    } catch (error) {
      handleError(error, { userMessage: 'Error loading support data:', showToast: false });
      setMessage({ type: 'error', text: 'Failed to load support data' });
    }
    setLoading(false);
  };

  const filterTickets = () => {
    let filtered = [...tickets];

    if (searchQuery) {
      filtered = filtered.filter(ticket => 
        ticket.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.user_email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(ticket => ticket.status === statusFilter);
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(ticket => ticket.category === categoryFilter);
    }

    setFilteredTickets(filtered);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.category) {
      setMessage({ type: 'error', text: 'Please select a category' });
      return;
    }

    setSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const newTicket = await base44.entities.SupportTicket.create({
        user_email: user.email,
        ...formData,
        status: 'open'
      });

      // Create conversation thread for this support ticket
      const admins = await base44.entities.User.filter({ role: 'admin' });
      const adminEmail = admins.length > 0 ? admins[0].email : 'support@puretask.com';

      await base44.functions.invoke('messaging', {
        action: 'createConversation',
        participants: [user.email, adminEmail],
        subject: `Support: ${formData.subject}`,
        booking_id: formData.booking_id || undefined,
        initial_message_content: formData.description
      });

      setMessage({ type: 'success', text: '✓ Support ticket submitted successfully! We\'ll respond within 24 hours.' });
      setFormData({
        subject: '',
        description: '',
        category: '',
        priority: 'medium',
        booking_id: ''
      });
      
      await loadData();
      
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to submit ticket. Please try again or contact us directly.' });
    }
    setSubmitting(false);
  };

  const handleUpdateTicketStatus = async (ticketId, newStatus) => {
    try {
      await base44.entities.SupportTicket.update(ticketId, { status: newStatus });
      setMessage({ type: 'success', text: 'Ticket status updated successfully' });
      await loadData();
      if (selectedTicket?.id === ticketId) {
        const updatedTicket = tickets.find(t => t.id === ticketId);
        setSelectedTicket({ ...updatedTicket, status: newStatus });
      }
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update ticket status' });
    }
  };

  const handleUpdateTicketPriority = async (ticketId, newPriority) => {
    try {
      await base44.entities.SupportTicket.update(ticketId, { priority: newPriority });
      setMessage({ type: 'success', text: 'Priority updated successfully' });
      await loadData();
      if (selectedTicket?.id === ticketId) {
        const updatedTicket = tickets.find(t => t.id === ticketId);
        setSelectedTicket({ ...updatedTicket, priority: newPriority });
      }
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update priority' });
    }
  };

  const handleViewDetails = (ticket) => {
    setSelectedTicket(ticket);
    setAdminNotes(ticket.ai_suggested_resolution || '');
    setShowDetailsModal(true);
  };

  const handleSaveAdminNotes = async () => {
    try {
      await base44.entities.SupportTicket.update(selectedTicket.id, {
        ai_suggested_resolution: adminNotes
      });
      setMessage({ type: 'success', text: 'Notes saved successfully' });
      await loadData();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save notes' });
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      open: { color: 'bg-blue-500', icon: Clock, label: 'Open' },
      in_progress: { color: 'bg-amber-500', icon: TrendingUp, label: 'In Progress' },
      resolved: { color: 'bg-green-500', icon: CheckCircle, label: 'Resolved' },
      closed: { color: 'bg-gray-500', icon: CheckCircle, label: 'Closed' }
    };
    return configs[status] || configs.open;
  };

  const getPriorityConfig = (priority) => {
    const configs = {
      low: { color: 'bg-gray-400', label: 'Low' },
      medium: { color: 'bg-blue-500', label: 'Medium' },
      high: { color: 'bg-orange-500', label: 'High' },
      urgent: { color: 'bg-red-600', label: 'Urgent' }
    };
    return configs[priority] || configs.medium;
  };

  const getCategoryIcon = (category) => {
    const cat = categories.find(c => c.value === category);
    return cat ? cat.icon : Package;
  };

  const getCategoryColor = (category) => {
    const cat = categories.find(c => c.value === category);
    return cat ? cat.color : 'text-gray-500';
  };

  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    in_progress: tickets.filter(t => t.status === 'in_progress').length,
    resolved: tickets.filter(t => t.status === 'resolved').length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-soft-cloud flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-puretask-blue mx-auto mb-4" />
          <p className="text-gray-600 font-verdana">Loading support center...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-soft-cloud">
      <div className="bg-white border-b-4 border-blue-200 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 brand-gradient rounded-2xl flex items-center justify-center shadow-lg">
              <HelpCircle className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-fredoka font-bold text-graphite">Support Center</h1>
              <p className="text-lg text-gray-600 font-verdana">We're here to help you 24/7</p>
            </div>
          </div>

          {isAdmin && (
            <div className="grid grid-cols-4 gap-4 mt-6">
              <Card className="border-2 border-blue-200 shadow-md">
                <CardContent className="p-4 text-center">
                  <p className="text-3xl font-fredoka font-bold text-graphite">{stats.total}</p>
                  <p className="text-sm text-gray-600 font-verdana">Total Tickets</p>
                </CardContent>
              </Card>
              <Card className="border-2 border-blue-300 shadow-md">
                <CardContent className="p-4 text-center">
                  <p className="text-3xl font-fredoka font-bold text-puretask-blue">{stats.open}</p>
                  <p className="text-sm text-gray-600 font-verdana">Open</p>
                </CardContent>
              </Card>
              <Card className="border-2 border-amber-300 shadow-md">
                <CardContent className="p-4 text-center">
                  <p className="text-3xl font-fredoka font-bold text-amber-600">{stats.in_progress}</p>
                  <p className="text-sm text-gray-600 font-verdana">In Progress</p>
                </CardContent>
              </Card>
              <Card className="border-2 border-green-300 shadow-md">
                <CardContent className="p-4 text-center">
                  <p className="text-3xl font-fredoka font-bold text-fresh-mint">{stats.resolved}</p>
                  <p className="text-sm text-gray-600 font-verdana">Resolved</p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <AnimatePresence>
          {message.text && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6"
            >
              <Alert className={`border-2 rounded-2xl ${
                message.type === 'success' ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'
              }`}>
                {message.type === 'success' ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600" />
                )}
                <AlertDescription className={`font-verdana ${
                  message.type === 'success' ? 'text-green-800' : 'text-red-800'
                }`}>
                  {message.text}
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        <Tabs defaultValue="submit" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-2xl mx-auto gap-3">
            <TabsTrigger 
              value="submit" 
              className="rounded-full font-fredoka font-bold text-base py-3 transition-all shadow-sm data-[state=inactive]:text-gray-700 data-[state=inactive]:bg-white data-[state=active]:text-white border-2 data-[state=inactive]:border-gray-200"
            >
              <Send className="w-4 h-4 mr-2" />
              Submit Ticket
            </TabsTrigger>
            <TabsTrigger 
              value="tickets" 
              className="rounded-full font-fredoka font-bold text-base py-3 transition-all shadow-sm data-[state=inactive]:text-gray-700 data-[state=inactive]:bg-white data-[state=active]:text-white border-2 data-[state=inactive]:border-gray-200"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              My Tickets {tickets.length > 0 && `(${tickets.length})`}
            </TabsTrigger>
            <TabsTrigger 
              value="faq" 
              className="rounded-full font-fredoka font-bold text-base py-3 transition-all shadow-sm data-[state=inactive]:text-gray-700 data-[state=inactive]:bg-white data-[state=active]:text-white border-2 data-[state=inactive]:border-gray-200"
            >
              <Book className="w-4 h-4 mr-2" />
              FAQ
            </TabsTrigger>
          </TabsList>

          <style dangerouslySetInnerHTML={{__html: `
            [role="tablist"] {
              background: transparent !important;
              padding: 0 !important;
              border: none !important;
              box-shadow: none !important;
            }
            [role="tablist"] button[data-state="active"] {
              background: linear-gradient(135deg, #66B3FF 0%, #00D4FF 100%) !important;
              color: white !important;
              border-color: transparent !important;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
            }
            [role="tablist"] button[data-state="inactive"]:hover {
              background-color: #F9FAFB !important;
              border-color: #D1D5DB !important;
            }
          `}} />

          {/* SUBMIT TICKET TAB */}
          <TabsContent value="submit" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="border-0 shadow-xl rounded-2xl lg:col-span-2">
                <CardHeader className="rounded-t-2xl bg-gradient-to-r from-blue-500 to-cyan-500">
                  <CardTitle className="flex items-center gap-2 font-fredoka text-white text-xl">
                    <Send className="w-6 h-6" />
                    Submit a Support Ticket
                  </CardTitle>
                  <p className="text-blue-50 font-verdana text-sm">We typically respond within 24 hours</p>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <Label className="font-fredoka font-semibold text-graphite text-base mb-3 block">
                        What do you need help with? *
                      </Label>
                      <div className="grid grid-cols-2 gap-3">
                        {categories.map((cat) => {
                          const Icon = cat.icon;
                          return (
                            <button
                              key={cat.value}
                              type="button"
                              onClick={() => setFormData({ ...formData, category: cat.value })}
                              className={`p-4 rounded-xl border-2 transition-all text-left ${
                                formData.category === cat.value
                                  ? 'border-puretask-blue bg-blue-50 shadow-lg scale-105'
                                  : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                              }`}
                            >
                              <Icon className={`w-6 h-6 mb-2 ${formData.category === cat.value ? 'text-puretask-blue' : cat.color}`} />
                              <p className={`font-fredoka font-semibold ${formData.category === cat.value ? 'text-puretask-blue' : 'text-graphite'}`}>
                                {cat.label}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label className="font-fredoka font-semibold text-graphite">Priority</Label>
                        <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                          <SelectTrigger className="rounded-xl font-verdana border-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low - General question</SelectItem>
                            <SelectItem value="medium">Medium - Issue needs attention</SelectItem>
                            <SelectItem value="high">High - Urgent problem</SelectItem>
                            <SelectItem value="urgent">Urgent - Critical issue</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="font-fredoka font-semibold text-graphite">Booking ID (if applicable)</Label>
                        <Input
                          value={formData.booking_id}
                          onChange={(e) => setFormData({ ...formData, booking_id: e.target.value })}
                          placeholder="e.g., BK123456"
                          className="font-verdana border-2 rounded-xl"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="font-fredoka font-semibold text-graphite">Subject *</Label>
                      <Input
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        placeholder="Brief summary of your issue"
                        className="font-verdana border-2 rounded-xl"
                        required
                      />
                    </div>

                    <div>
                      <Label className="font-fredoka font-semibold text-graphite">Description *</Label>
                      <Textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Please provide as much detail as possible about your issue. Include booking ID, dates, cleaner names, etc."
                        rows={6}
                        className="rounded-xl font-verdana border-2"
                        required
                      />
                      <p className="text-xs text-gray-500 font-verdana mt-1">
                        Tip: More details help us resolve your issue faster
                      </p>
                    </div>

                    <Button
                      type="submit"
                      className="w-full text-lg py-6 rounded-xl font-fredoka font-bold shadow-xl hover:shadow-2xl transition-all border-2 border-transparent"
                      style={{ background: 'linear-gradient(135deg, #66B3FF 0%, #00D4FF 100%)', color: 'white' }}
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5 mr-2" />
                          Submit Support Ticket
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card className="border-0 shadow-xl rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50">
                  <CardContent className="p-6">
                    <h3 className="font-fredoka font-bold text-graphite text-xl mb-4">Need Immediate Help?</h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Mail className="w-6 h-6 text-puretask-blue mt-1" />
                        <div>
                          <p className="font-fredoka font-semibold text-graphite">Email Support</p>
                          <a href="mailto:support@puretask.com" className="text-puretask-blue font-verdana text-sm hover:underline">
                            support@puretask.com
                          </a>
                          <p className="text-xs text-gray-600 font-verdana mt-1">Response within 24 hours</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Phone className="w-6 h-6 text-fresh-mint mt-1" />
                        <div>
                          <p className="font-fredoka font-semibold text-graphite">Emergency Line</p>
                          <a href="tel:1-800-PURETASK" className="text-fresh-mint font-verdana text-sm hover:underline">
                            1-800-PURETASK
                          </a>
                          <p className="text-xs text-gray-600 font-verdana mt-1">Available 24/7</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <MessageSquare className="w-6 h-6 text-amber-500 mt-1" />
                        <div>
                          <p className="font-fredoka font-semibold text-graphite">Live Chat</p>
                          <p className="text-amber-600 font-verdana text-sm">Coming Soon</p>
                          <p className="text-xs text-gray-600 font-verdana mt-1">Instant support via chat</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-xl rounded-2xl">
                  <CardContent className="p-6">
                    <h3 className="font-fredoka font-bold text-graphite text-lg mb-3">Quick Links</h3>
                    <div className="space-y-2">
                      <a href="#" className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                        <span className="font-verdana text-gray-700">Cancellation Policy</span>
                        <ExternalLink className="w-4 h-4 text-gray-400" />
                      </a>
                      <a href="#" className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                        <span className="font-verdana text-gray-700">Damage & Claims</span>
                        <ExternalLink className="w-4 h-4 text-gray-400" />
                      </a>
                      <a href="#" className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                        <span className="font-verdana text-gray-700">How It Works</span>
                        <ExternalLink className="w-4 h-4 text-gray-400" />
                      </a>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* MY TICKETS TAB */}
          <TabsContent value="tickets" className="space-y-6">
            <Card className="border-0 shadow-lg rounded-2xl">
              <CardContent className="p-6">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      placeholder="Search tickets..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 font-verdana border-2 rounded-xl"
                    />
                  </div>
                  
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="rounded-xl font-verdana border-2">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="rounded-xl font-verdana border-2">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              {filteredTickets.length > 0 ? (
                filteredTickets.map((ticket) => {
                  const statusConfig = getStatusConfig(ticket.status);
                  const priorityConfig = getPriorityConfig(ticket.priority);
                  const CategoryIcon = getCategoryIcon(ticket.category);
                  const categoryColor = getCategoryColor(ticket.category);
                  const StatusIcon = statusConfig.icon;

                  return (
                    <motion.div
                      key={ticket.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className="border-0 shadow-lg rounded-2xl hover:shadow-xl transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-start gap-4 flex-1">
                              <div className={`p-3 rounded-xl bg-gray-50 ${categoryColor}`}>
                                <CategoryIcon className="w-6 h-6" />
                              </div>
                              <div className="flex-1">
                                <h3 className="font-fredoka font-bold text-graphite text-lg mb-1">
                                  {ticket.subject}
                                </h3>
                                <p className="text-gray-600 font-verdana mb-3 line-clamp-2">
                                  {ticket.description}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  <Badge className={`${statusConfig.color} text-white rounded-full font-fredoka`}>
                                    <StatusIcon className="w-3 h-3 mr-1" />
                                    {statusConfig.label}
                                  </Badge>
                                  <Badge className={`${priorityConfig.color} text-white rounded-full font-fredoka`}>
                                    {priorityConfig.label}
                                  </Badge>
                                  <Badge variant="outline" className="rounded-full font-fredoka">
                                    {categories.find(c => c.value === ticket.category)?.label || ticket.category}
                                  </Badge>
                                  {ticket.booking_id && (
                                    <Badge variant="outline" className="rounded-full font-fredoka">
                                      📋 {ticket.booking_id}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="text-right ml-4">
                              <p className="text-sm text-gray-500 font-verdana">
                                {new Date(ticket.created_date).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </p>
                              <p className="text-xs text-gray-400 font-verdana">
                                {new Date(ticket.created_date).toLocaleTimeString('en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                              {isAdmin && (
                                <p className="text-xs text-puretask-blue font-verdana mt-1">
                                  {ticket.user_email}
                                </p>
                              )}
                            </div>
                          </div>

                          {isAdmin && (
                            <div className="flex gap-2 pt-4 border-t-2 border-gray-100">
                              <Select
                                value={ticket.status}
                                onValueChange={(value) => handleUpdateTicketStatus(ticket.id, value)}
                              >
                                <SelectTrigger className="w-40 rounded-xl font-verdana text-sm border-2">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="open">Open</SelectItem>
                                  <SelectItem value="in_progress">In Progress</SelectItem>
                                  <SelectItem value="resolved">Resolved</SelectItem>
                                  <SelectItem value="closed">Closed</SelectItem>
                                </SelectContent>
                              </Select>

                              <Select
                                value={ticket.priority}
                                onValueChange={(value) => handleUpdateTicketPriority(ticket.id, value)}
                              >
                                <SelectTrigger className="w-32 rounded-xl font-verdana text-sm border-2">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="low">Low</SelectItem>
                                  <SelectItem value="medium">Medium</SelectItem>
                                  <SelectItem value="high">High</SelectItem>
                                  <SelectItem value="urgent">Urgent</SelectItem>
                                </SelectContent>
                              </Select>

                              <Button
                                size="sm"
                                variant="outline"
                                className="rounded-xl font-fredoka"
                                onClick={() => handleViewDetails(ticket)}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })
              ) : (
                <Card className="border-0 shadow-xl rounded-2xl">
                  <CardContent className="p-12 text-center">
                    <MessageSquare className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                    <h3 className="font-fredoka font-bold text-graphite text-xl mb-2">
                      {searchQuery || statusFilter !== 'all' || categoryFilter !== 'all'
                        ? 'No tickets found'
                        : 'No support tickets yet'}
                    </h3>
                    <p className="text-gray-500 font-verdana mb-6">
                      {searchQuery || statusFilter !== 'all' || categoryFilter !== 'all'
                        ? 'Try adjusting your filters'
                        : 'When you submit a ticket, it will appear here'}
                    </p>
                    {!searchQuery && statusFilter === 'all' && categoryFilter === 'all' && (
                      <Button
                        onClick={() => document.querySelector('[value="submit"]').click()}
                        className="brand-gradient text-white rounded-full font-fredoka font-semibold"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Submit Your First Ticket
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* FAQ TAB */}
          <TabsContent value="faq" className="space-y-6">
            <Card className="border-0 shadow-xl rounded-2xl">
              <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-t-2xl">
                <CardTitle className="font-fredoka text-graphite text-2xl">
                  <Book className="w-6 h-6 inline mr-2 text-amber-600" />
                  Frequently Asked Questions
                </CardTitle>
                <p className="text-gray-600 font-verdana text-sm">
                  Find quick answers to common questions
                </p>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {faqs.map((faqCategory, catIdx) => {
                    const CategoryIcon = faqCategory.icon;
                    const colorClasses = {
                      blue: 'text-blue-500 bg-blue-50 border-blue-200',
                      green: 'text-green-500 bg-green-50 border-green-200',
                      purple: 'text-purple-500 bg-purple-50 border-purple-200',
                      cyan: 'text-cyan-500 bg-cyan-50 border-cyan-200'
                    };
                    
                    return (
                      <div key={catIdx}>
                        <div className={`flex items-center gap-3 p-4 rounded-xl border-2 mb-4 ${colorClasses[faqCategory.color]}`}>
                          <CategoryIcon className={`w-6 h-6 ${colorClasses[faqCategory.color].split(' ')[0]}`} />
                          <h3 className="font-fredoka font-bold text-graphite text-lg">
                            {faqCategory.category}
                          </h3>
                        </div>
                        
                        <div className="space-y-3 ml-4">
                          {faqCategory.questions.map((item, idx) => {
                            const isExpanded = expandedFAQ === `${catIdx}-${idx}`;
                            return (
                              <Card
                                key={idx}
                                className="border-2 border-gray-200 rounded-xl overflow-hidden hover:border-gray-300 transition-colors"
                              >
                                <button
                                  onClick={() => setExpandedFAQ(isExpanded ? null : `${catIdx}-${idx}`)}
                                  className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                                >
                                  <span className="font-fredoka font-semibold text-graphite pr-4">
                                    {item.q}
                                  </span>
                                  {isExpanded ? (
                                    <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                  ) : (
                                    <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                  )}
                                </button>
                                <AnimatePresence>
                                  {isExpanded && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: 'auto', opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      transition={{ duration: 0.2 }}
                                    >
                                      <div className="px-4 pb-4 text-gray-600 font-verdana leading-relaxed border-t-2 border-gray-100 pt-4">
                                        {item.a}
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </Card>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border-2 border-blue-200 text-center">
                  <h3 className="font-fredoka font-bold text-graphite text-xl mb-2">
                    Still Have Questions?
                  </h3>
                  <p className="text-gray-600 font-verdana mb-4">
                    Can't find what you're looking for? We're here to help!
                  </p>
                  <Button
                    onClick={() => document.querySelector('[value="submit"]').click()}
                    className="brand-gradient text-white rounded-full font-fredoka font-semibold"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Contact Support
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Ticket Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-fredoka text-2xl text-graphite flex items-center gap-2">
              <Eye className="w-6 h-6 text-puretask-blue" />
              Ticket Details
            </DialogTitle>
            <DialogDescription className="font-verdana">
              View and manage support ticket information
            </DialogDescription>
          </DialogHeader>

          {selectedTicket && (
            <div className="space-y-6 py-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="font-fredoka font-semibold text-graphite block mb-2">Subject</Label>
                  <p className="text-gray-700 font-verdana p-3 bg-gray-50 rounded-xl border-2 border-gray-200">
                    {selectedTicket.subject}
                  </p>
                </div>
                <div>
                  <Label className="font-fredoka font-semibold text-graphite block mb-2">Category</Label>
                  <p className="text-gray-700 font-verdana p-3 bg-gray-50 rounded-xl border-2 border-gray-200 capitalize">
                    {categories.find(c => c.value === selectedTicket.category)?.label || selectedTicket.category}
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label className="font-fredoka font-semibold text-graphite block mb-2">Status</Label>
                  <Badge className={`${getStatusConfig(selectedTicket.status).color} text-white rounded-full font-fredoka text-sm px-4 py-2`}>
                    {getStatusConfig(selectedTicket.status).label}
                  </Badge>
                </div>
                <div>
                  <Label className="font-fredoka font-semibold text-graphite block mb-2">Priority</Label>
                  <Badge className={`${getPriorityConfig(selectedTicket.priority).color} text-white rounded-full font-fredoka text-sm px-4 py-2`}>
                    {getPriorityConfig(selectedTicket.priority).label}
                  </Badge>
                </div>
                <div>
                  <Label className="font-fredoka font-semibold text-graphite block mb-2">Created</Label>
                  <p className="text-gray-700 font-verdana text-sm">
                    {new Date(selectedTicket.created_date).toLocaleString()}
                  </p>
                </div>
              </div>

              {selectedTicket.booking_id && (
                <div>
                  <Label className="font-fredoka font-semibold text-graphite block mb-2">Booking ID</Label>
                  <p className="text-gray-700 font-verdana p-3 bg-blue-50 rounded-xl border-2 border-blue-200">
                    {selectedTicket.booking_id}
                  </p>
                </div>
              )}

              <div>
                <Label className="font-fredoka font-semibold text-graphite block mb-2">User Email</Label>
                <p className="text-gray-700 font-verdana p-3 bg-gray-50 rounded-xl border-2 border-gray-200">
                  {selectedTicket.user_email}
                </p>
              </div>

              <div>
                <Label className="font-fredoka font-semibold text-graphite block mb-2">Description</Label>
                <div className="text-gray-700 font-verdana p-4 bg-gray-50 rounded-xl border-2 border-gray-200 whitespace-pre-wrap">
                  {selectedTicket.description}
                </div>
              </div>

              {isAdmin && (
                <>
                  <div className="border-t-2 border-gray-200 pt-6">
                    <Label className="font-fredoka font-semibold text-graphite block mb-2">Admin Notes / Resolution</Label>
                    <Textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Add notes about this ticket or resolution details..."
                      rows={4}
                      className="rounded-xl font-verdana border-2"
                    />
                    <Button
                      onClick={handleSaveAdminNotes}
                      className="mt-3 brand-gradient text-white rounded-xl font-fredoka font-semibold"
                    >
                      Save Notes
                    </Button>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex-1">
                      <Label className="font-fredoka font-semibold text-graphite block mb-2">Update Status</Label>
                      <Select
                        value={selectedTicket.status}
                        onValueChange={(value) => handleUpdateTicketStatus(selectedTicket.id, value)}
                      >
                        <SelectTrigger className="rounded-xl font-verdana border-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex-1">
                      <Label className="font-fredoka font-semibold text-graphite block mb-2">Update Priority</Label>
                      <Select
                        value={selectedTicket.priority}
                        onValueChange={(value) => handleUpdateTicketPriority(selectedTicket.id, value)}
                      >
                        <SelectTrigger className="rounded-xl font-verdana border-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          <div className="flex justify-end pt-4 border-t-2 border-gray-200">
            <Button
              onClick={() => setShowDetailsModal(false)}
              variant="outline"
              className="rounded-xl font-fredoka font-semibold"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}