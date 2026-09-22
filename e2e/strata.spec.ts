import { test, expect } from '@playwright/test';
import path from 'path';
import { seedProgress } from './helpers/storage';
import { clearQuizPerfectly } from './helpers/play';

test.describe('地層表現', () => {
  test('階層の深さが data-depth として表現される', async ({ page }) => {
    await page.goto('/');
    await page.getByText('日本史').click();

    const sections = page.getByTestId('node-section');
    await expect(sections.first()).toHaveAttribute('data-depth', '0');
    await expect(sections.nth(1)).toHaveAttribute('data-depth', '1');
  });

  test('ロック中の層は未発掘として表示される', async ({ page }) => {
    await page.goto('/');
    await page.getByText('日本史').click();
    // filter は祖先にも一致するため、いちばん内側（末尾）の節を見る
    const locked = page.getByTestId('node-section').filter({ hasText: '先史・古代' }).last();
    await expect(locked).toHaveAttribute('data-locked', 'true');
  });

  test('クリアした層は発掘済みになる', async ({ page }) => {
    await page.goto('/');
    await seedProgress(page, ['quiz_japan_era_intro_desc']);
    await page.goto('/?region=japan');

    const root = page.getByTestId('node-section').first();
    await expect(root).not.toHaveAttribute('data-locked', 'true');
    await page.screenshot({
      path: path.join(__dirname, '..', 'screenshots', '14-strata.png'),
      fullPage: true,
    });
  });

  test('クイズをクリアして解放された層に 1 度だけ演出が出る', async ({ page }) => {
    // 実際にクイズを満点クリアする（演出はこの保存時に決まる）
    await clearQuizPerfectly(page, 'quiz_japan_era_intro_desc');
    await page.getByRole('button', { name: 'クイズ一覧に戻る' }).click();

    await expect(page.getByTestId('unlocked-badge').first()).toBeVisible();

    // 2 回目以降は出ない
    await page.goto('/?region=japan');
    await expect(page.getByTestId('unlocked-badge')).toHaveCount(0);
  });
});
