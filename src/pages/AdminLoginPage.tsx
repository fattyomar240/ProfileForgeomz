import { useState, type FormEvent } from 'react';
import { Hammer, Lock, Mail, Loader2, ArrowLeft, ShieldCheck, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from '@/context/RouterContext';
import { supabase } from '@/lib/supabase';

export default function AdminLoginPage() {
  const { signIn } = useAuth();
  const { navigate } = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      const { error: signInError } = await signIn(email.trim(), password);
      if (signInError) {
        setError('Invalid email or password.');
        setLoading(false);
        return;
      }

      // After successful sign-in, fetch the profile to verify admin role
      // before navigating. This avoids a redirect loop if the user isn't an admin.
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user?.id;
      if (!userId) {
        setError('Sign-in succeeded but no session was established. Please try again.');
        setLoading(false);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, status')
        .eq('id', userId)
        .maybeSingle();

      if (profileError || !profile) {
        setError('Could not verify your account. Please try again.');
        setLoading(false);
        return;
      }

      if (profile.role !== 'admin' || profile.status !== 'active') {
        setError('This account does not have administrator access.');
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      navigate('admin');
    } catch {
      setError('Could not sign in. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12">
        <button
          onClick={() => navigate('home')}
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" /> Back to site
        </button>

        <div className="card p-8 animate-fade-up">
          <div className="mb-6 flex flex-col items-center text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-white">
              <Hammer className="h-6 w-6" />
            </span>
            <h1 className="mt-4 text-2xl font-bold text-slate-900">Admin Sign In</h1>
            <p className="mt-1.5 text-sm text-slate-500">
              Sign in to the ProfileForge admin dashboard.
            </p>
          </div>

          {error && (
            <div className="mb-5 flex items-start gap-3 rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-5" noValidate>
            <div>
              <label className="label">Email</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  autoComplete="email"
                  className="input pl-10"
                  disabled={loading}
                />
              </div>
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                  autoComplete="current-password"
                  className="input px-10"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-700"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Signing in…
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" /> Sign In
                </>
              )}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          Protected area. Authorized administrators only.
        </p>
      </div>
    </div>
  );
}
