# The production plan: the whole film, frame by frame, before any build

Written after the concept is chosen (originality.md) and before any code. It's the contract: the build follows it, and changes go into the plan first. Expectations have no limit here: describe the film as it should feel at its best, then build to that.

## What the plan contains

### 1. The film on one page
- **Kind, length, format, sound.**
- **The concept** in one sentence, and the 3 obvious ideas rejected (from originality.md).
- **The hero object** and what the camera does with it.
- **The arc in feelings:** e.g. dread → curiosity → relief → pride.
- **The selling points covered,** and in which shots (every ranked selling point from the brief either appears or is consciously left out).

### 2. The look (tokens)
- The world (ground, light, texture), the palette (with hex values, and the accent's one meaning), the type (fonts, sizes for headlines and UI on a phone), depth and shadow, the motion character (calm, snappy, weighty), and which style from styles.md it borrows from.

### 3. The shot list (every shot, frame by frame)
One block per shot, in this exact shape:

```markdown
### Shot 4 — "The words become the form"   10.2 – 13.8 s (3.6 s)
- **Purpose:** selling point #1 (a whole form from one sentence); the aha.
- **On screen, frame by frame:**
  - 10.2: the typed sentence sits in the prompt, words in ink, "1–5 rating" faintly underlined in the accent.
  - 10.6: "name", "email", "1–5 rating" lift out of the sentence one by one (0.15 s apart), glowing.
  - 11.4: each word flies on a curve to an empty slot below and unfolds into its field (label + input); the rating becomes five stars.
  - 12.8: the finished form settles; a soft light sweeps across it once.
- **Camera:** starts close on the sentence (1.4x), pulls back to the whole form by 12.8 (zoomLog, inOutStrong 1.2 s).
- **Motion and effects:** words lift with a 4 px blur trail; curved paths (drawPath, invisible) guide the flights; fields unfold with a spring (ratio 0.8); one glint.
- **Transition in / out:** in: continuous from shot 3 (same prompt). Out: the form shrinks into the corner of a phone (shared element) for shot 5.
- **Text on screen:** none (the words themselves are the text).
- **Voice / sound:** music swells on 10.6; a soft "tick" per field landing.
- **Assets:** the product logo (public/logo.svg); field styles from the app's form-field component.
- **Moves:** wordToSentence (reversed), drawPath, flip (for the stars), twin (depth of field).
```

### 4. Key frames
Render 4–8 still frames of the most important moments (the opening, the aha, the payoff, the ending) as a contact sheet and show them with the plan. A picture settles in one look what text takes five rounds to settle.

### 5. Risks and open questions
Anything that may not read on a phone, any asset still missing, anything that depends on the person's answer.

## How detailed is "frame by frame"?
Every visible change gets a timestamp: what enters, how, from where; what the camera does; what changes colour; what's read. If someone else could build the film from the plan alone without asking anything, it's detailed enough.

## Approval
Show the one-page summary, the key frames and the shot list. Build only after a yes. When working alone, still write the plan, check it against the quality checklist and originality.md, and fix it before building.
