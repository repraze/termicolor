# Wallpaper catalog

The log of generators and the seeds we keep (PLAN.md section 6b). Abstract only: gradients, lines and patterns,
nothing that reads as a scene or an object. Every wallpaper is a pure function of
`generator + seed + params + palette + mode + size` → SVG, so any entry can be re-rendered exactly.
The kept entries live in [`src/catalog.ts`](src/catalog.ts). `ports/wallpapers` renders each one in dark and
light, in landscape `1920x1080`, `2560x1440`, `3840x2160` and in portrait `1080x1920`, `1440x2560`, `2160x3840`.

```ts
import {renderWallpaper, SIZES} from "@termicolor/wallpapers";
import {palette} from "@termicolor/palette";

const svg = renderWallpaper({generator: "flow", seed: 2}, {palette, mode: "dark", size: SIZES.uhd});
```

## Workflow

1. **Try seeds:** `npm run preview -w @termicolor/wallpapers -- --generator flow --seeds 1-30` renders contact
   sheets (dark/light × landscape/portrait) to `packages/wallpapers/.preview/` (gitignored). Each caption shows
   the seed, its harmony and its accents. Narrow with `--mode dark`, `--orientation portrait`, or try a color
   with `--lead red --harmony split`.
2. **Keep one:** add `entry("flow", 7)` to `CATALOG` in `src/catalog.ts`. Pin colors only if the seed's pick
   doesn't work: `params: {lead: "red"}`, `{harmony: "split"}` or a full `{accents: [...]}`.
3. **Check the set:** `npm run preview -w @termicolor/wallpapers` renders the whole kept catalog.
4. **Write it down:** `npm run catalog -w @termicolor/wallpapers` regenerates the table below; update the lead
   snapshot in `src/harmony.test.ts`.
5. **Build:** `npx tsx packages/build/src/cli.ts wallpapers`. Same template, same palette → byte-identical SVGs;
   tweak a palette color and rerun to see it everywhere.

## Colors: seeded harmonies

No accent leads by default. Each seed picks a **lead** (any of the 8 accents) and a **harmony** from the
generator's list below, on its own RNG stream (`<generator>:<seed>:color`), so re-coloring never moves shapes.
The accent wheel is the palette's hue order: red → orange → yellow → green → cyan → blue → purple → pink → red,
about 45° per step.

| Harmony         | Steps from the lead | Example (lead red)        | Feel                              |
| --------------- | ------------------- | ------------------------- | --------------------------------- |
| `mono`          | 0                   | red                       | one hue on neutral                |
| `analogous`     | 0, +1, −1           | red, orange, pink         | calm, cohesive                    |
| `sweep`         | 0, +1, +2           | red, orange, yellow       | a run along the wheel, good ramps |
| `complementary` | 0, +4               | red, cyan                 | maximum contrast                  |
| `split`         | 0, +3, +5           | red, blue, green          | contrast with less clash          |
| `tetrad`        | 0, +2, +4, +6       | red, yellow, cyan, purple | loudest, for busy patterns        |

Colors per mode: dark draws on neutral 950; big soft color uses the `fills` tier, lines the text tier,
highlights the brights. Light draws on white; fills are the vivid `fills` tier, and lines sit halfway between the
text tier and the fill (the text tier alone turns yellow and orange lines brown on white).

## Shared parameters

| Param     | Range        | Effect                                                                      |
| --------- | ------------ | --------------------------------------------------------------------------- |
| `density` | 0-1          | How busy the image is: pitch, line count, blob count, …                     |
| `grain`   | 0-1          | Film grain (`feTurbulence`, overlay blend). Breaks up banding on 8-bit LCD. |
| `lead`    | accent name  | Pin the lead; the harmony still comes from the seed.                        |
| `harmony` | harmony name | Pin the harmony; the lead still comes from the seed.                        |
| `accents` | accent names | Pin the exact accents, lead first. Overrides `lead` and `harmony`.          |

## How sizes work

Generators draw in a design space whose short side is 1440 (2560×1440 landscape, 1440×2560 portrait); the
SVG `viewBox` scales it to the requested pixels. So 1080p, QHD and 4K of one orientation are the same drawing
with a different header, and portrait is its own layout: generators place things by aspect ratio. Any other size
works too (`SIZES.ultrawide`, `SIZES.phone`); it just isn't in the committed output.

