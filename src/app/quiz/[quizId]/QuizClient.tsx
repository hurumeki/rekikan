'use client';

import { Suspense, use, useCallback, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getQuiz, loadCardsForQuiz } from '@/lib/data-loader';
import { saveQuizResult, getQuizProgress } from '@/lib/progress';
import { recordCardResults } from '@/lib/card-stats';
import type { Card, GameMode, Quiz, QuizProgress } from '@/lib/types';
import QuizRunner from '@/components/quiz/QuizRunner';

/** カードの読み込みを待つ間の表示 */
function CardsLoading() {
  return (
    <div style={{ padding: 24, textAlign: 'center' }} aria-busy="true">
      読み込み中…
    </div>
  );
}

interface RunnerProps {
  quiz: Quiz;
  cardsPromise: Promise<Card[]>;
  progress: QuizProgress | null;
  onComplete: React.ComponentProps<typeof QuizRunner>['onComplete'];
  onExit: () => void;
  getPreviousBest: (mode: GameMode) => number | null;
}

/** カードが揃ってから本体を描画する（Suspense 境界の内側） */
function LoadedQuizRunner({ quiz, cardsPromise, ...rest }: RunnerProps) {
  const cards = use(cardsPromise);

  if (cards.length === 0) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <p>カードが見つかりませんでした</p>
      </div>
    );
  }

  return <QuizRunner quiz={quiz} cards={cards} exitLabel="クイズ一覧" {...rest} />;
}

export default function QuizClient() {
  const params = useParams();
  const router = useRouter();
  const quizId = params.quizId as string;

  const quiz = getQuiz(quizId);
  // 必要な地域のカードだけを動的に読み込む
  const cardsPromise = useMemo(() => (quiz ? loadCardsForQuiz(quiz) : Promise.resolve([])), [quiz]);

  // 結果保存のたびに増やして、モード選択画面の記録を読み直す
  const [progressVersion, setProgressVersion] = useState(0);
  const progress = useMemo(
    () => (quiz ? getQuizProgress(quiz.id) : null),
    // progressVersion は保存後の読み直しトリガー
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [quiz, progressVersion],
  );

  const handleComplete = useCallback<React.ComponentProps<typeof QuizRunner>['onComplete']>(
    ({ mode, results, score, total, hintUsed, cards }) => {
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
      recordCardResults(results, cards);
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

  if (!quiz) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <p>クイズが見つかりませんでした</p>
        <button onClick={() => router.push('/')}>ホームに戻る</button>
      </div>
    );
  }

  return (
    <Suspense fallback={<CardsLoading />}>
      <LoadedQuizRunner
        quiz={quiz}
        cardsPromise={cardsPromise}
        progress={progress}
        onComplete={handleComplete}
        onExit={handleExit}
        getPreviousBest={getPreviousBest}
      />
    </Suspense>
  );
}
