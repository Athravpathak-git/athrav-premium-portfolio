import React from 'react';
import { SkillData } from '@/lib/mock-data';

export function SkillBadge({ skill }: { skill: SkillData }) {
  const getProficiencyStyle = (p?: string) => {
    switch (p) {
      case 'Proficient':
        return 'text-forest dark:text-ivory border-sage-400 bg-sage-100/60 dark:bg-forest-800';
      case 'Intermediate':
        return 'text-champagne-800 dark:text-champagne-300 border-champagne-300 bg-champagne-50 dark:bg-forest-800';
      case 'Exploring':
      default:
        return 'text-forest-600 dark:text-sage-200 border-cream-300 bg-cream-100 dark:bg-forest-800';
    }
  };

  return (
    <div className="group rounded-xl border border-cream-300 dark:border-forest-700 hover:border-champagne-500 bg-ivory dark:bg-forest-900 p-4 transition-all duration-200 hover:shadow-md">
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-sm font-bold text-forest dark:text-ivory group-hover:text-forest-600 transition-colors">
          {skill.name}
        </h4>
        {skill.proficiency && (
          <span
            className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-full border ${getProficiencyStyle(
              skill.proficiency
            )}`}
          >
            {skill.proficiency}
          </span>
        )}
      </div>
      {skill.description && (
        <p className="text-xs text-forest-700/80 dark:text-sage-100 mt-2 leading-relaxed">
          {skill.description}
        </p>
      )}
    </div>
  );
}
