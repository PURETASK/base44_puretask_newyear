import React, { useState } from 'react';
import { Smartphone, Mail, Bell } from 'lucide-react';

const EXAMPLE_DATA = {
  client_name: 'John Smith',
  cleaner_name: 'Your Name',
  date: 'January 15, 2026',
  time: '2:00 PM',
  eta: '15',
  discount_text: 'Get 15% off your next booking!'
};

export default function MessagePreview({ template, channels = ['email'], className = '' }) {
  const [activeChannel, setActiveChannel] = useState(channels[0] || 'email');

  const renderTemplate = (text) => {
    if (!text) return '';
    return text.replace(/{(\w+)}/g, (match, key) => EXAMPLE_DATA[key] || match);
  };

  const renderedMessage = renderTemplate(template);

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Channel Selector */}
      {channels.length > 1 && (
        <div className="flex gap-2 border-b pb-2">
          {channels.includes('sms') && (
            <button
              onClick={() => setActiveChannel('sms')}
              className={`px-3 py-1.5 rounded-lg text-xs font-fredoka flex items-center gap-1.5 transition-colors ${
                activeChannel === 'sms' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              SMS
            </button>
          )}
          {channels.includes('email') && (
            <button
              onClick={() => setActiveChannel('email')}
              className={`px-3 py-1.5 rounded-lg text-xs font-fredoka flex items-center gap-1.5 transition-colors ${
                activeChannel === 'email' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              Email
            </button>
          )}
          {channels.includes('in_app') && (
            <button
              onClick={() => setActiveChannel('in_app')}
              className={`px-3 py-1.5 rounded-lg text-xs font-fredoka flex items-center gap-1.5 transition-colors ${
                activeChannel === 'in_app' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              In-App
            </button>
          )}
        </div>
      )}

      {/* Preview Area */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <p className="text-xs text-gray-500 font-verdana mb-2">Preview:</p>
        
        {activeChannel === 'sms' && (
          <div className="bg-white rounded-2xl rounded-bl-sm p-3 shadow-sm max-w-[280px]">
            <p className="text-sm font-verdana text-gray-800 whitespace-pre-wrap">{renderedMessage}</p>
          </div>
        )}
        
        {activeChannel === 'email' && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden max-w-md">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3">
              <p className="text-white font-fredoka font-semibold text-sm">PureTask</p>
            </div>
            <div className="p-4">
              <p className="text-sm font-verdana text-gray-800 whitespace-pre-wrap">{renderedMessage}</p>
            </div>
          </div>
        )}
        
        {activeChannel === 'in_app' && (
          <div className="bg-white rounded-lg border-l-4 border-blue-500 p-3 shadow-sm max-w-sm">
            <div className="flex items-start gap-2">
              <Bell className="w-4 h-4 text-blue-500 mt-0.5" />
              <p className="text-sm font-verdana text-gray-800 flex-1 whitespace-pre-wrap">{renderedMessage}</p>
            </div>
          </div>
        )}
      </div>
      
      <p className="text-xs text-gray-500 font-verdana italic">
        Placeholders like {'{client_name}'} will be replaced with real data
      </p>
    </div>
  );
}