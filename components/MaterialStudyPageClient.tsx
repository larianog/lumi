'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, BookOpenCheck, CheckCircle2, History, Lightbulb, LoaderCircle } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import Brand from '@/components/Brand';
import LumiVoiceAgent from '@/components/LumiVoiceAgent';
import LumiMaterialLoading from '@/components/LumiMaterialLoading';
import { getLumiAvatarMode } from '@/lib/lumi-avatars';
import MaterialQuestion from '@/components/MaterialQuestion';
import { matchBankWords, mentionedQuestion, parseWordBank } from '@/lib/answer-matching';
import { LUMI_CHILD_SAID_EVENT, routeVoiceAnswers, type LumiChildSaidDetail } from '@/lib/lumi-events';
import MaterialViewer from '@/components/MaterialViewer';
import { messages } from '@/packages/i18n';
import type { Profile } from '@/types/database';
import type { StudyMaterialDto } from '@/types/materials';

type MaterialStudyPageClientProps = {
  profileId: string;
  materialId: string;
  initialProfile?: Profile;
  initialMaterial?: StudyMaterialDto;
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
  initialMaterial,
  embedded = false,
  onClose,
}: MaterialStudyPageClientProps) {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(initialProfile ?? null);
  const [material, setMaterial] = useState<StudyMaterialDto | null>(initialMaterial ?? null);
  const [loading, setLoading] = useState(!initialProfile || !initialMaterial);
  const [loadError, setLoadError] = useState('');
  const [completionError, setCompletionError] = useState('');
  const [completing, setCompleting] = useState(false);
  const [readingPending, setReadingPending] = useState(initialMaterial?.extractionStatus === 'processing');
  const finishReading = useCallback(() => setReadingPending(false), []);
  const [activeQuestion, setActiveQuestion] = useState<number | null>(null);
  const activeQuestionRef = useRef<number | null>(null);
  useEffect(() => {
    activeQuestionRef.current = activeQuestion;
  }, [activeQuestion]);
  const close = onClose ?? (() => router.push(`/profile/${profileId}`));

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
  }, [initialProfile, initialMaterial, loadMaterial, profileId]);

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
        if (data.extractionStatus === 'processing') timer = window.setTimeout(poll, 1800);
      } catch {
        if (!controller.signal.aborted) setLoadError(messages.materials.loadingError);
      }
    };
    timer = window.setTimeout(poll, 1800);
    return () => { controller.abort(); window.clearTimeout(timer); window.clearTimeout(timeout); };
  }, [loadMaterial, material?.extractionStatus, loadError]);


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

  // Route each finished child utterance to one question: the one she named
  // ("questão dois"), else the active one if her words fit its word bank, else
  // the question whose word bank fits best. The target becomes the active one.
  const questions = material?.questions;
  useEffect(() => {
    if (!questions?.length) return;
    const banks = questions.map((question) =>
      (question.answerSlots?.length && question.supportContent ? parseWordBank(question.supportContent) : null));
    const onChildSaid = (event: Event) => {
      const { text } = (event as CustomEvent<LumiChildSaidDetail>).detail;
      const named = mentionedQuestion(text);
      const matches = (index: number) => (banks[index] ? matchBankWords(text, banks[index]).length : 0);
      const fallback = Math.max(0, questions.findIndex((question) => (question.answerSlots?.length ?? 0) > 0));
      const active = activeQuestionRef.current ?? fallback;
      let target = named ? questions.findIndex((question, index) => (question.number || String(index + 1)).replace(/\D/g, '') === named) : -1;
      if (target < 0 && matches(active) > 0) target = active;
      if (target < 0) {
        let best = 0;
        banks.forEach((_, index) => {
          const count = matches(index);
          if (count > best) { best = count; target = index; }
        });
      }
      if (target < 0) return;
      setActiveQuestion(target);
      routeVoiceAnswers({ index: target, text });
    };
    window.addEventListener(LUMI_CHILD_SAID_EVENT, onChildSaid);
    return () => window.removeEventListener(LUMI_CHILD_SAID_EVENT, onChildSaid);
  }, [questions]);

  if (loading) return <MaterialPageState message={messages.common.loading} action={embedded ? close : undefined} embedded={embedded} />;
  if (!profile || !material) {
    return <MaterialPageState message={loadError || 'Material não encontrado.'} action={close} embedded={embedded} />;
  }

  // Spoken answers fill the question the child last touched (default: first with blanks).
  const firstAnswerableQuestion = Math.max(0, material.questions?.findIndex((question) => (question.answerSlots?.length ?? 0) > 0) ?? 0);
  const processing = material.extractionStatus === 'processing' && !loadError;
  const reading = readingPending && !loadError && material.extractionStatus !== 'failed' && !material.purgedAt;
  const ready = material.extractionStatus === 'ready' && Boolean(material.extractedText) && !material.purgedAt && !reading && material.isDidactic !== false;
  const materialFileUrl = `/api/materials/${encodeURIComponent(material.id)}/file`;

  return (
    <section className={embedded ? 'profile-material-workspace' : 'material-screen'}>
      {/* Inside the profile, its header already has history and profile actions. */}
      {!embedded && (
        <header className="activity-header material-header">
          <button className="back-button" type="button" onClick={close}>
            <ArrowLeft size={19} />{messages.common.back}
          </button>
          <Brand size="small" />
          <button className="material-history-link" type="button" onClick={() => router.push(`/profile/${profileId}/history`)}>
            <History size={18} />{messages.materials.history}
          </button>
        </header>
      )}
      <div className="material-stage">
        <aside className="material-lumi">
          <div className="lumi-halo" />
          {ready ? (
            <LumiVoiceAgent
              profileName={profile.firstName}
              age={calculateAge(profile.birthDate)}
              activityTitle={material.title ?? material.originalName}
              profileId={profileId}
              lumiAvatar={profile.lumiAvatar}
              avatarMode={getLumiAvatarMode(profile.lumiAvatar)}
              materialId={material.id}
              recording={{ profileId, materialId: material.id, title: material.title ?? material.originalName }}
              autoStart
              variant="inline"
            />
          ) : processing || reading ? (
            <LumiMaterialLoading loading={processing} onComplete={finishReading} />
          ) : (
            <div className="material-lumi-placeholder"><LoaderCircle className="spin" size={38} /></div>
          )}
        </aside>
        <article className="material-card">
          <header className="material-card-head">
            <div className="material-card-topline">
              <span className="material-card-eyebrow"><BookOpenCheck size={16} />{messages.materials.eyebrow}</span>
              {embedded && (
                <button className="material-card-back" type="button" onClick={close}>
                  <ArrowLeft size={15} />Enviar outra lição
                </button>
              )}
            </div>
            <h1 className="material-card-title">{material.title || messages.materials.title}</h1>
            {(material.subject || material.questionCount || material.isDidactic === false) && (
              <div className="material-chips">
                {material.subject && <span className="material-chip">{material.subject}</span>}
                {material.questionCount ? (
                  <span className="material-chip">
                    {material.questionCount} {material.questionCount === 1 ? 'questão' : 'questões'}
                  </span>
                ) : null}
                {material.isDidactic === false && <span className="material-chip is-warning">Não didático</span>}
              </div>
            )}
          </header>

          {loadError ? (
            <div className="material-state-card material-state-error">
              <strong>{loadError}</strong>
              <button className="button button-secondary" onClick={() => setLoadError('')}>{messages.materials.retryLoading}</button>
            </div>
          ) : material.extractionStatus === 'processing' || reading ? (
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
              <div className="material-card-body">
                {material.instructions && (
                  <p className="material-instructions"><Lightbulb size={18} />{material.instructions}</p>
                )}
                {material.questions && material.questions.length > 0 ? (
                  <ol className="material-questions">
                    {material.questions.map((question, index) => (
                      <MaterialQuestion
                        key={`${question.number}-${index}`}
                        materialId={material.id}
                        index={index}
                        question={question}
                        active={index === (activeQuestion ?? firstAnswerableQuestion)}
                        onActivate={() => setActiveQuestion(index)}
                      />
                    ))}
                  </ol>
                ) : (
                  <p className="material-plain-text">{material.extractedText}</p>
                )}
                <MaterialViewer
                  fileUrl={materialFileUrl}
                  mimeType={material.mimeType}
                  fileName={material.originalName}
                  title={material.title}
                />
              </div>
              <footer className="material-card-foot">
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
              </footer>
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
