// Tourist pass pricing for visitors to Switzerland (non-residents)
// Source: Swiss Travel System price list 2026 (swiss-pass.ch), 2nd class
// All prices in Swiss Francs (CHF)

export type VisitorAge = 'adult' | 'youth';

export type VisitorOptionType =
  | 'payPerTicket'
  | 'halfFareCard'
  | 'swissTravelPass'
  | 'swissTravelPassFlex';

export const PASS_DURATIONS = [3, 4, 6, 8, 15] as const;

// Swiss Travel Pass: unlimited travel on consecutive days
export const swissTravelPassPrices: Record<VisitorAge, Record<number, number>> = {
  adult: { 3: 254, 4: 309, 6: 399, 8: 439, 15: 499 },
  youth: { 3: 179, 4: 218, 6: 282, 8: 311, 15: 356 } // 16-24.99 years
};

// Swiss Travel Pass Flex: unlimited travel on chosen days within one month
export const swissTravelPassFlexPrices: Record<VisitorAge, Record<number, number>> = {
  adult: { 3: 289, 4: 349, 6: 424, 8: 459, 15: 519 },
  youth: { 3: 204, 4: 246, 6: 300, 8: 325, 15: 370 }
};

// Swiss Half Fare Card: 50% off for one month, single price for all ages
export const SWISS_HALF_FARE_CARD_PRICE = 150;
export const HALF_FARE_CARD_VALIDITY_DAYS = 30;

// Saver Day Pass: dynamic pricing, these are the lowest prices when booked early
export const SAVER_DAY_PASS_FROM = 52;
export const SAVER_DAY_PASS_FROM_HALF_FARE = 29;

// Assumed full-fare price of a typical mountain excursion (return trip from the valley)
export const MOUNTAIN_EXCURSION_AVG_COST = 130;

// Swiss Travel Pass on mountain railways: a few are free (Rigi, Stoos, Stanserhorn),
// most are 50% off, some only 25% (Jungfraujoch). Assume 50% on average.
export const SWISS_TRAVEL_PASS_MOUNTAIN_FACTOR = 0.5;

// Children 6-15 pay half price on normal tickets. With the free Swiss Family Card they
// travel free (mountain excursions included) when a parent holds a Swiss Travel Pass
// (Flex) or Swiss Half Fare Card. Children under 6 always travel free.
export const CHILD_FARE_FACTOR = 0.5;

// Official pages for buying and reading more
export const visitorLinks = {
  swissTravelPass: 'https://www.sbb.ch/en/offers/swiss-travel-pass',
  swissHalfFareCard: 'https://www.sbb.ch/en/offers/swiss-half-fare-card',
  saverDayPass: 'https://www.sbb.ch/en/tickets-offers/tickets/day-passes/saver-day-pass',
  supersaver: 'https://www.sbb.ch/en/offers/supersaver-ticket',
  interrail: 'https://www.interrail.eu'
};

export interface VisitorGroup {
  adults: number;   // 25+
  youth: number;    // 16-24
  children: number; // 6-15
  infants: number;  // under 6
}

export const SOLO_TRAVELLER: VisitorGroup = { adults: 1, youth: 0, children: 0, infants: 0 };

export interface VisitorTripInput {
  stayDays: number;
  travelDays: number;
  costPerTravelDay: number;
  mountainExcursions: number;
  group: VisitorGroup;
}

export interface VisitorOption {
  type: VisitorOptionType;
  cost: number | null; // null = not available for this trip
  passDays?: number;
  passes?: number;        // passes or cards bought for the whole group
}

export const groupSize = (group: VisitorGroup): number =>
  group.adults + group.youth + group.children + group.infants;

// Smallest Swiss Travel Pass duration that covers the given number of days
export const smallestPassDuration = (days: number): number | null => {
  const duration = PASS_DURATIONS.find(d => d >= days);
  return duration ?? null;
};

export const compareVisitorOptions = (input: VisitorTripInput): VisitorOption[] => {
  const stayDays = Math.max(1, Math.round(input.stayDays));
  const travelDays = Math.min(stayDays, Math.max(0, Math.round(input.travelDays)));
  const costPerTravelDay = Math.max(0, input.costPerTravelDay);
  const excursions = Math.max(0, Math.round(input.mountainExcursions));
  const count = (n: number) => Math.max(0, Math.round(n));
  const adults = count(input.group.adults);
  const youth = count(input.group.youth);
  const children = count(input.group.children);
  const passHolders = adults + youth;

  // Full-fare cost for one person aged 16+
  const trainCost = travelDays * costPerTravelDay;
  const mountainCost = excursions * MOUNTAIN_EXCURSION_AVG_COST;
  const fullFare = trainCost + mountainCost;

  const payPerTicket: VisitorOption = {
    type: 'payPerTicket',
    cost: passHolders * fullFare + children * fullFare * CHILD_FARE_FACTOR
  };

  // Children only get the Swiss Family Card with a parent who holds a pass
  if (passHolders === 0) {
    return [
      payPerTicket,
      { type: 'halfFareCard', cost: null },
      { type: 'swissTravelPass', cost: null },
      { type: 'swissTravelPassFlex', cost: null }
    ];
  }

  const cardsPerPerson = Math.ceil(stayDays / HALF_FARE_CARD_VALIDITY_DAYS);
  const halfFareCards = cardsPerPerson * passHolders;
  const passMountainCost = passHolders * mountainCost * SWISS_TRAVEL_PASS_MOUNTAIN_FACTOR;

  const passDays = smallestPassDuration(stayDays);
  const swissTravelPassCost = passDays === null
    ? null
    : adults * swissTravelPassPrices.adult[passDays] + youth * swissTravelPassPrices.youth[passDays] + passMountainCost;

  // Flex days have to be used within one month
  const flexDays = stayDays <= HALF_FARE_CARD_VALIDITY_DAYS ? smallestPassDuration(Math.max(1, travelDays)) : null;
  const swissTravelPassFlexCost = flexDays === null
    ? null
    : adults * swissTravelPassFlexPrices.adult[flexDays] + youth * swissTravelPassFlexPrices.youth[flexDays] + passMountainCost;

  return [
    payPerTicket,
    { type: 'halfFareCard', cost: halfFareCards * SWISS_HALF_FARE_CARD_PRICE + passHolders * fullFare * 0.5, passes: halfFareCards },
    { type: 'swissTravelPass', cost: swissTravelPassCost, passDays: passDays ?? undefined, passes: passHolders },
    { type: 'swissTravelPassFlex', cost: swissTravelPassFlexCost, passDays: flexDays ?? undefined, passes: passHolders }
  ];
};

export const cheapestVisitorOption = (options: VisitorOption[]): VisitorOption | null => {
  return options.reduce<VisitorOption | null>((best, option) => {
    if (option.cost === null) return best;
    if (best === null || best.cost === null || option.cost < best.cost) return option;
    return best;
  }, null);
};
