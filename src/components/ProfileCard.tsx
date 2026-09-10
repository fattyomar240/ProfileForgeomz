import { MapPin, Mail, Phone, Globe, Github, Linkedin, User } from 'lucide-react';
import type { Profile } from '@/types';
import SkillBadge from './SkillBadge';
import SocialButton from './SocialButton';

type ProfileCardProps = {
  profile: Profile;
  className?: string;
};

function initials(name: string) {
  return name
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function prettyHandle(url: string, fallback: string) {
  try {
    const u = new URL(url);
    const path = u.pathname.replace(/^\//, '').replace(/\/$/, '');
    return path || fallback;
  } catch {
    return fallback;
  }
}

export default function ProfileCard({ profile, className = '' }: ProfileCardProps) {
  const hasContact = profile.email || profile.phone || profile.location;
  const hasLinks = profile.github || profile.linkedin || profile.portfolio;

  return (
    <article className={`card overflow-hidden ${className}`}>
      {/* Banner */}
      <div className="h-24 bg-gradient-to-r from-slate-800 to-slate-700" />

      <div className="px-6 pb-6">
        {/* Avatar */}
        <div className="-mt-12 mb-4 flex items-end justify-between">
          <div className="h-24 w-24 overflow-hidden rounded-2xl ring-4 ring-white shadow-md">
            {profile.photo ? (
              <img src={profile.photo} alt={profile.fullName} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-slate-100 text-slate-400">
                <User className="h-10 w-10" />
              </div>
            )}
          </div>
        </div>

        {/* Identity */}
        <div>
          <h3 className="text-xl font-bold text-slate-900">
            {profile.fullName || 'Your Name'}
          </h3>
          <p className="mt-0.5 text-sm font-medium text-brand-600">
            {profile.title || 'Professional Title'}
          </p>
          {profile.location && (
            <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-slate-500">
              <MapPin className="h-4 w-4" /> {profile.location}
            </p>
          )}
        </div>

        {/* Bio */}
        {profile.bio && (
          <p className="mt-4 text-sm leading-relaxed text-slate-600">{profile.bio}</p>
        )}

        {/* Skills */}
        {profile.skills.length > 0 && (
          <div className="mt-5">
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Skills</h4>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((s) => (
                <SkillBadge key={s} skill={s} />
              ))}
            </div>
          </div>
        )}

        {/* Contact */}
        {hasContact && (
          <div className="mt-5 space-y-2">
            <h4 className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">Contact</h4>
            {profile.email && (
              <a href={`mailto:${profile.email}`} className="flex items-center gap-2.5 text-sm text-slate-600 hover:text-slate-900">
                <Mail className="h-4 w-4 text-slate-400" /> {profile.email}
              </a>
            )}
            {profile.phone && (
              <p className="flex items-center gap-2.5 text-sm text-slate-600">
                <Phone className="h-4 w-4 text-slate-400" /> {profile.phone}
              </p>
            )}
          </div>
        )}

        {/* Links */}
        {hasLinks && (
          <div className="mt-5">
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Links</h4>
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
    </article>
  );
}
