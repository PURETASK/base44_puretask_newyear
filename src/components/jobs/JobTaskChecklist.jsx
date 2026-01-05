import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckSquare, Square } from 'lucide-react';

export default function JobTaskChecklist({ booking }) {
  const [completedTasks, setCompletedTasks] = useState([]);

  const getDefaultTasks = () => {
    const tasks = [];
    
    if (booking.cleaning_type === 'basic') {
      tasks.push(
        'Dust all surfaces',
        'Vacuum all floors',
        'Mop hard floors',
        'Clean kitchen counters and sink',
        'Clean bathrooms (toilets, sinks, showers)',
        'Take out trash',
        'Wipe down appliance exteriors'
      );
    } else if (booking.cleaning_type === 'deep') {
      tasks.push(
        'Dust all surfaces including baseboards',
        'Vacuum all floors and carpets',
        'Mop all hard floors',
        'Deep clean kitchen (counters, sink, stovetop)',
        'Deep clean bathrooms (scrub tiles, grout)',
        'Clean inside microwave',
        'Wipe down all appliances',
        'Clean light fixtures',
        'Dust ceiling fans',
        'Take out trash'
      );
    } else if (booking.cleaning_type === 'moveout') {
      tasks.push(
        'Deep clean all rooms',
        'Clean inside all cabinets and drawers',
        'Clean inside all appliances',
        'Scrub all bathroom fixtures',
        'Clean baseboards throughout',
        'Clean all light fixtures',
        'Vacuum and mop all floors',
        'Clean windows and window sills',
        'Remove all trash',
        'Final walkthrough inspection'
      );
    }

    // Add additional services tasks
    if (booking.additional_services) {
      if (booking.additional_services.windows > 0) {
        tasks.push(`Clean ${booking.additional_services.windows} window(s)`);
      }
      if (booking.additional_services.blinds > 0) {
        tasks.push(`Clean ${booking.additional_services.blinds} blind set(s)`);
      }
      if (booking.additional_services.oven > 0) {
        tasks.push(`Deep clean ${booking.additional_services.oven} oven(s)`);
      }
      if (booking.additional_services.refrigerator > 0) {
        tasks.push(`Clean inside ${booking.additional_services.refrigerator} refrigerator(s)`);
      }
      if (booking.additional_services.inside_cabinets > 0) {
        tasks.push(`Clean inside ${booking.additional_services.inside_cabinets} cabinet section(s)`);
      }
      if (booking.additional_services.laundry > 0) {
        tasks.push(`Complete ${booking.additional_services.laundry} load(s) of laundry`);
      }
    }

    return tasks;
  };

  const tasks = booking.tasks || getDefaultTasks();

  const toggleTask = (taskIndex) => {
    if (completedTasks.includes(taskIndex)) {
      setCompletedTasks(completedTasks.filter(i => i !== taskIndex));
    } else {
      setCompletedTasks([...completedTasks, taskIndex]);
    }
  };

  const completionPercentage = tasks.length > 0 
    ? Math.round((completedTasks.length / tasks.length) * 100) 
    : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-puretask-blue" />
            Task Checklist
          </CardTitle>
          <div className="text-right">
            <p className="text-2xl font-fredoka font-bold text-puretask-blue">
              {completionPercentage}%
            </p>
            <p className="text-xs text-gray-500 font-verdana">
              {completedTasks.length} of {tasks.length} complete
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 bg-gray-200 rounded-full h-2 overflow-hidden">
          <div 
            className="bg-puretask-blue h-full transition-all duration-300"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>

        <div className="space-y-3">
          {tasks.map((task, index) => (
            <div 
              key={index}
              className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => toggleTask(index)}
            >
              <div className="mt-0.5">
                {completedTasks.includes(index) ? (
                  <CheckSquare className="w-5 h-5 text-fresh-mint" />
                ) : (
                  <Square className="w-5 h-5 text-gray-400" />
                )}
              </div>
              <span 
                className={`font-verdana flex-1 ${
                  completedTasks.includes(index) 
                    ? 'line-through text-gray-500' 
                    : 'text-gray-700'
                }`}
              >
                {task}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}