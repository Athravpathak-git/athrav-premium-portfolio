import React from 'react';
import { Briefcase, Calendar, MapPin } from 'lucide-react';
import { getExperiences } from '@/lib/data.js';

export const metadata = {
  title: 'Experience — Athrav Pathak',
  description: 'Professional experience, engineering internships, and technical impact.',
};

export const revalidate = 60;

export default async function ExperiencePage() {
  const experiences = await getExperiences();

  return (
    <div className="relative pt-32 pb-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Page Header */}
      <div className="space-y-4">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full glass-panel text-xs text-slate-400">
          <Briefcase className="w-3.5 h-3.5 text-sky-400" />
          <span>Career Track</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-light text-white tracking-tight">
          Experience & <span className="font-normal text-metallic">Internships</span>
        </h1>
        <p className="text-base sm:text-lg text-slate-400 max-w-2xl leading-relaxed">
          Professional engineering positions, team collaborations, and contributions to technical deliverables.
        </p>
      </div>

      {/* Experience Timeline */}
      {experiences.length > 0 ? (
        <div className="space-y-8 relative before:absolute before:inset-0 before:left-3 sm:before:left-5 before:w-0.5 before:bg-white/10">
          {experiences.map((exp) => (
            <div key={exp.id} className="relative pl-8 sm:pl-12 group">
              {/* Timeline marker */}
              <div className="absolute left-1.5 sm:left-3.5 top-2 w-3.5 h-3.5 rounded-full bg-slate-800 border-2 border-slate-400 group-hover:border-sky-400 transition-colors" />

              <div className="p-6 rounded-2xl glass-panel glass-panel-hover space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <h2 className="text-lg font-medium text-white">{exp.role}</h2>
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <span className="text-sm font-medium text-slate-300">{exp.company}</span>
                      {exp.employmentType && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-300 border border-sky-500/20 font-medium">
                          {exp.employmentType}
                        </span>
                      )}
                      {exp.workplaceType && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-slate-400 border border-white/10">
                          {exp.workplaceType}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 shrink-0 self-start">
                    {exp.location && (
                      <span className="flex items-center space-x-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        <span>{exp.location}</span>
                      </span>
                    )}
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>
                        {new Date(exp.startDate).toLocaleDateString('en-US', {
                          month: 'short',
                          year: 'numeric',
                        })}{' '}
                        –{' '}
                        {exp.isCurrent
                          ? 'Present'
                          : exp.endDate
                          ? new Date(exp.endDate).toLocaleDateString('en-US', {
                              month: 'short',
                              year: 'numeric',
                            })
                          : 'Present'}
                      </span>
                    </span>
                  </div>
                </div>

                <div className="text-xs sm:text-sm text-slate-400 leading-relaxed whitespace-pre-line font-light">
                  {exp.description}
                </div>

                {exp.technologies && exp.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {exp.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="text-[11px] px-2.5 py-0.5 rounded-md bg-white/[0.04] text-slate-300 border border-white/[0.06]"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 rounded-2xl glass-panel text-center max-w-xl mx-auto space-y-3">
          <Briefcase className="w-8 h-8 text-slate-500 mx-auto" />
          <h2 className="text-base font-medium text-white">Experience Timeline In Curation</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Verified roles and internships are managed securely via PostgreSQL and will be published via the administrator console.
          </p>
        </div>
      )}
    </div>
  );
}
