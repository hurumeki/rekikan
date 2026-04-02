# Data Entity Definitions

> Source: `rekikan-data-design.md` — Sections 2.1–2.5

---

## 2.1 Region

The root of the tree.

```json
{
  "id": "japan",
  "label": "日本史",
  "emoji": "🇯🇵",
  "color": "#e85d75",
  "era_colors": {
    "prehistoric_ancient": { "label": "先史・古代", "color": "#4ade80" },
    "medieval": { "label": "中世", "color": "#60a5fa" },
    "early_modern": { "label": "近世", "color": "#a78bfa" },
    "modern": { "label": "近代", "color": "#fb923c" },
    "contemporary": { "label": "現代", "color": "#f87171" }
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique identifier |
| label | string | Display name |
| emoji | string | Icon |
| color | string | Accent color for the region |
| era_colors | object | Era band (時代帯) color definitions. Used for visual tags on cards |

## 2.2 Card

The content entity. All cards are managed in a flat master table.

**Term card example:**

```json
{
  "id": "card_japan_kamakura",
  "region": "japan",
  "type": "term",
  "name": "鎌倉時代",
  "year": 1185,
  "year_end": 1333,
  "era_color_key": "medieval",
  "category": "era",
  "hint": "源頼朝・武士の政治・元寇",
  "description": "源頼朝が幕府を開き、武士が政治の中心に立った時代。",
  "tags": ["政治"],
  "status": "approved"
}
```

**Description card example:**

```json
{
  "id": "card_japan_edo_desc_mid",
  "region": "japan",
  "type": "description",
  "name": null,
  "year": 1716,
  "year_end": 1787,
  "era_color_key": "early_modern",
  "category": null,
  "hint": null,
  "description": "財政が苦しくなり、幕府が何度も改革を試みた時代。",
  "tags": [],
  "status": "reviewed"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | ✓ | Unique identifier. Naming convention: `card_{region}_{identifier}` |
| region | string | ✓ | ID of the region this card belongs to |
| type | enum | ✓ | `"term"` (term card) or `"description"` (description card) |
| name | string / null | | Term name. null for description cards |
| year | number | ✓ | Start year (sort key; negative for BCE) |
| year_end | number / null | | End year. Used when the card spans a period |
| era_color_key | string | ✓ | Key for the era band color. References Region.era_colors |
| category | string / null | | Category for the icon display (see category mapping table) |
| hint | string / null | | Hint (keyword format). Not needed for description cards |
| description | string | ✓ | For term cards: a brief explanation. For description cards: the card body text |
| tags | string[] | | Auxiliary tags for search and filtering |
| status | enum | ✓ | `"draft"`, `"ai_generated"`, `"reviewed"`, `"approved"` |

**Additional fields for quality management (operational use):**

| Field | Type | Description |
|-------|------|-------------|
| source | string | Citation / reference textbook |
| reviewer | string | Name of the reviewer |
| notes | string | Review comments |

## 2.3 Quiz

Defines a combination of cards and how they are presented.

```json
{
  "id": "quiz_japan_era_medieval",
  "region": "japan",
  "title": "中世・近世の時代",
  "card_type": "term",
  "card_ids": [
    "card_japan_kamakura",
    "card_japan_nanbokucho",
    "card_japan_muromachi",
    "card_japan_sengoku",
    "card_japan_azuchimomoyama",
    "card_japan_edo"
  ],
  "modes": ["careful", "challenge"],
  "difficulty": 1
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | ✓ | Unique identifier. Naming convention: `quiz_{region}_{identifier}` |
| region | string | ✓ | ID of the region. For cross-region quizzes use `"cross_region"` |
| regions | string[] / null | | Array of related region IDs for cross-region quizzes. Omitted for regular quizzes |
| title | string | ✓ | Quiz title (for display) |
| card_type | enum | ✓ | `"term"` or `"description"` |
| card_ids | string[] | ✓ | Array of card IDs to use (**listed in correct order**) |
| modes | string[] | ✓ | Available play modes: `"careful"`, `"challenge"` |
| difficulty | number | ✓ | Difficulty level (1 = easy, 2 = medium, 3 = hard) |

The card_ids are listed in correct order (chronological). The app shuffles them before presenting the quiz.

## 2.4 Node

Each node of the hierarchy tree. Holds quizzes and unlock conditions.

```json
{
  "id": "node_japan_medieval",
  "region": "japan",
  "parent_id": "node_japan_root",
  "label": "中世・近世",
  "sort_order": 2,
  "quiz_ids": [
    "quiz_japan_era_medieval_desc",
    "quiz_japan_era_medieval"
  ],
  "unlock_condition": {
    "type": "complete_quizzes",
    "quiz_ids": ["quiz_japan_era_intro_desc"]
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | ✓ | Unique identifier |
| region | string | ✓ | ID of the region |
| parent_id | string / null | | Parent node ID. null for the root |
| label | string | ✓ | Display name |
| sort_order | number | ✓ | Display order among siblings |
| quiz_ids | string[] | ✓ | Quiz IDs contained in this node (in display order) |
| unlock_condition | object / object[] / null | | Unlock condition. null means unlocked from the start |

## 2.5 UnlockCondition

```json
// Unlock after clearing specific quizzes
{ "type": "complete_quizzes", "quiz_ids": ["quiz_japan_era_intro_desc"] }

// Unlock after clearing all quizzes under specific nodes
{ "type": "complete_node", "node_ids": ["node_japan_prehistoric", "node_japan_medieval", "node_japan_modern"] }

// Unlock after a certain number of attempts (as a fallback)
{ "type": "attempts", "quiz_id": "quiz_japan_era_medieval", "count": 3 }

// Unlock after clearing with hints enabled (as a fallback)
{ "type": "hint_clear", "quiz_id": "quiz_japan_era_medieval" }
```

| type | Description |
|------|-------------|
| complete_quizzes | Clear all specified quiz IDs |
| complete_node | Clear all quizzes under the specified nodes |
| attempts | Attempt a specified quiz a certain number of times (fallback) |
| hint_clear | Clear a specified quiz with hints enabled (fallback) |

**Compound conditions use OR logic.** Provide an array; the node unlocks when any one condition is satisfied.

```json
{
  "unlock_condition": [
    { "type": "complete_quizzes", "quiz_ids": ["quiz_japan_era_medieval"] },
    { "type": "attempts", "quiz_id": "quiz_japan_era_medieval", "count": 3 },
    { "type": "hint_clear", "quiz_id": "quiz_japan_era_medieval" }
  ]
}
```
