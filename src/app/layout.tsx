import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'れきかん',
  description: '歴史の感覚をつかむ',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
