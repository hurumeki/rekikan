import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'れきかん',
  description: '歴史の感覚をつかむ',
};

// Meta-equivalents for security headers — used on hosts that don't let us set
// real HTTP headers (e.g. GitHub Pages). Netlify sets the canonical headers
// (including frame-ancestors, which is ignored via <meta>) in netlify.toml.
//
// 'unsafe-inline' for script-src is required because Next.js static export
// emits inline hydration scripts (<script>self.__next_f=...</script>) and
// `output: 'export'` cannot inject per-request nonces. The app loads no
// third-party scripts, so the residual XSS surface is React's default
// escaping plus 'self' for external script files.
const CSP =
  "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self'; base-uri 'self'; form-action 'self'";

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
