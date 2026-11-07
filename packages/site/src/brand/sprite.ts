/**
 * Termicolor brand mark: a 32x32 pixel-art split-face portrait, drawn Doom-HUD style with fake 3D shading
 * (light from the top left, dithered ramps, a red rim light on the right). The left half is human; the right
 * half is a machine whose slit eye glows red like a terminal `_` cursor, with the glow spilling onto the socket.
 *
 * Every color is resolved from the dark palette mode; nothing is hardcoded.
 */
import {mix, palette} from "@repraze/termicolor";

const dark = palette.modes.dark;
const n = dark.neutrals;
const a = dark.accents;

/**
 * Skin: the palette has no skin role, so the four tones are derived from it. Light is the bright orange
 * washed toward white; mid is orange pulled toward the bright red and greyed so it stays warm but not neon;
 * shadow and deep shadow are the red accent sunk into the dark neutrals, so the shading shares the brand hue.
 */
const SKIN = {
    light: mix(dark.brights.orange, n[0], 0.35),
    mid: mix(mix(a.orange, dark.brights.red, 0.3), n[500], 0.25),
    shadow: mix(a.red, n[800], 0.45),
    deep: mix(a.red, n[950], 0.7),
};

/** Single-char key to palette color. `.` is transparent. */
export const SPRITE_COLORS = {
    k: n[950], // outline, deep shadow
    d: n[800], // metal shadow, hair
    m: n[700], // metal core shadow, hair light
    g: n[500], // metal midtone
    l: n[300], // metal light
    w: n[0], // eye white, specular
    b: a.blue, // iris
    S: SKIN.light,
    s: SKIN.mid,
    t: SKIN.shadow,
    u: SKIN.deep,
    q: dark.on.red, // eye socket glass
    r: a.red, // glow falloff, rim light
    R: dark.brights.red, // glow hot core
} as const;

export type SpriteKey = keyof typeof SPRITE_COLORS;

export const SPRITE_SIZE = 32;

// prettier-ignore
export const SPRITE: readonly string[] = [
    "................................",
    "........kkkkkkkkkkkkkkk.........",
    "......kkddmddmddkllllllgkk......",
    ".....kdmmdgmddmdklllllggmmk.....",
    "....kdmgmdmmdmddkllllgggmmrk....",
    "....kdmdmdddmdddklgggggmmdrk....",
    "....kddSdSSSdSSklggggggmmdrk....",
    "....kdSSSSSSSSSklmmmmmmmddrk....",
    "....kdSSSSSSSSsklllllllllgrk....",
    "....kSSSSSSSSssklgggggggmmrk....",
    "..kkkSdddkkkSssskkqqqqqqkdrk....",
    ".kSsuSskkkkkkssskqqqqqqqqdrk....",
    ".kSsuSskwbkwtsSskqrrrrrrqrrk....",
    ".kttuSssttttttSskRRRRRRRRRrk....",
    "..kkuSssssssssStkqrrrrrrqrrk....",
    "....kSssssssssStkkqqqqqqkdrk....",
    "....kSssssssssttkgggggmmmdrk....",
    "....kSsssssssttskggggwgmmdrk....",
    "....kSssssssssstkgggdgmmddrk....",
    "....kSssssstttttkkkkkkkmddrk....",
    ".....ksssstuuuuugggggkmddrk.....",
    ".....kssssssttsskkkkkkddrk......",
    "......kSsssttttsgggggkdrk.......",
    ".......kttuuuuuukkkkkkrk........",
    "........kkkkkkkkkkkkkkk.........",
    "...........kuuutddmdk...........",
    "...........kttstgmdmk...........",
    "........kkkkttstgmdmkkkk........",
    ".....kkkddddktttgmdmklllkkk.....",
    "...kkmmmddddddkkkkklllllllgrkk..",
    "..kmmmddddddddddkgggggggmmddrk..",
    ".kmmddddddddddddkgggggggmmmddrk.",
];

export type SpriteSvgOptions = {
    /** Pixel size of one sprite cell in the emitted width/height. The viewBox is unaffected. */
    scale?: number;
    /** Wrap the sprite in a square bordered badge (dark fill, 1px red border). */
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
            `<rect x=".5" y=".5" width="${size - 1}" height="${size - 1}" fill="none" stroke="${dark.fills.red}"/>`,
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
