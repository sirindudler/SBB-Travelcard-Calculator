import React from 'react';
import { Trash2, Clock, MapPin, ToggleLeft, ToggleRight, Train, CreditCard } from 'lucide-react';
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
    const numValue = value === '' ? '' : Math.max(0, parseInt(value) || 0);
    onUpdateRoute(route.id, { trips: numValue });
  };

  const handleCostChange = (value: string) => {
    const numValue = value === '' ? '' : Math.max(0, parseFloat(value) || 0);
    onUpdateRoute(route.id, { cost: numValue });
  };

  const handleNameChange = (value: string) => {
    onUpdateRoute(route.id, { name: value });
  };

  const handleFromChange = (value: string) => {
    onUpdateRoute(route.id, { from: value });
  };

  const handleToChange = (value: string) => {
    onUpdateRoute(route.id, { to: value });
  };

  const handleDoublePrice = () => {
    const currentCost = typeof route.cost === 'number' ? route.cost : parseFloat(route.cost as string) || 0;
    if (currentCost > 0) {
      onUpdateRoute(route.id, { cost: currentCost * 2 });
    }
  };

  const generateSBBUrl = (from: string, to: string): string => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    const stops = [
      {
        value: "",
        type: "ID",
        label: from
      },
      {
        value: "",
        type: "ID", 
        label: to
      }
    ];
    
    const stopsParam = encodeURIComponent(JSON.stringify(stops));
    const dateParam = encodeURIComponent(`"${dateStr}"`);
    
    return `https://www.sbb.ch/de?stops=${stopsParam}&date=${dateParam}&time=%2212:00%22&moment=%22DEPARTURE%22`;
  };

  const handleCheckSBBPrices = () => {
    if (route.from?.trim() && route.to?.trim()) {
      const url = generateSBBUrl(route.from.trim(), route.to.trim());
      window.open(url, '_blank');
    }
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
          <input
            type="text"
            value={route.name}
            onChange={(e) => handleNameChange(e.target.value)}
            className={`bg-transparent border-b-2 border-dashed ${route.colorScheme.border200} hover:${route.colorScheme.border300} focus:border-solid focus:${route.colorScheme.focusRing} outline-none font-semibold text-lg ${route.colorScheme.text} placeholder-gray-400 min-w-0 flex-1 px-1 transition-all`}
            placeholder={`${t('route')} ${routeIndex + 1}`}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`flex items-center gap-2 text-sm font-medium ${route.colorScheme.text} mb-1`}>
              <Train size={14} />
              {t('fromStation')}
            </label>
            <input
              type="text"
              value={route.from}
              onChange={(e) => handleFromChange(e.target.value)}
              className={`w-full px-3 py-2 border ${route.colorScheme.border200} rounded-lg ${route.colorScheme.focusRing} focus:outline-none focus:ring-2 focus:border-transparent`}
              placeholder="e.g. Zürich HB"
            />
          </div>

          <div>
            <label className={`flex items-center gap-2 text-sm font-medium ${route.colorScheme.text} mb-1`}>
              <Train size={14} />
              {t('toStation')}
            </label>
            <input
              type="text"
              value={route.to}
              onChange={(e) => handleToChange(e.target.value)}
              className={`w-full px-3 py-2 border ${route.colorScheme.border200} rounded-lg ${route.colorScheme.focusRing} focus:outline-none focus:ring-2 focus:border-transparent`}
              placeholder="e.g. Bern"
            />
          </div>
        </div>

        {route.from?.trim() && route.to?.trim() && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleCheckSBBPrices}
              className={`px-4 py-2 ${route.colorScheme.buttonBg} text-white rounded-lg hover:brightness-110 flex items-center gap-2 text-sm font-medium transition-all`}
              title={t('checkSBBPricesTooltip')}
            >
              <Train size={16} />
              {t('checkSBBPrices')}
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-medium ${route.colorScheme.text} mb-1`}>
              {t('tripsPerFrequency', { frequency: t(route.frequencyType) })}
            </label>
            <input
              type="number"
              min="0"
              value={route.trips}
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
                type="number"
                min="0"
                step="0.10"
                value={route.cost}
                onChange={(e) => handleCostChange(e.target.value)}
                className={`w-full px-3 py-2 border ${route.colorScheme.border200} rounded-lg ${route.colorScheme.focusRing} focus:outline-none focus:ring-2 focus:border-transparent pr-20`}
                placeholder="0.00"
              />
              <div className="absolute right-0 top-0 w-1/4 h-full">
                <button
                  type="button"
                  onClick={handleDoublePrice}
                  disabled={!route.cost || (typeof route.cost === 'string' && route.cost === '') || Number(route.cost) === 0}
                  className={`w-full h-full rounded-r-lg ${route.colorScheme.buttonBg} text-white hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-bold text-sm relative transition-all duration-200`}
                  data-tooltip={t('doublePriceTooltip')}
                >
                  ×2
                </button>
              </div>
              <span className={`absolute right-1/4 top-2 ${route.colorScheme.accent} text-sm font-medium pr-2`}>
                CHF
              </span>
            </div>
            
            <div className={`bg-white p-3 rounded-lg border ${route.colorScheme.border200} mt-2`}>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`halbtax-price-${route.id}`}
                  checked={route.isHalbtaxPrice}
                  onChange={(e) => onUpdateRoute(route.id, { isHalbtaxPrice: e.target.checked })}
                  className={`w-4 h-4 ${route.colorScheme.accent} border-2 ${route.colorScheme.border200} rounded-md ${route.colorScheme.focusRing.split(' ')[0]} transition-all`}
                />
                <label htmlFor={`halbtax-price-${route.id}`} className={`text-sm font-medium ${route.colorScheme.text} cursor-pointer flex-1`}>
                  <span className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    <span className="text-sm">{t('priceAlreadyHalbtax')}</span>
                  </span>
                </label>
              </div>
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