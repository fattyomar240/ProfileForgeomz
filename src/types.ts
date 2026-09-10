export type SocialLink = {
  label: string;
  url: string;
  icon: string;
};

export type Profile = {
  photo: string | null;
  fullName: string;
  title: string;
  bio: string;
  location: string;
  email: string;
  phone: string;
  skills: string[];
  github: string;
  linkedin: string;
  portfolio: string;
};

export const emptyProfile: Profile = {
  photo: null,
  fullName: '',
  title: '',
  bio: '',
  location: '',
  email: '',
  phone: '',
  skills: [],
  github: '',
  linkedin: '',
  portfolio: '',
};

export type ProfileErrors = Partial<Record<keyof Profile, string>>;

/** A row in the public.profiles table. */
export type ProfileRow = {
  id: string;
  full_name: string;
  title: string;
  bio: string;
  location: string;
  email: string;
  phone: string;
  photo_url: string | null;
  skills: string[];
  github_url: string;
  linkedin_url: string;
  portfolio_url: string;
  role: 'user' | 'admin';
  status: 'active' | 'disabled';
  created_at: string;
  last_seen_at: string;
};

export type UserRole = 'user' | 'admin';

export type AuthUser = {
  id: string;
  email: string;
};
