import React, { useState, useEffect } from 'react';
import { handleError } from '@/lib/errorHandler';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, Save, X, AlertCircle, CheckCircle2, 
  History, Clock, Settings as SettingsIcon, Loader2
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminSystemConfig() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settingDefinitions, setSettingDefinitions] = useState([]);
  const [globalSetting, setGlobalSetting] = useState(null);
  const [formData, setFormData] = useState({});
  const [isDirty, setIsDirty] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Business & Financials');
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check authentication
      const currentUser = await base44.auth.me();
      if (!currentUser || currentUser.role !== 'admin') {
        window.location.href = '/';
        return;
      }
      setUser(currentUser);

      // Load setting definitions
      const definitions = await base44.entities.SettingDefinition.list();
      setSettingDefinitions(definitions);

      // If no definitions exist, show a helpful message
      if (definitions.length === 0) {
        setError('No setting definitions found. Please run the seedSettings function first.');
        setLoading(false);
        return;
      }

      // Load current settings for production environment
      const allGlobalSettings = await base44.entities.GlobalSetting.list();
      const productionSetting = allGlobalSettings.find(s => s.id === 'production');

      if (productionSetting) {
        setGlobalSetting(productionSetting);
        setFormData({ ...productionSetting.settings_data });
      } else {
        console.log('No GlobalSetting found, using defaults');
        // Initialize with defaults from definitions
        const defaultData = {};
        definitions.forEach(def => {
          try {
            defaultData[def.setting_id] = JSON.parse(def.default_value);
          } catch {
            defaultData[def.setting_id] = def.default_value;
          }
        });
        setFormData(defaultData);
      }

    } catch (error) {
      handleError(error, { userMessage: 'Error loading config data:', showToast: false });
      setError(error.message || 'Failed to load configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (settingId, value) => {
    setFormData(prev => ({
      ...prev,
      [settingId]: value
    }));
    setIsDirty(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Create audit log entries for changed settings
      if (globalSetting) {
        const changedSettings = Object.keys(formData).filter(
          key => JSON.stringify(formData[key]) !== JSON.stringify(globalSetting.settings_data[key])
        );

        for (const settingId of changedSettings) {
          await base44.entities.SettingAuditLog.create({
            setting_id: settingId,
            environment: 'production',
            old_value: JSON.stringify(globalSetting.settings_data[settingId]),
            new_value: JSON.stringify(formData[settingId]),
            changed_by_email: user.email,
            changed_at: new Date().toISOString(),
            action: 'update'
          });
        }
      }

      // Update or create GlobalSetting
      if (globalSetting) {
        await base44.entities.GlobalSetting.update('production', {
          settings_data: formData,
          last_updated_by: user.email,
          last_updated_date: new Date().toISOString()
        });
      } else {
        await base44.entities.GlobalSetting.create({
          id: 'production',
          environment: 'production',
          settings_data: formData,
          last_updated_by: user.email,
          last_updated_date: new Date().toISOString()
        });
      }

      toast.success('Configuration saved successfully');
      setIsDirty(false);
      await loadData(); // Reload to get updated data

    } catch (error) {
      handleError(error, { userMessage: 'Error saving settings:', showToast: false });
      toast.error('Failed to save configuration: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    if (globalSetting) {
      setFormData({ ...globalSetting.settings_data });
    }
    setIsDirty(false);
    toast.info('Changes discarded');
  };

  const renderInputField = (definition) => {
    const value = formData[definition.setting_id];

    switch (definition.type) {
      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <Switch
              checked={value || false}
              onCheckedChange={(checked) => handleInputChange(definition.setting_id, checked)}
            />
            <span className="text-sm text-gray-600">{value ? 'Enabled' : 'Disabled'}</span>
          </div>
        );

      case 'number':
        return (
          <Input
            type="number"
            value={value || ''}
            onChange={(e) => handleInputChange(definition.setting_id, parseFloat(e.target.value) || 0)}
            min={definition.validation_rules?.min}
            max={definition.validation_rules?.max}
            className="max-w-xs"
          />
        );

      case 'enum':
        return (
          <Select
            value={value || definition.default_value}
            onValueChange={(val) => handleInputChange(definition.setting_id, val)}
          >
            <SelectTrigger className="max-w-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {definition.enum_options?.map(option => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'string':
        if (definition.ui_hint === 'long_text') {
          return (
            <Textarea
              value={value || ''}
              onChange={(e) => handleInputChange(definition.setting_id, e.target.value)}
              rows={4}
              className="max-w-2xl"
            />
          );
        }
        return (
          <Input
            type="text"
            value={value || ''}
            onChange={(e) => handleInputChange(definition.setting_id, e.target.value)}
            className="max-w-xl"
          />
        );

      case 'json_array':
        if (definition.ui_hint === 'multi_select_tag_input') {
          return (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {Array.isArray(value) && value.map((item, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {item}
                    <button
                      onClick={() => {
                        const newArray = [...value];
                        newArray.splice(idx, 1);
                        handleInputChange(definition.setting_id, newArray);
                      }}
                      className="hover:bg-blue-200 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <Input
                type="text"
                placeholder="Add item and press Enter"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.target.value.trim()) {
                    e.preventDefault();
                    const newArray = Array.isArray(value) ? [...value] : [];
                    newArray.push(e.target.value.trim());
                    handleInputChange(definition.setting_id, newArray);
                    e.target.value = '';
                  }
                }}
                className="max-w-xl"
              />
            </div>
          );
        }
        return (
          <Textarea
            value={JSON.stringify(value, null, 2)}
            onChange={(e) => {
              try {
                handleInputChange(definition.setting_id, JSON.parse(e.target.value));
              } catch {}
            }}
            rows={6}
            className="max-w-2xl font-mono text-xs"
          />
        );

      case 'json_object':
        return (
          <Textarea
            value={JSON.stringify(value, null, 2)}
            onChange={(e) => {
              try {
                handleInputChange(definition.setting_id, JSON.parse(e.target.value));
              } catch {}
            }}
            rows={8}
            className="max-w-2xl font-mono text-xs"
          />
        );

      default:
        return <Input value={value || ''} disabled className="max-w-xl" />;
    }
  };

  const categories = [...new Set(settingDefinitions.map(d => d.category))];
  
  const filteredDefinitions = settingDefinitions.filter(def => {
    const matchesSearch = !searchQuery || 
      def.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      def.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const definitionsByCategory = filteredDefinitions.reduce((acc, def) => {
    if (!acc[def.category]) acc[def.category] = {};
    if (!acc[def.category][def.subcategory]) acc[def.category][def.subcategory] = [];
    acc[def.category][def.subcategory].push(def);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading configuration settings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <Alert variant="destructive" className="max-w-lg">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button onClick={loadData} variant="outline" size="sm" className="mt-4">
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <SettingsIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">System Configuration</h1>
                <p className="text-gray-600">Manage all platform settings from one place</p>
              </div>
            </div>
          </div>

          {globalSetting && (
            <div className="flex items-center gap-2 text-sm text-gray-600 bg-white px-4 py-2 rounded-lg border">
              <Clock className="w-4 h-4" />
              <span>
                Last updated: {new Date(globalSetting.last_updated_date).toLocaleString()} by {globalSetting.last_updated_by}
              </span>
            </div>
          )}
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search settings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <Tabs value={activeCategory} onValueChange={setActiveCategory} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            {categories.map(category => (
              <TabsTrigger key={category} value={category}>
                {category.split(' ')[0]}
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map(category => (
            <TabsContent key={category} value={category} className="space-y-6">
              {definitionsByCategory[category] && Object.entries(definitionsByCategory[category]).map(([subcategory, definitions]) => (
                <Card key={subcategory}>
                  <CardHeader>
                    <CardTitle>{subcategory}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {definitions.map(definition => (
                      <div key={definition.setting_id} className="space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <label className="text-sm font-medium text-gray-900 flex items-center gap-2">
                              {definition.name}
                              {definition.is_sensitive && (
                                <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded">
                                  Sensitive
                                </span>
                              )}
                            </label>
                            <p className="text-sm text-gray-600 mt-1">{definition.description}</p>
                          </div>
                        </div>
                        <div className="mt-2">
                          {renderInputField(definition)}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          ))}
        </Tabs>

        {/* Sticky Save Bar */}
        {isDirty && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-50">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <AlertCircle className="w-5 h-5 text-amber-500" />
                <span>You have unsaved changes</span>
              </div>
              <div className="flex gap-3">
                <Button onClick={handleDiscard} variant="outline" disabled={saving}>
                  <X className="w-4 h-4 mr-2" />
                  Discard Changes
                </Button>
                <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}