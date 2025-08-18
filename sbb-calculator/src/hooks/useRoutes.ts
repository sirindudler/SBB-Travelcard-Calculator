import { useState, useCallback } from 'react';
import { Route } from '../services/CalculatorService';
import { getColorScheme } from '../utils/colorSchemes';

export interface UseRoutesReturn {
  routes: Route[];
  addRoute: () => void;
  removeRoute: (id: number) => void;
  updateRoute: (id: number, updates: Partial<Route>) => void;
  clearRoutes: () => void;
  hasValidRoutes: boolean;
}

let nextRouteId = 1;

const createNewRoute = (): Route => ({
  id: nextRouteId++,
  name: `Route ${nextRouteId}`,
  from: '',
  to: '',
  trips: '',
  cost: '',
  isHalbtaxPrice: false,
  colorScheme: getColorScheme(nextRouteId - 1),
  durationMonths: 12,
  frequencyType: 'weekly',
  isGANightEligible: false
});

export const useRoutes = (initialRoutes?: Route[]): UseRoutesReturn => {
  const [routes, setRoutes] = useState<Route[]>(() => {
    if (initialRoutes && initialRoutes.length > 0) {
      nextRouteId = Math.max(...initialRoutes.map(r => r.id)) + 1;
      return initialRoutes;
    }
    return [createNewRoute()];
  });

  const addRoute = useCallback(() => {
    const newRoute = createNewRoute();
    setRoutes(prev => [...prev, newRoute]);
  }, []);

  const removeRoute = useCallback((id: number) => {
    setRoutes(prev => {
      const filtered = prev.filter(route => route.id !== id);
      return filtered.length === 0 ? [createNewRoute()] : filtered;
    });
  }, []);

  const updateRoute = useCallback((id: number, updates: Partial<Route>) => {
    setRoutes(prev => prev.map(route => 
      route.id === id ? { ...route, ...updates } : route
    ));
  }, []);

  const clearRoutes = useCallback(() => {
    nextRouteId = 1;
    setRoutes([createNewRoute()]);
  }, []);

  const hasValidRoutes = routes.some(route => 
    route.trips !== '' && route.cost !== '' && 
    Number(route.trips) > 0 && Number(route.cost) > 0
  );

  return {
    routes,
    addRoute,
    removeRoute,
    updateRoute,
    clearRoutes,
    hasValidRoutes
  };
};