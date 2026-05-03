# Recommended Data File Structure

> Source: `rekikan-data-design.md` — Section 7

---

Recommended layout when managing the data as JSON files.

```
data/
├── regions/
│   ├── japan.json            # Region definition + era_colors
│   ├── europe.json
│   └── china.json
│
├── cards/
│   ├── japan/
│   │   ├── era.json          # Era division cards (term)
│   │   ├── prehistoric.json  # Prehistoric & ancient individual cards
│   │   ├── medieval.json     # Medieval & early modern individual cards
│   │   ├── modern.json       # Modern & contemporary individual cards
│   │   └── descriptions.json # Description cards (all hierarchy levels)
│   ├── europe/
│   │   └── ...
│   └── china/
│       └── ...
│
├── quizzes/
│   ├── japan.json            # All quiz definitions for Japanese history
│   ├── europe.json
│   └── china.json
│
├── tree/
│   ├── japan.json            # Hierarchy node definitions for Japanese history
│   ├── europe.json
│   └── china.json
│
└── meta/
    └── categories.json       # Category–icon mapping table

public/images/
├── cards/                    # AI-generated card images
│   ├── card_japan_kamakura.webp
│   └── ...                   # WebP, 1:1, 768×768 px, < 80 KB
└── nodes/                    # AI-generated node cover images
    ├── node_japan_medieval.webp
    └── ...                   # WebP, 16:9, 1280×720 px, < 150 KB
```

**Splitting criteria:**

- cards/: Split by region and theme. Roughly a few dozen cards per file. This also serves as a convenient unit for AI generation and review.
- quizzes/: One file per region. Can be split further by theme as the number of quizzes grows.
- tree/: One file per region. Keeps the entire hierarchy visible in a single file.
- `public/images/cards/{card_id}.webp` and `public/images/nodes/{node_id}.webp`: image files referenced via `has_image` / `has_cover_image` flags. Paths are not stored in JSON — they are derived from the entity ID. External URLs are not allowed.
