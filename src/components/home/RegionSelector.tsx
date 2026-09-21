'use client';

import { useMemo } from 'react';
import type { Region } from '@/lib/types';
import { ALL_QUIZZES } from '@/lib/data-registry';
import type { ProgressMap } from '@/lib/unlock';
import styles from './RegionSelector.module.css';

interface RegionSelectorProps {
  regions: Region[];
  onSelect: (regionId: string) => void;
  progress: ProgressMap;
}

/**
 * 11 地域を等価に並べると「どれから始めるか」の手がかりがないため、
 * 役割ごとにまとめて見せる。
 */
const GROUPS: { label: string; description: string; match: (id: string) => boolean }[] = [
  {
    label: 'まずはここから',
    description: '身近な歴史の流れをつかむ',
    match: (id) => id === 'japan',
  },
  {
    label: '世界の地域史',
    description: '地域ごとに時代の流れをたどる',
    match: (id) => id !== 'japan' && id !== 'world',
  },
  {
    label: 'テーマ史・同時代史',
    description: '地域をまたいで並べる（地域史をクリアすると解放）',
    match: (id) => id === 'world',
  },
];

export default function RegionSelector({ regions, onSelect, progress }: RegionSelectorProps) {
  const quizCountByRegion = useMemo(() => {
    const counts = new Map<string, string[]>();
    for (const quiz of ALL_QUIZZES) {
      const list = counts.get(quiz.region) ?? [];
      list.push(quiz.id);
      counts.set(quiz.region, list);
    }
    return counts;
  }, []);

  const renderRegion = (region: Region) => {
    const quizIds = quizCountByRegion.get(region.id) ?? [];
    const cleared = quizIds.filter((id) => progress[id]?.cleared).length;
    const pct = quizIds.length > 0 ? (cleared / quizIds.length) * 100 : 0;

    return (
      <button
        key={region.id}
        className={styles.regionCard}
        style={{ borderLeft: `4px solid ${region.color}` }}
        onClick={() => onSelect(region.id)}
        data-testid="region-card"
      >
        <span className={styles.emoji} aria-hidden="true">
          {region.emoji}
        </span>
        <span className={styles.body}>
          <span className={styles.label}>{region.label}</span>
          {quizIds.length > 0 && (
            <span className={styles.progressRow}>
              <span className={styles.progressBar}>
                <span
                  className={styles.progressFill}
                  style={{ width: `${pct}%`, background: region.color }}
                />
              </span>
              <span className={styles.progressLabel}>
                {cleared} / {quizIds.length}
              </span>
            </span>
          )}
        </span>
      </button>
    );
  };

  return (
    <div className={styles.container}>
      {GROUPS.map((group) => {
        const members = regions.filter((r) => group.match(r.id));
        if (members.length === 0) return null;
        return (
          <section key={group.label} className={styles.group}>
            <h2 className={styles.groupLabel}>{group.label}</h2>
            <p className={styles.groupDescription}>{group.description}</p>
            <div className={styles.groupItems}>{members.map(renderRegion)}</div>
          </section>
        );
      })}
    </div>
  );
}
