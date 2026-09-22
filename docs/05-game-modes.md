# Game Modes

> Source: `rekikan-concept.md` — Sections 5.1–5.5

---

## 5.1 Mode Overview

Five modes are provided, each targeting a different learning goal.

| Mode                                   | Key Word                    | Learning Goal                  | Target Users      |
| -------------------------------------- | --------------------------- | ------------------------------ | ----------------- |
| **Careful Mode (じっくりモード)**      | "Which is oldest?" repeated | Relative ordering              | Beginners         |
| **Challenge Mode (チャレンジモード)**  | Arrange all at once         | Relative ordering + speed      | Experienced users |
| **Timeline Mode (タイムラインモード)** | Tap the timeline            | Absolute temporal sense        | All levels        |
| **Era Band Mode (時代帯当てモード)**   | Pick the era band           | Era classification (big→small) | All levels        |
| **Cross-Region Mode (同時代モード)**   | Multi-region ordering       | Cross-regional contemporaneity | Intermediate+     |

## 5.2 Careful Mode

A format where users answer by tapping a card in response to the prompt "Which of the remaining cards is the oldest?"

- Only one card needs to be selected from the remaining cards, keeping the interaction simple
- Each step requires an active judgment, leading to higher learning effectiveness
- A correct answer moves the card to the "confirmed area" at the top of the screen with a slide animation from its original position
- On an incorrect answer, the card shakes and remains in the pool of choices

## 5.3 Challenge Mode

A format where users arrange all cards in their chosen order and then check answers all at once. Uses the "tap-to-order" interaction (described later).

- After pressing "Confirm this order," the results screen is displayed immediately with no delay
- On the results screen, a position-comparison view shows the correct order alongside the user's chosen order (see Section 7)

## 5.4 Timeline Mode

A format where the user places each card on a visual horizontal timeline by tapping.

- Cards are shown one at a time without their date
- A horizontal timeline bar is displayed, color-coded by era band
- **The scale is piecewise linear: every era band gets the same width.** A purely proportional scale would give prehistory almost the whole bar and squeeze the modern era into a few pixels, which makes the modern period impossible to place. Equal-width bands keep every era usable.
- The user taps the approximate position where they believe the event/period belongs, then nudges it with the ◀◀ / ◀ / ▶ / ▶▶ buttons (which move by a share of the bar's width, so they are fine-grained inside short eras and coarse inside long ones) or jumps between eras with ⏮ / ⏭
- **Correct judgment: the tap must land within 8% of the bar's width from the correct position.** Judging on screen distance rather than a number of years keeps the difficulty even: an earlier implementation used ±1/6 of the year range, which meant ±8,042 years in one quiz and ±11 years in another.
- Feedback: after confirming, the user's marker, the correct position marker and the accepted zone are shown together, along with the tolerance expressed in years for that card
- Develops the sense of "where in the grand sweep of history does this belong?"

## 5.5 Era Band Mode

A format where the user is shown a card and must tap which era band (時代帯) it belongs to.

- Cards are shown one at a time
- Below the card, 5 era band buttons are shown with their color dots
- Correct selection: the correct button turns green
- Incorrect selection: the selected button turns red and the correct button turns green, then auto-advances after 1.2 seconds
- When hints are enabled, the era color bar on the card acts as a visual hint
- Directly trains the "big → small" zoom-in mental model central to rekikan's learning design

## 5.6 Cross-Region Mode

A format where cards from multiple regions (Japan, Europe, China) are mixed together and the user arranges them in chronological order.

- Each card displays a region badge (🇯🇵 / 🏰 / 🐉) showing which region it belongs to
- Interaction is the same as Challenge Mode (tap to order, then confirm)
- Develops contemporaneity awareness: seeing that events in different parts of the world were happening at the same time
- Cross-region quizzes are organized in a dedicated "同時代の世界" node
