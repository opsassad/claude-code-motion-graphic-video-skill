# Engine: the render(t) contract and its pitfalls

## The contract
The page is a fixed-size stage (`window.WIDTH` x `window.HEIGHT` CSS px, default 1920x1080) and exposes:
- `window.render(t)`: draws the frame at t seconds. It must be **pure**: the same t gives the same picture, whatever was rendered before. Each scene function sets every style it owns from t, so seeking backwards works.
- `window.DURATION`: length in seconds.
- `window.ready = true`: set after fonts and images are loaded and decoded.
- With `?record` in the URL, the page skips its preview loop; the recorder drives it.
- Without `?record`, **every page must play in a normal browser**, fitted to the window, with keys to pause and step. That includes storyboards and style-frame boards (auto-advance every few seconds, arrows to step), because the person will open them directly.

**Forbidden inside a frame:** CSS transitions and animations, `setTimeout`, `requestAnimationFrame` state, `Date.now()`, `Math.random()`, video elements that play by themselves, and `backdrop-filter` (slow and unreliable headless). Use `rand(i)` for seeded randomness. Anything that runs on its own clock will stutter or drift in the recording.

`assets/engine-starter.html` with `assets/motion.js` already does all of this. `MV.start()` handles readiness, record mode and the preview (Space pause, R restart, arrows ±5 s or one frame while paused, F fullscreen, `?t=12.5` to start there). The page keeps the `WARP` time-warp. The helpers and ready-made moves are listed in `references/moves.md`.

## Recording
```
node scripts/record.mjs page.html out.mp4 [--fps 60] [--scale 2] [--keep-scale]
node scripts/record.mjs page.html stills/ --stills 0.5,3,7.25
```
- Frames stream straight into ffmpeg (4K PNGs on disk would need tens of GB).
- `--scale 2` captures at twice the size and scales down with lanczos. Edges and small text come out cleaner than a native capture. `--keep-scale` keeps the large size (for example 4K).
- Set `CHROME=/path/to/chrome` if Chrome isn't found.
- Draft at `--scale 1 --fps 30` while iterating; the final at `--scale 2 --fps 60`.

## Fitting animation to a voice (time-warp)
Design against an estimated script timing. When the real take arrives, its lines land at different times. Don't move every keyframe; remap time instead:
```js
// [video time, scene time] pairs. Between pairs, scene time runs linearly.
const WARP = [[0, 0], [5.9, 5.9], [10.9, 8.0], [16.9, 15.0], /* ... */ [63.2, 58.0]];
```
Add a pair at each scene boundary: video time = where the voice line starts, scene time = where the scene was designed to start. A scene that gets more time plays slightly slower, which is invisible inside holds and gentle eases. Then set `DURATION` to the final video time.

## Capturing the real product
- Prefer the real screens: screenshots from the person, or a headless Chrome capture of a URL they own (`Page.captureScreenshot` over the DevTools protocol, the same way record.mjs works). Only capture pages they have authorised; don't log into anything with their credentials.
- **Rebuild, don't paste.** Redraw the key UI as HTML/CSS at true proportions, so the camera can zoom without blur and parts can animate. Use the screenshot as a semi-transparent overlay while you match it, then remove it.
- Replace private data (names, phone numbers, emails, revenue) with realistic stand-ins.
- **Running their app locally:** pages behind a login talk to the live backend. Capture the public pages and block the backend's *hosts* (`Network.setBlockedURLs` with full host patterns like `https://*.your-backend.com/*`). Don't use a bare word from the provider's name: it can also match the dev server's own bundled modules (under `/node_modules/...`), and the page renders blank. For the logged-in screens, rebuild them from the code and the screenshots the project already ships (`public/*.png`, docs, README). Ask before logging in to anything real.
- **Find the real logo by looking at it.** A file called `logo.svg` can be an old or unrelated icon. Open the candidates (`public/*logo*`, the favicon, what the nav renders) and check them against the live site before using one.
- **Camera on a window:** give the window `transform-origin: 0 0` and drive `translate(tx, ty) scale(s)` from named camera poses (`all`, `items`, `total`) blended over time. Anything else that must point at the window (the cursor, click ripples) maps window coordinates through the same pose: `stage = origin + t + local * s`.

## Fonts and assets
- Put fonts in `fonts/` next to the page and declare them with `@font-face`. Wait for each one in the start-up block (`document.fonts.load('600 64px Name', 'sample text')`); otherwise the first frames use a fallback font and the text jumps.
- `await img.decode()` for every image before `ready`.
- Keep asset paths relative to the page.

## Smooth camera (no stutter)
- **Never tie the camera directly to something that moves in steps** (a caret jumping letter by letter, a count, a list index). Follow it like a camera operator does: average the target over the last ~0.4 s, `follow(fn, t)` = the mean of `fn(t - k·0.4/11)` for k = 0…11. It stays a pure function of t, and it glides.
- **Keep camera values continuous.** `n * 10` with an integer n is a staircase; use the continuous progress instead.
- **Blur and filters go on the moving layer itself,** not on its parent. A filter on the parent of a moving child is recomputed every frame; on the layer, it's computed once and then only moved.
- **Per frame, change only cheap things:** `transform`, `opacity`, and filters on a layer marked `will-change: filter`. Never repaint something big and blurred every frame (a changing gradient under a blur, a box-shadow that grows across the screen). Paint it once, then move it, fade it, or `hue-rotate` it, which the GPU does almost for free.
- **Ease every move in and out.** A linear slide that stops when the next move starts reads as a jerk. Prefer one continuous eased move over two moves stitched together.
- **Give everything the camera moves `will-change: transform`,** so the browser moves it as one layer instead of redrawing it, and text doesn't snap to whole pixels.
- The browser preview can still drop frames on a slow machine. The recorded video can't; judge smoothness on a 60 fps recording.

## Pitfalls that cost real rounds
- **Verify the final file, not the page.** Extract frames from the mp4 itself (`ffmpeg -ss 12.5 -i out.mp4 -frames:v 1 f.png`, one command per frame). Encoding, scaling and the time-warp can all differ from the preview.
- **Large blur filters are slow and can soften whole layers.** Blur small elements, cap stdDeviation, and turn the filter off (`none`) at rest.
- **3D:** set `perspective` on the parent and `transform-style: preserve-3d` where children need depth. Cards seen edge-on vanish, so keep rotateY under about 70°.
- **Measure text after fonts load,** never before; widths change.
- **Smooth gradients band at high compression.** Keep CRF at 18 or lower for the master; the recorder uses 14.
- **Logos:** centre them optically (by their visual mass, not their bounding box), keep the brand's clear space, and never stretch them.
- **Long, complex pages:** split scenes into functions (`renderIntro(t)`, `renderTour(t)`), each owning its own elements, and hide a scene completely outside its window (`display:none` or `opacity:0`) so it costs nothing.
