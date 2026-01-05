import React, { useState, useEffect } from 'react';
import { handleError } from '@/lib/errorHandler';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AdminPermissions } from '@/components/admin/AdminPermissions';
import { FileText, Loader2, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminAuditLog() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  useEffect(() => {
    checkAdminAndLoad();
  }, []);

  const checkAdminAndLoad = async () => {
    try {
      const currentUser = await base44.auth.me();
      const isAdmin = await AdminPermissions.isAdmin(currentUser);
      
      if (!isAdmin) {
        navigate(createPageUrl('Home'));
        return;
      }
      
      setUser(currentUser);
      await loadLogs();
    } catch (error) {
      handleError(error, { userMessage: 'Error:', showToast: false });
      navigate(createPageUrl('Home'));
    }
  };

  const loadLogs = async () => {
    setLoading(true);
    try {
      const allLogs = await base44.entities.AdminAuditLog.list('-created_date', 200);
      setLogs(allLogs);
      setLoading(false);
    } catch (error) {
      handleError(error, { userMessage: 'Error loading logs:', showToast: false });
      setLoading(false);
    }
  };

  const getActionColor = (actionType) => {
    if (actionType.includes('BLOCK') || actionType.includes('CANCEL')) {
      return 'bg-red-100 text-red-800';
    }
    if (actionType.includes('REFUND') || actionType.includes('ADJUST')) {
      return 'bg-amber-100 text-amber-800';
    }
    if (actionType.includes('APPROVE') || actionType.includes('RESOLVE')) {
      return 'bg-green-100 text-green-800';
    }
    return 'bg-blue-100 text-blue-800';
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = !searchTerm || 
      log.admin_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.target_id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAction = actionFilter === 'all' || log.action_type === actionFilter;
    
    return matchesSearch && matchesAction;
  });

  const actionTypes = [...new Set(logs.map(l => l.action_type))];

  if (loading) {
    return (
      <div className="min-h-screen bg-soft-cloud flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-puretask-blue" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-soft-cloud p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-fredoka font-bold text-graphite">Audit Log</h1>
          <p className="text-gray-600 font-verdana mt-2">Complete history of all admin actions</p>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-4 flex-wrap">
              <div className="flex-1 min-w-[250px]">
                <Input
                  placeholder="Search by admin email or target ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="font-verdana"
                />
              </div>
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="p-2 border rounded-lg font-verdana"
              >
                <option value="all">All Actions</option>
                {actionTypes.map(type => (
                  <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Logs List */}
        <div className="space-y-3">
          {filteredLogs.map((log, idx) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.02 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Shield className="w-5 h-5 text-puretask-blue mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge className={`font-fredoka ${getActionColor(log.action_type)}`}>
                          {log.action_type.replace(/_/g, ' ')}
                        </Badge>
                        <p className="text-sm text-gray-600 font-verdana">
                          by {log.admin_email}
                        </p>
                      </div>
                      <div className="grid md:grid-cols-2 gap-3 text-sm font-verdana">
                        <p><span className="text-gray-500">Target:</span> {log.target_type} - {log.target_id}</p>
                        <p><span className="text-gray-500">Time:</span> {new Date(log.created_date).toLocaleString()}</p>
                      </div>
                      {log.metadata && Object.keys(log.metadata).length > 0 && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-500 font-verdana mb-1">Metadata:</p>
                          <pre className="text-xs font-verdana">
                            {JSON.stringify(log.metadata, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredLogs.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-xl font-fredoka font-bold text-graphite">No audit logs found</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}