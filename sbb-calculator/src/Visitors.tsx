import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ArrowRight, Baby, Calendar, Check, ChevronDown, Clock, ExternalLink, Globe, Home, Lightbulb,
  Luggage, MapPin, Minus, Mountain, Percent, Plane, Plus, Smartphone, Sparkles, Star, Ticket, Train, X
} from 'lucide-react';
import { Language } from './translations';
import { detectLanguage } from './utils/detectLanguage';
import { useVisitorTranslation } from './visitorTranslations';
import {
  VisitorGroup,
  VisitorOption,
  compareVisitorOptions,
  cheapestVisitorOption,
  groupSize,
  visitorLinks,
  swissTravelPassPrices,
  MOUNTAIN_EXCURSION_AVG_COST,
  SWISS_HALF_FARE_CARD_PRICE
} from './visitorPasses';
import { formatCurrency } from './utils/formatters';

const TRIP_COST_PRESETS = [
  { key: 'tripShort', cost: 25 },
  { key: 'tripMedium', cost: 55 },
  { key: 'tripLong', cost: 130 },
  { key: 'tripVeryLong', cost: 220 }
];

const OPTION_LABELS: Record<VisitorOption['type'], string> = {
  payPerTicket: 'optionPayPerTicket',
  halfFareCard: 'optionHalfFare',
  swissTravelPass: 'optionSTP',
  swissTravelPassFlex: 'optionSTPFlex'
};

const NAV_SECTIONS = [
  { id: 'quick', label: 'navQuick' },
  { id: 'finder', label: 'navFinder' },
  { id: 'passes', label: 'navPasses' },
  { id: 'interrail', label: 'navInterrail' },
  { id: 'tips', label: 'navTips' },
  { id: 'faq', label: 'navFaq' }
];

interface TripPreset {
  stayDays: number;
  travelDays: number;
  costPerTravelDay: number;
  mountainExcursions: number;
}

// Example trips behind the "short answer" cards, each one lands on the pass the card describes
const QUICK_ANSWERS: { title: string; text: string; icon: React.ElementType; tint: string; preset: TripPreset }[] = [
  { title: 'quick1Title', text: 'quick1Text', icon: MapPin, tint: 'bg-sky-100 text-sky-700', preset: { stayDays: 7, travelDays: 2, costPerTravelDay: 55, mountainExcursions: 1 } },
  { title: 'quick2Title', text: 'quick2Text', icon: Percent, tint: 'bg-emerald-100 text-emerald-700', preset: { stayDays: 7, travelDays: 3, costPerTravelDay: 55, mountainExcursions: 3 } },
  { title: 'quick3Title', text: 'quick3Text', icon: Train, tint: 'bg-sbb-tint text-sbb-red', preset: { stayDays: 8, travelDays: 8, costPerTravelDay: 130, mountainExcursions: 2 } }
];

const FEATURED_PASSES = [
  { prefix: 'stp', icon: Train, accent: 'bg-sbb-red', tint: 'bg-sbb-tint text-sbb-red', link: visitorLinks.swissTravelPass },
  { prefix: 'stpFlex', icon: Calendar, accent: 'bg-rose-400', tint: 'bg-rose-50 text-rose-600', link: visitorLinks.swissTravelPass },
  { prefix: 'hfc', icon: Percent, accent: 'bg-emerald-500', tint: 'bg-emerald-50 text-emerald-700', link: visitorLinks.swissHalfFareCard }
];

const MORE_PASSES = [
  { prefix: 'saver', icon: Ticket, link: visitorLinks.saverDayPass },
  { prefix: 'supersaver', icon: Sparkles, link: visitorLinks.supersaver },
  { prefix: 'regional', icon: Mountain, link: null },
  { prefix: 'guestCard', icon: Star, link: null }
];

type Coverage = { ok: boolean | 'partial'; note?: string };

const COMPARISON_ROWS: { label: string; interrail: Coverage; stp: Coverage }[] = [
  { label: 'rowCountries', interrail: { ok: true, note: 'valueGlobalOnly' }, stp: { ok: false } },
  { label: 'rowTrains', interrail: { ok: true }, stp: { ok: true } },
  { label: 'rowPanoramic', interrail: { ok: true, note: 'valueReservation' }, stp: { ok: true, note: 'valueReservation' } },
  { label: 'rowCity', interrail: { ok: false }, stp: { ok: true } },
  { label: 'rowMuseums', interrail: { ok: false }, stp: { ok: true } },
  { label: 'rowMountains', interrail: { ok: 'partial', note: 'valueSomeDiscounts' }, stp: { ok: 'partial', note: 'valueFreeOrHalf' } }
];

const TIPS = [
  { icon: Ticket, prefix: 'tip1' },
  { icon: Smartphone, prefix: 'tip2' },
  { icon: Train, prefix: 'tip3' },
  { icon: Star, prefix: 'tip4' },
  { icon: Luggage, prefix: 'tip5' },
  { icon: Plane, prefix: 'tip6' },
  { icon: Baby, prefix: 'tip7' },
  { icon: Clock, prefix: 'tip8' }
];

