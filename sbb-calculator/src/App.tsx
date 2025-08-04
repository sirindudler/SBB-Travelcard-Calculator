import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Calculator, Train, CreditCard, ToggleLeft, ToggleRight, Plus, Trash2, Globe } from 'lucide-react';
import { Language, useTranslation } from './translations';

// Types for better TypeScript
type AgeGroup = 'jugend' | 'erwachsene';
type InputMode = 'simple' | 'direct';

interface Route {
  id: number;
  trips: number;
  cost: number;
  isHalbtaxPrice: boolean;
}

interface CalculationResults {
  yearlySpendingFull: number;
  halbtaxTicketCosts: number;
  noAboTotal: number;
  halbtaxTotal: number;
  halbtaxPlusOptions: any[];
  gaTotal: number;
  options: any[];
  bestOption: any;
}

interface HalbtaxPlusOption {
  cost: number;
  credit: number;
}

interface PriceStructure {
  halbtax: Record<AgeGroup, number>;
  ga: Record<AgeGroup, number>;
  halbtaxPlus: Record<AgeGroup, Record<string, HalbtaxPlusOption>>;
}

const SBBCalculator: React.FC = () => {
  const [age, setAge] = useState<AgeGroup>('jugend');
  const [inputMode, setInputMode] = useState<InputMode>('simple');
  const [language, setLanguage] = useState<Language>('en');
  
  // Simple input - Strecken (Array)
  const [routes, setRoutes] = useState<Route[]>([
    { id: 1, trips: 2, cost: 27, isHalbtaxPrice: false }
  ]);
  
  // Direct input
  const [yearlySpendingDirect, setYearlySpendingDirect] = useState<number>(2808);
  
  const [results, setResults] = useState<CalculationResults | null>(null);

  // Use translation hook
  const t = useTranslation(language);

  // Memoize static data to prevent unnecessary re-renders
  const prices = useMemo((): PriceStructure => ({
    halbtax: {
      jugend: 120,
      erwachsene: 190
    },
    ga: {
      jugend: 2780,
      erwachsene: 3995
    },
    halbtaxPlus: {
      jugend: {
        1000: { cost: 600, credit: 1000 },
        2000: { cost: 1125, credit: 2000 },
        3000: { cost: 1575, credit: 3000 }
      },
      erwachsene: {
        1000: { cost: 800, credit: 1000 },
        2000: { cost: 1500, credit: 2000 },
        3000: { cost: 2100, credit: 3000 }
      }
    }
  }), []);

  // useCallback for functions passed to child components or used in effects
  const calculate = useCallback(() => {
    // Jährliche Kosten ohne Abo berechnen
    let yearlySpendingFull: number;
    if (inputMode === 'simple') {
      yearlySpendingFull = routes.reduce((total, route) => {
        const routeYearly = route.trips * route.cost * 52;
        return total + routeYearly;
      }, 0);
    } else {
      yearlySpendingFull = yearlySpendingDirect;
    }
    
    const halbtaxPrice = prices.halbtax[age];
    const gaPrice = prices.ga[age];
    
    // Option 1: Kein Abo
    const noAboTotal = yearlySpendingFull;
    
    // Option 2: Nur Halbtax
    let halbtaxTicketCosts: number;
    if (inputMode === 'simple') {
      halbtaxTicketCosts = routes.reduce((total, route) => {
        const routeYearly = route.trips * route.cost * 52;
        return total + (route.isHalbtaxPrice ? routeYearly : routeYearly / 2);
      }, 0);
    } else {
      halbtaxTicketCosts = yearlySpendingFull / 2;
    }
    const halbtaxTotal = halbtaxTicketCosts + halbtaxPrice;
    
    // Option 3: Halbtax Plus (alle Varianten) - mit Nachladung
    const halbtaxPlusOptions = Object.entries(prices.halbtaxPlus[age]).map(([credit, data]) => {
      const creditAmount = data.credit;
      const packageCost = data.cost;
      
      if (halbtaxTicketCosts <= creditAmount) {
        const total = packageCost + halbtaxPrice;
        return {
          credit: parseInt(credit),
          cost: packageCost,
          total: total,
          coveredByCredit: halbtaxTicketCosts,
          remainingCosts: 0,
          reloadCount: 0,
          reloadCost: 0
        };
      } else {
        const remainingAfterFirst = halbtaxTicketCosts - creditAmount;
        const reloadCount = Math.ceil(remainingAfterFirst / creditAmount);
        const lastReloadUsage = remainingAfterFirst % creditAmount || creditAmount;
        
        let totalReloadCost = 0;
        for (let i = 0; i < reloadCount; i++) {
          if (i === reloadCount - 1) {
            const usageRatio = lastReloadUsage / creditAmount;
            totalReloadCost += packageCost * usageRatio;
          } else {
            totalReloadCost += packageCost;
          }
        }
        
        const total = packageCost + halbtaxPrice + totalReloadCost;
        
        return {
          credit: parseInt(credit),
          cost: packageCost,
          total: total,
          coveredByCredit: halbtaxTicketCosts,
          remainingCosts: 0,
          reloadCount: reloadCount,
          reloadCost: totalReloadCost,
          lastReloadUsage: lastReloadUsage,
          lastReloadRatio: lastReloadUsage / creditAmount
        };
      }
    });
    
    // Option 4: GA
    const gaTotal = gaPrice;
    
    // Beste Option finden
    const options = [
      { name: t('noSubscription'), total: noAboTotal, type: 'none' },
      { name: t('halbtaxOnly'), total: halbtaxTotal, type: 'halbtax' },
      ...halbtaxPlusOptions.map(opt => ({ 
        name: t('halbtaxPlus', { credit: opt.credit }), 
        total: opt.total, 
        type: 'halbtaxplus',
        credit: opt.credit,
        details: opt
      })),
      { name: t('ga'), total: gaTotal, type: 'ga' }
    ];
    
    const bestOption = options.reduce((best, current) => 
      current.total < best.total ? current : best
    );
    
    setResults({
      yearlySpendingFull,
      halbtaxTicketCosts,
      noAboTotal,
      halbtaxTotal,
      halbtaxPlusOptions,
      gaTotal,
      options,
      bestOption
    });
  }, [age, inputMode, routes, yearlySpendingDirect, prices, t]);

  useEffect(() => {
    calculate();
  }, [calculate]);

  // Strecken-Management Funktionen
  const addRoute = useCallback(() => {
    const newId = Math.max(...routes.map(r => r.id)) + 1;
    setRoutes(prev => [...prev, { id: newId, trips: 1, cost: 20, isHalbtaxPrice: false }]);
  }, [routes]);

  const removeRoute = useCallback((id: number) => {
    if (routes.length > 1) {
      setRoutes(prev => prev.filter(r => r.id !== id));
    }
  }, [routes.length]);

  const updateRoute = useCallback((id: number, field: keyof Omit<Route, 'id'>, value: any) => {
    setRoutes(prev => prev.map(r => 
      r.id === id ? { ...r, [field]: value } : r
    ));
  }, []);

  const formatCurrency = useCallback((amount: number): string => {
    return `CHF ${Math.round(amount).toLocaleString()}`;
  }, []);

  const getOptionColor = useCallback((option: any, isBest: boolean): string => {
    if (isBest) return 'bg-green-50 border-green-200 text-green-800';
    switch (option.type) {
      case 'none': return 'bg-red-50 border-red-200 text-red-800';
      case 'halbtax': return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'halbtaxplus': return 'bg-purple-50 border-purple-200 text-purple-800';
      case 'ga': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  }, []);

  return (
    <div className="w-11/12 mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Train className="w-8 h-8 text-red-600" />
          <h1 className="text-2xl font-bold text-gray-800">{t('title')}</h1>
        </div>
        
        {/* Language Selector */}
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-gray-600" />
          <select 
            value={language} 
            onChange={(e) => setLanguage(e.target.value as Language)}
            className="p-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
            title={t('selectLanguage')}
          >
            <option value="en">English</option>
            <option value="de">Deutsch</option>
            <option value="fr">Français</option>
            <option value="it">Italiano</option>
          </select>
        </div>
      </div>

      <div className="space-y-6">
        {/* Altersgruppe */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('ageGroup')}
          </label>
          <select 
            value={age} 
            onChange={(e) => setAge(e.target.value as AgeGroup)}
            className="w-full max-w-xs p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="jugend">{t('youth')}</option>
            <option value="erwachsene">{t('adult')}</option>
          </select>
        </div>

        {/* Eingabemodus Toggle */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            {t('costEstimation')}
          </label>
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => setInputMode('simple')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                inputMode === 'simple' 
                  ? 'bg-red-50 border-red-200 text-red-700' 
                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {inputMode === 'simple' ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
              {t('simpleInput')}
            </button>
            <button
              onClick={() => setInputMode('direct')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                inputMode === 'direct' 
                  ? 'bg-red-50 border-red-200 text-red-700' 
                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {inputMode === 'direct' ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
              {t('directInput')}
            </button>
          </div>

          {inputMode === 'simple' ? (
            <div className="space-y-4">
              {/* Dynamische Strecken */}
              {routes.map((route, index) => (
                <div key={route.id} className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-700">📍 {t('route')} {index + 1}</h4>
                    {routes.length > 1 && (
                      <button
                        onClick={() => removeRoute(route.id)}
                        className="text-red-500 hover:text-red-700 p-1 transition-colors"
                        title={t('removeRoute')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4 mb-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('tripsPerWeek')}
                      </label>
                      <input 
                        type="number" 
                        value={route.trips}
                        onChange={(e) => updateRoute(route.id, 'trips', parseFloat(e.target.value) || 0)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder={t('placeholderTrips')}
                        step="0.5"
                        min="0"
                      />
                      <div className="text-xs text-gray-500 mt-1">{t('tripsPerWeekHelp')}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('costPerTrip')}
                      </label>
                      <input 
                        type="number" 
                        value={route.cost}
                        onChange={(e) => updateRoute(route.id, 'cost', parseFloat(e.target.value) || 0)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder={t('placeholderCost')}
                        step="0.10"
                        min="0"
                      />
                      <div className="text-xs text-gray-500 mt-1">{t('costPerTripHelp')}</div>
                    </div>
                  </div>

                  {/* Halbtax-Checkbox */}
                  <div className="flex items-center gap-2 mb-3">
                    <input
                      type="checkbox"
                      id={`halbtax-${route.id}`}
                      checked={route.isHalbtaxPrice}
                      onChange={(e) => updateRoute(route.id, 'isHalbtaxPrice', e.target.checked)}
                      className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                    />
                    <label htmlFor={`halbtax-${route.id}`} className="text-sm text-gray-700">
                      {t('priceAlreadyHalbtax')}
                    </label>
                  </div>

                  <div className="text-sm text-blue-600">
                    {t('routeYearlyCost', { 
                      index: index + 1, 
                      cost: formatCurrency(route.trips * route.cost * 52) 
                    })}
                    {route.isHalbtaxPrice && <span className="text-orange-600"> {t('alreadyHalbtaxPrice')}</span>}
                  </div>
                </div>
              ))}

              {/* Strecke hinzufügen Button */}
              <button
                onClick={addRoute}
                className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-red-300 hover:text-red-600 flex items-center justify-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                {t('addRoute')}
              </button>

              {/* Gesamtkosten Anzeige */}
              <div className="bg-gray-100 p-3 rounded-lg">
                <div className="font-medium text-gray-700">
                  {t('totalYearlyCosts', { 
                    cost: formatCurrency(routes.reduce((total, route) => total + route.trips * route.cost * 52, 0)) 
                  })}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {routes.filter(r => r.isHalbtaxPrice).length > 0 && (
                    <span className="text-orange-600">
                      {t('routesWithHalbtax', { count: routes.filter(r => r.isHalbtaxPrice).length })}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('yearlyTravelCosts')}
              </label>
              <input 
                type="number" 
                value={yearlySpendingDirect}
                onChange={(e) => setYearlySpendingDirect(parseInt(e.target.value) || 0)}
                className="w-full max-w-xs p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder={t('placeholderYearly')}
              />
            </div>
          )}
        </div>

        {/* Ergebnisse */}
        {results && (
          <div className="bg-gray-50 rounded-lg p-6 space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Calculator className="w-5 h-5 text-red-600" />
              <h2 className="text-xl font-semibold text-gray-800">
                {t('costComparison', { cost: formatCurrency(results.yearlySpendingFull) })}
              </h2>
            </div>

            {/* Alle Optionen anzeigen */}
            <div className="grid lg:grid-cols-2 gap-4">
              {results.options.map((option, index) => {
                const isBest = option.name === results.bestOption.name;
                return (
                  <div 
                    key={index}
                    className={`p-4 rounded-lg border-2 ${getOptionColor(option, isBest)}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">
                        {option.name}
                        {isBest && <span className="ml-2 text-xs bg-green-600 text-white px-2 py-1 rounded">{t('bestOption')}</span>}
                      </h3>
                      <div className="text-lg font-bold">
                        {formatCurrency(option.total)}
                      </div>
                    </div>
                    
                    <div className="text-xs space-y-1">
                      {option.type === 'none' && (
                        <div>{t('fullTicketPrices', { cost: formatCurrency(results.yearlySpendingFull) })}</div>
                      )}
                      
                      {option.type === 'halbtax' && (
                        <>
                          <div>{age === 'jugend' ? t('halbtaxYouth', { cost: formatCurrency(prices.halbtax[age]) }) : t('halbtaxAdult', { cost: formatCurrency(prices.halbtax[age]) })}</div>
                          <div>{t('ticketsDiscount', { cost: formatCurrency(results.halbtaxTicketCosts) })}</div>
                        </>
                      )}
                      
                      {option.type === 'halbtaxplus' && (
                        <>
                          <div>{t('halbtaxPlus', { credit: option.credit })}: {formatCurrency(option.details.cost)}</div>
                          <div>{age === 'jugend' ? t('halbtaxYouth', { cost: formatCurrency(prices.halbtax[age]) }) : t('halbtaxAdult', { cost: formatCurrency(prices.halbtax[age]) })}</div>
                          <div>{t('creditCovered', { cost: formatCurrency(option.details.coveredByCredit) })}</div>
                          {option.details.reloadCount > 0 && (
                            <>
                              <div className="text-orange-600 font-medium">{t('reloads')}</div>
                              {option.details.reloadCount > 1 && (
                                <div>{t('reloadFull', { count: option.details.reloadCount - 1, cost: formatCurrency((option.details.reloadCount - 1) * option.details.cost) })}</div>
                              )}
                              <div>{t('reloadPartial', { percent: Math.round(option.details.lastReloadRatio * 100), cost: formatCurrency(option.details.cost * option.details.lastReloadRatio) })}</div>
                              <div className="font-medium">{t('reloadTotal', { cost: formatCurrency(option.details.reloadCost) })}</div>
                            </>
                          )}
                        </>
                      )}
                      
                      {option.type === 'ga' && (
                        <div>{t('unlimitedTravel')}</div>
                      )}
                    </div>

                    {!isBest && (
                      <div className="text-xs mt-2 opacity-75">
                        {t('moreExpensive', { cost: formatCurrency(option.total - results.bestOption.total) })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Zusätzliche Insights */}
            <div className="bg-white p-4 rounded-lg border">
              <h3 className="font-medium text-gray-700 mb-3">{t('additionalInfo')}</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <div className="font-medium mb-1">{t('breakEvenPoints')}</div>
                  <div>{t('halbtaxBreakEven', { cost: formatCurrency(prices.halbtax[age] * 2) })}</div>
                  <div>{t('gaBreakEven', { cost: formatCurrency(results.gaTotal * 2) })}</div>
                </div>
                <div>
                  <div className="font-medium mb-1">{t('yourCosts')}</div>
                  <div>{t('savingsWithBest', { cost: formatCurrency(results.noAboTotal - results.bestOption.total) })}</div>
                  <div>{t('savingsPercent', { percent: Math.round((1 - results.bestOption.total / results.noAboTotal) * 100) })}</div>
                </div>
              </div>
              
              {/* Halbtax Plus Erklärung wenn relevant */}
              {results.halbtaxPlusOptions.some(opt => opt.reloadCount > 0) && (
                <div className="mt-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="text-sm text-orange-800">
                    <div className="font-medium mb-1">{t('halbtaxPlusInfo')}</div>
                    <div>{t('halbtaxPlusExplanation')}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="text-xs text-gray-500 text-center">
          {t('disclaimer')}
        </div>
      </div>
    </div>
  );
};

export default SBBCalculator;