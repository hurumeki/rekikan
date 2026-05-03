# Hint & Description Quality Rules

> Source: `rekikan-data-design.md` — Section 6

---

Rules to follow during AI generation, and checklist items for human review.

## 6.1 Information Prohibited in Hints (Term Cards)

| Prohibited                        | Example                                        | Reason                              |
| --------------------------------- | ---------------------------------------------- | ----------------------------------- |
| Ordinal numbers that fix sequence | "Third shogun (三代将軍)", "The 15th (第15代)" | Gives away the sorting answer       |
| Explicit year numbers             | "In 1603... (1603年に〜)"                      | The year directly reveals the order |
| Words indicating before/after     | "After... (〜の後に)", "Before... (〜の前の)"  | Too strong a hint about ordering    |

## 6.2 Information Prohibited in Description Cards

| Prohibited                             | Example                                       | Reason                                                   |
| -------------------------------------- | --------------------------------------------- | -------------------------------------------------------- |
| Proper nouns (personal or place names) | "Tokugawa Yoshimune... (徳川吉宗が〜)"        | Contradicts the intent of solving without term knowledge |
| Year numbers                           | "1716... (1716年〜)"                          | Same as above                                            |
| The era name itself                    | "In the mid-Edo period... (江戸時代中期は〜)" | Directly reveals the answer                              |

## 6.3 範囲のある出来事（Year Ranges）の扱い

| ルール                    | 詳細                                                                                                                                                                           | 例                                                                        |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------- |
| **明確な1時点の指定**     | 期間のある出来事を問題にする場合、他の出来事との前後関係が曖昧にならないよう、「始まり」「終わり」「特定時点のトピック」など、どの時点を問うているのかをカード名で明確にする。 | 「遣唐使」→「第一回遣唐使の派遣」（630）、「遣唐使の廃止」（894）         |
| **`year_end` の使用制限** | 開始年から終了年までの範囲（`year_end`）があるカードは、原則として、同一のクイズ内の他のカードの時期と重ならない場合に限り、問題に含めることができる。                         | 「応仁の乱」（1467-1477）の場合、その期間内に他の出題カードがないなら可。 |
| **時代カードの分離**      | カテゴリが `era`（時代区分）である時代カードは、時代・大きな流れのみを問う問題（クイズ）でのみ使用し、具体的な出来事を問う問題には混ぜない。                                   | 「鎌倉時代」「室町時代」などは「全時代通し」などのクイズにのみ配置する。  |

## 6.4 AI-Generated Image Guidelines

Card and node images are produced by an external AI generation workflow. To preserve the learning design, follow these guidelines.

**Card images (term and description cards):**

| Rule                                                                                                                             | Reason                                                                                                |
| -------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Avoid photorealistic likenesses of historical persons; prefer silhouettes, symbolic compositions, or stylized portraits          | Faces of real persons are largely speculative and risk misinforming learners                          |
| Match period accuracy of clothing, armor, and architecture                                                                       | A misplaced detail can teach the wrong era association                                                |
| Description-card images must not surface proper nouns the description hides (no recognizable famous person, no labeled landmark) | Description cards are designed to be solvable without term knowledge — image cues must not break that |
| Avoid embedded text, captions, watermarks, dates                                                                                 | Text in images can leak the answer and looks low-quality at thumbnail scale                           |
| Avoid anachronistic objects (modern items in ancient scenes, etc.)                                                               | Same as period accuracy                                                                               |

**Node cover images:**

| Rule                                                  | Reason                                                       |
| ----------------------------------------------------- | ------------------------------------------------------------ |
| Use atmosphere / scenery rather than focused subjects | Covers represent an era band or grouping, not a single event |
| Echo the era-band color palette in the dominant tones | Reinforces the "strata" world-building                       |
| Avoid embedded text                                   | Same as above                                                |

**File requirements:**

| Asset            | Format | Aspect | Size          | Target weight |
| ---------------- | ------ | ------ | ------------- | ------------- |
| Card image       | WebP   | 1:1    | 768 × 768 px  | < 80 KB       |
| Node cover image | WebP   | 16:9   | 1280 × 720 px | < 150 KB      |

## 6.5 Review Checklist

- [ ] Do hints and descriptions avoid information that fixes the order?
- [ ] Is the year accurate? (Verify against multiple textbooks and sources)
- [ ] Is the brief explanation concise and accurate? (1–2 sentences)
- [ ] Are the category and era_color_key appropriate?
- [ ] Is the difficulty reasonably balanced across cards within the same quiz?
- [ ] Are Era cards strictly separated from event-specific quizzes?
- [ ] For cards with a duration (`year_end`), do they avoid overlapping with other cards in the same quiz? (Or is the exact point in time clarified in the title?)
- [ ] If `has_image` is set, does the image follow Section 6.4 (no embedded text, period-accurate, no proper-noun leakage for description cards)?
- [ ] If `has_cover_image` is set on a node, does the image use atmosphere / scenery and echo the era-band palette?
