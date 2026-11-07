# Termicolor plan

The goal: a color system in the spirit of Catppuccin (one palette, ported everywhere) that stays
**high contrast, bright and techy**, and that fixes Catppuccin's main pain point: the palette is
hard to connect to all the repos that use it.

Status (2026-11-05, end of day): Phase 0 decided, Phase 1 done. Monorepo lives in
`repraze/termicolor` (npm workspaces). Palette derivation, the build CLI, 5 ports (VS Code, Shiki/Monaco,
Windows Terminal, Starship, Chrome/Edge) and the catalog site are in place. See "Decisions" in section 7.

---

## 1. Lessons from Catppuccin

How they do it:

- `catppuccin/palette`: the colors as an npm/JSON package.
- `catppuccin/whiskers`: a template CLI (Tera templates). Each port repo has a `.tera` template and
  re-renders it when the palette changes.
- `catppuccin/catppuccin/resources/ports.yml` is a registry of every port (67 KB of YAML). It
  generates the README tables and the website.
- About 370 separate repos (one per app). Each one has its own CI, its own Renovate bumps and its own
  maintainers.

What breaks down, and what we fix:

| Catppuccin problem                                                            | Termicolor answer                                                               |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| A palette change needs a PR in hundreds of repos                              | One monorepo builds every port from one palette in one commit                   |
| Templates are untyped text (Tera), so renaming a color breaks things silently | Ports are TypeScript functions `(palette) => files`, so renames are type errors |
| 4 flavors × 14 accents = combinatorial outputs                                | 2 modes (dark/light). Accent variants only where the app supports them cheaply  |
| Pastel, low-contrast by design                                                | Contrast targets are enforced in CI (see 2.4)                                   |

Most-starred Catppuccin repos (2026-11), used to rank coverage in section 5:
nvim 7.7k · tmux 3.2k · vscode 2.3k · discord 1.5k · userstyles 1.1k · kde 1.1k · vscode-icons 1.0k ·
iterm 963 · windows-terminal 952 · gtk 945 · qbittorrent 929 · zed 927 · kitty 899 · alacritty 790 ·
nix 775 · cursors 761 · firefox 752 · palette 750 · obsidian 651 · grub 647 · spicetify 604 ·
ghostty 597 · waybar 579 · jetbrains 577 · tailwindcss 535 · sddm 528 · home-assistant 517 ·
bat 516 · emacs 475 · starship 473 · dark-reader 466 · rofi 451 · fish 450 · btop 439 ·
gitea 427 · hyprland 424 · zen-browser 389 · vim 374 · wezterm 369 · … · fzf 312 · chrome 310 ·
zsh-syntax-highlighting 281 · github 276.

---

## 2. The color system

### 2.1 Layers

1. **Primitives**: the raw hex values per mode.
    - Accents (8): `red orange yellow green cyan blue purple pink`.
    - Brights (6, needed for ANSI 9–14): `brightRed brightGreen brightYellow brightBlue brightPurple brightCyan`.
      Brights keep the same hue in OKLCH with higher lightness and the same chroma, so they stay vivid
      instead of going pastel.
    - `on<Accent>`: the readable text color to put on a solid accent fill. The site already has these
      as `--tone-*-foreground`.
    - Neutral ramp: pure grey with no tint. That's part of the "techy" look and is what the site uses
      (Tailwind neutral). Named steps instead of Catppuccin's crust/mantle/base/surface/overlay:
      `n0 … n12`, with n0 being the deepest background, plus the role aliases below.
