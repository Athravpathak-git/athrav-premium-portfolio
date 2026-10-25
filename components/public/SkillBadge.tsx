import React from 'react';
import { SkillData } from '@/lib/mock-data';

export function SkillBadge({ skill }: { skill: SkillData }) {
  const getProficiencyColor = (p?: string) => {
    switch (p) {
      case 'Proficient':
        return 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5';
      case 'Intermediate':
        return 'text-silver-300 border-silver-400/20 bg-silver-400/5';
      case 'Exploring':
      default:
        return 'text-amber-400 border-amber-500/20 bg-amber-500/5';
    }
  };

  return (
    <div className="group rounded-xl border border-white/10 hover:border-white/25 bg-zinc-950/60 backdrop-blur-md p-4 transition-all duration-200 hover:bg-zinc-900/60">
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-sm font-medium text-white group-hover:text-silver-200 transition-colors">
          {skill.name}
        </h4>
        {skill.proficiency && (
          <span
            className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${getProficiencyColor(
              skill.proficiency
            )}`}
          >
            {skill.proficiency}
          </span>
        )}
      </div>
      {skill.description && (
        <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
          {skill.description}
        </p>
      )}
    </div>
  );
}
