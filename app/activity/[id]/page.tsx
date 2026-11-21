import { notFound } from 'next/navigation';
import ActivityPageClient from '@/components/ActivityPageClient';

const activityIds = ['school', 'games', 'stories', 'suggest'] as const;
type ActivityId = (typeof activityIds)[number];

type ActivityPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ profileId?: string }>;
};

export default async function ActivityPage({ params, searchParams }: ActivityPageProps) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  if (!activityIds.includes(id as ActivityId) || !query.profileId) notFound();
  return <ActivityPageClient activityId={id as ActivityId} profileId={query.profileId} />;
}
