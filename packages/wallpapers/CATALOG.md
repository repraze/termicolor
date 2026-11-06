# Wallpaper catalog

The log of generators and the seeds we keep (PLAN.md section 6b). Abstract only: gradients, lines and patterns,
nothing that reads as a scene or an object. Every wallpaper is a pure function of
`generator + seed + params + palette + mode + size` → SVG, so any entry can be re-rendered exactly.
The kept entries live in [`src/catalog.ts`](src/catalog.ts). `ports/wallpapers` renders each one in dark and
light, in landscape `1920x1080`, `2560x1440`, `3840x2160` and in portrait `1080x1920`, `1440x2560`, `2160x3840`.
A test checks that this file mentions every generator and every kept id.

```ts
import {renderWallpaper, SIZES} from "@termicolor/wallpapers";
import {palette} from "@termicolor/palette";

const svg = renderWallpaper({generator: "flow", seed: 2}, {palette, mode: "dark", size: SIZES.uhd});
```

## How sizes work

Generators draw in a design space whose short side is 1440 (2560×1440 landscape, 1440×2560 portrait); the
SVG `viewBox` scales it to the requested pixels. So 1080p, QHD and 4K of one orientation are the same drawing
with a different header, and portrait is its own layout: generators place things by aspect ratio (waves run
along the long axis, bands step along it, glows and seeds are placed relative to the frame). Any other size
works too (`SIZES.ultrawide`, `SIZES.phone`); it just isn't in the committed output.

## Shared parameters

| Param     | Range        | Effect                                                                      |
| --------- | ------------ | --------------------------------------------------------------------------- |
| `accents` | accent names | Colors to draw with, most prominent first. Purple leads by default.         |
| `density` | 0-1          | How busy the image is: pitch, line count, blob count, …                     |
| `grain`   | 0-1          | Film grain (`feTurbulence`, overlay blend). Breaks up banding on 8-bit LCD. |

The seed drives composition only; dark and light use the same layout. Dark draws on neutral 950 with the dark
accents (brights for highlights). Light draws on white, using the vivid brand seeds for big soft fills and the
darker light accents for lines.

## 1. Gradients

| Generator   | What it draws                                                                  | Default accents            |
| ----------- | ------------------------------------------------------------------------------ | -------------------------- |
| `linear`    | Diagonal OKLCH ramp across 2-3 accents, veiled into the base at one corner.    | purple, blue, cyan         |
| `radial`    | Large off-center elliptical glow plus a smaller counter-glow.                  | purple, pink, blue         |
| `conic`     | Conic fan from below the frame (96 wedges; SVG has no conic gradient).         | purple, pink, orange, blue |
| `mesh`      | 4-6 soft radial points on a jittered ring; screen blend on dark.               | purple, blue, pink, cyan   |
| `aurora`    | 3-5 wavy ribbons (sum of sines), blurred twice and screen-blended.             | purple, cyan, green, pink  |
| `noise`     | Low-frequency `feTurbulence` mapped onto a base → accent ramp. ~1 KB per file. | purple, blue, pink         |
| `posterize` | The same noise quantized into flat terraces, like a heat map.                  | purple, cyan, pink         |
| `bands`     | Stepped OKLCH ramp as tilted bars with hairline gaps, fading into the base.    | purple, blue, cyan, green  |

| Kept          | Params                                       |
| ------------- | -------------------------------------------- |
| `linear-3`    | defaults                                     |
| `linear-11`   | accents pink, purple, orange                 |
| `radial-2`    | defaults                                     |
| `radial-9`    | accents cyan, blue, purple                   |
| `conic-4`     | defaults                                     |
| `conic-12`    | accents purple, blue, cyan, green            |
| `mesh-1`      | defaults                                     |
| `mesh-6`      | accents purple, pink, orange, yellow         |
| `mesh-8`      | accents cyan, blue, purple, green; density 1 |
| `aurora-5`    | defaults                                     |
| `aurora-13`   | accents purple, pink, blue                   |
| `noise-2`     | defaults                                     |
| `noise-7`     | accents purple, pink, orange                 |
| `posterize-3` | defaults                                     |
| `bands-1`     | defaults                                     |
| `bands-6`     | accents pink, purple, blue, cyan             |

## 2. Lines and waves

