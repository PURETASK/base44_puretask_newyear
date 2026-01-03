import React from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Circle, Camera, Edit, Video, Star, Sparkles } from 'lucide-react';

export default function WaitingTasksList({ cleanerProfile, onTaskComplete }) {
  const navigate = useNavigate();

  const tasks = [
    {
      id: 'bio',
      title: 'Write a compelling bio',
      description: 'Tell clients about your experience and why they should choose you',
      completed: cleanerProfile.bio && cleanerProfile.bio.length >= 50,
      icon: Edit,
      reward: 10,
      action: () => navigate(createPageUrl('Profile'))
    },
    {
      id: 'photo',
      title: 'Upload profile photo',
      description: 'Profiles with photos get 3x more bookings - make a great first impression!',
      completed: !!cleanerProfile.profile_photo_url,
      icon: Camera,
      reward: 15,
      action: () => navigate(createPageUrl('Profile'))
    },
    {
      id: 'products',
      title: 'Upload product photos',
      description: 'Show clients your cleaning products (+34% booking rate)',
      completed: cleanerProfile.product_verification_photos?.length > 0,
      icon: Camera,
      reward: 20,
      action: () => navigate(createPageUrl('Profile') + '?section=products')
    },
    {
      id: 'video',
      title: 'Record intro video (30 sec)',
      description: 'Stand out with a personal introduction video',
      completed: !!cleanerProfile.video_intro_url,
      icon: Video,
      reward: 25,
      action: () => navigate(createPageUrl('Profile') + '?section=video')
    },
    {
      id: 'services',
      title: 'Add all your services',
      description: 'More services = more opportunities. Add at least 5 services',
      completed: cleanerProfile.service_tags?.length >= 5,
      icon: Star,
      reward: 10,
      action: () => navigate(createPageUrl('Profile') + '?section=services')
    }
  ];

  const completedTasks = tasks.filter(t => t.completed).length;
  const totalReward = tasks.filter(t => t.completed).reduce((sum, t) => sum + t.reward, 0);
  const maxReward = tasks.reduce((sum, t) => sum + t.reward, 0);
  const progress = (completedTasks / tasks.length) * 100;

  return (
    <Card className="border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-emerald-600" />
            <span>Boost Your Profile While You Wait</span>
          </div>
          <Badge className="bg-emerald-500 text-white text-sm px-3 py-1">
            {completedTasks}/{tasks.length} Complete
          </Badge>
        </CardTitle>
        <div className="mt-4">
          <Progress value={progress} className="h-3" />
          <div className="flex items-center justify-between mt-3">
            <p className="text-sm text-slate-600">
              <strong className="text-emerald-700">+{totalReward}/{maxReward} profile points</strong> earned
            </p>
            <p className="text-xs text-slate-600">
              Complete profiles get <strong className="text-emerald-700">3x more bookings</strong>
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {tasks.map(task => {
          const Icon = task.icon;
          return (
            <div
              key={task.id}
              className={`p-4 rounded-lg border-2 transition-all ${
                task.completed
                  ? 'bg-white border-emerald-300 shadow-sm'
                  : 'bg-white border-slate-200 hover:border-emerald-300 hover:shadow-md'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  {task.completed ? (
                    <CheckCircle className="w-6 h-6 text-emerald-500" />
                  ) : (
                    <Circle className="w-6 h-6 text-slate-400" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <Icon className="w-4 h-4 text-slate-600" />
                    <h4 className="font-semibold text-slate-900">{task.title}</h4>
                    {!task.completed && (
                      <Badge variant="outline" className="text-emerald-600 border-emerald-300 text-xs">
                        +{task.reward} pts
                      </Badge>
                    )}
                    {task.completed && (
                      <Badge className="bg-emerald-500 text-white text-xs">
                        ✓ Done
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-slate-600 mb-3">{task.description}</p>
                  {!task.completed && (
                    <Button
                      size="sm"
                      onClick={() => {
                        task.action();
                        if (onTaskComplete) {
                          onTaskComplete(task.id);
                        }
                      }}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white"
                    >
                      Complete Now
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {completedTasks === tasks.length && (
          <div className="p-4 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg text-white text-center">
            <Sparkles className="w-8 h-8 mx-auto mb-2" />
            <h3 className="font-bold text-lg mb-1">🎉 Perfect Profile!</h3>
            <p className="text-sm text-emerald-100">
              You've completed all tasks. Your profile is ready to attract clients!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}