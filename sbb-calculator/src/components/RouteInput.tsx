import React, { useState, useEffect } from 'react';
import { Trash2, Clock, MapPin, ToggleLeft, ToggleRight } from 'lucide-react';
import { Route } from '../services/CalculatorService';
import { Language } from '../translations';

interface RouteInputProps {
  route: Route;
  routeIndex: number;
  language: Language;
  t: (key: string, params?: Record<string, string | number>) => string;
  onUpdateRoute: (id: number, updates: Partial<Route>) => void;
  onRemoveRoute: (id: number) => void;
  showRemoveButton: boolean;
}

export const RouteInput: React.FC<RouteInputProps> = ({
  route,
  routeIndex,
  language,
  t,
  onUpdateRoute,
  onRemoveRoute,
  showRemoveButton
}) => {
  const handleTripsChange = (value: string) => {
    if (value === '') {
      onUpdateRoute(route.id, { trips: '' });
      return;
    }
    const parsed = parseInt(value);
    onUpdateRoute(route.id, { trips: isNaN(parsed) ? value : Math.max(0, parsed) });
  };

  const handleCostChange = (value: string) => {
    if (value === '') {
      onUpdateRoute(route.id, { cost: '' });
      return;
    }
    // Replace comma with period for European users
    const normalizedValue = value.replace(',', '.');
    const parsed = parseFloat(normalizedValue);
    onUpdateRoute(route.id, { cost: isNaN(parsed) ? value : Math.max(0, parsed) });
  };

  return (
    <div className={`relative p-6 rounded-xl bg-gradient-to-br ${route.colorScheme.bg} ${route.colorScheme.border} border-2 shadow-sm`}>
      {showRemoveButton && (
        <button
          onClick={() => onRemoveRoute(route.id)}
          className="absolute top-3 right-3 p-1.5 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
          aria-label={t('removeRoute')}
        >
          <Trash2 size={16} />
        </button>
      )}

      <div className="space-y-4">
        <div className={`flex items-center gap-2 ${route.colorScheme.text} font-semibold text-lg`}>
          <MapPin size={18} className={route.colorScheme.accent} />
          {t('route')} {routeIndex + 1}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-medium ${route.colorScheme.text} mb-1`}>
              {route.frequencyType === 'weekly' ? t('tripsPerWeek') : t('tripsPerMonth')}
            </label>
            <input
              type="text"
              value={route.trips || ''}
              onChange={(e) => handleTripsChange(e.target.value)}
              className={`w-full px-3 py-2 border ${route.colorScheme.border200} rounded-lg ${route.colorScheme.focusRing} focus:outline-none focus:ring-2 focus:border-transparent`}
              placeholder="0"
            />
          </div>

          <div>
            <label className={`block text-sm font-medium ${route.colorScheme.text} mb-1`}>
              {t('costPerTrip')}
            </label>
            <div className="relative">
              <input
                type="text"
                value={route.cost || ''}
                onChange={(e) => handleCostChange(e.target.value)}
                className={`w-full px-3 py-2 border ${route.colorScheme.border200} rounded-lg ${route.colorScheme.focusRing} focus:outline-none focus:ring-2 focus:border-transparent pr-12`}
                placeholder="0.00"
              />
              <span className={`absolute right-3 top-2 ${route.colorScheme.accent} text-sm font-medium`}>
                CHF
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-medium ${route.colorScheme.text} mb-1`}>
              {t('frequency')}
            </label>
            <select
              value={route.frequencyType}
              onChange={(e) => onUpdateRoute(route.id, { frequencyType: e.target.value as 'weekly' | 'monthly' })}
              className={`w-full px-3 py-2 border ${route.colorScheme.border200} rounded-lg ${route.colorScheme.focusRing} focus:outline-none focus:ring-2 focus:border-transparent`}
            >
              <option value="weekly">{t('weekly')}</option>
              <option value="monthly">{t('monthly')}</option>
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium ${route.colorScheme.text} mb-1`}>
              <Clock size={14} className="inline mr-1" />
              {t('duration')}
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                max="12"
                value={route.durationMonths}
                onChange={(e) => onUpdateRoute(route.id, { durationMonths: Math.max(1, Math.min(12, parseInt(e.target.value) || 1)) })}
                className={`w-full px-3 py-2 border ${route.colorScheme.border200} rounded-lg ${route.colorScheme.focusRing} focus:outline-none focus:ring-2 focus:border-transparent pr-20`}
              />
              <span className={`absolute right-3 top-2 ${route.colorScheme.accent} text-sm`}>
                {t('months')}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div 
            className={`flex items-center justify-between p-3 ${route.colorScheme.summaryBg} rounded-lg ${route.colorScheme.border300} border cursor-pointer`}
            onClick={() => onUpdateRoute(route.id, { isHalbtaxPrice: !route.isHalbtaxPrice })}
          >
            <div>
              <div className={`font-medium ${route.colorScheme.text}`}>
                {t('isHalbtaxPrice')}
              </div>
              <div className={`text-sm ${route.colorScheme.accent}`}>
                {t('halbtaxPriceExplanation')}
              </div>
            </div>
            <button className={route.colorScheme.accent}>
              {route.isHalbtaxPrice ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
            </button>
          </div>

          <div 
            className={`flex items-center justify-between p-3 ${route.colorScheme.summaryBg} rounded-lg ${route.colorScheme.border300} border cursor-pointer`}
            onClick={() => onUpdateRoute(route.id, { isGANightEligible: !route.isGANightEligible })}
          >
            <div>
              <div className={`font-medium ${route.colorScheme.text}`}>
                {t('gaNightEligible')}
              </div>
              <div className={`text-sm ${route.colorScheme.accent}`}>
                {t('gaNightEligibleExplanation')}
              </div>
            </div>
            <button className={route.colorScheme.accent}>
              {route.isGANightEligible ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};