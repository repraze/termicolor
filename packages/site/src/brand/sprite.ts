/**
 * Termicolor brand mark: a 32x32 pixel-art cyborg head, drawn Doom-HUD style with fake 3D shading
 * (light from the top left, cyan rim light on the right, dithered ramps). The left half is purple armor,
 * the right half is exposed metal, and the visor reads as a terminal prompt: `>` and a `_` cursor eye.
 *
 * Every color is resolved from the dark palette mode; nothing is hardcoded.
 */
import {palette} from "@termicolor/palette";

const dark = palette.modes.dark;
const n = dark.neutrals;

/** Single-char key to palette color. `.` is transparent. */
export const SPRITE_COLORS = {
    k: n[950], // outline, deep shadow
    d: n[800], // metal shadow
    m: n[700], // metal core shadow
    g: n[500], // metal midtone
    l: n[300], // metal light
    w: n[0], // specular
    q: dark.on.purple, // visor glass, armor deep shadow
    p: dark.accents.purple, // armor
    P: dark.brights.purple, // armor light
    r: dark.accents.red, // eye glow
    R: dark.brights.red, // eye core
    c: dark.accents.cyan, // rim light
} as const;

export type SpriteKey = keyof typeof SPRITE_COLORS;

export const SPRITE_SIZE = 32;

// prettier-ignore
export const SPRITE: readonly string[] = [
    "................................",
    ".........kkkkkkkkkkkkkk.........",
    ".......kkPPPPPPPklllllgkk.......",
    "......kPPwwPPPPPkllllllgmk......",
    ".....kPPwwPPPPPPklllllgggmk.....",
    "....kPPPPPPpPpppkllgggggmmck....",
    "....kPPPPpPpppppklgggggmmdck....",
    "....kPPPpPppppppkggggggmmdck....",
    "....kPPPPPPPPPPPklllllllllck....",
    "....kPppppppppppkgggggggmmck....",
    ".kkkkPkkkkkkppppkgggkkkkkdckkkk.",
    ".kPpkPqrrqqqqkppkgkqqqqqqdckgck.",
    ".kPpkPqqrrqqqqkkkkqqqqqqqdckmck.",
    ".kppkPqqqRRqqqqqqqqqqqqqqdckRck.",
    ".kppkPqqrrqqqqqqqRRRRRRRqdckmck.",
    ".kqqkPqrrqqqqqqqqrrrrrrrqdckdck.",
    ".kkkkPPPPPPPPPPPklllllllldckkkk.",
    "....kPPpppppppppkgggggmmmdck....",
    "....kPPpppppppppkgggwgmmmdck....",
    "....kPppppppppppkgggdgmmddck....",
    "....kPppqpqkkkkkkkkkkkmmddck....",
    ".....kpqpqkggggggggmmkmddck.....",
    ".....kqqqqkkkkkkkkkkkkdddck.....",
    "......kqqqkggggggggmmkddck......",
    ".......kqqkkkkkkkkkkkkdck.......",
    "........kkkkkkkkkkkkkkkkk.......",
    "...........kddddddddk...........",
    "........kkkklgggmmddkkkk........",
    ".....kkkPPPklgggmmddklllkkk.....",
    "...kkPPPPPPPkkkkkkkklllllgmckk..",
    "..kPPpppppppppppkgggggggmmddck..",
    ".kPpppppppppppppkgggggggmmmddck.",
];

export type SpriteSvgOptions = {
    /** Pixel size of one sprite cell in the emitted width/height. The viewBox is unaffected. */
    scale?: number;
    /** Wrap the sprite in a square bordered badge (dark fill, 1px purple border). */
    badge?: boolean;
};

const BADGE_PAD = 2;

/** Emits a compact SVG: one rect per horizontal run of the same key, crisp edges, viewBox-scaled. */
export function spriteSvg(opts: SpriteSvgOptions = {}): string {
    const {scale = 1, badge = false} = opts;
    const offset = badge ? BADGE_PAD : 0;
    const size = SPRITE_SIZE + offset * 2;
    const parts: string[] = [];
    if (badge) {
        parts.push(`<rect width="${size}" height="${size}" fill="${dark.roles.bgSunken}"/>`);
        parts.push(
            `<rect x=".5" y=".5" width="${size - 1}" height="${size - 1}" fill="none" stroke="${dark.roles.accent}"/>`,
        );
    }
    SPRITE.forEach((row, y) => {
        let x = 0;
        while (x < row.length) {
            const key = row[x]!;
            let end = x + 1;
            while (end < row.length && row[end] === key) {
                end++;
            }
            if (key !== ".") {
                const fill = SPRITE_COLORS[key as SpriteKey];
                parts.push(`<rect x="${x + offset}" y="${y + offset}" width="${end - x}" height="1" fill="${fill}"/>`);
            }
            x = end;
        }
    });
    const px = size * scale;
    return (
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${px}" height="${px}" ` +
        `shape-rendering="crispEdges">${parts.join("")}</svg>`
    );
}