## Generators

| Generator   | Family    | What it draws                                                                               | Harmonies                               |
| ----------- | --------- | ------------------------------------------------------------------------------------------- | --------------------------------------- |
| `linear`    | gradients | Diagonal OKLCH ramp across 2-3 accents, veiled into the base at one corner.                 | analogous, sweep, complementary, split  |
| `radial`    | gradients | Large off-center elliptical glow plus a smaller counter-glow.                               | analogous, sweep, complementary, split  |
| `conic`     | gradients | Conic fan from below the frame (96 wedges; SVG has no conic gradient).                      | sweep, analogous, split, tetrad         |
| `mesh`      | gradients | 4-6 soft radial points on a jittered ring; screen blend on dark.                            | analogous, sweep, split, tetrad         |
| `aurora`    | gradients | 3-5 wavy ribbons (sum of sines), blurred twice and screen-blended.                          | analogous, sweep, split                 |
| `noise`     | gradients | Low-frequency `feTurbulence` mapped onto a base → accent ramp. ~1.5 KB per file.            | analogous, sweep, complementary, split  |
| `posterize` | gradients | The same noise quantized into flat terraces, like a heat map.                               | analogous, sweep, complementary, split  |
| `bands`     | gradients | Stepped OKLCH ramp as tilted bars with hairline gaps, fading into the base.                 | sweep, analogous, tetrad                |
| `stripes`   | lines     | Tilted parallel stripes whose width swells and thins with a noise field (halftone lines).   | mono, analogous, sweep, complementary   |
| `moire`     | lines     | 2-3 overlapping sets of fine concentric rings; the interference makes the pattern.          | complementary, split, analogous         |
| `waves`     | lines     | Line stack along the long axis, displaced by ripples from 2-3 point sources (interference). | analogous, sweep, complementary         |
| `contours`  | lines     | Marching-squares iso-lines of fractal noise; color climbs the ramp with elevation.          | sweep, analogous, split                 |
| `flow`      | lines     | Evenly spaced streamlines through a noise angle field, colored in diagonal bands.           | analogous, sweep, split, tetrad         |
| `glitch`    | lines     | Gradient sliced into horizontal bands, some shifted sideways, RGB-split slivers, scanlines. | complementary, split, analogous         |
| `blueprint` | patterns  | Minor/major grid (vignetted) with crosshairs, dashed frames and dimension ticks.            | mono, complementary, split              |
| `dots`      | patterns  | Even dot grid masking soft accent glows; dots outside the glows stay neutral.               | analogous, sweep, split                 |
| `halftone`  | patterns  | Hex dot screen; size follows noise plus a soft focus. Runs of equal dots are dashed lines.  | analogous, sweep, complementary         |
| `plaid`     | patterns  | Crossing translucent accent bands and pinstripes over a fine diagonal twill.                | complementary, split, analogous, tetrad |
| `truchet`   | patterns  | Quarter-circle Truchet tiles with 3 parallel strands: endless winding paths.                | mono, analogous, sweep, complementary   |
| `maze`      | patterns  | 10 PRINT diagonals, one relative zigzag path per row.                                       | sweep, analogous, complementary         |
| `cells`     | patterns  | Voronoi cells with dark gaps; some lit in accents (more near a focus), the rest tinted.     | analogous, sweep, split, tetrad         |
| `traces`    | patterns  | Bundles of parallel lines on a grid with 45° bends, never crossing, dot ends; some lit.     | mono, analogous, complementary, split   |

## Kept seeds

40 wallpapers: 16 gradients, 12 lines, 12 patterns. Each of the 8 accents leads exactly 5 (a test enforces it).

<!-- catalog:start (generated by `npm run catalog -w @termicolor/wallpapers`) -->

