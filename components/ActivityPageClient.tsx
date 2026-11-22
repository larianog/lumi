'use client';

import LumiConversationAvatar from './LumiConversationAvatar';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, Mic, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import Brand from '@/components/Brand';
import LumiVoiceAgent from '@/components/LumiVoiceAgent';
import { getLumiAvatarMode } from '@/lib/lumi-avatars';
import { messages } from '@/packages/i18n';
import type { Profile } from '@/types/database';

type ActivityId = 'school' | 'games' | 'stories' | 'suggest';
type ActivityPageClientProps = { activityId: ActivityId; profileId: string };

function calculateAge(birthDate: string) {
  const today = new Date();
  const birth = new Date(`${birthDate}T12:00:00`);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDifference = today.getMonth() - birth.getMonth();
  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birth.getDate())) age -= 1;
  return Math.max(age, 0);
}

export default function ActivityPageClient({ activityId, profileId }: ActivityPageClientProps) {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [completed, setCompleted] = useState(false);
  const [theme, setTheme] = useState('');
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    let cancelled = false;
    const loadProfile = async () => {
      try {
        const response = await fetch(`/api/profiles?profileId=${encodeURIComponent(profileId)}`, { cache: 'no-store' });
        if (!response.ok) return;
        const data = await response.json() as { profile: Profile };
        if (!cancelled) setProfile(data.profile);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void loadProfile();
    return () => { cancelled = true; };
  }, [profileId]);

  const task = activityId === 'school'
    ? messages.activities.schoolTask
    : activityId === 'games'
      ? messages.activities.gamesTask
      : activityId === 'stories'
        ? messages.activities.storiesTask
        : messages.activities.suggestTask;
  const activity = messages.activities[activityId];

  const choose = (value: string) => {
    setAnswer(value);
    if ('correct' in task) setFeedback(value === task.correct ? 'correct' : 'incorrect');
  };

  const finish = async () => {
    if (!profile || completed) return;
    setSaveError('');
    const response = await fetch('/api/activities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profileId, activityId, activityTitle: activity.title }),
    });
    if (!response.ok) {
      setSaveError('Não foi possível salvar a atividade. Tente novamente.');
      return;
    }
    setCompleted(true);
  };

  if (loading) return <ActivityState message={messages.common.loading} />;
  if (!profile) return <ActivityState message="Perfil não encontrado." action={() => router.push('/profiles')} />;

  return (
    <section className="activity-screen">
      <header className="activity-header">
        <button className="back-button" onClick={() => router.push(`/profile/${profileId}`)}><ArrowLeft size={19} />{messages.common.back}</button>
        <Brand size="small" />
        <span className="activity-header-profile">{profile.firstName}</span>
      </header>
      <div className="activity-stage">
        <div className="task-card">
          <span className="eyebrow">{task.eyebrow}</span>
          <h1>{task.title}</h1>
          <p>{task.body}</p>
          {activityId === 'games' && (
            <div className="pattern-row" aria-hidden="true">
              <span className="shape circle" /><span className="shape triangle" /><span className="shape square" /><span className="shape circle" /><span className="shape question">?</span>
            </div>
          )}
          {'answers' in task ? (
            <div className="answer-grid" aria-label={messages.activities.chooseAnswer}>
              {task.answers.map((option) => (
                <button key={option} className={`answer-button ${answer === option ? 'selected' : ''}`} onClick={() => choose(option)}>{option}</button>
              ))}
            </div>
          ) : (
            <textarea value={theme} onChange={(event) => setTheme(event.target.value)} placeholder={task.placeholder} rows={4} />
          )}
          {feedback && <div className={`feedback ${feedback}`}><CheckCircle2 size={22} />{feedback === 'correct' ? messages.activities.correct : messages.activities.tryAgain}</div>}
          {completed && <div className="completion-banner"><Sparkles size={25} /><div><strong>{messages.activities.completed}</strong><span>{messages.activities.completedDescription}</span></div></div>}
          {saveError && <p className="form-error" role="alert">{saveError}</p>}
          <div className="task-actions">
            <button className="button button-secondary" onClick={() => setVoiceOpen(true)}><Mic size={19} />{messages.activities.askHint}</button>
            <button className="button button-primary" onClick={finish} disabled={completed || (activityId === 'suggest' ? !theme.trim() : feedback !== 'correct')}>{completed ? 'Concluída' : messages.common.finish}</button>
          </div>
        </div>
        <aside className="task-lumi">
          <div className="task-lumi-label">{activity.title}</div>
          {!voiceOpen && <LumiConversationAvatar state="idle" idleOnly />}
        </aside>
      </div>
      {voiceOpen && <LumiVoiceAgent profileName={profile.firstName} age={calculateAge(profile.birthDate)} activityTitle={activity.title} lumiAvatar={profile.lumiAvatar} avatarMode={getLumiAvatarMode(profile.lumiAvatar)} onClose={() => setVoiceOpen(false)} />}
    </section>
  );
}

function ActivityState({ message, action }: { message: string; action?: () => void }) {
  return (
    <section className="activity-screen">
      <div className={action ? 'error-message' : 'loading-spinner'}>
        {!action && <div className="spinner" />}
        <p>{message}</p>
        {action && <button className="button button-primary" onClick={action}>Voltar para perfis</button>}
      </div>
    </section>
  );
}
