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
import { buildTimelineRange } from '@/lib/timeline-scale';
import styles from './QuizRunner.module.css';

type Phase = 'mode-select' | 'playing' | 'result';

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

  const timelineRange = useMemo(
    () => quiz.timeline_range ?? buildTimelineRange(cards),
    [quiz, cards],
  );

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

  // 並べ替え系モードだけが正解順を必要とする（mode-props.ts 参照）
  const modeProps = { cards, eraColors, hintEnabled, onComplete: handleComplete };
  const orderingProps = { ...modeProps, correctOrder };

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
          {selectedMode === 'careful' && <CarefulMode key={playCount} {...orderingProps} />}
          {selectedMode === 'challenge' && <OrderingMode key={playCount} {...orderingProps} />}
          {selectedMode === 'era_band' && (
            <EraBandQuiz key={playCount} {...modeProps} eraConfig={eraConfig} />
          )}
          {selectedMode === 'timeline' && (
            <TimelinePlacementQuiz
              key={playCount}
              {...modeProps}
              eraConfig={eraConfig}
              timelineRange={timelineRange}
            />
          )}
          {selectedMode === 'cross_region' && (
            <OrderingMode key={playCount} {...orderingProps} regions={allRegions} />
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
