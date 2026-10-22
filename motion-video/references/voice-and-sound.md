# Voice and sound

## Writing the voice-over
- Write for the ear: short sentences, one idea each, and numbers as they are spoken ("ninety-three percent", "three hundred plus").
- **Each line belongs to one scene.** The script table and the storyboard share line numbers.
- **Budget:** English about 2.7 words per second for a promo, 2.3 for training. If a line doesn't fit its scene, cut words; don't speed up the voice.
- Mark pauses with "…" and full stops. AI voices respect punctuation more than instructions.

## Script format for AI voice tools
Most AI voice tools take a style prompt and a script. Write both in one markdown file with two headed blocks, so they can be pasted or read by a tool:

````markdown
## Style instructions
```
You are <who is speaking> in <what kind of video>. Sound <3-4 adjectives>.
The shape of the read:
- Opening "<line>": <how: slow, a beat of silence after>.
- Middle tour: <brisker, a tiny emphasis on each product name>.
- Closing "<line>": <warm, unhurried; say the address word by word>.
Pace: <calm at the start and end, brisker in the middle>. Pause at every "…".
Pronunciation: "<Name>" is said "<phonetic>", stress on <syllable>. "<Acronym>" as letters.
```

## Script (paste as is)
```
<line 1>

<line 2>
...
```
````

**Pronunciation is the most common failure.** Spell names phonetically in the style block ("ah-SAAD: a soft 'ah', then a long open 'SAAD' that rhymes with 'Riyadh'; never 'a sad'"), and use that spelling in the script itself if the voice still gets it wrong. For other languages, write the script in its own script, and say in the style block how the mixed-in English words should sound (the way local users say them).

Generate 2 or 3 takes, and let the person pick by ear.

## Fitting picture to voice
1. `node scripts/voice-segments.mjs voice.wav` lists every spoken segment (start, end), using silence detection. Tune it with `--noise -35` (dB) and `--min-silence 0.25` (s).
2. Match segments to script lines. Two lines with a short gap can come out as one segment; split it at the gap you hear.
3. Put the line starts into the page's `WARP` table (see engine.md), so each scene starts as its line starts, or about 0.2 s before.
4. Re-render stills at the line starts to check that the picture and the words agree.

## Music and the mix
- Use music the person has the rights to (their own, a licensed library, or a royalty-free source whose licence they've checked). Match the mood to the brand, not to "epic".
- The mix (`scripts/mix.mjs`) places each voice line at its time with 30 ms fades, keeps music under the voice (sidechain ducking), fades the music in over 0.6 s and out over the last 3 s, and normalises to **-14 LUFS, -1.5 dBTP** (the streaming and social standard).
- Music sits around 0.3 of full volume before ducking. If the person says the voice is hard to hear, lower the music; don't raise the voice.
- Silence is allowed. A beat of quiet before the reveal or the ending lands harder than more music.

## Captions
Feeds autoplay muted. Options, from lightest to heaviest: upload a `.srt` to the platform (searchable, and viewers can turn it off); short on-screen headlines that carry the story without sound; full burned-in captions (best for training on phones). Ask which one; don't assume.
