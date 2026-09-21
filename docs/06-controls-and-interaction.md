# Controls and Interaction Design

> Source: `rekikan-concept.md` — Sections 6.1–6.3

---

## 6.1 Core Interaction: Tap-to-Order (Challenge Mode)

A "tap in order to rearrange" approach is adopted.

**Interaction Flow:**

1. Shuffled cards are displayed
2. Tap the card you think is "oldest" → a ① badge appears on the card
3. Tap the card you think is "second oldest" → a ② badge appears
4. Repeat for the remaining cards
5. A "Confirm this order" button becomes active when all cards have been assigned a number
6. Pressing the button immediately transitions to the results screen

**Chosen-order tray:** The cards picked so far are also listed as compact chips above the card list, in the order chosen. Number badges alone make it hard to read back the whole sequence when correcting a mistake in the middle. Tapping a chip removes that card from the order.

**Cancel operation:** Tapping an already-selected card (or its chip in the tray) deselects it, and subsequent numbers shift down (e.g., if ② is deselected from ①②③, then ③ becomes ②).

**Confirm button:** Disabled until every card is numbered, and labelled 「あと N 枚えらぶ」 while cards remain, so the reason it cannot be pressed is visible.

> **Note:** Card locking via long-press has been removed. All card interaction is exclusively via tap/click.

## 6.2 Careful Mode Interaction

Simply tap one card from the remaining cards. No additional interaction instructions are needed — it is intuitive to use.

**Screen layout:** Confirmed cards are stacked at the top of the screen in the order they were fixed (numbered, with their date), and the remaining choices sit below the prompt. The prompt area also shows how many cards are left (「のこり N 枚」).

**Incorrect answer:** In addition to the card shaking and turning red, a short line appears under the prompt —「もっと古いカードがあるよ」— so the learner knows what to do next rather than only that they were wrong.

## 6.3 Card Visual States

| State                          | Display                            |
| ------------------------------ | ---------------------------------- |
| Unselected                     | Neutral gray appearance            |
| Selected                       | Accent color + number badge (①②③…) |
| Correct (after answer check)   | Green + ✓                          |
| Incorrect (after answer check) | Red + ✗                            |

All interactive cards are rendered as `<button>` elements, so they are reachable with Tab and activated with Enter / Space, and expose their content and state to screen readers (see [10-tech-stack.md](10-tech-stack.md) Section 10.3).
