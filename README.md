# Todo App

A clean, responsive todo app built with **Vite**, **vanilla JavaScript**, and
**Tailwind CSS**.

## Features

- Add todos
- Toggle complete / active
- Delete individual todos
- Filter by **All / Active / Completed**
- Live "items left" count
- Clear completed
- Persists to `localStorage`
- Responsive, keyboard-accessible UI

## Requirements

- [Node.js](https://nodejs.org/) 18+ (built and tested with Node 24)

## Getting started

```bash
npm install
npm run dev
```

Then open the printed URL (defaults to <http://localhost:3000>).

## Scripts

| Command           | Description                          |
| ----------------- | ------------------------------------ |
| `npm run dev`     | Start the dev server with HMR        |
| `npm run build`   | Build for production into `dist/`    |
| `npm run preview` | Preview the production build locally |

## Tailwind CSS

Styling is done with [Tailwind CSS](https://tailwindcss.com/) v3, wired into
Vite through the standard PostCSS pipeline:

- `tailwindcss`, `postcss`, and `autoprefixer` are dev dependencies.
- `postcss.config.js` registers the `tailwindcss` and `autoprefixer` plugins,
  so importing `src/style.css` runs everything through PostCSS/Vite.
- `src/style.css` starts with the three `@tailwind` directives and keeps only a
  tiny `@layer base` block for genuinely global styles (page background and
  focus outline). All component styling lives in Tailwind utility classes in
  `index.html` and the templates in `src/main.js`.
- `tailwind.config.js` scans `./index.html` and `./src/**/*.{js,html}` for class
  names and extends the theme with the app's color palette, card radius,
  shadow, and font stack.

## Project structure

```
.
├── index.html        # App shell
├── postcss.config.js # Tailwind + autoprefixer PostCSS setup
├── tailwind.config.js# Tailwind content globs and theme
├── vite.config.js    # Vite config (dev server on 0.0.0.0:3000)
├── src
│   ├── main.js       # App logic, state and rendering
│   └── style.css     # Tailwind directives + global base styles
└── package.json
```

## Notes

- Todos are stored under the `todo-app.items.v1` key in `localStorage`.
- `node_modules/` and `dist/` are git-ignored.
