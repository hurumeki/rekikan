# れきかん — データ構造設計書

**バージョン:** v1.0  

---

## 1. 設計の前提

### 1.1 要件

- 地域 → 大区分 → 中区分 → 小区分の階層構造を表現する
- 各階層に「説明文カード問題」と「用語カード問題」の両方を配置できる
- 1問あたり5〜8枚（原則7枚前後）
- カードは複数の問題で再利用される（大区分の「鎌倉時代」と通し問題の「鎌倉時代」は同一カード）
- アンロック条件を柔軟に定義できる
- AI生成 → 人による品質管理のワークフローに適した構造
- 将来の地域・問題追加が容易

### 1.2 設計方針

**カードと問題を分離する。**

- **カード（Card）:** 用語・説明文・ヒント・解説などのコンテンツ実体。マスターデータとして一元管理
- **問題（Quiz）:** カードの組み合わせと出題順序を定義。同じカードを複数の問題で参照する
- **ノード（Node）:** 階層ツリーの各ノード。問題やアンロック条件を保持する

この分離により、カードの修正が全問題に自動反映され、重複データを持たずに済む。

---

## 2. エンティティ定義

### 2.1 Region（地域）

ツリーのルート。

```json
{
  "id": "japan",
  "label": "日本史",
  "emoji": "🇯🇵",
  "color": "#e85d75",
  "era_colors": {
    "prehistoric_ancient": { "label": "先史・古代", "color": "#4ade80" },
    "medieval_early_modern": { "label": "中世・近世", "color": "#60a5fa" },
    "modern_contemporary": { "label": "近代・現代", "color": "#f87171" }
  }
}
```

| フィールド | 型 | 説明 |
|-----------|-----|------|
| id | string | 一意識別子 |
| label | string | 表示名 |
| emoji | string | アイコン |
| color | string | 地域のアクセントカラー |
| era_colors | object | 時代帯カラーの定義。カードの視覚タグに使用 |

### 2.2 Card（カード）

コンテンツの実体。全カードをフラットに管理するマスターテーブル。

**用語カードの例：**

```json
{
  "id": "card_japan_kamakura",
  "region": "japan",
  "type": "term",
  "name": "鎌倉時代",
  "year": 1185,
  "year_end": 1333,
  "era_color_key": "medieval_early_modern",
  "category": "era",
  "hint": "源頼朝・武士の政治・元寇",
  "description": "源頼朝が幕府を開き、武士が政治の中心に立った時代。",
  "tags": ["政治"],
  "status": "approved"
}
```

**説明文カードの例：**

```json
{
  "id": "card_japan_edo_desc_mid",
  "region": "japan",
  "type": "description",
  "name": null,
  "year": 1716,
  "year_end": 1787,
  "era_color_key": "medieval_early_modern",
  "category": null,
  "hint": null,
  "description": "財政が苦しくなり、幕府が何度も改革を試みた時代。",
  "tags": [],
  "status": "review"
}
```

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| id | string | ✓ | 一意識別子。命名規則: `card_{region}_{識別名}` |
| region | string | ✓ | 所属地域のID |
| type | enum | ✓ | `"term"`（用語カード）or `"description"`（説明文カード） |
| name | string / null | | 用語名。descriptionの場合はnull |
| year | number | ✓ | 開始年（ソートキー。紀元前はマイナス） |
| year_end | number / null | | 終了年。期間を持つ場合に使用 |
| era_color_key | string | ✓ | 時代帯カラーのキー。Region.era_colorsを参照 |
| category | string / null | | 種類アイコン用（後述の対応表を参照） |
| hint | string / null | | ヒント（キーワード形式）。descriptionでは不要 |
| description | string | ✓ | termの場合は一言解説、descriptionの場合はカード本文 |
| tags | string[] | | 補助タグ。検索・フィルタ用 |
| status | enum | ✓ | `"draft"`, `"review"`, `"approved"` |

**品質管理用の追加フィールド（運用時）:**

| フィールド | 型 | 説明 |
|-----------|-----|------|
| source | string | 出典・参考教科書 |
| reviewer | string | レビュー担当者 |
| notes | string | レビューコメント |

### 2.3 Quiz（問題）

カードの組み合わせと出題方法を定義する。

