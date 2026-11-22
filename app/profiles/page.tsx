'use client';

import LumiConversationAvatar from '@/components/LumiConversationAvatar';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, ShieldCheck } from 'lucide-react';
import { messages } from '@/packages/i18n';
import Brand from '@/components/Brand';
import LogoutButton from '@/components/LogoutButton';
import type { Family, Profile } from '@/types/database';

const profileColors = ['#eaf9bb', '#a8e6cf', '#d7c5f4', '#ffd79b', '#ffc9d6'];

function calculateAge(birthDate: string) {
  const today = new Date();
  const birth = new Date(`${birthDate}T12:00:00`);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDifference = today.getMonth() - birth.getMonth();
  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birth.getDate())) age -= 1;
  return Math.max(age, 0);
}

export default function ProfilesPage() {
  const router = useRouter();
  const [family, setFamily] = useState<Family | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);

  useEffect(() => {
    let cancelled = false;
    const loadFamily = async () => {
      try {
        const response = await fetch('/api/profiles', { cache: 'no-store' });
        if (!response.ok) return;
        const data = await response.json() as { family: Family; isDemo: boolean };
        // Signup stopped after step 1: finish it before choosing a profile.
        if (!data.isDemo && !data.family.profiles.some((profile) => profile.type === 'child')) {
          router.replace('/new-profile?mode=signup&type=child');
          return;
        }
        if (!cancelled) {
          setFamily(data.family);
          setIsDemo(data.isDemo);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void loadFamily();
    return () => { cancelled = true; };
  }, [router]);

  useEffect(() => {
    if (!selectedProfile) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timeout = window.setTimeout(() => {
      router.push(selectedProfile.type === 'adult' ? '/report' : `/profile/${selectedProfile.id}`);
      setSelectedProfile(null);
    }, reducedMotion ? 0 : 420);

    return () => window.clearTimeout(timeout);
  }, [router, selectedProfile]);

  if (loading) {
    return <LoadingProfiles />;
  }

  if (!family) {
    return (
      <section className="forest-screen profile-picker-screen">
        <div className="forest-overlay" />
        <div className="error-message">
          <p>Nenhuma família encontrada. Crie um perfil ou entre na sua conta.</p>
          <button className="button button-primary" onClick={() => router.push('/')}>Voltar ao início</button>
        </div>
      </section>
    );
  }

  return (
    <section className={`forest-screen profile-picker-screen${selectedProfile ? ' profile-is-selecting' : ''}`}>
      <div className="forest-overlay" />
      <header className="forest-header"><Brand size="medium" /></header>
      <LogoutButton className="is-on-forest" />
      <div className="profile-picker-heading">
        <h1>{messages.profiles.title}</h1>
        <p>{messages.profiles.subtitle}</p>
      </div>
      <div className="picker-lumi">
        <LumiConversationAvatar state="idle" idleOnly />
      </div>
      <div className="profile-shelf" aria-busy={Boolean(selectedProfile)}>
        <div className="profile-grid">
          {family.profiles.map((profile) => (
            <button
              key={profile.id}
              className={`profile-card${selectedProfile?.id === profile.id ? ' profile-card-selected' : ''}`}
              onClick={() => setSelectedProfile(profile)}
              aria-label={messages.accessibility.selectProfile(profile.firstName)}
              disabled={Boolean(selectedProfile)}
            >
              <span className="profile-avatar" style={{ backgroundColor: profileColors[profile.avatar % profileColors.length] }}>
                {profile.type === 'adult' ? <ShieldCheck size={36} /> : <span>{profile.firstName.slice(0, 1).toUpperCase()}</span>}
              </span>
              <strong>{profile.firstName}</strong>
              <small>{profile.type === 'adult' ? messages.profiles.adultArea : `${calculateAge(profile.birthDate)} anos`}</small>
            </button>
          ))}
          {!isDemo && (
            <button
              className="profile-card profile-add"
              onClick={() => router.push('/new-profile?mode=signup&type=child')}
              disabled={Boolean(selectedProfile)}
            >
              <span className="profile-avatar"><Plus size={36} /></span>
              <strong>{messages.profiles.addProfile}</strong>
            </button>
          )}
        </div>
      </div>

    </section>
  );
}

function LoadingProfiles() {
  return (
    <section className="forest-screen profile-picker-screen">
      <div className="forest-overlay" />
      <div className="loading-spinner"><div className="spinner" /><p>{messages.common.loading}</p></div>
    </section>
  );
}
