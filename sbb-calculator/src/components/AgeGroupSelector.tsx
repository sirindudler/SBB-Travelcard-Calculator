import React from 'react';
import { User } from 'lucide-react';
import { AgeGroup } from '../pricing';

interface AgeGroupSelectorProps {
  selectedAge: AgeGroup;
  onAgeChange: (age: AgeGroup) => void;
  t: (key: string) => string;
}

export const AgeGroupSelector: React.FC<AgeGroupSelectorProps> = ({
  selectedAge,
  onAgeChange,
  t
}) => {
  const ageGroups: { value: AgeGroup; label: string }[] = [
    { value: 'kind', label: t('kind') },
    { value: 'jugend', label: t('jugend') },
    { value: 'fuenfundzwanzig', label: t('fuenfundzwanzig') },
    { value: 'erwachsene', label: t('erwachsene') },
    { value: 'senior', label: t('senior') },
    { value: 'behinderung', label: t('behinderung') }
  ];

  return (
    <div>
      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
        <User size={16} className="text-red-600" />
        {t('ageGroup')}
      </label>
      <select
        value={selectedAge}
        onChange={(e) => onAgeChange(e.target.value as AgeGroup)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:outline-none"
      >
        {ageGroups.map((group) => (
          <option key={group.value} value={group.value}>
            {group.label}
          </option>
        ))}
      </select>
    </div>
  );
};