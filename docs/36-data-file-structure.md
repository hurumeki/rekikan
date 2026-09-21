# Recommended Data File Structure

> Source: `rekikan-data-design.md` — Section 7

---

Recommended layout when managing the data as JSON files.

```
src/
├── data/
│   ├── regions.json          # All region definitions + era_colors
│   │
│   ├── cards/
│   │   ├── japan.json        # All cards for Japanese history
│   │   ├── europe.json
│   │   └── ...               # One file per region
│   │
│   ├── quizzes/
│   │   ├── japan.json        # All quiz definitions for Japanese history
│   │   ├── europe.json
│   │   ├── world.json        # Theme / cross-region quizzes
│   │   └── ...
│   │
│   └── nodes/
│       ├── japan.json        # Hierarchy node definitions for Japanese history
│       ├── europe.json
│       ├── world.json
│       └── ...
│
└── lib/
    ├── data-registry.ts      # Single source of truth for shipped regions
    ├── constants.ts          # Category → icon / label mapping
    └── admin/categories.ts   # Category master data for the editor

public/images/
├── cards/                    # AI-generated card images
│   ├── card_japan_kamakura.webp
│   └── ...                   # WebP, 1:1, 768×768 px, < 80 KB
└── nodes/                    # AI-generated node cover images
    ├── node_japan_medieval.webp
    └── ...                   # WebP, 16:9, 1280×720 px, < 150 KB
```

**Splitting criteria:**

- `cards/`: One file per region. Split further by theme if a single file becomes hard to review.
- `quizzes/`: One file per region. Cross-region and theme quizzes live in `world.json`.
- `nodes/`: One file per region. Keeps the entire hierarchy visible in a single file.
- Every file is registered in `src/lib/data-registry.ts`; adding a region there propagates it to the app, the editor's initial state, and static-param generation.
- The category master lives in code (`src/lib/constants.ts`), not in a JSON file.
- `public/images/cards/{card_id}.webp` and `public/images/nodes/{node_id}.webp`: image files referenced via `has_image` / `has_cover_image` flags. Paths are not stored in JSON — they are derived from the entity ID. External URLs are not allowed.
