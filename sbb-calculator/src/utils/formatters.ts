export const formatCurrency = (amount: number, includeSymbol: boolean = true): string => {
  const formattedNumber = Math.round(amount).toLocaleString('de-CH');
  if (includeSymbol) {
    return `${formattedNumber} CHF`;
  }
  return formattedNumber;
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

// Input filter utilities - allows typing but prevents invalid characters
export const filterNumericInput = (input: string, allowFloat: boolean = false): string => {
  if (input === '') return '';

  // Only remove letters and special characters, keep digits, comma, and period
  let filtered = input.replace(/[^\d,.]/g, '');
  
  // If float is not allowed, only keep digits
  if (!allowFloat) {
    filtered = filtered.replace(/[,.]/g, '');
    return filtered;
  }

  // For floats, allow typing but fix multiple decimal separators
  // Count total decimal separators (comma + period)
  const commas = (filtered.match(/,/g) || []).length;
  const periods = (filtered.match(/\./g) || []).length;
  const totalSeparators = commas + periods;
  
  // If more than one separator, keep only the first one
  if (totalSeparators > 1) {
    let separatorFound = false;
    filtered = filtered.replace(/[,.]/g, (match) => {
      if (!separatorFound) {
        separatorFound = true;
        return match; // Keep the first separator
      }
      return ''; // Remove additional separators
    });
  }

  return filtered;
};

export const parseFilteredInput = (filteredInput: string, allowFloat: boolean = false): number | '' => {
  if (filteredInput === '' || filteredInput === '.' || filteredInput === ',') return '';
  
  // Convert comma to period for parsing
  const normalizedInput = filteredInput.replace(',', '.');
  
  const parsed = allowFloat ? parseFloat(normalizedInput) : parseInt(normalizedInput);
  
  if (isNaN(parsed)) return '';
  
  return parsed;
};