import MaterialHistoryPageClient from '@/components/MaterialHistoryPageClient';

type MaterialHistoryPageProps = {
  params: Promise<{ id: string }>;
};

export default async function MaterialHistoryPage({ params }: MaterialHistoryPageProps) {
  const { id } = await params;
  return <MaterialHistoryPageClient profileId={id} />;
}
