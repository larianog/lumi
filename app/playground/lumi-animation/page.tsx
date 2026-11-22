import type { Metadata } from 'next';
import LumiAnimationPlayground from '@/components/playground/LumiAnimationPlayground';

export const metadata: Metadata = {
  title: 'Lumi | Playground de animação',
  description: 'Experimente movimentos e compare presets da Lumi no Lemon Slice.',
  robots: { index: false, follow: false },
};

export default function LumiAnimationPage() {
  return <LumiAnimationPlayground />;
}
