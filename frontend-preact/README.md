# Preact + esbuild

TodoMVC demo built with Preact and esbuild directly. Tailwind CSS is processed
by a custom esbuild plugin through PostCSS.

## Commands

```bash
npm install
npm run dev
```

Open <http://localhost:3000> while the development server is running.

Biome is included in the development loop:

```bash
npm run check          # lint and format check
npm run format         # format source files
npm run check:write    # apply safe Biome fixes
```

`npm run build` runs `npm run check` before creating production assets.

The demo supports adding todos, completing and deleting them, double-clicking
to edit, toggling all todos, URL-hash filters for all/active/completed, clear
completed, and local storage persistence.

For a production bundle:

```bash
npm run build
```

The bundled files are written to `public/assets/`.

The build also creates `dist/index.html`, a single self-contained HTML file
with the generated CSS and JavaScript inlined.