```json
{
  "id": "quiz_japan_era_medieval",
  "region": "japan",
  "title": "中世・近世の時代",
  "card_type": "term",
  "card_ids": [
    "card_japan_kamakura",
    "card_japan_nanbokucho",
    "card_japan_muromachi",
    "card_japan_sengoku",
    "card_japan_azuchimomoyama",
    "card_japan_edo"
  ],
  "modes": ["careful", "challenge"],
  "difficulty": 1
}
```

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| id | string | ✓ | 一意識別子。命名規則: `quiz_{region}_{識別名}` |
| region | string | ✓ | 所属地域のID |
| title | string | ✓ | 問題タイトル（表示用） |
| card_type | enum | ✓ | `"term"` or `"description"` |
| card_ids | string[] | ✓ | 使用するカードIDの配列（**正解順に記述**） |
| modes | string[] | ✓ | プレイ可能なモード。`"careful"`, `"challenge"` |
| difficulty | number | ✓ | 難易度（1=易, 2=中, 3=難） |

card_idsは正解順（古い順）に記述する。アプリ側でシャッフルして出題する。

### 2.4 Node（階層ノード）

ツリー構造の各ノード。問題とアンロック条件を持つ。

```json
{
  "id": "node_japan_medieval",
  "region": "japan",
  "parent_id": "node_japan_root",
  "label": "中世・近世",
  "sort_order": 2,
  "quiz_ids": [
    "quiz_japan_era_medieval_desc",
    "quiz_japan_era_medieval"
  ],
  "unlock_condition": {
    "type": "complete_quizzes",
    "quiz_ids": ["quiz_japan_era_intro_desc"]
  }
}
```

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| id | string | ✓ | 一意識別子 |
| region | string | ✓ | 所属地域のID |
| parent_id | string / null | | 親ノードのID。ルートはnull |
| label | string | ✓ | 表示名 |
| sort_order | number | ✓ | 同階層内の表示順 |
| quiz_ids | string[] | ✓ | このノードに含まれる問題ID（表示順） |
| unlock_condition | object / object[] / null | | アンロック条件。nullなら初期開放 |

### 2.5 UnlockCondition（アンロック条件）

```json
// 特定の問題をクリアしたら開放
{ "type": "complete_quizzes", "quiz_ids": ["quiz_japan_era_intro_desc"] }

// 特定のノード配下の全問題をクリアしたら開放
{ "type": "complete_node", "node_ids": ["node_japan_prehistoric", "node_japan_medieval", "node_japan_modern"] }

// 一定回数挑戦で開放（救済策）
{ "type": "attempts", "quiz_id": "quiz_japan_era_medieval", "count": 3 }
```

| type | 説明 |
|------|------|
| complete_quizzes | 指定した問題IDをすべてクリア |
| complete_node | 指定したノード配下の全問題をクリア |
| attempts | 指定した問題に一定回数挑戦（救済策） |

**複合条件はOR結合。** 配列で記述し、いずれかを満たせば開放。

```json
{
  "unlock_condition": [
    { "type": "complete_quizzes", "quiz_ids": ["quiz_japan_era_medieval"] },
    { "type": "attempts", "quiz_id": "quiz_japan_era_medieval", "count": 3 }
  ]
}
```

---

## 3. 階層ツリーの具体例（日本史）

