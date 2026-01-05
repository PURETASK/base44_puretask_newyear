import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SPECIALTY_OPTIONS = [
  { value: 'Pet-Friendly', icon: '🐾', description: 'Experienced with homes that have pets' },
  { value: 'Eco-Warrior', icon: '🌿', description: 'Specializes in eco-friendly cleaning products' },
  { value: 'Deep Clean Expert', icon: '✨', description: 'Expert in thorough deep cleaning' },
  { value: 'Move-Out Specialist', icon: '📦', description: 'Specialist in move-out cleaning' },
  { value: 'Same-Day Available', icon: '⚡', description: 'Can accommodate same-day requests' },
  { value: 'Senior-Friendly', icon: '❤️', description: 'Patient and caring with seniors' },
  { value: 'Child-Safe Products', icon: '👶', description: 'Uses only child-safe cleaning products' },
  { value: 'Allergy-Conscious', icon: '🌸', description: 'Mindful of allergies and sensitivities' },
  { value: 'Organization Pro', icon: '📋', description: 'Excels at organizing and decluttering' },
  { value: 'Post-Construction', icon: '🏗️', description: 'Experienced in post-construction cleanup' }
];

export default function SpecialtiesEditor({ selectedSpecialties = [], specialtyDetails = {}, onSpecialtiesUpdated }) {
  const [specialties, setSpecialties] = useState(selectedSpecialties);
  const [details, setDetails] = useState(specialtyDetails);
  const [expandedSpecialty, setExpandedSpecialty] = useState(null);

  const toggleSpecialty = (specialty) => {
    const updated = specialties.includes(specialty)
      ? specialties.filter(s => s !== specialty)
      : [...specialties, specialty];
    
    setSpecialties(updated);
    if (onSpecialtiesUpdated) {
      onSpecialtiesUpdated(updated, details);
    }
  };

  const updateDetails = (specialty, field, value) => {
    const updated = {
      ...details,
      [specialty]: {
        ...details[specialty],
        [field]: value
      }
    };
    setDetails(updated);
    if (onSpecialtiesUpdated) {
      onSpecialtiesUpdated(specialties, updated);
    }
  };

  return (
    <Card className="border-2 border-indigo-200 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
        <CardTitle className="font-fredoka text-graphite flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          Specialties & Expertise
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <p className="text-sm text-gray-600 font-verdana">
          Select your specialties and add details to stand out to clients looking for specific expertise.
        </p>

        <div className="space-y-3">
          {SPECIALTY_OPTIONS.map((option) => {
            const isSelected = specialties.includes(option.value);
            const isExpanded = expandedSpecialty === option.value;

            return (
              <div key={option.value} className="space-y-2">
                <button
                  onClick={() => toggleSpecialty(option.value)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    isSelected
                      ? 'border-indigo-400 bg-indigo-50'
                      : 'border-gray-200 hover:border-indigo-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center flex-shrink-0">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <div>
                        <p className="font-fredoka font-semibold text-graphite">
                          {option.icon} {option.value}
                        </p>
                        <p className="text-sm text-gray-600 font-verdana">{option.description}</p>
                      </div>
                    </div>
                    {isSelected && (
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedSpecialty(isExpanded ? null : option.value);
                        }}
                        size="sm"
                        variant="ghost"
                        className="text-indigo-600 hover:bg-indigo-100 font-fredoka"
                      >
                        {isExpanded ? 'Hide' : 'Add'} Details
                      </Button>
                    )}
                  </div>
                </button>

                <AnimatePresence>
                  {isSelected && isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="ml-4 border-l-4 border-indigo-300 pl-4 space-y-4"
                    >
                      <div>
                        <Label className="font-fredoka text-sm">Detailed Description</Label>
                        <Textarea
                          value={details[option.value]?.description || ''}
                          onChange={(e) => updateDetails(option.value, 'description', e.target.value)}
                          placeholder={`Describe your ${option.value.toLowerCase()} expertise...`}
                          rows={3}
                          className="rounded-xl font-verdana text-sm"
                        />
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label className="font-fredoka text-sm">Years of Experience</Label>
                          <Input
                            type="number"
                            value={details[option.value]?.years_experience || ''}
                            onChange={(e) => updateDetails(option.value, 'years_experience', e.target.value)}
                            placeholder="e.g., 5"
                            min="0"
                            className="rounded-xl font-verdana"
                          />
                        </div>

                        <div>
                          <Label className="font-fredoka text-sm">Certifications (optional)</Label>
                          <Input
                            value={details[option.value]?.certifications || ''}
                            onChange={(e) => updateDetails(option.value, 'certifications', e.target.value)}
                            placeholder="e.g., Green Cleaning Certified"
                            className="rounded-xl font-verdana"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {specialties.length > 0 && (
          <div className="bg-indigo-50 border-2 border-indigo-200 rounded-xl p-4">
            <p className="text-sm font-fredoka font-semibold text-indigo-900 mb-3">
              Selected Specialties ({specialties.length}):
            </p>
            <div className="flex flex-wrap gap-2">
              {specialties.map(specialty => {
                const option = SPECIALTY_OPTIONS.find(o => o.value === specialty);
                return (
                  <Badge
                    key={specialty}
                    className="bg-white border-2 border-indigo-300 text-indigo-700 font-fredoka"
                  >
                    {option?.icon} {specialty}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}