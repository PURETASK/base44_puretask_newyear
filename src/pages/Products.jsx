
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, Sparkles, Info, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

const PRODUCTS = {
  'Core Tools': [
    { name: 'Broom & Dustpan Set', image: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400', price: '$15-25', description: 'Essential for sweeping floors' },
    { name: 'Mop & Bucket', image: 'https://images.unsplash.com/photo-1627483262769-77137a3eb05e?w=400', price: '$20-40', description: 'For mopping hardwood, tile, and laminate' },
    { name: 'Vacuum Cleaner', image: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=400', price: '$80-300', description: 'Upright or canister for carpets and floors' },
    { name: 'Spray Bottles (3-pack)', image: 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=400', price: '$8-15', description: 'For diluting and applying cleaning solutions' },
    { name: 'Scrub Brush Set', image: 'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=400', price: '$10-20', description: 'Various sizes for different surfaces' },
    { name: 'Grout Brush', image: 'https://images.unsplash.com/photo-1603712725038-779d45d5a5f8?w=400', price: '$5-12', description: 'Narrow brush for tile grout and corners' },
    { name: 'Squeegee', image: 'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=400', price: '$8-15', description: 'For windows and glass surfaces' },
    { name: 'Duster with Extension Pole', image: 'https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?w=400', price: '$15-30', description: 'Reach ceiling fans, light fixtures, and high shelves' },
  ],
  'Cleaning Chemicals': [
    { name: 'All-Purpose Cleaner', image: 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=400', price: '$4-12', description: 'Multi-surface spray (Method, Mrs. Meyers, or professional grade)', brands: 'Method, Mrs. Meyers, Fabuloso' },
    { name: 'Glass Cleaner (Windex)', image: 'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=400', price: '$4-8', description: 'For windows, mirrors, and glass surfaces', brands: 'Windex, Sprayway' },
    { name: 'Bathroom Cleaner', image: 'https://images.unsplash.com/photo-1620799139834-6b8f844fbe29?w=400', price: '$5-10', description: 'Disinfectant for tubs, tiles, and toilets', brands: 'Lysol, Scrubbing Bubbles, Clorox' },
    { name: 'Bleach/Disinfectant', image: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=400', price: '$3-6', description: 'For sanitizing and removing tough stains', brands: 'Clorox, Lysol' },
    { name: 'Degreaser', image: 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=400', price: '$6-15', description: 'For kitchen surfaces, stovetops, and ovens', brands: 'Krud Kutter, Goo Gone, Simple Green' },
    { name: 'Wood/Furniture Polish', image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400', price: '$5-12', description: 'For wood surfaces and furniture', brands: 'Pledge, Old English, Howard' },
    { name: 'Hardwood Floor Cleaner', image: 'https://images.unsplash.com/photo-1581858726788-75bc0f1a4471?w=400', price: '$8-18', description: 'pH-balanced for wood floors', brands: 'Bona, Method, Rejuvenate' },
    { name: 'Stainless Steel Polish', image: 'https://images.unsplash.com/photo-1556228852-80524e043dd4?w=400', price: '$6-12', description: 'For appliances and fixtures', brands: 'Weiman, Bar Keepers Friend' },
    { name: 'Oven Cleaner', image: 'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=400', price: '$5-10', description: 'For deep cleaning ovens and stovetops', brands: 'Easy-Off, Carbona' },
    { name: 'Toilet Bowl Cleaner', image: 'https://images.unsplash.com/photo-1629705580036-8fc96c3b8a02?w=400', price: '$4-8', description: 'Disinfecting toilet cleaner', brands: 'Lysol, Clorox, The Works' },
    { name: 'Tile & Grout Cleaner', image: 'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=400', price: '$6-15', description: 'For bathroom and kitchen tiles', brands: 'Zep, CLR, OxiClean' },
  ],
  'Disposables & Cloths': [
    { name: 'Microfiber Cloths (12-pack)', image: 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=400', price: '$12-25', description: 'Reusable cloths for all surfaces' },
    { name: 'Paper Towels (6-pack)', image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400', price: '$15-25', description: 'For quick cleanups and glass' },
    { name: 'Sponges (10-pack)', image: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=400', price: '$8-15', description: 'Non-scratch and scrubbing sponges' },
    { name: 'Magic Erasers (8-pack)', image: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400', price: '$8-12', description: 'For scuff marks and tough stains', brands: 'Mr. Clean' },
    { name: 'Cleaning Rags (12-pack)', image: 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=400', price: '$10-18', description: 'Cotton or terry cloth rags' },
    { name: 'Trash Bags (Various Sizes)', image: 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=400', price: '$12-20', description: 'For removing debris and waste' },
  ],
  'Safety & Protection': [
    { name: 'Cleaning Gloves (Multiple Pairs)', image: 'https://images.unsplash.com/photo-1603100022002-8b72fb5f2f6c?w=400', price: '$6-15', description: 'Nitrile or latex gloves for protection', brands: 'Playtex, Mr. Clean' },
    { name: 'Face Masks/Respirator', image: 'https://images.unsplash.com/photo-1584634428508-2c24dcb6f07d?w=400', price: '$8-25', description: 'For dust or chemical fumes' },
    { name: 'Safety Glasses', image: 'https://images.unsplash.com/photo-1577219491135-ce391730fb4c?w=400', price: '$5-12', description: 'Eye protection for chemical splashes' },
    { name: 'Apron', image: 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=400', price: '$12-25', description: 'Keep clothes clean during work' },
  ],
  'Transport & Organization': [
    { name: 'Cleaning Caddy', image: 'https://images.unsplash.com/photo-1629705580036-8fc96c3b8a02?w=400', price: '$15-30', description: 'Portable organizer for supplies' },
    { name: 'Rolling Cart', image: 'https://images.unsplash.com/photo-1581858726788-75bc0f1a4471?w=400', price: '$40-80', description: 'For transporting supplies between rooms' },
    { name: 'Storage Bins', image: 'https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?w=400', price: '$20-40', description: 'For organizing and storing supplies' },
    { name: 'Professional Tote/Bag', image: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=400', price: '$25-60', description: 'Branded or professional carrying bag' },
  ],
  'Specialty & Add-Ons': [
    { name: 'Steam Cleaner', image: 'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=400', price: '$80-200', description: 'For deep cleaning and sanitizing', optional: true },
    { name: 'Carpet Cleaner Machine', image: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=400', price: '$150-400', description: 'For carpet deep cleaning services', optional: true },
    { name: 'Window Cleaning Kit', image: 'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=400', price: '$30-60', description: 'Extension pole, squeegee, scrubber', optional: true },
    { name: 'Tile & Grout Brush with Handle', image: 'https://images.unsplash.com/photo-1603712725038-779d45d5a5f8?w=400', price: '$15-30', description: 'For detailed tile cleaning' },
    { name: 'Handheld Vacuum', image: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=400', price: '$40-100', description: 'For quick touch-ups and upholstery' },
    { name: 'Dusting Wand/Swiffer', image: 'https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?w=400', price: '$12-25', description: 'For floors and dusting' },
  ]
};

export default function Products() {
  const [selectedCategory, setSelectedCategory] = useState('Core Tools');

  return (
    <div className="min-h-screen bg-soft-cloud p-6 lg:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 brand-gradient rounded-2xl flex items-center justify-center shadow-lg">
              <Package className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-fredoka font-bold text-graphite mb-2">Cleaning Products Guide</h1>
              <p className="text-lg text-gray-600 font-verdana">Common cleaning supplies with product examples and images</p>
            </div>
          </div>

          <Alert className="border-blue-200 bg-blue-50 rounded-2xl">
            <Info className="w-4 h-4 text-blue-600" />
            <AlertDescription className="text-blue-900 font-verdana">
              <strong>Independent Contractor Notice:</strong> This is a reference guide only. As an independent contractor, you have complete freedom to choose your own products, brands, and methods. These are simply common examples to help you understand what many professionals use.
            </AlertDescription>
          </Alert>
        </motion.div>

        {/* Category Tabs */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="space-y-6">
          <TabsList className="bg-white shadow-lg p-2 flex flex-wrap gap-2 rounded-2xl">
            {Object.keys(PRODUCTS).map(category => (
              <TabsTrigger
                key={category}
                value={category}
                className="rounded-full font-fredoka data-[state=active]:brand-gradient data-[state=active]:text-white"
              >
                {category}
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.entries(PRODUCTS).map(([category, items]) => (
            <TabsContent key={category} value={category}>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((product, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="border-0 shadow-lg hover:shadow-xl transition-all rounded-2xl overflow-hidden group">
                      <div className="relative h-48 overflow-hidden bg-gray-100">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        {product.optional && (
                          <Badge className="absolute top-3 right-3 bg-purple-500 text-white font-fredoka">
                            Optional
                          </Badge>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                          <p className="text-white font-fredoka font-bold text-lg">{product.price}</p>
                        </div>
                      </div>
                      <CardContent className="p-6">
                        <h3 className="font-fredoka font-bold text-graphite text-lg mb-2">{product.name}</h3>
                        <p className="text-sm text-gray-600 font-verdana mb-3">{product.description}</p>
                        {product.brands && (
                          <div className="flex flex-wrap gap-2">
                            {product.brands.split(', ').map((brand, i) => (
                              <Badge key={i} variant="outline" className="text-xs font-verdana">
                                {brand}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Footer Note */}
        <Card className="mt-12 border-0 shadow-xl bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl">
          <CardContent className="p-8">
            <div className="flex items-start gap-4">
              <Sparkles className="w-6 h-6 text-puretask-blue flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-fredoka font-bold text-graphite text-lg mb-2">Your Choice, Your Business</h3>
                <p className="text-gray-700 font-verdana leading-relaxed mb-3">
                  As an independent contractor, you have complete control over which products you use. The brands and items shown here are examples based on what many professionals prefer. You're welcome to use your own trusted products, eco-friendly alternatives, or professional-grade supplies based on your clients' needs and your business preferences.
                </p>
                <p className="text-sm text-gray-600 font-verdana">
                  💡 <strong>Tip:</strong> Check out our Partner Discounts page for exclusive deals on cleaning supplies from trusted brands.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
