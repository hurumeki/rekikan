# Feedback Design

> Source: `rekikan-concept.md` — Sections 7.1–7.2

---

## 7.1 Post-Answer Display (Results Screen)

Common to both modes, the following are displayed on the results screen after the answer check:

- Score: "X / X 正解"
- A "パーフェクト！" celebration when all answers are correct
- Cards listed in correct chronological order, each showing:
  - Correct/incorrect mark (✓ / ✗)
  - The correct date
  - A brief explanation ("what this era was like") — term cards only
  - Era-band color bar (always visible on results screen)
- Cards slide in with a staggered animation when the results screen appears

## 7.2 Challenge Mode — Position Comparison View

In Challenge Mode, the results screen displays a position-comparison column to the left of each card:

| Badge          | Meaning                            |
| -------------- | ---------------------------------- |
| Gray (top)     | Correct position (1, 2, 3…)        |
| Green (bottom) | User's chosen position — correct   |
| Red (bottom)   | User's chosen position — incorrect |

This allows users to immediately see which cards they placed in the wrong position and by how much.

## 7.3 Careful Mode-Specific Feedback

- **On a correct answer:** The card animates from its position in the remaining area and slides to the confirmed area at the top
- **On an incorrect answer:** The incorrectly chosen card shakes and remains in the pool of choices

---

## 7.4 Same-Year Cards

Some quizzes contain cards that share the same `year` (for example, the founding of the Kamakura shogunate and the placement of provincial constables, both 1185). Either order is historically correct, so scoring must not depend on the order they happen to appear in `card_ids`.

- **Challenge / Cross-Region Mode:** a card counts as correct when its year matches the year expected at that position, not when its index matches. Swapping two same-year cards still scores full marks.
- **Careful Mode:** any card whose year equals the oldest year among the remaining cards is accepted. When several cards share that year, all of them are correct answers for that step.
- **Editor:** a same-year pair raises a warning (see [25-editor-validation-rules.md](25-editor-validation-rules.md) Section 7.3) so the author can decide whether the pairing is intentional.
