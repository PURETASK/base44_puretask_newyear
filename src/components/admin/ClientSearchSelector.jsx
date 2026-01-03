import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Search, User, Mail, Loader2, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function ClientSearchSelector({ onSelectClient, selectedEmail }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (searchTerm.length >= 2) {
        performSearch();
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(delaySearch);
  }, [searchTerm]);

  const performSearch = async () => {
    setSearching(true);
    try {
      const profiles = await base44.entities.ClientProfile.list();
      const users = await base44.entities.User.list();
      
      const userMap = {};
      users.forEach(u => {
        userMap[u.email] = u;
      });

      const filtered = profiles.filter(profile => {
        const user = userMap[profile.user_email];
        const searchLower = searchTerm.toLowerCase();
        return (
          profile.user_email?.toLowerCase().includes(searchLower) ||
          user?.full_name?.toLowerCase().includes(searchLower) ||
          profile.client_id?.toLowerCase().includes(searchLower)
        );
      }).slice(0, 10);

      const enriched = filtered.map(profile => ({
        ...profile,
        full_name: userMap[profile.user_email]?.full_name || 'Unknown'
      }));

      setSearchResults(enriched);
      setShowResults(true);
    } catch (error) {
      console.error('Search error:', error);
    }
    setSearching(false);
  };

  const handleSelect = (client) => {
    onSelectClient(client);
    setSearchTerm('');
    setShowResults(false);
  };

  const clearSelection = () => {
    onSelectClient(null);
  };

  if (selectedEmail) {
    return (
      <div className="space-y-2">
        <Label className="font-fredoka font-medium text-graphite">Selected Client</Label>
        <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-full">
          <Mail className="w-4 h-4 text-puretask-blue" />
          <span className="font-verdana text-sm flex-1">{selectedEmail}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSelection}
            className="h-6 w-6 p-0 rounded-full hover:bg-blue-100"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative space-y-2">
      <Label className="font-fredoka font-medium text-graphite">Search Client</Label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          type="text"
          placeholder="Search by name, email, or client ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => searchResults.length > 0 && setShowResults(true)}
          className="pl-10 pr-10 rounded-full font-verdana"
        />
        {searching && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 animate-spin text-puretask-blue" />
        )}
      </div>

      {showResults && searchResults.length > 0 && (
        <Card className="absolute z-50 w-full mt-1 shadow-xl border-2 border-blue-200 rounded-2xl max-h-80 overflow-y-auto">
          <CardContent className="p-2">
            {searchResults.map((client) => (
              <button
                key={client.id}
                onClick={() => handleSelect(client)}
                className="w-full text-left p-3 rounded-xl hover:bg-blue-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center text-white font-fredoka font-bold">
                    {client.full_name[0] || 'C'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-fredoka font-medium text-graphite truncate">{client.full_name}</p>
                    <p className="text-sm text-gray-600 font-verdana truncate">{client.user_email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {client.client_id && (
                        <Badge variant="outline" className="text-xs">ID: {client.client_id}</Badge>
                      )}
                      <Badge variant="outline" className="text-xs">{client.credits_balance || 0} credits</Badge>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>
      )}

      {showResults && searchResults.length === 0 && searchTerm.length >= 2 && !searching && (
        <Card className="absolute z-50 w-full mt-1 shadow-xl border-2 border-gray-200 rounded-2xl">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-gray-500 font-verdana">No clients found matching "{searchTerm}"</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}