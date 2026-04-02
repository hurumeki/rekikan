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
5. A "Confirm this order" button appears at the top of the screen
6. Pressing the button rearranges the cards into the selected order and locks them in place

**Cancel operation:** Tapping an already-selected card deselects it, and subsequent numbers shift down (e.g., if ② is deselected from ①②③, then ③ becomes ②).

**Card locking:** Long-pressing a card toggles a lock. Locked cards display a lock icon and their position does not change. When you are certain about specific cards, you can lock them and focus on arranging only the rest.

## 6.2 Careful Mode Interaction

Simply tap one card from the remaining cards. No additional interaction instructions are needed — it is intuitive to use.

## 6.3 Card Visual States

| State | Display |
|-------|---------|
| Unselected | Neutral gray appearance |
| Selected | Accent color + number badge (①②③…) |
| Locked | Distinct color + lock icon |
| Correct (after answer check) | Green + ✓ |
| Incorrect (after answer check) | Red + ✗ |