```
node_japan_root (日本史) [初期開放]
│
├── quiz: quiz_japan_era_intro_desc (説明文: 日本の歴史の大きな流れ, 5枚)
│
├── node_japan_prehistoric (先史・古代) [入門クリアで開放]
│   ├── quiz: quiz_japan_prehistoric_desc (説明文: 先史〜古代の変化, 6枚)
│   ├── quiz: quiz_japan_prehistoric_term (用語: 縄文〜平安, 7枚)
│   │
│   ├── node_japan_asuka_nara (飛鳥・奈良の出来事) [上記クリアで開放]
│   │   ├── quiz: quiz_japan_asuka_nara_desc (説明文, 5枚)
│   │   └── quiz: quiz_japan_asuka_nara_term (用語, 7枚)
│   │
│   └── node_japan_heian (平安時代の出来事) [上記クリアで開放]
│       ├── quiz: quiz_japan_heian_desc (説明文, 5枚)
│       └── quiz: quiz_japan_heian_term (用語, 7枚)
│
├── node_japan_medieval (中世・近世) [入門クリアで開放]
│   ├── quiz: quiz_japan_medieval_desc (説明文: 中世〜近世の変化, 6枚)
│   ├── quiz: quiz_japan_medieval_term (用語: 鎌倉〜江戸, 6枚)
│   │
│   ├── node_japan_kamakura (鎌倉時代の出来事) [上記クリアで開放]
│   │   └── quiz: quiz_japan_kamakura_term (用語, 7枚)
│   │
│   ├── node_japan_muromachi (室町・戦国の出来事) [上記クリアで開放]
│   │   └── quiz: quiz_japan_muromachi_term (用語, 7枚)
│   │
│   └── node_japan_edo (江戸時代) [上記クリアで開放]
│       ├── quiz: quiz_japan_edo_desc (説明文: 江戸5分割, 5枚)
│       ├── quiz: quiz_japan_edo_shogun_early (将軍: 前半, 7枚)
│       ├── quiz: quiz_japan_edo_shogun_late (将軍: 後半, 7枚)
│       └── quiz: quiz_japan_edo_events (出来事, 7枚)
│
├── node_japan_modern (近代・現代) [入門クリアで開放]
│   ├── quiz: quiz_japan_modern_desc (説明文: 近代〜現代の変化, 5枚)
│   ├── quiz: quiz_japan_modern_term (用語: 明治〜昭和, 6枚)
│   │
│   ├── node_japan_bakumatsu (幕末〜明治の出来事) [上記クリアで開放]
│   │   ├── quiz: quiz_japan_bakumatsu_desc (説明文, 5枚)
│   │   └── quiz: quiz_japan_bakumatsu_term (用語, 7枚)
│   │
│   └── node_japan_taisho_showa (大正〜昭和の出来事) [上記クリアで開放]
│       └── quiz: quiz_japan_taisho_showa_term (用語, 7枚)
│
└── node_japan_all_eras (全時代通し) [先史・中世・近代の3ノードクリアで開放]
    └── quiz: quiz_japan_all_eras_term (用語: 全時代, 14枚)
```

---

## 4. categoryとアイコンの対応表

| category値 | 表示ラベル | アイコン | 説明 |
|-----------|----------|---------|------|
| era | 時代 | 📅 | 時代区分そのもの |
| law | 政治・法 | ⚖️ | 法律、制度、政治改革 |
| war | 戦・外交 | ⚔️ | 戦争、条約、外交事件 |
| culture | 文化・宗教 | 🎨 | 文学、芸術、宗教、思想 |
| economy | 経済・技術 | 💰 | 経済政策、技術革新、産業 |
| person | 人物 | 👤 | 特定の人物が主題 |
| event | 出来事 | 📌 | 上記に分類しにくい出来事全般 |

---

## 5. ユーザー進捗データ

端末側（またはバックエンド）に保存するユーザーの学習履歴。

### 5.1 QuizResult（問題の回答履歴）

```json
{
  "quiz_id": "quiz_japan_era_medieval",
  "mode": "careful",
  "attempts": [
    {
      "timestamp": "2026-04-01T10:30:00Z",
      "score": 5,
      "total": 6,
      "hint_used": true,
      "time_seconds": 45,
      "card_results": {
        "card_japan_kamakura": true,
        "card_japan_nanbokucho": false,
        "card_japan_muromachi": true,
        "card_japan_sengoku": true,
        "card_japan_azuchimomoyama": true,
        "card_japan_edo": true
      }
    }
  ],
  "best_score": 6,
  "cleared": true
}
```

### 5.2 CardStats（カード単位の正答率）

苦手重点出題の基盤データ。

```json
{
  "card_id": "card_japan_nanbokucho",
  "attempts": 5,
  "correct": 2,
  "accuracy": 0.4,
  "last_seen": "2026-04-01T10:30:00Z"
}
```

### 5.3 UnlockState（アンロック状態）

```json
{
  "node_id": "node_japan_medieval",
  "unlocked": true,
  "unlocked_at": "2026-04-01T10:25:00Z",
  "unlock_reason": "complete_quizzes"
}
```

