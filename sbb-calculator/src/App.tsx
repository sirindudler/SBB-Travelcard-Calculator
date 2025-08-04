import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Calculator, Train, CreditCard, ToggleLeft, ToggleRight, Plus, Trash2 } from 'lucide-react';

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
  
  // Simple input - Strecken (Array)
  const [routes, setRoutes] = useState<Route[]>([
    { id: 1, trips: 2, cost: 27, isHalbtaxPrice: false }
  ]);
  
  // Direct input
  const [yearlySpendingDirect, setYearlySpendingDirect] = useState<number>(2808);
  
  const [results, setResults] = useState<CalculationResults | null>(null);

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
      { name: 'Kein Abo', total: noAboTotal, type: 'none' },
      { name: 'Nur Halbtax', total: halbtaxTotal, type: 'halbtax' },
      ...halbtaxPlusOptions.map(opt => ({ 
        name: `Halbtax Plus ${opt.credit}`, 
        total: opt.total, 
        type: 'halbtaxplus',
        credit: opt.credit,
        details: opt
      })),
      { name: 'GA', total: gaTotal, type: 'ga' }
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
  }, [age, inputMode, routes, yearlySpendingDirect, prices]);

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
      <div className="flex items-center gap-3 mb-6">
        <Train className="w-8 h-8 text-red-600" />
        <h1 className="text-2xl font-bold text-gray-800">SBB Abo-Vergleichsrechner</h1>
      </div>

      <div className="space-y-6">
        {/* Altersgruppe */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Altersgruppe
          </label>
          <select 
            value={age} 
            onChange={(e) => setAge(e.target.value as AgeGroup)}
            className="w-full max-w-xs p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="jugend">Jugend (16-25 Jahre)</option>
            <option value="erwachsene">Erwachsene (25+ Jahre)</option>
          </select>
        </div>

        {/* Eingabemodus Toggle */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Kostenschätzung
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
              Einfache Eingabe
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
              Direkte Eingabe
            </button>
          </div>

          {inputMode === 'simple' ? (
            <div className="space-y-4">
              {/* Dynamische Strecken */}
              {routes.map((route, index) => (
                <div key={route.id} className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-700">📍 Strecke {index + 1}</h4>
                    {routes.length > 1 && (
                      <button
                        onClick={() => removeRoute(route.id)}
                        className="text-red-500 hover:text-red-700 p-1 transition-colors"
                        title="Strecke entfernen"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4 mb-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Anzahl pro Woche ↔
                      </label>
                      <input 
                        type="number" 
                        value={route.trips}
                        onChange={(e) => updateRoute(route.id, 'trips', parseFloat(e.target.value) || 0)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="z.B. 2"
                        step="0.5"
                        min="0"
                      />
                      <div className="text-xs text-gray-500 mt-1">Hin- und Rückfahrten pro Woche</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kosten pro Hin- und Rückfahrt
                      </label>
                      <input 
                        type="number" 
                        value={route.cost}
                        onChange={(e) => updateRoute(route.id, 'cost', parseFloat(e.target.value) || 0)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="z.B. 27.00"
                        step="0.10"
                        min="0"
                      />
                      <div className="text-xs text-gray-500 mt-1">CHF pro kompletter Rundfahrt</div>
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
                      Preis bereits mit Halbtax berechnet
                    </label>
                  </div>

                  <div className="text-sm text-blue-600">
                    Strecke {index + 1}: {formatCurrency(route.trips * route.cost * 52)} pro Jahr
                    {route.isHalbtaxPrice && <span className="text-orange-600"> (bereits Halbtax-Preis)</span>}
                  </div>
                </div>
              ))}

              {/* Strecke hinzufügen Button */}
              <button
                onClick={addRoute}
                className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-red-300 hover:text-red-600 flex items-center justify-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Weitere Strecke hinzufügen
              </button>

              {/* Gesamtkosten Anzeige */}
              <div className="bg-gray-100 p-3 rounded-lg">
                <div className="font-medium text-gray-700">
                  Gesamte jährliche Fahrtkosten: {formatCurrency(routes.reduce((total, route) => total + route.trips * route.cost * 52, 0))}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {routes.filter(r => r.isHalbtaxPrice).length > 0 && (
                    <span className="text-orange-600">
                      ⚠️ {routes.filter(r => r.isHalbtaxPrice).length} Strecke(n) bereits mit Halbtax-Preis eingegeben
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jährliche Fahrtkosten (ohne Abo)
              </label>
              <input 
                type="number" 
                value={yearlySpendingDirect}
                onChange={(e) => setYearlySpendingDirect(parseInt(e.target.value) || 0)}
                className="w-full max-w-xs p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="z.B. 2800"
              />
            </div>
          )}
        </div>

        {/* Ergebnisse */}
        {results && (
          <div className="bg-gray-50 rounded-lg p-6 space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Calculator className="w-5 h-5 text-red-600" />
              <h2 className="text-xl font-semibold text-gray-800">Kostenvergleich für {formatCurrency(results.yearlySpendingFull)} jährliche Fahrtkosten</h2>
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
                        {isBest && <span className="ml-2 text-xs bg-green-600 text-white px-2 py-1 rounded">BESTE OPTION</span>}
                      </h3>
                      <div className="text-lg font-bold">
                        {formatCurrency(option.total)}
                      </div>
                    </div>
                    
                    <div className="text-xs space-y-1">
                      {option.type === 'none' && (
                        <div>Volle Ticketpreise: {formatCurrency(results.yearlySpendingFull)}</div>
                      )}
                      
                      {option.type === 'halbtax' && (
                        <>
                          <div>Halbtax {age === 'jugend' ? 'Jugend' : 'Erwachsene'}: {formatCurrency(prices.halbtax[age])}</div>
                          <div>Tickets (50% Rabatt): {formatCurrency(results.halbtaxTicketCosts)}</div>
                        </>
                      )}
                      
                      {option.type === 'halbtaxplus' && (
                        <>
                          <div>Halbtax Plus {option.credit}: {formatCurrency(option.details.cost)}</div>
                          <div>Halbtax {age === 'jugend' ? 'Jugend' : 'Erwachsene'}: {formatCurrency(prices.halbtax[age])}</div>
                          <div>Guthaben abgedeckt: {formatCurrency(option.details.coveredByCredit)}</div>
                          {option.details.reloadCount > 0 && (
                            <>
                              <div className="text-orange-600 font-medium">Nachladungen:</div>
                              {option.details.reloadCount > 1 && (
                                <div>• {option.details.reloadCount - 1}x vollständig: {formatCurrency((option.details.reloadCount - 1) * option.details.cost)}</div>
                              )}
                              <div>• 1x anteilig ({Math.round(option.details.lastReloadRatio * 100)}%): {formatCurrency(option.details.cost * option.details.lastReloadRatio)}</div>
                              <div className="font-medium">Nachladung total: {formatCurrency(option.details.reloadCost)}</div>
                            </>
                          )}
                        </>
                      )}
                      
                      {option.type === 'ga' && (
                        <div>Unbegrenzte Fahrten in der ganzen Schweiz</div>
                      )}
                    </div>

                    {!isBest && (
                      <div className="text-xs mt-2 opacity-75">
                        +{formatCurrency(option.total - results.bestOption.total)} teurer als beste Option
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Zusätzliche Insights */}
            <div className="bg-white p-4 rounded-lg border">
              <h3 className="font-medium text-gray-700 mb-3">💡 Zusätzliche Informationen</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <div className="font-medium mb-1">Break-Even Points:</div>
                  <div>• Halbtax lohnt sich ab: {formatCurrency(prices.halbtax[age] * 2)} jährlich</div>
                  <div>• GA lohnt sich ab: {formatCurrency(results.gaTotal * 2)} jährlich</div>
                </div>
                <div>
                  <div className="font-medium mb-1">Bei Ihren Kosten:</div>
                  <div>• Ersparnis mit bester Option: {formatCurrency(results.noAboTotal - results.bestOption.total)}</div>
                  <div>• Das sind {Math.round((1 - results.bestOption.total / results.noAboTotal) * 100)}% Ersparnis</div>
                </div>
              </div>
              
              {/* Halbtax Plus Erklärung wenn relevant */}
              {results.halbtaxPlusOptions.some(opt => opt.reloadCount > 0) && (
                <div className="mt-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="text-sm text-orange-800">
                    <div className="font-medium mb-1">ℹ️ Halbtax Plus Nachladung:</div>
                    <div>Bei Verbrauch über das Guthaben hinaus wird automatisch nachgeladen. Der letzte Reload wird anteilig berechnet (z.B. 50% Nutzung = 50% Kosten).</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="text-xs text-gray-500 text-center">
          Preise Stand 2025. Halbtax Plus beinhaltet zusätzliches Fahrguthaben als Bonus. Alle Angaben ohne Gewähr.
        </div>
      </div>
    </div>
  );
};

export default SBBCalculator;