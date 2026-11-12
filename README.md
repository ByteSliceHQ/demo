# Todo App

A tiny todo app built with plain HTML/JS and styled with Tailwind CSS.

Features:

- Add tasks
- Toggle complete
- Delete individual tasks ("×") or clear all completed ("Clear done")
- Filter: All / Active / Done
- Persists to `localStorage`

## Files

- `index.html` — markup
- `app.js` — app logic (state, rendering, localStorage)
- `src/input.css` — Tailwind input
- `dist/output.css` — compiled Tailwind output (generated)
- `server.js` — dependency-free static file server
- `tailwind.config.js` — Tailwind config

## Setup

Install dev dependencies:

```bash
npm install
```

Build the CSS:

```bash
npm run build
```

(Run `npm run watch` while developing to rebuild on change.)

## Run

```bash
npm start
```

Then open <http://localhost:3001>.

The server listens on `0.0.0.0:3001` by default; override the port with the
`PORT` environment variable.

## Notes

- `dist/output.css` is committed to the repo so the app works without a build
  step. Re-run `npm run build` after editing templates/markup or `src/input.css`.
- `node_modules/` is ignored via `.gitignore`.
