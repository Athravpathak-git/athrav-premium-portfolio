import React from 'react';
import { SkillData } from '@/lib/mock-data';

export function SkillBadge({ skill }: { skill: SkillData }) {
  const getProficiencyStyle = (p?: string) => {
    switch (p) {
      case 'Proficient':
        return 'text-burgundy dark:text-rosegold-200 border-rosegold/50 dark:border-rosegold/60 bg-rosegold-50 dark:bg-rosegold-900/30 font-semibold';
      case 'Intermediate':
        return 'text-charcoal dark:text-cream border-border-soft dark:border-charcoal-600 bg-cream-100 dark:bg-charcoal-700 font-medium';
      case 'Exploring':
      default:
        return 'text-charcoal/70 dark:text-cream/70 border-border-soft dark:border-charcoal-600 bg-cream-50 dark:bg-charcoal-900/60';
    }
  };

  return (
    <div className="group rounded-xl border border-border-soft hover:border-rosegold dark:border-charcoal-700 dark:hover:border-rosegold bg-white dark:bg-charcoal-800 p-4 transition-all duration-200 hover:shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-sm font-bold text-burgundy dark:text-cream group-hover:text-burgundy-500 dark:group-hover:text-rosegold transition-colors">
          {skill.name}
        </h4>
        {skill.proficiency && (
          <span
            className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${getProficiencyStyle(
              skill.proficiency
            )}`}
          >
            {skill.proficiency}
          </span>
        )}
      </div>
      {skill.description && (
        <p className="text-xs text-charcoal/80 dark:text-cream/80 mt-2 leading-relaxed">
          {skill.description}
        </p>
      )}
    </div>
  );
}
