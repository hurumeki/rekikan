import { expect, type Page } from '@playwright/test';
import { getQuiz, loadCardsForQuiz } from '@/lib/data-loader';

/**
 * チャレンジモードでクイズを満点クリアする。
 * 正解順は同梱データから取るので、画面のシャッフル結果に依存しない。
 */
export async function clearQuizPerfectly(page: Page, quizId: string): Promise<void> {
  const quiz = getQuiz(quizId);
  if (!quiz) throw new Error(`クイズが見つかりません: ${quizId}`);
  const cards = await loadCardsForQuiz(quiz);

  await page.goto(`/quiz/${quizId}`);
  await page.getByText('チャレンジモード').click();
  await expect(page.getByText('古い順にカードをタップしてください')).toBeVisible();

  // 画面上のカードを、正解順（card_ids の順）にタップする
  for (const card of cards) {
    const text = card.type === 'term' ? (card.name ?? '') : card.description;
    await page
      .getByTestId('quiz-card')
      .filter({ hasText: text.slice(0, 20) })
      .first()
      .click();
  }

  await page.getByTestId('confirm-order').click();
  await expect(page.getByText('パーフェクト！')).toBeVisible();
}
