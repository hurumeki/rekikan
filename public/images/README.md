# Image assets

AI-generated images referenced by `Card.has_image` and `Node.has_cover_image` flags.

| Asset      | Format | Aspect | Size     | Target weight | Path                                 |
| ---------- | ------ | ------ | -------- | ------------- | ------------------------------------ |
| Card       | WebP   | 1:1    | 768×768  | < 80 KB       | `public/images/cards/{card_id}.webp` |
| Node cover | WebP   | 16:9   | 1280×720 | < 150 KB      | `public/images/nodes/{node_id}.webp` |

The path is derived from the entity ID; only the boolean flag is stored in JSON. External URLs are not allowed. See `docs/03-card-design.md`, `docs/09-ui-ux-guidelines.md`, and `docs/35-data-quality-rules.md` for full guidelines.
