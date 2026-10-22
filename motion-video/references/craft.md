# Craft: concept, composition, motion, timing

## Deep principles (true in every style)

1. **Film actions, not screens.** The subject is the verb: typing, choosing, sending, getting paid. A screen shown so a headline can explain it makes a tour; a screen that appears *because someone did something* makes a story.
2. **Text is either read or felt, never in between.** Words that matter are huge and impossible to miss. Small text is texture that says "lots" (a wall of pages), and is meant to stay unread. Medium-size text is the worst of both: too small to read on a phone, too big to work as texture.
3. **Energy comes from changes in scale,** not from fancy transitions. Cut from four words filling the frame to a dozen pages, then back. A video that stays at one distance feels flat however smoothly it morphs.
4. **The angle belongs to the camera lens.** Angle and blur make a close-up feel like a real camera on a real screen, and the blur tells the eye where not to look. On a wide, readable window, an angle just bends the information. Use it close, with a reason.
5. **One colour, one meaning.** Keep the palette quiet, and give the accent a single job (usually "this is the thing being acted on now"). Colour used for decoration means nothing, so it can't point.
6. **Continuity is carried by meaning, not geometry.** A caret, a glow, the same object or the same word can carry the eye across a hard cut. Shape morphs are one way to connect shots, not a rule against cutting.
7. **Build an argument, not a list.** One → many → one: an input, proof at scale, the range, then everything collapsing into one idea or word. Equal-length feature scenes in a row don't escalate.
8. **Change the tempo.** Slow and intimate where reading matters, fast and breathless where range matters. One pace throughout is monotone.
9. **End by taking away.** Many → one → the mark alone. Quiet reads as confidence.
10. **Give the film a hero object, and show the product's states.** One thing the camera lives around (the prompt bar, a notification, a character, a data ribbon). The story is told through the product's states (typing → thinking → result → confirmed), each with its own look. See patterns.md.
11. **Words and product share one line.** UI inside sentences, headlines turning into UI, words turning into icons. A caption over a screenshot is the weakest form.
12. **Angles are for close, moving action** (typing close-ups, a tracked hero dashboard, long lists that resolve flat). Never tilt a static, readable screen for decoration.
13. **Specific beats generic.** At least one moment only this subject could have, built for it (for a solar shop: the power cuts, the bulb dies, the sun rises, the wiring lights the bulb). Reusable moves are support, never the idea. The test: swap in another brand's logo; if the video still works, it's too generic.
14. **Study a reference frame by frame before building from it** (`scripts/study-reference.sh`). One screenshot shows a look; only the sequence shows *why* it works. Write down what the camera, scale, colour, text and tempo are doing, and confirm your reading with the person before you build.

## Concept method (before any code)

1. **The story in one sentence.** "Agents used to hunt through five tabs mid-call; now one click shows everything for that customer."
2. **A visual metaphor from the subject.** Mine the subject's own nouns and verbs: tabs, files, a ringing phone, a bill, a stamp, a link, a queue, sunlight for a solar shop, a map for a delivery app. The metaphor *is* the motion: tabs collapse into one window; a ringing phone opens into the caller's record; a link folds into a paper plane; a bill gets stamped Paid. Don't import a metaphor from another video just because it looked good there.
3. **Scenes, one idea each.** For each scene write the line being said, the one thing on screen, and its **signature moment**: the one to two seconds of animation that prove the idea. If a scene has two signature moments, split it.
4. **The opening and the ending rhyme.** The payoff line echoes the hook, and the last frame resolves the first.
5. **Two directions** when the brief is open: one calm and close to the product page, one bolder. Show stills, and let the person pick.

## Composition
- **The real look first.** Use the brand's fonts, colours, radius and spacing. Rebuild screens from screenshots at their true proportions, and leave a comment with the ratio (`screenshot px x 0.54 = world px`).
- **One focal point per frame.** Everything else steps back: smaller, dimmer, softer focus, or gone.
- **Space is a design element.** Particles, grain, glow specks, dark caption boxes and extra titles, all at once, read as noise. Remove an element before adding one.
- **Type:** big, tight headlines (semibold, tracking about -0.03 to -0.04em) with one short line under them. Never a wall of text. Sentence case. Non-Latin scripts get a proper font for that script, and split text by grapheme (`Intl.Segmenter`) so letters never break apart.
- **Colour:** keep the source palette true. Don't add desaturating filters or grey veils over artwork. For texture, use a darker shade of each colour, not grey.
- **Safe margins:** keep text 6% or more from the edges; platforms put their buttons over the bottom and right of vertical video.
- **Readable on a phone:** a 1080 feed video plays about 375 px wide, so 13 px UI text shows at under 5 px. Show the whole screen for a beat, then **zoom the camera** (1.4x to 1.6x) to the part being used, and glide across to where the result appears ("type the items" → "the total counts itself"). As a rule, the text the viewer must read should be at least 20 px on the stage while it matters.
- **Headlines over zoomed UI:** when the camera is close in, the app fills the frame and runs under the headline. Put a fade band in the background colour behind the headline (solid to 60%, then transparent) while zoomed.

