import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, Info, Sparkles, Home as HomeIcon, Key, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

const CLEANING_DUTIES = {
  basic: {
    title: 'Basic Cleaning (2 Bed / 2 Bath)',
    subtitle: 'Standard maintenance cleaning - typical 2-3 hours',
    icon: '🏠',
    color: 'blue',
    duties: {
      'Kitchen': [
        'Wipe down all countertops and backsplash',
        'Clean exterior of appliances (fridge, stove, microwave, dishwasher)',
        'Clean sink and faucet',
        'Wipe cabinet fronts',
        'Sweep and mop floor',
        'Empty trash and replace liner'
      ],
      'Bathrooms (Both)': [
        'Clean and disinfect toilet (bowl, seat, exterior)',
        'Clean and disinfect sink, faucet, and counter',
        'Clean mirror',
        'Wipe down exterior of cabinets',
        'Clean tub/shower (walls, fixtures, glass door if applicable)',
        'Sweep and mop floor',
        'Empty trash and replace liner'
      ],
      'Bedrooms (Both)': [
        'Make beds (if linens are present)',
        'Dust all accessible surfaces',
        'Vacuum or sweep floors',
        'Empty trash'
      ],
      'Living/Dining Areas': [
        'Dust all accessible surfaces (tables, shelves, TV stands)',
        'Vacuum carpets or sweep/mop hard floors',
        'Wipe down light switches and doorknobs',
        'Straighten pillows/cushions'
      ],
      'General (All Rooms)': [
        'Spot clean walls and light switches',
        'Empty all trash bins',
        'Light dusting of accessible surfaces'
      ]
    }
  },
  deep: {
    title: 'Deep Clean Add-Ons',
    subtitle: 'Additional tasks beyond basic cleaning (+$3-8/hour in credits)',
    icon: '✨',
    color: 'purple',
    duties: {
      'Additional Tasks': [
        'Baseboards - wipe down all baseboards in every room',
        'Ceiling fans - dust and wipe blades',
        'Light fixtures - dust and wipe accessible fixtures',
        'Window sills and tracks - vacuum and wipe',
        'Interior windows - clean glass on inside',
        'Cabinet interiors - wipe down inside of cabinets (if requested)',
        'Refrigerator interior - clean inside fridge and freezer (if requested)',
        'Oven interior - deep clean inside oven',
        'Behind/under furniture - move and clean (if safe to move)',
        'Detailed grout cleaning - scrub tile grout',
        'Air vents - dust and wipe vent covers',
        'Door frames - wipe down all door frames'
      ]
    }
  },
  moveout: {
    title: 'Move-Out / Move-In Cleaning',
    subtitle: 'Complete vacant property cleaning (+$3-8/hour in credits)',
    icon: '📦',
    color: 'emerald',
    description: 'Move-out cleans are for EMPTY properties only. This is the most thorough cleaning service, covering everything a basic and deep clean includes, PLUS the detailed items below.',
    duties: {
      'Kitchen (Complete)': [
        'All basic kitchen tasks',
        'Inside all cabinets and drawers - wipe shelves, walls, and drawer interiors',
        'Inside refrigerator and freezer - complete deep clean',
        'Inside oven, microwave, and dishwasher',
        'Under/behind all appliances (if moveable)',
        'Light fixtures and ceiling'
      ],
      'Bathrooms (Complete)': [
        'All basic bathroom tasks',
        'Inside all cabinets and drawers',
        'Behind toilet',
        'Shower head and faucet aerators - descale',
        'Exhaust fan covers',
        'Light fixtures and ceiling'
      ],
      'All Bedrooms & Living Areas': [
        'Inside all closets - vacuum and wipe surfaces',
        'Inside all drawers',
        'All baseboards',
        'All window sills and tracks',
        'All interior windows',
        'All light fixtures',
        'Ceiling fans',
        'All door frames and doors',
        'Light switches and outlets'
      ],
      'Throughout Entire Property': [
        'All baseboards wiped down',
        'All window tracks vacuumed and wiped',
        'All interior windows cleaned',
        'All ceiling fans and light fixtures',
        'All vents dusted',
        'All doors and door frames',
        'Walls spot-cleaned or wiped as needed',
        'Final walkthrough to ensure everything is spotless'
      ]
    }
  },
  airbnb: {
    title: 'Airbnb Turnover Cleaning',
    subtitle: 'Quick turnovers between guests - typically 2-3 hours',
    icon: '🏡',
    color: 'pink',
    duties: {
      'Cleaning Tasks': [
        'All basic cleaning tasks (kitchen, bathrooms, bedrooms, living areas)',
        'Change all bed linens',
        'Replace all towels',
        'Check under beds and furniture for items',
        'Empty all trash bins',
        'Quick spot-check for damage or issues'
      ],
      'Restocking Checklist': [
        'Toilet paper in all bathrooms (at least 2 rolls per bathroom)',
        'Paper towels in kitchen',
        'Hand soap in all bathrooms and kitchen',
        'Fresh towels (2 per guest)',
        'Fresh linens on all beds',
        'Coffee pods and filters (if provided)',
        'Dishwasher pods or dish soap',
        'Laundry detergent (if washer provided)',
        'Trash bags',
        'Check and refill any other amenities'
      ],
      'Final Touches': [
        'Turn on all lights',
        'Set thermostat to appropriate temperature',
        'Open curtains/blinds',
        'Arrange pillows and decor',
        'Place welcome materials if provided',
        'Take photos of completed space (for host records)',
        'Report any damage or maintenance needs to host'
      ]
    }
  }
};

