# todo-css

A small todo app built with plain HTML, CSS and JavaScript — no frameworks, no bundler, no build step.

## Run it

Open `index.html` directly in a browser, or serve the folder locally:

```sh
cd todo-css
python3 -m http.server 3000
```

Then visit <http://localhost:3000>.

## Features

- **Add** a todo by typing in the input and pressing Enter or clicking *Add*.
- **Toggle complete** with the round checkbox on the left.
- **Delete** a single todo with the `×` button.
- **Filter** between *All*, *Active* and *Done*.
- **Items-left count** showing how many todos are still active.
- **Clear done** removes every completed todo at once.
- **Persistence** — todos and the selected filter are saved to `localStorage` and restored on reload.
- **Responsive** layout that adapts down to small phone widths, with a dark-mode variant via `prefers-color-scheme`.

## Files

| File         | Purpose                                        |
| ------------ | ---------------------------------------------- |
| `index.html` | Markup and structure.                          |
| `styles.css` | Hand-written CSS (layout, states, responsive). |
| `app.js`     | State, rendering, events and `localStorage`.   |

## Notes

- Storage keys: `todo-css.items.v1` (todos) and `todo-css.filter.v1` (active filter).
- Rendered todo text is inserted with `textContent`, so user input is escaped and safe.
- Multiple tabs stay in sync through the `storage` event.
