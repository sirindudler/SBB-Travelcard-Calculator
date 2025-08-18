// Swiss Federal Railways (SBB) Pricing Structure
// Last updated: 2025
// All prices in Swiss Francs (CHF)

export type AgeGroup = 
  | 'kind'           // 6-16 years
  | 'jugend'         // 16-25 years  
  | 'fuenfundzwanzig' // exactly 25 years old
  | 'erwachsene'     // 26-64/65 years
  | 'senior'         // 64+/65+ years
  | 'behinderung';   // travelers with disabilities

export interface HalbtaxPlusOption {
  cost: number;
  credit: number;
}

export interface GAPrice {
  secondClass: number;
  firstClass: number;
}

export interface HalbtaxPrice {
  newCustomer: number;    // Neukauf
  loyaltyPrice: number;   // Treuepreis (from 2nd year)
}

export interface PriceStructure {
  halbtax: Record<AgeGroup, HalbtaxPrice>;
  ga: Record<AgeGroup, GAPrice>;
  halbtaxPlus: Record<'jugend' | 'erwachsene', Record<string, HalbtaxPlusOption>>;
  ganight: number; // CHF 99 for under 25, 2nd class only
}

// Current SBB pricing as of 2025
export const sbbPricing: PriceStructure = {
  // Half-fare card (Halbtax) annual subscription prices
  halbtax: {
    kind: { 
      newCustomer: 120, 
      loyaltyPrice: 100 
    },           // Children use youth pricing
    jugend: { 
      newCustomer: 120, 
      loyaltyPrice: 100 
    },         // Youth (16-25 years)
    fuenfundzwanzig: { 
      newCustomer: 190, 
      loyaltyPrice: 170 
    }, // 25-year-olds use adult pricing
    erwachsene: { 
      newCustomer: 190, 
      loyaltyPrice: 170 
    },   // Adult (25+ years)
    senior: { 
      newCustomer: 190, 
      loyaltyPrice: 170 
    },       // Seniors use adult pricing
    behinderung: { 
      newCustomer: 190, 
      loyaltyPrice: 170 
    }   // Disabled travelers use adult pricing
  },

  // General Abonnement (GA) annual subscription prices  
  ga: {
    kind: { 
      secondClass: 1720, 
      firstClass: 2850 
    },           // GA Kind (6-16 years)
    jugend: { 
      secondClass: 2780, 
      firstClass: 4450 
    },         // GA Jugend (16-25 years)
    fuenfundzwanzig: { 
      secondClass: 3495, 
      firstClass: 5670 
    }, // GA 25-Jährige
    erwachsene: { 
      secondClass: 3995, 
      firstClass: 6520 
    },   // GA Erwachsene (26-64/65 years)
    senior: { 
      secondClass: 3040, 
      firstClass: 4950 
    },       // GA Senior/Seniorin (64+/65+ years)
    behinderung: { 
      secondClass: 2600, 
      firstClass: 4120 
    }   // GA für Reisende mit Behinderung
  },

  // Half-fare Plus with travel credit options (only available for youth and adults)
  halbtaxPlus: {
    jugend: {
      '1000': { cost: 600, credit: 1000 },   // CHF 600 for CHF 1000 credit (CHF 400 bonus)
      '2000': { cost: 1125, credit: 2000 },  // CHF 1125 for CHF 2000 credit (CHF 875 bonus)
      '3000': { cost: 1575, credit: 3000 }   // CHF 1575 for CHF 3000 credit (CHF 1425 bonus)
    },
    erwachsene: {
      '1000': { cost: 800, credit: 1000 },   // CHF 800 for CHF 1000 credit (CHF 200 bonus)
      '2000': { cost: 1500, credit: 2000 },  // CHF 1500 for CHF 2000 credit (CHF 500 bonus)
      '3000': { cost: 2100, credit: 3000 }   // CHF 2100 for CHF 3000 credit (CHF 900 bonus)
    }
  },

  // GA Night - only for under 25, 2nd class, night hours (19:00-05:00, weekends until 07:00)
  ganight: 99
};

// Utility function to get pricing data (future-proofing for dynamic pricing)
export const getPricing = (): PriceStructure => {
  return sbbPricing;
};

// Helper functions for specific price lookups
export const getHalbtaxPrice = (ageGroup: AgeGroup, isNewCustomer: boolean = true): number => {
  return isNewCustomer 
    ? sbbPricing.halbtax[ageGroup].newCustomer
    : sbbPricing.halbtax[ageGroup].loyaltyPrice;
};

export const getGAPrice = (ageGroup: AgeGroup, firstClass: boolean = false): number => {
  return firstClass 
    ? sbbPricing.ga[ageGroup].firstClass
    : sbbPricing.ga[ageGroup].secondClass;
};

