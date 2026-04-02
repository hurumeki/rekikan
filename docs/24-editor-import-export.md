# Editor — Import & Export

> Source: `rekikan-editor-design.md` — Sections 6.1–6.2

---

## 6.1 Export

Click the "Export" button in the header to download the entire current dataset as JSON.

**Export Format:**

```jsonc
{
  "version": "1.0",
  "exported_at": "2026-04-01T10:00:00Z",
  "meta": {
    "regions_count": 3,
    "cards_count": 320,
    "quizzes_count": 45,
    "nodes_count": 30
  },
  "regions": [ ... ],
  "era_bands": [ ... ],
  "categories": [ ... ],
  "cards": [ ... ],
  "quizzes": [ ... ],
  "nodes": [ ... ]
}
```

**Export Options:**

| Option | Description |
|--------|-------------|
| All Data | All regions and all statuses |
| Approved Only | Only cards and quizzes with `approved` status (for production) |
| By Region | Export only a specific region |

---

## 6.2 Import

Click the "Import" button in the header to upload and load a JSON file.

**Import Modes:**

| Mode | Description |
|------|-------------|
| Overwrite | Discard all current data and replace with the imported data |
| Merge | Overwrite records with the same ID; add records with new IDs. No deletions are performed |

**Pre-Import Validation:**

A data integrity check is run before import, and the results are displayed in a dialog.

| Check | Description |
|-------|-------------|
| Schema validation | Required fields exist and types match |
| Duplicate IDs | No duplicate IDs within the same entity type |
| Referential integrity | Card's `region` exists in `regions`, and `era_color_key` is a valid key in the corresponding Region's `era_colors` object |
| Referential integrity | All card IDs in a quiz's `card_ids` exist |
| Parent-child integrity | Node's `parent_id` exists and there are no circular references |
| Quiz-Node integrity | All quiz IDs in a node's `quiz_ids` exist |
| Card count | Each quiz's card count is within the recommended range (5–8 cards) (warning only) |
| Hint check | Hints do not contain order-revealing information (warning only) |
