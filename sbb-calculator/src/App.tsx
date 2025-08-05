import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Calculator, Train, CreditCard, ToggleLeft, ToggleRight, Plus, Trash2, Globe, User, MapPin, Clock, Banknote, ExternalLink, ChevronDown, ChevronUp, Star } from 'lucide-react';
import { Language, useTranslation } from './translations';
import { getPricing, AgeGroup as PricingAgeGroup, PriceStructure, getHalbtaxPrice, getGAPrice, getHalbtaxPlusOptions } from './pricing';
import { PurchaseLinks, getStoredLinks } from './links';

// Types for better TypeScript
type AgeGroup = PricingAgeGroup; // Use the same type from pricing
type InputMode = 'simple' | 'direct';

interface RouteColorScheme {
  bg: string;
  border: string;
  border200: string;
  border300: string;
  text: string;
  accent: string;
  buttonBg: string;
  focusRing: string;
  summaryBg: string;
}

interface Route {
  id: number;
  trips: number | '';
  cost: number | '';
  isHalbtaxPrice: boolean;
  colorScheme: RouteColorScheme;
}

interface CalculationResults {
  yearlySpendingFull: number;
  halbtaxTicketCosts: number;
  noAboTotal: number;
  halbtaxTotal: number;
  halbtaxPlusOptions: any[];
  gaTotal: number;
  streckenabos: { route: Route, annualPrice: number, monthlyCost: number, isWorthwhile: boolean, isInValidRange: boolean }[];
  options: any[];
  bestOption: any;
}

// Remove duplicate interfaces - now imported from pricing.ts

