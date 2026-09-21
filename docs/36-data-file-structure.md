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
- **Type safety.** `data-registry.ts` casts the imported JSON to the domain types through `unknown`, so TypeScript does **not** check the shape of the content files. The real guard is the CI data check (`npm run test:unit`), which runs every Card / Quiz / Node validation rule over `src/data/**` — see [25-editor-validation-rules.md](25-editor-validation-rules.md) Section 7.4. Adding a required field to a type therefore needs a validation rule as well, or bad data will only surface at runtime.
- **Reserved IDs.** IDs starting with `__` are reserved for quizzes assembled at runtime (the weak-card review), which are never written to progress. The validator rejects them in shipped data.
- **Loading strategy.** Regions, nodes and quizzes are imported statically because the quiz list needs them immediately. Cards are about two thirds of the content and are only needed once a quiz starts, so each region's card file is a dynamic `import()` behind `CARD_LOADERS`, loaded on demand and cached in `data-loader.ts`. This keeps the card data off the home screen entirely (measured: ~476 KB raw / 97 KB gzip of card data no longer shipped on first load). The editor still loads every region via `loadAllCards()`.
- The category master lives in code (`src/lib/constants.ts`), not in a JSON file.
- `public/images/cards/{card_id}.webp` and `public/images/nodes/{node_id}.webp`: image files referenced via `has_image` / `has_cover_image` flags. Paths are not stored in JSON — they are derived from the entity ID. External URLs are not allowed.
