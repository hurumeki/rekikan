'use client';

import { Suspense, useState, useSyncExternalStore } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getRegions, getRegion, getNodesForRegion } from '@/lib/data-loader';
import { getProgressSnapshot, getServerProgressSnapshot, subscribeProgress } from '@/lib/progress';
import {
  getWeakCardCountSnapshot,
  getServerWeakCardCountSnapshot,
  subscribeCardStats,
} from '@/lib/card-stats';
import type { Region } from '@/lib/types';
import { REVIEW_MIN_CARDS } from '@/app/review/ReviewClient';
import RegionSelector from '@/components/home/RegionSelector';
import QuizList from '@/components/home/QuizList';
import styles from './page.module.css';

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const regions = getRegions();
  const initialRegionId = searchParams.get('region');
  const initialRegion = initialRegionId ? (getRegion(initialRegionId) ?? null) : null;
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(initialRegion);
  // 進捗は localStorage にしかないため、静的書き出し時は空で描画し、
  // マウント後に実際の値へ切り替える（ハイドレーション不一致の回避）
  const progress = useSyncExternalStore(
    subscribeProgress,
    getProgressSnapshot,
    getServerProgressSnapshot,
  );
  const weakCardCount = useSyncExternalStore(
    subscribeCardStats,
    getWeakCardCountSnapshot,
    getServerWeakCardCountSnapshot,
  );

  const handleSelectRegion = (regionId: string) => {
    const region = getRegion(regionId);
    if (region) setSelectedRegion(region);
  };

  const handleSelectQuiz = (quizId: string) => {
    router.push(`/quiz/${quizId}`);
  };

  return (
    <div className={styles.main}>
      {!selectedRegion && (
        <div className={styles.header}>
          <div className={styles.title}>れきかん</div>
          <div className={styles.subtitle}>歴史の感覚をつかむ</div>
        </div>
      )}

      {selectedRegion ? (
        <QuizList
          region={selectedRegion}
          nodes={getNodesForRegion(selectedRegion.id)}
          onSelectQuiz={handleSelectQuiz}
          onBack={() => setSelectedRegion(null)}
          progress={progress}
        />
      ) : (
        <>
          {weakCardCount >= REVIEW_MIN_CARDS && (
            <button
              className={styles.reviewCard}
              onClick={() => router.push('/review')}
              data-testid="review-entry"
            >
              <span className={styles.reviewIcon} aria-hidden="true">
                🔁
              </span>
              <span className={styles.reviewBody}>
                <span className={styles.reviewTitle}>苦手カードの復習</span>
                <span className={styles.reviewDesc}>
                  間違えたカード{weakCardCount}枚から出題します
                </span>
              </span>
            </button>
          )}
          <RegionSelector regions={regions} onSelect={handleSelectRegion} progress={progress} />
        </>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <Suspense>
      <HomeContent />
    </Suspense>
  );
}
