export const formatCurrency = (amount: number, includeSymbol: boolean = true): string => {
  if (includeSymbol) {
    return `${amount.toFixed(2)} CHF`;
  }
  return amount.toFixed(2);
};

export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

export const formatNumber = (value: number, decimals: number = 0): string => {
  return value.toFixed(decimals);
};

export const getPercentageColor = (percentage: number): string => {
  if (percentage <= 5) return 'text-green-600';
  if (percentage <= 15) return 'text-yellow-600';
  if (percentage <= 30) return 'text-orange-600';
  return 'text-red-600';
};

export const getOptionColor = (percentage: number): string => {
  if (percentage === 0) return 'bg-green-50 border-green-200 text-green-800';
  if (percentage <= 5) return 'bg-green-50 border-green-200 text-green-700';
  if (percentage <= 15) return 'bg-yellow-50 border-yellow-200 text-yellow-700';
  if (percentage <= 30) return 'bg-orange-50 border-orange-200 text-orange-700';
  return 'bg-red-50 border-red-200 text-red-700';
};