const SBBCalculator: React.FC = () => {
  // Define color schemes that match the overall design
  const routeColorSchemes: RouteColorScheme[] = useMemo(() => [
    {
      bg: 'from-green-50 to-emerald-50',
      border: 'border-green-100',
      border200: 'border-green-200',
      border300: 'border-green-300',
      text: 'text-green-800',
      accent: 'text-green-600',
      buttonBg: 'bg-green-500',
      focusRing: 'focus:ring-green-500 focus:border-green-500',
      summaryBg: 'bg-green-100'
    },
    {
      bg: 'from-blue-50 to-sky-50',
      border: 'border-blue-100',
      border200: 'border-blue-200',
      border300: 'border-blue-300',
      text: 'text-blue-800',
      accent: 'text-blue-600',
      buttonBg: 'bg-blue-500',
      focusRing: 'focus:ring-blue-500 focus:border-blue-500',
      summaryBg: 'bg-blue-100'
    },
    {
      bg: 'from-purple-50 to-violet-50',
      border: 'border-purple-100',
      border200: 'border-purple-200',
      border300: 'border-purple-300',
      text: 'text-purple-800',
      accent: 'text-purple-600',
      buttonBg: 'bg-purple-500',
      focusRing: 'focus:ring-purple-500 focus:border-purple-500',
      summaryBg: 'bg-purple-100'
    },
    {
      bg: 'from-orange-50 to-amber-50',
      border: 'border-orange-100',
      border200: 'border-orange-200',
      border300: 'border-orange-300',
      text: 'text-orange-800',
      accent: 'text-orange-600',
      buttonBg: 'bg-orange-500',
      focusRing: 'focus:ring-orange-500 focus:border-orange-500',
      summaryBg: 'bg-orange-100'
    },
    {
      bg: 'from-rose-50 to-pink-50',
      border: 'border-rose-100',
      border200: 'border-rose-200',
      border300: 'border-rose-300',
      text: 'text-rose-800',
      accent: 'text-rose-600',
      buttonBg: 'bg-rose-500',
      focusRing: 'focus:ring-rose-500 focus:border-rose-500',
      summaryBg: 'bg-rose-100'
    },
    {
      bg: 'from-teal-50 to-cyan-50',
      border: 'border-teal-100',
      border200: 'border-teal-200',
      border300: 'border-teal-300',
      text: 'text-teal-800',
      accent: 'text-teal-600',
      buttonBg: 'bg-teal-500',
      focusRing: 'focus:ring-teal-500 focus:border-teal-500',
      summaryBg: 'bg-teal-100'
    }
  ], []);

  const getColorSchemeForRoute = useCallback((routeIndex: number): RouteColorScheme => {
    return routeColorSchemes[routeIndex % routeColorSchemes.length];
  }, [routeColorSchemes]);

  const [age, setAge] = useState<AgeGroup>('erwachsene');
  const [inputMode, setInputMode] = useState<InputMode>('simple');
  const [language, setLanguage] = useState<Language>('en');
  const [isFirstClass, setIsFirstClass] = useState<boolean>(false);
  const [allowHalbtaxPlusReload, setAllowHalbtaxPlusReload] = useState<boolean>(true);
  const [purchaseLinks, setPurchaseLinks] = useState<PurchaseLinks>(() => getStoredLinks());
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  
  // Simple input - Strecken (Array)
  const [routes, setRoutes] = useState<Route[]>([
    { id: 1, trips: 2, cost: 20, isHalbtaxPrice: false, colorScheme: routeColorSchemes[0] }
  ]);
  
  // Direct input
  const [yearlySpendingDirect, setYearlySpendingDirect] = useState<number | ''>(2500);
  
  const [results, setResults] = useState<CalculationResults | null>(null);

  // Use translation hook
  const t = useTranslation(language);

  // Get pricing data from external pricing file
  const prices: PriceStructure = getPricing();

  // Format currency helper
  const formatCurrency = useCallback((amount: number): string => {
    return `CHF ${Math.round(amount).toLocaleString()}`;
  }, []);


  // Get purchase link for option type
  const getPurchaseLink = useCallback((optionType: string): string => {
    switch (optionType) {
      case 'halbtax':
        return purchaseLinks.halbtax;
      case 'halbtaxplus':
        return purchaseLinks.halbtaxPlus;
      case 'ga':
        return purchaseLinks.ga;
      default:
        return '';
    }
  }, [purchaseLinks]);

  // Toggle card expansion
  const toggleCardExpansion = useCallback((cardId: string) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
  }, []);


  // Calculate Streckenabo using linear regression formula
  const calculateStreckenabo = (roundTripPrice: number): number => {
    // Formula: AnnualPass(p) ≈ 173.5 * p - 2.44 * p²
    // Valid for 4 ≤ p ≤ 50 CHF with ±5-10% accuracy
    return Math.max(0, 173.5 * roundTripPrice - 2.44 * Math.pow(roundTripPrice, 2));
  };

  // useCallback for functions passed to child components or used in effects
  const calculate = useCallback(() => {
    // Jährliche Kosten ohne Abo berechnen
    let yearlySpendingFull: number;
    if (inputMode === 'simple') {
      yearlySpendingFull = routes.reduce((total, route) => {
        const trips = typeof route.trips === 'number' ? route.trips : 0;
        const cost = typeof route.cost === 'number' ? route.cost : 0;
        const routeYearly = trips * cost * 52;
        return total + (route.isHalbtaxPrice ? routeYearly * 2 : routeYearly);
      }, 0);
    } else {
      yearlySpendingFull = typeof yearlySpendingDirect === 'number' ? yearlySpendingDirect : 0;
    }
    
    const halbtaxPrice = getHalbtaxPrice(age, true);
    const gaPrice = getGAPrice(age, isFirstClass);
    
    // Option 1: Kein Abo
    const noAboTotal = yearlySpendingFull;
    
    // Option 2: Nur Halbtax
    let halbtaxTicketCosts: number;
    if (inputMode === 'simple') {
      halbtaxTicketCosts = routes.reduce((total, route) => {
        const trips = typeof route.trips === 'number' ? route.trips : 0;
        const cost = typeof route.cost === 'number' ? route.cost : 0;
        const routeYearly = trips * cost * 52;
        return total + (route.isHalbtaxPrice ? routeYearly : routeYearly / 2);
      }, 0);
    } else {
      halbtaxTicketCosts = (typeof yearlySpendingDirect === 'number' ? yearlySpendingDirect : 0) / 2;
    }
    const halbtaxTotal = halbtaxTicketCosts + halbtaxPrice;
    
    // Option 3: Halbtax Plus (alle Varianten) - mit Nachladung
    // Map all age groups to Halbtax PLUS categories: 'jugend' (6-24.99 years) or 'erwachsene' (25+ years)
    const getHalbtaxPlusCategory = (ageGroup: AgeGroup): 'jugend' | 'erwachsene' | null => {
      switch (ageGroup) {
        case 'kind':           // 6-16 years -> jugend category
        case 'jugend':         // 16-25 years -> jugend category
          return 'jugend';
        case 'fuenfundzwanzig': // 25 years -> erwachsene category
        case 'erwachsene':      // 26-64/65 years -> erwachsene category
        case 'senior':          // 64+/65+ years -> erwachsene category
        case 'behinderung':     // disability -> erwachsene category
          return 'erwachsene';
        default:
          return null;
      }
    };
    
    const halbtaxPlusCategory = getHalbtaxPlusCategory(age);
    const halbtaxPlusAvailable = halbtaxPlusCategory !== null;
    const halbtaxPlusOptions = halbtaxPlusAvailable 
      ? Object.entries(getHalbtaxPlusOptions(halbtaxPlusCategory!)).map(([credit, data]) => {
      const creditAmount = data.credit;
      const packageCost = data.cost;
      
      if (halbtaxTicketCosts <= creditAmount) {
        // All costs covered by initial credit
        const total = packageCost + halbtaxPrice;
        return {
          credit: parseInt(credit),
          cost: packageCost,
          total: total,
          coveredByCredit: halbtaxTicketCosts,
          remainingCosts: 0,
          reloadCount: 0,
          reloadCost: 0,
          halbtaxTicketsAfterCredit: 0
        };
      } else {
        // More costs than initial credit
        const remainingAfterFirst = halbtaxTicketCosts - creditAmount;
        
        if (allowHalbtaxPlusReload) {
          // Original logic: reload Halbtax PLUS packages
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
            coveredByCredit: creditAmount,
            remainingCosts: remainingAfterFirst,
            reloadCount: reloadCount,
            reloadCost: totalReloadCost,
            lastReloadUsage: lastReloadUsage,
            lastReloadRatio: lastReloadUsage / creditAmount,
            halbtaxTicketsAfterCredit: 0
          };
        } else {
          // New logic: use initial credit + regular Halbtax tickets for remaining
          const total = packageCost + halbtaxPrice + remainingAfterFirst;
          
          return {
            credit: parseInt(credit),
            cost: packageCost,
            total: total,
            coveredByCredit: creditAmount,
            remainingCosts: remainingAfterFirst,
            reloadCount: 0,
            reloadCost: 0,
            halbtaxTicketsAfterCredit: remainingAfterFirst
          };
        }
      }
    })
      : [];
    
    // Option 4: GA
    const gaTotal = gaPrice;
    
    // Option 5: Streckenabo calculations (only for simple input mode with individual routes)
    const streckenabos = inputMode === 'simple' ? routes.map(route => {
      const cost = typeof route.cost === 'number' ? route.cost : 0;
      const trips = typeof route.trips === 'number' ? route.trips : 0;
      const actualCost = route.isHalbtaxPrice ? cost * 2 : cost;
      const annualPrice = calculateStreckenabo(actualCost);
      const monthlyCost = annualPrice / 12;
      const annualRouteSpending = trips * actualCost * 52;
      const isWorthwhile = annualPrice < annualRouteSpending && actualCost >= 4 && actualCost <= 50;
      const isInValidRange = actualCost >= 4 && actualCost <= 50;
      
      return {
        route,
        annualPrice,
        monthlyCost,
        isWorthwhile,
        isInValidRange
      };
    }) : [];
    
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
      streckenabos,
      options,
      bestOption
    });
  }, [age, inputMode, routes, yearlySpendingDirect, t, allowHalbtaxPlusReload, isFirstClass]);

  useEffect(() => {
    calculate();
  }, [calculate]);

  // Initialize purchase links on mount
  useEffect(() => {
    const links = getStoredLinks();
    setPurchaseLinks(links);
  }, []);

  // Strecken-Management Funktionen
  const addRoute = useCallback(() => {
    const newId = Math.max(...routes.map(r => r.id)) + 1;
    const newColorScheme = getColorSchemeForRoute(routes.length);
    setRoutes(prev => [...prev, { id: newId, trips: 1, cost: 20, isHalbtaxPrice: false, colorScheme: newColorScheme }]);
  }, [routes, getColorSchemeForRoute]);

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

  const getOptionColor = useCallback((option: any, bestOptionTotal: number): string => {
    if (option.total === bestOptionTotal) {
      return 'bg-green-50 border-green-200 text-green-800';
    }
    
    // Calculate percentage increase from best option
    const percentageIncrease = ((option.total - bestOptionTotal) / bestOptionTotal) * 100;
    
    if (percentageIncrease <= 5) {
      // 0-5% more expensive: Light green (very good)
      return 'bg-green-50 border-green-200 text-green-800';
    } else if (percentageIncrease <= 15) {
      // 5-15% more expensive: Yellow-green (good)
      return 'bg-lime-50 border-lime-200 text-lime-800';
    } else if (percentageIncrease <= 30) {
      // 15-30% more expensive: Yellow (okay)
      return 'bg-yellow-50 border-yellow-200 text-yellow-800';
    } else if (percentageIncrease <= 50) {
      // 30-50% more expensive: Orange (not great)
      return 'bg-orange-50 border-orange-200 text-orange-800';
    } else if (percentageIncrease <= 75) {
      // 50-75% more expensive: Red-orange (bad)
      return 'bg-red-50 border-red-200 text-red-800';
    } else {
      // 75%+ more expensive: Dark red (very bad)
      return 'bg-red-100 border-red-300 text-red-900';
    }
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 bg-white rounded-lg shadow-lg">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-red-600 rounded-full blur-sm opacity-20"></div>
            <div className="relative bg-gradient-to-br from-red-500 to-red-700 p-2 rounded-full shadow-lg">
              <Train className="w-6 h-6 text-white drop-shadow-sm" />
            </div>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 leading-tight">{t('title')}</h1>
        </div>
        
        {/* Language Selector */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Globe className="w-4 h-4 text-gray-600" />
          <select 
            value={language} 
            onChange={(e) => setLanguage(e.target.value as Language)}
            className="p-2 sm:p-3 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors min-w-[120px]"
            title={t('selectLanguage')}
          >
            <option value="en">English</option>
            <option value="de">Deutsch</option>
            <option value="fr">Français</option>
            <option value="it">Italiano</option>
          </select>
        </div>
      </div>


      <div className="space-y-6 sm:space-y-8 pb-8">
        {/* Passenger Category and Travel Class */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 sm:p-6 rounded-xl border border-blue-100">
          <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <User className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                <label className="text-base sm:text-lg font-semibold text-blue-900">
                  {t('ageGroup')}
                </label>
              </div>
              <select 
                value={age} 
                onChange={(e) => setAge(e.target.value as AgeGroup)}
                className="w-full p-3 sm:p-4 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm text-gray-800 font-medium transition-all hover:border-blue-300 text-sm sm:text-base"
              >
                <option value="kind">{t('child')}</option>
                <option value="jugend">{t('youth')}</option>
                <option value="fuenfundzwanzig">{t('twentyFive')}</option>
                <option value="erwachsene">{t('adult')}</option>
                <option value="senior">{t('senior')}</option>
                <option value="behinderung">{t('disability')}</option>
              </select>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <Star className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                <label className="text-base sm:text-lg font-semibold text-blue-900">
                  {t('travelClass')}
                </label>
              </div>
              <select 
                value={isFirstClass ? 'first' : 'second'} 
                onChange={(e) => setIsFirstClass(e.target.value === 'first')}
                className="w-full p-3 sm:p-4 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm text-gray-800 font-medium transition-all hover:border-blue-300 text-sm sm:text-base"
              >
                <option value="second">
                  {t('secondClass')}
                </option>
                <option value="first">
                  {t('firstClass')}
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* Eingabemodus Toggle */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 sm:p-6 rounded-xl border border-purple-100">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <Calculator className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
            <label className="text-base sm:text-lg font-semibold text-purple-900">
              {t('costEstimation')}
            </label>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-2 mb-4 sm:mb-6">
            <button
              onClick={() => setInputMode('simple')}
              className={`flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-3 rounded-xl border-2 transition-all transform hover:scale-105 active:scale-95 min-h-[48px] text-sm sm:text-base ${
                inputMode === 'simple' 
                  ? 'bg-purple-100 border-purple-300 text-purple-800 shadow-md' 
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-purple-200'
              }`}
            >
              <MapPin className="w-4 h-4 flex-shrink-0" />
              {inputMode === 'simple' ? <ToggleRight className="w-4 h-4 flex-shrink-0" /> : <ToggleLeft className="w-4 h-4 flex-shrink-0" />}
              <span className="font-medium">{t('simpleInput')}</span>
            </button>
            <button
              onClick={() => setInputMode('direct')}
              className={`flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-3 rounded-xl border-2 transition-all transform hover:scale-105 active:scale-95 min-h-[48px] text-sm sm:text-base ${
                inputMode === 'direct' 
                  ? 'bg-purple-100 border-purple-300 text-purple-800 shadow-md' 
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-purple-200'
              }`}
            >
              <Banknote className="w-4 h-4 flex-shrink-0" />
              {inputMode === 'direct' ? <ToggleRight className="w-4 h-4 flex-shrink-0" /> : <ToggleLeft className="w-4 h-4 flex-shrink-0" />}
              <span className="font-medium">{t('directInput')}</span>
            </button>
          </div>

          {inputMode === 'simple' ? (
            <div className="space-y-4">
              {/* Dynamische Strecken */}
              {routes.map((route, index) => (
                <div key={route.id} className={`bg-gradient-to-br ${route.colorScheme.bg} p-4 sm:p-6 rounded-xl border-2 ${route.colorScheme.border} shadow-sm hover:shadow-md transition-all`}>
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className={`w-7 h-7 sm:w-8 sm:h-8 ${route.colorScheme.buttonBg} text-white rounded-full flex items-center justify-center font-bold text-xs sm:text-sm`}>
                        {index + 1}
                      </div>
                      <h4 className={`font-semibold ${route.colorScheme.text} text-base sm:text-lg`}>{t('route')} {index + 1}</h4>
                    </div>
                    {routes.length > 1 && (
                      <button
                        onClick={() => removeRoute(route.id)}
                        className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-all transform hover:scale-110 min-h-[44px] min-w-[44px] flex items-center justify-center"
                        title={t('removeRoute')}
                      >
                        <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-4">
                    <div className="relative">
                      <label className={`flex items-center gap-2 text-xs sm:text-sm font-semibold ${route.colorScheme.text} mb-2 sm:mb-3`}>
                        <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                        {t('tripsPerWeek')}
                      </label>
                      <input 
                        type="number" 
                        value={route.trips || ''}
                        onChange={(e) => updateRoute(route.id, 'trips', e.target.value === '' ? '' : parseFloat(e.target.value) || 0)}
                        onWheel={(e) => e.currentTarget.blur()}
                        className={`w-full px-3 sm:px-4 py-3 border-2 ${route.colorScheme.border200} rounded-xl focus:ring-2 ${route.colorScheme.focusRing} bg-white shadow-sm transition-all hover:${route.colorScheme.border300} text-sm sm:text-base`}
                        placeholder={t('placeholderTrips')}
                        step="0.5"
                        min="0"
                      />
                      <div className={`text-xs ${route.colorScheme.accent} mt-1 sm:mt-2 flex items-center gap-1`}>
                        <span>ℹ️</span>
                        <span className="text-xs">{t('tripsPerWeekHelp')}</span>
                      </div>
                    </div>
                    <div className="relative">
                      <label className={`flex items-center gap-2 text-xs sm:text-sm font-semibold ${route.colorScheme.text} mb-2 sm:mb-3`}>
                        <Banknote className="w-3 h-3 sm:w-4 sm:h-4" />
                        {t('costPerTrip')}
                      </label>
                      <div className="relative">
                        <span className={`absolute left-3 top-3 ${route.colorScheme.accent} font-medium text-sm sm:text-base`}>CHF</span>
                        <input 
                          type="number" 
                          value={route.cost || ''}
                          onChange={(e) => updateRoute(route.id, 'cost', e.target.value === '' ? '' : parseFloat(e.target.value) || 0)}
                          onWheel={(e) => e.currentTarget.blur()}
                          className={`w-full pl-11 sm:pl-12 pr-3 sm:pr-4 py-3 border-2 ${route.colorScheme.border200} rounded-xl focus:ring-2 ${route.colorScheme.focusRing} bg-white shadow-sm transition-all hover:${route.colorScheme.border300} text-sm sm:text-base`}
                        placeholder={t('placeholderCost')}
                        step="0.10"
                        min="0"
                      />
                      </div>
                      <div className={`text-xs ${route.colorScheme.accent} mt-1 sm:mt-2 flex items-center gap-1`}>
                        <span>ℹ️</span>
                        <span className="text-xs">{t('costPerTripHelp')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Halbtax-Checkbox */}
                  <div className={`bg-white p-3 sm:p-4 rounded-lg border ${route.colorScheme.border200} mb-3 sm:mb-4`}>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <input
                        type="checkbox"
                        id={`halbtax-${route.id}`}
                        checked={route.isHalbtaxPrice}
                        onChange={(e) => updateRoute(route.id, 'isHalbtaxPrice', e.target.checked)}
                        className={`w-4 h-4 sm:w-5 sm:h-5 ${route.colorScheme.accent} border-2 ${route.colorScheme.border300} rounded-md ${route.colorScheme.focusRing.split(' ')[0]} transition-all`}
                      />
                      <label htmlFor={`halbtax-${route.id}`} className={`text-xs sm:text-sm font-medium ${route.colorScheme.text} cursor-pointer flex-1`}>
                        <span className="flex items-center gap-2">
                          <CreditCard className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="text-xs sm:text-sm">{t('priceAlreadyHalbtax')}</span>
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className={`${route.colorScheme.summaryBg} p-3 rounded-lg border ${route.colorScheme.border200}`}>
                    <div className={`text-xs sm:text-sm font-semibold ${route.colorScheme.text}`}>
                      💰 {t('routeYearlyCost', { 
                        index: index + 1, 
                        cost: formatCurrency((typeof route.trips === 'number' ? route.trips : 0) * (typeof route.cost === 'number' ? route.cost : 0) * 52) 
                      })}
                      {route.isHalbtaxPrice && <span className="text-orange-700 ml-2 block sm:inline mt-1 sm:mt-0">✨ {t('alreadyHalbtaxPrice')}</span>}
                    </div>
                  </div>
                </div>
              ))}

              {/* Strecke hinzufügen Button */}
              <button
                onClick={addRoute}
                className="w-full p-3 sm:p-4 border-2 border-dashed border-green-300 rounded-xl text-green-700 hover:border-green-500 hover:text-green-800 hover:bg-green-50 flex items-center justify-center gap-2 sm:gap-3 transition-all transform hover:scale-105 shadow-sm hover:shadow-md min-h-[48px] text-sm sm:text-base"
              >
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-500 text-white rounded-full flex items-center justify-center">
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                </div>
                <span className="font-semibold">{t('addRoute')}</span>
              </button>

              {/* Gesamtkosten Anzeige */}
              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-4 sm:p-5 rounded-xl border-2 border-amber-200 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 bg-amber-500 text-white rounded-full flex items-center justify-center">
                    <Calculator className="w-3 h-3 sm:w-4 sm:h-4" />
                  </div>
                  <span className="font-bold text-amber-900 text-base sm:text-lg">
                    {t('totalYearlyCosts', { 
                      cost: formatCurrency(routes.reduce((total, route) => {
                        const trips = typeof route.trips === 'number' ? route.trips : 0;
                        const cost = typeof route.cost === 'number' ? route.cost : 0;
                        return total + trips * cost * 52;
                      }, 0)) 
                    })}
                  </span>
                </div>
                <div className="text-xs sm:text-sm text-amber-700">
                  {routes.filter(r => r.isHalbtaxPrice).length > 0 && (
                    <div className="flex items-start gap-1 mt-2 p-2 sm:p-3 bg-orange-100 rounded-lg border border-orange-200">
                      <span className="flex-shrink-0">⚠️</span>
                      <span className="font-medium text-orange-800 text-xs sm:text-sm">
                        {t('routesWithHalbtax', { count: routes.filter(r => r.isHalbtaxPrice).length })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-orange-50 to-red-50 p-4 sm:p-6 rounded-xl border-2 border-orange-200 shadow-sm">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <Banknote className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                <label className="text-base sm:text-lg font-semibold text-orange-900">
                  {t('yearlyTravelCosts')}
                </label>
              </div>
              <div className="relative max-w-full sm:max-w-sm">
                <span className="absolute left-3 sm:left-4 top-3 sm:top-4 text-orange-600 font-bold text-base sm:text-lg">CHF</span>
                <input 
                  type="number" 
                  value={yearlySpendingDirect || ''}
                  onChange={(e) => setYearlySpendingDirect(e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
                  onWheel={(e) => e.currentTarget.blur()}
                  className="w-full pl-12 sm:pl-16 pr-3 sm:pr-4 py-3 sm:py-4 border-2 border-orange-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white shadow-sm text-base sm:text-lg font-semibold transition-all hover:border-orange-400"
                  placeholder={t('placeholderYearly')}
                />
              </div>
            </div>
          )}
        </div>

        {/* Ergebnisse */}
        {results && (
          <div className="bg-gray-50 rounded-lg p-4 sm:p-6 space-y-4 sm:space-y-6">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800 leading-tight">
                  {t('costComparison', { cost: formatCurrency(results.yearlySpendingFull) })}
                </h2>
              </div>
              
              {/* Halbtax PLUS Reload Toggle */}
              {results.halbtaxPlusOptions.length > 0 && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 bg-white px-3 sm:px-4 py-2 rounded-lg border border-gray-200 w-full lg:w-auto">
                  <span className="text-xs sm:text-sm font-medium text-gray-700">{t('halbtaxPlusReload')}</span>
                  <button
                    onClick={() => setAllowHalbtaxPlusReload(!allowHalbtaxPlusReload)}
                    className={`flex items-center gap-2 px-3 py-1 rounded-md text-xs sm:text-sm font-medium transition-all min-h-[36px] ${
                      allowHalbtaxPlusReload 
                        ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                        : 'bg-gray-100 text-gray-600 border border-gray-200'
                    }`}
                  >
                    {allowHalbtaxPlusReload ? <ToggleRight className="w-3 h-3 sm:w-4 sm:h-4" /> : <ToggleLeft className="w-3 h-3 sm:w-4 sm:h-4" />}
                    {allowHalbtaxPlusReload ? t('enabled') : t('disabled')}
                  </button>
                </div>
              )}
            </div>

            {/* Alle Optionen anzeigen */}
            <div className="space-y-3 sm:space-y-4">
              {results.options.map((option, index) => {
                const isBest = option.total === results.bestOption.total;
                const cardId = `option-${index}`;
                const isExpanded = expandedCards.has(cardId);
                
                return (
                  <div 
                    key={index}
                    className={`rounded-lg border-2 ${getOptionColor(option, results.bestOption.total)} transition-all duration-200`}
                  >
                    <div 
                      className="p-3 sm:p-4 cursor-pointer hover:bg-black/5 transition-colors"
                      onClick={() => toggleCardExpansion(cardId)}
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <h3 className="font-semibold flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2 text-sm sm:text-base">
                            <span className="truncate">{option.name}</span>
                            {isBest && <span className="text-xs bg-green-600 text-white px-2 py-1 rounded whitespace-nowrap">{t('bestOption')}</span>}
                          </h3>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3 self-end sm:self-auto">
                          <div className="text-base sm:text-lg font-bold">
                            {formatCurrency(option.total)}
                          </div>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                          ) : (
                            <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                          )}
                        </div>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="px-3 sm:px-4 pb-3 sm:pb-4 border-t border-gray-200/50">
                        <div className="pt-2 sm:pt-3 text-xs sm:text-sm space-y-1 sm:space-y-2">
                          {/* Purchase Link */}
                          {getPurchaseLink(option.type) && (
                            <div className="mb-3 pb-2 border-b border-gray-200/50">
                              <a
                                href={getPurchaseLink(option.type)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md text-xs sm:text-sm font-medium"
                              >
                                <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span>Purchase this subscription</span>
                              </a>
                            </div>
                          )}
                          
                          {option.type === 'none' && (
                            <div>{t('fullTicketPrices', { cost: formatCurrency(results.yearlySpendingFull) })}</div>
                          )}
                          
                          {option.type === 'halbtax' && (
                            <>
                              <div>{t('halbtaxLabel')} {formatCurrency(getHalbtaxPrice(age, true))}</div>
                              <div>{t('ticketsDiscount', { cost: formatCurrency(results.halbtaxTicketCosts) })}</div>
                            </>
                          )}
                          
                          {option.type === 'halbtaxplus' && (
                            <>
                              <div>{t('halbtaxPlus', { credit: option.credit })}: {formatCurrency(option.details.cost)}</div>
                              <div>{t('halbtaxLabel')} {formatCurrency(getHalbtaxPrice(age, true))}</div>
                              <div>{t('creditCovered', { cost: formatCurrency(option.details.coveredByCredit) })}</div>
                              
                              {option.details.reloadCount > 0 && allowHalbtaxPlusReload && (
                                <>
                                  <div className="text-orange-600 font-medium">{t('reloads')}</div>
                                  {option.details.reloadCount > 1 && (
                                    <div>{t('reloadFull', { count: option.details.reloadCount - 1, cost: formatCurrency((option.details.reloadCount - 1) * option.details.cost) })}</div>
                                  )}
                                  <div>{t('reloadPartial', { percent: Math.round(option.details.lastReloadRatio * 100), cost: formatCurrency(option.details.cost * option.details.lastReloadRatio) })}</div>
                                  <div className="font-medium">{t('reloadTotal', { cost: formatCurrency(option.details.reloadCost) })}</div>
                                </>
                              )}
                              
                              {option.details.halbtaxTicketsAfterCredit > 0 && !allowHalbtaxPlusReload && (
                                <>
                                  <div className="text-blue-600 font-medium">Regular Halbtax Tickets</div>
                                  <div>Remaining ticket costs (already with Halbtax discount): {formatCurrency(option.details.halbtaxTicketsAfterCredit)}</div>
                                </>
                              )}
                            </>
                          )}
                          
                          {option.type === 'ga' && (
                            <>
                              <div>GA ({isFirstClass ? t('firstClass') : t('secondClass')}): {formatCurrency(getGAPrice(age, isFirstClass))}</div>
                              <div>{t('unlimitedTravel')}</div>
                            </>
                          )}

                          {option.total !== results.bestOption.total && (
                            <div className="text-orange-600 font-medium pt-1 sm:pt-2 border-t border-gray-200/50 text-xs sm:text-sm">
                              {t('moreExpensive', { cost: formatCurrency(option.total - results.bestOption.total) })}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              
              {/* Streckenabo cards */}
              {results.streckenabos.length > 0 && results.streckenabos.map((streckenabo, index) => {
                const routeIndex = routes.findIndex(r => r.id === streckenabo.route.id) + 1;
                const statusInfo = !streckenabo.isInValidRange 
                  ? { badge: t('outsideRange'), badgeColor: 'bg-red-100 text-red-700', cardColor: 'border-red-200 bg-red-50' }
                  : streckenabo.isWorthwhile 
                  ? { badge: t('worthwhile'), badgeColor: 'bg-green-100 text-green-700', cardColor: 'border-purple-200 bg-purple-50' }
                  : { badge: t('notWorthwhile'), badgeColor: 'bg-orange-100 text-orange-700', cardColor: 'border-purple-200 bg-purple-50' };
                
                const cardId = `streckenabo-${index}`;
                const isExpanded = expandedCards.has(cardId);
                
                return (
                  <div 
                    key={`streckenabo-${index}`}
                    className={`rounded-lg border-2 ${statusInfo.cardColor} transition-all duration-200`}
                  >
                    <div 
                      className="p-3 sm:p-4 cursor-pointer hover:bg-black/5 transition-colors"
                      onClick={() => toggleCardExpansion(cardId)}
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <h3 className="font-semibold flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2 text-sm sm:text-base">
                            <span className="flex items-center gap-1">
                              🚂 <span className="truncate">{t('streckenabo')} - Route {routeIndex}</span>
                            </span>
                            <div className={`text-xs px-2 py-1 rounded-full ${statusInfo.badgeColor} whitespace-nowrap`}>
                              {t('estimate')}
                            </div>
                          </h3>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3 self-end sm:self-auto">
                          <div className="text-base sm:text-lg font-bold text-purple-700">
                            {formatCurrency(streckenabo.annualPrice)}
                          </div>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
                          ) : (
                            <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
                          )}
                        </div>
                      </div>
                      
                      <div className={`text-xs mt-2 sm:mt-3 px-2 py-1 rounded ${statusInfo.badgeColor} inline-block`}>
                        {statusInfo.badge}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="px-3 sm:px-4 pb-3 sm:pb-4 border-t border-gray-200/50">
                        <div className="pt-2 sm:pt-3 text-xs sm:text-sm space-y-1 sm:space-y-2">
                          {/* Purchase Link */}
                          {purchaseLinks.streckenabo && (
                            <div className="mb-3 pb-2 border-b border-gray-200/50">
                              <a
                                href={purchaseLinks.streckenabo}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md text-xs sm:text-sm font-medium"
                              >
                                <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span>Purchase this route pass</span>
                              </a>
                            </div>
                          )}
                          
                          <div>{t('monthlyPass', { cost: formatCurrency(streckenabo.monthlyCost) })}</div>
                          <div>{t('annualPass', { cost: formatCurrency(streckenabo.annualPrice) })}</div>
                          <div className="pt-1 sm:pt-2 border-t border-gray-200/50">
                            <div className="font-medium text-purple-700 mb-1 text-xs sm:text-sm">{t('streckenabosInfo')}</div>
                            <div className="text-gray-600 text-xs sm:text-sm">{t('streckenabosExplanation')}</div>
                            <div className="text-gray-500 italic text-xs mt-1">{t('streckenabosFormula')}</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Zusätzliche Insights */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 sm:p-6 rounded-xl border border-blue-200 shadow-sm">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
                  💡
                </div>
                <h3 className="font-semibold text-blue-900 text-base sm:text-lg">{t('additionalInfo')}</h3>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-white/70 backdrop-blur-sm p-3 sm:p-4 rounded-lg border border-blue-100">
                  <div className="flex items-center gap-2 mb-3 sm:mb-4">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="font-semibold text-gray-800 text-sm sm:text-base">{t('breakEvenPoints')}</div>
                  </div>
                  <div className="space-y-3 sm:space-y-4 text-xs sm:text-sm">
                    {/* Halbtax Break-even */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 font-medium text-xs sm:text-sm">{t('halbtaxLabel')}</span>
                        <span className="font-semibold text-gray-800 text-xs sm:text-sm">{formatCurrency(getHalbtaxPrice(age, true) * 2)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-green-500 h-1.5 sm:h-2 rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(100, (results.noAboTotal / (getHalbtaxPrice(age, true) * 2)) * 100)}%`
                          }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {t('yourCostsLabel')} {formatCurrency(results.noAboTotal)} ({Math.round((results.noAboTotal / (getHalbtaxPrice(age, true) * 2)) * 100)}%)
                      </div>
                    </div>
                    
                    {/* GA Break-even */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 font-medium text-xs sm:text-sm">{t('gaLabel')}</span>
                        <span className="font-semibold text-gray-800 text-xs sm:text-sm">{formatCurrency(results.gaTotal * 2)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-1.5 sm:h-2 rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(100, (results.noAboTotal / (results.gaTotal * 2)) * 100)}%`
                          }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {t('yourCostsLabel')} {formatCurrency(results.noAboTotal)} ({Math.round((results.noAboTotal / (results.gaTotal * 2)) * 100)}%)
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/70 backdrop-blur-sm p-3 sm:p-4 rounded-lg border border-blue-100">
                  <div className="flex items-center gap-2 mb-3 sm:mb-4">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <div className="font-semibold text-gray-800 text-sm sm:text-base">{t('yourCosts')}</div>
                  </div>
                  <div className="space-y-3 sm:space-y-4">
                    {/* Savings Visualization */}
                    <div className="relative">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs sm:text-sm text-gray-600">{t('withoutSubscription')}</span>
                        <span className="font-medium text-gray-800 text-xs sm:text-sm">{formatCurrency(results.noAboTotal)}</span>
                      </div>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs sm:text-sm text-gray-600 truncate pr-2">{t('bestOptionLabel', { option: results.bestOption.name })}</span>
                        <span className="font-medium text-emerald-700 text-xs sm:text-sm whitespace-nowrap">{formatCurrency(results.bestOption.total)}</span>
                      </div>
                      
                      {/* Visual Savings Bar */}
                      <div className="space-y-2">
                        <div className="w-full bg-red-100 rounded-lg h-5 sm:h-6 relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-red-200 to-red-300 rounded-lg"></div>
                          <div 
                            className="absolute left-0 top-0 h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-lg transition-all duration-700"
                            style={{
                              width: `${(results.bestOption.total / results.noAboTotal) * 100}%`
                            }}
                          ></div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xs font-semibold text-white drop-shadow-sm">
                              {t('percentageSaved', { percent: Math.round((1 - results.bestOption.total / results.noAboTotal) * 100) })}
                            </span>
                          </div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span className="truncate pr-2">{t('savedAmount', { amount: formatCurrency(results.noAboTotal - results.bestOption.total) })}</span>
                          <span className="whitespace-nowrap">{t('totalCostLabel')}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Summary Badge */}
                    <div className="text-center">
                      <div className="inline-flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-full shadow-sm text-xs sm:text-sm">
                        <span>💰</span>
                        <span className="font-semibold truncate">{t('saveAnnually', { amount: formatCurrency(results.noAboTotal - results.bestOption.total) })}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Halbtax Plus Erklärung wenn relevant */}
              {results.halbtaxPlusOptions.some(opt => opt.reloadCount > 0) && (
                <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-200 shadow-sm">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="p-1.5 sm:p-2 bg-orange-100 rounded-lg flex-shrink-0 mt-0.5">
                      🔄
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-orange-900 mb-2 flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2 text-sm sm:text-base">
                        <span>{t('halbtaxPlusInfo')}</span>
                        <div className="px-2 py-0.5 bg-orange-200 rounded-full text-xs text-orange-800 whitespace-nowrap">{t('autoReload')}</div>
                      </div>
                      <div className="text-xs sm:text-sm text-orange-800 leading-relaxed">
                        {t('halbtaxPlusExplanation')}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer with disclaimer */}
        <div className="mt-8 mb-4 px-4 py-6 bg-gray-50 rounded-lg border border-gray-200">
          <div className="max-w-4xl mx-auto text-xs sm:text-sm text-gray-600 leading-relaxed">
            <div className="whitespace-pre-line text-left">
              {t('disclaimer').split('\n').map((line, index) => {
                // Handle full-line bold headings (start and end with **)
                if (line.startsWith('**') && line.endsWith('**')) {
                  return <div key={index} className="font-bold text-gray-800 mt-3 mb-2">{line.replace(/^\*\*|\*\*$/g, '')}</div>;
                } 
                // Handle bullet points
                else if (line.startsWith('•')) {
                  // Parse inline bold text in bullet points
                  const parts = line.split(/(\*\*[^*]+\*\*)/);
                  return (
                    <div key={index} className="ml-4 mb-1">
                      {parts.map((part, i) => {
                        if (part.startsWith('**') && part.endsWith('**')) {
                          return <span key={i} className="font-bold">{part.replace(/^\*\*|\*\*$/g, '')}</span>;
                        }
                        return part;
                      })}
                    </div>
                  );
                } 
                // Handle lines with markdown links
                else if (line.includes('[') && line.includes(']') && line.includes('(') && line.includes(')')) {
                  // First handle bold text, then links
                  const handleBoldAndLinks = (text: string) => {
                    // Split by bold patterns first
                    const boldParts = text.split(/(\*\*[^*]+\*\*)/);
                    return boldParts.map((boldPart, boldIndex) => {
                      if (boldPart.startsWith('**') && boldPart.endsWith('**')) {
                        return <span key={boldIndex} className="font-bold">{boldPart.replace(/^\*\*|\*\*$/g, '')}</span>;
                      }
                      // Then handle links within non-bold parts
                      const linkParts = boldPart.split(/(\[([^\]]+)\]\(([^)]+)\))/);
                      return linkParts.map((part, linkIndex) => {
                        const linkMatch = part.match(/\[([^\]]+)\]\(([^)]+)\)/);
                        if (linkMatch) {
                          const [, text, url] = linkMatch;
                          return (
                            <a key={`${boldIndex}-${linkIndex}`} href={url.startsWith('http') ? url : `https://${url}`} 
                               target="_blank" rel="noopener noreferrer" 
                               className="text-blue-600 hover:text-blue-800 underline font-medium">
                              {text}
                            </a>
                          );
                        }
                        return part;
                      });
                    });
                  };
                  
                  return (
                    <div key={index} className="mt-2">
                      {handleBoldAndLinks(line)}
                    </div>
                  );
                } 
                // Handle regular text with inline bold formatting
                else if (line.trim()) {
                  const parts = line.split(/(\*\*[^*]+\*\*)/);
                  return (
                    <div key={index} className="mb-2">
                      {parts.map((part, i) => {
                        if (part.startsWith('**') && part.endsWith('**')) {
                          return <span key={i} className="font-bold">{part.replace(/^\*\*|\*\*$/g, '')}</span>;
                        }
                        return part;
                      })}
                    </div>
                  );
                } 
                // Handle empty lines
                else {
                  return <div key={index} className="mb-2"></div>;
                }
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SBBCalculator;