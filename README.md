# Todo — plain HTML, CSS & JS

A tiny todo app built with **plain HTML**, **raw handwritten CSS** (no frameworks, no CSS
libraries) and **vanilla JavaScript** (no build step). Todos persist in `localStorage`.

## Features

- Add a todo
- Toggle a todo complete / active (click the checkbox or the title)
- Delete a todo
- Filter by **All / Active / Done**
- Clear all completed todos
- Persist todos across reloads via `localStorage`
- Live count of active and total todos

## Files

| File         | Purpose                                                    |
| ------------ | ---------------------------------------------------------- |
| `index.html` | Markup / structure                                         |
| `style.css`  | Handwritten CSS                                            |
| `app.js`     | App logic: add, toggle, delete, filter, persist            |
| `server.js`  | Tiny zero-dependency Node static file server               |
| `README.md`  | This file                                                  |

## Run it

Requires Node.js (any recent version). No dependencies, no install needed.

```bash
node server.js
```

Then open <http://localhost:3000/>.

The server listens on `0.0.0.0:3000`. Set a different port with the `PORT`
environment variable:

```bash
PORT=8080 node server.js
```

### Run in the background

```bash
nohup node server.js &
curl -I http://localhost:3000   # -> HTTP/1.1 200 OK
```

## Notes

You can also open `index.html` directly in a browser; the server is only needed
to serve the folder over HTTP.
