'use client';

import type { GameMode, QuizProgress } from '@/lib/types';
import { getHistoricalStars, isOrderingMode } from '@/lib/progress';
import styles from './ModeSelector.module.css';

interface ModeSelectorProps {
  quizTitle: string;
  modes: GameMode[];
  onSelect: (mode: GameMode) => void;
  cardCount: number;
  progress: QuizProgress | null;
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

/** やさしい順。初めての人がいきなり難しいモードを選ばないようにする。 */
const MODE_ORDER: GameMode[] = ['careful', 'era_band', 'challenge', 'timeline', 'cross_region'];

function ModeStars({ stars }: { stars: number }) {
  return (
    <span className={styles.stars} aria-label={`${stars}つ星`}>
      {[1, 2, 3].map((i) => (
        <span key={i} className={i <= stars ? styles.starFilled : styles.starEmpty}>
          ★
        </span>
      ))}
    </span>
  );
}

export default function ModeSelector({
  quizTitle,
  modes,
  onSelect,
  cardCount,
  progress,
}: ModeSelectorProps) {
  const sorted = [...modes].sort((a, b) => MODE_ORDER.indexOf(a) - MODE_ORDER.indexOf(b));

  // まだ遊んでいないモードのうち、いちばんやさしいものをすすめる
  const recommended =
    sorted.find((mode) => !progress?.modes[mode]) ??
    sorted.find((mode) => !progress?.modes[mode]?.cleared) ??
    null;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{quizTitle}</h2>
      <p className={styles.subtitle}>カード{cardCount}枚</p>
      <div className={styles.modes}>
        {sorted.map((mode) => {
          const modeProgress = progress?.modes[mode] ?? null;
          const stars = getHistoricalStars(modeProgress, cardCount);
          const isRecommended = mode === recommended;

          return (
            <button
              key={mode}
              className={`${styles.modeButton} ${isRecommended ? styles.recommended : ''}`}
              onClick={() => onSelect(mode)}
              data-testid="mode-button"
            >
              <div className={styles.modeMain}>
                <div className={styles.modeName}>
                  {modeInfo[mode].name}
                  {isRecommended && <span className={styles.recommendBadge}>おすすめ</span>}
                </div>
                <div className={styles.modeDesc}>{modeInfo[mode].desc}</div>
                {!isOrderingMode(mode) && (
                  <div className={styles.modeNote}>※解放条件には含まれません</div>
                )}
              </div>
              <div className={styles.modeStatus}>
                {modeProgress ? (
                  <ModeStars stars={stars} />
                ) : (
                  <span className={styles.unplayed}>未プレイ</span>
                )}
                {modeProgress && (
                  <span className={styles.bestScore}>
                    ベスト {modeProgress.bestScore} / {cardCount}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
      {progress && progress.attemptCount > 0 && (
        <p className={styles.totalAttempts}>
          このクイズの挑戦回数: {progress.attemptCount}回{progress.cleared && ' ・ クリア済み'}
        </p>
      )}
    </div>
  );
}
