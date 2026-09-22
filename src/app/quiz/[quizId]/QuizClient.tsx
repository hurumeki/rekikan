'use client';

import { Suspense, use, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getQuiz, loadCardsForQuiz } from '@/lib/data-loader';
import { ALL_NODES } from '@/lib/data-registry';
import { diffUnlockedNodes } from '@/lib/unlock';
import { recordPendingReveals } from '@/lib/strata';
import { saveQuizResult, getQuizProgress, getAllProgress } from '@/lib/progress';
import { useQuizProgress } from '@/hooks/useProgress';
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

  // 保存すればストアの購読側（この行）に自動で反映される
  const progress = useQuizProgress(quizId);

  const handleComplete = useCallback<React.ComponentProps<typeof QuizRunner>['onComplete']>(
    ({ mode, results, score, total, hintUsed, cards }) => {
      if (!quiz) return;
      const before = getAllProgress();
      saveQuizResult({
        quizId: quiz.id,
        mode,
        score,
        total,
        hintUsed,
        cardResults: results,
        timestamp: new Date().toISOString(),
      });
      // この結果で新しく開いた階層を控えておき、一覧で「地層が開く」演出に使う
      recordPendingReveals(diffUnlockedNodes(ALL_NODES, before, getAllProgress()));
      // 苦手カードの復習に使う統計も同時に更新する
      recordCardResults(results, cards);
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
