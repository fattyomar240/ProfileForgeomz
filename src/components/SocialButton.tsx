import type { ReactNode } from 'react';
import { ArrowUpRight } from 'lucide-react';

type SocialButtonProps = {
  href: string;
  icon: ReactNode;
  label: string;
  handle?: string;
};

export default function SocialButton({ href, icon, label, handle }: SocialButtonProps) {
  if (!href) return null;
  const display = handle || label;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-flex items-center gap-2.5 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 hover:shadow-md active:scale-[0.98]"
    >
      <span className="text-slate-500 transition-colors group-hover:text-slate-700">{icon}</span>
      <span className="flex flex-col items-start leading-tight">
        <span className="text-[11px] font-normal text-slate-400">{label}</span>
        <span className="font-medium text-slate-800">{display}</span>
      </span>
      <ArrowUpRight className="ml-1 h-4 w-4 text-slate-400 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </a>
  );
}
