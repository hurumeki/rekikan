import { test, expect } from '@playwright/test';
import { validateDataset } from '@/lib/admin/validation';
import { REGIONS, ALL_QUIZZES, ALL_NODES } from '@/lib/data-registry';
import { loadAllCards } from '@/lib/data-loader';
import { CATEGORIES } from '@/lib/admin/categories';
import type { ValidationError } from '@/lib/admin/validation';

function format(errors: ValidationError[]): string {
  return errors
    .map((e) => `  [${e.entity}] ${e.id}${e.field ? `.${e.field}` : ''}: ${e.message}`)
    .join('\n');
}

test.describe('同梱コンテンツ (src/data)', () => {
  test('エディタと同じバリデーションルールでエラーが出ない', async () => {
    const report = validateDataset({
      regions: REGIONS,
      cards: await loadAllCards(),
      quizzes: ALL_QUIZZES,
      nodes: ALL_NODES,
      categories: CATEGORIES,
    });
    expect(report.errors, `\n${format(report.errors)}`).toEqual([]);
  });

  test('コンテンツ品質の警告（docs/35）が出ない', async () => {
    const report = validateDataset({
      regions: REGIONS,
      cards: await loadAllCards(),
      quizzes: ALL_QUIZZES,
      nodes: ALL_NODES,
      categories: CATEGORIES,
    });
    // 通し問題（まとめテスト）はカード数が多くてよい（docs/04 §4.3）
    const isFullSequence = (id: string) => /_all_eras_term$|_full$/.test(id);
    const quality = report.warnings.filter(
      (w) => w.rule && !(w.rule === 'card_count' && isFullSequence(w.id)),
    );
    expect(quality, `\n${format(quality)}`).toEqual([]);
  });

  test('すべてのクイズのカードが年代の昇順に並んでいる', async () => {
    const cardMap = new Map((await loadAllCards()).map((c) => [c.id, c]));
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

  test('クイズ・カード・ノードのIDが重複していない', async () => {
    const dup = (ids: string[]) => ids.filter((id, i) => ids.indexOf(id) !== i);
    expect(dup((await loadAllCards()).map((c) => c.id))).toEqual([]);
    expect(dup(ALL_QUIZZES.map((q) => q.id))).toEqual([]);
    expect(dup(ALL_NODES.map((n) => n.id))).toEqual([]);
  });

  test('ノードから参照されないクイズがない', () => {
    const used = new Set(ALL_NODES.flatMap((n) => n.quiz_ids));
    expect(ALL_QUIZZES.filter((q) => !used.has(q.id)).map((q) => q.id)).toEqual([]);
  });
});
