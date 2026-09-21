import type { Card, GameMode, Quiz } from './types';

/** 1 回の復習で出すカード枚数（docs/04 §4.3 の推奨枚数に合わせる） */
export const REVIEW_CARD_COUNT = 7;
/** これを下回ると復習を始められない */
export const REVIEW_MIN_CARDS = 3;
/** 復習用に組み立てたクイズの ID（同梱データには存在しない） */
export const REVIEW_QUIZ_ID = '__review__';

/**
 * 苦手カードから復習用のクイズを組み立てる。
 * 同梱データのクイズではないため進捗には保存せず、
 * カード統計の更新だけを行う（docs/08 §8.2）。
 */
export function buildReviewQuiz(cards: Card[]): Quiz | null {
  if (cards.length < REVIEW_MIN_CARDS) return null;

  const regions = [...new Set(cards.map((c) => c.region))];
  // 複数地域が混ざるときは地域バッジの出る同時代モードで出題する
  const modes: GameMode[] =
    regions.length > 1 ? ['careful', 'cross_region'] : ['careful', 'challenge'];

  return {
    id: REVIEW_QUIZ_ID,
    region: regions[0]!,
    title: '苦手カードの復習',
    card_type: cards.every((c) => c.type === 'term') ? 'term' : 'description',
    card_ids: cards.map((c) => c.id),
    modes,
    difficulty: 3,
    regions: regions.length > 1 ? regions : null,
  };
}
