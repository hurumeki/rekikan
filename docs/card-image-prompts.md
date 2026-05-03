# Card Image Generation — Prompt Templates

> Manual generation flow using **Antigravity → Nano Banana (Gemini 2.5 Flash Image)**.
> Output spec follows [03-card-design.md §3.4](03-card-design.md): WebP, 768×768 px, 1:1, < 80 KB, saved to `public/images/cards/{card_id}.webp`.

---

## 1. ポリシー (全カード共通)

| 項目 | ルール |
|------|--------|
| 生存中の人物 | **描かない**。実在の生存者を被写体・背景・群衆に含めない。生存中の歴史人物カードは「象徴的な持ち物 / 場面 / 紋章」で代替する。 |
| 故人 (歴史上の人物) | **イラスト調で描く**。写実顔・実写写真風はNG。手描き / 水彩 / 浮世絵風 など、明らかに絵と分かる画調にする。 |
| 文字 | 画像内に文字・キャプション・署名・透かしを入れない。旗・看板・巻物の文字も読めない筆致にする。 |
| 構図 | 正方形 (1:1)。サムネイル時に主題が一目で読み取れる中央寄り構図。 |
| 時代考証 | 服装・建築・道具・髪型は当該時代に整合させる。現代物 (時計・眼鏡・腕時計・スマホ等) を混ぜない。 |
| 記述カード | 固有名詞を画面に出さない (家紋・特定の城・特定の銅像など、答えを示唆する要素を避ける)。 |

---

## 2. ベーススタイル (全プロンプトに付ける共通ブロック)

英語で組み立てた方が Nano Banana の追従が安定するため、共通部は英語で固定し、可変部にカード固有情報を差し込む。

```
Style: hand-drawn historical illustration, soft watercolor / ink-wash texture, muted period-accurate color palette, gentle lighting, painterly brushwork, no photorealism.
Composition: square 1:1, centered subject, readable as a 768x768 thumbnail, clean background with light atmospheric depth.
Constraints: no text, no captions, no signatures, no watermarks, no logos, no modern objects, no UI overlays. Faces (if any) must be clearly illustrated, never photoreal.
```

ネガティブプロンプト (Nano Banana では明文の禁則として末尾に追記):

```
Avoid: photorealism, 3D render, modern clothing, modern devices, readable text, watermark, signature, logo, depiction of any living person.
```

---

## 3. カテゴリ別テンプレート

可変部は `{{...}}` で示す。差し込み後、上の「ベーススタイル」と「Avoid」を必ず付加する。

### 3.1 Person (人物) — 故人のみ

```
Illustrated portrait of {{person_name}}, a deceased historical figure from {{region}} ({{era_band}}, around {{year_label}}).
Show them at approximately {{age_range}} years old, wearing era-appropriate {{attire}} (e.g., Heian court robes / Sengoku armor / Meiji formal wear).
Pose: {{pose}} (e.g., calm three-quarter portrait, holding {{characteristic_prop}}).
Background: simple period-evocative backdrop ({{background_hint}}), low contrast so the figure stands out.
```

> 生存中の人物カードを作成する場合は、3.6 Event テンプレートに切り替え、人物の代わりに紋章・著作・関連物・ゆかりの場所を主題にする。

### 3.2 War / Diplomacy (戦争・外交)

```
Symbolic illustrated scene representing {{event_name}} ({{region}}, {{era_band}}, {{year_label}}).
Depict period-appropriate elements such as {{visual_elements}} (e.g., banners with abstract crests, distant troop silhouettes, warships, treaty table with brushes and scrolls).
No specific identifiable faces; figures are shown from a distance, in silhouette, or from behind.
Mood: {{mood}} (tense / solemn / decisive).
```

### 3.3 Culture / Religion (文化・宗教)

```
Representative illustrated motif of {{cultural_subject}} from {{region}} ({{era_band}}).
Show {{form}} (e.g., a hanging scroll, a statue, a stage scene, a temple interior, a representative painting style of the era) rendered as a hand-drawn homage rather than a photo of an actual artifact.
Lighting: gentle, contemplative.
```

