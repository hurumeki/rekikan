# UI/UX Guidelines

> Source: `rekikan-concept.md` — Sections 9.1–9.3

---

## 9.1 Design Direction

### 9.1.1 Design Principles Derived from the Concept

Design is driven by the app's concept and learning experience, not aesthetic preference. The following requirements must be met:

**Principle 1: Support a wide age range**
The target spans elementary school students to adults, so avoid tones that appeal only to a specific age group. A tone that is approachable for children yet does not look cheap to adults — "age-neutral" — is needed. Provide light/dark theme switching, with light theme as the default (prioritizing readability and reassurance for a learning app).

**Principle 2: Visual tags must function as learning tools**
Era band colors and category icons are not decoration — they serve the learning function of "intuitive category recognition." Color schemes must maintain visibility in both light and dark themes, ensuring sufficient contrast so they are not lost against background colors.

**Principle 3: Four card states must be clearly distinguishable**
Express the four states — unselected, selected, correct, incorrect — using color. Keep the base neutral and assign color variations to state changes.

**Principle 4: Description card readability**
Description cards feature 2–3 lines of text as their primary content, so font size, line height, and contrast must be generous. Visual distinction from term cards is also needed (differentiated by card shape or label display).

**Principle 5: Clarity of interaction takes top priority**
Prioritize tap target size and clarity of state-change feedback over decoration.

### 9.1.2 World-Building: "Digging Through Strata"

The Rekikan learning experience parallels digging through geological strata of history — from broad layers (era divisions) down to finer detail. This "strata" metaphor is reflected in the design world-building.

**Strata expression per hierarchy level**
On the stage selection screen (home screen), visually represent hierarchy depth like geological strata. Upper layers (broad divisions) appear as bright, wide strata; deeper layers (medium/fine divisions) grow darker and denser. Locked stages appear as "unexcavated strata" shown dark, while cleared stages appear excavated with visible contents.

**Sense of digging deeper**
When the next hierarchy unlocks after clearing a stage, an animation of a stratum being excavated (opening) conveys the feeling of "going deeper."

**Era band colors as strata colors**
Era band colors (Prehistoric/Ancient = green, Medieval = indigo, Early Modern = purple, Modern = orange, Contemporary = red) also function as strata hues. On the stage selection screen, era bands arranged vertically look like a cross-section of geological strata.

**Restrained application**
World-building is concentrated on the stage selection screen and screen transitions. The quiz screen prioritizes card readability and operability, so world-building is limited to subtle background color tones to avoid interfering with learning.

### 9.1.3 Color Design

**Theme support**
Designed with light/dark switching in mind, managed via CSS custom properties (variables). All color schemes are defined for both light and dark themes.

**Region colors (accent)**

| Region           | Color      | Usage                         |
| ---------------- | ---------- | ----------------------------- |
| Japanese History | Red-based  | Header, stage borders, badges |
| European History | Blue-based | Same as above                 |
| Chinese History  | Gold-based | Same as above                 |

**Era band colors (visual tags)**

Define approximately 5 levels of color per region. Ensure sufficient contrast in both light and dark themes.

| Era Band              | Light Theme                | Dark Theme                 |
| --------------------- | -------------------------- | -------------------------- |
| Prehistoric / Ancient | Green (medium brightness)  | Green (slightly brighter)  |
| Medieval              | Indigo (medium brightness) | Indigo (slightly brighter) |
| Early Modern          | Purple (medium brightness) | Purple (slightly brighter) |
| Modern                | Orange (medium brightness) | Orange (slightly brighter) |
| Contemporary          | Red (medium brightness)    | Red (slightly brighter)    |

**State colors**

| State      | Color                | Notes                                       |
| ---------- | -------------------- | ------------------------------------------- |
| Unselected | Neutral (gray-based) | Base state                                  |
| Selected   | Blue-based           | Take care not to confuse with region colors |
| Correct    | Green                | Universal "correct" color                   |
| Incorrect  | Red                  | Universal "incorrect" color                 |

### 9.1.4 Card Images and Node Cover Images

Cards and hierarchy nodes may carry AI-generated images to anchor visual memory.

**Card images** (term and description cards):

- Square (1:1) thumbnail rendered on the right side of the card.
- Visibility follows the hint toggle (hidden when hints are OFF, shown when ON), and is always shown on the result screen.
- Standard size: 768 × 768 px WebP, target < 80 KB. Stored at `public/images/cards/{card_id}.webp`.
- Optional. If the file is missing or fails to load, the card falls back to text-only without layout shift.

**Node cover images** (hierarchy nodes):

- 16:9 banner rendered above or alongside the node label in the quiz list and editor tree view.
- Standard size: 1280 × 720 px WebP, target < 150 KB. Stored at `public/images/nodes/{node_id}.webp`.
- Optional. Used to reinforce the "strata" world-building by giving each era / region node a representative scene.

External URLs are not allowed in either case — paths are derived from the entity ID via a fixed convention. See [03-card-design.md](03-card-design.md) Section 3.4 and [31-data-entities.md](31-data-entities.md) Sections 2.2 and 2.4.

### 9.1.5 Future Considerations

- Verify specific color contrast ratios (WCAG AA compliance)
- Create a prototype of the strata-metaphor stage selection screen
- Address color vision diversity (distinguish states using icons/shapes in addition to color)
- Performance testing for animations (strata-opening effects)

---

## 9.2 Screen Structure

| Screen                         | Content                                                                                                                                                         |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Home screen (region selection) | Region selector. The "れきかん" title and subtitle are displayed.                                                                                               |
| Home screen (quiz list)        | Hierarchy tree for the selected region. Title is hidden; region name and emoji are shown instead. Tapping a locked quiz shows the unlock conditions in a modal. |
| Mode selection                 | After selecting a stage, choose "Careful" or "Challenge"                                                                                                        |
| Quiz screen (Careful)          | "Which is the oldest?" prompt + remaining card list + confirmed area                                                                                            |
| Quiz screen (Challenge)        | Shuffled card list + tap-to-order interaction + confirm button                                                                                                  |
| Results screen                 | Score + all cards in correct order with dates and explanations + position comparison (Challenge Mode only) + "Try Again" / "Back to list" buttons               |

---

## 9.3 Responsive Design

- Mobile-first (vertically stacked cards, tap interaction)
- Keeping quizzes to around 7 cards ensures display without scrolling on a single screen
- Desktop uses a full-screen layout
