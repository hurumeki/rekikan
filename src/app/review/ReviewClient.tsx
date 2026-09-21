'use client';

import { Suspense, use, useCallback, useMemo, useState, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import { loadCardsByIds } from '@/lib/data-loader';
import {
  getWeakCardIds,
  recordCardResults,
  getAllCardStats,
  accuracy,
  getWeakCardCountSnapshot,
  getServerWeakCardCountSnapshot,
  subscribeCardStats,
  getWeakCardRegions,
} from '@/lib/card-stats';
import type { Card, GameMode, Quiz } from '@/lib/types';
import QuizRunner from '@/components/quiz/QuizRunner';
import styles from './review.module.css';

/** 1 回の復習で出すカード枚数（docs/04 §4.3 の推奨枚数に合わせる） */
export const REVIEW_CARD_COUNT = 7;
/** これを下回ると復習を始められない */
export const REVIEW_MIN_CARDS = 3;

function EmptyState({ weakCount, onHome }: { weakCount: number; onHome: () => void }) {
  return (
    <div className={styles.empty}>
      <h1 className={styles.emptyTitle}>苦手カードの復習</h1>
      <p className={styles.emptyBody}>
        まだ復習できるカードがありません。
        <br />
        クイズを遊んで間違えたカードが{REVIEW_MIN_CARDS}枚たまると、ここで復習できます。
      </p>
      {weakCount > 0 && (
        <p className={styles.emptyBody}>
          現在の苦手カード: {weakCount}枚（あと{REVIEW_MIN_CARDS - weakCount}枚）
        </p>
      )}
      <button className={styles.emptyButton} onClick={onHome}>
        ホームに戻る
      </button>
    </div>
  );
}

interface ReviewSessionProps {
  cardsPromise: Promise<Card[]>;
  weakCount: number;
  onComplete: React.ComponentProps<typeof QuizRunner>['onComplete'];
  onExit: () => void;
  onHome: () => void;
}

/** カードが揃ってから復習セットを組み立てる（Suspense 境界の内側） */
function ReviewSession({
  cardsPromise,
  weakCount,
  onComplete,
  onExit,
  onHome,
}: ReviewSessionProps) {
  const cards = use(cardsPromise);

  const quiz = useMemo<Quiz | null>(() => {
    if (cards.length < REVIEW_MIN_CARDS) return null;
    const regions = [...new Set(cards.map((c) => c.region))];
    // 複数地域が混ざるときは地域バッジの出る同時代モードで出題する
    const modes: GameMode[] =
      regions.length > 1 ? ['careful', 'cross_region'] : ['careful', 'challenge'];
    return {
      id: '__review__',
      region: regions[0]!,
      title: '苦手カードの復習',
      card_type: cards.every((c) => c.type === 'term') ? 'term' : 'description',
      card_ids: cards.map((c) => c.id),
      modes,
      difficulty: 3,
      regions: regions.length > 1 ? regions : null,
    };
  }, [cards]);

  if (!quiz) {
    return <EmptyState weakCount={weakCount} onHome={onHome} />;
  }

  const stats = getAllCardStats();
  const weakest = cards
    .map((c) => stats[c.id])
    .filter((s) => s !== undefined)
    .sort((a, b) => accuracy(a) - accuracy(b))[0];

  return (
    <>
      <QuizRunner
        quiz={quiz}
        cards={cards}
        progress={null}
        onComplete={onComplete}
        onExit={onExit}
        exitLabel="ホーム"
        getPreviousBest={() => null}
      />
      {weakest && (
        <p className={styles.note} data-testid="review-note">
          苦手カード{weakCount}枚のうち、正答率の低い{cards.length}枚を出題しています
        </p>
      )}
    </>
  );
}

export default function ReviewClient() {
  const router = useRouter();
  // 出題セットは画面に入った時点で固定する（解答のたびに入れ替わらないように）
  const [sessionKey, setSessionKey] = useState(0);
  // 苦手カード数はマウント後に確定する（静的 HTML との不一致を避ける）
  const weakCount = useSyncExternalStore(
    subscribeCardStats,
    getWeakCardCountSnapshot,
    getServerWeakCardCountSnapshot,
  );

  // 苦手カードが属する地域だけを読み込む
  const cardsPromise = useMemo<Promise<Card[]>>(() => {
    const ids = getWeakCardIds(REVIEW_CARD_COUNT);
    if (ids.length === 0) return Promise.resolve([]);
    return loadCardsByIds(ids, getWeakCardRegions()).then((loaded) =>
      // 正解順序は年代順
      [...loaded].sort((a, b) => a.year - b.year),
    );
    // sessionKey / weakCount が変わったら出題セットを組み直す
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionKey, weakCount]);

  const handleComplete = useCallback<React.ComponentProps<typeof QuizRunner>['onComplete']>(
    ({ results, cards }) => {
      // 復習はクイズの進捗（アンロック）には影響させず、カード統計だけ更新する
      recordCardResults(results, cards);
    },
    [],
  );

  const handleHome = useCallback(() => router.push('/'), [router]);

  const handleExit = useCallback(() => {
    // 統計が変わっているので、次に開くときは組み直す
    setSessionKey((n) => n + 1);
    router.push('/');
  }, [router]);

  return (
    <Suspense
      fallback={
        <div className={styles.empty} aria-busy="true">
          読み込み中…
        </div>
      }
    >
      <ReviewSession
        cardsPromise={cardsPromise}
        weakCount={weakCount}
        onComplete={handleComplete}
        onExit={handleExit}
        onHome={handleHome}
      />
    </Suspense>
  );
}
