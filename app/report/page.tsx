'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CalendarDays, CheckCircle2, FileText, Plus, Star } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import Brand from '@/components/Brand';
import { messages } from '@/packages/i18n';
import type { ActivityCompletion, Family } from '@/types/database';
import type { StudyMaterialDto } from '@/types/materials';

const profileColors = ['#eaf9bb', '#a8e6cf', '#d7c5f4', '#ffd79b', '#ffc9d6'];

export default function ReportPage() {
  const router = useRouter();
  const [family, setFamily] = useState<Family | null>(null);
  const [completions, setCompletions] = useState<ActivityCompletion[]>([]);
  const [materials, setMaterials] = useState<StudyMaterialDto[]>([]);
  const [selectedChildId, setSelectedChildId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    const loadData = async () => {
      try {
        const [familyResponse, progressResponse, materialsResponse] = await Promise.all([
          fetch('/api/profiles', { cache: 'no-store' }),
          fetch('/api/activities?scope=family', { cache: 'no-store' }),
          fetch('/api/materials?scope=family', { cache: 'no-store' }),
        ]);
        if (!familyResponse.ok || !progressResponse.ok || !materialsResponse.ok) {
          const adultAccessRequired = progressResponse.status === 403 || materialsResponse.status === 403;
          if (!cancelled) setError(adultAccessRequired ? 'Confirme a senha do responsável para abrir o relatório.' : 'Não foi possível carregar o relatório.');
          return;
        }
        const familyData = await familyResponse.json() as { family: Family };
        const progressData = await progressResponse.json() as ActivityCompletion[];
        const materialsData = await materialsResponse.json() as StudyMaterialDto[];
        const firstChild = familyData.family.profiles.find((profile) => profile.type === 'child');
        if (!cancelled) {
          setFamily(familyData.family);
          setCompletions(progressData);
          setMaterials(materialsData);
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
  const pendingMaterials = childMaterials.filter((material) => !material.completedAt && material.extractionStatus !== 'failed');

  if (loading) return <ReportState message={messages.common.loading} />;
  if (!family) return <ReportState message={error || 'Nenhuma família encontrada.'} action={() => router.push('/profiles')} />;

  return (
    <section className="report-screen">
      <header className="report-header">
        <button className="back-button" onClick={() => router.push('/profiles')}><ArrowLeft size={19} />{messages.common.back}</button>
        <Brand size="small" />
        <span>{adultProfile?.firstName || messages.auth.adult}</span>
      </header>
      <div className="report-layout">
        <aside className="report-sidebar">
          <span className="eyebrow">{messages.profiles.adultArea}</span>
          <h1>{messages.report.title}</h1>
          <p>{messages.report.subtitle}</p>
          <div className="child-tabs">
            {childProfiles.map((child) => (
              <button key={child.id} className={selectedChildId === child.id ? 'active' : ''} onClick={() => setSelectedChildId(child.id)}>
                <span style={{ background: profileColors[child.avatar % profileColors.length] }}>{child.firstName.slice(0, 1)}</span>
                {child.firstName}
              </button>
            ))}
          </div>
          <button className="button button-secondary" onClick={() => router.push('/new-profile?mode=signup&type=child')}><Plus size={18} />{messages.report.addChild}</button>
        </aside>
        <div className="report-content">
          <div className="report-hero">
            <div><span className="eyebrow">{selectedChild?.firstName}</span><strong>{childCompletions.length + completedMaterials.length}</strong><p>{messages.report.completed}</p><small>{pendingMaterials.length} {messages.report.pendingMaterials}</small></div>
            <Image src="/assets/lumi-avatar.png" alt="" width={180} height={200} />
          </div>
          <h2>{messages.report.recent}</h2>
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
          <h2>{messages.report.materials}</h2>
          <div className="history-list">
            {childMaterials.length === 0 ? (
              <div className="history-empty"><FileText size={28} /><p>{messages.report.noMaterials}</p></div>
            ) : childMaterials.map((material) => (
              <div className="history-item" key={material.id}>
                <span className="history-icon"><FileText size={22} /></span>
                <div><strong>{material.originalName}</strong><small>{new Date(material.createdAt).toLocaleDateString('pt-BR')}</small></div>
                <span className={`report-material-status${material.completedAt ? ' is-complete' : ''}`}>
                  {material.completedAt ? messages.materials.completedStatus : messages.materials.pendingStatus}
                </span>
              </div>
            ))}
          </div>
        </div>
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
