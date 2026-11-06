import {contrast, flatten, type Hex} from "./color.ts";
import {allModes, type Mode, type Palette} from "./palette.ts";
import {ACCENTS} from "./seeds.ts";

export type Check = {mode: string; label: string; fg: Hex; bg: Hex; ratio: number; min: number; pass: boolean};

/** The contrast guarantees behind "high contrast". Build fails if any of these regress. */
export function checkMode(mode: Mode): Check[] {
    const {roles: r, accents, on, fills, onFill, tints, tintsStrong, dims, ansi} = mode;
    const pairs: [label: string, fg: Hex, bg: Hex, min: number][] = [
        ["fg on bg", r.fg, r.bg, 15],
        ["fg on bgSunken", r.fg, r.bgSunken, 15],
        ["fg on bgRaised", r.fg, r.bgRaised, 12],
        ["fgSoft on bg", r.fgSoft, r.bg, 7],
        ["fgMuted on bg", r.fgMuted, r.bg, 3.5],
        ["fg on selection", r.fg, flatten(r.selection, r.bg), 7],
        ...ACCENTS.map((n): [string, Hex, Hex, number] => [`${n} on bg`, accents[n], r.bg, 4.5]),
        ...ACCENTS.map((n): [string, Hex, Hex, number] => [`${n} on bgSunken`, accents[n], r.bgSunken, 4.5]),
        ...ACCENTS.map((n): [string, Hex, Hex, number] => [`on-${n} on ${n}`, on[n], accents[n], 4.5]),
        ...ACCENTS.map((n): [string, Hex, Hex, number] => [`onFill-${n} on fill-${n}`, onFill[n], fills[n], 4.5]),
        ...ACCENTS.map((n): [string, Hex, Hex, number] => [`fg on tint-${n}`, r.fg, tints[n], 12]),
        ...ACCENTS.map((n): [string, Hex, Hex, number] => [`fg on tintStrong-${n}`, r.fg, tintsStrong[n], 7]),
        ...ACCENTS.map((n): [string, Hex, Hex, number] => [`dim-${n} on bg`, dims[n], r.bg, 2]),
        ["onMatchActive on matchActive", r.onMatchActive, r.matchActive, 4.5],
        ["fg on findMatchSolid", r.fg, r.findMatchSolid, 7],
        ["tabInactiveFg on tabInactive", r.tabInactiveFg, r.tabInactive, 4.5],
        // every accent must be a valid choice, not just the default
        ...ACCENTS.flatMap((n): [string, Hex, Hex, number][] => [
            [`fg on selection (${n})`, r.fg, mode.accentRoles[n].selectionSolid, 7],
            [`fg on accentTint (${n})`, r.fg, mode.accentRoles[n].accentTint, 12],
        ]),
        ["ansi black on bg", ansi.black, r.bg, mode.type === "dark" ? 1.5 : 7],
        ["ansi brightBlack on bg", ansi.brightBlack, r.bg, 3.5],
        ["ansi white on bg", ansi.white, r.bg, mode.type === "dark" ? 7 : 2],
        ...(mode.contrast === "high"
            ? ([
                  ["fgSoft on bg (hc)", r.fgSoft, r.bg, 10],
                  ["fgMuted on bg (hc)", r.fgMuted, r.bg, 4.5],
                  ["border on bg (hc)", r.border, r.bg, 4.5],
                  ["borderStrong on bg (hc)", r.borderStrong, r.bg, 15],
              ] satisfies [string, Hex, Hex, number][])
            : []),
    ];
    return pairs.map(([label, fg, bg, min]) => {
        const ratio = contrast(fg, bg);
        return {mode: mode.id, label, fg, bg, ratio, min, pass: ratio >= min};
    });
}

export function checkPalette(palette: Palette): Check[] {
    return allModes(palette).flatMap(checkMode);
}
