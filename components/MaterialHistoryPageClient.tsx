'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, CalendarDays, CheckCircle2, FileText, LoaderCircle, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import Brand from '@/components/Brand';
import { messages } from '@/packages/i18n';
import type { Profile } from '@/types/database';
import type { StudyMaterialDto } from '@/types/materials';

export default function MaterialHistoryPageClient({ profileId }: { profileId: string }) {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [materials, setMaterials] = useState<StudyMaterialDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [profileResponse, materialsResponse] = await Promise.all([
          fetch(`/api/profiles?profileId=${encodeURIComponent(profileId)}`, { cache: 'no-store' }),
          fetch(`/api/materials?profileId=${encodeURIComponent(profileId)}`, { cache: 'no-store' }),
        ]);
        if (!profileResponse.ok || !materialsResponse.ok) throw new Error('Não foi possível carregar o histórico.');
        const profileData = await profileResponse.json() as { profile: Profile };
        const materialsData = await materialsResponse.json() as StudyMaterialDto[];
        if (!cancelled) {
          setProfile(profileData.profile);
          setMaterials(materialsData);
        }
      } catch (loadError) {
        if (!cancelled) setError(loadError instanceof Error ? loadError.message : 'Não foi possível carregar o histórico.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => { cancelled = true; };
  }, [profileId]);

  if (loading) return <HistoryState message={messages.common.loading} />;
  if (!profile) return <HistoryState message={error || 'Perfil não encontrado.'} action={() => router.push('/profiles')} />;

  return (
    <section className="material-history-screen">
      <header className="activity-header">
        <button className="back-button" onClick={() => router.push(`/profile/${profileId}`)}><ArrowLeft size={19} />{messages.common.back}</button>
        <Brand size="small" />
        <span className="activity-header-profile">{profile.firstName}</span>
      </header>
      <main className="material-history-content">
        <span className="eyebrow">{profile.firstName}</span>
        <h1>{messages.materials.historyTitle}</h1>
        <p>{messages.materials.historySubtitle}</p>
        <div className="material-history-list">
          {materials.length === 0 ? (
            <div className="history-empty"><CalendarDays size={30} /><p>{messages.materials.historyEmpty}</p></div>
          ) : materials.map((material) => {
            const status = material.extractionStatus === 'failed'
              ? messages.materials.failedStatus
              : material.extractionStatus === 'processing'
                ? messages.materials.processingStatus
                : material.completedAt
                  ? messages.materials.completedStatus
                  : messages.materials.pendingStatus;
            const StatusIcon = material.extractionStatus === 'failed'
              ? XCircle
              : material.extractionStatus === 'processing'
                ? LoaderCircle
                : material.completedAt
                  ? CheckCircle2
                  : FileText;
            return (
              <button
                className="material-history-item"
                key={material.id}
                onClick={() => router.push(`/profile/${profileId}/materials/${material.id}`)}
              >
                <span className={`history-icon status-${material.extractionStatus}${material.completedAt ? ' is-complete' : ''}`}>
                  <StatusIcon className={material.extractionStatus === 'processing' ? 'spin' : undefined} size={22} />
                </span>
                <span className="material-history-copy">
                  <strong>{material.originalName}</strong>
                  <small>{new Date(material.createdAt).toLocaleDateString('pt-BR')}</small>
                </span>
                <span className="material-history-badges">
                  {material.isDidactic === false && (
                    <span className="material-status-pill status-failed">Não Didático</span>
                  )}
                  <span className={`material-status-pill${material.completedAt ? ' is-complete' : ''}`}>{status}</span>
                </span>
              </button>
            );
          })}
        </div>
      </main>
    </section>
  );
}

function HistoryState({ message, action }: { message: string; action?: () => void }) {
  return (
    <section className="material-history-screen">
      <div className={action ? 'error-message' : 'loading-spinner'}>
        {!action && <div className="spinner" />}
        <p>{message}</p>
        {action && <button className="button button-primary" onClick={action}>{messages.common.back}</button>}
      </div>
    </section>
  );
}
