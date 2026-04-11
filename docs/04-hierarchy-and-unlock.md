# Hierarchy Structure and Unlock System

> Source: `rekikan-concept.md` — Sections 4.1–4.4

---

## 4.1 Design Philosophy

Questions are managed in a hierarchical tree structure. Clearing upper-level questions unlocks lower-level ones. This naturally guides the learning sequence while providing game-like motivation through the mechanic of "unlocking the next stage."

## 4.2 Hierarchy Example (Japanese History)

```
Japanese History
├── [Intro] Arrange by descriptions: The flow of Japanese history (5–6 cards)
│   ├── [Lv.1] Prehistory & Antiquity (Jōmon to Heian) (6–7 cards)
│   ├── [Lv.1] Medieval & Early Modern (Kamakura to Edo) (5–6 cards)
│   ├── [Lv.1] Modern & Contemporary (Meiji to Shōwa) (5–6 cards)
│   └── [Full] All era divisions (14 cards)  *Unlocked after clearing the above 3
│       ├── [Lv.2] Edo-period shoguns (7 cards × first half / second half)
│       │   └── [Lv.3] Edo-period events
│       ├── [Lv.2] Bakumatsu to Meiji events (7 cards)
│       └── ...
└── [Cross-region] Japan × World simultaneous-era puzzle  *Unlocked after clearing Lv.1 in multiple regions
```

## 4.3 Cards per Question

**Aim for around 7 cards (5–8) per question.**

- Fits on a single smartphone screen without scrolling
- Aligns with the cognitive psychology concept of Miller's magic number 7 ± 2, reducing the chance of beginners giving up
- Items with many entries, such as Japanese era divisions (14 cards), are split first and then solved as a "full sequence"

**Role of full-sequence questions (10+ cards):** Placed as a "summary test" after completing the split stages. Since users have already studied each block, the higher card count is within an acceptable range given their readiness.

## 4.4 Unlock Rules

- In the initial state, only the "Intro (description cards)" for each region is playable
- Clearing the Intro unlocks that region's Lv.1 (split stages)
- Clearing all split stages unlocks the "Full sequence"
- Clearing the Full sequence unlocks Lv.2 and beyond
- Clearing Lv.1 in multiple regions unlocks "Cross-region questions"

**Safety net:** The next stage also unlocks if the user attempts the same stage a certain number of times (e.g., 3 times) or clears it with hints ON. This prevents the frustration of being stuck and unable to progress.

## 4.5 Locked Quiz Interaction

Locked quizzes are displayed in the quiz list with a 🔒 icon. Tapping a locked quiz displays a modal explaining the unlock conditions in plain language, such as:

- `complete_quizzes` → "Clear「○○」"
- `complete_node` → "Clear all quizzes in「○○」"
- `attempts` → "Play「○○」N times"
- `hint_clear` → "Clear「○○」with hints ON"

The modal can be dismissed by tapping the overlay or the close button.
