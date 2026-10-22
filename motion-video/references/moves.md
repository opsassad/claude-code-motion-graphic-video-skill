# Moves: the ready-made library (assets/motion.js)

Copy `assets/motion.js` next to the video page and load it with `<script src="motion.js"></script>`. Everything is on `window.MV`. Each move is **built once** (it makes its own DOM) and **returns `render(t)`**, a pure function of scene time, so shots can be recorded frame by frame and seeked in any order.

**The library is a toolbox, not a checklist.** Use a move only when the subject really has that action: a typing close-up when typing *is* the product (writing an invoice, a prompt), not just because the product has a search box. Every video also needs 1–2 moments that only this subject could have (a power cut and a bulb lighting up for a solar shop), built for it. Those are what people remember; library moves are the support around them. If a video could swap its logo for another brand's and still make sense, it's too generic.

`assets/moves-demo.html` uses the core moves on a made-up tasks app; `assets/moves-demo-2.html` uses the field-guide moves (patterns.md) on a made-up AI assistant. **Read the demos for mechanics only (how a move is called), never for their order of shots.** Both deliberately follow the most common AI-launch shape; copying that shape is exactly what originality.md bans. Read it as a template: each shot is a few lines. Use the moves, adjust their options, and build new ones in the same shape when a video needs something they don't cover. Never rebuild a move that already exists here by hand.

## Page setup
| Call | Does |
|---|---|
| `start({stage, width, height, duration, render, fonts})` | waits for fonts and images, sets `window.render/DURATION/ready` for the recorder, and plays a fitted preview with keys (Space, R, arrows, F, `?t=`) |
| `shots([[node, start, end, render], ...])` | hard cuts: shows only the shot on screen and draws only that one |

