import {
    type AccentName,
    fromOklch,
    type Hex,
    mix,
    type ModeName,
    NEUTRALS,
    oklch,
    type Palette,
} from "@termicolor/palette";

/** Wallpaper colors for one mode, picked from the palette. */
export type Colors = {
    dark: boolean;
    /** Deepest background. Darker than the editor `bg`: wallpapers sit behind everything. */
    base: Hex;
    /** One step up from `base` (chip bodies, sky near the horizon). */
    surface: Hex;
    /** Faint neutral lines (minor grid, idle traces). */
    line: Hex;
    lineStrong: Hex;
    fg: Hex;
    /** Vivid color for large soft fills (gradients, glows). */
    fill(name: AccentName): Hex;
    /** Accent for lines and small shapes, contrast-safe on `base`. */
    ink(name: AccentName): Hex;
    /** Lighter variant of `ink` for highlights. */
    glow(name: AccentName): Hex;
};

export function colorsFor(palette: Palette, mode: ModeName): Colors {
    const m = palette.modes[mode];
    // `fills` are the vivid brand seeds in both modes (DESIGN.md §3): right for big soft color.
    const vivid = m.fills;
    if (m.type === "dark") {
        return {
            dark: true,
            base: NEUTRALS[950],
            surface: NEUTRALS[900],
            line: NEUTRALS[800],
            lineStrong: NEUTRALS[700],
            fg: m.roles.fg,
            fill: (a) => vivid[a],
            ink: (a) => m.accents[a],
            glow: (a) => m.brights[a],
        };
    }
    return {
        dark: false,
        base: NEUTRALS[0],
        surface: NEUTRALS[50],
        line: NEUTRALS[200],
        lineStrong: NEUTRALS[300],
        fg: m.roles.fg,
        fill: (a) => vivid[a],
        // Wallpapers aren't text and blend by design: the text tier alone turns yellow/orange lines brown on
        // white, so lines sit halfway between it and the vivid fill; highlights are the fill itself.
        ink: (a) => mix(m.accents[a], vivid[a], 0.5),
        glow: (a) => vivid[a],
    };
}

/** Interpolates in OKLCH along the shortest hue arc, so accent-to-accent ramps stay saturated. */
export function lerpOklch(from: Hex, to: Hex, t: number): Hex {
    const a = oklch(from);
    const b = oklch(to);
    // Near-grey colors have no meaningful hue; borrow the other end's.
    const ha = a.c < 0.02 ? b.h : a.h;
    const hb = b.c < 0.02 ? a.h : b.h;
    const dh = ((hb - ha + 540) % 360) - 180;
    return fromOklch({l: a.l + (b.l - a.l) * t, c: a.c + (b.c - a.c) * t, h: (ha + dh * t + 360) % 360});
}

/** `steps` colors spread evenly across a list of anchors. */
export function ramp(anchors: readonly Hex[], steps: number): Hex[] {
    if (anchors.length === 1) {
        return Array.from({length: steps}, () => anchors[0]!);
    }
    return Array.from({length: steps}, (_, i) => {
        const p = (i / (steps - 1)) * (anchors.length - 1);
        const k = Math.min(Math.floor(p), anchors.length - 2);
        return lerpOklch(anchors[k]!, anchors[k + 1]!, p - k);
    });
}

/** Same hue, new lightness / chroma scale. */
export function shade(hex: Hex, l: number, chroma = 1): Hex {
    const c = oklch(hex);
    return fromOklch({l, c: c.c * chroma, h: c.h});
}
