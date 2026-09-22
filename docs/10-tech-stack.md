# Tech Stack

> Source: `rekikan-concept.md` — Sections 10.1–10.3

---

## 10.1 App Architecture

| Item             | Approach                                                                                                 |
| ---------------- | -------------------------------------------------------------------------------------------------------- |
| Framework        | React Native (mobile app) or Next.js (web app) assumed                                                   |
| State management | React hooks (useState, useEffect, useCallback) as the foundation                                         |
| Data management  | Content managed as hierarchical JSON. JSON exported from the editor/review tool is imported into the app |
| Persistence      | Learning history, accuracy rates, and unlock states saved to local storage or a backend DB               |
| Theme switching  | Light/dark theme colors managed via CSS custom properties                                                |

## 10.2 Content Production

| Item               | Approach                                                                                |
| ------------------ | --------------------------------------------------------------------------------------- |
| Card generation    | AI generates first drafts in bulk; humans review and revise                             |
| Quality management | Status tracking via the editor/review tool (draft → ai_generated → reviewed → approved) |
| Content review     | Request expert verification for historical data accuracy                                |
| Data format        | JSON format. Change history managed in a Git repository                                 |

## 10.3 Accessibility

| Requirement                                                | Status                                                                                                                       |
| ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Color vision diversity (icons/shapes in addition to color) | Implemented — ✓ / ✗ marks on cards, position badges on the results screen                                                    |
| Screen reader support                                      | Implemented — cards expose an `aria-label` combining the card text and its state, plus `aria-pressed` for the selected state |
| Keyboard navigation                                        | Implemented — interactive cards render as `<button>`, so Tab / Enter / Space work, and `:focus-visible` shows a visible ring |
| WCAG AA contrast                                           | Implemented — see [09-ui-ux-guidelines.md](09-ui-ux-guidelines.md) Section 9.1.5                                             |
| Reduced motion                                             | Implemented — `prefers-reduced-motion` disables animations, including the Careful Mode FLIP slide                            |

Regression coverage lives in `e2e/a11y.spec.ts` (keyboard-only answering, disabled-state of the confirm button, dark theme).