2. **Roles** (what ports should use, never raw neutrals):
    - Surfaces: `bg` (editor/terminal), `bgSunken` (chrome around the editor: tab row, sidebar,
      status bar), `bgRaised` (inputs, popovers, cards), `bgHover`.
    - Lines: `border`, `borderStrong`, `guide` (indent guides, rulers), `guideActive`.
    - Text: `fg`, `fgSoft` (comments, secondary), `fgMuted` (line numbers, placeholders), `fgDisabled`.
    - Interaction: `accent` (default `purple`, swappable like the site's `--primary`), `onAccent`, `cursor`,
      `selection` (accent at alpha), `selectionInactive`, `findMatch` (orange), `focusRing`.
    - Status: `danger`=red, `warning`=yellow, `success`=green, `info`=blue, `hint`=cyan.
    - Diff/VCS: `added`=green, `removed`=red, `modified`=blue (gutter) / yellow (file list), `renamed`=cyan,
      `conflict`=orange, `ignored`=fgMuted.
    - ANSI 16: `black red green yellow blue magenta cyan white` + brights. magenta = purple.
      black/white are neutrals chosen to stay visible on `bg`.
    - Syntax: `keyword`=purple, `function`=blue, `type`=yellow, `string`=green, `number`/`regex`=orange,
      `constant`=green, `comment`=fgSoft italic, `tag`=purple, `punctuation`=fgSoft. These come from
      the current site theme, so they match what repraze.com renders.
    - Alpha tints: `accentSubtle` (≈20%), `accentMuted` (≈33%), and the same for each accent where a
      port needs translucent fills (diff line backgrounds, find matches).
3. **Port mappings**: each port maps roles to the app's keys (VS Code `editor.background`, WT
   `selectionBackground`, Chrome `frame`, …).

### 2.2 Modes

- `dark`: background `#171717`, text `#fafafa`, accents as on the site.
- `light`: background `#ffffff`, text `#0a0a0a`, darker accents for contrast on white.
- Open question: light-mode ANSI brights. Currently they're the dark accents, which have poor
  contrast on white. Decide whether light "bright" means lighter (conventional) or more saturated.
- Later: `darkHighContrast` / `lightHighContrast` were stubbed in the original `palette.ts`. Keep
  the schema ready for them, but don't build them yet.

### 2.3 Source format

- One source file, `palette/src/palette.ts`. Everything else is derived from it and checked in under
  `dist/` so non-JS consumers can grab plain files.
- Derived artifacts: `palette.json`, `palette.css` (CSS vars, same names as the site's `--tone-*`
  tokens), `palette.scss`, a Tailwind v4 `@theme` file, and `palette.ts` types.
- Each color carries `hex`, `rgb`, `hsl` and `oklch`, as the current `ColorValue` does plus oklch.

### 2.4 Validation (CI, every commit)

- WCAG ratio (and APCA, report only) for the important pairs, in both modes:
    - `fg` on `bg` ≥ 15:1
    - each accent on `bg` ≥ 4.5:1 (dark mode is at 5.6+ now)
    - `fgSoft` on `bg` ≥ 7:1
    - `fgMuted` ≥ 3.5:1
    - `on<Accent>` on its accent ≥ 4.5:1
    - ANSI colors on `bg` ≥ 3:1, including `black`
- Hue spacing: no two accents within ΔE(OKLab) < X, so red/pink and cyan/green stay distinguishable.
- Snapshot tests of every port's output, so palette changes show up as reviewable diffs.
- A color-blindness simulation report as a generated page (not a gate).

---

## 3. Repo strategy: hybrid monorepo

**Recommendation: one monorepo `termicolor/termicolor` as the only place anyone edits anything,
plus auto-published outputs.**

```
termicolor/termicolor
├── packages/
│   ├── palette/          # source of truth + derived json/css/scss/tailwind → npm @repraze/termicolor
│   ├── core/             # build CLI, Port interface, color math (oklch, contrast), validators
│   └── wallpapers/       # generator (see 6)
├── ports/
│   ├── vscode/           # build.ts → themes/*.json, package.json → Marketplace + Open VSX
│   ├── shiki/            # re-exports the vscode TextMate themes → npm @termicolor/shiki
│   ├── windows-terminal/
│   ├── starship/
│   ├── chrome/
│   └── …                 # one folder per app: build.ts, README (install), dist/ (generated, committed)
├── ports.yml             # registry: name, category, status, install link → README table + site
└── .github/workflows/    # build-all, verify dist up to date, release, mirror
```

