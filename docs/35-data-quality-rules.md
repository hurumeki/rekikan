# Hint & Description Quality Rules

> Source: `rekikan-data-design.md` — Section 6

---

Rules to follow during AI generation, and checklist items for human review.

## 6.1 Information Prohibited in Hints (Term Cards)

| Prohibited | Example | Reason |
|------------|---------|--------|
| Ordinal numbers that fix sequence | "Third shogun (三代将軍)", "The 15th (第15代)" | Gives away the sorting answer |
| Explicit year numbers | "In 1603... (1603年に〜)" | The year directly reveals the order |
| Words indicating before/after | "After... (〜の後に)", "Before... (〜の前の)" | Too strong a hint about ordering |

## 6.2 Information Prohibited in Description Cards

| Prohibited | Example | Reason |
|------------|---------|--------|
| Proper nouns (personal or place names) | "Tokugawa Yoshimune... (徳川吉宗が〜)" | Contradicts the intent of solving without term knowledge |
| Year numbers | "1716... (1716年〜)" | Same as above |
| The era name itself | "In the mid-Edo period... (江戸時代中期は〜)" | Directly reveals the answer |

## 6.3 Review Checklist

- [ ] Do hints and descriptions avoid information that fixes the order?
- [ ] Is the year accurate? (Verify against multiple textbooks and sources)
- [ ] Is the brief explanation concise and accurate? (1–2 sentences)
- [ ] Are the category and era_color_key appropriate?
- [ ] Is the difficulty reasonably balanced across cards within the same quiz?
