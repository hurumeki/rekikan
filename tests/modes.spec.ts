import { test, expect } from '@playwright/test';
import type { Card } from '@/lib/types';
import { buildTimelineScale } from '@/lib/timeline-scale';
import { REGIONS } from '@/lib/data-registry';
import {
  carefulResults,
  carefulScore,
  clearCarefulWrong,
  createCarefulState,
  isCarefulComplete,
  selectCarefulCard,
} from '@/lib/modes/careful';
import {
  confirmOrdering,
  createOrderingState,
  isOrderingComplete,
  isOrderingConfirmed,
  orderingCardState,
  orderingScore,
  orderingSelectionNumber,
  toggleOrderingSelection,
} from '@/lib/modes/ordering';
import {
  advanceEraBand,
  createEraBandState,
  eraBandCurrentCard,
  eraBandScore,
  isEraBandComplete,
  selectEraBand,
} from '@/lib/modes/era-band';
import {
  advanceTimeline,
  confirmTimeline,
  createTimelineState,
  isTimelineComplete,
  nudgeTimelinePercent,
  selectTimelinePercent,
  timelineScore,
} from '@/lib/modes/timeline';
import { createYearLookup } from '@/lib/quiz-engine';

function card(id: string, year: number, eraKey = 'medieval'): Card {
  return {
    id,
    region: 'japan',
    type: 'term',
    name: id,
    year,
    year_end: null,
    era_color_key: eraKey,
    category: 'event',
    hint: null,
    description: `${id} の説明`,
  };
}

const cards = [card('a', 1000), card('b', 1185), card('c', 1185), card('d', 1600)];
const correctOrder = ['a', 'b', 'c', 'd'];

test.describe('じっくりモードの状態遷移', () => {
  test('古い順に選べば全問正解', () => {
    let state = createCarefulState(cards);
    for (const id of correctOrder) state = selectCarefulCard(state, id);

    expect(isCarefulComplete(state)).toBe(true);
    expect(carefulScore(state)).toBe(4);
    expect(carefulResults(state, correctOrder).every((r) => r.correct)).toBe(true);
  });

  test('間違えるとその手番だけ減点され、カードは残る', () => {
    let state = createCarefulState(cards);
    state = selectCarefulCard(state, 'd'); // 1 手目で外す

    expect(state.remainingCards).toHaveLength(4);
    expect(state.wrongCardId).toBe('d');

    state = selectCarefulCard(state, 'a'); // 正しく選び直す
    expect(state.confirmedCards.map((c) => c.id)).toEqual(['a']);
    expect(state.wrongCardId).toBeNull();

    for (const id of ['b', 'c', 'd']) state = selectCarefulCard(state, id);
    // 1 手目のミスぶんだけ減る
    expect(carefulScore(state)).toBe(3);
    expect(carefulResults(state, correctOrder)[0]!.correct).toBe(false);
  });

  test('同じ年のカードはどちらを先に選んでも正解', () => {
    let state = createCarefulState(cards);
    state = selectCarefulCard(state, 'a');
    state = selectCarefulCard(state, 'c'); // b と同年
    expect(state.confirmedCards.map((c) => c.id)).toEqual(['a', 'c']);
    expect(carefulScore(state)).toBe(2);
  });

  test('同じ手番で二度間違えても減点は 1 回分', () => {
    let state = createCarefulState(cards);
    state = selectCarefulCard(state, 'd');
    state = selectCarefulCard(state, 'b');
    for (const id of correctOrder) state = selectCarefulCard(state, id);
    expect(carefulScore(state)).toBe(3);
  });

  test('残っていないカードを選んでも状態は変わらない', () => {
    const state = createCarefulState(cards);
    expect(selectCarefulCard(state, 'zzz')).toBe(state);
  });

  test('振動表示は明示的に消すまで残る', () => {
    let state = selectCarefulCard(createCarefulState(cards), 'd');
    expect(state.wrongCardId).toBe('d');
    state = clearCarefulWrong(state);
    expect(state.wrongCardId).toBeNull();
  });
});

