# Intake and product understanding

The first two stages. Nothing is designed until both are done and the person has confirmed the product understanding.

## Stage 1: Intake (ask, with a default for each, so a busy person can just say "go")

Ask in one round (use a multiple-choice question tool if available):

1. **What kind of video?** Show the menu from kinds/README.md (one line each). If unsure, ask what a viewer should do or feel afterwards, and suggest two kinds.
2. **Where will it be posted, and how long?** Default from the kind's playbook (e.g. a launch film: 1:1, 30 s).
3. **Preferences:**
   - the look: the product's own look (default), light, dark, gradient, photographic
   - tone: premium, playful, calm, bold
   - sound: music only (default for feeds), voice-over, captions
   - must-show features or moments
   - anything to avoid
   - reference videos they love (study those frame by frame: SKILL.md stage 2)
4. **The kind's own questions** (each playbook has an "Ask the person" list). Ask only those you can't answer from the material.

### When the brief is thin
If the person gives little to go on, tell them in a few plain words what would make the film much better, in this order:
1. the real product (repo, site, screenshots, brand files)
2. the one thing: who it's for, the feeling or action wanted, the feature that makes people switch
3. one to three reference videos they love, and what they love about them
4. real proof they're happy to show, and what must stay private

Then carry on with sensible defaults. Never block on these.

## Stage 2: The material (read-only)

Ask for the product, in order of preference:
1. **The repo path** (read-only), plus the live URL if public.
2. **Screenshots or screen recordings** of the key screens.
3. **The website / landing page.**

Rules: never modify the repo; never open .env or credential files; never log into anything or call live APIs. Running it locally is fine only with every live backend host blocked (engine.md).

### How to read a repo to understand the product
Work through it in this order, taking notes:
1. **What it is and who it's for:** README, the landing page source (hero copy, features, pricing, FAQ), package names, docs.
2. **The user journey:** the routes/pages in order of a first-time user (sign-up → onboarding → the first "aha" → the main loop → sharing/exporting/paying). Read the components of each page: labels, buttons, empty states, success messages. These are the product's real words.
3. **The selling points:** what the landing page claims; what the code shows is unusual (an integration, an AI feature, a clever shortcut, a constraint it removes). Rank them: which one would make someone switch?
4. **The aha moment:** the single moment in the journey where a user first gets the value.
5. **The brand:** logo files, colours and fonts from the theme/CSS tokens, radius, shadows, the illustration style, how it talks (copy tone).
6. **Real data shapes:** what a realistic record looks like (for believable stand-in data).
7. **What not to show:** unfinished features, internal tools, private data.

### The product understanding brief (write it, show it, get a yes)
```markdown
## Product understanding: <name>
- What it is, in one sentence a stranger understands:
- Who it's for (one specific person):
- Their life before (what they physically do, feel, wait for):
- The user journey: 1. … 2. … 3. … (the real screen names)
- The aha moment:
- Selling points, ranked: 1. … (why someone would switch) 2. … 3. …
- Proof available (numbers, quotes, results; are they public?):
- Brand: logo, colours, fonts, tone of voice
- Must show (from the person): …   Must avoid: …
- Open questions:
```
Only move on once the person confirms or corrects it. When working alone, write it anyway and state the assumptions.
