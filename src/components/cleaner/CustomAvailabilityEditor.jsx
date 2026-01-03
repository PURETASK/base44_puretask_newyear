import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Plus, X, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const TIME_SLOTS = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
];

export default function CustomAvailabilityEditor({ customSlots = [], onSlotsUpdated }) {
  const [slots, setSlots] = useState(customSlots);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSlot, setNewSlot] = useState({
    day_of_week: 'Monday',
    slots: [{ start_time: '09:00', end_time: '17:00', available: true }]
  });

  const addTimeSlot = () => {
    setNewSlot({
      ...newSlot,
      slots: [...newSlot.slots, { start_time: '09:00', end_time: '17:00', available: true }]
    });
  };

  const removeTimeSlot = (index) => {
    setNewSlot({
      ...newSlot,
      slots: newSlot.slots.filter((_, i) => i !== index)
    });
  };

  const updateTimeSlot = (index, field, value) => {
    const updated = [...newSlot.slots];
    updated[index] = { ...updated[index], [field]: value };
    setNewSlot({ ...newSlot, slots: updated });
  };

  const saveSlot = () => {
    const updated = [...slots, newSlot];
    setSlots(updated);
    if (onSlotsUpdated) {
      onSlotsUpdated(updated);
    }
    setNewSlot({
      day_of_week: 'Monday',
      slots: [{ start_time: '09:00', end_time: '17:00', available: true }]
    });
    setShowAddForm(false);
  };

  const removeSlot = (index) => {
    const updated = slots.filter((_, i) => i !== index);
    setSlots(updated);
    if (onSlotsUpdated) {
      onSlotsUpdated(updated);
    }
  };

  return (
    <Card className="border-2 border-green-200 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
        <CardTitle className="font-fredoka text-graphite flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-green-600" />
            Custom Availability Slots
          </div>
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            size="sm"
            className="bg-green-500 hover:bg-green-600 text-white font-fredoka"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Slot
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <p className="text-sm text-gray-600 font-verdana">
          Define specific time slots for each day to give clients precise booking windows. This overrides your general availability.
        </p>

        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-2 border-green-200 rounded-xl p-6 space-y-4 bg-green-50"
            >
              <h3 className="font-fredoka font-bold text-graphite">Add Custom Availability</h3>

              <div>
                <label className="text-sm font-fredoka font-semibold text-gray-700 mb-2 block">
                  Day of Week
                </label>
                <select
                  value={newSlot.day_of_week}
                  onChange={(e) => setNewSlot({ ...newSlot, day_of_week: e.target.value })}
                  className="w-full p-2 border-2 border-gray-300 rounded-xl font-verdana"
                >
                  {DAYS.map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-fredoka font-semibold text-gray-700">
                    Time Slots
                  </label>
                  <Button
                    onClick={addTimeSlot}
                    size="sm"
                    variant="outline"
                    className="border-green-400 text-green-600 hover:bg-green-50 font-fredoka"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add Slot
                  </Button>
                </div>

                {newSlot.slots.map((slot, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-white p-3 rounded-lg border-2 border-gray-200">
                    <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <select
                      value={slot.start_time}
                      onChange={(e) => updateTimeSlot(idx, 'start_time', e.target.value)}
                      className="flex-1 p-2 border rounded-lg font-verdana text-sm"
                    >
                      {TIME_SLOTS.map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                    <span className="text-gray-500 font-verdana">to</span>
                    <select
                      value={slot.end_time}
                      onChange={(e) => updateTimeSlot(idx, 'end_time', e.target.value)}
                      className="flex-1 p-2 border rounded-lg font-verdana text-sm"
                    >
                      {TIME_SLOTS.map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                    {newSlot.slots.length > 1 && (
                      <Button
                        onClick={() => removeTimeSlot(idx)}
                        size="icon"
                        variant="ghost"
                        className="text-red-600 hover:bg-red-50 flex-shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  onClick={() => setShowAddForm(false)}
                  variant="outline"
                  className="font-fredoka"
                >
                  Cancel
                </Button>
                <Button
                  onClick={saveSlot}
                  className="bg-green-500 hover:bg-green-600 text-white font-fredoka"
                >
                  Save Availability
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {slots.length > 0 ? (
          <div className="space-y-3">
            {slots.map((slot, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white border-2 border-green-200 rounded-xl p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <Badge className="bg-green-500 text-white font-fredoka mb-2">
                      {slot.day_of_week}
                    </Badge>
                  </div>
                  <Button
                    onClick={() => removeSlot(idx)}
                    size="icon"
                    variant="ghost"
                    className="text-red-600 hover:bg-red-50"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {slot.slots.map((timeSlot, tIdx) => (
                    <div key={tIdx} className="flex items-center gap-2 text-sm font-verdana text-gray-700">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span>{timeSlot.start_time} - {timeSlot.end_time}</span>
                      {timeSlot.available && (
                        <Badge variant="outline" className="text-xs">Available</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="font-fredoka font-semibold mb-1">No custom slots defined</p>
            <p className="text-sm font-verdana">Add specific time slots to give clients more booking options</p>
          </div>
        )}

        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
          <p className="text-sm font-fredoka font-semibold text-blue-900 mb-2">💡 Pro Tip:</p>
          <p className="text-sm text-blue-800 font-verdana">
            Custom slots help clients book during your preferred hours. You can add multiple slots per day or define specific dates.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}