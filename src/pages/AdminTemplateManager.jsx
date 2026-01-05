import React, { useState, useEffect } from 'react';
import { handleError } from '@/lib/errorHandler';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Mail, MessageSquare, Bell, Plus, Loader2, Search, Filter, RefreshCw 
} from 'lucide-react';
import { seedTemplates } from '../components/templates/TemplateSeeder';
import { toast } from 'sonner';

export default function AdminTemplateManager() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const allTemplates = await base44.entities.EmailTemplate.list();
      setTemplates(allTemplates);
    } catch (error) {
      handleError(error, { userMessage: 'Error loading templates:', showToast: false });
      toast.error('Failed to load templates');
    }
    setLoading(false);
  };

  const handleSeedTemplates = async () => {
    setSeeding(true);
    try {
      const results = await seedTemplates();
      toast.success(`Templates seeded: ${results.created} created, ${results.updated} updated`);
      await loadTemplates();
    } catch (error) {
      handleError(error, { userMessage: 'Error seeding templates:', showToast: false });
      toast.error('Failed to seed templates');
    }
    setSeeding(false);
  };

  const handleSave = async (template) => {
    try {
      if (template.id) {
        await base44.entities.EmailTemplate.update(template.id, template);
        toast.success('Template updated');
      } else {
        await base44.entities.EmailTemplate.create(template);
        toast.success('Template created');
      }
      setEditing(null);
      await loadTemplates();
    } catch (error) {
      handleError(error, { userMessage: 'Error saving template:', showToast: false });
      toast.error('Failed to save template');
    }
  };

  const filteredTemplates = templates.filter(t => {
    const matchesSearch = !searchTerm || 
      t.template_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.subject?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const emailTemplates = filteredTemplates.filter(t => t.send_email);
  const smsTemplates = filteredTemplates.filter(t => t.send_sms);
  const pushTemplates = filteredTemplates.filter(t => t.send_push);

  return (
    <div className="min-h-screen bg-soft-cloud p-6 lg:p-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-fredoka font-bold text-graphite mb-2">Email & SMS Templates</h1>
            <p className="text-lg text-gray-600 font-verdana">Manage notification templates across all channels</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={loadTemplates}
              variant="outline"
              className="rounded-full font-fredoka"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              onClick={handleSeedTemplates}
              disabled={seeding}
              className="brand-gradient text-white rounded-full font-fredoka font-semibold"
            >
              {seeding ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Seeding...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Seed Templates
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6 border-0 shadow-lg rounded-2xl">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 rounded-full font-verdana"
                />
              </div>
              <div>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full p-2 border rounded-full font-verdana"
                >
                  <option value="all">All Categories</option>
                  <option value="client">Client</option>
                  <option value="cleaner">Cleaner</option>
                  <option value="system">System</option>
                  <option value="marketing">Marketing</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-600 font-verdana">
                  {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Template Tabs */}
        <Tabs defaultValue="email" className="space-y-6">
          <TabsList className="bg-white shadow-md p-1 rounded-full">
            <TabsTrigger value="email" className="data-[state=active]:brand-gradient data-[state=active]:text-white rounded-full">
              <Mail className="w-4 h-4 mr-2" />
              Email ({emailTemplates.length})
            </TabsTrigger>
            <TabsTrigger value="sms" className="data-[state=active]:brand-gradient data-[state=active]:text-white rounded-full">
              <MessageSquare className="w-4 h-4 mr-2" />
              SMS ({smsTemplates.length})
            </TabsTrigger>
            <TabsTrigger value="push" className="data-[state=active]:brand-gradient data-[state=active]:text-white rounded-full">
              <Bell className="w-4 h-4 mr-2" />
              Push ({pushTemplates.length})
            </TabsTrigger>
          </TabsList>

          {/* Email Templates */}
          <TabsContent value="email" className="space-y-4">
            {emailTemplates.length === 0 ? (
              <Card className="border-0 shadow-lg rounded-2xl">
                <CardContent className="p-12 text-center">
                  <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-lg font-fredoka font-semibold text-graphite mb-2">No Email Templates</p>
                  <p className="text-gray-600 font-verdana mb-6">Click "Seed Templates" to create default templates</p>
                </CardContent>
              </Card>
            ) : (
              emailTemplates.map(template => (
                <Card key={template.id} className="border-0 shadow-lg rounded-2xl">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-t-2xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-puretask-blue" />
                        <div>
                          <CardTitle className="font-fredoka text-graphite">{template.template_id}</CardTitle>
                          <p className="text-sm text-gray-600 font-verdana mt-1">{template.subject}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`rounded-full font-fredoka ${
                          template.category === 'client' ? 'bg-blue-100 text-puretask-blue' :
                          template.category === 'cleaner' ? 'bg-green-100 text-fresh-mint' :
                          template.category === 'system' ? 'bg-purple-100 text-purple-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {template.category}
                        </Badge>
                        <Badge className={`rounded-full font-fredoka ${
                          template.is_active ? 'bg-fresh-mint text-white' : 'bg-gray-200 text-gray-600'
                        }`}>
                          {template.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-600 font-verdana mb-1">Variables:</p>
                        <div className="flex flex-wrap gap-2">
                          {template.variables?.map((v, idx) => (
                            <Badge key={idx} variant="outline" className="rounded-full font-verdana">
                              {v}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 font-verdana mb-1">HTML Preview:</p>
                        <div className="p-3 bg-gray-50 rounded-2xl max-h-32 overflow-y-auto">
                          <p className="text-xs text-gray-700 font-mono">{template.html_body?.substring(0, 200)}...</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* SMS Templates */}
          <TabsContent value="sms" className="space-y-4">
            {smsTemplates.length === 0 ? (
              <Card className="border-0 shadow-lg rounded-2xl">
                <CardContent className="p-12 text-center">
                  <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-lg font-fredoka font-semibold text-graphite mb-2">No SMS Templates</p>
                  <p className="text-gray-600 font-verdana mb-6">Click "Seed Templates" to create default templates</p>
                </CardContent>
              </Card>
            ) : (
              smsTemplates.map(template => (
                <Card key={template.id} className="border-0 shadow-lg rounded-2xl">
                  <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-2xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <MessageSquare className="w-5 h-5 text-fresh-mint" />
                        <CardTitle className="font-fredoka text-graphite">{template.template_id}</CardTitle>
                      </div>
                      <Badge className={`rounded-full font-fredoka ${
                        template.is_active ? 'bg-fresh-mint text-white' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {template.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div className="p-4 bg-soft-cloud rounded-2xl">
                        <p className="font-verdana text-graphite">{template.sms_body}</p>
                      </div>
                      {template.variables && template.variables.length > 0 && (
                        <div>
                          <p className="text-sm text-gray-600 font-verdana mb-1">Variables:</p>
                          <div className="flex flex-wrap gap-2">
                            {template.variables.map((v, idx) => (
                              <Badge key={idx} variant="outline" className="rounded-full font-verdana">
                                {v}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Push Templates */}
          <TabsContent value="push" className="space-y-4">
            {pushTemplates.length === 0 ? (
              <Card className="border-0 shadow-lg rounded-2xl">
                <CardContent className="p-12 text-center">
                  <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-lg font-fredoka font-semibold text-graphite mb-2">No Push Templates</p>
                  <p className="text-gray-600 font-verdana mb-6">Click "Seed Templates" to create default templates</p>
                </CardContent>
              </Card>
            ) : (
              pushTemplates.map(template => (
                <Card key={template.id} className="border-0 shadow-lg rounded-2xl">
                  <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-2xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Bell className="w-5 h-5 text-purple-600" />
                        <CardTitle className="font-fredoka text-graphite">{template.template_id}</CardTitle>
                      </div>
                      <Badge className={`rounded-full font-fredoka ${
                        template.is_active ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {template.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-600 font-verdana mb-1">Title:</p>
                        <p className="font-fredoka font-semibold text-graphite">{template.push_title}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 font-verdana mb-1">Body:</p>
                        <p className="font-verdana text-gray-700">{template.push_body}</p>
                      </div>
                      {template.deep_link && (
                        <div>
                          <p className="text-sm text-gray-600 font-verdana mb-1">Deep Link:</p>
                          <code className="text-xs font-mono text-puretask-blue bg-blue-50 px-2 py-1 rounded">
                            {template.deep_link}
                          </code>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}