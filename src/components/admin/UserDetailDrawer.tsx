import { User, Ban, Trash2, CheckCircle2, X } from 'lucide-react';
import type { ProfileRow } from '@/types';

type UserDetailDrawerProps = {
  user: ProfileRow | null;
  onClose: () => void;
  onToggleStatus: (user: ProfileRow) => void;
  onDelete: (user: ProfileRow) => void;
  actionLoading: boolean;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function UserDetailDrawer({
  user,
  onClose,
  onToggleStatus,
  onDelete,
  actionLoading,
}: UserDetailDrawerProps) {
  if (!user) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Drawer */}
      <aside className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-2xl animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">User details</h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {/* Avatar + name */}
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 overflow-hidden rounded-2xl bg-slate-100 ring-2 ring-white shadow-sm">
              {user.photo_url ? (
                <img src={user.photo_url} alt={user.full_name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-slate-400">
                  <User className="h-9 w-9" />
                </div>
              )}
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">{user.full_name || 'Unnamed'}</h3>
              <p className="text-sm text-brand-600">{user.title || 'No title'}</p>
              <span
                className={`mt-1.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                  user.status === 'active'
                    ? 'bg-success-50 text-success-700'
                    : 'bg-error-50 text-error-700'
                }`}
              >
                {user.status === 'active' ? <CheckCircle2 className="h-3 w-3" /> : <Ban className="h-3 w-3" />}
                {user.status === 'active' ? 'Active' : 'Disabled'}
              </span>
            </div>
          </div>

          {/* Bio */}
          {user.bio && (
            <p className="mt-5 text-sm leading-relaxed text-slate-600">{user.bio}</p>
          )}

          {/* Details grid */}
          <dl className="mt-6 space-y-4">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-slate-400">Email</dt>
              <dd className="mt-0.5 text-sm text-slate-700">{user.email}</dd>
            </div>
            {user.phone && (
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-slate-400">Phone</dt>
                <dd className="mt-0.5 text-sm text-slate-700">{user.phone}</dd>
              </div>
            )}
            {user.location && (
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-slate-400">Location</dt>
                <dd className="mt-0.5 text-sm text-slate-700">{user.location}</dd>
              </div>
            )}
            {user.skills.length > 0 && (
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-slate-400">Skills</dt>
                <dd className="mt-2 flex flex-wrap gap-1.5">
                  {user.skills.map((s) => (
                    <span key={s} className="rounded-full border border-brand-200 bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700">
                      {s}
                    </span>
                  ))}
                </dd>
              </div>
            )}
            {(user.github_url || user.linkedin_url || user.portfolio_url) && (
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-slate-400">Links</dt>
                <dd className="mt-1 space-y-1 text-sm">
                  {user.github_url && (
                    <a href={user.github_url} target="_blank" rel="noopener noreferrer" className="block text-brand-600 hover:underline">
                      {user.github_url}
                    </a>
                  )}
                  {user.linkedin_url && (
                    <a href={user.linkedin_url} target="_blank" rel="noopener noreferrer" className="block text-brand-600 hover:underline">
                      {user.linkedin_url}
                    </a>
                  )}
                  {user.portfolio_url && (
                    <a href={user.portfolio_url} target="_blank" rel="noopener noreferrer" className="block text-brand-600 hover:underline">
                      {user.portfolio_url}
                    </a>
                  )}
                </dd>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-slate-400">Registered</dt>
                <dd className="mt-0.5 text-sm text-slate-700">{formatDate(user.created_at)}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-slate-400">Last seen</dt>
                <dd className="mt-0.5 text-sm text-slate-700">{formatDateTime(user.last_seen_at)}</dd>
              </div>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-slate-400">Role</dt>
              <dd className="mt-0.5">
                <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                  user.role === 'admin' ? 'bg-brand-50 text-brand-700' : 'bg-slate-100 text-slate-600'
                }`}>
                  {user.role}
                </span>
              </dd>
            </div>
          </dl>
        </div>

        {/* Actions */}
        <div className="border-t border-slate-200 px-6 py-4">
          <div className="flex gap-3">
            <button
              onClick={() => onToggleStatus(user)}
              disabled={actionLoading}
              className={`btn flex-1 ${
                user.status === 'active'
                  ? 'border border-warning-300 text-warning-700 hover:bg-warning-50'
                  : 'border border-success-300 text-success-700 hover:bg-success-50'
              }`}
            >
              {user.status === 'active' ? <><Ban className="h-4 w-4" /> Disable</> : <><CheckCircle2 className="h-4 w-4" /> Enable</>}
            </button>
            <button
              onClick={() => onDelete(user)}
              disabled={actionLoading}
              className="btn flex-1 border border-error-300 text-error-700 hover:bg-error-50"
            >
              <Trash2 className="h-4 w-4" /> Delete
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
