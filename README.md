# termicolor

High contrast, bright, techy color system: one palette, generated into themes for editors,
terminals, prompts, browsers and code blocks. It's the palette behind [repraze.com](https://repraze.com).

Browse ports and the palette: **https://repraze.github.io/termicolor/**

## Layout

```
packages/
  palette/   seeds + derivation rules + roles + contrast checks  → dist/palette.{json,css}, shadcn.css
  build/     port API (definePort) and the build CLI
  site/      Vite + React + shadcn (base-lyra) catalog, deployed to GitHub Pages
ports/
  <id>/port.ts     one file per app: maps palette roles to the app's format
  <id>/dist/       generated output (committed, so files can be grabbed straight from GitHub)
  <id>/README.md   generated install notes
  registry.json    generated list of available + planned ports (feeds the site)
```

## How the palette works

- **Dark accents are hand-tuned seeds** (`packages/palette/src/seeds.ts`). Everything else is derived:
    - dark brights: same hue/chroma, lighter in OKLCH
    - light accents: same hue (yellow/orange nudged warmer), darkened until 4.8:1 on white
    - `on` colors: text for solid accent fills (white, or a deep tint of the same hue)
- **Roles** (`bg`, `bgSunken`, `fg`, `fgSoft`, `selection`, `added`, …) are what ports use, so a port never
  hardcodes a hex value.
- **Contrast guarantees** are checked on every build and in CI; the build fails if one regresses.

## Commands

```sh
npm install
npm run build:ports   # palette checks → packages/palette/dist + ports/*/dist + registry
npm run dev           # site at http://localhost:5173/termicolor/
npm run build         # ports + site
npm test && npm run typecheck && npm run lint
```

## Adding a port

1. Create `ports/<id>/port.ts` exporting `definePort({id, name, category, description, install, build})`.
2. `build(palette)` returns `[{path, contents}]` for both modes, built from `palette.modes.dark|light.roles/ansi/syntax`.
3. Remove the entry from `packages/build/src/planned.ts` if it was planned.
4. `npm run build:ports` and commit the generated `dist/`.

See [PLAN.md](PLAN.md) for the roadmap.
