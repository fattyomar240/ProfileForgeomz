import { Hammer, Shield } from 'lucide-react';
import { useRouter, type Route } from '@/context/RouterContext';

type NavbarProps = {
  onNavigate?: (route: Route) => void;
};

export default function Navbar({ onNavigate }: NavbarProps) {
  const { route, navigate } = useRouter();

  const go = (next: Route) => {
    navigate(next);
    onNavigate?.(next);
  };

  const navItems: { label: string; route: Route }[] = [
    { label: 'Home', route: 'home' },
    { label: 'Create', route: 'create' },
    { label: 'Preview', route: 'preview' },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <button
          onClick={() => go('home')}
          className="group flex items-center gap-2"
          aria-label="ProfileForge home"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white transition-transform duration-200 group-hover:scale-105">
            <Hammer className="h-5 w-5" />
          </span>
          <span className="text-lg font-bold font-display tracking-tight text-slate-900">
            Profile<span className="text-brand-600">Forge</span>
          </span>
        </button>

        <nav className="hidden items-center gap-1 sm:flex">
          {navItems.map((item) => (
            <button
              key={item.route}
              onClick={() => go(item.route)}
              className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-colors duration-200 ${
                route === item.route
                  ? 'bg-slate-100 text-slate-900'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={() => go('admin-login')}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            aria-label="Admin"
            title="Admin"
          >
            <Shield className="h-4.5 w-4.5" />
          </button>
          <button onClick={() => go('create')} className="btn-primary">
            Create Profile
          </button>
        </div>
      </div>
    </header>
  );
}
