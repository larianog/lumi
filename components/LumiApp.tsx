'use client';

import Image from 'next/image';
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Flame,
  Gamepad2,
  Library,
  LockKeyhole,
  LogIn,
  Mic,
  Plus,
  ShieldCheck,
  Sparkles,
  Star,
  UserPlus,
  WandSparkles,
} from 'lucide-react';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { messages } from '@/packages/i18n';
import LumiVoiceAgent from './LumiVoiceAgent';

type Screen = 'welcome' | 'profile-form' | 'profile-picker' | 'home' | 'activity' | 'report';
type ProfileType = 'adult' | 'child';
type ActivityId = 'school' | 'games' | 'stories' | 'suggest';

type Profile = {
  id: string;
  type: ProfileType;
  firstName: string;
  lastName: string;
  birthDate: string;
  avatar: number;
};

type Family = {
  phone: string;
  password: string;
  profiles: Profile[];
};

type Completion = {
  id: string;
  profileId: string;
  activityId: ActivityId;
  activityTitle: string;
  completedAt: string;
};

type ProfileForm = {
  type: ProfileType;
  firstName: string;
  lastName: string;
  phone: string;
  password: string;
  birthDate: string;
};

const FAMILY_STORAGE_KEY = 'lumi.family.v1';
const COMPLETIONS_STORAGE_KEY = 'lumi.completions.v1';

const emptyForm: ProfileForm = {
  type: 'adult',
  firstName: '',
  lastName: '',
  phone: '',
  password: '',
  birthDate: '',
};

const demoFamily: Family = {
  phone: '(11) 99999-2026',
  password: 'lumi123',
  profiles: [
    { id: 'demo-adult', type: 'adult', firstName: 'Marina', lastName: 'Silva', birthDate: '1991-04-18', avatar: 0 },
    { id: 'demo-lia', type: 'child', firstName: 'Lia', lastName: 'Silva', birthDate: '2018-08-12', avatar: 1 },
    { id: 'demo-caio', type: 'child', firstName: 'Caio', lastName: 'Silva', birthDate: '2016-03-03', avatar: 2 },
  ],
};

const activities: Array<{ id: ActivityId; icon: typeof BookOpen; accent: string }> = [
  { id: 'school', icon: BookOpen, accent: 'mint' },
  { id: 'games', icon: Gamepad2, accent: 'violet' },
  { id: 'stories', icon: Library, accent: 'sun' },
  { id: 'suggest', icon: WandSparkles, accent: 'rose' },
];

const profileColors = ['#eaf9bb', '#a8e6cf', '#d7c5f4', '#ffd79b', '#ffc9d6'];

function calculateAge(birthDate: string) {
  const today = new Date();
  const birth = new Date(`${birthDate}T12:00:00`);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDifference = today.getMonth() - birth.getMonth();
  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birth.getDate())) age -= 1;
  return Math.max(age, 0);
}

