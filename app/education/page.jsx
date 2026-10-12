import React from 'react';
import { GraduationCap, Calendar, BookOpen } from 'lucide-react';
import { getEducation } from '@/lib/data.js';

export const metadata = {
  title: 'Education — Athrav Pathak',
  description: 'Academic background, degree programs, and technical coursework of Athrav Pathak.',
};

export const revalidate = 60;

export default async function EducationPage() {
  const educationList = await getEducation();

  return (
    <div className="relative pt-32 pb-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Page Header */}
      <div className="space-y-4">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full glass-panel text-xs text-slate-400">
          <GraduationCap className="w-3.5 h-3.5 text-sky-400" />
          <span>Academic Foundation</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-light text-white tracking-tight">
          Education & <span className="font-normal text-metallic">Academics</span>
        </h1>
        <p className="text-base sm:text-lg text-slate-400 max-w-2xl leading-relaxed">
          Foundational engineering principles, computer science theory, mathematics, and collaborative research.
        </p>
      </div>

      {/* Education List */}
      {educationList.length > 0 ? (
        <div className="space-y-6">
          {educationList.map((edu) => (
            <div
              key={edu.id}
              className="p-6 sm:p-8 rounded-2xl glass-panel glass-panel-hover space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-xl font-medium text-white">{edu.institution}</h2>
                  <p className="text-sm text-slate-300 font-normal">
                    {edu.degree}
                    {edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''}
                  </p>
                </div>
                {(edu.startDate || edu.endDate) && (
                  <span className="flex items-center space-x-1 text-xs text-slate-400">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>
                      {edu.startDate ? new Date(edu.startDate).getFullYear() : ''}
                      {edu.endDate ? ` - ${new Date(edu.endDate).getFullYear()}` : ' - Present'}
                    </span>
                  </span>
                )}
              </div>

              {edu.grade && (
                <div className="text-xs text-slate-400">
                  <span className="text-slate-500">Academic Standing: </span>
                  <span className="text-slate-200 font-medium">{edu.grade}</span>
                </div>
              )}

              {edu.description && (
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-light">
                  {edu.description}
                </p>
              )}

              {edu.activities && (
                <div className="pt-2 text-xs text-slate-400 border-t border-white/[0.06]">
                  <span className="text-slate-500 font-medium">Activities & Societies: </span>
                  <span>{edu.activities}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 rounded-2xl glass-panel text-center max-w-xl mx-auto space-y-3">
          <GraduationCap className="w-8 h-8 text-slate-500 mx-auto" />
          <h2 className="text-base font-medium text-white">Academic Details In Review</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Institutional academic history will appear here once entered and verified through the administrative console.
          </p>
        </div>
      )}
    </div>
  );
}
