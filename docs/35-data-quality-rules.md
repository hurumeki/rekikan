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

| ルール                    | 詳細                                                                                                                                                                           | 例                                                                      |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------- |
| **明確な1時点の指定**     | 期間のある出来事を問題にする場合、他の出来事との前後関係が曖昧にならないよう、「始まり」「終わり」「特定時点のトピック」など、どの時点を問うているのかをカード名で明確にする。 | 「遣唐使」→「第一回遣唐使の派遣」（630）、「遣唐使の廃止」（894）       |
| **`year_end` の使用制限** | 範囲が他のカードと重なるのを防ぐため、原則として `year_end` は使用しない。                                                                                                     | 「応仁の乱」（1467-1477）→ 「応仁の乱の勃発」（1467、`year_end: null`） |
| **例外（時代区分）**      | カテゴリが `era`（時代・長期間の区分）である場合は、他と重複しても問題ないため `year_end` の使用を許容する。                                                                   | 「ギリシア文明」（-800 - -146）                                         |

## 6.4 Review Checklist

- [ ] Do hints and descriptions avoid information that fixes the order?
- [ ] Is the year accurate? (Verify against multiple textbooks and sources)
- [ ] Is the brief explanation concise and accurate? (1–2 sentences)
- [ ] Are the category and era_color_key appropriate?
- [ ] Is the difficulty reasonably balanced across cards within the same quiz?
- [ ] If the card represents an event with a duration, does the title clarify the exact point in time (e.g. "Start of..."), and is `year_end` removed unless it's an `era`?
