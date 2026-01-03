
import React, { useState, useEffect } from 'react';
import { handleError } from '@/lib/errorHandler';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Mail, Plus, Edit2, Trash2, Eye, Send, Copy, Check,
  ArrowLeft, Home, Loader2, Code, Zap, MessageSquare
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminEmailTemplates() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [previewing, setPreviewing] = useState(null);
  const [testDialog, setTestDialog] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [message, setMessage] = useState('');

  const [formData, setFormData] = useState({
    template_id: '',
    category: 'client',
    subject: '',
    html_body: '',
    sms_body: '',
    push_title: '',
    push_body: '',
    deep_link: '',
    variables: [],
    send_email: true,
    send_sms: false,
    send_push: false,
    is_active: true
  });

  const [testData, setTestData] = useState({
    recipient_email: '',
    test_variables: '{}'
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const user = await base44.auth.me();
      if (user.role !== 'admin') {
        navigate(createPageUrl('Home'));
        return;
      }
      loadTemplates();
    } catch (error) {
      handleError(error, { userMessage: 'Auth error:', showToast: false });
      navigate(createPageUrl('Home'));
    }
  };

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const allTemplates = await base44.entities.EmailTemplate.list('-created_date');
      setTemplates(allTemplates);
    } catch (error) {
      handleError(error, { userMessage: 'Error loading templates:', showToast: false });
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await base44.entities.EmailTemplate.update(editing.id, formData);
        setMessage('Template updated successfully!');
      } else {
        await base44.entities.EmailTemplate.create(formData);
        setMessage('Template created successfully!');
      }
      resetForm();
      loadTemplates();
    } catch (error) {
      handleError(error, { userMessage: 'Error saving template:', showToast: false });
      setMessage('Failed to save template');
    }
  };

  const handleEdit = (template) => {
    setEditing(template);
    setFormData({
      template_id: template.template_id,
      category: template.category,
      subject: template.subject,
      html_body: template.html_body,
      sms_body: template.sms_body || '',
      push_title: template.push_title || '',
      push_body: template.push_body || '',
      deep_link: template.deep_link || '',
      variables: template.variables || [],
      send_email: template.send_email,
      send_sms: template.send_sms,
      send_push: template.send_push,
      is_active: template.is_active
    });
  };

  const handleDelete = async (template) => {
    if (!confirm(`Delete template "${template.template_id}"?`)) return;
    
    try {
      await base44.entities.EmailTemplate.update(template.id, { is_active: false });
      setMessage('Template deactivated');
      loadTemplates();
    } catch (error) {
      handleError(error, { userMessage: 'Error deleting template:', showToast: false });
    }
  };

  const handleTestSend = async () => {
    try {
      const template = testDialog;
      let vars = {};
      try {
        vars = JSON.parse(testData.test_variables);
      } catch {
        alert('Invalid JSON for test variables');
        return;
      }

      // Replace variables in subject and body
      let subject = template.subject;
      let body = template.html_body;
      
      Object.keys(vars).forEach(key => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        subject = subject.replace(regex, vars[key]);
        body = body.replace(regex, vars[key]);
      });

      // Send test email
      await base44.integrations.Core.SendEmail({
        to: testData.recipient_email,
        subject: subject,
        body: body
      });

      // Log it
      await base44.entities.MessageDeliveryLog.create({
        delivery_id: `test_${Date.now()}`,
        event_name: 'test_email',
        channel: 'email',
        status: 'sent',
        template_id: template.template_id,
        recipient_email: testData.recipient_email,
        subject: subject,
        body: body,
        metadata: { test: true, variables: vars },
        sent_at: new Date().toISOString(),
        can_retry: false
      });

      alert('Test email sent successfully!');
      setTestDialog(null);
    } catch (error) {
      handleError(error, { userMessage: 'Error sending test:', showToast: false });
      alert('Failed to send test email');
    }
  };

  const resetForm = () => {
    setEditing(null);
    setFormData({
      template_id: '',
      category: 'client',
      subject: '',
      html_body: '',
      sms_body: '',
      push_title: '',
      push_body: '',
      deep_link: '',
      variables: [],
      send_email: true,
      send_sms: false,
      send_push: false,
      is_active: true
    });
  };

  const copyTemplateId = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const addVariable = () => {
    const varName = prompt('Enter variable name (e.g., first_name):');
    if (varName && !formData.variables.includes(varName)) {
      setFormData({
        ...formData,
        variables: [...formData.variables, varName]
      });
    }
  };

  const removeVariable = (varName) => {
    setFormData({
      ...formData,
      variables: formData.variables.filter(v => v !== varName)
    });
  };

  const categoryColors = {
    client: 'bg-blue-100 text-blue-800',
    cleaner: 'bg-emerald-100 text-emerald-800',
    marketing: 'bg-purple-100 text-purple-800',
    system: 'bg-slate-100 text-slate-800'
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#66B3FF] to-white p-10 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#66B3FF] to-white p-6 lg:p-10">
      <div className="max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Button variant="outline" size="sm" onClick={() => navigate(createPageUrl('AdminDashboard'))} className="bg-white hover:bg-gray-50 rounded-full font-fredoka">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Admin Dashboard
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate(createPageUrl('AdminMessages'))} className="bg-white hover:bg-gray-50 rounded-full font-fredoka">
              <MessageSquare className="w-4 h-4 mr-2" />
              Message Logs
            </Button>
          </div>

          <h1 className="text-4xl font-fredoka font-bold text-white mb-2 flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
              <Mail className="w-7 h-7 text-white" />
            </div>
            Email Template Manager
          </h1>
          <p className="text-lg text-white font-verdana" style={{ opacity: 0.9 }}>Manage all notification templates (Email, SMS, Push)</p>
        </div>

        {message && (
          <Alert className="mb-6">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Form */}
          <Card className="lg:col-span-1 border-0 shadow-lg">
            <CardHeader>
              <CardTitle>{editing ? 'Edit Template' : 'Create New Template'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Template ID *</Label>
                  <Input
                    value={formData.template_id}
                    onChange={(e) => setFormData({...formData, template_id: e.target.value})}
                    placeholder="email.client.welcome"
                    required
                    disabled={!!editing}
                  />
                  <p className="text-xs text-slate-500 mt-1">Use dot notation: email.category.name</p>
                </div>

                <div>
                  <Label>Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="client">Client</SelectItem>
                      <SelectItem value="cleaner">Cleaner</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Subject Line *</Label>
                  <Input
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    placeholder="Welcome to PureTask ✨"
                    required
                  />
                </div>

                <div>
                  <Label>HTML Body *</Label>
                  <Textarea
                    value={formData.html_body}
                    onChange={(e) => setFormData({...formData, html_body: e.target.value})}
                    rows={8}
                    placeholder="<h2>Hi {{first_name}},</h2>..."
                    required
                    className="font-mono text-xs"
                  />
                </div>

                <div>
                  <Label>SMS Body (optional)</Label>
                  <Textarea
                    value={formData.sms_body}
                    onChange={(e) => setFormData({...formData, sms_body: e.target.value})}
                    rows={3}
                    placeholder="Short SMS version with {{variables}}"
                  />
                </div>

                <div>
                  <Label>Push Title (optional)</Label>
                  <Input
                    value={formData.push_title}
                    onChange={(e) => setFormData({...formData, push_title: e.target.value})}
                    placeholder="You're booked ✅"
                  />
                </div>

                <div>
                  <Label>Push Body (optional)</Label>
                  <Input
                    value={formData.push_body}
                    onChange={(e) => setFormData({...formData, push_body: e.target.value})}
                    placeholder="Cleaning tomorrow at {{time}}"
                  />
                </div>

                <div>
                  <Label>Deep Link (optional)</Label>
                  <Input
                    value={formData.deep_link}
                    onChange={(e) => setFormData({...formData, deep_link: e.target.value})}
                    placeholder="app://booking/{{booking_id}}"
                  />
                </div>

                <div>
                  <Label>Variables</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.variables.map(v => (
                      <Badge key={v} variant="outline" className="cursor-pointer" onClick={() => removeVariable(v)}>
                        {v} ×
                      </Badge>
                    ))}
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={addVariable}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Variable
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.send_email}
                      onChange={(e) => setFormData({...formData, send_email: e.target.checked})}
                    />
                    <span className="text-sm">Email</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.send_sms}
                      onChange={(e) => setFormData({...formData, send_sms: e.target.checked})}
                    />
                    <span className="text-sm">SMS</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.send_push}
                      onChange={(e) => setFormData({...formData, send_push: e.target.checked})}
                    />
                    <span className="text-sm">Push</span>
                  </label>
                </div>

                <div className="flex gap-2 pt-4">
                  {editing && (
                    <Button type="button" variant="outline" onClick={resetForm} className="flex-1">
                      Cancel
                    </Button>
                  )}
                  <Button type="submit" className="flex-1 bg-blue-500 hover:bg-blue-600">
                    {editing ? 'Update' : 'Create'} Template
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Templates List */}
          <Card className="lg:col-span-2 border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Active Templates ({templates.filter(t => t.is_active).length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all">
                <TabsList className="mb-4">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="client">Client</TabsTrigger>
                  <TabsTrigger value="cleaner">Cleaner</TabsTrigger>
                  <TabsTrigger value="marketing">Marketing</TabsTrigger>
                  <TabsTrigger value="system">System</TabsTrigger>
                </TabsList>

                {['all', 'client', 'cleaner', 'marketing', 'system'].map(cat => (
                  <TabsContent key={cat} value={cat} className="space-y-3">
                    {templates
                      .filter(t => t.is_active && (cat === 'all' || t.category === cat))
                      .map((template, idx) => (
                        <motion.div
                          key={template.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                        >
                          <Card className="border-2 hover:border-blue-300 transition-all">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <button
                                      onClick={() => copyTemplateId(template.template_id)}
                                      className="font-mono text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                    >
                                      {template.template_id}
                                      {copiedId === template.template_id ? (
                                        <Check className="w-4 h-4 text-green-500" />
                                      ) : (
                                        <Copy className="w-4 h-4" />
                                      )}
                                    </button>
                                    <Badge className={categoryColors[template.category]}>
                                      {template.category}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-slate-600 mb-2">{template.subject}</p>
                                  <div className="flex gap-2">
                                    {template.send_email && <Badge variant="outline">Email</Badge>}
                                    {template.send_sms && <Badge variant="outline">SMS</Badge>}
                                    {template.send_push && <Badge variant="outline">Push</Badge>}
                                  </div>
                                </div>
                                <div className="flex gap-1">
                                  <Button size="sm" variant="ghost" onClick={() => setPreviewing(template)}>
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                  <Button size="sm" variant="ghost" onClick={() => setTestDialog(template)}>
                                    <Send className="w-4 h-4" />
                                  </Button>
                                  <Button size="sm" variant="ghost" onClick={() => handleEdit(template)}>
                                    <Edit2 className="w-4 h-4" />
                                  </Button>
                                  <Button size="sm" variant="ghost" onClick={() => handleDelete(template)} className="text-red-600">
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>

                              {template.variables && template.variables.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  <span className="text-xs text-slate-500">Variables:</span>
                                  {template.variables.map(v => (
                                    <code key={v} className="text-xs bg-slate-100 px-1 py-0.5 rounded">{v}</code>
                                  ))}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Preview Dialog */}
        {previewing && (
          <Dialog open={!!previewing} onOpenChange={() => setPreviewing(null)}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Template Preview: {previewing.template_id}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label className="text-xs text-slate-500">Subject</Label>
                  <p className="font-semibold">{previewing.subject}</p>
                </div>

                {previewing.html_body && (
                  <div>
                    <Label className="text-xs text-slate-500">Email HTML</Label>
                    <div className="border rounded-lg p-4 bg-white">
                      <div dangerouslySetInnerHTML={{ __html: previewing.html_body }} />
                    </div>
                    <details className="mt-2">
                      <summary className="text-xs text-slate-500 cursor-pointer">View HTML Source</summary>
                      <pre className="text-xs bg-slate-50 p-4 rounded mt-2 overflow-x-auto">
                        {previewing.html_body}
                      </pre>
                    </details>
                  </div>
                )}

                {previewing.sms_body && (
                  <div>
                    <Label className="text-xs text-slate-500">SMS Version</Label>
                    <div className="bg-slate-50 p-4 rounded-lg border">
                      <p className="text-sm">{previewing.sms_body}</p>
                    </div>
                  </div>
                )}

                {previewing.push_title && (
                  <div>
                    <Label className="text-xs text-slate-500">Push Notification</Label>
                    <div className="bg-slate-50 p-4 rounded-lg border">
                      <p className="font-semibold text-sm mb-1">{previewing.push_title}</p>
                      <p className="text-sm text-slate-600">{previewing.push_body}</p>
                      {previewing.deep_link && (
                        <p className="text-xs text-slate-500 mt-2">Deep Link: {previewing.deep_link}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Test Send Dialog */}
        {testDialog && (
          <Dialog open={!!testDialog} onOpenChange={() => setTestDialog(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Test Send: {testDialog.template_id}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Recipient Email</Label>
                  <Input
                    type="email"
                    value={testData.recipient_email}
                    onChange={(e) => setTestData({...testData, recipient_email: e.target.value})}
                    placeholder="test@example.com"
                  />
                </div>

                <div>
                  <Label>Test Variables (JSON)</Label>
                  <Textarea
                    value={testData.test_variables}
                    onChange={(e) => setTestData({...testData, test_variables: e.target.value})}
                    rows={6}
                    placeholder='{"first_name": "John", "cleaner_name": "Sarah"}'
                    className="font-mono text-xs"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Required: {testDialog.variables?.join(', ') || 'none'}
                  </p>
                </div>

                <Button onClick={handleTestSend} className="w-full">
                  <Send className="w-4 h-4 mr-2" />
                  Send Test Email
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
