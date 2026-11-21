'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { BookOpen, LoaderCircle, LogIn, Sparkles, Star, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { messages } from '@/packages/i18n';
import Brand from './Brand';

export default function LumiApp() {
  const router = useRouter();
  const [demoLoading, setDemoLoading] = useState(false);
  const [demoError, setDemoError] = useState('');

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
      <section className="welcome-screen">
        <div className="welcome-copy">
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
            {demoError && <p className="welcome-error">{demoError}</p>}
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
    </main>
  );
}