Why not many repos: that's the Catppuccin failure mode you described. Why not a pure monorepo:
some ecosystems install straight from a repo root, for example:

- Neovim plugin managers (`termicolor/nvim`)
- tmux TPM
- Obsidian community themes (they want `theme.css` + `manifest.json` at the root)
- BetterDiscord/Vencord theme links
- Zed and JetBrains extension registries in some cases

For those, CI **mirrors** `ports/<name>/dist` into a read-only repo `termicolor/<name>`. The mirror
repos get no issues and no PRs, and their README points back to the monorepo. The palette and every
port can't drift, because only the monorepo is ever edited.

How consumers stay connected:

- **JS/web apps** (repraze-apps, future projects): depend on `@repraze/termicolor` (CSS vars + TS),
  plus Renovate/Dependabot for bumps. This replaces the hex values copied into `globals.css` and
  `code-themes.ts`.
- **Code highlighting**: `@termicolor/shiki` themes. repraze.com and Monaco import them instead of
  `code-themes.ts`.
- **Apps**: install from the marketplace/store or the mirror repo. Versions are released together.
- **Your machine**: a `termicolor apply` command (optional, phase 4) that writes the local configs
  (WT `settings.json`, starship palette, VS Code setting), like the manual setup I did today.

Versioning: one version for everything (changesets or a single semver tag). A palette change is a
minor version, a renamed role is a major.

---

## 4. Tooling choices

- TypeScript on Node 22+. You already use it, and `node --experimental-strip-types` worked here.
  Build with `tsx`.
- A port is `export default definePort({ name, build(palette, mode) { return {"path": contents} } })`.
  Text formats with a lot of fixed boilerplate (tmux conf, nvim lua) may use template literals
  inside `build`, not an external template language.
- Color math: `culori` (oklch, contrast, gamut mapping), so we don't hand-roll it.
- Images: SVG generation → PNG via `@resvg/resvg-js` (no native deps, deterministic). If raster
  noise/grain needs it: `@napi-rs/canvas`.
- Preview site: static page generated from `ports.yml` + palette, with swatches, contrast tables and
  screenshots. Could live at `termicolor.github.io` or under repraze.com later, once branding is
  decided.

---

## 5. Coverage, ranked

**Tier 0: what you asked for (do first)**

| Port               | Notes                                                                                                                                                                                                                                                                                              |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| vscode             | Done locally. Move into `ports/vscode`, fix the generator into the build, publish under a `termicolor` publisher on the Marketplace + Open VSX. Later: accent setting (Catppuccin does accents via extension settings).                                                                            |
| shiki / monaco     | The VS Code theme JSON _is_ a TextMate theme, so shiki and Monaco (`shikiToMonaco`) use the same file. Then migrate repraze.com off `code-themes.ts`.                                                                                                                                              |
| windows-terminal   | Done locally. Generate `scheme` + `theme` JSON fragments plus an install doc. A WT JSON fragment extension can auto-install schemes.                                                                                                                                                               |
| starship           | Done locally. Ship the palette block + the powerline preset as a full `starship.toml`.                                                                                                                                                                                                             |
| chrome             | A theme is an extension with a `manifest.json` `theme` key (frame, toolbar, tab text, NTP background as RGB arrays, optional NTP image from the wallpaper generator). Load unpacked locally right away. The Chrome Web Store needs a one-time $5 developer account. Edge accepts the same package. |
| wallpapers         | See section 6.                                                                                                                                                                                                                                                                                     |
| web (css/tailwind) | `@repraze/termicolor` CSS vars + Tailwind `@theme`. Then migrate repraze-apps.                                                                                                                                                                                                                     |

**Tier 1: high stars and nearly free once ANSI exists** (one batch, mostly one file each)
kitty, alacritty, ghostty, wezterm, iterm, gnome-terminal, warp, fzf, bat (`.tmTheme`, converted from
the vscode theme, which also covers git-delta), lazygit, btop, zsh-syntax-highlighting, dircolors/eza
(`LS_COLORS`), PowerShell PSReadLine colors, Windows Terminal + **Windows `.theme` pack** (wallpapers +
accent color in one double-click install).