## Motion vocabulary
- **Masked word rise:** each word slides up into a clipping mask with a slight rotation and an unblur, staggered by about 70 ms. It exits the same way, upward.
- **Spring landing:** `1 - e^(-7x)·cos(9x)` gives one small overshoot, then stillness. Use it for cards, chips, stamps and buttons.
- **3D fly-in:** from deep z (about -1500), offset in x, rotateY about -45°, settling on a spring. The content inside drifts slightly against the tilt (parallax inside the card).
- **Whip out:** a fast exit with in-expo easing and **directional motion blur** (an SVG blur in x only, driven by speed per frame). The next scene enters while this one leaves, so there are no dead frames.
- **Camera on a world:** draw the UI at true size and move a camera (translate and scale) to whatever is being said, with in-out quart easing. This is the backbone of explainers and training.
- **Click zoom:** for an important click, push the camera in on the button as the cursor arrives (1.3x to 1.4x, about 0.6 s, zoom centred on the button), click, then pull back out *while* the result opens. The zoom-out and the result arriving are one move, not two. Anything sitting inside the zoomed card rides the same zoom until it takes off.
- **Cursor choreography:** the cursor glides on a curve, presses (scale 0.9), shows a click ripple, and the UI answers 100 to 200 ms later. Time each click to the voice.
- **Connected screens (shared-element morphs):** in the narrated-explainer style, the screens flow into each other along the product's *real journey*. One element survives each change and becomes the next screen: a counter pill morphs into the logo; the logo flies into the app's nav; the app window reshapes (rect, radius) into the document it produces; the document shrinks into the email as its attachment and grows back out when opened; after "Paid" it collapses into its row on the dashboard; the dashboard's logo flies back to centre for the ending. How to build one: animate the outgoing element's rect (left/top/width/height/radius) to the incoming element's rect while its contents fade out over the first 40%, then crossfade to the real incoming element at the same rect. Change colour early (in the first 40% of the morph) so the midpoint never goes grey.
- **Connected vs gimmick:** chaining works when every hand-off is a real step in the product's flow (the viewer could do it themselves). It turns into a gimmick when a camera roves through one big "world" with no story reason. Which joins to use depends on the style (styles.md): morphs for an explainer, hard cuts carried by meaning for a cinematic film, whips for a card showcase.
- **Macro typing shot:** the camera is so close that 3–6 words fill the frame. It sits low and angled (rotateX 15–25° and rotateZ 3–8°, under `perspective`), slides with the caret as each grapheme appears, and blurs the far edges (a blurred copy of the layer, masked to the edges). Text appears at real typing speed (8–14 characters a second) so it can be read. Cut to a fresh angle for the next phrase.
- **Wall of results:** many outputs side by side, flat and small (texture, not reading). The camera glides along, one item lights up in the accent colour, and the camera pushes into it; it builds itself section by section, then the camera pulls back to the wall.
- **Chip montage:** one item at a time centred on a plain ground, about 0.5 s each, cut on the beat. It shows range fast after the slow part.
- **Counters and rings:** numbers count up with out-cubic easing and land as the voice says them; rings fill to the value.
- **Morph:** one shape becomes another (a call button grows into the caller's card; a tile stretches into a search bar).
- **Typing:** grapheme by grapheme, with a caret, for search bars, prompts and URLs.
- **Glint:** one soft light sweep across a card after it lands. Polish, used once.
- **Depth of field:** blur and dim what's behind the focal card while it's in focus, then return it.

## Timing
- **The voice drives the clock.** A 10-word line needs 3.5 to 4.5 s (English about 2.7 words per second; slower languages and training content about 2.3).
- **Land the signature moment on the key word** ("ninety-three percent": the ring fills then).
- **Enter in 0.8 to 1.2 s;** hold long enough to read the text twice; **exit in 0.4 to 0.5 s.** Overlap scene edges.
- **The first 2 seconds say something concrete.** Feeds are brutal.
- **Endings:** the mark drops with a tiny squash, the name slides out from behind it, and the link rises as a line draws under it. Then a small settle, then stillness; the music closes it.

## What "beats After Effects" means here
Real product UI and real data instead of stock mockups. Frame-perfect sync to the voice. Typography that matches the brand exactly. Restraint: every motion explains something. Effects without meaning read as cheap, however polished they are.
