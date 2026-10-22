---
name: motion-video
description: Concept, design, animate and deliver motion-graphics videos built in code (an HTML page where every frame is render(t), recorded frame-exact to mp4) at a level that rivals After Effects work, in twelve styles (cinematic product film, clean light product film, atmospheric glass, narrated explainer, a day in the life, character-led, hero shot, sizzle, card showcase, walkthrough, kinetic type, data story). Use this whenever someone wants a video of any kind: a product launch or feature explainer, a portfolio or personal-brand video, a staff or customer training video, a how-to walkthrough, a change/update notice, a teaser or social short, an animated data story, a demo, or "turn this into a video" / "make a video like that one". Also use it for the pieces around a video: concept and storyboard, voice-over script for AI voice tools, fitting animation to a recorded voice, music mix, captions, thumbnail, and the post that goes with it. Works in any language.
---

# Motion video studio

A video here is a web page where every frame is a pure function of time, `render(t)`, recorded one exact frame at a time by `scripts/record.mjs`. That gives frame-perfect motion, real fonts, real product UI, and code-speed iteration. The bar is work a senior motion designer would be proud of: one clear idea per moment, motion with physical weight, and every element earning its place.

**This skill teaches how to think and build. It is not a template.** Every video gets its own concept from its own subject. Don't reuse a previous video's scenes, layouts or story beats; reuse the engine, the craft and the lessons. Two videos made with this skill should look like they came from the same studio, not the same mould.

## Before you start

- **Read the taste files.** `references/taste.md` holds lessons that apply to everyone. Then look for the person's own taste: `MOTION_TASTE.md` in the project root, or `~/.claude/motion-video-taste.md` across projects. Their taste overrides the general defaults.
- **Match how you talk to who you're talking to.** Many people asking for videos aren't developers. Lead with what they'll see. **Show rendered frames, not ASCII sketches or text mockups**; a picture settles in one round what a description takes five.

## The workflow

Each stage ends with something real to look at, before time goes into the next.

### 1. Intake: what kind of video, and preferences
Ask in one round, each question with a sensible default, so a busy person can just say "go" (`references/intake.md`):
1. **The kind of video,** from the menu in `references/kinds/README.md`:
   - launch film, hero ad, explainer, story film, character film
   - kinetic type, sizzle reel, teaser, mood showcase
   - walkthrough, showcase reel, data story
2. **Where it's posted and how long.**
3. **Preferences:** the look, the tone, the sound (music, voice, captions), must-show moments, things to avoid, reference videos they love.

Then read that kind's playbook (`references/kinds/<kind>.md`) and ask only the questions from its list that the material can't answer.

### 2. The material, and understanding the product
Ask for the UI: **the repo (read-only)**, screenshots or recordings, and the live site. Never modify the repo, open secrets, log in, or call live services.

Read it the way `references/intake.md` describes:
- what it is and who it's for
- **the user journey,** screen by screen, in the product's own words
- **the selling points, ranked** (why someone would switch)
- the aha moment
- the brand (logo, colours, fonts, tone)
- realistic data
- what not to show

Write the **product understanding brief** and get the person's yes (or state your assumptions when working alone). Anything the person asked to show, explore or explain goes in it as must-show.

Note fonts, colours, radius, spacing, real copy and real data from the real screens. The video should look like *their* brand, not a generic motion template; inventing a look is the most common reason a first version gets rejected.

If the person shares a **reference video**, study it frame by frame before designing (`bash scripts/study-reference.sh ref.mp4 out/`). Write down what it actually does:
- camera distance and angle
- the size and role of the text
- what its colour means
- how shots join
- its tempo and its arc

Tell the person your reading, and confirm it before building. Never build from a single screenshot of a reference.

### 3. Concept: an original idea first, then a style
Build it from the product understanding brief (the journey, the ranked selling points, the aha). **Do the originality method in `references/originality.md` first, every time, even when working alone:**
1. find the human truth
2. write 8 concepts from 8 different angles
3. kill the generic ones with the swap and cliché tests
4. pick the boldest survivor that still sells, and write down the obvious ideas you rejected

The most probable idea for any software product (type a request → the result builds → toasts → montage → slogan → logo) is banned as a backbone. Everything else in this skill (demos, field guide, recipes, past films) shows mechanics, never a shot order to copy.

