import type { Metadata, Viewport } from 'next';
import './globals.css';
import './lumi.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#082f2b',
};

export const metadata: Metadata = {
  title: 'Lumi | Aprender é uma aventura',
  description: 'Experiências de aprendizagem com voz e avatar para crianças de 6 a 10 anos.',
  icons: {
    icon: [{ url: '/assets/lumi-mark.png', type: 'image/png' }],
    apple: [{ url: '/assets/lumi-mark.png', type: 'image/png' }],
    other: [
      {
        url: '/assets/lumi-mark.png',
        sizes: '1254x1254',
        type: 'image/png',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
