'use client';

import { useState } from 'react';
import styles from './NodeCoverImage.module.css';

interface NodeCoverImageProps {
  src: string;
  alt?: string;
}

export default function NodeCoverImage({ src, alt = '' }: NodeCoverImageProps) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className={styles.cover}
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      data-testid="node-cover-image"
    />
  );
}
