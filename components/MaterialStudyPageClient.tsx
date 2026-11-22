'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, History, LoaderCircle, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import Brand from '@/components/Brand';
import LumiVoiceAgent from '@/components/LumiVoiceAgent';
import { messages } from '@/packages/i18n';
import type { Profile } from '@/types/database';
import type { StudyMaterialDto } from '@/types/materials';

type MaterialStudyPageClientProps = {
  profileId: string;
  materialId: string;
  initialProfile?: Profile;
  embedded?: boolean;
  onClose?: () => void;
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
  initialProfile,
  embedded = false,
  onClose,
}: MaterialStudyPageClientProps) {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(initialProfile ?? null);
  const [material, setMaterial] = useState<StudyMaterialDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [completionError, setCompletionError] = useState('');
  const [completing, setCompleting] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const close = onClose ?? (() => router.push(`/profile/${profileId}`));

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
          initialProfile ? Promise.resolve(null) : fetch(`/api/profiles?profileId=${encodeURIComponent(profileId)}`, { cache: 'no-store' }),
          loadMaterial(),
        ]);
        if (profileResponse && !profileResponse.ok) throw new Error('Perfil não encontrado.');
        const profileData = profileResponse ? await profileResponse.json() as { profile: Profile } : null;
        if (!cancelled) {
          setProfile(profileData?.profile ?? initialProfile ?? null);
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
  }, [initialProfile, loadMaterial, profileId]);

  useEffect(() => {
    if (material?.extractionStatus !== 'processing') return;
    const interval = window.setInterval(() => {
      void loadMaterial().catch(() => {});
    }, 1800);
    return () => window.clearInterval(interval);
  }, [loadMaterial, material?.extractionStatus]);

  useEffect(() => {
    if (!showImageModal) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setShowImageModal(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [showImageModal]);

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

  if (loading) return <MaterialPageState message={messages.common.loading} action={embedded ? close : undefined} embedded={embedded} />;
  if (!profile || !material) {
    return <MaterialPageState message={loadError || 'Material não encontrado.'} action={close} embedded={embedded} />;
  }

  const ready = material.extractionStatus === 'ready' && Boolean(material.extractedText) && !material.purgedAt;
  const materialFileUrl = `/api/materials/${encodeURIComponent(material.id)}/file`;

  return (
    <section className={embedded ? 'profile-material-workspace' : 'material-screen'}>
      <header className="activity-header material-header">
        <button className="back-button" type="button" onClick={close}>
          <ArrowLeft size={19} />{embedded ? 'Voltar ao perfil' : messages.common.back}
        </button>
        {!embedded && <Brand size="small" />}
        <button className="material-history-link" type="button" onClick={() => router.push(`/profile/${profileId}/history`)}>
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
              activityTitle={material.title ?? material.originalName}
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
          {!material.isDidactic && <span className="material-status-pill status-failed">Não Didático</span>}
          {material.extractionStatus === 'processing' ? (
            <div className="material-state-card">
              <LoaderCircle className="spin" size={30} />
              <strong>{messages.materials.processing}</strong>
              <span>{messages.materials.processingHint}</span>
            </div>
          ) : material.extractionStatus === 'failed' ? (
            <div className="material-state-card material-state-error">
              <strong>{messages.materials.failed}</strong>
              <button className="button button-secondary" onClick={close}>
                {embedded ? 'Voltar ao perfil' : messages.common.back}
              </button>
            </div>
          ) : material.purgedAt || !material.extractedText ? (
            <div className="material-state-card material-state-error"><strong>{messages.materials.expired}</strong></div>
          ) : (
            <>
              {material.mimeType === 'application/pdf' ? (
                <object className="material-pdf" data={materialFileUrl} type="application/pdf" aria-label={material.originalName}>
                  <a href={materialFileUrl} target="_blank" rel="noopener noreferrer">Abrir material PDF</a>
                </object>
              ) : (
                <button className="material-original-file" type="button" aria-label="Ampliar material" onClick={() => setShowImageModal(true)}>
                  <img src={materialFileUrl} alt={material.originalName} loading="lazy" />
                </button>
              )}
              {material.mimeType !== 'application/pdf' && showImageModal && (
                <div className="image-modal-overlay" role="dialog" aria-modal="true" aria-label="Material ampliado" onClick={() => setShowImageModal(false)}>
                  <div className="image-modal" onClick={(e) => e.stopPropagation()}>
                    <button className="image-modal-close" type="button" aria-label="Fechar material ampliado" autoFocus onClick={() => setShowImageModal(false)}>
                      <X size={22} />
                    </button>
                    <img
                      src={materialFileUrl}
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

function MaterialPageState({ message, action, embedded = false }: { message: string; action?: () => void; embedded?: boolean }) {
  return (
    <section className={embedded ? 'profile-material-workspace' : 'material-screen'}>
      <div className={action && message !== messages.common.loading ? 'error-message' : 'loading-spinner'}>
        {message === messages.common.loading && <div className="spinner" />}
        <p>{message}</p>
        {action && <button className="button button-primary" onClick={action}>{embedded ? 'Voltar ao perfil' : messages.common.back}</button>}
      </div>
    </section>
  );
}
