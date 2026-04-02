# Editor — Master Data Management

> Source: `rekikan-editor-design.md` — Sections 5.1–5.3

---

## 5.1 Regions

Manages the top-level region entities (e.g., Japanese History, European History, Chinese History).

| Operation | Description |
|-----------|-------------|
| List | Display ID, label, emoji, accent color, and sort order in a table |
| Edit | Inline editing or modal. Editable fields: `label`, `emoji`, `color`, sort order |
| Add | Add a new region with a unique ID |
| Delete | Show a warning if any cards, quizzes, or nodes reference this region. Deletion is blocked until references are removed |

Each region also owns its `era_colors` definitions (see Section 5.2). When editing a region, the era color entries are displayed below the region's basic fields.

---

## 5.2 Era Bands (era_colors)

Era bands are defined as entries within each Region's `era_colors` object. They are displayed grouped by region, with each era band's color shown as a preview swatch.

| Field | Description |
|-------|-------------|
| Key | The `era_color_key` used by cards (e.g., `prehistoric_ancient`, `medieval`) |
| Label | Display name (e.g., "Prehistory & Antiquity", "Medieval") |
| Color | Hex color value, shown as a preview swatch |

**Operations:**
- Add / edit / delete era band entries within a region
- Reorder entries to control display order
- Deletion is blocked if any cards reference the era band key

> **Note:** When exporting data, `era_colors` from all regions are flattened into a top-level `era_bands` array. See [24-editor-import-export.md](24-editor-import-export.md) for the export format.

---

## 5.3 Categories

A list of category definitions shared across all regions. Each entry maps a `category` value to a display label and icon.

| Field | Description |
|-------|-------------|
| Value | The `category` value used by cards (e.g., `era`, `law`, `war`) |
| Label | Display name (e.g., "Era", "Politics / Law") |
| Icon | Emoji icon displayed on cards (e.g., 📅, ⚖️, ⚔️) |

**Operations:**
- Add / edit / delete category entries
- Reorder entries to control display order
- Deletion shows a warning if any cards reference the category

See [33-data-categories.md](33-data-categories.md) for the full category-icon mapping table.
