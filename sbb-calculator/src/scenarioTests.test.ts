import { calculateFareOptions, CalculationInputs } from './calculationUtils';

describe('Real-World Scenario Tests', () => {
  describe('Commuter Scenarios', () => {
    test('Daily commuter - Zurich to Bern', () => {
      // Typical daily commuter: 5 trips per week, 89 CHF per trip
      const inputs: CalculationInputs = {
        age: 'erwachsene',
        isFirstClass: false,
        isNewCustomer: true,
        allowHalbtaxPlusRebuying: true,
        inputMode: 'simple',
        routes: [
          { id: 1, trips: 5, cost: 89, isHalbtaxPrice: false }
        ],
        yearlySpendingDirect: 0
      };

      const result = calculateFareOptions(inputs);
      
      expect(result.yearlySpendingFull).toBe(23140); // 5 * 89 * 52
      expect(result.halbtaxTicketCosts).toBe(11570); // 50% discount
      expect(result.bestOption.type).toBe('ga'); // GA should be best for high usage
      expect(result.bestOption.total).toBe(3995); // GA adult second class
      
      // GA should save significant money
      const savings = result.noAboTotal - result.bestOption.total;
      expect(savings).toBe(19145);
    });

    test('Part-time commuter - Zurich to Winterthur', () => {
      // Part-time: 3 trips per week, 25 CHF per trip
      const inputs: CalculationInputs = {
        age: 'erwachsene',
        isFirstClass: false,
        isNewCustomer: true,
        allowHalbtaxPlusRebuying: true,
        inputMode: 'simple',
        routes: [
          { id: 1, trips: 3, cost: 25, isHalbtaxPrice: false }
        ],
        yearlySpendingDirect: 0
      };

      const result = calculateFareOptions(inputs);
      
      expect(result.yearlySpendingFull).toBe(3900); // 3 * 25 * 52
      expect(result.halbtaxTicketCosts).toBe(1950); // 50% discount
      expect(result.bestOption.type).toBe('halbtaxplus'); // Halbtax Plus likely best
      
      // Should be cheaper than GA
      expect(result.bestOption.total).toBeLessThan(result.gaTotal);
    });

    test('Weekend traveler - occasional trips', () => {
      // Weekend trips: 1 trip per week, 60 CHF per trip
      const inputs: CalculationInputs = {
        age: 'erwachsene',
        isFirstClass: false,
        isNewCustomer: true,
        allowHalbtaxPlusRebuying: true,
        inputMode: 'simple',
        routes: [
          { id: 1, trips: 1, cost: 60, isHalbtaxPrice: false }
        ],
        yearlySpendingDirect: 0
      };

      const result = calculateFareOptions(inputs);
      
      expect(result.yearlySpendingFull).toBe(3120); // 1 * 60 * 52
      expect(result.halbtaxTicketCosts).toBe(1560); // 50% discount
      expect(result.bestOption.type).toBe('halbtaxplus'); // Halbtax Plus should be optimal
    });

    test('Student scenario - multiple short routes', () => {
      // Student with multiple short routes
      const inputs: CalculationInputs = {
        age: 'jugend',
        isFirstClass: false,
        isNewCustomer: true,
        allowHalbtaxPlusRebuying: true,
        inputMode: 'simple',
        routes: [
          { id: 1, trips: 4, cost: 8.5, isHalbtaxPrice: false }, // Local train
          { id: 2, trips: 2, cost: 15, isHalbtaxPrice: false }, // Regional train
          { id: 3, trips: 1, cost: 25, isHalbtaxPrice: false }  // Occasional long trip
        ],
        yearlySpendingDirect: 0
      };

      const result = calculateFareOptions(inputs);
      
      const expectedYearly = (4 * 8.5 + 2 * 15 + 1 * 25) * 52; // 4628
      expect(result.yearlySpendingFull).toBe(4628);
      expect(result.halbtaxTicketCosts).toBe(2314);
      
      // Youth pricing should make Halbtax Plus attractive
      expect(result.bestOption.type).toBe('halbtaxplus');
      expect(result.bestOption.total).toBeLessThan(result.gaTotal);
    });
  });

  describe('Family Scenarios', () => {
    test('Parent with existing Halbtax - uses halbtax prices', () => {
      // Parent already has Halbtax, routes show halbtax prices
      const inputs: CalculationInputs = {
        age: 'erwachsene',
        isFirstClass: false,
        isNewCustomer: false, // Loyalty customer
        allowHalbtaxPlusRebuying: true,
        inputMode: 'simple',
        routes: [
          { id: 1, trips: 3, cost: 22.5, isHalbtaxPrice: true } // Already halbtax price
        ],
        yearlySpendingDirect: 0
      };

      const result = calculateFareOptions(inputs);
      
      expect(result.yearlySpendingFull).toBe(7020); // 3 * 22.5 * 52 * 2 (double for full price)
      expect(result.halbtaxTicketCosts).toBe(3510); // No additional discount
      expect(result.halbtaxTotal).toBe(3680); // 3510 + 170 (loyalty price)
    });

    test('Senior citizen - reduced GA pricing', () => {
      const inputs: CalculationInputs = {
        age: 'senior',
        isFirstClass: false,
        isNewCustomer: true,
        allowHalbtaxPlusRebuying: true,
        inputMode: 'simple',
        routes: [
          { id: 1, trips: 2, cost: 45, isHalbtaxPrice: false }
        ],
        yearlySpendingDirect: 0
      };

      const result = calculateFareOptions(inputs);
      
      expect(result.gaTotal).toBe(3040); // Senior GA discount
      expect(result.gaTotal).toBeLessThan(3995); // Cheaper than adult GA
      
      const expectedYearly = 2 * 45 * 52; // 4680
      expect(result.yearlySpendingFull).toBe(4680);
      
      // For moderate usage, GA might be attractive due to senior discount
      if (result.bestOption.type === 'ga') {
        expect(result.bestOption.total).toBe(3040);
      }
    });

    test('Person with disability - special pricing', () => {
      const inputs: CalculationInputs = {
        age: 'behinderung',
        isFirstClass: false,
        isNewCustomer: true,
        allowHalbtaxPlusRebuying: true,
        inputMode: 'simple',
        routes: [
          { id: 1, trips: 3, cost: 35, isHalbtaxPrice: false }
        ],
        yearlySpendingDirect: 0
      };

      const result = calculateFareOptions(inputs);
      
      expect(result.gaTotal).toBe(2600); // Disability GA discount
      expect(result.gaTotal).toBeLessThan(3995); // Significant discount vs adult
      
      const expectedYearly = 3 * 35 * 52; // 5460
      expect(result.yearlySpendingFull).toBe(5460);
      
      // With disability discount, GA should be competitive
      expect(result.bestOption.total).toBeLessThan(result.noAboTotal);
    });

    test('25-year-old - transition pricing', () => {
      const inputs: CalculationInputs = {
        age: 'fuenfundzwanzig',
        isFirstClass: false,
        isNewCustomer: true,
        allowHalbtaxPlusRebuying: true,
        inputMode: 'simple',
        routes: [
          { id: 1, trips: 2, cost: 30, isHalbtaxPrice: false }
        ],
        yearlySpendingDirect: 0
      };

      const result = calculateFareOptions(inputs);
      
      // 25-year-olds use adult pricing for Halbtax/GA but get different Halbtax Plus
      expect(result.gaTotal).toBe(3495); // Special 25-year-old GA price
      expect(result.halbtaxTotal).toBe(1750); // 1560 + 190 (adult halbtax price)
      
      // Should still have access to adult Halbtax Plus options
      expect(result.halbtaxPlusOptions.length).toBe(3);
    });
  });

  describe('Business Travel Scenarios', () => {
    test('Business traveler - first class preference', () => {
      const inputs: CalculationInputs = {
        age: 'erwachsene',
        isFirstClass: true,
        isNewCustomer: true,
        allowHalbtaxPlusRebuying: true,
        inputMode: 'simple',
        routes: [
          { id: 1, trips: 3, cost: 89, isHalbtaxPrice: false }
        ],
        yearlySpendingDirect: 0
      };

      const result = calculateFareOptions(inputs);
      
      expect(result.gaTotal).toBe(6520); // First class GA
      expect(result.gaTotal).toBeGreaterThan(3995); // More expensive than second class
      
      const expectedYearly = 3 * 89 * 52; // 13884
      expect(result.yearlySpendingFull).toBe(13884);
      
      // For high usage with first class, should save money vs no subscription
      expect(result.bestOption.total).toBeLessThan(result.noAboTotal);
    });

    test('Irregular business travel - direct cost input', () => {
      const inputs: CalculationInputs = {
        age: 'erwachsene',
        isFirstClass: false,
        isNewCustomer: true,
        allowHalbtaxPlusRebuying: true,
        inputMode: 'direct',
        routes: [],
        yearlySpendingDirect: 4500
      };

      const result = calculateFareOptions(inputs);
      
      expect(result.yearlySpendingFull).toBe(4500);
      expect(result.halbtaxTicketCosts).toBe(2250);
      expect(result.halbtaxTotal).toBe(2440); // 2250 + 190
      
      // Should be close competition between Halbtax Plus and GA
      expect(result.bestOption.total).toBeLessThan(result.gaTotal);
    });
  });

  describe('Edge Cases and Boundary Conditions', () => {
    test('Break-even point analysis - Halbtax vs No Subscription', () => {
      // Find the point where Halbtax becomes worthwhile
      const halbtaxPrice = 190; // Adult new customer
      const breakEvenYearly = halbtaxPrice * 2; // 380 CHF yearly spending
      
      const inputs: CalculationInputs = {
        age: 'erwachsene',
        isFirstClass: false,
        isNewCustomer: true,
        allowHalbtaxPlusRebuying: true,
        inputMode: 'direct',
        routes: [],
        yearlySpendingDirect: breakEvenYearly
      };

      const result = calculateFareOptions(inputs);
      
      expect(result.noAboTotal).toBe(380);
      expect(result.halbtaxTotal).toBe(380); // 190 (ticket cost) + 190 (halbtax)
      
      // At break-even, both options should be equal
      expect(Math.abs(result.noAboTotal - result.halbtaxTotal)).toBeLessThan(1);
    });

    test('Break-even point analysis - GA vs Halbtax', () => {
      // Find point where GA becomes better than Halbtax
      const gaPrice = 3995;
      const halbtaxPrice = 190;
      // GA becomes worthwhile when halbtax tickets + halbtax price >= GA price
      // So ticket costs should be around 3805, meaning yearly spending ~7610
      
      const inputs: CalculationInputs = {
        age: 'erwachsene',
        isFirstClass: false,
        isNewCustomer: true,
        allowHalbtaxPlusRebuying: true,
        inputMode: 'direct',
        routes: [],
        yearlySpendingDirect: 7610
      };

      const result = calculateFareOptions(inputs);
      
      expect(result.gaTotal).toBe(3995);
      expect(result.halbtaxTotal).toBe(3995); // 3805 + 190
      
      // At the break-even point, the best option should save money
      expect(result.bestOption.total).toBeLessThanOrEqual(result.gaTotal);
      expect(result.gaTotal).toBeLessThanOrEqual(result.halbtaxTotal);
    });

    test('Very low usage - no subscription optimal', () => {
      const inputs: CalculationInputs = {
        age: 'erwachsene',
        isFirstClass: false,
        isNewCustomer: true,
        allowHalbtaxPlusRebuying: true,
        inputMode: 'direct',
        routes: [],
        yearlySpendingDirect: 100
      };

      const result = calculateFareOptions(inputs);
      
      expect(result.bestOption.type).toBe('none');
      expect(result.bestOption.total).toBe(100);
      expect(result.halbtaxTotal).toBe(240); // 50 + 190
    });

    test('Halbtax Plus reload boundary conditions', () => {
      // Test exact reload amounts
      const inputs: CalculationInputs = {
        age: 'jugend',
        isFirstClass: false,
        isNewCustomer: true,
        allowHalbtaxPlusRebuying: true,
        inputMode: 'direct',
        routes: [],
        yearlySpendingDirect: 4000 // Needs 1000 + 3000 more
      };

      const result = calculateFareOptions(inputs);
      
      const option1000 = result.halbtaxPlusOptions.find(opt => opt.credit === 1000);
      expect(option1000).toBeDefined();
      expect(option1000!.remainingCosts).toBe(1000); // After first 1000
      expect(option1000!.reloadCount).toBe(1); // Need 1 more package
      expect(option1000!.lastReloadUsage).toBe(1000); // Need full package
      expect(option1000!.lastReloadRatio).toBe(1);
    });

    test('Mixed route types - some with halbtax prices', () => {
      const inputs: CalculationInputs = {
        age: 'erwachsene',
        isFirstClass: false,
        isNewCustomer: true,
        allowHalbtaxPlusRebuying: true,
        inputMode: 'simple',
        routes: [
          { id: 1, trips: 2, cost: 20, isHalbtaxPrice: false }, // Regular price
          { id: 2, trips: 1, cost: 15, isHalbtaxPrice: true },  // Already halbtax
          { id: 3, trips: 1, cost: 40, isHalbtaxPrice: false }  // Regular price
        ],
        yearlySpendingDirect: 0
      };

      const result = calculateFareOptions(inputs);
      
      // Route 1: 2 * 20 * 52 = 2080 yearly
      // Route 2: 1 * 15 * 52 * 2 = 1560 yearly (double for full price)
      // Route 3: 1 * 40 * 52 = 2080 yearly
      // Total: 5720
      expect(result.yearlySpendingFull).toBe(5720);
      
      // Halbtax costs:
      // Route 1: 1040 (50% of 2080)
      // Route 2: 780 (no additional discount)
      // Route 3: 1040 (50% of 2080)
      // Total: 2860
      expect(result.halbtaxTicketCosts).toBe(2860);
    });

    test('Youth vs Adult Halbtax Plus comparison', () => {
      const youthInputs: CalculationInputs = {
        age: 'jugend',
        isFirstClass: false,
        isNewCustomer: true,
        allowHalbtaxPlusRebuying: true,
        inputMode: 'direct',
        routes: [],
        yearlySpendingDirect: 2000
      };

      const adultInputs: CalculationInputs = {
        ...youthInputs,
        age: 'erwachsene'
      };

      const youthResult = calculateFareOptions(youthInputs);
      const adultResult = calculateFareOptions(adultInputs);

      // Youth should get better deals
      const youthBest = youthResult.bestOption;
      const adultBest = adultResult.bestOption;

      if (youthBest.type === 'halbtaxplus' && adultBest.type === 'halbtaxplus') {
        expect(youthBest.total).toBeLessThan(adultBest.total);
      }

      // Youth Halbtax is also cheaper
      expect(youthResult.halbtaxTotal).toBeLessThan(adultResult.halbtaxTotal);
    });
  });

  describe('Regression Tests', () => {
    test('Ensure calculations are deterministic', () => {
      const inputs: CalculationInputs = {
        age: 'erwachsene',
        isFirstClass: false,
        isNewCustomer: true,
        allowHalbtaxPlusRebuying: true,
        inputMode: 'simple',
        routes: [
          { id: 1, trips: 2.5, cost: 33.33, isHalbtaxPrice: false }
        ],
        yearlySpendingDirect: 0
      };

      const result1 = calculateFareOptions(inputs);
      const result2 = calculateFareOptions(inputs);

      expect(result1).toEqual(result2);
    });

    test('Verify option ordering is stable', () => {
      const inputs: CalculationInputs = {
        age: 'erwachsene',
        isFirstClass: false,
        isNewCustomer: true,
        allowHalbtaxPlusRebuying: true,
        inputMode: 'direct',
        routes: [],
        yearlySpendingDirect: 3000
      };

      const result = calculateFareOptions(inputs);

      // Options should be in expected order
      expect(result.options[0].type).toBe('none');
      expect(result.options[1].type).toBe('halbtax');
      expect(result.options[2].type).toBe('halbtaxplus');
      expect(result.options[3].type).toBe('halbtaxplus');
      expect(result.options[4].type).toBe('halbtaxplus');
      expect(result.options[5].type).toBe('ga');
    });

    test('Best option selection is correct', () => {
      const inputs: CalculationInputs = {
        age: 'erwachsene',
        isFirstClass: false,
        isNewCustomer: true,
        allowHalbtaxPlusRebuying: true,
        inputMode: 'direct',
        routes: [],
        yearlySpendingDirect: 3000
      };

      const result = calculateFareOptions(inputs);

      // Best option should have the lowest total
      const minTotal = Math.min(...result.options.map(opt => opt.total));
      expect(result.bestOption.total).toBe(minTotal);

      // Verify manually
      const actualBest = result.options.reduce((best, current) => 
        current.total < best.total ? current : best
      );
      expect(result.bestOption).toEqual(actualBest);
    });
  });
});