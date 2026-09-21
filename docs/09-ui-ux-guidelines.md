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

**Implementation (quiz list)**

- Each node carries a stratum edge on its left. Depth 1 → 3 make the edge progressively more saturated, so deeper layers read as denser rock.
- The hue comes from the node's position among its siblings, mapped onto the region's era band colors (`stratumColor()` in `src/lib/strata.ts`). Because siblings are ordered chronologically, the result is a cross-section: green at the top, red at the bottom.
- Locked nodes keep a neutral, unsaturated edge — "unexcavated". A node whose quizzes are all cleared shows the era hue at full strength — "excavated, contents visible".
- When a node becomes unlocked since the learner last opened that region, it plays a short opening animation with a ✨ badge, shown once (`takeNewlyUnlockedNodeIds()`). The animation is suppressed under `prefers-reduced-motion`.

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

External URLs are not allowed in either case — paths are derived from the entity ID via a fixed convention. Because the images are rendered with a plain `<img>` tag, which Next.js does not rewrite, the paths are built through `resolvePublicPath()` so that they keep working when the app is served from a sub-path (e.g. GitHub Pages under `/rekikan`). See [03-card-design.md](03-card-design.md) Section 3.4 and [31-data-entities.md](31-data-entities.md) Sections 2.2 and 2.4.

### 9.1.5 Implementation Notes

- **Theme tokens.** Every color is a CSS custom property declared in `src/app/globals.css`. The light values sit on `:root`; the dark values are redefined under `@media (prefers-color-scheme: dark)`, together with `color-scheme: dark`. Components must not hard-code hex values.
- **Contrast.** Text tokens meet WCAG AA (4.5:1) against their own surfaces, and non-text state indicators (stars, markers) meet 3:1. Locked quizzes are dimmed with dedicated `--locked-*` colors rather than `opacity`, which would drop contrast below the threshold.
- **Era band colors.** Era colors come from the data as a single hex per era, so dark mode brightens them through `filter: var(--era-filter)` instead of duplicating the palette per theme.
- **Color vision diversity.** Correct / incorrect are conveyed by the ✓ / ✗ marks and position badges in addition to color.
- **Reduced motion.** `@media (prefers-reduced-motion: reduce)` disables transitions and animations globally, and Careful Mode skips its FLIP slide when the preference is set.

### 9.1.6 Future Considerations

- Extend the strata metaphor to screen transitions (currently only the quiz list)
- Node cover images as the "excavated" surface of a stratum

---

## 9.2 Screen Structure

| Screen                         | Content                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Home screen (region selection) | Region selector. The "れきかん" title and subtitle are displayed.                                                                                                                                                                                                                                                                                                                                                                                                                          |
| Home screen (quiz list)        | Hierarchy tree for the selected region. Title is hidden; region name and emoji are shown instead. Nodes are collapsible: on first visit only the path to the next quiz is expanded, so a region with 50+ quizzes still fits on one screen. Depth is shown with indentation and a left rule. The next unlocked, uncleared quiz carries a「つぎはこれ」badge. A locked node shows how many quizzes remain before it opens, and tapping a locked quiz shows the unlock conditions in a modal. |
| Mode selection                 | After selecting a stage, choose "Careful" or "Challenge"                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| Quiz screen (Careful)          | "Which is the oldest?" prompt + remaining card list + confirmed area                                                                                                                                                                                                                                                                                                                                                                                                                       |
| Quiz screen (Challenge)        | Shuffled card list + tap-to-order interaction + confirm button                                                                                                                                                                                                                                                                                                                                                                                                                             |
| Results screen                 | Score + all cards in correct order with dates and explanations + position comparison (Challenge Mode only) + "Try Again" / "Back to list" buttons                                                                                                                                                                                                                                                                                                                                          |

---

## 9.3 Responsive Design

- Mobile-first (vertically stacked cards, tap interaction)
- Keeping quizzes to around 7 cards ensures display without scrolling on a single screen
- Desktop uses a full-screen layout