### 3.4 Politics / Law (政治・法律)

```
Illustration centered on a characteristic artifact or architecture evoking {{policy_or_law_name}} ({{region}}, {{era_band}}).
Subject options: {{subject_choice}} (e.g., a sealed scroll on a lacquered desk, the gate of a government office, a stone monument, ceremonial regalia).
No people in the foreground; if any figures appear, only as small distant silhouettes.
```

### 3.5 Economy / Technology (経済・技術)

```
Illustration of a characteristic {{artifact_or_scene}} representing {{economy_or_tech_subject}} ({{region}}, {{era_band}}).
Examples: {{examples}} (e.g., coins arrayed on cloth, a waterwheel beside a workshop, a merchant ship at port, an early loom, a printing block).
Show the object/scene clearly enough to identify the technology, with subtle period-accurate environment.
```

### 3.6 Event (出来事)

```
Symbolic illustrated scene of {{event_name}} ({{region}}, {{era_band}}, {{year_label}}).
Depict {{key_elements}} (e.g., a smoking castle on a hill, a procession crossing a bridge, a meeting in a tatami room) with figures only as silhouettes or from behind.
No identifiable faces, no readable text.
```

### 3.7 Era (時代区分)

```
Atmosphere illustration evoking the daily life of {{era_name}} ({{region}}).
Landscape and settlement view: {{scene_summary}} (e.g., thatched villages and rice paddies / wooden townhouse street with shop curtains / port town with foreign ships at anchor).
Show only common people in the distance, unidentifiable, in period-accurate clothing.
No proper nouns, no crests, no signage.
```

### 3.8 Description Card (記述カード)

```
Atmosphere illustration that conveys the mood of: "{{description_excerpt}}".
Show {{landscape_or_daily_life_scene}} appropriate to {{era_band}} in {{region}}.
Strictly avoid any element that names the era directly: no readable text, no famous landmarks, no clan crests, no recognizable portraits, no era-defining icons that would give away the answer.
The viewer should *feel* the era from clothing, tools, architecture, and light — not identify it from a labeled object.
```

---

## 4. 組み立て例 (Person — 徳川家康)

```
Illustrated portrait of Tokugawa Ieyasu, a deceased historical figure from Japan (Early Modern, around 1603).
Show him at approximately 60 years old, wearing era-appropriate formal kamishimo or dark armor with subdued gold accents.
Pose: calm three-quarter portrait, seated, hands resting on a war fan.
Background: simple period-evocative backdrop (gold-leaf folding screen suggestion, low contrast) so the figure stands out.

Style: hand-drawn historical illustration, soft watercolor / ink-wash texture, muted period-accurate color palette, gentle lighting, painterly brushwork, no photorealism.
Composition: square 1:1, centered subject, readable as a 768x768 thumbnail, clean background with light atmospheric depth.
Constraints: no text, no captions, no signatures, no watermarks, no logos, no modern objects, no UI overlays. Faces (if any) must be clearly illustrated, never photoreal.

Avoid: photorealism, 3D render, modern clothing, modern devices, readable text, watermark, signature, logo, depiction of any living person.
```

---

## 5. ワークフロー

1. カードJSONから `id`, `name`, `region`, `era_band`, `year_label`, `category`, `description` / `hint` を控える。
2. 上のカテゴリ別テンプレートを選び、`{{...}}` を埋める。共通スタイル + Avoid を末尾に付加。
3. Antigravity から Nano Banana (Gemini 2.5 Flash Image) に投入し、生成。納得いくまで再生成。
4. 出力を **768×768 / WebP / quality≈80 / < 80 KB** に変換 (Squoosh / `cwebp` / `sharp` いずれでも可)。
5. `public/images/cards/{card_id}.webp` に配置。
6. エディタでカードを開き、`has_image` をONにして保存。エディタのプレビューが表示されることを確認。
7. レビュー時、生存者を描いていないか / 文字が画像内に出ていないか / 答えを示唆していないか をチェック。
