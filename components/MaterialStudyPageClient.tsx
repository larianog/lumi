'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, History, LoaderCircle } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import Brand from '@/components/Brand';
import LumiVoiceAgent from '@/components/LumiVoiceAgent';
import { messages } from '@/packages/i18n';
import type { Profile } from '@/types/database';
import type { StudyMaterialDto } from '@/types/materials';

type MaterialStudyPageClientProps = {
  profileId: string;
  materialId: string;
};

function calculateAge(birthDate: string) {
  const today = new Date();
  const birth = new Date(`${birthDate}T12:00:00`);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDifference = today.getMonth() - birth.getMonth();
  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birth.getDate())) age -= 1;
  return Math.max(age, 0);
}

export default function MaterialStudyPageClient({
  profileId,
  materialId,
}: MaterialStudyPageClientProps) {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [material, setMaterial] = useState<StudyMaterialDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [completionError, setCompletionError] = useState('');
  const [completing, setCompleting] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  const loadMaterial = useCallback(async () => {
    const response = await fetch(`/api/materials/${encodeURIComponent(materialId)}`, { cache: 'no-store' });
    if (!response.ok) throw new Error('Material não encontrado.');
    const data = await response.json() as StudyMaterialDto;
    setMaterial(data);
    return data;
  }, [materialId]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [profileResponse, materialData] = await Promise.all([
          fetch(`/api/profiles?profileId=${encodeURIComponent(profileId)}`, { cache: 'no-store' }),
          loadMaterial(),
        ]);
        if (!profileResponse.ok) throw new Error('Perfil não encontrado.');
        const profileData = await profileResponse.json() as { profile: Profile };
        if (!cancelled) {
          setProfile(profileData.profile);
          setMaterial(materialData);
        }
      } catch (error) {
        if (!cancelled) setLoadError(error instanceof Error ? error.message : 'Não foi possível carregar o material.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => { cancelled = true; };
  }, [loadMaterial, profileId]);

  useEffect(() => {
    if (material?.extractionStatus !== 'processing') return;
    const interval = window.setInterval(() => {
      void loadMaterial().catch(() => {});
    }, 1800);
    return () => window.clearInterval(interval);
  }, [loadMaterial, material?.extractionStatus]);

  const completeMaterial = async () => {
    if (!material || material.completedAt || completing) return;
    setCompleting(true);
    setCompletionError('');
    try {
      const response = await fetch(`/api/materials/${encodeURIComponent(material.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: true }),
      });
      const data = await response.json() as StudyMaterialDto & { error?: string };
      if (!response.ok) throw new Error(data.error || 'Não foi possível concluir a atividade.');
      setMaterial(data);
    } catch (error) {
      setCompletionError(error instanceof Error ? error.message : 'Não foi possível concluir a atividade.');
    } finally {
      setCompleting(false);
    }
  };

  if (loading) return <MaterialPageState message={messages.common.loading} />;
  if (!profile || !material) {
    return <MaterialPageState message={loadError || 'Material não encontrado.'} action={() => router.push(`/profile/${profileId}`)} />;
  }

  const ready = material.extractionStatus === 'ready' && Boolean(material.extractedText) && !material.purgedAt;

  return (
    <section className="material-screen">
      <header className="activity-header material-header">
        <button className="back-button" onClick={() => router.push(`/profile/${profileId}`)}>
          <ArrowLeft size={19} />{messages.common.back}
        </button>
        <Brand size="small" />
        <button className="material-history-link" onClick={() => router.push(`/profile/${profileId}/history`)}>
          <History size={18} />{messages.materials.history}
        </button>
      </header>
      <div className="material-stage">
        <aside className="material-lumi">
          <div className="lumi-halo" />
          {ready ? (
            <LumiVoiceAgent
              profileName={profile.firstName}
              age={calculateAge(profile.birthDate)}
              activityTitle={material.originalName}
              profileId={profileId}
              materialId={material.id}
              autoStart
              variant="inline"
            />
          ) : (
            <div className="material-lumi-placeholder"><LoaderCircle className="spin" size={38} /></div>
          )}
        </aside>
        <article className="material-card">
          <h1 className="material-title">{messages.materials.title}</h1>
          {material.extractionStatus === 'processing' ? (
            <div className="material-state-card">
              <LoaderCircle className="spin" size={30} />
              <strong>{messages.materials.processing}</strong>
              <span>{messages.materials.processingHint}</span>
            </div>
          ) : material.extractionStatus === 'failed' ? (
            <div className="material-state-card material-state-error">
              <strong>{messages.materials.failed}</strong>
              <button className="button button-secondary" onClick={() => router.push(`/profile/${profileId}`)}>
                {messages.common.back}
              </button>
            </div>
          ) : material.purgedAt || !material.extractedText ? (
            <div className="material-state-card material-state-error"><strong>{messages.materials.expired}</strong></div>
          ) : (
            <>
              <div className="material-original-file" onClick={() => setShowImageModal(true)}>
                <img
                  src={`/api/materials/${encodeURIComponent(material.id)}/file`}
                  alt={material.originalName}
                  loading="lazy"
                />
              </div>
              {showImageModal && (
                <div className="image-modal-overlay" onClick={() => setShowImageModal(false)}>
                  <div className="image-modal" onClick={(e) => e.stopPropagation()}>
                    <img
                      src={`/api/materials/${encodeURIComponent(material.id)}/file`}
                      alt={material.originalName}
                      style={{ maxWidth: '90vw', maxHeight: '90vh' }}
                    />
                  </div>
                </div>
              )}
              {material.completedAt ? (
                <div className="completion-banner">
                  <CheckCircle2 size={25} />
                  <div><strong>{messages.materials.completed}</strong><span>{messages.materials.completionHint}</span></div>
                </div>
              ) : (
                <button className="button button-primary material-complete-button" disabled={completing} onClick={() => void completeMaterial()}>
                  {completing ? <LoaderCircle className="spin" size={19} /> : <CheckCircle2 size={19} />}
                  {messages.materials.complete}
                </button>
              )}
              {completionError && <p className="form-error" role="alert">{completionError}</p>}
            </>
          )}
        </article>
      </div>
    </section>
  );
}

function MaterialPageState({ message, action }: { message: string; action?: () => void }) {
  return (
    <section className="material-screen">
      <div className={action ? 'error-message' : 'loading-spinner'}>
        {!action && <div className="spinner" />}
        <p>{message}</p>
        {action && <button className="button button-primary" onClick={action}>{messages.common.back}</button>}
      </div>
    </section>
  );
}
