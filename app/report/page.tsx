'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowLeft, BookOpenCheck, CalendarDays, CheckCircle2, ChevronDown, Clock3, Headphones, MessageCircle, Paperclip, Plus, Star, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import Brand from '@/components/Brand';
import LogoutButton from '@/components/LogoutButton';
import { messages } from '@/packages/i18n';
import type { ActivityCompletion, Family } from '@/types/database';
import type { StudyMaterialDto } from '@/types/materials';
import type { SessionRecordingDto } from '@/types/recordings';

const profileColors = ['#eaf9bb', '#a8e6cf', '#d7c5f4', '#ffd79b', '#ffc9d6'];

function formatDuration(durationMs: number) {
  const totalSeconds = Math.round(durationMs / 1000);
  return `${Math.floor(totalSeconds / 60)}:${String(totalSeconds % 60).padStart(2, '0')}`;
}

function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(iso));
}

export default function ReportPage() {
  const router = useRouter();
  const [family, setFamily] = useState<Family | null>(null);
  const [completions, setCompletions] = useState<ActivityCompletion[]>([]);
  const [materials, setMaterials] = useState<StudyMaterialDto[]>([]);
  const [recordings, setRecordings] = useState<SessionRecordingDto[]>([]);
  const [selectedChildId, setSelectedChildId] = useState('');
  const [openTranscript, setOpenTranscript] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    const loadData = async () => {
      try {
        const [familyResponse, progressResponse, materialsResponse, recordingsResponse] = await Promise.all([
          fetch('/api/profiles', { cache: 'no-store' }),
          fetch('/api/activities?scope=family', { cache: 'no-store' }),
          fetch('/api/materials?scope=family', { cache: 'no-store' }),
          fetch('/api/recordings', { cache: 'no-store' }),
        ]);
        if (!familyResponse.ok || !progressResponse.ok || !materialsResponse.ok) {
          if (!cancelled) setError('Não foi possível carregar o relatório.');
          return;
        }
        const familyData = await familyResponse.json() as { family: Family };
        const progressData = await progressResponse.json() as ActivityCompletion[];
        const materialsData = await materialsResponse.json() as StudyMaterialDto[];
        // Recordings are optional here: the rest of the report still renders without them.
        const recordingsData = recordingsResponse.ok ? await recordingsResponse.json() as SessionRecordingDto[] : [];
        const firstChild = familyData.family.profiles.find((profile) => profile.type === 'child');
        if (!cancelled) {
          setFamily(familyData.family);
          setCompletions(progressData);
          setMaterials(materialsData);
          setRecordings(recordingsData);
          setSelectedChildId(firstChild?.id ?? '');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void loadData();
    return () => { cancelled = true; };
  }, []);

  const childProfiles = useMemo(() => family?.profiles.filter((profile) => profile.type === 'child') ?? [], [family]);
  const adultProfile = useMemo(() => family?.profiles.find((profile) => profile.type === 'adult') ?? null, [family]);
  const selectedChild = childProfiles.find((child) => child.id === selectedChildId) ?? null;
  const childCompletions = completions.filter((completion) => completion.profileId === selectedChildId);
  const childMaterials = materials.filter((material) => material.profileId === selectedChildId);
  const completedMaterials = childMaterials.filter((material) => material.completedAt);
  const childRecordings = recordings.filter((recording) => recording.profileId === selectedChildId);
  const materialById = new Map(materials.map((material) => [material.id, material]));

  const removeRecording = async (recording: SessionRecordingDto) => {
    if (!window.confirm(`Apagar a gravação "${recording.title}"? Isso não pode ser desfeito.`)) return;
    const response = await fetch(`/api/recordings/${encodeURIComponent(recording.id)}`, { method: 'DELETE' });
    if (response.ok) setRecordings((current) => current.filter((item) => item.id !== recording.id));
  };

  if (loading) return <ReportState message={messages.common.loading} />;
  if (!family) return <ReportState message={error || 'Nenhuma família encontrada.'} action={() => router.push('/profiles')} />;

  const sessionCountFor = (childId: string) => recordings.filter((recording) => recording.profileId === childId).length;

  return (
    <section className="report-screen">
      <header className="report-header">
        <button className="back-button" onClick={() => router.push('/profiles')}><ArrowLeft size={19} />{messages.common.back}</button>
        <Brand size="small" />
        <div className="report-header-user">
          <span>{adultProfile?.firstName || messages.auth.adult}</span>
          <LogoutButton />
        </div>
      </header>
      <div className="report-layout">
        <aside className="report-sidebar">
          <div className="report-sidebar-intro">
            <span className="eyebrow">{messages.profiles.adultArea}</span>
            <h1>{messages.report.title}</h1>
            <p>{messages.report.subtitle}</p>
          </div>
          <nav className="child-tabs" aria-label={messages.report.childrenLabel}>
            {childProfiles.map((child) => {
              const sessions = sessionCountFor(child.id);
              return (
                <button
                  key={child.id}
                  className={selectedChildId === child.id ? 'active' : ''}
                  onClick={() => { setSelectedChildId(child.id); setOpenTranscript(null); }}
                  aria-current={selectedChildId === child.id ? 'true' : undefined}
                >
                  <span className="child-tab-avatar" style={{ background: profileColors[child.avatar % profileColors.length] }}>{child.firstName.slice(0, 1)}</span>
                  <span className="child-tab-text">
                    <strong>{child.firstName}</strong>
                    <small>{messages.report.sessionCount(sessions)}</small>
                  </span>
                </button>
              );
            })}
          </nav>
          <button className="report-add-child" onClick={() => router.push('/new-profile?mode=signup&type=child')}>
            <Plus size={18} /><span>{messages.report.addChild}</span>
          </button>
        </aside>
        <main className="report-content">
          <div className="report-content-inner">
            <div className="report-hero">
              <div className="report-hero-text">
                <span className="eyebrow">{selectedChild?.firstName}</span>
                <h2>{messages.report.heroTitle}</h2>
                <dl className="report-stats">
                  <div><dt>{messages.report.completed}</dt><dd>{childCompletions.length + completedMaterials.length}</dd></div>
                  <div><dt>{messages.report.sessions}</dt><dd>{childRecordings.length}</dd></div>
                </dl>
              </div>
              <Image src="/assets/lumi-avatar.png" alt="" width={180} height={200} />
            </div>

            <section className="report-section" aria-labelledby="report-sessions-title">
              <div className="report-section-head">
                <h2 id="report-sessions-title">{messages.report.sessions}</h2>
                <span className="report-count">{childRecordings.length}</span>
              </div>
              <div className="history-list">
                {childRecordings.length === 0 ? (
                  <div className="history-empty"><Headphones size={28} /><p>{messages.report.noSessions}</p></div>
                ) : childRecordings.map((recording) => {
                  const material = recording.materialId ? materialById.get(recording.materialId) : undefined;
                  const transcriptOpen = openTranscript === recording.id;
                  return (
                    <article className="report-session" key={recording.id}>
                      <div className="report-session-head">
                        <span className={`history-icon${material ? ' is-lesson' : ''}`}>{material ? <BookOpenCheck size={22} /> : <MessageCircle size={22} />}</span>
                        <div>
                          <strong>{recording.title}</strong>
                          <small>
                            <span><CalendarDays size={13} />{formatDateTime(recording.startedAt)}</span>
                            <span><Clock3 size={13} />{formatDuration(recording.durationMs)}</span>
                          </small>
                        </div>
                        <button className="recording-delete" onClick={() => void removeRecording(recording)} aria-label={`Apagar gravação ${recording.title}`}>
                          <Trash2 size={17} />
                        </button>
                      </div>
                      <audio className="recording-player" controls preload="metadata" src={`/api/recordings/${encodeURIComponent(recording.id)}/file`} />
                      {material ? (
                        <a className="report-session-file" href={`/api/materials/${encodeURIComponent(material.id)}/file`} target="_blank" rel="noreferrer">
                          <Paperclip size={17} />
                          <span>
                            <small>{messages.report.sessionFiles}</small>
                            <strong>{material.originalName}</strong>
                          </span>
                          <span className={`report-material-status${material.completedAt ? ' is-complete' : ''}`}>
                            {material.completedAt ? messages.materials.completedStatus : messages.materials.pendingStatus}
                          </span>
                        </a>
                      ) : (
                        <small className="report-session-no-file"><Paperclip size={14} />{messages.report.noSessionFiles}</small>
                      )}
                      {recording.transcript.length > 0 ? (
                        <>
                          <button
                            className={`recording-transcript-toggle${transcriptOpen ? ' is-open' : ''}`}
                            onClick={() => setOpenTranscript(transcriptOpen ? null : recording.id)}
                            aria-expanded={transcriptOpen}
                          >
                            <ChevronDown size={16} />{transcriptOpen ? messages.report.hideTranscript : messages.report.showTranscript(recording.transcript.length)}
                          </button>
                          {transcriptOpen && (
                            <ol className="recording-transcript">
                              {recording.transcript.map((turn, index) => (
                                <li key={index} className={turn.speaker === 'lumi' ? 'is-lumi' : 'is-child'}>
                                  <span>{turn.speaker === 'lumi' ? 'Lumi' : selectedChild?.firstName ?? 'Criança'}</span>
                                  <p>{turn.text}</p>
                                </li>
                              ))}
                            </ol>
                          )}
                        </>
                      ) : (
                        <small className="report-session-no-file">{messages.report.noTranscript}</small>
                      )}
                    </article>
                  );
                })}
              </div>
            </section>

            <section className="report-section" aria-labelledby="report-activities-title">
              <div className="report-section-head">
                <h2 id="report-activities-title">{messages.report.recent}</h2>
                <span className="report-count">{childCompletions.length}</span>
              </div>
              <div className="history-list">
                {childCompletions.length === 0 ? (
                  <div className="history-empty"><CalendarDays size={28} /><p>{messages.report.empty}</p></div>
                ) : childCompletions.map((completion) => (
                  <div className="history-item" key={completion.id}>
                    <span className="history-icon"><CheckCircle2 size={22} /></span>
                    <div><strong>{completion.activityTitle}</strong><small>{new Date(completion.completedAt).toLocaleDateString('pt-BR')}</small></div>
                    <Star size={19} fill="currentColor" />
                  </div>
                ))}
              </div>
            </section>
          </div>
        </main>
      </div>
    </section>
  );
}

function ReportState({ message, action }: { message: string; action?: () => void }) {
  return (
    <section className="report-screen">
      <div className={action ? 'error-message' : 'loading-spinner'}>
        {!action && <div className="spinner" />}
        <p>{message}</p>
        {action && <button className="button button-primary" onClick={action}>Voltar para perfis</button>}
      </div>
    </section>
  );
}
