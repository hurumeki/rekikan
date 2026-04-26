import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'れきかん',
  description: '歴史の感覚をつかむ',
};

// Meta-equivalents for security headers — used on hosts that don't let us set
// real HTTP headers (e.g. GitHub Pages). Netlify sets the canonical headers
// via netlify.toml.
const CSP =
  "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <meta httpEquiv="Content-Security-Policy" content={CSP} />
        <meta name="referrer" content="strict-origin-when-cross-origin" />
      </head>
      <body>{children}</body>
    </html>
  );
}
