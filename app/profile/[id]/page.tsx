'use client';

import { useParams, useRouter } from 'next/navigation';
import {
  BookOpen,
  Camera,
  FileCheck2,
  Flame,
  Gamepad2,
  History,
  Library,
  LoaderCircle,
  Send,
  Star,
  Upload,
  WandSparkles,
  X,
} from 'lucide-react';
import { type ChangeEvent, useEffect, useRef, useState } from 'react';
import Brand from '@/components/Brand';
import LumiVoiceAgent from '@/components/LumiVoiceAgent';
import LumiMaterialLoading from '@/components/LumiMaterialLoading';
import MaterialStudyPageClient from '@/components/MaterialStudyPageClient';
import { calculateAge } from '@/lib/age';
import { prepareUploadFile } from '@/lib/prepare-upload';
import { messages } from '@/packages/i18n';
import type { ActivityCompletion, LiteracyLevel, Profile } from '@/types/database';
import type { MaterialUploadResponse, StudyMaterialDto } from '@/types/materials';

type ActivityId = 'school' | 'games' | 'stories' | 'suggest';

const activities: Array<{ id: ActivityId; icon: typeof BookOpen; accent: string }> = [
  { id: 'school', icon: BookOpen, accent: 'mint' },
  { id: 'games', icon: Gamepad2, accent: 'violet' },
  { id: 'stories', icon: Library, accent: 'sun' },
  { id: 'suggest', icon: WandSparkles, accent: 'rose' },
];

// Keep the original activity cards ready for a one-line rollback.
const SHOW_ACTIVITY_CARDS = false;

const LITERACY_OPTIONS: LiteracyLevel[] = ['pre_reader', 'emergent', 'fluent'];

function defaultLiteracy(age: number): LiteracyLevel {
  if (age <= 6) return 'pre_reader';
  if (age === 7) return 'emergent';
  return 'fluent';
}

