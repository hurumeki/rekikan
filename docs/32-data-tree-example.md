# Hierarchy Tree Example — Japanese History (日本史)

> Source: `rekikan-data-design.md` — Section 3

---

```
node_japan_root  Japanese History (日本史)  [unlocked from the start]
│
├── quiz: quiz_japan_era_intro_desc  (description: The broad flow of Japanese history (日本の歴史の大きな流れ), 5 cards)
│
├── node_japan_prehistoric  Prehistoric & Ancient (先史・古代)  [unlocked after clearing the intro]
│   ├── quiz: quiz_japan_prehistoric_desc  (description: Changes from prehistory to antiquity (先史〜古代の変化), 6 cards)
│   ├── quiz: quiz_japan_prehistoric_term  (term: Jomon to Heian (縄文〜平安), 7 cards)
│   │
│   ├── node_japan_asuka_nara  Events of Asuka & Nara (飛鳥・奈良の出来事)  [unlocked after clearing above]
│   │   ├── quiz: quiz_japan_asuka_nara_desc  (description, 5 cards)
│   │   └── quiz: quiz_japan_asuka_nara_term  (term, 7 cards)
│   │
│   └── node_japan_heian  Events of the Heian Period (平安時代の出来事)  [unlocked after clearing above]
│       ├── quiz: quiz_japan_heian_desc  (description, 5 cards)
│       └── quiz: quiz_japan_heian_term  (term, 7 cards)
│
├── node_japan_medieval  Medieval & Early Modern (中世・近世)  [unlocked after clearing the intro]
│   ├── quiz: quiz_japan_medieval_desc  (description: Changes from medieval to early modern (中世〜近世の変化), 6 cards)
│   ├── quiz: quiz_japan_medieval_term  (term: Kamakura to Edo (鎌倉〜江戸), 6 cards)
│   │
│   ├── node_japan_kamakura  Events of the Kamakura Period (鎌倉時代の出来事)  [unlocked after clearing above]
│   │   └── quiz: quiz_japan_kamakura_term  (term, 7 cards)
│   │
│   ├── node_japan_muromachi  Events of Muromachi & Sengoku (室町・戦国の出来事)  [unlocked after clearing above]
│   │   └── quiz: quiz_japan_muromachi_term  (term, 7 cards)
│   │
│   └── node_japan_edo  Edo Period (江戸時代)  [unlocked after clearing above]
│       ├── quiz: quiz_japan_edo_desc  (description: Edo in 5 parts (江戸5分割), 5 cards)
│       ├── quiz: quiz_japan_edo_shogun_early  (shogun: first half (将軍: 前半), 7 cards)
│       ├── quiz: quiz_japan_edo_shogun_late  (shogun: second half (将軍: 後半), 7 cards)
│       └── quiz: quiz_japan_edo_events  (events (出来事), 7 cards)
│
├── node_japan_modern  Modern & Contemporary (近代・現代)  [unlocked after clearing the intro]
│   ├── quiz: quiz_japan_modern_desc  (description: Changes from modern to contemporary (近代〜現代の変化), 5 cards)
│   ├── quiz: quiz_japan_modern_term  (term: Meiji to Showa (明治〜昭和), 6 cards)
│   │
│   ├── node_japan_bakumatsu  Events of Bakumatsu to Meiji (幕末〜明治の出来事)  [unlocked after clearing above]
│   │   ├── quiz: quiz_japan_bakumatsu_desc  (description, 5 cards)
│   │   └── quiz: quiz_japan_bakumatsu_term  (term, 7 cards)
│   │
│   └── node_japan_taisho_showa  Events of Taisho to Showa (大正〜昭和の出来事)  [unlocked after clearing above]
│       └── quiz: quiz_japan_taisho_showa_term  (term, 7 cards)
│
└── node_japan_all_eras  All Eras Combined (全時代通し)  [unlocked after clearing Prehistoric, Medieval, and Modern nodes]
    └── quiz: quiz_japan_all_eras_term  (term: all eras (全時代), 14 cards)
```