**Then pick the style** from `references/styles.md`:
- cinematic product film
- clean light product film
- atmospheric glass
- narrated explainer
- a day in the life
- character-led
- hero shot
- sizzle
- card showcase
- walkthrough
- kinetic type
- data story

Read `references/patterns.md` before choosing: it's the field guide to what strong launch films actually do.

The genre says what the video is for; the style says how it feels. When the brief is open, offer two styles as the two directions.

Then write the story as **one sentence**, then the **visual metaphor** that carries it, taken from the subject's own nouns and verbs. List scenes: one idea each, each with **one signature moment** (the beat of animation that proves the point), also from that subject. When the brief is open, propose two directions and let the person pick. `references/craft.md` has the deep principles (true in every style), the method, the motion vocabulary and the timing rules. Read its principles before every concept.

### 4. The production plan: the whole film, frame by frame
Before any code, write the full plan in `references/plan.md`'s format:
- **the film on one page:** concept, rejected obvious ideas, hero object, the arc in feelings, which selling points appear where
- **the look as tokens**
- **every shot frame by frame:** each visible change timestamped, plus the camera, effects, transitions in and out, text, sound, assets and moves
- **4–8 key frames rendered as stills**
- **the risks**

Expectations have no limit at this stage: describe the film at its best, then build to that. **Every shot must move the story along; if it doesn't, cut it.** Show the plan and the key frames, and build only after a yes. When working alone, check the plan against the quality checklist and originality.md, and fix it before building. Write any voice-over now, because it drives timing. `references/voice-and-sound.md` covers the script format AI voice tools read well, pacing, pronunciation and sound. For a product launch, plan the **chain**: which element carries each screen into the next (craft.md, "Connected screens").

### 5. Build
Copy `assets/engine-starter.html` **and `assets/motion.js`** next to the project's assets, and build shot by shot. **Build from the moves library first** (`references/moves.md`):
- the typing close-up (`macroType`)
- `countUp`
- the wall dive (`wall`)
- `buildIn`, `cascade`, `montage`, `growToWord`
- `cursor` and `clickZoom`
- `morphRect`
- depth of field (`twin`)
- `shots` for cuts, and `start` for preview and recording

`assets/moves-demo.html` shows how each one is called. Read it for mechanics only; its shot order is the banned default, never a template. Use a move only where the concept needs it; a film may use none of them. Only hand-build what the library doesn't cover, and when a new move proves itself, add it to the library in the same shape.

Take every duration and curve from `references/motion-tokens.md`, not from guesses. Follow the contract and pitfalls in `references/engine.md`; they come from real bugs.

For anything over about 20 s, do a quick **rough timing pass** first: grey boxes with the real camera moves and timings, a few stills. Get the rhythm right, then swap in the real art without changing the timing.

### 6. Gate: contact sheet
Render 8 to 16 key moments with `node scripts/record.mjs page.html stills/ --stills 1,3.5,...`, then `bash scripts/contact-sheet.sh stills/ sheet.jpg`. **Review it yourself first** against the checklist below and the taste files; fix and re-render. Only then show the person. Don't record the full video until the stills are right.

### 7. Record, voice, fit, mix
Record a draft (`--scale 1 --fps 30`) for review, and the final with `--scale 2 --blur 4`: supersampled, then scaled down, with real film-style motion blur. When a voice take arrives, run `node scripts/voice-segments.mjs voice.wav` to find each spoken line. Stretch the *animation* to the voice with the time-warp table. Don't cut or speed up the voice. Place the lines and the music with `node scripts/mix.mjs mix.json`.

### 8. Deliver
Export per channel, plus a thumbnail and the post copy (`references/delivery.md`). Verify the *final file*: pull frames from the mp4 itself (one ffmpeg call per frame) and check duration and loudness.

### 9. Learn
When the person reacts, write what they loved or rejected, and **why**, into their taste file (create `MOTION_TASTE.md`, or `~/.claude/motion-video-taste.md` if it's their taste rather than the project's). If a lesson would help anyone, propose adding it to `references/taste.md`. This is how each video beats the last.

## Quality checklist (run on every contact sheet)

