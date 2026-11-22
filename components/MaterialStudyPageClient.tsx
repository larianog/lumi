'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, History, LoaderCircle, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import Brand from '@/components/Brand';
import LumiVoiceAgent from '@/components/LumiVoiceAgent';
import LumiMaterialLoading from '@/components/LumiMaterialLoading';
import { getLumiAvatarMode } from '@/lib/lumi-avatars';
import { messages } from '@/packages/i18n';
import type { Profile } from '@/types/database';
import type { StudyMaterialDto } from '@/types/materials';

type MaterialStudyPageClientProps = {
  profileId: string;
  materialId: string;
  initialProfile?: Profile;
  initialMaterial?: StudyMaterialDto;
  embedded?: boolean;
  onBack?: () => void;
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
  initialMaterial,
  embedded = false,
  onBack,
  onClose,
}: MaterialStudyPageClientProps) {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(initialProfile ?? null);
  const [material, setMaterial] = useState<StudyMaterialDto | null>(initialMaterial ?? null);
  const [loading, setLoading] = useState(!initialProfile || !initialMaterial);
  const [loadError, setLoadError] = useState('');
  const [completionError, setCompletionError] = useState('');
  const [completing, setCompleting] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [readingPending, setReadingPending] = useState(initialMaterial?.extractionStatus === 'processing');
  const finishReading = useCallback(() => setReadingPending(false), []);

  const loadMaterial = useCallback(async (signal: AbortSignal) => {
    const response = await fetch(`/api/materials/${encodeURIComponent(materialId)}`, { cache: 'no-store', signal });
    if (!response.ok) throw new Error('Material não encontrado.');
    const data = await response.json() as StudyMaterialDto;
    if (data.profileId !== profileId && data.isDidactic !== false) throw new Error('Material não encontrado.');
    return data;
  }, [materialId, profileId]);

  useEffect(() => {
    if (initialProfile && initialMaterial) return;
    const controller = new AbortController();
    const load = async () => {
      try {
        const [profileResponse, materialData] = await Promise.all([
          initialProfile ? Promise.resolve(null) : fetch(`/api/profiles?profileId=${encodeURIComponent(profileId)}`, { cache: 'no-store', signal: controller.signal }),
          loadMaterial(controller.signal),
        ]);
        if (profileResponse && !profileResponse.ok) throw new Error('Perfil não encontrado.');
        const profileData = profileResponse ? await profileResponse.json() as { profile: Profile } : null;
        if (!controller.signal.aborted) {
          setProfile(profileData?.profile ?? initialProfile ?? null);
          setMaterial(materialData);
          setReadingPending(materialData.extractionStatus === 'processing');
        }
      } catch (error) {
        if (!controller.signal.aborted) setLoadError(error instanceof Error ? error.message : 'Não foi possível carregar o material.');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    void load();
    return () => controller.abort();
  }, [loadMaterial, profileId, initialProfile, initialMaterial]);

  useEffect(() => {
    if (material?.extractionStatus !== 'processing' || loadError) return;
    const controller = new AbortController();
    let timer: number;
    const timeout = window.setTimeout(() => {
      controller.abort();
      setLoadError(messages.materials.loadingError);
    }, 120_000);
    const poll = async () => {
      try {
        const data = await loadMaterial(controller.signal);
        if (controller.signal.aborted) return;
        setMaterial(data);
        if (data.extractionStatus === 'processing') {
          timer = window.setTimeout(poll, 1800);
        }
      } catch {
        if (!controller.signal.aborted) setLoadError(messages.materials.loadingError);
      }
    };
    timer = window.setTimeout(poll, 1800);
    return () => { controller.abort(); window.clearTimeout(timer); window.clearTimeout(timeout); };
  }, [loadMaterial, material?.extractionStatus, loadError]);

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

  if (loading) return <MaterialPageState message={messages.common.loading} />;
  const goBack = onBack ?? onClose ?? (() => router.push(`/profile/${profileId}`));
  if (!profile || !material) {
    return <MaterialPageState message={loadError || 'Material não encontrado.'} action={goBack} />;
  }

  const reading = readingPending && !loadError && material.extractionStatus !== 'failed' && !material.purgedAt;
  const processing = material.extractionStatus === 'processing' && !loadError;
  const ready = material.extractionStatus === 'ready' && Boolean(material.extractedText) && !material.purgedAt && !reading && material.isDidactic !== false;

  const workspace = (
      <div className={embedded ? 'home-layout home-material-layout' : 'material-stage'}>
        <aside className={embedded ? 'home-lumi' : 'material-lumi'}>
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
              lumiAvatar={profile.lumiAvatar}
              avatarMode={getLumiAvatarMode(profile.lumiAvatar)}
            />
          ) : (
            <LumiMaterialLoading loading={processing} active={Boolean(reading)} onComplete={finishReading} />
          )}
        </aside>
        <article className="material-card" aria-busy={processing || Boolean(reading)}>
          <h1 className="material-title">{messages.materials.title}</h1>
          {loadError ? (
            <div className="material-state-card material-state-error" role="alert">
              <strong>{loadError}</strong>
              <button className="button button-secondary" onClick={() => { setReadingPending(true); setLoadError(''); }}>{messages.materials.retryLoading}</button>
            </div>
          ) : processing || reading ? (
            <div className="material-state-card">
              <LoaderCircle className="spin" size={30} />
              <strong>{messages.materials.processing}</strong>
              <span>{messages.materials.processingHint}</span>
            </div>
          ) : material.extractionStatus === 'failed' ? (
            <div className="material-state-card material-state-error">
              <strong>{messages.materials.failed}</strong>
              {!embedded && <button className="button button-secondary" onClick={goBack}>
                {messages.common.back}
              </button>}
            </div>
          ) : material.isDidactic === false ? (
            <div className="material-state-card" role="status"><strong>Não Didático</strong><span>Esse material não é didático. Envie uma atividade de estudo para conversar com a Lumi.</span></div>
          ) : material.purgedAt || !material.extractedText ? (
            <div className="material-state-card material-state-error"><strong>{messages.materials.expired}</strong></div>
          ) : (
            <>
              {material.mimeType === 'application/pdf' ? (
                <div className="material-pdf-preview">
                  <iframe className="material-pdf" title={material.originalName} src={`/api/materials/${encodeURIComponent(material.id)}/file`} />
                  <a className="button button-secondary" href={`/api/materials/${encodeURIComponent(material.id)}/file`} target="_blank" rel="noopener noreferrer">{messages.materials.openPdf}</a>
                </div>
              ) : <button className="material-original-file" type="button" aria-label="Ampliar material" onClick={() => setShowImageModal(true)}>
                <img
                  src={`/api/materials/${encodeURIComponent(material.id)}/file`}
                  alt={material.originalName}
                  loading="lazy"
                />
              </button>}
              {material.mimeType !== 'application/pdf' && showImageModal && (
                <div className="image-modal-overlay" role="dialog" aria-modal="true" aria-label="Material ampliado" onClick={() => setShowImageModal(false)}>
                  <div className="image-modal" onClick={(e) => e.stopPropagation()}>
                    <button className="image-modal-close" type="button" aria-label="Fechar material ampliado" autoFocus onClick={() => setShowImageModal(false)}><X size={22} /></button>
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
          {embedded && <button className="button button-secondary material-new-button" type="button" onClick={goBack}>{messages.materials.newActivity}</button>}
        </article>
      </div>
  );

  if (embedded) return workspace;
  return (
    <section className="material-screen">
      <header className="activity-header material-header">
        <button className="back-button" onClick={goBack}>
          <ArrowLeft size={19} />{messages.common.back}
        </button>
        <Brand size="small" />
        <button className="material-history-link" onClick={() => router.push(`/profile/${profileId}/history`)}>
          <History size={18} />{messages.materials.history}
        </button>
      </header>
      {workspace}
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
