'use client';

import { useCallback, useMemo, useState } from 'react';
import type { Card, CardResult, EraColor, GameMode, Quiz, QuizProgress } from '@/lib/types';
import { getRegion, getRegions } from '@/lib/data-loader';
import ModeSelector from '@/components/quiz/ModeSelector';
import CarefulMode from '@/components/quiz/CarefulMode';
import OrderingMode from '@/components/quiz/OrderingMode';
import EraBandQuiz from '@/components/quiz/EraBandQuiz';
import TimelinePlacementQuiz from '@/components/quiz/TimelinePlacementQuiz';
import HintToggle from '@/components/quiz/HintToggle';
import ResultScreen from '@/components/result/ResultScreen';
import styles from './QuizRunner.module.css';

type Phase = 'mode-select' | 'playing' | 'result';

/** タイムラインの左端を丸める単位を、扱う期間の長さから決める */
function roundingUnit(span: number): number {
  if (span > 10000) return 1000;
  if (span > 2000) return 100;
  if (span > 300) return 10;
  return 1;
}

interface QuizRunnerProps {
  quiz: Quiz;
  cards: Card[];
  /** モード選択画面に出す記録。復習など記録を持たない場合は null */
  progress: QuizProgress | null;
  /** 解答が終わったときに呼ばれる。保存はここで行う */
  onComplete: (args: {
    mode: GameMode;
    results: CardResult[];
    score: number;
    total: number;
    hintUsed: boolean;
    /** 出題したカード（統計に地域を記録するために渡す） */
    cards: Card[];
  }) => void;
  /** 「クイズ一覧に戻る」など、この画面を抜けるとき */
  onExit: () => void;
  exitLabel: string;
  /** 同一モードの前回ベスト（リザルトの比較表示用） */
  getPreviousBest: (mode: GameMode) => number | null;
}

