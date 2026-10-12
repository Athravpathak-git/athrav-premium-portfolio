import React from 'react';
import { Trophy, Calendar } from 'lucide-react';
import { getAchievements } from '@/lib/data.js';

export const metadata = {
  title: 'Achievements — Athrav Pathak',
  description: 'Honors, recognitions, hackathons, and technical achievements of Athrav Pathak.',
};

export const revalidate = 60;

export default async function AchievementsPage() {
  const achievements = await getAchievements();

  return (
    <div className="relative pt-32 pb-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Page Header */}
      <div className="space-y-4">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full glass-panel text-xs text-slate-400">
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span>Honors & Milestones</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-light text-white tracking-tight">
          Achievements & <span className="font-normal text-metallic">Recognitions</span>
        </h1>
        <p className="text-base sm:text-lg text-slate-400 max-w-2xl leading-relaxed">
          Competitions, hackathons, open-source milestones, and academic awards.
        </p>
      </div>

      {/* Achievements List */}
      {achievements.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {achievements.map((item) => (
            <div
              key={item.id}
              className="p-6 rounded-2xl glass-panel glass-panel-hover flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="text-slate-300 font-medium">{item.issuer || 'Honor'}</span>
                  {item.date && (
                    <span className="flex items-center space-x-1 text-slate-500">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {new Date(item.date).toLocaleDateString('en-US', {
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </span>
                  )}
                </div>

                <h2 className="text-base font-medium text-white">{item.title}</h2>

                {item.description && (
                  <p className="text-xs text-slate-400 leading-relaxed font-light">
                    {item.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 rounded-2xl glass-panel text-center max-w-xl mx-auto space-y-3">
          <Trophy className="w-8 h-8 text-slate-500 mx-auto" />
          <h2 className="text-base font-medium text-white">Achievements Record In Update</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Verified competitive milestones and recognitions will appear here as they are added through the administrator console.
          </p>
        </div>
      )}
    </div>
  );
}
