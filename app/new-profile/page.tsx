import NewProfileForm from '@/components/NewProfileForm';

type NewProfilePageProps = {
  searchParams: Promise<{ mode?: string; type?: string }>;
};

export default async function NewProfilePage({ searchParams }: NewProfilePageProps) {
  const query = await searchParams;
  const mode = query.mode === 'signin' ? 'signin' : 'signup';
  const profileType = query.type === 'child' ? 'child' : 'adult';
  return <NewProfileForm authMode={mode} initialProfileType={profileType} />;
}
