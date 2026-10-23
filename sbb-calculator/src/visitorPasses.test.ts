import {
  compareVisitorOptions,
  cheapestVisitorOption,
  smallestPassDuration,
  groupSize,
  MOUNTAIN_EXCURSION_AVG_COST,
  SWISS_HALF_FARE_CARD_PRICE,
  SOLO_TRAVELLER
} from './visitorPasses';

const costOf = (options: ReturnType<typeof compareVisitorOptions>, type: string) =>
  options.find(o => o.type === type)?.cost;

describe('Visitor Pass Tests', () => {
  describe('smallestPassDuration', () => {
    test('should round up to the next available pass duration', () => {
      expect(smallestPassDuration(1)).toBe(3);
      expect(smallestPassDuration(3)).toBe(3);
      expect(smallestPassDuration(5)).toBe(6);
      expect(smallestPassDuration(9)).toBe(15);
      expect(smallestPassDuration(15)).toBe(15);
    });

    test('should return null when no pass is long enough', () => {
      expect(smallestPassDuration(16)).toBeNull();
    });
  });

  describe('compareVisitorOptions', () => {
    test('should calculate all options for a one-week adult trip', () => {
      const options = compareVisitorOptions({
        stayDays: 7,
        travelDays: 5,
        costPerTravelDay: 80,
        mountainExcursions: 2,
        group: SOLO_TRAVELLER
      });

      const fullFare = 5 * 80 + 2 * MOUNTAIN_EXCURSION_AVG_COST; // 660
      expect(costOf(options, 'payPerTicket')).toBe(fullFare);
      expect(costOf(options, 'halfFareCard')).toBe(SWISS_HALF_FARE_CARD_PRICE + fullFare / 2);
      expect(costOf(options, 'swissTravelPass')).toBe(439 + MOUNTAIN_EXCURSION_AVG_COST); // 8-day pass
      expect(costOf(options, 'swissTravelPassFlex')).toBe(424 + MOUNTAIN_EXCURSION_AVG_COST); // 6 flex days
    });

    test('should use youth prices', () => {
      const options = compareVisitorOptions({
        stayDays: 3,
        travelDays: 3,
        costPerTravelDay: 100,
        mountainExcursions: 0,
        group: { adults: 0, youth: 1, children: 0, infants: 0 }
      });
      expect(costOf(options, 'swissTravelPass')).toBe(179);
      expect(costOf(options, 'swissTravelPassFlex')).toBe(204);
    });

    test('should not offer a consecutive pass for stays longer than 15 days', () => {
      const options = compareVisitorOptions({
        stayDays: 20,
        travelDays: 8,
        costPerTravelDay: 60,
        mountainExcursions: 0,
        group: SOLO_TRAVELLER
      });
      expect(costOf(options, 'swissTravelPass')).toBeNull();
      expect(costOf(options, 'swissTravelPassFlex')).toBe(459);
    });

    test('should need two Half Fare Cards and no Flex pass for stays over a month', () => {
      const options = compareVisitorOptions({
        stayDays: 40,
        travelDays: 10,
        costPerTravelDay: 50,
        mountainExcursions: 0,
        group: SOLO_TRAVELLER
      });
      const halfFare = options.find(o => o.type === 'halfFareCard');
      expect(halfFare?.passes).toBe(2);
      expect(halfFare?.cost).toBe(2 * SWISS_HALF_FARE_CARD_PRICE + 250);
      expect(costOf(options, 'swissTravelPassFlex')).toBeNull();
    });

    test('should cap travel days at the length of the stay', () => {
      const options = compareVisitorOptions({
        stayDays: 4,
        travelDays: 10,
        costPerTravelDay: 50,
        mountainExcursions: 0,
        group: SOLO_TRAVELLER
      });
      expect(costOf(options, 'payPerTicket')).toBe(200);
    });
  });

  describe('groups', () => {
    test('should let children travel free with a family pass and pay half on single tickets', () => {
      const options = compareVisitorOptions({
        stayDays: 7,
        travelDays: 4,
        costPerTravelDay: 55,
        mountainExcursions: 1,
        group: { adults: 2, youth: 0, children: 2, infants: 1 }
      });

      const fullFare = 4 * 55 + MOUNTAIN_EXCURSION_AVG_COST; // 350 per person 16+
      expect(costOf(options, 'payPerTicket')).toBe(2 * fullFare + 2 * fullFare / 2);
      expect(costOf(options, 'halfFareCard')).toBe(2 * SWISS_HALF_FARE_CARD_PRICE + 2 * fullFare / 2);
      expect(costOf(options, 'swissTravelPass')).toBe(2 * 439 + 2 * MOUNTAIN_EXCURSION_AVG_COST / 2);
      expect(costOf(options, 'swissTravelPassFlex')).toBe(2 * 349 + 2 * MOUNTAIN_EXCURSION_AVG_COST / 2);
      expect(options.find(o => o.type === 'swissTravelPass')?.passes).toBe(2);
    });

    test('should price adults and youth separately', () => {
      const options = compareVisitorOptions({
        stayDays: 8,
        travelDays: 8,
        costPerTravelDay: 100,
        mountainExcursions: 0,
        group: { adults: 1, youth: 1, children: 0, infants: 0 }
      });
      expect(costOf(options, 'swissTravelPass')).toBe(439 + 311);
      expect(costOf(options, 'swissTravelPassFlex')).toBe(459 + 325);
    });

    test('should only offer single tickets to children travelling without a parent', () => {
      const options = compareVisitorOptions({
        stayDays: 5,
        travelDays: 3,
        costPerTravelDay: 40,
        mountainExcursions: 0,
        group: { adults: 0, youth: 0, children: 2, infants: 0 }
      });
      expect(costOf(options, 'payPerTicket')).toBe(2 * 120 / 2);
      expect(costOf(options, 'halfFareCard')).toBeNull();
      expect(costOf(options, 'swissTravelPass')).toBeNull();
    });

    test('should count every traveller in the group size', () => {
      expect(groupSize({ adults: 2, youth: 1, children: 2, infants: 1 })).toBe(6);
    });
  });

  describe('cheapestVisitorOption', () => {
    test('should pick paying per ticket for very little travel', () => {
      const options = compareVisitorOptions({
        stayDays: 5,
        travelDays: 1,
        costPerTravelDay: 60,
        mountainExcursions: 0,
        group: SOLO_TRAVELLER
      });
      expect(cheapestVisitorOption(options)?.type).toBe('payPerTicket');
    });

    test('should pick the Swiss Travel Pass for heavy daily travel', () => {
      const options = compareVisitorOptions({
        stayDays: 8,
        travelDays: 8,
        costPerTravelDay: 120,
        mountainExcursions: 1,
        group: SOLO_TRAVELLER
      });
      expect(cheapestVisitorOption(options)?.type).toBe('swissTravelPass');
    });

    test('should ignore unavailable options', () => {
      const best = cheapestVisitorOption([
        { type: 'swissTravelPass', cost: null },
        { type: 'payPerTicket', cost: 100 }
      ]);
      expect(best?.type).toBe('payPerTicket');
    });
  });
});