- **Looks like the real brand/product:** same fonts, colours, radius, components. Nothing invented.
- **One idea per screen.** If the eye has to read two things at once, cut one.
- **Nothing cut off, overlapping or cramped:** text wraps cleanly, logos optically centred, cards whole, safe margins kept.
- **Colours true:** no washed-out filters or grey veils; text has contrast.
- **Motion has weight:** ease in and out, springs settle, linear only for clocks and progress bars.
- **Transitions are motivated** (a camera move, an object hand-off, a push), and the scene is still readable while they run.
- **Screen and voice agree:** the thing being said is the thing on screen at that moment.
- **Facts are real and safe to publish** (see delivery.md).
- **Ending:** brand mark plus one link or one action. No extra asks the person didn't want.
- **Readable on a phone:** important text is 40 px or more on the stage, or the camera zooms in until it is. Check the sheet shrunk to about 375 px wide.
- **Every shot settles:** after each move there's a still moment long enough to read (0.5 s + 0.3 s per word).
- **The style holds:** joins, colour, text and camera follow the chosen style's recipe all the way through.
- **Actions, not screens:** every shot shows someone doing something, or the result of it.
- **Scale and tempo change** at least once (close ↔ wide, slow ↔ fast).
- **The accent colour has one meaning.**
- **Every image checked by eye:** the right product for its label, the right logo, nothing cropped or stretched. Open each one; don't trust file names.
- **Numbers make sense:** only totals and growing amounts count up; prices and fixed values just appear.
- **Clean transitions:** text leaves before something passes over it (no white-on-white swallowing), and no empty frames between shots.
- **Specific, not generic:** at least one moment only this subject could have; library moves only where the subject has that action.
- **Original:** it passes the swap test, it doesn't use a banned backbone (originality.md), and it doesn't share a shot order with the demos or with the last film made with this skill.

Before showing the person anything, score it out of 10 on each of these: brand match, story clarity, motion quality, readability, transitions, sound/voice sync, and finish. Fix anything under 8 first.

## Files

- `references/genres.md`: video types with structure, length and format defaults.
- `references/intake.md`: the intake questions (with defaults), how to read a repo for the user journey and selling points, and the product understanding brief.
- `references/kinds/`: one playbook per kind of video (launch film, hero ad, explainer, story film, character film, kinetic type, sizzle, teaser, mood showcase, walkthrough, showcase reel, data story): what to ask, shapes it can take, worlds, moves, examples, pitfalls. `kinds/README.md` is the menu.
- `references/plan.md`: the production plan format: the film on one page, look tokens, every shot frame by frame, key frames, risks.
- `references/originality.md`: **read first.** The method for an original concept every time: human truth, 8 angles, kill tests, banned clichés. It overrides every example in the skill.
- `references/patterns.md`: the field guide from a frame-by-frame study of 15 strong launch films: what nearly all of them do, kinetic type, transitions, showing the product working, when angles work, structures, pro details. Read it at the concept stage.
- `references/styles.md`: twelve distinct styles (cinematic product film, narrated explainer, card showcase, walkthrough, kinetic type, data story, clean light product film, atmospheric glass, a day in the life, character-led, hero shot, sizzle), each a full recipe: camera, text, colour, joins, tempo, arc, pitfalls.
- `references/craft.md`: deep principles, concept method, composition, motion vocabulary (macro typing, wall of results, connected screens, click zoom, camera), timing.
- `references/motion-tokens.md`: the numbers: curves, durations, springs, stagger, reading holds, phone text sizes, beats, colour.
- `references/engine.md`: the render(t) contract, preview/record, time-warp, capturing real UI, pitfalls.
- `references/voice-and-sound.md`: voice script format, pacing, pronunciation, fitting, music mix.
- `references/delivery.md`: channel specs, thumbnails, post copy, what not to publish.
- `references/taste.md`: lessons from real client feedback; how to keep a personal taste file.
- `scripts/record.mjs`: frame-exact recorder (video or stills, `--blur N` for real motion blur). Needs Node 22+, Chrome or Chromium, ffmpeg.
- `scripts/contact-sheet.sh`: stills to one review image.
- `scripts/study-reference.sh`: a reference video into time-ordered contact sheets, to study it frame by frame.
- `scripts/voice-segments.mjs`: where each spoken line starts and ends in a voice take.
- `scripts/mix.mjs`: video + voice lines + ducked music, to a loudness-normalised mp4.
- `references/moves.md`: the moves library: what each move is for, its options, and which moves fit which style.
- `assets/motion.js`: the engine helpers and the moves library (load next to the page).
- `assets/engine-starter.html`: a page using motion.js, with one demo scene to delete.
- `assets/moves-demo.html` and `assets/moves-demo-2.html`: every move used once in two short films, to read as templates (and to check the library still works).
