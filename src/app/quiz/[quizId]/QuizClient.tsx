'use client';

import { useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getQuiz, getCardsForQuiz, getRegion } from '@/lib/data-loader';
import { saveQuizResult } from '@/lib/progress';
import type { GameMode, CardResult } from '@/lib/types';
import ModeSelector from '@/components/quiz/ModeSelector';
import CarefulMode from '@/components/quiz/CarefulMode';
import ChallengeMode from '@/components/quiz/ChallengeMode';
import HintToggle from '@/components/quiz/HintToggle';
import ResultScreen from '@/components/result/ResultScreen';

type Phase = 'mode-select' | 'playing' | 'result';

export default function QuizClient() {
  const params = useParams();
  const router = useRouter();
  const quizId = params.quizId as string;

  const quiz = getQuiz(quizId);
  const cards = quiz ? getCardsForQuiz(quiz) : [];
  const region = quiz ? getRegion(quiz.region) : undefined;

  const correctOrder = quiz?.card_ids ?? [];
  const eraColors: Record<string, string> = {};
  if (region) {
    for (const [key, ec] of Object.entries(region.era_colors)) {
      eraColors[key] = ec.color;
    }
  }

  const [phase, setPhase] = useState<Phase>('mode-select');
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null);
  const [hintEnabled, setHintEnabled] = useState(false);
  const [resultData, setResultData] = useState<{
    results: CardResult[];
    score: number;
    total: number;
  } | null>(null);

  const handleModeSelect = (mode: GameMode) => {
    setSelectedMode(mode);
    setPhase('playing');
  };

  const handleComplete = useCallback(
    (results: CardResult[], score: number, total: number) => {
      setResultData({ results, score, total });
      if (quiz) {
        saveQuizResult({
          quizId: quiz.id,
          mode: selectedMode!,
          score,
          total,
          hintUsed: hintEnabled,
          cardResults: results,
          timestamp: new Date().toISOString(),
        });
      }
      setPhase('result');
    },
    [quiz, selectedMode, hintEnabled],
  );

  const handleRetry = () => {
    setResultData(null);
    setPhase('playing');
  };

  const handleBackToList = () => {
    router.push(quiz ? `/?region=${quiz.region}` : '/');
  };

  if (!quiz || cards.length === 0) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <p>クイズが見つかりませんでした</p>
        <button onClick={() => router.push('/')}>ホームに戻る</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '16px', width: '100%' }}>
      <button
        onClick={handleBackToList}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          background: 'none',
          border: 'none',
          color: 'var(--badge-bg)',
          fontSize: '0.9rem',
          fontWeight: 600,
          padding: '4px 0',
          marginBottom: 12,
          cursor: 'pointer',
        }}
      >
        ← クイズ一覧
      </button>

      {phase === 'mode-select' && (
        <ModeSelector quizTitle={quiz.title} modes={quiz.modes} onSelect={handleModeSelect} />
      )}

      {phase === 'playing' && selectedMode && (
        <>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 12,
            }}
          >
            <h3 style={{ margin: 0, fontSize: '1rem' }}>{quiz.title}</h3>
            <HintToggle enabled={hintEnabled} onToggle={() => setHintEnabled(!hintEnabled)} />
          </div>
          {selectedMode === 'careful' ? (
            <CarefulMode
              key={resultData === null ? 'a' : 'b'}
              cards={cards}
              correctOrder={correctOrder}
              eraColors={eraColors}
              hintEnabled={hintEnabled}
              onComplete={handleComplete}
            />
          ) : (
            <ChallengeMode
              key={resultData === null ? 'a' : 'b'}
              cards={cards}
              correctOrder={correctOrder}
              eraColors={eraColors}
              hintEnabled={hintEnabled}
              onComplete={handleComplete}
            />
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
          onRetry={handleRetry}
          onHome={handleBackToList}
        />
      )}
    </div>
  );
}
