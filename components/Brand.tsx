import Image from 'next/image';
import { messages } from '@/packages/i18n';

type BrandProps = {
  size?: 'small' | 'medium' | 'large';
  priority?: boolean;
};

const markSizes = {
  small: 34,
  medium: 46,
  large: 68,
} as const;

export default function Brand({ size = 'medium', priority = false }: BrandProps) {
  const markSize = markSizes[size];

  return (
    <div className={`brand brand-${size}`} aria-label={messages.brand.name}>
      <Image
        className="brand-mark"
        src="/assets/lumi-mark.png"
        alt=""
        width={markSize}
        height={markSize}
        priority={priority}
      />
      <span>{messages.brand.name}</span>
    </div>
  );
}
