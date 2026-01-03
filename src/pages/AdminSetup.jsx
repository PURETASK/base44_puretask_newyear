import React, { useState, useEffect } from 'react';
import { handleError } from '@/lib/errorHandler';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, CheckCircle, Loader2 } from 'lucide-react';

export default function AdminSetup() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [isAlreadyAdmin, setIsAlreadyAdmin] = useState(false);

  useEffect(() => {
    checkCurrentUser();
  }, []);

  const checkCurrentUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      // Check if already admin
      const existingAdmin = await base44.entities.AdminUser.filter({ 
        email: currentUser.email 
      });

      if (existingAdmin.length > 0 || currentUser.role === 'admin') {
        setIsAlreadyAdmin(true);
      }

      setLoading(false);
    } catch (error) {
      handleError(error, { userMessage: 'Error:', showToast: false });
      setLoading(false);
    }
  };

  const handleCreateAdmin = async () => {
    setCreating(true);
    try {
      await base44.entities.AdminUser.create({
        email: user.email,
        full_name: user.full_name || user.email,
        roles: ['super_admin'],
        is_active: true,
        last_login_at: new Date().toISOString()
      });

      alert('Admin access granted! Redirecting to Admin Dashboard...');
      setTimeout(() => {
        navigate(createPageUrl('AdminDashboard'));
      }, 1000);
    } catch (error) {
      handleError(error, { userMessage: 'Error creating admin:', showToast: false });
      alert('Failed to create admin access');
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-soft-cloud flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-puretask-blue" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-soft-cloud flex items-center justify-center p-6">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="font-fredoka text-2xl flex items-center gap-3">
            <Shield className="w-8 h-8 text-puretask-blue" />
            Admin Setup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isAlreadyAdmin ? (
            <>
              <div className="text-center py-6">
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <p className="text-xl font-fredoka font-bold text-graphite mb-2">
                  You already have admin access!
                </p>
                <p className="text-gray-600 font-verdana">
                  {user.email}
                </p>
              </div>
              <Button
                onClick={() => navigate(createPageUrl('AdminDashboard'))}
                className="w-full font-fredoka"
              >
                Go to Admin Dashboard
              </Button>
            </>
          ) : (
            <>
              <div className="text-center py-4">
                <p className="text-lg font-fredoka font-bold text-graphite mb-2">
                  Grant Admin Access
                </p>
                <p className="text-sm text-gray-600 font-verdana">
                  You're logged in as: <span className="font-semibold">{user.email}</span>
                </p>
              </div>
              <Button
                onClick={handleCreateAdmin}
                disabled={creating}
                className="w-full font-fredoka text-lg py-6"
              >
                {creating ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Creating Admin Access...
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5 mr-2" />
                    Grant Me Super Admin Access
                  </>
                )}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}