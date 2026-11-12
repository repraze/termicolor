import { contrast, flatten } from "./color.js";
import { solid, tint } from "./levels.js";
import { allModes } from "./palette.js";
import { ACCENTS } from "./seeds.js";
/** The contrast guarantees behind "high contrast". Build fails if any of these regress. */
export function checkMode(mode) {
    const { roles: r, accents, on, fills, onFill, tints, ansi, ansiDim } = mode;
    const pairs = [
        ["fg on bg", r.fg, r.bg, 15],
        ["fg on bgSunken", r.fg, r.bgSunken, 15],
        ["fg on bgRaised", r.fg, r.bgRaised, 12],
        ["fgSoft on bg", r.fgSoft, r.bg, 7],
        ["fgMuted on bg", r.fgMuted, r.bg, 3.5],
        ["fg on selection", r.fg, flatten(r.selection, r.bg), 7],
        ...ACCENTS.map((n) => [`${n} on bg`, accents[n], r.bg, 4.5]),
        ...ACCENTS.map((n) => [`${n} on bgSunken`, accents[n], r.bgSunken, 4.5]),
        ...ACCENTS.map((n) => [`on-${n} on ${n}`, on[n], accents[n], 4.5]),
        ...ACCENTS.map((n) => [`onFill-${n} on fill-${n}`, onFill[n], fills[n], 4.5]),
        ...ACCENTS.map((n) => [
            `fg on tint-${n}`,
            r.fg,
            tints[n],
            mode.contrast === "high" ? 7 : 11,
        ]),
        // a tinted state (menu highlight, selected row) must be visible on the flat hc surface
        ...(mode.contrast === "high"
            ? ACCENTS.map((n) => [`tint-${n} visible on bg (hc)`, tints[n], r.bg, 1.3])
            : []),
        ...ACCENTS.map((n) => [
            `fg on tint(${n}, medium)`,
            r.fg,
            tint(accents[n], "medium", r.bg),
            4.5,
        ]),
        ...["red", "green", "yellow", "blue", "magenta", "cyan"].map((k) => [
            `ansi dim ${k} on bg`,
            ansiDim[k],
            r.bg,
            2,
        ]),
        ["onMatchActive on matchActive", r.onMatchActive, r.matchActive, 4.5],
        ["fg on solid(findMatch)", r.fg, solid(r.findMatch, r.bg), 7],
        ["tabInactiveFg on tabInactive", r.tabInactiveFg, r.tabInactive, 4.5],
        ["hover visible on bg", solid(r.bgHover, r.bg), r.bg, mode.contrast === "high" ? 1.35 : 1.05],
        ["fgSoft on hover", r.fgSoft, solid(r.bgHover, r.bg), 4.5],
        ["fg on hover", r.fg, solid(r.bgHover, r.bg), mode.contrast === "high" ? 7 : 12],
        // every accent must be a valid choice, not just the default
        ...ACCENTS.flatMap((n) => [
            [`fg on selection (${n})`, r.fg, solid(mode.accentRoles[n].selection, r.bg), 7],
            [`fg on accentTint (${n})`, r.fg, mode.accentRoles[n].accentTint, mode.contrast === "high" ? 7 : 11],
        ]),
        ["ansi black on bg", ansi.black, r.bg, mode.type === "dark" ? 1.5 : 7],
        ["ansi brightBlack on bg", ansi.brightBlack, r.bg, 3.5],
        ["ansi white on bg", ansi.white, r.bg, mode.type === "dark" ? 7 : 2],
        ...(mode.contrast === "high"
            ? [
                ["fgSoft on bg (hc)", r.fgSoft, r.bg, 10],
                ["fgMuted on bg (hc)", r.fgMuted, r.bg, 4.5],
                ["border on bg (hc)", r.border, r.bg, 4.5],
                ["borderStrong on bg (hc)", r.borderStrong, r.bg, 15],
            ]
            : []),
    ];
    return pairs.map(([label, fg, bg, min]) => {
        const ratio = contrast(fg, bg);
        return { mode: mode.id, label, fg, bg, ratio, min, pass: ratio >= min };
    });
}
export function checkPalette(palette) {
    return allModes(palette).flatMap(checkMode);
}
