import { useState, useEffect, useCallback, useMemo, type FormEvent } from 'react';
import {
  Users, UserPlus, CalendarDays, Activity, Search, Eye, Ban, Trash2,
  CheckCircle2, LogOut, Hammer, ArrowLeft, ChevronDown, X, Loader2,
  AlertCircle, User,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from '@/context/RouterContext';
import { supabase } from '@/lib/supabase';
import type { ProfileRow } from '@/types';
import StatCard from '@/components/admin/StatCard';
import UserDetailDrawer from '@/components/admin/UserDetailDrawer';

type SortOrder = 'newest' | 'oldest';
type StatusFilter = 'all' | 'active' | 'disabled';

type Stats = {
  total: number;
  today: number;
  thisWeek: number;
  active: number;
};

function startOfDay(d = new Date()) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function startOfWeek(d = new Date()) {
  const x = startOfDay(d);
  const day = x.getDay();
  const diff = x.getDate() - day + (day === 0 ? -6 : 1); // Monday as start
  x.setDate(diff);
  return x;
}

export default function AdminDashboardPage() {
  const { profile: adminProfile, signOut } = useAuth();
  const { navigate } = useRouter();

  const [users, setUsers] = useState<ProfileRow[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, today: 0, thisWeek: 0, active: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');

  const [selectedUser, setSelectedUser] = useState<ProfileRow | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<ProfileRow | null>(null);

  const loadUsers = useCallback(async () => {
    const { data, error: queryError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (queryError) {
      setError('Could not load users.');
      return;
    }
    const rows = (data || []) as ProfileRow[];
    setUsers(rows);

    const now = new Date();
    const dayStart = startOfDay(now).toISOString();
    const weekStart = startOfWeek(now).toISOString();

    setStats({
      total: rows.length,
      today: rows.filter((r) => r.created_at >= dayStart).length,
      thisWeek: rows.filter((r) => r.created_at >= weekStart).length,
      active: rows.filter((r) => r.status === 'active').length,
    });
    setError(null);
  }, []);

  useEffect(() => {
    setLoading(true);
    loadUsers().finally(() => setLoading(false));
  }, [loadUsers]);

  // Realtime: auto-update when profiles change
  useEffect(() => {
    const channel = supabase
      .channel('profiles-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        loadUsers();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadUsers]);

  const filtered = useMemo(() => {
    let result = users;
    if (statusFilter !== 'all') {
      result = result.filter((u) => u.status === statusFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (u) =>
          u.full_name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.title.toLowerCase().includes(q)
      );
    }
    result = [...result].sort((a, b) => {
      const cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      return sortOrder === 'newest' ? -cmp : cmp;
    });
    return result;
  }, [users, search, statusFilter, sortOrder]);

  const toggleStatus = useCallback(async (user: ProfileRow) => {
    setActionLoading(true);
    const nextStatus = user.status === 'active' ? 'disabled' : 'active';
    const { error: rpcError } = await supabase.rpc('set_user_status', {
      p_user: user.id,
      p_status: nextStatus,
    });
    if (rpcError) {
      setError('Could not update user status.');
    } else {
      await loadUsers();
      setSelectedUser((prev) => (prev ? { ...prev, status: nextStatus } : null));
    }
    setActionLoading(false);
  }, [loadUsers]);

  const deleteUser = useCallback(async (user: ProfileRow) => {
    setActionLoading(true);
    const { error: rpcError } = await supabase.rpc('delete_user_account', {
      p_user: user.id,
    });
    if (rpcError) {
      setError('Could not delete user.');
    } else {
      setConfirmDelete(null);
      setSelectedUser(null);
      await loadUsers();
    }
    setActionLoading(false);
  }, [loadUsers]);

  const onLogout = async () => {
    await signOut();
    navigate('admin-login');
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const adminName = adminProfile?.full_name || adminProfile?.email || 'Admin';

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white">
              <Hammer className="h-5 w-5" />
            </span>
            <div className="flex flex-col leading-tight">
              <span className="text-base font-bold font-display tracking-tight text-slate-900">
                Profile<span className="text-brand-600">Forge</span>
              </span>
              <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Admin</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('home')}
              className="hidden items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 sm:inline-flex"
            >
              <ArrowLeft className="h-4 w-4" /> View site
            </button>
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-600">
                {adminName.charAt(0).toUpperCase()}
              </div>
              <span className="hidden text-sm font-medium text-slate-700 sm:inline">{adminName}</span>
            </div>
            <button onClick={onLogout} className="btn-secondary">
              <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-auto text-error-400 hover:text-error-600">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Profiles" value={stats.total} icon={Users} tone="brand" loading={loading} hint="All registered users" />
          <StatCard label="New Users Today" value={stats.today} icon={UserPlus} tone="success" loading={loading} />
          <StatCard label="New This Week" value={stats.thisWeek} icon={CalendarDays} tone="warning" loading={loading} />
          <StatCard label="Active Users" value={stats.active} icon={Activity} tone="slate" loading={loading} hint="Status: active" />
        </div>

        {/* Users table */}
        <div className="mt-8 card overflow-hidden">
          {/* Toolbar */}
          <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <h2 className="text-lg font-semibold text-slate-900">Registered Users</h2>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              {/* Search */}
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search name, email, title…"
                  className="input pl-10 sm:w-64"
                />
              </div>
              {/* Status filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                className="input sm:w-36"
              >
                <option value="all">All status</option>
                <option value="active">Active</option>
                <option value="disabled">Disabled</option>
              </select>
              {/* Sort */}
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                className="input sm:w-36"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
              </select>
            </div>
          </div>

          {/* Table — desktop */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/60 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <th className="px-5 py-3">User</th>
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3">Registered</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-slate-400">
                      <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-slate-400">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((u) => (
                    <tr key={u.id} className="transition-colors hover:bg-slate-50/60">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 overflow-hidden rounded-full bg-slate-100">
                            {u.photo_url ? (
                              <img src={u.photo_url} alt={u.full_name} className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-slate-400">
                                <User className="h-4 w-4" />
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col leading-tight">
                            <span className="font-medium text-slate-900">{u.full_name || 'Unnamed'}</span>
                            <span className="text-xs text-slate-500">{u.title || 'No title'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-slate-600">{u.email}</td>
                      <td className="px-5 py-3 text-slate-600">{formatDate(u.created_at)}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                          u.status === 'active' ? 'bg-success-50 text-success-700' : 'bg-error-50 text-error-700'
                        }`}>
                          {u.status === 'active' ? <CheckCircle2 className="h-3 w-3" /> : <Ban className="h-3 w-3" />}
                          {u.status === 'active' ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => setSelectedUser(u)} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900" title="View">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => toggleStatus(u)}
                            disabled={actionLoading}
                            className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                              u.status === 'active'
                                ? 'text-warning-600 hover:bg-warning-50'
                                : 'text-success-600 hover:bg-success-50'
                            }`}
                            title={u.status === 'active' ? 'Disable' : 'Enable'}
                          >
                            {u.status === 'active' ? <Ban className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={() => setConfirmDelete(u)}
                            disabled={actionLoading}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-error-500 hover:bg-error-50"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Cards — mobile */}
          <div className="divide-y divide-slate-100 md:hidden">
            {loading ? (
              <div className="px-5 py-12 text-center text-slate-400">
                <Loader2 className="mx-auto h-6 w-6 animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="px-5 py-12 text-center text-slate-400">No users found.</div>
            ) : (
              filtered.map((u) => (
                <div key={u.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 overflow-hidden rounded-full bg-slate-100">
                        {u.photo_url ? (
                          <img src={u.photo_url} alt={u.full_name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-slate-400">
                            <User className="h-5 w-5" />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col leading-tight">
                        <span className="font-medium text-slate-900">{u.full_name || 'Unnamed'}</span>
                        <span className="text-xs text-slate-500">{u.email}</span>
                        <span className="mt-1 text-xs text-slate-400">{formatDate(u.created_at)}</span>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                      u.status === 'active' ? 'bg-success-50 text-success-700' : 'bg-error-50 text-error-700'
                    }`}>
                      {u.status === 'active' ? <CheckCircle2 className="h-3 w-3" /> : <Ban className="h-3 w-3" />}
                      {u.status === 'active' ? 'Active' : 'Disabled'}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <button onClick={() => setSelectedUser(u)} className="btn-secondary flex-1 text-xs">
                      <Eye className="h-3.5 w-3.5" /> View
                    </button>
                    <button
                      onClick={() => toggleStatus(u)}
                      disabled={actionLoading}
                      className={`btn flex-1 text-xs ${
                        u.status === 'active'
                          ? 'border border-warning-300 text-warning-700 hover:bg-warning-50'
                          : 'border border-success-300 text-success-700 hover:bg-success-50'
                      }`}
                    >
                      {u.status === 'active' ? <><Ban className="h-3.5 w-3.5" /> Disable</> : <><CheckCircle2 className="h-3.5 w-3.5" /> Enable</>}
                    </button>
                    <button
                      onClick={() => setConfirmDelete(u)}
                      disabled={actionLoading}
                      className="btn flex-1 border border-error-300 text-xs text-error-700 hover:bg-error-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Count footer */}
          <div className="border-t border-slate-100 px-5 py-3 text-xs text-slate-400">
            Showing {filtered.length} of {users.length} users
          </div>
        </div>
      </main>

      {/* User detail drawer */}
      <UserDetailDrawer
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
        onToggleStatus={toggleStatus}
        onDelete={(u) => setConfirmDelete(u)}
        actionLoading={actionLoading}
      />

      {/* Delete confirmation */}
      {confirmDelete && (
        <>
          <div className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm animate-fade-in" onClick={() => setConfirmDelete(null)} />
          <div className="fixed left-1/2 top-1/2 z-[60] w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 shadow-2xl animate-scale-in">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-error-50 text-error-600">
                <Trash2 className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Delete user?</h3>
                <p className="mt-1 text-sm text-slate-600">
                  This permanently deletes <span className="font-medium text-slate-900">{confirmDelete.full_name || confirmDelete.email}</span>'s account and profile. This cannot be undone.
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setConfirmDelete(null)} className="btn-secondary">Cancel</button>
              <button
                onClick={() => deleteUser(confirmDelete)}
                disabled={actionLoading}
                className="btn bg-error-600 text-white hover:bg-error-700"
              >
                {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                Delete
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