export const getMonthlyGAPrice = (ageGroup: AgeGroup, firstClass: boolean = false): number => {
  return firstClass 
    ? monthlyPricing.ga[ageGroup].firstClass
    : monthlyPricing.ga[ageGroup].secondClass;
};

export const getHalbtaxPlusOptions = (ageGroup: 'jugend' | 'erwachsene'): Record<string, HalbtaxPlusOption> => {
  return sbbPricing.halbtaxPlus[ageGroup];
};

export const getHalbtaxPlusBonus = (ageGroup: 'jugend' | 'erwachsene', creditAmount: string): number => {
  const option = sbbPricing.halbtaxPlus[ageGroup][creditAmount];
  return option ? option.credit - option.cost : 0;
};

// GA Night helper functions
export const getGANightPrice = (): number => {
  return sbbPricing.ganight;
};

export const isGANightEligible = (ageGroup: AgeGroup, isFirstClass: boolean): boolean => {
  // GA Night is only available for under 25 (kind, jugend) and 2nd class only
  return (ageGroup === 'kind' || ageGroup === 'jugend') && !isFirstClass;
};

// Age group validation helpers
export const getAgeGroupFromAge = (age: number): AgeGroup => {
  if (age < 6) throw new Error('Children under 6 travel free');
  if (age < 16) return 'kind';
  if (age < 25) return 'jugend';
  if (age === 25) return 'fuenfundzwanzig';
  if (age < 64) return 'erwachsene'; // For women, senior starts at 64
  if (age < 65) return 'erwachsene'; // For men, senior starts at 65
  return 'senior';
};

// Special pricing variants (for future extension)
export interface FamiliaGAPrices {
  kind: { secondClass: number; firstClass: number; };
  jugend: { secondClass: number; firstClass: number; };
  erwachsene: { secondClass: number; firstClass: number; };
}

export const gaFamilia: FamiliaGAPrices = {
  kind: { secondClass: 710, firstClass: 2850 },      // GA Familia Kind
  jugend: { secondClass: 970, firstClass: 2880 },    // GA Familia Jugend  
  erwachsene: { secondClass: 2290, firstClass: 3590 } // GA Familia Erwachsene
};

// Monthly pricing (for reference - 6 month minimum contract)
export const monthlyPricing = {
  ga: {
    kind: { secondClass: 165, firstClass: 260 },
    jugend: { secondClass: 260, firstClass: 400 },
    fuenfundzwanzig: { secondClass: 310, firstClass: 490 },
    erwachsene: { secondClass: 355, firstClass: 565 },
    senior: { secondClass: 275, firstClass: 440 },
    behinderung: { secondClass: 240, firstClass: 365 }
  }
};

// MyRide.ch Smart-Abo progressive bonus system
export interface MyRideCalculationResult {
  monthlyBill: number;
  secondClassBonus: number;
  firstClassBonus: number;
  smartAboFee: number;
  halbtaxCredit: number;
  totalTravelCosts: number;
  secondClassCosts: number;
  firstClassUpgradeCosts: number;
}

// MyRide.ch Smart-Abo constants
export const MYRIDE_SMART_ABO_FEE = 15; // CHF 15 monthly fee
export const MYRIDE_HALBTAX_CREDIT = 14; // CHF 14 monthly credit

// Calculate 2nd class progressive bonus
export function calculateMyRide2ndClassBonus(monthlyTravelCosts: number): number {
  let totalBonus = 0;
  let remainingCosts = monthlyTravelCosts;
  
  // Tier 1: First CHF 50 at 10%
  if (remainingCosts > 0) {
    const tierAmount = Math.min(remainingCosts, 50);
    totalBonus += tierAmount * 0.10;
    remainingCosts -= tierAmount;
  }
  
  // Tier 2: Next CHF 100 (50-150) at 20%
  if (remainingCosts > 0) {
    const tierAmount = Math.min(remainingCosts, 100);
    totalBonus += tierAmount * 0.20;
    remainingCosts -= tierAmount;
  }
  
  // Tier 3: Next CHF 100 (150-250) at 40%
  if (remainingCosts > 0) {
    const tierAmount = Math.min(remainingCosts, 100);
    totalBonus += tierAmount * 0.40;
    remainingCosts -= tierAmount;
  }
  
  // Tier 4: Next CHF 100 (250-350) at 60%
  if (remainingCosts > 0) {
    const tierAmount = Math.min(remainingCosts, 100);
    totalBonus += tierAmount * 0.60;
    remainingCosts -= tierAmount;
  }
  
  // Tier 5: Remaining amount (350+) at 80%
  if (remainingCosts > 0) {
    totalBonus += remainingCosts * 0.80;
  }
  
  return totalBonus;
}