---

## 6. ヒント・説明文の品質管理ルール

AI生成時に守るべきルールと、人によるレビュー時のチェック項目。

### 6.1 ヒント（用語カード）に含めてはいけない情報

| 禁止事項 | 例 | 理由 |
|---------|-----|------|
| 順番が確定する序数 | 「三代将軍」「第15代」 | 並べ替えの答えになる |
| 年号そのもの | 「1603年に〜」 | 年号で順番が確定する |
| 前後関係を示す語 | 「〜の後に」「〜の前の」 | 順番のヒントになりすぎる |

### 6.2 説明文カードに含めてはいけない情報

| 禁止事項 | 例 | 理由 |
|---------|-----|------|
| 固有名詞（人名・地名） | 「徳川吉宗が〜」 | 用語知識なしで解く趣旨に反する |
| 年号 | 「1716年〜」 | 上記同様 |
| 時代名そのもの | 「江戸時代中期は〜」 | 答えが明示される |

### 6.3 レビューチェックリスト

- [ ] ヒント・説明文に順番確定情報がないか
- [ ] year（年代）が正確か（複数の教科書・資料で確認）
- [ ] 一言解説が簡潔かつ正確か（1〜2文以内）
- [ ] categoryとera_color_keyが適切か
- [ ] 同じ問題内のカード間で難易度のバラつきが大きすぎないか

---

## 7. データファイル構成

JSONファイルとして管理する場合の推奨構成。

```
data/
├── regions/
│   ├── japan.json            # Region定義 + era_colors
│   ├── europe.json
│   └── china.json
│
├── cards/
│   ├── japan/
│   │   ├── era.json          # 時代区分カード（用語）
│   │   ├── prehistoric.json   # 先史・古代の個別カード
│   │   ├── medieval.json      # 中世・近世の個別カード
│   │   ├── modern.json        # 近代・現代の個別カード
│   │   └── descriptions.json  # 説明文カード（全階層分）
│   ├── europe/
│   │   └── ...
│   └── china/
│       └── ...
│
├── quizzes/
│   ├── japan.json             # 日本史の全問題定義
│   ├── europe.json
│   └── china.json
│
├── tree/
│   ├── japan.json             # 日本史の階層ノード定義
│   ├── europe.json
│   └── china.json
│
└── meta/
    └── categories.json        # categoryとアイコンの対応表
```

**分割の基準：**

- cards/: 地域×テーマで分割。1ファイル数十枚程度。AI生成→レビューの単位としても扱いやすい
- quizzes/: 地域単位で1ファイル。問題数が増えたらテーマ別に分割可
- tree/: 地域単位で1ファイル。階層の全体像を1ファイルで見渡せるようにする

---

## 8. 初期リリースの規模見積もり

### 8.1 地域別の内訳

| 地域 | 説明文問題 | 用語問題 | 問題数計 | カード枚数（延べ） | ユニークカード（推定） |
|------|----------|---------|---------|------------------|-------------------|
| 日本史 | 6〜7問 | 9〜11問 | 15〜18問 | 約95枚 | 約70枚 |
| ヨーロッパ史 | 3〜5問 | 6〜8問 | 9〜13問 | 約75枚 | 約55枚 |
| 中国史 | 3〜5問 | 5〜6問 | 8〜11問 | 約60枚 | 約45枚 |
| 横断問題 | — | 4〜6問 | 4〜6問 | 約40枚 | （再利用） |
| **合計** | **12〜17問** | **24〜31問** | **約40〜48問** | **約270枚** | **約170枚** |

### 8.2 制作工数の目安

| 工程 | 単位あたり所要時間 | 総量 | 概算工数 |
|------|------------------|------|---------|
| カードのAI生成 | 1地域あたり1〜2時間 | 3地域 | 3〜6時間 |
| 人によるレビュー・修正 | 1カードあたり2〜3分 | 170枚 | 6〜9時間 |
| 問題（Quiz）の組み立て | 1問あたり10〜15分 | 45問 | 8〜11時間 |
| 階層ツリーの設計・入力 | 1地域あたり1〜2時間 | 3地域 | 3〜6時間 |
| **合計** | | | **約20〜32時間** |
