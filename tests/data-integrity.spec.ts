import { test, expect } from '@playwright/test';
import { validateDataset } from '@/lib/admin/validation';
import { REGIONS, ALL_CARDS, ALL_QUIZZES, ALL_NODES } from '@/lib/data-registry';
import { CATEGORIES } from '@/lib/admin/categories';
import type { ValidationError } from '@/lib/admin/validation';

function format(errors: ValidationError[]): string {
  return errors
    .map((e) => `  [${e.entity}] ${e.id}${e.field ? `.${e.field}` : ''}: ${e.message}`)
    .join('\n');
}

test.describe('同梱コンテンツ (src/data)', () => {
  const report = validateDataset({
    regions: REGIONS,
    cards: ALL_CARDS,
    quizzes: ALL_QUIZZES,
    nodes: ALL_NODES,
    categories: CATEGORIES,
  });

  test('エディタと同じバリデーションルールでエラーが出ない', () => {
    expect(report.errors, `\n${format(report.errors)}`).toEqual([]);
  });

  test('すべてのクイズのカードが年代の昇順に並んでいる', () => {
    const cardMap = new Map(ALL_CARDS.map((c) => [c.id, c]));
    const broken: string[] = [];
    for (const quiz of ALL_QUIZZES) {
      const years = quiz.card_ids
        .map((id) => cardMap.get(id)?.year)
        .filter((y): y is number => y !== undefined);
      for (let i = 1; i < years.length; i++) {
        if (years[i]! < years[i - 1]!) broken.push(`${quiz.id}: ${years[i - 1]} → ${years[i]}`);
      }
    }
    expect(broken, `\n  ${broken.join('\n  ')}`).toEqual([]);
  });

  test('クイズ・カード・ノードのIDが重複していない', () => {
    const dup = (ids: string[]) => ids.filter((id, i) => ids.indexOf(id) !== i);
    expect(dup(ALL_CARDS.map((c) => c.id))).toEqual([]);
    expect(dup(ALL_QUIZZES.map((q) => q.id))).toEqual([]);
    expect(dup(ALL_NODES.map((n) => n.id))).toEqual([]);
  });

  test('ノードから参照されないクイズがない', () => {
    const used = new Set(ALL_NODES.flatMap((n) => n.quiz_ids));
    expect(ALL_QUIZZES.filter((q) => !used.has(q.id)).map((q) => q.id)).toEqual([]);
  });
});
