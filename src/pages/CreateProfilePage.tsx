import { useState, type FormEvent } from 'react';
import { Eye, RotateCcw, Loader2, AlertCircle } from 'lucide-react';
import { useProfile } from '@/context/ProfileContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from '@/context/RouterContext';
import type { Profile, ProfileErrors } from '@/types';
import { supabase } from '@/lib/supabase';
import { uploadProfilePhoto } from '@/lib/storage';
import FormField from '@/components/FormField';
import PhotoUpload from '@/components/PhotoUpload';
import SkillInput from '@/components/SkillInput';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_RE = /^https?:\/\/.+/;

export default function CreateProfilePage() {
  const { profile, setProfile, resetProfile } = useProfile();
  const { session, signUp, signIn, refreshProfile } = useAuth();
  const { navigate } = useRouter();
  const [errors, setErrors] = useState<ProfileErrors & { password?: string; authEmail?: string }>({});
  const [submitted, setSubmitted] = useState(false);
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const isExistingUser = !!session?.user;

  const update = <K extends keyof Profile>(key: K, value: Profile[K]) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
    if (submitted) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = (): typeof errors => {
    const e: typeof errors = {};
    if (!profile.fullName.trim()) e.fullName = 'Full name is required.';
    if (!profile.title.trim()) e.title = 'Professional title is required.';
    if (!profile.bio.trim()) e.bio = 'A short bio is required.';
    if (profile.bio && profile.bio.length > 400) e.bio = 'Bio should be under 400 characters.';
    if (!profile.email.trim()) e.email = 'Email is required.';
    else if (!EMAIL_RE.test(profile.email)) e.email = 'Enter a valid email address.';
    if (!isExistingUser) {
      if (!password) e.password = 'Password is required.';
      else if (password.length < 6) e.password = 'Password must be at least 6 characters.';
    }
    if (profile.github && !URL_RE.test(profile.github)) e.github = 'Enter a full URL (https://...).';
    if (profile.linkedin && !URL_RE.test(profile.linkedin)) e.linkedin = 'Enter a full URL (https://...).';
    if (profile.portfolio && !URL_RE.test(profile.portfolio)) e.portfolio = 'Enter a full URL (https://...).';
    return e;
  };

  const saveProfileToDb = async (userId: string) => {
    let photoUrl = profile.photo;

    // Upload photo to storage if it's a data URL
    if (photoUrl && photoUrl.startsWith('data:')) {
      const uploaded = await uploadProfilePhoto(userId, photoUrl);
      if (uploaded) photoUrl = uploaded;
    }

    const row = {
      full_name: profile.fullName.trim(),
      title: profile.title.trim(),
      bio: profile.bio.trim(),
      location: profile.location.trim(),
      phone: profile.phone.trim(),
      photo_url: photoUrl ?? '',
      skills: profile.skills,
      github_url: profile.github.trim(),
      linkedin_url: profile.linkedin.trim(),
      portfolio_url: profile.portfolio.trim(),
    };

    const { error } = await supabase.from('profiles').update(row).eq('id', userId);
    if (error) throw error;
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setServerError(null);
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    try {
      if (isExistingUser && session?.user?.id) {
        await saveProfileToDb(session.user.id);
        await refreshProfile();
        navigate('preview');
      } else {
        // New user: sign up with email + password
        const { error: signUpError } = await signUp(profile.email.trim(), password);
        if (signUpError) {
          setServerError(signUpError);
          return;
        }
        // After signup, get the session to obtain the user id
        const { data: sessionData } = await supabase.auth.getSession();
        const newUserId = sessionData.session?.user?.id;
        if (!newUserId) {
          // Session not established yet — try signing in
          const { error: signInErr } = await signIn(profile.email.trim(), password);
          if (signInErr) {
            setServerError(signInErr);
            return;
          }
          const { data: s2 } = await supabase.auth.getSession();
          const uid = s2.session?.user?.id;
          if (!uid) {
            setServerError('Account created, but we could not establish a session. Please sign in.');
            return;
          }
          await saveProfileToDb(uid);
        } else {
          await saveProfileToDb(newUserId);
        }
        await refreshProfile();
        navigate('preview');
      }
    } catch (err) {
      console.error('Save failed', err);
      setServerError('Could not save your profile. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const onReset = () => {
    resetProfile();
    setPassword('');
    setErrors({});
    setSubmitted(false);
    setServerError(null);
  };

  const bioLength = profile.bio.length;

  return (
    <div className="animate-fade-in">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
          <h1 className="text-3xl font-bold text-slate-900">
            {isExistingUser ? 'Edit your profile' : 'Create your profile'}
          </h1>
          <p className="mt-2 text-slate-600">
            {isExistingUser
              ? 'Update your details below and preview the result.'
              : 'Fill in your details to build your professional profile. Your email and password create your account.'}
          </p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="mx-auto max-w-3xl px-4 py-10 sm:px-6" noValidate>
        {serverError && (
          <div className="mb-6 flex items-start gap-3 rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        <div className="space-y-10">
          {/* Photo */}
          <section className="card p-6 sm:p-8 animate-fade-up">
            <h2 className="text-lg font-semibold text-slate-900">Profile photo</h2>
            <p className="mt-1 text-sm text-slate-500">A clear, professional headshot works best.</p>
            <div className="mt-5">
              <PhotoUpload value={profile.photo} onChange={(v) => update('photo', v)} />
            </div>
          </section>

          {/* About */}
          <section className="card p-6 sm:p-8 animate-fade-up [animation-delay:50ms]">
            <h2 className="text-lg font-semibold text-slate-900">About you</h2>
            <div className="mt-5 grid gap-5">
              <FormField
                label="Full name"
                required
                placeholder="e.g. omar fatty"
                value={profile.fullName}
                error={errors.fullName}
                onChange={(e) => update('fullName', e.target.value)}
                autoComplete="name"
              />
              <FormField
                label="Professional title"
                required
                placeholder="e.g. Agentic software Developer"
                value={profile.title}
                error={errors.title}
                onChange={(e) => update('title', e.target.value)}
              />
              <FormField
                as="textarea"
                label="Short bio"
                required
                placeholder="A brief summary of who you are and what you do."
                value={profile.bio}
                error={errors.bio}
                onChange={(e) => update('bio', e.target.value)}
                helper={`${bioLength}/400 characters`}
              />
              <FormField
                label="Location"
                placeholder="e.g. Berlin, Germany"
                value={profile.location}
                error={errors.location}
                onChange={(e) => update('location', e.target.value)}
              />
            </div>
          </section>

          {/* Account */}
          <section className="card p-6 sm:p-8 animate-fade-up [animation-delay:100ms]">
            <h2 className="text-lg font-semibold text-slate-900">
              {isExistingUser ? 'Account email' : 'Account'}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {isExistingUser
                ? 'Your email is linked to your account.'
                : 'Your email and password create your ProfileForge account.'}
            </p>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <FormField
                label="Email"
                required
                type="email"
                placeholder="you@example.com"
                value={profile.email}
                error={errors.email}
                onChange={(e) => update('email', e.target.value)}
                autoComplete="email"
                disabled={isExistingUser}
              />
              {!isExistingUser && (
                <FormField
                  label="Password"
                  required
                  type="password"
                  placeholder="At least 6 characters"
                  value={password}
                  error={errors.password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                />
              )}
            </div>
          </section>

          {/* Contact */}
          <section className="card p-6 sm:p-8 animate-fade-up [animation-delay:150ms]">
            <h2 className="text-lg font-semibold text-slate-900">Contact</h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <FormField
                label="Phone number"
                type="tel"
                placeholder="+49 30 1234 5678"
                value={profile.phone}
                error={errors.phone}
                onChange={(e) => update('phone', e.target.value)}
                autoComplete="tel"
              />
            </div>
          </section>

          {/* Skills */}
          <section className="card p-6 sm:p-8 animate-fade-up [animation-delay:200ms]">
            <h2 className="text-lg font-semibold text-slate-900">Skills</h2>
            <p className="mt-1 text-sm text-slate-500">Add the skills you want to be known for.</p>
            <div className="mt-5">
              <SkillInput skills={profile.skills} onChange={(s) => update('skills', s)} error={errors.skills} />
            </div>
          </section>

          {/* Links */}
          <section className="card p-6 sm:p-8 animate-fade-up [animation-delay:250ms]">
            <h2 className="text-lg font-semibold text-slate-900">Links</h2>
            <p className="mt-1 text-sm text-slate-500">Connect your GitHub, LinkedIn, and portfolio.</p>
            <div className="mt-5 grid gap-5">
              <FormField
                label="GitHub URL"
                placeholder="https://github.com/yourusername"
                value={profile.github}
                error={errors.github}
                onChange={(e) => update('github', e.target.value)}
                inputMode="url"
              />
              <FormField
                label="LinkedIn URL"
                placeholder="https://linkedin.com/in/yourusername"
                value={profile.linkedin}
                error={errors.linkedin}
                onChange={(e) => update('linkedin', e.target.value)}
                inputMode="url"
              />
              <FormField
                label="Portfolio URL"
                placeholder="https://your-portfolio.com"
                value={profile.portfolio}
                error={errors.portfolio}
                onChange={(e) => update('portfolio', e.target.value)}
                inputMode="url"
              />
            </div>
          </section>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button type="button" onClick={onReset} className="btn-ghost" disabled={submitting}>
            <RotateCcw className="h-4 w-4" /> Clear form
          </button>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Saving…
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" /> Preview Profile
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
