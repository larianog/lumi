'use client';

import { Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { messages } from '@/packages/i18n';

type AdultPasswordDialogProps = {
  description: string;
  isDemo: boolean;
  onCancel: () => void;
  onVerified: () => void;
};

/** Asks for the family password and calls `onVerified` once the server accepts it. */
export default function AdultPasswordDialog({ description, isDemo, onCancel, onVerified }: AdultPasswordDialogProps) {
  const [password, setPassword] = useState('');
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const response = await fetch('/api/adult-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (!response.ok) {
        setError(messages.profiles.passwordError);
        return;
      }
      onVerified();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onCancel}>
      <form className="password-modal" onSubmit={submit} onMouseDown={(event) => event.stopPropagation()}>
        <div className="modal-icon"><ShieldCheck size={24} /></div>
        <h2>{messages.profiles.passwordTitle}</h2>
        <p>{description}</p>
        <label>
          <span>{messages.profiles.passwordLabel}</span>
          <div className="password-input-wrapper">
            <input
              type={visible ? 'text' : 'password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              autoFocus
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setVisible((current) => !current)}
              aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
            >
              {visible ? <EyeOff size={19} /> : <Eye size={19} />}
            </button>
          </div>
        </label>
        {isDemo && <small>{messages.profiles.demoPassword}</small>}
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="modal-actions">
          <button type="button" className="button button-ghost" onClick={onCancel}>{messages.common.cancel}</button>
          <button type="submit" className="button button-primary" disabled={!password || submitting}>{messages.common.continue}</button>
        </div>
      </form>
    </div>
  );
}
