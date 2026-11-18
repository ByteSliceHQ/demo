# todo-tailwind

A small todo app built with plain HTML and JavaScript, **styled with Tailwind CSS through a real build** (no CDN). Same features as the hand-written-CSS version, but every visual decision comes from Tailwind utility classes in the markup and in `app.js`.

## What it is

- Semantic markup: `header`, a `form` composer, filter controls, a `ul` todo list, an empty state and a `footer` with the items-left count and *Clear done*.
- No framework, no runtime dependency. `app.js` is a single strict-mode IIFE.
- Tailwind is compiled ahead of time; the compiled output is committed at `dist/styles.css`, so the page works with **no build step** when you just open it.

## Run it

Open `index.html` directly in a browser, or serve the folder:

```sh
cd todo-tailwind
python3 -m http.server 3000
```

Then visit <http://localhost:3000>.

## Rebuild the CSS

```sh
cd todo-tailwind
npm install
npm run build        # npx tailwindcss -i src/input.css -o dist/styles.css --minify
```

Use `npm run watch` while editing markup to rebuild on change. The build scans `index.html` and `app.js` (the todo rows and their utility classes are created in `app.js`, so it is part of the `content` globs in `tailwind.config.js`).

## Test

```sh
npm test             # node --check app.js && node tests/smoke.test.mjs
```

The smoke test boots `app.js` inside [jsdom](https://github.com/jsdom/jsdom) and covers add, toggle, delete, filtering, the items-left count, persistence, `storage`-event sync (including `localStorage.clear()` where `event.key === null`) and de-duplication of ids read from storage.

## Features

- **Add** a todo by typing in the input and pressing Enter or clicking *Add*.
- **Toggle complete** with the custom round checkbox.
- **Delete** a single todo with the `×` button.
- **Filter** between *All*, *Active* and *Done* (plain buttons with `aria-pressed`).
- **Items-left count** of remaining active todos, announced politely (`aria-live`).
- **Clear done** removes every completed todo at once and is disabled when none are done.
- **Persistence** — todos *and* the selected filter are saved to `localStorage` and restored on reload.
- **Cross-tab sync** through the `storage` event, including `localStorage.clear()` (`event.key === null`).
- **Dark mode** via the `dark:` variant, following the OS preference (`darkMode: "media"`).

## Accessibility

- Each todo's text element gets a unique `id`; its checkbox uses `aria-labelledby` pointing at that id, so the checkbox has a real accessible name.
- Each delete button has its own unique visually-hidden label (`Delete todo: …`).
- Filter controls are plain `<button>`s with `aria-pressed`.
- Focus is preserved across re-renders: toggling keeps focus on the same checkbox, deleting moves focus to the next item's checkbox (the previous one when deleting the last), and focus returns to the composer input when the list empties.
- Todo text is written with `textContent` (never `innerHTML`), and duplicate or missing ids loaded from storage are de-duplicated.

## Files

| File                   | Purpose                                                        |
| ---------------------- | -------------------------------------------------------------- |
| `index.html`           | Markup and structure, styled with Tailwind utilities.          |
| `app.js`               | State, rendering, events, persistence and Tailwind row classes.|
| `src/input.css`        | Tailwind entry: `@tailwind` directives + a few `@layer` rules. |
| `dist/styles.css`      | **Committed** compiled/minified Tailwind output.               |
| `tailwind.config.js`   | Content globs and dark-mode setting.                           |
| `package.json`         | Tailwind (and jsdom) as devDependencies + build/test scripts.  |
| `tests/smoke.test.mjs` | jsdom smoke test.                                              |

## Notes

- Storage keys: `todo-tailwind.items.v1` (todos) and `todo-tailwind.filter.v1` (active filter).
- `src/input.css` only contains the `@tailwind` directives plus a couple of `@layer components`/`@layer utilities` rules for the custom checkbox and the `.visually-hidden` helper — everything else is utilities in the markup.
- Built with `tailwindcss@3.4.19`.
