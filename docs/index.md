# Rekikan — Specification Documents

**Version:** v1.0

This directory contains the complete specification for "Rekikan" (れきかん), a history learning app that uses card-sorting puzzles to help users develop chronological intuition. The specs are organized into three sections.

---

## App Concept (01–12)

Product vision, game design, and UI/UX guidelines.

| File | Topic |
|------|-------|
| [01-product-overview.md](01-product-overview.md) | Product name, concept, background, approach, target users |
| [02-target-content.md](02-target-content.md) | Covered regions (Japan, Europe, China) and expansion candidates |
| [03-card-design.md](03-card-design.md) | Card types (description / term), visual tags (era band colors, category icons) |
| [04-hierarchy-and-unlock.md](04-hierarchy-and-unlock.md) | Hierarchical tree structure, unlock rules, card count per quiz |
| [05-game-modes.md](05-game-modes.md) | Careful Mode and Challenge Mode |
| [06-controls-and-interaction.md](06-controls-and-interaction.md) | Tap-to-order interaction, card lock, cancel, visual states |
| [07-feedback-design.md](07-feedback-design.md) | Answer feedback, scoring, per-mode feedback |
| [08-future-features.md](08-future-features.md) | Cross-region quizzes, weak-area drilling, timeline view |
| [09-ui-ux-guidelines.md](09-ui-ux-guidelines.md) | Design principles, "strata" world-building, color system, screen layout |
| [10-tech-stack.md](10-tech-stack.md) | App architecture, content production pipeline, accessibility |
| [11-development-roadmap.md](11-development-roadmap.md) | Phased roadmap (MVP → hierarchy → learning support → expansion) |
| [12-learning-design-principles.md](12-learning-design-principles.md) | Pedagogical principles behind the design |

## Editor / Review Tool Design (20–27)

Web-based SPA for creating, editing, and reviewing card/quiz content.

| File | Topic |
|------|-------|
| [20-editor-overview.md](20-editor-overview.md) | Purpose, form factor, users, overall layout, tab structure |
| [21-editor-card-management.md](21-editor-card-management.md) | Card list, filters, edit form, hint validation, duplication |
| [22-editor-quiz-tree-management.md](22-editor-quiz-tree-management.md) | Node tree view, node/quiz editing panels, card assignment |
| [23-editor-master-data.md](23-editor-master-data.md) | Region, era band, and category master data management |
| [24-editor-import-export.md](24-editor-import-export.md) | JSON export format, import modes, pre-import validation checks |
| [25-editor-validation-rules.md](25-editor-validation-rules.md) | Validation rules for Cards, Nodes, and Quizzes |
| [26-editor-workflows.md](26-editor-workflows.md) | Card creation, node/quiz creation, review, and export flows |
| [27-editor-tech-and-nonfunctional.md](27-editor-tech-and-nonfunctional.md) | Frontend tech stack, data persistence, non-functional requirements |

## Data Structure Design (30–37)

Entity definitions, JSON schemas, and data management guidelines.

| File | Topic |
|------|-------|
| [30-data-design-overview.md](30-data-design-overview.md) | Design requirements, philosophy (Card/Quiz/Node separation), master data note |
| [31-data-entities.md](31-data-entities.md) | Entity definitions: Region, Card, Quiz, Node, UnlockCondition |
| [32-data-tree-example.md](32-data-tree-example.md) | Full hierarchy tree example (Japanese History) |
| [33-data-categories.md](33-data-categories.md) | Category → icon mapping table |
| [34-data-user-progress.md](34-data-user-progress.md) | User progress data: QuizResult, CardStats, UnlockState |
| [35-data-quality-rules.md](35-data-quality-rules.md) | Hint / description quality rules and review checklist |
| [36-data-file-structure.md](36-data-file-structure.md) | Recommended JSON file directory structure |
| [37-data-scale-estimates.md](37-data-scale-estimates.md) | Initial release size estimates and production effort |

---

## Cross-Reference Guide

| If you need... | See |
|----------------|-----|
| Card field definitions | [31-data-entities.md](31-data-entities.md) (Section 2.2) |
| How cards appear in the editor | [21-editor-card-management.md](21-editor-card-management.md) |
| Quiz/Node entity definitions | [31-data-entities.md](31-data-entities.md) (Sections 2.3–2.5) |
| How quizzes/nodes are managed in the editor | [22-editor-quiz-tree-management.md](22-editor-quiz-tree-management.md) |
| Unlock condition types | [31-data-entities.md](31-data-entities.md) (Section 2.5) |
| Visual tag design (colors, icons) | [03-card-design.md](03-card-design.md) + [09-ui-ux-guidelines.md](09-ui-ux-guidelines.md) |
| JSON export/import format | [24-editor-import-export.md](24-editor-import-export.md) |
| Validation rules | [25-editor-validation-rules.md](25-editor-validation-rules.md) |
| Review workflow | [26-editor-workflows.md](26-editor-workflows.md) + [35-data-quality-rules.md](35-data-quality-rules.md) |
