import React from 'react';
import { Star, ExternalLink } from 'lucide-react';
import { ExtendedCalculationResults } from '../services/CalculatorService';
import { formatCurrency, formatPercentage, getOptionColor } from '../utils/formatters';
import { PurchaseLinks } from '../links';

interface ResultsDisplayProps {
  results: ExtendedCalculationResults;
  links: PurchaseLinks;
  percentageDifference: (base: number, compare: number) => number;
  t: (key: string, params?: Record<string, string | number>) => string;
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  results,
  links,
  percentageDifference,
  t
}) => {
  const bestPrice = results.bestOption.total;

  return (
    <div id="calculation-results" className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Star className="text-yellow-500" size={24} />
        {t('calculationResults')}
      </h2>

      <div className="grid gap-4">
        {results.options.map((option, index) => {
          const percentage = percentageDifference(bestPrice, option.total);
          const isBest = option.total === bestPrice;
          
          return (
            <div
              key={index}
              className={`p-4 rounded-lg border-2 transition-all ${
                isBest 
                  ? 'bg-green-50 border-green-200 shadow-md' 
                  : getOptionColor(percentage)
              }`}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  {isBest && <Star className="text-green-600 fill-current" size={20} />}
                  <span className="font-semibold text-lg">
                    {option.name}
                  </span>
                  {percentage > 0 && (
                    <span className="text-sm text-gray-600">
                      (+{formatPercentage(percentage)})
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <div className="font-bold text-xl">
                    {formatCurrency(option.total)}
                  </div>
                  {option.type !== 'none' && links[option.type as keyof PurchaseLinks] && (
                    <a
                      href={links[option.type as keyof PurchaseLinks]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-red-600 hover:text-red-800 mt-1"
                    >
                      {t('buyNow')} <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              </div>
              
              {option.details && (
                <div className="mt-2 pt-2 border-t border-gray-200 text-sm text-gray-600">
                  <div className="grid grid-cols-2 gap-2">
                    <span>{t('credit')}: {formatCurrency(option.details.credit)}</span>
                    <span>{t('packageCost')}: {formatCurrency(option.details.cost)}</span>
                    {option.details.reloadCount > 0 && (
                      <>
                        <span>{t('reloads')}: {option.details.reloadCount}</span>
                        <span>{t('reloadCost')}: {formatCurrency(option.details.reloadCost)}</span>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {results.streckenabos.some(s => s.isWorthwhile) && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">{t('streckenabo')}</h3>
          <div className="text-sm text-blue-700">
            {results.streckenabos
              .filter(s => s.isWorthwhile)
              .map((streckenabo, index) => (
                <div key={index} className="mb-2">
                  {t('route')} {results.streckenabos.indexOf(streckenabo) + 1}: {formatCurrency(streckenabo.annualPrice)} 
                  ({formatCurrency(streckenabo.monthlyCost)}/{t('month')})
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};