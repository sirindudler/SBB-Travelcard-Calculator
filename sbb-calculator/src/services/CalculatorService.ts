import { calculateFareOptions, CalculationInputs, CalculationResults } from '../calculationUtils';
import { AgeGroup } from '../pricing';
import { RouteColorScheme } from '../utils/colorSchemes';

export interface Route {
  id: number;
  name: string;
  from: string;
  to: string;
  trips: number | '';
  cost: number | '';
  isHalbtaxPrice: boolean;
  colorScheme: RouteColorScheme;
  durationMonths: number;
  frequencyType: 'weekly' | 'monthly';
  isGANightEligible: boolean;
}

export interface ExtendedCalculationResults extends CalculationResults {
  gaMonthsUsed?: number;
  gaIsMonthlyPricing?: boolean;
  streckenabos: { 
    route: Route; 
    annualPrice: number; 
    monthlyCost: number; 
    isWorthwhile: boolean; 
    isInValidRange: boolean;
  }[];
}

export class CalculatorService {
  static calculateResults(
    inputMode: 'simple' | 'direct' | 'pdf',
    routes: Route[],
    yearlySpendingDirect: number,
    age: AgeGroup,
    isFirstClass: boolean,
    isNewCustomer: boolean,
    allowHalbtaxPlusReload: boolean,
    gaMonthsUsed?: number,
    gaIsMonthlyPricing?: boolean
  ): ExtendedCalculationResults {
    
    const validRoutes = routes.filter(route => 
      route.trips !== '' && route.cost !== '' && 
      Number(route.trips) > 0 && Number(route.cost) > 0
    );

    const calculationInputs: CalculationInputs = {
      age,
      isFirstClass,
      isNewCustomer,
      allowHalbtaxPlusReload,
      inputMode: inputMode === 'pdf' ? 'direct' : inputMode,
      routes: validRoutes.map(route => ({
        id: route.id,
        trips: Number(route.trips),
        cost: Number(route.cost),
        isHalbtaxPrice: route.isHalbtaxPrice
      })),
      yearlySpendingDirect
    };

    const baseResults = calculateFareOptions(calculationInputs);
    
    const streckenabos = this.calculateStreckenabos(validRoutes);

    const extendedResults: ExtendedCalculationResults = {
      ...baseResults,
      gaMonthsUsed,
      gaIsMonthlyPricing,
      streckenabos
    };

    return extendedResults;
  }

  private static calculateStreckenabos(routes: Route[]): ExtendedCalculationResults['streckenabos'] {
    return routes.map(route => {
      const trips = Number(route.trips);
      const cost = Number(route.cost);
      const durationMonths = route.durationMonths;
      const frequencyType = route.frequencyType;
      
      let annualCost = 0;
      if (frequencyType === 'weekly') {
        annualCost = trips * cost * 52;
      } else {
        annualCost = trips * cost * 12;
      }

      if (route.isHalbtaxPrice) {
        annualCost *= 2;
      }

      const streckenAboMultiplier = this.getStreckenAboMultiplier(cost);
      const annualPrice = cost * streckenAboMultiplier * 12;
      const monthlyCost = cost * streckenAboMultiplier;
      
      const isInValidRange = cost >= 3 && cost <= 1000;
      const isWorthwhile = annualPrice < annualCost && isInValidRange;

      return {
        route,
        annualPrice,
        monthlyCost,
        isWorthwhile,
        isInValidRange
      };
    });
  }

  private static getStreckenAboMultiplier(singleTicketPrice: number): number {
    if (singleTicketPrice < 3) return 0;
    if (singleTicketPrice <= 5) return 8;
    if (singleTicketPrice <= 10) return 7.5;
    if (singleTicketPrice <= 20) return 7;
    if (singleTicketPrice <= 50) return 6.5;
    if (singleTicketPrice <= 100) return 6;
    if (singleTicketPrice <= 200) return 5.5;
    if (singleTicketPrice <= 500) return 5;
    if (singleTicketPrice <= 1000) return 4.5;
    return 0;
  }

  static validateRouteInputs(routes: Route[]): boolean {
    return routes.some(route => 
      route.trips !== '' && route.cost !== '' && 
      Number(route.trips) > 0 && Number(route.cost) > 0
    );
  }

  static getPercentageDifference(basePrice: number, comparePrice: number): number {
    if (basePrice === 0) return 0;
    return ((comparePrice - basePrice) / basePrice) * 100;
  }
}