# Editor Overview

> Source: `rekikan-editor-design.md` — Sections 1.1–1.3, 2.1–2.2

**Version:** v1.0

---

## 1. Tool Overview

### 1.1 Purpose

A web-based administration interface for creating, editing, and reviewing Rekikan cards and stages (quizzes), then exporting the data as JSON for use by the app.

### 1.2 Form Factor

- Single Page Application (SPA) that runs in a web browser
- Data is managed in-browser memory, with import/export in JSON format
- No backend server required (can be served as a static site)
- The data structure is designed to be reusable if a backend is added in the future

### 1.3 Users

- **Content creators** — create and edit cards
- **Reviewers** — verify content and change review statuses
- **Developers** — export data and debug

---

## 2. Screen Layout

### 2.1 Overall Layout

```
┌──────────────────────────────────────────────────────┐
│  Header: Tool Name / Import / Export                 │
├────────┬─────────────────────────────────────────────┤
│        │                                             │
│  Side  │  Main Area                                  │
│  bar   │                                             │
│        │  (Content changes based on the active tab)  │
│  ·Cards│                                             │
│  ·Tree │                                             │
│  ·Quiz │                                             │
│  ·Master│                                            │
│        │                                             │
│        │                                             │
├────────┴─────────────────────────────────────────────┤
│  Status Bar: Record counts / Unsaved changes         │
└──────────────────────────────────────────────────────┘
```

### 2.2 Tab Structure

| Tab | Description |
|-----|-------------|
| **Card Management** | List, search, filter, create, and edit cards |
| **Tree & Quiz Management** | Hierarchical node display, quiz composition editing, card assignment |
| **Master Data Management** | Edit definitions for regions, era bands, and categories |
