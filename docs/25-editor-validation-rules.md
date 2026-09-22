# Editor — Validation Rules

> Source: `rekikan-editor-design.md` — Sections 7.1–7.3

Validation rules applied during editing and saving.

---

## 7.1 Card

| Rule                     | Severity | Description                                                                                |
| ------------------------ | -------- | ------------------------------------------------------------------------------------------ |
| Required fields          | Error    | `id`, `region`, `year`, `year_label`, `era_color_key`, `category`, `description`, `status` |
| Term card `name`         | Error    | When `card_type` is `term`, `name` is required                                             |
| ID format                | Error    | Alphanumeric characters and underscores only, max 64 characters                            |
| ID uniqueness            | Error    | Must be unique across all cards                                                            |
| `region` exists          | Error    | Must be a value that exists in `regions`                                                   |
| `era_color_key` exists   | Error    | Must be a key that exists in `era_colors`                                                  |
| `category` exists        | Error    | Must be a value that exists in `categories`                                                |
| Hint order info          | Warning  | Detect patterns such as "Nth-generation (○代目)", "in [year] (○○年)", etc.                 |
| Hint-description overlap | Warning  | `hint` and `description` match by 80% or more                                              |
| Image file presence      | Warning  | When `has_image` is `true`, `public/images/cards/{id}.webp` should exist                   |

---

## 7.2 Node

| Rule                      | Severity | Description                                                                    |
| ------------------------- | -------- | ------------------------------------------------------------------------------ |
| Required fields           | Error    | `id`, `region`, `label`, `sort_order`, `quiz_ids`                              |
| Parent node exists        | Error    | If `parent_id` is specified, it must exist in `nodes`                          |
| Circular reference        | Error    | Parent-child relationships must not form a cycle                               |
| Unlock target exists      | Error    | All `quiz_ids` / `node_ids` within `unlock_condition` must exist               |
| `quiz_ids` exist          | Error    | All IDs in `quiz_ids` must exist in `quizzes`                                  |
| Cover image file presence | Warning  | When `has_cover_image` is `true`, `public/images/nodes/{id}.webp` should exist |

---

## 7.3 Quiz

| Rule                           | Severity | Description                                                                                                                                                                 |
| ------------------------------ | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Required fields                | Error    | `id`, `region`, `title`, `card_type`, `card_ids`, `modes`, `difficulty`                                                                                                     |
| Card count                     | Warning  | Fewer than 5 or 9 or more cards (full-sequence quizzes are an exception)                                                                                                    |
| Card region match              | Warning  | Quiz's `region` does not match the `region` of included cards (cross-region quizzes are an exception)                                                                       |
| `card_ids` exist               | Error    | All IDs in `card_ids` must exist in `cards`                                                                                                                                 |
| `card_ids` chronological order | Error    | `card_ids` is the correct answer order, so the referenced cards' `year` values must be non-decreasing. A descending pair makes the quiz unanswerable.                       |
| `card_ids` duplicates          | Error    | The same card must not appear twice in one quiz                                                                                                                             |
| Same-year cards                | Warning  | Two adjacent cards share the same `year`. Scoring treats them as interchangeable (see [07-feedback-design.md](07-feedback-design.md)), but the intended answer is ambiguous |
| Non-approved cards             | Warning  | Quiz contains cards that are not yet `approved`                                                                                                                             |

---

## 7.4 Applying the Rules to Shipped Content

`validateDataset()` in `src/lib/admin/validation.ts` applies every Card / Quiz / Node rule above to a whole dataset. It is used in two places:

- The editor's review screen, against the state being edited
- CI (`npm run test:data`), against the content bundled in `src/data/**`

CI fails on any `error`-level finding, so content that cannot be cleared can never reach the main branch. Warnings are reported but do not fail the build.
