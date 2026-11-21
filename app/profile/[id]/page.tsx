'use client';

import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { BookOpen, Flame, Gamepad2, Library, Mic, Star, WandSparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import Brand from '@/components/Brand';
import LumiVoiceAgent from '@/components/LumiVoiceAgent';
import { messages } from '@/packages/i18n';
import type { ActivityCompletion, Profile } from '@/types/database';

type ActivityId = 'school' | 'games' | 'stories' | 'suggest';

const activities: Array<{ id: ActivityId; icon: typeof BookOpen; accent: string }> = [
  { id: 'school', icon: BookOpen, accent: 'mint' },
  { id: 'games', icon: Gamepad2, accent: 'violet' },
  { id: 'stories', icon: Library, accent: 'sun' },
  { id: 'suggest', icon: WandSparkles, accent: 'rose' },
];

function calculateAge(birthDate: string) {
  const today = new Date();
  const birth = new Date(`${birthDate}T12:00:00`);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDifference = today.getMonth() - birth.getMonth();
  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birth.getDate())) age -= 1;
  return Math.max(age, 0);
}

export default function ProfilePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const profileId = params.id;
  const [profile, setProfile] = useState<Profile | null>(null);
  const [completions, setCompletions] = useState<ActivityCompletion[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<ActivityId>('school');
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const loadData = async () => {
      try {
        const [profileResponse, completionsResponse] = await Promise.all([
          fetch(`/api/profiles?profileId=${encodeURIComponent(profileId)}`, { cache: 'no-store' }),
          fetch(`/api/activities?profileId=${encodeURIComponent(profileId)}`, { cache: 'no-store' }),
        ]);
        if (!profileResponse.ok) return;
        const profileData = await profileResponse.json() as { profile: Profile };
        const completionData = completionsResponse.ok
          ? await completionsResponse.json() as ActivityCompletion[]
          : [];
        if (!cancelled) {
          setProfile(profileData.profile);
          setCompletions(completionData);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void loadData();
    return () => { cancelled = true; };
  }, [profileId]);

  const openActivity = (activityId: ActivityId) => {
    setSelectedActivity(activityId);
    router.push(`/activity/${activityId}?profileId=${encodeURIComponent(profileId)}`);
  };

  if (loading) return <PageState message={messages.common.loading} />;
  if (!profile) return <PageState message="Perfil não encontrado." action={() => router.push('/profiles')} />;

  const streakCount = Math.min(Math.max(completions.length, 2), 30);
  const starCount = completions.length * 10;

  return (
    <section className="forest-screen home-screen">
      <div className="forest-overlay forest-overlay-home" />
      <header className="home-header">
        <Brand size="medium" />
        <div className="home-stats">
          <span><Flame size={18} />{streakCount} dias explorando</span>
          <span><Star size={18} fill="currentColor" />{starCount} estrelas</span>
        </div>
        <button className="mini-profile" onClick={() => router.push('/profiles')}>
          <span>{profile.firstName.slice(0, 1)}</span>{messages.home.switchProfile}
        </button>
      </header>
      <div className="home-layout">
        <aside className="home-lumi">
          <div className="lumi-halo" />
          <Image src="/assets/lumi-avatar.png" alt={messages.accessibility.lumiMascot} width={480} height={520} priority />
          <button className="button voice-cta" onClick={() => setVoiceOpen(true)}>
            <Mic size={20} />{messages.home.talkToLumi}
          </button>
        </aside>
        <div className="activity-menu">
          <span className="eyebrow">{messages.home.greeting(profile.firstName)}</span>
          <h1>{messages.home.prompt}</h1>
          <div className="activity-grid">
            {activities.map(({ id, icon: Icon, accent }) => {
              const copy = messages.activities[id];
              return (
                <button key={id} className={`activity-card accent-${accent}`} onClick={() => openActivity(id)}>
                  <span className="activity-icon"><Icon size={29} /></span>
                  <span className="activity-copy"><strong>{copy.title}</strong><small>{copy.description}</small></span>
                  <span className="activity-badge">{copy.badge}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {voiceOpen && (
        <LumiVoiceAgent
          profileName={profile.firstName}
          age={calculateAge(profile.birthDate)}
          activityTitle={messages.activities[selectedActivity].title}
          onClose={() => setVoiceOpen(false)}
        />
      )}
    </section>
  );
}

function PageState({ message, action }: { message: string; action?: () => void }) {
  return (
    <section className="forest-screen home-screen">
      <div className="forest-overlay forest-overlay-home" />
      <div className={action ? 'error-message' : 'loading-spinner'}>
        {!action && <div className="spinner" />}
        <p>{message}</p>
        {action && <button className="button button-primary" onClick={action}>Voltar para perfis</button>}
      </div>
    </section>
  );
}
