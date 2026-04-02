# Editor — Workflows

> Source: `rekikan-editor-design.md` — Sections 8.1–8.4

---

## 8.1 Card Creation Flow

```
Card Management tab → [+ New Card] → Edit Form → Input → [Save]
                                                          ↓
                                              Status: draft
```

---

## 8.2 Node & Quiz Creation Flow

```
Tree & Quiz Management tab → [+ New Node] → Enter node info → [Save]
                           → [+ New Quiz] → Enter basic info
                                              ↓
                                        [Select from Existing Cards] → Card selection dialog → Add
                                              ↓
                                        Adjust correct order → [Save]
```

---

## 8.3 Review Flow

```
Card Management → Filter by status "ai_generated"
               → Click a card to review its content
               → Check hint warnings; edit if necessary
               → Change status to "reviewed" → [Save]
               → (If no issues) Change status to "approved" → [Save]
```

---

## 8.4 Export Flow

```
Header → [Export] → Select options → Run validation → Show results
                                                       ↓
                                          No issues  → Download JSON
                                          Warnings   → Confirm and proceed, or fix
                                          Errors     → Must fix before exporting
```