export default function RecommendedDuties() {
  const [activeTab, setActiveTab] = useState('basic');

  return (
    <div className="min-h-screen bg-soft-cloud p-6 lg:p-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-puretask-blue to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg">
              <CheckCircle className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-fredoka font-bold text-graphite mb-2">Recommended Cleaning Duties</h1>
              <p className="text-lg text-gray-600 font-verdana">What our clients typically expect for each service type</p>
            </div>
          </div>

          <Alert className="border-amber-200 bg-amber-50 rounded-2xl">
            <Info className="w-5 h-5 text-amber-600" />
            <AlertDescription className="text-amber-900 font-verdana">
              <strong>Important:</strong> As an independent contractor, you are NOT required to follow this list exactly. These are simply guidelines based on what our platform's clients have come to expect. You have the freedom to customize your services, discuss specific needs with clients, and work in the way that best suits your professional approach. Always communicate clearly with your client about what will be included in each booking.
            </AlertDescription>
          </Alert>
        </motion.div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white shadow-lg p-2 grid grid-cols-2 lg:grid-cols-4 gap-2 rounded-2xl">
            <TabsTrigger
              value="basic"
              className="rounded-full font-fredoka data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-600 data-[state=active]:text-white"
            >
              <HomeIcon className="w-4 h-4 mr-2" />
              Basic Clean
            </TabsTrigger>
            <TabsTrigger
              value="deep"
              className="rounded-full font-fredoka data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 data-[state=active]:text-white"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Deep Clean
            </TabsTrigger>
            <TabsTrigger
              value="moveout"
              className="rounded-full font-fredoka data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-green-600 data-[state=active]:text-white"
            >
              <Key className="w-4 h-4 mr-2" />
              Move-Out
            </TabsTrigger>
            <TabsTrigger
              value="airbnb"
              className="rounded-full font-fredoka data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-rose-600 data-[state=active]:text-white"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Airbnb
            </TabsTrigger>
          </TabsList>

          {Object.entries(CLEANING_DUTIES).map(([key, service]) => (
            <TabsContent key={key} value={key} className="space-y-6">
              <Card className={`border-0 shadow-xl rounded-2xl bg-gradient-to-r from-${service.color}-50 to-${service.color}-100`}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <span className="text-4xl">{service.icon}</span>
                    <div>
                      <h2 className="text-2xl font-fredoka font-bold text-graphite">{service.title}</h2>
                      <p className="text-sm text-gray-600 font-verdana mt-1">{service.subtitle}</p>
                    </div>
                  </CardTitle>
                </CardHeader>
                {service.description && (
                  <CardContent className="pt-0">
                    <Alert className="border-emerald-200 bg-emerald-50 rounded-2xl">
                      <AlertDescription className="text-emerald-900 font-verdana">
                        <strong>Note:</strong> {service.description}
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                )}
              </Card>

              <div className="grid lg:grid-cols-2 gap-6">
                {Object.entries(service.duties).map(([room, tasks]) => (
                  <motion.div
                    key={room}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <Card className="border-0 shadow-lg rounded-2xl h-full">
                      <CardHeader className={`bg-gradient-to-r from-${service.color}-50 to-white`}>
                        <CardTitle className="text-lg font-fredoka text-graphite">{room}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                        <ul className="space-y-3">
                          {tasks.map((task, index) => (
                            <li key={index} className="flex items-start gap-3">
                              <CheckCircle className={`w-5 h-5 text-${service.color}-500 flex-shrink-0 mt-0.5`} />
                              <span className="text-gray-700 font-verdana text-sm">{task}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Pro Tips */}
        <Card className="mt-12 border-0 shadow-xl rounded-2xl">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-indigo-600" />
              <span className="font-fredoka">Professional Tips</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-fredoka font-bold text-graphite mb-3">Before You Start</h3>
                <ul className="space-y-2 text-sm text-gray-700 font-verdana">
                  <li className="flex items-start gap-2">
                    <span className="text-puretask-blue">•</span>
                    <span>Review the specific tasks requested by the client</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-puretask-blue">•</span>
                    <span>Check for any allergies or product preferences</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-puretask-blue">•</span>
                    <span>Take "before" photos as you begin each room</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-puretask-blue">•</span>
                    <span>GPS check-in when you arrive</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-fredoka font-bold text-graphite mb-3">After Completion</h3>
                <ul className="space-y-2 text-sm text-gray-700 font-verdana">
                  <li className="flex items-start gap-2">
                    <span className="text-fresh-mint">•</span>
                    <span>Take "after" photos showing your work</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-fresh-mint">•</span>
                    <span>GPS check-out when you leave</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-fresh-mint">•</span>
                    <span>Send a quick message to the client confirming completion</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-fresh-mint">•</span>
                    <span>Note any areas that need special attention or couldn't be completed</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}