import React, { useState, useEffect } from 'react';
import { handleError } from '@/lib/errorHandler';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle, Clock, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SystemAlerts() {
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);
  const [filter, setFilter] = useState('active'); // active, resolved, all

  useEffect(() => {
    loadAlerts();
  }, [filter]);

  const loadAlerts = async () => {
    setLoading(true);
    try {
      let alertsList;
      if (filter === 'active') {
        alertsList = await base44.entities.SystemAlert.filter({ is_resolved: false });
      } else if (filter === 'resolved') {
        alertsList = await base44.entities.SystemAlert.filter({ is_resolved: true });
      } else {
        alertsList = await base44.entities.SystemAlert.list('-created_date', 50);
      }
      
      setAlerts(alertsList);
      setLoading(false);
    } catch (error) {
      handleError(error, { userMessage: 'Error loading alerts:', showToast: false });
      setLoading(false);
    }
  };

  const handleResolve = async (alertId) => {
    try {
      await base44.entities.SystemAlert.update(alertId, {
        is_resolved: true,
        resolved_at: new Date().toISOString()
      });
      loadAlerts();
    } catch (error) {
      handleError(error, { userMessage: 'Error resolving alert:', showToast: false });
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-500';
      case 'high': return 'bg-amber-100 text-amber-800 border-amber-500';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-500';
      default: return 'bg-blue-100 text-blue-800 border-blue-500';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return <AlertTriangle className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-soft-cloud p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-fredoka font-bold text-graphite">System Alerts</h1>
            <p className="text-gray-600 font-verdana mt-2">Anomaly detection & operational alerts</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={filter === 'active' ? 'default' : 'outline'}
              onClick={() => setFilter('active')}
              className="font-fredoka"
            >
              Active ({alerts.filter(a => !a.is_resolved).length})
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

        {/* Alerts List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-puretask-blue" />
          </div>
        ) : alerts.length > 0 ? (
          <div className="space-y-4">
            {alerts.map((alert, idx) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className={`border-2 ${alert.is_resolved ? 'bg-gray-50' : getSeverityColor(alert.severity)}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        {getSeverityIcon(alert.severity)}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-fredoka font-bold text-lg text-graphite">
                              {alert.type.replace(/_/g, ' ').toUpperCase()}
                            </h3>
                            <Badge className={`font-fredoka text-xs ${getSeverityColor(alert.severity)}`}>
                              {alert.severity}
                            </Badge>
                            {alert.is_resolved && (
                              <Badge className="bg-green-100 text-green-800 font-fredoka text-xs">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Resolved
                              </Badge>
                            )}
                          </div>
                          <p className="font-verdana text-gray-700 mb-3">{alert.message}</p>
                          {alert.metadata && (
                            <div className="bg-white/50 rounded-lg p-3 text-xs font-verdana text-gray-600">
                              <div className="grid grid-cols-2 gap-2">
                                {Object.entries(alert.metadata).map(([key, value]) => (
                                  <div key={key}>
                                    <span className="font-semibold">{key}:</span> {JSON.stringify(value)}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          <p className="text-xs text-gray-500 font-verdana mt-2">
                            Created: {new Date(alert.created_date).toLocaleString()}
                            {alert.resolved_at && ` • Resolved: ${new Date(alert.resolved_at).toLocaleString()}`}
                          </p>
                        </div>
                      </div>
                      {!alert.is_resolved && (
                        <Button
                          onClick={() => handleResolve(alert.id)}
                          className="bg-green-600 hover:bg-green-700 text-white font-fredoka"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Resolve
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <p className="text-xl font-fredoka font-bold text-graphite">All Clear!</p>
              <p className="text-gray-600 font-verdana mt-2">No {filter} alerts at the moment</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}