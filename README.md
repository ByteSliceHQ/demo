Todos!
======

A small, **fun** todo app: plain `index.html` + vanilla JS, styled with
hand-written CSS (`styles.css`). No build step, no runtime dependencies — just
open it and go. 🍭

Features
--------

- Add a todo via the form (with friendly inline validation + a wiggle)
- Toggle complete / delete a todo
- Filter: All / Active / Done
- "items left" counter
- Clear done
- Persists to `localStorage` (and syncs across tabs)
- Juice: bouncy hover/active transforms, pop + strikethrough on check-off,
  confetti bursts on completion and a little party when **all** items are done
- Responsive, accessible: focus-visible rings, ARIA labels / `aria-pressed` /
  `aria-live` regions, a skip link, and `prefers-reduced-motion` respected
  (all animations are disabled when reduced motion is requested)

Files
-----

| File         | Purpose                                   |
| ------------ | ----------------------------------------- |
| `index.html` | Markup / structure                        |
| `styles.css` | Hand-written styles (no build step)       |
| `app.js`     | Application logic                         |

Usage
-----

Just open `index.html` in a browser.

Serve locally (optional):

```sh
npm run serve      # python3 -m http.server 3000 --bind 0.0.0.0
```

Theming
-------

Design tokens live at the top of `styles.css` in the `:root` block as CSS
custom properties (e.g. `--candy-pink`, `--grape`, `--radius-xl`,
`--pop-shadow`). Change them there and the whole app re-themes — no rebuild.
