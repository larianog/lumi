'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check } from 'lucide-react';
import { useEffect, useState } from 'react';
import Brand from '@/components/Brand';
import { getLumiAvatar, LUMI_AVATARS, type LumiAvatarId } from '@/lib/lumi-avatars';
import { messages } from '@/packages/i18n';
import type { Profile } from '@/types/database';

/** Child profile tab: pick which Lumi avatar talks with the child. */
export default function LumiAvatarPickerClient({ profileId }: { profileId: string }) {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [selected, setSelected] = useState<LumiAvatarId | null>(null);
  const [saving, setSaving] = useState<LumiAvatarId | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void fetch(`/api/profiles?profileId=${encodeURIComponent(profileId)}`, { cache: 'no-store' })
      .then(async (response) => {
        if (response.status === 401) {
          router.replace('/');
          return;
        }
        if (!response.ok) throw new Error();
        const data = await response.json() as { profile: Profile };
        if (!cancelled) {
          setProfile(data.profile);
          setSelected(getLumiAvatar(data.profile.lumiAvatar).id);
        }
      })
      .catch(() => { if (!cancelled) setError(messages.avatars.loadError); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [profileId, router]);

  const choose = async (avatarId: LumiAvatarId) => {
    if (avatarId === selected || saving) return;
    setSaving(avatarId);
    setError('');
    setSaved(false);
    try {
      const response = await fetch('/api/profiles', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileId, lumiAvatar: avatarId }),
      });
      const data = await response.json().catch(() => ({})) as { error?: string };
      if (!response.ok) throw new Error(data.error ?? messages.avatars.saveError);
      setSelected(avatarId);
      setSaved(true);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : messages.avatars.saveError);
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return <section className="material-history-screen"><div className="loading-spinner"><div className="spinner" /><p>{messages.common.loading}</p></div></section>;
  }
  if (!profile) {
    return (
      <section className="material-history-screen">
        <div className="error-message">
          <p>{error || 'Perfil não encontrado.'}</p>
          <button className="button button-primary" onClick={() => router.push('/profiles')}>{messages.common.back}</button>
        </div>
      </section>
    );
  }

  return (
    <section className="material-history-screen avatar-picker-screen">
      <header className="activity-header">
        <button className="back-button" onClick={() => router.push(`/profile/${profileId}`)}><ArrowLeft size={19} />{messages.common.back}</button>
        <Brand size="small" />
        <span className="activity-header-profile">{profile.firstName}</span>
      </header>
      <main className="material-history-content">
        <span className="eyebrow">{profile.firstName}</span>
        <h1>{messages.avatars.title}</h1>
        <p>{messages.avatars.subtitle}</p>
        <div className="avatar-picker-grid" role="radiogroup" aria-label={messages.avatars.title}>
          {LUMI_AVATARS.map((avatar) => {
            const isSelected = avatar.id === selected;
            return (
              <button
                key={avatar.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                className={`avatar-picker-card${isSelected ? ' is-selected' : ''}`}
                onClick={() => void choose(avatar.id)}
                disabled={Boolean(saving)}
              >
                <span className="avatar-picker-art">
                  <Image src={avatar.image} alt="" width={300} height={328} />
                </span>
                <span className="avatar-picker-text">
                  <strong>{avatar.name}</strong>
                  <small>{avatar.description}</small>
                </span>
                <span className="avatar-picker-badge">
                  {isSelected ? <><Check size={16} />{messages.avatars.selected}</> : saving === avatar.id ? messages.common.loading : messages.avatars.choose}
                </span>
              </button>
            );
          })}
        </div>
        <p className="avatar-picker-feedback" role="status">
          {error ? <span className="form-error">{error}</span> : saved ? messages.avatars.saved : ''}
        </p>
        {saved && (
          <button className="button button-primary" onClick={() => router.push(`/profile/${profileId}`)}>{messages.avatars.talkNow}</button>
        )}
      </main>
    </section>
  );
}
