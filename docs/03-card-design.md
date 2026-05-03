# Card Design

> Source: `rekikan-concept.md` — Sections 3.1–3.3

---

## 3.1 Card Types

Two types of cards are provided.

| Type                 | Content                                                                        | Purpose                                                                                                   |
| -------------------- | ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| **Description Card** | Describes the characteristics of an era in 2–3 lines without using terminology | Usable at all hierarchy levels. Lets users grasp the image of era transitions even without term knowledge |
| **Term Card**        | Era name / person name / event name + hint + explanation                       | Used at all hierarchy levels. For solidifying knowledge                                                   |

Description cards are created not only for introductions (before broad divisions) but also for medium and fine divisions. By providing a step at each level where users grasp the "image of era transitions" through description cards before learning through term cards, users can follow the "feel first, terms second" sequence at every stage.

**Description Card Examples:**

Broad division introduction (the big flow of Japanese history):

- "A very long era when people lived by hunting and gathering, using earthenware for cooking" (「狩りや採集で暮らし、土器を使って煮炊きしていた非常に長い時代」)
- "An era when rice cultivation was introduced from the continent, and people began to settle and form villages" (「大陸から稲作が伝わり、人々が定住してムラを作り始めた時代」)
- "An era when the aristocracy created their own writing system and literature amid an elegant lifestyle" (「貴族が優雅な暮らしの中で独自の文字や文学を生み出した時代」)

Medium division (changes within the Edo period (江戸時代)):

- "The wars ended, and a new shogunate unified the country. An era when interactions with foreign nations began to be restricted" — Early period (「戦乱が終わり、新しい幕府が全国を統一した。外国との交流を制限し始めた時代」)
- "The shogunate's power stabilized, and vibrant townspeople's arts and literature emerged" — Early-mid / Genroku period (「幕府の力が安定し、華やかな町人の芸術や文学が生まれた」)
- "An era when finances grew strained, and the shogunate attempted reforms multiple times" — Mid period (「財政が苦しくなり、幕府が何度も改革を試みた時代」)
- "Foreign ships began to appear, and discontent and reform movements spread domestically" — Late period (「外国船が現れ始め、国内でも不満や改革の動きが広がった」)
- "A tumultuous era from the forced opening of the country under foreign pressure to the fall of the shogunate" — Bakumatsu (「外国の圧力で開国し、幕府が倒れるまでの激動の時代」)

Descriptions avoid dates and proper nouns as much as possible, using wording that allows judgment based on "feel."

## 3.2 Term Card Structure

| Element           | Display Timing                                           | Description                                                                                   |
| ----------------- | -------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Term name         | Always                                                   | Era name / person name / event name                                                           |
| Visual tag        | Always                                                   | Era-band color + category icon (see below)                                                    |
| Hint              | Before answering (toggleable ON/OFF)                     | Keyword-style clue                                                                            |
| Image             | Linked to hint toggle (ON only); always on result screen | AI-generated illustration shown as a square thumbnail on the right side of the card. Optional |
| Date              | After answer check                                       | Displays the correct date                                                                     |
| Brief explanation | After answer check                                       | Explains "what this era was like" in 1–2 sentences                                            |

Description cards may also carry an image (an "atmosphere illustration") under the same display rules. Images are optional; cards without images render with text only.

## 3.3 Visual Tag Design

Two axes of visual information are attached to cards, enabling intuitive recognition of "what category of knowledge this is."

**Axis 1: Era-Band Color**
A color bar is displayed on the left edge of each card. Colors are assigned per era band.

| Era Band (Japanese history example)                                   | Color         |
| --------------------------------------------------------------------- | ------------- |
| Prehistory and Antiquity (先史・古代): Jōmon (縄文) to Heian (平安)   | Green family  |
| Medieval (中世): Kamakura (鎌倉) to Muromachi (室町) / Sengoku (戦国) | Indigo family |
| Early Modern (近世): Azuchi-Momoyama (安土桃山) to Edo (江戸)         | Purple family |
| Modern (近代): Meiji (明治) to Taishō (大正)                          | Orange family |
| Contemporary (現代): Shōwa (昭和) onward                              | Red family    |

Cards in the same era band share the same color, so it is visually apparent that "the Jōei Code (indigo) and the Ōnin War (indigo) belong to the same Medieval era band." If they are in different era bands, the colors differ, making it easier to avoid confusing "the Jōei Code (indigo / Medieval) and the Laws for Military Houses (purple / Early Modern)."

**Era-band color visibility is linked to the hint toggle:**

- When hints are **OFF**: the era-band color bar is hidden. This prevents the color from serving as an unintended spatial hint.
- When hints are **ON**: the era-band color bar is displayed.
- After the answer is confirmed (correct/incorrect revealed) or on the results screen: the color bar is always displayed regardless of hint state.

**Axis 2: Category Icon**
A small icon is displayed on each card. There are 7 types.

| Category             | Icon Example | Includes                                               |
| -------------------- | ------------ | ------------------------------------------------------ |
| Era                  | 📅           | Era divisions themselves                               |
| Politics / Law       | ⚖️           | Laws, systems, political reforms                       |
| War / Diplomacy      | ⚔️           | Wars, treaties, diplomatic incidents                   |
| Culture / Religion   | 🎨           | Literature, art, religion, thought                     |
| Economy / Technology | 💰           | Economic policies, technological innovations, industry |
| Person               | 👤           | Cards focused on a specific person                     |
| Event                | 📌           | General events that do not fit the above categories    |

Keeping categories too granular would make classification itself a learning burden, so they are kept at a broad level.

## 3.4 Card Image (AI-generated)

Cards may carry an AI-generated illustration to support visual memory.

**Display rules:**

- **Hints OFF**: image hidden (along with the era-band color bar).
- **Hints ON**: image shown as a square thumbnail on the right side of the card.
- **After answer check / Result screen**: image shown regardless of hint state.

**Subject guidance:**

- Term cards: portrait-style for persons, symbolic scene for wars / diplomacy, representative artwork for culture, characteristic artifact / building for politics / economy.
- Description cards: atmosphere illustration evoking the era's mood (landscape, settlement, daily life). Avoid surfacing the proper nouns the description card intentionally hides.

**File specification:**

- Format: WebP only (quality ≈ 80).
- Aspect ratio: 1:1 (square).
- Standard size: 768 × 768 px.
- Target file size: < 80 KB per image.
- Storage path: `public/images/cards/{card_id}.webp`. External URLs are not allowed.

**Data model:** the card carries a boolean `has_image` flag; the file path is derived from the card ID. See [31-data-entities.md](31-data-entities.md) Section 2.2.
