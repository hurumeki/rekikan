'use client';

import { useState } from 'react';

interface Props {
  src: string;
  aspectClass: string;
  spec?: string;
}

export function ImageFilePreview({ src, aspectClass, spec }: Props) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-mono text-muted-foreground break-all">{src}</p>
      <PreviewImage key={src} src={src} aspectClass={aspectClass} />
      {spec && <p className="text-[10px] text-muted-foreground">{spec}</p>}
    </div>
  );
}

function PreviewImage({ src, aspectClass }: { src: string; aspectClass: string }) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'missing'>('loading');
  return (
    <div
      className={`${aspectClass} relative rounded border border-border bg-muted/30 overflow-hidden`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        onLoad={() => setStatus('loaded')}
        onError={() => setStatus('missing')}
        style={{ visibility: status === 'loaded' ? 'visible' : 'hidden' }}
      />
      {status !== 'loaded' && (
        <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground p-2 text-center">
          {status === 'loading' ? '読み込み中…' : '⚠️ ファイル未配置'}
        </div>
      )}
    </div>
  );
}
