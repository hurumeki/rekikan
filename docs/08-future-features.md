# Future Features

> Source: `rekikan-concept.md` — Sections 8.1–8.3

---

## 8.1 Cross-Region Quizzes (Japan + World History)

A mode that mixes events from different regions that occurred in the same era. Shipped under the `world` region (`テーマ史・同時代史`). Quizzes are organized into era groups (古代 / 中世 / 近世 / 近代 / 20世紀前半 / 戦後・現代), broad theme groups (経済・革命・帝国・宗教・交流・科学技術 など), and field-based theme histories (文学・芸術・建築・音楽・哲学・法律). Each field-based theme is split into multiple quizzes by lineage (例: 西洋古典文学 / 日本古典文学 / 中国古典文学 / 近代小説).

- Example: Present "Kamakura Period (鎌倉時代)", "Age of the Crusades", and "Song Dynasty (宋)" together, and have the player arrange them chronologically across regions
- Enables experiential understanding of contemporaneity between Japan and the world
- Unlock policy: gated behind region intros — the era-based nodes need 2+ regions' intro quizzes cleared, the theme-history nodes 3+ (see [04-hierarchy-and-unlock.md](04-hierarchy-and-unlock.md) Section 4.4)

### Expansion candidates

- Add intermediate description-style cross-region quizzes (currently term-only)
- Era-band and timeline modes for cross-region quizzes (currently `cross_region` mode only)

## 8.2 Focused Drilling on Weak Areas (Implemented)

Per-card accuracy is recorded so that cards the player keeps getting wrong come back.

- **CardStats.** Every answer in every mode updates `{ attempts, correct, lastSeen }` per card, stored in `localStorage` under `rekikan_card_stats` (see [34-data-user-progress.md](34-data-user-progress.md) Section 5.2).
- **Review mode.** `/review` builds a quiz on the fly from the weakest cards — lowest accuracy first, ties broken by how long ago the card was last seen — up to 7 cards, and needs at least 3 weak cards to start. Cards that have never been answered incorrectly are excluded.
- **Entry point.** The home screen shows a "苦手カードの復習" entry above the region list once 3 or more weak cards exist, with the current count.
- **Scope.** A review session updates card statistics but not quiz progress, so it never unlocks hierarchy nodes. When the weak cards span several regions the session uses Cross-Region mode so that region badges are shown.

### Expansion candidates

- Spaced repetition (weight by elapsed time since `lastSeen`, not just accuracy)
- Mark quizzes that contain weak cards as "Recommended" in the quiz list

## 8.3 Other Expansion Candidates

- **Timeline view:** After answer checking, visualize the correct order as a timeline diagram
- **Achievements / Badges:** Earn badges for specific conditions (perfect score, consecutive correct answers, etc.)
- **Custom quiz creation:** Allow users to create and share their own card sets
