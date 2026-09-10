import { Hammer, Github, Linkedin, Twitter, Shield } from 'lucide-react';
import { useRouter, type Route } from '@/context/RouterContext';

export default function Footer() {
  const { navigate } = useRouter();

  const go = (r: Route) => navigate(r);

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
              <Hammer className="h-4 w-4" />
            </span>
            <span className="text-base font-bold font-display tracking-tight">
              Profile<span className="text-brand-600">Forge</span>
            </span>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-600">
            <button onClick={() => go('home')} className="hover:text-slate-900">Home</button>
            <button onClick={() => go('create')} className="hover:text-slate-900">Create Profile</button>
            <button onClick={() => go('preview')} className="hover:text-slate-900">Preview</button>
            <button onClick={() => go('admin-login')} className="inline-flex items-center gap-1 hover:text-slate-900">
              <Shield className="h-3.5 w-3.5" /> Admin
            </button>
          </nav>

          <div className="flex items-center gap-3 text-slate-400">
            <a href="#" className="hover:text-slate-700" aria-label="GitHub"><Github className="h-5 w-5" /></a>
            <a href="#" className="hover:text-slate-700" aria-label="LinkedIn"><Linkedin className="h-5 w-5" /></a>
            <a href="#" className="hover:text-slate-700" aria-label="Twitter"><Twitter className="h-5 w-5" /></a>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-100 pt-6 text-center text-xs text-slate-500">
          &copy; {new Date().getFullYear()} ProfileForge. Craft your professional presence.
        </div>
      </div>
    </footer>
  );
}
