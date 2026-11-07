import { alpha, mix } from "./color.js";
import { deriveDark, deriveLight } from "./derive.js";
import { wash } from "./levels.js";
import { ACCENTS, DEFAULT_ACCENT, NEUTRALS, RULES } from "./seeds.js";
const N = NEUTRALS;
const SURFACES = {
    dark: {
        bg: N[900],
        bgSunken: N[950],
        bgRaised: N[800],
        border: N[800],
        borderStrong: N[700],
        guide: N[800],
        guideActive: N[600],
        fg: N[50],
        fgSoft: N[400],
        fgMuted: N[500],
        fgDisabled: N[600],
    },
    light: {
        bg: N[0],
        bgSunken: N[50],
        bgRaised: N[100],
        border: N[200],
        borderStrong: N[300],
        guide: N[200],
        guideActive: N[400],
        fg: N[950],
        fgSoft: N[600],
        fgMuted: N[500],
        fgDisabled: N[400],
    },
};
/** High contrast: page, panels and code boxes share one background; structure comes from bright borders. */
const HC_SURFACES = {
    dark: {
        bg: N[1000],
        bgSunken: N[1000],
        bgRaised: N[950],
        border: N[400],
        borderStrong: N[50],
        guide: N[700],
        guideActive: N[400],
        fg: N[0],
        fgSoft: N[300],
        fgMuted: N[400],
        fgDisabled: N[500],
    },
    light: {
        bg: N[0],
        bgSunken: N[0],
        bgRaised: N[50],
        border: N[600],
        borderStrong: N[950],
        guide: N[300],
        guideActive: N[600],
        fg: N[1000],
        fgSoft: N[700],
        fgMuted: N[600],
        fgDisabled: N[500],
    },
};
const ANSI_NEUTRALS = {
    dark: { black: N[700], white: N[300], brightBlack: N[500], brightWhite: N[0] },
    light: { black: N[800], white: N[400], brightBlack: N[600], brightWhite: N[300] },
};
const mapAccentRoles = (fn) => Object.fromEntries(ACCENTS.map((n) => [n, fn(n)]));
const mapAccents = (fn) => Object.fromEntries(ACCENTS.map((n) => [n, fn(n)]));
/** Roles that follow the chosen accent. Switching accent swaps exactly these (see `.accent-*` in palette.css). */
export const ACCENT_ROLES = [
    "accent",
    "onAccent",
    "accentTint",
    "accentBright",
    "accentFill",
    "onAccentFill",
    "cursor",
    "selection",
    "selectionInactive",
    "focusRing",
    "tabIndicator",
];
function accentRolesFor(n, t) {
    return {
        accent: t.a[n],
        onAccent: t.on[n],
        accentTint: t.tints[n],
        accentBright: t.brights[n],
        accentFill: t.fills[n],
        onAccentFill: t.onFill[n],
        cursor: t.a[n],
        selection: wash(t.a[n], "soft"),
        selectionInactive: wash(t.a[n], "subtle"),
        focusRing: wash(t.a[n], "strong"),
        tabIndicator: t.a[n],
    };
}
function buildMode(name, contrast, accent) {
    const { accents: a, brights, on, fills, onFill } = name === "dark" ? deriveDark() : deriveLight();
    const s = (contrast === "high" ? HC_SURFACES : SURFACES)[name];
    const tints = mapAccents((n) => mix(s.bg, a[n], (contrast === "high" ? RULES.tintHighContrast : RULES.tint)[name]));
    const byAccent = mapAccentRoles((n) => accentRolesFor(n, { a, on, tints, brights, fills, onFill }));
    const roles = {
        ...s,
        ...byAccent[accent],
        // hc: hover must be visible on the single flat surface (DESIGN.md §6)
        bgHover: wash(s.fg, contrast === "high" ? (name === "dark" ? "soft" : "subtle") : "faint"),
        findMatch: wash(a.orange, "medium"),
        shadow: alpha(N[1000], name === "dark" ? 0.5 : 0.15),
        matchActive: fills.orange,
        onMatchActive: onFill.orange,
        titlebar: s.bgSunken,
        tabActive: s.bg,
        tabActiveFg: s.fg,
        tabInactive: s.bgSunken,
        tabInactiveFg: s.fgSoft,
        danger: a.red,
        warning: a.yellow,
        success: a.green,
        info: a.blue,
        hint: a.cyan,
        added: a.green,
        removed: a.red,
        modified: a.blue,
        renamed: a.cyan,
        conflict: a.orange,
        ignored: s.fgMuted,
    };
    const ansi = {
        ...ANSI_NEUTRALS[name],
        red: a.red,
        green: a.green,
        yellow: a.yellow,
        blue: a.blue,
        magenta: a.purple,
        cyan: a.cyan,
        brightRed: brights.red,
        brightGreen: brights.green,
        brightYellow: brights.yellow,
        brightBlue: brights.blue,
        brightMagenta: brights.purple,
        brightCyan: brights.cyan,
    };
    const syntax = {
        keyword: a.purple,
        function: a.blue,
        type: a.yellow,
        string: a.green,
        number: a.orange,
        constant: a.purple,
        regexp: a.orange,
        escape: a.orange,
        comment: s.fgSoft,
        tag: a.purple,
        attribute: s.fg,
        property: s.fg,
        variable: s.fg,
        operator: s.fg,
        punctuation: s.fgSoft,
        heading: a.purple,
        link: a.blue,
        invalid: a.red,
        parameter: a.pink,
        builtin: a.cyan,
        bracket1: a.yellow,
        bracket2: a.purple,
        bracket3: a.cyan,
        bracket4: a.pink,
        bracket5: a.green,
        bracket6: a.blue,
    };
    const files = {
        directory: a.blue,
        symlink: a.cyan,
        brokenLink: a.red,
        executable: a.green,
        archive: a.red,
        image: a.purple,
        video: a.pink,
        audio: a.cyan,
        document: a.orange,
        config: a.yellow,
        source: s.fg,
        temp: s.fgMuted,
    };
    const id = contrast === "high" ? `${name}-hc` : name;
    return {
        id,
        name,
        type: name,
        contrast,
        accents: a,
        on,
        fills,
        onFill,
        tints,
        brights,
        neutrals: NEUTRALS,
        roles,
        accentRoles: byAccent,
        ansi,
        ansiDim: Object.fromEntries(Object.entries(ansi).map(([k, v]) => [k, mix(v, s.bg, RULES.dim)])),
        syntax,
        files,
    };
}
/**
 * Builds the palette around one accent. Termicolor itself is red; consumers pick their own
 * (repraze.com: purple, the UI library: pink) here for generated files, or with an
 * `.accent-<name>` class at runtime in CSS.
 */
export function createPalette({ accent = DEFAULT_ACCENT } = {}) {
    return {
        name: "Termicolor",
        defaultAccent: accent,
        modes: { dark: buildMode("dark", "normal", accent), light: buildMode("light", "normal", accent) },
        highContrast: { dark: buildMode("dark", "high", accent), light: buildMode("light", "high", accent) },
    };
}
export const palette = createPalette();
/** Every variant, normal first: dark, light, dark-hc, light-hc. */
export function allModes(p = palette) {
    return [...Object.values(p.modes), ...Object.values(p.highContrast)];
}
