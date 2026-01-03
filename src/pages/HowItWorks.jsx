import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Zap, ArrowRight, CheckCircle } from 'lucide-react';

export default function HowItWorks() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-soft-cloud">
      {/* Hero */}
      <section className="py-20" style={{ background: 'linear-gradient(135deg, #66B3FF 0%, #00D4FF 100%)' }}>
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-5xl lg:text-6xl font-fredoka font-bold mb-6 text-white">How PureTask Works</h1>
          <p className="text-xl font-verdana max-w-2xl mx-auto mb-10 text-white">
            Choose your path to learn how our platform works for you
          </p>
        </div>
      </section>

      {/* Role Selection */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Client Path */}
            <Card
              className="border-4 shadow-xl hover:shadow-2xl transition-all cursor-pointer rounded-2xl group"
              style={{ borderColor: '#66B3FF' }}
              onClick={() => navigate(createPageUrl('HowItWorksClients'))}
            >
              <CardContent className="p-12 text-center">
                <div className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform" style={{ background: 'linear-gradient(135deg, #66B3FF 0%, #00D4FF 100%)' }}>
                  <Users className="w-12 h-12 text-white" />
                </div>
                <Badge className="mb-4 px-6 py-2 text-lg rounded-full font-fredoka" style={{ backgroundColor: '#DBEAFE', color: '#66B3FF' }}>
                  For Clients
                </Badge>
                <h2 className="text-3xl font-fredoka font-bold text-graphite mb-4">Book a Cleaner</h2>
                <p className="text-gray-600 font-verdana mb-6 leading-relaxed">
                  Learn how to find, book, and work with verified cleaning professionals on our platform
                </p>
                <ul className="text-left space-y-2 mb-8">
                  {[
                    'Browse verified cleaners',
                    'Transparent pricing & scheduling',
                    'GPS tracking & photo proof',
                    'Pay only when satisfied',
                    'Rate & review your experience'
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-gray-700 font-verdana">
                      <CheckCircle className="w-5 h-5 text-puretask-blue flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Button className="w-full text-white rounded-full font-fredoka font-semibold text-lg py-6 group-hover:shadow-xl transition-all" style={{ background: 'linear-gradient(135deg, #66B3FF 0%, #00D4FF 100%)' }}>
                  Learn More
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>

            {/* Cleaner Path */}
            <Card
              className="border-4 shadow-xl hover:shadow-2xl transition-all cursor-pointer rounded-2xl group"
              style={{ borderColor: '#28C76F' }}
              onClick={() => navigate(createPageUrl('HowItWorksCleaners'))}
            >
              <CardContent className="p-12 text-center">
                <div className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform" style={{ background: 'linear-gradient(135deg, #28C76F 0%, #10B981 100%)' }}>
                  <Zap className="w-12 h-12 text-white" />
                </div>
                <Badge className="mb-4 px-6 py-2 text-lg rounded-full font-fredoka" style={{ backgroundColor: '#D1FAE5', color: '#28C76F' }}>
                  For Cleaners
                </Badge>
                <h2 className="text-3xl font-fredoka font-bold text-graphite mb-4">Become a Cleaner</h2>
                <p className="text-gray-600 font-verdana mb-6 leading-relaxed">
                  Discover how to build your cleaning business with flexible hours and fair pay
                </p>
                <ul className="text-left space-y-2 mb-8">
                  {[
                    'Get verified & approved',
                    'Set your own rates & schedule',
                    'Accept jobs you want',
                    'Earn 80-85% of every booking',
                    'Get paid weekly or instantly'
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-gray-700 font-verdana">
                      <CheckCircle className="w-5 h-5 text-fresh-mint flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Button className="w-full text-white rounded-full font-fredoka font-semibold text-lg py-6 group-hover:shadow-xl transition-all" style={{ background: 'linear-gradient(135deg, #28C76F 0%, #10B981 100%)' }}>
                  Learn More
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}