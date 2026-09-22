import { test, expect } from '@playwright/test';
import { cardImagePath, nodeCoverImagePath, resolvePublicPath } from '@/lib/images';

test.describe('画像パスの basePath 解決', () => {
  test('basePath が空なら従来どおりルート相対', () => {
    expect(resolvePublicPath('/images/cards/a.webp', '')).toBe('/images/cards/a.webp');
  });

  test('basePath が設定されていれば前置される', () => {
    expect(resolvePublicPath('/images/cards/a.webp', '/rekikan')).toBe(
      '/rekikan/images/cards/a.webp',
    );
  });

  test('basePath 末尾のスラッシュは重複しない', () => {
    expect(resolvePublicPath('/images/nodes/a.webp', '/rekikan/')).toBe(
      '/rekikan/images/nodes/a.webp',
    );
  });

  test('カード・ノードの画像パスが規約どおりに組み立てられる', () => {
    expect(cardImagePath('card_jp_1').endsWith('/images/cards/card_jp_1.webp')).toBe(true);
    expect(
      nodeCoverImagePath('node_japan_root').endsWith('/images/nodes/node_japan_root.webp'),
    ).toBe(true);
  });
});