## The moves
| Move | Use it for | Key options |
|---|---|---|
| `macroType(host, o)` | **Typing close-up**: camera low and close on an input, 3–6 words fill the frame, the camera follows the caret like an operator, depth-of-field blur at the edges | `text, start, cps` (8–14), `label, font {size, weight, spacing}, angle [rx, ry, rz]`, `after(geom)` for things beside the field (a button), `panTo {x(geom), start, dur}` to glide to it after typing, `push [from, to]`. `render.all(sel)` reaches both the sharp and blurred copies |
| `countUp(node, o)` | **Numbers landing:** totals, stats, amounts that really grow (a sum, revenue, users). Never a price or a fixed value: a price that climbs from 0 looks like it's changing | `from, to, start, dur, format(n)`, or `steps [[to, start, dur], ...]` to add in stages |
| `wall(host, o)` | **Wall of results:** many outputs, small and flat; the camera glides, one lights up, and the camera dives into it until it fills a target rect | `items` (html), `cols, cell {w, h}, gap, left, top, lit, glide {from, to, start, dur}, litAt, accent, dive {start, dur, to {x, y, w}}` |
| `buildIn(nodes, o)` | **It builds itself:** parts arriving one after another (after a wall dive, a card, a page) | `start, step` (0.2–0.3), `dur, dy` |
| `cascade(nodes, o)` | **A change running down a list:** statuses flipping, checks ticking, rows lighting | `start, step` (0.12–0.2), `dur, apply(node, p, i, t, at)` (p springs 0→1 at each item's turn) |
| `montage(node, o)` | **Range, fast:** one item at a time, centred, about 0.45 s each, cut on the beat | `items` (html), `start, step, pop` |
| `growToWord(node, o)` | **Collapse to one word:** a status chip grows into the big final word | `start, dur, from, to` (font px), `color` |
| `cursor(host, o)` | **Cursor:** glides, presses, ripples | `path [[t, x, y]], clicks [t], on [[a, b]], map(t, [x, y])` to follow a camera |
| `clickZoom(t, o)` + `zoomPoint` | **Click zoom:** push in on a button, click, pull out as the result opens | `start, out, scale` (1.3–1.4); apply the factor with `transformOrigin` at the button; map anything riding along with `zoomPoint` |
| `morphRect(node, a, b, p)` | **Shared element:** one screen's box reshapes into the next | rects `{x, y, w, h, r}`; fade the inner content over the first 40% |
| `glowRim(node, o)` | **Prompt bar as hero:** a gradient light blooming and turning around a pill or card | `colors, start, dur, spin` (deg/s), `blur, spread, radius` |
| `typeText(node, o)` | Typing into any line (headlines, URLs), with a caret | `text, start, cps, caret, hold` |
| `streamText(node, o)` | **A reply streaming in** word by word, each word blurring in; its box grows with it | `text, start, wps, blur` |
| `thinking(node, o)` | **Thinking:** three coloured dots pulsing in turn | `start, end, colors, size` |
| `shimmer(nodes, o)` | **Generating:** skeleton bars with light sweeping across | `start, end, color, shine, speed` |
| `assemble(node, o)` | **Scattered words fly into one line** | `start, dur, stagger, spread [x, y], scale [min, max]` |
| `wordToSentence(node, o)` | **One word grows into a sentence:** the first word big in the accent colour, then the rest arrives and it settles | `start, accent, big, grow, stagger` (centre the node's text) |
| `wordTexture(host, o)` | **Word texture:** a word repeated to fill the frame, one copy in focus in selection brackets | `word, start, rows, cols, size, color, focus, accent` |
| `iris(node, o)` | Reveal a scene through a growing circle | `start, dur, x, y` (%), `from, to` |
| `pixelReveal(node, o)` | Reveal a scene in square blocks growing from a point | `start, dur, cell, x, y` (0–1) |
| `sweep(host, o)` | **Colour sweep transition:** a big soft gradient shape crosses the frame; swap scenes at its midpoint | `start, dur, colors, angle` |
| `flip(node, o)` | **Before → after:** a 3D card flip with a pop toward the camera (children `.mv-front`, `.mv-back`) | `start, dur, pop` |
| `scanReveal(node, o)` / `develop(node, o)` | **Generated media arriving:** scanning in from the top with a bright edge / developing from blur and grey | `start, dur` |
| `ticker(host, o)` | **A ticker of chips:** rows scrolling sideways, alternate rows the other way (problems, requests, range) | `rows [[html]], speed, gap, rowGap` |
| `drawPath(path, o)` | **Lines drawing between nodes,** a dot travelling on the tip: data flowing, connections | `start, dur, dot` (an SVG circle) |
| `toasts(items, o)` | **Notification stack:** toasts drop in; older ones shrink and tuck behind | items `[{node, at}]`, `drop, step, shrink` |
| `liftOut(item, others, o)` | **This one:** an item rises out of its list while the rest blur | `start, dur, scale, blur` |
| `ripple(host, o)` | **Press feedback:** concentric rings out from a button | `at, x, y, color, rings, size` |
| `drift(items, o)` | **Floating fragments** bobbing at their own depth (far ones smaller, slower, blurred) | items `[{node, depth}]` (0 near – 1 far), `amp, speed` |
| `wall(host, {emerge})` | **Zoom-out reveal:** start inside one item, pull back to show it's one of many | `emerge {start, dur, from {x, y, w}}` |
| `twin(host, html, o)` | Depth of field for any custom shot: the scene twice, the copy blurred toward the edges | `blur, focus [x%, y%], perspective` |
| `maskWords` + `rise` | Words rising into masks | `rise(words, t, in, out, stagger)` |
| `motionBlur(node)` | Directional blur from speed (whips) | call the returned setter each frame with dx, dy |

## Helpers
`E` (curves: `outStrong`, `inOutStrong`, `outExpoLike`, `exit`, `spring`, …), `prog`, `mix`, `clamp`, `set`, `setAll`, `spring(x, ratio, response)`, `zoomLog`, `onBeat`, `follow` (camera operator's follow), `press` (button press scale), `glow(color, k)`, `hexA`, `graphemes`, `rectOf(node, stage, width)` (an element's true position after 3D), `el`, `rand`.

## Moves that often suit each style (only where the subject has that action)
- **Cinematic product film:** `macroType` → `countUp` → `wall` + `buildIn` → `macroType` (with `panTo` to a button) → `cascade` → `montage` → `growToWord` → the mark. Join with `shots` (hard cuts).
- **Narrated explainer:** camera on the real UI, `cursor` + `clickZoom`, `morphRect` between screens, `countUp` on results, `rise` for headlines.
- **Card showcase:** 3D fly-in with `E.spring`, `motionBlur` whips, `rise` for titles.
- **Walkthrough:** `cursor` with `clickZoom` on each step, caption cards with `rise`.
- **Kinetic type:** `maskWords` + `rise` on the beat (`onBeat`), `growToWord` for the key word.
- **Data story:** `countUp`, `cascade` for bars or rows, `growToWord` for the headline number.

## Adding a move
Same shape: `function move(host, options) { build DOM once; return (t) => { set styles from t only }; }`. Keep it pure (no timers, no state carried between frames), use the tokens in `E`, add it to `MV`, add a shot using it to `moves-demo.html`, and render the demo's stills to check it.