| Id            | Generator | Seed | Harmony       | Accents (lead first)      | Overrides |
| ------------- | --------- | ---- | ------------- | ------------------------- | --------- |
| `linear-1`    | linear    | 1    | complementary | cyan, red                 |           |
| `linear-3`    | linear    | 3    | analogous     | blue, purple, cyan        |           |
| `radial-2`    | radial    | 2    | complementary | pink, green               |           |
| `radial-4`    | radial    | 4    | split         | purple, orange, green     |           |
| `conic-7`     | conic     | 7    | sweep         | yellow, green, cyan       |           |
| `conic-10`    | conic     | 10   | split         | green, purple, red        |           |
| `mesh-9`      | mesh      | 9    | tetrad        | orange, green, blue, pink |           |
| `mesh-22`     | mesh      | 22   | split         | red, green, blue          |           |
| `mesh-1`      | mesh      | 1    | analogous     | blue, purple, cyan        |           |
| `aurora-4`    | aurora    | 4    | analogous     | pink, red, purple         |           |
| `aurora-3`    | aurora    | 3    | split         | red, green, blue          |           |
| `noise-2`     | noise     | 2    | analogous     | yellow, green, orange     |           |
| `noise-3`     | noise     | 3    | complementary | green, pink               |           |
| `posterize-2` | posterize | 2    | analogous     | orange, yellow, red       |           |
| `bands-2`     | bands     | 2    | sweep         | cyan, blue, purple        |           |
| `bands-33`    | bands     | 33   | tetrad        | purple, red, yellow, cyan |           |
| `stripes-1`   | stripes   | 1    | complementary | blue, orange              |           |
| `stripes-2`   | stripes   | 2    | analogous     | orange, yellow, red       |           |
| `moire-1`     | moire     | 1    | analogous     | purple, pink, blue        |           |
| `moire-4`     | moire     | 4    | complementary | green, pink               |           |
| `waves-3`     | waves     | 3    | analogous     | yellow, green, orange     |           |
| `waves-4`     | waves     | 4    | complementary | red, cyan                 |           |
| `contours-1`  | contours  | 1    | sweep         | pink, red, orange         |           |
| `contours-8`  | contours  | 8    | split         | cyan, pink, orange        |           |
| `flow-1`      | flow      | 1    | tetrad        | blue, pink, orange, green |           |
| `flow-2`      | flow      | 2    | sweep         | cyan, blue, purple        |           |
| `glitch-2`    | glitch    | 2    | analogous     | red, orange, pink         |           |
| `glitch-7`    | glitch    | 7    | complementary | pink, green               |           |
| `blueprint-2` | blueprint | 2    | split         | orange, cyan, purple      |           |
| `dots-3`      | dots      | 3    | analogous     | green, cyan, yellow       |           |
| `halftone-13` | halftone  | 13   | complementary | yellow, purple            |           |
| `halftone-30` | halftone  | 30   | sweep         | purple, pink, red         |           |
| `plaid-1`     | plaid     | 1    | tetrad        | pink, orange, green, blue |           |
| `plaid-2`     | plaid     | 2    | analogous     | red, orange, pink         |           |
| `truchet-1`   | truchet   | 1    | mono          | yellow                    |           |
| `maze-4`      | maze      | 4    | sweep         | cyan, blue, purple        |           |
| `cells-4`     | cells     | 4    | tetrad        | green, blue, pink, orange |           |
| `cells-5`     | cells     | 5    | split         | purple, orange, green     |           |
| `traces-1`    | traces    | 1    | split         | blue, red, yellow         |           |
| `traces-9`    | traces    | 9    | analogous     | orange, yellow, red       |           |

<!-- catalog:end -->

## Size budget

40 kept × 2 modes × 6 sizes = 480 SVGs, under 5 MB in `ports/wallpapers/dist`. A test fails if any file passes
48 KB or the set passes 5 MB. Dense generators use compact encodings: rounded relative paths, RDP
simplification, dashed runs for halftone dots, and `feTurbulence` filters instead of geometry for the noise
gradients.

## Retired

`synthwave` (sun, ridge, horizon), `isometric` (cubes) and the chip-and-pin `circuit` were dropped as too
representational; `traces` keeps the routing as pure line work.

## Not yet

- PNG rasterization in the repo (the site renders JPG/PNG in the browser for downloads).
- More families: geometric (hex tiling, low-poly), ASCII/character rain, space/starfields.
- 6a: the `termicolor recolor` lutgen wrapper for personal, non-redistributed walls.
