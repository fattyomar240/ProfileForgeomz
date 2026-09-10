import { ArrowRight, Sparkles, LayoutTemplate, Share2, Zap, Check } from 'lucide-react';
import { useRouter } from '@/context/RouterContext';
import { useProfile } from '@/context/ProfileContext';
import ProfileCard from '@/components/ProfileCard';
import type { Profile } from '@/types';

const exampleProfile: Profile = {
  photo: null,
  fullName: 'Jordan Avery',
  title: 'Senior Product Designer',
  bio: 'I design thoughtful, accessible interfaces for fintech and developer tools. 8 years turning complex problems into clean, human experiences.',
  location: 'Berlin, Germany',
  email: 'jordan@example.com',
  phone: '+49 30 1234 5678',
  skills: ['Product Design', 'Figma', 'Design Systems', 'User Research', 'Prototyping', 'Accessibility'],
  github: 'https://github.com/jordan-avery',
  linkedin: 'https://linkedin.com/in/jordan-avery',
  portfolio: 'https://jordanavery.design',
};

const features = [
  {
    icon: LayoutTemplate,
    title: 'Structured & polished',
    body: 'Present your photo, title, bio, skills, and links in a layout that looks crafted, not thrown together.',
  },
  {
    icon: Zap,
    title: 'Built in minutes',
    body: 'Fill in a single clean form and see a professional profile card assemble instantly — no coding needed.',
  },
  {
    icon: Share2,
    title: 'Ready to share',
    body: 'A polished preview you can present to recruiters, clients, or collaborators with confidence.',
  },
];

const steps = [
  { n: '01', title: 'Add your details', body: 'Fill in a simple form with your photo, title, bio, and skills.' },
  { n: '02', title: 'See it assemble', body: 'Watch a polished profile card come together as you type.' },
  { n: '03', title: 'Preview & refine', body: 'Review the finished profile and edit anytime with one click.' },
];

export default function HomePage() {
  const { navigate } = useRouter();
  const { hasProfile } = useProfile();

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-white">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 right-0 h-72 w-72 rounded-full bg-brand-100/60 blur-3xl" />
          <div className="absolute -bottom-32 left-1/4 h-72 w-72 rounded-full bg-slate-100 blur-3xl" />
        </div>

        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-8 lg:py-24">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
              <Sparkles className="h-3.5 w-3.5 text-brand-500" /> Your professional presence, crafted
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.1] text-slate-900 sm:text-5xl lg:text-6xl">
              Build a profile that<br className="hidden sm:block" /> opens doors.
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-slate-600">
              ProfileForge turns your photo, bio, skills, and links into a clean,
              professional digital profile — in minutes, not hours.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button onClick={() => navigate('create')} className="btn-primary text-base">
                {hasProfile ? 'Edit Your Profile' : 'Create Your Profile'}
                <ArrowRight className="h-4 w-4" />
              </button>
              <button onClick={() => navigate('preview')} className="btn-secondary text-base">
                See a Preview
              </button>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">
              {['No sign-up needed', 'Clean, professional layout', 'Edit anytime'].map((t) => (
                <li key={t} className="inline-flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-success-500" /> {t}
                </li>
              ))}
            </ul>
          </div>

          <div className="animate-fade-up [animation-delay:150ms]">
            <div className="relative mx-auto max-w-md lg:ml-auto">
              <div className="absolute -inset-3 rounded-3xl bg-slate-100/60 blur-xl" />
              <div className="relative rotate-1 transition-transform duration-500 hover:rotate-0">
                <ProfileCard profile={exampleProfile} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">Everything in one polished card</h2>
            <p className="mt-3 text-slate-600">
              No profiles scattered across tabs. ProfileForge brings your professional identity together.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-3 stagger">
            {features.map((f) => (
              <div key={f.title} className="card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <f.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-lg font-semibold text-slate-900">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">How it works</h2>
            <p className="mt-3 text-slate-600">Three simple steps to a profile you're proud to share.</p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {steps.map((s) => (
              <div key={s.n} className="relative rounded-xl border border-slate-200 bg-slate-50/60 p-6">
                <span className="text-sm font-bold text-brand-500">{s.n}</span>
                <h3 className="mt-2 text-lg font-semibold text-slate-900">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{s.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <button onClick={() => navigate('create')} className="btn-primary text-base">
              Start building <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
