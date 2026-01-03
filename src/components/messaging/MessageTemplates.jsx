import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MessageSquare, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const DEFAULT_TEMPLATES = [
  {
    title: "Thank You",
    content: "Thank you so much! I appreciate your help.",
    user_type: "both"
  },
  {
    title: "Running Late",
    content: "Hi! I'm running about 10 minutes late. I'll be there shortly. Sorry for the delay!",
    user_type: "cleaner"
  },
  {
    title: "On My Way",
    content: "Hello! I'm on my way to your location. I should arrive in about 15 minutes.",
    user_type: "cleaner"
  },
  {
    title: "Question About Job",
    content: "Hi! I have a quick question about the cleaning job. When would be a good time to discuss?",
    user_type: "both"
  },
  {
    title: "Great Job",
    content: "Thank you for the excellent cleaning job! Everything looks amazing.",
    user_type: "client"
  }
];

export default function MessageTemplates({ userType, onSelect }) {
  const [templates, setTemplates] = useState([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newTemplate, setNewTemplate] = useState({ title: '', content: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const user = await base44.auth.me();
      const userTemplates = await base44.entities.MessageTemplate.filter({ user_email: user.email });
      
      // Combine user templates with default templates
      const filteredDefaults = DEFAULT_TEMPLATES.filter(t => 
        t.user_type === 'both' || t.user_type === userType
      );
      
      setTemplates([...userTemplates, ...filteredDefaults.map(t => ({ ...t, is_default: true }))]);
    } catch (error) {
      console.error('Error loading templates:', error);
    }
    setLoading(false);
  };

  const handleCreateTemplate = async () => {
    if (!newTemplate.title.trim() || !newTemplate.content.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const user = await base44.auth.me();
      await base44.entities.MessageTemplate.create({
        user_email: user.email,
        title: newTemplate.title,
        content: newTemplate.content,
        user_type: userType
      });

      toast.success('Template created');
      setNewTemplate({ title: '', content: '' });
      setShowCreateDialog(false);
      loadTemplates();
    } catch (error) {
      console.error('Error creating template:', error);
      toast.error('Failed to create template');
    }
  };

  const handleDeleteTemplate = async (templateId) => {
    if (!confirm('Delete this template?')) return;

    try {
      await base44.entities.MessageTemplate.delete(templateId);
      toast.success('Template deleted');
      loadTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('Failed to delete template');
    }
  };

  const handleUseTemplate = async (template) => {
    if (!template.is_default && template.id) {
      try {
        await base44.entities.MessageTemplate.update(template.id, {
          usage_count: (template.usage_count || 0) + 1
        });
      } catch (error) {
        console.error('Error updating usage count:', error);
      }
    }
    onSelect(template);
  };

  return (
    <Card className="border-0 shadow-lg mt-2">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Quick Replies</CardTitle>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                New Template
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Message Template</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Template Name</Label>
                  <Input
                    value={newTemplate.title}
                    onChange={(e) => setNewTemplate({ ...newTemplate, title: e.target.value })}
                    placeholder="e.g., Running Late"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Message Content</Label>
                  <Textarea
                    value={newTemplate.content}
                    onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })}
                    placeholder="Type your template message..."
                    rows={4}
                    className="mt-2"
                  />
                </div>
                <Button onClick={handleCreateTemplate} className="w-full">
                  Create Template
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {loading ? (
          <p className="text-sm text-slate-500">Loading templates...</p>
        ) : templates.length === 0 ? (
          <p className="text-sm text-slate-500">No templates yet. Create your first one!</p>
        ) : (
          templates.map((template, idx) => (
            <div
              key={idx}
              className="flex items-start justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors group"
            >
              <button
                onClick={() => handleUseTemplate(template)}
                className="flex-1 text-left"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">{template.title}</span>
                  {template.is_default && (
                    <Badge variant="outline" className="text-xs">Default</Badge>
                  )}
                </div>
                <p className="text-xs text-slate-600 line-clamp-2">{template.content}</p>
              </button>
              {!template.is_default && template.id && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteTemplate(template.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}