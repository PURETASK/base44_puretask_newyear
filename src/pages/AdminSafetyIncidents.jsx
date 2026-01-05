import React, { useState, useEffect } from 'react';
import { handleError } from '@/lib/errorHandler';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, Shield, CheckCircle, Loader2, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminSafetyIncidents() {
  const [loading, setLoading] = useState(true);
  const [incidents, setIncidents] = useState([]);
  const [filter, setFilter] = useState('open');
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [actionNote, setActionNote] = useState('');

  useEffect(() => {
    loadIncidents();
  }, [filter]);

  const loadIncidents = async () => {
    setLoading(true);
    try {
      let incidentList;
      if (filter === 'all') {
        incidentList = await base44.entities.SafetyIncident.list('-created_date', 100);
      } else {
        incidentList = await base44.entities.SafetyIncident.filter({ status: filter });
      }
      
      setIncidents(incidentList);
      setLoading(false);
    } catch (error) {
      handleError(error, { userMessage: 'Error loading incidents:', showToast: false });
      setLoading(false);
    }
  };

  const handleResolve = async (incidentId) => {
    try {
      const incident = incidents.find(i => i.id === incidentId);
      const actions = [...(incident.actions_taken || []), actionNote || 'Resolved by admin'];
      
      await base44.entities.SafetyIncident.update(incidentId, {
        status: 'resolved',
        actions_taken: actions
      });
      
      setActionNote('');
      setSelectedIncident(null);
      loadIncidents();
    } catch (error) {
      handleError(error, { userMessage: 'Error resolving incident:', showToast: false });
    }
  };

  const handleEscalate = async (incidentId) => {
    try {
      const incident = incidents.find(i => i.id === incidentId);
      
      await base44.entities.SafetyIncident.update(incidentId, {
        status: 'escalated',
        escalation_level: Math.min(3, (incident.escalation_level || 1) + 1),
        requires_escalation: true
      });
      
      // Send email notification
      await base44.integrations.Core.SendEmail({
        to: 'safety@puretask.com',
        subject: `🚨 Safety Incident Escalated - Level ${incident.escalation_level + 1}`,
        body: `Incident ${incidentId} has been escalated.\n\nCategory: ${incident.category}\nSeverity: ${incident.severity}\nReported by: ${incident.reported_by}\n\nPlease review immediately.`
      });
      
      loadIncidents();
    } catch (error) {
      handleError(error, { userMessage: 'Error escalating incident:', showToast: false });
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-600 text-white';
      case 'high': return 'bg-amber-600 text-white';
      case 'medium': return 'bg-yellow-600 text-white';
      default: return 'bg-blue-600 text-white';
    }
  };

  return (
    <div className="min-h-screen bg-soft-cloud p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-fredoka font-bold text-graphite">Safety Incidents</h1>
            <p className="text-gray-600 font-verdana mt-2">Monitor and resolve safety concerns</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={filter === 'open' ? 'default' : 'outline'}
              onClick={() => setFilter('open')}
              className="font-fredoka"
            >
              Open ({incidents.filter(i => i.status === 'open').length})
            </Button>
            <Button
              variant={filter === 'investigating' ? 'default' : 'outline'}
              onClick={() => setFilter('investigating')}
              className="font-fredoka"
            >
              Investigating
            </Button>
            <Button
              variant={filter === 'resolved' ? 'default' : 'outline'}
              onClick={() => setFilter('resolved')}
              className="font-fredoka"
            >
              Resolved
            </Button>
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
              className="font-fredoka"
            >
              All
            </Button>
          </div>
        </div>

        {/* Incidents List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-puretask-blue" />
          </div>
        ) : incidents.length > 0 ? (
          <div className="space-y-4">
            {incidents.map((incident, idx) => (
              <motion.div
                key={incident.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="border-2 border-red-200">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <AlertTriangle className="w-6 h-6 text-red-600" />
                          <h3 className="font-fredoka font-bold text-xl text-graphite">
                            {incident.category.replace(/_/g, ' ').toUpperCase()}
                          </h3>
                          <Badge className={`font-fredoka ${getSeverityColor(incident.severity)}`}>
                            {incident.severity}
                          </Badge>
                          {incident.injuries_reported && (
                            <Badge className="bg-red-100 text-red-800 font-fredoka">
                              Injuries Reported
                            </Badge>
                          )}
                        </div>
                        
                        <div className="grid md:grid-cols-3 gap-4 mb-4 bg-gray-50 p-4 rounded-lg">
                          <div>
                            <p className="text-xs text-gray-500 font-verdana">Booking ID</p>
                            <p className="font-verdana text-sm font-semibold">{incident.booking_id}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 font-verdana">Client</p>
                            <p className="font-verdana text-sm">{incident.client_email}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 font-verdana">Cleaner</p>
                            <p className="font-verdana text-sm">{incident.cleaner_email}</p>
                          </div>
                        </div>
                        
                        <p className="font-verdana text-gray-700 mb-3">{incident.description}</p>
                        
                        {incident.evidence_urls && incident.evidence_urls.length > 0 && (
                          <div className="mb-3">
                            <p className="text-xs text-gray-500 font-verdana mb-2">Evidence:</p>
                            <div className="flex gap-2">
                              {incident.evidence_urls.map((url, i) => (
                                <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                                  <Badge variant="outline" className="font-verdana">
                                    <FileText className="w-3 h-3 mr-1" />
                                    Evidence {i + 1}
                                  </Badge>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <p className="text-xs text-gray-500 font-verdana">
                          Reported by: {incident.reported_by} • {new Date(incident.created_date).toLocaleString()}
                        </p>
                      </div>
                      
                      {incident.status === 'open' && (
                        <div className="flex flex-col gap-2">
                          <Button
                            onClick={() => setSelectedIncident(incident.id)}
                            className="bg-green-600 hover:bg-green-700 font-fredoka"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Resolve
                          </Button>
                          <Button
                            onClick={() => handleEscalate(incident.id)}
                            variant="outline"
                            className="font-fredoka"
                          >
                            <AlertTriangle className="w-4 h-4 mr-2" />
                            Escalate
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    {/* Resolution Form */}
                    {selectedIncident === incident.id && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <Textarea
                          placeholder="Add resolution notes..."
                          value={actionNote}
                          onChange={(e) => setActionNote(e.target.value)}
                          className="mb-3 font-verdana"
                        />
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleResolve(incident.id)}
                            className="bg-green-600 hover:bg-green-700 font-fredoka"
                          >
                            Confirm Resolution
                          </Button>
                          <Button
                            onClick={() => {
                              setSelectedIncident(null);
                              setActionNote('');
                            }}
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
              <Shield className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <p className="text-xl font-fredoka font-bold text-graphite">No {filter} incidents</p>
              <p className="text-gray-600 font-verdana mt-2">Platform is safe!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}