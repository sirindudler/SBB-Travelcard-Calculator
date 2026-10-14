import React, { useMemo } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { Language } from '../translations';
import { faqContent } from '../faqContent';
import { getGAPrice, getHalbtaxPrice, getMonthlyGAPrice, getHalbtaxPlusOptions, getGANightPrice } from '../pricing';

interface FaqProps {
  language: Language;
}

const formatNumber = (n: number): string => new Intl.NumberFormat('de-CH').format(n);

export const Faq: React.FC<FaqProps> = ({ language }) => {
  const { title, items } = faqContent[language];

  // Break-even: Halbtax halves the ticket price, GA replaces Halbtax plus the remaining half.
  const values = useMemo(() => {
    const htPrice = getHalbtaxPrice('erwachsene', true);
    const gaPrice = getGAPrice('erwachsene', false);
    const gaMonthly = getMonthlyGAPrice('erwachsene', false);
    const halbtaxPlus = getHalbtaxPlusOptions('erwachsene');
    return {
      htPrice: formatNumber(htPrice),
      htLoyal: formatNumber(getHalbtaxPrice('erwachsene', false)),
      htYouth: formatNumber(getHalbtaxPrice('jugend', true)),
      htYouthLoyal: formatNumber(getHalbtaxPrice('jugend', false)),
      htBreakeven: formatNumber(htPrice * 2),
      gaPrice: formatNumber(gaPrice),
      gaBreakeven: formatNumber(Math.round((gaPrice - htPrice) * 2)),
      gaMonthly: formatNumber(gaMonthly),
      gaMonthsBreakeven: String(Math.floor(gaPrice / gaMonthly)),
      gaSenior: formatNumber(getGAPrice('senior', false)),
      gaNight: formatNumber(getGANightPrice()),
      hp1000: formatNumber(halbtaxPlus['1000'].cost),
      hp2000: formatNumber(halbtaxPlus['2000'].cost),
      hp3000: formatNumber(halbtaxPlus['3000'].cost),
    } as Record<string, string>;
  }, []);

  const fill = (text: string): string => text.replace(/\{(\w+)\}/g, (_, key) => values[key] ?? `{${key}}`);

  return (
    <section aria-labelledby="faq-heading" className="mt-8 mb-4 px-4 py-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-2 mb-4">
          <HelpCircle className="w-5 h-5 text-sbb-red" aria-hidden="true" />
          <h2 id="faq-heading" className="text-lg sm:text-xl font-semibold text-slate-900">{title}</h2>
        </div>
        <div className="divide-y divide-slate-200 border-t border-b border-slate-200">
          {items.map((item, index) => (
            <details key={index} className="group py-1">
              <summary
                className="flex items-center justify-between gap-3 py-3 cursor-pointer list-none text-sm sm:text-base font-medium text-slate-800 hover:text-slate-950 [&::-webkit-details-marker]:hidden"
                data-umami-event="faq-open"
                data-umami-event-question={index + 1}
              >
                <span>{item.q}</span>
                <ChevronDown className="w-4 h-4 flex-shrink-0 text-slate-500 transition-transform group-open:rotate-180" aria-hidden="true" />
              </summary>
              <p className="pb-3 pr-6 text-sm text-slate-600 leading-relaxed">{fill(item.a)}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
};
