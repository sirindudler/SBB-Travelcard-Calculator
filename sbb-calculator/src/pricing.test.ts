import {
  sbbPricing,
  getPricing,
  getHalbtaxPrice,
  getGAPrice,
  getHalbtaxPlusOptions,
  getHalbtaxPlusBonus,
  getAgeGroupFromAge,
  AgeGroup,
  HalbtaxPlusOption
} from './pricing';

describe('SBB Pricing Tests', () => {
  describe('getPricing', () => {
    test('should return pricing structure', () => {
      const pricing = getPricing();
      expect(pricing).toBeDefined();
      expect(pricing.halbtax).toBeDefined();
      expect(pricing.ga).toBeDefined();
      expect(pricing.halbtaxPlus).toBeDefined();
    });

    test('should return same pricing as sbbPricing constant', () => {
      const pricing = getPricing();
      expect(pricing).toEqual(sbbPricing);
    });
  });

  describe('getHalbtaxPrice', () => {
    test('should return correct new customer prices for all age groups', () => {
      expect(getHalbtaxPrice('kind', true)).toBe(120);
      expect(getHalbtaxPrice('jugend', true)).toBe(120);
      expect(getHalbtaxPrice('fuenfundzwanzig', true)).toBe(190);
      expect(getHalbtaxPrice('erwachsene', true)).toBe(190);
      expect(getHalbtaxPrice('senior', true)).toBe(190);
      expect(getHalbtaxPrice('behinderung', true)).toBe(190);
    });

    test('should return correct loyalty prices for all age groups', () => {
      expect(getHalbtaxPrice('kind', false)).toBe(100);
      expect(getHalbtaxPrice('jugend', false)).toBe(100);
      expect(getHalbtaxPrice('fuenfundzwanzig', false)).toBe(170);
      expect(getHalbtaxPrice('erwachsene', false)).toBe(170);
      expect(getHalbtaxPrice('senior', false)).toBe(170);
      expect(getHalbtaxPrice('behinderung', false)).toBe(170);
    });

    test('should default to new customer price when no boolean provided', () => {
      expect(getHalbtaxPrice('erwachsene')).toBe(190);
      expect(getHalbtaxPrice('jugend')).toBe(120);
    });
  });

  describe('getGAPrice', () => {
    test('should return correct second class prices for all age groups', () => {
      expect(getGAPrice('kind', false)).toBe(1720);
      expect(getGAPrice('jugend', false)).toBe(2780);
      expect(getGAPrice('fuenfundzwanzig', false)).toBe(3495);
      expect(getGAPrice('erwachsene', false)).toBe(3995);
      expect(getGAPrice('senior', false)).toBe(3040);
      expect(getGAPrice('behinderung', false)).toBe(2600);
    });

    test('should return correct first class prices for all age groups', () => {
      expect(getGAPrice('kind', true)).toBe(2850);
      expect(getGAPrice('jugend', true)).toBe(4450);
      expect(getGAPrice('fuenfundzwanzig', true)).toBe(5670);
      expect(getGAPrice('erwachsene', true)).toBe(6520);
      expect(getGAPrice('senior', true)).toBe(4950);
      expect(getGAPrice('behinderung', true)).toBe(4120);
    });

    test('should default to second class when no boolean provided', () => {
      expect(getGAPrice('erwachsene')).toBe(3995);
      expect(getGAPrice('jugend')).toBe(2780);
    });
  });

  describe('getHalbtaxPlusOptions', () => {
    test('should return correct options for youth', () => {
      const options = getHalbtaxPlusOptions('jugend');
      expect(options).toEqual({
        '1000': { cost: 600, credit: 1000 },
        '2000': { cost: 1125, credit: 2000 },
        '3000': { cost: 1575, credit: 3000 }
      });
    });

    test('should return correct options for adults', () => {
      const options = getHalbtaxPlusOptions('erwachsene');
      expect(options).toEqual({
        '1000': { cost: 800, credit: 1000 },
        '2000': { cost: 1500, credit: 2000 },
        '3000': { cost: 2100, credit: 3000 }
      });
    });

    test('should return different options for youth vs adults', () => {
      const youthOptions = getHalbtaxPlusOptions('jugend');
      const adultOptions = getHalbtaxPlusOptions('erwachsene');
      expect(youthOptions['1000'].cost).toBeLessThan(adultOptions['1000'].cost);
    });
  });

  describe('getHalbtaxPlusBonus', () => {
    test('should calculate correct bonus for youth', () => {
      expect(getHalbtaxPlusBonus('jugend', '1000')).toBe(400); // 1000 - 600
      expect(getHalbtaxPlusBonus('jugend', '2000')).toBe(875); // 2000 - 1125
      expect(getHalbtaxPlusBonus('jugend', '3000')).toBe(1425); // 3000 - 1575
    });

    test('should calculate correct bonus for adults', () => {
      expect(getHalbtaxPlusBonus('erwachsene', '1000')).toBe(200); // 1000 - 800
      expect(getHalbtaxPlusBonus('erwachsene', '2000')).toBe(500); // 2000 - 1500
      expect(getHalbtaxPlusBonus('erwachsene', '3000')).toBe(900); // 3000 - 2100
    });

    test('should return 0 for invalid credit amount', () => {
      expect(getHalbtaxPlusBonus('jugend', '5000')).toBe(0);
      expect(getHalbtaxPlusBonus('erwachsene', '999')).toBe(0);
    });

    test('should verify youth gets better bonus than adults', () => {
      const youthBonus = getHalbtaxPlusBonus('jugend', '1000');
      const adultBonus = getHalbtaxPlusBonus('erwachsene', '1000');
      expect(youthBonus).toBeGreaterThan(adultBonus);
    });
  });

  describe('getAgeGroupFromAge', () => {
    test('should throw error for children under 6', () => {
      expect(() => getAgeGroupFromAge(5)).toThrow('Children under 6 travel free');
      expect(() => getAgeGroupFromAge(0)).toThrow('Children under 6 travel free');
      expect(() => getAgeGroupFromAge(-1)).toThrow('Children under 6 travel free');
    });

    test('should return "kind" for children 6-15', () => {
      expect(getAgeGroupFromAge(6)).toBe('kind');
      expect(getAgeGroupFromAge(10)).toBe('kind');
      expect(getAgeGroupFromAge(15)).toBe('kind');
    });

    test('should return "jugend" for youth 16-24', () => {
      expect(getAgeGroupFromAge(16)).toBe('jugend');
      expect(getAgeGroupFromAge(20)).toBe('jugend');
      expect(getAgeGroupFromAge(24)).toBe('jugend');
    });

    test('should return "fuenfundzwanzig" for exactly 25 years old', () => {
      expect(getAgeGroupFromAge(25)).toBe('fuenfundzwanzig');
    });

    test('should return "erwachsene" for adults 26-63', () => {
      expect(getAgeGroupFromAge(26)).toBe('erwachsene');
      expect(getAgeGroupFromAge(40)).toBe('erwachsene');
      expect(getAgeGroupFromAge(63)).toBe('erwachsene');
    });

    test('should return "senior" for seniors 65+', () => {
      expect(getAgeGroupFromAge(65)).toBe('senior');
      expect(getAgeGroupFromAge(70)).toBe('senior');
      expect(getAgeGroupFromAge(90)).toBe('senior');
    });

    test('should handle edge case for age 64', () => {
      // Age 64 can be either adult or senior depending on gender
      // The function returns adult for 64, which is correct for the general case
      expect(getAgeGroupFromAge(64)).toBe('erwachsene');
    });
  });

  describe('Pricing Structure Validation', () => {
    test('should have all required age groups in halbtax pricing', () => {
      const ageGroups: AgeGroup[] = ['kind', 'jugend', 'fuenfundzwanzig', 'erwachsene', 'senior', 'behinderung'];
      ageGroups.forEach(ageGroup => {
        expect(sbbPricing.halbtax[ageGroup]).toBeDefined();
        expect(sbbPricing.halbtax[ageGroup].newCustomer).toBeGreaterThan(0);
        expect(sbbPricing.halbtax[ageGroup].loyaltyPrice).toBeGreaterThan(0);
        expect(sbbPricing.halbtax[ageGroup].loyaltyPrice).toBeLessThanOrEqual(sbbPricing.halbtax[ageGroup].newCustomer);
      });
    });

    test('should have all required age groups in GA pricing', () => {
      const ageGroups: AgeGroup[] = ['kind', 'jugend', 'fuenfundzwanzig', 'erwachsene', 'senior', 'behinderung'];
      ageGroups.forEach(ageGroup => {
        expect(sbbPricing.ga[ageGroup]).toBeDefined();
        expect(sbbPricing.ga[ageGroup].secondClass).toBeGreaterThan(0);
        expect(sbbPricing.ga[ageGroup].firstClass).toBeGreaterThan(0);
        expect(sbbPricing.ga[ageGroup].firstClass).toBeGreaterThan(sbbPricing.ga[ageGroup].secondClass);
      });
    });

    test('should have valid Halbtax Plus options', () => {
      const categories: ('jugend' | 'erwachsene')[] = ['jugend', 'erwachsene'];
      const creditAmounts = ['1000', '2000', '3000'];
      
      categories.forEach(category => {
        creditAmounts.forEach(credit => {
          const option = sbbPricing.halbtaxPlus[category][credit];
          expect(option).toBeDefined();
          expect(option.cost).toBeGreaterThan(0);
          expect(option.credit).toBe(parseInt(credit));
          expect(option.credit).toBeGreaterThan(option.cost); // Credit should provide value
        });
      });
    });

    test('should have youth prices lower than adult prices for Halbtax Plus', () => {
      const creditAmounts = ['1000', '2000', '3000'];
      creditAmounts.forEach(credit => {
        const youthCost = sbbPricing.halbtaxPlus.jugend[credit].cost;
        const adultCost = sbbPricing.halbtaxPlus.erwachsene[credit].cost;
        expect(youthCost).toBeLessThan(adultCost);
      });
    });
  });

  describe('Price Consistency Tests', () => {
    test('should have consistent pricing hierarchy for GA', () => {
      // Generally, prices should increase with age until senior discounts kick in
      const secondClassPrices = [
        sbbPricing.ga.kind.secondClass,        // 1720
        sbbPricing.ga.jugend.secondClass,      // 2780
        sbbPricing.ga.fuenfundzwanzig.secondClass, // 3495
        sbbPricing.ga.erwachsene.secondClass,  // 3995
        sbbPricing.ga.senior.secondClass       // 3040 (discount for seniors)
      ];
      
      expect(secondClassPrices[0]).toBeLessThan(secondClassPrices[1]); // kind < jugend
      expect(secondClassPrices[1]).toBeLessThan(secondClassPrices[2]); // jugend < 25
      expect(secondClassPrices[2]).toBeLessThan(secondClassPrices[3]); // 25 < erwachsene
      expect(secondClassPrices[4]).toBeLessThan(secondClassPrices[3]); // senior < erwachsene
    });

    test('should have loyalty prices lower than new customer prices', () => {
      const ageGroups: AgeGroup[] = ['kind', 'jugend', 'fuenfundzwanzig', 'erwachsene', 'senior', 'behinderung'];
      ageGroups.forEach(ageGroup => {
        expect(sbbPricing.halbtax[ageGroup].loyaltyPrice)
          .toBeLessThan(sbbPricing.halbtax[ageGroup].newCustomer);
      });
    });

    test('should have disability pricing equal to adult pricing', () => {
      expect(sbbPricing.halbtax.behinderung.newCustomer).toBe(sbbPricing.halbtax.erwachsene.newCustomer);
      expect(sbbPricing.halbtax.behinderung.loyaltyPrice).toBe(sbbPricing.halbtax.erwachsene.loyaltyPrice);
      expect(sbbPricing.ga.behinderung.secondClass).toBeLessThan(sbbPricing.ga.erwachsene.secondClass);
      expect(sbbPricing.ga.behinderung.firstClass).toBeLessThan(sbbPricing.ga.erwachsene.firstClass);
    });
  });
});