'use client';

import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

/** Signs the family out (asks first) and returns to the welcome screen. */
export default function LogoutButton({ className = '' }: { className?: string }) {
  const router = useRouter();
  const [leaving, setLeaving] = useState(false);

  const logout = async () => {
    if (!window.confirm('Sair da conta da família neste aparelho?')) return;
    setLeaving(true);
    try {
      await fetch('/api/logout', { method: 'POST' });
    } finally {
      router.replace('/');
      router.refresh();
    }
  };

  return (
    <button type="button" className={`logout-button ${className}`.trim()} onClick={() => void logout()} disabled={leaving}>
      <LogOut size={17} />Sair
    </button>
  );
}
