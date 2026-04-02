# Editor — Card Management

> Source: `rekikan-editor-design.md` — Sections 3.1–3.3

---

## 3.1 List View

Cards are displayed in a table format.

**Columns:**

| Column | Description | Sortable | Approx. Width |
|--------|-------------|----------|---------------|
| Region | Region label (with emoji) | Yes | 60px |
| Era Band (時代帯) | Shown as a colored badge | Yes | 80px |
| Category | Shown as an icon | Yes | 40px |
| Term Name / Description Excerpt | Shows `name` if present; otherwise the first 30 characters of `description` | Yes | 200px |
| Date | `year_label` | Yes | 80px |
| Status | Badge display (color-coded) | Yes | 80px |
| Usage Count | Number of quizzes that include this card | Yes | 50px |
| Actions | Edit / Duplicate / Delete buttons | — | 100px |

**Filters:**

| Filter | Control |
|--------|---------|
| Region | Dropdown (multi-select) |
| Era Band | Dropdown (multi-select) |
| Category | Dropdown (multi-select) |
| Card Type | Term card / Description card |
| Review Status | draft / ai_generated / reviewed / approved |
| Text Search | Cross-field search across name, hint, and description |

**Bulk Actions:**

Select multiple cards via checkboxes and perform the following bulk operations:

- Bulk status change
- Bulk region / era band change
- Bulk delete

---

## 3.2 Card Edit Form

Clicking a card opens an edit form in a slide-out panel (or modal) on the right side.

**Form Layout:**

```
┌─ Card Edit ──────────────────────────────────┐
│                                              │
│  Card Type:     [Term Card ▼]                │
│                                              │
│  ── Basic Info ──                            │
│  Region:        [Japanese History ▼]         │
│  Term Name:     [Tokugawa Ieyasu        ]    │
│  Year:          [1603   ]                    │
│  Year Label:    [1603              ]         │
│                                              │
│  ── Visual Tags ──                           │
│  Era Band:      [Early Modern ▼] ■ Preview   │
│  Category:      [Person ▼]  👤               │
│                                              │
│  ── Content ──                               │
│  Hint:                                       │
│  [Victor of Sekigahara. First shogun to    ] │
│  [open the shogunate.                      ] │
│  ⚠️ Order-revealing info check               │
│                                              │
│  Description:                                │
│  [Won the Battle of Sekigahara and opened  ] │
│  [the Edo shogunate, laying the foundation ] │
│  [for roughly 260 years of peace.          ] │
│                                              │
│  ── Review ──                                │
│  Status:        [approved ▼]                 │
│  Review Notes:                               │
│  [                                         ] │
│                                              │
│  ── Usage ──                                 │
│  Quizzes that include this card:             │
│  • Edo-period Shoguns (first half) — Pos: 1  │
│  • All Eras (full sequence) — Pos: 11        │
│                                              │
│  [Save]  [Cancel]                            │
└──────────────────────────────────────────────┘
```

**Description Card Mode:**

When the card type is switched to "Description Card", the term name field is hidden and the hint field is also hidden. Because the description field serves as the card's front-facing text, its label changes to "Card Display Text".

**Hint — Order-Revealing Info Check:**

An automatic check that detects the following patterns when a hint is entered and displays a warning:

- Ordinal expressions such as "Nth" / "Nth-generation shogun (○代将軍)" / "the Nth"
- Direct date expressions such as "in [year]" / "in the [N]th century"
- Order-fixing expressions such as "the first" / "the last"

The warning does not block saving (it is informational only), but when changing the review status to `approved`, a recommendation is displayed if there are unresolved warnings.

---

## 3.3 New Card Creation

Click the "+ New Card" button at the top of the list view to open a blank edit form. The card ID is auto-generated in the format `{region}_{era_band_short}_{name_romaji}` and can be edited manually.

**Duplicate Feature:** Use the "Duplicate" button on an existing card to create a new card with all fields copied. Only the ID is changed by appending `_copy`. This is useful for mass-producing similar cards within the same era band.
