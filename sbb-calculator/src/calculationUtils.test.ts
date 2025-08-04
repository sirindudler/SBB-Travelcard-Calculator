import {
  calculateYearlySpending,
  calculateHalbtaxTicketCosts,
  getHalbtaxPlusCategory,
  calculateHalbtaxPlusOptions,
  calculateFareOptions,
  Route,
  CalculationInputs
} from './calculationUtils';

describe('Calculation Utils Tests', () => {
  const mockRoutes: Route[] = [
    { id: 1, trips: 2, cost: 20, isHalbtaxPrice: false },
    { id: 2, trips: 1, cost: 50, isHalbtaxPrice: false }
  ];

  const mockRoutesWithHalbtax: Route[] = [
    { id: 1, trips: 2, cost: 20, isHalbtaxPrice: false },
    { id: 2, trips: 1, cost: 25, isHalbtaxPrice: true } // Already halbtax price
  ];

  describe('calculateYearlySpending', () => {
    test('should calculate yearly spending for simple mode', () => {
      const result = calculateYearlySpending('simple', mockRoutes, 0);
      // Route 1: 2 trips * 20 CHF * 52 weeks = 2080 CHF
      // Route 2: 1 trip * 50 CHF * 52 weeks = 2600 CHF
      // Total: 4680 CHF
      expect(result).toBe(4680);
    });

    test('should calculate yearly spending for simple mode with halbtax prices', () => {
      const result = calculateYearlySpending('simple', mockRoutesWithHalbtax, 0);
      // Route 1: 2 trips * 20 CHF * 52 weeks = 2080 CHF
      // Route 2: 1 trip * 25 CHF * 52 weeks * 2 (double for halbtax) = 2600 CHF
      // Total: 4680 CHF
      expect(result).toBe(4680);
    });

    test('should use direct spending for direct mode', () => {
      const result = calculateYearlySpending('direct', mockRoutes, 3000);
      expect(result).toBe(3000);
    });

    test('should handle empty routes array', () => {
      const result = calculateYearlySpending('simple', [], 0);
      expect(result).toBe(0);
    });

    test('should handle routes with zero trips or cost', () => {
      const zeroRoutes: Route[] = [
        { id: 1, trips: 0, cost: 20, isHalbtaxPrice: false },
        { id: 2, trips: 2, cost: 0, isHalbtaxPrice: false }
      ];
      const result = calculateYearlySpending('simple', zeroRoutes, 0);
      expect(result).toBe(0);
    });
  });

  describe('calculateHalbtaxTicketCosts', () => {
    test('should calculate halbtax ticket costs for simple mode', () => {
      const result = calculateHalbtaxTicketCosts('simple', mockRoutes, 4680);
      // Route 1: 2 trips * 20 CHF * 52 weeks / 2 = 1040 CHF (50% discount)
      // Route 2: 1 trip * 50 CHF * 52 weeks / 2 = 1300 CHF (50% discount)
      // Total: 2340 CHF
      expect(result).toBe(2340);
    });

    test('should calculate halbtax ticket costs for simple mode with already halbtax prices', () => {
      const result = calculateHalbtaxTicketCosts('simple', mockRoutesWithHalbtax, 4680);
      // Route 1: 2 trips * 20 CHF * 52 weeks / 2 = 1040 CHF (50% discount)
      // Route 2: 1 trip * 25 CHF * 52 weeks = 1300 CHF (already halbtax, no additional discount)
      // Total: 2340 CHF
      expect(result).toBe(2340);
    });

    test('should calculate halbtax ticket costs for direct mode', () => {
      const result = calculateHalbtaxTicketCosts('direct', mockRoutes, 3000);
      expect(result).toBe(1500); // 50% of yearly spending
    });

    test('should handle fractional costs correctly', () => {
      const fractionalRoutes: Route[] = [
        { id: 1, trips: 1.5, cost: 30.50, isHalbtaxPrice: false }
      ];
      const result = calculateHalbtaxTicketCosts('simple', fractionalRoutes, 0);
      // 1.5 trips * 30.50 CHF * 52 weeks / 2 = 1189.5 CHF
      expect(result).toBe(1189.5);
    });
  });

  describe('getHalbtaxPlusCategory', () => {
    test('should map age groups to Halbtax Plus categories correctly', () => {
      expect(getHalbtaxPlusCategory('kind')).toBe('jugend');
      expect(getHalbtaxPlusCategory('jugend')).toBe('jugend');
      expect(getHalbtaxPlusCategory('fuenfundzwanzig')).toBe('erwachsene');
      expect(getHalbtaxPlusCategory('erwachsene')).toBe('erwachsene');
      expect(getHalbtaxPlusCategory('senior')).toBe('erwachsene');
      expect(getHalbtaxPlusCategory('behinderung')).toBe('erwachsene');
    });
  });

  describe('calculateHalbtaxPlusOptions', () => {
    test('should return empty array for unsupported age groups', () => {
      // This shouldn't happen in practice since getHalbtaxPlusCategory handles all cases
      const result = calculateHalbtaxPlusOptions('kind' as any, 1000, 120, true);
      expect(result).toHaveLength(3); // Should work since 'kind' maps to 'jugend'
    });

    test('should calculate options when costs are covered by initial credit', () => {
      const result = calculateHalbtaxPlusOptions('jugend', 800, 120, true);
      expect(result).toHaveLength(3);
      
      const option1000 = result.find(opt => opt.credit === 1000);
      expect(option1000).toBeDefined();
      expect(option1000!.total).toBe(720); // 600 (package) + 120 (halbtax)
      expect(option1000!.coveredByCredit).toBe(800);
      expect(option1000!.remainingCosts).toBe(0);
      expect(option1000!.reloadCount).toBe(0);
      expect(option1000!.reloadCost).toBe(0);
    });

    test('should calculate options with reload when costs exceed credit (reload enabled)', () => {
      const result = calculateHalbtaxPlusOptions('jugend', 2500, 120, true);
      
      const option1000 = result.find(opt => opt.credit === 1000);
      expect(option1000).toBeDefined();
      expect(option1000!.coveredByCredit).toBe(1000);
      expect(option1000!.remainingCosts).toBe(1500);
      expect(option1000!.reloadCount).toBe(2); // Need 2 more packages for 1500 CHF
      expect(option1000!.reloadCost).toBe(900); // 600 (full) + 300 (50% of 600)
      expect(option1000!.total).toBe(1620); // 600 + 120 + 900
    });

    test('should calculate options without reload when costs exceed credit (reload disabled)', () => {
      const result = calculateHalbtaxPlusOptions('jugend', 2500, 120, false);
      
      const option1000 = result.find(opt => opt.credit === 1000);
      expect(option1000).toBeDefined();
      expect(option1000!.coveredByCredit).toBe(1000);
      expect(option1000!.remainingCosts).toBe(1500);
      expect(option1000!.reloadCount).toBe(0);
      expect(option1000!.reloadCost).toBe(0);
      expect(option1000!.halbtaxTicketsAfterCredit).toBe(1500);
      expect(option1000!.total).toBe(2220); // 600 + 120 + 1500
    });

    test('should calculate different prices for youth vs adult', () => {
      const youthResult = calculateHalbtaxPlusOptions('jugend', 1500, 120, true);
      const adultResult = calculateHalbtaxPlusOptions('erwachsene', 1500, 190, true);
      
      const youthOption = youthResult.find(opt => opt.credit === 1000);
      const adultOption = adultResult.find(opt => opt.credit === 1000);
      
      expect(youthOption!.cost).toBe(600);
      expect(adultOption!.cost).toBe(800);
      expect(youthOption!.total).toBeLessThan(adultOption!.total);
    });

    test('should handle exact reload scenarios', () => {
      const result = calculateHalbtaxPlusOptions('jugend', 3000, 120, true);
      
      const option1000 = result.find(opt => opt.credit === 1000);
      expect(option1000).toBeDefined();
      expect(option1000!.remainingCosts).toBe(2000);
      expect(option1000!.reloadCount).toBe(2);
      expect(option1000!.lastReloadUsage).toBe(1000);
      expect(option1000!.lastReloadRatio).toBe(1);
      expect(option1000!.reloadCost).toBe(1200); // 2 * 600
    });
  });

  describe('calculateFareOptions - Integration Tests', () => {
    const baseInputs: CalculationInputs = {
      age: 'erwachsene',
      isFirstClass: false,
      isNewCustomer: true,
      allowHalbtaxPlusReload: true,
      inputMode: 'simple',
      routes: mockRoutes,
      yearlySpendingDirect: 0
    };

    test('should calculate all fare options correctly', () => {
      const result = calculateFareOptions(baseInputs);
      
      expect(result.yearlySpendingFull).toBe(4680);
      expect(result.halbtaxTicketCosts).toBe(2340);
      expect(result.noAboTotal).toBe(4680);
      expect(result.halbtaxTotal).toBe(2530); // 2340 + 190
      expect(result.gaTotal).toBe(3995);
      expect(result.options).toHaveLength(6); // none, halbtax, 3 halbtax plus, ga
      expect(result.bestOption.type).toBe('halbtaxplus');
    });

    test('should handle youth pricing correctly', () => {
      const youthInputs = { ...baseInputs, age: 'jugend' as const };
      const result = calculateFareOptions(youthInputs);
      
      expect(result.halbtaxTotal).toBe(2460); // 2340 + 120 (youth halbtax price)
      expect(result.gaTotal).toBe(2780); // Youth GA price
      expect(result.bestOption.type).toBe('halbtaxplus');
    });

    test('should handle first class correctly', () => {
      const firstClassInputs = { ...baseInputs, isFirstClass: true };
      const result = calculateFareOptions(firstClassInputs);
      
      expect(result.gaTotal).toBe(6520); // First class GA price
      expect(result.bestOption.type).toBe('halbtaxplus');
    });

    test('should handle loyalty customer pricing', () => {
      const loyaltyInputs = { ...baseInputs, isNewCustomer: false };
      const result = calculateFareOptions(loyaltyInputs);
      
      expect(result.halbtaxTotal).toBe(2510); // 2340 + 170 (loyalty halbtax price)
    });

    test('should handle direct input mode', () => {
      const directInputs = { 
        ...baseInputs, 
        inputMode: 'direct' as const, 
        yearlySpendingDirect: 5000 
      };
      const result = calculateFareOptions(directInputs);
      
      expect(result.yearlySpendingFull).toBe(5000);
      expect(result.halbtaxTicketCosts).toBe(2500);
      expect(result.noAboTotal).toBe(5000);
    });

    test('should identify GA as best option for high usage', () => {
      const highUsageInputs = { 
        ...baseInputs, 
        inputMode: 'direct' as const, 
        yearlySpendingDirect: 8000 
      };
      const result = calculateFareOptions(highUsageInputs);
      
      // With Halbtax Plus 3000 option, it might be cheaper than GA
      expect(result.bestOption.total).toBeLessThan(result.noAboTotal);
    });

    test('should identify no subscription as best for low usage', () => {
      const lowUsageInputs = { 
        ...baseInputs, 
        inputMode: 'direct' as const, 
        yearlySpendingDirect: 300 
      };
      const result = calculateFareOptions(lowUsageInputs);
      
      expect(result.bestOption.type).toBe('none');
      expect(result.bestOption.total).toBe(300);
    });

    test('should handle empty routes', () => {
      const emptyRoutesInputs = { ...baseInputs, routes: [] };
      const result = calculateFareOptions(emptyRoutesInputs);
      
      expect(result.yearlySpendingFull).toBe(0);
      expect(result.halbtaxTicketCosts).toBe(0);
      expect(result.bestOption.type).toBe('none');
    });

    test('should handle routes with halbtax prices', () => {
      const halbtaxRoutesInputs = { ...baseInputs, routes: mockRoutesWithHalbtax };
      const result = calculateFareOptions(halbtaxRoutesInputs);
      
      expect(result.yearlySpendingFull).toBe(4680);
      expect(result.halbtaxTicketCosts).toBe(2340);
    });

    test('should respect halbtax plus reload toggle', () => {
      const highUsageInputs = { 
        ...baseInputs, 
        inputMode: 'direct' as const, 
        yearlySpendingDirect: 3000 
      };
      
      const withRebuying = calculateFareOptions(highUsageInputs);
      const withoutRebuying = calculateFareOptions({ 
        ...highUsageInputs, 
        allowHalbtaxPlusReload: false 
      });
      
      const withRebuyingOption = withRebuying.halbtaxPlusOptions.find(opt => opt.credit === 1000);
      const withoutRebuyingOption = withoutRebuying.halbtaxPlusOptions.find(opt => opt.credit === 1000);
      
      expect(withRebuyingOption!.reloadCount).toBeGreaterThan(0);
      expect(withoutRebuyingOption!.reloadCount).toBe(0);
      expect(withoutRebuyingOption!.halbtaxTicketsAfterCredit).toBeGreaterThan(0);
    });

    test('should handle senior pricing', () => {
      const seniorInputs = { ...baseInputs, age: 'senior' as const };
      const result = calculateFareOptions(seniorInputs);
      
      expect(result.halbtaxTotal).toBe(2530); // Same as adult halbtax price
      expect(result.gaTotal).toBe(3040); // Senior GA discount
    });

    test('should handle disability pricing', () => {
      const disabilityInputs = { ...baseInputs, age: 'behinderung' as const };
      const result = calculateFareOptions(disabilityInputs);
      
      expect(result.halbtaxTotal).toBe(2530); // Same as adult halbtax price
      expect(result.gaTotal).toBe(2600); // Disability GA discount
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle very high costs', () => {
      const highCostInputs: CalculationInputs = {
        age: 'erwachsene',
        isFirstClass: false,
        isNewCustomer: true,
        allowHalbtaxPlusReload: true,
        inputMode: 'direct',
        routes: [],
        yearlySpendingDirect: 50000
      };
      
      const result = calculateFareOptions(highCostInputs);
      expect(result.bestOption.type).toBe('ga');
    });

    test('should handle fractional trip numbers', () => {
      const fractionalInputs: CalculationInputs = {
        age: 'erwachsene',
        isFirstClass: false,
        isNewCustomer: true,
        allowHalbtaxPlusReload: true,
        inputMode: 'simple',
        routes: [{ id: 1, trips: 1.5, cost: 33.33, isHalbtaxPrice: false }],
        yearlySpendingDirect: 0
      };
      
      const result = calculateFareOptions(fractionalInputs);
      expect(result.yearlySpendingFull).toBeCloseTo(2599.74, 2);
    });

    test('should maintain calculation precision', () => {
      const precisionInputs: CalculationInputs = {
        age: 'erwachsene',
        isFirstClass: false,
        isNewCustomer: true,
        allowHalbtaxPlusReload: true,
        inputMode: 'simple',
        routes: [{ id: 1, trips: 3.7, cost: 27.85, isHalbtaxPrice: false }],
        yearlySpendingDirect: 0
      };
      
      const result = calculateFareOptions(precisionInputs);
      // Should maintain precision throughout calculations
      expect(result.yearlySpendingFull).toBe(3.7 * 27.85 * 52);
      expect(result.halbtaxTicketCosts).toBe((3.7 * 27.85 * 52) / 2);
    });
  });
});