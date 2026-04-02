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
