# Interactive Date Invitation Website

A romantic Persian RTL interactive story website built with React + Vite.

## Run locally

```bash
npm install
npm run dev
```

Then open:

```text
http://localhost:5173/you-me-autumn/
```

The `/you-me-autumn/` path is required — it matches the GitHub Pages base path,
so local and deployed behave the same.

## Edit the story

The scene text lives in `src/story.json`. Edit it by hand, or use the built-in
scene editor:

```bash
npm run dev
```

```text
http://localhost:5173/you-me-autumn/?edit
```

The editor gives you:

- the scene list, with add / duplicate / delete / reorder
- fields for every scene: id, eyebrow, background, kind, lines, button text, media, music
- a live preview on the right that renders the **real** site component, so what
  you see is what ships
- **Save** (or `Ctrl+S`) writes straight back to `src/story.json` on your machine
- **Renumber** rewrites the `صحنه ۱`, `صحنه ۲`… labels to match the real order
- a warning if two scenes end up with the same `id`

Nothing is uploaded and nothing is deployed — saving only touches the local file.
Commit and push when you are happy with it.

The editor is dev-only. It is gated behind `import.meta.env.DEV`, so `?edit`
does nothing on the deployed site and none of the editor code ships in the
production bundle.

## Media

Media files live in `public/media/`. The repo currently ships:

- `cat.mp4`
- `movie.mp4`
- `Cinnamon Girl.mp3`

In `src/story.json`, reference them **relative to `public/`** — `media/cat.mp4`,
not `/media/cat.mp4`. The leading slash breaks on GitHub Pages, because the site
is served from a sub-path rather than the domain root. `src/story.ts` prefixes
every path with the Vite base at runtime.

To add a file, drop it into `public/media/` and it shows up in the editor's `src`
dropdown. If a file is missing at runtime, the app shows a graceful fallback
instead of breaking the experience.

## Build for production

```bash
npm run build
```

## Deploy

`.github/workflows/deploy.yml` builds `main` and publishes `dist/` to the
`gh-pages` branch on every push. No manual step:

```bash
git push origin main
```

Live at <https://amireidi.github.io/you-me-autumn/>.

`vite.config.ts` sets `base: '/you-me-autumn/'` to match that URL. If the site
ever moves to a custom domain at the root, change the base to `'/'`.

## Change colors and styling

Update:

- `src/index.css`
- `src/App.css`
- `src/editor/editor.css` (editor chrome only)
