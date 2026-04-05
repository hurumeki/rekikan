'use client';

import type { Region } from '@/lib/types';
import styles from './RegionSelector.module.css';

interface RegionSelectorProps {
  regions: Region[];
  onSelect: (regionId: string) => void;
}

export default function RegionSelector({ regions, onSelect }: RegionSelectorProps) {
  return (
    <div className={styles.container}>
      {regions.map((region) => (
        <button
          key={region.id}
          className={styles.regionCard}
          style={{ borderLeft: `4px solid ${region.color}` }}
          onClick={() => onSelect(region.id)}
        >
          <span className={styles.emoji}>{region.emoji}</span>
          <span className={styles.label}>{region.label}</span>
        </button>
      ))}
    </div>
  );
}
