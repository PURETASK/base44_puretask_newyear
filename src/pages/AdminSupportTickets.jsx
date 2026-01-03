import React, { useState, useEffect } from 'react';
import { handleError } from '@/lib/errorHandler';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { AdminPermissions } from '@/components/admin/AdminPermissions';
import { HelpCircle, Loader2, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminSupportTickets() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState([]);
  const [filter, setFilter] = useState('open');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [resolutionNote, setResolutionNote] = useState('');

  useEffect(() => {
    checkAdminAndLoad();
  }, []);

  useEffect(() => {
    if (user) loadTickets();
  }, [filter]);

  const checkAdminAndLoad = async () => {
    try {
      const currentUser = await base44.auth.me();
      const isAdmin = await AdminPermissions.isAdmin(currentUser);
      
      if (!isAdmin) {
        navigate(createPageUrl('Home'));
        return;
      }
      
      setUser(currentUser);
    } catch (error) {
      handleError(error, { userMessage: 'Error:', showToast: false });
      navigate(createPageUrl('Home'));
    }
  };

  const loadTickets = async () => {
    setLoading(true);
    try {
      let ticketList;
      if (filter === 'all') {
        ticketList = await base44.entities.SupportTicket.list('-created_date', 100);
      } else {
        ticketList = await base44.entities.SupportTicket.filter({ status: filter });
      }
      
      setTickets(ticketList);
      setLoading(false);
    } catch (error) {
      handleError(error, { userMessage: 'Error loading tickets:', showToast: false });
      setLoading(false);
    }
  };

  const handleResolve = async (ticketId) => {
    try {
      const notes = [...(selectedTicket.internal_notes || []), resolutionNote];
      
      await base44.entities.SupportTicket.update(ticketId, {
        status: 'resolved',
        internal_notes: notes
      });

      setResolutionNote('');
      setSelectedTicket(null);
      loadTickets();
    } catch (error) {
      handleError(error, { userMessage: 'Error resolving ticket:', showToast: false });
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      urgent: 'bg-red-600 text-white',
      high: 'bg-amber-600 text-white',
      medium: 'bg-yellow-600 text-white',
      low: 'bg-blue-600 text-white'
    };
    return colors[priority] || 'bg-gray-600 text-white';
  };

  return (
    <div className="min-h-screen bg-soft-cloud p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-fredoka font-bold text-graphite">Support Tickets</h1>
            <p className="text-gray-600 font-verdana mt-2">Manage customer support requests</p>
          </div>
          <div className="flex gap-2">
            {['open', 'in_progress', 'resolved', 'all'].map(status => (
              <Button
                key={status}
                variant={filter === status ? 'default' : 'outline'}
                onClick={() => setFilter(status)}
                className="font-fredoka capitalize"
              >
                {status.replace('_', ' ')}
              </Button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-puretask-blue" />
          </div>
        ) : tickets.length > 0 ? (
          <div className="space-y-3">
            {tickets.map((ticket, idx) => (
              <motion.div
                key={ticket.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.02 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-fredoka font-bold text-lg text-graphite">
                            {ticket.subject}
                          </h3>
                          <Badge className={getPriorityColor(ticket.priority)}>
                            {ticket.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-700 font-verdana mb-3">{ticket.description}</p>
                        <div className="flex gap-4 text-xs text-gray-500 font-verdana">
                          <span>Type: {ticket.type}</span>
                          {ticket.client_email && <span>Client: {ticket.client_email}</span>}
                          {ticket.assigned_to && <span>Assigned to: {ticket.assigned_to}</span>}
                        </div>
                      </div>
                      {ticket.status === 'open' && (
                        <Button
                          onClick={() => setSelectedTicket(ticket)}
                          className="bg-green-600 hover:bg-green-700 font-fredoka"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Resolve
                        </Button>
                      )}
                    </div>

                    {selectedTicket?.id === ticket.id && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <Textarea
                          placeholder="Add resolution notes..."
                          value={resolutionNote}
                          onChange={(e) => setResolutionNote(e.target.value)}
                          className="mb-3 font-verdana"
                        />
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleResolve(ticket.id)}
                            className="bg-green-600 hover:bg-green-700 font-fredoka"
                          >
                            Confirm Resolution
                          </Button>
                          <Button
                            onClick={() => setSelectedTicket(null)}
                            variant="outline"
                            className="font-fredoka"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <HelpCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-xl font-fredoka font-bold text-graphite">No {filter} tickets</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}