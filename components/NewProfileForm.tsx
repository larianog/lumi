'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { messages } from '@/packages/i18n';
import Brand from '@/components/Brand';
import type { ProfileType } from '@/types/database';

type ProfileForm = {
  type: ProfileType;
  firstName: string;
  lastName: string;
  phone: string;
  password: string;
  birthDate: string;
};

type NewProfileFormProps = {
  authMode: 'signup' | 'signin';
  initialProfileType: ProfileType;
};

export default function NewProfileForm({ authMode, initialProfileType }: NewProfileFormProps) {
  const router = useRouter();
  const addingChild = authMode === 'signup' && initialProfileType === 'child';
  const [form, setForm] = useState<ProfileForm>({
    type: initialProfileType,
    firstName: '',
    lastName: '',
    phone: '',
    password: '',
    birthDate: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const update = <K extends keyof ProfileForm>(key: K, value: ProfileForm[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const submitProfile = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const endpoint = authMode === 'signin' ? '/api/login' : '/api/profiles';
      const payload = authMode === 'signin'
        ? { phone: form.phone, password: form.password }
        : {
            type: form.type,
            firstName: form.firstName,
            lastName: form.lastName,
            birthDate: form.birthDate,
            ...(!addingChild ? { phone: form.phone, password: form.password } : {}),
          };
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json() as { error?: string };

      if (!response.ok) {
        setError(data.error ?? 'Não foi possível continuar.');
        return;
      }
      router.push('/profiles');
    } catch {
      setError('Ocorreu um erro. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="form-screen">
      <div className="form-forest" />
      <div className="form-shell">
        <button className="back-button" onClick={() => router.back()}>
          <ArrowLeft size={19} />{messages.common.back}
        </button>
        <div className="profile-form-card">
          <div className="profile-form-header">
            <h1>
              {authMode === 'signin'
                ? messages.auth.signInTitle
                : addingChild ? messages.auth.addChild : messages.auth.createTitle}
            </h1>
            <Brand size="medium" priority />
          </div>
          <form onSubmit={submitProfile}>
            {authMode === 'signup' && (
              <>
                {!addingChild && (
                  <label className="form-field">
                    <span>{messages.auth.type}</span>
                    <select value={form.type} onChange={(event) => update('type', event.target.value as ProfileType)}>
                      <option value="adult">{messages.auth.adult}</option>
                      <option value="child">{messages.auth.child}</option>
                    </select>
                  </label>
                )}
                <div className="field-row">
                  <label className="form-field">
                    <span>{messages.auth.firstName}</span>
                    <input required value={form.firstName} onChange={(event) => update('firstName', event.target.value)} autoComplete="given-name" />
                  </label>
                  <label className="form-field">
                    <span>{messages.auth.lastName}</span>
                    <input required value={form.lastName} onChange={(event) => update('lastName', event.target.value)} autoComplete="family-name" />
                  </label>
                </div>
              </>
            )}
            {!addingChild && (
              <>
                <label className="form-field">
                  <span>{messages.auth.phone}</span>
                  <input required type="tel" value={form.phone} onChange={(event) => update('phone', event.target.value)} autoComplete="tel" />
                </label>
                <label className="form-field">
                  <span>{messages.auth.password}</span>
                  <div className="password-input-wrapper">
                    <input
                      required
                      minLength={authMode === 'signup' ? 6 : undefined}
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={(event) => update('password', event.target.value)}
                      autoComplete={authMode === 'signin' ? 'current-password' : 'new-password'}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword((visible) => !visible)}
                      aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                      aria-pressed={showPassword}
                    >
                      {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                    </button>
                  </div>
                  {authMode === 'signup' && <small>{messages.auth.passwordHint}</small>}
                </label>
              </>
            )}
            {authMode === 'signup' && (
              <label className="form-field">
                <span>{messages.auth.birthDate}</span>
                <input required type="date" value={form.birthDate} onChange={(event) => update('birthDate', event.target.value)} />
                <small>{messages.auth.birthDateHint}</small>
              </label>
            )}
            {error && <p className="form-error" role="alert">{error}</p>}
            <button type="submit" className="button button-primary button-large form-submit" disabled={isLoading}>
              {isLoading ? messages.common.loading : authMode === 'signin' ? messages.auth.submitSignIn : messages.auth.submitCreate}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
