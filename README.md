# leizhang-research.github.io

Personal academic website hosted on GitHub Pages.

## Pages

- `index.html` (Bio)
- `papers.html`
- `talks.html`
- `news.html`
- `experience.html`
- `projects.html`
- `teaching.html`

## Core files

- `assets/js/site-data.js`: all editable content (main file you update)
- `assets/js/site.js`: rendering logic (search, theme toggle, timelines, filters)
- `assets/css/site.css`: global styles (light/dark theme, timeline, components)

## Edit content (single source)

Update `assets/js/site-data.js` for:

- profile info
- social links
- CV path
- education / experience / projects / teaching
- papers / talks / news entries

### Avatar controls

In `profile`:

- `avatar`: image path, e.g. `assets/files/profile-1.png`
- `avatarFit`: `"contain"` or `"cover"`
- `avatarZoom`: zoom factor (e.g. `1.2`)
- `avatarPosition`: object-position, e.g. `"50% 50%"`
- `avatarOffsetX`, `avatarOffsetY`: direct pan offsets, e.g. `"-20px"`, `"10px"`

## Publications behavior

On `papers.html`:

- auto-sorted by year (newest first)
- filter chips: `All`, `Published`, `Preprint`, `Patents`
- badges shown from `kind`

Use these kinds in `assets/js/site-data.js`:

- `published`
- `preprint`
- `patent`

## Talks / News behavior

On `talks.html` and `news.html`:

- timeline layout by year
- recent 3 years shown by default
- older years collapsed under `Show older years`

## Search and theme

- top-right search opens site-wide search modal
- shortcut: `Cmd/Ctrl + K`
- top-right theme button toggles light/dark mode
- theme preference is stored in browser local storage

