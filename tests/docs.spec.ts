import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

/**
 * 仕様書（docs/）の腐敗を機械的に止めるための検査。
 *
 * 内容の正しさは人が見るしかないが、「リンク切れ」と「索引の漏れ」は
 * 実装と同じように壊れるので CI で拾う。
 */
const DOCS_DIR = path.join(__dirname, '..', 'docs');

function listDocs(): string[] {
  return fs.readdirSync(DOCS_DIR).filter((f) => f.endsWith('.md'));
}

function read(file: string): string {
  return fs.readFileSync(path.join(DOCS_DIR, file), 'utf8');
}

test.describe('仕様書の整合性', () => {
  test('ドキュメント間のリンクが切れていない', () => {
    const broken: string[] = [];
    for (const file of listDocs()) {
      const content = read(file);
      for (const match of content.matchAll(/\]\(([^)]+)\)/g)) {
        const target = match[1]!;
        // 外部リンク・ページ内アンカーは対象外
        if (/^(https?:|#|mailto:)/.test(target)) continue;
        const [pathPart] = target.split('#');
        if (!pathPart) continue;
        if (!fs.existsSync(path.join(DOCS_DIR, pathPart))) {
          broken.push(`${file} → ${target}`);
        }
      }
    }
    expect(broken, `\n  ${broken.join('\n  ')}`).toEqual([]);
  });

  test('すべてのドキュメントが index.md から辿れる', () => {
    const index = read('index.md');
    const missing = listDocs().filter((f) => f !== 'index.md' && !index.includes(f));
    expect(missing, `index.md に載っていない: ${missing.join(', ')}`).toEqual([]);
  });

  test('index.md が存在しないファイルを指していない', () => {
    const index = read('index.md');
    const files = new Set(listDocs());
    const dangling = [...index.matchAll(/\]\(([\w.-]+\.md)\)/g)]
      .map((m) => m[1]!)
      .filter((f) => !files.has(f));
    expect([...new Set(dangling)]).toEqual([]);
  });
});