const FAQS = [1, 2, 3, 4, 5, 6];

const scrollToSection = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

// Hero illustration: Alpine panorama with a train, fading into the page background
const AlpineScene: React.FC = () => (
  <svg
    className="absolute bottom-0 inset-x-0 w-full h-32 sm:h-48"
    viewBox="0 0 1440 260"
    preserveAspectRatio="xMidYMax slice"
    aria-hidden="true"
  >
    <path d="M0 260V150L90 120L170 140L300 50L420 130L540 80L660 140L800 40L930 120L1050 70L1180 130L1300 60L1440 120V260Z" fill="#ffffff" fillOpacity="0.12" />
    <path d="M0 260V200L160 140L260 180L400 100L520 190L640 150L760 200L900 120L1030 190L1150 130L1290 200L1440 170V260Z" fill="#e0f2fe" />
    <g fill="#ffffff">
      <path d="M160 140L130 151L142 150L152 156L163 149L176 154L190 152Z" />
      <path d="M400 100L365 120L380 117L392 126L405 116L418 124L430 122Z" />
      <path d="M900 120L865 140L878 136L890 145L903 134L918 142L935 139Z" />
      <path d="M1150 130L1120 145L1132 143L1142 150L1155 141L1168 147L1180 145Z" />
    </g>
    <g>
      <rect x="790" y="198" width="58" height="22" rx="6" fill="#eb0000" />
      <rect x="852" y="198" width="50" height="22" rx="3" fill="#eb0000" />
      <rect x="906" y="198" width="50" height="22" rx="3" fill="#eb0000" />
      <g fill="#e0f2fe">
        <rect x="796" y="203" width="12" height="7" rx="2" />
        <rect x="814" y="203" width="9" height="7" rx="1.5" />
        <rect x="828" y="203" width="9" height="7" rx="1.5" />
        <rect x="858" y="203" width="9" height="7" rx="1.5" />
        <rect x="872" y="203" width="9" height="7" rx="1.5" />
        <rect x="886" y="203" width="9" height="7" rx="1.5" />
        <rect x="912" y="203" width="9" height="7" rx="1.5" />
        <rect x="926" y="203" width="9" height="7" rx="1.5" />
        <rect x="940" y="203" width="9" height="7" rx="1.5" />
      </g>
    </g>
    <path d="M0 260V226Q360 196 720 216T1440 206V260Z" fill="#f1f5f9" />
  </svg>
);

const SwissCross: React.FC = () => (
  <svg viewBox="0 0 32 32" className="w-4 h-4 rounded-sm" aria-hidden="true">
    <rect width="32" height="32" fill="#eb0000" />
    <path d="M13 6h6v7h7v6h-7v7h-6v-7H6v-6h7z" fill="#ffffff" />
  </svg>
);

