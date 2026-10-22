## What this changes

<!-- One or two sentences. One pull request does one thing. -->

## Type

- [ ] New move (`assets/motion.js`)
- [ ] Kind playbook (`references/kinds/`)
- [ ] Field-guide or craft lesson (`references/`)
- [ ] Bug fix
- [ ] Windows / Linux support
- [ ] Example video for the README
- [ ] Other:

## Proof

<!-- Visual changes: attach a contact sheet or a short clip, before and after if possible.
     Bug fixes: what happened before, what happens now. -->

## Checklist

- [ ] **Proof attached** (stills, clip, or before/after output)
- [ ] **No templates:** it doesn't push videos toward a fixed story or shot order (see `references/originality.md`)
- [ ] **Clean:** no brand names, personal data, client material, or unlicensed media in the skill folder
- [ ] **New moves only:** pure `render(t)` (no timers, `Date.now()`, `Math.random()`, or carried state); cheap per-frame changes; eased with the tokens in `E`; documented in `references/moves.md`; used once in a demo page
- [ ] **Respects users:** reads repos only, no secrets, no logins, no live API calls, no tracking, no undocumented network calls
- [ ] `claude plugin validate .` passes
- [ ] Both demo pages still render
- [ ] Tested in a real Claude Code session (if `SKILL.md` or a reference changed)
- [ ] For examples: I have the product owner's permission to publish it
