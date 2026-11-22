'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Eye, EyeOff, Plus, Trash2 } from 'lucide-react';
import { messages } from '@/packages/i18n';
import Brand from '@/components/Brand';
import type { Family } from '@/types/database';

type Step = 'parent' | 'children';

type NewProfileFormProps = {
  authMode: 'signup' | 'signin';
  /** `children` opens step 2 directly ("add child" for an existing family). */
  initialStep: Step;
};

type ParentForm = { firstName: string; lastName: string; phone: string; password: string };
type ChildForm = { key: number; firstName: string; lastName: string; birthDate: string };

const MAX_CHILDREN = 8;
let nextChildKey = 1;
const emptyChild = (lastName = ''): ChildForm => ({ key: nextChildKey++, firstName: '', lastName, birthDate: '' });
const today = () => new Date().toISOString().slice(0, 10);

/**
 * Sign in, or the two-step signup: (1) the parent creates the family account,
 * (2) one or more child profiles. Step 2 also serves "add child" later on.
 */
export default function NewProfileForm({ authMode, initialStep }: NewProfileFormProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>(authMode === 'signin' ? 'parent' : initialStep);
  // True when step 2 follows step 1 in this visit (shows "Passo 2 de 2").
  const [inSignupFlow, setInSignupFlow] = useState(authMode === 'signup' && initialStep === 'parent');
  const [parent, setParent] = useState<ParentForm>({ firstName: '', lastName: '', phone: '', password: '' });
  const [children, setChildren] = useState<ChildForm[]>(() => [emptyChild()]);
  const [hasChildren, setHasChildren] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Opening step 2 directly: needs a signed-in family; prefill the family surname.
  useEffect(() => {
    if (authMode !== 'signup' || initialStep !== 'children') return;
    let cancelled = false;
    void fetch('/api/profiles', { cache: 'no-store' }).then(async (response) => {
      if (cancelled) return;
      if (response.status === 401) {
        router.replace('/new-profile?mode=signup');
        return;
      }
      if (!response.ok) return;
      const { family } = await response.json() as { family: Family };
      const adult = family.profiles.find((profile) => profile.type === 'adult');
      setHasChildren(family.profiles.some((profile) => profile.type === 'child'));
      if (adult?.lastName) setChildren((current) => current.map((child) => (child.lastName ? child : { ...child, lastName: adult.lastName })));
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [authMode, initialStep, router]);

  const updateParent = <K extends keyof ParentForm>(key: K, value: ParentForm[K]) => {
    setParent((current) => ({ ...current, [key]: value }));
  };
  const updateChild = (key: number, field: keyof Omit<ChildForm, 'key'>, value: string) => {
    setChildren((current) => current.map((child) => (child.key === key ? { ...child, [field]: value } : child)));
  };

  const post = async (endpoint: string, payload: unknown) => {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await response.json().catch(() => ({})) as { error?: string };
    if (!response.ok) throw new Error(data.error ?? 'Não foi possível continuar.');
  };

  const submitParent = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      if (authMode === 'signin') {
        await post('/api/login', { phone: parent.phone, password: parent.password });
        router.push('/profiles');
        return;
      }
      await post('/api/profiles', {
        type: 'adult',
        firstName: parent.firstName,
        lastName: parent.lastName,
        phone: parent.phone,
        password: parent.password,
      });
      // Family created and signed in: go to step 2 with the surname prefilled.
      setChildren([emptyChild(parent.lastName.trim())]);
      setInSignupFlow(true);
      setStep('children');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Ocorreu um erro. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const submitChildren = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await post('/api/profiles', {
        children: children.map(({ firstName, lastName, birthDate }) => ({ firstName, lastName, birthDate })),
      });
      router.push('/profiles');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Ocorreu um erro. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const title = authMode === 'signin'
    ? messages.auth.signInTitle
    : step === 'parent' ? messages.auth.parentTitle : messages.auth.childrenTitle;
  // During signup the account already exists at step 2, so "back" would only
  // lead to an empty family; offer it only when adding to an existing family.
  const showBack = step === 'parent' || (!inSignupFlow && hasChildren);

  return (
    <section className="form-screen">
      <div className="form-forest" />
      <div className="form-shell">
        {showBack ? (
          <button className="back-button" onClick={() => (step === 'parent' ? router.back() : router.push('/profiles'))}>
            <ArrowLeft size={19} />{messages.common.back}
          </button>
        ) : <span />}
        <div className="profile-form-card">
          {authMode === 'signup' && inSignupFlow && (
            <ol className="signup-steps" aria-label="Etapas do cadastro">
              <li className={step === 'parent' ? 'is-current' : 'is-done'}><span>1</span>{messages.auth.stepParent}</li>
              <li className={step === 'children' ? 'is-current' : ''}><span>2</span>{messages.auth.stepChildren}</li>
            </ol>
          )}
          <div className="profile-form-header">
            <div>
              <h1>{title}</h1>
              {authMode === 'signup' && (
                <p className="profile-form-subtitle">
                  {step === 'parent' ? messages.auth.parentSubtitle : messages.auth.childrenSubtitle}
                </p>
              )}
            </div>
            <Brand size="medium" priority />
          </div>

          {step === 'parent' ? (
            <form onSubmit={submitParent}>
              {authMode === 'signup' && (
                <div className="field-row">
                  <label className="form-field">
                    <span>{messages.auth.firstName}</span>
                    <input required value={parent.firstName} onChange={(event) => updateParent('firstName', event.target.value)} autoComplete="given-name" />
                  </label>
                  <label className="form-field">
                    <span>{messages.auth.lastName}</span>
                    <input required value={parent.lastName} onChange={(event) => updateParent('lastName', event.target.value)} autoComplete="family-name" />
                  </label>
                </div>
              )}
              <label className="form-field">
                <span>{messages.auth.phone}</span>
                <input required type="tel" value={parent.phone} onChange={(event) => updateParent('phone', event.target.value)} autoComplete="tel" />
              </label>
              <label className="form-field">
                <span>{messages.auth.password}</span>
                <div className="password-input-wrapper">
                  <input
                    required
                    minLength={authMode === 'signup' ? 6 : undefined}
                    type={showPassword ? 'text' : 'password'}
                    value={parent.password}
                    onChange={(event) => updateParent('password', event.target.value)}
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
                {authMode === 'signup' && <small>{messages.auth.familyPasswordHint}</small>}
              </label>
              {error && <p className="form-error" role="alert">{error}</p>}
              <button type="submit" className="button button-primary button-large form-submit" disabled={isLoading}>
                {isLoading ? messages.common.loading : authMode === 'signin' ? messages.auth.submitSignIn : messages.auth.submitParent}
              </button>
            </form>
          ) : (
            <form onSubmit={submitChildren}>
              <ol className="child-entries">
                {children.map((child, index) => (
                  <li key={child.key} className="child-entry">
                    <div className="child-entry-head">
                      <strong>{messages.auth.childNumber(index + 1)}</strong>
                      {children.length > 1 && (
                        <button
                          type="button"
                          className="child-entry-remove"
                          onClick={() => setChildren((current) => current.filter((item) => item.key !== child.key))}
                          aria-label={`Remover ${messages.auth.childNumber(index + 1).toLowerCase()}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                    <div className="field-row">
                      <label className="form-field">
                        <span>{messages.auth.firstName}</span>
                        <input required value={child.firstName} onChange={(event) => updateChild(child.key, 'firstName', event.target.value)} autoComplete="off" />
                      </label>
                      <label className="form-field">
                        <span>{messages.auth.lastName}</span>
                        <input required value={child.lastName} onChange={(event) => updateChild(child.key, 'lastName', event.target.value)} autoComplete="off" />
                      </label>
                    </div>
                    <label className="form-field">
                      <span>{messages.auth.birthDate}</span>
                      <input required type="date" max={today()} value={child.birthDate} onChange={(event) => updateChild(child.key, 'birthDate', event.target.value)} />
                    </label>
                  </li>
                ))}
              </ol>
              {children.length < MAX_CHILDREN && (
                <button
                  type="button"
                  className="add-child-button"
                  onClick={() => setChildren((current) => [...current, emptyChild(current[0]?.lastName ?? '')])}
                >
                  <Plus size={18} />{messages.auth.addAnotherChild}
                </button>
              )}
              <small className="child-entries-hint">{messages.auth.birthDateHint}</small>
              {error && <p className="form-error" role="alert">{error}</p>}
              <button type="submit" className="button button-primary button-large form-submit" disabled={isLoading}>
                {isLoading ? messages.common.loading : messages.auth.submitChildren(children.length)}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
