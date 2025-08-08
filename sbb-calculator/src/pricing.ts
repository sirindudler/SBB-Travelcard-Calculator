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