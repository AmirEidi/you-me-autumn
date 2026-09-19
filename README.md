# Interactive Date Invitation Website

A romantic Persian RTL interactive story website built with React + Vite.

## Run locally

```bash
npm install
npm run dev -- --host 0.0.0.0
```

Then open:

```text
http://localhost:5173
```

## Build for production

```bash
npm run build
```

## Deploy to GitHub Pages

1. Push this project to GitHub.
2. Open repository Settings > Pages.
3. Publish the static site from the generated `dist` output or connect a GitHub Pages workflow.
4. This Vite project uses `base: './'` so it works with static hosting and repository paths.

## Replace the media

Put these files into `public/media/`:

- `cat.gif`
- `movie.gif`
- `cinnamon-girl.mp3`

If a file is missing, the app automatically shows a graceful fallback instead of breaking the experience.

## Change the story text

Edit the content in `src/App.tsx`.

## Change colors and styling

Update:

- `src/index.css`
- `src/App.css`
