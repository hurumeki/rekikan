Playwrightを使ってスマホ表示のUIレビューを実施する。

## 手順

1. Playwrightテストを実行してスクリーンショットを取得する:

```bash
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/root/.cache/ms-playwright/chromium-1194/chrome-linux/chrome npx playwright test e2e/ui-review.spec.ts
```

2. テストが失敗した場合はエラー内容を確認し、アプリのコードに問題がないかチェックする。

3. `screenshots/` ディレクトリ内の全PNGファイルをRead toolで1枚ずつ表示し、以下の観点でレビューする:
   - **画面表示**: レイアウト崩れ、テキストの切れ、余白の適切さ、フォントサイズの読みやすさ
   - **操作性**: ボタンサイズのタップしやすさ（44px以上推奨）、インタラクティブ要素の視認性、フィードバックの分かりやすさ
   - **一貫性**: 画面間のデザインの統一感、色使いの整合性
   - **モバイル最適化**: 画面幅に対するコンテンツの収まり、スクロール量の妥当性

4. レビュー結果を以下のフォーマットでまとめる:
   - スクリーンショットごとに所見を記載
   - 問題点には重要度（高/中/低）を付与
   - 修正提案がある場合は具体的なCSS/コンポーネント変更を提示

## 対象画面

- 01-home.png: ホーム画面（地域選択）
- 02-quiz-list.png: クイズ一覧
- 03-mode-select.png: モード選択
- 04-careful-initial.png: じっくりモード初期
- 05-careful-feedback.png: じっくりモードフィードバック
- 06-challenge-initial.png: チャレンジモード初期
- 07-challenge-selected.png: チャレンジモード選択中
- 08-challenge-result.png: リザルト画面