export default function ProfilePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const profileId = params.id;
  const [profile, setProfile] = useState<Profile | null>(null);
  const [completions, setCompletions] = useState<ActivityCompletion[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<ActivityId>('school');
  const [selectedMaterial, setSelectedMaterial] = useState<File | null>(null);
  const [materialUploadState, setMaterialUploadState] = useState<'idle' | 'uploading'>('idle');
  const [materialError, setMaterialError] = useState('');
  const [studyMaterial, setStudyMaterial] = useState<StudyMaterialDto | null>(null);
  const [pendingMaterial, setPendingMaterial] = useState<StudyMaterialDto | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [loading, setLoading] = useState(true);
  const [literacyLevel, setLiteracyLevel] = useState<LiteracyLevel | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const cameraVideoRef = useRef<HTMLVideoElement>(null);
  const uploadController = useRef<AbortController | null>(null);

  useEffect(() => () => {
    uploadController.current?.abort();
    uploadController.current = null;
  }, [profileId]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setProfile(null);
    setStudyMaterial(null);
    setPendingMaterial(null);
    setSelectedMaterial(null);
    setMaterialUploadState('idle');
    setMaterialError('');
    setLiteracyLevel(null);
    setCameraOpen(false);
    const loadData = async () => {
      try {
        const [profileResponse, completionsResponse] = await Promise.all([
          fetch(`/api/profiles?profileId=${encodeURIComponent(profileId)}`, { cache: 'no-store' }),
          fetch(`/api/activities?profileId=${encodeURIComponent(profileId)}`, { cache: 'no-store' }),
        ]);
        if (!profileResponse.ok) return;
        const profileData = await profileResponse.json() as { profile: Profile; isDemo?: boolean };
        const completionData = completionsResponse.ok
          ? await completionsResponse.json() as ActivityCompletion[]
          : [];
        if (!cancelled) {
          setProfile(profileData.profile);
          setCompletions(completionData);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void loadData();
    return () => { cancelled = true; };
  }, [profileId]);

  useEffect(() => {
    if (!cameraOpen) return;

    let cancelled = false;
    let stream: MediaStream | null = null;
    const video = cameraVideoRef.current;

    const startCamera = async () => {
      setCameraReady(false);
      setCameraError('');

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: { facingMode: { ideal: 'environment' } },
        });

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        if (!video) return;
        video.srcObject = stream;
        await video.play();
        if (!cancelled) setCameraReady(true);
      } catch (error) {
        if (cancelled) return;
        const permissionDenied = error instanceof DOMException && error.name === 'NotAllowedError';
        setCameraError(permissionDenied ? messages.home.cameraPermission : messages.home.cameraUnavailable);
      }
    };

    void startCamera();

    return () => {
      cancelled = true;
      stream?.getTracks().forEach((track) => track.stop());
      if (video) video.srcObject = null;
    };
  }, [cameraOpen]);

  const openActivity = (activityId: ActivityId) => {
    setSelectedActivity(activityId);
    router.push(`/activity/${activityId}?profileId=${encodeURIComponent(profileId)}`);
  };

  const selectMaterial = (event: ChangeEvent<HTMLInputElement>) => {
    if (uploadController.current) return;
    const [file] = Array.from(event.currentTarget.files ?? []);
    if (!file) return;
    setSelectedMaterial(file);
    setMaterialUploadState('idle');
    setMaterialError('');
    event.currentTarget.value = '';
  };

  const uploadMaterial = async () => {
    if (!selectedMaterial || !profile || uploadController.current) return;
    const controller = new AbortController();
    uploadController.current = controller;
    setMaterialUploadState('uploading');
    setPendingMaterial(null);
    setMaterialError('');

    let accepted = false;
    try {
      const formData = new FormData();
      formData.set('profileId', profileId);
      formData.set('literacyLevel', literacyLevel ?? defaultLiteracy(calculateAge(profile.birthDate)));
      formData.set('file', await prepareUploadFile(selectedMaterial));
      if (controller.signal.aborted) return;
      const response = await fetch('/api/materials', { method: 'POST', body: formData, signal: controller.signal });
      const payload = await response.json() as MaterialUploadResponse & { error?: string };
      if (!response.ok || !payload.material?.id) {
        throw new Error(payload.error || messages.home.materialError);
      }
      if (payload.material.profileId !== profileId) throw new Error(messages.home.materialError);
      if (!controller.signal.aborted) {
        accepted = true;
        setPendingMaterial(payload.material);
      }
    } catch (error) {
      if (!controller.signal.aborted) setMaterialError(error instanceof Error ? error.message : messages.home.materialError);
    } finally {
      if (uploadController.current === controller) {
        uploadController.current = null;
        if (!accepted) setMaterialUploadState('idle');
      }
    }
  };

  // Send material directly without adult access check
  const sendMaterial = async () => {
    if (!selectedMaterial || materialUploadState === 'uploading') return;
    await uploadMaterial();
  };

  const openCamera = () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      cameraInputRef.current?.click();
      return;
    }
    setCameraOpen(true);
  };

  const useCameraFallback = () => {
    setCameraOpen(false);
    cameraInputRef.current?.click();
  };

  const capturePhoto = () => {
    const video = cameraVideoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) return;

    const maxWidth = 1920;
    const scale = Math.min(maxWidth / video.videoWidth, 1);
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);

    const context = canvas.getContext('2d');
    if (!context) return;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const photo = new File([blob], `material-${Date.now()}.jpg`, { type: 'image/jpeg' });
      setSelectedMaterial(photo);
      setMaterialUploadState('idle');
      setMaterialError('');
      setCameraOpen(false);
    }, 'image/jpeg', 0.9);
  };

  if (loading) return <PageState message={messages.common.loading} />;
  if (!profile) return <PageState message="Perfil não encontrado." action={() => router.push('/profiles')} />;

  const streakCount = Math.min(Math.max(completions.length, 2), 30);
  const starCount = completions.length * 10;
  const age = calculateAge(profile.birthDate);
  const selectedLiteracy = literacyLevel ?? defaultLiteracy(age);

  return (
    <section className="forest-screen home-screen">
      <div className="forest-overlay forest-overlay-home" />
      <header className="home-header">
        <Brand size="medium" />
        <div className="home-stats">
          <span><Flame size={18} />{streakCount} dias explorando</span>
          <span><Star size={18} fill="currentColor" />{starCount} estrelas</span>
        </div>
        <div className="home-profile-actions">
          <button className="home-history-button" onClick={() => router.push(`/profile/${profileId}/history`)}>
            <History size={18} />{messages.home.history}
          </button>
          <button className="mini-profile" onClick={() => router.push('/profiles')}>
            <span>{profile.firstName.slice(0, 1)}</span>{messages.home.switchProfile}
          </button>
        </div>
      </header>
      {studyMaterial ? (
        <MaterialStudyPageClient
          key={studyMaterial.id}
          profileId={profileId} materialId={studyMaterial.id}
          initialProfile={profile} initialMaterial={studyMaterial} embedded
          onBack={() => { setStudyMaterial(null); setSelectedMaterial(null); setMaterialError(''); }}
        />
      ) : <div className="home-layout">
        <aside className="home-lumi">
          <div className="lumi-halo" />
          {/* Lumi greets the child as soon as the profile screen opens. */}
          {materialUploadState === 'uploading' ? <LumiMaterialLoading loading={!pendingMaterial} onComplete={() => {
            if (!pendingMaterial) return;
            setStudyMaterial(pendingMaterial); setPendingMaterial(null); setMaterialUploadState('idle');
          }} /> : <LumiVoiceAgent
            profileName={profile.firstName}
            age={age}
            activityTitle={messages.activities[selectedActivity].title}
            autoStart
            variant="inline"
            avatarMode="local"
          />}
        </aside>
        <div className="activity-menu">
          <span className="eyebrow">{messages.home.greeting(profile.firstName)}</span>
          <h1>{messages.home.prompt}</h1>
          {SHOW_ACTIVITY_CARDS ? (
            <div className="activity-grid">
              {activities.map(({ id, icon: Icon, accent }) => {
                const copy = messages.activities[id];
                return (
                  <button key={id} className={`activity-card accent-${accent}`} onClick={() => openActivity(id)}>
                    <span className="activity-icon"><Icon size={29} /></span>
                    <span className="activity-copy"><strong>{copy.title}</strong><small>{copy.description}</small></span>
                    <span className="activity-badge">{copy.badge}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="study-source-panel" aria-busy={materialUploadState === 'uploading'}>
              <p>{messages.home.materialDescription}</p>
              <div className="study-source-actions">
                <button className="study-source-button" type="button" disabled={materialUploadState === 'uploading'} onClick={() => fileInputRef.current?.click()}>
                  <span className="study-source-icon accent-mint"><Upload size={30} /></span>
                  <span><strong>{messages.home.addFile}</strong><small>{messages.home.addFileHint}</small></span>
                </button>
                <button className="study-source-button" type="button" disabled={materialUploadState === 'uploading'} onClick={openCamera}>
                  <span className="study-source-icon accent-sun"><Camera size={30} /></span>
                  <span><strong>{messages.home.takePicture}</strong><small>{messages.home.takePictureHint}</small></span>
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                hidden
                disabled={materialUploadState === 'uploading'}
                onChange={selectMaterial}
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                hidden
                disabled={materialUploadState === 'uploading'}
                onChange={selectMaterial}
              />
              {selectedMaterial && (
                <fieldset className="study-literacy" disabled={materialUploadState === 'uploading'}>
                  <legend>{messages.home.literacyLabel}</legend>
                  {LITERACY_OPTIONS.map((level) => (
                    <label key={level} className={selectedLiteracy === level ? 'active' : ''}>
                      <input
                        type="radio"
                        name="literacyLevel"
                        value={level}
                        checked={selectedLiteracy === level}
                        onChange={() => setLiteracyLevel(level)}
                      />
                      {messages.home.literacy[level]}
                    </label>
                  ))}
                </fieldset>
              )}
              {selectedMaterial && (
                <div className="study-source-selection" role="status" aria-live="polite">
                  <div className="study-source-file">
                    <FileCheck2 size={20} />
                    <span>{messages.home.selectedFile(selectedMaterial.name)}</span>
                  </div>
                  <button
                    className="study-send-button"
                    type="button"
                    disabled={materialUploadState === 'uploading'}
                    onClick={() => void sendMaterial()}
                  >
                    {materialUploadState === 'uploading'
                      ? <LoaderCircle className="spin" size={19} />
                      : <Send size={19} />}
                    {materialUploadState === 'uploading' ? messages.home.extractingFile : messages.home.sendFile}
                  </button>
                </div>
              )}
              {materialError && <p className="study-source-error" role="alert">{materialError}</p>}
            </div>
          )}
        </div>
      </div>}

      {cameraOpen && (
        <div className="camera-modal" role="dialog" aria-modal="true" aria-labelledby="camera-title">
          <div className="camera-dialog">
            <button
              className="camera-close"
              type="button"
              aria-label={messages.home.closeCamera}
              onClick={() => setCameraOpen(false)}
            >
              <X size={22} />
            </button>
            <div className="camera-heading">
              <span className="camera-heading-icon"><Camera size={24} /></span>
              <div>
                <h2 id="camera-title">{messages.home.cameraTitle}</h2>
                <p>{messages.home.cameraInstructions}</p>
              </div>
            </div>
            <div className="camera-preview">
              <video ref={cameraVideoRef} autoPlay muted playsInline />
              {!cameraReady && !cameraError && (
                <div className="camera-loading"><LoaderCircle className="spin" size={30} /></div>
              )}
              {cameraError && <div className="camera-error">{cameraError}</div>}
              {cameraReady && <div className="camera-scan-frame" aria-hidden="true" />}
            </div>
            <div className="camera-actions">
              {cameraError ? (
                <button className="button button-secondary" type="button" onClick={useCameraFallback}>
                  <Upload size={19} />
                  {messages.home.cameraFallback}
                </button>
              ) : (
                <button
                  className="button button-primary camera-capture"
                  type="button"
                  disabled={!cameraReady}
                  onClick={capturePhoto}
                >
                  <Camera size={20} />
                  {messages.home.capturePhoto}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </section>
  );
}

function PageState({ message, action }: { message: string; action?: () => void }) {
  return (
    <section className="forest-screen home-screen">
      <div className="forest-overlay forest-overlay-home" />
      <div className={action ? 'error-message' : 'loading-spinner'}>
        {!action && <div className="spinner" />}
        <p>{message}</p>
        {action && <button className="button button-primary" onClick={action}>Voltar para perfis</button>}
      </div>
    </section>
  );
}
