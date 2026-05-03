# Editor — Quiz & Tree Management

> Source: `rekikan-editor-design.md` — Sections 4.1–4.4

---

## 4.1 Hierarchical Tree View

Nodes are displayed as a hierarchical tree, and the quizzes associated with each node are managed from here.

```
┌─ Tree & Quiz Management ──────────────────────────────────┐
│                                                            │
│  [Region Filter: All ▼]  [+ New Node]  [+ New Quiz]       │
│                                                            │
│  🇯🇵 Japanese History                                      │
│  ├── 📝 Broad Flow of Japanese History   Desc   5 cards ✅│
│  │   ├── 📅 Prehistory & Antiquity       Term   7 cards ✅│
│  │   │   ├── 📝 Changes in Ancient Eras  Desc   5 cards 🟡│
│  │   │   ├── 📅 Asuka & Nara Events      Term   7 cards 🟡│
│  │   │   └── 📅 Heian Period Events      Term   6 cards ⬜│
│  │   ├── 📅 Medieval & Early Modern      Term   6 cards ✅│
│  │   │   ├── 📝 Medieval–Early Mod. Ch.  Desc   5 cards ⬜│
│  │   │   ├── 📅 Kamakura & Muromachi Ev. Term   7 cards ⬜│
│  │   │   ├── ...                                           │
│  │   ├── 📅 Modern & Contemporary        Term   6 cards ✅│
│  │   └── 📅 All Eras (full sequence)     Term  14 cards ⬜│
│  │                                                         │
│  🏰 European History                                       │
│  ├── ...                                                   │
│                                                            │
│  Legend: ✅ approved  🟡 reviewed  ⬜ draft/ai_generated   │
└────────────────────────────────────────────────────────────┘
```

**Tree Operations:**

- Drag-and-drop to change parent-child relationships and sort order of nodes
- Clicking a node opens a detail editing panel on the right

---

## 4.2 Node & Quiz Edit Panel

Clicking a node opens a panel for editing the node's information and its child quizzes.

```
┌─ Node Edit ───────────────────────────────────────┐
│                                                    │
│  ── Node Info ──                                   │
│  ID:           node_japan_edo                      │
│  Label:        [Edo Period                    ]    │
│  Region:       [Japanese History ▼]                │
│  Parent Node:  [Medieval & Early Modern ▼]         │
│  Sort Order:   [3]                                 │
│                                                    │
│  ── Cover Image ──                                 │
│  [✓] Has cover image                               │
│  Path: /images/nodes/node_japan_edo.webp           │
│  ┌────────────────────┐                            │
│  │      preview       │ (1280×720 WebP, < 150 KB)  │
│  └────────────────────┘                            │
│  ⚠️ File missing — placed by AI workflow           │
│                                                    │
│  ── Unlock Condition ──                            │
│  Condition Type: [Quiz Clear ▼]                    │
│  Target:         quiz_japan_medieval_term           │
│                                                    │
│  Rescue: Force-unlock after [3] attempts           │
│          ☑ Unlock even with hints-on clear         │
│                                                    │
│  ── Child Quizzes ──                               │
│  • quiz_japan_edo_desc (Desc: Edo 5-split, 5 cards)│
│  • quiz_japan_edo_shogun_early (Shogun: 1st, 7)    │
│  • quiz_japan_edo_shogun_late (Shogun: 2nd, 7)     │
│                                                    │
│  [+ Add Quiz]                                      │
│                                                    │
│  [Save]  [Cancel]  [Delete]                        │
└────────────────────────────────────────────────────┘
```

Clicking a quiz opens the quiz edit panel.

```
┌─ Quiz Edit ───────────────────────────────────────┐
│                                                    │
│  ── Basic Info ──                                  │
│  ID:           quiz_japan_edo_shogun_early          │
│  Title:        [Edo-period Shoguns (first half) ]  │
│  Card Type:    [Term Card ▼]                       │
│  Region:       [Japanese History ▼]                │
│  Difficulty:   [1 ▼]                               │
│  Modes:        ☑ Careful  ☑ Challenge              │
│                                                    │
│  ── Card Composition ──                            │
│  Order  Card                   Year    Status      │
│  ┌─────────────────────────────────────────────┐   │
│  │ 1  Tokugawa Ieyasu          1603    ✅      │   │
│  │ 2  Tokugawa Hidetada        1605    ✅      │   │
│  │ 3  Tokugawa Iemitsu         1623    ✅      │   │
│  │ 4  Tokugawa Ietsuna         1651    🟡      │   │
│  │ 5  Tokugawa Tsunayoshi      1680    ✅      │   │
│  └─────────────────────────────────────────────┘   │
│  Count: 5 / Recommended 5–8 cards                  │
│                                                    │
│  [+ Add Card]  [Select from Existing Cards]        │
│                                                    │
│  ⚠️ Warning shown when card count is outside       │
│     the recommended range                          │
│  ⚠️ 1 non-approved card is included               │
│                                                    │
│  [Save]  [Cancel]  [Delete]                        │
└────────────────────────────────────────────────────┘
```

---

## 4.3 Card Assignment

**"Select from Existing Cards" Dialog:**

A card selection dialog with the same filter and search capabilities as the Card Management screen. Select multiple cards via checkboxes and add them to a quiz in bulk. Cards are automatically sorted by year when added, setting the `card_ids` order accordingly.

**Card Composition Operations:**

| Operation            | Method                                                                    |
| -------------------- | ------------------------------------------------------------------------- |
| Change correct order | Drag-and-drop, or manually enter a position number                        |
| Remove a card        | Click the × button on the row (does not delete the card from master data) |
| Edit card details    | Click the row to navigate to the card edit panel                          |
| Auto-sort by date    | "Re-sort by date" button                                                  |

---

## 4.4 New Node / Quiz Creation

Create a node from the "+ New Node" button in the tree view, or from the right-click context menu "Add Child Node" on an existing node. The parent node's region is automatically inherited. Create a quiz from the "+ New Quiz" button or from the "+ Add Quiz" button inside the node edit panel.

---

## 4.5 Node Cover Image

Each node may carry an AI-generated cover image used as a banner in the quiz list and in the editor tree.

- **Toggle:** "Has cover image" sets `has_cover_image` on the node. The image file is produced by the external AI generation workflow and dropped into `public/images/nodes/{node_id}.webp`.
- **Preview:** when the toggle is ON, the panel attempts to load `/images/nodes/{node_id}.webp` and shows it at the standard 16:9 aspect ratio. A "file missing" placeholder is shown if absent.
- **Specification:** WebP, 1280 × 720 px, < 150 KB. External URLs are not allowed. See [09-ui-ux-guidelines.md](09-ui-ux-guidelines.md) Section 9.1.4.
