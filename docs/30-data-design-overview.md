# Data Design Overview

> Source: `rekikan-data-design.md` — Sections 1.1–1.2

---

## 1.1 Requirements

- Represent a hierarchical structure: Region → Major Category → Mid Category → Sub Category
- Both "description card quizzes" and "term card quizzes" can be placed at every level of the hierarchy
- Each quiz contains 5–8 cards (approximately 7 as a rule of thumb)
- Cards are reused across multiple quizzes (e.g., the "Kamakura Period (鎌倉時代)" card in a major-category quiz and in a full-era quiz is the same card)
- Unlock conditions can be flexibly defined
- The data structure should support a workflow of AI generation followed by human quality review
- Adding new regions and quizzes in the future should be straightforward

## 1.2 Design Philosophy

**Separate Cards from Quizzes.**

- **Card:** The content entity — term name, description, hints, commentary, etc. Managed centrally as master data.
- **Quiz:** Defines a combination of cards and the question order. The same card can be referenced by multiple quizzes.
- **Node:** Each node in the hierarchy tree. Holds quizzes and unlock conditions.

This separation ensures that editing a card automatically propagates changes to every quiz that uses it, eliminating duplicate data.

**Master data handling:** The `era_colors` field inside a Region and the category mapping table in Section 4 are exported as independent arrays named `era_bands` and `categories`, respectively. They are also managed as independent master tables in any editing tools.
