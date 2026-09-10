import { Pencil, MapPin, Mail, Phone, Globe, Github, Linkedin, User, FileText, ArrowLeft } from 'lucide-react';
import { useProfile } from '@/context/ProfileContext';
import { useRouter } from '@/context/RouterContext';
import SkillBadge from '@/components/SkillBadge';
import SocialButton from '@/components/SocialButton';

function prettyHandle(url: string, fallback: string) {
  try {
    const u = new URL(url);
    const path = u.pathname.replace(/^\//, '').replace(/\/$/, '');
    return path || fallback;
  } catch {
    return fallback;
  }
}

export default function PreviewPage() {
  const { profile, hasProfile } = useProfile();
  const { navigate } = useRouter();

  if (!hasProfile) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center animate-fade-up">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
          <FileText className="h-7 w-7" />
        </span>
        <h1 className="mt-5 text-2xl font-bold text-slate-900">No profile yet</h1>
        <p className="mt-2 text-slate-600">
          You haven't created a profile. Fill in your details and come back to see the polished preview.
        </p>
        <button onClick={() => navigate('create')} className="btn-primary mt-6">
          <Pencil className="h-4 w-4" /> Create your profile
        </button>
      </div>
    );
  }

  const hasContact = profile.email || profile.phone || profile.location;
  const hasLinks = profile.github || profile.linkedin || profile.portfolio;

  return (
    <div className="animate-fade-in">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        {/* Top bar */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <button
              onClick={() => navigate('home')}
              className="mb-2 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" /> Home
            </button>
            <h1 className="text-2xl font-bold text-slate-900">Your profile preview</h1>
          </div>
          <button onClick={() => navigate('create')} className="btn-primary">
            <Pencil className="h-4 w-4" /> Edit Profile
          </button>
        </div>

        {/* Profile card */}
        <article className="card overflow-hidden animate-fade-up">
          {/* Banner */}
          <div className="relative h-28 bg-gradient-to-r from-slate-800 via-slate-800 to-slate-700 sm:h-32">
            <div className="absolute inset-0 opacity-30" style={{
              backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.12) 0, transparent 50%)',
            }} />
          </div>

          <div className="px-6 pb-8 sm:px-8">
            {/* Avatar + identity */}
            <div className="-mt-14 flex flex-col gap-4 sm:-mt-16 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end">
                <div className="h-28 w-28 overflow-hidden rounded-2xl ring-4 ring-white shadow-md sm:h-32 sm:w-32">
                  {profile.photo ? (
                    <img src={profile.photo} alt={profile.fullName} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-slate-100 text-slate-400">
                      <User className="h-12 w-12" />
                    </div>
                  )}
                </div>
                <div className="pb-1">
                  <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">{profile.fullName}</h2>
                  <p className="mt-1 text-base font-medium text-brand-600">{profile.title}</p>
                </div>
              </div>
            </div>

            {/* Location */}
            {profile.location && (
              <p className="mt-4 inline-flex items-center gap-1.5 text-sm text-slate-500">
                <MapPin className="h-4 w-4" /> {profile.location}
              </p>
            )}

            {/* Bio */}
            {profile.bio && (
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-600">{profile.bio}</p>
            )}

            {/* Skills */}
            {profile.skills.length > 0 && (
              <div className="mt-7">
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((s) => (
                    <SkillBadge key={s} skill={s} size="md" />
                  ))}
                </div>
              </div>
            )}

            {/* Contact + Links grid */}
            {(hasContact || hasLinks) && (
              <div className="mt-8 grid gap-8 border-t border-slate-100 pt-7 sm:grid-cols-2">
                {hasContact && (
                  <div>
                    <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Contact</h3>
                    <div className="space-y-2.5">
                      {profile.email && (
                        <a href={`mailto:${profile.email}`} className="flex items-center gap-2.5 text-sm text-slate-600 transition-colors hover:text-slate-900">
                          <Mail className="h-4 w-4 text-slate-400" /> {profile.email}
                        </a>
                      )}
                      {profile.phone && (
                        <p className="flex items-center gap-2.5 text-sm text-slate-600">
                          <Phone className="h-4 w-4 text-slate-400" /> {profile.phone}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {hasLinks && (
                  <div>
                    <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Links</h3>
                    <div className="flex flex-wrap gap-2.5">
                      {profile.github && (
                        <SocialButton
                          href={profile.github}
                          label="GitHub"
                          handle={prettyHandle(profile.github, 'GitHub')}
                          icon={<Github className="h-4 w-4" />}
                        />
                      )}
                      {profile.linkedin && (
                        <SocialButton
                          href={profile.linkedin}
                          label="LinkedIn"
                          handle={prettyHandle(profile.linkedin, 'LinkedIn')}
                          icon={<Linkedin className="h-4 w-4" />}
                        />
                      )}
                      {profile.portfolio && (
                        <SocialButton
                          href={profile.portfolio}
                          label="Portfolio"
                          handle={prettyHandle(profile.portfolio, 'Visit')}
                          icon={<Globe className="h-4 w-4" />}
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </article>
      </div>
    </div>
  );
}
