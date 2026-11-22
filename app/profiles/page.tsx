'use client';

import LumiConversationAvatar from '@/components/LumiConversationAvatar';
import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Plus, ShieldCheck } from 'lucide-react';
import { messages } from '@/packages/i18n';
import Brand from '@/components/Brand';
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
  const [adultPasswordOpen, setAdultPasswordOpen] = useState(false);
  const [adultPassword, setAdultPassword] = useState('');
  const [adultPasswordError, setAdultPasswordError] = useState('');
  const [showAdultPassword, setShowAdultPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);

  useEffect(() => {
    let cancelled = false;
    const loadFamily = async () => {
      try {
        const response = await fetch('/api/profiles', { cache: 'no-store' });
        if (!response.ok) return;
        const data = await response.json() as { family: Family; isDemo: boolean };
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
  }, []);

  useEffect(() => {
    if (!selectedProfile) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timeout = window.setTimeout(() => {
      if (selectedProfile.type === 'adult') {
        setAdultPassword('');
        setAdultPasswordError('');
        setShowAdultPassword(false);
        setAdultPasswordOpen(true);
      } else {
        router.push(`/profile/${selectedProfile.id}`);
      }
      setSelectedProfile(null);
    }, reducedMotion ? 0 : 420);

    return () => window.clearTimeout(timeout);
  }, [router, selectedProfile]);

  const openAdultArea = async (event: FormEvent) => {
    event.preventDefault();
    setAdultPasswordError('');
    const response = await fetch('/api/adult-access', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: adultPassword }),
    });
    if (!response.ok) {
      setAdultPasswordError(messages.profiles.passwordError);
      return;
    }
    router.push('/report');
  };

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
      <div className="profile-picker-heading">
        <h1>{messages.profiles.title}</h1>
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

      {adultPasswordOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setAdultPasswordOpen(false)}>
          <form className="password-modal" onSubmit={openAdultArea} onMouseDown={(event) => event.stopPropagation()}>
            <div className="modal-icon"><ShieldCheck size={24} /></div>
            <h2>{messages.profiles.passwordTitle}</h2>
            <label>
              <span>{messages.profiles.passwordLabel}</span>
              <div className="password-input-wrapper">
                <input
                  type={showAdultPassword ? 'text' : 'password'}
                  value={adultPassword}
                  onChange={(event) => setAdultPassword(event.target.value)}
                  autoComplete="current-password"
                  autoFocus
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowAdultPassword((visible) => !visible)}
                  aria-label={showAdultPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showAdultPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>
            </label>
            {isDemo && <small>{messages.profiles.demoPassword}</small>}
            {adultPasswordError && <p className="form-error" role="alert">{adultPasswordError}</p>}
            <div className="modal-actions">
              <button type="button" className="button button-ghost" onClick={() => setAdultPasswordOpen(false)}>{messages.common.cancel}</button>
              <button type="submit" className="button button-primary">{messages.common.continue}</button>
            </div>
          </form>
        </div>
      )}
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
