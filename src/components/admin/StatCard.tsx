import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

type StatCardProps = {
  label: string;
  value: number | string;
  icon: LucideIcon;
  tone?: 'brand' | 'success' | 'warning' | 'slate';
  loading?: boolean;
  hint?: string;
};

const tones: Record<string, string> = {
  brand: 'bg-brand-50 text-brand-600',
  success: 'bg-success-50 text-success-600',
  warning: 'bg-warning-50 text-warning-600',
  slate: 'bg-slate-100 text-slate-600',
};

export default function StatCard({
  label,
  value,
  icon: Icon,
  tone = 'slate',
  loading,
  hint,
}: StatCardProps) {
  return (
    <div className="card p-5 transition-all duration-300 hover:shadow-lift">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">{label}</span>
        <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${tones[tone]}`}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <div className="mt-3">
        {loading ? (
          <div className="h-8 w-20 animate-pulse rounded bg-slate-100" />
        ) : (
          <p className="text-3xl font-bold tracking-tight text-slate-900">{value}</p>
        )}
        {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
      </div>
    </div>
  );
}
