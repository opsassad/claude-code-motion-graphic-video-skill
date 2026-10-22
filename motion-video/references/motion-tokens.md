# Motion tokens: the numbers

Concrete values, so motion is consistent and never guessed. Use the helpers in `assets/engine-starter.html` (`E.outStrong`, `spring()`, `zoomLog()`, `onBeat()`). If you break a token, write down why in a comment.

Gathered from published design-system motion tokens, studio write-ups and common motion-design practice.

## Curves
| Token | Value | Use |
|---|---|---|
| `E.outStrong` | cubic-bezier(0.23, 1, 0.32, 1) | anything entering |
| `E.outExpoLike` | cubic-bezier(0.16, 1, 0.3, 1) | bigger entrances, headlines |
| `E.inOutStrong` | cubic-bezier(0.77, 0, 0.175, 1) | things already on screen moving: camera, morphs, shared elements |
| `E.exit` | cubic-bezier(0.4, 0.14, 1, 1) | exits |
| `E.inExpo` | 2^(10x-10) | whip-outs only |

- Never ease-in an entrance: the first 30–40% looks frozen.
- Linear only for clocks, progress bars and counters' time base.

## Durations (video is slower than UI so people can read)
| Move | Duration |
|---|---|
| Small UI change (press, chip, toggle) | 0.25–0.4 s |
| Element entering | 0.5–0.7 s |
| Shared-element morph | 0.6–0.9 s |
| Camera push / glide | 0.8–1.4 s |
| Whip pan | 0.3–0.45 s, with blur at top speed |
| Exit | 60–70% of its entrance |

**Reading hold** after a move settles: 0.5 s + 0.3 s per word on screen, 1.2 s minimum; the payoff holds 1.5–2.5 s. Every shot needs a settled, still moment. A camera that never stops reads as cheap.

**Stagger:** 30–60 ms between letters or list items, 60–90 ms between words, 120–180 ms between lines. Cap the whole stagger at about 0.6 s; with more items, shrink the step.

## Springs (closed form, so they work in render(t))
`spring(x, ratio, response)`, where x is seconds since the start:
- ratio 1.0, response 0.3–0.4 s: settles cleanly (most moves).
- ratio 0.7–0.8: about 5% overshoot (landings, stamps, logos).
- Overshoot 3–8% on entrances. Start from scale 0.95, never 0. A press dips to 0.95–0.97.
- Anticipation (a 2–4% pull-back for 80–120 ms) on hero moves only.

## Camera
- Zoom in log space: `zoomLog(z0, z1, p)`, so 1x→2x feels as even as 2x→4x.
- Push to a detail at 1.4–1.6x, glide to the result, then pull back out before a morph.
- Rebuilt UI should stay sharp at the deepest zoom: build at true size and record with `--scale 2`.

## Motion blur
- Real blur: `record.mjs --blur 4` renders 4 sub-frames per frame and averages half of them (a 180° shutter, like film). Use it on the final render of videos with whips or fast moves; it costs 4x the render time.
- Cheap blur: the directional `motionBlur()` helper, used only above about 30 px per frame.

## Type
- Mask rise: translateY 110%→0 over 0.5–0.7 s with `E.outStrong`, opacity across the first 40%, 6–10 px unblur, words 60–90 ms apart.
- Lines of 2–5 words, broken by meaning; at most 3 lines on screen.
- A premium "tighten" on display type: letter-spacing 0.08em→-0.02em over 0.8–1.2 s.
- Exits are faster than entrances (0.3–0.4 s).

## Phone readability (1080 square or vertical feed; plays about 375 px wide)
- Text the viewer must read: 40 px or more on the stage, ideally 48. Headlines 80–140 px. Nothing important under 32 px. Weight 500+ when small.
- Rebuilt UI is usually 13–16 px, so zoom the camera when it matters (see craft.md).
- Safe margins: 80–100 px in a square; for 9:16, top 108, bottom 320, left 60, right 120.

## Sound and beats
- Music at 100–128 BPM for launches. One beat = 60/BPM s (0.5 s at 120). Snap scene starts and payoffs to beats with `onBeat(t, bpm)`, and let entrances land 1–2 frames before the beat.
- UI sound effects: soft clicks on taps, a 150–300 ms whoosh on whips, one gentle pop on the payoff, mixed 6–12 dB under the music.
- Duck music 6–12 dB under the voice (attack 30–80 ms, release 250–700 ms). Loudness -14 LUFS, true peak -1 dBTP.

## Colour
- Exact brand hex on the UI itself; tints and glows only around it.
- A soft "key light" behind the hero: a radial gradient of the brand colour at 18–25% opacity. Glows blurred 40–120 px at 20–40%, never on text.
- Smooth gradients band in 8-bit video. Keep CRF at 16 or lower for the master, or add a 2–4% noise layer only if banding shows (and the person doesn't dislike grain).
