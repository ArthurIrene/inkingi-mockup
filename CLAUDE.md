# Inkingi mockup: how to update this repo

This repo is the live copy of the **"Inkingi Home"** design canvas on claude.ai:
https://claude.ai/artifact/Kr8dZWiTGJBV6dfE4PuBzd
Every push to `main` publishes to the team's live link (Vercel).

## When to sync

Only when Arthur **approves** a change in the canvas. Ideas still being discussed stay in the canvas.
At the start of a session, compare versions: if the canvas is newer than `design/canvas.json`, tell Arthur and offer to sync.

## How to sync (canvas → repo)

1. Read three files from the canvas with the Artifact tool (`read`, `paths`):
   `project/canvas.json`, `project/Main.dc.html`, `project/Desktop.dc.html`.
2. Copy them over `design/canvas.json`, `design/Main.dc.html`, `design/Desktop.dc.html` (same names, no edits).
3. The version comes from the canvas title note in `canvas.json` (`notes.t1.text`, e.g. "Home v28 · makers & workshops").
   The site reads it automatically (`runtime/version.js`); also update the "Current version" line in `README.md`.
4. If the canvas gained a new artboard (a new `.dc.html`), add it to `design/`, and add a page for it like `phone.html` plus a card on `index.html`.
5. Test: serve the folder (`python3 -m http.server`), open `/phone.html` and `/desktop.html`, click around, and check there are no console errors.
6. Commit with the version and what changed, e.g. `v29: People inline filters`, then push to `main`.
   Before pushing from a fresh shallow clone, run `git fetch origin main` first.

## Rules

- Never edit the design inside `design/*.dc.html` by hand unless Arthur asks; design changes happen in the canvas first.
- `runtime/dc-lite.js` plays the design files. If the canvas starts using something it doesn't support
  (`<dc-import>`, uploaded images under `/_blob/`), extend the runtime rather than changing the design files.
- Prices like `RWF [price]` are placeholders on purpose.