function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export default function LumiApp() {
  const [screen, setScreen] = useState<Screen>('welcome');
  const [authMode, setAuthMode] = useState<'signup' | 'signin'>('signup');
  const [family, setFamily] = useState<Family | null>(null);
  const [form, setForm] = useState<ProfileForm>(emptyForm);
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<ActivityId>('school');
  const [completions, setCompletions] = useState<Completion[]>([]);
  const [isDemo, setIsDemo] = useState(false);
  const [formError, setFormError] = useState('');
  const [adultPasswordOpen, setAdultPasswordOpen] = useState(false);
  const [adultPassword, setAdultPassword] = useState('');
  const [adultPasswordError, setAdultPasswordError] = useState('');

  useEffect(() => {
    setFamily(safeParse<Family | null>(window.localStorage.getItem(FAMILY_STORAGE_KEY), null));
    setCompletions(safeParse<Completion[]>(window.localStorage.getItem(COMPLETIONS_STORAGE_KEY), []));
  }, []);

  useEffect(() => {
    window.localStorage.setItem(COMPLETIONS_STORAGE_KEY, JSON.stringify(completions));
  }, [completions]);

  const activeProfile = family?.profiles.find((profile) => profile.id === activeProfileId) ?? null;
  const childProfiles = family?.profiles.filter((profile) => profile.type === 'child') ?? [];
  const adultProfile = family?.profiles.find((profile) => profile.type === 'adult') ?? null;

  const openSignup = (type: ProfileType = 'adult') => {
    setAuthMode('signup');
    setForm({
      ...emptyForm,
      type,
      phone: family?.phone ?? '',
      password: family?.password ?? '',
    });
    setFormError('');
    setScreen('profile-form');
  };

  const openSignIn = () => {
    setAuthMode('signin');
    setForm(emptyForm);
    setFormError('');
    setScreen('profile-form');
  };

  const enterDemo = () => {
    setFamily(demoFamily);
    setIsDemo(true);
    setScreen('profile-picker');
  };

  const submitProfile = (event: FormEvent) => {
    event.preventDefault();
    setFormError('');

    if (authMode === 'signin') {
      const storedFamily = safeParse<Family | null>(window.localStorage.getItem(FAMILY_STORAGE_KEY), null);
      if (!storedFamily || storedFamily.phone !== form.phone || storedFamily.password !== form.password) {
        setFormError(messages.auth.invalidLogin);
        return;
      }
      setFamily(storedFamily);
      setIsDemo(false);
      setScreen('profile-picker');
      return;
    }

    if (!form.firstName || !form.lastName || !form.phone || !form.password || !form.birthDate) {
      setFormError(messages.auth.required);
      return;
    }

    const newProfile: Profile = {
      id: crypto.randomUUID(),
      type: form.type,
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      birthDate: form.birthDate,
      avatar: family?.profiles.length ?? 0,
    };
    const nextFamily: Family = family
      ? { ...family, profiles: [...family.profiles, newProfile] }
      : { phone: form.phone, password: form.password, profiles: [newProfile] };

    setFamily(nextFamily);
    setIsDemo(false);
    window.localStorage.setItem(FAMILY_STORAGE_KEY, JSON.stringify(nextFamily));
    setScreen('profile-picker');
  };

  const selectProfile = (profile: Profile) => {
    if (profile.type === 'adult') {
      setAdultPasswordOpen(true);
      setAdultPassword('');
      setAdultPasswordError('');
      return;
    }
    setActiveProfileId(profile.id);
    setScreen('home');
  };

  const openAdultArea = (event: FormEvent) => {
    event.preventDefault();
    if (adultPassword !== family?.password) {
      setAdultPasswordError(messages.profiles.passwordError);
      return;
    }
    setAdultPasswordOpen(false);
    setScreen('report');
  };

  const completeActivity = (activityId: ActivityId) => {
    if (!activeProfile) return;
    const activityTitle = messages.activities[activityId].title;
    setCompletions((current) => [
      {
        id: crypto.randomUUID(),
        profileId: activeProfile.id,
        activityId,
        activityTitle,
        completedAt: new Date().toISOString(),
      },
      ...current,
    ]);
  };

  return (
    <main className="lumi-app">
      {screen === 'welcome' && (
        <WelcomeScreen onSignup={() => openSignup()} onSignIn={openSignIn} onDemo={enterDemo} />
      )}
      {screen === 'profile-form' && (
        <ProfileFormScreen
          authMode={authMode}
          form={form}
          error={formError}
          onChange={setForm}
          onSubmit={submitProfile}
          onBack={() => setScreen(family ? 'profile-picker' : 'welcome')}
        />
      )}
      {screen === 'profile-picker' && family && (
        <ProfilePicker
          profiles={family.profiles}
          onSelect={selectProfile}
          onAdd={() => openSignup('child')}
        />
      )}
      {screen === 'home' && activeProfile && (
        <HomeScreen
          profile={activeProfile}
          onSwitchProfile={() => setScreen('profile-picker')}
          onActivity={(activityId) => {
            setSelectedActivity(activityId);
            setScreen('activity');
          }}
        />
      )}
      {screen === 'activity' && activeProfile && (
        <ActivityScreen
          activityId={selectedActivity}
          profile={activeProfile}
          onBack={() => setScreen('home')}
          onComplete={() => completeActivity(selectedActivity)}
        />
      )}
      {screen === 'report' && family && (
        <ReportScreen
          adultName={adultProfile?.firstName ?? messages.auth.adult}
          children={childProfiles}
          completions={completions}
          onBack={() => setScreen('profile-picker')}
          onAddChild={() => openSignup('child')}
        />
      )}

      {adultPasswordOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setAdultPasswordOpen(false)}>
          <form className="password-modal" onSubmit={openAdultArea} onMouseDown={(event) => event.stopPropagation()}>
            <div className="modal-icon"><LockKeyhole size={24} /></div>
            <h2>{messages.profiles.passwordTitle}</h2>
            <p>{messages.profiles.passwordDescription}</p>
            <label>
              <span>{messages.profiles.passwordLabel}</span>
              <input
                type="password"
                value={adultPassword}
                onChange={(event) => setAdultPassword(event.target.value)}
                autoFocus
              />
            </label>
            {isDemo && <small>{messages.profiles.demoPassword}</small>}
            {adultPasswordError && <p className="form-error">{adultPasswordError}</p>}
            <div className="modal-actions">
              <button type="button" className="button button-ghost" onClick={() => setAdultPasswordOpen(false)}>{messages.common.cancel}</button>
              <button type="submit" className="button button-primary">{messages.common.continue}</button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}

function Brand() {
  return (
    <div className="brand" aria-label={messages.brand.name}>
      <Sparkles aria-hidden="true" size={19} />
      <span>{messages.brand.name}</span>
    </div>
  );
}

function WelcomeScreen({ onSignup, onSignIn, onDemo }: { onSignup: () => void; onSignIn: () => void; onDemo: () => void }) {
  return (
    <section className="welcome-screen">
      <div className="welcome-copy">
        <Brand />
        <span className="eyebrow">{messages.welcome.eyebrow}</span>
        <h1>{messages.welcome.title}</h1>
        <p>{messages.welcome.description}</p>
        <div className="welcome-actions">
          <button className="button button-primary button-large" onClick={onSignup}><UserPlus size={20} />{messages.welcome.signUp}</button>
          <button className="button button-secondary button-large" onClick={onSignIn}><LogIn size={20} />{messages.welcome.signIn}</button>
          <button className="demo-link" onClick={onDemo}><Sparkles size={17} />{messages.welcome.demo}<span>{messages.welcome.demoHint}</span></button>
        </div>
      </div>
      <div className="welcome-art" aria-hidden="true">
        <div className="welcome-orbit orbit-one" />
        <div className="welcome-orbit orbit-two" />
        <Image src="/assets/lumi-avatar.png" alt="" width={650} height={710} priority />
        <div className="floating-card card-top"><Star size={20} fill="currentColor" />+20</div>
        <div className="floating-card card-bottom"><BookOpen size={20} />Nova descoberta!</div>
      </div>
    </section>
  );
}

function ProfileFormScreen({ authMode, form, error, onChange, onSubmit, onBack }: {
  authMode: 'signup' | 'signin';
  form: ProfileForm;
  error: string;
  onChange: (form: ProfileForm) => void;
  onSubmit: (event: FormEvent) => void;
  onBack: () => void;
}) {
  const update = <K extends keyof ProfileForm>(key: K, value: ProfileForm[K]) => onChange({ ...form, [key]: value });
  return (
    <section className="form-screen">
      <div className="form-forest" />
      <div className="form-shell">
        <button className="back-button" onClick={onBack}><ArrowLeft size={19} />{messages.common.back}</button>
        <div className="profile-form-card">
          <Brand />
          <h1>{authMode === 'signin' ? messages.auth.signInTitle : messages.auth.createTitle}</h1>
          <p>{messages.auth.subtitle}</p>
          <form onSubmit={onSubmit}>
            {authMode === 'signup' && (
              <>
                <label className="form-field">
                  <span>{messages.auth.type}</span>
                  <select value={form.type} onChange={(event) => update('type', event.target.value as ProfileType)}>
                    <option value="adult">{messages.auth.adult}</option>
                    <option value="child">{messages.auth.child}</option>
                  </select>
                </label>
                <div className="field-row">
                  <label className="form-field"><span>{messages.auth.firstName}</span><input value={form.firstName} onChange={(event) => update('firstName', event.target.value)} autoComplete="given-name" /></label>
                  <label className="form-field"><span>{messages.auth.lastName}</span><input value={form.lastName} onChange={(event) => update('lastName', event.target.value)} autoComplete="family-name" /></label>
                </div>
              </>
            )}
            <label className="form-field"><span>{messages.auth.phone}</span><input type="tel" value={form.phone} onChange={(event) => update('phone', event.target.value)} autoComplete="tel" /></label>
            <label className="form-field"><span>{messages.auth.password}</span><input type="password" value={form.password} onChange={(event) => update('password', event.target.value)} autoComplete={authMode === 'signin' ? 'current-password' : 'new-password'} /></label>
            {authMode === 'signup' && (
              <label className="form-field"><span>{messages.auth.birthDate}</span><input type="date" value={form.birthDate} onChange={(event) => update('birthDate', event.target.value)} /><small>{messages.auth.birthDateHint}</small></label>
            )}
            {error && <p className="form-error">{error}</p>}
            <button type="submit" className="button button-primary button-large form-submit">{authMode === 'signin' ? messages.auth.submitSignIn : messages.auth.submitCreate}</button>
          </form>
        </div>
      </div>
    </section>
  );
}

function ProfilePicker({ profiles, onSelect, onAdd }: { profiles: Profile[]; onSelect: (profile: Profile) => void; onAdd: () => void }) {
  return (
    <section className="forest-screen profile-picker-screen">
      <div className="forest-overlay" />
      <header className="forest-header"><Brand /></header>
      <div className="picker-layout">
        <div className="picker-lumi">
          <Image src="/assets/lumi-avatar.png" alt={messages.accessibility.lumiMascot} width={420} height={460} priority />
          <div className="speech-bubble">{messages.profiles.title}</div>
        </div>
        <div className="profile-picker-content">
          <h1>{messages.profiles.title}</h1>
          <p>{messages.profiles.subtitle}</p>
          <div className="profile-grid">
            {profiles.map((profile) => (
              <button key={profile.id} className="profile-card" onClick={() => onSelect(profile)} aria-label={messages.accessibility.selectProfile(profile.firstName)}>
                <span className="profile-avatar" style={{ backgroundColor: profileColors[profile.avatar % profileColors.length] }}>
                  {profile.type === 'adult' ? <ShieldCheck size={36} /> : <span>{profile.firstName.slice(0, 1).toUpperCase()}</span>}
                </span>
                <strong>{profile.firstName}</strong>
                <small>{profile.type === 'adult' ? messages.profiles.adultArea : `${calculateAge(profile.birthDate)} anos`}</small>
              </button>
            ))}
            <button className="profile-card profile-add" onClick={onAdd}>
              <span className="profile-avatar"><Plus size={36} /></span>
              <strong>{messages.profiles.addProfile}</strong>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function HomeScreen({ profile, onSwitchProfile, onActivity }: { profile: Profile; onSwitchProfile: () => void; onActivity: (id: ActivityId) => void }) {
  return (
    <section className="forest-screen home-screen">
      <div className="forest-overlay forest-overlay-home" />
      <header className="home-header">
        <Brand />
        <div className="home-stats"><span><Flame size={18} />{messages.home.streak}</span><span><Star size={18} fill="currentColor" />{messages.home.stars}</span></div>
        <button className="mini-profile" onClick={onSwitchProfile}><span>{profile.firstName.slice(0, 1)}</span>{messages.home.switchProfile}</button>
      </header>
      <div className="home-layout">
        <aside className="home-lumi">
          <div className="lumi-halo" />
          <Image src="/assets/lumi-avatar.png" alt={messages.accessibility.lumiMascot} width={480} height={520} priority />
          <button className="button voice-cta" onClick={() => onActivity('suggest')}><Mic size={20} />{messages.home.talkToLumi}</button>
        </aside>
        <div className="activity-menu">
          <span className="eyebrow">{messages.home.greeting(profile.firstName)}</span>
          <h1>{messages.home.prompt}</h1>
          <div className="activity-grid">
            {activities.map(({ id, icon: Icon, accent }) => {
              const copy = messages.activities[id];
              return (
                <button key={id} className={`activity-card accent-${accent}`} onClick={() => onActivity(id)}>
                  <span className="activity-icon"><Icon size={29} /></span>
                  <span className="activity-copy"><strong>{copy.title}</strong><small>{copy.description}</small></span>
                  <span className="activity-badge">{copy.badge}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function ActivityScreen({ activityId, profile, onBack, onComplete }: { activityId: ActivityId; profile: Profile; onBack: () => void; onComplete: () => void }) {
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [completed, setCompleted] = useState(false);
  const [theme, setTheme] = useState('');
  const [voiceOpen, setVoiceOpen] = useState(false);
  const task = activityId === 'school' ? messages.activities.schoolTask : activityId === 'games' ? messages.activities.gamesTask : activityId === 'stories' ? messages.activities.storiesTask : messages.activities.suggestTask;
  const activity = messages.activities[activityId];

  const choose = (value: string) => {
    setAnswer(value);
    if ('correct' in task) setFeedback(value === task.correct ? 'correct' : 'incorrect');
  };

  const finish = () => {
    if (!completed) onComplete();
    setCompleted(true);
  };

  return (
    <section className="activity-screen">
      <header className="activity-header"><button className="back-button" onClick={onBack}><ArrowLeft size={19} />{messages.common.back}</button><Brand /><span className="activity-header-profile">{profile.firstName}</span></header>
      <div className="activity-stage">
        <div className="task-card">
          <span className="eyebrow">{task.eyebrow}</span>
          <h1>{task.title}</h1>
          <p>{task.body}</p>
          {activityId === 'games' && <div className="pattern-row" aria-hidden="true"><span className="shape circle" /><span className="shape triangle" /><span className="shape square" /><span className="shape circle" /><span className="shape question">?</span></div>}
          {'answers' in task ? (
            <div className="answer-grid" aria-label={messages.activities.chooseAnswer}>
              {task.answers.map((option) => <button key={option} className={`answer-button ${answer === option ? 'selected' : ''}`} onClick={() => choose(option)}>{option}</button>)}
            </div>
          ) : (
            <textarea value={theme} onChange={(event) => setTheme(event.target.value)} placeholder={task.placeholder} rows={4} />
          )}
          {feedback && <div className={`feedback ${feedback}`}><CheckCircle2 size={22} />{feedback === 'correct' ? messages.activities.correct : messages.activities.tryAgain}</div>}
          {completed && <div className="completion-banner"><Sparkles size={25} /><div><strong>{messages.activities.completed}</strong><span>{messages.activities.completedDescription}</span></div></div>}
          <div className="task-actions">
            <button className="button button-secondary" onClick={() => setVoiceOpen(true)}><Mic size={19} />{messages.activities.askHint}</button>
            <button className="button button-primary" onClick={finish} disabled={activityId === 'suggest' ? !theme.trim() : feedback !== 'correct'}>{messages.common.finish}</button>
          </div>
        </div>
        <aside className="task-lumi">
          <div className="task-lumi-label">{activity.title}</div>
          <Image src="/assets/lumi-avatar.png" alt={messages.accessibility.lumiMascot} width={390} height={425} />
        </aside>
      </div>
      {voiceOpen && (
        <LumiVoiceAgent
          profileName={profile.firstName}
          age={calculateAge(profile.birthDate)}
          activityTitle={activity.title}
          onClose={() => setVoiceOpen(false)}
        />
      )}
    </section>
  );
}

function ReportScreen({ adultName, children, completions, onBack, onAddChild }: { adultName: string; children: Profile[]; completions: Completion[]; onBack: () => void; onAddChild: () => void }) {
  const [selectedChildId, setSelectedChildId] = useState(children[0]?.id ?? '');
  const selectedChild = children.find((child) => child.id === selectedChildId);
  const childCompletions = useMemo(() => completions.filter((completion) => completion.profileId === selectedChildId), [completions, selectedChildId]);
  return (
    <section className="report-screen">
      <header className="report-header"><button className="back-button" onClick={onBack}><ArrowLeft size={19} />{messages.common.back}</button><Brand /><span>{adultName}</span></header>
      <div className="report-layout">
        <aside className="report-sidebar">
          <span className="eyebrow">{messages.profiles.adultArea}</span>
          <h1>{messages.report.title}</h1>
          <p>{messages.report.subtitle}</p>
          <div className="child-tabs">
            {children.map((child) => <button key={child.id} className={selectedChildId === child.id ? 'active' : ''} onClick={() => setSelectedChildId(child.id)}><span style={{ background: profileColors[child.avatar % profileColors.length] }}>{child.firstName.slice(0, 1)}</span>{child.firstName}</button>)}
          </div>
          <button className="button button-secondary" onClick={onAddChild}><Plus size={18} />{messages.report.addChild}</button>
        </aside>
        <div className="report-content">
          <div className="report-hero">
            <div><span className="eyebrow">{selectedChild?.firstName}</span><strong>{childCompletions.length}</strong><p>{messages.report.completed}</p></div>
            <Image src="/assets/lumi-avatar.png" alt="" width={180} height={200} />
          </div>
          <h2>{messages.report.recent}</h2>
          <div className="history-list">
            {childCompletions.length === 0 ? <div className="history-empty"><CalendarDays size={28} /><p>{messages.report.empty}</p></div> : childCompletions.map((completion) => (
              <div className="history-item" key={completion.id}><span className="history-icon"><CheckCircle2 size={22} /></span><div><strong>{completion.activityTitle}</strong><small>{messages.report.today}</small></div><Star size={19} fill="currentColor" /></div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