// Hero illustration for wide screens: two tourist tickets with their real prices
const TicketStack: React.FC<{ daysLabel: string }> = ({ daysLabel }) => (
  <div className="relative w-72 h-80" aria-hidden="true">
    <div className="absolute left-6 top-2 w-64 -rotate-6 rounded-2xl bg-white/90 text-slate-900 shadow-xl shadow-sky-950/30 overflow-hidden">
      <div className="bg-emerald-600 text-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider">Swiss Half Fare Card</div>
      <div className="px-4 py-3 flex items-end justify-between">
        <span className="text-4xl font-extrabold text-emerald-600">−50%</span>
        <span className="text-lg font-bold tabular">{formatCurrency(SWISS_HALF_FARE_CARD_PRICE)}</span>
      </div>
    </div>
    <div className="absolute left-0 top-32 w-72 rotate-3 rounded-2xl bg-white text-slate-900 shadow-2xl shadow-sky-950/40 overflow-hidden">
      <div className="bg-sbb-red text-white px-5 py-3 flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider">Swiss Travel Pass</span>
        <Train className="w-4 h-4" />
      </div>
      <div className="px-5 pt-4 pb-5">
        <div className="relative flex justify-between">
          <div className="absolute left-1.5 right-1.5 top-1.5 h-0.5 bg-slate-200" />
          {['Zürich', 'Luzern', 'Interlaken', 'Zermatt'].map(city => (
            <div key={city} className="relative flex flex-col items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-full border-2 border-sbb-red bg-white" />
              <span className="text-[10px] font-medium text-slate-500">{city}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-3 border-t border-dashed border-slate-300 flex items-end justify-between">
          <span className="text-sm font-medium text-slate-500">8 {daysLabel}</span>
          <span className="text-2xl font-extrabold tabular">{formatCurrency(swissTravelPassPrices.adult[8])}</span>
        </div>
      </div>
    </div>
  </div>
);

interface StepperProps {
  label: string;
  value: number;
  min: number;
  max: number;
  unit?: string;
  help?: string;
  onChange: (value: number) => void;
}

const Stepper: React.FC<StepperProps> = ({ label, value, min, max, unit, help, onChange }) => {
  const buttonClass = 'w-10 h-10 shrink-0 rounded-full border border-slate-300 bg-white text-slate-700 flex items-center justify-center transition-colors hover:border-sbb-red hover:text-sbb-red disabled:opacity-40 disabled:hover:border-slate-300 disabled:hover:text-slate-700';
  return (
    <div>
      <div className="text-sm font-medium text-slate-700 sm:min-h-10">{label}</div>
      <div className="mt-2 flex items-center gap-2">
        <button type="button" className={buttonClass} onClick={() => onChange(value - 1)} disabled={value <= min} aria-label={`${label} −`}>
          <Minus className="w-4 h-4" />
        </button>
        <div className="flex-1 text-center tabular" aria-live="polite">
          <span className="text-2xl font-bold text-slate-900">{value}</span>
          {unit && <span className="ml-1 text-sm text-slate-500">{unit}</span>}
        </div>
        <button type="button" className={buttonClass} onClick={() => onChange(value + 1)} disabled={value >= max} aria-label={`${label} +`}>
          <Plus className="w-4 h-4" />
        </button>
      </div>
      {help && <p className="mt-1.5 text-xs text-slate-500 leading-snug">{help}</p>}
    </div>
  );
};

interface TravellerCounterProps {
  label: string;
  hint: string;
  value: number;
  min: number;
  onChange: (value: number) => void;
}

const MAX_TRAVELLERS_PER_GROUP = 9;

const TravellerCounter: React.FC<TravellerCounterProps> = ({ label, hint, value, min, onChange }) => {
  const buttonClass = 'w-8 h-8 shrink-0 rounded-full border border-slate-300 bg-white text-slate-700 flex items-center justify-center transition-colors hover:border-sbb-red hover:text-sbb-red disabled:opacity-40 disabled:hover:border-slate-300 disabled:hover:text-slate-700';
  return (
    <div className={`rounded-xl border p-3 transition-colors ${value > 0 ? 'border-sbb-red/30 bg-sbb-tint/40' : 'border-slate-200 bg-white'}`}>
      <div className="text-sm font-medium text-slate-800 leading-tight">{label}</div>
      <div className="text-xs text-slate-500">{hint}</div>
      <div className="mt-2 flex items-center justify-between gap-2">
        <button type="button" className={buttonClass} onClick={() => onChange(value - 1)} disabled={value <= min} aria-label={`${label} −`}>
          <Minus className="w-3.5 h-3.5" />
        </button>
        <span className="text-xl font-bold text-slate-900 tabular" aria-live="polite">{value}</span>
        <button type="button" className={buttonClass} onClick={() => onChange(value + 1)} disabled={value >= MAX_TRAVELLERS_PER_GROUP} aria-label={`${label} +`}>
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

const SectionHeading: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => (
  <div className="mb-5 sm:mb-6">
    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 text-balance">{title}</h2>
    {subtitle && <p className="mt-1.5 text-slate-600 max-w-3xl">{subtitle}</p>}
  </div>
);

const CoverageCell: React.FC<{ coverage: Coverage; t: (key: string) => string }> = ({ coverage, t }) => {
  const icon = coverage.ok === true
    ? <Check className="w-4 h-4 text-emerald-600" aria-hidden="true" />
    : coverage.ok === 'partial'
      ? <Percent className="w-4 h-4 text-amber-600" aria-hidden="true" />
      : <X className="w-4 h-4 text-slate-400" aria-hidden="true" />;
  return (
    <td className="px-3 py-3 align-top">
      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-1.5">
        <span className="shrink-0">{icon}</span>
        {coverage.note && <span className="text-xs text-slate-600 leading-snug">{t(coverage.note)}</span>}
      </div>
    </td>
  );
};

const Visitors: React.FC = () => {
  // Keep the language chosen in the calculator; the guide has no Romansh version
  const location = useLocation();
  const startLanguage: Language = (location.state as { language?: Language } | null)?.language ?? detectLanguage();
  const [language, setLanguage] = useState<Language>(startLanguage === 'rm' ? 'en' : startLanguage);
  const { t } = useVisitorTranslation(language);

  const [group, setGroup] = useState<VisitorGroup>({ adults: 2, youth: 0, children: 0, infants: 0 });
  const [stayDays, setStayDays] = useState(7);
  const [travelDays, setTravelDays] = useState(4);
  const [costPerTravelDay, setCostPerTravelDay] = useState(55);
  const [mountainExcursions, setMountainExcursions] = useState(1);
  const [activeSection, setActiveSection] = useState('quick');
  const [inputsInView, setInputsInView] = useState(false);
  const [resultInView, setResultInView] = useState(false);
  const inputsRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const pageTitle = t('pageTitle');
  useEffect(() => {
    const previousTitle = document.title;
    document.title = `${pageTitle} | Travelcards.ch`;
    return () => {
      document.title = previousTitle;
    };
  }, [pageTitle]);

  // Highlight the section currently in view in the sticky navigation
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) setActiveSection(entry.target.id);
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    NAV_SECTIONS.forEach(({ id }) => {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    });
    return () => observer.disconnect();
  }, []);

  // Mobile: show a summary bar while editing the inputs and the result is off screen
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.target === inputsRef.current) setInputsInView(entry.isIntersecting);
        if (entry.target === resultRef.current) setResultInView(entry.isIntersecting);
      });
    });
    if (inputsRef.current) observer.observe(inputsRef.current);
    if (resultRef.current) observer.observe(resultRef.current);
    return () => observer.disconnect();
  }, []);

  const effectiveTravelDays = Math.min(travelDays, stayDays);

  const options = useMemo(() => compareVisitorOptions({
    stayDays,
    travelDays: effectiveTravelDays,
    costPerTravelDay,
    mountainExcursions,
    group
  }), [stayDays, effectiveTravelDays, costPerTravelDay, mountainExcursions, group]);

  const best = cheapestVisitorOption(options);
  const payPerTicketCost = options.find(o => o.type === 'payPerTicket')?.cost ?? 0;
  const otherOptions = options
    .filter(o => o.type !== best?.type)
    .sort((a, b) => {
      if (a.cost === null) return 1;
      if (b.cost === null) return -1;
      return a.cost - b.cost;
    });
  const maxCost = Math.max(...options.map(o => o.cost ?? 0), 1);

  const calculatorPath = language === 'en' ? '/' : `/${language}`;

  const travellers = groupSize(group);
  const setGroupCount = (key: keyof VisitorGroup) => (value: number) => setGroup(prev => ({ ...prev, [key]: value }));
  // Children need an adult or youth with them, so at least one of those stays in the group
  const travellerCounters: { key: keyof VisitorGroup; label: string; hint: string; min: number }[] = [
    { key: 'adults', label: 'travellerAdults', hint: 'travellerAdultsHint', min: group.youth > 0 ? 0 : 1 },
    { key: 'youth', label: 'travellerYouth', hint: 'travellerYouthHint', min: group.adults > 0 ? 0 : 1 },
    { key: 'children', label: 'travellerChildren', hint: 'travellerChildrenHint', min: 0 },
    { key: 'infants', label: 'travellerInfants', hint: 'travellerInfantsHint', min: 0 }
  ];

  const getOptionDetail = (option: VisitorOption): string => {
    const withChildren = (detail: string, childrenKey: string) =>
      group.children > 0 ? `${detail} · ${t(childrenKey)}` : detail;
    switch (option.type) {
      case 'payPerTicket':
        return withChildren(t('detailPayPerTicket'), 'detailKidsHalf');
      case 'halfFareCard':
        return withChildren(t('detailHalfFare', { count: option.passes ?? 1 }), 'detailKidsFree');
      case 'swissTravelPass':
        return option.cost === null
          ? t('notAvailableSTP')
          : withChildren(t('detailSTP', { passes: option.passes ?? 1, days: option.passDays ?? 0 }), 'detailKidsFree');
      case 'swissTravelPassFlex':
        return option.cost === null
          ? t('notAvailableFlex')
          : withChildren(t('detailSTPFlex', { passes: option.passes ?? 1, days: option.passDays ?? 0 }), 'detailKidsFree');
    }
  };

  const applyPreset = (preset: TripPreset) => {
    setStayDays(preset.stayDays);
    setTravelDays(preset.travelDays);
    setCostPerTravelDay(preset.costPerTravelDay);
    setMountainExcursions(preset.mountainExcursions);
    scrollToSection('finder');
  };

  const heroStats = [
    { value: formatCurrency(SWISS_HALF_FARE_CARD_PRICE), label: t('heroStat1Label') },
    { value: formatCurrency(swissTravelPassPrices.adult[3]), label: t('heroStat2Label') },
    { value: '500+', label: t('heroStat3Label') }
  ];

  const cardClass = 'bg-white rounded-2xl border border-slate-200 shadow-xs';
  const linkButtonClass = 'inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-semibold text-slate-700 hover:border-sbb-red hover:text-sbb-red transition-colors';

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Top bar, same as the calculator */}
      <header className="bg-sbb-red text-white">
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between gap-4">
          <Link to={calculatorPath} className="flex items-center gap-3 min-w-0 hover:opacity-90 transition-opacity">
            <div className="shrink-0 w-9 h-9 rounded-xl bg-white text-sbb-red flex items-center justify-center shadow-xs">
              <Train className="w-5 h-5" aria-hidden="true" />
            </div>
            <span className="text-base sm:text-lg font-bold tracking-tight">Travelcards.ch</span>
          </Link>
          <div className="flex items-center gap-2 shrink-0">
            <Globe className="w-4 h-4 text-white/80 hidden sm:block" aria-hidden="true" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              aria-label="Language"
              className="w-[104px] sm:w-auto py-2 pl-2.5 sm:pl-3 pr-1 sm:pr-8 bg-white/15 hover:bg-white/25 border border-white/30 rounded-lg text-sm font-medium text-white transition-colors cursor-pointer [&>option]:text-slate-800"
            >
              <option value="en">English</option>
              <option value="de">Deutsch</option>
              <option value="fr">Français</option>
              <option value="it">Italiano</option>
            </select>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-linear-to-b from-sky-900 via-sky-700 to-sky-500 text-white">
        <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-16 pb-36 sm:pb-52 lg:grid lg:grid-cols-[1fr_auto] lg:gap-12 lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 ring-1 ring-white/25 px-3 py-1 text-xs sm:text-sm font-semibold">
              <SwissCross />
              {t('heroBadge')}
            </div>
            <h1 className="mt-4 text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight max-w-3xl text-balance">
              {t('pageTitle')}
            </h1>
            <p className="mt-4 text-base sm:text-lg text-sky-100 max-w-2xl leading-relaxed">
              {t('pageSubtitle')}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => scrollToSection('finder')}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-sbb-red hover:bg-sbb-dark text-white font-semibold shadow-lg shadow-sky-950/30 transition-colors"
              >
                <Ticket className="w-5 h-5" aria-hidden="true" />
                {t('heroCtaFinder')}
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('interrail')}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/15 hover:bg-white/25 ring-1 ring-white/30 text-white font-semibold transition-colors"
              >
                <Globe className="w-5 h-5" aria-hidden="true" />
                {t('heroCtaInterrail')}
              </button>
            </div>
            <dl className="mt-8 grid grid-cols-3 gap-2 sm:gap-3 max-w-xl">
              {heroStats.map(stat => (
                <div key={stat.label} className="rounded-xl bg-white/10 ring-1 ring-white/20 px-3 py-2.5 sm:px-4 sm:py-3 backdrop-blur-xs">
                  <dt className="sr-only">{stat.label}</dt>
                  <dd className="text-lg sm:text-2xl font-bold tabular">{stat.value}</dd>
                  <dd className="mt-0.5 text-[11px] sm:text-xs text-sky-100 leading-tight">{stat.label}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="hidden lg:block">
            <TicketStack daysLabel={t('days')} />
          </div>
        </div>
        <AlpineScene />
      </section>

      {/* Sticky section navigation */}
      <nav className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200" aria-label={t('pageTitle')}>
        <div className="w-full max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 flex gap-1 overflow-x-auto py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {NAV_SECTIONS.map(({ id, label }) => (
            <a
              key={id}
              href={`#${id}`}
              onClick={(e) => {
                e.preventDefault();
                scrollToSection(id);
              }}
              className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeSection === id ? 'bg-sbb-red text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {t(label)}
            </a>
          ))}
        </div>
      </nav>

      <main className="w-full max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-14 sm:space-y-20">
        {/* Short answer */}
        <section id="quick" className="scroll-mt-20">
          <SectionHeading title={t('quickTitle')} subtitle={t('quickSubtitle')} />
          <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
            {QUICK_ANSWERS.map(({ title, text, icon: Icon, tint, preset }) => (
              <button
                key={title}
                type="button"
                onClick={() => applyPreset(preset)}
                className={`${cardClass} group text-left p-4 sm:p-5 flex flex-col hover:border-sbb-red/40 hover:shadow-md transition-all`}
                data-umami-event="visitor-quick-preset"
                data-umami-event-preset={title}
              >
                <div className="flex items-start gap-3">
                  <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${tint}`}>
                    <Icon className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{t(title)}</h3>
                    <p className="mt-1 text-sm text-slate-600 leading-relaxed">{t(text)}</p>
                  </div>
                </div>
                <span className="mt-3 ml-13 inline-flex items-center gap-1 text-sm font-semibold text-sbb-red">
                  {t('quickTryIt')}
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </span>
              </button>
            ))}
            <button
              type="button"
              onClick={() => scrollToSection('interrail')}
              className={`${cardClass} group text-left p-4 sm:p-5 flex flex-col hover:border-sbb-red/40 hover:shadow-md transition-all`}
            >
              <div className="flex items-start gap-3">
                <div className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center bg-indigo-100 text-indigo-700">
                  <Globe className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">{t('quick4Title')}</h3>
                  <p className="mt-1 text-sm text-slate-600 leading-relaxed">{t('quick4Text')}</p>
                </div>
              </div>
              <span className="mt-3 ml-13 inline-flex items-center gap-1 text-sm font-semibold text-sbb-red">
                {t('quickReadMore')}
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </span>
            </button>
            <div className="sm:col-span-2 rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:p-5 flex items-start gap-3">
              <div className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center bg-amber-100 text-amber-700">
                <Home className="w-5 h-5" aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">{t('quick5Title')}</h3>
                <p className="mt-1 text-sm text-slate-700 leading-relaxed">
                  {t('quick5Text')}{' '}
                  <Link to={calculatorPath} className="font-semibold text-sbb-red hover:underline whitespace-nowrap">
                    {t('quick5Link')} →
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pass finder */}
        <section id="finder" className="scroll-mt-20">
          <SectionHeading title={t('finderTitle')} subtitle={t('finderSubtitle')} />
          <div className={`${cardClass} overflow-hidden grid lg:grid-cols-5`}>
            {/* Inputs */}
            <div ref={inputsRef} className="lg:col-span-3 p-4 sm:p-6 space-y-6">
              <div role="group" aria-label={t('groupLabel')}>
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">{t('groupLabel')}</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                  {travellerCounters.map(counter => (
                    <TravellerCounter
                      key={counter.key}
                      label={t(counter.label)}
                      hint={t(counter.hint)}
                      value={group[counter.key]}
                      min={counter.min}
                      onChange={setGroupCount(counter.key)}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-5 border-t border-slate-100">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">{t('finderYourTrip')}</div>
                <div className="mt-3 grid sm:grid-cols-3 gap-5">
                  <Stepper label={t('stayDaysLabel')} value={stayDays} min={1} max={30} unit={t('days')} onChange={setStayDays} />
                  <Stepper label={t('travelDaysLabel')} value={effectiveTravelDays} min={0} max={stayDays} unit={t('days')} help={t('travelDaysHelp')} onChange={setTravelDays} />
                  <Stepper label={t('mountainLabel')} value={mountainExcursions} min={0} max={8} help={t('mountainHelp', { cost: MOUNTAIN_EXCURSION_AVG_COST })} onChange={setMountainExcursions} />
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-slate-700 mb-2">{t('tripCostLabel')}</div>
                <div className="grid grid-cols-2 xl:grid-cols-4 gap-2">
                  {TRIP_COST_PRESETS.map(preset => {
                    const selected = costPerTravelDay === preset.cost;
                    return (
                      <button
                        key={preset.key}
                        type="button"
                        onClick={() => setCostPerTravelDay(preset.cost)}
                        aria-pressed={selected}
                        className={`p-2.5 sm:p-3 rounded-xl border text-left flex flex-col justify-start transition-all ${
                          selected
                            ? 'border-sbb-red bg-sbb-tint ring-1 ring-sbb-red'
                            : 'border-slate-200 bg-white hover:border-slate-400'
                        }`}
                      >
                        <div className={`text-sm font-bold tabular ${selected ? 'text-sbb-red' : 'text-slate-900'}`}>≈ CHF {preset.cost}</div>
                        <div className="mt-0.5 text-xs text-slate-600 leading-snug">{t(preset.key)}</div>
                      </button>
                    );
                  })}
                </div>
                <label className="mt-3 flex items-center gap-3">
                  <span className="text-sm text-slate-600 whitespace-nowrap">{t('tripCustom')}</span>
                  <span className="relative w-36">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-500">CHF</span>
                    <input
                      type="number"
                      min="0"
                      step="5"
                      value={costPerTravelDay}
                      onChange={(e) => setCostPerTravelDay(Math.max(0, parseFloat(e.target.value) || 0))}
                      onWheel={(e) => e.currentTarget.blur()}
                      className="w-full pl-12 pr-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sbb-red/30 focus:border-sbb-red bg-white text-slate-800 font-medium tabular"
                    />
                  </span>
                </label>
              </div>
            </div>

            {/* Result */}
            <div ref={resultRef} className="lg:col-span-2 relative overflow-hidden bg-slate-900 text-white p-5 sm:p-6 flex flex-col">
              <div className="absolute -right-12 -top-12 w-44 h-44 rounded-full bg-sbb-red/30 blur-2xl" aria-hidden="true"></div>
              {best && best.cost !== null && (
                <div className="relative" aria-live="polite">
                  <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-300">
                    <Star className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
                    {t('ourPick')}
                  </div>
                  <div className="mt-2 text-2xl sm:text-3xl font-bold leading-tight">{t(OPTION_LABELS[best.type])}</div>
                  <div className="mt-1 text-4xl sm:text-5xl font-extrabold tracking-tight tabular">{formatCurrency(best.cost)}</div>
                  <div className="text-sm font-medium text-slate-400">
                    {travellers === 1 ? t('totalForOne') : t('totalFor', { count: travellers })}
                  </div>
                  <p className="mt-2 text-sm text-slate-300 leading-snug">{getOptionDetail(best)}</p>
                  <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-400/15 px-3 py-1 text-sm font-medium text-emerald-300">
                    <Check className="w-4 h-4 shrink-0" aria-hidden="true" />
                    {best.type === 'payPerTicket'
                      ? t('noPassNeeded')
                      : t('savingsVsTickets', { amount: Math.round(payPerTicketCost - best.cost).toLocaleString('de-CH') })}
                  </div>
                </div>
              )}

              <div className="relative mt-6 pt-5 border-t border-white/10">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">{t('otherOptions')}</div>
                <ul className="space-y-3">
                  {otherOptions.map(option => (
                    <li key={option.type}>
                      <div className="flex items-baseline justify-between gap-3">
                        <span className={`text-sm font-medium ${option.cost === null ? 'text-slate-500' : 'text-slate-100'}`}>{t(OPTION_LABELS[option.type])}</span>
                        {option.cost !== null && (
                          <span className="text-sm font-semibold tabular text-slate-100">{formatCurrency(option.cost)}</span>
                        )}
                      </div>
                      {option.cost !== null ? (
                        <div className="mt-1.5 h-1.5 rounded-full bg-white/10 overflow-hidden">
                          <div className="h-full rounded-full bg-white/50" style={{ width: `${Math.max(3, (option.cost / maxCost) * 100)}%` }} />
                        </div>
                      ) : (
                        <div className="mt-0.5 text-xs text-slate-500">{getOptionDetail(option)}</div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-4 grid sm:grid-cols-3 gap-3 text-xs sm:text-sm text-slate-600">
            <p className="flex gap-2"><Train className="w-4 h-4 shrink-0 mt-0.5 text-sbb-red" aria-hidden="true" /><span>{t('stpExtras')}</span></p>
            <p className="flex gap-2"><Baby className="w-4 h-4 shrink-0 mt-0.5 text-sbb-red" aria-hidden="true" /><span>{t('kidsNote')}</span></p>
            <p className="flex gap-2 text-slate-500"><Lightbulb className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" /><span>{t('finderDisclaimer')}</span></p>
          </div>
        </section>

        {/* Passes explained */}
        <section id="passes" className="scroll-mt-20">
          <SectionHeading title={t('passesTitle')} subtitle={`${t('passesSubtitle')} ${t('pricesNote')}`} />
          <div className="grid md:grid-cols-3 gap-3 sm:gap-4">
            {FEATURED_PASSES.map(({ prefix, icon: Icon, accent, tint, link }) => (
              <article key={prefix} className={`${cardClass} overflow-hidden flex flex-col`}>
                <div className={`h-1.5 ${accent}`} aria-hidden="true" />
                <div className="p-4 sm:p-5 flex flex-col flex-1">
                  <div className="flex items-center gap-3">
                    <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${tint}`}>
                      <Icon className="w-5 h-5" aria-hidden="true" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 leading-tight">{t(`${prefix}Title`)}</h3>
                  </div>
                  <p className="mt-3 text-base font-semibold text-slate-900">{t(`${prefix}Price`)}</p>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed">{t(`${prefix}Desc`)}</p>
                  <div className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-700 flex gap-2">
                    <Check className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" aria-hidden="true" />
                    <span><span className="font-semibold">{t('bestFor')}:</span> {t(`${prefix}Best`)}</span>
                  </div>
                  <div className="mt-auto pt-4">
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={linkButtonClass}
                      data-umami-event="visitor-pass-link"
                      data-umami-event-pass={prefix}
                    >
                      {t('moreInfo')}
                      <ExternalLink className="w-4 h-4" aria-hidden="true" />
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <div className="mt-3 sm:mt-4 grid sm:grid-cols-2 gap-3 sm:gap-4">
            {MORE_PASSES.map(({ prefix, icon: Icon, link }) => (
              <article key={prefix} className={`${cardClass} p-4 sm:p-5 flex gap-3`}>
                <div className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center bg-slate-100 text-slate-700">
                  <Icon className="w-5 h-5" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex flex-col">
                  <h3 className="font-semibold text-slate-900">{t(`${prefix}Title`)}</h3>
                  <p className="text-sm font-medium text-sbb-red">{t(`${prefix}Price`)}</p>
                  <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">{t(`${prefix}Desc`)}</p>
                  <p className="mt-2 text-sm text-slate-700"><span className="font-semibold">{t('bestFor')}:</span> {t(`${prefix}Best`)}</p>
                  {link && (
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 self-start inline-flex items-center gap-1 py-1 text-sm font-semibold text-sbb-red hover:underline"
                      data-umami-event="visitor-pass-link"
                      data-umami-event-pass={prefix}
                    >
                      {t('moreInfo')}
                      <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Interrail */}
        <section id="interrail" className="scroll-mt-20">
          <SectionHeading title={t('interrailTitle')} subtitle={t('interrailIntro')} />
          <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
            <div className={`${cardClass} p-4 sm:p-5 flex gap-3`}>
              <div className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center bg-indigo-100 text-indigo-700">
                <Globe className="w-5 h-5" aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">{t('interrailGlobalTitle')}</h3>
                <p className="mt-1 text-sm text-slate-600 leading-relaxed">{t('interrailGlobalText')}</p>
              </div>
            </div>
            <div className={`${cardClass} p-4 sm:p-5 flex gap-3`}>
              <div className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center bg-indigo-100 text-indigo-700">
                <SwissCross />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">{t('interrailOneTitle')}</h3>
                <p className="mt-1 text-sm text-slate-600 leading-relaxed">{t('interrailOneText')}</p>
              </div>
            </div>
          </div>

          <div className={`${cardClass} mt-3 sm:mt-4 overflow-hidden`}>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-left">
                  <th scope="col" className="px-3 sm:px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider w-[40%]">{t('compareFeature')}</th>
                  <th scope="col" className="px-3 py-3 font-semibold text-slate-900 text-xs sm:text-sm">{t('compareInterrail')}</th>
                  <th scope="col" className="px-3 py-3 font-semibold text-sbb-red text-xs sm:text-sm">{t('compareSTP')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {COMPARISON_ROWS.map(row => (
                  <tr key={row.label}>
                    <th scope="row" className="px-3 sm:px-4 py-3 text-left font-medium text-slate-800 align-top">{t(row.label)}</th>
                    <CoverageCell coverage={row.interrail} t={t} />
                    <CoverageCell coverage={row.stp} t={t} />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-3 sm:mt-4 rounded-2xl bg-sbb-tint border border-sbb-red/15 p-4 sm:p-5">
            <h3 className="font-semibold text-slate-900">{t('interrailVsTitle')}</h3>
            <p className="mt-1 text-sm text-slate-700 leading-relaxed">{t('interrailVsText')}</p>
            <p className="mt-3 flex gap-2 text-sm text-slate-600">
              <Lightbulb className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" aria-hidden="true" />
              <span>{t('interrailTip')}</span>
            </p>
            <a
              href={visitorLinks.interrail}
              target="_blank"
              rel="noopener noreferrer"
              className={`${linkButtonClass} mt-4 bg-white`}
              data-umami-event="visitor-interrail-link"
            >
              {t('interrailLink')}
              <ExternalLink className="w-4 h-4" aria-hidden="true" />
            </a>
          </div>
        </section>

        {/* Practical tips */}
        <section id="tips" className="scroll-mt-20">
          <SectionHeading title={t('tipsTitle')} subtitle={t('tipsSubtitle')} />
          <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
            {TIPS.map(({ icon: Icon, prefix }, index) => {
              const important = index === 0;
              return (
                <div
                  key={prefix}
                  className={`rounded-2xl border p-4 sm:p-5 flex gap-3 ${
                    important ? 'border-amber-300 bg-amber-50 sm:col-span-2' : 'border-slate-200 bg-white shadow-xs'
                  }`}
                >
                  <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                    important ? 'bg-amber-100 text-amber-700' : 'bg-sbb-tint text-sbb-red'
                  }`}>
                    <Icon className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 flex flex-wrap items-center gap-2">
                      {t(`${prefix}Title`)}
                      {important && (
                        <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 bg-amber-200/70 px-2 py-0.5 rounded-full">
                          {t('tipsImportant')}
                        </span>
                      )}
                    </h3>
                    <p className="mt-1 text-sm text-slate-600 leading-relaxed">{t(`${prefix}Text`)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="scroll-mt-20">
          <SectionHeading title={t('faqTitle')} />
          <div className={`${cardClass} px-4 sm:px-6`}>
            <div className="divide-y divide-slate-200">
              {FAQS.map(n => (
                <details key={n} className="group py-1">
                  <summary className="flex items-center justify-between gap-3 py-3.5 cursor-pointer list-none font-medium text-slate-800 hover:text-slate-950 [&::-webkit-details-marker]:hidden">
                    <span>{t(`faq${n}Q`)}</span>
                    <ChevronDown className="w-4 h-4 shrink-0 text-slate-500 transition-transform group-open:rotate-180" aria-hidden="true" />
                  </summary>
                  <p className="pb-4 pr-6 text-sm text-slate-600 leading-relaxed">{t(`faq${n}A`)}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Call to action */}
        <section>
          <div className="relative overflow-hidden rounded-2xl bg-slate-900 text-white p-6 sm:p-10">
            <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-sbb-red/30 blur-2xl" aria-hidden="true"></div>
            <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
              <div className="max-w-xl">
                <h2 className="text-xl sm:text-2xl font-bold">{t('ctaTitle')}</h2>
                <p className="mt-2 text-slate-300">{t('ctaText')}</p>
              </div>
              <Link
                to={calculatorPath}
                className="shrink-0 self-start sm:self-auto inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-sbb-red hover:bg-sbb-dark text-white font-semibold transition-colors"
              >
                {t('ctaButton')}
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
          <p className="mt-4 text-center text-xs text-slate-500">{t('disclaimer')}</p>
        </section>
      </main>

      {/* Mobile: live result that follows the visitor while they edit the trip */}
      {best && best.cost !== null && inputsInView && !resultInView && (
        <div className="sm:hidden fixed bottom-0 inset-x-0 z-40 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pointer-events-none">
          <button
            type="button"
            onClick={() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            className="pointer-events-auto w-full flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-slate-900 text-white shadow-xl shadow-slate-900/30 active:scale-[0.99] transition-transform"
          >
            <span className="min-w-0 text-left">
              <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-emerald-300">
                <Star className="w-3 h-3 fill-current" aria-hidden="true" />
                {t('ourPick')}
              </span>
              <span className="block text-sm font-semibold truncate">{t(OPTION_LABELS[best.type])}</span>
            </span>
            <span className="shrink-0 flex items-center gap-2">
              <span className="text-lg font-extrabold tabular">{formatCurrency(best.cost)}</span>
              <ChevronDown className="w-4 h-4 text-slate-400" aria-hidden="true" />
            </span>
          </button>
        </div>
      )}
    </div>
  );
};

export default Visitors;
