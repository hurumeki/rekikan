# Editor — Technical Architecture & Non-Functional Requirements

> Source: `rekikan-editor-design.md` — Sections 9.1–9.3, 10

---

## 9.1 Frontend

| Item             | Choice                                                   |
| ---------------- | -------------------------------------------------------- |
| Framework        | React                                                    |
| UI Library       | Tailwind CSS + shadcn/ui                                 |
| State Management | React hooks (`useState` / `useReducer`)                  |
| Tree View        | Custom implementation or react-arborist                  |
| Drag Operations  | Used for reordering the node tree and card correct-order |

---

## 9.2 Data Persistence

The initial version requires no backend. Data is managed as follows:

| Method               | Purpose                                                                |
| -------------------- | ---------------------------------------------------------------------- |
| JSON Import / Export | Save, share, and version-control data                                  |
| Browser IndexedDB    | Auto-save during work sessions (recoverable after closing the browser) |

By managing JSON files in a Git repository, change history tracking and team data sharing become possible.

---

## 9.3 Future Extensibility

If a backend is added later, the JSON structure is designed to be used directly as API request/response payloads. By providing import/export endpoints, existing JSON assets can be migrated as-is.

---

## 10. Non-Functional Requirements

| Item               | Requirement                                                                                                                                        |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Supported Browsers | Latest 2 versions of Chrome, Safari, and Firefox                                                                                                   |
| Responsive Design  | Desktop-first. Narrow viewports (< 768px) collapse the left sidebar behind a hamburger toggle in the header so the editor remains usable on phones |
| Performance        | Must run smoothly with 1,000 cards and 300 stages                                                                                                  |
| Auto-Save          | Automatically save to IndexedDB on every change. Display the last saved timestamp                                                                  |
| Undo               | Support single-level undo of the most recent operation (Ctrl+Z)                                                                                    |