| Generator  | What it draws                                                                               | Default accents          |
| ---------- | ------------------------------------------------------------------------------------------- | ------------------------ |
| `stripes`  | Tilted parallel stripes whose width swells and thins with a noise field (halftone lines).   | purple, pink, blue       |
| `moire`    | 2-3 overlapping sets of fine concentric rings; the interference makes the pattern.          | purple, cyan, pink       |
| `waves`    | Line stack along the long axis, displaced by ripples from 2-3 point sources (interference). | purple, blue, cyan       |
| `contours` | Marching-squares iso-lines of fractal noise; color climbs the ramp with elevation.          | purple, pink, orange     |
| `flow`     | Evenly spaced streamlines through a noise angle field, colored in diagonal bands.           | purple, cyan, blue, pink |
| `glitch`   | Gradient sliced into horizontal bands, some shifted sideways, RGB-split slivers, scanlines. | purple, pink, cyan       |

| Kept         | Params                               |
| ------------ | ------------------------------------ |
| `stripes-2`  | defaults                             |
| `stripes-9`  | accents cyan, blue, purple           |
| `moire-1`    | defaults                             |
| `moire-4`    | accents purple, orange, cyan         |
| `waves-3`    | defaults                             |
| `waves-8`    | accents pink, purple, orange         |
| `contours-1` | defaults                             |
| `contours-6` | accents purple, blue, cyan           |
| `flow-2`     | defaults                             |
| `flow-5`     | accents purple, pink, orange, yellow |
| `glitch-1`   | defaults                             |
| `glitch-4`   | accents purple, cyan, green          |

## 3. Patterns and grids

| Generator   | What it draws                                                                              | Default accents      |
| ----------- | ------------------------------------------------------------------------------------------ | -------------------- |
| `blueprint` | Minor/major grid (vignetted) with crosshairs, dashed frames and dimension ticks.           | purple, cyan, pink   |
| `dots`      | Even dot grid masking soft accent glows; dots outside the glows stay neutral.              | purple, pink, blue   |
| `halftone`  | Hex dot screen; size follows noise plus a soft focus. Runs of equal dots are dashed lines. | purple, pink, cyan   |
| `plaid`     | Crossing translucent accent bands and pinstripes over a fine diagonal twill.               | purple, blue, pink   |
| `truchet`   | Quarter-circle Truchet tiles with 3 parallel strands: endless winding paths.               | purple, cyan, blue   |
| `maze`      | 10 PRINT diagonals, one relative zigzag path per row.                                      | purple, pink, orange |
| `cells`     | Voronoi cells with dark gaps; some lit in accents (more near a focus), the rest tinted.    | purple, blue, pink   |
| `traces`    | Bundles of parallel lines on a grid with 45° bends, never crossing, dot ends; some lit.    | purple, cyan, pink   |

| Kept          | Params                       |
| ------------- | ---------------------------- |
| `blueprint-7` | defaults                     |
| `dots-4`      | defaults                     |
| `halftone-1`  | defaults                     |
| `halftone-5`  | accents purple, blue, cyan   |
| `plaid-3`     | defaults                     |
| `plaid-8`     | accents purple, cyan, green  |
| `truchet-2`   | defaults                     |
| `maze-1`      | defaults                     |
| `cells-4`     | defaults                     |
| `cells-9`     | accents purple, pink, orange |
| `traces-1`    | defaults                     |
| `traces-5`    | accents purple, green, cyan  |

## Size budget

40 kept (16 gradients, 12 lines, 12 patterns) × 2 modes × 6 sizes = 480 SVGs, about 4.95 MB in `ports/wallpapers/dist` (largest file ~34 KB). A test
fails if any file passes 48 KB or the set passes 5 MB. Dense generators use compact encodings: rounded
relative paths, RDP simplification, dashed runs for halftone dots, and `feTurbulence` filters instead of
geometry for the noise gradients.

## Retired

`synthwave` (sun, ridge, horizon), `isometric` (cubes) and the chip-and-pin `circuit` were dropped as too
representational; `traces` keeps the routing as pure line work.

## Not yet

- PNG rasterization (PLAN section 4 picks `@resvg/resvg-js`; not installed yet) and release attachments.
- More families: geometric (hex tiling, low-poly), ASCII/character rain, space/starfields.
- 6a: the `termicolor recolor` lutgen wrapper for personal, non-redistributed walls.
