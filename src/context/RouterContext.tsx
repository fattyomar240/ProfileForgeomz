import { createContext, useContext, useState, useMemo, type ReactNode } from 'react';

export type Route = 'home' | 'create' | 'preview' | 'admin-login' | 'admin';

type RouterContextValue = {
  route: Route;
  navigate: (route: Route) => void;
};

const RouterContext = createContext<RouterContextValue | null>(null);

export function RouterProvider({ children }: { children: ReactNode }) {
  const [route, setRoute] = useState<Route>('home');

  const navigate = (next: Route) => {
    setRoute(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const value = useMemo(() => ({ route, navigate }), [route]);

  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

export function useRouter() {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error('useRouter must be used within RouterProvider');
  return ctx;
}
