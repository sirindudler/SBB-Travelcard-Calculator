export interface RouteColorScheme {
  bg: string;
  border: string;
  border200: string;
  border300: string;
  text: string;
  accent: string;
  buttonBg: string;
  focusRing: string;
  summaryBg: string;
}

export const routeColorSchemes: RouteColorScheme[] = [
  {
    bg: 'from-green-50 to-emerald-50',
    border: 'border-green-100',
    border200: 'border-green-200',
    border300: 'border-green-300',
    text: 'text-green-800',
    accent: 'text-green-600',
    buttonBg: 'bg-green-500',
    focusRing: 'focus:ring-green-500 focus:border-green-500',
    summaryBg: 'bg-green-100'
  },
  {
    bg: 'from-blue-50 to-sky-50',
    border: 'border-blue-100',
    border200: 'border-blue-200',
    border300: 'border-blue-300',
    text: 'text-blue-800',
    accent: 'text-blue-600',
    buttonBg: 'bg-blue-500',
    focusRing: 'focus:ring-blue-500 focus:border-blue-500',
    summaryBg: 'bg-blue-100'
  },
  {
    bg: 'from-purple-50 to-violet-50',
    border: 'border-purple-100',
    border200: 'border-purple-200',
    border300: 'border-purple-300',
    text: 'text-purple-800',
    accent: 'text-purple-600',
    buttonBg: 'bg-purple-500',
    focusRing: 'focus:ring-purple-500 focus:border-purple-500',
    summaryBg: 'bg-purple-100'
  },
  {
    bg: 'from-orange-50 to-amber-50',
    border: 'border-orange-100',
    border200: 'border-orange-200',
    border300: 'border-orange-300',
    text: 'text-orange-800',
    accent: 'text-orange-600',
    buttonBg: 'bg-orange-500',
    focusRing: 'focus:ring-orange-500 focus:border-orange-500',
    summaryBg: 'bg-orange-100'
  },
  {
    bg: 'from-pink-50 to-rose-50',
    border: 'border-pink-100',
    border200: 'border-pink-200',
    border300: 'border-pink-300',
    text: 'text-pink-800',
    accent: 'text-pink-600',
    buttonBg: 'bg-pink-500',
    focusRing: 'focus:ring-pink-500 focus:border-pink-500',
    summaryBg: 'bg-pink-100'
  },
  {
    bg: 'from-teal-50 to-cyan-50',
    border: 'border-teal-100',
    border200: 'border-teal-200',
    border300: 'border-teal-300',
    text: 'text-teal-800',
    accent: 'text-teal-600',
    buttonBg: 'bg-teal-500',
    focusRing: 'focus:ring-teal-500 focus:border-teal-500',
    summaryBg: 'bg-teal-100'
  }
];

export const getColorScheme = (index: number): RouteColorScheme => {
  return routeColorSchemes[index % routeColorSchemes.length];
};