export default function QuizRunner({
  quiz,
  cards,
  progress,
  onComplete,
  onExit,
  exitLabel,
  getPreviousBest,
}: QuizRunnerProps) {
  const region = getRegion(quiz.region);
  const allRegions = getRegions();

  const correctOrder = quiz.card_ids;

  // eraColors: flat map of key → color string (for Card component)
  const eraColors = useMemo<Record<string, string>>(() => {
    const colors: Record<string, string> = {};
    for (const [key, ec] of Object.entries(region?.era_colors ?? {})) {
      colors[key] = ec.color;
    }
    // 複数地域のカードが混ざるクイズでは、関係する地域の色をすべて取り込む
    const extraRegions = quiz.regions ?? [...new Set(cards.map((c) => c.region))];
    for (const rid of extraRegions) {
      const r = allRegions.find((x) => x.id === rid);
      if (r) {
        for (const [key, ec] of Object.entries(r.era_colors)) {
          colors[key] = ec.color;
        }
      }
    }
    return colors;
  }, [region, quiz, cards, allRegions]);

  // eraConfig: full EraColor objects (label + color) for EraBandQuiz / TimelinePlacementQuiz
  const eraConfig = useMemo<Record<string, EraColor>>(() => region?.era_colors ?? {}, [region]);

  const timelineRange = useMemo(() => {
    if (quiz.timeline_range) return quiz.timeline_range;
    if (cards.length === 0) return { start: 0, end: 2000 };
    const years = cards.map((c) => c.year);
    const min = Math.min(...years);
    const max = Math.max(...years);
    const padding = Math.round((max - min) * 0.15) || 50;
    const currentYear = new Date().getFullYear();
    // Don't extend timeline into the future beyond current year
    const end = Math.min(max + padding, Math.max(max + 10, currentYear));
    // 端の目盛りが「前11,780年」のような半端な数にならないよう丸める
    const unit = roundingUnit(max - min);
    return { start: Math.floor((min - padding) / unit) * unit, end };
  }, [quiz, cards]);

  const [phase, setPhase] = useState<Phase>('mode-select');
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null);
  const [hintEnabled, setHintEnabled] = useState(false);
  // 「ヒントありクリア」は終了時の状態ではなく、
  // 一度でもヒントを出したかで判定する（途中で OFF に戻しても記録は残る）
  const [hintUsedInPlay, setHintUsedInPlay] = useState(false);
  // 再挑戦のたびに増やして、各モードのコンポーネントを作り直す（カードの再シャッフル）
  const [playCount, setPlayCount] = useState(0);
  const [resultData, setResultData] = useState<{
    results: CardResult[];
    score: number;
    total: number;
    mode: GameMode;
    previousBest: number | null;
  } | null>(null);

  const handleModeSelect = useCallback(
    (mode: GameMode) => {
      setSelectedMode(mode);
      setHintUsedInPlay(hintEnabled);
      setPlayCount((n) => n + 1);
      setPhase('playing');
    },
    [hintEnabled],
  );

  const handleToggleHint = useCallback(() => {
    setHintEnabled((prev) => {
      if (!prev) setHintUsedInPlay(true);
      return !prev;
    });
  }, []);

  const handleComplete = useCallback(
    (results: CardResult[], score: number, total: number) => {
      const mode = selectedMode!;
      const previousBest = getPreviousBest(mode);
      setResultData({ results, score, total, mode, previousBest });
      onComplete({ mode, results, score, total, hintUsed: hintUsedInPlay, cards });
      setPhase('result');
    },
    [selectedMode, hintUsedInPlay, onComplete, getPreviousBest, cards],
  );

  const handleRetry = useCallback(() => {
    setResultData(null);
    setHintUsedInPlay(hintEnabled);
    setPlayCount((n) => n + 1);
    setPhase('playing');
  }, [hintEnabled]);

  const handleBackToModes = useCallback(() => {
    setResultData(null);
    setSelectedMode(null);
    setPhase('mode-select');
  }, []);

  const commonProps = {
    cards,
    correctOrder,
    eraColors,
    hintEnabled,
    onComplete: handleComplete,
  };

  return (
    <div className={styles.container}>
      <button className={styles.exitButton} onClick={onExit}>
        ← {exitLabel}
      </button>

      {phase === 'mode-select' && (
        <ModeSelector
          quizTitle={quiz.title}
          modes={quiz.modes}
          onSelect={handleModeSelect}
          cardCount={cards.length}
          progress={progress}
        />
      )}

      {phase === 'playing' && selectedMode && (
        <>
          <div className={styles.playHeader}>
            <h3 className={styles.playTitle}>{quiz.title}</h3>
            <HintToggle enabled={hintEnabled} onToggle={handleToggleHint} />
          </div>
          {selectedMode === 'careful' && <CarefulMode key={playCount} {...commonProps} />}
          {selectedMode === 'challenge' && <OrderingMode key={playCount} {...commonProps} />}
          {selectedMode === 'era_band' && (
            <EraBandQuiz key={playCount} {...commonProps} eraConfig={eraConfig} />
          )}
          {selectedMode === 'timeline' && (
            <TimelinePlacementQuiz
              key={playCount}
              {...commonProps}
              eraConfig={eraConfig}
              timelineRange={timelineRange}
            />
          )}
          {selectedMode === 'cross_region' && (
            <OrderingMode key={playCount} {...commonProps} regions={allRegions} />
          )}
        </>
      )}

      {phase === 'result' && resultData && (
        <ResultScreen
          cards={cards}
          results={resultData.results}
          correctOrder={correctOrder}
          score={resultData.score}
          total={resultData.total}
          eraColors={eraColors}
          mode={resultData.mode}
          previousBest={resultData.previousBest}
          onRetry={handleRetry}
          onChangeMode={handleBackToModes}
          onHome={onExit}
          regions={resultData.mode === 'cross_region' ? allRegions : undefined}
        />
      )}
    </div>
  );
}
