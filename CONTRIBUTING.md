# Contributing to motion-video

Thanks for wanting to make this better. The skill's value is its taste: original concepts, real products, motion that feels expensive. So contributions are open, but curated: every change has to show it keeps that bar. The maintainer has the final say.

## What we welcome

- **New moves** for the library (`assets/motion.js`): a transition, a reveal, a camera move, a type effect. Add it to a demo page and show it working.
- **Kind playbooks:** a new kind of video (`references/kinds/`) or a better playbook for an existing one.
- **Field-guide lessons** (`references/patterns.md`) from studying strong videos frame by frame, written in general terms (what it does and why it works), with no brand names.
- **Bug fixes,** and making the scripts work well on **Windows and Linux** (they're developed on macOS).
- **Examples** for the README: real videos made with the skill, with the product owner's permission.

For anything big (a new reference file, a change to the workflow in `SKILL.md`, a new script), **open an issue first** so we can agree on the shape before you spend time on it.

## The rules

1. **Show, don't tell.** Anything visual comes with proof: a contact sheet of stills or a short clip, ideally before and after. Render it with the skill's own tools:
   ```bash
   node motion-video/scripts/record.mjs page.html stills/ --stills 1,2.5,4 --scale 1
   bash motion-video/scripts/contact-sheet.sh stills/ sheet.jpg
   ```
   No proof, no merge.

2. **No templates.** The skill promises that every video starts from its own idea (`references/originality.md`). Don't add fixed shot orders, "use this structure" recipes, or anything that pushes videos toward looking alike. Examples and demos show *mechanics*, never a story to copy. A change that makes outputs more similar is declined, however good it looks.

3. **Clean and safe to publish.**
   - No brand names, personal data, client material or private screenshots inside the skill folder.
   - No copyrighted video, music, images or fonts unless the licence allows it and it's credited.
   - Examples in `examples/` need the product owner's permission.

4. **Smooth by design.** New moves follow the engine contract (`references/engine.md`):
   - Every move is built once and returns `render(t)`, a pure function of time: no timers, no `Date.now()`, no `Math.random()` (use `rand(i)`), and no state carried between frames.
   - Per frame, change only cheap things (transform, opacity, filters on a layer marked `will-change`). Never repaint a large blurred area every frame.
   - Ease in and out, using the tokens in `E` (`references/motion-tokens.md`).
   - Document it in `references/moves.md` (what it's for and its options), and add one use of it to `moves-demo.html` or `moves-demo-2.html`.

5. **Respect people's code and privacy.** The skill only ever *reads* a user's repo. No contribution may make it edit a user's project, open secret files, log in to services, call live APIs, add tracking, or make network calls that aren't documented.

6. **Small and focused.** One pull request does one thing. Drive-by reformatting and unrelated "improvements" will be asked to be split out.

7. **Checks pass.**
   ```bash
   claude plugin validate .                    # the marketplace and plugin are valid
   node motion-video/scripts/record.mjs motion-video/assets/moves-demo.html   /tmp/d1 --stills 3,8,12 --scale 1
   node motion-video/scripts/record.mjs motion-video/assets/moves-demo-2.html /tmp/d2 --stills 5,17,29 --scale 1
   ```
   Both demos must still render. Test the skill in a real Claude Code session if you changed `SKILL.md` or a reference.

8. **Write plainly.** Short, direct instructions in the imperative ("Render the stills", not "You should render…"), explaining *why* when it isn't obvious. Keep `SKILL.md` lean; put detail in `references/`. Match the voice of the surrounding files.

## How to contribute

1. Fork the repo and create a branch (`move/orbit-camera`, `fix/windows-chrome-path`, `kind/podcast-clip`).
2. Make the change, following the rules above.
3. Run the checks, and render your proof.
4. Open a pull request and fill in the template (it's a short checklist).

Don't worry about version numbers or the changelog; the maintainer handles them when releasing.

## Reporting bugs

Open an issue with the "Bug report" template: what you ran, what you expected, what happened, your OS and versions of Node, Chrome and ffmpeg, and any error output.

## Code of conduct

This project follows the [Code of Conduct](CODE_OF_CONDUCT.md). Be kind and constructive.

## License

By contributing, you agree that your contributions are licensed under the [MIT License](LICENSE).