test.describe('並べ替えモードの状態遷移', () => {
  const yearOf = createYearLookup(cards);

  test('選ぶと番号が付き、外すと繰り上がる', () => {
    let state = createOrderingState(cards);
    for (const id of ['a', 'b', 'c']) state = toggleOrderingSelection(state, id);
    expect(orderingSelectionNumber(state, 'c')).toBe(3);

    state = toggleOrderingSelection(state, 'b'); // 真ん中を取り消す
    expect(orderingSelectionNumber(state, 'b')).toBeUndefined();
    expect(orderingSelectionNumber(state, 'c')).toBe(2);
    expect(orderingCardState(state, 'b')).toBe('unselected');
  });

  test('全部選ぶまで確定できない', () => {
    let state = createOrderingState(cards);
    state = toggleOrderingSelection(state, 'a');
    expect(isOrderingComplete(state)).toBe(false);
    expect(confirmOrdering(state, correctOrder, yearOf)).toBe(state);
  });

  test('確定すると採点され、以降は操作を受け付けない', () => {
    let state = createOrderingState(cards);
    for (const id of correctOrder) state = toggleOrderingSelection(state, id);
    state = confirmOrdering(state, correctOrder, yearOf);

    expect(isOrderingConfirmed(state)).toBe(true);
    expect(orderingScore(state)).toBe(4);
    expect(orderingCardState(state, 'a')).toBe('correct');
    expect(toggleOrderingSelection(state, 'a')).toBe(state);
  });

  test('同じ年のカードを入れ替えても満点', () => {
    let state = createOrderingState(cards);
    for (const id of ['a', 'c', 'b', 'd']) state = toggleOrderingSelection(state, id);
    state = confirmOrdering(state, correctOrder, yearOf);
    expect(orderingScore(state)).toBe(4);
  });

  test('順序を間違えたカードは不正解になる', () => {
    let state = createOrderingState(cards);
    for (const id of ['d', 'b', 'c', 'a']) state = toggleOrderingSelection(state, id);
    state = confirmOrdering(state, correctOrder, yearOf);
    expect(orderingScore(state)).toBe(2);
    expect(orderingCardState(state, 'd')).toBe('incorrect');
  });
});

test.describe('時代帯当てモードの状態遷移', () => {
  const eraKeys = ['prehistoric_ancient', 'medieval', 'early_modern'];
  const quizCards = [card('x', 1200, 'medieval'), card('y', 1700, 'early_modern')];

  test('答えると正解が明かされ、次へ進める', () => {
    let state = createEraBandState(quizCards);
    state = selectEraBand(state, 'medieval', eraKeys);

    expect(state.answeredEraKey).toBe('medieval');
    expect(state.wrongEraKey).toBeNull();
    expect(eraBandScore(state)).toBe(1);

    state = advanceEraBand(state);
    expect(eraBandCurrentCard(state)?.id).toBe('y');
  });

  test('間違えても正解の時代帯が明かされる', () => {
    let state = createEraBandState(quizCards);
    state = selectEraBand(state, 'prehistoric_ancient', eraKeys);
    expect(state.answeredEraKey).toBe('medieval');
    expect(state.wrongEraKey).toBe('prehistoric_ancient');
    expect(eraBandScore(state)).toBe(0);
  });

  test('答える前は進めない / 二度は答えられない', () => {
    const state = createEraBandState(quizCards);
    expect(advanceEraBand(state)).toBe(state);

    const answered = selectEraBand(state, 'medieval', eraKeys);
    expect(selectEraBand(answered, 'early_modern', eraKeys)).toBe(answered);
  });

  test('最後まで答えると完了になる', () => {
    let state = createEraBandState(quizCards);
    for (const key of ['medieval', 'early_modern']) {
      state = selectEraBand(state, key, eraKeys);
      state = advanceEraBand(state);
    }
    expect(isEraBandComplete(state)).toBe(true);
    expect(eraBandScore(state)).toBe(2);
  });
});

test.describe('タイムラインモードの状態遷移', () => {
  const japan = REGIONS.find((r) => r.id === 'japan')!;
  const scale = buildTimelineScale(japan.era_colors, [], { start: -10000, end: 2000 });
  const quizCards = [card('p', 1600), card('q', 1900)];

  test('置いて確定すると採点される', () => {
    let state = createTimelineState(quizCards);
    state = selectTimelinePercent(state, scale.yearToPercent(1600), scale);
    state = confirmTimeline(state, scale);

    expect(state.answeredYear).not.toBeNull();
    expect(timelineScore(state)).toBe(1);
  });

  test('大きく外すと不正解', () => {
    let state = createTimelineState(quizCards);
    state = selectTimelinePercent(state, 0, scale);
    state = confirmTimeline(state, scale);
    expect(timelineScore(state)).toBe(0);
  });

  test('置く前は確定できない / 確定後は動かせない', () => {
    const state = createTimelineState(quizCards);
    expect(confirmTimeline(state, scale)).toBe(state);

    let placed = selectTimelinePercent(state, 50, scale);
    placed = confirmTimeline(placed, scale);
    expect(selectTimelinePercent(placed, 10, scale)).toBe(placed);
    expect(nudgeTimelinePercent(placed, 5, scale)).toBe(placed);
  });

  test('矢印は画面上の割合で動く', () => {
    let state = createTimelineState(quizCards);
    state = selectTimelinePercent(state, 50, scale);
    const before = state.selectedYear!;
    state = nudgeTimelinePercent(state, 5, scale);
    expect(state.selectedYear!).toBeGreaterThan(before);
  });

  test('最後まで答えると完了になる', () => {
    let state = createTimelineState(quizCards);
    for (let i = 0; i < quizCards.length; i++) {
      state = selectTimelinePercent(state, 50, scale);
      state = confirmTimeline(state, scale);
      state = advanceTimeline(state);
    }
    expect(isTimelineComplete(state)).toBe(true);
  });
});
