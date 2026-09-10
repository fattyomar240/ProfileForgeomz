import { useState, useRef, type KeyboardEvent } from 'react';
import { X, Plus } from 'lucide-react';
import SkillBadge from './SkillBadge';

type SkillInputProps = {
  skills: string[];
  onChange: (skills: string[]) => void;
  error?: string;
};

export default function SkillInput({ skills, onChange, error }: SkillInputProps) {
  const [draft, setDraft] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const add = (raw: string) => {
    const value = raw.trim();
    if (!value) return;
    if (skills.some((s) => s.toLowerCase() === value.toLowerCase())) {
      setDraft('');
      return;
    }
    onChange([...skills, value]);
    setDraft('');
  };

  const remove = (skill: string) => onChange(skills.filter((s) => s !== skill));

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      add(draft);
    } else if (e.key === 'Backspace' && draft === '' && skills.length > 0) {
      remove(skills[skills.length - 1]);
    }
  };

  return (
    <div className="w-full">
      <label className="label">Skills</label>
      <div
        onClick={() => inputRef.current?.focus()}
        className={`flex flex-wrap items-center gap-2 rounded-lg border bg-white px-3 py-2.5 transition-all duration-200 cursor-text ${
          error
            ? 'border-error-400 focus-within:ring-2 focus-within:ring-error-400/20'
            : 'border-slate-300 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20'
        }`}
      >
        {skills.map((s) => (
          <span key={s} className="inline-flex items-center gap-1 rounded-full border border-brand-200 bg-brand-50 py-1 pl-3 pr-1.5 text-sm font-medium text-brand-700 animate-scale-in">
            {s}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); remove(s); }}
              className="flex h-4 w-4 items-center justify-center rounded-full text-brand-500 hover:bg-brand-100 hover:text-brand-700"
              aria-label={`Remove ${s}`}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <div className="flex flex-1 items-center gap-1.5">
          <Plus className="h-4 w-4 text-slate-300" />
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKeyDown}
            onBlur={() => add(draft)}
            placeholder={skills.length === 0 ? 'Type a skill and press Enter' : 'Add another…'}
            className="flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
        </div>
      </div>
      {error ? (
        <p className="error-text">{error}</p>
      ) : (
        <p className="helper">Press Enter or comma to add a skill. Backspace removes the last one.</p>
      )}
    </div>
  );
}
