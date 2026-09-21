# User Progress Data

> Source: `rekikan-data-design.md` — Section 5

---

Data stored on the device (or on a backend) to track the user's learning history.

## 5.1 QuizResult — Quiz Answer History

```json
{
  "quiz_id": "quiz_japan_era_medieval",
  "mode": "careful",
  "attempts": [
    {
      "timestamp": "2026-04-01T10:30:00Z",
      "score": 5,
      "total": 6,
      "hint_used": true,
      "time_seconds": 45,
      "card_results": {
        "card_japan_kamakura": true,
        "card_japan_nanbokucho": false,
        "card_japan_muromachi": true,
        "card_japan_sengoku": true,
        "card_japan_azuchimomoyama": true,
        "card_japan_edo": true
      }
    }
  ],
  "best_score": 6,
  "cleared": true
}
```

## 5.2 CardStats — Per-Card Accuracy

Foundation data for weighted review of weak cards.

```json
{
  "card_id": "card_japan_nanbokucho",
  "attempts": 5,
  "correct": 2,
  "accuracy": 0.4,
  "last_seen": "2026-04-01T10:30:00Z"
}
```

## 5.3 UnlockState

```json
{
  "node_id": "node_japan_medieval",
  "unlocked": true,
  "unlocked_at": "2026-04-01T10:25:00Z",
  "unlock_reason": "complete_quizzes"
}
```

The `unlock_reason` field records which UnlockCondition `type` was satisfied to unlock the node. Valid values match the UnlockCondition types defined in [31-data-entities.md](31-data-entities.md) (Section 2.5): `complete_quizzes`, `complete_any`, `complete_node`, `attempts`, `hint_clear`.

---

## 5.4 Stored Shape (Implementation)

Progress is kept in `localStorage` under `rekikan_progress`, versioned so the shape can evolve:

```json
{
  "version": 2,
  "quizzes": {
    "quiz_japan_era_intro_desc": {
      "quizId": "quiz_japan_era_intro_desc",
      "bestScore": 6,
      "cleared": true,
      "clearedWithHint": false,
      "attemptCount": 5,
      "modes": {
        "careful": { "bestScore": 6, "cleared": true, "clearedWithHint": false, "attemptCount": 3 },
        "era_band": {
          "bestScore": 4,
          "cleared": false,
          "clearedWithHint": false,
          "attemptCount": 2
        }
      }
    }
  }
}
```

- **Per-mode records.** Every mode keeps its own best score, cleared flag and attempt count, so the mode selection screen can show what has already been done and the results screen can compare against the same mode's previous best.
- **`cleared` gates unlocking, and only ordering modes set it.** Careful / Challenge / Cross-Region are ordering modes; a perfect score in Timeline or Era Band mode does not open the next layer, because it does not demonstrate the ordering skill the hierarchy is built on. The mode selection screen states this next to those modes.
- **`cleared` and `clearedWithHint` are monotonic.** Once earned they are never cleared by a later poor attempt.
- **`hintUsed` means "hints were shown at any point during the attempt"**, not the state of the toggle when the quiz ended. Turning hints on and then off again still counts as a hinted clear.
- **Migration.** Version 1 stored a bare map of `QuizProgress` without `modes`. It is read as-is, with an empty `modes`, so existing unlock state survives the upgrade.
