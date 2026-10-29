# Inkingi mockup

A clickable design of Inkingi: how the web and app look and feel, before the real build.
It is a mockup only. Nothing is saved, no real data, no real accounts.

- **Phone:** first visit → sign-up → personal home, materials, people, inbox
- **Desktop web:** the same flow on a big screen

Current version: **v28** (makers and workshops, made to order).

## See it

- **Live link:** the Vercel link (shared in the team chat). It updates by itself after every push.
- On a phone, open `/phone` and it fills the screen. On a laptop, `/phone` shows a phone frame and `/desktop` the full site.

## Run it on your own computer

You need [Node.js](https://nodejs.org) (any recent version).

```bash
git clone https://github.com/AltaVisionLTD/inkingi-mockup.git
cd inkingi-mockup
npm start
```

Then open http://localhost:3000.

No Node? Any static server works, for example `python3 -m http.server 3000`.
Opening `index.html` by double-click does **not** work: the pages need a server.

## How the files are organised

| Path | What it is |
| --- | --- |
| `design/Main.dc.html` | The phone screens (all of them, one file) |
| `design/Desktop.dc.html` | The desktop web screens |
| `design/canvas.json` | The design canvas index (version note, frame sizes) |
| `index.html`, `phone.html`, `desktop.html` | The pages people open |
| `runtime/dc-lite.js` | Small player that runs the design files in any browser |
| `runtime/vendor/` | React 18 (MIT licence), kept here so it works offline |

The design files are written in the canvas format used on claude.ai (the "Inkingi Home" canvas).
Each file has HTML markup with `{{holes}}`, `<sc-if>` / `<sc-for>` blocks and a small script
(`class Component extends DCLogic`) that holds the state.

## How we make changes

1. Design the change (in the Inkingi Home canvas with Claude, or by editing `design/*.dc.html`).
2. Commit with the version and what changed, for example `v17: inline filters on People`.
3. Push to `main`. Vercel updates the live link in about a minute.

For a bigger idea, use a branch: Vercel gives every branch its own preview link, so the team can compare it with `main` before merging.

## Not the real app

This repo is for design only. The real code lives in
`inkindi_construction_app`, `inkindi_construction_backend` and `inkindi_construction_admin_web`.
Prices shown as `RWF [price]` are placeholders.
