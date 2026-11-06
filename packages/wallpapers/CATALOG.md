# Wallpaper catalog

The log of generators and the seeds we keep (PLAN.md section 6b). Every wallpaper is a pure function of
`generator + seed + params + palette + mode + size` → SVG, so any entry below can be re-rendered exactly.
The kept entries live in [`src/catalog.ts`](src/catalog.ts); `ports/wallpapers` renders each one in dark and
light at 3840×2160 and 3440×1440. A test checks that this file mentions every generator and every kept id.

```ts
import {renderWallpaper, SIZES} from "@termicolor/wallpapers";
import {palette} from "@termicolor/palette";

const svg = renderWallpaper({generator: "circuit", seed: 1}, {palette, mode: "dark", size: SIZES.uhd});
```

## Shared parameters

| Param     | Range        | Effect                                                                      |
| --------- | ------------ | --------------------------------------------------------------------------- |
| `accents` | accent names | Colors to draw with, most prominent first. Purple leads by default.         |
| `density` | 0-1          | How busy the image is: blob/band count, grid pitch, trace count, …          |
| `grain`   | 0-1          | Film grain (`feTurbulence`, overlay blend). Breaks up banding on 8-bit LCD. |

The seed drives composition only; dark and light use the same layout. Sizes: `fhd`, `qhd`, `uhd`, `ultrawide`,
`superUltrawide`, `phone`. Strokes and spacing scale with the short side, so `qhd` and `uhd` are the same picture.

Colors per mode: dark draws on neutral 950 with the dark accents (brights for highlights); light draws on white,
using the vivid brand seeds for big soft fills and the darker light accents for lines.

## 1. Gradients

| Generator | What it draws                                                                       | Default accents            |
| --------- | ----------------------------------------------------------------------------------- | -------------------------- |
| `linear`  | Diagonal OKLCH ramp across 2-3 accents, veiled into the base at one corner.         | purple, blue, cyan         |
| `radial`  | Large off-center elliptical glow plus a smaller counter-glow.                       | purple, pink, blue         |
| `conic`   | Conic fan from below the frame (96 wedges), fading into the base. SVG has no conic. | purple, pink, orange, blue |
| `mesh`    | 4-6 soft radial points on a jittered ring; screen blend on dark.                    | purple, blue, pink, cyan   |
| `aurora`  | 3-5 wavy ribbons (sum of sines), blurred twice and screen-blended.                  | purple, cyan, green, pink  |

| Kept        | Params                                       | Notes                      |
| ----------- | -------------------------------------------- | -------------------------- |
| `linear-3`  | defaults                                     | cyan corner into purple    |
| `linear-11` | accents pink, purple, orange                 | sunset strip along the top |
| `radial-2`  | defaults                                     | purple glow bottom right   |
| `radial-9`  | accents cyan, blue, purple                   | cyan glow                  |
| `conic-4`   | defaults                                     | warm fan                   |
| `conic-12`  | accents purple, blue, cyan, green            | cool fan                   |
| `mesh-1`    | defaults                                     |                            |
| `mesh-6`    | accents purple, pink, orange, yellow         | warm                       |
| `mesh-8`    | accents cyan, blue, purple, green; density 1 | cool, 6 points             |
| `aurora-5`  | defaults                                     |                            |
| `aurora-13` | accents purple, pink, blue                   |                            |

## 2. Grids and dots

| Generator   | What it draws                                                                             | Default accents            |
| ----------- | ----------------------------------------------------------------------------------------- | -------------------------- |
| `blueprint` | Minor/major grid (vignetted), crosshairs, dashed frames with corner brackets, dimensions. | purple, cyan, pink         |
| `dots`      | Dot matrix masking soft accent glows; dots outside the glows stay neutral.                | purple, pink, blue         |
| `isometric` | Isometric lattice with clusters of solid and wireframe cubes (3D painter's order).        | purple, cyan, pink         |
| `synthwave` | Perspective floor grid fading into the horizon, striped sun, ridge line, glow on dark.    | pink, purple, orange, cyan |

| Kept           | Params                                   | Notes        |
| -------------- | ---------------------------------------- | ------------ |
| `blueprint-7`  | defaults                                 |              |
| `blueprint-21` | accents cyan, purple, green              | classic cyan |
| `dots-4`       | defaults                                 |              |
| `dots-17`      | accents purple, cyan, green; density 0.8 | finer pitch  |
| `isometric-3`  | defaults                                 |              |
| `isometric-10` | accents purple, orange, pink             |              |
| `synthwave-1`  | defaults                                 |              |
| `synthwave-8`  | accents purple, cyan, pink, blue         | cooler sky   |

## 3. Circuit / PCB

| Generator | What it draws                                                                                                                                               | Default accents    |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| `circuit` | Chips, then buses routed on a 22-unit cell grid: orthogonal runs with 45° bends, lockstep parallel traces, no crossings, via/pad ends. ~1/3 traces are lit. | purple, cyan, pink |

| Kept        | Params                                    | Notes         |
| ----------- | ----------------------------------------- | ------------- |
| `circuit-1` | defaults                                  |               |
| `circuit-5` | accents green, cyan, purple               | "classic" PCB |
| `circuit-9` | accents purple, pink, orange; density 0.9 | busier, warm  |

## Not yet

- PNG rasterization (PLAN section 4 picks `@resvg/resvg-js`; not installed yet) and release attachments.
- Families 4-9 (topographic, flow fields, geometric, terminal motifs, waves, space).
- 6a: the `termicolor recolor` lutgen wrapper for personal, non-redistributed walls.
