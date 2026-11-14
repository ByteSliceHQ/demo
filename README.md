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
- Accent palette switcher next to the theme toggle: five round swatches (Slate,
  Emerald, Violet, Rose, Amber) in a labelled `role="group"`. Each swatch is a
  normal tabbable button with `aria-label` ("Emerald accent") and `aria-pressed`
  reflecting the current choice, plus a visible ring on the selected swatch.
  Clicking a swatch keeps focus on it (`render()` never rebuilds the swatches).
  The accent drives the Add button, the active filter button, the checked custom
  checkbox and their focus rings, and works in both light and dark mode.
- No flash of light theme: an inline `<head>` script applies the `dark` class to
  `<html>` before first paint.
- Todos persist in `localStorage` under `todo-items`; theme persists under
  `todo-theme`; accent persists under `todo-accent`.
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

- `index.html` — markup, Tailwind config, the accent CSS variables, and the
  pre-paint theme/accent script.
- `app.js` — state, rendering, persistence, theme/accent and focus management.
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
  meet WCAG AA non-text and text contrast. The accent foreground
  (`--accent-contrast`) is chosen per palette/per mode so the accent background
  reaches at least 4.5:1 against it: white on the light-mode palette colours
  (slate `#475569` 7.6:1, emerald `#047857` 5.5:1, violet `#6d28d9` 7.1:1, rose
  `#be123c` 6.3:1, amber `#92400e` 7.1:1) and a near-black colour on the lighter
  dark-mode accents (`#0f172a` on slate `#cbd5e1` 12.0:1, `#052e16` on emerald
  `#34d399` 7.8:1, `#2e1065` on violet `#a78bfa` 5.6:1, `#4c0519` on rose
  `#fb7185` 5.8:1, `#451a03` on amber `#fbbf24` 9.0:1). Focus rings
  (`--accent-ring`) are kept at 3:1 or better against their surrounding surface
  (5.3:1 or higher for every palette on the light white and dark
  slate-800/slate-900 surfaces; the checkbox ring also gets a 2px offset so it
  stays visible around the accent-filled box when checked). The
  picker swatch dots also use mode-aware colours (`--swatch-*`) so each dot
  reaches at least 3:1 against the card behind it in both light and dark mode.
- **Accent palette:** the swatch choice is stored in `localStorage` under
  `todo-accent` (default `slate`). Invalid or unknown stored values fall back to
  slate. Like the theme, the choice is also kept in memory while the page is
  open, so the switcher keeps working when storage is blocked and never throws.
  The accent is applied to `<html>` as `data-accent` before first paint (its own
  try/catch, so blocked storage cannot break the theme application), and the
  `storage` event syncs changes made in other tabs.
