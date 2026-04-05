'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getRegions, getRegion, getNodesForRegion } from '@/lib/data-loader';
import { getAllProgress } from '@/lib/progress';
import type { Region, QuizProgress } from '@/lib/types';
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
  const [progress] = useState<Record<string, QuizProgress>>(getAllProgress);

  const handleSelectRegion = (regionId: string) => {
    const region = getRegion(regionId);
    if (region) setSelectedRegion(region);
  };

  const handleSelectQuiz = (quizId: string) => {
    router.push(`/quiz/${quizId}`);
  };

  return (
    <div className={styles.main}>
      <div className={styles.header}>
        <div className={styles.title}>れきかん</div>
        <div className={styles.subtitle}>歴史の感覚をつかむ</div>
      </div>

      {selectedRegion ? (
        <QuizList
          region={selectedRegion}
          nodes={getNodesForRegion(selectedRegion.id)}
          onSelectQuiz={handleSelectQuiz}
          onBack={() => setSelectedRegion(null)}
          progress={progress}
        />
      ) : (
        <RegionSelector regions={regions} onSelect={handleSelectRegion} />
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
