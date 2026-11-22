'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { BookOpen, LoaderCircle, LogIn, Sparkles, Star, UserPlus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { messages } from '@/packages/i18n';
import Brand from './Brand';
import LumiConversationAvatar from './LumiConversationAvatar';

export default function LumiApp() {
  const router = useRouter();
  const [demoLoading, setDemoLoading] = useState(false);
  const [demoError, setDemoError] = useState('');
  const [forestReady, setForestReady] = useState(false);
  const [mascotReady, setMascotReady] = useState(false);
  const [introFinished, setIntroFinished] = useState(false);
  const artworkReady = forestReady && mascotReady;

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // Bound the wait so stalled artwork cannot block the welcome actions.
    const timeout = window.setTimeout(() => setIntroFinished(true), reducedMotion ? 0 : 4500);
    return () => window.clearTimeout(timeout);
  }, []);

  const enterDemo = async () => {
    setDemoLoading(true);
    setDemoError('');

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ demo: true }),
      });

      if (!response.ok) throw new Error('Demo login failed');
      router.push('/profiles');
    } catch {
      setDemoError('Não foi possível abrir a demo agora. Tente novamente.');
      setDemoLoading(false);
    }
  };

  return (
    <main className="lumi-app">
      <section className="welcome-screen" data-intro={!introFinished || undefined}>
        <div className="welcome-art">
          <Image
            className="welcome-forest"
            src="/assets/forest-learning-bg.png"
            alt=""
            fill
            loading="eager"
            fetchPriority="high"
            data-ready={forestReady}
            onLoad={() => setForestReady(true)}
            onError={() => setForestReady(true)}
          />
          <div className="welcome-orbit orbit-one" />
          <div className="welcome-orbit orbit-two" />
          <div className="welcome-mascot">
            <LumiConversationAvatar state="idle" idleOnly
              entranceReady={artworkReady}
              onVisualReady={() => setMascotReady(true)}
              onAnimationEnd={() => setIntroFinished(true)}
            />
            <div className="floating-card star-card"><Star size={20} fill="currentColor" />+20</div>
            <div className="floating-card discovery-card"><BookOpen size={20} />Nova descoberta!</div>
          </div>
        </div>
        <div className="welcome-copy" inert={!introFinished}>
          <Brand size="large" priority />
          <span className="eyebrow">{messages.welcome.eyebrow}</span>
          <h1>{messages.welcome.title}</h1>
          <p>{messages.welcome.description}</p>
          <div className="welcome-actions">
            <button
              className="button button-primary button-large"
              onClick={() => router.push('/new-profile?mode=signup')}
            >
              <UserPlus size={20} />
              {messages.welcome.signUp}
            </button>
            <button
              className="button button-secondary button-large"
              onClick={() => router.push('/new-profile?mode=signin')}
            >
              <LogIn size={20} />
              {messages.welcome.signIn}
            </button>
            <button className="demo-link" onClick={enterDemo} disabled={demoLoading}>
              {demoLoading ? <LoaderCircle className="spin" size={17} /> : <Sparkles size={17} />}
              {demoLoading ? messages.common.loading : messages.welcome.demo}
              <span>{messages.welcome.demoHint}</span>
            </button>
            {demoError && <p className="welcome-error" role="alert">{demoError}</p>}
          </div>
        </div>
      </section>
    </main>
  );
}