// Calculate 1st class extra progressive bonus
export function calculateMyRide1stClassBonus(monthlyUpgradeCosts: number): number {
  let totalBonus = 0;
  let remainingCosts = monthlyUpgradeCosts;
  
  // Tier 1: First CHF 35 at 10%
  if (remainingCosts > 0) {
    const tierAmount = Math.min(remainingCosts, 35);
    totalBonus += tierAmount * 0.10;
    remainingCosts -= tierAmount;
  }
  
  // Tier 2: Next CHF 70 (35-105) at 20%
  if (remainingCosts > 0) {
    const tierAmount = Math.min(remainingCosts, 70);
    totalBonus += tierAmount * 0.20;
    remainingCosts -= tierAmount;
  }
  
  // Tier 3: Next CHF 70 (105-175) at 40%
  if (remainingCosts > 0) {
    const tierAmount = Math.min(remainingCosts, 70);
    totalBonus += tierAmount * 0.40;
    remainingCosts -= tierAmount;
  }
  
  // Tier 4: Next CHF 70 (175-245) at 60%
  if (remainingCosts > 0) {
    const tierAmount = Math.min(remainingCosts, 70);
    totalBonus += tierAmount * 0.60;
    remainingCosts -= tierAmount;
  }
  
  // Tier 5: Remaining amount (245+) at 80%
  if (remainingCosts > 0) {
    totalBonus += remainingCosts * 0.80;
  }
  
  return totalBonus;
}

// Calculate MyRide.ch monthly bill
export function calculateMyRideMonthlyBill(
  monthlyTravelCosts: number,
  isFirstClass: boolean = false,
  hasHalbtax: boolean = false
): MyRideCalculationResult {
  // Split costs for 1st class travel (1.5x multiplier)
  let secondClassCosts: number;
  let firstClassUpgradeCosts: number;
  
  if (isFirstClass) {
    // 1st class total = 2nd class base × 1.5
    // Upgrade cost = 1st class total - 2nd class base = base × 0.5
    secondClassCosts = monthlyTravelCosts / 1.5;
    firstClassUpgradeCosts = monthlyTravelCosts - secondClassCosts;
  } else {
    secondClassCosts = monthlyTravelCosts;
    firstClassUpgradeCosts = 0;
  }
  
  // Calculate progressive bonuses
  const secondClassBonus = calculateMyRide2ndClassBonus(secondClassCosts);
  const firstClassBonus = calculateMyRide1stClassBonus(firstClassUpgradeCosts);
  
  // Apply Halbtax credit if applicable
  const halbtaxCredit = hasHalbtax ? MYRIDE_HALBTAX_CREDIT : 0;
  
  // Calculate final monthly bill
  const monthlyBill = monthlyTravelCosts
    - secondClassBonus
    - firstClassBonus
    + MYRIDE_SMART_ABO_FEE
    - halbtaxCredit;
  
  return {
    monthlyBill: Math.max(0, monthlyBill), // Ensure non-negative
    secondClassBonus,
    firstClassBonus,
    smartAboFee: MYRIDE_SMART_ABO_FEE,
    halbtaxCredit,
    totalTravelCosts: monthlyTravelCosts,
    secondClassCosts,
    firstClassUpgradeCosts
  };
}

// Calculate annual MyRide.ch cost
export function calculateMyRideAnnualCost(
  annualTravelCosts: number,
  isFirstClass: boolean = false,
  hasHalbtax: boolean = false
): number {
  const monthlyTravelCosts = annualTravelCosts / 12;
  const result = calculateMyRideMonthlyBill(monthlyTravelCosts, isFirstClass, hasHalbtax);
  return result.monthlyBill * 12;
}

// MyRide.ch comparison result
export interface MyRideComparison {
  status: 'worthwhile' | 'close' | 'expensive';
  ratio: number; // MyRide cost / best option cost
}

// Compare MyRide.ch against the best available option
export function compareMyRideAgainstBest(
  myRideCost: number,
  bestOptionCost: number
): MyRideComparison {
  const ratio = myRideCost / bestOptionCost;
  
  if (ratio <= 1.1) { // Within 10% of best option
    return { status: 'worthwhile', ratio };
  } else if (ratio <= 1.5) { // Within 50% of best option
    return { status: 'close', ratio };
  } else { // More than 50% above best option
    return { status: 'expensive', ratio };
  }
}

// Legacy function for backwards compatibility (deprecated)
export function isMyRideWorthwhile(
  annualTravelCosts: number,
  isFirstClass: boolean = false,
  hasHalbtax: boolean = false
): boolean {
  const myRideAnnualCost = calculateMyRideAnnualCost(annualTravelCosts, isFirstClass, hasHalbtax);
  
  // Conservative threshold: MyRide should save at least 10% compared to no subscription
  const savingsThreshold = annualTravelCosts * 0.9;
  
  return myRideAnnualCost < savingsThreshold && annualTravelCosts > 500; // Minimum travel threshold
}