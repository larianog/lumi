import NewProfileForm from '@/components/NewProfileForm';

type NewProfilePageProps = {
  searchParams: Promise<{ mode?: string; type?: string }>;
};

export default async function NewProfilePage({ searchParams }: NewProfilePageProps) {
  const query = await searchParams;
  const mode = query.mode === 'signin' ? 'signin' : 'signup';
  // type=child opens signup step 2 (children) for a signed-in family.
  const initialStep = mode === 'signup' && query.type === 'child' ? 'children' : 'parent';
  return <NewProfileForm authMode={mode} initialStep={initialStep} />;
}
