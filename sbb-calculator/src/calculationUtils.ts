import { getHalbtaxPrice, getGAPrice, getHalbtaxPlusOptions, AgeGroup } from './pricing';

export interface Route {
  id: number;
  trips: number;
  cost: number;
  isHalbtaxPrice: boolean;
}

export interface CalculationInputs {
  age: AgeGroup;
  isFirstClass: boolean;
  isNewCustomer: boolean;
  allowHalbtaxPlusRebuying: boolean;
  inputMode: 'simple' | 'direct';
  routes: Route[];
  yearlySpendingDirect: number;
}

export interface HalbtaxPlusDetails {
  credit: number;
  cost: number;
  total: number;
  coveredByCredit: number;
  remainingCosts: number;
  reloadCount: number;
  reloadCost: number;
  halbtaxTicketsAfterCredit: number;
  lastReloadUsage?: number;
  lastReloadRatio?: number;
}

export interface SubscriptionOption {
  name: string;
  total: number;
  type: 'none' | 'halbtax' | 'halbtaxplus' | 'ga';
  credit?: number;
  details?: HalbtaxPlusDetails;
}

export interface CalculationResults {
  yearlySpendingFull: number;
  halbtaxTicketCosts: number;
  noAboTotal: number;
  halbtaxTotal: number;
  halbtaxPlusOptions: HalbtaxPlusDetails[];
  gaTotal: number;
  options: SubscriptionOption[];
  bestOption: SubscriptionOption;
}

/**
 * Calculate yearly spending without any subscription
 */
export function calculateYearlySpending(
  inputMode: 'simple' | 'direct',
  routes: Route[],
  yearlySpendingDirect: number
): number {
  if (inputMode === 'simple') {
    return routes.reduce((total, route) => {
      const routeYearly = route.trips * route.cost * 52;
      return total + (route.isHalbtaxPrice ? routeYearly * 2 : routeYearly);
    }, 0);
  } else {
    return yearlySpendingDirect;
  }
}

/**
 * Calculate ticket costs with Halbtax discount
 */
export function calculateHalbtaxTicketCosts(
  inputMode: 'simple' | 'direct',
  routes: Route[],
  yearlySpendingFull: number
): number {
  if (inputMode === 'simple') {
    return routes.reduce((total, route) => {
      const routeYearly = route.trips * route.cost * 52;
      return total + (route.isHalbtaxPrice ? routeYearly : routeYearly / 2);
    }, 0);
  } else {
    return yearlySpendingFull / 2;
  }
}

/**
 * Map age groups to Halbtax Plus categories
 */
export function getHalbtaxPlusCategory(ageGroup: AgeGroup): 'jugend' | 'erwachsene' | null {
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
}

/**
 * Calculate Halbtax Plus options with reload logic
 */
export function calculateHalbtaxPlusOptions(
  age: AgeGroup,
  halbtaxTicketCosts: number,
  halbtaxPrice: number,
  allowHalbtaxPlusRebuying: boolean
): HalbtaxPlusDetails[] {
  const halbtaxPlusCategory = getHalbtaxPlusCategory(age);
  
  if (!halbtaxPlusCategory) {
    return [];
  }

  const halbtaxPlusOptions = getHalbtaxPlusOptions(halbtaxPlusCategory);
  
  return Object.entries(halbtaxPlusOptions).map(([credit, data]) => {
    const creditAmount = data.credit;
    const packageCost = data.cost;
    
    if (halbtaxTicketCosts <= creditAmount) {
      // All costs covered by initial credit
      return {
        credit: parseInt(credit),
        cost: packageCost,
        total: packageCost + halbtaxPrice,
        coveredByCredit: halbtaxTicketCosts,
        remainingCosts: 0,
        reloadCount: 0,
        reloadCost: 0,
        halbtaxTicketsAfterCredit: 0
      };
    } else {
      // More costs than initial credit
      const remainingAfterFirst = halbtaxTicketCosts - creditAmount;
      
      if (allowHalbtaxPlusRebuying) {
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
        
        return {
          credit: parseInt(credit),
          cost: packageCost,
          total: packageCost + halbtaxPrice + totalReloadCost,
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
        return {
          credit: parseInt(credit),
          cost: packageCost,
          total: packageCost + halbtaxPrice + remainingAfterFirst,
          coveredByCredit: creditAmount,
          remainingCosts: remainingAfterFirst,
          reloadCount: 0,
          reloadCost: 0,
          halbtaxTicketsAfterCredit: remainingAfterFirst
        };
      }
    }
  });
}

/**
 * Main calculation function
 */
export function calculateFareOptions(inputs: CalculationInputs): CalculationResults {
  const {
    age,
    isFirstClass,
    isNewCustomer,
    allowHalbtaxPlusRebuying,
    inputMode,
    routes,
    yearlySpendingDirect
  } = inputs;

  // Calculate yearly spending without subscription
  const yearlySpendingFull = calculateYearlySpending(inputMode, routes, yearlySpendingDirect);
  
  // Calculate costs for each subscription type
  const halbtaxPrice = getHalbtaxPrice(age, isNewCustomer);
  const gaPrice = getGAPrice(age, isFirstClass);
  
  // Option 1: No subscription
  const noAboTotal = yearlySpendingFull;
  
  // Option 2: Halbtax only
  const halbtaxTicketCosts = calculateHalbtaxTicketCosts(inputMode, routes, yearlySpendingFull);
  const halbtaxTotal = halbtaxTicketCosts + halbtaxPrice;
  
  // Option 3: Halbtax Plus (all variants) with reload logic
  const halbtaxPlusOptions = calculateHalbtaxPlusOptions(
    age,
    halbtaxTicketCosts,
    halbtaxPrice,
    allowHalbtaxPlusRebuying
  );
  
  // Option 4: GA
  const gaTotal = gaPrice;
  
  // Create all options array
  const options: SubscriptionOption[] = [
    { name: 'No Subscription', total: noAboTotal, type: 'none' },
    { name: 'Halbtax Only', total: halbtaxTotal, type: 'halbtax' },
    ...halbtaxPlusOptions.map(opt => ({ 
      name: `Halbtax Plus ${opt.credit}`, 
      total: opt.total, 
      type: 'halbtaxplus' as const,
      credit: opt.credit,
      details: opt
    })),
    { name: 'GA', total: gaTotal, type: 'ga' }
  ];
  
  // Find best option
  const bestOption = options.reduce((best, current) => 
    current.total < best.total ? current : best
  );
  
  return {
    yearlySpendingFull,
    halbtaxTicketCosts,
    noAboTotal,
    halbtaxTotal,
    halbtaxPlusOptions,
    gaTotal,
    options,
    bestOption
  };
}