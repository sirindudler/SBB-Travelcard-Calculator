import { useState, useCallback, useMemo } from 'react';
import { CalculatorService, Route, ExtendedCalculationResults } from '../services/CalculatorService';
import { AgeGroup } from '../pricing';

export interface UseCalculatorReturn {
  results: ExtendedCalculationResults | null;
  isLoading: boolean;
  error: string | null;
  calculate: (
    inputMode: 'simple' | 'direct' | 'pdf',
    routes: Route[],
    yearlySpendingDirect: number,
    age: AgeGroup,
    isFirstClass: boolean,
    isNewCustomer: boolean,
    allowHalbtaxPlusReload: boolean,
    gaMonthsUsed?: number,
    gaIsMonthlyPricing?: boolean
  ) => void;
  clearResults: () => void;
  bestOption: any;
  percentageDifference: (basePrice: number, comparePrice: number) => number;
}

export const useCalculator = (): UseCalculatorReturn => {
  const [results, setResults] = useState<ExtendedCalculationResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculate = useCallback((
    inputMode: 'simple' | 'direct' | 'pdf',
    routes: Route[],
    yearlySpendingDirect: number,
    age: AgeGroup,
    isFirstClass: boolean,
    isNewCustomer: boolean,
    allowHalbtaxPlusReload: boolean,
    gaMonthsUsed?: number,
    gaIsMonthlyPricing?: boolean
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      if (inputMode !== 'direct' && !CalculatorService.validateRouteInputs(routes)) {
        throw new Error('Please enter valid route information');
      }

      const calculationResults = CalculatorService.calculateResults(
        inputMode,
        routes,
        yearlySpendingDirect,
        age,
        isFirstClass,
        isNewCustomer,
        allowHalbtaxPlusReload,
        gaMonthsUsed,
        gaIsMonthlyPricing
      );

      setResults(calculationResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Calculation failed');
      setResults(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setResults(null);
    setError(null);
  }, []);

  const bestOption = useMemo(() => {
    return results?.bestOption || null;
  }, [results]);

  const percentageDifference = useCallback((basePrice: number, comparePrice: number) => {
    return CalculatorService.getPercentageDifference(basePrice, comparePrice);
  }, []);

  return {
    results,
    isLoading,
    error,
    calculate,
    clearResults,
    bestOption,
    percentageDifference
  };
};