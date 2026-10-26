import React from 'react';
import { SkillData } from '@/lib/mock-data';

export function SkillBadge({ skill }: { skill: SkillData }) {
  const getProficiencyStyle = (p?: string) => {
    switch (p) {
      case 'Proficient':
        return 'text-burgundy border-rosegold/50 bg-rosegold-50 font-semibold';
      case 'Intermediate':
        return 'text-charcoal border-border-soft bg-cream-100 font-medium';
      case 'Exploring':
      default:
        return 'text-charcoal/70 border-border-soft bg-cream-50';
    }
  };

  return (
    <div className="group rounded-xl border border-border-soft hover:border-rosegold bg-white p-4 transition-all duration-200 hover:shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-sm font-bold text-burgundy group-hover:text-burgundy-500 transition-colors">
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
        <p className="text-xs text-charcoal/80 mt-2 leading-relaxed">
          {skill.description}
        </p>
      )}
    </div>
  );
}
