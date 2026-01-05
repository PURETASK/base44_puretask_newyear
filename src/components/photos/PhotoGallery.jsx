import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, ChevronLeft, ChevronRight, ImageIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function PhotoGallery({ photoPairs }) {
  const [selectedPair, setSelectedPair] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const openGallery = (pair, index) => {
    setSelectedPair(pair);
    setCurrentIndex(index);
  };

  const closeGallery = () => {
    setSelectedPair(null);
  };

  const nextPair = () => {
    setCurrentIndex((prev) => (prev + 1) % photoPairs.length);
    setSelectedPair(photoPairs[(currentIndex + 1) % photoPairs.length]);
  };

  const prevPair = () => {
    setCurrentIndex((prev) => (prev - 1 + photoPairs.length) % photoPairs.length);
    setSelectedPair(photoPairs[(currentIndex - 1 + photoPairs.length) % photoPairs.length]);
  };

  if (!photoPairs || photoPairs.length === 0) {
    return (
      <div className="text-center py-12 bg-slate-50 rounded-xl">
        <ImageIcon className="w-12 h-12 mx-auto text-slate-300 mb-3" />
        <p className="text-slate-500">No photos available yet</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {photoPairs.map((pair, index) => (
          <motion.div
            key={pair.id}
            
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            
            className="relative group cursor-pointer"
            onClick={() => openGallery(pair, index)}
          >
            <div className="aspect-square rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
              <img
                src={pair.after_photo_url}
                alt={`${pair.area} after`}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                <Badge className="bg-white text-slate-900">{pair.area}</Badge>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <Dialog open={!!selectedPair} onOpenChange={closeGallery}>
        <DialogContent className="max-w-5xl p-0 bg-black">
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
              onClick={closeGallery}
            >
              <X className="w-6 h-6" />
            </Button>

            {selectedPair && (
              <div className="p-8">
                <div className="mb-6 text-center">
                  <Badge className="bg-white text-slate-900 text-lg px-4 py-2">
                    {selectedPair.area}
                  </Badge>
                  <p className="text-white/80 text-sm mt-2">
                    {currentIndex + 1} of {photoPairs.length}
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-white font-semibold mb-3">Before</p>
                    <img
                      src={selectedPair.before_photo_url}
                      alt="Before"
                      className="w-full h-96 object-cover rounded-lg"
                    />
                  </div>
                  <div>
                    <p className="text-white font-semibold mb-3">After</p>
                    <img
                      src={selectedPair.after_photo_url}
                      alt="After"
                      className="w-full h-96 object-cover rounded-lg"
                    />
                  </div>
                </div>

                <div className="flex justify-between mt-8">
                  <Button
                    variant="outline"
                    onClick={prevPair}
                    className="bg-white/10 text-white hover:bg-white/20"
                  >
                    <ChevronLeft className="w-5 h-5 mr-2" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    onClick={nextPair}
                    className="bg-white/10 text-white hover:bg-white/20"
                  >
                    Next
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}