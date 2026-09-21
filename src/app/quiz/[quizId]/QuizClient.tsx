'use client';

import { useCallback, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getQuiz, getCardsForQuiz } from '@/lib/data-loader';
import { saveQuizResult, getQuizProgress } from '@/lib/progress';
import { recordCardResults } from '@/lib/card-stats';
import type { GameMode } from '@/lib/types';
import QuizRunner from '@/components/quiz/QuizRunner';

export default function QuizClient() {
  const params = useParams();
  const router = useRouter();
  const quizId = params.quizId as string;

  const quiz = getQuiz(quizId);
  const cards = useMemo(() => (quiz ? getCardsForQuiz(quiz) : []), [quiz]);

  // 結果保存のたびに増やして、モード選択画面の記録を読み直す
  const [progressVersion, setProgressVersion] = useState(0);
  const progress = useMemo(
    () => (quiz ? getQuizProgress(quiz.id) : null),
    // progressVersion は保存後の読み直しトリガー
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [quiz, progressVersion],
  );

  const handleComplete = useCallback(
    ({
      mode,
      results,
      score,
      total,
      hintUsed,
    }: {
      mode: GameMode;
      results: Parameters<typeof recordCardResults>[0];
      score: number;
      total: number;
      hintUsed: boolean;
    }) => {
      if (!quiz) return;
      saveQuizResult({
        quizId: quiz.id,
        mode,
        score,
        total,
        hintUsed,
        cardResults: results,
        timestamp: new Date().toISOString(),
      });
      // 苦手カードの復習に使う統計も同時に更新する
      recordCardResults(results);
      setProgressVersion((n) => n + 1);
    },
    [quiz],
  );

  const getPreviousBest = useCallback(
    (mode: GameMode) => (quiz ? (getQuizProgress(quiz.id)?.modes[mode]?.bestScore ?? null) : null),
    [quiz],
  );

  const handleExit = useCallback(() => {
    router.push(quiz ? `/?region=${quiz.region}` : '/');
  }, [router, quiz]);

  if (!quiz || cards.length === 0) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <p>クイズが見つかりませんでした</p>
        <button onClick={() => router.push('/')}>ホームに戻る</button>
      </div>
    );
  }

  return (
    <QuizRunner
      quiz={quiz}
      cards={cards}
      progress={progress}
      onComplete={handleComplete}
      onExit={handleExit}
      exitLabel="クイズ一覧"
      getPreviousBest={getPreviousBest}
    />
  );
}
