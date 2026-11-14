# Todo

A tiny, dependency-free todo app: static HTML, vanilla JS, and Tailwind CSS with
class-based dark mode.

## Features

- Add todos (input capped at 200 characters, blank input rejected).
- Toggle complete, delete individual todos, filter by All / Active / Done.
- Live "N item(s) left" counter and a Clear completed button (disabled when
  nothing is done).
- Context-aware empty states (different copy per filter).
- Class-based dark mode with a header toggle. The moon/sun icons are driven
  purely by CSS (`dark:hidden` / `hidden dark:block`), so there is never a wrong
  icon flash. The toggle's `aria-pressed` reflects dark mode.
- No flash of light theme: an inline `<head>` script applies the `dark` class to
  `<html>` before first paint.
- Todos persist in `localStorage` under `todo-items`; theme persists under
  `todo-theme`.
- State is sanitized on load: bad JSON, non-array data, non-string or
  whitespace-only entries are dropped, text is trimmed and capped at 200
  characters (by code point, so an emoji is never split), `done` is only kept
  when it is literal `true`, and ids are kept unique (duplicate/missing ids are
  replaced). Repeated texts are **kept** — adding "Buy milk" twice stores two
  rows.
- Accessible by keyboard: checkboxes are buttons with a 24x24 hit area, delete
  buttons are always visible on touch and appear on hover/focus on larger
  screens, and focus is managed after every render: toggling or deleting under a
  filter moves focus to the row that now occupies that spot (or the previous row,
  or the input), and `storage`-driven re-renders restore focus to the same
  control.
- Multi-tab sync via the `storage` event (writes from other storage areas such
  as `sessionStorage` are ignored).

## Run

Any static file server works. For example:

```sh
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

## Files

- `index.html` — markup, Tailwind config, and the pre-paint theme script.
- `app.js` — state, rendering, persistence, theme and focus management.
- `README.md` — this file.

## Notes

- **Tailwind CDN is demo/prototyping-only.** The app loads
  `https://cdn.tailwindcss.com`, which is explicitly not intended for
  production use. For production, install Tailwind and build a static CSS file.
- **Theme follows the system until you choose.** On first visit the app uses
  `prefers-color-scheme`. Once you click the theme toggle, your explicit choice
  is kept in memory (so the toggle keeps working even when storage is blocked)
  and also stored in `localStorage` (`todo-theme`) when that is available, so it
  survives reloads. Without storage the choice lasts for the current page
  lifetime and never throws.
- **Contrast:** done-todo text uses slate-600 / dark slate-400 and the unchecked
  checkbox border and delete icon use slate-500/600 (brightened in dark mode) to
  meet WCAG AA non-text and text contrast.
