import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserCircle, Sparkles } from 'lucide-react';

export default function RoleSelection() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome to PureTask</h1>
          <p className="text-lg text-gray-600">Choose your role to get started</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/client-dashboard')}>
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <UserCircle className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle>I'm a Client</CardTitle>
              <CardDescription>Book cleaning services for your home or office</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Continue as Client</Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/cleaner-dashboard')}>
            <CardHeader>
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-indigo-600" />
              </div>
              <CardTitle>I'm a Cleaner</CardTitle>
              <CardDescription>Manage bookings and grow your business</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Continue as Cleaner</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}