**Tier 2: high stars, moderate work**
nvim (7.7k, the biggest; a Lua colorscheme with highlight groups, plus vim), tmux (3.2k), zed,
jetbrains, firefox, obsidian, discord (Vencord/BetterDiscord CSS), dark-reader (preset), userstyles
(GitHub etc., large surface; start with GitHub only), spicetify, telegram, nilesoft-shell (Windows context menu).

**Tier 3: skip unless asked**
Linux desktop stack (kde, gtk, hyprland, waybar, rofi, sddm, grub, cursors), vscode-icons (an
icon set is a design project, not a color mapping), qbittorrent, home-assistant, gitea, minecraft.

---

## 6. Wallpapers

Your folder `Pictures/wallpapers/catppuccin mocha` has 333 files (414 MB). It's orangc's "walls,
catppuccin-mocha edition": third-party art recolored with **lutgen** (it maps any image onto a
palette with a generated LUT). Two separate tracks follow from that:

**6a. Recolor (personal, not redistributed)**

- `termicolor recolor <dir>` wraps lutgen with the termicolor palette (lutgen accepts custom
  palettes) and writes `wallpapers/termicolor dark/` locally. This is quick to build and gives you
  the whole collection in termicolor immediately.
- Can't be published: the art isn't ours. Outputs are gitignored.
- To check: the techy palette is high-chroma on pure grey, so the LUT may need a "preserve
  luminance" setting or a reduced accent set so photos don't look posterized (see `panes.jpg` for
  how the mocha version flattens).

**6b. Generated (ours, publishable, the brand asset)**

- Deterministic generators: `seed + palette + mode + size → PNG`.
- Sizes: 1920×1080, 2560×1440, 3840×2160, 3440×1440 ultrawide, 5120×1440 super-ultrawide, phone
  1179×2556.
- Each generator has knobs (accent subset, density, grain). Seed lists live in a catalog so favorites
  are reproducible.
- Generator families to log/build, roughly in order:
    1. **Gradients**: OKLCH linear/radial/conic, mesh gradients (4–6 accent points over neutral),
       aurora bands, with grain/dither to stop banding on 8-bit displays.
    2. **Grids and dots**: blueprint grid, dot matrix, isometric grid, perspective "synthwave" floor
       grid fading to `bg`.
    3. **Circuit / PCB traces**: orthogonal routed lines with vias in accents on near-black. The most "techy".
    4. **Topographic contours**: noise field → marching squares iso-lines, with accent gradient by elevation.
    5. **Flow fields**: particle trails on Perlin/curl noise.
    6. **Geometric**: hex tiling, triangulation (Delaunay/low-poly), Truchet tiles, concentric rings.
    7. **Terminal motifs**: ASCII/character rain, scanlines + CRT glow, glitch slices (a nod to `panes.jpg`).
    8. **Waves / stripes**: sine stacks, the 8 accents as horizontal spectrum bars (the logo candidate).
    9. **Space**: starfield + nebula noise in accent hues.
- Outputs are **not committed to git** (the README in your folder warns about exactly this). They're
  rendered in CI and attached to GitHub Releases, with a gallery page that shows thumbnails and seeds.
- A small "log": `packages/wallpapers/CATALOG.md` lists each generator, its parameters, and the seeds
  we keep. One task in phase 2 is to sort the 333 local walls into style buckets (landscape,
  pixel-art, space, abstract, minimal, city, …) to pick which generated families are worth building.

---

## 7. Execution plan (phased, parallelizable)

Legend: 🔒 = needs your decision, ⇉ = can fan out to parallel subagents (each in its own git
worktree, owning one folder, so there are no merge conflicts).

### Phase 0: decisions ✅

1. **Monorepo under `repraze/termicolor`** for now. Move to the `termicolor` org later if it gets serious
   (a GitHub transfer keeps history and redirects). No mirror repos until a port needs root install.
