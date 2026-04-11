'use client';

import type { GameMode } from '@/lib/types';
import styles from './ModeSelector.module.css';

interface ModeSelectorProps {
  quizTitle: string;
  modes: GameMode[];
  onSelect: (mode: GameMode) => void;
}

const modeInfo: Record<GameMode, { name: string; desc: string }> = {
  careful: {
    name: 'じっくりモード',
    desc: '1番古いのはどれ？を繰り返す',
  },
  challenge: {
    name: 'チャレンジモード',
    desc: '全カードを並べて一括判定',
  },
  timeline: {
    name: 'タイムラインモード',
    desc: '年表のどこに位置するか感じとる',
  },
  era_band: {
    name: '時代帯当てモード',
    desc: 'どの時代に属するかを当てる',
  },
  cross_region: {
    name: '同時代モード',
    desc: '世界各地の出来事を時系列で並べる',
  },
};

export default function ModeSelector({ quizTitle, modes, onSelect }: ModeSelectorProps) {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{quizTitle}</h2>
      <div className={styles.modes}>
        {modes.map((mode) => (
          <button key={mode} className={styles.modeButton} onClick={() => onSelect(mode)}>
            <div className={styles.modeName}>{modeInfo[mode].name}</div>
            <div className={styles.modeDesc}>{modeInfo[mode].desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
