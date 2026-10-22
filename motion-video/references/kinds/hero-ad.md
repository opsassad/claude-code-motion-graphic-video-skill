# Hero ad

**What it is:** a short commercial built around one action, filmed like a car ad: a low angle, rim light, a camera that never stops, ending on the decisive click.
**Pick it when:** paid social, a website hero loop, a short teaser for one feature.
**Length:** 8–15 s. 1:1, 4:5 or 9:16 for ads; 16:9 for a site hero.

## Ask the person
- What is the one action? (send a payment, book a call, publish a page)
- What does the screen look like? (screenshots or the repo are essential: this kind lives on the real UI)
- What's the one line of text, if any?

## Shapes it can take
- **The decisive click:** a line of text → the screen rises into frame at a low angle → the camera tracks the cursor through the action → it ends on the primary button glowing and pressed.
- **The detail that matters:** stay on one row, one number or one field the whole time, the rest of the UI soft around it.
- **Before/after in one move:** the same screen, messy then resolved, as the camera passes over it.

## Worlds and looks
Hero shot (styles.md): a dark or deeply coloured ground, a rim light on the screen edge, a small watermark. Or the brand's light world with a strong glow.

## Moves that often fit
A screen at a low 3D angle that's huge and moving (craft.md, angles); `cursor` with the camera following it (`rectOf` to keep it on target); `liftOut`; `glowRim` and `ripple` on the button; `twin` for depth of field; `drawPath` for a comet sparkle landing in the line.

## Seen in the study
A fintech promo: a sparkle flies in on a curve and lands inside "Time for a quick ✦ check"; the dashboard rises at a low angle, so big it runs off two edges, rim-lit on dark violet; the camera tracks clicks across a form; one row lifts out; it ends on "Send for approval" glowing as it's pressed.

## Pitfalls
A static tilted screen (angles must be close and moving). More than one action. Small text that matters.
