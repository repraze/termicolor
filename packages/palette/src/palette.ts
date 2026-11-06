import {alpha, type Hex, mix} from "./color.ts";
import {type AccentSet, deriveDark, deriveLight} from "./derive.ts";
import {wash} from "./levels.ts";
import {type AccentName, ACCENTS, DEFAULT_ACCENT, type ModeName, NEUTRALS, RULES} from "./seeds.ts";

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
    accentTint: Hex; // opaque accent wash: highlighted menu item, selected row (fg text on it)
    accentBright: Hex;
    cursor: Hex;
    selection: Hex; // translucent
    selectionInactive: Hex; // translucent
    findMatch: Hex; // translucent - other matches
    focusRing: Hex; // translucent
    shadow: Hex; // translucent
    // the current / focused search match: a solid fill, never just a stronger wash
    matchActive: Hex;
    onMatchActive: Hex;
    // window chrome
    titlebar: Hex;
    tabActive: Hex; // merges into the content below it
    tabActiveFg: Hex;
    tabIndicator: Hex; // accent line on the active tab
    tabInactive: Hex;
    tabInactiveFg: Hex;
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

/** File kinds for ls / eza / file trees. */
export type Files = Record<
    | "directory"
    | "symlink"
    | "brokenLink"
    | "executable"
    | "archive"
    | "image"
    | "video"
    | "audio"
    | "document"
    | "config"
    | "source"
    | "temp",
    Hex
>;

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
    | "invalid"
    | "parameter"
    | "builtin"
    | "bracket1"
    | "bracket2"
    | "bracket3"
    | "bracket4"
    | "bracket5"
    | "bracket6",
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
    /** Text tier: readable on bg. Use for colored text, icons, borders. */
    accents: AccentSet;
    /** Text on a solid `accents` fill. */
    on: AccentSet;
    /** Fill tier: vivid solid surfaces (buttons, badges, swatches, powerline segments). */
    fills: AccentSet;
    /** Text on a `fills` surface. */
    onFill: AccentSet;
    /** Tint tier: opaque washes behind fg text (badges, diff lines, selected rows). */
    tints: AccentSet;
    /** ANSI 9-14 and hover states. */
    brights: AccentSet;
    neutrals: typeof NEUTRALS;
    /** Accent-dependent roles (`accent`, `cursor`, `selection`, ...) are those of the palette's accent. */
    roles: Roles;
    /** The accent-dependent roles for every accent, to switch accent without rebuilding. */
    accentRoles: Record<AccentName, AccentRoles>;
    ansi: Ansi;
    /** ANSI faint/dim (SGR 2): every slot pulled toward bg by one rule. */
    ansiDim: Ansi;
    syntax: Syntax;
    files: Files;
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

const mapAccentRoles = (fn: (n: AccentName) => AccentRoles) =>
    Object.fromEntries(ACCENTS.map((n) => [n, fn(n)])) as Record<AccentName, AccentRoles>;

const mapAccents = (fn: (n: AccentName) => Hex) => Object.fromEntries(ACCENTS.map((n) => [n, fn(n)])) as AccentSet;

/** Roles that follow the chosen accent. Switching accent swaps exactly these (see `.accent-*` in palette.css). */
export const ACCENT_ROLES = [
    "accent",
    "onAccent",
    "accentTint",
    "accentBright",
    "cursor",
    "selection",
    "selectionInactive",
    "focusRing",
    "tabIndicator",
] as const satisfies readonly (keyof Roles)[];
export type AccentRoles = Pick<Roles, (typeof ACCENT_ROLES)[number]>;

function accentRolesFor(
    n: AccentName,
    t: {a: AccentSet; on: AccentSet; tints: AccentSet; brights: AccentSet},
): AccentRoles {
    return {
        accent: t.a[n],
        onAccent: t.on[n],
        accentTint: t.tints[n],
        accentBright: t.brights[n],
        cursor: t.a[n],
        selection: wash(t.a[n], "soft"),
        selectionInactive: wash(t.a[n], "subtle"),
        focusRing: wash(t.a[n], "strong"),
        tabIndicator: t.a[n],
    };
}

function buildMode(name: ModeName, contrast: Contrast, accent: AccentName): Mode {
    const {accents: a, brights, on, fills, onFill} = name === "dark" ? deriveDark() : deriveLight();
    const s = (contrast === "high" ? HC_SURFACES : SURFACES)[name];
    const tints = mapAccents((n) => mix(s.bg, a[n], (contrast === "high" ? RULES.tintHighContrast : RULES.tint)[name]));
    const byAccent = mapAccentRoles((n) => accentRolesFor(n, {a, on, tints, brights}));
    const roles: Roles = {
        ...s,
        ...byAccent[accent],
        // hc: hover must be visible on the single flat surface (DESIGN.md §6)
        bgHover: wash(s.fg, contrast === "high" ? "soft" : "faint"),
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
        parameter: a.pink,
        builtin: a.cyan,
        bracket1: a.yellow,
        bracket2: a.purple,
        bracket3: a.cyan,
        bracket4: a.pink,
        bracket5: a.green,
        bracket6: a.blue,
    };
    const files: Files = {
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
    const id: ModeId = contrast === "high" ? `${name}-hc` : name;
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
        ansiDim: Object.fromEntries(Object.entries(ansi).map(([k, v]) => [k, mix(v, s.bg, RULES.dim)])) as Ansi,
        syntax,
        files,
    };
}

/**
 * Builds the palette around one accent. Termicolor itself is red; consumers pick their own
 * (repraze.com: purple, the UI library: pink) here for generated files, or with an
 * `.accent-<name>` class at runtime in CSS.
 */
export function createPalette({accent = DEFAULT_ACCENT}: {accent?: AccentName} = {}): Palette {
    return {
        name: "Termicolor",
        defaultAccent: accent,
        modes: {dark: buildMode("dark", "normal", accent), light: buildMode("light", "normal", accent)},
        highContrast: {dark: buildMode("dark", "high", accent), light: buildMode("light", "high", accent)},
    };
}

export const palette: Palette = createPalette();

/** Every variant, normal first: dark, light, dark-hc, light-hc. */
export function allModes(p: Palette = palette): Mode[] {
    return [...Object.values(p.modes), ...Object.values(p.highContrast)];
}