2. **No accent variants.** Purple is the default accent wherever an app needs one (cursor, selection,
   buttons). `DEFAULT_ACCENT` in `seeds.ts` is the single switch.
3. **Light mode = same hue, darker**, plus a paired foreground, like repraze.com's tone tokens but
   computed: every light accent is darkened in OKLCH to 4.8:1 on white (yellow/orange nudged warmer
   so they don't go olive). Every accent has an `on` color for text on solid fills.
4. Light ANSI brights are lighter than the light accents (the convention). Revisit if they feel weak.
5. Accounts (npm org, Marketplace publisher, Chrome Web Store) are deferred until publishing.

### Phase 1: foundation ✅

- npm workspaces (matches repraze-apps), eslint/prettier copied from repraze-apps, TS 6.
- `packages/palette`: seeds → derived modes → roles/ansi/syntax, contrast checks, `node:test` tests;
  generates `dist/palette.json`, `palette.css` (`--tc-*` vars, light on `:root`, dark on `.dark`),
  `shadcn.css` (shadcn tokens + repraze.com `--tone-*` tokens mapped onto the palette).
- `packages/build`: `definePort`, the CLI (`npm run build:ports [id]`), generated port READMEs,
  `ports/registry.json` (available + planned, consumed by the site).
- `packages/site`: Vite + React + Tailwind v4 + shadcn `base-lyra` (Base UI, square), Mantine hooks,
  TanStack Query (registry + file fetches), Virtual (port list), Router (file routes, search params in URL).
  Pages: port search with filters, port detail with install notes and a file viewer, palette with contrast tables.
- CI (`.github/workflows/ci.yml`): lint, format, tests, typecheck, generated-files-up-to-date.
  Pages (`.github/workflows/pages.yml`): builds and deploys the site on push to `main`.

Not done yet from the original phase 1: CSS `@theme` for Tailwind consumers (the site maps it by hand),
SCSS output, ΔE hue-spacing check, snapshot tests per port (the committed `dist/` + CI diff covers most of it).

### Phase 2: ports ⇉ (parallel, up to ~6 agents at a time)

Each agent gets the palette API, one port folder, the target app's official schema/docs, and the
definition of done: `ports/<id>/port.ts` with install notes, generated `dist/`, the planned entry
removed from `packages/build/src/planned.ts`, a screenshot if possible.

- A. ~~vscode + shiki + monaco~~ ✅ · bat/tmTheme
- B. terminals: ~~windows-terminal, starship~~ ✅ · kitty, alacritty, ghostty, wezterm, iterm, PSReadLine, LS_COLORS
- C. ~~chrome (+ Edge)~~ ✅ · NTP image hook from wallpapers
- D. wallpapers: 6b generator families 1–3 first + gallery, and 6a recolor wrapper
- E. web: `@repraze/termicolor` CSS/Tailwind + a PR migrating repraze-apps (`globals.css`, `code-themes.ts`)
- F. CLI tools: fzf, lazygit, btop, zsh-syntax-highlighting, delta
- Later batch G: nvim + vim, tmux, zed, jetbrains, obsidian, discord, firefox, dark-reader

### Phase 3: integration and release (serial)

- CI: build all → fail if `dist/` is stale → contrast gate → release (changesets) → publish npm,
  VS Code Marketplace/Open VSX, attach wallpapers to the Release → mirror the root-install repos.
- Your machine: `termicolor apply` (writes local WT/starship/VS Code configs; backs up first).

### Phase 4: branding (later, once coverage is broad)

Name/logo/site, accent story, high-contrast variants.

---

## 8. Already done / carry-over

- The VS Code extension is installed locally from a VSIX as `repraze.termicolor` (not published anywhere). When the official one ships,
  uninstall it and install `termicolor.termicolor`.
- The repraze.com code theme maps `markup.inserted` → orange and `markup.deleted` → green, which is
  swapped. The VS Code port fixes it. Fix the site as part of task E.
- Backups of the original WT/VS Code/starship configs: `~/repraze-backups/termicolor-20261105-225800/`.
