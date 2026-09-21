'use client';

import { useCallback, useMemo, useState, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import { getCard } from '@/lib/data-loader';
import {
  getWeakCardIds,
  recordCardResults,
  getAllCardStats,
  accuracy,
  getWeakCardCountSnapshot,
  getServerWeakCardCountSnapshot,
  subscribeCardStats,
} from '@/lib/card-stats';
import type { Card, GameMode, Quiz } from '@/lib/types';
import QuizRunner from '@/components/quiz/QuizRunner';
import styles from './review.module.css';

/** 1 回の復習で出すカード枚数（docs/04 §4.3 の推奨枚数に合わせる） */
export const REVIEW_CARD_COUNT = 7;
/** これを下回ると復習を始められない */
export const REVIEW_MIN_CARDS = 3;

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

  const cards = useMemo<Card[]>(() => {
    const ids = getWeakCardIds(REVIEW_CARD_COUNT);
    return (
      ids
        .map((id) => getCard(id))
        .filter((c): c is Card => c !== undefined)
        // 正解順序は年代順
        .sort((a, b) => a.year - b.year)
    );
    // sessionKey / weakCount が変わったら出題セットを組み直す
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionKey, weakCount]);

  const quiz = useMemo<Quiz | null>(() => {
    if (cards.length < REVIEW_MIN_CARDS) return null;
    const regions = [...new Set(cards.map((c) => c.region))];
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

  const handleComplete = useCallback(
    ({ results }: { results: Parameters<typeof recordCardResults>[0] }) => {
      // 復習はクイズの進捗（アンロック）には影響させず、カード統計だけ更新する
      recordCardResults(results);
    },
    [],
  );

  const handleExit = useCallback(() => {
    // 統計が変わっているので、次に開くときは組み直す
    setSessionKey((n) => n + 1);
    router.push('/');
  }, [router]);

  if (!quiz) {
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
        <button className={styles.emptyButton} onClick={() => router.push('/')}>
          ホームに戻る
        </button>
      </div>
    );
  }

  const stats = getAllCardStats();
  const worst = cards
    .map((c) => stats[c.id])
    .filter((s) => s !== undefined)
    .sort((a, b) => accuracy(a) - accuracy(b))[0];

  return (
    <>
      <QuizRunner
        quiz={quiz}
        cards={cards}
        progress={null}
        onComplete={handleComplete}
        onExit={handleExit}
        exitLabel="ホーム"
        getPreviousBest={() => null}
      />
      {worst && (
        <p className={styles.note} data-testid="review-note">
          苦手カード{weakCount}枚のうち、正答率の低い{cards.length}枚を出題しています
        </p>
      )}
    </>
  );
}
