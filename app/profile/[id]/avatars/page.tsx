import LumiAvatarPickerClient from '@/components/LumiAvatarPickerClient';

type LumiAvatarPageProps = {
  params: Promise<{ id: string }>;
};

export default async function LumiAvatarPage({ params }: LumiAvatarPageProps) {
  const { id } = await params;
  return <LumiAvatarPickerClient profileId={id} />;
}
