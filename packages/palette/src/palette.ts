import {alpha, type Hex} from "./color.ts";
import {type AccentSet, deriveDark, deriveLight} from "./derive.ts";
import {type AccentName, DEFAULT_ACCENT, type ModeName, NEUTRALS} from "./seeds.ts";

/** Semantic roles. Ports should map these, not raw neutrals. */
export type Roles = {
    // surfaces
    bg: Hex; // editor / terminal
    bgSunken: Hex; // chrome around the editor: tab row, sidebar, status bar
    bgRaised: Hex; // inputs, popovers, cards
    bgHover: Hex; // translucent hover wash
    // lines
    border: Hex;
    borderStrong: Hex;
    guide: Hex; // indent guides, rulers
    guideActive: Hex;
    // text
    fg: Hex;
    fgSoft: Hex; // comments, secondary text
    fgMuted: Hex; // line numbers, placeholders
    fgDisabled: Hex;
    // interaction
    accent: Hex;
    onAccent: Hex;
    accentBright: Hex;
    cursor: Hex;
    selection: Hex; // translucent
    selectionInactive: Hex; // translucent
    findMatch: Hex; // translucent
    focusRing: Hex; // translucent
    shadow: Hex; // translucent
    // status
    danger: Hex;
    warning: Hex;
    success: Hex;
    info: Hex;
    hint: Hex;
    // vcs / diff
    added: Hex;
    removed: Hex;
    modified: Hex;
    renamed: Hex;
    conflict: Hex;
    ignored: Hex;
};

export type Ansi = Record<
    | "black"
    | "red"
    | "green"
    | "yellow"
    | "blue"
    | "magenta"
    | "cyan"
    | "white"
    | "brightBlack"
    | "brightRed"
    | "brightGreen"
    | "brightYellow"
    | "brightBlue"
    | "brightMagenta"
    | "brightCyan"
    | "brightWhite",
    Hex
>;

/** Syntax roles - matches what repraze.com renders. */
export type Syntax = Record<
    | "keyword"
    | "function"
    | "type"
    | "string"
    | "number"
    | "constant"
    | "regexp"
    | "escape"
    | "comment"
    | "tag"
    | "attribute"
    | "property"
    | "variable"
    | "operator"
    | "punctuation"
    | "heading"
    | "link"
    | "invalid",
    Hex
>;

/** "high" keeps every accent but flattens surfaces and swaps muted borders for bright ones. */
export type Contrast = "normal" | "high";
export type ModeId = ModeName | `${ModeName}-hc`;

export type Mode = {
    /** Unique per variant: `dark`, `light`, `dark-hc`, `light-hc`. */
    id: ModeId;
    name: ModeName;
    type: "dark" | "light";
    contrast: Contrast;
    accents: AccentSet;
    brights: AccentSet;
    on: AccentSet;
    neutrals: typeof NEUTRALS;
    roles: Roles;
    ansi: Ansi;
    syntax: Syntax;
};

export type Palette = {
    name: "Termicolor";
    defaultAccent: AccentName;
    modes: Record<ModeName, Mode>;
    /** Same accents and syntax as `modes`; one flat surface, bright borders, stronger secondary text. */
    highContrast: Record<ModeName, Mode>;
};

type Surfaces = Pick<
    Roles,
    | "bg"
    | "bgSunken"
    | "bgRaised"
    | "border"
    | "borderStrong"
    | "guide"
    | "guideActive"
    | "fg"
    | "fgSoft"
    | "fgMuted"
    | "fgDisabled"
>;

const N = NEUTRALS;

const SURFACES: Record<ModeName, Surfaces> = {
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
const HC_SURFACES: Record<ModeName, Surfaces> = {
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

const ANSI_NEUTRALS: Record<ModeName, Pick<Ansi, "black" | "white" | "brightBlack" | "brightWhite">> = {
    dark: {black: N[700], white: N[300], brightBlack: N[500], brightWhite: N[0]},
    light: {black: N[800], white: N[400], brightBlack: N[600], brightWhite: N[300]},
};

function buildMode(name: ModeName, contrast: Contrast = "normal"): Mode {
    const {accents: a, brights, on} = name === "dark" ? deriveDark() : deriveLight();
    const s = (contrast === "high" ? HC_SURFACES : SURFACES)[name];
    const accent = DEFAULT_ACCENT;
    const roles: Roles = {
        ...s,
        bgHover: alpha(s.fg, name === "dark" ? 0.06 : 0.05),
        accent: a[accent],
        onAccent: on[accent],
        accentBright: brights[accent],
        cursor: a[accent],
        selection: alpha(a[accent], 0.3),
        selectionInactive: alpha(a[accent], 0.15),
        findMatch: alpha(a.orange, 0.4),
        focusRing: alpha(a[accent], 0.6),
        shadow: alpha(N[1000], name === "dark" ? 0.5 : 0.15),
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
    const ansi: Ansi = {
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
    const syntax: Syntax = {
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
    };
    const id: ModeId = contrast === "high" ? `${name}-hc` : name;
    return {id, name, type: name, contrast, accents: a, brights, on, neutrals: NEUTRALS, roles, ansi, syntax};
}

export const palette: Palette = {
    name: "Termicolor",
    defaultAccent: DEFAULT_ACCENT,
    modes: {dark: buildMode("dark"), light: buildMode("light")},
    highContrast: {dark: buildMode("dark", "high"), light: buildMode("light", "high")},
};

/** Every variant, normal first: dark, light, dark-hc, light-hc. */
export function allModes(p: Palette = palette): Mode[] {
    return [...Object.values(p.modes), ...Object.values(p.highContrast)];
}
