'use client';

import styles from './HintToggle.module.css';

interface HintToggleProps {
  enabled: boolean;
  onToggle: () => void;
}

export default function HintToggle({ enabled, onToggle }: HintToggleProps) {
  return (
    <button className={`${styles.toggle} ${enabled ? styles.active : ''}`} onClick={onToggle}>
      {enabled ? 'ヒント ON' : 'ヒント OFF'}
    </button>
  );
}
