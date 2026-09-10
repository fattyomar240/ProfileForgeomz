import {
  createContext,
  useContext,
  useState,
  useMemo,
  useEffect,
  type ReactNode,
} from 'react';
import { emptyProfile, type Profile, type ProfileRow } from '@/types';
import { useAuth } from '@/context/AuthContext';

type ProfileContextValue = {
  profile: Profile;
  setProfile: (updater: Profile | ((prev: Profile) => Profile)) => void;
  resetProfile: () => void;
  hasProfile: boolean;
};

const ProfileContext = createContext<ProfileContextValue | null>(null);

function rowToProfile(row: ProfileRow): Profile {
  return {
    photo: row.photo_url || null,
    fullName: row.full_name || '',
    title: row.title || '',
    bio: row.bio || '',
    location: row.location || '',
    email: row.email || '',
    phone: row.phone || '',
    skills: row.skills || [],
    github: row.github_url || '',
    linkedin: row.linkedin_url || '',
    portfolio: row.portfolio_url || '',
  };
}

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { profile: dbProfile } = useAuth();
  const [formProfile, setFormProfile] = useState<Profile>(emptyProfile);
  const [syncedFromDb, setSyncedFromDb] = useState(false);

  // When a DB profile loads (user is logged in), sync it into the form state
  // so the Create and Preview pages show real data.
  useEffect(() => {
    if (dbProfile && !syncedFromDb) {
      setFormProfile(rowToProfile(dbProfile));
      setSyncedFromDb(true);
    }
    if (!dbProfile && syncedFromDb) {
      setFormProfile(emptyProfile);
      setSyncedFromDb(false);
    }
  }, [dbProfile, syncedFromDb]);

  const setProfile = (updater: Profile | ((prev: Profile) => Profile)) => {
    setFormProfile((prev) =>
      typeof updater === 'function' ? (updater as (p: Profile) => Profile)(prev) : updater
    );
  };

  const resetProfile = () => {
    setFormProfile(emptyProfile);
    setSyncedFromDb(false);
  };

  const hasProfile = formProfile.fullName.trim() !== '';

  const value = useMemo<ProfileContextValue>(
    () => ({ profile: formProfile, setProfile, resetProfile, hasProfile }),
    [formProfile, hasProfile]
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used within ProfileProvider');
  return ctx;
}
