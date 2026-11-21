import MaterialStudyPageClient from '@/components/MaterialStudyPageClient';

type MaterialStudyPageProps = {
  params: Promise<{ id: string; materialId: string }>;
};

export default async function MaterialStudyPage({ params }: MaterialStudyPageProps) {
  const { id, materialId } = await params;
  return <MaterialStudyPageClient profileId={id} materialId={materialId} />;
}
